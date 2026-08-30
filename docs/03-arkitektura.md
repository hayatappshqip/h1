# 03 — Arkitektura dhe Stack-u Teknologjik

---

## 1. Stack-u aktual (i verifikuar nga `package.json`)

| Shtresa | Teknologjia | Versioni | Vlerësim |
|---|---|---|---|
| UI | React | 19.0.1 | ✅ Mbaj |
| Build | Vite | 6.2.3 | ✅ Mbaj |
| Stilet | Tailwind CSS (plugin Vite) | 4.1.14 | ✅ Mbaj |
| Gjuha | TypeScript | 5.8.2 | ✅ Mbaj |
| Ruajtje lokale | Dexie (IndexedDB) | 4.4.4 | ✅ Mbaj — është shtylla e local-first |
| Ikonat | lucide-react | 0.546.0 | ✅ Mbaj |
| Grafikë | recharts | 3.10.1 | ⚠️ I rëndë për pak grafikë; të ndahet në chunk |
| Teste | Vitest + Testing Library + jsdom | 4.1.10 | ✅ Mbaj |
| Server dev | Express + tsx | 4.21.2 | ✅ Mbaj |
| Funksion serverless | Netlify Functions | — | ✅ Mbaj |
| **Të papërdorura** | `@google/genai`, `dotenv`, `motion`, `page-flip`, `pdfjs-dist` | — | ❌ **Hiq** (0 referenca në `src/`, `server.ts`, `netlify/`) |

> Verifikuar me `npm run inventory` → `drift.unusedRuntimeDependencies`. Heqja e tyre zvogëlon sipërfaqen e sulmit dhe kohën e instalimit pa ndikuar në asnjë funksionalitet.

**Përfundim për stack-un:** nuk ka arsye për ta ndryshuar. Pyetja e vërtetë nuk është "React apo Next.js" — është **"ku jetojnë të dhënat"**. Kjo trajtohet më poshtë.

---

## 2. Vendimi arkitektural qendror: local-first + sinkronizim opsional

### 2.1 Tri opsionet

| Opsioni | Përshkrimi | Pro | Kundër |
|---|---|---|---|
| **A. Local-first (status quo)** | IndexedDB është burimi i së vërtetës | Offline i vërtetë, privatësi, zero kosto serveri, shpejtësi | Pa sinkronizim mes pajisjesh |
| **B. Backend-first (Supabase si burim)** | Postgres është burimi i së vërtetës, UI lexon nga rrjeti | Sinkronizim i thjeshtë, analytics | **Thyen premtimin offline.** Fshiu i një telefoni të lirë = app i vdekur. Kosto që rritet me përdoruesit. |
| **C. Local-first + replikim opsional** ✅ | IndexedDB mbetet burimi; një shtresë e hollë replikimi e dërgon në Supabase kur ka rrjet dhe kur përdoruesi e kërkon | Offline i vërtetë **dhe** sinkronizim | Më shumë kod; duhet zgjidhje konfliktesh |

### 2.2 Rekomandimi: **C**

Arsyet:
1. **Produkti premtom offline.** Një app që lutet është app që përdoret në xhami, në rrugë, në udhëtim — vende ku rrjeti është i dobët. Opsioni B e kthen këtë në dështim.
2. **Privatësia është veçori, jo pengesë.** Regjistrat e namazit dhe hifzit janë të dhëna fetare personale. Të thuash "asgjë nuk del nga telefoni yt pa lejen tënde" është argument shitjeje për tregun shqiptar, ku besimi te platformat është i ulët.
3. **Kosto.** Opsioni A kushton ~0 €. Opsioni B kushton për çdo përdorues aktiv. Opsioni C kushton vetëm për ata që zgjedhin llogari.

**Rregulli që nuk thyhet:** *çdo lexim shkon te IndexedDB. Asnjë komponent nuk pret një përgjigje rrjeti për t'u vizatuar.*

### 2.3 Si funksionon replikimi (Opsioni C)

```
┌────────────────────────── pajisja ─────────────────────────┐
│  UI (React)                                                 │
│    │ lexim/shkrim                                           │
│    ▼                                                        │
│  Repository Layer  (i ri — shih §5)                         │
│    │                                                        │
│    ├──► IndexedDB (Dexie)   ← burimi i së vërtetës lokale   │
│    │         │                                              │
│    │         └──► outbox: radhë ndryshimesh të pasinkronizuara│
│    ▼                                                        │
│  SyncEngine (vetëm kur: ka rrjet ∧ përdoruesi ka hyrë)      │
└───────────────────────────┬────────────────────────────────┘
                            │ HTTPS, last-write-wins me updatedAt
                            ▼
                    Supabase (Postgres + RLS)
```

