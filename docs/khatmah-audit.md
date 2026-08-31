# HAYAT — KHATMAH V2 · Raport Auditimi (read-only)

**Data:** 2026-08-30 · **Degë:** `arena/01a053d0-h1` · **Baseline i dorëzuar:** `3829ed8b7f692a12a219db8001da98c355d69fd4`
**Modaliteti:** AUDIT. **Asnjë skedar kodi nuk u ndryshua. Asgjë nuk u commit-ua.**

Ky raport është hapi "PROBLEM I PROVUAR + ROOT CAUSE + PROPOZIM". Nuk ka implementim. Pritet autorizim.

---

## 1. Verifikimi i baseline-it

| Kontrolli | Rezultati |
|---|---|
| `git status --short` | **bosh** — working tree clean |
| `git log --oneline -3` | `ae4928d` (docs) → `3829ed8` (baseline) |
| `manualKhatmahService.ts` vs `3829ed8` | **IDENTIK** |
| `KhatamTrackerView.tsx` vs `3829ed8` | **IDENTIK** |
| `juzData.ts`, `quranPersistenceService.ts` | **IDENTIK** |
| `QuranPositionContext.tsx`, `mushafPrefetchService.ts` | **IDENTIK** |
| Testet | **19 skedarë / 180 teste / 180 kalojnë** |

**Dallimi nga handoff-i (18 skedarë / 155 teste):** commit-i `ae4928d` nga sesioni i mëparshëm shtoi `src/tests/specDocument.test.ts` (25 teste, të verifikuara veçmas) + `docs/` + `README.md` + `package.json` (skripti `inventory`) + `vite.config.ts`. Aritmetika përputhet saktë: 19 − 1 = 18 skedarë, 180 − 25 = 155 teste. **Zero skedarë Khatmah u prekën.** Nëse doni baseline absolut, `git revert ae4928d` ose `git reset --hard 3829ed8` — por kjo do të fshinte edhe dokumentacionin.

Testet ekzistuese të Khatmah-ut: **47 teste në 3 skedarë, të gjitha kalojnë** (`manualKhatmah.test.ts`, `phase2_1_regression.test.ts`, `hayatQuranV2AuditRegression.test.tsx`).

---

## 2. Izolimi Mushaf ↔ Khatmah — I KONFIRMUAR 🟢

Pohimet e handoff-it u verifikuan me `grep`:

| Pohimi | Rezultati |
|---|---|
| 0 referenca Khatmah në `src/components/quran/` | **0** ✅ |
| 0 referenca në `mushafPrefetchService.ts` | **0** ✅ |
| 0 referenca në `QuranPositionContext` | **0** ✅ |
| Mutatorët thirren vetëm nga `KhatamTrackerView` | ✅ (8/8 mutatorë) |
| Çelësat e persistence janë të ndarë | ✅ (4 çelësa të veçantë, rreshtat 16–19) |

**Përjashtim i vogël që duhet ditur:** `saveDurableKhatamPlan` importohet edhe nga `src/services/quran/quranPersistenceService.ts` (rreshtat 19–27), jo vetëm nga `KhatamTrackerView`. Nuk e prish izolimin (nuk e prek Mushaf-in), por do të thotë që ka **dy rrugë leximi/shkrimi** — relevant për K8.

---

## 3. Gjetjet e konfirmuara — me provë të ekzekutuar

Provat u morën duke **ekzekutuar funksionet reale** të baseline-it. Harness-i jeton në `/tmp/khatmah-audit/proof.ts`, **jashtë repo-s**, që asgjë nën auditim të mos preket.

### 🔴 K1 — Faqja 604 vetëm e shpall hatmen "të përfunduar"

```
completedPages        [604]
plan.status           "completed"
stats.percentage      0.2
stats.isCompleted     false
```

**Root cause:** rregulli i përfundimit përdor `||` në **tri vende**:

| Vend | Kodi |
|---|---|
| `manualKhatmahService.ts:93` (`normalizeKhatamPlan`) | `if (completedPages.length >= 604 \|\| lastCompletedPage >= 604)` |
| `:263` (`confirmPageCompleted`) | `const isCompleted = updatedPages.length >= 604 \|\| lastCompletedPage >= 604` |
| `:319` (`confirmPageRangeCompleted`) | e njëjta |

