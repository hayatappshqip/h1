# 05 — Plani Hap-pas-Hapi (Roadmap)

> Rregulli: **një fazë në herë.** Asnjë fazë nuk fillon pa kaluar kriteret e pranimi të së mëparshmes.
> Kohëzgjatjet janë vlerësime për një zhvillues të vetëm me ndihmë AI.

```
Faza 0 ── Saktësia dhe pastërtia              ~1 javë      🔴 e detyrueshme para çdo gjëje
Faza 1 ── Offline i vërtetë + ligjore         ~2 javë      🔴 e detyrueshme para botimit
Faza 2 ── Themeli teknik + performanca        ~2–3 javë    🟠 shumë e rekomanduar
Faza 3 ── Llogari & sinkronizim (opsional)    ~3–4 javë    🟡 vendim produkti
Faza 4 ── Capacitor + push notifications      ~2–3 javë    🔴 e detyrueshme për dyqane
Faza 5 ── Përmbajtja dhe cilësia              ~vazhdimisht 🟠
Faza 6 ── Veçori të avancuara                 ~sipas rastit 🟢
```

---

## Faza 0 — Saktësia dhe pastërtia (🔴 ~1 javë)

**Qëllimi:** aplikacioni nuk gënjen më për kohët e namazit, dhe repo-ja nuk gënjen më për veten.

**Trajton:** R1, T5, T6, T7, T8 · **FR:** FR-1.3, FR-1.4

| # | Detyra | Kriteri i pranimit |
|---|---|---|
| 0.1 | **Hiq** `getFallbackPrayerTimes()` me vlera statike nga `src/services/prayerEngine.ts:70-95` dhe zëvendësoje me llogaritje lokale me `adhan` (MIT, npm) | Kur rrjeti është i shkëputur, oraret për Tiranë më 15 janar dhe 15 korrik **ndryshojnë** (tani janë identike) |
| 0.2 | **Hiq** rregullin `imsak = fajr − 10` nga rreshtat 77, 109, 129. Imsaku vjen nga burimi; nëse burimi nuk e jep, llogaritet me këndin e metodës, jo me zbritje fikse | `grep -n "fajrMins - 10\|fajr) - 10" src/services/prayerEngine.ts` → **0 rezultate** |
| 0.3 | **Banderolë e dukshme** kur burimi nuk është zyrtar: "Kohë e llogaritur — kontrollo takvimin e xhamisë" | Ekrani i Namazit e tregon kur `method` nuk ka burim zyrtar |
| 0.4 | **Zhduku drift-in e versioneve**: versioni i cache-it gjenerohet nga `package.json` në build, jo shkruhet dy herë | `npm run inventory` → `drift.serviceWorkerCacheVersion === drift.appTSServiceWorkerComment` |
| 0.5 | **Një manifest i vetëm.** Fshi `public/manifest.webmanifest` (480 B, i ndryshëm, i pavërejtur) dhe njërin nga dy `manifest.json` identikë | `ls public/manifest*` → një skedar; `npm test` kalon |
| 0.6 | **Rishkruaj `README.md`** për produktin (jo për Google AI Studio). Hiq `GEMINI_API_KEY` nga `.env.example` (0 referenca në kod) | README përshkruan Hayat-in; `grep GEMINI` → vetëm nëse përdoret |
| 0.7 | **Hiq dependencat e papërdorura**: `@google/genai`, `dotenv`, `motion`, `page-flip`, `pdfjs-dist` | `npm run inventory` → `drift.unusedRuntimeDependencies: []` |
| 0.8 | **Test i ri** që krahason oraret e llogaritura me një burim të pavarur për 365 ditë × 3 qytete, me tolerancë ±2 min | `npm test` → 156+ teste që kalojnë |

**Ndalo këtu nëse:** numri i testeve që kalojnë bie nën 155.

📄 Prompti: [`prompts/faza-0.md`](./prompts/faza-0.md)

---

## Faza 1 — Offline i vërtetë + baza ligjore (🔴 ~2 javë)