- Çdo regjistër merr `updatedAt: number` (ekziston tashmë te shumica) dhe `deviceId: string`.
- Çdo shkrim shtohet në një tabelë `outbox` lokale.
- `SyncEngine` dërgon outbox-in kur kthehet rrjeti (`online` event) ose çdo 15 min.
- Konflikti: fiton `updatedAt` më i ri; konfliktet e pazgjidhshme ruhen në `conflicts` dhe **shfaqen përdoruesit** (FR-6.4).

---

## 3. Burimet e orareve — shtresa më e rëndësishme e të dhënave

Kjo është pjesa ku aplikacioni fiton ose humbet besimin. Hierarkia e propozuar:

```
1. Takvim zyrtar vendor i ruajtur lokal   (KMSH / BIK / RSM)   ← kur ekziston për vendndodhjen
2. Llogaritje astronomike lokale          (adhan-ts në pajisje) ← për çdo vend tjetër
3. AlAdhan API                            (si tani)            ← për të pasur një rezervë të dytë
4. Orar i përafërt + BANDEROLË E KUQE     (kurrë pa paralajmërim)
```

### 3.1 Pse jo vetëm AlAdhan

`src/services/prayerEngine.ts` rreshti 12 përdor `method: 13`, që është **Diyanet İşleri Başkanlığı (Turqi)** — Fajr 18°, Isha 17°. Kjo është *shumë afër* metodës së BIK-ut për Kosovën (po ashtu 18°/17°), **por jo identike**:

Sipas të dhënave të publikuara nga Kryesia e BIK-ut për Kosovën, metoda vendore shton:
- **temkin** 1.5° ≈ 6 minuta (kompensim për reliev);
- **diferencë Imsak → Sabah = 20 minuta** (Sabahu fillon 20 min pas imsakut);
- **pika referuese Deçan** (42.5 N, 21.0 E), jo Prishtina;
- **korrigjime për qytet**: Sharri +2, Ferizaj −1, Gjilani −1, Prishtina −1, Podujeva −1, Vushtrria −1, Presheva −2.

Kodi aktual bën të kundërtën për imsakun: `prayerEngine.ts` rreshtat 77, 109, 129 e vendosin **imsakun 10 minuta *para* Sabahut**. D.m.th. ndryshimi ndaj praktikës zyrtare vendore është i rendit **30 minuta** në drejtimin e agjërimit.

> Ky është një gabim me pasojë fetare, jo një hollësi teknike. **FR-1.3.**

### 3.2 Zgjidhja

1. **Fut një paketë orarësh zyrtare në repo** si JSON (p.sh. `public/timings/bik-2026.json`, `kmsh-2026.json`), me metadata: burimi, URL-ja, viti, metodologjia, licenca.
2. **Llogaritje lokale** me një librari të provuar (`adhan` — e njëjta logjikë që përdorin Muslim Pro dhe aladhan-js) në vend të varësisë nga rrjeti.
3. **API-ja bëhet opsionele**, jo kritike.
4. **Fallback-i i shkruar përmendësh hiqet** dhe zëvendësohet me llogaritje të vërtetë + banderolë.

---

## 4. Njoftimet që funksionojnë kur app-i është i mbyllur

Gjendja aktuale (`src/App.tsx`):

```ts
const interval = setInterval(() => {
  checkPrayerNotifications(prayerTimes, prayerSettings);
}, 30000);
```

Kjo vdes sapo mbyllet dritarja. Për iOS/Android duhet:

```
Push API + Web Push (VAPID) + Notification click → Service Worker → NotificationEvent
        ▲
        │ dërgohet nga një funksion serverless (Netlify Function / Supabase Edge Function)
        │ që llogarit oraret për përdoruesin dhe planifikon dërgesën
        │
   cron (Netlify scheduled functions / Supabase pg_cron)
```

**Kërkesat:**
- `public/push-sw.js` me `push` dhe `notificationclick`.
- Endpoint `POST /api/push/subscribe` që ruan `{ endpoint, keys.p256dh, keys.auth, timezone, location, method }`.
- Cron që ekzekutohet çdo 15 min, gjen namazet që afrohen brenda dritares dhe dërgon.
- **Rruga për iOS:** PWA në iOS 16.4+ **e mbështet** Web Push, por vetëm nëse app-i është instaluar në Home Screen. Kjo duhet shpjeguar në UI me një ekran udhëzues.
- **Plani B (më i sigurt për iOS):** mbështjellës Capacitor me push notifications vendore — nuk kërkon server dhe funksionon edhe offline. Shih [`05-roadmap.md` Faza 4](./05-roadmap.md).

> Rekomandimi: fillo me **push notifications vendore** (pa server) kur kalon në Capacitor; shto Web Push më vonë vetëm nëse do njoftime të ndryshueshme nga serveri.

---

