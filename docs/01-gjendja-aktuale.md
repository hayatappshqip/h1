# 01 — Gjendja Aktuale (e verifikuar)

> Çdo pohim në këtë dokument ka një burim: ose një komandë e ekzekutuar në këtë repo, ose një rresht kodi i cituar me rrugë dhe numër.
> Numrat e përmbledhur rigjenerohen me `npm run inventory` → [`inventar.txt`](./inventar.txt).

---

## 1. Pamja e përgjithshme

| Metrikë | Vlera e verifikuar |
|---|---|
| Skedarë në repo (pa `node_modules`/`.git`/`dist`) | 253 |
| Skedarë burimorë `.ts`/`.tsx` (pa teste) | 81 |
| Rreshta kodi burimor | 28 060 |
| Skedarë testesh | 19 |
| Rreshta kodi testesh | 3 764 |
| Komponentë React | 26 (të gjithë të referencuar diku; 0 të braktisur) |
| Dependenci runtime të deklaruara por **të papërdorura** | 5: `@google/genai`, `dotenv`, `motion`, `page-flip`, `pdfjs-dist` |

Rezultatet e kontrolleve të projektit (ekzekutuar në këtë degë):

```
npm run lint   → tsc --noEmit, pa gabime
npm test       → Test Files 19 passed (19) · Tests 180 passed (180)
npm run build  → ✓ built in 6.57s · index-*.js 1 434.39 kB │ gzip: 393.71 kB
```

> Shënim: build-i lëshon dy paralajmërime që duhen trajtuar si punë, jo si zhurmë:
> (a) `Module "path"/"fs" has been externalized for browser compatibility, imported by src/services/quranCorpusStore.ts`;
> (b) bundle-i kryesor kalon 1 MB — nuk ka code-splitting për modulet e rënda.

---

## 2. Çfarë funksionon tashmë (mos e prek pa nevojë)

### 2.1 Namazi — `src/components/NamaziView.tsx`, `src/services/prayerEngine.ts`
- Oraret merren nga **AlAdhan API** (`https://api.aladhan.com/v1/timings/...`, rreshti 119 i `prayerEngine.ts`), me metodë të zgjedhshme; parazgjedhja është `method: 13` = **Diyanet İşleri Başkanlığı** (shih `DEFAULT_PRAYER_SETTINGS`, rreshti 12).
- Cache në `localStorage` me çelës të formës `prayer_times_{data}_{lat}_{lng}_{method}_{school}`.
- Kibla llogaritet me formulë të saktë të azimutit drejt Qabesë (`calculateQiblaBearing`) + kompas (`QiblaCompass.tsx`, përdor `navigator.geolocation`).
- Regjistrim i faljes me vendndodhje (`home`/`mosque`/`outside`) dhe mënyrë (`jamaat`/`alone`) — `PrayerLog` në `src/types.ts`.
- Dhikër pas namazit me numërues dhe ruajtje si sesion (`PostPrayerDhikrSession`).
- Statistika mujore dhe grafikë (`MonthlyPrayerSummary`, `DhikrStatsChart`, `PrayerRecordsView`).

### 2.2 Kurani — `src/components/KuraniView.tsx` + `src/components/quran/mushaf/*`
- **Korpus lokal i plotë**: `public/quran-corpus-v2-chunked/` — 114 skedarë suresh, 6 236 ajete, 3 038 864 bajt. SHA-256 i deklaruar në manifest **përputhet** me atë të rillogaritur (`2d69e23fa1f5b833…` për `001.json`).
- Përkthimi shqip i përfshirë: **Hasan Nahi** (Translation ID 88 nga Quran.com).
- Mushaf me faqosje 604-faqëshe: `MushafPageRenderer`, `MushafPageFrame`, `AyahInteractionLayer`, `TafsirOverlay`; testi `mushaf604Integrity.test.ts` ruan integritetin.
- Kërkim lokal i Kuranit me Web Worker (`src/workers/quranSearchWorker.ts`, 580 rreshta).
- Tefsir me 3 burime: shqip / anglisht / arabisht (`src/services/quran/tafsirService.ts`).
- Faqosja strukturore (code_v2, pozicioni, numri i rreshtit) merret nga **Quran Foundation API** përmes `netlify/functions/quran-page.ts` — me OAuth2 kur ka kredenciale, dhe me fallback publik.
- Hatme: plan i plotë me faqe/xhuz, arkivim dhe rifillim (`manualKhatmahService.ts`, 604 faqe totale).

