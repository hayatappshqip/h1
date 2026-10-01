#!/usr/bin/env python3
"""
Nxjerr burimin kanonik shqip të "Mburoja e Muslimanit" nga DOCX-ja zyrtare
e islamhouse.com (botimi Shembulli, përkth. Azem Bardhoshi).

Lexon DREJTPËRDREJT nga DOCX (jo nga teksti i nxjerrë), që të ruajë renditjen
e poshtëshënimeve:
    word/document.xml  → paragrafët + <w:footnoteReference w:id="N"/>
    word/footnotes.xml → teksti i 330 poshtëshënimeve

Prodhon: data/libri.json
"""
import html
import json
import re
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT.parent / "book" / "ih_mburoja.docx"
OUT = ROOT / "data" / "libri.json"

# Përfshin edhe formatet paraqitëse arabe: ﷺ (U+FDFA), ﷽, lidhëzat FE70-FEFF.
ARABIC = re.compile(r"[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]")
# Shkronja latine të thjeshta + ato shqipe (ç ë) NUK janë diakritikë transkriptimi.
PLAIN = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZçÇëË'’‘\"\"'()-.,:;!?…«»﴿﴾[]{} ")
FOOTNOTE_NUM = re.compile(r"^\d{1,3}$")
CHAPTER_HEAD = re.compile(r"^(\d{1,3})-(.+)$")


def has_translit_diacritic(s: str) -> bool:
    """Çdo shkronjë latine jashtë bashkësisë së thjeshtë = diakritik transkriptimi
    (ã ĩ ũ ḥ ḳ ṣ ṭ ḍ ġ ḣ ẓ ē ‘ etj., sipas tabelës së librit)."""
    return any(c.isalpha() and c not in PLAIN and not ARABIC.match(c) for c in s)



def para_lines(zf: zipfile.ZipFile):
    """Kthen një listë paragrafësh; çdo element = (teksti, [id-të e poshtëshënimeve])."""
    xml = zf.read("word/document.xml").decode("utf-8")
    body = xml.split("<w:body>", 1)[1]
    out = []
    for chunk in re.split(r"</w:p>", body):
        texts = re.findall(r"<w:t(?:\s[^>]*)?>(.*?)</w:t>", chunk, re.S)
        txt = html.unescape("".join(texts))
        refs = [int(r) for r in re.findall(r'<w:footnoteReference w:id="(\d+)"', chunk)]
        out.append((txt.strip(), refs))
    return out


def footnotes(zf: zipfile.ZipFile):
    xml = zf.read("word/footnotes.xml").decode("utf-8")
    notes = {}
    for chunk in re.split(r"<w:footnote ", xml)[1:]:
        m = re.match(r'w:id="(-?\d+)"', chunk)
        if not m:
            continue
        nid = int(m.group(1))
        if nid < 1:  # -1 = separator, 0 = continuationSeparator
            continue
        texts = re.findall(r"<w:t(?:\s[^>]*)?>(.*?)</w:t>", chunk, re.S)
        t = html.unescape("".join(texts)).strip()
        if t:
            notes[nid] = t
    return notes


def is_arabic(s: str) -> bool:
    na = len(ARABIC.findall(s))
    nl = len(re.findall(r"[A-Za-zÀ-ÿ]", s))
    return na > 0 and na / (na + nl) > 0.55


def classify(s: str):
    """Kthen 'arabic' | 'albanian' | 'translit'.

    Rregullat, të nxjerra nga vetë struktura e DOCX-së:
      1. >55 % shkronja arabe               → arabic
      2. fillon me '(' ose mbaron me ')'    → albanian (përkthimi është në kllapa;
         disa përkthime shumëparagrafë e kanë kllapën hapëse vetëm në rreshtin
         të parë, ose mungon fare — prandaj kontrollohen të dyja anët)
      3. përmban diakritikë transkriptimi    → translit (ã ĩ ũ ḥ ḳ ṣ ṭ ḍ ġ ‘ ...)
      4. përndryshe                          → albanian (rrëfim/udhëzim shqip)

    Pika 4 është ajo që e mban të saktë rendin: libri i përdor diakritikët
    VETËM në transkriptim, kurrë në shqipen e zakonshme.
    """
    if is_arabic(s):
        return "arabic"
    if s.startswith("(") or s.rstrip().endswith(")"):
        return "albanian"
    if has_translit_diacritic(s):
        return "translit"
    return "albanian"



