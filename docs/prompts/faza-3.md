# Prompti — Faza 3: Llogari dhe Sinkronizim Opsional

> **Parakusht:** Faza 0, 1, 2 të përfunduara.
> **Vendim produkti që duhet marrë para se të fillosh:** a shtohet llogari tani?
> Nëse përgjigja është "jo", kalo te [`faza-4.md`](./faza-4.md).
> Kohëzgjatje: ~3–4 javë.

---

## Vendimi që duhet marrë para kodit

| Nëse… | Atëherë… |
|---|---|
| Përdoruesit kryesorë janë në Ballkan, me një telefon | **Shtyje.** Faza 4 jep më shumë vlerë. |
| Ke përdorues me telefon + tablet, ose që ndryshojnë pajisje | **Bëje.** Humbja e hifzit është e papranueshme. |
| Planifikon të ardhura ose investim | **Bëje**, sepse do të kërkohet. |
| Nuk ke kohë për Privacy Policy + GDPR tani | **Shtyje.** Pa to, kjo fazë është e paligjshme në BE. |

**Rregulli që nuk negociohet:** aplikacioni mbetet 100 % funksional pa llogari (FR-6.1). Sinkronizimi është një shtresë që shtohet, jo një themel që zëvendësohet.

---

```
Ti po punon në repo-n "hayat-app". Fazat 0–2 janë të përfunduara: kodi është
i ndarë në src/features/ dhe src/core/, gjithçka është në IndexedDB, dhe
ekziston shtresa src/core/db/repository.ts.

LEXO SË PARI:
  - docs/03-arkitektura.md  (§2.3 replikimi, §6 skema, §6.4 Postgres + RLS)
  - docs/02-specifikimi.md  (FR-6.1 … FR-6.5, PR-2)
  - docs/04-rreziqet.md     (R6 — Privatësia, GDPR neni 9)

Misioni: shto sinkronizim OPSIONAL pa prishur premtimin local-first.

=====================================================================
RREGULLA
=====================================================================
1. ASNJË komponent nuk pret përgjigje rrjeti për t'u vizatuar. IndexedDB
   mbetet burimi i së vërtetës. Kjo është PR-1 dhe PR-2, dhe nuk negociohet.
2. Aplikacioni duhet të jetë 100 % funksional pa hyrë kurrë në llogari.
   Nëse një test kërkon rrjet për të regjistruar një namaz, testi është gabim.
3. Para çdo commit-i: npm run lint && npm test && npm run build.
4. Të dhënat fetare janë KATEGORI E VEÇANTË sipas GDPR nenit 9.
   Asnjë e dhënë nuk del nga pajisja pa konsent të shprehur.
5. RLS në Postgres është e detyrueshme. Pa të, përdoruesi A lexon
   regjistrat fetarë të përdoruesit B. Kjo do të ishte katastrofë.

=====================================================================
DETYRA 3.1 — Fushat e sinkronizimit + migrim
=====================================================================
Shto në çdo regjistër të replikueshëm (prayerLogs, postPrayerDhikrSessions,
dayItems, quranBookmarks, quranNotes, hifz ayahRecords, hifz sessions,
hifz memorized, mburojaState, fastingState):

  updatedAt: number   (ms epoch)
  createdAt: number
  deviceId: string    (uuid i gjeneruar një herë në instalim, ruhet në meta)
  deleted?: boolean   (fshirje e butë — e nevojshme për replikim)

BËJ një migrim Dexie që plotëson këto fusha për regjistrat ekzistuese pa i
fshirë. Përdor `updatedAt = timestamp` ku ekziston, përndryshe `Date.now()`.

KRITERI: test që krijon të dhëna me skemën e vjetër, ekzekuton migrimin,
dhe verifikon që asnjë regjistër nuk humbi dhe të gjitha kanë fushat e reja.

=====================================================================
DETYRA 3.2 — Outbox dhe conflicts
=====================================================================
Krijo dy tabela lokale Dexie:
  outbox     { id, table, recordId, op: 'put'|'delete', payload, queuedAt }
  conflicts  { id, table, recordId, local, remote, detectedAt, resolution }

Çdo shkrim përmes repository.ts shton një rresht në outbox — por VETËM nëse
përdoruesi ka aktivizuar sinkronizimin. Pa llogari, outbox mbetet bosh.

KRITERI: test që bën 5 shkrime me sinkronizim të aktivizuar → outbox ka
5 rreshta; dhe 5 shkrime pa llogari → outbox ka 0 rreshta.

=====================================================================
DETYRA 3.3 — Supabase: skema dhe RLS
=====================================================================
Krijo supabase/migrations/0001_init.sql me skemën nga docs/03-arkitektura.md §6.4:
  profiles, records, RLS e aktivizuar, politika "own records".

Shkruaj një TEST SIGURIE (jo vetëm një migration) që:
  a) krijon dy përdorues A dhe B;
  b) A shkruan një regjistër;
  c) B provon ta lexojë me token-in e vet → duhet të marrë 0 rreshta;
  d) B provon të shkruajë me user_id të A → duhet të dështojë.

Ky test duhet të ekzekutohet në CI me një instancë lokale Supabase
(supabase start) ose të shënohet qartë si "kërkon mjedis lokal".

KRITERI: testi i sigurisë ekziston dhe kalon.

=====================================================================
DETYRA 3.4 — SyncEngine
=====================================================================
Krijo src/core/sync/syncEngine.ts:
  - start(): dëgjon 'online' dhe ekzekuton çdo 15 min
  - push(): dërgon outbox-in me grupe prej 50, me riprovim dhe backoff
  - pull(): merr regjistrat me updated_at > lastPulledAt
  - merge(): last-write-wins sipas updatedAt
  - Nëse dy regjistra kanë updatedAt të njëjtë por përmbajtje të ndryshme
    → shkruaj në tabelën `conflicts`, mos e zgjidh vetë.

KRITERI:
  - Test: fik rrjetin, bëj 5 ndryshime, ndize rrjetin → të gjitha dërgohen.
  - Test: dy pajisje ndryshojnë regjistra të ndryshëm → të dyja ruhen.
  - Test: dy pajisje ndryshojnë të njëjtin regjistër → fiton më i riu,
    dhe nëse është e paqartë, krijohet një rresht në `conflicts`.

=====================================================================
DETYRA 3.5 — Ndërfaqja e konfikteve (e dukshme, jo e fshehur)
=====================================================================
Nëse ekzistojnë rreshta në `conflicts`, shfaq në Cilësime një seksion
"Sinkronizimi: N konflikte për t'u zgjidhur" me pamje krah-për-krah
(vlera lokale / vlera e pajisjes tjetër) dhe butonat [Mbaj tënden]
[Mbaj tjetrën] [Mbaj të dyja].

KËRKESË: mos i zgjidh konfliktet në heshtje. Përdoruesi ka të drejtë ta dijë.

=====================================================================
DETYRA 3.6 — Hyrja
=====================================================================
Hyrje me magic-link (pa fjalëkalim) si opsion kryesor, plus Apple/Google.
Maksimumi 3 hapa nga butoni "Hyr" te ekrani kryesor.

Ekran i parë para hyrjes (i detyrueshëm, jo një kuti e vogël):
  "Hayat funksionon plotësisht pa llogari. Të dhënat tuaja qëndrojnë në
   telefonin tuaj. Nëse aktivizoni sinkronizimin, regjistrat tuaj të
   namazit, hifzit dhe lutjeve do të ruhen edhe në serverin tonë në
   [rajon]. Mund t'i fshini kur të doni."
  [Vazhdo pa llogari]   [Aktivizo sinkronizimin]

KRITERI: butoni "Vazhdo pa llogari" është po aq i dukshëm sa tjetri.

=====================================================================
DETYRA 3.7 — Fshirja e llogarisë
=====================================================================
  - Buton "Fshij llogarinë dhe të gjitha të dhënat" në Cilësime.
  - Konfirmim me email (jo vetëm një dialog).
  - Fshirje e menjëhershme nga Postgres + shënim fshirjeje brenda 30 ditësh
    nga backup-et.
  - Pas fshirjes, aplikacioni kthehet në modalitetin pa llogari me të
    dhënat lokale të paprekura.

KRITERI: test automatik që verifikon fshirjen.

=====================================================================
DETYRA 3.8 — Privacy Policy e përditësuar
=====================================================================
Përditëso docs/legal/privacy-policy.md me:
  - çfarë të dhënash dërgohen (të gjitha regjistrat fetare — thuaje hapur)
  - baza ligjore (konsenti, GDPR neni 9(2)(a))
  - rajoni i serverit
  - kush ka qasje (vetëm përdoruesi; asnjë palë e tretë)
  - sa gjatë ruhen
  - si fshihen
  - kontakt dhe ankesë

Banner-i i konsentit shfaqet VETËM kur përdoruesi aktivizon sinkronizimin.

=====================================================================
PAS FAZËS 3
=====================================================================
Shfaq: npm run lint, npm test, npm run build, npm run inventory.

Shkruaj raportin me këtë provë specifike:
  - A funksionon aplikacioni 100 % me rrjet të shkëputur dhe pa llogari?
    Si e vërtetove? Cili test?
  - A kalon testi i sigurisë së RLS? Cila ishte dalja?
  - Sa regjistra sinkronizohen në provën me rrjet të fikur?

Nëse testi i RLS nuk mund të ekzekutohet në këtë mjedis, thuaje hapur dhe
shënoje si të paverifikuar — mos pretendoni se siguria funksionon.
```

---

## Verifikimi yt

```bash
grep -rn "enable row level security" supabase/  # duhet: ≥1 rezultat
npm test 2>&1 | grep -i "rls\|siguri\|security" # duhet: testi ekziston
npm test 2>&1 | tail -5                         # testet që kalojnë ≥ Faza 2
```
