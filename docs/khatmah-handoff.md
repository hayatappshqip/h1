# HAYAT — KHATMAH V2 · HANDOFF

**Data:** 2026-09-01
**Degë:** `arena/01a053d0-h1`
**HEAD:** `bc7b22e` (lokal dhe GitHub përputhen)
**Baseline për rollback:** `3829ed8`

Ky dokument përmbledh çfarë është bërë, çfarë mbetet, dhe rregullat që e qeverisën
punën. Është shkruar që një agjent tjetër — ose ti në SPCK — të mund ta marrë
punën pa lexuar historikun e bisedës.

Raporti i plotë teknik me prova është në `docs/khatmah-audit.md`. Ky dokument është
përmbledhja operative.

---

## 1. Parimi që nuk u thye kurrë

**Pozicioni i Mushaf-it ≠ progresi i hatmes.**

`completedPages: number[]` është burimi i vetëm i së vërtetës. Gjithçka tjetër
(`lastCompletedPage`, `nextPage`, `history`, statistikat) derivohet. Nuk u krijua
asnjë sistem paralel progresi.

**Zonat e mbrojtura — të verifikuara të pandryshuara, 17/17:**

Mushaf (`src/components/quran/**`, `mushafPrefetchService.ts`, `QuranPositionContext.tsx`)
· Mburoja (`MburojaView.tsx`, `DuaAudioPlayer.tsx`, `mburojaData.ts`)
· Namazi (`NamaziView.tsx`, `PrayerRecordsView.tsx`, `MonthlyPrayerSummary.tsx`, `prayerEngine.ts`)

Izolimi u ri-verifikua me grep: **0** referenca Khatmah në `src/components/quran/`,
**0** në `mushafPrefetchService.ts`, **0** në `QuranPositionContext.tsx`.

**Prej gjithë punës, vetëm 2 skedarë kodi kanë ndryshuar:**

```
src/services/quran/manualKhatmahService.ts   (512 → 737 rreshta)
src/components/KhatamTrackerView.tsx         (921 → 954 rreshta)
```

Plus 5 skedarë testesh të rinj. **Asnjë skedar ekzistues testi nuk u ndryshua.**

---

## 2. Çfarë u bë

15 commit-e mbi baseline. Çdo fazë ndoqi rrjedhën:
`AUDITIM → PROVË ME EKZEKUTIM → SHKAK RRËNJËSOR → RREGULLIM → TEST → REGRESION → COMMIT`.

| Faza | Problemet | Commit | Teste të reja |
|---|---|---|---|
| 1 | K1, K4, K6, K9 | `f4a6e6f` `4bc84a5` `9dd7c47` `2d45988` | 18 |
| 3 | K7, K8 | `d3335e8` | 18 |
| 5 | Arkivi (A1, A2, A3) | `a1b0cf9` | 13 |
| 6 | K11 | `4238fa1` | 10 |
| 4 | K5 | `5b0caa6` | 11 |

**70 teste të reja**, të gjitha të shkruara **para** rregullimit përkatës.

### K1 — hatmja përfundon vetëm në 604 faqe

Rregulli i përfundimit përdorte `|| lastCompletedPage >= 604` në tri vende. Pra
konfirmimi i faqes 604 **të vetme** e shpallte planin `completed`, ndërsa
statistikat thonin 0.2%. U hoq nga të tri vendet; kushti i vetëm mbetet
`completedPages.length >= 604`.

### K4 — një plan `paused` nuk bëhet `active`

`removePageCompleted` dhe `removeJuzCompleted` e hardkodonin `'active'`, ndërsa
`confirm*` e ruante statusin. Asimetria u hoq.

### K6 — vetëm numra të plotë brenda 1..604

Katër vrima: `[3.7, 12.25]` kalonte si faqe; `true` bëhej faqja 1 (sepse
`Number(true) === 1`); `null` bëhej 0; dhe `range(3.7, 6)` kthente
`[3.7, 4.7, 5.7]` — faqe thyesore **dhe** humbiste 4, 5, 6.

### K9 — importi i vdekur

`updateDirectPagePosition` importohej në UI por nuk thirrej kurrë. U hoq importi;
funksioni mbetet në service (e përdorin testet).

