# Promptet e Gatshme për AI

Këto skedarë janë **të gatshëm për t'u kopjuar** dhe për t'ia dhënë një AI tjetër (Google AI Studio, Bolt.new, Windsurf, Cursor, Claude Code).

---

## Si t'i përdorësh

1. **Hap projektin ekzistues** te mjeti AI. Mos krijo projekt të ri.
2. **Kopjo përmbajtjen e një skedari prompti** (p.sh. `faza-0.md`) tërësisht.
3. **Ngjite si mesazhi i parë.** Asgjë tjetër përpara tij.
4. Nëse AI-ja pyet, përgjigju vetëm me informacion nga `docs/`.
5. **Ndaloje menjëherë** nëse AI-ja thotë ndonjë nga këto:
   - "Le ta fillojmë nga e para…"
   - "Do ta rishkruaj `App.tsx`…"
   - "Do të heq testet për t'i rregulluar më vonë…"
   - "Do të kaloj në Next.js / Redux / Firebase…"

---

## Renditja (mos e ndrysho)

| Skedari | Faza | Kohëzgjatje | Bllokuese për |
|---|---|---|---|
| [`faza-0.md`](./faza-0.md) | Saktësia dhe pastërtia | ~1 javë | gjithçka tjetër |
| [`faza-1.md`](./faza-1.md) | Offline i vërtetë + ligjore | ~2 javë | botimin publik |
| [`faza-2.md`](./faza-2.md) | Themeli teknik + performanca | ~2–3 javë | fazën 3 |
| [`faza-3.md`](./faza-3.md) | Llogari & sinkronizim | ~3–4 javë | opsionale |
| [`faza-4.md`](./faza-4.md) | Capacitor + njoftime | ~2–3 javë | dyqanet |
| [`faza-5.md`](./faza-5.md) | Përmbajtja dhe cilësia | vazhdimisht | — |

---

## Prompti i përgjithshëm (ngjite në fillim të çdo sesioni të ri)

```
Ti po punon në repo-n ekzistuese "hayat-app" (Hayat – Jeta Islame), një PWA
local-first për muslimanët shqipfolës.

RREGULLA TË PANEKSOCUESHME:
1. Nuk je duke filluar nga zero. Ekzistojnë 28 060 rreshta kodi burimor dhe
   155 teste që kalojnë. Lexo docs/01-gjendja-aktuale.md para se të shkruash kod.
2. Para çdo commit-i ekzekuto: npm run lint && npm test && npm run build.
   Të treja duhet të kalojnë. Nëse numri i testeve që kalojnë bie nën 155,
   ndalo dhe raporto — mos vazhdo.
3. Mos i prek këto pa test të ri që i mbron:
   - src/components/quran/mushaf/
   - src/services/hifzScheduler.ts
   - src/tests/quranChunkedValidation.test.ts
4. Mos shto dependenci të reja pa e justifikuar në një rresht.
5. Mos ndrysho stack-un: React 19 + Vite 6 + TypeScript + Tailwind 4 + Dexie.
6. Një modul në herë. Nëse një ndryshim prek më shumë se një modul, ndaje.
7. Çdo veçori e re duhet të ketë një ID nga docs/02-specifikimi.md (FR-x.y).
   Pa ID, nuk ndërtohet.
8. Ruaj arkitekturën local-first: asnjë komponent nuk pret përgjigje rrjeti
   për t'u vizatuar. IndexedDB mbetet burimi i së vërtetës.
9. Shkruaj komente dhe mesazhe commit-i në shqip, emrat e identifikuesve në anglisht.
10. Pas çdo faze ekzekuto: npm run inventory — dhe raporto ndryshimet e numrave.

Konfirmo që i ke kuptuar këto rregulla, pastaj prit detyrën.
```

---

## Çfarë të bësh kur AI-ja ngec

| Simptoma | Veprimi |
|---|---|
| Propozon rishkrim | Ngjit rregullin 1 dhe 3 nga prompti i përgjithshëm |
| Testet bien | `git diff` → ktheje ndryshimin që e prishi; mos i "rregullo" testet |
| Thotë "nuk mund ta ekzekutoj `npm test`" | Kërkoji të shkruajë kodin por ta quajë të paverifikuar — dhe verifikoje ti |
| Shton 10 dependenci | Ndaloje; kërko zgjidhje me ato që ekzistojnë |
| Ndryshon korpusin e Kuranit | **Ndaloje menjëherë.** Riktheje me `git checkout` |