### 2.3 Hifz — `src/components/HifzModule.tsx`, `src/services/hifzScheduler.ts`, `src/services/hifzDb.ts`
- Bazë e dedikuar Dexie `HayatHifzDatabase` me tabela `ayahRecords`, `sessions`, `settings`, `memorized`.
- Motor përsëritjeje të ndërprerë me `easeFactor`, `intervalDays`, `lapses`, `dueDate`, `strength` dhe prag `intervalDays >= 21` për kalim në gjendje të qëndrueshme.
- Ndarje **Manzil** (`MANZIL_STARTS`).
- Regjistrim zëri i vetë-vlerësimit (`HifzSelfRecorder.tsx`, `hifzRecordingsDb.ts`).
- Metoda e memorizimit e zgjedhshme: `memorizationOrder: 'REVERSE'`, `preferredMethod: 'B'`, limite ditore (`dailyNewAyahLimit: 3`), prag borxhi rishikimi (`reviewDebtThreshold: 15`).
- Ushtrime `Mutashabihat` (ajetet e ngjashme) — `MutashabihatView.tsx`.

### 2.4 Mburoja e Muslimanit — `src/data/mburojaData.ts` (3 516 rreshta)
Numëruar duke importuar modulin real:

| Fusha | Numri |
|---|---|
| Kategori | **11** |
| Kapituj | **133** |
| Dua | **294** |
| …me tekst arabik | 266 → **28 dua pa arabisht** |
| …me përkthim shqip | 293 → **1 dua pa shqip** |
| …me transliterim | 265 → **29 pa transliterim** |
| …me referencë (Buhari/Muslim etj.) | 289 → **5 pa referencë** |
| ID kapitujsh të përsëdytur | 0 |

> Këto **63 boshllëqe të dhënash** janë punë redaktoriale, jo kod. Shih [`05-roadmap.md` Faza 5](./05-roadmap.md).

- Audio për duatë merret nga 3 burime kaskadë (`DuaAudioPlayer.tsx`, rreshtat 52–54): `cdn.jsdelivr.net/gh/BetimShala/mburoja-api`, `raw.githubusercontent.com/BetimShala/mburoja-api`, `www.hisnmuslim.com`.

### 2.5 Dita Ime & agjërimi — `src/components/DitaImeView.tsx`, `FastingTracker.tsx`
- Lista ditore me prioritete (`DayItem`).
- Gjurmues agjërimi: e hënë, e enjte, Ditët e Bardha; dita hixhri merret me `Intl.DateTimeFormat('en-u-ca-islamic')`.

### 2.6 PWA & offline
- `manifest.json` me ikona 192/512 dhe `purpose: "any maskable"`.
- Service worker me cache të guaskës + strategji stale-while-revalidate.
- Backup/restore i të dhënave si JSON (`SettingsView.tsx`, seksioni "Data Safety & Backup").
- Badge "Offline" në header + dëgjues `online`/`offline` në `App.tsx`.

---

## 3. Çfarë mungon (boshllëqet e funksionalitetit)

| # | Boshllëku | Ndikimi | Dëshmia |
|---|---|---|---|
| G1 | **Vetëm 3 qytete si preset** — Tiranë, Prishtinë, Shkup. Asnjë GPS për oraret, asnjë kërkim qyteti, asnjë koordinatë manuale | Kritike për diasporën (Gjermani, Zvicër, Itali, MB, SHBA) | `SettingsView.tsx` rreshtat 181–213: `<select>` me 3 `<option>`; koordinatat janë hardcoded |
| G2 | **Imsaku = Sabahu − 10 min** kudo si rregull | Prek vlefshmërinë e agjërimit | `prayerEngine.ts` rreshtat 77, 109, 129 |
| G3 | **Fallback offline = orar i shkruar përmendësh për Tiranën**, pa asnjë shenjë "këto janë të përafërta" | Përdoruesi beson kohë të gabuara | `prayerEngine.ts` `getFallbackPrayerTimes()`, rreshtat 70–95 |
| G4 | **Pa push notifications** — njoftimet bëhen me `setInterval` 30 s brenda faqes së hapur | App-i nuk të zgjon për Sabah nëse nuk është i hapur | `App.tsx`: `setInterval(() => checkPrayerNotifications(...), 30000)` |
| G5 | **Pa llogari dhe pa sinkronizim** — asnjë librari auth në kod | Ndërron telefonin → humb hifzin, hatmen, regjistrat | `npm run inventory` → `auth.anyAuthLibrary: false` |
| G6 | **Pa kalendar hixhri të mirëfilltë** — vetëm `Intl` për Ditët e Bardha | Pa Ramazan/Bajram/ashure, pa datim hixhri në krye | `FastingTracker.tsx` rreshtat 37–42 |
| G7 | **Pa modul Ramazani** (Teravi, iftar, sadaka) | Humbet muaji me përdorim më të lartë | — |
| G8 | **Pa zekat / sadaka / nijete** | Pjesë e "organizimit të jetës muslimane" që mungon | — |
| G9 | **Pa i18n** — tekstet shqip janë hardcoded brenda JSX | Nuk zgjerohet te turqishtja/boshnjakishtja/arabishtja pa rishkrim | `grep i18n` → asnjë librari |
| G10 | **Pa theksim takvida** (namaz i lënë, kaza, borxh namazesh) | `PrayerLog` ruan vetëm `completed: boolean` | `src/types.ts` |
| G11 | **Pa widget / ekran bllokimi / shkurtore** | Vlera kryesore e një app-i islame është "shikoj orën e namazit pa hapur app-in" | — |
| G12 | **Pa qasje** (screen reader, kontrast, lëvizje e reduktuar) përveç kontrollit të madhësisë së shkrimit | Përjashton përdorues me aftësi të kufizuara | `SettingsView.tsx` ka vetëm 4 shkallë font-i |

