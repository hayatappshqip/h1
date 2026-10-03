# Referenca e skemës — `data/mburoja.json`

Versioni 2.1.0 · gjeneruar 2026-10-03

## Struktura e përgjithshme

```
{
  "meta":     { … }        metadata, burimi, numërimet, përshkrimi i fushave
  "chapters": [ { … } ]    132 kapituj, të renditur sipas id 1…132
}
```

## `meta`

| Fusha | Tipi | Shembull / përshkrim |
|---|---|---|
| `name` | string | emri i dataset-it |
| `version` | string | `"1.0.0"` |
| `language` | string | `"sq"` |
| `generated` | string (date) | `"2026-09-30"` |
| `source` | object | botimi zyrtar: titulli, autori, përkthyesi, redaktorët, botuesi, ISBN, URL e DOCX-së |
| `audio_source` | object | origjina e MP3-ve dhe kapitujt e përfshirë |
| `counts` | object | `chapters`, `items`, `items_with_audio`, `audio_files`, `audio_rifreskuar`, `audio_rrefim_i_hoqur`, `footnotes` — të verifikuara nga `scripts/valido.py` |
| `front_matter` | object | faqet e materialeve hyrëse që libri i ka por API-ja origjinale i humbiste: tabela e transkriptimit (f.3), fjala e redaktorit fetar (f.4), hyrja e autorit (f.5), vlera e përmendjes së Allahut (f.7) |
| `schema` | object | përshkrim i shkurtër i çdo fushe (i njëjtë si këtu) |
| `repo_audio_gjendja` | object | sa audio të gjalla/të thyera kishte repo-ja |

### `meta.source`

```json
{
  "title": "Mburoja e Muslimanit (Dhikri i Kuranit dhe Sunetit)",
  "title_original": "حصن المسلم من أذكار الكتاب والسنة",
  "author": "Seid b. Ali b. Vehf El Kahtani",
  "translator": "Azem Bardhoshi",
  "religious_editor": "Ismail Bardhoshi",
  "language_editor": "Ilir E. Haxhiaj",
  "transliteration_by": "Jusuf Kastrati",
  "publisher": "Shembulli, botimi i parë, qershor 2017",
  "isbn": "978-9951-732-07-9",
  "file": "https://d1.islamhouse.com/data/sq/ih_books/single/sq_mburoja_muslimanit.docx"
}
```

## `chapters[]`

| Fusha | Tipi | Përshkrim |
|---|---|---|
| `id` | int | 1–132, i njëpasnjëshëm, pa vrima. Përputhet me numërimin e librit. |
| `title` | string | titulli i kapitullit, fjalë-për-fjalë nga libri, me shkronja të mëdha |
| `page` | int | faqja e librit ku fillon kapitulli (11–142). Lejon çdo përdorues ta verifikojë lutjen në letër. |
| `item_count` | int | sa lutje ka (`items.length`) |
| `audio_count` | int | sa prej tyre kanë incizim |
| `items` | array | lutjet, të renditura si në libër |

> Titulli **nuk** e ka më parashtesën numerike (`"27.DHIKRI…"` në repo). Përdor
> `id` për numërimin — e shmang dyfishimin kur rendit kapitujt.

## `items[]`

