# 04 — Regjistri i Rreziqeve

> Shkalla: **Ndikimi** (1 i vogël → 5 katastrofik) × **Gjasat** (1 rrallë → 5 pothuaj e sigurt).
> Çdo rrezik ka një masë kundërvepruese me ID të fazës ku trajtohet.

---

## R1 — Orar i gabuar i namazit 🔴 (Ndikimi 5 · Gjasat 4)

**Çfarë:** Aplikacioni tregon kohë të gabuara dhe përdoruesi fal namazin jashtë kohës ose e prish agjërimin.

**Dëshmia në kod:**
- `src/services/prayerEngine.ts:77` — `const imsakMins = fajrMins - 10;`
- `src/services/prayerEngine.ts:109` — `parsed.imsak = minutesToTime(timeToMinutes(parsed.fajr) - 10);`
- `src/services/prayerEngine.ts:129` — i njëjti rregull si rezervë kur API nuk kthen Imsak.
- `src/services/prayerEngine.ts:70-95` — `getFallbackPrayerTimes()` kthen vlera **të shkruara përmendësh** për Tiranën (Sabah 04:15, Dreka 12:45, Akshami 19:45…), të njëjta për çdo datë të vitit.
- `src/components/SettingsView.tsx:181-213` — vetëm 3 qytete; koordinatat hardcoded.

**Pse është i rëndë:** Metoda vendore e BIK-ut për Kosovën përdor temkin 1.5° (~6 min) dhe **Sabahu fillon 20 minuta pas Imsakut**, me pikë referuese Deçanin dhe korrigjime për qytet. Kodi bën të kundërtën (imsak 10 min para Sabahut). Diferenca praktike është e rendit 30 minuta në kohën e ndalimit të ngrënies.

**Pasojë biznesi:** Një përdorues i mashtruar një herë nuk kthehet kurrë dhe e paralajmëron xhaminë. Kjo është metrika "Raportime për orar të gabuar = 0" te [`02-specifikimi.md` §6](./02-specifikimi.md).

**Masë kundërvepruese (Faza 0 + Faza 1):**
1. Hiq `getFallbackPrayerTimes()` me vlera statike → zëvendëso me llogaritje lokale me `adhan` (MIT, npm).
2. Fut takvimin zyrtar KMSH/BIK/RSM si JSON lokal.
3. Imsaku merret nga burimi, nuk nxirret me zbritje.
4. Banderolë e dukshme kur burimi nuk është zyrtar.
5. Test që krahason 365 ditë × 3 qytete kundër takvimit zyrtar.

---

## R2 — Njoftimet nuk arrijnë 🔴 (5 · 5)

**Çfarë:** Përdoruesi e shkarkon app-in për t'u zgjuar për Sabah. Nuk zgjohet. E fshin.

**Dëshmia:** `src/App.tsx` — `setInterval(() => checkPrayerNotifications(prayerTimes, prayerSettings), 30000)`. Kjo ekzekutohet vetëm kur dritarja është e hapur dhe skeda aktive. Në iOS Safari, JS-i i skedave në sfond pezullohet brenda sekondash.

**Gjasat 5 sepse:** është e sigurt, jo e mundshme — me dizajnin aktual njoftimi nuk mund të arrijë kurrë në telefon të mbyllur.

**Masë (Faza 4):**
- Capacitor + `@capacitor/local-notifications` → njoftime vendore të planifikuara për 7 ditë përpara, pa server.
- Rifreskim i planit sa herë hapet app-i.
- Për iOS: udhëzo përdoruesin të lejojë njoftimet (ka një kërkesë të vetme, dhe nëse refuzohet nuk përsëritet lehtësisht).

---

## R3 — Humbja e të dhënave në iOS 🟠 (5 · 3)

**Çfarë:** Safari/iOS pastron IndexedDB për origin-et që nuk kanë ruajtje të përhershme, zakonisht pas 7 ditësh pa përdorim. Përdoruesi humb hifzin e 2 xhuzëve.

**Dëshmia:** `grep -rn "storage.persist" src/` → 0 rezultate. Kodi nuk kërkon kurrë ruajtje të përhershme.

**Masë (Faza 1):**
```ts
if (navigator.storage?.persist) {
  const granted = await navigator.storage.persist();
  // shfaq statusin në Cilësime; nëse refuzohet, këshillo backup
}
```
Plus: kujtesë periodike për backup + backup automatik i fshehtë në File System Access API ku mbështetet.

---

## R4 — Licencimi i përmbajtjes së Kuranit 🟠 (5 · 3)

**Çfarë:** Aplikacioni shpërndan tekstin kuranor dhe përkthimin Hasan Nahi të marrë nga API-ja e Quran.com.

**Dëshmia:**
- `public/quran-corpus-v2-chunked/manifest.json` → `"provider": "Quran.com API (Translation ID 88 - Hasan Nahi)"`, 114 sure, 6 236 ajete, 3 038 864 bajt në repo.
- `netlify/functions/quran-page.ts` përdor Quran Foundation OAuth2.