---

## 4. Çfarë është teknikisht i brishtë (borxhi teknik)

| # | Problemi | Dëshmia | Pasojë |
|---|---|---|---|
| T1 | **`App.tsx` është një "perëndi shteti"** — mban ~15 `useState` dhe i kalon poshtë me props te 7 pamje | `App.tsx` (i gjatë, me `handleToggle*` për çdo modul) | Çdo ndryshim rrezikon regresion; testimi i një pamjeje kërkon gjithë pemën |
| T2 | **Rruajtje e përzier e të dhënave**: Dexie + localStorage + `localStorage` brenda `prayerEngine` + cache të khatam-it në dy vende | `storage.localStorageKeys`: `hayat_fav_chapters`, `hayat_mushaf_theme`, `hayat_quran_reading_state`; `manualKhatmahService.ts` ka çelësa si `LOCAL_STORAGE_ACTIVE_KHATAM_KEY` dhe `INDEXEDDB_ACTIVE_KHATAM_KEY` | Backup-i JSON nuk kap gjithçka; migrimet janë të vështira |
| T3 | **Bundle 1 434 kB në një copë** | dalja e `npm run build` | Hapja e parë në 3G shkarkon ~394 kB gzip përpara se të shfaqet çdo gjë |
| T4 | **`quranCorpusStore.ts` importon `path` dhe `fs`** | paralajmërimi i build-it | Varet nga "externalized" i Vite — i brishtë; thyhet nëse migrohet te Next.js/SSR |
| T5 | **Drift versionesh**: `service-worker.js` thotë `CACHE_VERSION = 'v44'`, `App.tsx` thotë `Service Worker v45` | `npm run inventory` → `drift` | Konfuzion gjatë debugimit të cache-it; tregon mungesë kontrolli |
| T6 | **Tre manifestë** — `manifest.json` (545 B), `public/manifest.json` (545 B, identik), `public/manifest.webmanifest` (480 B, **i ndryshëm**) | hash-et në `inventar.txt` | `public/manifest.webmanifest` është i vjetëruar dhe i pavërejtur |
| T7 | **`README.md` është README e Google AI Studio**, jo e produktit; flet për `GEMINI_API_KEY` që nuk përdoret askund | `grep -rn "@google/genai\|GEMINI" src server.ts netlify/` → **0 rezultate** | Konfuzon çdo kontribues dhe çdo AI që e lexon |
| T8 | **`.env.example` kërkon `GEMINI_API_KEY`** por kodi nuk e përdor | e njëjta grep | Zhurmë |
| T9 | **Pa skedar `LICENSE`**, pa Privacy Policy, pa Terms | `ls` në rrënjë | Pengon miratimin te Quran Foundation (shih [`06`](./06-burimet-e-te-dhenave.md)) dhe botimin në dyqane |
| T10 | **14 referenca te `everyayah.com`** + 8 host-e `mp3quran.net` për audio | `inventar.txt` | Çdo host është një dështim i mundshëm; asnjë nuk ka licensë të dokumentuar në repo |

---

## 5. Përmbledhje për vendimmarrje

**Ruaj:** arkitekturën local-first, korpusin lokal me SHA-256, mushafin 604, motorin e hifzit, 180 testet.

**Rregullo menjëherë (Faza 0):** G1, G2, G3, T5, T6, T7.

**Vendos si pronar produkti (Faza 2–3):** a shtohet llogari + sinkronizim (G5), a bëhet i18n (G9), a shtohet Ramazani (G7).

**Mos bëj:** të kalosh në Supabase si burim i vetëm i së vërtetës. Kjo do ta kthente një app që funksionon offline në një app që varet nga rrjeti — dhe do të thyente premtimin kryesor të produktit.