| Fusha | Tipi | Null? | Përshkrim |
|---|---|---|---|
| `n` | int | jo | numri i lutjes brenda kapitullit, fillon nga 1 |
| `type` | `"dua"` \| `"rrefim"` | jo | `dua` = ka tekst arabik për t'u lexuar · `rrefim` = hadith ose udhëzim |
| `lead` | string | **po** | rrëfimi/udhëzimi që i prin lutjes, p.sh. `"Kur teshtini, thoni:"` |
| `arabic` | string | **po** | teksti arabik me hareqe. Mund të ketë disa rreshta (suret). |
| `transliteration` | string | **po** | transkriptimi i librit, me diakritikë: `ã ĩ ũ ḥ ḳ ṣ ṭ ḍ ġ ḣ ẓ ‘` |
| `albanian` | string | **po** | përkthimi shqip i botimit zyrtar |
| `albanian_alt` | string | **po** | përkthimi nga `mburoja-api` — **i pavërtetuar**, shih më poshtë |
| `count` | int \| null | **po** | sa herë përsëritet; `1` nëse libri nuk thotë ndryshe. `null` **vetëm** kur libri nuk e jep fare numërimin — atëherë shoqërohet me `count_mungon_arsye`. Mos e zëvendëso me 1. |
| `notes` | string[] | jo | poshtëshënimet e librit (burimet dhe shpjegimet); mund të jetë `[]` |
| `audio` | string | **po** | rruga relative, p.sh. `"audios/027_19.mp3"`, ose `null` |
| `audio_parts` | string[] | **po** | të gjitha MP3-të kur libri bashkon një bllok që repo-ja e kishte ndarë |
| `has_audio` | bool | jo | shkurt për `audio !== null` |

### Rregullat e vlefshmërisë

Këto kontrollohen automatikisht nga `scripts/valido.py`:

- `type === "dua"` **vetëm** kur `arabic` nuk është null (dhe anasjelltas)
- `type === "rrefim"` kërkon që `lead` ose `albanian` të ketë tekst
- asnjë fushë nuk përmban `\n` **literal** — ndërprerjet janë reale
- `arabic` nuk përmban më shumë se 25 % shkronja latine
- nëse `arabic` është null, `transliteration` ose është null ose përmban diakritikë
- `audio` fillon me `audios/<id i kapitullit me 3 shifra>_` — pra një skedar
  nuk mund t'i lidhet një kapitulli tjetër
- **çdo rrugë `audio` ekziston vërtet në disk** — në 2.0.0 kjo kishte hequr 13
  rrugë; në 2.1.0 skedarët u rikthyen në `audios/` dhe tani asnjë rrugë nuk
  mungon. Fusha `audio_mungon_arsye` nuk emetohet më.
- asnjë skedar audio nuk ndahet mes dy lutjesh
- `has_audio === (audio !== null)`
- `count` është numër i plotë 1–1000, **ose** `null` me `count_mungon_arsye` të plotësuar
- çdo kapitull ka `page` (numër faqeje nga libri)
- çdo element i `notes` është string me të paktën 3 karaktere

### Shembull — lutje me audio dhe përsëritje

```json
{
  "n": 19,
  "type": "dua",
  "lead": null,
  "arabic": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.",
  "transliteration": "Subḥãnall-llãhi we biḥamdihi. (njëqind herë)",
  "albanian": "Them shprehjen e lartësimit se Allahu është i dëlirë nga të metat, dhe e falënderoj Atë.",
  "albanian_alt": "I Lartësuar qoftë Allahu dhe Atij i takon falënderimi, njëqind herë në ditë…",
  "count": 100,
  "notes": ["Buhariu dhe Muslimi. Pejgamberi ﷺ ka thënë: “Kush thotë këtë njëqind herë në ditë…"],
  "audio": "audios/027_18.mp3",
  "audio_parts": null,
  "has_audio": true
}
```

### Shembull — një lutje me disa incizime

```json
{
  "n": 6,
  "id": 5,
  "type": "dua",
  "count": 3,
  "audio": "audios/025_05.mp3",
  "audio_parts": ["audios/025_05.mp3", "audios/025_06.mp3", "audios/025_07.mp3"],
  "has_audio": true
}
```

(Fushat tekstuale janë hequr për shkurtësi; vlerat e tjera janë marrë
fjalë-për-fjalë nga `data/mburoja.json`.)

Kur libri e jep një bllok si një lutje të vetme, ndërsa repo-ja ka incizime të
ndara, `audio_parts` i mban të gjithë: `audio` është i pari, pjesët luhen me
radhë — njëri pas tjetrit.

### Shembull — blloku i tri sureve (Iḫlãs + Feleḳ + Nãs)