## 5. Ristrukturimi i kodit: nga "perëndia App.tsx" te shtresat

### 5.1 Problemi

`src/App.tsx` mban ~15 `useState` dhe kalon props poshtë te 7 pamje. Çdo modul (namazi, mburoja, kurani, dita ime) ka handler-ët e vet aty. Kjo do të thotë:
- një ndryshim i vogël në një modul e rindërton gjithë pemën;
- testet e një pamjeje duhet të montojnë gjithçka;
- shtimi i sinkronizimit do të thotë të prekim 15 vende.

### 5.2 Synimi

```
src/
  features/
    prayer/     { components/ hooks/ services/ schema.ts index.ts }
    quran/      { ... }
    hifz/       { ... }
    mburoja/    { ... }
    daily/      { ... }
  core/
    db/         repository.ts, outbox.ts, migrations/
    timings/    officialProvider.ts, adhanLocal.ts, aladhanApi.ts, resolver.ts
    sync/       syncEngine.ts, conflictResolver.ts
    notifications/  scheduler.ts, pushSubscription.ts
    i18n/       sq.json, en.json, index.ts
    telemetry/  (vetëm metrika anonime, opt-in)
  app/          AppShell.tsx, routing, providers
```

### 5.3 Rregulli i migrimit (i detyrueshëm)

**Kurrë një rishkrim i madh.** Migrimi bëhet me "strangler pattern":

1. Krijo `core/db/repository.ts` që mbështjell funksionet ekzistuese (`getAllFromStore`, `putInStore`, `getMeta`, `saveMeta`) pa i ndryshuar ato.
2. Zhvendos **një modul** (fillo me `mburoja` — më i thjeshti) te `features/mburoja/` me hook të vetin (`useMburoja()`).
3. Ekzekuto `npm test` — të gjitha testet duhet të kalojnë (tani 180).
4. Përsërit për modulin tjetër.
5. Në fund `App.tsx` mbetet vetëm guaskë: `<AppShell>` + routing.

**Ndaloje punën nëse testet bien.** Nuk ka përjashtime.

---

## 6. Skema e të dhënave

### 6.1 Lokale (IndexedDB) — ekzistuese, të ruhet

| Baza | Tabela | Çelësat | Shënim |
|---|---|---|---|
| `HayatDatabase` (Dexie) | `prayerLogs` | id | `log_{date}_{prayer}` |
| | `postPrayerDhikrSessions` | id | `dhikr_{date}_{prayer}` |
| | `dayItems` | id | |
| | `quranBookmarks` | id | |
| | `quranNotes` | id | `note_{surah}_{ayah}` |
| | `meta` | key | `prayerSettings`, `quranReadingState`, `fastingState`, `mburojaState` |
| `HayatHifzDatabase` | `ayahRecords` | ayahKey, status, dueDate, createdAt | motori i përsëritjes |
| | `sessions` | id, startedAt, type | |
| | `settings` | id | |
| | `memorized` | ayahKey, surah, ayah | v2 |

**Borxhi:** 3 çelësa jetojnë ende në `localStorage` (`hayat_fav_chapters`, `hayat_mushaf_theme`, `hayat_quran_reading_state`) dhe khatam-i ka dy çelësa paralelë (`LOCAL_STORAGE_*` dhe `INDEXEDDB_*`). **FR: të gjitha të kalojnë në IndexedDB para se të shtohet sinkronizimi** — përndryshe backup-i dhe replikimi janë të paplotë.

### 6.2 Fushat që duhen shtuar (të gjitha, në çdo tabelë të replikueshme)

```ts
interface Syncable {
  id: string;
  updatedAt: number;     // ms epoch — ekziston pjesërisht
  createdAt: number;
  deviceId: string;      // uuid i gjeneruar në instalim të parë
  deleted?: boolean;     // fshirje e butë, e nevojshme për replikim
}
```

### 6.3 E re: tabelat e sinkronizimit (lokale)

```
outbox      { id, table, recordId, op: 'put'|'delete', payload, queuedAt }
conflicts   { id, table, recordId, local, remote, detectedAt, resolution }
```

### 6.4 E re: Postgres (Supabase) — vetëm për përdoruesit me llogari

