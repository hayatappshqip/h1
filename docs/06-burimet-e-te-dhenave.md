# 06 — Burimet e të Dhënave dhe Licencat

> Ky dokument ekziston sepse një aplikacion fetar varet nga tri gjëra: **saktësia**, **licenca** dhe **qëndrueshmëria e burimit**.
> Për secilin burim: çfarë është, ku gjendet, çfarë licence ka, çfarë rreziku mbart, çfarë duhet bërë.

Legjenda e statusit:
- ✅ **i qartë** — licenca e njohur, veprimi i bërë
- ⚠️ **veprim i nevojshëm** — licenca e njohur por kërkon një hap
- 🔴 **e pazgjidhur** — licenca e panjohur ose mungon

---

## 1. Teksti i Kuranit

| Fusha | Detajet |
|---|---|
| Ku në repo | `public/quran-corpus-v2-chunked/` — 114 skedarë suresh, 6 236 ajete, 3 038 864 bajt |
| Provenienca (deklaruar në manifest) | `Quran.com API (Translation ID 88 - Hasan Nahi)` |
| Përkthimi shqip | **Hasan Nahi** (Translation ID 88 në Quran.com) |
| Verifikim integriteti | SHA-256 për çdo sure; testi `src/tests/quranChunkedValidation.test.ts` kalon — `2d69e23fa1f5b833…` për `001.json` përputhet me manifestin |
| Licenca | ⚠️ **veprim i nevojshëm** |

**Çfarë thonë kushtet e Quran Foundation (Developer Terms, të lexuara në `api-docs.quran.foundation/legal/developer-terms/`):**
- Licenca është *jo-ekskluzive, e revokueshme, e patransferueshme, e panënlicensueshme*.
- Teksti i Kuranit **nuk modifikohet në asnjë mënyrë**.
- Përmbajtja nuk shitet, nënlicensohet ose rishpërndahet **përveç si pjesë integrale e përvojës së përdoruesit të fundit** të aplikacionit.
- Çdo formë tjetër e rishpërndarjes, veçanërisht tregtare, kërkon **licencë të veçantë me shkrim**.
- Aplikacioni duhet miratuar në platformë, me Privacy Policy që përmban deklaratën se **nuk është aplikacion zyrtar i Quran Foundation**.

**Veprimet:**
1. 🔴 Kërko kredenciale zhvilluesi dhe miratim në platformën e Quran Foundation.
2. 🔴 Shto në Privacy Policy: *"Ky aplikacion është produkt i pavarur dhe nuk është aplikacion zyrtar i Quran Foundation."*
3. ⚠️ Verifiko licencën specifike të përkthimit **Hasan Nahi** — Quran.com shfaq licencën për çdo përkthim; dokumentoje këtu me datë.
4. ⚠️ Ki një **plan B**: nëse miratimi vonon, përdor një përkthim shqip me licensë të hapur (ose merr leje direkte nga trashëgimtarët/botuesi i Hasan Nahit).
5. ✅ Ruaj testet e integritetit — ato janë mbrojtja jote kundër korruptimit të tekstit.

> **Shënim i rëndësishëm:** fakti që korpusi është *bundled* në repo (jo i marrë në kohë reale) e bën këtë "rishpërndarje" në kuptimin e kushteve. Argumenti më i fortë është që shpërndarja është *integrale me përvojën e përdoruesit* dhe *jo-tregtare* — por ky argument duhet konfirmuar me shkrim, jo supozuar.

---

## 2. Faqosja e Mushafit (struktura, jo teksti)

| Fusha | Detajet |
|---|---|
| Ku në kod | `netlify/functions/quran-page.ts` |
| Çfarë merret | **vetëm** `position`, `char_type_name`, `code_v2`, `v2_page`, `line_number`, `page_number` — **pa tekst, pa përkthim, pa audio** |
| Burimi parësor | `https://apis.quran.foundation/content/api/v4/verses/by_page/{n}` me OAuth2 client-credentials |
| Rezerva | `https://api.quran.com/api/v4/...` (publike, pa çelës) |
| Fonti | `verses.quran.foundation/fonts/quran/hafs/v2/woff2/...` + kopje lokale `public/fonts/UthmanicHafs1Ver18.woff2` |
| Licenca | ⚠️ **veprim i nevojshëm** — varet nga miratimi te QF |