Disjunkti `|| lastCompletedPage >= 604` është bug-u. `calculateKhatamStats:510` përdor rregullin e saktë (`completedPagesCount >= 604`) — prandaj plani dhe statistikat **bien ndesh me njëri-tjetrin**.

**E rëndësishme:** `removePageCompleted:392` dhe `removeJuzCompleted:422` përdorin tashmë rregullin **e saktë** (vetëm `length >= 604`). Pra kodi ka dy rregulla kontradiktore; rregullimi = të alinhohen `confirm*` me `remove*`.

### 🔴 K2 — `nextPage` ngec në 604 pas përfundimit

```
completedPages.length   604
plan.status             "completed"
plan.nextPage           604
stats.nextPage          604
```

**Root cause:** `:264` dhe `:320` — `nextPage = isCompleted ? TOTAL_MUSHAF_PAGES : lastCompletedPage + 1`; plus `normalizeKhatamPlan:95` që e detyron në 604. Modeli nuk ka gjendje semantike "mbaroi" — `nextPage` është `number`, kurrë `null`. UI do të thotë "faqja tjetër: 604" për një hatme të mbaruar.

### 🟡 K3 — `nextPage` bazohet te maksimumi, jo te boshllëku i parë

```
completedPages   [1,2,3,15]
lastCompletedPage 15
nextPage          16
missing 1..20     [4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20]
```

Konfirmuar: faqet 4–14 mbeten të palexuara por "Vazhdo hatmen" të çon në 16. **Shih §5 — ky nuk është thjesht bug, është specifikim i koduar.**

### 🔴 K4 — Asimetria e `paused`

```
fillojnë si                         "paused"
pas confirmPageCompleted(4)         "paused"   ✅
pas confirmPageRangeCompleted(5,6)  "paused"   ✅
pas confirmJuzCompleted(1)          "paused"   ✅
pas removePageCompleted(3)          "active"   ❌
pas removeJuzCompleted(1)           "active"   ❌
```

**Root cause:** `:392` dhe `:422` — `status: updatedPages.length >= 604 ? 'completed' : 'active'` e hardkodon `'active'`, ndërsa `:272` dhe `:328` bëjnë `isCompleted ? 'completed' : currentPlan.status` (e ruajnë). Rregullim: edhe `remove*` të përdorë `currentPlan.status`.

### 🔴 K5 — Historia numëron veprime, jo progres real

```
pas confirm 1..5        → history 5 · faqe reale 5
pas remove(5)           → history 5 · faqe reale 4   ← historia nuk u ul
pas confirm(5) sërish   → history 6 · faqe reale 5   ← SHKËPUTJE
```

**Root cause:** `confirmPageCompleted:246` shton `pagesCount + 1` vetëm për faqe të reja, por `removePageCompleted` **nuk e prek historinë**. Historia bëhet numërues veprimesh. Prek edhe `avgPagesPerDay` (`:487`) dhe `projectedCompletionDate` (`:494`) — pra edhe parashikimi që i shfaqet përdoruesit.

### 🟡 K6 — Mungon validimi i numrave të plotë

```
confirmPageCompleted(plan, 3.7)      [3.7]
normalize([3.7, 12.25])              [3.7, 12.25]
normalize([true, "8", null])         [1, 8]      ← true bëhet faqja 1
normalize([1e3])                     []          ← kufiri 604 funksionon
```

**Root cause:** `:65` — `.filter(p => !isNaN(p) && p >= 1 && p <= 604)` nuk ka `Number.isInteger`. Dhe `:233` (`confirmPageCompleted`) bën vetëm kontroll intervali. Faqet thyesore futen në `completedPages` dhe nuk përputhen kurrë me asnjë faqe reale të Mushafit.

### 🔴 K7 — Lost update

```
klik 1 → faqe   [1]
klik 2 → faqe   [2]     (të dyja llogaritur nga e njëjta gjendje e vjetër)
ruhet e fundit  [2]     → faqja 1 HUMBET
```