**Qëllimi:** aplikacioni mbijeton në iOS dhe mund të botohet ligjërisht.

**Trajton:** R3, R4, G1 (pjesërisht) · **FR:** FR-0.2, FR-1.2, FR-1.11

| # | Detyra | Kriteri i pranimit |
|---|---|---|
| 1.1 | Kërko **ruajtje të përhershme**: `navigator.storage.persist()` në nisje + tregues në Cilësime | Cilësimet tregojnë "Ruajtja e përhershme: ✅/❌" |
| 1.2 | **Tregues i hapësirës**: `navigator.storage.estimate()` → "Hayat përdor X MB" | Vlerë e dukshme në Cilësime |
| 1.3 | **Zgjedhje vendndodhjeje me 3 mënyra**: GPS, kërkim qyteti (dataset lokal, jo API), koordinata manuale | Përdoruesi në Berlin merr oraret e Berlinit pa rrjet |
| 1.4 | **Dataset qytetesh lokal** (≥ 3 000 qytete evropiane + SHBA) si JSON i ngjeshur në repo, me emra shqip ku ekzistojnë | Kërkimi "Mynih" dhe "München" gjen të njëjtin qytet offline |
| 1.5 | **Rregull për gjerësi të larta** (mbi 48°): zgjedhje e metodës (kënd / 1/7 natës / profili i vendit) + shpjegim në UI | Në Oslo (59.9° N) Isha nuk del kurrë si "00:00" ose bosh |
| 1.6 | **Takvim zyrtar vendor** si JSON lokal: KMSH, BIK, RSM — me metadata (burimi, URL, vit, metodologji, licensë) | Test: 365 ditë × qyteti përputhen me takvimin zyrtar |
| 1.7 | **Privacy Policy** + **Terms of Use** + skedar `LICENSE` | Të tre ekzistojnë në repo dhe lidhen nga Cilësimet |
| 1.8 | **Deklaratë e Quran Foundation** në Privacy Policy ("aplikacion i pavarur, jo zyrtar") + kërkesë për kredenciale | Dokumenti ekziston; kërkesa dërguar |
| 1.9 | **Kujtesë për backup**: nëse kalon 30 ditë pa backup, shfaq njoftim të butë (jo alarmues) | Shfaqet një herë, me buton "Mos më kujto" |
| 1.10 | **Verifiko plotësinë e backup-it JSON**: a përfshin të gjitha tabelat e Dexie-t **dhe** 3 çelësat e `localStorage`-it? | Test: export → fshi bazën → import → gjithçka kthehet |

📄 Prompti: [`prompts/faza-1.md`](./prompts/faza-1.md)

---

## Faza 2 — Themeli teknik dhe performanca (🟠 ~2–3 javë)

**Qëllimi:** kodi bëhet i ndryshueshëm pa frikë, dhe app-i hapet shpejt.

**Trajton:** R10, R5, T1–T4 · **NFR:** NFR-1, NFR-2

| # | Detyra | Kriteri i pranimit |
|---|---|---|
| 2.1 | Krijo `src/core/db/repository.ts` që **mbështjell** funksionet ekzistuese pa i ndryshuar | 180 teste kalojnë pa ndryshim |
| 2.2 | Zhvendos **Mburoja** te `src/features/mburoja/` me `useMburoja()` | Testet e Mburojës kalojnë; `App.tsx` humb 5 handler-a |
| 2.3 | Përsërit për: `prayer`, `daily`, `hifz`, `quran` — **një në herë** | Pas çdo hapi: `npm test` kalon |
| 2.4 | Në fund, `App.tsx` mbetet guaskë (< 150 rreshta) | `wc -l src/App.tsx` < 150 |
| 2.5 | **Kalo gjithçka në IndexedDB**: 3 çelësat `localStorage` (`hayat_fav_chapters`, `hayat_mushaf_theme`, `hayat_quran_reading_state`) + çelësat e dyfishtë të khatam-it | `npm run inventory` → `storage.localStorageKeys: []` |
| 2.6 | **Code-splitting**: `manualChunks` për `react`, `recharts`, `mushaf`; `React.lazy` për Hifz, Mburoja, KhatamTracker | JS fillestar < 250 kB gzip (nga 394 kB) |
| 2.7 | **Hiq `path`/`fs`** nga `src/services/quranCorpusStore.ts` | Build pa paralajmërimin "externalized for browser compatibility" |
| 2.8 | **Qëndrueshmëri e host-eve**: çdo thirrje e jashtme ka afat kohor 8 s, riprovim 1× dhe gjendje bosh të hijshme | Fik një host → ekrani tregon mesazh, jo ekran të bardhë |
| 2.9 | **Playwright E2E**: instalim PWA, regjistrim namazi offline, hatme, backup/restore | 4 skenarë kalojnë në CI |
| 2.10 | **CI** (GitHub Actions): `lint` + `test` + `build` + `inventory --json` në çdo PR | Badge i gjelbër; PR nuk bashkohet me CI të kuq |