**Çfarë është bërë mirë dhe duhet ruajtur:** kufizimi i fushave është një vendim i qëllimshëm dhe i dokumentuar në kodin burimor. Ky minimizim është mbrojtja më e mirë ligjore. Mos e zgjero pa nevojë.

**Shënim teknik i dokumentuar në kod:** fjalët nuk filtrohen sipas faqes sepse një ajet që kalon kufirin e faqes mbart fjalë me `v2_page` të faqes pasuese, dhe përgjigja e faqes pasuese nuk i përsërit. Filtrimi do ta humbiste tekstin përgjithmonë. **Mos e "rregullo" këtë.**

---

## 3. Kohët e namazit

| Fusha | Detajet |
|---|---|
| Ku në kod | `src/services/prayerEngine.ts:119` |
| Burimi aktual | `https://api.aladhan.com/v1/timings/{date}?latitude=..&longitude=..&method=..&school=..` |
| Metoda e parazgjedhur | `method: 13` = **Diyanet İşleri Başkanlığı (Turqi)** — Fajr 18°, Isha 17° |
| Rezerva offline | 🔴 **vlera statike të shkruara përmendësh për Tiranën** (`getFallbackPrayerTimes()`, rreshtat 70–95) |
| Licenca | ✅ AlAdhan API është falas dhe publike |
| Qëndrueshmëria | ⚠️ thirrje nga shfletuesi pa çelës API; pa cache të përhershëm |

### 3.1 Problemi i saktësisë për Ballkanin

Metoda vendore e **Bashkësisë Islame të Kosovës** (sipas metadata-s së publikuar me takvimin zyrtar të RIK-së) përdor:

| Parametri | Vlera |
|---|---|
| Këndi i Sabahut | 18° |
| Këndi i Jacisë | 17° |
| **Temkini** | **1.5° ≈ 6 minuta** (kompensim për reliev malor) |
| **Diferenca Imsak → Sabah** | **20 minuta** |
| Pika referuese | Deçan (42.5 N, 21.0 E) — pika më perëndimore |
| Korrigjime për qytet | Sharri +2, Ferizaj −1, Gjilani −1, Prishtina −1, Podujeva −1, Vushtrria −1, Presheva −2 |

Kodi aktual bën **të kundërtën** për imsakun: `prayerEngine.ts` rreshtat 77, 109, 129 e vendosin imsakun **10 minuta para Sabahut**. Pra ndryshimi praktik ndaj praktikës zyrtare është i rendit 30 minuta në kohën e ndalimit të ngrënies.

Për **Shqipërinë**, burimi zyrtar është kalendari i **Komunitetit Mysliman i Shqipërisë** (KMSH) — publikohet si PDF vjetor (`kmsh.al`). Duhet marrë, konvertuar në JSON dhe dokumentuar këtu.

### 3.2 Burimet zyrtare që duhen futur në repo

| Vend | Autoriteti | Formati | Statusi |
|---|---|---|---|
| Kosovë | Kryesia e BIK-ut | JSON i publikuar nga komuniteti (`drilonjaha/kohet-e-namazit-kosove-json`) me metadata metodologjie | ⚠️ verifiko kundër PDF-it zyrtar të BIK-ut para përdorimit |
| Shqipëri | KMSH | PDF vjetor | 🔴 duhet marrë dhe konvertuar |
| Maqedoni e Veriut | RSM (Reis ul-Ulema) | PDF vjetor | 🔴 duhet marrë dhe konvertuar |
| Mali i Zi | RIMZ | — | 🔴 i panjohur |
| Diaspora | Xhamia vendore | — | 🔴 lejo përdoruesin të fusë oraret manuale |

**Rregulli:** çdo skedar orarësh zyrtarë në `public/timings/` duhet të ketë një skedar shoqërues `_meta.json` me: burimin, URL-në, vitin, datën e marrjes, metodologjinë, licencën/lejen, dhe SHA-256.

### 3.3 Llogaritja lokale (rezerva)

