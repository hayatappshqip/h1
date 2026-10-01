# Licenca dhe atributimi

**Lexoje këtë para se ta shpërndash publikisht.** Kjo paketë përmban material
të mbrojtur nga e drejta e autorit që vjen nga **tri burime të ndryshme**, secili
me status të ndryshëm ligjor. Nuk kam mundur t'i verifikoj të gjitha lejet — aty
ku nuk jam i sigurt, e them shprehimisht.

---

## 1. Teksti — libri (statusi: i mbrojtur, shpërndarje falas e zakonshme)

Përdorur për: `title`, `arabic`, `transliteration`, `albanian`, `notes`, `count`, `lead`.

```
Titulli          Mburoja e Muslimanit (Dhikri i Kuranit dhe Sunetit)
Titulli origjinal حصن المسلم من أذكار الكتاب والسنة
Autor            Seid b. Ali b. Vehf El Kahtani
Përktheu         Azem Bardhoshi
Redaktor fetar   Ismail Bardhoshi
Redaktor gjuhësor Ilir E. Haxhiaj
Përgatitja kompjuterike dhe transkriptimi  Jusuf Kastrati
Botuesi          Shembulli, botimi i parë, qershor 2017
ISBN             978-9951-732-07-9
```

**Çfarë kam verifikuar:**

- Vetë libri, në faqen e fundit, shkruan: *"Versionin elektronik të këtij libri
  mund ta gjeni në faqen: www.islamhouse.com"*. Pra botuesi e ka miratuar
  shpërndarjen elektronike nëpërmjet asaj faqeje.
- Skedari që përdora është ai zyrtar:
  `https://d1.islamhouse.com/data/sq/ih_books/single/sq_mburoja_muslimanit.docx`
  (8.1 MB, DOCX, i shkarkuar më 30 shtator 2026). Faqja e librit te islamhouse
  ofron katër bashkëngjitje: tri PDF dhe këtë DOCX.
- islamhouse.com shpërndan përmbajtje islame falas dhe zakonisht lejon
  rishpërndarjen jofitimprurëse me atributim.

**Çfarë NUK kam verifikuar:**

- Nuk arrita ta lexoj një faqe kushtesh të përdorimit të islamhouse — kërkesa
  për `/en/terms/` kthen `404`. Pra **nuk kam një leje të shkruar** që ta
  ripërpunoj tekstin në një format të ri dhe ta shpërndaj.
- Nuk kam leje nga botuesi (Shembulli) apo përkthyesi (Azem Bardhoshi).

**Rreziku praktik:** i ulët për përdorim jofitimprurës me atributim — kjo është
pikërisht mënyra si përmbajtja islame qarkullon në shqip dhe islamhouse e inkurajon
atë. Por **formati i derivuar** (kjo paketë JSON) është një vepër e derivuar, dhe
për një produkt publik, veçanërisht nëse ka të ardhura, duhet leje e shprehur.

**Kënd të kontaktosh:**

| Kush | Pse |
|---|---|
| islamhouse.com — faqja e kontaktit, ose përmes faqes së librit `islamhouse.com/en/books/354804/` | Ata e shpërndajnë versionin elektronik dhe janë pika e parë për leje |
| Botuesi **Shembulli** (Prishtinë) — ISBN 978-9951-732-07-9 | Mbajtësi i të drejtave për botimin shqip |
| Përkthyesi **Azem Bardhoshi** / redaktori **Ismail Bardhoshi** | Nëse botuesi nuk përgjigjet |

---

## 2. Incizimet MP3 — statusi: **i pasigurt** ⚠️

> **Përditësim për versionin 2.0.0:** çdo rrugë e referuar në `mburoja.json`
> zgjidhet tani në një skedar real (`valido_strikt.py` kontrolli [4], kodi i
> daljes 0). Versioni 1.0.0 referonte 82 rrugë ndërsa në disk ishin 69 — 13 ishin
> të thyera. Ato u trajtuan kështu:
>
> - **2 u shpëtuan** (`015_03.mp3`, `023_01.mp3`) — ekzistonin në repo por nuk
>   ishin kopjuar kurrë;
> - **11 u bënë `audio: null`** — `invocations.json` i repo-s i referon, por
>   skedarët **nuk ekzistojnë askund**. Nuk ka burim alternativ: u verifikua që
>   asnjë skedar i lirë nuk mbetet në repo për kapitujt 15–29. Secila është
>   shënuar me `audio_mungon_arsye`.
>
> Numri real është pra **71 MP3 / 70 hyrje me audio**, jo 82. Hapi `siguro_audio()`
> në `rregullo.py` e verifikon këtë në disk në çdo ndërtim.
>
> **Problemi i mbetur nuk është teknik por ligjor:** origjina e vetë incizimeve
> mbetet e pavërtetuar. Gjithçka më poshtë vazhdon të jetë në fuqi.

Përdorur për: `audio`, `audio_parts`, dosja `audios/` (71 skedarë, 14.6 MB).

Këto vijnë nga repo-ja `github.com/BetimShala/mburoja-api`, direktorja `audios/`.

**Problemi:** repo-ja **nuk ka skedar `LICENSE`** (e verifikova përmes API-së së
GitHub: `"license": null`). Sipas të drejtës së autorit, mungesa e licencës do
të thotë *"të gjitha të drejtat e rezervuara"* — fakti që repo-ja është publike
nuk jep të drejtë kopjimi apo rishpërndarjeje.

**Origjina e vetë incizimeve është e panjohur.** Nga metadatat e skedarëve:

