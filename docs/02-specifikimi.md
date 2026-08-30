# 02 — Specifikimi i Produktit "Hayat"

> Ky është specifikimi funksional. Për pjesën teknike shih [`03-arkitektura.md`](./03-arkitektura.md).
> Çdo kërkesë ka një ID (`FR-x.y`) që duhet cituar në commit-e, teste dhe PR.

---

## 1. Vizioni

**Një fjali:** Hayat e bën jetën e përditshme të një muslimani shqipfolës të matshme — namazi, Kurani, dhikri dhe lutjet bëhen gjë që shihet, jo vetëm që ndihet.

**Çfarë e bën të ndryshëm nga Muslim Pro / Pillars:**
1. **Shqip si gjuhë e parë**, jo si përkthim i shtuar — duke përfshirë transliterim për atë që nuk lexon arabisht.
2. **Oraret e autoritetit vendor** (KMSH / BIK / RSM), jo një metodë e përgjithshme.
3. **Local-first**: të dhënat fetare të një njeriu nuk janë produkt për t'u shitur. Aplikacioni funksionon plotësisht pa rrjet.
4. **Hifz i strukturuar**, jo thjesht një lexues.

**Kufiri i produktit (çfarë NUK është):**
- Nuk është platformë fetare për fetva ose interpretim.
- Nuk është rrjet social. Nuk ka komente, pëlqime, ndjekës.
- Nuk shet të dhëna dhe nuk shfaq reklama.
- Nuk zëvendëson takvimin zyrtar të xhamisë — dhe duhet ta thotë këtë në UI.

---

## 2. Personat

### P1 — Besniku i rregullt (35–60 vjeç, Ballkan)
Lexon shqip dhe pak arabisht. Fshiu i telefonit mbushet shpejt, rrjeti herë pas here. Do: oraret e sakta sipas xhamisë së tij, dhikrin pas namazit, hatme në Ramazan. **Kërkesa kryesore: saktësi dhe thjeshtësi.**

### P2 — Diaspora (20–40 vjeç, Gjermani/Zvicër/Itali/MB)
Shqip në shtëpi, punon në një gjuhë tjetër. Jeton në gjerësi gjeografike ku Isha është problem në verë. Do: oraret e qytetit të vet, jo të Tiranës; njoftim që funksionon kur app-i është i mbyllur. **Kërkesa kryesore: vendndodhje e saktë + push notifications.**

### P3 — Studenti i hifzit (12–25 vjeç)
Memorizon me murabbi. Do: plan ditor, rishikim që nuk e harron, vlerësim të recitimit, ndarje Manzil. **Kërkesa kryesore: disiplinë e matshme.**

### P4 — Muslimani që po kthehet (25–45 vjeç)
Nuk fal namaz rregullisht. Nuk do të ndihet i turpëruar nga një "streak" i thyer. Do: progres pa gjykim. **Kërkesa kryesore: dizajn që nuk dënon.**

> P4 është personi që shumica e app-eve islame e humbin. Kërkesa FR-0.3 më poshtë vjen prej tij.

---

## 3. Parimet e produktit (të detyrueshme për çdo vendim)

| # | Parimi | Si zbatohet konkretisht |
|---|---|---|
| PR-1 | **Offline është gjendja e parë, jo gjendja e jashtëzakonshme** | Çdo ekran duhet të hapet dhe të tregojë të dhëna pa rrjet. Rrjeti vetëm rifreskon. |
| PR-2 | **Të dhënat janë të përdoruesit** | Export/import JSON ekzistues; asnjë telefonatë shtëpie pa veprim të përdoruesit. |
| PR-3 | **Kur nuk jemi të sigurt, e themi** | Nëse oraret janë të përafërta, shfaqet një banderolë. Asnjëherë saktësi e rreme. |
| PR-4 | **Progresi nuk dënon** | Nuk ka "streak të thyer" me ngjyrë të kuqe. Ka "u riktheve sot". |
| PR-5 | **Teksti fetar verifikohet nga makinë** | Testet e integritetit (SHA-256, numri i ajeteve) nuk hiqen kurrë. |
| PR-6 | **Autoriteti vendor fiton mbi metodën e përgjithshme** | Kur ekziston takvim zyrtar (KMSH/BIK), ai përdoret si burim; llogaritja është rezervë. |