**Root cause:** `KhatamTrackerView.tsx:50` mban planin në `useState`; `handlePersistPlan` (`:100–102`) bën `setPlan(updatedPlan)` — **jo update funksional**. Çdo handler (`:130`, `:136`, `:167`, `:188`) llogarit nga vlera `plan` e closure-it. Dy klikime të shpejta në të njëjtin tick → i dyti mbishkruan të parin. Humbja bëhet e përhershme në ruajtjen pasuese.

### 🔴 K8 — IDB mund të mbishkruajë planin real (më e rëndë se sa përshkruhet)

Handoff-i thotë: *"një plan bosh me `updatedAt` më të ri në IndexedDB mund të fitojë."* Kodi është **më i ashpër** se kaq:

1. `loadDurableKhatamPlan` (`:149–158`) kthen IDB **sapo ekziston një regjistër** — pa krahasuar as `updatedAt`, as `completedPages.length`. LS përdoret vetëm kur IDB nuk ka **asgjë**.
2. `KhatamTrackerView.tsx:52–59` krahason **vetëm** `updatedAt`, dhe me `>=`:
   ```ts
   if (durable && durable.updatedAt >= plan.updatedAt) { setPlan(durable); }
   ```
   Barazimi gjithashtu mbishkruan.

**Skenari i humbjes:** LS ka 100 faqe (`updatedAt=T1`); IDB ka plan bosh (`updatedAt=T2 ≥ T1`, p.sh. pas një shkrimi të pjesshtë ose instalimi të ri). Rezultati: UI tregon planin bosh, dhe `saveDurableKhatamPlan` i radhës e shkruan atë **edhe në localStorage** → humbje e përhershme e 100 faqeve.

### 🟡 K9 — Import i vdekur (i konfirmuar)

`KhatamTrackerView.tsx:11` importon `updateDirectPagePosition` — `grep` gjen **vetëm rreshtin 11**. Funksioni nuk thirret kurrë nga UI. Modaliteti "jump" (`handleDirectPageSubmit:143` + `handleConfirmJumpWithPrior:164`) përdor në vend të tij `confirmPageRangeCompleted` / `confirmPageCompleted`. Heqja është e sigurt (import i pastër).

### 🟡 K11 — Degradim i heshtur

`saveDurableKhatamPlan:170–180` dhe `loadDurableKhatamPlan:154–156` kapin gabimet e IndexedDB vetëm me `console.warn`. Nuk ka asnjë sinjal në UI. Përdoruesi nuk e merr vesh kurrë që ruajtja e qëndrueshme dështoi.

### Arkivi — konfirmuar, dhe më i brishtë se sa thuhet

| Pohimi i handoff-it | Verifikimi |
|---|---|
| Arkivi ruhet në IDB por nuk lexohet prej aty | ✅ `saveDurableCompletedKhatamPlans:218` shkruan në IDB; **nuk ekziston** `loadDurableCompletedKhatamPlans` — vetëm `loadCachedCompletedKhatamPlans:185` (LS) |
| Mund të krijohen entries bosh | ✅ `archiveCurrentAndStartNewPlan:459–462` arkivon planin aktual pa kontroll boshllëku; plani bosh merr `status='paused'` dhe futet në arkiv |
| UI nuk e përdor për historik | ✅ `loadCachedCompletedKhatamPlans` **nuk importohet** nga `KhatamTrackerView` |
| Emri `completed_plans` është mashtrues | ✅ aty futen edhe plane `paused` |

Pasojë: nëse localStorage pastrohet, **arkivi humbet përgjithmonë** edhe pse është shkruar në IndexedDB.

---

## 4. Korrigjim i gabimit tim

Në harness-in e provave parashikova se `updateDirectPagePosition(plan, 10, true)` me `lastCompletedPage=15` do të shënojë faqet 10–16, dhe e shkrova këtë në dalje. **Është e gabuar.** Ekzekutimi tregon:

```
para              [1,2,3,15]  last=15
direct(10,true)   [1,2,3,4,5,6,7,8,9,10,15]
direct(10,false)  [1,2,3,10,15]
direct(20,true)   [1,2,3,4,...,20]
```

