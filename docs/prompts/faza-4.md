# Prompti — Faza 4: Capacitor + Push Notifications

> **Parakusht:** Faza 0 dhe Faza 1 të përfunduara. Faza 2 e rekomanduar fort.
> Kohëzgjatje: ~2–3 javë. Kjo fazë **bllokon botimin në dyqane**.

---

```
Ti po punon në repo-n "hayat-app", një PWA React 19 + Vite 6 + TypeScript
+ Tailwind 4 + Dexie.

LEXO SË PARI:
  - docs/04-rreziqet.md      (R2 — njoftimet nuk arrijnë)
  - docs/03-arkitektura.md   (§4 njoftimet, §10 botimi si app)
  - docs/02-specifikimi.md   (FR-1.6, personi P2)

Misioni: njoftimi për namaz duhet të arrijë edhe kur aplikacioni është
i mbyllur plotësisht. Ky është problemi më i madh i produktit sot.

GJENDJA AKTUALE (verifikoje vetë me grep):
  src/App.tsx përmban:
    setInterval(() => checkPrayerNotifications(prayerTimes, prayerSettings), 30000)
  Kjo ekzekutohet vetëm kur dritarja është e hapur dhe skeda aktive.
  Në iOS Safari, JS-i i skedave në sfond pezullohet brenda sekondash.
  Pra me dizajnin aktual njoftimi NUK MUND TË ARRIJË kurrë në telefon të mbyllur.

=====================================================================
RREGULLA
=====================================================================
1. Një projekt i vetëm që ndërton PWA DHE binarët. Mos krijo degëzim kodi.
2. PWA-ja duhet të vazhdojë të funksionojë njësoj si më parë. Nëse
   një ndryshim e prish PWA-në për hir të app-it, është gabim.
3. Mos ndrysho stack-un. Capacitor mbështjell aplikacionin ekzistues,
   nuk e zëvendëson.
4. Para çdo commit-i: npm run lint && npm test && npm run build.
5. Nëse nuk mund të ekzekutosh ndërtimin e iOS/Android në këtë mjedis,
   shkruaj kodin dhe thuaj HAPUR që binarët nuk u ndërtuan dhe nuk u
   provuan. Mos pretendoni se funksionon në telefon.

=====================================================================
DETYRA 4.1 — Capacitor
=====================================================================
a) Shto @capacitor/core, @capacitor/cli, @capacitor/ios, @capacitor/android.
b) capacitor.config.ts me: appId (p.sh. com.hayat.islame), appName "Hayat",
   webDir "dist", dhe server.androidScheme "https".
c) Skriptet: "cap:sync", "cap:open:ios", "cap:open:android".
d) Verifiko që `npm run build && npx cap sync` funksionon pa gabime.

KRITERI: `npx cap sync` përfundon pa gabime; dist/ përdoret si webDir.

=====================================================================
DETYRA 4.2 — Njoftime vendore (pa server)
=====================================================================
Zgjedhja e qëllimshme: NJOFTIME VENDORE, jo Web Push.
Arsyeja: funksionojnë offline, nuk kërkojnë server, nuk kërkojnë cron,
dhe janë e vetmja rrugë e besueshme në iOS.

a) Shto @capacitor/local-notifications.
b) Krijo src/core/notifications/scheduler.ts me:
   - scheduleUpcoming(prayerTimes, settings, days = 7)
     planifikon njoftime për çdo namaz të aktivizuar, për 7 ditë përpara,
     duke përfshirë paralajmërimin `notifyMinutesBefore`.
   - cancelAll()
   - reschedule() — thirret kur hapet aplikacioni, kur ndryshon
     vendndodhja, metoda ose rregullimet e njoftimeve.
c) Përdor ID të qëndrueshme për çdo njoftim (p.sh. hash i datës+namazit)
   që ripërsëritja të mos krijojë kopje.
d) Ruaj në Dexie një tabelë `scheduledNotifications` për të ditur çfarë
   është planifikuar tashmë.

KRITERI:
  - Test njësi që verifikon se për 7 ditë × 5 namaze të aktivizuara
    krijohen 35 njoftime me ID unike.
  - Test që verifikon se ndryshimi i vendndodhjes i anulon të vjetrat
    dhe planifikon të rejat.

=====================================================================
DETYRA 4.3 — Leja e njoftimeve (kritike në iOS)
=====================================================================
iOS lejon VETËM NJË kërkesë për leje. Nëse përdoruesi refuzon, nuk
mund ta kërkosh përsëri lehtësisht. Prandaj:

a) Krijo një ekran udhëzues PARA kërkesës së sistemit:
   "Hayat mund të të kujtojë kohët e namazit edhe kur aplikacioni është
    i mbyllur. Në hapin tjetër telefoni do të të pyesë një herë të vetme."
   [Vazhdo]  [Jo tani]
b) Kërko lejen vetëm pasi përdoruesi shtyp [Vazhdo].
c) Nëse refuzohet, shfaq udhëzim si ta aktivizojë manualisht nga
   Cilësimet e telefonit — pa e pyetur përsëri.
d) Në PWA (jo Capacitor), përdor Notification.requestPermission()
   me të njëjtin ekran udhëzues.

KRITERI: kërkesa e lejes ndodh saktësisht një herë, pas veprimit të
përdoruesit, kurrë në nisje automatike.

=====================================================================
DETYRA 4.4 — Ikona, splash, safe-area
=====================================================================
a) Ikona në të gjitha madhësitë e kërkuara (iOS dhe Android), duke
   përfshirë maskable dhe monochrome.
b) Splash screen me ngjyrën e sfondit #0a0f1d.
c) Verifiko trajtimin e safe-area: index.html ka viewport-fit=cover,
   dhe src/index.css ka --safe-* / --mushaf-avail-h. Kontrollo që
   përmbajtja nuk futet nën notch ose home indicator.
d) Emri i shkurtër "Hayat" nuk duhet të pritet nën ikonë.

=====================================================================
DETYRA 4.5 — Widget Android dhe shkurtore iOS
=====================================================================
a) Widget Android që tregon namazin e radhës dhe kohën e mbetur.
b) Shkurtore e shpejtë (iOS App Shortcut / Android shortcut):
   "Regjistro namazin e fundit" — hap aplikacionin dhe regjistron
   namazin më të afërt që ka kaluar.

KRITERI: shkurtorja funksionon pa e hapur aplikacionin në pamje të plotë.

=====================================================================
DETYRA 4.6 — Dokumentet për dyqanet
=====================================================================
a) Përditëso docs/legal/privacy-policy.md për dyqanet.
b) Krijo docs/legal/store-listings.md me:
   - Privacy Nutrition Labels (Apple): çfarë të dhënash mblidhen, a lidhen
     me identitetin, a përdoren për ndjekje. Përgjigja e sinqertë për
     modalitetin pa llogari: ASNJË.
   - Data Safety (Google Play): e njëjta.
   - Përshkrimi i aplikacionit, duke theksuar hifzin dhe hatmen si
     veçori thelbësore (rregulla 4.3 e App Store për "minimum
     functionality" — aplikacionet islame refuzohen shpesh).
   - Fjalët kyçe, kategoritë, mosha.
c) Shto një skedar docs/legal/review-notes.md me përgjigje të gatshme
   për pyetjet e zakonshme të rishikuesit.

=====================================================================
DETYRA 4.7 — Matrica e testimit në pajisje
=====================================================================
Krijo docs/testing/device-matrix.md si tabelë për t'u plotësuar manualisht:
  iOS 16 / 17 / 18 × iPhone SE / iPhone 15 / iPad
  Android 10 / 13 / 14 × telefon i lirë (2 GB RAM) / mesatar / tablet
Për secilin: instalim, njoftim kur app-i është i mbyllur, offline,
mushaf, hifz, ruajtja e të dhënave pas 7 ditësh.

Mos i shëno si të kaluara. Lëri bosh për t'u plotësuar në pajisje reale.

=====================================================================
PAS FAZËS 4
=====================================================================
Shfaq: npm run lint, npm test, npm run build, npx cap sync (nëse mundet).

Raporto me këtë strukturë:
  - Çfarë u shkrua dhe u verifikua me test njësi.
  - Çfarë u shkrua por NUK u verifikua (p.sh. binarët iOS/Android) dhe pse.
  - Prova që njoftimi arrin kur app-i është i mbyllur: A EKZISTON?
    Nëse nuk e prove në pajisje reale, thuaje hapur.

Kjo është pika ku shumica e projekteve gënjejnë veten. Mos e bëj.
```

---

## Verifikimi yt

```bash
ls capacitor.config.ts                                  # duhet të ekzistojë
grep -n "setInterval" src/App.tsx                       # nuk duhet të jetë burimi i njoftimeve
grep -rn "local-notifications\|LocalNotifications" src/ # duhet: >0
ls docs/legal/store-listings.md docs/testing/device-matrix.md
npm test 2>&1 | tail -5
```

> **Prova e vetme që ka rëndësi:** instalim në telefon, mbyllje e plotë e aplikacionit, pritje deri te koha e njoftimit. Nëse kjo nuk është provuar, njoftimet nuk janë bërë.
