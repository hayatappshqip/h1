/**
 * Holy Quran 30 Juz Metadata
 * Standard Medina Mushaf boundaries (~604 pages)
 */

export interface JuzMeta {
  number: number;
  nameAr: string;
  transliteration: string;
  startSurah: number;
  startSurahName: string;
  startAyah: number;
  endSurah: number;
  endSurahName: string;
  endAyah: number;
  startPage: number;
  endPage: number;
  totalPages: number;
}

export const ALL_JUZ_META: JuzMeta[] = [
  { number: 1, nameAr: 'الم', transliteration: 'Alif Lam Mim', startSurah: 1, startSurahName: 'Al-Fatihah', startAyah: 1, endSurah: 2, endSurahName: 'Al-Baqarah', endAyah: 141, startPage: 1, endPage: 21, totalPages: 21 },
  { number: 2, nameAr: 'سيقول', transliteration: 'Sayaqul', startSurah: 2, startSurahName: 'Al-Baqarah', startAyah: 142, endSurah: 2, endSurahName: 'Al-Baqarah', endAyah: 252, startPage: 22, endPage: 41, totalPages: 20 },
  { number: 3, nameAr: 'تلك الرسل', transliteration: 'Tilka\'r-Rusul', startSurah: 2, startSurahName: 'Al-Baqarah', startAyah: 253, endSurah: 3, endSurahName: 'Ali \'Imran', endAyah: 92, startPage: 42, endPage: 61, totalPages: 20 },
  { number: 4, nameAr: 'لن تنالوا', transliteration: 'Lan Tanalu', startSurah: 3, startSurahName: 'Ali \'Imran', startAyah: 93, endSurah: 4, endSurahName: 'An-Nisa', endAyah: 23, startPage: 62, endPage: 81, totalPages: 20 },
  { number: 5, nameAr: 'والمحصنات', transliteration: 'Wa\'l-Muhsanat', startSurah: 4, startSurahName: 'An-Nisa', startAyah: 24, endSurah: 4, endSurahName: 'An-Nisa', endAyah: 147, startPage: 82, endPage: 101, totalPages: 20 },
  { number: 6, nameAr: 'لا يحب الله', transliteration: 'La Yuhibbullahu', startSurah: 4, startSurahName: 'An-Nisa', startAyah: 148, endSurah: 5, endSurahName: 'Al-Ma\'idah', endAyah: 81, startPage: 102, endPage: 121, totalPages: 20 },
  { number: 7, nameAr: 'وإذا سمعوا', transliteration: 'Wa Iza Sami\'u', startSurah: 5, startSurahName: 'Al-Ma\'idah', startAyah: 82, endSurah: 6, endSurahName: 'Al-An\'am', endAyah: 110, startPage: 122, endPage: 141, totalPages: 20 },
  { number: 8, nameAr: 'ولو أننا', transliteration: 'Wa Law Annana', startSurah: 6, startSurahName: 'Al-An\'am', startAyah: 111, endSurah: 7, endSurahName: 'Al-A\'raf', endAyah: 87, startPage: 142, endPage: 161, totalPages: 20 },
  { number: 9, nameAr: 'قال الملأ', transliteration: 'Qalal-Mala\'u', startSurah: 7, startSurahName: 'Al-A\'raf', startAyah: 88, endSurah: 8, endSurahName: 'Al-Anfal', endAyah: 40, startPage: 162, endPage: 181, totalPages: 20 },
  { number: 10, nameAr: 'واعلموا', transliteration: 'Wa\'lamu', startSurah: 8, startSurahName: 'Al-Anfal', startAyah: 41, endSurah: 9, endSurahName: 'At-Tawbah', endAyah: 92, startPage: 182, endPage: 201, totalPages: 20 },
  { number: 11, nameAr: 'يعتذرون', transliteration: 'Ya\'tadhirun', startSurah: 9, startSurahName: 'At-Tawbah', startAyah: 93, endSurah: 11, endSurahName: 'Hud', endAyah: 5, startPage: 202, endPage: 221, totalPages: 20 },
  { number: 12, nameAr: 'وما من دابة', transliteration: 'Wa Ma Min Dabbatin', startSurah: 11, startSurahName: 'Hud', startAyah: 6, endSurah: 12, endSurahName: 'Yusuf', endAyah: 52, startPage: 222, endPage: 241, totalPages: 20 },
  { number: 13, nameAr: 'وما أبرئ', transliteration: 'Wa Ma Ubarri\'u', startSurah: 12, startSurahName: 'Yusuf', startAyah: 53, endSurah: 14, endSurahName: 'Ibrahim', endAyah: 52, startPage: 242, endPage: 261, totalPages: 20 },
  { number: 14, nameAr: 'ربما', transliteration: 'Alif Lam Ra / Rubama', startSurah: 15, startSurahName: 'Al-Hijr', startAyah: 1, endSurah: 16, endSurahName: 'An-Nahl', endAyah: 128, startPage: 262, endPage: 281, totalPages: 20 },
  { number: 15, nameAr: 'سبحان الذي', transliteration: 'Subhanalladhi', startSurah: 17, startSurahName: 'Al-Isra', startAyah: 1, endSurah: 18, endSurahName: 'Al-Kahf', endAyah: 74, startPage: 282, endPage: 301, totalPages: 20 },
  { number: 16, nameAr: 'قال ألم', transliteration: 'Qala Alam', startSurah: 18, startSurahName: 'Al-Kahf', startAyah: 75, endSurah: 20, endSurahName: 'Taha', endAyah: 135, startPage: 302, endPage: 321, totalPages: 20 },
  { number: 17, nameAr: 'اقترب للناس', transliteration: 'Iqtaraba Li\'n-Nas', startSurah: 21, startSurahName: 'Al-Anbiya', startAyah: 1, endSurah: 22, endSurahName: 'Al-Hajj', endAyah: 78, startPage: 322, endPage: 341, totalPages: 20 },
  { number: 18, nameAr: 'قد أفلح', transliteration: 'Qad Aflaha', startSurah: 23, startSurahName: 'Al-Mu\'minun', startAyah: 1, endSurah: 25, endSurahName: 'Al-Furqan', endAyah: 20, startPage: 342, endPage: 361, totalPages: 20 },
  { number: 19, nameAr: 'وقال الذين', transliteration: 'Wa Qalalladhina', startSurah: 25, startSurahName: 'Al-Furqan', startAyah: 21, endSurah: 27, endSurahName: 'An-Naml', endAyah: 55, startPage: 362, endPage: 381, totalPages: 20 },
  { number: 20, nameAr: 'أمن خلق', transliteration: 'Aman Khalaqa', startSurah: 27, startSurahName: 'An-Naml', startAyah: 56, endSurah: 29, endSurahName: 'Al-\'Ankabut', endAyah: 45, startPage: 382, endPage: 401, totalPages: 20 },
  { number: 21, nameAr: 'اتل ما أُوحي', transliteration: 'Utlu Ma Uhiya', startSurah: 29, startSurahName: 'Al-\'Ankabut', startAyah: 46, endSurah: 33, endSurahName: 'Al-Ahzab', endAyah: 30, startPage: 402, endPage: 421, totalPages: 20 },
  { number: 22, nameAr: 'ومن يقنت', transliteration: 'Wa Man Yaqnut', startSurah: 33, startSurahName: 'Al-Ahzab', startAyah: 31, endSurah: 36, endSurahName: 'Ya-Sin', endAyah: 27, startPage: 422, endPage: 441, totalPages: 20 },
  { number: 23, nameAr: 'وما أنزلنا', transliteration: 'Wa Ma Anzalna', startSurah: 36, startSurahName: 'Ya-Sin', startAyah: 28, endSurah: 39, endSurahName: 'Az-Zumar', endAyah: 31, startPage: 442, endPage: 461, totalPages: 20 },
  { number: 24, nameAr: 'فمن أظلم', transliteration: 'Faman Azlamu', startSurah: 39, startSurahName: 'Az-Zumar', startAyah: 32, endSurah: 41, endSurahName: 'Fussilat', endAyah: 46, startPage: 462, endPage: 481, totalPages: 20 },
  { number: 25, nameAr: 'إليه يرد', transliteration: 'Ilayhi Yurad', startSurah: 41, startSurahName: 'Fussilat', startAyah: 47, endSurah: 45, endSurahName: 'Al-Jathiyah', endAyah: 37, startPage: 482, endPage: 501, totalPages: 20 },
  { number: 26, nameAr: 'حم', transliteration: 'Ha Mim', startSurah: 46, startSurahName: 'Al-Ahqaf', startAyah: 1, endSurah: 51, endSurahName: 'Adh-Dhariyat', endAyah: 30, startPage: 502, endPage: 521, totalPages: 20 },
  { number: 27, nameAr: 'قال فما خطبكم', transliteration: 'Qala Fama Khatbukum', startSurah: 51, startSurahName: 'Adh-Dhariyat', startAyah: 31, endSurah: 57, endSurahName: 'Al-Hadid', endAyah: 29, startPage: 522, endPage: 541, totalPages: 20 },
  { number: 28, nameAr: 'قد سمع الله', transliteration: 'Qad Sami\'allahu', startSurah: 58, startSurahName: 'Al-Mujadila', startAyah: 1, endSurah: 66, endSurahName: 'At-Tahrim', endAyah: 12, startPage: 542, endPage: 561, totalPages: 20 },
  { number: 29, nameAr: 'تبارك الذي', transliteration: 'Tabarakalladhi', startSurah: 67, startSurahName: 'Al-Mulk', startAyah: 1, endSurah: 77, endSurahName: 'Al-Mursalat', endAyah: 50, startPage: 562, endPage: 581, totalPages: 20 },
  { number: 30, nameAr: 'عمّ يتساءلون', transliteration: 'Amma Yatasa\'alun', startSurah: 78, startSurahName: 'An-Naba', startAyah: 1, endSurah: 114, endSurahName: 'An-Nas', endAyah: 6, startPage: 582, endPage: 604, totalPages: 23 }
];

