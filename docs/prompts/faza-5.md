# Prompti — Faza 5: Përmbajtja dhe Cilësia

> Kjo fazë nuk ka një fund të qartë — është punë e vazhdueshme.
> Merr një detyrë në herë. Çdo detyrë është e pavarur.

---

## Për këtë fazë veçanërisht

Faza 5 prek **përmbajtje fetare**. Rregulli ndryshon:

> **Kodi nuk vendos për përmbajtjen fetare.** Një AI nuk duhet të shkruajë, "plotësojë" ose "përmirësojë" tekstin e një duaje, transliterimin, ose përkthimin. Ajo mund të ndërtojë **mjetet** që e bëjnë këtë punë të mundur dhe të verifikueshme — dhe mund të numërojë boshllëqet. Përmbajtjen e plotëson një njeri i kualifikuar.

Nëse një AI të propozon "unë mund t'i gjeneroj 28 duatë që mungojnë", **ndaloje**. Kjo është mënyra më e shpejtë për të futur përmbajtje të paverifikuar në një aplikacion fetar.

---

```
Ti po punon në repo-n "hayat-app".

LEXO SË PARI:
  - docs/04-rreziqet.md         (R11 — përmbajtja e paverifikuar)
  - docs/06-burimet-e-te-dhenave.md (§4 Mburoja, §8 lista kontrolluese)
  - docs/02-specifikimi.md      (PR-5, FR-4.2)

RREGULLI MË I RËNDËSISHËM:
Ti NUK shkruan, nuk plotëson dhe nuk "përmirëson" përmbajtje fetare.
Ti ndërron MJETE që bëjnë punën e njeriut të mundur dhe të verifikueshme,
dhe TI numëron boshllëqet. Nëse të kërkohet të gjenerosh tekst fetar,
refuzoje dhe shpjego pse.

GJENDJA (verifikoje me: npm run inventory):
  Mburoja: 11 kategori, 133 kapituj, 294 dua
    missingArabic:          28
    missingAlbanian:         1
    missingTransliteration: 29
    missingReference:        5

=====================================================================
DETYRA 5.1 — Test roje që numëron boshllëqet
=====================================================================
Krijo src/tests/mburojaDataIntegrity.test.ts që:
  a) importon MBUROJA_CHAPTERS nga src/data/mburojaData.ts;
  b) numëron boshllëqet për secilën fushë (ar, sq, transliteration, reference);
  c) DËSHTON nëse numri është MË I MADH se një prag i vendosur në një
     objekt BASELINE në krye të testit, me vlerat aktuale:
       missingArabic: 28, missingAlbanian: 1,
       missingTransliteration: 29, missingReference: 5
  d) KALON dhe shkruan një raport nëse numri u UL (dhe përditëson
     BASELINE-in, me një koment që thotë kush e bëri dhe kur).

Kjo do të thotë: boshllëqet mund të pakësohen, por nuk mund të rriten
pa u vënë re.

KRITERI: testi kalon me vlerat aktuale; nëse shtohet një dua pa arabisht,
testi dështon.

=====================================================================
DETYRA 5.2 — Mjet redaktimi për përmbajtjen
=====================================================================
Krijo një skript `npm run edit:mburoja` (scripts/mburojaEditor.mjs) që:
  a) liston çdo dua me boshllëqe, me kapitullin dhe ID-në;
  b) hap skedarin në vendin e duhur (me --open);
  c) pranon një skedar "patches" JSON me formatin:
     [{ "chapter": 1, "dua": 4, "field": "transliteration", "value": "..." }]
     dhe e aplikon, duke ruajtur formatimin ekzistues;
  d) pas çdo aplikimi, ekzekuton testin e integritetit dhe SHA-256 të
     skedarit, dhe shkruan rezultatin në docs/06-burimet-e-te-dhenave.md.

Ky mjet ekziston që një redaktor njeri të mund të punojë shpejt dhe pa
rrezikuar strukturën e skedarit.

=====================================================================
DETYRA 5.3 — Etiketim i përmbajtjes së paverifikuar në UI
=====================================================================
Në MburojaView.tsx:
  a) Nëse një dua nuk ka `reference`, shfaq një etiketë:
     "Pa referencë të verifikuar" me një ikonë informative (jo paralajmëruese).
  b) Nëse nuk ka tekst arabik, mos shfaq një hapësirë bosh — shfaq vetëm
     përkthimin, me të njëjtën etiketë.
  c) Shto një filtër "Vetëm me referencë" për përdoruesin që dëshiron
     burime të verifikuara.

KËRKESË: etiketa nuk duhet të tingëllojë si gabim. Këto janë dua të
vërteta me një mangësi dokumentimi — jo përmbajtje e dyshimtë.

=====================================================================
DETYRA 5.4 — Kalendar hixhri i mirëfilltë
=====================================================================
Gjendja: src/components/FastingTracker.tsx rreshtat 37–42 përdor
new Intl.DateTimeFormat('en-u-ca-islamic', { day: 'numeric' }) vetëm për
të gjetur Ditët e Bardha. Nuk ka datim hixhri të plotë askund.

BËJ:
a) Krijo src/core/calendar/hijri.ts me:
   - toHijri(date): kthen { year, month, monthNameSq, day }
   - fromHijri(y, m, d): kthen Date
   - Përdor algoritmin tabular si bazë (i përcaktueshëm, funksionon offline)
     me një opsion për korrigjim manual ±2 ditë.
b) Shfaq datën hixhri në kreun e ekranit Kreu, pranë datës gregoriane.
c) Shto në Cilësime rregullimin ±2 ditë me shpjegim: "Muaji hixhri varet
   nga shikimi i hënës. Rregulloje sipas vendit tënd."
d) Shto ngjarjet kryesore: Ramazani, Fitër Bajrami, Kurban Bajrami, Ashure,
   Nata e Kadrit, Nata e Beratit — si DATË LLOGARITËSE me shënim që
   varen nga shikimi i hënës.

KRITERI:
  - Test: data 2026-01-01 kthen një datë hixhri të pritshme.
  - Test: korrigjimi +1 ditë e zhvendos rezultatin saktësisht një ditë.
  - Asnjë thirrje rrjeti.

=====================================================================
DETYRA 5.5 — Namaz i lënë (kaza) dhe borxhi i namazeve
=====================================================================
Gjendja: PrayerLog në src/types.ts ka vetëm `completed: boolean`.
Nuk ka dallim mes namazit në kohë, të vonuar, dhe të lënë.

BËJ:
a) Zgjero PrayerLog me `status: 'onTime' | 'late' | 'qada' | 'missed'`.
b) Migro regjistrat ekzistuese: completed=true → 'onTime'.
c) Shto një pamje "Borxhi i namazeve" me numrin total dhe një plan
   shlyerjeje (p.sh. 1 kaza pas çdo namazi të rregullt).
d) KËRKESË E DIZAJNIT (personi P4): asnjë numër i kuq, asnjë fjalë
   "dështim", asnjë krahasim me të tjerët. Mesazhi: "Çdo namaz i falur
   është përpara."

=====================================================================
DETYRA 5.6 — i18n (pa ndryshuar gjuhën e parë)
=====================================================================
Gjendja: tekstet shqip janë hardcoded brenda JSX. grep i18n → asnjë librari.

BËJ:
a) Krijo src/core/i18n/sq.json me të gjitha tekstet e ndërfaqes, të
   organizuara sipas modulit (prayer.*, quran.*, hifz.*, mburoja.*, ...).
b) Krijo src/core/i18n/index.ts me një hook `useT()` të thjeshtë —
   MOS shto librari të rëndë (i18next është i tepërt për një gjuhë).
c) Zëvendëso tekstet NJË MODUL NË HERË. Pas çdo moduli: npm test.
d) Mos shto gjuhë të dytë ende. Qëllimi i kësaj detyre është nxjerrja
   e teksteve, jo përkthimi.

KRITERI: një modul i plotë (fillo me Namazi) pa asnjë string shqip
të shkruar direkt në JSX.

=====================================================================
DETYRA 5.7 — Qasje (accessibility)
=====================================================================
BËJ:
a) Shto axe-core si dev dependency dhe një test që skanon çdo pamje
   kryesore për shkelje kritike.
b) Rregullo: etiketat ARIA për butonat e numërimit të dhikrit,
   rolet për navigimin, fokusin e dukshëm, dhe kontrastin WCAG AA.
c) Respekto prefers-reduced-motion — fik animacionet.
d) Kontrollo që madhësia e shkrimit (ekziston: 4 shkallë) nuk e prish
   pamjen e mushaf-it.

KRITERI: axe-core → 0 shkelje kritike në 5 pamjet kryesore.

=====================================================================
DETYRA 5.8 — Moduli i Ramazanit
=====================================================================
Kjo është detyra më e madhe e Fazës 5. Bëje vetëm pasi 5.4 (kalendari
hixhri) është bërë — pa të, nuk mund të dish kur fillon Ramazani.

Përfshin: Teravi (gjurmues ditor), Iftar (koha, me njoftim), synime
ditore, gjurmues sadakaje, dhe lexim i planifikuar për hatme 30-ditore.

KËRKESË E DIZAJNIT: Ramazani nuk duhet të marrë kontrollin e aplikacionit.
Është një modalitet që aktivizohet, jo një rishkrim i ekranit kryesor.

=====================================================================
PAS ÇDO DETYRE
=====================================================================
Shfaq: npm run lint, npm test, npm run inventory.
Raporto çfarë u verifikua me komandë dhe cila ishte dalja.
Për përmbajtje fetare: thuaj qartë se çfarë plotësoi NJERIU dhe çfarë
mbetet — mos e numëro si të bërë punën që kërkon redaktor.
```

---

## Verifikimi yt

```bash
npm run inventory | sed -n '/MBUROJA/,/^$/p'   # boshllëqet: nuk duhet të rriten
npm test 2>&1 | grep -i "mburoja\|hijri\|axe"  # testet e reja ekzistojnë
npm test 2>&1 | tail -5
```