Ai plotëson 1..10 — pikërisht qëllimi i dokumentuar ("Arrita deri te faqja 120"). **Nuk ka bug këtu.** E vetmja çështje është K9 (importi i vdekur). Po e them shprehimisht që të mos mbetet si "gjetje" në asnjë raport të ardhshëm.

---

## 5. Gjetja më e rëndësishme e auditimit: K3 është specifikim, jo bug

Kjo ndryshon rendin e punës dhe nuk është në handoff.

Sjellja aktuale (`nextPage = max + 1`) është **e koduar si pritshmëri në 5 teste**, njëri prej të cilëve e ka emrin vetë specifikimin:

| Skedari | Rreshti | Skenari | Tani | Me "boshllëkun e parë" |
|---|---|---|---|---|
| `manualKhatmah.test.ts` | 63 | `[5]` | 6 | **1** ❌ |
| `manualKhatmah.test.ts` | 76 | `[2,10,37]` | 38 | **1** ❌ |
| `manualKhatmah.test.ts` | **105** | `[37]` — testi quhet *"7. sets nextPage to lastCompletedPage + 1"* | 38 | **1** ❌ |
| `manualKhatmah.test.ts` | 195 | `[37]` | 38 | **1** ❌ |
| `phase2_1_regression.test.ts` | 68 | `[5]` | 6 | **1** ❌ |

Testet me varg të pandërprerë nuk preken (133, 144, 211, 78, 141, 146, 170, 174, 196, 237, dhe `hayatQuranV2:246`).

**Përfundimi:** K3 nuk mund të trajtohet si "bug fix". Të ndryshosh `nextPage` do të thotë të **rishkruash 5 pritshmëri testesh**, përfshirë një test që e quan sjelljen aktuale të saktë me emër. Kjo është pikërisht mënyra se si një AI "i rregullon testet që të kalojnë" — gjëja që duhet ndaluar. Prandaj K3 kërkon: vendim produkti të shkruar → rishkrim i autorizuar i testeve → pastaj implementim.

**Anasjelltas, lajmi i mirë:** për **K1, K4, K5, K6 nuk preket asnjë pritshmëri ekzistuese**:
- `grep -rn "paused"` në të gjitha testet → **0 rezultate** (K4 ka zero mbulim)
- Testet e historisë (2, 3, 12, 13) mbulojnë vetëm rrugët confirm; asnjë nuk bën confirm→remove→confirm (K5)
- Testet e `status` janë vetëm 3 (`:39` fresh plan, `:116` dhe `:279` me 604 të plota) — të gjitha mbeten të vlefshme pas rregullimit të K1
- Testi i `removePageCompleted` (`:158`) kontrollon vetëm `completedPages`, jo `status`

Pra Faza 1 mund të bëhet **pa ndryshuar asnjë rresht testi ekzistues** — vetëm duke shtuar teste të reja. Kjo është mënyra më e sigurt e mundur.

---

## 6. Të konfirmuara si të mira (mos i prekni)

Të gjitha u verifikuan me ekzekutim:

```
confirm 10 x3 → completedPages   [10]     ✅ idempotency
confirm 10 x3 → history total    1        ✅ historia nuk fryhet nga dublikatet
confirm(0)    → []                        ✅ kufiri i poshtëm
confirm(605)  → []                        ✅ kufiri i sipërm
30 xhuza → 604 faqe, mbulim i pandërprerë true  ✅
```

Dhe nga leximi i kodit: `completedPages` si burim i vetëm i së vërtetës, pa `completedJuz[]` të ruajtur, `juz → startPage/endPage → confirmPageRangeCompleted`, dhe normalizimi i pandryshueshëm (çdo mutator kthen plan të ri).

---

## 7. Propozimi për Fazën 1 (PRITET AUTORIZIM)

Vetëm **korrigjime të izoluara, pa ndryshim arkitekture, pa ndryshim të testeve ekzistuese**:

| ID | Ndryshimi | Rreshtat | Rreziku | Teste ekzistuese që preken |
|---|---|---|---|---|
| **K1** | Zëvendëso `\|\| lastCompletedPage >= 604` me rregullin e gjatësisë, në 3 vende | 93, 263, 319 | shumë i ulët | **asnjë** |
| **K4** | Në `remove*`, ruaj `currentPlan.status` në vend të `'active'` | 392, 422 | shumë i ulët | **asnjë** |
| **K6** | Shto `Number.isInteger(p)` në filtrim dhe në hyrje të `confirmPageCompleted` | 65, 233 | shumë i ulët | **asnjë** |
| **K9** | Hiq importin e vdekur | `KhatamTrackerView.tsx:11` | zero | **asnjë** |

**Jashtë Fazës 1 (kërkojnë autorizim të veçantë):**
- **K2** — prek `manualKhatmah.test.ts:115` (`expect(plan.nextPage).toBe(604)`). Kërkon vendim për gjendjen "mbaroi".
- **K3** — prek 5 pritshmëri (shih §5). Kërkon vendim produkti.
- **K5** — kërkon vendim: a bëhet historia derivat i `completedPages`, apo mbetet regjistër veprimesh me zbritje? Ndryshimi i parë prek semantikën e `avgPagesPerDay`.
- **K7 / K8** — Faza 3, me propozim arkitektural të veçantë. K8 kërkon vendim: çfarë fiton kur LS dhe IDB bien ndesh — `updatedAt`, `completedPages.length`, apo bashkim?
- **Arkivi** — Faza 5.

**Rendi i propozuar për K1→K4→K6→K9:** një commit për secilin, me testin e ri të shtuar **para** ndryshimit, dhe `npm test` pas çdo hapi.

---

## 8. Çfarë NUK u verifikua

Thuaj hapur, që të mos merret si e bërë:

1. **K7 dhe K8 nuk u provuan në shfletues të vërtetë.** K7 u provua si humbje logjike (dy llogaritje nga e njëjta gjendje) — por nuk u riprodhua me klikime reale në React. K8 u konfirmua **vetëm duke lexuar kodin** (`:149–158` dhe `KhatamTrackerView:52–59`); nuk u ekzekutua me IndexedDB real, sepse kërkon mjedis shfletuesi.
2. **Nuk u testua në iPhone të vërtetë** — pika e fundit e "Definition of Done".
3. **Nuk u mat shtrirja reale e K7 në praktikë** (sa shpesh dy klikime bien në të njëjtin tick në pajisje të ngadaltë).
4. **`updateDirectPagePosition` mbetet i mbuluar nga testet** (`manualKhatmah.test.ts:141`) edhe pse UI nuk e përdor — nëse hiqet K9, funksioni në service **nuk duhet hequr**, vetëm importi.

---

## 9. Përmbledhje për vendimmarrje

| Prioriteti | Gjetja | Statusi |
|---|---|---|
| 🔴 | K1 faqja 604 vetëm → "completed" (0.2%) | i provuar, rregullim i sigurt |
| 🔴 | K4 `remove*` shkatërron `paused` | i provuar, rregullim i sigurt |
| 🔴 | K5 historia 6 vs progresi 5 | i provuar, kërkon vendim semantik |
| 🔴 | K7 lost update | i provuar logjikisht, Faza 3 |
| 🔴 | K8 IDB mbishkruan planin real → humbje e përhershme | i konfirmuar nga kodi, Faza 3 |
| 🟡 | K6 faqe thyesore dhe `true → 1` | i provuar, rregullim i sigurt |
| 🟡 | K9 import i vdekur | i konfirmuar, heqje zero-risk |
| 🟡 | K2 `nextPage` ngec në 604 | i provuar, prek 1 test |
| 🟡 | K3 `nextPage` max-based | i provuar, **prek 5 teste — specifikim, jo bug** |
| 🟡 | K11 degradim i heshtur | i konfirmuar nga kodi, punë UI |
| 🟡 | Arkivi: IDB shkruhet por kurrë nuk lexohet | i konfirmuar, Faza 5 |
| 🟢 | Izolimi Mushaf ↔ Khatmah | **i verifikuar: 0 / 0 / 0** |
| 🟢 | Idempotency, kufijtë 1–604, 30 xhuza | **të verifikuara me ekzekutim** |