Libraria e rekomanduar: **`adhan`** (npm, MIT, `batoulapps/adhan-js`) — e njëjta familje librariash që përdorin aplikacionet kryesore islame. Mbështet metoda të shumta dhe rregullimin e gjerësive të larta.

**Pse lokal:** heq varësinë nga rrjeti për gjënë më kritike në aplikacion.

---

## 4. Mburoja e Muslimanit (Hisnul Muslim)

| Fusha | Detajet |
|---|---|
| Ku në repo | `src/data/mburojaData.ts` (3 516 rreshta) + `src/data/audioMap.json` (46 032 bajt) |
| Vëllimi (i verifikuar duke importuar modulin) | **11 kategori · 133 kapituj · 294 dua** |
| Boshllëqet (të verifikuara) | 28 pa arabisht · 1 pa shqip · 29 pa transliterim · 5 pa referencë |
| Provenienca e deklaruar në kod | "Seid el-Kahtani (muslimani-ideal.org)" |
| Burimi i të dhënave dhe audio | `BetimShala/mburoja-api` (GitHub) |
| Licenca e tekstit | ⚠️ veprim i nevojshëm |
| Licenca e repos burimore | 🔴 **e pazgjidhur** |

### 4.1 Rreziku ligjor konkret

Kontrolluar më 2026-08-30: repo-ja **`BetimShala/mburoja-api`** në GitHub përmban `.github/workflows`, `audios/`, `.gitignore`, `Dockerfile`, `README.md`, `go.mod`, `go.sum`, `invocations.json`, `main.go` — **dhe asnjë skedar `LICENSE`**. Commit-i i fundit: `921d226` "Enable Cors", 9 shtator 2022. 11 yje, 3 fork-e.

**Pa një skedar licence, e drejta e autorit mbetet ekskluzivisht te autori** — përdorimi i përmbajtjes në një produkt të shpërndarë nuk është i lejuar nga default-i ligjor, pavarësisht se repo-ja është publike.

Të dhënat e Mburojës në këtë aplikacion janë qartësisht të derivuara nga ajo repo: `audioMap.json` përdor emrat e skedarëve `/audios/001_01.mp3` — saktësisht skema e `BetimShala/mburoja-api` — dhe URL-të tregojnë drejtpërdrejt te ajo repo.

### 4.2 Çfarë duhet bërë