| Skedari | Tag / metadatë | Çfarë tregon |
|---|---|---|
| `001_02.mp3`, `001_03.mp3`, `036_03.mp3` | `TALB = "Kalamullah.com"` | faqe e palës së tretë, jo botuesi i librit |
| `001_01.mp3` | XMP: `Adobe Audition 4.0.0.1815`, datë `2011-10-19` | incizim i **2011**, gjashtë vjet *para* botimit shqip (2017) |
| 216 nga 219 skedarët | vetëm `TCON` (zhanri) | pa artist, pa titull, pa album |

Pra audio-ja **nuk** është prodhuar për këtë botim. Është grumbulluar nga burime
të ndryshme dhe repo-ja nuk jep asnjë atributim.

**Rekomandimet e mia, sipas rendit të preferencës:**

1. **Për përdorim vetjak ose brenda një aplikacioni privat** — vazhdo, rreziku
   është i papërfillshëm.
2. **Për një aplikacion publik** — ki kujdes. Mundësitë, nga më e mira:
   - **Kërko leje** nga autori i repo-s (`BetimShala` në GitHub) dhe, nëse ai
     nuk e di origjinën, nga `kalamullah.com`.
   - **Zëvendësoje audio-n** me incizime të licencuara qartë. Burimi më i mirë
     që gjeta: **`rn0x/Adhkar-json`** — ka një MP3 për çdo dhikr veç e veç,
     me lexues të përmendur (حمد الدريهم / Hamad Al-Duraihim), dhe ka pikërisht
     kategoritë që të duhen: *أذكار الصباح والمساء*, *أذكار النوم*,
     *الأذكار بعد السلام من الصلاة*. Repo-ja është e arkivuar (2023) por
     skedarët janë të shkarkueshëm. Kontrollo licencën edhe atje.
   - **Gjenero audio vetë** — për kapitujt 15–29 kjo janë 103 hyrje; një
     lexues shqiptar mund t'i incizojë brenda disa orësh, dhe atëherë të drejtat
     janë të tuat.
3. **Në çdo rast, ruaj atribuimin** në një skedar `ATTRIBUTION` brenda
   aplikacionit, edhe kur origjina është e pasigurt — kjo tregon vullnet të mirë
   dhe e bën më të lehtë korrigjimin nëse dikush paraqet një kërkesë.

---

## 3. `albanian_alt` — përkthimi i tretë (statusi: i panjohur)

Kjo fushë përmban përkthimin shqip të `mburoja-api`. Verifikimi tregoi se
përputhet vetëm **1.9 %** fjalë-për-fjalë me botimin zyrtar, pra **nuk** është
përkthimi i Azem Bardhoshit. Është një përkthim i tretë, me burim të
padeklaruar — repo-ja nuk thotë askund nga e ka marrë.

Statusi ligjor: i njëjtë si audio-ja, pra i pasigurt. Mos e shfaq si tekst
kryesor. Nëse nuk të duhet, fshije fushën:

```bash
python3 - <<'EOF'
import json
p='data/mburoja.json'; d=json.load(open(p,encoding='utf-8'))
for c in d['chapters']:
    for i in c['items']: i.pop('albanian_alt', None)
json.dump(d, open(p,'w',encoding='utf-8'), ensure_ascii=False, indent=1)
print('u hoq albanian_alt')
EOF
```

---

## 4. Kodi i kësaj pakete

Skriptet në `scripts/`, `shembull/index.html` dhe dokumentacioni janë puna ime
për këtë projekt. Përdori, ndryshoji dhe shpërndaji lirisht — por **jo të
dhënat që ato prodhojnë**, të cilat mbeten nën kushtet e seksioneve 1–3.

---

## Atributim i gatshëm për aplikacionin tënd

Vendose në një faqe "Rreth" ose në `ATTRIBUTION`:

```
Mburoja e Muslimanit (Dhikri i Kuranit dhe Sunetit)
Autor:        Seid b. Ali b. Vehf El Kahtani
Përktheu:     Azem Bardhoshi
Redaktor fetar: Ismail Bardhoshi
Redaktor gjuhësor: Ilir E. Haxhiaj
Transkriptimi: Jusuf Kastrati
Botuesi:      Shembulli, botimi i parë, qershor 2017
ISBN:         978-9951-732-07-9
Versioni elektronik: islamhouse.com
```

Dhe, nëse e mban audio-n:

```
Incizimet: github.com/BetimShala/mburoja-api — origjina e saktë e
lexuesve është e pavërtetuar; disa skedarë mbajnë tag-un Kalamullah.com.
```

---

## Përmbledhje

| Komponenti | Burimi | Statusi | Përdorim publik? |
|---|---|---|---|
| Titujt, arabikja, transkriptimi, përkthimi, poshtëshënimet | DOCX zyrtare, islamhouse.com | i mbrojtur, shpërndarje falas e zakonshme | ⚠️ me atributim; kërko leje për produkt komercial |
| MP3-të (71 skedarë) | repo pa licencë, origjinë e tretë | **i pasigurt** | ⚠️ kërko leje ose zëvendësoje |
| `albanian_alt` | repo pa licencë, përkthim i tretë | **i pasigurt** | ❌ hiqe, ose kërko leje |
| Skriptet, shembulli, dokumentacioni | kjo paketë | e lirë | ✅ po |

**Gjëja më e rëndësishme:** mos e lësho aplikacionin publik pa një faqe
atributimi. Edhe nëse leja formale mungon, atributimi i qartë është ndryshimi
mes një gabimi të ndershëm dhe një shkeljeje të qëllimshme.