Libri i jep tri suret si **një** lutje që lexohet tri herë — pas namazit (ch25),
në mëngjes/mbrëmje (ch27) dhe para gjumit (ch28) — dhe paketa e mban po ashtu:
**një hyrje e vetme për kapitull**, me të gjithë tekstin arabik, transkriptimin
dhe përkthimin, plus `count: 3`.

```js
// ch25 #6 → një hyrje e vetme me tri pjesë audio
const surat = doc.chapters.find(c => c.id === 25).items.find(i => i.n === 6);
// audio: "audios/025_05.mp3"   audio_parts: [025_05, 025_06, 025_07]
```

Në ch27 zëri është një skedar i vetëm (`027_03.mp3`, incizimi i bllokut të
plotë); në ch28 po ashtu (`028_01.mp3`). Fushat `sure`, `pjesa` dhe `mbyllje`
u përdorën vetëm në 2.0.0, kur blloku ishte ndarë në tri hyrje; 2.1.0 nuk i
emeton më.

### Shembull — rrëfim pa tekst arabik

```json
{
  "n": 1,
  "type": "rrefim",
  "lead": "Pejgamberi ﷺ ka thënë:\n“Nuk ka rob që, mbasi bën një gjynah…”,
  "arabic": null,
  "transliteration": null,
  "albanian": null,
  "count": 1,
  "notes": ["Tirmidhiu, Ebu Davudi."],
  "audio": null,
  "audio_parts": null,
  "has_audio": false
}
```

Shfaq `lead` si tekst kryesor; mos vizato kutinë e arabikës.

---

## Diakritikët e transkriptimit

Sistemi i librit, i dokumentuar në faqen 4 të botimit:

| Shenja | Kuptimi | | Shenja | Kuptimi |
|---|---|---|---|---|
| `ã` | zanorja `a` e gjatë | | `ḥ` | h e thellë |
| `ĩ` | zanorja `i` e gjatë | | `ḳ` | k e thellë |
| `ũ` | zanorja `u` e gjatë | | `ṣ` | s e thellë |
| `‘a` `‘u` `‘i` `‘ë` | ajn (`ع`) | | `ṭ` | t e thellë |
| `’` | hemze (`ء`) | | `ḍ` | d e thellë |
| | | | `ġ` | g e butë |
| | | | `ẓ` | dh e thellë |

**Rëndësi praktike:** këto nuk janë zbukurim. `ḥ` dhe `h`, ose `ḳ` dhe `k`,
ndryshojnë kuptimin e fjalës arabe. Nëse aplikacioni yt i shfaq, përdor një font
që i përmban (Scheherazade New, Gentium Plus, Noto Sans, Charis SIL). Nëse nuk
i shfaq, përdoruesi humb këtë informacion — prandaj `albanian_alt` e repo-s,
e cila nuk ka **asnjë** prej këtyre shenjave, nuk është e barasvlefshme.

## `albanian_alt` — kujdes

Ky është përkthimi i `mburoja-api`. Verifikimi tregoi se përputhet vetëm
**1.9 %** fjalë-për-fjalë me botimin zyrtar — pra është një përkthim i tretë,
me burim të panjohur dhe pa redaktim. E përfshiva sepse:

- është formulimi që përdoruesit e aplikacioneve shqipe mund ta kenë parë tashmë,
- mund të jetë i dobishëm për krahasim gjatë kontrollit të cilësisë.

**Rekomandim:** shfaqe vetëm si opsion të dytë, pas një veprimi të qartë të
përdoruesit (siç bën `shembull/index.html` me butonin *"shfaq alternativin"*),
dhe kurrë si tekst kryesor.

## Lidhja e audio-s

Incizimet nuk u lidhën sipas renditjes apo ID-së së repo-s, por **sipas
përmbajtjes** — krahasim i tekstit arabik dhe shqip brenda të njëjtit kapitull,
me dy masa:

1. **ngjashmëri e plotë** (`SequenceMatcher`) për rastet 1 për 1,
2. **përmbajtje** kur repo-ja e ka ndarë atë që libri e mban të bashkuar.

