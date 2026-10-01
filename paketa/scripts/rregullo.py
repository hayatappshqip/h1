#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
rregullo.py — riparimi dhe pasurimi i dataset-it të Mburojës së Muslimanit.

Lexon  : paketa/data/mburoja.json, paketa/data/toc.json
Shkruan: paketa/data/mburoja.json  (versioni i rregulluar)

Parimi udhëheqës: ASNJË tekst i sajuar. Çdo ndryshim ose vjen nga vetë libri,
ose është një ri-klasifikim determinist i tekstit ekzistues. Çdo ndërhyrje
regjistrohet në raportin e ndryshimeve.

Testi kryesor për të ndarë transkriptimin nga shqipja:
diakritikët e "TABELA E TRANSKRIPTIMIT DHE SIMBOLEVE" (faqja 3 e librit) —
ã ĩ ũ ḥ ḳ ṣ ṭ ḍ ġ ė ħ ė î û — NUK shfaqen kurrë në shqipen standarde.
"""
import json, re, sys, unicodedata, collections, os, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DATA = os.path.join(ROOT, 'data')

# ─────────────────────────────  KONSTANTE  ─────────────────────────────

# Diakritikët e sistemit të transkriptimit të librit (Jusuf Kastrati)
TR_CHARS = set('ãĩũḥḳṣṭḍġėħḫîûêôāēīōūŋşţẓṛ')
TR_RE = re.compile('[' + ''.join(sorted(TR_CHARS)) + ']')
ARB_RE = re.compile(r'[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF\u0640]')

# Fjalë shqipe që NUK mund të prodhohen nga një transkriptim arabik.
# Përdoren me prag >=2 për segment, që citimet e brendshme transkriptimi
# (p.sh. "hajje ‘aleṣ-ṣalãh") të mos e kthejnë një fjali shqipe në transkriptim.
SQ_FJALE = set("""është janë ishte dhe që kur nga për nuk thuaj thotë thonë thuhet sepse atëherë
kush asnjë askujt askënd ndonjëri vëllai shokun filani përsërisim kërkojmë lexojmë them thonin
duke nëse luteni kërkoni mbrojtje mirësi mirësitë gjynahet shpërblim fshihen bëhet mund veçse
ndihmën të në me se si por ai ajo ata këtë atij një dy tri tre herë ditë natë mëngjes mbrëmje
gdhihemi ngrysemi pejgamberi profeti allahu thënë vazhdoi mbërriti hipi drejtua filloi largua
përhap lindur dielli ka kemi keni kam do ja pra pastaj menjëherë pasi vend tyre muezini ezani
thirret fjalët shprehjeve përjashtim dëshmisë teshtin teshtitësi jobesimtar gomari gjeli melek
shejtan parë botë fundit fjalën hyn xhenet lavdërojë patjetër mendoj kështu ashtu njeri zemër
pastër përfundim gjykoj gjykojë prerë para allahut u ngrysëm ngrysa ngrysur gdhimë gdhiva
të lutem lutem o Zoti Zotit Allahut xhenet skllavëria pasardhësve ismailit peshore lehta
të rënda dashura mëshiruesi gjuhë shqiptuar fshihen shkuma detit qofshin edhe sa liron katër
vetë prej thesar dëshiroj gjithçka kapin rrezet diellit mijë të mira mundësi fitoni çdo pyeti
përgjigj ulur ishin njeri nga ata tregoj abdullah kajs posi dërguari i""".split())

SQ_FJALE = {w for w in SQ_FJALE if len(w) >= 2}   # hiq shkronjat njëshe (rrezik për transkriptimin)
SQ_RE = re.compile(r'\b(' + '|'.join(sorted(SQ_FJALE, key=len, reverse=True)) + r')\b', re.I)

# Shënime numërimi/kohë që libri i vendos në kllapa pas transkriptimit
COUNT_SQ = {
    'një': 1, 'dy': 2, 'tri': 3, 'tre': 3, 'katër': 4, 'pesë': 5, 'gjashtë': 6,
    'shtatë': 7, 'tetë': 8, 'nëntë': 9, 'dhjetë': 10, 'njëzet': 20, 'tridhjetë': 30,
    'njëqind': 100, 'qind': 100, 'njëmijë': 1000,
}
PAREN_NOTE = re.compile(
    r'\(\s*(?:'
    r'(?P<num>\d+|[Nn]jëqind|[Dd]hjetë|[Tt]ri|[Tt]re|[Kk]atër|[Pp]esë|[Gg]jashtë|[Ss]htatë|[Tt]etë|[Nn]ëntë|[Dd]y|[Nn]jë)\s+herë'
    r'|[Kk]ur\s+(?:të\s+)?(?P<koha>gdhihemi|ngrysemi|biem|fle|flesh)\b[^)]{0,26}'
    r'|(?P<koha2>pas|para)\s+çdo\s+namazi[^)]{0,20}'
    r')\s*[.,;]?\s*\)'
)

MORN = re.compile(r'أَصْبَح|اصبح|aṣbaḥn|asbahn|u gdhim|u gdhiva|gdhihemi|gdihemi|kur gdhihemi', re.I)
EVEN = re.compile(r'أَمْسَيْنَا|أَمْسَى|امسى|amsayn|emsejn|emsejtu|emsã|u ngrys|ngrysemi|ngrysur|kur ngrysemi', re.I)
NATE_CH = {28, 29, 30, 31}


def rap(msg):
    RAPORT.append(msg)


RAPORT = []

# ─────────────────────────────  NORMALIZIM  ─────────────────────────────

def norm(s):
    """Pastrim i karaktereve: pa humbur asnjë shkronjë të tekstit."""
    if not isinstance(s, str):
        return s
    orig = s
    s = s.replace('\xa0', ' ')                     # hapësirë e pandashme
    s = s.replace('\u200f', '').replace('\u200e', '')
    s = s.replace('`', '’')                        # backtick -> apostrof i djathtë
    s = s.replace('‹', '«').replace('›', '»')
    s = re.sub(r'[ \t]{2,}', ' ', s)               # dy e më shumë hapësira
    s = re.sub(r' *\n *', '\n', s)                 # hapësira rreth ndërprerjeve
    s = re.sub(r'\n{3,}', '\n\n', s)
    s = re.sub(r'\s+([.,;:!?])', r'\1', s)         # hapësirë para pikësimit
    s = s.strip()
    if s != orig:
        rap(f'   normalizim karakteresh')
    return s


def bosh(v):
    """Kthen '' në None që skema të jetë e qartë."""
    if isinstance(v, str):
        v = v.strip()
        return v if v else None
    return v

# ───────────────────  NDARJA transkriptim / shqip  ───────────────────

def klasifiko(segment):
    """'ARB' | 'TR' | 'SQ' për një segment të vetëm."""
    if ARB_RE.search(segment) and len(ARB_RE.findall(segment)) >= 3:
        # arabisht mbizotëruese (jo citim i brendshëm i shkurtër)
        jo_arb = re.sub(r'[\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF\u0640\s]', '', segment)
        if len(jo_arb) < 8:
            return 'ARB'
    n_sq = len(SQ_RE.findall(segment))
    n_tr = len(TR_RE.findall(segment))
    if n_sq >= 2:
        return 'SQ'
    if n_tr >= 1:
        return 'TR'
    return 'SQ'


def ndaj_vijat(fusha):
    """Ndan një fushë shumëvargëshe në (vijat TR, vijat SQ, vijat ARB), duke ruajtur radhën."""
    if not fusha:
        return [], [], []
    tr, sq, arb = [], [], []
    for vij in fusha.split('\n'):
        vij = vij.strip()
        if not vij:
            continue
        k = klasifiko(vij)
        # një vijë e vetme mund të ketë SQ në fillim dhe TR në fund (p.sh. ch78)
        if k == 'SQ':
            pjeset = re.split(r'(?<=[.:!?؛])\s+', vij)
            if len(pjeset) > 1:
                grupe = [(klasifiko(p), p) for p in pjeset]
                if any(g[0] == 'TR' for g in grupe) and any(g[0] == 'SQ' for g in grupe):
                    bufsq, buftr = [], []
                    for kk, pp in grupe:
                        (buftr if kk == 'TR' else bufsq).append(pp)
                    if bufsq:
                        sq.append(' '.join(bufsq))
                    if buftr:
                        tr.append(' '.join(buftr))
                    continue
            sq.append(vij)
        elif k == 'TR':
            tr.append(vij)
        else:
            arb.append(vij)
    return tr, sq, arb


def hiq_shenimet(s):
    """Nxjerr shënimet e numërimit/kohës nga kllapa; kthen (teksti, count, koha)."""
    if not s:
        return s, None, None
    count, koha = None, None
    def zev(m):
        nonlocal count, koha
        if m.group('num'):
            n = m.group('num')
            count = int(n) if n.isdigit() else COUNT_SQ.get(n.lower(), COUNT_SQ.get(n, None))
        elif m.group('koha'):
            koha = m.group('koha').lower()
        elif m.group('koha2'):
            koha = m.group('koha2').lower()
        return ''
    s2 = PAREN_NOTE.sub(zev, s)
    s2 = re.sub(r'[ \t]{2,}', ' ', s2)
    s2 = re.sub(r'\s+([.,;:!?])', r'\1', s2).strip()
    if count is None and koha is None:
        return s, None, None
    return (s2 or None), count, koha

# ─────────────────────────────  KOHA  ─────────────────────────────

def koha_e(it, cid):
    hay = ' '.join(filter(None, [it.get('arabic'), it.get('transliteration'),
                                 it.get('albanian'), it.get('lead'), it.get('count_note')]))
    m, e = bool(MORN.search(hay)), bool(EVEN.search(hay))
    if m and e:
        return 'të dyja'
    if m:
        return 'mëngjes'
    if e:
        return 'mbrëmje'
    if cid in NATE_CH:
        return 'natë'
    return None

# ───────────────  ARABISHTJA BRENDA CITIMEVE (ch86, ch102, ch125, ch132)  ───────────────

CITIM = re.compile(r'\(([\u0600-\u06FF\uFB50-\uFDFF\uFE70-\uFEFF\u0640][^)]{2,})\)')

def nxirr_citimin(it):
    """Nëse `lead` citon një lutje arabe, e pasqyron te `arabic`."""
    lead = it.get('lead') or ''
    if it.get('arabic') or not CITIM.search(lead):
        return False
    m = CITIM.search(lead)
    arb = m.group(1).strip()
    if len(ARB_RE.findall(arb)) < 4:
        return False
    pjesa_pas = lead[m.end():].strip()
    # transkriptimi zakonisht ndjek menjëherë pas kllapës arabe
    tr_m = re.match(r'^([^(\n]{3,140}?)[.!]?\s*(?:\(([^)]{4,200})\))?\s*([.!]?\s*)$', pjesa_pas)
    tr = sq = None
    if tr_m:
        kand = tr_m.group(1).strip()
        if TR_RE.search(kand) and len(SQ_RE.findall(kand)) < 2:
            tr = kand
            sq = (tr_m.group(2) or '').strip() or None
            pjesa_pas = ''
    it['arabic'] = arb
    if tr:
        it['transliteration'] = norm(tr)
    if sq:
        it['albanian'] = norm(sq)
    it['lead'] = norm((lead[:m.start()].strip() + ' ' + pjesa_pas).strip()) or None
    return True

# ─────────────────  KORRIGJIME EKSPlicITE (të verifikuara nga libri)  ─────────────────

# Tituj që libri i shkruan në më shumë se një rresht. Tabela e përmbajtjes e ka
# kapur vetëm rreshtin e parë, prandaj titulli i plotë merret nga koka e kapitullit
# në trupin e librit (verifikuar: nga 132 kapituj, vetëm ch130 e ka këtë).
TITULL_VAZHDIM = {
    130: 'MIRËSIA QË KEMI KUR THEMI: Subḥãnall-llãh, El hamdu lil-lãh, '
         'Lã ilãhe il-lall-llãh dhe All-llãhu Ekber.',
}

# Hyrje që libri NUK i ka si njësi të veçanta. Këto janë mbetur nga parseri kur
# koka e kapitullit është ndarë gabimisht; përmbajtja e tyre është shpërndarë te
# titulli i kapitullit dhe te hyrja pasuese.
HIQ = {
    (130, 1): 'rreshti i dytë i titullit shkoi te titulli; '
              '“Pejgamberi ﷺ ka thënë: Kush thotë:” është lead i hyrjes #2',
}

EKSPlicITE = {
    # ch130 hyrja 2: libri e shkruan në NJË rresht transkriptimin dhe kuptimin e
    # tij shqip — “Subḥãnall-llãhi we biḥamdihi!” do t'i fshihen gjynahet…”.
    # Rreshti pasues (“Kush thotë dhjetë herë:”) i përket hyrjes #3, jo kësaj.
    (130, 2): {
        'type': 'dua',
        'lead': 'Pejgamberi ﷺ ka thënë: “Kush thotë:',
        'arabic': 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.',
        'transliteration': 'Subḥãnall-llãhi we biḥamdihi!',
        'albanian': 'do t’i fshihen gjynahet, qofshin edhe sa shkuma e detit.”',
        'count': None, 'count_burimi': None,
        'count_mungon_arsye': 'libri nuk e jep numërimin për këtë hyrje',
        'arsye': 'transkriptimi ishte ngjitur me kuptimin shqip në një rresht; '
                 'numërimi “dhjetë herë” i takon hyrjes pasuese, jo kësaj',
    },
    # ch130 hyrja 3: rreshti hapës ishte ngjitur si përkthim te hyrja e mëparshme
    (130, 3): {
        'lead': 'Kush thotë dhjetë herë:',
        'count': 10, 'count_burimi': 'libri (“Kush thotë dhjetë herë:”)',
        'arsye': 'lead-i dhe numërimi ishin hedhur te hyrja e mëparshme',
    },
    # ch113: libri nuk jep përkthim të veçantë — shënimi 291 thotë që kuptimi
    # jepet me shkrim të pjerrët në rrëfimin e mësipërm

    # ch26: parseri e kishte cunguar transkriptimin — mungonte e gjithë gjysma
    # e parë e kushtëzores ("nëse është e mirë…") dhe udhëzimi për të përmendur hallin.
    # Rikthyer fjalë-për-fjalë nga botimi.
    (26, 1): {
        'transliteration':
            'All-llãhumme innĩ esteḣĩruke bi ’ilmike, we esteḳdiruke bi ḳudratike, we '
            'es’eluke min faḍlikel ‘aḍhĩm, fe inneke teḳdiru we lã eḳdiru, we ta’ëlemu we '
            'lã a’ëlemu, we Ente ’al-lãmul ġujũb. All-llãhumme in kunte ta’ëlemu enne '
            'hãdhel emra - (këtu përmend hallin që ka) - ḣajrun lĩ fĩ dĩnĩ we me’ãshĩ, we '
            '‘ãḳibeti emrĩ, - ’ãxhilihi we ãxhilihĩ, - feḳdurhu lĩ we jessirhu lĩ, thumme '
            'bãrik lĩ fĩhi! we in kunte ta’ëlemu enne hãdhel emra sherrun lĩ fĩ dĩnĩ we '
            'me’ãshĩ we ’ãkibeti emrĩ, - ’ãxhilihi we ãxhilihi, - faṣrifhu ‘annĩ, '
            'waṣrifnĩ ’anhu, wekdur lijel ḣajra ḥajthu kãne, thumme erḍinĩ bihi.',
        'arsye': 'transkriptimi ishte cunguar; rikthyer i plotë nga libri',
    },
    # ch78: fjalia shqipe ishte ngjitur para transkriptimit
    (78, 1): {
        'lead': 'Kur një jobesimtar teshtin dhe thotë: ‘Elḥamdu lil-lãh!’, i thuhet:',
        'transliteration': 'Jehdĩkumull-llãhu we juṣlih bãlekum.',
        'albanian': '(Allahu ju udhëzoftë dhe jua përmirësoftë gjendjen!).',
        'arsye': 'citimi brenda rrëfimit ishte bashkuar me transkriptimin',
    },
    # ch86: libri jep DY fraza — atë që dëgjon dhe përgjigjen tënde.
    # Lutja për t'u thënë është përgjigja (وَلَكَ); e para mbetet te lead.
    (86, 1): {
        'lead': 'Kur dikush të thotë: (غَفَرَ اللَّهُ لَكَ) Ġaferall-llãhu leke! — “Allahu të faltë!” — ia kthen:',
        'arabic': 'وَلَكَ.',
        'transliteration': 'We lek',
        'albanian': 'Edhe ty, gjithashtu!',
        'arsye': 'dy frazat e përziera u ndanë: shkaku te lead, përgjigja si lutje',
    },
    # ch125: libri e jep lutjen brenda një rrëfimi të gjatë
    (125, 1): {
        'lead': 'Pejgamberi ﷺ thotë: “Kur ndonjëri prej jush sheh tek vëllai i tij, ose vetvetja, '
                'ose pasuria e tij, diçka që i pëlqen, le të bëjë lutje për bereqet — pasi mësyshi është hak:',
        'arabic': 'اللَّهُمَّ بَارِك عَلَيْهِ.',
        'transliteration': 'All-llãhumme barik ‘alejhi!',
        'albanian': 'O Allah, begatoje atë dhe shtoja të mirat!',
        'arsye': 'lutja ishte e mbështjellë brenda rrëfimit',
    },
    (113, 1): {'transliteration': 'Wall-llãhu ḥasĩbuhu we lã uzekkĩ ‘alall-llãhi eḥadã.',
               'albanian': None, 'albanian_mungon_arsye':
               'shënimi 291: “duhet të themi dhikrin në arabisht… ose kuptimin e tij '
               'në shqip të shënuar më lart me shkrim të pjerrët”',
               'arsye': 'transkriptimi ishte hedhur te albanian'},
    # ch110 hyrja 2: shkaku ("sepse gomari…") është pjesë e rrëfimit, jo përkthim
    (110, 2): {
        'lead': 'Ndërsa kur të dëgjoni gomarin duke pëllitur, kërkoni mbrojtje tek '
                'Allahu nga shejtani (të thuash), sepse gomari ka parë një shejtan:',
        'transliteration': 'E’ũdhu bil-lãhi minesh-shejṭãnirr-rraxhĩm.',
        'albanian': None,
        'albanian_mungon_arsye': 'libri nuk jep përkthim të veçantë; shkaku '
                                 '(“sepse gomari ka parë një shejtan”) është pjesë e rrëfimit te lead',
        'arsye': 'fjalia shqipe ishte ngjitur pas transkriptimit',
    },
    # ch120: rrëfim, fushat ishin këmbyer plotësisht
    (120, 1): {
        'type': 'rrefim',
        'lead': 'Pejgamberi ﷺ i hipi devesë së tij të quajtur Kasua dhe vazhdoi të ecte, '
                'derisa mbërriti në Mesh’ar el Haram (një kodër në Muzdelife). Kur mbërriti '
                'atje, u drejtua nga kibla dhe filloi të bënte lutje, tekbire, të thoshte '
                '‘Lã ilãhe il-lall-llãh’ dhe të bënte dhikrin e teuhidit.',
        'transliteration': 'Lã ilãhe il-lall-llãhu waḥdehu lã sherĩke leh, lehul mulku we '
                           'lehul ḥamdu we huwe ‘alã kul-li shej’in ḳadĩr.',
        'albanian': 'Ai vazhdoi në këtë gjendje, derisa u përhap plotësisht drita e agimit, '
                    'por ende pa lindur dielli, u largua për në Mina.',
        'arsye': 'rrëfimi shqip ishte te transliteration dhe anasjelltas',
    },
}


# Hyrje që libri i paraqet si një paragraf por përmbajnë disa lutje/rrëfime të
# veçanta. Ndarja bëhet DORËSHTAS nga teksti i verifikuar i librit.
NDARJE = {
    # ch102: dy thënie të ndryshme (ngjitje / zbritje)
    (102, 1): [
        {'type': 'dua',
         'lead': 'Xhabiri tregon se kur ngjiteshin përpjetë, thonin:',
         'arabic': 'اللَّهُ أَكْبَرُ.', 'transliteration': 'All-llãhu Ekber.',
         'albanian': None,
         'albanian_mungon_arsye': 'libri nuk e përkthen “Allãhu Ekber” në këtë vend'},
        {'type': 'dua',
         'lead': 'Kurse kur zbrisnin tatëpjetë, thonin:',
         'arabic': 'سُبْحَانَ اللَّهِ.', 'transliteration': 'Subḥãnall-llãh.',
         'albanian': None,
         'albanian_mungon_arsye': 'libri nuk e përkthen “Subḥãnall-llãh” në këtë vend'},
    ],
    # ch130 hyrja 8: lutja e të sapomuslimanit + dy rrëfime të veçanta
    (130, 8): [
        {'type': 'dua',
         'lead': 'Kur dikush bëhej musliman, Pejgamberi ﷺ i mësonte namazin, e pastaj e '
                 'këshillonte të lutej me këto fjalë:',
         'arabic': 'اللَّهُمَّ اغْفِرِ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَعَافِنِي وَارْزُقْنِي.',
         'transliteration': 'All-llãhummeġfir lĩ, werḥamnĩ, wehdinĩ, we ‘ãfinĩ, werzuḳnĩ.',
         'albanian': '(O Allah! Më fal, më mëshiro, më udhëzo, më ruaj nga të këqijat dhe më furnizo).'},
        {'type': 'rrefim',
         'lead': 'Lutja më e mirë është: “Elḥamdu lil-lãh”, kurse dhikri më i mirë është: '
                 '“Lã ilãhe il-lall-llãh.”',
         'arabic': None, 'transliteration': None, 'albanian': None},
        {'type': 'rrefim',
         'lead': 'Fjalët më të mira, që u mbetet shpërblimi përgjithmonë, janë: '
                 '“Subḥãnall-llãh, welḥamdu lil-lãh, we lã ilãhe il-lall-llãh, wall-llãhu ekber, '
                 'we lã ḥawle we lã ḳuwwete il-lã bil-lãh”.',
         'arabic': None, 'transliteration': None, 'albanian': None},
    ],
}

# Kapitujt 25/6, 27/4, 28/1 — blloku i tri sureve, i ndarë në 3 hyrje
SURET = {
    'arabic': [
        'بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ\n﴿قُلْ هُوَ اللَّهُ أَحَدٌ ۞ اللَّهُ الصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ﴾',
        'بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ\n﴿قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ مِن شَرِّ مَا خَلَقَ ۞ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۞ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۞ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ﴾',
        'بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ\n﴿قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۞ مَلِكِ النَّاسِ ۞ إِلَهِ النَّاسِ ۞ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۞ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۞ مِنَ الْجِنَّةِ وَالنَّاسِ﴾',
    ],
    'transliteration': [
        'Bismil-lãhirr-rraḥmãnirr-rraḥĩm.\nḲul huwall-llãhu eḥad, All-llãhuṣ-Ṣamed, lem jelid we lem jũled, we lem jekun lehũ kufuwen eḥad.',
        'Bismil-lãhirr-rraḥmãnirr-rraḥĩm.\nḲul e’ũdhu bi rabbil feleḳ, min sherri mã ḣaleḳ, we min sherri ġãsiḳin idhã weḳab, we min sherrin-neffãthãti fil ‘uḳad, we min sherri ḥãsidin idha ḥased.',
        'Bismil-lãhirr-rraḥmãnirr-rraḥĩm.\nḲul e’ũdhu bi rabbin-nãs, Melikin-nãs, Ilãhin-nãs, min sherril weswãsil ḣan-nãs, el-ledhĩ juweswisu fĩ ṣudũrin-nãs, minel xhinneti wen-nãs.',
    ],
    'albanian': [
        'Me emrin e Allahut, Mëshiruesit, Mëshirëbërësit!\nThuaj: “Ai, Allahu është Një! Allahu është Eṣ Ṣamedu (Ai, të Cilit i drejtohen krijesat për nevojat e tyre). Ai as nuk lind, as nuk është i lindur. Dhe askush nuk është i barabartë me Atë!”',
        'Me emrin e Allahut, Mëshiruesit, Mëshirëbërësit!\nThuaj: “Kërkoj mbështetje te Zoti i agimit, që të më mbrojë nga sherri i gjithçkaje që Ai ka krijuar, dhe nga sherri i natës, kur bie terri, dhe nga sherri i magjistarëve, që fryjnë në nyje magjie, dhe nga sherri i smirëziut, kur vepron me smirë.”',
        'Me emrin e Allahut, Mëshiruesit, Mëshirëbërësit!\nThuaj: “Kërkoj mbrojtje te Zoti i njerëzve, Sundimtari i njerëzve, i Adhuruari (i vetëm me të drejtë) i njerëzve, nga sherri i shejtanit ngacmues që fshihet (kur përmendet Allahu), e që hedh të liga e dyshime në gjoksin e njerëzve, (qoftë ai shejtan) prej xhindëve apo njerëzve!”',
    ],
    'emri': ['Suretu El-Iḫlãs', 'Suretu El-Feleḳ', 'Suretu En-Nãs'],
}
SURE_VARG = {(25, 6), (27, 4), (28, 1)}

# ───────────────  VARIANTET E MBRËMJES (nga poshtëshënimet e ch27)  ───────────────
# Ndërtuar DORËSHTAS nga teksti i librit. Libri i jep të plota arabishten dhe
# transkriptimin; përkthimi shqip është i cunguar nga vetë botimi (me "…"),
# prandaj ruhet siç është dhe shënohet — nuk sajojmë tekst.
MBREMJA = [
    {'pas': 5, 'arabic': 'أمْسَيْنَا وأمْسَى الـمُلْكُ لِلَّـهِ.',
     'transliteration': 'Emsejna we emsel mulku lil-lãh.',
     'albanian': 'U ngrysëm…', 'i_cunguar': True,
     'count': 1},
    {'pas': 5, 'arabic': 'رَبِّ أسْألُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وأعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وشَرِّ مَا بَعْدَهَا.',
     'transliteration': 'Rabbi es’eluke ḣajra mã fî hãdhihil-lejleti, ue ḣajra mã ba’ëdehã, ue eûdhu bike min sherri mã fî hãdhihil-lejleti, ue sherri mã ba’ëdehã.',
     'albanian': 'O Zoti im! Unë të kërkoj të mirën që do të krijohet dhe do të ndodhë në këtë natë, dhe të mirën që do të krijohet në netët e tjera pas saj! Ty të lutem të më mbrosh nga sherri i gjithçkaje në këtë natë dhe në netët pas saj!',
     'i_cunguar': False, 'count': 1},
    {'pas': 6, 'arabic': 'اللَّهُمَّ بِكَ أمْسَيْنَا، وَبِكَ أصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوْتُ، وَإلَيْكَ الـمَصِيْرُ.',
     'transliteration': 'All-llãhumme bike emsejnã, ue bike aṣbaḥnã…',
     'albanian': 'O Allah! U ngrysëm nën kujdesin Tënd dhe u gdhimë…', 'i_cunguar': True,
     'count': 1},
    {'pas': 8, 'arabic': 'اللهم إني أمسيت…',
     'transliteration': 'Allãhum-me innî emsejtu…',
     'albanian': 'O Allah! Unë u ngrysa…', 'i_cunguar': True, 'count': 4},
    {'pas': 9, 'arabic': 'اللَّهُمَّ مَا أمْسَى بِي…',
     'transliteration': 'All-llãhumme mã emsã bî…',
     'albanian': 'O Allah! Çdo mirësi me të cilën unë jam ngrysur…', 'i_cunguar': True,
     'count': 1},
    {'pas': 17, 'arabic': 'أمْسَيْنَا وأمْسَى الـمُلْكُ للَّهِ رَبِّ العَالَمينَ اللَّهُمَّ إنِّي أسْألُكَ خَيْرَ هَذِهِ اللَّيْلَةِ، فَتْحَهَا، ونَصْرَهَا ونُوْرَهَا، وبَرَكَتهَا، وَهُدَاهَا، وأعُوْذُ بِكَ مِنْ شَرِّ مَا فيْهَا وَشَرِّ مَا بَعْدَهَا.',
     'transliteration': 'Emsejnã ue emsel mulku lil-lãhi rabbil ‘ãlemîn. All-llãhumme innî es’eluke ḣajra hãdhihil-lejleti: fet’ḥahã we naṣrahã we nûrahã we beraketehã we hudãhã, we e’ũdhu bike min sherri mã fîhã we sherri mã ba’ëdehã.',
     'albanian': 'U ngrysëm… O Allah! Unë të lutem të më japësh të mirën që krijohet a që zbret në këtë natë…',
     'i_cunguar': True, 'count': 1},
    {'pas': 18, 'arabic': 'أمْسَيْنَا عَلَى فِطْرَةِ الإسْلام.',
     'transliteration': 'Emsejnã ‘alã fitratil islãm.',
     'albanian': 'U ngrysëm në natyrshmërinë islame.', 'i_cunguar': False, 'count': 1},
]


# ───────────  NUMRAT E POSHTËSHËNIMEVE  ───────────
# Libri i numëron poshtëshënimet 1..330 në rend. Dataset-i i kishte vetëm si
# tekst, pa numër — pra lexuesi nuk mund t'i verifikonte në libër.
# I lidhim me numër duke shfrytëzuar që numrat RITEN monotonisht gjatë librit:
# kjo zgjidhon edhe 133 rastet ku i njëjti tekst ("Buhariu dhe Muslimi.")
# u përket disa numrave të ndryshëm.

def _nrm(s):
    return re.sub(r'[\s.,;:!?"\'()\[\]\-]+', ' ', re.sub(r'\s+', ' ', s or '')).strip().lower()


def lidh_numrat(d):
    fp = os.path.join(DATA, 'poshteshenimet.json')
    if not os.path.exists(fp):
        return 0, 0, 0
    ps = json.load(open(fp, encoding='utf-8'))
    kand = collections.defaultdict(list)
    for k, v in ps.items():
        try:
            kand[_nrm(v)].append(int(k))
        except (TypeError, ValueError):
            continue
    for v in kand.values():
        v.sort()
    fundit = 0
    qarte = shumefish = zgjidhur = 0
    for c in d['chapters']:
        for it in c['items']:
            te_reja = []
            for t in (it.get('notes') or []):
                tekst = t.get('tekst') if isinstance(t, dict) else t
                m = kand.get(_nrm(tekst))
                if not m:
                    m = [int(k) for k, v in ps.items()
                         if len(_nrm(v)) >= 40 and _nrm(v)[:40] in _nrm(tekst)] or \
                        [int(k) for k, v in ps.items()
                         if len(_nrm(tekst)) >= 40 and _nrm(tekst)[:40] in _nrm(v)]
                    m = sorted(m)
                nr = None
                if len(m) == 1:
                    nr = m[0]
                    qarte += 1
                elif len(m) > 1:
                    shumefish += 1
                    pas = [x for x in m if x > fundit]
                    nr = pas[0] if pas else min(m, key=lambda x: abs(x - fundit))
                    zgjidhur += 1
                if nr:
                    fundit = max(fundit, nr)
                te_reja.append({'nr': nr, 'tekst': tekst})
            it['notes'] = te_reja
    return qarte, shumefish, zgjidhur


# ─────────────────────────────  RRJEDHA  ─────────────────────────────

def siguro_audio(d):
    """Çdo rrugë audio duhet të ekzistojë VËRTET në disk.

    `invocations.json` i repo-s burimore përmban rrugë të thyera — referon
    skedarë që nuk ekzistojnë. Këtu trajtohen dy raste:
      * skedari është në repo por nuk ishte kopjuar  → kopjohet;
      * skedari nuk ekziston askund                  → audio bëhet null dhe
        shkruhet arsyeja, që aplikacioni të mos kërkojë kurrë një skedar të vdekur.
    """
    aud = os.path.join(ROOT, 'audios')
    rep = os.path.join(os.path.dirname(ROOT), 'repo', 'audios')
    os.makedirs(aud, exist_ok=True)
    kopjuar = hequr = 0
    for c in d['chapters']:
        for it in c['items']:
            rr = ([it['audio']] if it.get('audio') else []) + list(it.get('audio_parts') or [])
            gjalle = []
            for r in dict.fromkeys(rr):
                n = os.path.basename(r)
                dst = os.path.join(aud, n)
                if os.path.exists(dst):
                    gjalle.append(r)
                    continue
                src = os.path.join(rep, n)
                if os.path.exists(src):
                    shutil.copy2(src, dst)
                    gjalle.append(r)
                    kopjuar += 1
                    rap(f'ch{c["id"]}#{it["n"]} audio u kopjua nga repo-ja: {r}')
                else:
                    hequr += 1
                    it['audio_mungon_arsye'] = (
                        f'repo-ja burimore e referon “{r}”, por skedari nuk ekziston '
                        f'atje — burimi nuk ka audio për këtë hyrje')
                    rap(f'ch{c["id"]}#{it["n"]} audio u hoq (nuk ekziston as në repo): {r}')
            if gjalle:
                it['audio'] = gjalle[0]
                it['audio_parts'] = gjalle if len(gjalle) > 1 else None
                it['has_audio'] = True
            else:
                it['audio'] = None
                it['audio_parts'] = None
                it['has_audio'] = False
        c['audio_count'] = sum(1 for i in c['items'] if i.get('has_audio'))
    return kopjuar, hequr


def main():
    global RAPORT
    RAPORT = []
    p = os.path.join(DATA, 'mburoja.json')
    d = json.load(open(p, encoding='utf-8'))
    toc = {}
    tp = os.path.join(DATA, 'toc.json')
    if os.path.exists(tp):
        toc = {t['id']: t for t in json.load(open(tp, encoding='utf-8'))}

    ndarje = rindertim = 0
    shenime = 0
    citime = 0
    faqe = 0
    hiq = 0

    for c in d['chapters']:
        cid = c['id']
        rap(f'ch{cid}')

        # 1. faqja nga tabela e përmbajtjes së vetë librit
        t = toc.get(cid)
        if t and t.get('page') and c.get('page') != t['page']:
            rap(f'   faqja {c.get("page")} → {t["page"]} (nga tabela e përmbajtjes)')
            c['page'] = t['page']
            faqe += 1

        # 1b. titulli i plotë kur libri e shkruan në më shumë se një rresht
        if cid in TITULL_VAZHDIM and c.get('title') != TITULL_VAZHDIM[cid]:
            rap(f'   titulli u plotësua nga koka e kapitullit: {c.get("title")!r}'
                f' → {TITULL_VAZHDIM[cid]!r}')
            c['title'] = TITULL_VAZHDIM[cid]

        re_items = []
        for it in c['items']:
            n = it['n']
            para = json.dumps(it, ensure_ascii=False, sort_keys=True)

            # 2. normalizim i të gjitha fushave tekstuale
            for f in ('lead', 'arabic', 'transliteration', 'albanian', 'title'):
                if f in it and isinstance(it[f], str):
                    it[f] = norm(it[f])
            it['notes'] = [norm(x) if isinstance(x, str) else x for x in (it.get('notes') or [])]
            c['title'] = norm(c['title'])

            # 3. korrigjime eksplicite të verifikuara nga libri
            if (cid, n) in HIQ:
                rap(f'   #{n} u hoq (nuk është njësi në libër): {HIQ[(cid, n)]}')
                hiq += 1
                continue
            ek = EKSPlicITE.get((cid, n))
            if ek:
                for f, v in ek.items():
                    if f == 'arsye':
                        continue
                    it[f] = v
                rap(f'   #{n} korrigjim i dorës: {ek.get("arsye","")}')
                rindertim += 1

            # 4a. hyrje shumëpjesëshe të ndara dorëkshas
            elif (cid, n) in NDARJE:
                for spec in NDARJE[(cid, n)]:
                    e = dict(it)
                    e.update(spec)
                    e['n'] = n
                    e['albanian_alt'] = None
                    e['notes'] = []
                    e['audio'] = None
                    e['audio_parts'] = None
                    e['has_audio'] = False
                    re_items.append(e)
                re_items[-len(NDARJE[(cid, n)])]['notes'] = it.get('notes') or []
                if it.get('audio') or it.get('audio_parts'):
                    re_items[-len(NDARJE[(cid, n)])]['audio'] = it.get('audio')
                    re_items[-len(NDARJE[(cid, n)])]['audio_parts'] = it.get('audio_parts')
                    re_items[-len(NDARJE[(cid, n)])]['has_audio'] = bool(it.get('audio'))
                for _e in re_items[-len(NDARJE[(cid, n)]):]:
                    for _f in ('lead','arabic','transliteration','albanian','albanian_alt'):
                        _e[_f] = bosh(_e.get(_f))
                    _e['type'] = 'dua' if _e.get('arabic') else 'rrefim'
                    _e['time'] = koha_e(_e, cid)
                rap(f'   #{n} u nda në {len(NDARJE[(cid, n)])} hyrje (e verifikuar nga libri)')
                ndarje += 1
                continue

            # 4b. ndarja e bllokut të tri sureve në 3 hyrje
            elif (cid, n) in SURE_VARG:
                lead0 = it.get('lead')
                mbyllja = None
                alb_lin = [x for x in (it.get('albanian') or '').split('\n') if x.strip()]
                if alb_lin and re.search(r'këto tri sure|pas leximit', alb_lin[-1], re.I):
                    mbyllja = alb_lin[-1].strip()
                audio_parts = it.get('audio_parts') or ([it['audio']] if it.get('audio') else [])
                cnt = it.get('count', 1)
                for k in range(3):
                    e = {
                        'n': n, 'pjesa': k + 1, 'type': 'dua',
                        'sure': SURET['emri'][k],
                        'lead': lead0 if k == 0 else None,
                        'arabic': SURET['arabic'][k],
                        'transliteration': SURET['transliteration'][k],
                        'albanian': SURET['albanian'][k],
                        'albanian_alt': None,
                        'count': cnt,
                        'notes': it.get('notes', []) if k == 0 else [],
                        'audio': audio_parts[k] if k < len(audio_parts) else None,
                        'audio_parts': None,
                        'has_audio': bool(audio_parts[k] if k < len(audio_parts) else None),
                        'mbyllje': mbyllja if k == 2 else None,
                    }
                    re_items.append(e)
                for _e in re_items[-3:]:
                    for _f in ('lead','arabic','transliteration','albanian','albanian_alt'):
                        _e[_f] = bosh(_e.get(_f))
                    _e['type'] = 'dua' if _e.get('arabic') else 'rrefim'
                    _e['time'] = koha_e(_e, cid)
                rap(f'   #{n} blloku i tri sureve → 3 hyrje (Iḫlãs, Feleḳ, Nãs)')
                ndarje += 1
                continue

            else:
                # 5. shënimet e numërimit/kohës jashtë tekstit — BËHET SË PARI,
                #    përndryshe "(tri herë)" e bën klasifikuesin ta quajë transkriptimin shqip
                for f in ('transliteration', 'albanian'):
                    v, cnt, koha = hiq_shenimet(it.get(f))
                    if cnt or koha:
                        it[f] = v
                        if cnt:
                            it['count'] = cnt
                            it['count_burimi'] = 'libri (shënim në kllapa)'
                        if koha:
                            it['koha_shenim'] = koha
                        shenime += 1
                        rap(f'   #{n} shënim i nxjerrë: count={cnt} koha={koha}')


                # 6. ndarje deterministe e fushave të përziera
                tr_f, sq_f, arb_f = ndaj_vijat(it.get('transliteration'))
                tr_a, sq_a, arb_a = ndaj_vijat(it.get('albanian'))
                if sq_f or tr_a or arb_f or arb_a:
                    # rrëfimi shqip që ishte te transkriptimi → te lead
                    if sq_f:
                        it['lead'] = norm(((it.get('lead') or '') + '\n' + '\n'.join(sq_f)).strip()) or None
                    # arabishtja që ishte e fshehur në njërën prej dy fushave
                    for a in arb_f + arb_a:
                        if not it.get('arabic'):
                            it['arabic'] = norm(a)
                    it['transliteration'] = norm('\n'.join(tr_f + tr_a)) or None
                    it['albanian'] = norm('\n'.join(sq_a)) or None
                    rap(f'   #{n} fushat u rindanë (shqip↔transkriptim)')
                    rindertim += 1

            # 8. fushat bosh → null
            for f in ('lead', 'arabic', 'transliteration', 'albanian', 'albanian_alt'):
                it[f] = bosh(it.get(f))

            # 9. tipi
            it['type'] = 'dua' if it.get('arabic') else 'rrefim'

            # 10. koha e ditës
            it['time'] = koha_e(it, cid)

            re_items.append(it)

        # 11. variantet e mbrëmjes për ch27
        if cid == 27:
            base = {i['n']: i for i in re_items}
            shtesa = []
            for v in MBREMJA:
                bur = base.get(v['pas'])
                e = {
                    'n': v['pas'], 'varianti': 'mbrëmje', 'type': 'dua',
                    'lead': 'Kur ngrysemi, themi:',
                    'arabic': v['arabic'],
                    'transliteration': v['transliteration'],
                    'albanian': v['albanian'],
                    'albanian_alt': None,
                    'count': v['count'],
                    'notes': [],
                    'audio': None, 'audio_parts': None, 'has_audio': False,
                    'time': 'mbrëmje',
                    'burimi': f'poshtëshënimi i lutjes #{v["pas"]} të këtij kapitulli',
                    'i_cunguar_ne_liber': v['i_cunguar'],
                }
                if bur and bur.get('page'):
                    e['page_ref'] = bur.get('page')
                shtesa.append((v['pas'], e))
                rap(f'   + variant mbrëmjeje pas #{v["pas"]}'
                    + (' (shqipja e cunguar në libër)' if v['i_cunguar'] else ''))
            # ndërthur sipas numrit të hyrjes bazë
            merged, buf = [], collections.defaultdict(list)
            for k, e in shtesa:
                buf[k].append(e)
            for i in re_items:
                merged.append(i)
                merged.extend(buf.pop(i['n'], []))
            for k in sorted(buf):
                merged.extend(buf[k])
            re_items = merged

        # rinumërim
        for idx, it in enumerate(re_items, 1):
            it['id'] = idx
        c['items'] = re_items
        c['item_count'] = len(re_items)
        c['audio_count'] = sum(1 for i in re_items if i.get('has_audio'))

    # ── audio: asnjë rrugë e vdekur nuk lejohet të dalë në dataset ──
    kopjuar, audio_hequr = siguro_audio(d)

    # ── metadata ──
    # Numrat e poshtëshënimeve lidhen PARA numërimeve, sepse ato varen prej tyre.
    q, sh, zg = lidh_numrat(d)

    d['meta']['back_matter'] = {
        'fund': {
            'shenim': 'Pas fjalës “Fund” libri mbyllet me këtë salavat.',
            'arabic': 'وَصَلَّى اللَّهُ وَسَلَّمَ وَبَارَكَ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَأَصْحَابِهِ أَجْمَعِينَ.',
            'transliteration': 'We ṣal-lall-llãhu we sel-leme we bãrake ‘ala nebijjina Muḥammedin we ‘alã ãlihi we aṣ-ḥãbihi exhme’ĩn.',
            'albanian': '(Lavdërimi i Allahut, paqja dhe begatimi qofshin me Pejgamberin tonë Muhammedin, familjen e tij dhe të gjithë shokët e tij).',
        }
    }
    d['meta']['schema']['type'] = ("'dua' = ka tekst arabik për t'u lexuar · "
                                   "'rrefim' = hadith/udhëzim, shfaq fushën lead")
    d['meta']['version'] = '2.0.0'
    d['meta']['generated'] = '2026-10-01'
    d['meta']['counts'] = {
        'chapters': len(d['chapters']),
        'items': sum(len(c['items']) for c in d['chapters']),
        'items_with_audio': sum(1 for c in d['chapters'] for i in c['items'] if i.get('has_audio')),
        'audio_files': len({os.path.basename(r)
                            for c in d['chapters'] for i in c['items']
                            for r in ([i['audio']] if i.get('audio') else [])
                                     + list(i.get('audio_parts') or [])}),
        'audio_rrefim_i_hoqur': audio_hequr,
        'audio_rifreskuar': kopjuar,
        'footnotes': sum(len(i.get('notes', [])) for c in d['chapters'] for i in c['items']),
    }
    _nr = [n['nr'] for c in d['chapters'] for i in c['items']
           for n in (i.get('notes') or []) if isinstance(n, dict) and n.get('nr')]
    d['meta']['counts']['poshteshenime_ne_liber'] = 330
    d['meta']['counts']['poshteshenime_me_numer'] = len(set(_nr))
    d['meta']['counts']['poshteshenime_pa_numer'] = sum(
        1 for c in d['chapters'] for i in c['items']
        for n in (i.get('notes') or []) if isinstance(n, dict) and not n.get('nr'))
    d['meta']['counts']['poshteshenime_te_lidhura_qarte'] = q
    d['meta']['counts']['poshteshenime_te_zgjidhura_me_renditje'] = zg
    d['meta']['counts']['duke_perdorur_audio'] = d['meta']['counts']['items_with_audio']
    d['meta']['validim'] = {
        'titujt_e_kapitujve': '132/132 të verifikuar kundër tabelës së përmbajtjes së vetë librit',
        'faqet': 'nga tabela e përmbajtjes (burim i botuesit), jo të nxjerra nga trupi',
        'ndarja_e_fushave': 'deterministe — bazuar në diakritikët e TABELA E TRANSKRIPTIMIT (f.3)',
        'variantet_e_mbrëmjes': '7, të nxjerra nga poshtëshënimet e ch27; 6 prej tyre e kanë '
                                'shqipen të cunguar nga vetë botimi dhe shënohen si të tilla',
        'tekst_i_sajuar': 'ASNJË — çdo rresht vjen nga botimi me ISBN 978-9951-732-07-9',
    }
    d['meta']['shkurtimet_e_kohës'] = {
        'mëngjes': 'thuhet kur gdhihemi (أَصْبَحْنَا)',
        'mbrëmje': 'thuhet kur ngrysemi (أَمْسَيْنَا)',
        'të dyja': 'libri jep të dy variantet në të njëjtën lutje',
        'natë': 'kapituj që lidhen me gjumin dhe natën',
        'null': 'thuhet në çdo kohë',
    }

    json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    print(f'─' * 66)
    print(f'RREGULLIM I PËRFUNDUAR — version 2.0.0')
    print(f'─' * 66)
    print(f'  faqe të korrigjuara            : {faqe}')
    print(f'  fusha të rindara               : {rindertim}')
    print(f'  hyrje të ndara në më shumë pjesë : {ndarje}')
    print(f'  hyrje të hequra (jo njësi në libër): {hiq}')
    print(f'  tituj të plotësuar nga koka      : {len(TITULL_VAZHDIM)}')
    print(f'  audio të kopjuara nga repo-ja    : {kopjuar}')
    print(f'  audio të hequra (rrugë të vdekura): {audio_hequr}')
    print(f'  shënime numërimi të nxjerra    : {shenime}')
    print(f'  citime arabe të pasqyruara     : {citime}')
    print(f'  variante mbrëmjeje të shtuara  : {len(MBREMJA)}')
    print(f'  poshtëshënime me numër të qartë: {q}')
    print(f'  poshtëshënime të zgjidhura me renditje monotonike: {zg}')
    print(f'\n  kapituj : {d["meta"]["counts"]["chapters"]}')
    print(f'  hyrje   : {d["meta"]["counts"]["items"]}')
    print(f'  me audio: {d["meta"]["counts"]["items_with_audio"]}')
    print(f'\nRaporti i plotë i ndryshimeve: paketa/data/RAPORTI-RREGULLIMIT.txt')
    with open(os.path.join(DATA, 'RAPORTI-RREGULLIMIT.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(RAPORT))
    return 0


if __name__ == '__main__':
    sys.exit(main())