**Kushtet e Quran Foundation Developer Terms (të verifikuara):** licenca është *jo-ekskluzive, e revokueshme, e patransferueshme*; përmbajtja nuk shitet, nënlicensohet ose rishpërndahet **përveç si pjesë integrale e përvojës së përdoruesit të fundit**; çdo rishpërndarje tregtare kërkon licencë të veçantë me shkrim; dhe platforma kërkon miratim të aplikacionit **me Privacy Policy që përmban deklaratën se app-i nuk është aplikacion zyrtar i Quran Foundation**.

**Çfarë është bërë mirë:** funktioni serverless merr **vetëm** metrikë strukturore (`code_v2`, `position`, `v2_page`, `line_number`) — pa tekst, pa përkthim, pa audio. Kjo është një zgjedhje e mirë dhe duhet ruajtur.

**Çfarë mbetet:**
1. Kërko kredenciale zyrtare dhe miratim në platformën e Quran Foundation.
2. Shkruaj Privacy Policy me deklaratën e kërkuar.
3. Dokumento licencën e përkthimit Hasan Nahi në repo (`docs/06-burimet-e-te-dhenave.md`).
4. Ki një plan B: përkthim shqip me licensë të hapur, nëse miratimi vonon.

> **Pa këtë hap, botimi në App Store/Play Store me API-n e QF është i rrezikshëm.**

---

## R5 — Varësia nga host-e të jashtme të pakontrolluara 🟠 (4 · 4)

**Çfarë:** Pjesë të app-it vdesin sepse një host i palidhur ndryshon ose zhduket.

**Dëshmia nga `npm run inventory` → `externalHosts`:**

| Referenca | Host | Rreziku |
|---|---|---|
| 14 | `everyayah.com` | Audio recitimi — pa kontratë, pa licensë në repo |
| 8 | `api.quran.com` | API publike, pa çelës |
| 3 | `api.alquran.cloud` | API publike |
| 3 | `verses.quran.foundation` | Fonti QCF |
| 2–3 | `server6..13.mp3quran.net` (8 host-e) | Audio — secili një dështim i mundshëm |
| 1 | `cdn.jsdelivr.net/gh/BetimShala/mburoja-api` | **Repo personale në GitHub.** Nëse fshihet, audio e Mburojës vdes |
| 1 | `raw.githubusercontent.com/...BetimShala...` | E njëjta |
| 1 | `www.hisnmuslim.com` | Rezerva e tretë |

**Masë (Faza 2):**
1. Vetë-prit asetet kritike (fonti, audio e Mburojës) ose gjej burim me licensë të qartë.
2. Shkarkim lokal opsional për suren/recituesin e zgjedhur.
3. Asnjë ekran nuk thyhet kur një host dështon — gjendje bosh e hijshme + buton riprovo.
4. Të gjitha host-et regjistrohen në `docs/06-burimet-e-te-dhenave.md` me licensë.

---

## R6 — Privatësia dhe të dhënat fetare 🟠 (5 · 3)

**Çfarë:** Regjistrat e namazit, hifzit dhe lutjeve janë të dhëna të ndjeshme. Në BE këto janë **të dhëna personale që zbulojnë bindje fetare** — kategori e veçantë sipas GDPR nenit 9.

**Gjendja (e mirë):** `npm run inventory` → `auth.anyAuthLibrary: false`. Aplikacioni nuk dërgon asgjë jashtë përveç thirrjeve për përmbajtje. Kjo është një pozitë e fortë.

**Rreziku shfaqet kur shtohet sinkronizimi (Faza 3).** Atëherë:
- Konsent i qartë, i ndarë nga Terms.
- RLS në Postgres (shih [`03-arkitektura.md` §6.4](./03-arkitektura.md)).
- Fshirje brenda 30 ditësh (FR-6.5).
- Privacy Policy **para** se të mblidhet çdo e dhënë.
- Asnjë analytics i palëve të treta me cookie. Vetëm metrika anonime, opt-in, të vetë-pritura.
- Serveri në rajon të BE-së.

---

## R7 — Vlerësimi i recitimit me AI 🟡 (4 · 2)

**Çfarë:** Ideja e "AI që dëgjon recitimin dhe tregon gabimet" është joshëse dhe e rrezikshme.

**Rreziqet:**
1. **Fetare:** një model që gjykon saktësinë e Kuranit merr autoritet fetar. Një gabim i vetëm (p.sh. thotë se një ajet është i gabuar kur është i saktë) është dëm i pariparueshëm.
2. **Teknike:** texhvidi kërkon dallime fonetike të holla (madd, ghunna, qalqala). Modelet e përgjithshme ASR nuk janë të stërvitura për këtë dhe gabojnë sistematisht.
3. **Ligjore:** përpunim i të dhënave të zërit — konsent i veçantë, ruajtje e kufizuar.