```sql
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  locale text default 'sq',
  timezone text,
  location jsonb,              -- { name, lat, lng, source }
  timing_profile jsonb,        -- { method, asrSchool, adjustments, officialSource }
  created_at timestamptz default now(),
  deleted_at timestamptz
);

create table records (
  id uuid primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  table_name text not null,
  record_id text not null,
  payload jsonb not null,
  updated_at bigint not null,   -- ms epoch, për last-write-wins
  device_id text,
  deleted boolean default false,
  unique (user_id, table_name, record_id)
);
create index on records (user_id, updated_at desc);

alter table records enable row level security;
create policy "own records" on records
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

> **RLS është e detyrueshme.** Pa të, çdo përdorues lexon regjistrat fetarë të tjetrit. Kjo do të ishte katastrofë.

---

## 7. Strategjia offline dhe cache-i

Gjendja: `service-worker.js` me `CACHE_NAME = 'hayat-app-shell-v44'`, ndërsa `src/App.tsx` e quan `v45`. Ky drift duhet zhdukur — versioni të vijë nga një burim i vetëm (`package.json` → gjenerohet në build).

Strategjia e propozuar për çdo lloj burimi:

| Burimi | Strategjia | Arsyeja |
|---|---|---|
| Guaska e app-it (`/`, `index.html`, JS, CSS) | **network-first** me kohëzgjatje 3 s, pastaj cache | Përditësimet duhet të arrijnë shpejt |
| Korpusi i Kuranit (`/quran-corpus-v2-chunked/*`) | **cache-first i përhershëm** (ka SHA-256) | Nuk ndryshon kurrë |
| Fonti Uthmani | **cache-first** | Nuk ndryshon |
| Oraret zyrtare (`/timings/*.json`) | **stale-while-revalidate** | Ndryshon një herë në vit |
| API e Kuranit (mushaf structure) | **cache-first + ruajtje në IndexedDB** | Tashmë bëhet pjesërisht |
| Audio recitimi | **cache-first me kuota** (max ~200 MB) | Përdoruesi zgjedh çfarë shkarkon |
| Navigimi (SPA fallback) | cache `/index.html` | Offline shell |

**Shto:** `navigator.storage.persist()` me kërkesë, dhe një tregues të hapësirës së përdorur në Cilësime. Pa këtë, Safari/iOS mund ta pastrojë IndexedDB pas 7 ditësh pa përdorim — dhe përdoruesi humb hifzin.

> Ky është një rrezik real për iOS: **Safari evicts storage për origin-et që nuk kanë `persistent`.** Duhet trajtuar në Fazën 1.

---

## 8. Performanca

| Problemi | Zgjidhja |
|---|---|
| Bundle 1 434 kB në një copë | `manualChunks`: `react`, `recharts`, `pdfjs`, `mushaf`; `React.lazy` për Hifz, Mburoja, KhatamTracker |
| `quranCorpusStore.ts` importon `path`/`fs` | Hiqi; përdor `import.meta.url` dhe rrugë relative |
| Korpusi 3 MB ngarkohet në fillim | Tashmë është i ndarë për sure — të shtohet prefetch vetëm për suren aktuale + 2 pasuese |
| Grafikët `recharts` në çdo hapje | Lazy-load; të zëvendësohen me SVG të thjeshtë ku është e mundur |

**Synimi:** JS fillestar < 250 kB gzip (nga 394 kB).

---

## 9. Testimi

| Shtresa | Mjeti | Synimi |
|---|---|---|
| Njësi (motorët) | Vitest | `prayerEngine`, `hifzScheduler`, `manualKhatmahService`, `resolver` orarësh — 100 % e degëve kritike |
| Integritet të dhënash | Vitest | Ekzistojnë tashmë (`mushaf604Integrity`, `quranChunkedValidation`) — **të shtohen teste për oraret zyrtare** |
| Komponentë | Testing Library | Ekzistojnë 18 skedarë |
| E2E | Playwright | **Mungon.** Shto: instalim PWA, regjistrim namazi offline, hatme, backup/restore |
| Kontrast/qasje | axe-core në CI | Mungon |

**Rregulli:** asnjë PR që prek `core/timings/` nuk bashkohet pa test të ri që krahason me një burim zyrtar.

---

## 10. Botimi si app iOS/Android

| Rruga | Për | Pro | Kundër |
|---|---|---|---|
| **PWA e instaluar** | tani, zero kosto | Një kod, përditësim i menjëhershëm | Njoftime të kufizuara në iOS; pa dyqan |
| **Capacitor** ✅ | v1 në dyqane | I njëjti kod React; push vendore; akses në file system | Duhet Xcode/Android Studio; rishikim nga Apple |
| React Native | — | Performancë më e mirë | **Do të thotë rishkrim i plotë — jo** |

**Rekomandimi:** Capacitor, me një projekt të vetëm që ndërton PWA *dhe* dy binarë. Ruaj `manifest.json` të vetëm (jo tre).

**Pengesa përpara se të shkosh në dyqane:**
- Privacy Policy (e detyrueshme për Apple dhe për Quran Foundation).
- Terms of Use.
- Skedar `LICENSE`.
- Rregulla e App Store 4.3 (spam) — app-et islame refuzohen shpesh për "minimum functionality"; duhet theksuar hifzi dhe hatmja si veçori thelbësore.
