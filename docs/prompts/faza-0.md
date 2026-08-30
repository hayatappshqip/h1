# Prompti — Faza 0: Saktësia dhe Pastërtia

> **Kopjo gjithçka brenda kutisë më poshtë dhe ngjite si mesazhin e parë te AI-ja.**
> Kohëzgjatje e pritshme: ~1 javë. Bllokon: gjithçka tjetër.

---

```
Ti po punon në repo-n ekzistuese "hayat-app" (Hayat – Jeta Islame), një PWA
local-first për muslimanët shqipfolës. React 19 + Vite 6 + TypeScript + Tailwind 4
+ Dexie. Ka 28 060 rreshta kodi burimor dhe 155 teste që kalojnë.

LEXO SË PARI këta skedarë dhe konfirmo që i ke lexuar:
  - docs/01-gjendja-aktuale.md
  - docs/04-rreziqet.md  (rreziqet R1 dhe R9)
  - docs/05-roadmap.md   (vetëm seksioni "Faza 0")

Misioni i kësaj faze: aplikacioni nuk duhet të gënjejë më për kohët e namazit,
dhe repo-ja nuk duhet të gënjejë më për veten.

=====================================================================
RREGULLA TË PANEKSOCUESHME
=====================================================================
1. Nuk je duke filluar nga zero. Mos propozo rishkrim.
2. Para çdo commit-i ekzekuto: npm run lint && npm test && npm run build.
   Të treja duhet të kalojnë. Nëse testet që kalojnë bien nën 155, NDALO
   dhe raporto — mos vazhdo.
3. Mos i prek: src/components/quran/mushaf/, src/services/hifzScheduler.ts,
   src/tests/quranChunkedValidation.test.ts, public/quran-corpus-v2-chunked/.
4. Një detyrë në herë, një commit për detyrë, mesazhi i commit-it në shqip
   dhe duke filluar me ID-në (p.sh. "F0.2: heq rregullin imsak = fajr - 10").
5. Mos shto dependenci përveç `adhan` (lejuar, MIT).

=====================================================================
DETYRA 0.1 — Hiq oraret e shkruara përmendësh
=====================================================================
Në src/services/prayerEngine.ts, funksioni getFallbackPrayerTimes()
(rreth rreshtave 70–95) kthen vlera fikse: Sabah 04:15, Yleja 05:45,
Dreka 12:45, Ikindia 16:30 ose 17:10, Akshami 19:45, Jacia 21:15.
Këto janë të njëjta për çdo datë të vitit — pra në janar dhe në korrik
jep të njëjtat orë. Kjo është e rreme dhe e rrezikshme.

BËJ:
a) Shto dependencën `adhan` (npm, MIT, batoulapps/adhan-js).
b) Krijo src/services/timings/localCalculation.ts që llogarit oraret me
   adhan: Coordinates, CalculationParameters, PrayerTimes, Madhab.
   Mbështet metodat: MuslimWorldLeague, Egyptian, Karachi, UmmAlQura,
   Dubai, MoonsightingCommittee, NorthAmerica, Kuwait, Qatar,
   Singapore, Turkey, dhe CalculationMethod.Other() me kënde vetjake.
c) Zëvendëso getFallbackPrayerTimes() me këtë llogaritje. Ruaj aplikimin
   e manualAdjustments dhe normalizimin e Imsak-ut.
d) Ruaj nënshkrimin e funksionit getPrayerTimes(dateStr, settings) — asnjë
   thirrës nuk duhet të ndryshojë në këtë detyrë.
e) Kur përdoret llogaritja lokale, shto në objektin e kthyer një fushë
   `source: 'local-calculation'`. Kur vjen nga API: `source: 'aladhan-api'`.
   Përditëso tipin PrayerTimes në src/types.ts me `source?`.

KRITERI I PRANIMIT:
  - Oraret për Tiranë më 2026-01-15 dhe 2026-07-15 janë TË NDRYSHME
    (tani janë identike).
  - Shto një test në src/tests/localCalculation.test.ts që e vërteton këtë.

=====================================================================
DETYRA 0.2 — Imsaku nuk nxirret me zbritje fikse
=====================================================================
Këto tri rreshta vendosin imsakun 10 minuta para Sabahut:
  src/services/prayerEngine.ts:77   const imsakMins = fajrMins - 10;
  src/services/prayerEngine.ts:109  parsed.imsak = minutesToTime(timeToMinutes(parsed.fajr) - 10);
  src/services/prayerEngine.ts:129  imsak = minutesToTime(timeToMinutes(fajr) - 10);

Kjo bie ndesh me praktikën zyrtare vendore: Bashkësia Islame e Kosovës
e fillon Sabahun 20 minuta PAS Imsakut (diferencë Imsak→Sabah = 20 min),
me temkin 1.5° ≈ 6 min. Diferenca praktike është e rendit 30 minuta në
kohën e ndalimit të ngrënies — pra prek vlefshmërinë e agjërimit.

BËJ:
a) Hiq të tria zbritjet fikse.
b) Imsaku merret nga burimi (API-ja e kthen fushën Imsak). Nëse mungon,
   llogaritet me këndin e imsakut të metodës (zakonisht Fajr − 10 min
   SI KËND, jo si zbritje e Sabahut të rregulluar) dhe shënohet si i
   përafërt.
c) Shto në PrayerSettings një fushë opsionele `imsakOffsetMinutes?: number`
   që përdoruesi mund ta rregullojë, me vlerë fillestare 10.
d) Shto `source` dhe `isApproximate: boolean` në PrayerTimes.

KRITERI I PRANIMIT:
  grep -n "fajrMins - 10\|fajr) - 10" src/services/prayerEngine.ts
  → 0 rezultate.
  Test i ri që vërteton se Imsaku ndryshon kur ndryshon këndi i metodës.

=====================================================================
DETYRA 0.3 — Banderolë kur oraret nuk janë zyrtare
=====================================================================
Në src/components/NamaziView.tsx dhe src/components/HomeView.tsx, kur
prayerTimes.isApproximate === true ose prayerTimes.source !== 'official',
shfaq një banderolë të dukshme:

  ⚠️ Kohë e llogaritur astronomikisht. Kontrolloje me takvimin e xhamisë
     së vendit tënd. [Rregullo]

Banderola duhet të ketë kontrast WCAG AA dhe një buton që hap Cilësimet.

KRITERI I PRANIMIT: test i ri që monton NamaziView me isApproximate=true
dhe e gjen banderolën; dhe me isApproximate=false dhe nuk e gjen.

=====================================================================
DETYRA 0.4 — Zhduk drift-in e versionit të service worker-it
=====================================================================
Gjendja: service-worker.js ka CACHE_VERSION = 'v44', ndërsa src/App.tsx
ka komentin "Register Service Worker v45" dhe console.log me "v45".

BËJ:
a) Shto një skript node scripts/build-sw.mjs që lexon versionin nga
   package.json dhe gjeneron service-worker.js me CACHE_VERSION të
   vendosur nga ai version (p.sh. 1.0.0 → 'v1.0.0').
b) Ruaj service-worker.js si template (service-worker.template.js) dhe
   shto skedarin e gjeneruar në .gitignore.
c) Përditëso package.json: "build" të ekzekutojë build-sw.mjs para vite build.
d) Përditëso src/App.tsx që ta lexojë versionin nga një konstante e
   gjeneruar (src/version.ts) në vend të string-ut të shkruar.

KRITERI I PRANIMIT: npm run inventory → drift.serviceWorkerCacheVersion
përputhet me drift.appTSServiceWorkerComment.

=====================================================================
DETYRA 0.5 — Një manifest i vetëm
=====================================================================
Ekzistojnë tre manifestë:
  manifest.json                545 B  (sha c4b8b121f60f)
  public/manifest.json         545 B  (sha c4b8b121f60f — identik)
  public/manifest.webmanifest  480 B  (sha 2f67b7e58b49 — I NDRYSHËM, i pavërejtur)

index.html lidh ./manifest.json.

BËJ: fshi manifest.json në rrënjë dhe public/manifest.webmanifest.
Mbaj vetëm public/manifest.json. Verifiko që index.html vazhdon të
funksionojë dhe që service-worker.js e gjen /manifest.json.

KRITERI I PRANIMIT: ls public/manifest* → një skedar i vetëm.
npm test kalon. PWA install-ohet (verifiko me DevTools → Application → Manifest).

=====================================================================
DETYRA 0.6 — README dhe .env.example të ndershme
=====================================================================
README.md aktualisht është README e Google AI Studio dhe flet për
GEMINI_API_KEY. Por grep -rn "@google/genai|GoogleGenAI|GEMINI" src server.ts netlify/
kthen 0 rezultate — kodi nuk e përdor askund.

BËJ:
a) Rishkruaj README.md për produktin: çfarë është, modulet, si ekzekutohet
   (npm ci / npm run dev / npm test / npm run build / npm run inventory),
   struktura e repo-s, dhe lidhje te docs/.
b) Hiq GEMINI_API_KEY nga .env.example.
c) Shto LICENSE në rrënjë (propozim: AGPL-3.0 për kodin; shëno qartë që
   përmbajtja fetare ka licenca të veçanta — shih docs/06-burimet-e-te-dhenave.md).

KRITERI I PRANIMIT: README përshkruan Hayat-in, jo Google AI Studio.

=====================================================================
DETYRA 0.7 — Hiq dependencat e papërdorura
=====================================================================
Këto 5 dependenci runtime kanë 0 referenca në src/, server.ts dhe netlify/:
  @google/genai, dotenv, motion, page-flip, pdfjs-dist

BËJ: hiqi nga package.json. Ekzekuto npm install për të përditësuar lockfile.
Verifiko që build-i kalon.

KËRKESË: para se t'i heqësh, ekzekuto vetë grep për secilën dhe shfaq
rezultatin. Nëse gjen qoftë edhe një referencë, mos e hiq — raportoje.

KRITERI I PRANIMIT: npm run inventory → drift.unusedRuntimeDependencies: []

=====================================================================
DETYRA 0.8 — Test i saktësisë së orareve
=====================================================================
Krijo src/tests/prayerTimesAccuracy.test.ts që:
a) Llogarit oraret për 3 qytete (Tiranë 41.3275/19.8187, Prishtinë
   42.6629/21.1655, Shkup 41.9981/21.4254) për 12 data të shpërndara
   gjatë vitit (15-i i çdo muaji), me metodën Diyanet (Fajr 18°, Isha 17°).
b) Krahason me vlera të pavarura që i vendos ti në test si tabela e
   pritshmërive, me tolerancë ±2 minuta.
c) Verifikon që Imsaku është gjithmonë para Sabahut dhe Jacia pas Akshamit,
   për të gjitha 36 kombinimet.
d) Verifikon që oraret ndryshojnë mes janarit dhe korrikut për çdo qytet.

KËRKESË E RËNDËSISHME: vlerat e pritshmërive duhet t'i gjenerosh me një
burim të pavarur (p.sh. AlAdhan API për të njëjtat koordinata dhe metodë),
JO me të njëjtin kod që po teston. Shkruaj në një koment në krye të testit
se si i ke marrë.

KËRKESË E DYTË: nëse një vlerë nuk përputhet, mos e "rregullo" pritshmërinë
që testi të kalojë. Raporto mospërputhjen.

KRITERI I PRANIMIT: npm test → 155 + testet e reja, të gjitha kalojnë.

=====================================================================
PAS PËRFUNDIMIT TË FAZËS 0
=====================================================================
Ekzekuto dhe shfaq daljen e plotë të:
  npm run lint
  npm test
  npm run build
  npm run inventory

Pastaj shkruaj një raport të shkurtër me këtë strukturë:
  - Për çdo detyrë 0.1 … 0.8: e bërë / pjesërisht / jo, dhe pse.
  - Cilat pohime i verifikove me komandë dhe cila ishte dalja.
  - Çfarë NUK munde ta verifikosh dhe pse.
  - Numri i testeve që kalojnë, para dhe pas.

NËSE diçka nuk mund ta verifikosh, thuaje hapur. Mos e paraqit si të bërë.
```

---

## Verifikimi yt (pasi AI-ja të thotë se mbaroi)

```bash
grep -n "fajrMins - 10\|fajr) - 10" src/services/prayerEngine.ts   # duhet: 0 rezultate
grep -n "getFallbackPrayerTimes" src/services/prayerEngine.ts      # duhet: hequr ose zëvendësuar
ls public/manifest*                                                # duhet: 1 skedar
npm run inventory | grep -A2 "unusedRuntimeDependencies"           # duhet: (asnjë)
npm test 2>&1 | tail -5                                            # duhet: 180+ teste që kalojnë
npm run build 2>&1 | tail -5                                       # duhet: ✓ built
```

Nëse ndonjëra dështon, faza nuk ka mbaruar — pavarësisht se çfarë thotë AI-ja.