def join_blocks(buf):
    """Bashkon paragrafët e një blloku; rreshtat që mbarojnë me presje ose
    pikëpresje vazhdojnë njëri-tjetrin (p.sh. vargjet e transkriptimit të
    një sureje) dhe bashkohen në një rresht të vetëm."""
    out = []
    for b in buf:
        b = b.strip()
        if not b:
            continue
        if out and out[-1].rstrip().endswith((",", ";")):
            out[-1] = out[-1].rstrip() + " " + b
        else:
            out.append(b)
    return "\n".join(out).strip()


def parse_chapter(lines, start, end):
    """Makinë gjendjesh për një kapitull.

    Blloku i një lutjeje mbyllet vetëm kur arrin ARABISHTJA e lutjes tjetër
    (pasi blloku aktual ka tashmë përkthim shqip). Kjo i lejon blloqet
    shumëparagrafë — si tri suret e lexuara bashkë — të mbeten një lutje
    e vetme, në vend që të copëtohen.

    Rrëfimi shqip që i prin një lutjeje ("Kur teshtini, thoni:") ruhet
    veçmas në fushën `lead`, që të mos përzihet me tekstin e lutjes.
    """
    items = []
    arabic, latin, albanian, lead, refs = [], [], [], [], []

    def flush():
        nonlocal arabic, latin, albanian, lead, refs
        if arabic or latin or albanian or lead:
            items.append({
                "lead": join_blocks(lead),
                "arabic": join_blocks(arabic),
                "transliteration": join_blocks(latin),
                "albanian": join_blocks(albanian).strip("()").strip(),
                "notes": sorted(set(refs)),
            })
        arabic, latin, albanian, lead, refs = [], [], [], [], []

    i = start + 1
    while i < end:
        s, r = lines[i]
        if not s:
            refs.extend(r)
            i += 1
            continue
        if s == "Fund":
            refs.extend(r)
            break
        refs.extend(r)

        k = classify(s)
        if k == "arabic":
            if albanian:                 # fillon një lutje e re
                flush()
                refs = list(r)
            arabic.append(s)
        elif k == "translit":
            latin.append(s)
        elif arabic or latin or albanian:
            albanian.append(s)           # përkthimi i bllokut aktual
        else:
            lead.append(s)               # rrëfim para lutjes
        i += 1
    flush()
    return items


def main():
    if not DOCX.exists():
        sys.exit(f"mungon {DOCX}")
    zf = zipfile.ZipFile(DOCX)
    lines = para_lines(zf)
    notes = footnotes(zf)

    toc = [i for i, (t, _) in enumerate(lines) if t == "PËRMBAJTJA"]
    body = lines[: toc[-1]] if toc else lines

    heads, expect = [], 1
    for i, (t, _) in enumerate(body):
        m = CHAPTER_HEAD.match(t)
        if m and int(m.group(1)) == expect:
            heads.append((i, expect, m.group(2).strip()))
            expect += 1
    if len(heads) != 132:
        sys.exit(f"GABIM: {len(heads)} kapituj, priteshin 132")

    chapters = []
    for k, (ln, cid, title) in enumerate(heads):
        end = heads[k + 1][0] if k + 1 < len(heads) else len(body)
        items = parse_chapter(body, ln, end)
        for n, it in enumerate(items, 1):
            it["n"] = n
        chapters.append({"id": cid, "title": title, "items": items})

    used = {r for c in chapters for i in c["items"] for r in i["notes"]}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(chapters, ensure_ascii=False, indent=1), encoding="utf-8")

    tot = sum(len(c["items"]) for c in chapters)
    print(f"✅ {len(chapters)} kapituj · {tot} lutje · "
          f"{len(notes)} poshtëshënime në libër · {len(used)} të lidhura me lutje")
    pa = lambda f: sum(1 for c in chapters for i in c["items"] if not i[f])
    print(f"   bosh: arabic={pa('arabic')}  transliteration={pa('transliteration')}"
          f"  albanian={pa('albanian')}")
    json.dump(notes, open(ROOT / "data" / "poshteshenimet.json", "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"   → {OUT.relative_to(ROOT.parent)}  +  data/poshteshenimet.json")


if __name__ == "__main__":
    main()