---

## 4. Kërkesat funksionale

### Moduli 0 — Thelbi (kryqëzor)

| ID | Kërkesa | Prioritet | Gjendja |
|---|---|---|---|
| FR-0.1 | Aplikacioni hapet dhe tregon ekranin "Kreu" pa rrjet, nën 2 s në një telefon mesatar | P0 | ✅ ekziston (korpus lokal) |
| FR-0.2 | Përdoruesi zgjedh vendndodhjen me **3 mënyra**: GPS, kërkim qyteti, koordinata manuale | P0 | ❌ mungon (G1) |
| FR-0.3 | Asnjë ekran nuk shfaq mesazh ndëshkues për mungesë | P0 | ⚠️ të verifikohet |
| FR-0.4 | Data hixhri shfaqet në kreun e çdo ekrani, me mundësi korrigjimi ±1/±2 ditë | P1 | ❌ mungon (G6) |
| FR-0.5 | Export/import i plotë i të dhënave si JSON, i lexueshëm nga njeriu | P0 | ✅ ekziston (të verifikohet plotësia) |
| FR-0.6 | Aplikacioni install-ohet si PWA në iOS dhe Android me ikona maskable | P0 | ✅ ekziston |

### Moduli 1 — Namazi

| ID | Kërkesa | Prioritet | Gjendja |
|---|---|---|---|
| FR-1.1 | Oraret për çdo datë, për çdo vendndodhje, me metodë të zgjedhshme | P0 | ✅ ekziston |
| FR-1.2 | **Burim zyrtar vendor** kur ekziston: KMSH (Shqipëri), BIK (Kosovë), RSM (Maqedoni e Veriut) | P0 | ❌ mungon |
| FR-1.3 | Imsaku merret nga burimi zyrtar; **nuk nxirret si "Sabah − 10 min"** | P0 | ❌ thyer (G2) |
| FR-1.4 | Kur përdoret llogaritje rezervë, shfaqet banderolë: "Kohë e përafërt — kontrollo takvimin e xhamisë" | P0 | ❌ mungon (G3) |
| FR-1.5 | Rregullim manual ± minuta për çdo namaz (ekziston) + ruajtje si "profili i xhamisë sime" | P1 | ⚠️ pjesërisht |
| FR-1.6 | Njoftim që funksionon kur app-i është i mbyllur (Push / Notification Service Worker) | P0 | ❌ mungon (G4) |
| FR-1.7 | Regjistrim i faljes: vendndodhje, xhemat/vetjak, në kohë/kaza | P1 | ⚠️ kaza mungon (G10) |
| FR-1.8 | Namazet e lëna → listë borxhi me plan shlyerjeje | P2 | ❌ mungon |
| FR-1.9 | Kibla me kompas + kalibrim të udhëzuar | P1 | ✅ ekziston (kalibrimi të shtohet) |
| FR-1.10 | Zëri i ezanit i zgjedhshëm, me shkarkim lokal opsional | P2 | ⚠️ vetëm chime i gjeneruar |
| FR-1.11 | Rregull për gjerësi të larta (mbi 48°): zgjedhje e metodës (angle-based / 1/7 natës / profili i vendit) | P1 | ❌ mungon |

### Moduli 2 — Kurani (lexim & hatme)