Pragu: ≥ 0.60, ose ≥ 0.42 me një diferencë prej të paktën 0.15 ndaj kandidatit
të dytë. 10 lidhje u bënë me këtë prag të ulët dhe të gjitha u raportuan nga
skripti; i verifikova me dorë.

Kjo qasje i bën të parëndësishme defektet e repo-s: 51 rrugët e thyera,
15 lutjet e vendosura gabim dhe 8 duplikatat nuk mund të kontaminojnë rezultatit,
sepse burimi i tekstit është libri, jo repo-ja.

---

# Shtesat e versionit 2.0.0

Ky version është **i certifikuar** nga `scripts/valido_strikt.py` (shih README.md).
Ndryshimet kryesore: çdo hyrje ka një çelës unik, koha e ditës është e nxjerrshme,
poshtëshënimet mbajnë numrin e tyre në libër, dhe tri fushat tekstore janë të ndara
pa përzierje.

## Fushat e reja në `items[]`

| Fusha | Tipi | Kuptimi |
|---|---|---|
| `id` | int | **Çelësi unik brenda kapitullit**, i njëpasnjëshëm nga 1. Përdor këtë për `key` në React/lista, jo `n`. |
| `n` | int | Numri i hyrjes **në libër**. Mund të përsëritet për hyrjet e lidhura (p.sh. varianti i mbrëmjes i të njëjtit dhikër). |
| `time` | str \| null | `mëngjes` · `mbrëmje` · `të dyja` · `natë` · `null` (= çdo kohë). Nxjerrë nga `أَصْبَحْنَا` / `أَمْسَيْنَا` dhe nga shënimet e librit. |
| `sure` | str | **Vetëm 2.0.0** — emri i sures kur blloku i tri sureve ishte i ndarë; 2.1.0 e bashkoi në një hyrje dhe nuk e emeton më. |
| `pjesa` | int | **Vetëm 2.0.0** — pjesa e bllokut të ndarë (1–3 për suret). |
| `mbyllje` | str | **Vetëm 2.0.0** — udhëzimi pas të tri sureve (te pjesa e fundit). |
| `varianti` | str | `"mbrëmje"` — tregon që kjo është varianti i mbrëmjes i një lutjeje mëngjesi. |
| `burimi` | str | Për variantet: nga cili poshtëshënim i librit është nxjerrë. |
| `i_cunguar_ne_liber` | bool | `true` kur **vetë botimi** e jep shqipen të shkurtuar me `…`. Nuk është gabim i nxjerrjes — shih më poshtë. |
| `albanian_mungon_arsye` | str | Pse libri nuk jep përkthim të veçantë për këtë lutje. |
| `count_mungon_arsye` | str | Pse `count` është `null` — libri nuk e jep numërimin në këtë vend. |
| `audio_mungon_arsye` | str | Pse `audio` është `null` ndonëse kapitulli është brenda shtrirjes 15–29: repo-ja burimore e referon skedarin, por ai nuk ekziston. |
| `koha_shenim` | str | Shënimi i kohës i nxjerrë nga kllapa, p.sh. `gdhihemi`, `ngrysemi`. |
| `count_burimi` | str | `"libri (shënim në kllapa)"` kur `count` është nxjerrë nga një shënim i tillë. |

## `notes[]` — tani objekte, jo vargje

```json
"notes": [
  { "nr": 291, "tekst": "Muslimi. [Kur lavdërojmë dikë, duhet të themi dhikrin në arabisht…]" }
]
```

`nr` është **numri i poshtëshënimit në libër** (1–330), pra lexuesi mund ta hapë
librin dhe ta verifikojë. Numrat janë të njëpasnjëshëm në të gjithë dataset-in
(0 shkelje të renditjes) — kjo është edhe një provë që hyrjet janë në rendin e librit.

`nr` është `null` për 2 raste ku teksti i poshtëshënimit nuk u përputh me asnjë
numër; teksti ruhet i plotë sidoqoftë.

## `meta.back_matter`