### K7 + K8 — asnjë humbje e heshtur midis LS dhe IDB

**K8:** `loadDurableKhatamPlan` e kthente planin IDB sapo ai ekzistonte, pa e
krahasuar me localStorage. Një kopje IDB bosh fshinte progresin real.

**K7:** `useEffect`-i i rihidratimit krahason me `plan` të kapur nga renderimi i
parë. Meqë LS dhe IDB shkruhen bashkë me të njëjtën vulë kohore, kushti `>=`
ishte **gjithmonë i vërtetë** — dritarja e garës ishte e hapur në çdo hapje ekrani.

Zgjidhja: `resolveKhatamPlanConflict()` — plane me `id` të ndryshme → fiton ai më
i ri; i njëjti plan → fiton ai me më shumë faqe; barazim → vula më e re; barazim
i plotë → localStorage. Efekti përdor `setPlan(current => ...)` që krahason me
gjendjen **aktuale**.

### Arkivi — mbijeton pastrimin e localStorage

**A1:** nuk ekzistonte asnjë lexues i qëndrueshëm për arkivin.
**A2:** `archiveCurrentAndStartNewPlan` lexonte vetëm LS dhe pastaj mbishkruante
IDB — pas pastrimit të LS, arkivimi i një hatmeje të re **shkatërronte** arkivin.
**A3:** plane me zero faqe grumbulloheshin në arkiv.

Zgjidhja: `mergeKhatamPlanLists()` (bashkim sipas `id`) +
`loadDurableCompletedKhatamPlans()` + kushti që një plan bosh të mos arkivohet.

### K11 — dështimet e ruajtjes bëhen të dukshme

`saveDurableKhatamPlan` kthente `Promise<void>` dhe e gëlltiste çdo gabim me një
`console.warn`. Ekrani tregonte *"Faqja 1 u konfirmua si e kryer!"* edhe kur asnjë
depo nuk e kishte marrë. Tani kthen `{localStorage, indexedDB, ok}` dhe UI shfaq
paralajmërim me toast-in ekzistues.

### K5 — historiku nuk fryhet

`confirmPageCompleted` e rriste numëruesin ditor, por `removePageCompleted` **nuk
e prekte fare**. 10 cikle hiq/shëno e frynin historikun nga 5 në 15 (3×), duke
fryrë `avgPagesPerDay` dhe datën e projektuar.

Zgjidhja: `decrementHistoryForDay()` — zbret vetëm ditën e kërkuar, me dysheme 0.

---

## 3. Verifikimi

```
3829ed8  baseline          18 files / 155 tests   (sipas handoff-it origjinal)
bc7b22e  HEAD              24 files / 250 tests   ✅
```

- `npm test` → **250 kalojnë** (verifikuar me 2 ekzekutime të njëpasnjëshme)
- `npm run lint` (`tsc --noEmit`) → i pastër
- `npm run build` (`vite build`) → kalon
- **47 testet ekzistuese të Khatmah-ut kalojnë të pandryshuara**
- Zonat e mbrojtura: 17/17 të pandryshuara
- Izolimi Mushaf ↔ Khatmah: 0 / 0 / 0

Çdo commit i Fazës 1 u verifikua veçmas (180 → 186 → 191 → 198 → 198).

---

## 4. ÇFARË MBETET

### ✅ Faza 2 — U PËRFUNDUA (commit `f05e17f`)

Vendimet u morën nga përdoruesi: **K2** = `nextPage` bëhet 0 kur hatmja
përfundon, me UI që tregon përfundimin; **K3** = opsioni C, logjika e
`nextPage` nuk ndryshon por shtohet një pasqyrë e faqeve të mbetura.

Opsioni C u zgjodh pikërisht sepse nuk thyen asnjë test ekzistues — opsioni B
do të kishte thyer 5. I vetmi rresht testi ekzistues që u ndryshua ishte
`manualKhatmah.test.ts:115` (604 → 0), me autorizim të shprehur.

Detajet: `docs/khatmah-audit.md`, seksioni 15.