| ID | Kërkesa | Prioritet | Gjendja |
|---|---|---|---|
| FR-2.1 | Mushaf 604-faqësh me faqosje të vërtetë | P0 | ✅ ekziston |
| FR-2.2 | Përkthim shqip (Hasan Nahi) + arabisht + anglisht, të ndërrueshëm | P0 | ✅ ekziston |
| FR-2.3 | Kërkim lokal i plotë pa rrjet | P0 | ✅ ekziston (Web Worker) |
| FR-2.4 | Tefsir i zgjedhshëm | P1 | ✅ ekziston (3 burime) |
| FR-2.5 | Hatme me plan ditor, arkivim, rifillim | P0 | ✅ ekziston |
| FR-2.6 | Shënjues dhe shënime për ajet | P1 | ✅ ekziston |
| FR-2.7 | Recitim audio me zgjedhje prej ≥8 recituesve | P1 | ✅ ekziston (host-e të shumta) |
| FR-2.8 | Audio **e shkarkueshme** për suren aktuale (offline) | P2 | ❌ mungon |
| FR-2.9 | Theksim texhvidi | P2 | ✅ ekziston (`src/utils/tajweed.tsx`) |
| FR-2.10 | Modalitet "vetëm lexim" me ndërfaqe të fshehur automatikisht | P2 | ✅ ekziston (i testuar) |
| FR-2.11 | Ajeti i ditës me burim lokal (jo API) | P1 | ⚠️ përdor API-n e Quran.com — të bëhet lokal |

### Moduli 3 — Hifz

| ID | Kërkesa | Prioritet | Gjendja |
|---|---|---|---|
| FR-3.1 | Plan ditor me limit ajetesh të reja | P0 | ✅ ekziston (`dailyNewAyahLimit`) |
| FR-3.2 | Përsëritje e ndërprerë me forcë, intervale, dështime | P0 | ✅ ekziston |
| FR-3.3 | Rishikim Manzil (7 ndarje) | P1 | ✅ ekziston |
| FR-3.4 | Regjistrim i vetë-recitimit dhe dëgjim mbrapsht | P1 | ✅ ekziston |
| FR-3.5 | Ushtrim mutashabihat (ajetet e ngjashme) | P2 | ✅ ekziston |
| FR-3.6 | Raport për murabbian (eksport PDF/JSON) | P2 | ❌ mungon |
| FR-3.7 | Vlerësim automatik i saktësisë së recitimit me zë | P3 | ❌ mungon — **shih rrezikun R7** |

### Moduli 4 — Mburoja (Hisnul Muslim)

| ID | Kërkesa | Prioritet | Gjendja |
|---|---|---|---|
| FR-4.1 | 11 kategori / 133 kapituj / 294 dua | P0 | ✅ ekziston |
| FR-4.2 | Çdo dua ka: arabisht, shqip, transliterim, numër përsëritjeje, referencë | P0 | ⚠️ **63 boshllëqe** |
| FR-4.3 | Numërues për dhikër me dridhje/zë | P0 | ✅ ekziston |
| FR-4.4 | Kapituj të preferuar + dua të ruajtura | P1 | ✅ ekziston |
| FR-4.5 | Audio për çdo dua, me burim të qëndrueshëm (jo repo personale në GitHub) | P1 | ⚠️ 3 host-e kaskadë, pa licensë |
| FR-4.6 | Dhikri i mëngjesit/mbrëmjes me njoftim | P1 | ⚠️ njoftimi varet nga G4 |
| FR-4.7 | Modalitet "një dorë" — butona të mëdhenj për numërim gjatë ecjes | P2 | ❌ mungon |

### Moduli 5 — Dita Ime

| ID | Kërkesa | Prioritet | Gjendja |
|---|---|---|---|
| FR-5.1 | Listë ditore me prioritete | P0 | ✅ ekziston |
| FR-5.2 | Gjurmues agjërimi: e hënë, e enjte, Ditët e Bardha | P1 | ✅ ekziston (hixhri me `Intl`) |
| FR-5.3 | Pamje e ditës e lidhur me oraret (çfarë mbetet sot) | P1 | ✅ ekziston |
| FR-5.4 | Synime javore/mujore me përmbledhje | P2 | ⚠️ vetëm mujore për namazin |
| FR-5.5 | Ramazan: Teravi, iftar, synime ditore | P2 | ❌ mungon (G7) |
| FR-5.6 | Llogaritës zekati dhe gjurmues sadakaje | P3 | ❌ mungon (G8) |

