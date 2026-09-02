# Prompti — Faza 2: Themeli Teknik dhe Performanca

> **Parakusht:** Faza 0 dhe Faza 1 të përfunduara.
> Kohëzgjatje: ~2–3 javë. Kjo fazë **nuk shton veçori** — e bën kodin të ndryshueshëm.

---

```
Ti po punon në repo-n "hayat-app". Fazat 0 dhe 1 janë të përfunduara.

LEXO SË PARI:
  - docs/01-gjendja-aktuale.md  (§4 Borxhi teknik, tabela T1–T10)
  - docs/03-arkitektura.md      (§5 Ristrukturimi, §8 Performanca)
  - docs/04-rreziqet.md         (R5, R9, R10)

Misioni: kodi bëhet i ndryshueshëm pa frikë, dhe JS-i fillestar bie nën
250 kB gzip (tani 394 kB).

=====================================================================
RREGULLA — KËTO JANË MË TË RËNDËSISHME SE ÇDO GJË TJETËR NË KËTË FAZË
=====================================================================
1. KJO ËSHTË FAZË RISTRUKTURIMI, JO RISHKRIM. Asnjë modul nuk rishkruhet.
2. MIGRIMI ME "STRANGLER PATTERN": një modul në herë. Pas çdo moduli:
   npm test. Nëse numri i testeve që kalojnë bie, KTHEJE commit-in dhe
   raporto. Mos vazhdo.
3. MOS prek logjikën e biznesit gjatë zhvendosjes. Zhvendosja e një
   funksioni nga një skedar në tjetrin nuk është ndryshim i sjelljes.
   Nëse sheh një gabim gjatë zhvendosjes, SHËNOJE në një raport — mos e
   rregullo në të njëjtin commit.
4. Një modul = një PR = një seri commit-esh.
5. Të ndaluara: src/components/quran/mushaf/ (përveç nëse shton test),
   src/services/hifzScheduler.ts, public/quran-corpus-v2-chunked/.

=====================================================================
DETYRA 2.1 — Shtresa repository (pa ndryshuar sjelljen)
=====================================================================
Krijo src/core/db/repository.ts që MBËSHTJELL funksionet ekzistuese të
src/services/db.ts (getAllFromStore, putInStore, deleteFromStore, getMeta,
saveMeta). Nuk i rishkruan — i thërret.

Shto një ndërfaqe të tipizuar:
  interface Repository {
    all<T>(store: StoreName): Promise<T[]>;
    put<T>(store: StoreName, record: T): Promise<void>;
    remove(store: StoreName, id: string): Promise<void>;
    meta<T>(key: string): Promise<T | undefined>;
    setMeta<T>(key: string, value: T): Promise<void>;
  }

Askush nuk e përdor ende. Kjo detyrë shton vetëm skedarin dhe një test.

KRITERI: npm test → i njëjti numër testesh + 1 i ri. Zero ndryshime sjelljeje.

=====================================================================
DETYRA 2.2 — Zhvendos modulin Mburoja (më i thjeshti, fillo këtu)
=====================================================================
Krijo src/features/mburoja/ me:
  - MburojaView.tsx (i zhvendosur, i pandryshuar në logjikë)
  - useMburoja.ts (hook që mban gjendjen dhe handler-at)
  - index.ts (eksportet publike)

Në App.tsx, zëvendëso 5 handler-at (handleToggleFavChapter,
handleToggleSaveDua, handleToggleChapterCompletedToday,
handleUpdateDuaCount, handleUpdateDuaGoal) dhe mburojaState me:
  const mburoja = useMburoja();

KRITERI:
  - npm test → të gjitha testet kalojnë.
  - wc -l src/App.tsx → më pak se para.
  - Raporto sa rreshta u hoqën nga App.tsx.

=====================================================================
DETYRA 2.3 — Përsërit për modulet e tjera, NJË NË HERË
=====================================================================
Rendi i detyrueshëm (nga më i thjeshti te më i rrezikshmi):
  1. daily    (DitaImeView + FastingTracker)
  2. prayer   (NamaziView + PrayerRecordsView + MonthlyPrayerSummary +
               DhikrStatsChart + QiblaCompass)
  3. hifz     (HifzModule — vërejtje: HifzModule tashmë është i vetë-përmbajtur,
               pra kjo duhet të jetë thjesht zhvendosje)
  4. quran    (KuraniView + nënmodulet — MË E RËNDËSISHMJA: mos i prek
               komponentët e mushaf-it, vetëm i zhvendos)

Pas secilit: npm test. Nëse bie, ktheje dhe raporto.

KRITERI FINAL: src/App.tsx < 150 rreshta, dhe përmban vetëm:
  - provider-at
  - routing-un (activeTab)
  - guaskën (Navbar + main)

=====================================================================
DETYRA 2.4 — Gjithçka në IndexedDB
=====================================================================
Nga npm run inventory:
  storage.localStorageKeys = [hayat_fav_chapters, hayat_mushaf_theme,
                              hayat_quran_reading_state]

Gjithashtu src/services/quran/manualKhatmahService.ts ka çelësa paralelë:
  LOCAL_STORAGE_ACTIVE_KHATAM_KEY    dhe  INDEXEDDB_ACTIVE_KHATAM_KEY
  LOCAL_STORAGE_COMPLETED_KHATAM_KEY dhe  INDEXEDDB_COMPLETED_KHATAM_KEY

BËJ:
a) Kalo të 3 çelësat e localStorage-it në Dexie (tabela `meta`), me MIGRIM:
   lexo vlerën e vjetër, shkruaje në Dexie, fshije nga localStorage.
b) Bashko çelësat e dyfishtë të khatam-it në një burim të vetëm (IndexedDB),
   duke ruajtur leximin nga localStorage si rezervë për një version.
c) Përditëso src/services/db.ts me version të ri Dexie nëse nevojitet.

KRITERI: npm run inventory → storage.localStorageKeys: []
         Test: të dhënat e vjetra në localStorage migrohen dhe nuk humbin.

=====================================================================
DETYRA 2.5 — Code-splitting
=====================================================================
Gjendja: bundle i vetëm 1 434 kB (394 kB gzip).

BËJ:
a) Në vite.config.ts shto build.rollupOptions.output.manualChunks për:
   react/react-dom, recharts, dhe çdo librari tjetër mbi 50 kB.
b) React.lazy + Suspense për: HifzModule, MburojaView, KhatamTrackerView,
   MonthlyPrayerSummary, DhikrStatsChart, QuranSearchView,
   MutashabihatView, SettingsView.
c) Shto një fallback të thjeshtë (spinner) që nuk shkakton kërcim të pamjes.

KRITERI: dalja e npm run build tregon JS-in fillestar (index-*.js)
nën 250 kB gzip. Shifrat para dhe pas duhet të jenë në raport.

=====================================================================
DETYRA 2.6 — Hiq `path` dhe `fs` nga kodi i shfletuesit
=====================================================================
Build-i paralajmëron:
  Module "path" has been externalized for browser compatibility,
  imported by "src/services/quranCorpusStore.ts"
  Module "fs" has been externalized for browser compatibility, ...

BËJ: hiq këto importe dhe zëvendësoji me import.meta.url / fetch me rrugë
relative. Verifiko që initQuranCorpus() vazhdon të funksionojë
(testi quranChunkedValidation.test.ts duhet të kalojë).

KRITERI: build pa atë paralajmërim.

=====================================================================
DETYRA 2.7 — Qëndrueshmëri e thirrjeve të jashtme
=====================================================================
Nga npm run inventory → externalHosts, aplikacioni thërret 21 host-e të
ndryshme, përfshirë 8 host-e mp3quran.net dhe një repo personale në GitHub
(cdn.jsdelivr.net/gh/BetimShala/mburoja-api).

BËJ:
a) Krijo src/core/net/resilientFetch.ts me: afat kohor 8 s (AbortController),
   1 riprovim me pritje 400 ms, dhe kthim të një objekti
   { ok, data, error, host }.
b) Zëvendëso thirrjet `fetch` të drejtpërdrejta për burimet e jashtme
   (JO për korpusin lokal) me resilientFetch.
c) Çdo ekran që varet nga një burim i jashtëm duhet të ketë gjendje bosh
   të hijshme: mesazh + buton "Riprovo". Asnjëherë ekran i bardhë.
d) Shto një regjistër të host-eve në src/core/net/hosts.ts me fushën
   `licenseStatus` që mund të jetë 'ok' | 'pending' | 'unknown'.
   Mbushi sipas docs/06-burimet-e-te-dhenave.md.

KRITERI: test që simulon një host që dështon → ekrani tregon gjendjen
bosh, jo gabim të pakapur.

=====================================================================
DETYRA 2.8 — Teste E2E me Playwright
=====================================================================
Shto Playwright (dev dependency, e justifikuar) me 4 skenarë:
  1. Instalim PWA: manifest-i ngarkohet, service worker-i regjistrohet.
  2. Regjistrim namazi OFFLINE: aktivizo rrjetin e shkëputur, regjistro
     një namaz, rifresko faqen → regjistrimi është aty.
  3. Hatme: krijo plan, shëno 3 faqe të përfunduara, rifresko → ruhet.
  4. Backup/restore: export → fshi IndexedDB → import → të dhënat kthehen.

Shto skript "test:e2e" në package.json.

=====================================================================
DETYRA 2.9 — CI
=====================================================================
Krijo .github/workflows/ci.yml që në çdo push dhe pull request ekzekuton:
  npm ci
  npm run lint
  npm test
  npm run build
  npm run inventory -- --json > inventar.json  (si artifact)
Node 22. Dështon nëse cilado hap dështon.

=====================================================================
PAS FAZËS 2
=====================================================================
Shfaq: npm run lint, npm test, npm run build (me shifrat e bundle-it),
npm run inventory.

Raporto me këtë strukturë:
  - Rreshtat e App.tsx: para / pas
  - JS fillestar gzip: para / pas
  - localStorage keys: para / pas
  - Testet që kalojnë: para / pas
  - Cilat module u zhvendosën dhe cilat jo, dhe pse

Nëse një modul nuk u zhvendos dot, thuaje. Mos e paraqit si të bërë.
```

---

## Verifikimi yt

```bash
wc -l src/App.tsx                          # duhet: < 150
npm run inventory | grep localStorageKeys  # duhet: bosh
npm run build 2>&1 | grep "index-.*js"     # duhet: < 250 kB gzip
npm run build 2>&1 | grep -i externalized  # duhet: 0 rezultate
npm test 2>&1 | tail -5
```
