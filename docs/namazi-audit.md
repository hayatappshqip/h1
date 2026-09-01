# HAYAT — NAMAZI · AUDITIM READ-ONLY

**Data:** 2026-09-01 · **Baseline:** `3829ed8` · **HEAD gjatë auditimit:** `19004fa`
**Metoda:** §18 STEP 1–4. **Asnjë rresht kod nuk është ndryshuar.**

Provat janë marrë duke ekzekutuar funksionet reale të `prayerEngine.ts` përmes një
harness-i në `/tmp` (i pa-commit-uar) dhe duke krahasuar me **Kalendarin zyrtar
KMSH 2026** për Tiranën.

---

## 1. Lajmi i mirë: rruga online është e saktë

AlAdhan me `method=13` (Diyanet, Fajr 18° / Isha 17°) për Tiranën, krahasuar me
Kalendarin KMSH 2026 për **1 janar 2026**:

| Namazi | KMSH zyrtar | AlAdhan m.13 | Diferenca |
|---|---|---|---|
| Agimi (Imsaku) | **05:27** | Fajr **05:27** · Imsak 05:17 | 0 · −10 min |
| Lindja e diellit | 07:00 | 07:00 | 0 |
| Dreka | 11:49 | 11:49 | 0 |
| Ikindia | 14:08 | 14:08 | 0 |
| Akshami | 16:28 | 16:29 | +1 min |
| Jacia | 17:55 | 17:56 | +1 min |

**Përfundim: `method=13` është zgjedhje e sound.** Përputhet me KMSH brenda 1
minuti për çdo namaz. **Mos e ndrysho metodën.**

---

## 2. N1 — Fallback-i offline jep kohë të fiksuara pavarësisht datës

### Konfirmuar me ekzekutim

```
15 Janar  (offline): fajr=04:15 maghrib=19:45 isha=21:15
15 Korrik (offline): fajr=04:15 maghrib=19:45 isha=21:15
→ identike? true
```

`getFallbackPrayerTimes` (`prayerEngine.ts:70-95`) kthen vlera të ngurta. Nuk ka
asnjë llogaritje astronomike — as datë, as gjerësi gjeografike.

### Krahasimi me KMSH për 1 janar 2026, Tiranë

| Namazi | KMSH zyrtar | Fallback | Gabimi |
|---|---|---|---|
| Imsak | 05:27 | 04:05 | **−1h 22m** |
| Sabahu | 05:27 | 04:15 | **−1h 12m** |
| Lindja | 07:00 | 05:45 | −1h 15m |
| Dreka | 11:49 | 12:45 | +56m |
| Ikindia | 14:08 | 16:30 | +2h 22m |
| Akshami | 16:28 | 19:45 | **+3h 17m** |
| Jacia | 17:55 | 21:15 | **+3h 20m** |

### Rreziku

Sabahu shfaqet 1h 12m **para** se të hyjë koha. Namazi i falur para hyrjes së
kohës nuk është i vlefshëm. Në anën tjetër, Akshami shfaqet 3h 17m vonë — që
gjatë Ramazanit do të thotë iftar 3 orë e kusur pas kohës.

Kjo është gjetja më e rëndë e auditimit.

---

## 3. N2 — Fallback-i e helmon cache-in përgjithmonë

### Konfirmuar me ekzekutim

```
llogaritur OFFLINE         : fajr=04:15 maghrib=19:45
e njëjta datë, TANI ONLINE : fajr=04:15 maghrib=19:45
AlAdhan i vërtetë do jepte : fajr=05:32 maghrib=16:31
→ u kthye vlera e gabuar e ruajtur? true
```

`getPrayerTimes:145` e ruan fallback-in me **të njëjtin cache key** si vlerat
reale, pa asnjë shenjë që ishte fallback. Meqë leximi i cache-it bëhet i pari
(`:104`), një ditë e llogaritur offline mbetet e gabuar **përgjithmonë**, edhe
pasi lidhja rikthehet.

Pra N1 nuk është vetëm "kur je offline" — është "çdo ditë që është hapur një
herë offline".

---

## 4. N3 — Konventa e Imsakut (kërkon vendim)

`Imsak = Fajr − 10` është i ngurtësuar në **tri vende**: `:77`, `:108`, `:126`.
Edhe AlAdhan kthen `Imsak = Fajr − 10`.

Por kalendari zyrtar KMSH ka **një kolonë të vetme**: "AGIMI (IMSAKU)" = 05:27,
e barabartë me Fajr. Pra KMSH nuk e ndan imsakun nga agimi.

→ Aplikacioni u thotë përdoruesve të ndalojnë së ngrëni **10 minuta para** agimit
të botuar nga KMSH. Kjo është praktikë paraprake e zakonshme dhe nuk është
"gabim", por nuk përputhet me kalendarin zyrtar. **Vendim produkti.**

### Korrigjim i imi