### Moduli 6 — Llogaria & sinkronizimi (opsional)

| ID | Kërkesa | Prioritet | Gjendja |
|---|---|---|---|
| FR-6.1 | Aplikacioni plotësisht i përdorshëm **pa** llogari | P0 | ✅ ekziston |
| FR-6.2 | Hyrje opsionale (email magic-link ose Apple/Google) | P1 | ❌ mungon (G5) |
| FR-6.3 | Sinkronizim i fundit-fiton me shenjë kohore për çdo regjistër | P1 | ❌ mungon |
| FR-6.4 | Zgjidhje e konflikteve e dukshme për përdoruesin (jo e fshehur) | P2 | ❌ mungon |
| FR-6.5 | Fshirje e llogarisë = fshirje e të dhënave brenda 30 ditësh, me konfirmim me email | P0 (nëse shtohet) | ❌ mungon |

---

## 5. Kërkesat jo-funksionale

| ID | Kërkesa | Synimi | Si matet |
|---|---|---|---|
| NFR-1 | Koha e parë e hapjes (cold start) në 4G | < 3.5 s | Lighthouse / WebPageTest |
| NFR-2 | Madhësia e JS-it fillestar | < 250 kB gzip | dalja e `vite build` (tani: 394 kB) |
| NFR-3 | Çdo ekran funksionon offline | 100 % e moduleve | test manual + test automatik me rrjet të shkëputur |
| NFR-4 | Asnjë të dhënë personale nuk del nga pajisja pa veprim të përdoruesit | 0 kërkesa me PII | rishikim i `fetch`-ave |
| NFR-5 | Madhësia totale e PWA-së së instaluar | < 25 MB | `Application → Storage` në DevTools |
| NFR-6 | Kontrast minimal | WCAG AA (4.5:1) | audit i kontrastit |
| NFR-7 | Koha e përgjigjes së prekjes | < 100 ms | profilim |
| NFR-8 | Testet e integritetit të tekstit kuranor | kalojnë gjithmonë në CI | `npm test` |
| NFR-9 | Përkrahje | Chrome/Edge/Safari/Firefox, 2 versionet e fundit + iOS 16+, Android 10+ | matricë testimi |

---

## 6. Metrikat e suksesit

| Metrika | Synimi 90 ditë | Pse kjo |
|---|---|---|
| Përdorues ditor / të instaluar (DAU/MAU) | > 0.35 | Tregon se app-i është zakon, jo kuriozitet |
| % e përdoruesve me ≥1 namaz të regjistruar/ditë | > 60 % | Mat vlerën thelbësore |
| Hapje nga njoftim | > 40 % e hapjeve | Vërteton se G4 ia vlen |
| Ruajtje D30 | > 25 % | Aplikacionet fetare kanë natyrë sezonale (Ramazan) — D30 është matësi i ndershëm |
| Instalime PWA → "shto në ekranin kryesor" | > 20 % | Tregon se PWA-ja po sillet si app |
| Raportime për orar të gabuar | 0 në muaj | **Metrika më e rëndësishme.** Një orar i gabuar e vret besimin përgjithmonë. |

---

## 7. Jashtë fushëveprimit (të deklaruar qëllimisht)

- Fetva, chat me dijetarë, forum.
- Rrjet social, ndjekës, komente publike.
- Reklama, ndjekje, shitje të dhënash.
- Pagesa brenda app-it në versionin e parë.
- Gjuhë përveç shqipes në v1 (arkitektura duhet ta lejojë, shih FR-i18n në [`05-roadmap.md`](./05-roadmap.md)).
- Vlerësim i recitimit me AI (FR-3.7) — **shtyhet deri në Fazën 6**, për arsyet e [`04-rreziqet.md` R7](./04-rreziqet.md).
