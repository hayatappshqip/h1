# Prompti — Faza 1: Offline i Vërtetë + Baza Ligjore

> **Parakusht:** Faza 0 e përfunduar dhe e verifikuar.
> Kopjo kutinë më poshtë si mesazhin e parë. Kohëzgjatje: ~2 javë.

---

```
Ti po punon në repo-n "hayat-app" (Hayat – Jeta Islame). Faza 0 është e
përfunduar: oraret llogariten lokalisht me `adhan`, imsaku nuk nxirret me
zbritje fikse, dhe ekziston banderola për kohë të përafërta.

LEXO SË PARI:
  - docs/01-gjendja-aktuale.md
  - docs/03-arkitektura.md  (§7 Strategjia offline, §3 Burimet e orareve)
  - docs/04-rreziqet.md     (R3, R4, R5)
  - docs/06-burimet-e-te-dhenave.md

Misioni: aplikacioni të mbijetojë në iOS (ruajtja e të dhënave) dhe të
funksionojë për përdoruesin jashtë Ballkanit, pa rrjet.

=====================================================================
RREGULLA
=====================================================================
1. Nuk rishkruan asgjë. Nuk ndryshon stack-un.
2. Para çdo commit-i: npm run lint && npm test && npm run build.
   Testet që kalojnë nuk bien nën numrin e Fazës 0.
3. Mos i prek: src/components/quran/mushaf/, src/services/hifzScheduler.ts,
   public/quran-corpus-v2-chunked/.
4. Një detyrë = një commit, mesazhi fillon me ID-në (p.sh. "F1.1: ...").
5. Dependenci të lejuara: asnjë e re pa justifikim me një rresht.

=====================================================================
DETYRA 1.1 — Ruajtje e përhershme (kritike për iOS)
=====================================================================
Safari/iOS pastron IndexedDB për origin-et pa ruajtje të përhershme,
zakonisht pas 7 ditësh pa përdorim. Përdoruesi humb hifzin.

Kontrollo vetë: grep -rn "storage.persist" src/  → duhet të jetë 0 rezultate.

BËJ:
a) Krijo src/core/db/persistentStorage.ts me:
   - requestPersistentStorage(): kërkon navigator.storage.persist()
   - getStorageEstimate(): kthen navigator.storage.estimate()
   - isStoragePersistent(): kthen navigator.storage.persisted()
b) Thirre në nisje (src/main.tsx ose App.tsx), jo në çdo renderim.
c) Shto seksion në SettingsView.tsx: "Ruajtja e të dhënave" që tregon
   gjendjen (✅ e përhershme / ⚠️ e përkohshme) dhe hapësirën e përdorur
   ("Hayat përdor 12.4 MB").
d) Nëse persist() refuzohet, shfaq udhëzim të butë për të bërë backup.

KRITERI: test i ri me mock të navigator.storage që vërteton thirrjen dhe
trajtimin e refuzimit.

=====================================================================
DETYRA 1.2 — Zgjedhje vendndodhjeje me 3 mënyra
=====================================================================
Gjendja: src/components/SettingsView.tsx rreshtat 181–213 ka një <select>
me vetëm 3 qytete (Tiranë, Prishtinë, Shkup), me koordinata hardcoded.
Përdoruesi në Berlin merr oraret e Tiranës.

BËJ:
a) Krijo src/core/geo/citiesDataset.ts + një JSON të ngjeshur në
   public/geo/cities.json me të paktën 3 000 qytete (Evropë + SHBA +
   Kanada + Australi + Turqi + Ballkan i plotë). Fushat: name, nameLocal,
   country, countryCode, lat, lng, tz, pop.
   Burim i lejueshëm: GeoNames "cities500" (CC-BY 4.0) ose SimpleMaps
   worldcities (CC-BY 4.0). DOKUMENTO burimin dhe licencën në një skedar
   public/geo/SOURCE.md brenda vetë dosjes.
b) Shto kërkim me fuzzy-match që funksionon OFFLINE (pa API). Duhet të
   gjejë "Mynih", "München", "Munich" si të njëjtin qytet. Përdor
   normalizim diakritikësh (shih src/utils/arabicUtils.ts për frymëzim).
c) Shto tri mënyra zgjedhjeje: GPS (navigator.geolocation), kërkim,
   koordinata manuale.
d) Ruaj vendndodhjen në PrayerSettings me fushën `source: 'gps'|'search'|'manual'`.
e) Ruaj timezone-in dhe përdore për llogaritjen e orareve (adhan kërkon
   Date në timezone-in e duhur).

KRITERI:
  - Test: kërkimi "Mynih" dhe "München" kthen të njëjtin qytet.
  - Test: me koordinatat e Berlinit (52.52, 13.405) oraret ndryshojnë
    nga ato të Tiranës.
  - Kërkimi funksionon me rrjet të shkëputur.

=====================================================================
DETYRA 1.3 — Rregull për gjerësi të larta
=====================================================================
Mbi ~48° gjerësi, në verë Isha nuk ndodh astronomikisht. Aplikacionet
që nuk e trajtojnë këtë shfaqin "00:00" ose bosh — dhe përdoruesi në
Oslo, Stokholm, Londër ose Hamburg mbetet pa përgjigje pikërisht në
muajt kur pyet më shumë.

BËJ:
a) Në src/core/timings/, shto trajtim të gjerësive të larta me tri opsione
   të zgjedhshme nga përdoruesi:
     - 'angle-based'   (këndet e metodës, edhe nëse kërkon kohë të gjata)
     - 'seventh-night' (1/7 e natës — zgjidhja e përdorur gjerësisht në Evropë)
     - 'nearest-city'  (profili i një qyteti më në jug)
b) Zbato rregullin automatikisht kur gjerësia > 48°, me parazgjedhje
   'seventh-night', dhe shfaq një shënim shpjegues në UI.
c) Shto në PrayerSettings fushën `highLatitudeRule`.

KRITERI: test për Oslo (59.91 N) më 21 qershor — Isha nuk është bosh,
nuk është "00:00", dhe është pas Akshamit.

=====================================================================
DETYRA 1.4 — Takvim zyrtar vendor
=====================================================================
BËJ:
a) Krijo strukturën public/timings/{source}/{year}.json + _meta.json.
   _meta.json duhet të ketë: source, sourceUrl, year, retrievedAt,
   methodology { fajrAngle, ishaAngle, temkinMinutes, imsakToFajrMinutes,
   referencePoint }, cityOffsets, license, sha256.
b) Krijo src/core/timings/officialProvider.ts që lexon këta skedarë dhe
   kthen oraret me `source: 'official'`.
c) Krijo src/core/timings/resolver.ts me hierarkinë:
     1. officialProvider (nëse ka të dhëna për vendndodhjen+vitin)
     2. localCalculation (adhan)
     3. aladhanApi (vetëm nëse ka rrjet)
   Çdo hap shënon `source` dhe `isApproximate`.
d) Për Kosovën përdor parametrat e BIK-ut: Fajr 18°, Isha 17°,
   temkin 1.5° ≈ 6 min, diferenca Imsak→Sabah = 20 min, pika referuese
   Deçan (42.5 N, 21.0 E), me korrigjimet për qytet: Sharri +2, Ferizaj -1,
   Gjilani -1, Prishtina -1, Podujeva -1, Vushtrria -1, Presheva -2.
e) Për Shqipërinë dhe Maqedoninë e Veriut, krijo VETËM strukturën dhe një
   skedar shembull me të dhëna të qarta si PLACEHOLDER. Mos shpik orare.
   Shkruaj në docs/06-burimet-e-te-dhenave.md se çfarë mbetet për t'u marrë.

KRITERI:
  - Test: për Prishtinë më 2026-01-01, diferenca Imsak→Sabah është 20 minuta.
  - Test: hierarkia kthehet te llogaritja lokale kur nuk ka skedar zyrtar.
  - Asnjë orar i shpikur: çdo skedar zyrtar ka _meta.json me burim të vërtetë.

=====================================================================
DETYRA 1.5 — Kujtesë për backup (pa frikë)
=====================================================================
Nëse kalon 30 ditë pa backup (regjistro `lastBackupAt` në meta), shfaq
një kartelë të butë një herë: "Ke 3 muaj të dhëna. Do të bëjmë një kopje?"
me butonat [Bëj backup] [Më vonë] [Mos më kujto].

KËRKESË: mos përdor ngjyrë të kuqe, mos përdor fjalën "humbje". Ky është
personi P4 nga docs/02-specifikimi.md — nuk duhet të ndihet i dënuar.

=====================================================================
DETYRA 1.6 — Verifiko plotësinë e backup-it
=====================================================================
Kontrollo cilat tabela dhe çelësa përfshihen në export-in JSON të
SettingsView.tsx. Nga npm run inventory:
  storage.localStorageKeys = [hayat_fav_chapters, hayat_mushaf_theme,
                              hayat_quran_reading_state]
Këta 3 çelësa janë JASHTË Dexie-t. Nëse export-i nuk i kap, backup-i është
i paplotë.

BËJ:
a) Shkruaj një test që: krijon të dhëna në çdo tabelë dhe çelës → bën
   export → fshi gjithçka → bën import → verifikon që gjithçka u kthye.
b) Nëse testi dështon, rregullo export/import-in (jo testin).
c) Raporto në docs/01-gjendja-aktuale.md se çfarë ishte bosh.

=====================================================================
DETYRA 1.7 — Dokumentet ligjore
=====================================================================
Krijo (si skedarë markdown, jo si kod):
  - docs/legal/privacy-policy.md  — me seksion të veçantë që deklaron:
      "Ky aplikacion është produkt i pavarur dhe nuk është aplikacion
       zyrtar i Quran Foundation."
    plus: çfarë të dhënash mblidhen (asnjë, në modalitetin pa llogari),
    ku ruhen (vetëm në pajisje), si fshihen, kontakt.
  - docs/legal/terms-of-use.md
  - LICENSE në rrënjë (nëse Faza 0 nuk e bëri)
  - docs/legal/attributions.md — atributimi i kërkuar nga everyayah.com:
    lidhje te versebyversequran.com (shih docs/06-burimet-e-te-dhenave.md §5.1)

Lidhi këta dokumente nga SettingsView.tsx.

KRITERI: dokumentet ekzistojnë, janë të lexueshme në UI, dhe nuk përmbajnë
pohime që kodi nuk i zbaton.

=====================================================================
PAS FAZËS 1
=====================================================================
Ekzekuto dhe shfaq: npm run lint, npm test, npm run build, npm run inventory.
Shkruaj raportin: çfarë u bë, çfarë u verifikua me komandë dhe cila ishte
dalja, çfarë nuk u verifikua dhe pse.

Nëse nuk munde ta marrësh takvimin zyrtar të KMSH-së ose RSM-së, thuaje
hapur dhe lëre si PLACEHOLDER — mos shpik orare.
```

---

## Verifikimi yt

```bash
grep -rn "storage.persist" src/                 # duhet: >0 rezultate
ls public/geo/cities.json public/geo/SOURCE.md  # duhet të ekzistojnë
ls docs/legal/                                  # privacy-policy, terms-of-use, attributions
npm test 2>&1 | tail -5                         # testet që kalojnë ≥ Faza 0
```