Më parë të thashë se imsaku ishte "rreth 30 minuta gabim". **Kjo ishte e gabuar.**
E kisha bazuar në metodologjinë e BIK-ut për Kosovën (Fajr = Imsak + 20 min).
Aplikacioni ka default Tiranën, ku autoriteti është KMSH — dhe i matur kundër
KMSH 2026, ndryshimi është **10 minuta**, jo 30. Nuk duhej ta thoja pa e matur.

---

## 5. Gjetje të konfirmuara duke lexuar (jo me ekzekutim)

| ID | Gjetja | Vendndodhja | Rreziku |
|---|---|---|---|
| **N4** | `getNextPrayer` krahason orën e **pajisjes** (`now.getHours()`) me kohët e **vendndodhjes**. Nëse këto ndryshojnë, gjithë krahasimet prishen. | `:152` | I fshehtë — të 3 qytetet e paracaktuara (Tiranë, Prishtinë, Shkup) janë në CET, pra nuk aktivizohet sot |
| **N5** | `manualAdjustments` ekziston në tip por **nuk ka asnjë UI**. Përdoruesi nuk mund të rregullojë asnjë kohë. Mungon edhe fusha `imsak`. | `types.ts:47` | Mesatar |
| **N6** | Parametri `tune=` i AlAdhan nuk përdoret (0 herë). Rregullimi për namaz nuk është i mundur nga API. | `:118` | Mesatar |
| **N7** | Vetëm 3 qytete të paracaktuara, pa gjeolokalizim për kohët e namazit. (`QiblaCompass` e përdor gjeolokalizimin, por veçmas.) | `NamaziView:420-450` | I ulët |
| **N8** | `midnight` bie në `'23:59'` kur AlAdhan nuk e kthen (vlera reale 23:44). | `:139` | I ulët |

---

## 6. PROPOZIME (nuk janë implementuar — pres autorizim)

Renditur sipas rrezikut. Secili është i izoluar dhe i kthyeshëm.

### P1 — Mos e ruaj fallback-in në cache *(kritik, ~3 rreshta)*
Shënoje rezultatin si fallback ose mos e ruaj fare. Kjo e ndal N2 menjëherë dhe
nuk kërkon asnjë vendim tjetër.

### P2 — Zëvendëso fallback-in e ngurtësuar *(kritik, kërkon vendim)*
Tri opsione:

| Opsioni | Çfarë | Kostoja |
|---|---|---|
| **a** | Paketa `adhan` (MIT, v4.4.4, offline, pa varësi) | **Shton dependencë** — kundër rregullit tënd |
| **b** | Llogaritje diellore e shkruar dorazi (~60-80 rreshta, pa dependencë) | Më shumë kod për t'u mirëmbajtur, por zero varësi |
| **c** | Mos shfaq kohë të gabuara — shfaq "Kohët nuk janë të disponueshme offline" | Më e sigurt fetarisht, humbet funksionalitetin offline |

**Rekomandimi im: (c) si hap i parë** (ndalon menjëherë shfaqjen e kohëve të
pavlefshme), pastaj **(b)** si hap i dytë nëse do offline të vërtetë. Opsioni (a)
është më i saktë por bie ndesh me rregullin për dependencat.

### P3 — Vendimi për Imsakun *(kërkon vendim)*
Ose ndiq KMSH (`Imsak = Fajr`), ose mbaj `Fajr − 10` si paraprak. Nëse mbahet,
të paktën të bëhet i dukshëm dhe i rregullueshëm (shih P4).

### P4 — Ekspozo `manualAdjustments` në UI, shto `imsak` *(i vogël)*
Kjo i lejon përdoruesit të përputhet vetë me kalendarin e xhamisë së tij —
zgjidhja më praktike për dallimet lokale, dhe përdor `tune=` të AlAdhan.

### P5 — Roje për zonën kohore *(i vogël)*
Krahaso në UTC, jo me orën lokale të pajisjes.

---

## 7. Rreziku i regresionit

`prayerEngine.ts` importohet nga: `App.tsx`, `NamaziView.tsx`, `HomeView.tsx`,
`DitaImeView.tsx`, `QiblaCompass.tsx`, `notificationEngine.ts`.

Ekziston **një skedar testi**: `src/tests/prayerEngine.test.ts`. Çdo ndryshim
duhet ta kalojë atë dhe të shtojë teste për rastet e reja.

**Zonat e mbrojtura nuk preken** — ky modul nuk ka asnjë lidhje me Mushafin.

---

## 8. Çfarë NUK u verifikua

- Nëse fallback-i offline i është shfaqur ndonjëherë një përdoruesi real (nuk ka telemetri).
- Besueshmëria dhe limitet e API-së së AlAdhan.
- Sjellja gjatë kalimeve DST.
- Sjellja reale në iPhone.
- Vlerat e KMSH për datat përveç 1 janarit dhe shkurtit 2026 (u morën si mostër).

---

## 9. Përmbledhje