📄 Prompti: [`prompts/faza-2.md`](./prompts/faza-2.md)

---

## Faza 3 — Llogari dhe sinkronizim opsional (🟡 ~3–4 javë)

> **Vendim produkti që duhet marrë para se të fillojë.** Nëse përgjigja është "jo tani", kalo te Faza 4.

**Trajton:** R6, G5 · **FR:** FR-6.1 … FR-6.5

| # | Detyra | Kriteri i pranimit |
|---|---|---|
| 3.1 | Shto fushat e sinkronizimit (`updatedAt`, `deviceId`, `deleted`) në çdo regjistër | Migrim Dexie v3+ që nuk humb të dhëna ekzistuese |
| 3.2 | Krijo tabelat lokale `outbox` dhe `conflicts` | Çdo shkrim shfaqet në outbox |
| 3.3 | Supabase: `profiles` + `records` + **RLS** | Test: përdoruesi A **nuk** lexon regjistrat e B (test me dy token-a) |
| 3.4 | `SyncEngine`: dërgo outbox kur kthehet rrjeti + çdo 15 min | Fik rrjetin, bëj 5 ndryshime, ndize → të gjitha sinkronizohen |
| 3.5 | Zgjidhje konfliktesh: last-write-wins me `updatedAt`; të pazgjidhshmet shfaqen | Dy pajisje ndryshojnë të njëjtin regjistër → përdoruesi e sheh konfliktin |
| 3.6 | Hyrje me magic-link (pa fjalëkalim) + Apple/Google | Hyrja bëhet në ≤ 3 hapa |
| 3.7 | **Fshirje e llogarisë** me konfirmim me email dhe fshirje brenda 30 ditësh | Test automatik |
| 3.8 | **Modaliteti pa llogari mbetet i plotë** | Aplikacioni 100 % funksional pa hyrë kurrë |
| 3.9 | Privacy Policy e përditësuar + banner konsenti (vetëm kur aktivizon sinkronizimin) | Asnjë e dhënë nuk del nga pajisja para konsentit |

📄 Prompti: [`prompts/faza-3.md`](./prompts/faza-3.md)

---

## Faza 4 — Capacitor dhe push notifications (🔴 ~2–3 javë për dyqane)

**Trajton:** R2 · **FR:** FR-1.6, G11

| # | Detyra | Kriteri i pranimit |
|---|---|---|
| 4.1 | Shto Capacitor në të njëjtin projekt (pa degëzim kodi) | `npm run build` prodhon PWA **dhe** binarët |
| 4.2 | `@capacitor/local-notifications` — planifiko 7 ditë orare në çdo hapje | Mbyll app-in plotësisht → njoftimi për Sabah arrin |
| 4.3 | Rifresko planin sa herë hapet app-i ose ndryshon vendndodhja/metoda | Ndrysho qytetin → oraret e reja planifikohen |
| 4.4 | Trajto lejen e njoftimeve në iOS (kërkesë e vetme, shpjegim përpara) | Ekran udhëzues para kërkesës së sistemit |
| 4.5 | Ikona, splash, emri i app-it, `display: standalone`, safe-area | Ekrani nuk futet nën notch |
| 4.6 | **Widget Android** me orarin e ditës | Widget funksional |
| 4.7 | Shkurtore e shpejtë: "Regjistro namazin e fundit" nga ikona | Funksionon në iOS dhe Android |
| 4.8 | Privacy Policy për dyqanet + Privacy Nutrition Labels (Apple) + Data Safety (Google) | Të plotësuar dhe të qëndrueshëm me kodin |
| 4.9 | Testim në pajisje reale: iOS 16+, Android 10+ | Matricë testimi e plotësuar |