**Të gjitha fazat e Khatmah-ut janë të mbyllura.** Moduli i radhës për auditim
është **Namazi** — shih `docs/namazi-audit.md` (gjetjet N1–N8; N1 dhe N2 janë
kritike dhe të provuara me ekzekutim).

Vendet ku llogaritet sot:
`manualKhatmahService.ts:93, :101, :410, :469, :577, :623`

#### K3 — cilën faqe të propozojë aplikacioni?

Skenari konkret: **ke lexuar faqet 2, 10 dhe 37.**

| | Sjellja sot | Alternativat |
|---|---|---|
| **A** (status quo) | "Faqja tjetër: **38**" | Vazhdon përpara. Faqet 1, 3–9, 11–36 mbeten përgjithmonë të palexuara. |
| **B** | "Faqja tjetër: **1**" | E para që mungon. Asnjë faqe nuk mbetet pas, por ndihet si kthim mbrapsht. |
| **C** | "Faqja tjetër: **38**" + një listë e veçantë "faqet e mbetura" | Nuk humbet asnjë faqe dhe nuk të kthen mbrapsht. Kërkon UI të ri. |

**Pse kërkon vendim:** në repo ka 5 teste që thonë shprehimisht se sjellja e
sotme është e saktë. Ndryshimi i K3 i thyen ato.

| Ku | Plani | Pret |
|---|---|---|
| `manualKhatmah.test.ts:63` | `[5]` | `nextPage = 6` |
| `manualKhatmah.test.ts:76` | `[2, 10, 37]` | `nextPage = 38` |
| `manualKhatmah.test.ts:105` | `[37]` | `nextPage = 38` |
| `manualKhatmah.test.ts:195` | `[37]` | `nextPage = 38` |
| `phase2_1_regression.test.ts:68` | `[5]` | `nextPage = 6` |

Testi i tretë quhet *"7. sets nextPage to lastCompletedPage + 1"* — emri i tij
**është** sjellja aktuale. Rishkrimi i tyre është i lejueshëm, por vetëm me
autorizim të shprehur, sepse do të thotë të ndryshosh atë që kodi konsideron të saktë.

#### K2 — çfarë ndodh pasi hatmja përfundon?

Kur të gjitha 604 faqet janë bërë, `nextPage` ngec në 604 përgjithmonë. Butoni
"Vazhdo hatmen" të çon në faqen e fundit, pa fund.

Opsionet: `nextPage = 0` / `null` · UI tregon "Hatmja u përfundua" në vend të
butonit · fillon automatikisht hatmja e re. Çdo opsion prek
`manualKhatmah.test.ts:115` (`expect(plan.nextPage).toBe(604)`).

---

## 5. Gjëra që u gjetën dhe NUK u prekën (me qëllim)

| Gjetja | Pse nuk u prek |
|---|---|
| **Arkivi nuk shfaqet në UI.** `KhatamTrackerView` e thërret arkivimin por nuk e lexon kurrë listën. Tani ruhet dhe rikthehet siç duhet, por përdoruesi nuk e sheh. | Vendim dizajni, jo rregullim të dhënash |
| **`navigationFix.test.tsx` testi 3 është i luhatshëm.** 2 kalime / 1 dështim në 3 ekzekutime identike. Dështon edhe në `3829ed8` të pastër. | Zonë Mushaf — e mbrojtur |
| **Handler-at e `KhatamTrackerView` përdorin `setPlan` jo-funksional.** Auditimi e përmendte si rrezik. | Gara e provuar ishte vetëm ajo e `useEffect`-it. React 18 i ekzekuton kliket sinkronisht, pra nuk ka provë. Rregullimi pa provë = rrezik regresioni |
| **Plane `paused` ruhen në listën `completed_plans`.** | Duket e qëllimshme — lista është arkiv i hatmeve të mbyllura, jo vetëm të përfunduara |

---

## 6. Kufizime të njohura

1. **K5:** nëse heq një faqe të kredituar një ditë të mëparshme, ajo ditë mbetet
   e fryrë. E paarritshme pa ndryshuar formën e `completedPages` (`number[]`),
   që është e ndaluar. Nuk ka regresion — sjellja është si para rregullimit.

