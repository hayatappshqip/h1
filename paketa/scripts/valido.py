#!/usr/bin/env python3
"""
Validon data/mburoja.json kundër skemës dhe kundër vetes.

Këto janë të njëjtat kontrolle që e dështuan dataset-in origjinal të
mburoja-api (shih ../audit/RAPORTI-AUDITIT.md) — të kthyera në teste që
mbrojnë të dhënat nga regresioni.

Dalja: 0 = të gjitha kaluan, 1 = ka gabime.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data" / "mburoja.json"
AUDIO = ROOT / "audios"

ARABIC = re.compile(r"[\u0600-\u06FF]")
LATIN = re.compile(r"[A-Za-zÇËçë]")

errors, warnings = [], []


def err(m):
    errors.append(m)


def warn(m):
    warnings.append(m)


def main():
    doc = json.loads(DATA.read_text(encoding="utf-8"))
    chapters = doc["chapters"]

    # 1. struktura e kapitujve: 132, të njëpasnjëshëm, pa duplikate
    ids = [c["id"] for c in chapters]
    if ids != list(range(1, len(ids) + 1)):
        err(f"ID-të e kapitujve nuk janë 1..{len(ids)} të njëpasnjëshme")
    if len(set(ids)) != len(ids):
        err("ka ID kapitujsh të përsëritura")

    seen_audio, empty = {}, {"arabic": 0, "transliteration": 0, "albanian": 0}
    total = with_audio = 0

    shenim_fundit = 0
    for c in chapters:
        cid = c["id"]
        if not c.get("title"):
            err(f"ch{cid}: titulli mungon")
        if not isinstance(c.get("page"), int) or not (1 <= c["page"] <= 200):
            err(f"ch{cid}: page={c.get('page')!r} i pavlefshëm")
        if c["title"].islower():
            err(f"ch{cid}: titulli nuk është me shkronja të mëdha si në libër")
        if c.get("item_count") != len(c["items"]):
            err(f"ch{cid}: item_count={c['item_count']} por ka {len(c['items'])} lutje")

        n_para = 0
        for n, it in enumerate(c["items"], 1):
            total += 1
            if it.get("id") != n:
                err(f"ch{cid} #{n}: 'id' është {it.get('id')} — duhet të jetë {n}")
            if it["n"] < n_para:
                err(f"ch{cid} #{n}: numri i librit 'n'={it['n']} bie pas {n_para}")
            n_para = it["n"]

            # 2. asnjë '\n' literal (defekti më i dukshëm i dataset-it origjinal)
            for f in ("lead", "arabic", "transliteration", "albanian",
                      "albanian_alt"):
                v = it.get(f) or ""
                if "\\n" in v:
                    err(f"ch{cid} #{n} [{f}]: përmban '\\n' literal")

            # 3. fusha 'arabic' nuk guxon të mbajë tekst shqip
            ar = it.get("arabic") or ""
            if ar:
                na, nl = len(ARABIC.findall(ar)), len(LATIN.findall(ar))
                if na + nl and nl / (na + nl) > 0.25:
                    err(f"ch{cid} #{n}: 'arabic' ka {nl} shkronja latine "
                        f"kundrejt {na} arabe — rrëfim i përzier")
            else:
                empty["arabic"] += 1

            if not (it.get("transliteration") or ""):
                empty["transliteration"] += 1
            if not (it.get("albanian") or ""):
                empty["albanian"] += 1

            # 4. transkriptimi duhet të përdorë diakritikët e librit
            tr = it.get("transliteration") or ""
            if tr and len(tr) > 14 and not any(ch in tr for ch in "ãĩũḥḳṣṭḍġ"):
                warn(f"ch{cid} #{n}: transkriptimi nuk ka diakritikë të librit")

            # 5. audio: rruga ekziston, nuk është e thyer, nuk ndahet
            a = it.get("audio")
            if a:
                with_audio += 1
                if a == "audios/.mp3" or a.endswith("/.mp3"):
                    err(f"ch{cid} #{n}: rrugë audio e thyer '{a}'")
                if not (ROOT / a).exists():
                    err(f"ch{cid} #{n}: skedari '{a}' nuk ekziston")
                if not a.startswith(f"audios/{cid:03d}_"):
                    err(f"ch{cid} #{n}: audio '{a}' i përket një kapitulli tjetër")
                if a in seen_audio:
                    err(f"ch{cid} #{n}: '{a}' ndahet me ch{seen_audio[a]}")
                seen_audio[a] = f"{cid} #{n}"
            if it.get("has_audio") != (a is not None):
                err(f"ch{cid} #{n}: has_audio nuk përputhet me audio")
            for p in it.get("audio_parts") or []:
                if not (ROOT / p).exists():
                    err(f"ch{cid} #{n}: audio_parts '{p}' nuk ekziston")

            # 5b. type i vlefshëm dhe i qëndrueshëm me përmbajtjen
            t = it.get("type")
            if t not in ("dua", "rrefim"):
                err(f"ch{cid} #{n}: type={t!r} i pavlefshëm")
            elif (t == "dua") != bool(it.get("arabic")):
                err(f"ch{cid} #{n}: type='{t}' nuk përputhet me praninë e arabikës")
            elif t == "rrefim" and not (it.get("lead") or it.get("albanian")):
                err(f"ch{cid} #{n}: 'rrefim' pa asnjë tekst për t'u shfaqur")
            # 5c. transliteration nuk guxon të mbajë rrëfim kur nuk ka arabikë
            if not it.get("arabic") and (it.get("transliteration") or "") and \
               not any(ch in it["transliteration"] for ch in "ãĩũḥḳṣṭḍġ"):
                err(f"ch{cid} #{n}: rrëfim shqip i lënë në 'transliteration'")

            # 6. count i arsyeshëm — null lejohet vetëm kur libri nuk e jep
            #    numërimin dhe mungesa është e dokumentuar
            cnt = it.get("count")
            if cnt is None and it.get("count_mungon_arsye"):
                pass
            elif not isinstance(cnt, int) or not (1 <= cnt <= 1000):
                err(f"ch{cid} #{n}: count={cnt} i pavlefshëm")

            # 7. poshtëshënimet: objekt {nr, tekst}. Numri duhet të ekzistojë në libër.
            for nt in it.get("notes") or []:
                if not isinstance(nt, dict):
                    err(f"ch{cid} #{n}: poshtëshënim jo objekt {nt!r}")
                    continue
                if not isinstance(nt.get("tekst"), str) or len(nt["tekst"]) < 3:
                    err(f"ch{cid} #{n}: tekst i pavlefshëm poshtëshënimi {nt!r}")
                nr = nt.get("nr")
                if nr is not None and not (isinstance(nr, int) and 1 <= nr <= 330):
                    err(f"ch{cid} #{n}: numër poshtëshënimi i pavlefshëm {nr!r}")
                if nr is not None:
                    if nr <= shenim_fundit:
                        err(f"ch{cid} #{n}: poshtëshënimi {nr} prish renditjen "
                            f"(i mëparshmi {shenim_fundit})")
                    shenim_fundit = max(shenim_fundit, nr)

    # 8. numërimet e deklaruara në meta duhet të përputhen
    m = doc["meta"]["counts"]
    if m["chapters"] != len(chapters):
        err(f"meta.counts.chapters={m['chapters']} por ka {len(chapters)}")
    if m["items"] != total:
        err(f"meta.counts.items={m['items']} por ka {total}")
    if m["items_with_audio"] != with_audio:
        err(f"meta.counts.items_with_audio={m['items_with_audio']} por ka {with_audio}")

    # 9. çdo skedar në audios/ duhet të referohet
    if AUDIO.exists():
        orphans = {f"audios/{p.name}" for p in AUDIO.glob("*.mp3")} - set(seen_audio)
        refs = set(seen_audio) | {p for c in chapters for i in c["items"]
                                   for p in (i.get("audio_parts") or [])}
        orphans -= refs
        if orphans:
            warn(f"{len(orphans)} skedarë audio të pareferuar: {sorted(orphans)[:5]}")

    print(f"📋 {len(chapters)} kapituj · {total} lutje · {with_audio} me audio")
    print(f"   fusha bosh: arabic={empty['arabic']} "
          f"transliteration={empty['transliteration']} albanian={empty['albanian']}")
    for w in warnings[:10]:
        print(f"⚠️  {w}")
    if len(warnings) > 10:
        print(f"⚠️  ...dhe {len(warnings) - 10} paralajmërime të tjera")
    if errors:
        print(f"\n❌ {len(errors)} GABIME:")
        for e in errors[:25]:
            print(f"   • {e}")
        if len(errors) > 25:
            print(f"   ...dhe {len(errors) - 25} të tjera")
        return 1
    print(f"\n✅ Të gjitha kontrollat kaluan ({len(warnings)} paralajmërime jo-kritike)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