| ID | Gjetja | Rëndësia | Statusi |
|---|---|---|---|
| N1 | Fallback-i offline jep kohë të fiksuara, deri 3h20m gabim | 🔴 Kritike | E provuar |
| N2 | Fallback-i e helmon cache-in përgjithmonë | 🔴 Kritike | E provuar |
| N3 | Imsak = Fajr − 10, ndryshon nga KMSH | 🟡 Kërkon vendim | E provuar |
| N4 | Krahasim i zonës kohore pajisje/vendndodhje | 🟡 I fshehtë | Vetëm lexim |
| N5 | `manualAdjustments` pa UI, mungon `imsak` | 🟡 | Vetëm lexim |
| N6 | `tune=` i papërdorur | 🟡 | Vetëm lexim |
| N7 | 3 qytete, pa gjeolokalizim | 🟢 | Vetëm lexim |
| N8 | `midnight` fallback '23:59' | 🟢 | Vetëm lexim |

**Lajmi i mirë:** metoda 13 dhe rruga online janë të sakta brenda 1 minuti nga
KMSH. Problemi është vetëm te rruga offline dhe te cache-i.

---

# 9. Zbatimi — N1 dhe N2 (të rregulluara)

Autorizuar nga përdoruesi. Ndryshohen **2 skedarë burimi** + **1 skedar testesh i ri**.

## Çfarë u bë

**N1 — nuk shpiken më orë.** Funksioni `getFallbackPrayerTimes` u hoq plotësisht.
Kur nuk ka internet (ose përgjigja është e pavlefshme), `getPrayerTimes` kthen
`null` në vend të një liste orësh të shkruara përgjithmonë në kod.

Nuk ishte e nevojshme të ndryshoheshin ekranet për këtë: `prayerTimes` ishte
tashmë i tipit `PrayerTimes | null` në `App.tsx:49`, dhe të tre konsumatorët
kishin tashmë degë për `null`:
- `NamaziView.tsx:87,89` — `prayerTimes ? … : []`
- `HomeView.tsx:42,43,100` — i ruajtur
- `DitaImeView.tsx:68` — `if (!prayerTimes) return null`

**N2 — vlerat e pasigurta nuk futen më në kujtesë.** Dy ndryshime:
1. Rreshti që shkruante fallback-un në `localStorage` u hoq.
2. Çelësi i kujtesës u ngrit në versionin **v2** (`prayer_times_v2_…`). Kjo është
   riparimi për kujtesën tashmë të helmuar: hyrjet e vjetra, ku mund të ishte
   ruajtur një vlerë e shpikur, nuk lexohen më kurrë.

**Përgjigje e cunguar.** `data?.data?.timings` me një kontroll të qartë — një
përgjigje pa `timings` tani trajtohet si dështim, jo si burim vlerash bosh.

**UI.** NamaziView fitoi një mesazh të qartë kur oraret mungojnë, në vend të një
liste bosh pa shpjegim: *"Kohët e namazit nuk janë të disponueshme"*.

## Verifikimi

```
para   25 files / 265 tests
pas    26 files / 279 tests   (+14 të reja, 0 të thyera)
tsc --noEmit  i pastër        vite build  ✓ built in 6.25s
```

Forma e përgjigjes së AlAdhan u verifikua kundër API-së reale:
`data.data.timings` përmban `Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha, Imsak,
Midnight` — pra analiza në kod është e saktë.

## Çfarë NUK u ndryshua, dhe pse

**Imsaku (N3) mbetet `Fajr − 10`.** Kjo kërkon vendim fetar, jo teknik.

⚠️ **Kujdes — dokumentet e vjetra të projektit janë kontradiktore për këtë pikë:**

- `docs/04-rreziqet.md:19` dhe `docs/03-arkitektura.md:94` arsyetojnë nga metoda
  e **BIK-ut për Kosovën** (temkin 1.5°, Sabahu 20 min pas Imsakut) dhe flasin
  për një diferencë "të rendit 30 minuta".
- Por `docs/06-burimet-e-te-dhenave.md:84,91` e identifikon saktë **KMSH-në** si
  burim zyrtar për Shqipërinë, dhe aplikacioni ka të paracaktuar **Tiranën**.

Sipas kalendarit zyrtar KMSH 2026 për Tiranën, kolona është e vetme dhe e
përbashkët: **"AGIMI (IMSAKU)"** — pra KMSH nuk e ndan Imsakun nga Agimi.
Dhe vetë AlAdhan kthen `Imsak = Fajr − 10`, njësoj si kodi.

Pra për Tiranën, **diferenca praktike nuk është 30 minuta**. Numri 30 vjen nga
metodologjia kosovare, e cila nuk është autoriteti i vendndodhjes së
paracaktuar. `docs/prompts/faza-0.md` Detyra 0.2 dhe `docs/05-roadmap.md:27`
bazohen në këtë arsyetim dhe duhen rishikuar para se të zbatohen.

**N4, N5, N6, N7, N8 mbeten të hapura** — asnjëra nuk është kritike.

Testi `specDocument.test.ts:167` numëron rastet e `fajr - 10` dhe kërkon ≤ 3.
Pas heqjes së fallback-ut numri ra nga 3 në 2 — testi kalon.