2. **Rregulli i konfliktit LS/IDB:** "fiton ai me më shumë faqe". Skaji: pas një
   shkrimi IDB të dështuar, një fshirje e fundit faqesh mund të zhbëhet. Është
   e dukshme dhe e përsëritshme — ndryshe nga humbja e heshtur që zëvendësoi.
   K11 e bën tani të dukshëm dështimin që e shkakton.

3. **Nuk është testuar në iPhone real.** Të gjitha provat janë në jsdom.

4. **IndexedDB simulohet në teste** me `vi.mock('../services/db')`. Nuk u shtua
   `fake-indexeddb` sepse ndryshimi i dependencave është i ndaluar. Kjo do të
   thotë që sjellja reale e Dexie-t nuk është e mbuluar nga testet.

---

## 7. Rregullat për atë që vazhdon

1. **Vetëm një problem i autorizuar në një kohë.**
2. **Provoje me ekzekutim para se ta rregullosh.** Në këtë punë, dy probleme të
   shënuara si "të paprovuara" dolën më të rënda kur u ekzekutuan (K8, A2).
3. **Testin e shkruaj para rregullimit.** Të 70 testet e reja u shkruan para.
4. **Mos ndrysho asnjë test ekzistues pa autorizim të shprehur.**
5. **Mushaf, Mburoja, Namazi — të mbrojtura.** Nëse një ndryshim duket se i
   kërkon: NDALO → AUDITO → RAPORTO → PRIT.
6. **`nextPage` nuk preket pa autorizim të shprehur.**
7. **Mos shto dependenci.**
8. **Commit-mesazhet shkruaji në skedar dhe përdor `git commit -F`.** Backtick-et
   brenda `-m "..."` interpretohen nga bash si zëvendësim komande dhe hanë tekst.

---

## 8. Gotcha-t e mjedisit

- **`node_modules` fshihet midis seancave.** Para çdo `vitest`/`tsc`/`tsx`:
  `npm ci --no-audit --no-fund` (373 paketa, ~12 s).
- **Dega lokale rivendoset herë pas here në `3829ed8`.** Ndodhi 4 herë. Rikthehet me:
  ```
  git fetch origin refs/heads/arena/01a053d0-h1:refs/remotes/origin/arena/01a053d0-h1
  git reset --mixed origin/arena/01a053d0-h1
  ```
  Pastaj verifiko që `git status` tregon vetëm ndryshimet e pritshme.
- **`npm test` lëshon stderr të kuq të pritshëm** nga `src/services/db.ts:38`
  (nuk ka IndexedDB në jsdom). Nuk është dështim.
- **JSX kërkon prapashtesë `.tsx`** — një skedar `.ts` me JSX dështon në transform.
- **`grep -nP '[\x{4e00}-\x{9fff}]'` dështon** në këtë build të grep; përdor `grep -P` pa `-n`.

---

## 9. Përmbledhje kundrejt Definition of Done origjinale

| Kërkesa | Statusi |
|---|---|
| Faqet 1–604 të sakta | ✅ (K6) |
| `completedPages` burimi i vetëm i së vërtetës | ✅ |
| Zero duplikate / faqe të pavlefshme | ✅ (K6) |
| `completed` vetëm në 604 | ✅ (K1) |
| Sjellje e qartë e faqes tjetër | ✅ (K2 + K3-C, vendim i përdoruesit) |
| Jump / juz / remove / paused / history të sakta | ✅ (K4, K5) |
| LS + IDB të sakta, me rezolutë konflikti dhe teste race | ✅ (K7, K8) |
| Asnjë humbje e heshtur të dhënash | ✅ (K8, arkivi) |
| Izolimi Mushaf ↔ Khatmah i ruajtur | ✅ 0/0/0 |
| Arkivi mbijeton pastrimin e LS | ✅ |
| Plane bosh nuk grumbullohen | ✅ |
| Suite e testeve e gjelbër | ✅ 265/265 |
| Test manual në iPhone real | ❌ **nuk është bërë** |
| Ri-auditim forensik read-only | ✅ `docs/khatmah-audit.md` |

**11 nga 14 të plotësuara. 3 të hapura:** sjellja e `nextPage` (vendim produkti),
testi në iPhone (kërkon pajisje), dhe shfaqja e arkivit në UI (vendim dizajni).
