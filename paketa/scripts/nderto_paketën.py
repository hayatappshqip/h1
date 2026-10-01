#!/usr/bin/env python3
"""
Ndërton paketën përfundimtare të të dhënave për webaplikacionin.

Burimi kanonik = libri (data/libri.json, i nxjerrë nga DOCX-ja zyrtare e
islamhouse.com). Nga repo-ja e mburoja-api merren VETËM:
  * skedarët audio (të verifikuar që ekzistojnë në disk),
  * përkthimi shqip i repo-s, si opsion alternativ (`albanian_alt`).

Lidhja bëhet sipas PËRMBAJTJES së tekstit brenda të njëjtit kapitull, jo sipas
renditjes apo ID-së — kështu 15 lutjet e vendosura gabim në repo dhe 51 rrugët
e thyera `/audios/.mp3` nuk e prekin rezultatin.

Dy masa përputhshmërie:
  * ngjashmëri e plotë        → për rastet 1:1,
  * përmbajtje (nënvarg)      → kur libri e mban të bashkuar atë që repo-ja e
                                ka ndarë (p.sh. tri suret Ihlas/Felek/Nas janë
                                NJË lutje në libër, por TRI hyrje në repo).

Rregull sigurie për audio-n: emri i skedarit duhet të fillojë me numrin e
kapitullit (`027_*` për kapitullin 27). Kjo e hedh poshtë automatikisht
`069_01.mp3` që repo-ja ia kishte lidhur edhe kapitullit 99.
"""
import difflib
import json
import re
import shutil
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPO = ROOT.parent / "repo"
BOOK = ROOT / "data" / "libri.json"
NOTES = ROOT / "data" / "poshteshenimet.json"
OUT_JSON = ROOT / "data" / "mburoja.json"
DOCX = ROOT.parent / "book" / "ih_mburoja.docx"
TOC_RE = re.compile(r"^(\d{1,3})-(.*?)(\d{1,3})$")
OUT_AUDIO = ROOT / "audios"

AUDIO_CHAPTERS = set(range(15, 30))   # ezani, namazi, dhikri pas namazit,
                                      # mëngjes/mbrëmje, gjumi — sipas kërkesës

AR_DIACRITICS = dict.fromkeys(
    list(range(0x064B, 0x0660)) + [0x0670, 0x0640, 0x06D6, 0x06DE, 0x06E0]
)
SQ_NUM = {"një": 1, "dy": 2, "tri": 3, "katër": 4, "pesë": 5,
          "gjashtë": 6, "shtatë": 7, "dhjetë": 10, "njëqind": 100}


def norm_ar(s: str) -> str:
    """Normalizon arabishten për krahasim: heq hareqet, lidhëzat dhe kllapat."""
    if not s:
        return ""
    s = unicodedata.normalize("NFKC", s)
    s = "".join(c for c in s if ord(c) not in AR_DIACRITICS)
    return re.sub(r"[﴿﴾۞«»\"'’‘\s\-ـ]", "", s)


def norm_sq(s: str) -> str:
    if not s:
        return ""
    s = unicodedata.normalize("NFKC", s).lower()
    s = s.replace("’", "'").replace("“", '"').replace("”", '"')
    return re.sub(r"[^\w\s]", "", s)