Pas fjalës “Fund” libri mbyllet me një salavat. Ai nuk bën pjesë në asnjë kapitull,
prandaj është vendosur këtu, me të tri gjuhët.

## `meta.validim` dhe `meta.shkurtimet_e_kohës`

Përmbledhje e asaj që është verifikuar dhe e mënyrës si duhet lexuar `time`.

## Ndarja mëngjes / mbrëmje

As libri dhe as burimet e tjera **nuk** i ndajnë dhikrin e mëngjesit nga ai i
mbrëmjes në kategori të veçanta — kapitulli 27 i përmban të dyja. Dallimi është
i koduar brenda lutjeve:

* libri jep në tekstin kryesor variantin e **mëngjesit** (`أَصْبَحْنَا`);
* variantet e **mbrëmjes** (`أَمْسَيْنَا`) jepen në **poshtëshënime**.

Këto 7 variante janë nxjerrë dhe janë bërë hyrje të plota, të vendosura menjëherë
pas lutjes përkatëse të mëngjesit, me `varianti: "mbrëmje"` dhe `time: "mbrëmje"`.

```
ch27 #5  mëngjes  →  U gdhimë dhe ndërkohë ne jemi në dorë të Allahut…
ch27 #5  mbrëmje  →  U ngrysëm…                       (variant, 2 hyrje)
ch27 #6  të dyja  →  O Allah! U gdhimë duke qenë nën kujdesin Tënd…
ch27 #6  mbrëmje  →  O Allah! U ngrysëm nën kujdesin Tënd…
ch27 #8  mëngjes  →  O Allah! Unë u gdhiva…
ch27 #8  mbrëmje  →  O Allah! Unë u ngrysa…
…
```

Për një aplikacion me dy ekrane të veçanta filtro sipas `time`:

```js
const mëngjesi = ch.items.filter(i => i.time === 'mëngjes' || i.time === 'të dyja' || !i.time);
const mbrëmja  = ch.items.filter(i => i.time === 'mbrëmje'  || i.time === 'të dyja' || !i.time);
```

### Pse disa variante kanë shqipen të cunguar

Gjashtë nga shtatë variantet e mbrëmjes e kanë përkthimin shqip të shkurtuar me `…`
**në vetë botimin** — p.sh. “U ngrysëm…”. Botuesi e bën këtë sepse ndryshimi është
mekanik (“u gdhimë” → “u ngrysëm”) dhe kuptohet nga konteksti.

Kjo paketë **nuk e plotëson** atë tekst, sepse do të thoshte të shtonte fjalë që nuk
janë në libër. Në vend të kësaj ruhet ashtu siç është dhe shënohet me
`i_cunguar_ne_liber: true`, që aplikacioni të mund ta trajtojë siç dëshiron
(p.sh. ta zbehë, ose ta plotësojë vetë me një zëvendësim të shënuar si i tillë).

Vetëm varianti 2 dhe varianti 7 e kanë shqipen të plotë, sepse libri i jep të plota.

---

# Shtesat e versionit 2.1.0

- **Tri suret janë një hyrje e vetme** në ch25, ch27 e ch28 (jo më tri hyrje me
  `sure`/`pjesa`); zëri jepet me `audio_parts` kur incizimi i burimit është i
  ndarë, ose me `audio` kur është një skedar i vetëm.
- **Blloqet e tjera të bashkuara:** ch25 #1 (istigfar + selam) dhe ch27 #2
  (isti'adha + Ajetul Kursi). Të dyja hyrjet kanë një incizim të vetëm që i
  mbulon të plota.
- **Hyrjet e bashkuara** mbajnë `bashkuar_nga: [n1, n2]` — numrat e hyrjeve të
  librit që u bashkuan në një kartë të vetme.
- **13 incizime u rikthyen** në `audios/`; `audio_mungon_arsye` dhe
  `meta.counts.audio_rrefim_i_hoqur` tani janë 0.
- **Numri i hyrjeve: 278 → 270.** Asnjë tekst nuk u hoq — vetëm bashkime.