📄 Prompti: [`prompts/faza-4.md`](./prompts/faza-4.md)

---

## Faza 5 — Përmbajtja dhe cilësia (🟠 vazhdimisht)

**Trajton:** R11 · **FR:** FR-4.2, G6, G9, G10

| # | Detyra | Kriteri i pranimit |
|---|---|---|
| 5.1 | Plotëso **28 dua pa tekst arabik** dhe **1 pa shqip** | `npm run inventory` → `missingArabic: 0` |
| 5.2 | Plotëso **29 pa transliterim** | `missingTransliteration: 0` |
| 5.3 | Plotëso **5 pa referencë** ose shënoji si "pa referencë" në UI | `missingReference: 0` ose etiketë e dukshme |
| 5.4 | **Test roje**: numëron boshllëqet dhe dështon nëse rriten | CI dështon nëse shtohet një dua pa arabisht |
| 5.5 | **Kalendar hixhri i mirëfilltë** (jo vetëm `Intl`) me korrigjim ±2 ditë | Data hixhri shfaqet në kre; përputhet me takvimin zyrtar |
| 5.6 | Namaz i lënë → **listë borxhi** me plan shlyerjeje | `PrayerLog` mban gjendje `onTime`/`late`/`qada` |
| 5.7 | **Modul Ramazani**: Teravi, iftar, synime ditore, sadaka | Funksional 30 ditë para Ramazanit |
| 5.8 | **i18n**: nxirr tekstet nga JSX në `core/i18n/sq.json` | Ndryshimi i gjuhës nuk kërkon ndryshim komponentësh |
| 5.9 | **Qasje**: audit kontrasti (WCAG AA), etiketa ARIA, `prefers-reduced-motion` | axe-core: 0 shkelje kritike |
| 5.10 | Rishikim i përmbajtjes nga një person i kualifikuar | Nënshkrim në `docs/06-burimet-e-te-dhenave.md` |

📄 Prompti: [`prompts/faza-5.md`](./prompts/faza-5.md)

---

## Faza 6 — Veçori të avancuara (🟢 sipas rastit)

| # | Detyra | Shënim |
|---|---|---|
| 6.1 | Audio e shkarkueshme për suren aktuale | FR-2.8 |
| 6.2 | Llogaritës zekati + gjurmues sadakaje | FR-5.6 |
| 6.3 | Raport për murabbian (PDF) | FR-3.6 |
| 6.4 | Modalitet "një dorë" për dhikër gjatë ecjes | FR-4.7 |
| 6.5 | **AI për recitim** — vetëm si mjet ndihmës | FR-3.7, **shih R7 para se të fillosh** |

---

## Rregullat e punës (të vlefshme për çdo fazë)

1. **`npm test` para çdo commit-i.** 155 teste që kalojnë është dyshemeja, jo tavanı.
2. **Një modul në herë.** Nëse një PR prek më shumë se një modul, ndaje.
3. **Asnjë rishkrim.** Nëse një AI propozon "ta fillojmë nga e para", ndaloje.
4. **`npm run inventory` pas çdo faze** — nëse numrat bien pa shpjegim, ndalo.
5. **Mos prek** `src/components/quran/mushaf/` dhe `src/services/hifzScheduler.ts` pa test të ri.
6. **Çdo veçori e re ka FR-ID.** Pa ID, nuk ndërtohet.
7. **Dega e punës:** puno vetëm në degën e caktuar për sesionin. Asnjë `--force push`.