def ratio(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    return difflib.SequenceMatcher(None, a, b).ratio()


def score(book_item, inv) -> float:
    nb = norm_ar(book_item["arabic"])
    ni = norm_ar(inv.get("arabic", ""))
    best = ratio(nb, ni)
    if nb and len(ni) >= 20 and ni in nb:      # repo-ja është pjesë e librit
        best = max(best, 0.95)
    return max(best, ratio(norm_sq(book_item["albanian"]),
                           norm_sq(inv.get("albanian", ""))) * 0.9)


def extract_count(item) -> int:
    """Sa herë përsëritet, e nxjerrë nga teksti i librit ('tri herë', '100 herë')."""
    hay = " ".join(item.get(k) or "" for k in
                   ("transliteration", "albanian", "lead"))
    m = re.search(r"(\d+)\s*her[ëe]", hay)
    if m:
        return int(m.group(1))
    m = re.search(r"\b(një|dy|tri|katër|pesë|gjashtë|shtatë|dhjetë|njëqind)\b\s*her[ëe]",
                  hay, re.I)
    if m:
        return SQ_NUM[m.group(1).lower()]
    return 1


def load_toc():
    """{id kapitulli: faqja} + faqet e materialeve hyrëse, nga treguesi i DOCX-së.

    Libri e mbyll dokumentin me një tregues të formatit `N-TITULLI<faqe>`,
    pa pika ndarëse — prandaj nxirret drejtpërdrejt dhe me besueshmëri.
    """
    import html as _html
    import zipfile
    xml = zipfile.ZipFile(DOCX).read("word/document.xml").decode("utf-8")
    body = xml.split("<w:body>", 1)[1]
    paras = []
    for chunk in re.split(r"</w:p>", body):
        t = _html.unescape("".join(re.findall(r"<w:t(?:\s[^>]*)?>(.*?)</w:t>",
                                              chunk, re.S))).strip()
        if t:
            paras.append(t)
    toc_at = max(i for i, t in enumerate(paras) if t == "PËRMBAJTJA")
    entries = paras[toc_at + 1:]

    pages = {}
    for t in entries:
        m = TOC_RE.match(t)
        if m:
            pages[int(m.group(1))] = int(m.group(3))
    first_page = pages.get(1, 11)

    front = {}
    for t in entries:
        if TOC_RE.match(t):
            continue
        if t.startswith("Versionin elektronik"):
            break
        m = re.search(r"(\d{1,3})$", t)
        if not m:
            continue
        pg = int(m.group(1))
        # vetëm materialet përpara kapitullit të parë; përndryshe kapim edhe
        # vazhdimet e titujve shumërreshtë (p.sh. "(LUTJA E ISTISKASË)")
        if pg < first_page and re.match(r"^[A-ZÇËÖÜ ,’'()\-]+$", t[: -len(m.group(1))]):
            front[t[: -len(m.group(1))].strip()] = pg
    return pages, front


def load_repo_audio():
    """{chapter_id: [(repo_item, emri_skedarit)]} vetëm për audio të gjalla."""
    data = json.loads((REPO / "invocations.json").read_text(encoding="utf-8"))
    per_ch, stats = defaultdict(list), defaultdict(int)
    for ch in data:
        cid = ch["id"]
        for inv in ch["invocations"]:
            path = inv.get("audio") or ""
            if not path or path == "/audios/.mp3":
                stats["rrugë_boshe"] += 1
                continue
            name = Path(path).name
            m = re.match(r"^(\d{3})_", name)
            if m and int(m.group(1)) != cid:
                stats["kapitull_i_gabuar"] += 1
                continue
            if not (REPO / "audios" / name).exists():
                stats["skedar_që_mungon"] += 1
                continue
            stats["të_gjalla"] += 1
            per_ch[cid].append((inv, name))
    return per_ch, dict(stats)


def build_chapter(cid, title, book_items, pool, notes, want_audio):
    """Bashkon lutjet e librit me audio-n dhe përkthimin alternativ të repo-s."""
    assign, taken, weak = defaultdict(list), set(), []

    for idx, (inv, name) in enumerate(pool):          # 1) audio
        scores = sorted(((score(it, inv), j) for j, it in enumerate(book_items)),
                        reverse=True)
        best_s, best_j = scores[0]
        second_s = scores[1][0] if len(scores) > 1 else 0.0
        # Pragu i lartë mjafton vetë; kur është më i ulët, kërkojmë gjithashtu
        # një diferencë të qartë ndaj kandidatit të dytë — kjo lidh rastet ku
        # ndryshime të vogla diakritike (p.sh. مِنْ vs مِن) e ulin ngjashmërinë,
        # pa rrezikuar lidhje të gabuara kur dy lutje janë të ngjashme.
        if best_s >= 0.60 or (best_s >= 0.42 and best_s - second_s >= 0.15):
            assign[best_j].append((name, inv))
            taken.add(idx)
            if best_s < 0.60:
                weak.append((cid, best_j + 1, name, round(best_s, 2),
                             round(second_s, 2)))
    for j in assign:
        assign[j].sort(key=lambda t: t[0])

    alt_for = {}                                      # 2) përkthimi alternativ
    for idx, (inv, name) in enumerate(pool):
        if idx in taken:
            continue
        best_j, best_s = -1, 0.0
        for j, it in enumerate(book_items):
            s = ratio(norm_sq(it["albanian"]), norm_sq(inv.get("albanian", "")))
            if s > best_s:
                best_j, best_s = j, s
        if best_s >= 0.55 and best_j not in alt_for:
            alt_for[best_j] = inv

    out, multi = [], []
    for j, it in enumerate(book_items):
        hits = assign.get(j, [])
        names = [n for n, _ in hits]
        inv = hits[0][1] if hits else alt_for.get(j)
        audio = f"audios/{names[0]}" if (names and want_audio) else None
        if audio:
            if len(names) > 1:
                multi.append((cid, it["n"], names))
        alt = ""
        if inv:
            alt = (inv.get("albanian") or "").replace("\\n", "\n").strip()
        # Kur një kapitull përmban vetëm hadith rrëfyes (pa tekst arabik për
        # t'u lexuar), libri e jep tërë përmbajtjen si rrëfim. Ndonjëherë ai
        # rrëfim përfundon në fushën e transkriptimit — e zhvendosim te `lead`,
        # sepse `transliteration` duhet të mbajë VETËM transkriptimin e librit.
        lead, tr = it["lead"], it["transliteration"]
        e_pastër = not any(ch in tr for ch in "ãĩũḥḳṣṭḍġ")
        pa_shfaqje = not lead and not it["albanian"]
        if not it["arabic"] and tr and (e_pastër or pa_shfaqje):
            lead = f"{lead}\n{tr}".strip() if lead else tr
            tr = ""

        out.append({
            "n": it["n"],
            "type": "dua" if it["arabic"] else "rrefim",
            "lead": lead or None,
            "arabic": it["arabic"] or None,
            "transliteration": it["transliteration"] or None,
            "albanian": it["albanian"] or None,
            "albanian_alt": alt or None,
            "count": extract_count(it),
            "notes": [notes[str(k)] for k in it["notes"] if str(k) in notes],
            "audio": audio,
            "audio_parts": [f"audios/{n}" for n in names] if audio and len(names) > 1 else [],
            "has_audio": audio is not None,
        })
    all_names = [n for j in assign for n, _ in assign[j]]
    return out, all_names, multi, weak


def main():
    chapters = json.loads(BOOK.read_text(encoding="utf-8"))
    notes = json.loads(NOTES.read_text(encoding="utf-8"))
    repo_audio, astats = load_repo_audio()
    toc_pages, front = load_toc()
    if len(toc_pages) != 132:
        print(f"⚠️  treguesi dha {len(toc_pages)} faqe kapitujsh, priteshin 132")
    OUT_AUDIO.mkdir(parents=True, exist_ok=True)

    used_names, all_multi, all_weak = set(), [], []
    new_chapters = []
    for ch in chapters:
        cid, want = ch["id"], ch["id"] in AUDIO_CHAPTERS
        pool = list(repo_audio.get(cid, []))
        items, names, multi, weak = build_chapter(cid, ch["title"], ch["items"],
                                                  pool, notes, want)
        all_multi += multi
        all_weak += weak
        if want:
            for n in names:
                dst = OUT_AUDIO / n
                if not dst.exists():
                    shutil.copy2(REPO / "audios" / n, dst)
                used_names.add(n)
        new_chapters.append({
            "id": cid,
            "title": ch["title"],
            "page": toc_pages.get(cid),
            "item_count": len(items),
            "audio_count": sum(1 for i in items if i["has_audio"]),
            "items": items,
        })

    tot_items = sum(c["item_count"] for c in new_chapters)
    tot_audio = sum(c["audio_count"] for c in new_chapters)
    doc = {
        "meta": {
            "name": "Mburoja e Muslimanit (Hisnul Muslim) — të dhëna për webaplikacion",
            "version": "1.0.0",
            "language": "sq",
            "generated": "2026-09-30",
            "source": {
                "title": "Mburoja e Muslimanit (Dhikri i Kuranit dhe Sunetit)",
                "title_original": "حصن المسلم من أذكار الكتاب والسنة",
                "author": "Seid b. Ali b. Vehf El Kahtani",
                "translator": "Azem Bardhoshi",
                "religious_editor": "Ismail Bardhoshi",
                "language_editor": "Ilir E. Haxhiaj",
                "transliteration_by": "Jusuf Kastrati",
                "publisher": "Shembulli, botimi i parë, qershor 2017",
                "isbn": "978-9951-732-07-9",
                "file": "https://d1.islamhouse.com/data/sq/ih_books/single/sq_mburoja_muslimanit.docx",
                "note": "Arabikja, transkriptimi, përkthimi shqip dhe 330 poshtëshënimet janë nga ky botim.",
            },
            "audio_source": {
                "origin": "github.com/BetimShala/mburoja-api → audios/ (199 MP3)",
                "attribution": "Repo-ja nuk jep atributim. 3 skedarë mbajnë tag-un TALB='Kalamullah.com'; njëri ka metadatë Adobe Audition 4.0 (2011). Origjina e saktë është e pavërtetuar — lexo LICENCA.md para shpërndarjes publike.",
                "included_for_chapters": sorted(AUDIO_CHAPTERS),
                "why_only_these": "Sipas kërkesës: ezani, namazi, dhikri pas namazit, dhikri i mëngjesit/mbrëmjes, dhikri i gjumit.",
            },
            "front_matter": front,
            "counts": {
                "chapters": len(new_chapters),
                "items": tot_items,
                "items_with_audio": tot_audio,
                "audio_files": len(used_names),
                "footnotes": len(notes),
            },
            "schema": {
                "type": "'dua' = ka tekst arabik për t'u lexuar · 'rrefim' = hadith/udhëzim, shfaq `lead`",
                "lead": "rrëfim/udhëzim shqip që i prin lutjes, ose null",
                "arabic": "teksti arabik me hareqe, ose null për hadithe rrëfyese",
                "transliteration": "transkriptimi me diakritikët e librit (ã ĩ ũ ḥ ḳ ṣ ṭ ḍ ġ ḣ ‘)",
                "albanian": "përkthimi shqip i botimit zyrtar",
                "albanian_alt": "përkthimi nga mburoja-api — i pavërtetuar, shih RAPORTI-AUDITIT.md §3.3",
                "count": "sa herë përsëritet (1 nëse libri nuk thotë ndryshe)",
                "notes": "poshtëshënimet e librit: burimet dhe shpjegimet",
                "audio": "MP3-ja e parë, ose null",
                "audio_parts": "kur libri e bashkon një bllok që repo-ja e kishte ndarë (p.sh. tri suret), të gjitha MP3-të përkatëse",
                "has_audio": "shkurt për audio !== null",
                "page (në chapters[])": "faqja e librit ku fillon kapitulli — lejon verifikim nga çdo përdorues",
                "front_matter (në meta)": "faqet e materialeve hyrëse: tabela e transkriptimit, fjala e redaktorit, hyrja e autorit, vlera e dhikrit",
            },
            "repo_audio_gjendja": astats,
        },
        "chapters": new_chapters,
    }
    OUT_JSON.write_text(json.dumps(doc, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"✅ {OUT_JSON.relative_to(ROOT.parent)}")
    print(f"   {len(new_chapters)} kapituj · {tot_items} lutje · {len(notes)} poshtëshënime")
    print(f"   audio: {tot_audio} lutje me audio · {len(used_names)} skedarë → audios/")
    print(f"   blloqe të bashkuara me shumë MP3: {len(all_multi)}")
    for cid, n, names in all_multi:
        print(f"      ch{cid} #{n}: {', '.join(names)}")
    print(f"   audio e repo-s: {astats}")
    if all_weak:
        print(f"   lidhje me prag të ulët (të verifikueshme): {len(all_weak)}")
        for cid, n, name, bs, ss in all_weak:
            print(f"      ch{cid} #{n} ← {name}  më e mira={bs}  e dyta={ss}")


if __name__ == "__main__":
    main()