**Pritet autorizimi për të filluar me K1.**

---

# 10. Statusi i implementimit — FAZA 1 (e përfunduar)

E autorizuar nga përdoruesi. Një commit për secilin problem, secili i gjelbër.

| Fix | Commit | Skedari | Teste të reja | Suite pas commit-it |
|---|---|---|---|---|
| K1 | `f4a6e6f` | `manualKhatmahService.ts` | 6 | 20 files / 186 tests |
| K4 | `4bc84a5` | `manualKhatmahService.ts` | 5 | 20 files / 191 tests |
| K6 | `9dd7c47` | `manualKhatmahService.ts` | 7 | 20 files / 198 tests |
| K9 | `2d45988` | `KhatamTrackerView.tsx` | 0 (fshirje e pastër) | 20 files / 198 tests |

Baseline: `3829ed8` (180 teste). Testet e reja janë në `src/tests/khatmahFaza1.test.ts`.

## Çfarë ndryshoi konkretisht

**K1** — u hoq `|| lastCompletedPage >= TOTAL_MUSHAF_PAGES` nga tri vende
(`normalizeKhatamPlan`, `confirmPageCompleted`, `confirmPageRangeCompleted`).
Kushti i vetëm mbetet `completedPages.length >= 604`.

**K4** — `removePageCompleted` dhe `removeJuzCompleted` nuk e hardkodojnë më
`'active'`. Rregulli: 604 faqe ende të plota → `completed`; përndryshe nëse
ishte `paused` → mbetet `paused`; përndryshe → `active`.

**K6** — katër ndryshime:
1. `normalizeKhatamPlan` filtron sipas **tipit para koercionit**, sepse
   `Number(true) === 1` dhe `Number(null) === 0` do të kalonin si faqe.
   Stringjet numerike ruhen për përputhshmëri me të dhëna të vjetra.
2. Më pas `Number.isInteger` + brenda 1..604.
3. `confirmPageRangeCompleted` rrumbullakos kufijtë me `Math.ceil`/`Math.floor`.
4. `confirmPageCompleted` refuzon hyrjen thyesore.

**K9** — u hoq importi `updateDirectPagePosition` nga `KhatamTrackerView.tsx`.
Funksioni mbetet në service (përdoret nga `manualKhatmah.test.ts:140`).

## Verifikimi i regresionit

Çdo commit u kontrollua veçmas me `npx vitest run`:

```
8102beb  docs: specifikat                    19 files / 180 tests
b6dfe95  docs: raporti i auditimit           19 files / 180 tests
f4a6e6f  K1                                  20 files / 186 tests
4bc84a5  K4                                  20 files / 191 tests
9dd7c47  K6                                  20 files / 198 tests
2d45988  K9                                  20 files / 198 tests
```

- `npm run lint` (`tsc --noEmit`): i pastër.
- `npm run build` (`vite build`): kalon.
- **Asnjë test ekzistues nuk u ndryshua.** 47 testet e Khatmah-ut që ishin
  para Faza 1 kalojnë të pandryshuara — kjo ishte parashikuar nga analiza e
  shtrirjes në seksionin 5.

## Një gabim i imi gjatë implementimit (për transparencë)

Në përpjekjen e parë për K6 shtova `Number.isInteger` **pas** koercionit
`Number(p)`. Testi dështoi: `[true, '8', null, undefined]` jepte ende `[1, 8]`,
sepse `Number(true) === 1` është numër i plotë. Filtri duhet të refuzojë tipet
jo-numerike **para** koercionit. U korrigjua dhe tani kalon.

Gjithashtu: sandbox-i e ktheu degën në `3829ed8` midis dy seancave, prandaj
commit-i i parë i K1 përmbante edhe dokumentet. Historiku u nda sërish në
6 commit-e të ndara dhe u verifikua që tree hash-i përfundimtar është
**identik** (`2fabf50`) — asgjë nuk humbi.

## Çfarë mbetet (nuk u prek, sipas autorizimit)

K2, K3 (Faza 2) · K7, K8 (Faza 3) · K5 (Faza 4) · Arkivi (Faza 5) · K11 (Faza 6).

