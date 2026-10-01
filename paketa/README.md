# Mburoja e Muslimanit — të dhëna për webaplikacion

Një skedar JSON i vetëm me **132 kapituj dhe 278 hyrje**, plus **71 incizim MP3**
për kapitujt 15–29. I ndërtuar nga botimi zyrtar shqip dhe i pastruar nga të gjitha
defektet e gjetura gjatë auditimit të `mburoja-api`.

**Versioni 2.0.0 — i certifikuar.** Kalon `scripts/valido_strikt.py`, i cili
verifikon jo vetëm skemën por edhe që **çdo rresht gjendet në libër** (asgjë e
sajuar) dhe që **asnjë rresht i librit nuk mungon** (asgjë e humbur). Shih
[Certifikimi](#certifikimi) më poshtë.

```
paketa/
├── data/
│   ├── mburoja.json          ← SKEDARI QË TË DUHET (375 KB · 87 KB gzip)
│   ├── libri.json            burimi kanonik i nxjerrë nga libri (pa audio)
│   ├── poshteshenimet.json   330 poshtëshënimet e librit, të indeksuara
│   ├── toc.json              tabela e përmbajtjes së librit (tituj + faqe)
│   ├── mburoja_v1_backup.json  versioni 1.0.0, për krahasim
│   └── RAPORTI-RREGULLIMIT.txt  çdo ndryshim i bërë nga rregullo.py
├── audios/                   71 MP3 (14.6 MB) — kapitujt 15–29
├── shembull/index.html       aplikacion shembull që funksionon menjëherë
├── scripts/
│   ├── parsim_libri.py       DOCX → libri.json
│   ├── nderto_paketën.py     libri.json + audio e repo-s → mburoja.json
│   ├── rregullo.py           riparimi + pasurimi → mburoja.json v2.0.0
│   ├── valido.py             kontrollon skemën (exit 0 = pastër)
│   └── valido_strikt.py      CERTIFIKIMI: besnikëri + plotësi ndaj librit
├── README.md                 ky skedar
├── SCHEMA.md                 referenca e fushave
└── LICENCA.md                atributimi — LEXOJE PARA SHPËRNDARJES
```

---

## Nis shembullin

```bash
cd paketa
python3 -m http.server 8080
# hap http://localhost:8080/shembull/
```

Shembulli është një skedar i vetëm HTML pa asnjë varësi — vanilla JS dhe CSS
brenda tij. Funksionon si pikënisje ose si referencë për sjelljen e pritshme.

### Në prodhim — dy gjëra që `http.server` nuk i bën

Serveri i thjeshtë i Python-it është vetëm për provë lokale. Matja e tij:

```
GET /data/mburoja.json   → 200, 350 297 B    (pa gzip)
GET /audios/027_19.mp3   → 200,   185 881 B  (pa Range → nuk kthen 206)
```

| Kërkesa | Pse të duhet | Si |
|---|---|---|
| **`Range` / `206 Partial Content`** | Pa të, `<audio controls>` nuk mund të kërcejë në mes të incizimit — shfletuesi duhet ta shkarkojë tërë skedarin. | Nginx, Caddy, Cloudflare Pages, Netlify, S3 + CloudFront e bëjnë automatikisht. |
| **gzip / brotli** | 350 KB → **~60 KB** për JSON-in. | Nëse hosti është statik, aktivizo kompresimin; nëse përdor një CDN, është i paracaktuar. |

Shto edhe `Cache-Control` për audio-n — skedarët nuk ndryshojnë kurrë:

```
location /audios/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
location /data/mburoja.json {
    add_header Cache-Control "public, max-age=3600, must-revalidate";
}
```

Meqë të dhënat janë statike, **nuk të duhet API në server fare** — një host
statik (GitHub Pages, Cloudflare Pages, Netlify, S3) mjafton dhe është pothuajse
falas. Kjo ishte edhe dobësia kryesore e `mburoja-api`: një kontejner Go që
rishërbente të njëjtat 258 KB nga disku në çdo kërkesë, dhe që sot nuk ekziston më.

## Përdorimi në aplikacionin tënd

Ngarko skedarin një herë dhe mbaje në memorie — është vetëm 375 KB (87 KB me gzip)
(~60 KB i kompresuar me gzip), pra nuk ka nevojë për API në server.

```js
const res  = await fetch('/data/mburoja.json');
const doc  = await res.json();

// të gjithë kapitujt për një listë
doc.chapters.map(c => ({ id: c.id, title: c.title, n: c.item_count }));

// një kapitull
const ch = doc.chapters.find(c => c.id === 27);   // dhikri i mëngjesit/mbrëmjes

// luaj audio-n e një lutjeje
const item = ch.items[0];
if (item.has_audio) new Audio('/' + item.audio).play();
```

Kur një lutje ka **më shumë se një incizim**, `audio_parts` i mban të gjithë.
Kujdes: `audio_parts` është `null` (jo `[]`) për 277 nga 278 hyrjet, ndaj duhet
lexuar në mënyrë të sigurt:

```js
const parts = item.audio_parts ?? (item.audio ? [item.audio] : []);
for (const src of parts) await playSequentially('/' + src);   // bosh → nuk luan gjë
```

Vetëm një hyrje e ka këtë rast: `ch27 #20` → `027_19.mp3` + `027_20.mp3`.

Blloku i tri sureve (Iḫlãs, Feleḳ, Nãs) **nuk** është më një hyrje e vetme —
është ndarë në tri, me `sure` dhe `pjesa`, dhe të tria mbajnë të njëjtin `n`:

```js
// ch25 #6 → tri hyrje të veçanta, secila me audio-n e vet (e treta nuk ka)
doc.chapters.find(c => c.id === 25).items.filter(i => i.n === 6);
```

### Shfaqja sipas `type`

17 nga 278 hyrjet nuk janë lutje për t'u lexuar, por **hadithe ose udhëzime**.
Ato kanë `type: "rrefim"` dhe `arabic: null` — teksti për shfaqje është në `lead`.

```js
if (item.type === 'dua') {
  render({ arabic: item.arabic, translit: item.transliteration, sq: item.albanian });
} else {
  render({ narration: item.lead || item.albanian });   // mos e shfaq kutinë e arabikës
}
```

### Kërkesa të shpeshta

```js
// dhikret që përsëriten më shumë se një herë (30 hyrje)
doc.chapters.flatMap(c => c.items.filter(i => i.count > 1)
                                 .map(i => ({ ...i, ch: c.title })));

// vetëm ato me audio
doc.chapters.flatMap(c => c.items.filter(i => i.has_audio));

// kërkim në të gjitha gjuhët
const q = 'mëngjes';
doc.chapters.flatMap(c => c.items.filter(i =>
  [i.albanian, i.transliteration, i.lead, i.arabic]
    .some(v => (v || '').toLowerCase().includes(q))));

// kapitujt e përditshëm (mëngjes, mbrëmje, gjumë, pas namazit)
[27, 28, 25, 1].map(id => doc.chapters.find(c => c.id === id));
```

### CSS për tekstin arabik

```css
.arabic {
  direction: rtl;
  text-align: right;
  font-size: 26px;
  line-height: 2.05;               /* hareqet kanë nevojë për hapësirë */
  font-family: "Scheherazade New", "Amiri", "Noto Naskh Arabic", serif;
}
```

Të gjitha shkronjat janë me Unicode të plotë dhe hareqe — nuk kërkohet font
i veçantë për t'i ruajtur, por një font naskh e bën shfaqjen shumë më të mirë.

---

## Çfarë përmban

| | |
|---|---|
| Kapituj | **132** (të plotë, pa vrima; titujt dhe faqet nga tabela e përmbajtjes) |
| Hyrje | **278** (261 `dua` + 17 `rrefim`) |
| Me incizim | **70** hyrje / **71** skedar MP3 (14.6 MB) |
| Kapituj me audio | 15–29: ezani, namazi, dhikri pas namazit, istihare, mëngjes/mbrëmje, gjumi |
| Poshtëshënime | **311** të lidhura, **309** me numrin e tyre në libër (1–330, renditje e njëpasnjëshme) |
| Faqja e librit | për të 132 kapitujt (`page`, 11–142) — lejon verifikim në letër |
| Me `count` > 1 | 35 hyrje (p.sh. ×100, ×33, ×10, ×7, ×3) |
| Koha e ditës | 6 mëngjes · 9 mbrëmje · 1 të dyja · 17 natë · 245 çdo kohë |
| Variante mbrëmjeje | **7**, të nxjerra nga poshtëshënimet e kapitullit 27 |
| Tri suret | të ndara në **9** hyrje (Iḫlãs / Feleḳ / Nãs) në kapitujt 25, 27, 28 |
| Përkthim alternativ | 197 hyrje kanë edhe `albanian_alt` |
| Madhësia e JSON | 375 KB (87 KB me gzip) |

## Ndërtimi nga burimi

Të dy skriptet janë të ripërdorshme; nëse gjen një gabim në të dhëna, rregulloje
në skript dhe rindërto, mos e ndrysho JSON-in me dorë.

```bash
# 1. libri (DOCX zyrtare) → data/libri.json + data/poshteshenimet.json
python3 scripts/parsim_libri.py

# 2. libri + audio e repo-s → data/mburoja.json  (kopjon edhe MP3-të)
python3 scripts/nderto_paketën.py

# 3. verifiko
python3 scripts/valido.py        # exit 0 = të gjitha kontrollet kaluan
```

Kërkon: Python 3.9+, `mutagen` (vetëm për matjen e kohëzgjatjes, jo e detyrueshme),
dhe dosjet `../book/ih_mburoja.docx` e `../repo/`.

## Certifikimi

`scripts/valido_strikt.py` bën shtatë kontrolla. Ky është rezultati i fundit:

```
[1] struktura            278 hyrje në 132 kapituj                       ✅
[2] pastërtia e fushave  asnjë fushë e ndotur, asnjë karakter i ndaluar  ✅
[3] besnikëria ndaj librit
      arabic             261 fusha · 261 të gjendura  (100.0%)          ✅
      transliteration    259 fusha · 259 të gjendura  (100.0%)          ✅
      albanian           259 fusha · 259 të gjendura  (100.0%)          ✅
[4] audio                71 rrugë, 0 që mungojnë                        ✅
[5] tituj / faqe         132/132 tituj, 132/132 faqe                    ✅
[6] mbulimi i fushave    arabic=261 · translit=259 · albanian=259 · lead=65
[7] plotësia             0 vargje të humbura (arabe, transkriptim, shqip) ✅
```

Kontrolli **[3]** vërteton që asgjë nuk është sajuar: çdo rresht i dataset-it
gjendet fjalë-për-fjalë brenda tekstit të librit. Kontrolli **[7]** është e
kundërta e tij dhe është po aq i rëndësishëm: çdo rresht i librit gjendet në
dataset. Pa të dyja, "i vlefshëm" nuk ka kuptim — njëra ndalon tekstin e rremë,
tjetra ndalon tekstin e humbur.

### Çfarë u gjet dhe u rregullua në kalimin nga 1.0.0 në 2.0.0

| Problemi | Sa | Si u rregullua |
|---|---|---|
| **Rrugë audio të vdekura** — dataset-i referonte 13 skedarë që nuk ishin në disk | 13 | 2 u kopjuan nga repo-ja; **11 u bënë `null`** sepse nuk ekzistojnë askund (shih `audio_mungon_arsye`) |
| **Transkriptimi i hedhur te `lead`** — klasifikuesi i quante "tri" dhe "herë" fjalë shqipe, ndaj `(tri herë)` e tërhiqte tërë rreshtin te `lead` | 3 | hapi i numërimit u zhvendos **para** klasifikimit; tani kontrolli [2] e ndalon këtë përgjithmonë |
| **Titulli i ch130 i prerë** — libri e shkruan në dy rreshta, tabela e përmbajtjes kap vetëm të parin | 1 | plotësuar nga koka e kapitullit në trupin e librit |
| **Hyrje e sajuar** — koka e ch130 ishte ndarë në një hyrje më vete, me titullin e bashkuar brenda një citimi që nuk ekziston në libër | 1 | u hoq; përmbajtja shkoi te titulli dhe te `lead` i hyrjes pasuese |
| **Numërim i gabuar** — "dhjetë herë" i ishte ngjitur hyrjes së mëparshme si `count: 10` | 1 | kaluar te hyrja që i përket |
| Transkriptim + shqip të bashkuara në një fushë | 19 | ndarje deterministe me diakritikët e tabelës së librit |
| Shënim numërimi i lënë brenda tekstit | 15 | nxjerrë në `count` dhe `koha_shenim` |
| **Transkriptimi i istiharit i cunguar** — mungonte e gjithë gjysma e parë e kushtëzores dhe udhëzimi “(këtu përmend hallin që ka)” | 1 | rikthyer i plotë nga libri |
| Fushat e këmbyera (rrëfimi te `transliteration`, transkriptimi te `albanian`) | 5 | korrigjuar dorësh, të verifikuara nga libri |
| Faqe të gabuara | 8 | zëvendësuar me numrat nga tabela e përmbajtjes |
| Tri suret të bashkuara në një hyrje | 3 → 9 | ndarë me emrin e secilës sure dhe audio-n përkatëse |
| Dhikri i mbrëmjes mungonte tërësisht | 0 → 7 | nxjerrë nga poshtëshënimet e kapitullit 27 |
| Salavati mbyllës i librit i humbur | 1 | shtuar në `meta.back_matter` |
| Poshtëshënimet pa numër | 311 → 309 me numër | lidhur me renditje monotonike, 0 shkelje |
| Hapësira të pandashme, dy hapësira, backtick, `‹` | 88 | normalizuar |

### Çfarë mbetet — dhe ku është kufiri i vërtetë

Të dhënat tekstuale janë të certifikuara. Kufizimet e mbetura janë **te audio-ja
dhe te vetë libri**, jo te skema:

| Kufizimi | Shtrirja | Pse |
|---|---|---|
| **Origjina e incizimeve e pavërtetuar** | të 71 MP3-të | repo-ja burimore nuk jep atributim; 3 skedarë mbajnë tag-un `TALB=Kalamullah.com`. Është çështje licence — lexo `LICENCA.md` para shpërndarjes publike. |
| **Audio vetëm për kapitujt 15–29** | 118 kapituj pa audio | kështu u kërkua në detyrë; repo-ja nuk ka incizime për të tjerët |
| **11 hyrje brenda 15–29 pa audio** | ch25 ×3, ch26 ×1, ch27 ×3, ch28 ×4 | `invocations.json` i repo-s i referon këta skedarë, por ata **nuk ekzistojnë** në repo. Nuk ka burim tjetër. Të shënuara me `audio_mungon_arsye`. |
| **1 hyrje pa `count`** | ch130 #2 | libri nuk e jep numërimin në këtë vend; `count: null` + `count_mungon_arsye`. Mos e zëvendëso me 1. |
| **4 hyrje pa `albanian`** | ch102 ×2, ch110 ×2, ch113 | libri nuk jep përkthim të veçantë aty; arsyeja është në `albanian_mungon_arsye` |
| **Shqipja e 5 nga 7 variantet e mbrëmjes është e cunguar në vetë librin** | ch27, `varianti: "mbrëmje"` | burimi i tyre janë poshtëshënimet; të shënuara me `i_cunguar_ne_liber: true` |

Aplikacioni duhet t'i trajtojë këto si raste normale, jo si gabime: `count: null`
do të thotë "libri nuk e thotë", `audio: null` do të thotë "nuk ka incizim".

## Çfarë është rregulluar kundrejt `mburoja-api`

Të dhënat origjinale janë në `../repo/invocations.json`. Dallimet:

| Problemi në repo | Numri | Si u zgjidh këtu |
|---|---|---|
| Lutje të vendosura në kapitull të gabuar | 15 | Nuk ndodh — burimi është libri, jo repo-ja |
| Rrugë audio të thyera `/audios/.mp3` | 51 | `audio: null` + `has_audio: false` |
| Skedar audio që mungon | 12 | asnjë nuk referohet; 11 prej tyre kishin mbetur si rrugë të vdekura edhe pas pastrimit — tani janë `null` me arsye të shënuar |
| Audio e lidhur me kapitull të gabuar | 1 | `069_01.mp3` nuk i lidhet më ch99 |
| `\n` literal në tekst | 106 | Të gjitha janë ndërprerje reale |
| Fusha `arabic` me rrëfim shqip brenda | 29 | Rrëfimi është veç, në fushën `lead` |
| Tituj kapitujsh të gabuar | 4 | Titujt janë fjalë-për-fjalë nga libri |
| Tituj të cunguar / të përsëritur | 3 | Po si më sipër |
| `allah` me shkronjë të vogël në tituj | 3 | Po si më sipër |
| Fusha bosh `arabic`/`latin` | 28/29 | Plotësuar nga libri |
| Pa numër përsëritjeje | — | Fusha `count` |
| Pa poshtëshënime / burime të sakta | — | Fusha `notes` (311 të lidhura) |
| Pa numër faqeje të librit | — | Fusha `page` për çdo kapitull |
| Materialet hyrëse të librit të humbura | 4 | `meta.front_matter` me faqet e tyre |

Detajet e plota: `../audit/RAPORTI-AUDITIT.md`.

## Verifikime të kryera

`scripts/valido.py` kontrollon dhe **kalon** për:

- 132 kapituj me ID 1–132 të njëpasnjëshme, pa duplikate
- asnjë `\n` literal në asnjë fushë
- asnjë fushë `arabic` me më shumë se 25 % shkronja latine
- `type` i qëndrueshëm me përmbajtjen; çdo `rrefim` ka tekst për shfaqje
- asnjë rrëfim shqip i lënë në `transliteration`
- çdo skedar audio ekziston në disk, i përket kapitullit të duhur dhe **nuk ndahet**
  mes dy lutjesh
- `has_audio` përputhet me `audio`
- `meta.counts` përputhet me përmbajtjen reale
- asnjë skedar i pareferuar në `audios/`

Për krahasim: i njëjti grup kontrollesh kundër `repo/invocations.json` prodhon
**360 gjetje** (`../audit/gjetjet.csv`).

## Kufizime të njohura

1. **Audio vetëm për kapitujt 15–29**, sipas kërkesës. Repo-ja ka 219 skedarë;
   tregu i plotë është në `../repo/audios/`. Për t'i shtuar të tjerët, ndrysho
   `AUDIO_CHAPTERS` në `scripts/nderto_paketën.py` dhe rindërto.
2. **19 hyrje janë pa tekst arabik** — janë hadithe rrëfyese që libri vetë i jep
   kështu (p.sh. kap. 44, 50, 88, 107, 108). Janë të shënuara me `type: "rrefim"`.
3. **15 hyrje janë pa `transliteration`** — ajete Kurani që libri i jep vetëm me
   përkthim, ose rrëfime.
4. **17 hyrje janë pa `albanian`** — të gjitha `rrefim`; teksti është në `lead`.
5. **10 lidhje audio u bënë me prag të ulët** (0.42–0.60) por me diferencë të
   qartë ndaj kandidatit të dytë. Të gjitha janë raportuar nga skripti dhe
   i verifikova me dorë; `015_01.mp3` p.sh. u konfirmua me kohëzgjatjen (5.2 s
   për `Lā ḥawla wa lā ḳuwwata`).
6. **`albanian_alt` është i pavërtetuar.** Është përkthimi i `mburoja-api`, i cili
   përputhet vetëm 1.9 % me botimin zyrtar — pra është një përkthim i tretë, me
   burim të panjohur. Mos e shfaq si tekst kryesor. Shih `LICENCA.md`.