**Masë:** **shtyhet në Fazën 6** dhe vetëm si *mjet ndihmës për njeriun*, kurrë si gjyqtar:
- Krahason vetëm **rendin e fjalëve** (jo shqiptimin), me prag të lartë besimi.
- Kur besimi < 90 %, nuk jep vlerësim — thjesht tregon tekstin.
- Mbishkrim i përhershëm: "Mjet ndihmës. Murabbia yt është autoriteti."
- Asnjë audio nuk ruhet në server pa konsent të shprehur.

---

## R8 — Shtrirja e tepërt (scope creep) 🟡 (4 · 5)

**Çfarë:** Ideja përfshin 6 module. Çdo AI që merr këtë projekt do të propozojë 20 veçori të reja.

**Dëshmia se tashmë ka shenja:** 5 dependenci runtime të instaluara por të papërdorura (`@google/genai`, `motion`, `page-flip`, `pdfjs-dist`, `dotenv`) — gjurmë të veçorive të filluara dhe të braktisura.

**Masë:**
- Çdo veçori e re duhet të lidhet me një person (P1–P4) dhe një FR-ID.
- Nëse nuk ka FR-ID, nuk ndërtohet.
- Lista "jashtë fushëveprimit" te [`02-specifikimi.md` §7](./02-specifikimi.md) është e detyrueshme.

---

## R9 — Humbja e punës ekzistuese nga një AI tjetër 🟠 (5 · 3)

**Çfarë:** Bolt.new / Google AI Studio / Windsurf, të dhënë një prompt të shkurtër, rigjenerojnë gjithçka nga zero dhe shkatërrojnë 28 060 rreshta të testuar.

**Kjo është arsyeja pse ekziston kjo dosje.**

**Masë:**
1. Çdo prompt në `docs/prompts/` fillon me: *"Nuk je duke filluar nga zero. Lexo së pari `docs/01-gjendja-aktuale.md`."*
2. Çdo prompt kërkon `npm test` → 155 teste që kalojnë **para** bashkimit.
3. Çdo prompt ndalon ndryshimet në `src/components/quran/mushaf/` dhe `src/services/hifzScheduler.ts` pa test të ri.
4. Punë vetëm në degë; asnjë `git push --force`.

---

## R10 — Borxhi teknik i `App.tsx` 🟡 (3 · 5)

**Çfarë:** 15 `useState` në një komponent. Çdo ndryshim rrezikon regresion në 7 pamje.

**Masë (Faza 2):** strangler pattern, një modul në herë, `npm test` pas çdo hapi. Shih [`03-arkitektura.md` §5.3](./03-arkitektura.md).

---

## R11 — Përmbajtja e paverifikuar fetare 🟠 (5 · 2)

**Çfarë:** 63 boshllëqe në të dhënat e Mburojës (28 pa arabisht, 29 pa transliterim, 5 pa referencë, 1 pa shqip). Një dua pa referencë nuk mund të verifikohet.

**Dëshmia:** `npm run inventory` → seksioni `MBUROJA E MUSLIMANIT`.

**Masë (Faza 5):**
- Asnjë dua pa `reference` nuk shfaqet pa etiketën "Pa referencë — verifikoje".
- Rishikim nga një person i kualifikuar për çdo shtesë.
- Test që numëron boshllëqet dhe dështon nëse rritet.

---

## R12 — Sezonaliteti i përdorimit 🟡 (3 · 5)

**Çfarë:** Aplikacionet islame kanë kulm në Ramazan dhe rënie të madhe pas tij. Nëse infrastrukura dhe metrikat planifikohen sipas kulmit, muajt e tjerë duken si dështim.

**Masë:**
- Mat **D30** dhe **përdorim javor**, jo vetëm DAU.
- Infrastrukturë me kosto që shkallëzohet me zero (opsioni local-first e bën këtë).
- Plan përmbajtjeje për 12 muaj, jo për Ramazan.

---

## Përmbledhje sipas përparësisë

| Rreziku | N×G | Faza |
|---|---|---|
| R2 Njoftimet nuk arrijnë | 25 | Faza 4 |
| R1 Orar i gabuar | 20 | **Faza 0** |
| R9 AI e rigjeneron | 15 | tashmë (kjo dosje) |
| R5 Host-e të jashtme | 16 | Faza 2 |
| R3 Humbja e të dhënave në iOS | 15 | Faza 1 |
| R4 Licenca e Kuranit | 15 | Faza 1 |
| R6 Privatësia | 15 | Faza 3 |
| R11 Përmbajtja e paverifikuar | 10 | Faza 5 |
| R10 Borxhi i `App.tsx` | 15 | Faza 2 |
| R12 Sezonaliteti | 15 | vazhdimisht |
| R8 Shtrirja e tepërt | 20 | vazhdimisht |
| R7 AI për recitim | 8 | Faza 6 |
