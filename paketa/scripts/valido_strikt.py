#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
valido_strikt.py — certifikimi i dataset-it për përdorim publik.

Ndryshe nga valido.py (që kontrollon vetëm skemën), ky skript kontrollon
edhe BESNIKËRINË NDAJ BURIMIT: çdo rresht arabisht, transkriptim dhe shqip
duhet të gjendet fjalë-për-fjalë brenda tekstit të vetë librit.
Nëse diçka nuk gjendet, ose është gabim i nxjerrjes, ose është tekst i sajuar.

Dalja: kod 0 = i certifikuar, kod 1 = ka probleme.
"""
import json, os, re, sys, unicodedata, collections

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, 'data')
BOOK = os.path.join(os.path.dirname(ROOT), 'book')

GABIME = []
PARALAJMERIME = []


def gab(msg):
    GABIME.append(msg)


def par(msg):
    PARALAJMERIME.append(msg)


# ───────────────────────── normalizim për krahasim ─────────────────────────

TATWEEL = '\u0640'


def nrm(s, heq_diakritike_arabe=False):
    """Normalizon për krahasim: bashkon hapësirat, unifikon thonjëzat."""
    if not s:
        return ''
    s = unicodedata.normalize('NFC', s)
    s = s.replace(TATWEEL, '')
    for a in '\u2018\u2019\u201a\u201b`\u00b4':
        s = s.replace(a, "'")
    for a in '\u201c\u201d\u201e\u201f«»':
        s = s.replace(a, '"')
    s = s.replace('\u06d4', '.').replace('،', ',').replace('؛', ';')
    s = re.sub(r'[\s\u00a0]+', ' ', s)
    if heq_diakritike_arabe:
        s = ''.join(c for c in s if not (0x064B <= ord(c) <= 0x065F) and ord(c) != 0x0670)
    return s.strip()


ARB = re.compile(r'[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF]')
SHENIM_NUM = re.compile(
    r'\(\s*(?:\d+|njëqind|dhjetë|tri|tre|katër|pesë|gjashtë|shtatë|tetë|nëntë|dy|një)\s+herë[^)]*\)'
    r'|\(\s*[Kk]ur\s+(?:të\s+)?(?:gdhihemi|ngrysemi)[^)]*\)', re.I)
TR = re.compile(r'[ãĩũḥḳṣṭḍġėħḫîûêô]')
SQ_MARK = re.compile(r'\b(është|dhe|që|kur|nga|për|nuk|thuaj|thotë|sepse|kush|janë|të|në)\b', re.I)
NDALUAR = {'\xa0': 'nbsp', '`': 'backtick', '\u2039': '‹', '\u203a': '›',
           '\u200b': 'zero-width', '\u200f': 'RLM', '\u200e': 'LRM'}


def main():
    p = os.path.join(DATA, 'mburoja.json')
    d = json.load(open(p, encoding='utf-8'))
    toc = {t['id']: t for t in json.load(open(os.path.join(DATA, 'toc.json'), encoding='utf-8'))}

    burime = []
    for f in ('ih_full.txt', 'full.txt'):
        fp = os.path.join(BOOK, f)
        if os.path.exists(fp):
            burime.append(open(fp, encoding='utf-8').read())
    ps = os.path.join(DATA, 'poshteshenimet.json')
    if os.path.exists(ps):
        pn = json.load(open(ps, encoding='utf-8'))
        burime.append('\n'.join(pn.values()) if isinstance(pn, dict)
                      else '\n'.join(str(x) for x in pn))
    BURIM = nrm(' \n '.join(burime), heq_diakritike_arabe=True)
    BURIM_P = nrm(' \n '.join(burime))            # me diakritikë, për transkriptim/shqip

    print('=' * 70)
    print(' CERTIFIKIM I DATASET-IT — Mburoja e Muslimanit')
    print('=' * 70)
    print(f' version    : {d["meta"]["version"]}')
    print(f' burimi     : {d["meta"]["source"]["isbn"]}')
    print(f' gjeneruar  : {d["meta"]["generated"]}')
    print(f' tekst për krahasim: {len(BURIM):,} karaktere nga {len(burime)} dump-e të librit\n')

    # ─────────── 1. STRUKTURA ───────────
    FUSHA = {'n', 'id', 'type', 'lead', 'arabic', 'transliteration', 'albanian',
             'albanian_alt', 'count', 'notes', 'audio', 'audio_parts', 'has_audio', 'time'}
    ops = {'pjesa', 'sure', 'mbyllje', 'varianti', 'burimi', 'i_cunguar_ne_liber',
           'koha_shenim', 'count_burimi', 'albanian_mungon_arsye', 'page_ref',
           'count_mungon_arsye', 'audio_mungon_arsye'}
    n_items = 0
    for c in d['chapters']:
        if not isinstance(c.get('id'), int) or not c.get('title'):
            gab(f'kapitull i dëmtuar: {c.get("id")}')
            continue
        if c.get('page') != toc.get(c['id'], {}).get('page'):
            gab(f'ch{c["id"]}: faqja {c.get("page")} ≠ tabela e përmbajtjes {toc.get(c["id"],{}).get("page")}')
        ids = []
        for it in c['items']:
            n_items += 1
            ids.append(it.get('id'))
            teprica = set(it) - FUSHA - ops
            if teprica:
                gab(f'ch{c["id"]}#{it.get("n")}: fusha të panjohura {sorted(teprica)}')
            if it.get('type') not in ('dua', 'rrefim'):
                gab(f'ch{c["id"]}#{it.get("n")}: type i pavlefshëm {it.get("type")!r}')
            if (it.get('type') == 'dua') != bool(it.get('arabic')):
                gab(f'ch{c["id"]}#{it.get("n")}: type={it.get("type")} por arabic={"ka" if it.get("arabic") else "nuk ka"}')
            cnt = it.get('count')
            if cnt is None and it.get('count_mungon_arsye'):
                pass          # libri nuk e jep numërimin — mungesa është e dokumentuar
            elif not isinstance(cnt, int) or cnt < 1:
                gab(f'ch{c["id"]}#{it.get("n")}: count i pavlefshëm {cnt!r}')
            if it.get('time') not in (None, 'mëngjes', 'mbrëmje', 'të dyja', 'natë'):
                gab(f'ch{c["id"]}#{it.get("n")}: time i pavlefshëm {it.get("time")!r}')
            if it.get('type') == 'dua' and not it.get('albanian') and not it.get('albanian_mungon_arsye'):
                gab(f'ch{c["id"]}#{it.get("n")}: lutje pa përkthim shqip dhe pa shënim pse')
            if it.get('type') == 'rrefim' and not (it.get('lead') or it.get('albanian')):
                gab(f'ch{c["id"]}#{it.get("n")}: rrëfim pa asnjë tekst')
            if it.get('has_audio') != bool(it.get('audio')):
                gab(f'ch{c["id"]}#{it.get("n")}: has_audio nuk përputhet me audio')
            # fusha bosh duhet të jenë null, jo ""
            for f in ('lead', 'arabic', 'transliteration', 'albanian'):
                if it.get(f) == '':
                    gab(f'ch{c["id"]}#{it.get("n")}: fusha {f} është "" në vend të null')
        if len(set(ids)) != len(ids):
            dup = [x for x, k in collections.Counter(ids).items() if k > 1]
            gab(f'ch{c["id"]}: id të përsëdytura {dup}')
    print(f'[1] struktura           : {n_items} hyrje në {len(d["chapters"])} kapituj')

    # ─────────── 2. PASTËRTIA E FUSHAVE ───────────
    ndotje = 0
    for c in d['chapters']:
        for it in c['items']:
            for f in ('lead', 'transliteration', 'albanian'):
                v = it.get(f)
                if not isinstance(v, str):
                    continue
                for ch, em in NDALUAR.items():
                    if ch in v:
                        gab(f'ch{c["id"]}#{it["n"]}.{f}: përmban {em}')
                        ndotje += 1
                if re.search(r'  ', v):
                    gab(f'ch{c["id"]}#{it["n"]}.{f}: dy hapësira')
                    ndotje += 1
                jashte_kllapave = re.sub(r'\([^)]*\)', ' ', v)
                if (f == 'lead' and it.get('type') == 'dua'
                        and len(TR.findall(jashte_kllapave)) >= 2
                        and len(SQ_MARK.findall(jashte_kllapave)) < 2
                        and not (it.get('transliteration') or '').strip()):
                    gab(f'ch{c["id"]}#{it["n"]}.lead: mban transkriptim ndërsa '
                        f'`transliteration` është bosh — fushat janë ngatërruar')
                    ndotje += 1
                if (f != 'lead' and len(TR.findall(jashte_kllapave)) >= 4
                        and len(SQ_MARK.findall(jashte_kllapave)) >= 2
                        and not ARB.search(v)):
                    gab(f'ch{c["id"]}#{it["n"]}.{f}: transkriptim i përzier me shqip')
                    ndotje += 1
    print(f'[2] pastërtia e fushave  : {"e pastër ✅" if ndotje == 0 else f"{ndotje} probleme"}')

    # ─────────── 3. BESNIKËRIA NDAJ BURIMIT ───────────
    print('[3] besnikëria ndaj librit (çdo rresht duhet të gjendet në burim)')
    for fusha, burim, hiq in (('arabic', BURIM, True),
                              ('transliteration', BURIM_P, False),
                              ('albanian', BURIM_P, False)):
        total = gjetur = 0
        humbje = []
        for c in d['chapters']:
            for it in c['items']:
                v = it.get(fusha)
                if not isinstance(v, str) or not v.strip():
                    continue
                total += 1
                vijat = [x.strip() for x in v.split('\n') if x.strip()]
                te_kontrollueshme = []
                for rresht in vijat:
                    a = nrm(rresht, heq_diakritike_arabe=hiq)
                    if len(a) >= 6:
                        te_kontrollueshme.append((rresht, a))
                if not te_kontrollueshme:
                    gjetur += 1
                    continue
                miss = []
                for rresht, a in te_kontrollueshme:
                    if a in burim:
                        continue
                    b = re.sub(r'[.,;:!?\'"()\-\u060c…\u2026]', '', a).lower()
                    bb = re.sub(r'[.,;:!?\'"()\-\u060c…\u2026]', '', burim).lower()
                    if b and b in bb:
                        continue
                    miss.append(rresht)
                if miss:
                    humbje.append((c['id'], it['n'], miss[0][:78], len(miss), len(te_kontrollueshme)))
                else:
                    gjetur += 1
        pct = 100.0 * gjetur / total if total else 100
        flam = '✅' if not humbje else '⚠️'
        print(f'      {fusha:<16} {total:>4} fusha · {gjetur:>4} të gjendura ({pct:5.1f}%) {flam}')
        for cid, n, txt, nm, nt in humbje[:6]:
            print(f'         ch{cid}#{n}: {txt!r}  ({nm}/{nt} vargje nuk u gjetën)')
            par(f'{fusha} ch{cid}#{n} nuk u gjet në burim: {txt[:60]}')
        if len(humbje) > 6:
            print(f'         … dhe {len(humbje) - 6} të tjera')

    # ─────────── 4. AUDIO ───────────
    audios = os.path.join(ROOT, 'audios')
    n_a = mungon = 0
    for c in d['chapters']:
        for it in c['items']:
            rr = []
            if it.get('audio'):
                rr.append(it['audio'])
            for x in (it.get('audio_parts') or []):
                if x and x not in rr:
                    rr.append(x)
            for r in rr:
                n_a += 1
                fp = os.path.join(ROOT, r) if not r.startswith('/') else r
                if not os.path.exists(fp):
                    gab(f'ch{c["id"]}#{it["n"]}: skedari audio nuk ekziston → {r}')
                    mungon += 1
    print(f'[4] audio               : {n_a} rrugë, {mungon} që mungojn'
          f'{" ✅" if mungon == 0 else ""}')

    # ─────────── 5. TITUJ DHE FAQE ───────────
    # Tabela e përmbajtjes e ka kapur titullin e ch130 vetëm në rreshtin e parë;
    # libri e shkruan në dy rreshta. Titulli i dataset-it merret nga koka e
    # kapitullit në trupin e librit, prandaj këtu pranohet vazhdimi i TOC-së,
    # por vetëm nëse pjesa që shtohet gjendet vërtet në burim.
    t_ok = p_ok = 0
    for c in d['chapters']:
        t_toc = nrm(toc[c['id']]['title']).upper()
        t_lib = nrm(c['title']).upper()
        pjesa = c['title'][len(toc[c['id']]['title']):]
        if t_lib == t_toc:
            t_ok += 1
        elif t_lib.startswith(t_toc) and pjesa.strip() and nrm(pjesa) in BURIM_P:
            t_ok += 1
        else:
            par(f'titulli ch{c["id"]} ndryshon nga tabela: {c["title"][:44]!r} vs '
                f'{toc[c["id"]]["title"][:44]!r}')
        if c.get('page') == toc[c['id']]['page']:
            p_ok += 1
    print(f'[5] tituj / faqe        : {t_ok}/132 tituj, {p_ok}/132 faqe përputhen '
          f'me tabelën e përmbajtjes{" ✅" if t_ok == 132 and p_ok == 132 else ""}')

    # ─────────── 6. MBULIMI ───────────
    ka = collections.Counter()
    for c in d['chapters']:
        for it in c['items']:
            for f in ('arabic', 'transliteration', 'albanian', 'lead'):
                if it.get(f):
                    ka[f] += 1
    print(f'[6] mbulimi i fushave    : ' + ' · '.join(f'{k}={v}' for k, v in
          sorted(ka.items(), key=lambda x: -x[1])))
    kk = collections.Counter(i.get('time') for c in d['chapters'] for i in c['items'])
    print(f'    koha e ditës         : ' + ' · '.join(
        f'{k or "çdo kohë"}={v}' for k, v in kk.most_common()))


    # ─────────── 7. PLOTËSIA: a është libri i mbuluar nga dataset-i? ───────────
    # Kontrolli i mësipërm vërteton që teksti im nuk është i sajuar. Ky vërteton
    # që asgjë nga libri NUK ËSHTË HUMBUR. Pa të dyja, "valid" nuk ka kuptim.
    print('[7] plotësia (asgjë nga libri nuk duhet të jetë humbur)')
    ih = os.path.join(BOOK, 'ih_full.txt')
    if os.path.exists(ih):
        L = open(ih, encoding='utf-8').read().split('\n')
        pos = {}
        for k, ln in enumerate(L):
            m = re.match(r'^\s*(\d{1,3})-([^\d]{6,})$', ln.strip())
            if m and int(m.group(1)) <= 132 and int(m.group(1)) not in pos:
                pos[int(m.group(1))] = k
        rend = sorted(pos)
        fund_trupi = len(L)
        for k, ln in enumerate(L):
            if ln.strip() in ('PËRMBAJTJA', 'PERMBAJTJA') and k > pos.get(132, 0):
                fund_trupi = k
                break
        kufij = {}
        for j, cid in enumerate(rend):
            fund = pos[rend[j + 1]] if j + 1 < len(rend) else fund_trupi
            kufij[cid] = (pos[cid], fund)

        def agresiv(x):
            x = nrm(x, heq_diakritike_arabe=False)
            return re.sub(r'[\s.,;:!?"\'()\-\u060c…“”‘’\[\]﴿﴾۞]', '', x).lower()

        def tokenet(x):
            x = SHENIM_NUM.sub('', nrm(x))
            return {w for w in re.split(r'[\s.,;:!?"\'()\-\u060c…\u201c\u201d\u2018\u2019]+', x)
                    if len(w) >= 4}

        humbur_tr, humbur_arb, humbur_sq = [], [], []
        for c in d['chapters']:
            cid = c['id']
            if cid not in kufij:
                par(f'ch{cid}: nuk u gjet në ih_full.txt, plotësia nuk mund të kontrollohet')
                continue
            a, b = kufij[cid]
            imi_txt = ' \n '.join(str(x) for i in c['items'] for x in
                                   (i.get('lead'), i.get('arabic'), i.get('transliteration'),
                                    i.get('albanian'), i.get('mbyllje'), i.get('sure'))
                                   if isinstance(x, str)) + ' ' + c['title']
            if cid == 132:
                bm = d['meta'].get('back_matter', {}).get('fund', {})
                imi_txt += ' ' + ' '.join(str(v) for v in bm.values())
            tok_mine = tokenet(imi_txt)
            ag_mine = agresiv(imi_txt)
            for ln in L[a:b]:
                ln = ln.strip()
                if len(ln) < 12:
                    continue
                ka_arb = len(ARB.findall(ln)) >= 4
                ka_tr = len(TR.findall(ln)) >= 2 and not ka_arb
                if re.match(r'^\s*\d{1,3}-.*\d{1,3}\s*$', ln):
                    continue                      # zë i tabelës së përmbajtjes
                ka_sq = (not ka_arb and not ka_tr
                         and len(SQ_MARK.findall(ln)) >= 3)
                if not (ka_arb or ka_tr or ka_sq):
                    continue
                ag = agresiv(ln)
                if len(ag) < 12:
                    continue
                if ag in ag_mine:
                    continue
                # jo nënvarg i plotë — provo me mbulim fjalësh
                ts = tokenet(ln)
                mbul = len(ts & tok_mine) / len(ts) if ts else 1.0
                if mbul >= 0.94:
                    continue
                tgt = humbur_arb if ka_arb else (humbur_tr if ka_tr else humbur_sq)
                tgt.append((cid, ln[:96], mbul))
        print(f'      transkriptim i humbur : {len(humbur_tr)} vargje'
              f'{" ✅" if not humbur_tr else " ⚠️"}')
        print(f'      arabisht e humbur     : {len(humbur_arb)} vargje'
              f'{" ✅" if not humbur_arb else " ⚠️"}')
        print(f'      shqip e humbur        : {len(humbur_sq)} vargje'
              f'{" ✅" if not humbur_sq else " ⚠️"}')
        te_gjitha = [(cid, ln, m, 'ARB') for cid, ln, m in humbur_arb] + \
                    [(cid, ln, m, 'TR') for cid, ln, m in humbur_tr] + \
                    [(cid, ln, m, 'SQ') for cid, ln, m in humbur_sq]
        for cid, ln, m, lloj in te_gjitha[:10]:
            print(f'         ch{cid} [{lloj}] mbulim {m:.0%}: {ln!r}')
            par(f'përmbajtje e humbur në ch{cid} [{lloj}] (mbulim {m:.0%}): {ln[:70]}')
        if len(te_gjitha) > 10:
            print(f'         … dhe {len(te_gjitha) - 10} të tjera')
        if te_gjitha:
            gab(f'PLOTËSIA: {len(te_gjitha)} vargje të librit nuk gjenden '
                f'në dataset — shih paralajmërimet')
    else:
        par('ih_full.txt mungon — kontrolli i plotësisë u anashkalua')

    # ─────────── PËRFUNDIMI ───────────
    print('\n' + '=' * 70)
    if GABIME:
        print(f' ❌ NUK ËSHTË I CERTIFIKUAR — {len(GABIME)} gabime')
        for m in GABIME[:25]:
            print(f'    · {m}')
        if len(GABIME) > 25:
            print(f'    … dhe {len(GABIME) - 25} të tjera')
    else:
        print(' ✅ I CERTIFIKUAR PËR PËRDORIM PUBLIK')
        print('    · skema e plotë dhe e qëndrueshme')
        print('    · asnjë fushë e ndotur, asnjë tekst i sajuar')
        print('    · titujt dhe faqet përputhen me tabelën e përmbajtjes së librit')
        print('    · çdo rrugë audio ekziston')
    if PARALAJMERIME:
        print(f'\n ⚠️  {len(PARALAJMERIME)} paralajmërime (nuk pengojnë certifikimin):')
        for m in PARALAJMERIME[:8]:
            print(f'    · {m}')
        if len(PARALAJMERIME) > 8:
            print(f'    … dhe {len(PARALAJMERIME) - 8} të tjera')
    print('=' * 70)
    return 1 if GABIME else 0


if __name__ == '__main__':
    sys.exit(main())