export const KHATAM_DUA = {
  titleSq: "Lutja e Përfundimit të Kuranit (Dua Khatm al-Quran)",
  titleAr: "دعاء ختم القرآن الكريم",
  textAr: `صَدَقَ اللَّهُ الْعَظِيمُ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ.

اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ وَاجْعَلْهُ لِي إِمَامًا وَنُورًا وَهُدًى وَرَحْمَةً.
اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَا نَسِيتُ وَعَلِّمْنِي مِنْهُ مَا جَهِلْتُ وَارْزُقْنِي تِلاَوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ وَاجْعَلْهُ لِي حُجَّةً يَا رَبَّ الْعَالَمِينَ.

اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي، وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي، وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي، وَاجْعَلِ الْحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ، وَاجْعَلِ الْمَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ.

اللَّهُمَّ اجْعَلْ خَيْرَ عُمْرِي آخِرَهُ وَخَيْرَ عَمَلِي خَوَاتِمَهُ وَخَيْرَ أَيَّامِي يَوْمَ أَلْقَاكَ فِيهِ.
اللَّهُمَّ إِنِّي أَسْأَلُكَ عِيشَةً هَنِيَّةً وَمِيتَةً سَوِيَّةً وَمَرَدًّا غَيْرَ مُخْزٍ وَلاَ فَاضِحٍ.

وَصَلَّى اللَّهُ عَلَى سَيِّدِنَا مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ.`,
  transliteration: `Sadaqallahul-'Adhimulladhi la ilaha illa Huwal-Hayyul-Qayyum wa atubu ilayh.

Allahummar-hamni bil-Qur'an, waj'alhu li imaman wa nuran wa hudan wa rahmah.
Allahumma dhakkirni minhu ma nasitu, wa 'allimni minhu ma jahiltu, warzuqni tilawatahu ana'al-layli wa atrafan-nahar, waj'alhu li hujjatan ya Rabbal-'alamin.

Allahumma aslih li diniyalladhi huwa 'ismatu amri, wa aslih li dunyayallati fiha ma'ashi, wa aslih li akhiratiyallati fiha ma'adi, waj'alil-hayata ziyadatan li fi kulli khayr, waj'alil-mawta rahatal-li min kulli sharr.

Allahumma-j'al khayra 'umri akhirah, wa khayra 'amali khawatimah, wa khayra ayyami yawma alqaka fih.
Allahumma inni as'aluka 'ishatan haniyyah, wa mitatan sawiyyah, wa maraddan ghayra mukhzin wa la fadih.

Wa sallallahu 'ala sayyidina Muhammad wa 'ala alihi wa sahbihi wa sallam.`,
  translationSq: `Ka thënë të vërtetën Allahu i Madhërishëm, përveç të Cilit nuk ka zot tjetër; Ai është i Gjalli, i Përjetshmi, dhe tek Ai pendohem.

O Allah, më msho me Kuranin dhe bëje atë për mua udhëheqës, dritë, udhëzim dhe mëshirë.
O Allah, më kujto prej tij atë që kam harruar, më mëso prej tij atë që nuk e di, dhe më mundëso leximin e tij gjatë orëve të natës dhe skajeve të ditës, dhe bëje atë argument për mua, o Zot i botëve!

O Allah, më përmirëso fenë time që është mbrojtja e çështjes sime; më përmirëso dynjanë time ku është jetesa ime; më përmirëso ahiretin tim ku është kthimi im; bëje jetën shtim për mua në çdo të mirë, dhe bëje vdekjen rehatim për mua nga çdo e keqe.

O Allah, bëje pjesën më të mirë të jetës sime fundin e saj, veprën më të mirë përfundimin e saj, dhe ditën më të mirë ditën kur do të takohem me Ty!
O Allah, të kërkoj një jetë të këndshme, një vdekje të ndershme dhe një kthim te Ty pa turpërim e pa blof!

Allahu dërgoftë salavate e selame mbi Pejgamberin tonë Muhammed, mbi familjen e tij dhe mbi shokët e tij.`
};