---

# 11. Statusi i implementimit — FAZA 3 (e përfunduar)

Commit `d3335e8`. Ndryshohen **2 skedarë**, 62 rreshta.

## Prova para rregullimit (të ekzekutuara, deterministe)

Në auditim K7 ishte "provuar logjikisht, jo në React" dhe K8 "vetëm duke lexuar
kodin". Të dyja tani janë **provuar me ekzekutim** në `src/tests/khatmahFaza3.test.tsx`:

| Testi | Para rregullimit | Humbja |
|---|---|---|
| 1 | `expected [] to equal [20]` | 20 faqe |
| 2 | `expected +0 to be 37` | 37 faqe |
| 5 | `expected [1..10] to equal [30]` | 20 faqe |
| 10 | `expected <span> to be null` | faqja fshihet nga ekrani |
| 11 | LS përfundon me `[2]` | faqja 1 humbet **përgjithmonë** |
| 12 | butoni thotë "Faqen 4" | 10 → 3 faqe (K8 në React) |

6 dështonin, 6 kalonin (sjelljet për t'u ruajtur). Pas rregullimit: **18/18**.

## Shkaqet rrënjësore

**K8** — `loadDurableKhatamPlan()` e kthente planin e IndexedDB sapo ai
ekzistonte, pa e krahasuar kurrë me localStorage.

**K7** — `useEffect` te `KhatamTrackerView.tsx:52-57` e kapte `plan` nga
renderimi i parë, pra `durable.updatedAt >= plan.updatedAt` krahasohej me një
vlerë të vjetëruar. Meqë LS dhe IDB shkruhen në të njëjtën thirrje me të
njëjtën vulë kohore, kushti ishte praktikisht **gjithmonë i vërtetë** — dritarja
e garës ishte e hapur në çdo hapje të ekranit.

## Rregullimi

`resolveKhatamPlanConflict(cached, durable)` — funksion i pastër, i testueshëm:
1. Plane me `id` të ndryshme → fiton ai i krijuar më vonë (plani aktual).
2. I njëjti plan → fiton ai me **më shumë faqe**.
3. Numër i barabartë → fiton vula kohore më e re.
4. Barazim i plotë → fiton localStorage.

`loadDurableKhatamPlan` lexon të dyja kopjet dhe e zbaton rregullin.
`useEffect`-i përdor `setPlan(current => resolveKhatamPlanConflict(current, durable))`,
pra krahason me gjendjen **aktuale** dhe progresi nuk ulet kurrë.

**Rregulli iu delegua agjentit** (pyetja u anashkalua). Zgjedhja: "fiton ai me
më shumë faqe", sepse Definition of Done kërkon *no silent data loss*.

**Skaji i njohur** (i dokumentuar në kod): nëse një shkrim IDB ka dështuar dhe
përdoruesi ka fshirë faqe, kopja e vjetëruar me më shumë faqe mund t'i ringjallë
ato. Është e dukshme dhe e përsëritshme — ndryshe nga humbja e heshtur që
zëvendësohet. Lidhet me K11 (Faza 6), ku dështimet e IDB-së do të bëhen të
dukshme në UI.

## Çfarë NUK u bë (qëllimisht)

- **Nuk u ristrukturuan handler-at** e `KhatamTrackerView`. Auditimi përmendte
  `setPlan` jo-funksional te `handlePersistPlan`, por gara e provuar ishte vetëm
  ajo e `useEffect`-it. React 18 i flushed ngjarjet diskrete (kliket) në mënyrë
  sinkrone, pra dy klika nuk ndërthuren. Ta "rregulloja" pa provë do të ishte
  ndryshim i paautorizuar me rrezik regresioni.
- **`navigationFix.test.tsx` testi 3 është i luhatshëm** — 2 kalime / 1 dështim
  në 3 ekzekutime identike, dhe dështon edhe në `3829ed8` të pastër. Nuk është
  shkaktuar nga ky ndryshim. Është zonë Mushaf, prandaj **nuk u prek**.
  Kërkon autorizim të veçantë.

## Verifikimi

```
d4fe233  para Fazës 3      20 files / 198 tests
d3335e8  pas Fazës 3       21 files / 216 tests   (2 ekzekutime, të dyja të gjelbra)
tsc --noEmit               i pastër
vite build                 kalon
```

---

# 12. Statusi i implementimit — FAZA 5 (e përfunduar)

Commit `a1b0cf9`. Ndryshohet **1 skedar**, 68 rreshta.

## Prova para rregullimit (të ekzekutuara)

13 teste në `src/tests/khatmahFaza5.test.ts`; **10 dështonin**:

| Problemi | Prova | Rezultati |
|---|---|---|
| **A1** | `typeof loadDurableCompletedKhatamPlans` | `'undefined'` — lexuesi nuk ekzistonte |
| **A2** | IDB = 3 hatme, LS = bosh, arkivo 1 të re | `expected length 4 but got 1` — **3 hatme të shkatërruara** |
| **A3** | 5 herë modal "Hatme e Re" me plan bosh | `expected length 0 but got 5` |

3 kalonin (sjelljet për t'u ruajtur). Pas rregullimit: **13/13**.

## Shkaqet rrënjësore

- **A1** — `saveDurableCompletedKhatamPlans` shkruan në IDB që në fillim, por
  nuk është shkruar **kurrë** një lexues i qëndrueshëm. Të dhënat ekzistonin,
  ishin thjesht të paarritshme.
- **A2** — `archiveCurrentAndStartNewPlan` lexonte `loadCachedCompletedKhatamPlans()`
  (vetëm LS) dhe pastaj e mbishkruante IDB-në. Pas pastrimit të LS, ky është
  **shkatërrim i përhershëm**, jo vetëm paarritshmëri.
- **A3** — `completedList.unshift(normalizedCurrent)` pa asnjë kusht.

## Rregullimi

- `mergeKhatamPlanLists(cached, durable)` — bashkim sipas `id`; për të njëjtën
  hatme mbetet kopja me më shumë faqe. I njëjti parim si `resolveKhatamPlanConflict`.
- `loadDurableCompletedKhatamPlans()` — lexon të dyja depot dhe i bashkon.
  **Nuk shkruan gjë**: bashkimi ruhet në shkrimin tjetër të arkivit.
- `archiveCurrentAndStartNewPlan` lexon në mënyrë të qëndrueshme dhe arkivon
  vetëm plane me të paktën një faqe.

## Gjetje që NUK u prek (kërkon autorizim)

**Arkivi nuk shfaqet askund në UI.** `KhatamTrackerView` e thërret
`archiveCurrentAndStartNewPlan` por nuk e lexon kurrë listën — nuk ka asnjë
element `.tsx` që i referohet `completedPlans`. Pra arkivi tani ruhet dhe
rikthehet siç duhet, por përdoruesi nuk e sheh. Shtimi i një shfaqjeje është
vendim dizajni, jo rregullim të dhënash.

**Plane me status `paused` ruhen në listën `completed_plans`.** Kjo është e
qëllimshme (lista është në fakt një arkiv i hatmeve të mbyllura, jo vetëm të
përfunduara), prandaj nuk u ndryshua.

## Verifikimi

```
a6452de  para Fazës 5   21 files / 216 tests
a1b0cf9  pas Fazës 5    22 files / 229 tests   (2 ekzekutime, të dyja të gjelbra)
tsc --noEmit            i pastër
vite build              kalon
```

## Gjendja e fazave

| Faza | Përmbajtja | Statusi |
|---|---|---|
| 1 | K1, K4, K6, K9 | ✅ `f4a6e6f` `4bc84a5` `9dd7c47` `2d45988` |
| 3 | K7, K8 | ✅ `d3335e8` |
| 5 | Arkivi (A1, A2, A3) | ✅ `a1b0cf9` |
| 2 | K2, K3 | ⏳ K3 kërkon vendim produkti + thyen 5 teste ekzistuese |
| 4 | K5 | ⏳ kërkon vendim semantik (ndikon `avgPagesPerDay`) |
| 6 | K11 | ⏳ kërkon vendim dizajni për sinjalin në UI |
