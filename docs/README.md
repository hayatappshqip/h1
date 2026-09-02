# Hayat — Dokumenti i Specifikave

> **Ky është dokumenti që i jepet një AI tjetër (Google AI Studio, Bolt.new, Windsurf, Cursor) për të ndërtuar/mbaruar aplikacionin.**
>
> Versioni i dokumentit: 1.0 · Data: 2026-08-30 · Degë: `arena/01a053d0-h1`

---

## 0. Paralajmërimi më i rëndësishëm (lexoje këtë para gjithçkaje)

**Ky projekt NUK është një faqe e bardhë.** Në repo ekziston tashmë një aplikacion i funksional:

| Metrikë | Vlera | Si u verifikua |
|---|---|---|
| Rreshta kodi burimor (`.ts`/`.tsx`, pa teste) | **28 060** | `npm run inventory` |
| Rreshta kodi testesh | **3 764** në 19 skedarë | `npm run inventory` |
| Komponentë React | **26**, të gjithë të lidhur (0 të braktisur) | `npm run inventory` |
| Teste që kalojnë | **180 / 180** (19 skedarë) | `npm test` |
| Typecheck | **i pastër** | `npm run lint` |
| Build | **kalon** (bundle 1 434 kB / 394 kB gzip) | `npm run build` |

Rrjedhimi praktik: **mos e rishkruaj nga zero.** Çdo prompt në këtë dosje supozon një kod ekzistues dhe kërkon *ndryshime të lokalizuara*, jo rigjenerim. Nëse një AI tjetër të propozon "ta fillojmë nga e para me Next.js", ndaloje — do të humbasësh 28 mijë rreshta të testuar.

---

## 1. Struktura e dokumentit

Lexo në këtë rend:

| # | Skedar | Çfarë përmban | Për kë |
|---|---|---|---|
| 1 | [`01-gjendja-aktuale.md`](./01-gjendja-aktuale.md) | Inventar i sinqertë: çfarë funksionon, çfarë mungon, çfarë është thyer | Ti + AI |
| 2 | [`02-specifikimi.md`](./02-specifikimi.md) | Specifikimi produkt: persona, module, kërkesa funksionale me ID | Ti + AI |
| 3 | [`03-arkitektura.md`](./03-arkitektura.md) | Stack-u, skema e të dhënave, kontratat, jo-funksionalet | AI (teknike) |
| 4 | [`04-rreziqet.md`](./04-rreziqet.md) | Regjistër rreziqesh me masë kundërvepruese | Ti |
| 5 | [`05-roadmap.md`](./05-roadmap.md) | Plani hap-pas-hapi (Faza 0 → 6) me kritere pranimi | Ti + AI |
| 6 | [`06-burimet-e-te-dhenave.md`](./06-burimet-e-te-dhenave.md) | Licenca, provenienca, saktësia fetare | Ti (ligjore/fetare) |
| 7 | [`prompts/`](./prompts/) | **Promptet e gatshme për t'u kopjuar**, një për fazë | AI |
| — | [`inventar.txt`](./inventar.txt) / [`inventar.json`](./inventar.json) | Nxjerrje automatike e numrave të cituar këtu | Verifikim |

> **Për numrin e testeve:** dokumenti dhe promptet përmendin **155** si dyshemenë —
> aq ishin para se të shtohej dokumenti. Tani janë **180** (25 teste të reja në
> `src/tests/specDocument.test.ts` ruajnë pohimet e kësaj dosjeje). Rregulli është
> i njëjtë: numri nuk bie kurrë.

**Rregulli i artë për AI-në që do ta marrë këtë:** fillo gjithmonë nga `docs/prompts/README.md` dhe ekzekuto fazat me radhë. Mos kalo fazën 0.

---

## 2. Përmbledhje 60-sekondëshe

**Produkti:** Hayat — menaxher personal islamik për shqipfolës, local-first, PWA, i kthyeshëm në app iOS/Android.

**Gjashtë modulet:** Namazi · Kurani (lexim + hatme) · Hifz (memorizim) · Mburoja (Hisnul Muslim) · Dhikër · Dita Ime.

**Çfarë është bërë mirë dhe duhet ruajtur:**
- Arkitekturë **local-first**: IndexedDB (Dexie) + localStorage, funksionon offline.
- Korpusi i Kuranit **i plotë dhe lokal**: 114 sure, 6 236 ajete, 3.04 MB, me verifikim SHA-256 që kalon.
- Mushaf me faqosje të vërtetë 604-faqëshe (QCF) — kjo është pjesa më e vështirë teknikisht dhe **është bërë**.
- Motor hifzi me përsëritje të ndërprerë (spaced repetition) dhe plan Manzil.
- 180 teste që kalojnë — përfshirë teste integriteti të tekstit kuranor.

**Çfarë është rrezik i menjëhershëm (Faza 0):**
1. **Vetëm 3 qytete të forta në kod** (Tiranë, Prishtinë, Shkup) — diaspora në Gjermani/Zvicër merr orarin e Tiranës.
2. **Imsaku llogaritet si "Sabah − 10 min"** — BIK-u zyrtar e ka ndryshe (Sabahu fillon ~20 min pas imsakut). Kjo prek agjërimin.
3. **Fallback offline = orar i shkruar përmendësh për Tiranën** — nëse API-ja bie, përdoruesi merr kohë të gabuara pa asnjë sinjalizim.
4. **Njoftimet vdesin kur app-i mbyllet** — `setInterval` nuk punon në sfond. Pa Push Notifications → pa vlerë reale si app.
5. **Asnjë sinkronizim** — ndërron telefonin, humb gjithçka.

**Vendimi arkitektural që rekomandohet:** mbaje local-first si burim i së vërtetës; shto sinkronizim opsional (Supabase) si shtresë e dytë, jo si themel. Arsyetimi i plotë: [`03-arkitektura.md` §3](./03-arkitektura.md).

---

## 3. Si ta verifikosh vetë (para se t'i besosh këtij dokumenti)

```bash
npm ci
npm run lint        # tsc --noEmit   -> duhet të jetë i pastër
npm test            # vitest run     -> 19 skedarë, 180 teste, të gjitha kalojnë
npm run build       # vite build     -> duhet të përfundojë
npm run inventory   # rigjeneron numrat e cituar në këtë dosje
```

`npm run inventory` ekzekuton `scripts/spec-inventory.mjs`, i cili importon modulet reale të repos (p.sh. `src/data/mburojaData.ts`) në vend që të numërojë me regex. Nëse dikush ndryshon kodin, ky skedar tregon drift-in.

---

## 4. Pyetja e fundit e ngritur: "Apo ta bëjmë bashkë?"

Po — dhe ja ndarja e punës që propozoj:

| Unë (agjenti në këtë repo) | Ti (pronari i produktit) |
|---|---|
| Zbatoj fazat me kod, teste dhe build të verifikuar | Vendos prioritetet fetare/komerciale |
| Ruaj testet që kalojnë (tani 180) dhe shtoj të reja | Miratoj ndryshimet e UX-it |
| Raportoj saktësisht çfarë u verifikua e çfarë jo | Siguroj kontaktin me KMSH/BIK për oraret zyrtare |
| Mbaj dokumentin të përditësuar | Vendos nëse shtohet llogari/sinkronizim |

Fillo me **Fazën 0** (`docs/prompts/faza-0.md`): është e vogël, e rrezikshme nëse lihet, dhe nuk kërkon asnjë vendim produkti.