1. 🔴 **Kërko leje me shkrim** nga autori i `BetimShala/mburoja-api` për përdorimin e të dhënave dhe audio-ve. Ky është hapi i parë dhe më i lirë.
2. 🔴 **Verifiko licencën e Hisnul Muslim-it** (autor: Sa'id bin Ali bin Wahf el-Kahtani). Libri qarkullon gjerësisht, por përkthimi shqip dhe regjistrimet audio kanë autorë të veçantë. Gjej botuesin shqip (muslimani-ideal.org përmendet në kod) dhe merr leje.
3. ⚠️ **Vetë-prit asetet audio** sapo ke leje — varësia nga një repo personale në GitHub është një pikë e vetme dështimi (shih [`04-rreziqet.md` R5](./04-rreziqet.md)).
4. ⚠️ **Plotëso 63 boshllëqet** dhe shëno çdo dua pa referencë.
5. ✅ **Ruaj referencat** (Buhari/Muslim/Tirmidhi me numra vëllimi/faqeje) — ato janë mbrojtja jote kryesore e saktësisë.

---

## 5. Audio e recitimit të Kuranit

Burimet e referencuara në kod (nga `npm run inventory` → `externalHosts`):

| Referenca | Host | Çfarë | Licenca |
|---|---|---|---|
| **14** | `everyayah.com` | Audio ajet-pas-ajeti | ⚠️ **kërkon atribut** |
| 3 + 2 | `server6..13.mp3quran.net` (8 host-e) | Audio recituesish | ⚠️ e panjohur |
| 3 | `api.alquran.cloud` | Metadata edicionesh audio | ✅ API publike |
| 1 | `cdn.islamic.network` | CDN | ✅ |

### 5.1 everyayah.com

Skedari i deklaratës së tyre (`https://everyayah.com/data/timings_files/000_disclaimer.txt`) thotë:
> "(C) VerseByVerseQuran.com — **You must link back to our site from your product and web-site to use these timings.** … provided as-is."

Dhe sipas dokumentimit të projektit `quran/quran_android`, përmbajtja MP3 nga `everyayah.com` / `versebyversequran.com` trajtohet si **CC-BY-NC** (atribut + jo-tregtare).

**Veprimet:**
1. ⚠️ Shto **link atributimi** te versebyversequran.com në ekranin "Rreth" — kjo është kërkesë e shprehur.
2. ⚠️ Konfirmo që aplikacioni mbetet **jo-tregtar** (pa pagesa, pa reklama) ose merr leje tregtare.
3. 🔴 Kontakto për konfirmim me shkrim nëse planifikon shkarkim lokal të audio-ve.

### 5.2 mp3quran.net

Tetë host-e të ndryshme (`server6` … `server13`), të referencuara në `src/data/audioMap.json` dhe komponentët e audio-ve.

**Rreziqet:**
- Asnjë licensë e dokumentuar në këtë repo.
- Tetë host-e = tetë pika dështimi.
- Emrat e host-eve me numra sugjerojnë infrastrukturë që ndryshon shpesh.

**Veprim:** 🔴 verifiko kushtet e mp3quran.net për përdorim në aplikacione; ⚠️ zvogëlo në 2–3 recitues të vetë-pritur me leje të qartë.

---

## 6. Tefsiri dhe përkthimet shtesë

| Burimi | Ku | Licenca |
|---|---|---|
| Quran.com API (përkthime, tefsir) | `src/components/AyahOfTheDay.tsx:98`, `HifzLearnView.tsx:64` | ⚠️ si §1 |
| `quranenc.com` | `grep` në `src/` | ⚠️ verifiko |
| Burimet e tefsirit (sq/en/ar) | `src/services/quran/tafsirService.ts` | 🔴 dokumento burimin për secilin |

**Veprim:** 🔴 shto një fushë `source` dhe `license` në `TAFSIR_SOURCES` të `tafsirService.ts`, dhe shfaqe në UI. Përdoruesi ka të drejtë të dijë kush e ka shkruar tefsirin që po lexon.

---

## 7. Libraria që do të shtohen

| Libraria | Për | Licenca | Statusi |
|---|---|---|---|
| `adhan` (npm, `batoulapps/adhan-js`) | Llogaritje lokale e orareve | **MIT** | ✅ e përshtatshme |
| `@capacitor/core` + `@capacitor/local-notifications` | Botim si app | **MIT** | ✅ e përshtatshme |
| `@supabase/supabase-js` | Sinkronizim opsional | **MIT** | ✅ e përshtatshme |

---

## 8. Lista kontrolluese ligjore (para çdo botimi publik)

- [ ] Skedar `LICENSE` në rrënjë të repos (🔴 mungon)
- [ ] Privacy Policy me deklaratën e Quran Foundation (🔴 mungon)
- [ ] Terms of Use (🔴 mungon)
- [ ] Miratim i aplikacionit në platformën e Quran Foundation (🔴)
- [ ] Leje me shkrim për `BetimShala/mburoja-api` (🔴)
- [ ] Leje/konfirmim për përkthimin Hasan Nahi (🔴)
- [ ] Link atributimi te versebyversequran.com (⚠️)
- [ ] Dokumentim i licencës së çdo recituesi audio (🔴)
- [ ] Takvimet zyrtare KMSH / BIK / RSM me leje dhe SHA-256 (🔴)
- [ ] Rishikim i përmbajtjes fetare nga person i kualifikuar, me nënshkrim (🔴)
- [ ] Konfirmim që aplikacioni është jo-tregtar (ose licencë tregtare) (⚠️)
- [ ] GDPR: baza ligjore, rajoni i serverit, e drejta e fshirjes (nëse shtohet llogari) (🔴)

---

## 9. Rregulli i përgjithshëm

> **Nëse nuk e di licencën, mos e shpërndaj.**
>
> Një aplikacion fetar që shpërndan përmbajtje pa leje e humbet autoritetin moral që e bën të dobishëm. Kjo nuk është formalitet ligjor — është pjesë e produktit.
