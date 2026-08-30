# Hayat — Jeta Islame

Menaxher personal islamik **local-first** për muslimanët shqipfolës, si PWA e kthyeshme në aplikacion iOS/Android.

> 📋 **Dokumenti i plotë i specifikave, analiza e rreziqeve dhe planet hap-pas-hapi gjenden në [`docs/`](./docs/README.md).**
> Fillo nga atje para se të ndryshosh kod.

---

## Modulet

| Moduli | Çfarë bën |
|---|---|
| **Kreu** | Përmbledhja e ditës: namazi i radhës, ajeti i ditës, detyrat, dhikri |
| **Namazi** | Oraret, regjistrimi i faljes, kibla, dhikri pas namazit, statistika |
| **Kurani** | Mushaf 604-faqësh, përkthim shqip, tefsir, kërkim lokal, hatme |
| **Hifzi** | Memorizim me përsëritje të ndërprerë, Manzil, regjistrim i recitimit |
| **Mburoja** | Hisnul Muslim: 11 kategori, 133 kapituj, 294 dua me numërues |
| **Dita Ime** | Lista ditore, gjurmues agjërimi, organizimi rreth orareve |

## Parimi arkitektural

**Local-first.** Të dhënat jetojnë në pajisje (IndexedDB me Dexie). Aplikacioni funksionon plotësisht pa rrjet; rrjeti vetëm rifreskon përmbajtjen. Asnjë e dhënë nuk del nga pajisja pa veprim të përdoruesit.

---

## Zhvillimi

**Kërkesa:** Node.js 22+

```bash
npm ci              # instalo varësitë
npm run dev         # serveri i zhvillimit në http://localhost:3000
npm run lint        # tsc --noEmit
npm test            # vitest — 19 skedarë, 180 teste
npm run build       # vite build + server bundle → dist/
npm run inventory   # inventar i verifikuar i repo-s (shih më poshtë)
```

### Variablat e mjedisit

Shih [`.env.example`](./.env.example). Të gjitha janë **opsionele** — aplikacioni funksionon pa to, duke përdorur burimet publike.

| Variabli | Për | Nëse mungon |
|---|---|---|
| `QURAN_CLIENT_ID`, `QURAN_CLIENT_SECRET`, `QURAN_AUTH_URL` | Quran Foundation API (OAuth2) për faqosjen e mushafit | Përdoret API-ja publike e Quran.com |

---

## Struktura

```
src/
  components/       26 komponentë React (pamjet dhe nënmodulet)
  services/         motorët: prayerEngine, hifzScheduler, db, quran/*
  data/             të dhëna statike: mburojaData, quranData, juzData, audioMap
  workers/          Web Worker për kërkimin lokal të Kuranit
  tests/            teste njësie dhe komponentësh
  utils/            arabicUtils, dateUtils, tajweed, useFontSize
netlify/functions/  funksioni serverless për faqosjen e mushafit
public/
  quran-corpus-v2-chunked/  korpusi lokal: 114 sure, 6 236 ajete, me SHA-256
  fonts/                    fonti Uthmani lokal
docs/               dokumenti i specifikave
scripts/            spec-inventory.mjs
```

## Verifikimi i repo-s

`npm run inventory` ekzekuton `scripts/spec-inventory.mjs`, i cili **importon modulet reale** (jo regex) për të numëruar të dhënat dhe për të zbuluar drift-in:

- sa sure dhe ajete ka korpusi, dhe a përputhet SHA-256 me manifestin;
- sa kapituj dhe dua ka Mburoja, dhe sa kanë boshllëqe;
- cilët komponentë nuk janë të lidhur askund;
- cilat dependenci janë të deklaruara por të papërdorura;
- cilët çelësa jetojnë ende jashtë IndexedDB.

Dalja ruhet në [`docs/inventar.txt`](./docs/inventar.txt) dhe [`docs/inventar.json`](./docs/inventar.json). Testi `src/tests/specDocument.test.ts` dështon nëse numrat bien ndesh me dokumentin.

---

## Rregullat për kontribues (dhe për AI-të)

1. **Nuk je duke filluar nga zero.** Lexo [`docs/01-gjendja-aktuale.md`](./docs/01-gjendja-aktuale.md) para se të shkruash kod.
2. **`npm test` para çdo commit-i.** Numri i testeve që kalojnë nuk bie kurrë.
3. **Një modul në herë.** Një PR që prek më shumë se një modul ndahet.
4. **Mos i prek pa test të ri:** `src/components/quran/mushaf/`, `src/services/hifzScheduler.ts`, `public/quran-corpus-v2-chunked/`.
5. **Çdo veçori e re ka një ID** nga [`docs/02-specifikimi.md`](./docs/02-specifikimi.md). Pa ID, nuk ndërtohet.
6. **Ruaj local-first:** asnjë komponent nuk pret përgjigje rrjeti për t'u vizatuar.

Për punë të planifikuar, shih [`docs/05-roadmap.md`](./docs/05-roadmap.md) dhe promptet e gatshme në [`docs/prompts/`](./docs/prompts/README.md).

---

## Licenca dhe përmbajtja

Kodi dhe përmbajtja fetare kanë licenca të ndryshme. Shih [`docs/06-burimet-e-te-dhenave.md`](./docs/06-burimet-e-te-dhenave.md) për proveniencën, licencat dhe veprimet e mbetura ligjore për secilin burim.

> Aplikacioni është i pavarur dhe nuk është aplikacion zyrtar i Quran Foundation.
