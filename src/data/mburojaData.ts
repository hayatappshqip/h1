/**
 * Mburoja e Muslimanit (Hisnul Muslim)
 * Data Source: Seid el-Kahtani (muslimani-ideal.org)
 * Verified Integrity: 11 Categories, 133 Chapters, 291+ Duas
 * Updated with full Uthmani/Arabic Tashkeel from Quran.com & Hisnul Muslim Invocations
 */
import { MburojaCategory, MburojaChapter } from "../types";

export const MBUROJA_CATEGORIES: MburojaCategory[] = [
  {
    "id": "mëngjes-dhe-mbrëmje",
    "title": "Mëngjes dhe mbrëmje",
    "icon": "Sun",
    "chapterIds": [
      1,
      27,
      28,
      29,
      30,
      31,
      133
    ]
  },
  {
    "id": "shtëpia-dhe-familja",
    "title": "Shtëpia dhe familja",
    "icon": "Home",
    "chapterIds": [
      2,
      3,
      4,
      5,
      6,
      7,
      10,
      11,
      45,
      79,
      81,
      125,
      128,
      132
    ]
  },
  {
    "id": "udhëtim",
    "title": "Udhëtim",
    "icon": "Compass",
    "chapterIds": [
      95,
      96,
      97,
      98,
      99,
      100,
      101,
      102,
      103,
      104,
      105
    ]
  },
  {
    "id": "ushqim-dhe-pije",
    "title": "Ushqim dhe pije",
    "icon": "Utensils",
    "chapterIds": [
      68,
      69,
      70,
      71,
      72,
      73,
      74
    ]
  },
  {
    "id": "gëzim-dhe-shqetësim",
    "title": "Gëzim dhe shqetësim",
    "icon": "Heart",
    "chapterIds": [
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      53,
      92,
      94,
      106,
      122,
      123,
      126
    ]
  },
  {
    "id": "namazi",
    "title": "Namazi",
    "icon": "Clock",
    "chapterIds": [
      8,
      9,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      32,
      33,
      42
    ]
  },
  {
    "id": "falënderimi-ndaj-Allahut",
    "title": "Falënderimi ndaj Allahut",
    "icon": "Sparkles",
    "chapterIds": [
      26,
      43,
      44,
      46,
      88,
      107,
      129,
      130,
      131
    ]
  },
  {
    "id": "mirësjellja",
    "title": "Mirësjellja",
    "icon": "UserCheck",
    "chapterIds": [
      47,
      75,
      77,
      78,
      80,
      82,
      83,
      84,
      85,
      86,
      87,
      89,
      90,
      91,
      93,
      108,
      109,
      112,
      113,
      114
    ]
  },
  {
    "id": "haxh-dhe-umre",
    "title": "Haxh dhe Umre",
    "icon": "Landmark",
    "chapterIds": [
      115,
      116,
      117,
      118,
      119,
      120,
      121,
      127
    ]
  },
  {
    "id": "natyra",
    "title": "Natyra",
    "icon": "CloudRain",
    "chapterIds": [
      61,
      62,
      63,
      64,
      65,
      66,
      67,
      76,
      110,
      111
    ]
  },
  {
    "id": "sëmundja-dhe-vdekja",
    "title": "Sëmundja dhe vdekja",
    "icon": "Activity",
    "chapterIds": [
      48,
      49,
      50,
      51,
      52,
      54,
      55,
      56,
      57,
      58,
      59,
      60,
      124
    ]
  }
];

export const MBUROJA_CHAPTERS: MburojaChapter[] = [
  {
    "id": 1,
    "categoryId": "mëngjes-dhe-mbrëmje",
    "title": "Çfarë duhet thënë kur të zgjohemi nga gjumi",
    "duas": [
      {
        "id": 1,
        "ar": "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
        "sq": "Falënderimi i takon Allahut, i Cili na ringjalli pasi na bëri të vdekur dhe tek Ai është ringjallja (tubimi Ditën e Gjykimit).",
        "transliteration": "Elhamdulil-lahil-ledhi ahjana ba’de ma ematena, ve ilejhin-nushur",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 11/113 dhe Muslimi 4/2083"
      },
      {
        "id": 2,
        "ar": "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدَ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ. سُبْحَانَ اللهِ، وَالْحَمْدُ للهِ، ولَا إِلَهَ إِلَّا\\n\\nاللهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ العَلِيِّ الْعَظيِمِ، ربِّ اغْفِرلِي",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival. Atij i takon Sundimi dhe Lavdërimi dhe Ai është i Gjithëfuqishëm mbi çdo gjë. I Madhërishëm qoftë Allahu, Falënderimi i përket vetëm Allahut, nuk ka hyjni që meriton të adhurohet përveç Allahut, Allahu është më i Madhi, nuk ka ndryshim e as forcë pa ndihmën e Allahut të Lartmadhëruar, Zoti im më fal.",
        "transliteration": "La ilahe il-lAll-llahu vahdehu la sherike leh, lehul-mulku ve lehul-hamdu ve huve ala kul-li shej’in kadir. SubhanAll-llah, vel-hamdulil-lah, ve la ilahe il-laAll-llah, vAll-llahu Ekber, ve la havle ve la kuvvete il-la bil-lahil Alij-jil Adhim. Rabbigfir li.",
        "count": 1,
        "reference": "“Kush e thotë këtë (lutje) do t’i falen mëkatet, e nëse lutet do t’i pranohet lutja, e nëse ngritët e merr abdes dhe falet do t’i pranohet namazi.” Shënon Buhariu."
      },
      {
        "id": 3,
        "ar": "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ",
        "sq": "Falënderimi i takon Allahut, i Cili më fali shëndetin në trupin tim, ma ktheu shpirtin tim dhe më dha mundësi që ta përmendi Atë.",
        "transliteration": "Elhamdulil-lahil-ledhi a’fani fi xhesedi, ve redde alejje ruhi, ve edhine li bi dhikrihi",
        "count": 1,
        "reference": "Tirmidhiu 5/473 “Sahih et-Tirmidhi” 3/144"
      },
      {
        "id": 4,
        "ar": "إِنَّ فِى خَلْقِ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ وَٱخْتِلَـٰفِ ٱلَّيْلِ وَٱلنَّهَارِ لَـَٔايَـٰتٍ لِّأُو۟لِى ٱلْأَلْبَـٰبِ ۞ ٱلَّذِينَ يَذْكُرُونَ ٱللَّهَ قِيَـٰمًا وَقُعُودًا وَعَلَىٰ جُنُوبِهِمْ وَيَتَفَكَّرُونَ فِى خَلْقِ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ رَبَّنَا مَا خَلَقْتَ هَـٰذَا بَـٰطِلًا سُبْحَـٰنَكَ فَقِنَا عَذَابَ ٱلنَّارِ ۞ رَبَّنَآ إِنَّكَ مَن تُدْخِلِ ٱلنَّارَ فَقَدْ أَخْزَيْتَهُۥ ۖ وَمَا لِلظَّـٰلِمِينَ مِنْ أَنصَارٍ ۞ رَّبَّنَآ إِنَّنَا سَمِعْنَا مُنَادِيًا يُنَادِى لِلْإِيمَـٰنِ أَنْ ءَامِنُوا۟ بِرَبِّكُمْ فَـَٔامَنَّا ۚ رَبَّنَا فَٱغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّـَٔاتِنَا وَتَوَفَّنَا مَعَ ٱلْأَبْرَارِ ۞ رَبَّنَا وَءَاتِنَا مَا وَعَدتَّنَا عَلَىٰ رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ ٱلْقِيَـٰمَةِ ۗ إِنَّكَ لَا تُخْلِفُ ٱلْمِيعَادَ ۞ فَٱسْتَجَابَ لَهُمْ رَبُّهُمْ أَنِّى لَآ أُضِيعُ عَمَلَ عَـٰمِلٍ مِّنكُم مِّن ذَكَرٍ أَوْ أُنثَىٰ ۖ بَعْضُكُم مِّنۢ بَعْضٍ ۖ فَٱلَّذِينَ هَاجَرُوا۟ وَأُخْرِجُوا۟ مِن دِيَـٰرِهِمْ وَأُوذُوا۟ فِى سَبِيلِى وَقَـٰتَلُوا۟ وَقُتِلُوا۟ لَأُكَفِّرَنَّ عَنْهُمْ سَيِّـَٔاتِهِمْ وَلَأُدْخِلَنَّهُمْ جَنَّـٰتٍ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَـٰرُ ثَوَابًا مِّنْ عِندِ ٱللَّهِ ۗ وَٱللَّهُ عِندَهُۥ حُسْنُ ٱلثَّوَابِ ۞ لَا يَغُرَّنَّكَ تَقَلُّبُ ٱلَّذِينَ كَفَرُوا۟ فِى ٱلْبِلَـٰدِ ۞ مَتَـٰعٌ قَلِيلٌ ثُمَّ مَأْوَىٰهُمْ جَهَنَّمُ ۚ وَبِئْسَ ٱلْمِهَادُ ۞ لَـٰكِنِ ٱلَّذِينَ ٱتَّقَوْا۟ رَبَّهُمْ لَهُمْ جَنَّـٰتٌ تَجْرِى مِن تَحْتِهَا ٱلْأَنْهَـٰرُ خَـٰلِدِينَ فِيهَا نُزُلًا مِّنْ عِندِ ٱللَّهِ ۗ وَمَا عِندَ ٱللَّهِ خَيْرٌ لِّلْأَبْرَارِ ۞ وَإِنَّ مِنْ أَهْلِ ٱلْكِتَـٰبِ لَمَن يُؤْمِنُ بِٱللَّهِ وَمَآ أُنزِلَ إِلَيْكُمْ وَمَآ أُنزِلَ إِلَيْهِمْ خَـٰشِعِينَ لِلَّهِ لَا يَشْتَرُونَ بِـَٔايَـٰتِ ٱللَّهِ ثَمَنًا قَلِيلًا ۗ أُو۟لَـٰٓئِكَ لَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ ۗ إِنَّ ٱللَّهَ سَرِيعُ ٱلْحِسَابِ ۞ يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱصْبِرُوا۟ وَصَابِرُوا۟ وَرَابِطُوا۟ وَٱتَّقُوا۟ ٱللَّهَ لَعَلَّكُمْ تُفْلِحُونَ",
        "sq": "Me të vërtetë, në krijimin e qiejve dhe të Tokës dhe në ndërrimin e natës e të ditës, ka shenja për mendarët, për ata që e përmendin Allahun duke qëndruar në këmbë, ndenjur ose shtrirë dhe që meditojnë për krijimin e qiejve dhe të Tokës (duke thënë): “O Zoti Ynë! Ti nuk i ke krijuar kot këto - lartësuar qofsh (nga çdo e metë)! Prandaj na ruaj nga ndëshkimi i zjarrit. O Zoti Ynë, cilindo që Ti e fut në zjarr, Ti e ke poshtëruar atë. Dhe për mohuesit nuk do të ketë kurrfarë ndihmuesi. O Zoti Ynë! Ne dëgjuam një thirrës që na ftonte në besim: “Besoni Zotin tuaj!” Dhe kështu besuam. O Zoti Ynë! Na i fal gjynahet tona, na i shlyej gabimet dhe bëna që të vdesim me të mirët! O Zoti Ynë! Na e jep shpërblimin që na ke premtuar nëpërmjet të dërguarve të Tu dhe mos na poshtëro në Ditën e Kiametit! Se Ti, me të vërtetë, nuk e shkel premtimin e dhënë!” Dhe Zoti iu përgjigj lutjes së tyre: “Unë nuk do t’ia humb mundin askujt nga ju që ka bërë vepra, qoftë mashkull apo femër. Ju jeni njëlloj (në shpërblim). Atyre që u shpërngulën, u dëbuan nga vatrat e tyre, u munduan në rrugën Time, luftuan dhe u vranë, Unë do t’ua mbuloj veprat e këqija dhe do t’i shpie në kopshte, nëpër të cilat rrjedhin lumenj, si shpërblim nga Allahu. Shpërblimi më i mirë është tek Allahu.” Ti (o Muhamed) mos u mashtro nga bredhja e jobesimtarëve nëpër botë! Kjo mirëqenie është e shkurtër; pastaj, strehimi i tyre është Xhehenemi. Eh, sa shtrat i keq është ai vend! Por, ata që i frikësohen Zotit të tyre do të kenë kopshte nëpër të cilat rrjedhin lumenj dhe ku do të banojnë përjetësisht, si dhuratë prej Allahut. Dhe ajo që është tek Allahu, është dhurata më e mirë për besimtarët e vërtetë. Midis ithtarëve të Librit, me siguri ka të atillë që e besojnë Allahun dhe atë që ju është shpallur juve, si dhe atë që u është shpallur atyre, duke qenë të përulur para Allahut dhe pa i këmbyer shpalljet e Tij me ndonjë vlerë të paktë. Ata do të kenë shpërblimin e tyre te Zoti i tyre. Vërtet, Allahu është i shpejtë në llogari! O besimtarë! Bëhuni të durueshëm dhe nxiteni njëri-tjetrin të jeni të tillë; bëhuni të vendosur dhe vigjilentë (në vepra të mira dhe në ruajtjen e kufijve) dhe kijeni frikë Allahun, që të shpëtoni!",
        "transliteration": "",
        "count": 1,
        "reference": "Ali Imran, 190-200, Buhariu “Fet’hul-Bari” 8/237, Muslimi 1/530"
      }
    ]
  },
  {
    "id": 2,
    "categoryId": "shtëpia-dhe-familja",
    "title": "Duaja kur të veshim rrobat",
    "duas": [
      {
        "id": 5,
        "ar": "الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا (الثَّوبَ) وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ",
        "sq": "Falënderimi i takon Allahut, i Cili ma mundësoi ta vesh këtë rrobë dhe më furnizoi me lehtësi me të, pa ndihmën dhe fuqinë time",
        "transliteration": "Elhamdulil-lahil-ledhi kesani hadha (eth-thevbe) ve rezekanihi min gajri havlin minni ve la kuvvetin",
        "count": 1,
        "reference": "Ebu Davudi, Tirmidhiu dhe Ibën Maxheh “Irvaul-Galil” 7/47"
      }
    ]
  },
  {
    "id": 3,
    "categoryId": "shtëpia-dhe-familja",
    "title": "Duaja kur të veshim rroba të reja",
    "duas": [
      {
        "id": 6,
        "ar": "اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ",
        "sq": "O Zoti im, Ty të takon Falënderimi, Ti je Ai i Cili më furnizove me të, Të lutem ma dhuro të mirën e saj dhe të mirën për çfarë është punuar. Kërkoj mbrojtjen tënde nga e keqja e saj dhe nga e keqja për çfarë është punuar ajo.",
        "transliteration": "All-llahumme lekel-hamdu ente kesevtenihi, es-eluke min hajrihi, ve hajri ma suni-a lehu, ve eudhu bike min sherrihi ve sherri ma suni-a lehu",
        "count": 1,
        "reference": "Ebu Davudi, Tirmidhiu dhe Begaviu, “Muhtesar Shemail et-Tirmidhi”, nga shejh Albani, fq. 47."
      }
    ]
  },
  {
    "id": 4,
    "categoryId": "shtëpia-dhe-familja",
    "title": "Duaja për atë i cili vesh rroba të reja",
    "duas": [
      {
        "id": 7,
        "ar": "تُبْلِي وَيُخْلِفُ اللَّهُ تَعَالَى",
        "sq": "E vjetrofsh dhe Allahu i Lartmadhëruar ta zëvendësoftë me tjetrën.",
        "transliteration": "Tubli ve juhlifull-llahu teala",
        "count": 1,
        "reference": "Ebu Davudi 4/41 “Sahih Ebi Davud” 2/760."
      },
      {
        "id": 8,
        "ar": "الْبَسْ جَدِيداً، وَعِشْ حَمِيداً، وَمُتْ شَهِيداً",
        "sq": "Vishe të re, jeto Falënderues dhe vdis si dëshmor në rrugën e Allahut.",
        "transliteration": "Ilbis xhediden ve ish hamiden ve mut shehiden",
        "count": 1,
        "reference": "Ibën Maxheh 2/1178 dhe Begaviu 12/41 “Sahih Sunen Ibën Maxheh” 2/275."
      }
    ]
  },
  {
    "id": 5,
    "categoryId": "shtëpia-dhe-familja",
    "title": "Çfarë duhet thënë kur heqim rrobat",
    "duas": [
      {
        "id": 9,
        "ar": "بِسْمِ اللَّهِ",
        "sq": "Me emrin e Allahut.",
        "transliteration": "Bismil-lah",
        "count": 1,
        "reference": "Tirmidhiu 2/505 dhe të tjerë “Irvaul-Galil” nr. 49 dhe “Sahih el-Xhamiu” nr: 3/203."
      }
    ]
  },
  {
    "id": 6,
    "categoryId": "shtëpia-dhe-familja",
    "title": "Duaja para se të hyjmë në tualet (wc)",
    "duas": [
      {
        "id": 10,
        "ar": "(بِسْمِ اللَّهِ) اللَّهُمَّ إِنِّـي أَعـوذُ بِـكَ مِـنَ الْخُـبْثِ وَالْخَبائِث",
        "sq": "Me emrin e Allahut, O Zoti im kërkoj që të më mbrosh nga të fëlliqurit (shejtanët) dhe të fëlliqurat (xhinët).",
        "transliteration": "[[Bismil-lah] All-llahumme inni eudhu bike minel-hubthi vel-habaithi",
        "count": 1,
        "reference": "Buhariu 1/45 dhe Muslimi 1/283, shtojcën (Bismil-lahin) në fillim të hadithit e shënon Seid ibën Mensuri “Fet’hul-Bari” 1/244."
      }
    ]
  },
  {
    "id": 7,
    "categoryId": "shtëpia-dhe-familja",
    "title": "Duaja kur të dalim nga tualeti (wc)",
    "duas": [
      {
        "id": 11,
        "ar": "غُفْرَانَكَ",
        "sq": "Kërkoj faljen tënde o Allah.",
        "transliteration": "Gufraneke",
        "count": 1,
        "reference": "Transmetojnë autorët e katër Suneneve përveç Nesaiut i cili këtë hadith e shënon në librin e tij “Amel el-Jevmi ve Lejleh” “Zadul-Mead” 2/387."
      }
    ]
  },
  {
    "id": 8,
    "categoryId": "namazi",
    "title": "Dhikri para abdesit",
    "duas": [
      {
        "id": 12,
        "ar": "بِسْمِ اللَّهِ",
        "sq": "Me emrin e Allahut.",
        "transliteration": "Bismil-lah",
        "count": 1,
        "reference": ""
      }
    ]
  },
  {
    "id": 9,
    "categoryId": "namazi",
    "title": "Dhikri pas abdesit",
    "duas": [
      {
        "id": 13,
        "ar": "أَشْهَدُ أَنْ لَا إِلَهَ إلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّداً عَبْدُهُ وَرَسُولُهُ",
        "sq": "Dëshmoj se nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival, si dhe dëshmoj që Muhamedi është robi dhe i Dërguari i Tij.",
        "transliteration": "Eshhedu en la Ilahe il-lAll-llahu vahdehu la sherike lehu ve eshhedu enne Muhammeden abduhu ve resuluhu",
        "count": 1,
        "reference": "Muslimi 1/209."
      },
      {
        "id": 14,
        "ar": "اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ",
        "sq": "O Allahu im, më bëj mua prej atyre që pendohen dhe më bëj mua nga ata që pastrohen nga gjynahet dhe papastërtitë.",
        "transliteration": "All-llahumme-xh’alni minet-tevvabine vexh-alni minel-mutetahirin",
        "count": 1,
        "reference": "Tirmidhiu 1/78, “Sahih et-Tirmidhi” 3/151."
      },
      {
        "id": 15,
        "ar": "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
        "sq": "I Lartësuar, i pa të meta je Ti o Allahu im, Ty të takon Falënderimi, dëshmoj se nuk ka hyjni që meriton të adhurohet përveç Teje, kërkoj falje nga Ti dhe tek Ti pendohem.",
        "transliteration": "Subhaneke All-llahumme ve bihamdike, Eshhedu en la ilahe il-la Ente estagfiruke ve etubu ilejke",
        "count": 1,
        "reference": "Nesaiu në librin e tij “Amel el-jevmi ve lejleh” fq.173, “Irvaul-Galil” 1/135 dhe 2/94."
      }
    ]
  },
  {
    "id": 10,
    "categoryId": "shtëpia-dhe-familja",
    "title": "Dhikri gjatë daljes nga shtëpia",
    "duas": [
      {
        "id": 17,
        "ar": "بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
        "sq": "Me emrin e Allahut, në Allahun u mbështeta, nuk ka ndryshim e as forcë pa ndihmën e Allahut.",
        "transliteration": "Bismil-lahi, tevekkeltu ala All-llahi, ve la havle ve la kuvvete il-la bil-lah",
        "count": 1,
        "reference": "Ebu Davudi 4/325, Tirmidhiu 5/490 “Sahih et-Tirmidhi” 3/151."
      },
      {
        "id": 18,
        "ar": "الَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ، أّوْ أُضَلَّ، أَوْ أَزِلَّ، أَوْ أُزَلَّ، أَوْ أَظْلِمَ، أَوْ أُظْلَمَ، أَوْ أَجْهَلَ، أَوْ يُجْهَلَ عَلَيَّ",
        "sq": "O Allahu im, kërkoj mbrojtje tek Ti, që të mos devijoj e as të tjerët të më devijojnë, që të mos i poshtëroj të tjerët e as të mos më poshtërojnë mua, të mos bëj padrejtësi e as të mos më bëhet padrejtësi, të mos i shpërfillë të tjerët e as të mos më shpërfillin mua.",
        "transliteration": "All-llahumme inni eudhu bike en edil-le ev udal-le, ev ezil-le ev uzel-le, ev adhlime ev udhleme, ev exh-hele ev juxh-hele alejje",
        "count": 1,
        "reference": "Transmetojnë autorët e katër Suneneve, “Sahih et-Tirmidhi” 3/153, “Sahih Ibën Maxheh” 2/336."
      }
    ]
  },
  {
    "id": 11,
    "categoryId": "shtëpia-dhe-familja",
    "title": "Dhikri gjatë hyrjes në shtëpi",
    "duas": [
      {
        "id": 19,
        "ar": "بِسْمِ اللَّهِ وَلَجْنَا، وَ بِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى رَبِّنَا تَوَكَّلْنَا",
        "sq": "Me emrin e Allahut hyjmë dhe me emrin e Allahut dalim, si dhe vetëm Allahut, Zotit tonë i mbështetemi. Pastaj përshëndet familjen e tij.",
        "transliteration": "Bismil-lahi velexhna ve bismil-lahi harexhna ve ala Rabbina tevekkelna",
        "count": 1,
        "reference": "Ebu Davudi 4/325, Ibën Bazi në librin e tij “Tuhfetul-Ahjar” fq. 28 dhe thotë: ‘Senedi i këtij hadithi është i mirë dhe transmetohet në hadith të vërtetë se i Dërguari ka thënë: “Kur njeriu hynë në shtëpinë e tij dhe e përmend Allahun gjatë hyrjes si dhe gjatë ngrënies së ushqimit shejtani, u thotë (shejtanëve të tjerë): Sot për ju s’ka vend për fjetje e as ushqim.” Shënon Muslimi, hadithi #2018."
      }
    ]
  },
  {
    "id": 12,
    "categoryId": "namazi",
    "title": "Duaja e shkuarjes në xhami",
    "duas": [
      {
        "id": 20,
        "ar": "اللَّهُمَّ اجْعَـلْ فِي قَلْبـي نورا ، وَفي لِسـاني نورا، وَاجْعَـلْ فِي سَمْعي نورا، وَاجْعَـلْ فِي بَصَري نورا، وَاجْعَـلْ مِنْ خَلْفي نورا، وَمِنْ أَمامـي نورا، وَاجْعَـلْ مِنْ فَوْقـي نورا ، وَمِن تَحْتـي نورا.اللَّهُمَّ أَعْطِنـي نورا.",
        "sq": "O Allah, ndriçoje zemrën time, ndriçoje gjuhën time, ndriçoje dëgjimin tim, ndriçoje shikimin tim, ndriçoje mbi mua, ndriçoje nën mua, ndriçoje nga e djathta ime, ndriçoje nga e majta ime, ndriçoje para meje, ndriçoje prapa meje, ndriçoje veten time dhe ma zmadho mua ndriçimin, bëj për mua ndriçim dhe më bëj mua ndriçim. O Allah më ndriço mua, mi ndriço venat e mia, ma ndriço mishin tim, ma ndriço gjakun tim, m’i ndriço flokët tim dhe ma ndriço lëkurën time.",
        "transliteration": "All-llahumme-xh’al fi kalbi nuren, ve fi lisani nuren, ve fi sem’i nuren, ve fi besari nuren, ve min fevki nuren, ve min tahti nuren, ve an jemini nuren, ve an shimali nuren, ve min emami nuren, ve min halfi nuren, vexh’al fi nefsi nuren, ve adhim li nuren, ve adh-dhem li nuren, ve-xh’al-li nuren, vexh’alni nuren, All-llahumme aëtini nuren, vexh’al fi asabi nuren, ve fi lahmi nuren, ve fi demi nuren ve fi sha’ri nuren ve fi besheri nuren",
        "count": 1,
        "reference": "Buhariu 11/116, Muslimi 1/526, 529, 530."
      },
      {
        "id": 275,
        "ar": "اللَّهُمَّ اجْعَـلْ فِي قَلْبـي نورا ، وَفي لِسـاني نورا، وَاجْعَـلْ فِي سَمْعي نورا، وَاجْعَـلْ فِي بَصَري نورا، وَاجْعَـلْ مِنْ خَلْفي نورا، وَمِنْ أَمامـي نورا، وَاجْعَـلْ مِنْ فَوْقـي نورا ، وَمِن تَحْتـي نورا.اللَّهُمَّ أَعْطِنـي نورا.",
        "sq": "O Allahu im, më bëj dritë në zemrën time, dritë në gjuhën time, dritë në dëgjimin tim, dritë në shikimin tim, dritë mbi mua, dritë nën mua, dritë në të djathtën time, dritë në të majtën time, dritë përpara meje, dritë prapa meje, më bëj dritë në shpirtin tim, ma madhëro dritën time, ma shto dritën time, më bëj mua dritë! O Allahu im, më jep mua dritë, më bëj dritë në damarët e mi, dritë në mishin tim, dritë në gjakun tim, dritë në flokët e mi, dritë në lëkurën time! O Allah ma ndriço varrin tim dhe ma ndriço eshtrat e mia, ma shto mua ndriçimin, ma shto mua ndriçimin, ma shto mua ndriçimin dhe më dhuro mua dritë mbi dritë.",
        "transliteration": "All-llahumme-xh’al fi kalbi nuren, ve fi lisani nuren, ve fi sem’i nuren, ve fi besari nuren, ve min fevki nuren, ve min tehti nuren, ve an jemini nuren, ve an shimali nuren, ve min emami nuren, ve min khalfi nuren, vexh’al fi nefsi nuren, ve a’dhim li nuren, ve adh-dhim li nuren, vexh’al li nuren, vexh’alni nuren. All-llahumme a’tini nuren, vexh’al fi asabi nuren, ve fi lehmi nuren, ve fi demi nuren, ve fi sha’ri nuren, ve fi besheri nuren. All-llahumme-xh’al li nuren fi kabri, ve nuren fi idhami, ve zidni nuren, ve zidni nuren, ve zidni nuren, ve heb li nuren ala nurin.",
        "count": 1,
        "reference": "Tirmidhiu 5/483. Buhariu në librin “Edebul-Mufred” hadithi #695 fq. 258, isnadin e këtij hadithi e ka vërtetuar Albani në librin “Sahih Edebul-Mufred” hadithi #459. Këtë hadith e ka përmend Ibën Haxheri në “Fet’hul-Bari” dhe thotë se e ka cekur këtë Ibën Ebi Asim në librin e duave, 11/118 dhe thotë: nga transmetimet e ndryshme janë përmbledhur njëzet e pesë cilësi."
      }
    ]
  },
  {
    "id": 13,
    "categoryId": "namazi",
    "title": "Duaja e hyrjes në xhami",
    "duas": [
      {
        "id": 21,
        "ar": "  أَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ. [بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَّامُ عَلَى\\n\\nرَسُولِ اللَّهِ] اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        "sq": "Kërkoj mbrojtjen e Allahut të Madhërishëm, me Fytyrën e Tij të ndershme dhe me sundimin e Tij të përjetshëm nga shejtani i mallkuar.",
        "transliteration": "Eudhu bil-lahil-adhim, ve bi vexhhihil-kerim, ve sultanihil-kadim, minesh-shejtanir-raxhim",
        "count": 1,
        "reference": "Ebu Davudi, “Sahih el-Xhamiu” hadithi: #4591."
      },
      {
        "id": 276,
        "ar": "بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ ",
        "sq": "Me emrin e Allahut, përshëndetjet dhe shpëtimi i Allahut qoftë mbi të Dërguarin e Tij.",
        "transliteration": "Bismil-lah, ves-salatu ves-selamu ala resulil-lah",
        "count": 1,
        "reference": "Ibën Sunij hadithi nr. 88, shejh Albani thotë se hadithi është i mirë (hasen), Ebu Davudi 1/126, “Sahih el-Xhamiu” 1/528”."
      },
      {
        "id": 277,
        "ar": "اَللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
        "sq": "O Allahu im, m’i hap dyert e mëshirës Tënde.",
        "transliteration": "All-llahumme-ftah li ebvabe rahmetike",
        "count": 1,
        "reference": "Muslimi1/494."
      }
    ]
  },
  {
    "id": 14,
    "categoryId": "namazi",
    "title": "Duaja e daljes nga xhamia",
    "duas": [
      {
        "id": 22,
        "ar": "بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَّامُ عَلَى رَسُولِ اللهِ، اللَّهُمَّ إَنِّي أَسْأَلُكَ مِنْ فَضْلِكَ، اللَّهُمَّ اعصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ",
        "sq": "Me emrin e Allahut, përshëndetjet dhe shpëtimi i Allahut qoftë mbi të Dërguarin e Tij, o Allah unë kërkoj nga mirësitë Tua, O Allah, më mbroj nga shejtani i mallkuar.",
        "transliteration": "Bismil-lah ves-salatu ves-selamu ala resulil-lah, All-llahumme inni es-eluke min fadlike, All-llahumme aësimni minesh-shejtanir-raxhim",
        "count": 1,
        "reference": "Ibën Maxheh. Shih “Sahih Ibën Maxheh” 1/129."
      }
    ]
  },
  {
    "id": 15,
    "categoryId": "namazi",
    "title": "Lutjet e ezanit",
    "duas": [
      {
        "id": 23,
        "ar": "Thotë atë që e thotë myezini, përpos aty ku ai thotë:\\nحَيَّ عَلَى الصَّلَاةِ وَحَيَّ عَلَى الْفَلَاحِ\\nHajje ales-salah, hajje alel felah]\\n\"Ejani në namaz, ejani në shpëtim.”\\nDuhet të thotë:\\n",
        "sq": "Nuk ka ndryshim e as forcë pa ndihmën e Allahut.",
        "transliteration": "La havle, ve la kuvvete il-la bil-lah",
        "count": 1,
        "reference": "Buhariu 1/152, Muslimi 1/288."
      },
      {
        "id": 24,
        "ar": "وَأَنا أَشْـهَدُ أَنْ لَا إِلـهَ إِلاّ اللَّهُ وَحْـدَهُ لَا شَـريكَ لَـه ، وَأَنَّ محَمّـداً عَبْـدُهُ وَرَسـولُه ، رَضيـتُ بِاللَّهِ رَبَّاً ، وَبِمُحَمَّـدٍ رَسـولاً وَبِالإِسْلامِ دينَـاً",
        "sq": "Edhe unë dëshmoj se askush tjetër dhe asgjë tjetër nuk meriton të adhurohet përveç Allahut, të Vetëm e të Pashoq; dëshmoj që Muhamedi është robi dhe i dërguari i Tij. Jam i kënaqur që Allahu është Zoti im, që Muhamedi është Pejgamberi im dhe që Islami është feja ime.” Këtë duhet thënë pasi të thotë myezini: “Eshhedu en lá Iláhe il-lallah, Eshhedu enne Muhammeden Resúlull-llah.",
        "transliteration": "Ve ene eshhedu en La Ilahe il-lAll-llahu vahdehu la sherike leh, ve enne Muhammeden abduhu ve resuluhu, raditu bil-lahi Rabben ve bi Muhammedin resulen, ve bil-Islami dinen",
        "count": 1,
        "reference": "Muslimi 1/290. Ibën Huzejme 1/220."
      },
      {
        "id": 25,
        "ar": "اللَّهُمَّ رَبَّ هَذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّداً الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَاماً مَحْمُوداً الَّذِي وَعَدْتَهُ،\\n\\n[إَنَّكَ لَا تُخْلِفُ الْمِيعَادَ]",
        "sq": "Pas mbarimit të ezanit duhet thënë: O Allahu im, Zot i kësaj thirrjeje të plotë dhe i namazit që do të falet, jepi Muhamedit ndërmjetësimin dhe nderimin, si dhe dërgoje atë në vendin e lavdishëm të cilin ia ke premtuar. Pa dyshim, Ti e mban premtimin e dhënë. Me të vërtetë Ti nuk e thyen premtimin.” Bëj dua ndërmjet ezanit dhe ikametit, ngase me të vërtetë duaja në ketë kohë nuk refuzohet.",
        "transliteration": "All-llahumme Rabbe hadhihi ed-da’vetit-tammeh ves-salatil-kaimeh, ati Muhammedenil-vesilete vel-fadileh, veb’ath-hu mekamen mahmuden el-ledhi ve’adteh, [inneke la tuhliful-miad]",
        "count": 1,
        "reference": "Buhariu 1/152. Kjo është shtojcë e Bejhekiut 1/410. Dijetari AbdulAziz Ibën Baz, senedin e këtij hadithi e ka bërë të mirë (hasen), “Tuhfetul Ahjar”, fq.38”. Tirmidhiu, Ebu Davudi dhe Ahmedi, “Irvaul-Galil” 1/262."
      }
    ]
  },
  {
    "id": 16,
    "categoryId": "namazi",
    "title": "Duaja në fillim të namazit",
    "duas": [
      {
        "id": 26,
        "ar": "اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنْ خَطَايَايَ، كَمَا يُنَقَّى الثَّوْبُ الْأَ\\n\\nبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْنِي مِنْ خَطَايَايَ بِالثَّلْجِ وّالْمَاءِ وَالْبَرَدِ",
        "sq": "O Allahu im, më largo mua nga mëkatet e mia, ashtu siç e ke larguar lindjen prej perëndimit. O Zoti im, më pastro mua prej mëkateve të mia, ashtu siç pastrohet rroba e bardhë prej njollave të zeza. O Zoti im, më pastro mua prej mëkateve të mia me borë, ujë dhe akull.",
        "transliteration": "All-llahumme ba’id bejni ve bejne hatajaje kema ba’adte bejnel-meshriki vel-magrib, All-llahumme nekkini min hatajaje kema junekka eth-thevbul-ebjedu mined-denesi, All-llahumme Igsilni min hatajaje bil mai veth-thelxhi vel-beredi",
        "count": 1,
        "reference": "Buhariu 1/181, Muslimi 1/419."
      },
      {
        "id": 27,
        "ar": "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
        "sq": "I Lartësuar qofsh o Zoti im dhe për Ty është falënderimi, i Lartësuar qoftë emri Yt dhe e Lartësuar qoftë Madhëria Jote, s’ka të adhuruar tjetër përveç Teje.",
        "transliteration": "Subhaneke Allahumme ve bihamdike ve tebarekesmuke ve teala xhedduke ve la Ilahe gajruke.",
        "count": 1,
        "reference": "Transmetojnë autorët e katër Suneneve, “Sahih et-Tirmidhi” 1/77, “Sahih Ibën Maxheh” 1/135."
      },
      {
        "id": 28,
        "ar": "وَجَّهْتُ وَجْهِيَ لِلَّذِي فَطَرَ السَّموَاتِ وَالْأَرْضَ حَنِيفاً وَمَا أَنَا مِنَ الْمُشْرِكِينَ، إِنَّ صَلَاتِي، وَنُسُكِي، وَمَحْيَايَ، وَمَمَاتِي\\n\\nلِلَّهِ رَبِّ الْعَالَمِينَ، لَا شَرِيكَ لَهُ وَبِذَلِكَ أُمِرْتُ وَأَنَا مِنَ الْمُسْلِمِينَ. اللَّهُمَّ أَنْتَ الْمَلِكُ لَا إِلَهَ إِلَّا أَنْتَ، أَنْتَ رَبِّي وَأَنَا عَبْدُكَ،\\n\\nظَلَمْتُ نَفْسِي وَاعْتَرَفْتُ بَذَنْبِي فَاغْفِرْ لِي ذُنُوبِي جَمِيعاً إِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ، وَاهْدِنِي لأّحْسَنِ الْأَخْلَاقِ لَا يَهْدِي\\n\\nلأَحْسَنِهَا إِلَّا أَنْتَ، وَاصْرِفْ عَنِّي سَيِّئَهَا لَا يَصْرِفُ عَنِّي سَيِّئَهَا إِلَّا أَنْتَ، لَبَّيْكَ وَسَعْدَيْكَ، وَالْخَيْرُ كُلُّهُ بِيَدَيْكَ، وَالشَّرُّ\\n\\nلَيْسَ إِلَيْكَ، أَنَا بِكَ وَإِلَيْكَ، تَبَارَكْتَ وَتَعَالَيْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ",
        "sq": "E ktheva fytyrën time me besim të sinqertë nga Allahu, i Cili i ka krijuar qiejt dhe tokën sepse unë nuk jam prej idhujtarëve. Me të vërtetë namazi im, adhurimi im, jeta ime dhe vdekja ime janë vetëm për Allahun, Zotin e të gjitha botëve. Nuk ka si Allahu, kështu jam i urdhëruar që të bëj sepse unë jam prej muslimanëve. O Zoti im, Ti je Sunduesi i çdo gjëje, s’ka të adhuruar tjetër përveç Teje, Ti je Zoti im dhe unë jam robi Yt. I kam bërë dëm vetvetes dhe i pranoj mëkatet e mia, m’i fal mua të gjitha mëkatet e mia, sepse mëkatet nuk i fal askush tjetër përveç Teje. Më udhëzo mua në moralin më të mirë, sepse në atë nuk më udhëzon askush tjetër përveç Teje dhe largo nga unë sjelljen e keqe, sepse atë s’e largon askush tjetër përveç Teje; Ty të përgjigjem dhe Ty të Madhëroj; e gjithë e mira është në duart Tua, kurse e keqja s’ka vend te Ti; ekzistenca dhe rikthimi im janë në duart Tua. I Madhëruar dhe i Lartësuar je o Allah, kërkoj falje nga Ti dhe te ti pendohem.",
        "transliteration": "Vexh-xhehtu vexh-hije lil-ledhi fetares-semavati vel-erda hanifen ve ma ene minel-mushrikin, inne salati ve nusuki ve mahjaje ve memati lil-lahi Rabbil-alemin la sherike Lehu ve bi dhalike umirtu ve ene minel-muslimin. All-llahumme Entel-Meliku la Ilahe il-la Ente. Ente Rabbi ve ene abduke, dhalemtu nefsi va’tereftu bi dhenbi fagfir li dhunubi xhemian innehu la jagfirudh-dhunube il-la Ente. Ve ihdini li Ahsenil-Ahlaki la jehdi li ahseniha il-la Ente, vesrif anni sejjieha, la jasrifu anni sejjieha il-la Ente, lebejke ve sa’dejk, vel-hajru kul-luhu bi jedejke, vesh-sherru lejse ilejke, ene bike ve ilejke, tebarekte ve te alejt, estagfiruke ve etubu ilejke",
        "count": 1,
        "reference": "Muslimi 1/135."
      },
      {
        "id": 29,
        "ar": "اللَّهُمَّ رَبَّ جِبْرَائِيلَ، وَمِيكَائِيلَ، وَإِسْرَافِيلَ فَاطِرَ السَّماوَاتِ وَالْأَرْضِ، عَالِمَ الْغَيْبِ وَالشَّهَادَةِ، أَنْتَ تَحْكُمُ عِبَادِكَ فِيمَا\\n\\nكَانُوا فِيهِ يَخْتَلِفُونَ. اهْدِنِي لِمَا اخْتُلِفَ مِنَ الْحَقِّ بِإِذْنِكَ إِنَّكَ تَهْدِي مَنْ تَشَاءُ إِلى صِرَاطٍ مُسْتَقِيمٍ",
        "sq": "O Allahu im, Zoti i Xhebrailit, Mikailit dhe Israfilit, Krijuesi i qiejve dhe i tokës, Ti je Ai që e di të fshehtën dhe të tanishmen, Ti je Ai që gjykon ndërmjet robërve Tu në atë që janë kundërshtuar, më udhëzo mua në të vërtetën nga ajo që janë kundërshtuar. Me të vërtetë, Ti udhëzon në rrugën e drejtë atë që dëshiron.",
        "transliteration": "All-llahumme Rabbe Xhibrail ve Mikail, ve Israfil fatires-semavati vel-erd, alimel-gajbi vesh-shehadeh, Ente tahkumu bejne ibadike fi ma kanu fíhi jahtelifun. Ihdini lima ihtulife fihi minel-hakki bi idhnike inneke tehdi men teshau ila siratin mustekim",
        "count": 1,
        "reference": "Muslimi 1/534."
      },
      {
        "id": 30,
        "ar": "اللَّهُ أَكْبَرُ كَبِيراً، اللَّهُ أَكْبَرُ كَبِيراً، اللَّهُ أَكْبَرُ كَبِيراً، وَالْحَمْدُ لِلَّهِ كَثِيراً, وَالْحَمْدُ لِلَّهِ كَثِيراً, وَالْحَمْدُ لِلَّهِ كَثِيراً, وَسُبْحَانَ اللَّهِ بُكْرَةً\\n\\nوَأَصِيلاً ثَلَاثاً أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ: مِنْ نَفْخِهِ، وَنَفْثِهِ، وَهَمْزِهِ",
        "sq": "Allahu është më i madhi, Allahu është më i madhi, Allahu është më i madhi, falënderime të shumta i takojnë Allahut dhe i Lartësuar qoftë Allahu mëngjes dhe mbrëmje (tre herë) (Kërkoj mbrojtjen e Allahut prej shejtanit: prej fryrjes së tij, pëshpëritjes së tij dhe cytjeve të tij.",
        "transliteration": "All-llahu Ekberu Kebira, All-llahu Ekberu Kebira, Allahu Ekberu Kebira, vElhamdulil-lahi kethira, vElhamdulil-lahi kethira, vElhamdulil-lahi kethira, ve subhanAll-llahi bukreten ve esila, (3 herë). Eudhu bil-lahi minesh-shejtani: min nefhihi, ve nefthihi, ve hemzihi. (3 herë)",
        "count": 3,
        "reference": "Ebu Davudi 1/203, Ibën Maxheh 1/265 dhe Ahmedi 4/85. Gjithashtu, Muslimi shënon ngjashëm me këtë 1/420."
      },
      {
        "id": 31,
        "ar": "اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ نُورُ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ، وَلَكَ الْحَمْدُ أَنْتَ قَيِّمُ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ، [وَلَكَ\\n\\nالْحَمْدُ أَنْتَ رَبُّ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ] [وَلَكَ الْحَمْدُ لَكَ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ وَمَنْ فِيهِنَّ] [وَلَكَ الْحَمْدُ أَنْتَ\\n\\nمَلِكُ السَّمَاوَاتِ وَالْأَرْضِ] [لَكَ الْحَمْدُ] [أَنْتَ الْحَقُّ، وَوَعْدُكَ الْحَقُّ، وَقَوْلُكَ الْحَقُّ، وَلِقَاؤُكَ الْحَقُّ، وَالْجَنَّةُ حَقٌّ، وَالنَّارُ\\n\\nحَقٌّ، وَالنَّبِيُّونَ حَقٌّ، وَمُحَمَّدٌ صَلَى اللَّهُ عَلِيهِ وَسَلَّمَ حَقٌّ، وَالسَّاعَةُ حَقٌّ] [اللَّهُمَّ لَكَ أَسْلَمت ، وَعَلَـيْكَ تَوَكَّلْـت ، وَبِكَ آمَنْـت ، وَإِلَـيْكَ أَنَبْـت ، وَبِـكَ خاصَمْت ، وَإِلَـيْكَ حاكَمْـت. فاغْفِـرْ لي مـا قَدَّمْتُ ، وَما أَخَّـرْت ، وَما أَسْـرَرْت ، وَما أَعْلَـنْت]\\n\\n [أَنْتَ إِلَهِي لَا إِلَهَ إّلَّا أَنْتَ]",
        "sq": "O Allahu im, Ty të takon Falënderimi, Ti je Ndriçuesi i qiejve dhe i tokës, si dhe i asaj ç’ka në to, Ty të takon Falënderimi. Ti je ngritës i qiejve dhe i tokës, si dhe asaj ç’ka në to, Ty të takon Falënderimi. Ti je Zot i qiejve dhe i tokës, si dhe i asaj ç’ka në to, Ty të takon Falënderimi. I Yti është Sundimi i qiejve dhe i tokës, si dhe i asaj ç’ka në to, Ty të takon Falënderimi. Ti je Sundues i qiejve dhe i tokës, Ty të takon Falënderimi. Ti je i vërtetë dhe premtimi Yt është i vërtetë, fjala Jote është e vërtetë dhe takimi Yt është i vërtetë, Xheneti është i vërtetë dhe Xhehenemi është i vërtetë, Pejgamberët janë të vërtetë dhe Muhamedi është i vërtetë, si dhe Kiameti është i vërtetë. O Zoti im, Ty të jam nënshtruar dhe në Ty jam mbështetur, Ty të kam besuar dhe Ty të drejtohem, për Ty hasmohem dhe te Ti kthehem për gjykim, m’i fal mëkatet e mia të mëparshmet dhe të tanishmet, ato që i kam bërë fshehurazi dhe haptazi. Ti je i Pari dhe Ti je i Fundit, s’ka të adhuruar tjetër përveç teje; Ti je Zoti im, s’ka Zot tjetër përveç Teje.",
        "transliteration": "All-llahumme lekel-hamdu Ente Nurus-semavati vel-erdi ve men fi hinne, ve lekel-hamdu Ente Kajjimus-semavati vel-erdi ve men fi hinne [ve lekel-hamdu Ente Rabbus-semavati vel-erdi ve men fi hinne], [ve lekel-hamdu leke Mulkus-semavati vel-erdi ve men fi hinne], [ve lekel-hamdu Ente Málikus-semavati vel-erdi], [ve lekel-hamdu], [Entel-Hakku ve va’dukel-hakku, ve kavlukel-hakku, ve likaukel-hakku, vel-xhenetu hakkun, ven-naru hakkun, ven-nebijjune hakkun, ve Muhammedun hakkun, ves-saatu hakkun], [All-llahumme leke eslemtu ve alejke tevekeltu, ve bike amentu, ve ilejke enebtu, ve bike hasamtu, ve ilejke hakemtu, fagfirli ma kaddemtu ve ma ehartu, ve ma esrertu ve ma a’lentu], [ Ennte el-Mukaddimu ve Ente el-Muah-hiru la ilahe il-la Ente], [Ente Ilahi la ilahe il-la Ente]",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 3/3, 1/116, 13/371, 423, 465, Muslimi në version të shkurtuar ngjashëm me këtë 1/83."
      }
    ]
  },
  {
    "id": 17,
    "categoryId": "namazi",
    "title": "Duatë në ruku",
    "duas": [
      {
        "id": 32,
        "ar": "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
        "sq": "I Lartësuar qoftë Zoti im i Madhërishëm.",
        "transliteration": "Subhane Rabbijel-adhim (3 herë)",
        "count": 3,
        "reference": "Transmetojnë autorët e katër suneneve dhe Ahmedi “Sahih et-Tirmidhi” 1/83."
      },
      {
        "id": 33,
        "ar": "سُبْحَانَكَ اللَّهُمَّ رَبَّنَا وَبِحَمْدِكَ اللَّهُمَّ اغْفِرْ لِي",
        "sq": "I Lartësuar qofsh o Allah, Zoti ynë, Ty të takon Falënderimi. O Allah, më fal mua.",
        "transliteration": "Subhaneke All-llahumme Rabbena ve bihamdike, All-llahumme-gfir li",
        "count": 1,
        "reference": "Buhariu 1/99, Muslimi 1/350."
      },
      {
        "id": 34,
        "ar": "سُبُّوحٌ، قُدُوسٌ، رَبُّ الْمَلَائِكَةِ وَالرُّوحِ",
        "sq": "I Madhëruar dhe i Shenjtë është Zoti i melaikeve dhe i Xhibrilit.",
        "transliteration": "Subbuhun, Kudusun Rabbul Melaiketi ver-Ruh",
        "count": 1,
        "reference": "Muslimi 1/353, Ebu Davudi 1/230."
      },
      {
        "id": 35,
        "ar": "اللَّهُمَّ لَكَ رَكَعْتُ، وَبِكَ آمَنْتُ، وَلَكَ أَسْلَمْتُ خَشَعَ لَكَ سَمْعِي، وَبَصَرِي وَمُخِّي، وَعَظْمِي، وَعَصَبِي، وَمَا اسْتَقَلَّ بِهِ قَدَمِي",
        "sq": "O Allahu im, Ty të jam përulur dhe Ty të besova. Ty të jam nënshtruar; Ty të është përulur me frikërespekt dëgjimi im, shikimi im, truri im, ashti im, nervi im dhe tërë ato që mbajnë këmbët e mia.",
        "transliteration": "All-llahumme leke reka’tu, ve bike amentu, ve leke eslemtu, hashe’a leke sem’í ve besari, ve muhhi, ve adhmi, ve asabi ve mes-tekal-le bihi kademi",
        "count": 1,
        "reference": "Muslimi 1/534 dhe katër sunenet përveç Ibën Maxhes."
      },
      {
        "id": 36,
        "ar": "سُبْحَانَ ذِي الْجَبَرُوتِ، وَالْمَلَكُوتِ، وَالْكِبْرِيَاءِ، وَالْعَظَمَةِ",
        "sq": "I Madhëruar qoftë i Gjithëfuqishmi, Zotëruesi i çdo gjëje, Atij i takon Kryelartësia dhe Madhëria.",
        "transliteration": "Subhane dhil-xheberuti vel-melekuti vel-kibrijai vel-adhameti",
        "count": 1,
        "reference": "Ebu Davudi 1/230, ngjashëm e shënojnë edhe Nesaiu dhe Ahmedi; senedi i këtij hadithi është i mirë (hasen)."
      }
    ]
  },
  {
    "id": 18,
    "categoryId": "namazi",
    "title": "Duatë e ngritjes nga rukuja",
    "duas": [
      {
        "id": 37,
        "ar": "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ",
        "sq": "Allahu e dëgjon atë që e falënderoi Atë.",
        "transliteration": "Semi’All-llahu limen hamideh",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 2/282."
      },
      {
        "id": 38,
        "ar": "رَبَّنَا وَلَكَ الْحَمْدُ، حَمْداً كَثِيراً طَيِّباً مُبَارَكاً فِيهِ",
        "sq": "Zoti ynë, Ty të takon Falënderimi, Falënderimi i shumtë, i cili është plotë mirësi dhe bekim.",
        "transliteration": "Rabbena ve lekel-hamd, hamden kethiren tajjiben mubareken fíhi",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 2/282."
      },
      {
        "id": 39,
        "ar": "مِلْءَ السَّمَاوَاتِ وَمِلْءَ الأَرْضِ وَمَا بَيْنَهُمَا، وَمِلْءَ مَا شِئْتَ مِنْ شَيْءٍ بَعْدُ. أَهْلَ الثَّنَاءِ وَالْمَجْدِ، أَحقُّ مَا قَالَ الْعَبْدُ،\\n\\nوَكُلُّنَا لأضكَ عَبْدٌ. اللَّهُمَّ لَا مَنِعَ لَمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ",
        "sq": "O Zoti im, Ty të përket Falënderimi aq sa janë qiejt dhe toka, aq sa ka ndërmjet tyre, si dhe aq sa Ti dëshiron prej gjërave të tjera. O pronar i Lavdisë dhe i Madhështisë, Ti meriton lavdi dhe madhështi më shumë se ç’thotë robi Yt. O Zoti im, ne të gjithë jemi robërit Tu: Nuk ka kush e ndalon atë që Ti e jep, e s’ka kush e jep atë që Ti e ndalon; s’ka dobi i pasuri prej pasurisë, sepse pasuria e tij është prej Teje.",
        "transliteration": "Mil’es-semaváti ve mil’el-erdi ve ma bejnehuma, ve mil’e ma shi’te min shejin ba’ëdu. Ehleth-thenai vel-mexhdi, ehakku ma kalel-abdu, ve kul-luna Leke abdun. All-llahumme la mani’a lima a’ëtajte, ve la mu’ëtije lima mena’ëte, ve la jenfe’u dhel-xheddi minkel-xheddu",
        "count": 1,
        "reference": "Muslimi 1/346."
      }
    ]
  },
  {
    "id": 19,
    "categoryId": "namazi",
    "title": "Duatë në sexhde",
    "duas": [
      {
        "id": 40,
        "ar": "سُبْحَانَ رَبِّيَ الأَعْلَى",
        "sq": "I Madhëruar qoftë Zoti im i Lartë.",
        "transliteration": "Subhane Rabbijel-a’la (3 herë)",
        "count": 3,
        "reference": "Transmetojnë autorët e katër suneneve dhe Ahmedi. “Sahih et-Tirmidhi” 1/83."
      },
      {
        "id": 41,
        "ar": "سُبْحَانَكَ اللَّهُمَّ رَبَّنَا وَبِحَمْدِكَ اللَّهُمَّ اغْفِرْ لِي",
        "sq": "I Madhëruar qofsh o Allah, Zoti ynë, Ty të takon Falënderimi. O Allah, më fal mua.",
        "transliteration": "Subhaneke All-llahumme Rabbena ve bihamdike, All-llahumme-gfir li",
        "count": 1,
        "reference": "Buhariu 1/99, Muslimi 1/350."
      },
      {
        "id": 42,
        "ar": "سُبُّوحٌ، قُدُّسٌ، رَبُّ الْمَلَائِكَةِ وَالرُّوحِ",
        "sq": "I Madhëruar dhe i Shenjtë është Zoti i melaikeve dhe i Xhibrilit.",
        "transliteration": "Subbuhun, Kudusun Rabbul Melaiketi ver-Ruh",
        "count": 1,
        "reference": "Muslimi 1/353, Ebu Davudi 1/230."
      },
      {
        "id": 43,
        "ar": "اللَّهُمَّ لَكَ سَجَدْتُ وَبِكَ آمَنْتُ، وَلَكَ أَسْلَمْتُ، سَجَدَ وَجْهِيَ لِلَّذِي خَلَقَهُ، وَصَوَّرَهُ، وَشَقَّ سَمْعَهُ وَبَصَرَهُ، تَبَارَكَ اللَّهُ\\n\\nأَحْسَنُ الْخَالِقِينَ",
        "sq": "O Allahu im, Ty të bëj sexhde, Ty të besoj, Ty të nënshtrohem, fytyra ime të bën sexhde vetëm Ty, o Allah sepse Ti e krijove dhe e zbukurove, e pajise me dëgjim dhe shikim, i Madhëruar qoftë Allahu, i Cili është Krijuesi më i Mirë.",
        "transliteration": "All-llahumme Leke sexhed-dtu ve bike amentu ve Leke eslemtu, sexhede vexh-hije lil-ledhi halekahu, ve savverehu ve shekka sem’ahu ve besarehu, tebareke All-llahu Ahsenul-Halikin",
        "count": 1,
        "reference": "Muslimi 1/534 dhe të tjerët."
      },
      {
        "id": 44,
        "ar": "سُبْحَانَ ذِي الْجَبَرْوتِ، وَالْمَلَكُوتِ، وَالْكِبْرِيَاءِ، وَالْعَظَمَةِ",
        "sq": "I Madhëruar qoftë i Gjithëfuqishmi, Zotëruesi i çdo gjëje dhe vetëm Atij i takon Kryelartësia dhe Madhëria.",
        "transliteration": "Subhane dhil-xheberuti vel-melekuti vel-kibrijai vel-adhameti",
        "count": 1,
        "reference": "Ebu Davudi 1/230, Nesaiu dhe Ahmedi; senedi i këtij hadithi është hasen (i mirë)."
      },
      {
        "id": 45,
        "ar": "اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ، دِقَّهُ وَجِلَّهُ، وَأَوَّلَهُ وَآخِرَهُ وَعَلَانِيَتَهُ وَسِرَّهُ",
        "sq": "O Allahu im, m’i fal mua të gjitha mëkatet e mia, të voglat dhe të mëdhatë, të parat dhe të fundit, të dukshmet dhe të fshehtat.",
        "transliteration": "All-llahumme-gfir li dhenbi kul-lehu, dikkahu ve xhil-lehu, ve evvelehu ve ahirehu ve alanijetehu ve sirrehu",
        "count": 1,
        "reference": "Muslimi 1/350."
      },
      {
        "id": 46,
        "ar": "اللَّهُمَّ إِنِّي أَعُوذُ بِرِضَاكَ مِنْ سَخَطِكَ، وَبِمُعَافَاتِكَ مَنْ عُقُوبَتِكَ، وَاَعُوذُ بِكَ مِنْكَ، لَا أُحصِي ثَنَاءً عَلَيْكَ أَنْتَ كَمَا أَثْنَيْتَ\\n\\nعَلَى نَفْسِكَ",
        "sq": "O Allahu im, kërkoj strehim përmes kënaqësisë Tënde nga hidhërimi Yt, si dhe me faljen Tënde nga dënimi Yt. Kërkoj mbrojtjen Tënde nga Ti, unë nuk mund të të madhëroj aq sa meriton Ti; Ti je i Madhëruar ashtu siç e ke përshkruar Vetveten.",
        "transliteration": "All-llahumme inni eudhu bi ridake min sehatik, ve bi muafatike min ukubetik, ve eudhu bike minke, la uhsi thenaen Alejke, Ente kema ethnejte ala Nefsike",
        "count": 1,
        "reference": "Muslimi 1/532."
      }
    ]
  },
  {
    "id": 20,
    "categoryId": "namazi",
    "title": "Duatë në uljen mes dy sexhdeve",
    "duas": [
      {
        "id": 47,
        "ar": "رَبِّ اغْفِرْ لِي رَبِّ اغْفِرْ لِي",
        "sq": "Zoti im, më falë mua. Zoti im, më falë mua!",
        "transliteration": "Rabbi-gfir li, Rabbi-gfir li",
        "count": 1,
        "reference": "Ebu Davudi 1/23. Shih “Sahih Ibën Maxheh” 1/148."
      },
      {
        "id": 48,
        "ar": "اللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَاجْبُرْنِي، وَعَافِنِي، وَارْزُقْنِي، وَارْفَعْنِي",
        "sq": "O Allahu im, më fal, më mëshiro, më udhëzo, më forco në këtë fe, më jep shëndet, më jep furnizim dhe më ngritë lartë.",
        "transliteration": "All-llahumme-gfir li ver-hamni, ve-hdini, vexh-burni, ve afini ver-zukni, ver-feani",
        "count": 1,
        "reference": "Transmetojnë autorët e katër suneneve përveç Nesaiut, “Sahih et-Tirmidhi” 1/90 dhe “Sahih Ibën Maxheh” 1/148."
      }
    ]
  },
  {
    "id": 21,
    "categoryId": "namazi",
    "title": "Duatë e sexhdes gjatë leximit të kuranit",
    "duas": [
      {
        "id": 49,
        "ar": "سَجَدَ وَجْهِيَ لِلَّذِي خَلَقَهُ، وَشَقَّ سَمْعَهُ وَبَصَرَهُ، بِحَوْلِهِ وَقُوَّتِهِ، فَتَبَارَكَ اللَّهُ أَحسَنُ الْخَالِقِينَ",
        "sq": "Fytyra ime i bën sexhde vetëm Atij, i Cili e krijoi dhe e pajisi atë me dëgjim dhe shikim, me lëvizjen dhe fuqinë e Tij; i Madhëruar qoftë Allahu, i Cili është Krijuesi më i Mirë.",
        "transliteration": "Sexhede vexhhije lil-ledhi halekahu ve shekka sem’ahu ve besarehu bi havlihi ve kuvvetihi [Fetebareke All-llahu Ahsenul-Halikin]",
        "count": 1,
        "reference": "Tirmidhiu 2/474, Ahmedi 6/30, Hakimi, thotë se hadithi është i vërtetë. Me këtë pajtohet Dhehebiu 1/220. Shtojca pas pikëpresjes është e Dhehebiut."
      },
      {
        "id": 50,
        "ar": "اللَّهُمَّ اكْتُبْ لِي بِهَا عِنْدَكَ أَجْراً، وَضَعْ عَنِّي بِهَا وِزْراً، وَاجْعَلْهَا لِي ذُخْراً، وَتَقَبَّلْهَا مِنِّي كَمَا تَقَبَّلْتَهَا مَنْ عَبْدِكَ دَاوُدَ",
        "sq": "O Allahu im, më shkruaj mua me këtë sexhde tek Ti shpërblim dhe largoj nga unë mëkatet, bëje që me këtë sexhde të kem dobi tek Ti, ma prano mua këtë sexhde, ashtu siç e ke pranuar prej robit tënd Davudit.",
        "transliteration": "All-llahumme uktub li biha indeke exhren, ve da’anni biha vizren, vexh’alha li indeke dhuhren, ve tekabbelha minni kema tekabbelteha min abdike Davud",
        "count": 1,
        "reference": "Tirmidhiu 2/473 dhe Hakimi, i cili thotë se hadithi është i vërtetë. Me këtë pajtohet edhe Dhehebiu 1/219."
      }
    ]
  },
  {
    "id": 22,
    "categoryId": "namazi",
    "title": "Teshehudi",
    "duas": [
      {
        "id": 51,
        "ar": "التَّحِيّـاتُ لِلَّهِ وَالصَّلَـواتُ والطَّيِّـبات ، السَّلامُ عَلَيـكَ أَيُّهـا النَّبِـيُّ وَرَحْمَـةُ اللَّهِ وَبَرَكـاتُه ، السَّلامُ عَلَيْـنا وَعَلـى عِبـادِ كَ الصَّـالِحـين. أَشْـهَدُ أَنْ لَا إِلـهَ إِلاّ اللَّهِ ، وَأَشْـهَدُ أَنَّ مُحَمّـداً عَبْـدُهُ وَرَسـولُه",
        "sq": "Nderimi, lutjet dhe të gjitha mirësitë i takojnë Allahut. Le të jetë paqja mbi ty o i Dërguar i Zotit, paqja le të jetë mbi të gjithë ne dhe mbi të gjithë robërit e mirë të Allahut. Dëshmoj se nuk ka të adhuruar tjetër përveç Allahut dhe dëshmoj se Muhamedi është robi dhe i Dërguari i Tij.",
        "transliteration": "Et-tehijjatu lil-lahi ves-salavatu vet-tajjibatu, es-selamu alejke ejjuhen-nebijju ve rahmetull-llahi ve berekatuhu, es-selamu alejna ve ala ibadil-lahis-salihin. Eshhedu en la Ilahe il-lAll-llahu ve eshhedu enne Muhammeden abduhu ve resuluhu",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 1/13, Muslimi 1/301."
      }
    ]
  },
  {
    "id": 23,
    "categoryId": "namazi",
    "title": "Salavatet mbi të dërguarin",
    "duas": [
      {
        "id": 52,
        "ar": "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكَ عَلَى مُحَمَّدٍ وَعَلَى آلِ\\n\\nمُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
        "sq": "O Allahu im, ki mëshirë ndaj Muhamedit dhe familjes së tij, siç pate mëshirë ndaj Ibrahimit dhe familjes së tij, se vërtet Ti je i Lavdëruar dhe i Madhëruar. O Allahu im, bekoje Muhamedin dhe familjen e tij, siç e bekove Ibrahimin dhe familjen e tij, se vërtet Ti je i Lavdëruar dhe i Madhëruar.",
        "transliteration": "All-llahumme sal-li ala Muhammedin ve ala ali Muhammed, kema sal-lejte ala Ibrahime ve ala ali Ibrahim inneke Hamidun Mexhid. All-llahumme barik ala Muhammedin ve ala ali Muhammed kema barekte ala Ibrahime ve ala ali Ibrahim inneke Hamidun Mexhid",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 6/408."
      },
      {
        "id": 53,
        "ar": "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى أَزْوَاجِهِ وَذُرِّيَّتِهِ، كَمَا صَلَّيْتَ عَلَى آلِ إِبْرَاهِيمَ، وَبَارِكَ عَلَى مُحَمَّدٍ وَعَلَى أَزْوَاجِهِ وَذُرِّيَّتِهِ،\\n\\nكَمَا بَارَكْتَ عَلَى آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ",
        "sq": "O Allahu im, ki mëshirë ndaj Muhamedit, bashkëshorteve të tij dhe pasardhësve të tij, siç pate mëshirë ndaj familjes së Ibrahimit, si dhe bekoje Muhamedin, bashkëshortet e tij dhe pasardhësit e tij, siç e bekove familjen e Ibrahimit. Vërtet, Ti je i Lavdëruar dhe i Madhëruar.",
        "transliteration": "All-llahumme sal-li ala Muhammedin ve ala ezvaxhihi ve dhurrijjetihi, kema sal-lejte ala ali Ibrahim, ve barik ala Muhammedin ve ala ezvaxhihi ve dhurrijjetihi, kema barekte ala ali Ibrahime inneke Hamidun Mexhid",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 6/407 dhe Muslimi 1/306; version i Muslimit."
      }
    ]
  },
  {
    "id": 24,
    "categoryId": "namazi",
    "title": "Duatë në teshehudin e fundit, para dhënies selam",
    "duas": [
      {
        "id": 54,
        "ar": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَمِنْ عَذَابِ جَهَنَّمَ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ",
        "sq": "O Allahu im, kërkoj mbrojtjen Tënde prej dënimit të varrit dhe prej dënimit të Xhehenemit, si dhe kërkoj mbrojtjen Tënde nga sprovat e jetës dhe të vdekjes, si dhe nga sprova e Dexhallit.",
        "transliteration": "All-llahumme inni eudhu bike min adhabil-kabr, ve min adhabi xhehenem, ve min fitnetil-mahja vel-memat, ve min fitnetil-Mesihid-dexh-xhal",
        "count": 1,
        "reference": "Buhariu 2/102, Muslimi 1/412; version i Muslimit."
      },
      {
        "id": 55,
        "ar": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ. اللَّهُمَّ\\n\\nإِنِّي أَعُوذُ بِكَ مِنْ الْمَأْثَمِ وَالْمَغْرَمِ",
        "sq": "O Allahu im, kërkoj mbrojtjen Tënde prej dënimit të varrit, nga sprova e Dexhalit dhe nga sprovat e jetës dhe të vdekjes. O Allahu im, kërkoj mbrojtjen Tënde nga mëkatet dhe nga borxhet ndaj njerëzve.",
        "transliteration": "All-llahumme inni eudhu bike min adhabil-kabr, ve eudhu bike min fitnetil-Mesihid-dexhxhal, ve eudhu bike min fitnetil-mahja vel-memat. All-llahumme inni eudhu bike minel-me’themi vel-magrem",
        "count": 1,
        "reference": "Buhariu 1/202, Muslimi 1/412."
      },
      {
        "id": 56,
        "ar": "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْماً كَثِيراً، وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ\\n\\nالرَّحِيمُ",
        "sq": "O Allahu im, vetes i kam bërë dëm dhe shumë padrejtësi, mëkatet nuk i falë askush tjetër përveç Teje, andaj më fal mua me faljen Tënde dhe më mëshiro mua. Vërtet, Ti je Falës dhe i Mëshirshëm.",
        "transliteration": "All-llahumme inni dhalemtu nefsi dhulmen kethiren, ve la jagfirudh-dhunube il-la Ente, fagfirli magfireten min indeke ver-hamni inneke Entel-Gafurur-Rahim",
        "count": 1,
        "reference": "Buhariu 8/168, Muslimi 4/2078."
      },
      {
        "id": 57,
        "ar": "اللَّهُمَّ اغْفِرْ لِي مَا قَدَّمْتُ، وَمَا أَخَّرْتُ، وَمَا أَسْرَرْتُ، وَمَا أَعْلَنْتُ، وَمَا أَسْرَفْتُ، وَمَا أَنْتَ أَعْلَمُ بِهِ مِنِّي. أَنْتَ الْمُقَدِّمُ،\\n\\nوَأَنْتَ الْمُؤَخِّرُ لَا إِلَعَ إِلَّا أَنْتَ",
        "sq": "O Allahu im, m’i fal mëkatet e mia të mëparshme dhe të tanishme, ato që i kam bërë fshehurazi dhe haptazi, si dhe ato me të cilat e kam ngarkuar veten, e për të cilat Ti e di më mirë se unë; Ti je i Pari dhe Ti je i Fundit, nuk ka hyjni që meriton të adhurohet përveç Teje.",
        "transliteration": "All-llahumme-gfir li ma kaddemtu ve ma ahhartu, ve ma esrertu ve ma a’ëlentu, ve ma esreftu ve ma Ente A’ëlemu bihi minni. Entel-Mukaddimu ve Entel-Muahhiru, La Ilahe il-la Ente",
        "count": 1,
        "reference": "Ebu Davudi 2/86, Nesaiu 3/53. Hadith i vërtetë sipas shejh Albanit, shih “Sahih Ebu Davud” 1/284."
      },
      {
        "id": 58,
        "ar": "اللَّهُمَّ أَعِنَّي عَلَى ذِكْرِكَ، وَشُكْرِكَ، وَحُسْنِ عِبَادَتِكَ",
        "sq": "O Allahu im, më ndihmo të të përmend e të të falënderoj, si dhe më mundëso që të të adhuroj sa më mirë.",
        "transliteration": "All-llahumme einni ala dhikrike ve shukrike ve husni ibadetike",
        "count": 1,
        "reference": "Ebu Davudi 2/86, Nesaiu 3/53. Sahih sipas shejh Albanit, shih “Sahih Ebu Davud” 1/284."
      },
      {
        "id": 59,
        "ar": "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْبُخْلِ، وَأَعُوذُ بِكَ مِنَ الْجُبْنِ، وَأَعُوذُ بِكَ مِنْ أَنْ أُرَدَّ إِلَى أَرْذَلِ الْعُمُرِ، وَأَعُوذُ بِكَ مِنْ فِتْنَةِ\\n\\nالدُّنْيَا وَعَذَابِ الْقَبْرِ",
        "sq": "O Allahu im, kërkoj mbrojtjen Tënde nga koprracia dhe nga përtacia, si dhe kërkoj mbrojtjen Tënde nga matufosja , nga sprovat e jetës si dhe nga dënimi i varrit.",
        "transliteration": "All-llahumme inni eudhu bike minel-buhli, ve eudhu bike minel-xhubni, ve eudhu bike min en uredde ila erdhelil-umri, ve eudhu bike min fitnetid-dunja ve adhabil-kabr",
        "count": 1,
        "reference": "Humbje e kujtesës dhe e shkathtësisë së të menduarit (sh.p.). Ebu Davudi, po ashtu shih “Sahih Ibën Maxheh” 2/328."
      },
      {
        "id": 60,
        "ar": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ",
        "sq": "O Allahu im, kërkoj prej Teje xhenetin dhe kërkoj prej Teje mbrojtjen Tënde nga zjarri.",
        "transliteration": "All-llahumme inni es’elukel-xhenete, ve eudhu bike minen-nar",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 6/35."
      },
      {
        "id": 61,
        "ar": "اللَّهُمَّ بِعِلْمِكَ الْغَيْبَ وَقُدْرَتِكَ عَلَى الْخَلْقِ أَحْيِنِي مَا عَلِمْتَ الْحَيَاةَ خَيْراً لِي وَتَوَفَّنِي إِذَا عَلِمْتَ الْوَفَاةَ خَيْراً لِي، اللَّهُمَّ\\n\\nإِنِّي أَسْأَلُكَ خَشْيَتَكَ فِي الْغَيْبِ وَالشَّهَادَةِ، وَأَسْأَلُكَ كَلِمَةَ الْحَقِّ فِي الرِّضَا وَالْغَضَبِ، وَأَسْأَلُكَ الْقَصْدَ فِي الْغِنَى وَالْفَقْرِ،\\n\\nوَأَسْأَلُكَ نَعِيماً لَا يَنْفَذُ، وَأَسْأَلُكَ قُرَّةَ عَيْنٍ لَا تَنْقَطِعُ، وَأَسْأَلُكَ الرِّضِا بَعْدَ الْقَضَاءِ، وَأَسْأَلُكَ بَرْدَ الْعَيْشِ بَعْدَ الْمَوْتِ،\\n\\nوَأَسْأَلُكَ لَذَّةَ النَّظَرِ إِلَى وَجْهِكَ وَالشَّوْقَ إِلَى لِقَائِكَ فِي غَيْرِ ضَرَّاءَ مُضِرَّةٍ وَلَا فِتْنَةٍ مُضِلَّةٍ، اللَّهُمَّ زَيِّنَّا بِزِينَةِ الْإِيمَانِ\\n\\nوِاجْعَلْنَا هُدَاةً مُهْتَدِينَ",
        "sq": "O Allahu im, të lus me diturinë Tënde mbi të fshehtën dhe me fuqinë Tënde mbi krijesat, që të ma zgjatësh jetën, nëse jeta ime është më e mirë për mua, si dhe të lutem të më bësh të vdekur, nëse vdekja ime është më e mirë për mua. Allahu im, më bëj të të frikësohem në vetmi dhe në publik; më bëj që ta flas të vërtetën kur jam i disponuar dhe kur jam i hidhëruar, të kërkoj që të jem i matur gjatë varfërisë dhe pasurisë, të lutem më jep begati të pashtershme, të lutem të më bësh të kënaqur me atë që më ke caktuar, më jep jetë të qetë pas vdekjes, më dhuro shikim të këndshëm në Fytyrën Tënde dhe mallëngjim për takimin Tënd pa vështirësi dhe sprovim. O Allahu im, na zbukuro neve me bukurinë e besimit dhe na bëj udhëzues dhe udhërrëfyes për të tjerët.",
        "transliteration": "All-llahumme bi ilmikel-gajb ve kudretike alel-halki ahjini ma alimtel-hajate hajren li ve teveffeni idha alimtel-vefate hajren li, All-llahumme inni es’eluke hashjeteke fil-gajbi vesh-shehadeti, ve es’eluke kelimetel-hakki fir-rida vel-gadab, ve es’elukel-kasde fil-gina vel-fakr, ve es’eluke ne’iimen la jenfedu ve es’eluke kur-rete ajnin la tenkatiu, ve es’eluker-rida ba’del-kada, ve es’eluke berdel-ajshi ba’del-mevt, ve es’eluke ledhdheten-nedhari ila vexhhike vesh-shevka ila likaike fi gajri darrae mudirretin ve la fitnetin mudil-letin, All-llahumme zejjinna bi zinetil-iman, vexh’alna hudaten muhtediin",
        "count": 1,
        "reference": "Nesaiu 4/54, 55, Ahmedi 4/364; Albani këtë hadith e ka bërë të vërtetë “Sahih en-Nesai” 1/280."
      },
      {
        "id": 62,
        "ar": "اللَّهُمَّ إِنِّي أَسْأَلُكَ يَا اللَّهُ بِأَنَّكَ الْوَاحِدُ الْأَحَدُ الصَّمَدُ الَّذِي لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُنْ لَهُ كُفُواً أَحَدٌ، أَنْ تَغْفِرَ لِي ذُنُوبِي\\n\\nإِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
        "sq": "O Allahu im, unë të lutem Ty, duke dëshmuar se vërtetë Ti je Një dhe i Vetëm, Ti nuk ke nevojë për askënd, Ti nuk e ke lindur askënd, e as nuk je lindur prej ndokujt, Ti nuk përngjason me askënd, të lutem të m’i falësh mëkatet, sepse vërtet Ti je Falës dhe Mëshirues.",
        "transliteration": "All-llahumme inni es’eluke ja All-llahu bi enneke El-Vahidul-Ehad Es-Samedul-ledhi lem jelid ve lem juled ve lem jekun Lehu kufuven ehad, En tagfire li dhunubi ineke Entel-Gafurur-Rahim",
        "count": 1,
        "reference": "Nesaiu 3/52, Ahmedi 4/338; Albani këtë hadith e ka bërë të vërtetë “Sahih En-Nesai” 1/280."
      },
      {
        "id": 63,
        "ar": "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنَّ لَكَ الْحَمْدَ لَا إِلهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ، الْمَنَّانُ، يَا بَدِيعَ السَّماوَاتِ وَالْأَرْضِ يَا ذَا الْجَلَالِ\\n\\nوَالْإِكْرَامِ، يَا حَيُّ يَا قَيُّومُ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ",
        "sq": "O Allahu im, unë të lutem Ty, se me të vërtetë Ty të takon Falënderimi, nuk ka të adhuruar tjetër përveç Teje, je Një, je i Vetëm dhe i pa rival, Ti je Bamirësi më i mirë. O Krijues i qiejve dhe i tokës, Ti je i Madhërishëm dhe i Ndershëm, O i Gjallë Përgjithmonë, o Mbikëqyrës i çdo gjëje, Të lutem të ma dhurosh Xhenetin dhe kërkoj mbrojtjen Tënde prej Zjarrit.",
        "transliteration": "All-llahumme inni es’eluke bi enne Lekel-hamdu la Ilahe il-la Ente Vahdeke la sherike Lek, El-Mennanu, ja Bedi’us-semavati vel- erdi, ja dhel-Xhelali vel-Ikram, ja Hajju ja Kajjumu, es’elukel-xhenete ve eudhu bike minen-nar",
        "count": 1,
        "reference": "Transmetojnë autorët e katër Suneneve; “Sahih Ibën Maxheh” 2/329."
      },
      {
        "id": 64,
        "ar": "اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنِّي أَشْهَدُ أَنَّكَ أَنْتَ اللَّهُ لَا إِلهَ إِلَّا أَنْتَ الْأَحَدُ الصَّمَدُ الَّذِي لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُنْ لَهُ كُفُواً أَحَدٌ",
        "sq": "O Allahu im, unë të lutem Ty duke dëshmuar se Ti je Allahu, nuk ka të adhuruar tjetër me të drejtë përveç Teje, i Vetëm dhe i panevojshëm për askënd, i Cili nuk ka lindur askënd e as nuk është i lindur prej askujt. Ti nuk përngjason me askënd.",
        "transliteration": "All-llahumme inni es’luke bi enni eshhedu enneke Ente All-llahu La i-Ilahe il-la Ente El-Ehadus-Samed el-ledhi lem jelid ve lem juled ve lem jekun lehu kufuven ehad",
        "count": 1,
        "reference": "Ebu Davudi 2/62, Tirmidhiu 5/515, Ibën Maxheh 2/1267, Ahmedi 5/360, “Sahih Ibën Maxheh” 2/329 dhe “Sahih et-Tirmidhi” 3/163, Muslimi 1/414."
      }
    ]
  },
  {
    "id": 25,
    "categoryId": "namazi",
    "title": "Dhikri pas selamit në përfundim të farzit të çdo namazi",
    "duas": [
      {
        "id": 65,
        "ar": "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
        "sq": "Kërkoj falje nga Allahu (3 herë).",
        "transliteration": "Estagfirullah (3 herë)",
        "count": 3,
        "reference": "Muslimi 1/414."
      },
      {
        "id": 651,
        "ar": "أَسْتَغْفِرُ اللَّهَ ثَلَاثاً اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
        "sq": "O Allahu im, Ti je shpëtimi dhe nga Ti vjen shpëtimi, i Lartësuar qofsh o zotërues i Madhërisë dhe i Nderit.",
        "transliteration": "All-llahumme entes-selamu ve minkes-selamu tebarekte ja dhel xhelali vel-ikram",
        "count": 1,
        "reference": "Muslimi 1/414."
      },
      {
        "id": 66,
        "ar": "لَا إِلهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ\\n\\nلِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival. Atij i takon Sundimi dhe Lavdërimi, Ai është i Plotfuqishmi mbi çdo send. O Allahu im, nuk ka kush e ndalon atë që Ti e ke dhënë dhe nuk ka kush e jep atë që Ti e ke ndaluar; tek Ti nuk ka vlerë dobia e askujt, ngase çdo dobi vjen prej Teje.",
        "transliteration": "La ilahe il-lAll-llahu vahdehu la sherike leh, lehul mulku ve lehul hamdu ve huve ala kul-li shejin kadir. All-llahume la mani’a lima a’tajte ve la m’utije lima mena’te ve la jenfe’u dhel xheddi minkel xheddu",
        "count": 1,
        "reference": "Buhariu 1/255 dhe Muslimi 1/414."
      },
      {
        "id": 67,
        "ar": "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ، لَا إِلَهَ إِلَّا\\n\\nاللهُ، وَلَا نَعْبُدُ إِلَّا إِيَّاهُ، لَه النِّعْمَةُ وَلَهُ الْفَضْلُ وَلَهُ الثَّنَاءُ الْحَسَنُ، لَا إِلَهَ إِلَّا اللَّهُ مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الْكَافِرُونَ",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival. Atij i takon Sundimi dhe Lavdërimi, Ai është i Gjithëfuqishmi mbi çdo gjë. Nuk ka ndryshim e as forcë pa ndihmën e Allahut; nuk ka Zot tjetër përveç Allahut dhe nuk e adhurojmë askënd tjetër përveç Tij, dhuntitë dhe mirësitë janë prej Tij dhe vetëm Atij i takon lavdërimi më i mirë. Nuk ka të adhuruar tjetër përveç Allahut. Me sinqeritet Atij i besojmë dhe i nënshtrohemi, edhe pse këtë e urrejnë pabesimtarët.",
        "transliteration": "La ilahe il-lAll-llahu vahdehu la sherike leh, lehul mulku ve lehul hamdu ve huve ala kul-li shejin kadir, la havle ve la kuvete il-la bil-lah, la ilahe il-lAll-llahu ve la na’budu il-la ijjahu lehun-ni’metu ve lehul-fadlu ve lehuth-thenaul hasen. La ilahe il-lAll-llahu muhlisine lehud-din ve lev kerihel-kafirun",
        "count": 1,
        "reference": "Shënon Muslimi 1/415."
      },
      {
        "id": 68,
        "ar": "سُبْحَانَ اللهِ، وَالْحَمْدُ للهِ، وَاللَّهُ أَكْبَرُ ثَلَاثاً وَثَلَاثِينَ  لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ\\n\\nوَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        "sq": "I pastër është Allahu nga çdo e metë, Falënderimi i përket vetëm Allahut, Allahu është më i Madhi. Nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival. Atij i takon Sundimi dhe Lavdërimi dhe Ai është i Gjithëfuqishëm mbi çdo gjë.",
        "transliteration": "SubhanAll-llah, vel-hamdulil-lah, vAll-llahu Ekber (33 herë). La ilahe il-lAll-llahu vahdehu la sherike leh, lehul mulku ve lehul hamdu ve huve ala kul-li shejin kadir",
        "count": 33,
        "reference": "Muslimi 1/418, “Kush e thotë këtë pas çdo namazi do t’i falen mëkatet edhe nëse ato janë sa shkuma e detit.” Po ashtu Ebu Davudi 2/86, Nesaiu 3/68, “Sahih et-Tirmidhi”."
      },
      {
        "id": 69,
        "ar": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n قُلْ هُوَ ٱللَّهُ أَحَدٌ ۞ ٱللَّهُ ٱلصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
        "sq": "Pas çdo namazi nga një herë, kurse pas namazit të sabahut dhe akshamit nga tri herë. Thuaj: “Ai është Allahu, Një dhe i Vetëm! Allahu është Absoluti, të Cilit i përgjërohet gjithçka në amshim. Ai as nuk lind, as nuk është i lindur. Dhe askush nuk është i barabartë (a i krahasueshëm) me Atë!”",
        "transliteration": "Kul huvAll-llahu ehad, All-llahus-samed, lem jelid ve lem juled, ve lem jekun lehu kufuven ehad",
        "count": 3,
        "reference": "Ebu Davudi 2/86, Nesaiu 3/68, Sahih et-Tirmidhi 3/182: “Kush i thotë këto sure tri herë në mëngjes dhe në mbrëmje i mjaftojnë për çdo gjë”."
      },
      {
        "id": 70,
        "ar": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۞ مِن شَرِّ مَا خَلَقَ ۞ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۞ وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ ۞ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
        "sq": "Thuaj: “Kërkoj mbështetje te Zoti i agimit, që të më mbrojë nga sherri i gjithçkaje që Ai ka krijuar dhe nga sherri i natës, kur kaplon terri dhe nga sherri i falltarëve, që fryjnë në nyje (duke bërë magji) dhe nga sherri i smirëziut, kur vepron me smirë.”",
        "transliteration": "Kul eudhu bi Rabbil felek, min sherri ma halek, ve min sherri gasikin idha vekab, ve min sherrin-nef-fathati fil ukad, ve min sherr-rri hasidin idha hased",
        "count": 1,
        "reference": ""
      },
      {
        "id": 71,
        "ar": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۞ مَلِكِ ٱلنَّاسِ ۞ إِلَـٰهِ ٱلنَّاسِ ۞ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۞ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۞ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
        "sq": "Thuaj: “Kërkoj mbështetje te Zoti i njerëzve, Sundimtari i njerëzve, i Adhuruari (i vetëm me të drejtë) i njerëzve, nga sherri i djallit cytës që fshihet (pasi cyt) e që hedh dyshime në gjokset e njerëzve, (qoftë ai djall) prej xhindeve apo njerëzve!”",
        "transliteration": "Kul eudhu bi Rabbin-nas, melikin-nas, ilahin-nas, minsherr-rril vesvasil-han-nas, eledhi juvesvisu fi sudurin-nas, minel xhin-neti ven-nas",
        "count": 1,
        "reference": ""
      },
      {
        "id": 72,
        "ar": "أَعُوذُ بِٱللَّهِ مِنَ ٱلشَّيْطَـٰنِ ٱلرَّجِيمِ\nٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
        "sq": "Allahu është Një, nuk ka Zot tjetër përveç Atij, Ai është Mbikëqyrës i përhershëm dhe i përjetshëm. Atë nuk e zë as kotja as gjumi, gjithçka ka në qiej dhe në tokë është vetëm e Tij. Askush nuk mund të ndërmjetësojë tek Ai, përveç me lejen e Tij? Ai di të tashmen që është pranë tyre dhe të ardhmen. Nga ajo që Ai di, të tjerët dinë vetëm aq sa Ai ka dëshiruar. Kursija e Tij përfshin qiejt dhe tokën, kurse kujdesi i Tij ndaj të dyjave nuk i vjen rëndë, Ai është më i Larti, më i Madhi.",
        "transliteration": "All-llahu La Ilahe il-la huvel-Hajjul-Kajjumu, la te’hudhuhu sinetun ve la nevmun, lehu ma fis-semavati ve ma fil-erdi, men dhel-ledhi jeshfe’u indehu il-la bi idhnihi, ja’lemu ma bejne ejdihim ve ma halfehum ve la juhitune bi shej’in min ilmihi il-la bima shae vesi’a Kursijjuhus-semavati vel-erda, ve la jeuduhu hifdhuhuma ve huvel-Alijjul-Adhim (Pas çdo namazi farz)",
        "count": 1,
        "reference": "“Kush e lexon Ajetul kursinë pas çdo namazi farz nuk e pengon asgjë që të hyjë në Xhenet përveç vdekjes.” Nesaiu në librin “Amel el-Jevmi ve Lejleh” hadithi nr. 100, gjithashtu Ibën Sunnijj Hadithi nr. 121. I vërtetë sipas shejh Albanit. Shih “Sahih el-Xhamiu” 5/339 dhe “Silsileh Ehadith es-Sahiha” 2/697."
      },
      {
        "id": 73,
        "ar": "لَا إِلَهَ إِلَّا اللَّهُ وَحَدْهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival. Atij i takon Sundimi dhe Lavdërimi, Ai jep jetë dhe vdekje dhe Ai është i Gjithëfuqishëm mbi çdo gjë.",
        "transliteration": "La Ilahe il-lAll-llahu vahdehu la sherike leh, lehul mulku ve lehul hamdu juhji ve jumitu ve huve ala kul-li shej’in kadir. (Dhjetë herë pas namazit të sabahut dhe të akshamit.)",
        "count": 1,
        "reference": "Tirmidhiu (5/115) dhe Ahmedi (4/227). Shih “Zadul-Mead” 1/300."
      },
      {
        "id": 74,
        "ar": "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْماً نَافِعاً، وَرِزْقاً طَيِّباً، وَعَمَلاً مُتَقَبَّلاً",
        "sq": "O Allahu im, të lutem më jep dituri të dobishme dhe furnizim të mirë, si dhe të lutem Të m’i pranosh veprat e mia.",
        "transliteration": "All-llahume inni es‘eluke ilmen nafi’an ve rizkan tajjiben ve amelen mutekabbelen. (Pas selamit në namazin e sabahut)",
        "count": 1,
        "reference": "Ibën Maxheh dhe të tjerët “Sahih Ibën Maxheh” 1/152 dhe “Mexhmeuz-Zevaid” 10/111."
      }
    ]
  },
  {
    "id": 26,
    "categoryId": "falënderimi-ndaj-Allahut",
    "title": "Duaja e namazit istihare",
    "duas": [
      {
        "id": 75,
        "ar": "قَالَ جَابرُ بْنُ عَبْدِ اللَّهِ  : كَانَ رسُولُ اللَّهِ   يُعَلِّمُنَا الْاسْتِخَارَةَ فِي الْأُمُورِ كُلِّهَا كَمَا يُعَلِّمُنَا السُّورَةَ مِنَ الْقُرْآنِ، يَقُولُ: إِذَا هَمَّ أَحَدُكُمْ بِالْأَمْرِ فَلْيَرْكَعْ رَكْعَتَيْنِ مِنْ غَيْرِ الْفَرِيضَةِ، ثُمَّ لْيَقُلْ: اَللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ العَظِيمِ؛ فَإِنَّكَ تَقْدِرُ وَلاَ أَقْدِرُ، وَتَعْلَمُ وَلاَ أَعْلَمُ، وَأَنْتَ عَلاَّمُ الغُيُوبِ، اَللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الأمْرَ- وَيُسَمِّي حَاجَتَهُ - خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي – أَوْ قَالَ: عَاجِلِهِ وَآجِلِهِ - فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي – أَوْ قَالَ: عَاجِلِهِ وَآجِلِهِ – فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ، ثُمَّ أَرْضِنِي بِهِ",
        "sq": "Shënohet nga Xhabir Ibën Abdullahu i cili ka thënë: “I Dërguari i Allahut na mësonte duanë e istihares për çdo çështje, sikurse na i mësonte suret e Kuranit dhe thoshte: “Kur dikush prej jush dëshiron të vendos për një punë me rëndësi, le t’i falë dy rekate namaz dhe pastaj le të thotë: \"O Allahu im, me diturinë Tënde kërkoj mbarësi. Kërkoj ndihmë prej fuqisë Tënde; kërkoj prej të mirave Tua të shumta sepse Ti ke mundësi kurse unë nuk kam mundësi; Ti di çdo gjë kurse unë nuk di asgjë, Ti je Ai që i di të fshehtat. O Allahu im, nëse kjo punë e imja (e emërton nevojën e tij), është e dobishme për fenë dhe jetën time, për kohën e tashme dhe të ardhmen, ma mundëso mua që të realizohet kjo, ma lehtëso mua këtë dhe më beko në të. E nëse kjo punë është e dëmshme për fenë dhe jetën time, për kohën e tashme dhe të ardhmen largoje këtë nga unë dhe më largo mua nga kjo, e më përcakto mbarësinë kudo që të jetë dhe më bëj të jem i kënaqur me të.\"",
        "transliteration": "All-llahume inni estehiruke bi ilmike ve estakdiruke bi kudretike ve es’eluke min fadlikel-adhim, fe inneke takdiru ve la akdiru, ve ta’lemu ve la a’ëlemu ve ente al-lamul gujub. All-llahume in kunte ta’ëlemu enne hadhel emru - (e emërton nevojën e tij) - hajrun li fi dini ve me’ashi ve akibeti emrí ve axhilihi ve axhilihi fakdirhu li ve jessirhu li thumme barik li fihi. Ve in kunte ta’ëlemu enne hadhel emru - (e emërton nevojën e tij) - sherrun li fi dini ve me’ashi ve akibeti emri ve axhilihi ve axhilihi, fasrifhu anni vesrifni anhu vakdir li el-hajre hajthu kane thumme erdini bihi",
        "count": 1,
        "reference": "Kush kërkon ndihmë nga Allahu (bën Istihare), gjithashtu kush konsultohet me njerëz besimtarë dhe bëhet i vendosur në pikësynimin e tij, nuk do të pendohet. Buhariu 7/162. “Konsultohu me ta për të gjitha çështjet, e kur të vendosësh, atëherë mbështetu në Allahun.” Ali Imran, 159."
      }
    ]
  },
  {
    "id": 27,
    "categoryId": "mëngjes-dhe-mbrëmje",
    "title": "Dhikri i Mëngjesit",
    "titleAr": "أذكار الصباح",
    "isRoutine": "mengjesi",
    "duas": [
      {
        "id": 1001,
        "ar": "اَلْحَمْدُ لِلهِ وَحْدَهُ، وَالصَّلاَةُ وَالسَّلاَمُ عَلَى مَنْ لَا نَبِيَّ بَعْدَهُ ",
        "sq": "Falënderimi i takon vetëm Allahut, mëshira dhe shpëtimi i Allahut qofshin mbi atë pas të cilit nuk ka më të Dërguar - Muhamedin.",
        "transliteration": "Elhamdulil-lahi vahdeh, ves-salatu ves-selamu ala men la nebijje badeh.",
        "count": 1,
        "reference": "Ebu Davudi nr. 3667, Shejh Albani thotë hadith hasen."
      },
      {
        "id": 1002,
        "ar": "أَعُوذُ بِٱللَّهِ مِنَ ٱلشَّيْطَـٰنِ ٱلرَّجِيمِ\nٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
        "sq": "Allahu është Një, nuk ka Zot tjetër përveç Atij, Ai është Mbikëqyrës i përhershëm dhe i përjetshëm. Atë nuk e zë as kotja as gjumi, gjithçka ka në qiej dhe në tokë, është vetëm e Tij. Askush nuk mund të ndërmjetësojë tek Ai, përveç se me lejen e Tij. Ai di të tashmen që është pranë tyre dhe të ardhmen. Nga ajo që Ai di, të tjerët dinë vetëm aq sa Ai ka dëshiruar. Kursija e Tij përfshin qiejt dhe tokën, kurse kujdesi i Tij ndaj të dyjave nuk i vjen rëndë, Ai është më i Larti, më i Madhi.",
        "transliteration": "All-llahu La Ilahe il-la huvel-Hajjul-Kajjumu, la te’hudhuhu sinetun ve la nevmun, lehu ma fis-semavati ve ma fil-erdi, men dhel-ledhi jeshfe’u indehu il-la bi idhnihi, ja’lemu ma bejne ejdihim ve ma halfehum ve la juhitune bi shej’in min ilmihi il-la bima shae vesi’a Kursijjuhus-semavati vel-erda, ve la jeuduhu hifdhuhuma ve huvel-Alijjul-Adhim.",
        "count": 1,
        "reference": "Kush e lexon këtë në mëngjes është i mbrojtur nga xhinët deri në mbrëmje. (Hakimi 1/562, i vërtetuar nga Albani)."
      },
      {
        "id": 1003,
        "ar": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n قُلْ هُوَ ٱللَّهُ أَحَدٌ ۞ ٱللَّهُ ٱلصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ\n\nبِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۞ مِن شَرِّ مَا خَلَقَ ۞ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۞ وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ ۞ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ\n\nبِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۞ مَلِكِ ٱلنَّاسِ ۞ إِلَـٰهِ ٱلنَّاسِ ۞ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۞ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۞ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
        "sq": "Leximi i Surjes El-Ihlas, El-Felek dhe En-Nas (tri herë secilën):\n\nSurja El-Ihlas:\nThuaj: \"Ai, Allahu është Një! Allahu është Ai që çdo krijesë i nevojitet. Nuk ka lindur kënd, as nuk është i lindur. Dhe Atij askush nuk i është i barabartë.\"\n\nSurja El-Felek:\nThuaj: \"Kërkoj mbështetje te Zoti i agimit, nga dëmi i çdo krijese që Ai ka krijuar, nga dëmi i errësirës së natës kur ajo kaplon, nga dëmi i atyre që fryjnë në nyja (magjistarëve), dhe nga dëmi i lakmuesit kur xhelozon!\"\n\nSurja En-Nas:\nThuaj: \"Kërkoj mbështetje te Zoti i njerëzve, Sunduesi i njerëzve, I Adhuruari i njerëzve, nga dëmi i ngacmuesit që fshihet, i cili bën vesvese në gjokset e njerëzve, qoftë ai nga xhinët apo nga njerëzit!\"",
        "transliteration": "Bismillahir-Rahmanir-Rahim. Kul huvall-llahu ehad. All-llahus-samed. Lem jelid ve lem juled. Ve lem jekun lehu kufuven ehad.\n\nBismillahir-Rahmanir-Rahim. Kul eudhu bi rabbil-felek. Min sherri ma khalek. Ve min sherri gasikin idha vekab. Ve min sherrin-neffathati fil-ukad. Ve min sherri hasidin idha hased.\n\nBismillahir-Rahmanir-Rahim. Kul eudhu bi rabbin-nas. Melikin-nas. Ilahin-nas. Min sherril-vesvasil-khannas. El-ledhi juvesvisu fi sudurin-nas. Minel-xhinneti ven-nas.",
        "count": 3,
        "reference": "Kush i lexon këto tri herë në mëngjes dhe në mbrëmje, i mjaftojnë për çdo gjë. (Ebu Davudi 4/322, Tirmidhiu 5/567)."
      },
      {
        "id": 1004,
        "ar": "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ للهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحَدْهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ\\n\\nقَدِيرٌ، ربِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَومِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَومِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ\\n\\nبِكَ مِنَ الْكَسَلِ، وَسُوءِ الكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
        "sq": "E arritëm mëngjesin dhe e tërë sundimi i takon Allahut, falënderimi është për Allahun, nuk ka të adhuruar tjetër përveç Allahut, i Vetëm e i pashoq. Atij i takon sundimi dhe falënderimi dhe Ai është i Gjithëfuqishëm mbi çdo gjë. O Zoti im, të lutem më jep të mirën e kësaj dite dhe të ditëve pas saj, dhe kërkoj mbrojtje nga e keqja e kësaj dite dhe e ditëve pas saj. O Zoti im, kërkoj mbrojtje te Ti nga dembelizmi dhe pleqëria e rëndë. O Zoti im, kërkoj mbrojtje te Ti nga dënimi i zjarrit dhe dënimi i varrit.",
        "transliteration": "Asbahna ve asbehal-mulku lil-lahi, vel-hamdu lil-lahi, la ilahe il-lAll-llahu vahdehu la sherike leh, lehul-mulku ve lehul-hamdu ve huve ala kul-li shej’in kadir. Rabbi es’eluke hajre ma fi hadhel-jevmi ve hajre ma badehu, ve eudhu bike min sherri ma fi hadhel-jevmi ve sherri ma badehu. Rabbi eudhu bike minel-keseli ve suil-kiber, Rabbi eudhu bike min adhabin fin-nari ve adhabin fil-kabr.",
        "count": 1,
        "reference": "Muslimi 4/2088."
      },
      {
        "id": 1005,
        "ar": "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
        "sq": "O Allah, me mëshirën Tënde e arritëm mëngjesin dhe me mëshirën Tënde e arrijmë mbrëmjen, me dëshirën Tënde jetojmë, me dëshirën Tënde vdesim dhe te Ti është ringjallja.",
        "transliteration": "All-llahumme bike asbahna, ve bike emsejna, ve bike nahja, ve bike nemutu ve ilejken-nushur.",
        "count": 1,
        "reference": "Tirmidhiu 5/466, “Sahih et-Tirmidhi” 3/142."
      },
      {
        "id": 1006,
        "ar": "اللَّهُمَّ أَنْتَ رَبِّي لّا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتَ، أَعُوذُ بِكَ مِنْ شَرِّ مَا\\n\\nصَنَعْتَ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِر لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        "sq": "O Allah, Ti je Zoti im, nuk ka të adhuruar tjetër përveç Teje. Ti më ke krijuar dhe unë jam robi Yt. Unë jam në besën dhe premtimin Tënd sa të kem mundësi. Kërkoj mbrojtje te Ti nga e keqja e asaj që kam bërë. Pranoj mirësinë Tënde ndaj meje dhe pranoj mëkatin tim, prandaj më fal mua, se vërtet mëkatet nuk i fal askush tjetër përveç Teje.",
        "transliteration": "All-llahumme Ente Rabbi la ilahe il-la Ente, khalaktani ve ene abduke, ve ene ala ahdike ve vadike mastata’tu, eudhu bike min sherri ma sana’tu, ebu’u leke bi ni’metike alejje ve ebu’u bi dhenbi fagfir li fe innehu la jagfirudh-dhunube il-la Ente.",
        "count": 1,
        "reference": "Kush e thotë këtë në mëngjes me bindje dhe vdes atë ditë para mbrëmjes, është prej banorëve të Xhenetit. (Buhariu 7/150)."
      },
      {
        "id": 1007,
        "ar": "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ\\n\\nلَكَ، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ",
        "sq": "O Allah, e arrita mëngjesin dhe të marr Ty dëshmitar, marr dëshmitarë bartësit e Arshit Tënd, engjëjt Tu dhe të gjitha krijesat Tua, se vërtet Ti je Allahu, nuk ka të adhuruar tjetër përveç Teje, i Vetëm e i pashoq, dhe se Muhamedi është robi Yt dhe i Dërguari Yt.",
        "transliteration": "All-llahumme inni asbahtu ushiduke ve ushhidu hamelete arshike ve melaiketeke ve xhemia halkike, enneke Entell-llahu la ilahe il-la Ente vahdeke la sherike leke, ve enne Muhammedan abduke ve rasuluk.",
        "count": 4,
        "reference": "Kush e thotë këtë 4 herë në mëngjes, Allahu e liron trupin e tij nga zjarri i Xhehenemit. (Ebu Davudi 4/317)."
      },
      {
        "id": 1008,
        "ar": "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
        "sq": "O Allah, çfarëdo mirësie që më ka arritur mua apo ndonjë krijese Tënde këtë mëngjes, është vetëm prej Teje i pashoq, Atij i takon falënderimi dhe falënderimi tonë.",
        "transliteration": "All-llahumme ma asbaha bi min ni’metin ev bi-ehadin min halkike fe minke vahdeke la sherike leke, fe lekel-hamdu ve lekesh-shukr.",
        "count": 1,
        "reference": "Kush e thotë këtë në mëngjes ka përmbushur falënderimin e kësaj dite. (Ebu Davudi 4/318)."
      },
      {
        "id": 1009,
        "ar": "اللَّهُمَّ عافِـني فِي بَدَنـي ، اللَّهُمَّ عافِـني فِي سَمْـعي ، اللَّهُمَّ عافِـني فِي بَصَـري ، لَا إِلَـٰهَ إِلَّا اللّه أَنْـتَ. (ثلاثاً)\\nاللَّهُمَّ إِنّـي أَعـوذُبِكَ مِنَ الْكُـفر ، وَالفَـقْر ، وَأَعـوذُبِكَ مِنْ عَذابِ القَـبْر ، لَا إِلَـٰهَ إِلَّا أَنْـتَ. (ثلاثاً) ",
        "sq": "O Allah, më jep shëndet në trupin tim, O Allah, më jep shëndet në dëgjimin tim, O Allah, më jep shëndet në shikimin tim, nuk ka të adhuruar tjetër përveç Teje. O Allah, kërkoj mbrojtje te Ti nga kufri (mosbesimi) dhe varfëria, dhe kërkoj mbrojtje te Ti nga dënimi i varrit, nuk ka të adhuruar tjetër përveç Teje.",
        "transliteration": "All-llahumme ‘afini fi bedeni, All-llahumme ‘afini fi sem’i, All-llahumme ‘afini fi besari, la ilahe il-la Ente. All-llahumme inni eudhu bike minel-kufri vel-fakri, ve eudhu bike min adhabil-kabr, la ilahe il-la Ente.",
        "count": 3,
        "reference": "Ebu Davudi 4/324, Ahmedi 5/42."
      },
      {
        "id": 1010,
        "ar": "حَسْبِيَ اللَّهُ لَآ إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        "sq": "Më mjafton Allahu, nuk ka të adhuruar tjetër përveç Atij, te Ai jam mbështetur dhe Ai është Zoti i Arshit të Madh.",
        "transliteration": "HasbiyAll-llahu la ilahe il-la Huve, alejhi tevekkeltu ve Huve Rabbul-Arshil-Adhim.",
        "count": 7,
        "reference": "Kush e thotë këtë 7 herë në mëngjes dhe mbrëmje, Allahu i mjafton për të gjitha brengat e kësaj bote dhe botës tjetër. (Ebu Davudi 4/321)."
      },
      {
        "id": 1011,
        "ar": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْللِي،\\n\\nوَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي،\\n\\nوَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
        "sq": "O Allah, të lutem për falje dhe shpëtim në këtë botë dhe në botën tjetër. O Allah, të lutem për falje dhe shpëtim në fenë time, në jetën time, në familjen time dhe në pasurinë time. O Allah, mbuloji të metat e mia dhe qetësoji frikërat e mia. O Allah, më mbro nga para, nga mbrapa, nga e djathta, nga e majta dhe nga sipër, dhe kërkoj mbrojtje me madhështinë Tënde që të mos goditem nga poshtë.",
        "transliteration": "All-llahumme inni es’elukel-afve vel-afijete fid-dunja vel-ahireh, All-llahumme inni es’elukel-afve vel-afijete fi dini ve dunjaje ve ehli ve mali, All-llahummestur avrati ve amin rev’ati, All-llahummahfadhni min bejne jedejje ve min halfi ve an jemini ve an shimali ve min fevki, ve eudhu bi azametike en ugtale min tahti.",
        "count": 1,
        "reference": "Ebu Davudi dhe Ibën Maxheh. “Sahih Ibën Maxheh” 2/332."
      },
      {
        "id": 1012,
        "ar": "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّماوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ\\n\\nشَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءاً، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ",
        "sq": "O Allah, Njohës i së fshehtës dhe së dukshmes, Krijues i qiejve dhe i tokës, Zot i çdo gjëje dhe Sundues i saj, dëshmoj se nuk ka të adhuruar tjetër përveç Teje; kërkoj mbrojtjen Tënde nga e keqja e vetes sime, nga e keqja e djallit dhe nga ajo që djalli të shpie në idhujtari, si dhe kërkoj të më mbrosh që vetvetes e as ndonjë muslimani të mos i bëj dëm.",
        "transliteration": "All-llahumme ‘alimel-gajbi vesh-shehadeti fatiras-semavati vel-erdi, Rabbe kul-li shej’in ve melikehu, esh-hedu en la ilahe il-la Ente, eudhu bike min sherri nefsi ve min sherrish-shejtani ve shirkihi ve en ekterife ala nefsi su’en ev exhurrehu ila muslim.",
        "count": 1,
        "reference": "Tirmidhiu dhe Ebu Davudi. “Sahih et-Tirmidhi” 3/142."
      },
      {
        "id": 1013,
        "ar": "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        "sq": "Me emrin e Allahut pranë emrit të të Cilit nuk të bën dëm asgjë në tokë e as në qiell, Ai është që shumë dëgjon dhe që di çdo gjë.",
        "transliteration": "Bismil-lahil-ledhi la jedur-ru me’a-ismihi shej’un fil-erdi ve la fis-semai ve huves-semiul-alim.",
        "count": 3,
        "reference": "Kush e thotë këtë lutje tri herë në mëngjes dhe në mbrëmje, nuk i bëhet dëm asgjë. (Ebu Davudi 4/323, Tirmidhiu 5/465)."
      },
      {
        "id": 1014,
        "ar": "رَضِيتُ باللهِ رَبَّاً، وَبِالْإِسْلَامِ دِيناً، وَبِمُحَمَّدٍ صَلَى اللَّهُ عَلِيهِ وَسَلَّمَ نَبِيَّاً",
        "sq": "Jam i kënaqur që Zoti im është Allahu, feja ime është Islami dhe Pejgamberi im është Muhamedi (a.s).",
        "transliteration": "Redijtu bil-lahi Rabben ve bil-Islami dinen, ve bi Muhammedin nebijjen.",
        "count": 3,
        "reference": "Kush e thotë këtë lutje çdo mëngjes dhe mbrëmje tri herë është obligim i Allahut që ta kënaq atë ditën e Kiametit. (Ahmedi 4/337, Tirmidhiu 5/465)."
      },
      {
        "id": 1015,
        "ar": "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
        "sq": "O i Gjallë përgjithmonë, O Mbikëqyrës i çdo gjëje, me mëshirën Tënde kërkoj ndihmë, ma përmirëso tërë gjendjen time dhe mos më lër të mbështetem në veten time, as sa një përpëlitje e syrit.",
        "transliteration": "Ja Hajju ja Kajjumu bi rahmetike estegithu aslih li she’ni kul-lehu ve la tekilni ila nefsi tarfete ajnin.",
        "count": 1,
        "reference": "Hakimi 1/545, “Sahih et-Tergib vet-Terhib” 1/273."
      },
      {
        "id": 1016,
        "ar": "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ: فَتْحَهُ، وَنَصْرَهُ وَنُورَهُ، وَبَرَكَتَهُ، وَهُدَاهُ،\\n\\nوَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَهُ",
        "sq": "E arritëm mëngjesin dhe e tërë pasuria i takon Allahut, Zotit të botëve. O Allahu im, unë kërkoj mirësinë e kësaj dite, hapjen e saj, ndihmën e saj, dritën e saj, dhuntinë dhe udhëzimin e saj. Kërkoj të më mbrosh nga e keqja e saj dhe e ditëve të tjera pas saj.",
        "transliteration": "Asbahna ve asbehal-Mulku lil-lahi Rabbil-alemin. All-llahumme inni es’eluke hajre hadhel-jevmi fet-hahu, ve nasrehu ve nurehu, ve bereketehu, ve hudahu, ve eudhu bike min sherri ma fihi, ve sherri ma badehu.",
        "count": 1,
        "reference": "Ebu Davudi 4/322."
      },
      {
        "id": 1017,
        "ar": "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَى اللَّهُ عَلِيهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا\\n\\nإِبْرَاهِيمَ، حَنِيفَاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
        "sq": "E arritëm mëngjesin në natyrshmërinë Islame, në fjalën e sinqertë (La Ilahe Il-lAll-llah), në fenë e të Dërguarit tonë, Muhamedit (a.s) dhe në fenë e babait tonë Ibrahimit, i cili ka qenë besimdrejtë, musliman e nuk ka qenë prej idhujtarëve.",
        "transliteration": "Asbahna ala fitretil-Islam ve ala kelimetil-Ihlas, ve ala dini nebijjina Muhammedin (a.s), ve ala mil-leti ebina Ibrahime hanifen muslimen ve ma kane minel-mushrikin.",
        "count": 1,
        "reference": "Ahmedi 3/406-407, “Sahih el-Xhamiu” 4/209."
      },
      {
        "id": 1018,
        "ar": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        "sq": "I Lartësuar qoftë Allahu, Atij i takon Lavdërimi.",
        "transliteration": "SubhanAll-llahi ve bihamdihi.",
        "count": 100,
        "reference": "Kush e thotë këtë në mëngjes dhe në mbrëmje 100 herë, askush s’do të vijë Ditën e Kiametit me diç më të vlefshme se ky. (Muslimi 4/2071)."
      },
      {
        "id": 1019,
        "ar": "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival. Atij i takon Sundimi dhe Lavdërimi dhe Ai është i Gjithëfuqishëm mbi çdo gjë.",
        "transliteration": "La Ilahe il-lAll-llahu vahdehu la sherike leh, lehul-mulku ve lehul-hamdu ve huve ala kul-li shejin kadir.",
        "count": 10,
        "reference": "Ebu Davudi 4/319, “Sahih Ebu Davud” 3/957."
      },
      {
        "id": 1020,
        "ar": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ وَمِدَادَ كَلِمَاتِهِ",
        "sq": "I Madhëruar qoftë Allahu, aq sa është numri i krijesave të Tij dhe aq sa dëshiron Ai vet, po aq sa është i bukur Arshi i Tij dhe aq sa është ngjyra e pafund për t’i shkruar fjalët e Tij. (Tri herë në mëngjes)",
        "transliteration": "SubhanAll-llahi ve bihamdihi adede halkihi ve rida nefsihi ve zinete arshihi ve midade kelimatihi.",
        "count": 3,
        "reference": "Muslimi 4/2090."
      },
      {
        "id": 1021,
        "ar": "اللَّهُمَّ إنِّي أَسْأَلُكَ عِلْماً نَافِعاً، وَرِزقاً طَيِّباً، وَعَمَلاً مُتَقَبَّلاً",
        "sq": "O Allahu im, të lutem më jep dituri të dobishme e furnizim të mirë dhe të lutem Të m’i pranosh veprat e mia.",
        "transliteration": "All-llahumme inni es’eluke ilmen nafi’an ve rizkan tajjiben ve amelen mutekabbelen.",
        "count": 1,
        "reference": "Ibën Maxheh nr. 925, isnad i mirë (hasen)."
      },
      {
        "id": 1022,
        "ar": "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
        "sq": "Kërkoj faljen e Allahut dhe tek Ai pendohem.",
        "transliteration": "Estagfirull-llahe ve etubu ilejhi.",
        "count": 100,
        "reference": "Buhariu “Fet’hul-Bari” 11/101, Muslimi 4/2075."
      },
      {
        "id": 1023,
        "ar": "اَللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبَيِّنَا مُحَمَّدٍ",
        "sq": "O Allahu im, mëshiroje dhe përshëndete të Dërguarin tonë, Muhamedin.",
        "transliteration": "All-llahumme sal-li ve sel-lim ala nebijjina Muhammed.",
        "count": 10,
        "reference": "Taberaniu, “Sahih et-Tergib vet-Terhib” 1/273. Kush dërgon 10 salavate në mëngjes e 10 në mbrëmje e arrin ndërmjetësimi Ditan e Kiametit."
      }
    ]
  },
  {
    "id": 28,
    "categoryId": "mëngjes-dhe-mbrëmje",
    "title": "Dhikri i Mbrëmjes",
    "titleAr": "أذكار المساء",
    "isRoutine": "mbremjes",
    "duas": [
      {
        "id": 1024,
        "ar": "اَلْحَمْدُ لِلهِ وَحْدَهُ، وَالصَّلاَةُ وَالسَّلاَمُ عَلَى مَنْ لَا نَبِيَّ بَعْدَهُ ",
        "sq": "Falënderimi i takon vetëm Allahut, mëshira dhe shpëtimi i Allahut qofshin mbi atë pas të cilit nuk ka më të Dërguar - Muhamedin.",
        "transliteration": "Elhamdulil-lahi vahdeh, ves-salatu ves-selamu ala men la nebijje badeh.",
        "count": 1,
        "reference": "Ebu Davudi nr. 3667."
      },
      {
        "id": 1025,
        "ar": "أَعُوذُ بِٱللَّهِ مِنَ ٱلشَّيْطَـٰنِ ٱلرَّجِيمِ\nٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
        "sq": "Allahu është Një, nuk ka Zot tjetër përveç Atij, Ai është Mbikëqyrës i përhershëm dhe i përjetshëm. Atë nuk e zë as kotja as gjumi, gjithçka ka në qiej dhe në tokë, është vetëm e Tij. Askush nuk mund të ndërmjetësojë tek Ai, përveç se me lejen e Tij. Ai di të tashmen që është pranë tyre dhe të ardhmen. Nga ajo që Ai di, të tjerët dinë vetëm aq sa Ai ka dëshiruar. Kursija e Tij përfshin qiejt dhe tokën, kurse kujdesi i Tij ndaj të dyjave nuk i vjen rëndë, Ai është më i Larti, më i Madhi.",
        "transliteration": "All-llahu La Ilahe il-la huvel-Hajjul-Kajjumu, la te’hudhuhu sinetun ve la nevmun, lehu ma fis-semavati ve ma fil-erdi, men dhel-ledhi jeshfe’u indehu il-la bi idhnihi, ja’lemu ma bejne ejdihim ve ma halfehum ve la juhitune bi shej’in min ilmihi il-la bima shae vesi’a Kursijjuhus-semavati vel-erda, ve la jeuduhu hifdhuhuma ve huvel-Alijjul-Adhim.",
        "count": 1,
        "reference": "Kush e lexon këtë në mbrëmje është i mbrojtur nga xhinët deri në mëngjes. (Hakimi 1/562)."
      },
      {
        "id": 1026,
        "ar": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n قُلْ هُوَ ٱللَّهُ أَحَدٌ ۞ ٱللَّهُ ٱلصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ\n\nبِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۞ مِن شَرِّ مَا خَلَقَ ۞ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۞ وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ ۞ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ\n\nبِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۞ مَلِكِ ٱلنَّاسِ ۞ إِلَـٰهِ ٱلنَّاسِ ۞ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۞ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۞ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
        "sq": "Leximi i Surjes El-Ihlas, El-Felek dhe En-Nas (tri herë secilën):\n\nSurja El-Ihlas:\nThuaj: \"Ai, Allahu është Një! Allahu është Ai që çdo krijesë i nevojitet. Nuk ka lindur kënd, as nuk është i lindur. Dhe Atij askush nuk i është i barabartë.\"\n\nSurja El-Felek:\nThuaj: \"Kërkoj mbështetje te Zoti i agimit, nga dëmi i çdo krijese që Ai ka krijuar, nga dëmi i errësirës së natës kur ajo kaplon, nga dëmi i atyre që fryjnë në nyja (magjistarëve), dhe nga dëmi i lakmuesit kur xhelozon!\"\n\nSurja En-Nas:\nThuaj: \"Kërkoj mbështetje te Zoti i njerëzve, Sunduesi i njerëzve, I Adhuruari i njerëzve, nga dëmi i ngacmuesit që fshihet, i cili bën vesvese në gjokset e njerëzve, qoftë ai nga xhinët apo nga njerëzit!\"",
        "transliteration": "Bismillahir-Rahmanir-Rahim. Kul huvall-llahu ehad. All-llahus-samed. Lem jelid ve lem juled. Ve lem jekun lehu kufuven ehad.\n\nBismillahir-Rahmanir-Rahim. Kul eudhu bi rabbil-felek. Min sherri ma khalek. Ve min sherri gasikin idha vekab. Ve min sherrin-neffathati fil-ukad. Ve min sherri hasidin idha hased.\n\nBismillahir-Rahmanir-Rahim. Kul eudhu bi rabbin-nas. Melikin-nas. Ilahin-nas. Min sherril-vesvasil-khannas. El-ledhi juvesvisu fi sudurin-nas. Minel-xhinneti ven-nas.",
        "count": 3,
        "reference": "Kush i lexon këto tri herë në mëngjes dhe në mbrëmje, i mjaftojnë për çdo gjë. (Ebu Davudi 4/322, Tirmidhiu 5/567)."
      },
      {
        "id": 1027,
        "ar": "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ للهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحَدْهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ\\n\\nقَدِيرٌ، ربِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَومِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَومِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ\\n\\nبِكَ مِنَ الْكَسَلِ، وَسُوءِ الكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
        "sq": "E arritëm mbrëmjen dhe e tërë sundimi i takon Allahut, falënderimi është për Allahun, nuk ka të adhuruar tjetër përveç Allahut, i Vetëm e i pashoq. Atij i takon sundimi dhe falënderimi dhe Ai është i Gjithëfuqishëm mbi çdo gjë. O Zoti im, të lutem më jep të mirën e kësaj nate dhe të natave pas saj, dhe kërkoj mbrojtje nga e keqja e kësaj nate dhe e natave pas saj. O Zoti im, kërkoj mbrojtje te Ti nga dembelizmi dhe pleqëria e rëndë. O Zoti im, kërkoj mbrojtje te Ti nga dënimi i zjarrit dhe dënimi i varrit.",
        "transliteration": "Emsejna ve emsel-mulku lil-lahi, vel-hamdu lil-lahi, la ilahe il-lAll-llahu vahdehu la sherike leh, lehul-mulku ve lehul-hamdu ve huve ala kul-li shej’in kadir. Rabbi es’eluke hajre ma fi hadhihil-lejleti ve hajre ma badeha, ve eudhu bike min sherri ma fi hadhihil-lejleti ve sherri ma badeha. Rabbi eudhu bike minel-keseli ve suil-kiber, Rabbi eudhu bike min adhabin fin-nari ve adhabin fil-kabr.",
        "count": 1,
        "reference": "Muslimi 4/2088."
      },
      {
        "id": 1028,
        "ar": "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
        "sq": "O Allah, me mëshirën Tënde e arritëm mbrëmjen dhe me mëshirën Tënde e arrijmë mëngjesin, me dëshirën Tënde jetojmë, me dëshirën Tënde vdesim dhe te Ti është kthimi.",
        "transliteration": "All-llahumme bike emsejna, ve bike asbahna, ve bike nahja, ve bike nemutu ve ilejkel-masir.",
        "count": 1,
        "reference": "Tirmidhiu 5/466, “Sahih et-Tirmidhi” 3/142."
      },
      {
        "id": 1029,
        "ar": "اللَّهُمَّ أَنْتَ رَبِّي لّا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتَ، أَعُوذُ بِكَ مِنْ شَرِّ مَا\\n\\nصَنَعْتَ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِر لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
        "sq": "O Allah, Ti je Zoti im, nuk ka të adhuruar tjetër përveç Teje. Ti më ke krijuar dhe unë jamrobi Yt. Unë jam në besën dhe premtimin Tënd sa të kem mundësi. Kërkoj mbrojtje te Ti nga e keqja e asaj që kam bërë. Pranoj mirësinë Tënde ndaj meje dhe pranoj mëkatin tim, prandaj më fal mua, se vërtet mëkatet nuk i fal askush tjetër përveç Teje.",
        "transliteration": "All-llahumme Ente Rabbi la ilahe il-la Ente, khalaktani ve ene abduke, ve ene ala ahdike ve vadike mastata’tu, eudhu bike min sherri ma sana’tu, ebu’u leke bi ni’metike alejje ve ebu’u bi dhenbi fagfir li fe innehu la jagfirudh-dhunube il-la Ente.",
        "count": 1,
        "reference": "Kush e thotë këtë në mbrëmje me bindje dhe vdes atë natë para mëngjesit, është prej banorëve të Xhenetit. (Buhariu 7/150)."
      },
      {
        "id": 1030,
        "ar": "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ\\n\\nلَكَ، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ",
        "sq": "O Allah, e arrita mbrëmjen dhe të marr Ty dëshmitar, marr dëshmitarë bartësit e Arshit Tënd, engjëjt Tu dhe të gjitha krijesat Tua, se vërtet Ti je Allahu, nuk ka të adhuruar tjetër përveç Teje, i Vetëm e i pashoq, dhe se Muhamedi është robi Yt dhe i Dërguari Yt.",
        "transliteration": "All-llahumme inni emsejtu ushiduke ve ushhidu hamelete arshike ve melaiketeke ve xhemia halkike, enneke Entell-llahu la ilahe il-la Ente vahdeke la sherike leke, ve enne Muhammedan abduke ve rasuluk.",
        "count": 4,
        "reference": "Kush e thotë këtë 4 herë në mbrëmje, Allahu e liron trupin e tij nga zjarri i Xhehenemit. (Ebu Davudi 4/317)."
      },
      {
        "id": 1031,
        "ar": "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
        "sq": "O Allah, çfarëdo mirësie që më ka arritur mua apo ndonjë krijese Tënde këtë mbrëmje, është vetëm prej Teje i pashoq, Atij i takon falënderimi dhe falënderimi tonë.",
        "transliteration": "All-llahumme ma emsa bi min ni’metin ev bi-ehadin min halkike fe minke vahdeke la sherike leke, fe lekel-hamdu ve lekesh-shukr.",
        "count": 1,
        "reference": "Kush e thotë këtë në mbrëmje ka përmbushur falënderimin e kësaj nate. (Ebu Davudi 4/318)."
      },
      {
        "id": 1032,
        "ar": "اللَّهُمَّ عافِـني فِي بَدَنـي ، اللَّهُمَّ عافِـني فِي سَمْـعي ، اللَّهُمَّ عافِـني فِي بَصَـري ، لَا إِلَـٰهَ إِلَّا اللّه أَنْـتَ. (ثلاثاً)\\nاللَّهُمَّ إِنّـي أَعـوذُبِكَ مِنَ الْكُـفر ، وَالفَـقْر ، وَأَعـوذُبِكَ مِنْ عَذابِ القَـبْر ، لَا إِلَـٰهَ إِلَّا أَنْـتَ. (ثلاثاً) ",
        "sq": "O Allah, më jep shëndet në trupin tim, O Allah, më jep shëndet në dëgjimin tim, O Allah, më jep shëndet në shikimin tim, nuk ka të adhuruar tjetër përveç Teje. O Allah, kërkoj mbrojtje te Ti nga kufri (mosbesimi) dhe varfëria, dhe kërkoj mbrojtje te Ti nga dënimi i varrit, nuk ka të adhuruar tjetër përveç Teje.",
        "transliteration": "All-llahumme ‘afini fi bedeni, All-llahumme ‘afini fi sem’i, All-llahumme ‘afini fi besari, la ilahe il-la Ente. All-llahumme inni eudhu bike minel-kufri vel-fakri, ve eudhu bike min adhabil-kabr, la ilahe il-la Ente.",
        "count": 3,
        "reference": "Ebu Davudi 4/324, Ahmedi 5/42."
      },
      {
        "id": 1033,
        "ar": "حَسْبِيَ اللَّهُ لَآ إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
        "sq": "Më mjafton Allahu, nuk ka të adhuruar tjetër përveç Atij, te Ai jam mbështetur dhe Ai është Zoti i Arshit të Madh.",
        "transliteration": "HasbiyAll-llahu la ilahe il-la Huve, alejhi tevekkeltu ve Huve Rabbul-Arshil-Adhim.",
        "count": 7,
        "reference": "Kush e thotë këtë 7 herë në mëngjes dhe mbrëmje, Allahu i mjafton për të gjitha brengat e kësaj bote dhe botës tjetër. (Ebu Davudi 4/321)."
      },
      {
        "id": 1034,
        "ar": "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْللِي،\\n\\nوَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَيْنِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي،\\n\\nوَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
        "sq": "O Allah, të lutem për falje dhe shpëtim në këtë botë dhe në botën tjetër. O Allah, të lutem për falje dhe shpëtim në fenë time, në jetën time, në familjen time dhe në pasurinë time. O Allah, mbuloji të metat e mia dhe qetësoji frikërat e mia. O Allah, më mbro nga para, nga mbrapa, nga e djathta, nga e majta dhe nga sipër, dhe kërkoj mbrojtje me madhështinë Tënde që të mos goditem nga poshtë.",
        "transliteration": "All-llahumme inni es’elukel-afve vel-afijete fid-dunja vel-ahireh, All-llahumme inni es’elukel-afve vel-afijete fi dini ve dunjaje ve ehli ve mali, All-llahummestur avrati ve amin rev’ati, All-llahummahfadhni min bejne jedejje ve min halfi ve an jemini ve an shimali ve min fevki, ve eudhu bi azametike en ugtale min tahti.",
        "count": 1,
        "reference": "Ebu Davudi dhe Ibën Maxheh. “Sahih Ibën Maxheh” 2/332."
      },
      {
        "id": 1035,
        "ar": "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاواتِ والْأَرْضَ، رَبَّ كُلِّ شَيْءٍ وَمَلِكُهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءاً، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ",
        "sq": "O Allah, Njohës i së fshehtës dhe së dukshmes, Krijues i qiejve dhe i tokës, Zot i çdo gjëje dhe Sundues i saj, dëshmoj se nuk ka të adhuruar tjetër përveç Teje; kërkoj mbrojtjen Tënde nga e keqja e vetes sime, nga e keqja e djallit dhe nga ajo që djalli të shpie në idhujtari, si dhe kërkoj të më mbrosh që vetvetes e as ndonjë muslimani të mos i bëj dëm.",
        "transliteration": "All-llahumme ‘alimel-gajbi vesh-shehadeti fatiras-semavati vel-erdi, Rabbe kul-li shej’in ve melikehu, esh-hedu en la ilahe il-la Ente, eudhu bike min sherri nefsi ve min sherrish-shejtani ve shirkihi ve en ekterife ala nefsi su’en ev exhurrehu ila muslim.",
        "count": 1,
        "reference": "Tirmidhiu dhe Ebu Davudi. “Sahih et-Tirmidhi” 3/142."
      },
      {
        "id": 1036,
        "ar": "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
        "sq": "Me emrin e Allahut pranë emrit të të Cilit nuk të bën dëm asgjë në tokë e as në qiell, Ai është që shumë dëgjon dhe që di çdo gjë.",
        "transliteration": "Bismil-lahil-ledhi la jedur-ru me’a-ismihi shej’un fil-erdi ve la fis-semai ve huves-semiul-alim.",
        "count": 3,
        "reference": "Kush e thotë këtë lutje tri herë në mëngjes dhe në mbrëmje, nuk i bëhet dëm asgjë. (Ebu Davudi 4/323, Tirmidhiu 5/465)."
      },
      {
        "id": 1037,
        "ar": "رَضِيتُ باللهِ رَبَّاً، وَبِالْإِسْلَامِ دِيناً، وَبِمُحَمَّدٍ صَلَى اللَّهُ عَلِيهِ وَسَلَّمَ نَبِيَّاً",
        "sq": "Jam i kënaqur që Zoti im është Allahu, feja ime është Islami dhe Pejgamberi im është Muhamedi (a.s).",
        "transliteration": "Redijtu bil-lahi Rabben ve bil-Islami dinen, ve bi Muhammedin nebijjen.",
        "count": 3,
        "reference": "Kush e thotë këtë lutje çdo mëngjes dhe mbrëmje tri herë është obligim i Allahut që ta kënaq atë ditën e Kiametit. (Ahmedi 4/337, Tirmidhiu 5/465)."
      },
      {
        "id": 1038,
        "ar": "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ أَصْلِحْ لِي شَأْنِي كُلَّهُ وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
        "sq": "O i Gjallë përgjithmonë, O Mbikëqyrës i çdo gjëje, me mëshirën Tënde kërkoj ndihmë, ma përmirëso tërë gjendjen time dhe mos më lër të mbështetem në veten time, as sa një përpëlitje e syrit.",
        "transliteration": "Ja Hajju ja Kajjumu bi rahmetike estegithu aslih li she’ni kul-lehu ve la tekilni ila nefsi tarfete ajnin.",
        "count": 1,
        "reference": "Hakimi 1/545, “Sahih et-Tergib vet-Terhib” 1/273."
      },
      {
        "id": 1039,
        "ar": "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لهِ رَبِّ الْعَالَمِينَ، اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ: فَتْحَهُ، وَنَصْرَهُ وَنُورَهُ، وَبَرَكَتَهُ، وَهُدَاهُ،\\n\\nوَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَهُ",
        "sq": "E arritëm mbrëmjen dhe e tërë pasuria i takon Allahut, Zotit të botëve. O Allahu im, unë kërkoj mirësinë e kësaj nate, hapjen e saj, ndihmën e saj, dritën e saj, dhuntinë dhe udhëzimin e saj. Kërkoj të më mbrosh nga e keqja e saj dhe e natave të tjera pas saj.",
        "transliteration": "Emsejna ve emsel-Mulku lil-lahi Rabbil-alemin. All-llahumme inni es’eluke hajre hadhihil-lejleti, fethaha, ve nasreha, ve bereketeha, ve hudaha, ve eudhi bike min sherri ma fiha ve sherri ma badeha.",
        "count": 1,
        "reference": "Ebu Davudi 4/322."
      },
      {
        "id": 1040,
        "ar": "أَصْبَحْنَا عَلَى فِطْرَةِ الْإِسْلَامِ وَعَلَى كَلِمَةِ الْإِخْلَاصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صَلَى اللَّهُ عَلِيهِ وَسَلَّمَ، وَعَلَى مِلَّةِ أَبِينَا\\n\\nإِبْرَاهِيمَ، حَنِيفَاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشْرِكِينَ",
        "sq": "E arritëm mbrëmjen në natyrshmërinë Islame, në fjalën e sinqertë (La Ilahe Il-lAll-llah), në fenë e të Dërguarit tonë, Muhamedit (a.s) dhe në fenë e babait tonë Ibrahimit, i cili ka qenë besimdrejtë, musliman e nuk ka qenë prej idhujtarëve.",
        "transliteration": "Emsejna ala fitretil-Islam ve ala kelimetil-Ihlas, ve ala dini nebijjina Muhammedin, ve ala mil-leti ebina Ibrahime hanifen muslimen ve ma kane minel-mushrikin.",
        "count": 1,
        "reference": "Ahmedi 3/406-407, “Sahih el-Xhamiu” 4/209."
      },
      {
        "id": 1041,
        "ar": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        "sq": "I Lartësuar qoftë Allahu, Atij i takon Lavdërimi.",
        "transliteration": "SubhanAll-llahi ve bihamdihi.",
        "count": 100,
        "reference": "Kush e thotë këtë në mëngjes dhe në mbrëmje 100 herë, askush s’do të vijë Ditën e Kiametit me diç më të vlefshme se ky. (Muslimi 4/2071)."
      },
      {
        "id": 1042,
        "ar": "I Dërguari (a.s) ka thënë: “Fjala më e mirë të cilën e kam thënë unë dhe të Dërguarit para meje, është:\\nلَا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ\\n",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival. Atij i takon Sundimi dhe Lavdërimi dhe Ai është i Gjithëfuqishëm mbi çdo gjë.",
        "transliteration": "La Ilahe il-lAll-llahu vahdehu la sherike leh, lehul-mulku ve lehul-hamdu ve huve ala kul-li shejin kadir.",
        "count": 10,
        "reference": "Ebu Davudi 4/319."
      },
      {
        "id": 1043,
        "ar": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        "sq": "Kërkoj mbrojtje me fjalët e përsosura të Allahut nga çdo e keqe që e ka krijuar. (Tri herë në mbrëmje)",
        "transliteration": "Eudhu bi kelimatil-lahit-tammati min sherri ma halaka.",
        "count": 3,
        "reference": "Kush e thotë këtë lutje tri herë në mbrëmje, nuk i bën dëm temperatura e asaj nate. (Ahmedi 2/290, Tirmidhiu 3/187)."
      },
      {
        "id": 1044,
        "ar": "ءَامَنَ ٱلرَّسُولُ بِمَآ أُنزِلَ إِلَيْهِ مِن رَّبِّهِۦ وَٱلْمُؤْمِنُونَ ۚ كُلٌّ ءَامَنَ بِٱللَّهِ وَمَلَـٰٓئِكَتِهِۦ وَكُتُبِهِۦ وَرُسُلِهِۦ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِۦ ۚ وَقَالُوا۟ سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ ٱلْمَصِيرُ\nلَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًا كَمَا حَمَلْتَهُۥ عَلَى ٱلَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِۦ ۖ وَٱعْفُ عَنَّا وَٱغْفِرْ لَنَا وَٱرْحَمْنَآ ۚ أَنتَ مَوْلَىٰنَا فَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَـٰفِرِينَ",
        "sq": "I Dërguari i besoi asaj që i u shpall nga Zoti i tij, e ashtu edhe besimtarët: të gjithë i besuan Allahut, engjëjve të Tij, librave të Tij dhe të dërguarve të Tij. Ne nuk bëjmë dallim në asnjërin nga të dërguarit e Tij. Dhe thashë: Dëgjuam dhe respektuam, kërkojmë faljen Tënde o Zoti ynë dhe te Ti është kthimi. Allahu nuk ngarkon asnjë njeri përtej mundësive të tij; atij i takon ajo që ka fituar dhe kundër tij është ajo që ka merituar. O Zoti ynë, mos na dëno nëse harrojmë ose gabojmë! O Zoti ynë, mos na ngarko barrë të rëndë siç i ngarkove ata para nesh! O Zoti ynë, mos na ngarko me atë që nuk kemi fuqi ta bartim! Mëshoje e falna, e na mëshiro! Ti je Mbrojtësi ynë, prandaj na ndihmo kundër popullit mosbesimtar!",
        "transliteration": "Amener-Resulu bima unzile ilejhi min Rabbihi vel-mu’minun, kul-lun amene bil-lahi ve melaiketihi ve kutubihi ve rusulih, la nuferriku bejne ehadin min rusulih, ve kalu semi’na ve eta’na gufraneke Rabbena ve ilejkel-masir. La jukellifull-llahu nefsen il-la vus’aha, leha ma kesebet ve alejha mektesebet, Rabbena la tu’akhidhna in nesina ev akhta’na, Rabbena ve la tahmil alejna isran kema hameltehu alel-ledhina min kablina, Rabbena ve la tuhammilna ma la takate lena bih, va’fu anna vegfir lena verhamna, Ente Mevlana fensurna alel-kavmil-kafirin.",
        "count": 1,
        "reference": "Kush i lexon këto dy ajete në mbrëmje i mjaftojnë. (Buhariu “Fet’hul-Bari” 9/94, Muslimi 1/554)."
      },
      {
        "id": 1045,
        "ar": "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
        "sq": "Kërkoj faljen e Allahut dhe tek Ai pendohem.",
        "transliteration": "Estagfirull-llahe ve etubu ilejhi.",
        "count": 100,
        "reference": "Buhariu 11/101, Muslimi 4/2075."
      },
      {
        "id": 1046,
        "ar": "اَللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبَيِّنَا مُحَمَّدٍ",
        "sq": "O Allahu im, mëshiroje dhe përshëndete të Dërguarin tonë, Muhamedin.",
        "transliteration": "All-llahumme sal-li ve sel-lim ala nebijjina Muhammed.",
        "count": 10,
        "reference": "Taberaniu, “Sahih et-Tergib vet-Terhib” 1/273."
      }
    ]
  },
  {
    "id": 29,
    "categoryId": "mëngjes-dhe-mbrëmje",
    "title": "Dhikri para fjetjes (Gjumi)",
    "titleAr": "أذكار النوم",
    "isRoutine": "gjumi",
    "duas": [
      {
        "id": 99,
        "ar": "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n قُلْ هُوَ ٱللَّهُ أَحَدٌ ۞ ٱللَّهُ ٱلصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ\n\nبِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ۞ مِن شَرِّ مَا خَلَقَ ۞ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۞ وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ ۞ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ\n\nبِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ\n قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ۞ مَلِكِ ٱلنَّاسِ ۞ إِلَـٰهِ ٱلنَّاسِ ۞ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ۞ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ۞ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
        "sq": "Surja El-Ihlas:\nThuaj: \"Ai, Allahu është Një! Allahu është Ai që çdo krijesë i nevojitet. Nuk ka lindur kënd, as nuk është i lindur. Dhe Atij askush nuk i është i barabartë.\"\n\nSurja El-Felek:\nThuaj: \"Kërkoj mbështetje te Zoti i agimit, nga dëmi i çdo krijese që Ai ka krijuar, nga dëmi i errësirës së natës kur ajo kaplon, nga dëmi i atyre që fryjnë në nyja (magjistarëve), dhe nga dëmi i lakmuesit kur xhelozon!\"\n\nSurja En-Nas:\nThuaj: \"Kërkoj mbështetje te Zoti i njerëzve, Sunduesi i njerëzve, I Adhuruari i njerëzve, nga dëmi i ngacmuesit që fshihet, i cili bën vesvese në gjokset e njerëzve, qoftë ai nga xhinët apo nga njerëzit!\"",
        "transliteration": "Bismillahir-Rahmanir-Rahim. Kul huvall-llahu ehad. All-llahus-samed. Lem jelid ve lem juled. Ve lem jekun lehu kufuven ehad.\n\nBismillahir-Rahmanir-Rahim. Kul eudhu bi rabbil-felek. Min sherri ma khalek. Ve min sherri gasikin idha vekab. Ve min sherrin-neffathati fil-ukad. Ve min sherri hasidin idha hased.\n\nBismillahir-Rahmanir-Rahim. Kul eudhu bi rabbin-nas. Melikin-nas. Ilahin-nas. Min sherril-vesvasil-khannas. El-ledhi juvesvisu fi sudurin-nas. Minel-xhinneti ven-nas.",
        "count": 3,
        "reference": "Buhariu “Fet’hul-Bari” 9/62 dhe Muslimi 4/1723."
      },
      {
        "id": 100,
        "ar": "أَعُوذُ بِٱللَّهِ مِنَ ٱلشَّيْطَـٰنِ ٱلرَّجِيمِ\nٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
        "sq": "Allahu është Një, nuk ka Zot tjetër përveç Atij. Ai është Mbikëqyrës i përhershëm dhe i përjetshëm. Atë nuk e zë as kotja, as gjumi, gjithçka që ka në qiej dhe në tokë është vetëm e Tij. Askush nuk mund të ndërmjetësoj tek Ai, përveç me lejen e Tij? Ai di të tashmen dhe të ardhmen. Nga ajo që Ai di, të tjerët dinë vetëm aq sa Ai ka dëshiruar. Kursija e Tij përfshin qiejt dhe tokën, kurse kujdesi i Tij ndaj të dyjave nuk i vjen rëndë. Ai është më i Larti, më i Madhi.",
        "transliteration": "All-llahu La Ilahe il-la huvel-Hajjul-Kajjumu, la te’hudhuhu sinetun ve la nevmun, lehu ma fis-semavati ve ma fil-erdi, men dhel-ledhi jeshfe’u indehu il-la bi idhnihi, ja’lemu ma bejne ejdihim ve ma halfehum ve la juhitune bi shej’in min ilmihi il-la bima shae, vesi’a Kursijjuhus-semavati vel-erda, ve la jeuduhu hifdhuhuma, ve huvel-Alijjul-Adhim",
        "count": 1,
        "reference": "“Kush e lexon këtë lutje kur të bie në shtrat, ai është i mbrojtur prej Allahut dhe nuk i afrohet atij shejtani deri sa të agojë mëngjesi.” Buhariu 4/487)."
      },
      {
        "id": 101,
        "ar": "ءَامَنَ ٱلرَّسُولُ بِمَآ أُنزِلَ إِلَيْهِ مِن رَّبِّهِۦ وَٱلْمُؤْمِنُونَ ۚ كُلٌّ ءَامَنَ بِٱللَّهِ وَمَلَـٰٓئِكَتِهِۦ وَكُتُبِهِۦ وَرُسُلِهِۦ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِۦ ۚ وَقَالُوا۟ سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ ٱلْمَصِيرُ\nلَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا ٱكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًا كَمَا حَمَلْتَهُۥ عَلَى ٱلَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِۦ ۖ وَٱعْفُ عَنَّا وَٱغْفِرْ لَنَا وَٱرْحَمْنَآ ۚ أَنتَ مَوْلَىٰنَا فَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَـٰفِرِينَ",
        "sq": "I Dërguari i besoi asaj që iu shpall prej Zotit të Tij si dhe besimtarët. Secili i besoi Allahut, melekëve të Tij, shpalljeve të Tij dhe të dërguarve të Tij. Ne nuk bëjmë dallim në asnjërin nga të dërguarit e Tij dhe thanë: “Dëgjuam dhe respektuam. Kërkojmë faljen tënde o Zoti ynë, te Ti është ardhmëria (jonë)”. Allahu nuk ngarkon askë përtej mundësive të tij, atij (njeriut) i takon ajo që e fitoi dhe Atij i bie ajo (e keqe) që e meritoi.”Zoti ynë, mos na dëno nëse harrojmë ose gabojmë! Zoti ynë, mos na ngarko neve barrë të rëndë siç i ngarkove ata para nesh! Zoti ynë, mos na ngarko me atë për të cilën nuk kemi fuqi! Na i mbulo të këqijat, na fal dhe na mëshiro. Ti je Mbrojtësi ynë, pra na ndihmo kundër popullit jobesimtarë!",
        "transliteration": "Amener-resulu bima unzile ilejhi min Rabbihi vel-mu’minun, kul-lun amene bil-lahi ve melaiketihi ve kutubihi ve rusulihi, la nuferriku bejne ehadin min rusulihi ve kalu semi’na ve eta’na gufraneke Rabbena ve ilejkel mesir. La jukel-lifull-llahu nefsen il-la vus’aha leha ma kesebet ve alejha mektesebet. Rabbena la tuahidhna in nesina ev ahta’na, Rabbena ve la tahmil alejna isren kema hameltehu alel-ledhine min kablina, Rabbena ve la tuhammilna ma la takate lena bihi, vafuanna vagfirlena verhamna ente mevlana fensurna alel-kavmil-kafirin",
        "count": 1,
        "reference": "“Kush i lexon këto dy ajete në mbrëmje i mjaftojnë.” Buhariu “Fet’hul-Bari” 9/94 Muslimi 1/554. Ajete nga kaptina Bekare 285-286."
      },
      {
        "id": 102,
        "ar": "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا، بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
        "sq": "Me emrin Tënd, o Zoti im, bie në gjumë dhe me emrin tënd ngritëm. Nëse ma merr shpirtin më mëshiro, e nëse ma kthen në trupin tim, mbroje atë sikurse i mbron robërit e Tu të mirë.",
        "transliteration": "Bismike Rabbi ved’atu xhenbi ve bike erfeuhu fe in emsekte nefsi ferhamha ve in erselteha fahfedhha bima tahfedhu bihi ibadekes-salihin",
        "count": 3,
        "reference": "“Kur dikush prej juve ngritët nga shtrati i tij e pastaj kthehet në të, le ta fshijë tri herë dyshekun, ngase ai nuk e di se mund të ketë rënë diç në të pasi është larguar nga ai, e pastaj le të thotë: (hadithin)” Buhariu “Fet’hul-Bari” 1/126), Muslimi 4/2084."
      },
      {
        "id": 103,
        "ar": "اللَّهُمَّ إِنَّـكَ خَلَـقْتَ نَفْسـي وَأَنْـتَ تَوَفّـاهـا لَكَ ممَـاتـها وَمَحْـياها ، إِنْ أَحْيَيْـتَها فاحْفَظْـها ، وَإِنْ أَمَتَّـها فَاغْفِـرْ لَـها. اللَّهُمَّ إِنَّـي أَسْـأَلُـكَ العـافِـيَة",
        "sq": "O Allahu im, Ti krijove shpirtin tim dhe Ti e bën që ai të vdes. Tek Ti është vdekja dhe jeta e tij. Nëse i jep jetë mbroje atë, e nëse më bën të vdes, fale atë. O Allahu im, të lutem të më shpëtosh.",
        "transliteration": "All-llahumme inneke halakte nefsi ve Ente tevefaha, Leke mematuha, ve mahjaha, In ahjejteha fahfedhha ve in emetteha fagfir leha. All-llahumme inni es’elukel-afijete",
        "count": 1,
        "reference": "Muslimi 4/2083, Ahmedi 2/79. Këtë version e shënon Ahmedi."
      },
      {
        "id": 104,
        "ar": "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
        "sq": "O Allahu im, më ruaj prej dënimit Tënd, ditën kur do t’i ringjallësh robërit Tu.",
        "transliteration": "All-llahumme kini adhabeke jevme teb’athu ibadeke. (3 herë).",
        "count": 3,
        "reference": "I Dërguari (paqja e Allahut qoftë mbi të) kur dëshironte të flejë e vente dorën e tij të djathtë nën faqe dhe thoshte: (hadithin) Ebu Davudi 4/311 “Sahih et-Tirmidhi” 3/143)."
      },
      {
        "id": 105,
        "ar": "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
        "sq": "Me emrin Tënd, o Allahu im vdes dhe me emrin Tënd jetoj.",
        "transliteration": "Bismike All-llahumme emutu ve ahja",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 11/113, Muslimi 4/2083."
      },
      {
        "id": 106,
        "ar": "سُبْحَانَ اللهِ، والْحَمْدُ للهِ، وَاللَّهُ أَكْبَرُ",
        "sq": "",
        "transliteration": "SubhanAll-llah] (33 herë), Elhamdulil-lah (33 herë), All-llahu Ekber (34 herë).",
        "count": 33,
        "reference": "“Kush e thotë këtë lutje kur t’i afrohet shtratit është më e mirë për të se sa të ketë shërbëtor.” Buhariu “Fet’hul-Bari” 7/71), Muslimi 4/2091."
      },
      {
        "id": 107,
        "ar": "اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيمِ، رَبَّنَا وَرَبَّ كُلِّ شَيْءٍ، فَالِقَ الْحَبِّ وَالنَّوَى، وَمُنْزِلَ التَّوْرَاةِ وَالْإِنجِيلِ، وَالْفُرْقَانِ، أَعُوذُ بِكَ مِنْ شَرِّ كُلِّ شَيْءٍ أّنْتَ آخِذٌ بِنَاصِيَتهِ. اللَّهُمَّ أَنْتَ الأَوَّلُ فَلَيْسَ قَبْلَكَ شَيْءٌ، وَأَنْتَ الْآخِرُ فَلَيْسَ بَعْدَكَ شَيْءٌ، وَأَنْتَ الظَّاهِرُ فَلَيْسَ فَوْقَكَ شَيْءٌ، وَأَنْتَ الْبَاطِنُ فَلَيْسَ دُونَكَ شَيْءٌ، اقْضِ عَنَّا الدَّيْنَ وَأَغْنِنَا مِنَ الْفَقْرِ",
        "sq": "O Allahu im, Zoti i të shtatë qiejve dhe Zoti i Arshit të Madh, Zoti ynë dhe Zoti i çdo gjëje, Zbërthyes i farës dhe i bërthamës së pemës, Ti je Ai i Cili e shpalle Tevratin, Inxhilin dhe Furkanin (Kuranin). Kërkoj mbrojtjen Tënde nga e keqja e çdo gjëje sepse balli i çdo gjëje është në dorën Tënde. O Allah, Ti je i Pari dhe para Teje nuk pati asgjë. Ti je i Fundit dhe mbas Teje nuk mbetet asgjë. Ti je i Dukshmi dhe mbi Ty s’ka asgjë. Ti je i Padukshmi dhe nën Ty s’ka asgjë. Largoje nga ne borxhin dhe na mbroj ne prej varfërisë.",
        "transliteration": "All-llahumme Rabbes-semavatis-seb’i ve Rabbel-arshil-adhim, Rabbena ve Rabbe kul-li shej’in, Falikal-habbi ven-neva, ve Munzilet-Tevrati vel-Inxhili, vel-Furkan, eudhu bike min sherri kul-li shej’in Ente ahidhun bi nasijetihi. All-llahumme Entel-Evvelu fe lejse kableke shej’un, ve Entel-ahiru fe lejse badeke shej’un, ve Entedh-Dhahiru fe lejse fevkake shej’un, ve Entel-batinu fe lejse duneke shej’un, Ikdianna ed-dejne, ve agnina minel-fakr",
        "count": 1,
        "reference": "Muslimi 4/2084."
      },
      {
        "id": 108,
        "ar": "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا، وَكَفَانَا، وَآوَانَا، فَكَمْ مِمَّنْ لَا كَافِيَ لَهُ وَلَا مُؤْويَ",
        "sq": "Falënderimi i qoftë Allahut i cili na jep të hamë dhe të pimë, na jep veshmbathje dhe na strehon. Sa ka të atillë që nuk kanë as veshmbathje e as strehim.",
        "transliteration": "Elhamdulil-lahil-ledhi et’amena ve sekana, ve kefana, ve avana, fe kem mimmen la kafije lehu ve la mu’vije",
        "count": 1,
        "reference": "Muslimi 4/2085."
      },
      {
        "id": 109,
        "ar": "اللَّهُمَّ عَالِمَ الْغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَاواتِ والْأَرْضَ، رَبَّ كُلِّ شَيْءٍ وَمَلِكُهُ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطَانِ وَشِرْكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءاً، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ",
        "sq": "O Allahu im, Ti je Ai i Cili i di të fshehtat dhe të dukshmet, Krijues i qiejve dhe i tokës, Zot i çdo gjëje dhe Mbizotërues i saj, dëshmoj se nuk ka hyjni që meriton të adhurohet përveç Teje; kërkoj mbrojtjen Tënde nga e keqja e vetes sime dhe nga e keqja e djallit, si dhe nga ajo që djalli të shpie në idhujtari dhe kërkoj të më mbrosh që vetvetes e as ndonjë muslimani të mos i bëj keq. Pastaj lexon suret Bekare, Sexhde dhe Mulk.",
        "transliteration": "All-llahumme alimel-gajbi vesh-shehadeti, Fatires-semavati vel-erdi, Rabbe kul-le shej’in ve Melikehu, eshhedu en la Ilahe il-la Ente, eudhu bike min sherri nefsi ve min sherrish-shejtani ve shirkihi, ve en ekterife ala nefsi su’en ev exhurrehu ila muslimin",
        "count": 1,
        "reference": "Ebu Davudi 4/317, “Sahih et-Tirmidhi” 3/142. Tirmidhiu dhe Nesaiu “Sahih el-Xhamiu” 4/255."
      },
      {
        "id": 111,
        "ar": "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ، وَفَوَّضْتُ أَمْرِي إِلَيْكَ، وَوَجَّهْتُ وَجْهِي إِلَيْكَ، وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ، رَغْبَةً وَرَهْبَةً إِلَيْكَ، لَا مَلْجَأَ وَلّا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ، آمَنْتُ بِكِتَابِكَ وَبِنَبِيِّكَ الَّذِي أَرْسَلْتَ",
        "sq": "O Allahu im, unë ta dorëzova Ty shpirtin tim. Ty ta kam dorëzuar çështjen time dhe fytyrën time e ktheva kah Ti. Tek Ti strehova shpinën time me dëshirë dhe frikërespekt. Nuk ka shpëtim dhe as strehim përveç se tek Ti; unë Kam besuar në librin Tënd, Kuranin të cilin e ke zbritur dhe e kam besuar lajmëtarin tënd, Muhamedin të cilin e dërgove.",
        "transliteration": "All-llahumme eslemtu nefsi ilejke ve fevvedtu emri ilejke ve vexhxhehtu vexhhi Ilejke, ve elxhe’tu dhahri ilejke, regbeten ve rahbeten Ilejk la melxhe’e ve la menxha minke il-la ilejke, amentu bi kitabik el-ledhi enzelte ve bi nebijjikel-ledhi erselte",
        "count": 1,
        "reference": "I Dërguari ka thënë: “Kur dëshiron që të shtrihesh për të fjetur, merr abdes sikurse për në namaz, pastaj shtriju në krahun e djathtë dhe thuaj: (hadithin)” “Ai person i cili e thotë këtë lutje ka thënë se vdes në natyrë të pastër islame”. Buhariu “Fet’hul-Bari” 11/113, Muslimi 4/2081."
      }
    ]
  },
  {
    "id": 30,
    "categoryId": "mëngjes-dhe-mbrëmje",
    "title": "Duaja me rastin e rrotullimit natën",
    "duas": [
      {
        "id": 112,
        "ar": "لَا إِلَهَ إِلَّا اللَّهُ الْوَاحِدُ اْقَهَّارُ، رَبُّ السَّمَاوَاتِ وَالْأَرْضِ وَمَا بَيْنَهُمَا الْعَزِيزُ الْغَفَّارُ",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Allahut, i cili është i Vetëm dhe Mposhtës, është Zot i qiejve dhe i tokës, si dhe i krejt çfarë ka ndërmjet tyre, Ai është Fuqiplotë dhe Mëkatfalës.",
        "transliteration": "La ilahe il-laAll-llahu El-Vahidul-Kahhar, Rabbus-semavati vel-erdi ve ma bejne huma El-Azizul-Gaffar",
        "count": 1,
        "reference": "“Këtë lutje duhet thënë me rastin e rrotullimit prej njërit krah në tjetrin.” Hakimi i cili e ka bërë të vërtetë (sahih), kurse Dhehebiu e ka pëlqyer 1/540. Po ashtu Nesaiu në “Amel el-Jevmi ve Lejleh” dhe Ibën Sunnij “Sahih el-Xhamiu” 4/213."
      }
    ]
  },
  {
    "id": 31,
    "categoryId": "mëngjes-dhe-mbrëmje",
    "title": "Duaja me rastin e frikës në gjumë",
    "duas": [
      {
        "id": 113,
        "ar": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ، وَشَرِّ عِبَادِهِ، وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ",
        "sq": "Kërkoj mbrojtje me fjalët e përsosura të Allahut nga hidhërimi i Tij, nga dëmi i robërve të Tij, nga vesveset e djajve dhe nga afrimi i tyre.",
        "transliteration": "Eudhu bi kelimatil-lahit-tammati, min gadabihi ve ikabihi ve sherri ibadihi ve min hemezatish-shejatin ve en jahdurun",
        "count": 1,
        "reference": "Ebu Davudi 4/12, “Sahih et-Tirmidhi” 3/171."
      }
    ]
  },
  {
    "id": 32,
    "categoryId": "namazi",
    "title": "Ç’duhet bërë ai i cili sheh ëndërr",
    "duas": [
      {
        "id": 267,
        "ar": "",
        "sq": "1. Duhet të pështyjë tri herë në anën e majtë. 2. Të kërkojë mbrojtjen e Allahut të Lartësuar nga djalli i mallkuar dhe nga e keqja e asaj që ka parë (3 herë). 3. Mos t’ia tregojë këtë askujt. 4. Të kthehet në krahun e kundërt. 5. Ngritët dhe falet nëse e dëshiron këtë.",
        "transliteration": "",
        "count": 3,
        "reference": "Muslimi 4/1772, 1773."
      }
    ]
  },
  {
    "id": 33,
    "categoryId": "namazi",
    "title": "Duaja e kunutit",
    "duas": [
      {
        "id": 114,
        "ar": "اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعطَيْتَ، وَقِنِي شَرَّ مَا\\n\\nقَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَى عَلَيْكَ، إِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، [وَلَا يَعِزُّ مَنْ عَادَيْتَ]، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ",
        "sq": "O Allahu im, më bëj mua prej atyre që Ti i ke udhëzuar dhe më bëj prej atyre që Ti i ke falur, më bëj prej të dashurve Tu, më beko mua në atë që më ke dhënë dhe më mbroj nga dëmi i asaj që Ti ke caktuar. Vërtet, Ti je Ai i Cili cakton dhe askush nuk mund të caktojë kundër Teje asgjë. Me të vërtetë nuk ka mposhtje për atë të cilin Ti e miqëson dhe nuk ka krenari për atë që Ti e armiqëson. I Madhëruar je O Zoti ynë dhe i Lartësuar je Ti.",
        "transliteration": "All-llahumme-hdini fi men hedejt ve afini fi men afejt ve tevel-leni fi men tevel-lejt ve barik li fi ma a’ëtajt ve kini sherre ma kadajt fe inneke takdi ve la jukda alejk, innehu la jedhil-lu men valejte ve la je’izu men adejt tebarekte Rabbena ve te’alejt",
        "count": 1,
        "reference": "E shënojnë autorët e katër suneneve dhe Ahmedi, i vërtetë sipas Albanit “Irvaul-Galil” 2/172."
      },
      {
        "id": 115,
        "ar": "اللَّهُمَّ إِنِّي أَعُوذُ بِرِضَاكَ مَنْ سَخَطِكَ، وَبِمُعَافَاتِكَ مِنْ عُقُوبَتِكَ، وأَعُوذُ بِكَ مِنْكَ، لَا أُحْصِي ثَنَاءً عَلَيْكَ، أَنْتَ كَمَا أَثْنَيْتَ عَلَى نَفْسِكَ",
        "sq": "O Allahu im, kërkoj strehim te Ti me anë të kënaqësisë Tënde nga hidhërimi Yt dhe me faljen Tënde nga dënimi Yt. Kërkoj mbrojtjen Tënde nga Ti, unë nuk mund të të madhëroj aq sa meriton Ti; Ti je i Madhëruar ashtu siç e ke përshkruar Veten.",
        "transliteration": "All-llahumme inni eudhu bi ridake min sehatik, ve bi muafatike min ukabetik, ve eudhu bike minke, la uhsi thenaen Alejke, Enta kema ethnejte ala Nefsike",
        "count": 1,
        "reference": "E shënojnë autorët e katër suneneve dhe Ahmedi. Shih “Sahih et-Tirmidhi” 3/180, “Sahih Ibën Maxheh” 1/194, “Irvaul-Galil” 2/175."
      },
      {
        "id": 116,
        "ar": "اللَّهُمَّ إِيَّاكَ نَعْبُدُ، وَلَكَ نُصَلِّي وَنَسْجُدُ، وَإِلَيْكَ نَسْعَى وَنَحْفِدُ، نَرْجُو رَحْمَتَكَ، وَنَخْشَى عَذَابَكَ، إِنَّ عَذَابَكَ بِالْكَافِرِينَ مُلْحَقٌ. اللَّهُمَّ إِنَّا نَسْتَعِينُكَ، وَنَسْتَغْفِرُكَ، وَنُثْنِي عَلَيْكَ الْخَيْرَ، وَلَا نَكْفُرُكَ، وَنُؤْمِنُ بِكَ وَنَخْضَعُ لَكَ، وَنَخْلَعُ مَنْ يَكْفُرُكَ",
        "sq": "O Allahu im, vetëm Ty të adhurojmë, për Ty falemi dhe vetëm Ty të përulemi, kah Ti vijmë dhe shpejtojmë, shpresojmë mëshirën Tënde dhe i frikohemi dënimit Tënd. Vërtetë, dënimi Yt do t’i arrijë jobesimtarët. O Allahu im, prej Teje kërkojmë ndihmë dhe falje. Ty të Falënderojmë me çdo gjë të mirë. Nuk të mohojmë dhe vetëm Ty të besojmë. Vetëm Ty të përulemi dhe e braktisim atë që Ty të mohon.",
        "transliteration": "All-llahumme ijjake na’budu ve leke nusal-li ve nesxhudu, ve ilejke nes’a ve nahfidu, nerxhu rahmeteke, ve nahsha adhabeke inne adhabeke bil-kafirine mulhak. All-llahumme inna neste’i nuke ve nestagfiruke ve puthni alejkel-hajre, ve la nekfuruke, ve nu’minu bike ve nahda’u leke ve nahla’u men jekfuruke",
        "count": 1,
        "reference": "Bejhekiu në “Es-Sunen el-Kubra” 2/211, senedi i vërtetë sipas Albanit “Irvaul-Galil” 2/170 dhe është nga fjalët e Omerit (Allahu qoftë i kënaqur me të)."
      }
    ]
  },
  {
    "id": 34,
    "categoryId": "gëzim-dhe-shqetësim",
    "title": "Dhikri pas selamit në namazin e vitrit",
    "duas": [
      {
        "id": 117,
        "ar": "سُبْحَانَ المَلِكِ القُدُّوسِ.",
        "sq": "“I Madhëruar qoftë Allahu, Sunduesi i Pastër nga çdo e metë.” Këtë e thotë tri herë, kurse herën e tretë e thotë me zë duke e zgjatur zërin.",
        "transliteration": "Subhane Melikil-Kuddus",
        "count": 3,
        "reference": ""
      }
    ]
  },
  {
    "id": 35,
    "categoryId": "gëzim-dhe-shqetësim",
    "title": "Lutjet në raste të brengosjes dhe pikëllimit",
    "duas": [
      {
        "id": 118,
        "ar": "للّهُـمَّ إِنِّي عَبْـدُكَ ابْنُ عَبْـدِكَ ابْنُ أَمَتِـكَ نَاصِيَتِي بِيَـدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤكَ أَسْأَلُـكَ بِكُلِّ اسْمٍ هُوَ لَكَ\\n\\nسَمَّـيْتَ بِهِ نَفْسَكَ أِوْ أَنْزَلْتَـهُ فِي كِتَابِكَ، أَوْ عَلَّمْـتَهُ أَحَداً مِنْ خَلْقِـكَ أَوِ اسْتَـأْثَرْتَ بِهِ فِي عِلْمِ الغَيْـبِ عِنْـدَكَ أَنْ تَجْـعَلَ\\n\\nالقُرْآنَ رَبِيـعَ قَلْبِـي، وَنورَ صَـدْرِي وجَلَاءَ حُـزْنِي وذَهَابَ هَمِّـي",
        "sq": "O Allahu im, unë jam robi Yt dhe biri i robit dhe i robëreshës Tënde. Balli im është në dorën Tënde, dispozitat Tuaja mbi mua i pranoj, i drejtë është gjykimi Yt mbi mua. Të lutem me çdo emër me të cilin e ke emëruar Veten Tënde apo që e ke zbritur në librin Tënd, apo ia ke mësuar dikujt prej krijesave Tua, apo që e ke mbajtur të fshehur në diturinë Tënde, bëje Kuranin pranverë të zemrës sime dhe dritë të gjoksit tim, shndritje për pikëllimin dhe largimin e dëshpërimit.",
        "transliteration": "All-llahumme inni abduke ve ibnu abdike ve ibnu emmetike, nasijeti bijedike, madin fijje hukmuke, adlun fijje kadauke, es’eluke bi kul-li ismin huve leke semmejte bihi nefseke ev enzeltehu fi kitabike ev al-lemtehu ehaden min halkike, ev iste’therte bihi fi ilmil-gajbi indeke, en texh’alel-Kur’ane rebi’a kalbi ve nure sadri ve xhelae huzni ve dhihabe hemmi",
        "count": 1,
        "reference": "Ahmedi 1/391. Sahih sipas shejh Albanit."
      },
      {
        "id": 119,
        "ar": "اللَّهُمَّ إِنِّي أَعْوذُ بِكَ مِنَ الهَـمِّ وَ الْحُـزْنِ، والعًجْـزِ والكَسَلِ والبُخْـلِ والجُـبْنِ، وضَلْـعِ الـدَّيْنِ وغَلَبَـةِ الرِّجال",
        "sq": "O Allahu im, kërkoj mbrojtjen Tënde nga brengat dhe dëshpërimi, nga paaftësia dhe dembelia, nga koprracia dhe frika, nga zhytja në borxhe dhe mundimet prej njerëzve.",
        "transliteration": "All-llahumme inni eudhu bike minel-hemmi vel-huzni, vel-axhzi vel-keseli, vel-buhli vel-xhubni, ve dale’id-dejni ve galebetir-rixhali",
        "count": 1,
        "reference": "Buhariu 7/158; “I Dërguari e përsëriste shpesh këtë dua”, “Fet’hul-Bari” 11/173."
      }
    ]
  },
  {
    "id": 36,
    "categoryId": "gëzim-dhe-shqetësim",
    "title": "Duaja gjatë vështirësive",
    "duas": [
      {
        "id": 120,
        "ar": "لَا إلَهَ إلاَّ اللَّهُ الْعَظـيمُ الْحَلِـيمْ، لَا إلَهَ إلاَّ اللَّهُ   رَبُّ العَـرْشِ العَظِيـمِ، لَا إلَهَ إلاَّ اللَّهُ  رَبُّ السَّمَـوّاتِ ورّبُّ الأَرْضِ ورَبُّ\\n\\nالعَرْشِ الكَـريم ",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Allahut të Madhëruar e të Urtë. Nuk ka hyjni që meriton të adhurohet përveç Allahut, Zotit të Arshit të Lartësuar. Nuk ka hyjni që meriton të adhurohet përveç Allahut, Zotit të qiejve dhe të tokës dhe Zotit të Arshit Fisnik.",
        "transliteration": "La Ilahe il-lAll-llahu el-Adhimu el-Halimu, la Ilahe il-lAll-llahu Rabbul-Arshil-Adhimi, la Ilahe il-lAll-llahu Rabbus-semavati ve Rabbul-erdi ve Rabbul-Arshil-kerim",
        "count": 1,
        "reference": "Buhariu 7/154, Muslimi 4/2092."
      },
      {
        "id": 121,
        "ar": "اللَّهُمَّ رَحْمَتَـكَ أَرْجـوفَلا تَكِلـني إِلى نَفْـسي طَـرْفَةَ عَـيْن، وَأَصْلِـحْ لي شَأْنـي كُلَّـه لَا إِلَهَ إِلَّا أنْـت",
        "sq": "O Allahu im, në mëshirën Tënde shpresoj, mos më le të mbështetem në vetvete, as sa një përpëlitje e syrit dhe ma përmirëso gjendjen time. Nuk ka të adhuruar tjetër përveç Teje.",
        "transliteration": "All-llahumme rahmeteke erxhu fe la tekilni ilá nefsi tarfet ajnin ve aslih li she’ni kul-lehu. La ilahe il-la Ente",
        "count": 1,
        "reference": "Ebu Davudi 4/324, Ahmedi 5/42. Shejh Albani e ka bërë të mirë (Hasen), “Sahih Ebu Davud” 3/959."
      },
      {
        "id": 122,
        "ar": "لَا إِلَهَ إِلَّا أنْـت سُـبْحانَكَ إِنِّي كُنْـتُ مِنَ الظّـالِميـن",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Teje që je i Madhëruar. Vërtetë, unë jam prej mëkatarëve.",
        "transliteration": "La ilahe il-la Ente Subhaneke Inni kuntu minedh-dhalimin",
        "count": 1,
        "reference": "Tirmidhiu 5/529 dhe Hakimi, i cili e ka bërë të vërtetë, kurse Dhehebiu e ka pëlqyer 1/505 “Sahih et-Tirmidhi” 3/168."
      },
      {
        "id": 123,
        "ar": "اللَّهُ اللَّهُ رَبِّ لَا أُشْـرِكُ بِهِ شَيْـئاً",
        "sq": "Allahu, Allahu është Zoti im, Atij nuk i shoqëroj asnjë send.",
        "transliteration": "Allahu, Allahu Rabbi, La ushriku bihi shej’en",
        "count": 1,
        "reference": "Shënon Ebu Davudi 2/87 “Sahih Ibën Maxheh” 2/335."
      }
    ]
  },
  {
    "id": 37,
    "categoryId": "gëzim-dhe-shqetësim",
    "title": "Duaja me rastin e takimit me armikun dhe njerëzit në pozitë",
    "duas": [
      {
        "id": 124,
        "ar": "اللَّهُمَّ إِنا نَجْـعَلُكَ فِي نُحـورِهِـم، وَنَعـوذُ بِكَ مِنْ شُرورِهـمْ",
        "sq": "O Allahu im, Ty të lëmë në qafat e tyre; prej Teje ndihmë kërkojmë të na mbrosh prej djallëzisë së tyre.",
        "transliteration": "All-llahumme inna nexh’aluke fi nuhurihim ve neudhu bike min shururihim",
        "count": 1,
        "reference": "Ebu Davudi 2/89, hadithin e ka bërë te vërtetë Hakimi dhe e ka pëlqyer Dhehebiu 2/142."
      },
      {
        "id": 125,
        "ar": "اللَّهُمَّ أَنْتَ عَضُـدي، وَأَنْتَ نَصـيري، بِكَ أَجـولُ وَبِكَ أَصـولُ وَبِكَ أُقـاتِل",
        "sq": "O Allahu im, Ti je fuqia ime, Ti je Ndihmëtari im, me ndihmën Tënde hyj në luftë, me ndihmën Tënde ngadhënjej dhe me ndihmën Tënde luftoj.",
        "transliteration": "All-llahumme Ente Adudí ve Ente Nesiri, bike ehulu, ve bike esulu, ve bike ukatilu",
        "count": 1,
        "reference": "Ebu Davudi 3/42, Tirmidhiu 5/572 “Sahih et-Tirmidhi” 3/183."
      },
      {
        "id": 126,
        "ar": "حَسْبُـنا اللَّهُ وَنِعْـمَ الوَكـيل",
        "sq": "Na mjafton neve Allahu, Ai është mbrojtësi më i mirë.",
        "transliteration": "HasbunAll-llahu ve ni’mel-Vekil",
        "count": 1,
        "reference": "Buhariu 5/172."
      }
    ]
  },
  {
    "id": 38,
    "categoryId": "gëzim-dhe-shqetësim",
    "title": "Duaja për atë i cili i frikohet dëmit të udhëheqësit",
    "duas": [
      {
        "id": 127,
        "ar": "أللَّهُمَّ رَبَّ السَّمواتِ السَّبْعِ وَرَبَّ الْعَرْشِ الْعَظِيْمِ, كُنْ لِي جاَراً مِنْ (فُلانِ بْنِ فُلاَنٍ),وَأَحْزَابِهِ مِنْ خَلاَئِقِكَ أَنْ يَفْرُطَ عَلَيَّ أحَدٌ مِنْهُمْ أَوْ يَطْغَى, عَزَّ جاَرُكَ وَجَلَّ ثَناَؤُكَ, وَ لَا إِلَهَ إلاَّ أَنْتَ ",
        "sq": "O Allahu im, Zot i shtatë qiejve dhe Zot i Arshit të Madh, më mbroj mua prej filanit, birit të filanit dhe aleatëve të tij, si dhe prej krijesave Tua, mos e bëj ndonjërin prej tyre të më prijë mua apo të më sundojë. E fuqishme është ndihma Jote dhe i lartë është falënderimi Yt. Nuk ka të adhuruar tjetër përveç Teje.",
        "transliteration": "All-llahumme Rabbes-semavatis-seb’i ve Rabbel-Arshil-Adhimi, kun li xharen min fulani bin fulanin ve ahzabihi min halaikike, en jefruta alejje ehadun minhum ev jatga, azze xharuke, ve xhel-le thenauke ve la Ilahe il-la Ente",
        "count": 1,
        "reference": "Buhariu “Edebul-Mufred” hadithi nr. 707, shejh Albani e ka bërë të vërtetë (sahih) në “Sahih Edebul-Mufred” #545."
      },
      {
        "id": 128,
        "ar": "اللَّهِ أكْبَرُ، اللَّهِ أعَزُّ مِنْ خَلْقِهِ جَمِيْعاً ، اللَّهِ أعَزُّ مِمَّا أخَافُ وَأحْذَرُ, أعُوذُ بِاللَّهِ الَّذِي لَا إِلَهَ إِلاَّ هُوَ ، الْمُمْسِكِ السَّمَوَاتِ السَّبْعِ أَنْ يَقَعْنَ عَلَى الأَرْضِ ِإلاَّ بِإِذْنِهِ ، مِنْ شَرِّ عَبْدِكَ (فلان) وَجُنُوْدِهِ وَأَتْبَاعِهِ وَأَشْيَاعِهِ ، مِنَ اْلجِنِّ والإِنْسِ ، اَلَّلهُمَّ كُنْ لِيْ جَاراً مِنْ شَرِّهِمْ ، جَلَّ ثَنَاؤُكَ وَعَزَّ جَارُكَ ، وَتَبَارَكَ اسْمُكَ ،وَلاَ إلَهَ غَيْرُك",
        "sq": "Allahu është më i Madhi, Allahu është më i Fuqishëm se të gjitha krijesat e Tij, Allahu është më i Fuqishëm se ai nga i cili frikësohem dhe kujdesem. Kërkoj mbrojtjen e Allahut i Cili nuk ka të adhuruar tjetër përveç Tij, i Cili është Mbajtës i shtatë qiejve, që të mos bien në tokë përveç se me lejen e Tij, nga dëmi i robit tënd, filanit, ndihmësve dhe pasuesve të tij, ithtarëve të tij, prej xhinëve dhe njerëzve. O Allah bëhu Mbrojtësi im nga dëmi i tyre. I lartë është Falënderimi Yt dhe e fuqishme është ndihma Jote; i Lartësuar është emri Yt dhe nuk ka të adhuruar tjetër përveç Teje.",
        "transliteration": "All-llahu ekber, All-llahu E’azzu min hal-kihi xhemian, All-llahu E’azzu mimmen ehafu ve ehdheru, eudhu bil-lahi el-ledhi la Ilahe il-la huve, Mumsikis-semavatis-seb’i en jeka’ëne alel-erdi il-la bi idhnihi, min sherri abdike fulanin, ve xhunudihi ve etba’ihi ve eshja’ihi, minel-xhinni vel-insi, All-llahumme kun li xharen min sherrihim, xhel-le thenauke ve azze xharuke, ve tebarekes-muke ve la Ilahe Gajruke. (3 herë).",
        "count": 3,
        "reference": "Buhariu, “Edebul-Mufred” #707, shejh Albani e ka bërë të vërtetë (sahih) në “Sahih Edebul-Mufred” #545."
      }
    ]
  },
  {
    "id": 39,
    "categoryId": "gëzim-dhe-shqetësim",
    "title": "Duaja kundër armikut",
    "duas": [
      {
        "id": 129,
        "ar": "اللَّهُمَّ  مُنْزِلَ اْلِكتَابِ ، سَرِيْعَ الْحِسَابِ ،اِهْزِمِ الإْحْزَابَ ،اللَّهُمَّ اِهْزِمْهُمْ وَزَلْزِلْهُمْ",
        "sq": "O Allahu im, Shpallësi i librave, Llogaritësi i shpejtë, mposhti grupacionet. O Allahu im, mposhti dhe shkatërroj ato.",
        "transliteration": "All-llahumme munzilel-kitabi, seri’al-hisabi, ihzimil-ahzabe, All-llahumme ihzimhum ve zelzilhum",
        "count": 1,
        "reference": "Muslimi 3/1362."
      }
    ]
  },
  {
    "id": 40,
    "categoryId": "gëzim-dhe-shqetësim",
    "title": "Çfarë duhet thënë ai që i frikësohet një populli",
    "duas": [
      {
        "id": 130,
        "ar": "اللَّهُمَّ اكْفِنِيهِمْ بِماَ شِئْتَ",
        "sq": "O Allahu im, më mbroj prej tyre me çfarë të dëshirosh.",
        "transliteration": "All-llahumme ikfinihim bima shi’te",
        "count": 1,
        "reference": "Muslimi 4/2300."
      }
    ]
  },
  {
    "id": 41,
    "categoryId": "gëzim-dhe-shqetësim",
    "title": "Çfarë duhet vepruar ai të cilin e ka kapluar dyshimi në besim",
    "duas": [
      {
        "id": 131,
        "ar": "",
        "sq": "1. Duhet kërkuar mbrojtje nga Allahu i Madhë-ruar. 2. Duhet të largohet prej asaj në çka ka dyshuar.",
        "transliteration": "",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 6/336 Muslimi 1/120. Buhariu “Fet’hul-Bari” 6/336 Muslimi 1/120."
      },
      {
        "id": 132,
        "ar": "آمَنْـتُ بِاللَّهِ وَرُسُـلِه",
        "sq": "3. Duhet të thotë: “Kam besuar në Allahun dhe në të Dërguarit e Tij.”",
        "transliteration": "Amentu bil-lahi ve rusulihi",
        "count": 1,
        "reference": "Muslimi 1/119-120."
      },
      {
        "id": 133,
        "ar": "هُوَ الأوَّلُ، وَالآخِـرُ، وَالظّـاهِـرُ، وَالْبـاطِـنُ، وَهُوَ بِكُلِّ شَيءٍ عَلـيم",
        "sq": "4. Duhet të lexojë fjalën e Allahut të Lartësuar: “Ai, Allahu është i Pari dhe i Fundit, i Dukshmi dhe i Padukshmi, si dhe më i Dijshmi për çdo gjë.”",
        "transliteration": "Huvel-Evvelu vel-Ahiru vedh-Dhahiru vel-Batinu ve Huve bi kul-li shej’in alim",
        "count": 1,
        "reference": "Hadid, 3. Ebu Davudi 4/329, hadith i mirë sipas shejh Albanit “Sahih Ebu Davud” 3/962."
      }
    ]
  },
  {
    "id": 42,
    "categoryId": "namazi",
    "title": "Lutja e atij që është i ngarkuar me borxhe",
    "duas": [
      {
        "id": 134,
        "ar": "للّهُـمَّ اكْفِـني بِحَلالِـكَ عَنْ حَـرامِـك، وَأَغْنِـني بِفَضْـلِكِ عَمَّـنْ سِـواك",
        "sq": "O Allahu im, më bëj që të më mjaftojë hallalli Yt dhe të mos i afrohem haramit, si dhe më bëj të pasur me mirësitë Tua, që të mos kërkoj prej tjetërkujt përveç prej Teje.",
        "transliteration": "All-llahummek-fini bi halalike an haramike ve agnini bi fadlike ammen sivake",
        "count": 1,
        "reference": "Shënon Tirmidhiu 5/560, “Sahih et-Tirmidhi” 3/180."
      },
      {
        "id": 135,
        "ar": "اللَّهُمَّ إِنِّي أَعْوذُ بِكَ مِنَ الهَـمِّ وَ الْحُـزْنِ، والعًجْـزِ والكَسَلِ والبُخْـلِ والجُـبْنِ، وضَلْـعِ الـدَّيْنِ وغَلَبَـةِ الرِّجال",
        "sq": "O Allahu im, kërkoj mbrojtjen Tënde nga brengat dhe dëshpërimi, nga paaftësia dhe dembelia, nga koprracia dhe frika, nga zhytja në borxhe dhe mundimet prej njerëzve.",
        "transliteration": "All-llahumme inni eudhu bike minel-hemmi vel-hazeni, vel-axhzi vel-keseli, vel-buhli vel-xhubni, ve dale’id-dejni ve galebetir-rixhal",
        "count": 1,
        "reference": "Buhariu 7/158"
      }
    ]
  },
  {
    "id": 43,
    "categoryId": "falënderimi-ndaj-Allahut",
    "title": "Duaja kundër vesveseve në namaz dhe gjatë leximit të kuranit",
    "duas": [
      {
        "id": 136,
        "ar": "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطانِ الرَّجِيْمِ",
        "sq": "Kërkoj mbrojtje tek Allahu nga shejtani i mallkuar. (dhe pështyn në të majtë tri herë).",
        "transliteration": "Eudhu bil-lahi minesh-shejtanir-raxhim",
        "count": 3,
        "reference": "Shënon Muslimi 4/1729, nga hadithi të cilin e rrëfen Othman bin As , i cili thotë: “Kam vepruar kështu dhe Allahu e ka larguar atë nga unë.”"
      }
    ]
  },
  {
    "id": 44,
    "categoryId": "falënderimi-ndaj-Allahut",
    "title": "Duaja e atij që i vështirësohet ndonjë çështje",
    "duas": [
      {
        "id": 137,
        "ar": "اللَّهُمَّ لَا سَـهْلَ إِلاّ مَا جَعَلـتَهُ سَهـلاً، وَأَنْتَ تَجْـعَلُ الْحَـزَنَ إِذا شِـئْتَ سَهـْلاً",
        "sq": "O Allahu im, nuk ka asgjë të lehtë përveç asaj që Ti e ke bërë të lehtë, Ti e bën pikëllimin të lehtë, nëse dëshiron.",
        "transliteration": "All-llahumme la sehle il-la ma xhealtehu, sehlen ve Ente texh’alul-hazne idha shi’te sehlen",
        "count": 1,
        "reference": "Ibën Hibbani në “Sahihun” e tij, #2427, Ibën Sunnij #351. Ibën Haxheri e ka autentifikuar hadithin dhe Abdulkadër Arnauti në veprën “Edhkar” të Neveviut fq.106."
      }
    ]
  },
  {
    "id": 45,
    "categoryId": "shtëpia-dhe-familja",
    "title": "Çfarë duhet të thotë dhe vepron ai cili bën ndonjë mëkat",
    "duas": [
      {
        "id": 223,
        "ar": "",
        "sq": "1. Duhet të pështyjë tri herë në anën e majtë. 2. Të kërkojë mbrojtjen e Allahut të Lartësuar nga djalli i mallkuar dhe nga e keqja e asaj që ka parë (3 herë). 3. Mos t’ia tregojë këtë askujt. 4. Të kthehet në krahun e kundërt. 5. Ngritët dhe falet nëse e dëshiron këtë.",
        "transliteration": "",
        "count": 3,
        "reference": "Muslimi 4/1772, 1773."
      }
    ]
  },
  {
    "id": 46,
    "categoryId": "falënderimi-ndaj-Allahut",
    "title": "Duaja për largimin e djallit dhe vesveseve të tij",
    "duas": [
      {
        "id": 268,
        "ar": "",
        "sq": "1. Të kërkuarit mbrojtje nga Allahu i Lartësuar, prej tij. 2. Këndimi i ezanit. 3. Duatë, dhikret dhe leximi i Kuranit.",
        "transliteration": "",
        "count": 100,
        "reference": "Ebu Davudi 1/206, Tirmidhiu “Sahih et-Tirmidhi” 1/77, Mu’minun, 98-99. Buhariu 1/151, Muslimi 1/291. I Dërguari ka thënë: “Mos i bëni shtëpitë tuaja si varre, me të vërtetë djalli ik nga ajo shtëpi në të cilën lexohet sure Bekare”. Shënon Muslimi 1/539. Pastaj, ajo që e largon shejtanin janë edhe lutjet e mëngjesit dhe të mbrëmjes, para zgjimit, lutjet me rastin e hyrjes dhe daljes nga shtëpia, lutjet e hyrjes dhe daljes nga xhamia, si dhe lutje të tjera të cilat janë të transmetuara, si p.sh. leximi i Ajetul-Kursisë para fjetjes, leximi i dy ajeteve të fundit të sures Bekare, po ashtu, i Dërguari ka thënë: “Kush në ditë thotë 100 herë: [La ilahe il-la-ll-llahu vahdehu la sherike leh, lehul mulku ve lehul hamdu ve huve ala kul-li shejin kadir]”. “Nuk ka hyjni që meriton të adhurohet pos Allahut, të Vetëm e i pa rival. Atij I takon Sundimi dhe Lavdërimi dhe Ai është i Gjithëfuqishëm mbi çdo gjë.”, do të jetë i mbrojtur prej shejtanit tërë ditën.” Po ashtu, e cekëm se edhe ezani e largon shejtanin."
      }
    ]
  },
  {
    "id": 47,
    "categoryId": "mirësjellja",
    "title": "Duaja kur të ndodhë diçka e papëlqyer",
    "duas": [
      {
        "id": 138,
        "ar": "قَدَّرَ اللَّهُ وَما شـاءَ فَعَـل",
        "sq": "Allahu e ka caktuar dhe Ai bën çka të dëshiroj.",
        "transliteration": "Kaderull-llahi ve ma sha’e feale",
        "count": 1,
        "reference": "“Besimtari i fortë është më i mirë dhe më i dashur tek Allahu se sa besimtari i dobët. Nxito në ato që ke dobi, kërko ndihmë nga Allahu, mos u dobëso dhe nëse të godet ndonjë sprovë, mos thuaj sikur të kisha vepruar kështu apo ashtu, por thuaj: Kaderull-llahi ve ma sha’e feale.” (Allahu e ka caktuar atë dhe Ai bën çka të dëshiroj).” Muslimi 4/2052."
      },
      {
        "id": 224,
        "ar": "رَبِّ الْمَلاَئِكَةِ وَالرُّوحِ",
        "sq": "Zoti i Melaikeve dhe i Xhibrilit.",
        "transliteration": "Rabbil-Melaiketi ver-Ruh",
        "count": 1,
        "reference": "Nesaiu 3/244, Darekutni dhe të tjerë; shtojca në mes të kllapave është e Darekutnit 2/31. Senedi i këtij hadithi është i vërtetë. Shih “Zadul-Me’ad” me recensurën e Shuajb dhe Abdulkadër Arnautit 1/337)."
      }
    ]
  },
  {
    "id": 48,
    "categoryId": "sëmundja-dhe-vdekja",
    "title": "Mbi përgëzimin e të posalindurit",
    "duas": [
      {
        "id": 269,
        "ar": "بَارَكَ اللَّهُ لَكَ فِي الْمَوْهُوبِ لَكَ، وَشَكَرْتَ الْوَاهِبَ، وَبَلَغَ أَشُدَّهُ، وَرُزِقْتَ بِرَّهُ\\n\\nKurse ky ia kthen duke thënë:\\nبَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ، وَجَزَاكَ اللَّهُ خَيْراً، وَرَزَقَكَ اللَّهُ مِثْلَهُ، وَأَجْزَلَ ثَوَابَكَ\\n",
        "sq": "Allahu të bekoftë në atë që të ka dhuruar, e Falënderofsh Dhuruesin, e lus Allahun që të rritet dhe të jetë i sjellshëm. Edhe ty të bekoftë Allahu, të shpërbleftë me të mira, të dhuroftë edhe ty një fëmijë sikur ky dhe ta shtoftë shpërblimin.",
        "transliteration": "BarekAll-llahu leke fil-mevhubi leke, ve shekertel-vahibe, ve belega eshuddehu, ve ruzikte birreh BarekAll-llahu leke ve alejke, ve xhezakAll-llahu hajren, ve rezekakAll-llahu mithlehu ve exhzele thevabehu",
        "count": 1,
        "reference": "“Edhkar” fq.349, Neveviu, “Sahih el-Edhkar lin-Nevevi” 2/713, Selim Hilali."
      }
    ]
  },
  {
    "id": 49,
    "categoryId": "sëmundja-dhe-vdekja",
    "title": "Me çka duhet kërkuar mbrojtje për fëmijët",
    "duas": [
      {
        "id": 139,
        "ar": "I Dërguari (a.s) për nipat e tij, Hasanin dhe Husejnin, kërkonte mbrojte duke bërë këtë lutje:\\n أُعِيذُكُمَا بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لاَمَّةٍ",
        "sq": "Lus Allahun që t’ju mbrojë me fjalët e tija të plota nga çdo shejtan, nga çdo dyshim i tij dhe prej çdo syri të keq.",
        "transliteration": "Uidhukuma bi kelimatil-lahit-tammeh, min kul-li shejtanin ve hammeh, ve min kul-li ajnin ve lameh",
        "count": 1,
        "reference": "Buhariu 4/119."
      }
    ]
  },
  {
    "id": 50,
    "categoryId": "sëmundja-dhe-vdekja",
    "title": "Lutja për të sëmurin kur e vizitojmë",
    "duas": [
      {
        "id": 140,
        "ar": "لَا بأْسَ طَهـورٌ إِنْ شـاءَ اللَّهِ",
        "sq": "Nuk ka gjë, pastrim nga mëkatet InshAllah.",
        "transliteration": "La be’se tahurun insha-All-llah",
        "count": 1,
        "reference": "“Fet’hul-Bari” 10/118."
      },
      {
        "id": 141,
        "ar": "أَسْـأَلُ اللَّهَ العَـظيـم، رَبَّ العَـرْشِ العَـظيـم أَنْ يَشْفِيَكَ",
        "sq": "E lus Allahun e Madhërishëm, Zotin e Arshit të madh, që të të shërojë.",
        "transliteration": "Es’elull-llahe el-Adhime Rabbel Arshil Kerimi en jeshfijek. (7 herë)",
        "count": 7,
        "reference": "Shënohet se i Dërguari ka thënë: “Nuk e ka vizituar asnjë njeri një vëlla të vetin musliman të sëmurë, të cilit nuk i ka ardhur vdekja, e i ka thënë shtatë herë:... (hadithin) e që Allahu nuk e ka shëruar.” Shënon Tirmidhiu dhe Ebu Davudi, “Sahih et-Tirmidhi” 2/210 dhe “Sahih el-Xhamiu” 5/180.”"
      }
    ]
  },
  {
    "id": 51,
    "categoryId": "sëmundja-dhe-vdekja",
    "title": "Vlera e vizitës së të sëmurit",
    "duas": [
      {
        "id": 266,
        "ar": "",
        "sq": "I Dërguari (a.s) ka thënë: “Nëse një njeri e viziton vëllain e tij musliman të sëmurë, ecë nëpër rrugën e Xhenetit derisa të ulet, ndërsa kur të ulet do ta përfshijë mëshira e Allahut, nëse e ka vizituar në mëngjes, shtatëdhjetë mijë melaike bëjnë dua për atë person deri në mbrëmje, e nëse e ka vizituar në mbrëmje, shtatëdhjetë mijë melaike bëjnë dua për atë person deri në mëngjes.”",
        "transliteration": "",
        "count": 1,
        "reference": "Tirmidhiu, Ibën Maxheh dhe Ahmedi “Sahih Ibën Maxhe” 1/244 dhe “Sahih et-Tirmidhi” 1/286. Gjithashtu hadithin e ka bërë të vërtetë edhe Ahmed Shakiri."
      }
    ]
  },
  {
    "id": 52,
    "categoryId": "sëmundja-dhe-vdekja",
    "title": "Duaja e të sëmurit në prag të vdekjes",
    "duas": [
      {
        "id": 142,
        "ar": "أللّهُـمَّ اغْفِـرْ لي وَارْحَمْـني وَأَلْحِقْـني بِالرَّفـيقِ الأّعْلـى",
        "sq": "O Allahu im, më falë dhe më mëshiro mua dhe më bashko me shoqëruesin më të Lartë.",
        "transliteration": "All-llahumme-gfir li, ver-hamni, ve elhikni bir-refikil-a’la",
        "count": 1,
        "reference": "Buhariu 7/10 dhe Muslimi 4/1893."
      },
      {
        "id": 143,
        "ar": "لَا إِلَـٰهَ إِلَّا اللّه",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Allahut, vërtet vdekja ka agonitë e saja.",
        "transliteration": "La ilahe il-laAll-llahu inne lil mevti le sekeratin",
        "count": 1,
        "reference": "“Fet’hul-Bari” 8/144."
      },
      {
        "id": 144,
        "ar": "لَا إِلَـٰهَ إِلَّا اللَّهُ وَاللّهُ أَكْبَـر، لَا إِلَـٰهَ إِلَّا اللَّهُ وحْـدَهُ, لَا إِلَـٰهَ إِلَّا اللَّهُ وحْـدَهُ لَا شَريكَ لهُ، لَا إِلَـٰهَ إِلَّا اللَّهُ لهُ المُلكُ ولهُ الحَمْد،\\n\\nلَا إِلَـٰهَ إِلَّا اللَّهُ وَلا حَـوْلَ وَلا قُـوَّةَ إِلاّ بِاللَّهِ",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Allahut; Allahu është më i Madhi; nuk ka hyjni që meriton të adhurohet përveç Allahut të Vetëm; nuk ka hyjni që meriton të adhurohet përveç Allahut Një dhe i pashoq; nuk ka hyjni që meriton të adhurohet përveç Allahut, Atij i takon sundimi dhe Falënderimi; nuk ka hyjni që meriton të adhurohet përveç Allahut dhe nuk ka ndryshim e as fuqi pa ndihmën e Allahut.",
        "transliteration": "La ilahe il-laAll-llahu vAll-llahu Ekber, La ilahe il-laAll-llahu vahdehu, La ilahe il-laAll-llahu vahdehu la sherike leh, La ilahe il-laAll-llahu lehul-Mulku ve lehul-Hamdu, La ilahe il-laAll-llahu ve la havle ve la kuvvete il-la bil-lah",
        "count": 1,
        "reference": "Shënojnë Tirmidhiu dhe Ibën Maxheh dhe hadithin e ka vërtetuar shejh Albani “Sahih Ibën Maxhe” 1/317, “Sahih et-Tirmidhi” 3/153."
      }
    ]
  },
  {
    "id": 53,
    "categoryId": "gëzim-dhe-shqetësim",
    "title": "Të përkujtuarit e shehadetit atij që është në prag të vdekjes",
    "duas": [
      {
        "id": 145,
        "ar": "لَا إِلَـٰهَ إِلَّا اللّه",
        "sq": "I Dërguari ka thënë: “Kush e ka fjalën e tij të fundit: “La Ilahe ilAll-llah”, do të hyjë në xhenet.”",
        "transliteration": "La Ilahe ilAll-llah",
        "count": 1,
        "reference": "Shënon Ebu Davudi 3/190 “Sahih el-Xhamiu” 5/432."
      }
    ]
  },
  {
    "id": 54,
    "categoryId": "sëmundja-dhe-vdekja",
    "title": "Duaja me rastin e fatkeqësisë",
    "duas": [
      {
        "id": 146,
        "ar": "إِنّا لِلَّهِ وَإِنَا إِلَـيْهِ راجِعـون ، اللهُـمِّ اْجُـرْني فِي مُصـيبَتي، وَاخْلُـفْ لي خَيْـراً مِنْـها.",
        "sq": "Ne jemi të Allahut dhe tek Ai kthehemi. O Allahu im, më shpërble për këtë fatkeqësi dhe ma kompenso këtë fatkeqësi me diçka më të mirë se kjo fatkeqësi.",
        "transliteration": "Inna lil-lahi ve inna ilejhi raxhi’un, All-llahumme uxhurni fi musibeti ve ahlif li hajren minha",
        "count": 1,
        "reference": "Muslimi 2/632."
      }
    ]
  },
  {
    "id": 55,
    "categoryId": "sëmundja-dhe-vdekja",
    "title": "Duaja me rastin e vdekjes së ndonjë personi",
    "duas": [
      {
        "id": 147,
        "ar": "اللهُـمِّ اغْفِـرْ لِـ-فلان باسـمه- وَارْفَعْ دَرَجَتَـهُ فِي المَهْـدِييـن ، وَاخْـلُفْـهُ فِي عَقِـبِهِ فِي الغابِـرين، وَاغْفِـرْ لَنـا وَلَـهُ يا رَبَّ العـالَمـين، وَافْسَـحْ لَهُ فِي قَبْـرِهِ وَنَـوِّرْ لَهُ فيه",
        "sq": "O Allahu im, fale filanin (e emëron) dhe ngrite atë në shkallën e të udhëzuarve, zëvendësoje atë me ata që mbesin nga pasardhësit e tij, na i fal mëkatet tona dhe të atij, o Zot i të gjitha botëve, zgjeroja varrin dhe ndriçoja atë.",
        "transliteration": "All-llahumme-gfir li fulani (e emëron), verfa’ derexhetehu fil-mehdijjin veh-luf-hu fi akibihi fil-gabirin, va-gfir lena ve lehu ja Rabbel-alemin, vef-sah lehu fi kabrihi ve nevvir lehu fíhi",
        "count": 1,
        "reference": "Muslimi 2/634."
      }
    ]
  },
  {
    "id": 56,
    "categoryId": "sëmundja-dhe-vdekja",
    "title": "Duaja për të vdekurin kur t’i falet namazi",
    "duas": [
      {
        "id": 148,
        "ar": "اللهُـمِّ اغْفِـرْ لَهُ وَارْحَمْـه ، وَعافِهِ وَاعْفُ عَنْـه ، وَأَكْـرِمْ نُزُلَـه ، وَوَسِّـعْ مُدْخَـلَه ، وَاغْسِلْـهُ بِالْمـاءِ وَالثَّـلْجِ وَالْبَـرَدْ ،\\n\\nوَنَقِّـهِ مِنَ الْخطـايا كَما نَـقّيْتَ الـثَّوْبُ الأَبْيَـضُ مِنَ الدَّنَـسْ ، وَأَبْـدِلْهُ داراً خَـيْراً مِنْ دارِه ، وَأَهْلاً خَـيْراً مِنْ أَهْلِـه ،\\n\\nوَزَوْجَـاً خَـيْراً مِنْ زَوْجِه،  وَأَدْخِـلْهُ الْجَـنَّة ، وَأَعِـذْهُ مِنْ عَذابِ القَـبْر وَعَذابِ النّـار ",
        "sq": "O Allahu im, falja mëkatet dhe mëshiroje, shpëtoje dhe ki ndjesë ndaj tij, bëja vendin e mirë dhe zgjeroja vendin ku do të hyjë, pastroje atë me ujë, borë dhe akull, pastroje atë nga mëkatet, ashtu siç e pastron rrobën e bardhë nga njollat, zëvendësoja shtëpinë me një shtëpi më të mirë, familjen me një familje më të mirë, bashkëshortin (ten) me një më të mirë, fute në Xhenet dhe mbroje prej dënimit të varrit dhe dënimit të zjarrit.",
        "transliteration": "All-llahumme-gfir lehu ver-hamhu ve afihi va’fu anhu, ve ekrim nuzulehu, ve vesi’a mud’halehu, vagsilhu bil-mai veth-thelxhi vel-beredi, ve nekkihi minel-hataja kema nekkajte eth-thevbel-ebjeda mined-denesi, ve ebdilhu daren hajren min darihi ve ehlen hajren min ehlihi ve zevxhen hajren min zevxhihi, ve ed-hilhul-xhenete ve eidhhu min adhabil-kabri ve adhabin-nar",
        "count": 1,
        "reference": "Muslimi 2/663."
      },
      {
        "id": 149,
        "ar": "اللهُـمِّ اغْفِـرْ لِحَيِّـنا وَمَيِّتِـنا وَشـاهِدِنا ، وَغائِبِـنا ، وَصَغيـرِنا وَكَبيـرِنا ، وَذَكَـرِنا وَأُنْثـانا. اللهُـمِّ مَنْ أَحْيَيْـتَهُ مِنّا فَأَحْيِـهِ عَلى الإِسْلام ،وَمَنْ تَوَفَّـيْتَهُ مِنّا فَتَوَفَّـهُ عَلى الإِيـمان ، اللهُـمِّ لَا تَحْـرِمْنـا أَجْـرَه ، وَلا تُضِـلَّنا بَعْـدَه",
        "sq": "O Allahu im, fali të gjallët nga ne dhe të vdekurit, të pranishmit dhe ata në mungesë, të vegjlit dhe të mëdhenjtë, meshkujt dhe femrat. O Allahu im, atij ndër ne që i dhurove jetë udhëzoje të jetojë në Islam, kurse atij që ia merr jetën, merrja duke qenë me besim. O Allahu im, mos na ndalo prej shpërblimit të tij dhe mos na bëj të humbur pas tij.",
        "transliteration": "All-llahumme-gfir li hajjina ve mejjitina ve shahidina ve gaibina ve sagirina ve kebirina ve dhekerina ve unthana. All-llahumme men ahjejtehu minna fe ahjihí alel-Islami ve men tevefejtehu minna fetevefihi alel-imani. All-llahumme la tahrimna exhrehu ve la tudil-lena ba’dehu",
        "count": 1,
        "reference": "Ibën Maxheh 1/480, Ahmedi 2/368 “Sahih Ibën Maxheh” 1/251."
      },
      {
        "id": 150,
        "ar": "الَّلهُـمِّ إِنَّ فُلانَ  بْنَ فُلانٍ فِي ذِمَّـتِك ، وَحَبْـلِ جِـوارِك ، فَقِـهِ مِنْ فِتْـنَةِ الْقَـبْرِ وَعَذابِ النّـار ، وَأَنْتَ أَهْلُ الْوَفـاءِ وَالْـحَقِّ ،\\n\\nفَاغْفِـرْ لَهُ وَارْحَمْـهُ ، إِنَّكَ أَنْتَ الغَـفورُ الـرَّحيم ",
        "sq": "O Allahu im, vërtetë filani, i biri i filanit është në besën Tënde dhe në litarin e fqinjësisë Tënde, Ti je zbatues i premtimit dhe i drejtësisë, andaj fale dhe mëshiroje atë, sepse vërtet Ti je Falës dhe Mëshirues.",
        "transliteration": "All-llahumme inne fulane ibne fulanin fi dhimmetike ve habli xhivarike, fekihi min fitnetil-kabri ve adhabin-nari, ve Ente ehlul-vefai vel-Hakki, Fag-fir lehu ver-hamhu inneke Entel-Gafurur-Rahim",
        "count": 1,
        "reference": "Ibën Maxheh 1/480, Ahmedi 2/368. “Sahih Ibën Maxheh” 1/251"
      },
      {
        "id": 151,
        "ar": "اللهُـمِّ عَبْـدُكَ وَابْنُ أَمَـتِك، احْتـاجَ إِلى رَحْمَـتِك، وَأَنْتَ غَنِـيٌّ عَنْ عَذابِـه، إِنْ كانَ مُحْـسِناً فَزِدْ فِي حَسَـناتِه، وَإِنْ كانَ\\n\\nمُسـيئاً فَتَـجاوَزْ عَنْـه",
        "sq": "O Allahu im, ky robi Yt dhe biri i robëreshës Tënde, ka nevojë për mëshirën Tënde, Ti vërtetë nuk ke nevojë për dënimin e tij. Nëse ka qenë i mirë, shtoja të mirat e tij, e nëse ka qenë jo i mirë, ndihmoi të kalojë nga ai dënim.",
        "transliteration": "All-llahumme abduke ve ibnu emetike ihtaxhe ila rahmetike, ve Ente ganijjun an adhabihi, in kane muhsinen fe zid fi hasenatihi, ve in kane musien fe texhavez anhu",
        "count": 1,
        "reference": "Shënon Hakimi i cili e ka bërë hadithin të vërtet, kurse Dhehebiu e ka pëlqyer 1/359, “Ahkamul-Xhenaiz” të autorit Nasirudin Albani fq.125."
      },
      {
        "id": 225,
        "ar": "",
        "sq": "I Dërguari i Allahut (a.s) ka thënë: “Nuk ka rob i cili nuk bën ndonjë mëkat, pastaj ngritët, merr abdes në formën më të mirë, i falë dy rekate dhe pastaj kërkon falje prej Allahut, Allahu vetëm se ia ka falur atë mëkat”.",
        "transliteration": "",
        "count": 1,
        "reference": "Ebu Davudi 2/86, Tirmidhiu 2/257, po ashtu këtë ha-dith e ka vërtetuar shejh Albani “Sahih Ebu Davud” 1/283."
      }
    ]
  },
  {
    "id": 57,
    "categoryId": "sëmundja-dhe-vdekja",
    "title": "Duaja e xhenazës për fëmijë",
    "duas": [
      {
        "id": 152,
        "ar": "أللَّهُمَّ أَعِذْهُ مِنْ عَذابِ الْقَبْرِ",
        "sq": "O Allahu im, mbroje nga dënimi i varrit.",
        "transliteration": "All-llahumme eidhhu min adhabil-kabr",
        "count": 1,
        "reference": "Seid Ibën Musejjib dhe thotë: “E kam falur pas Ebu Hurejres namazin e xhenazes së një fëmije i cili nuk ka bërë asnjë mëkat kurrë dhe e kam dëgjuar duke thënë: (dhe e ka cekë hadithin)”. Maliku në “Muvetta” 1/288 dhe Ibën Ebi Shejbe në “Musanef” 3/217 dhe Bejhekiu 4/9, isnadi i vërtetë sipas Sh. Arnauti në recensimin e “Sherh es-Sunneh” të Bagaviut 5/357."
      },
      {
        "id": 153,
        "ar": "اللهُـمِّ اجْعَلْـهُ لَنا فَرَطـاً، وَسَلَـفاً وَأَجْـراً",
        "sq": "O Allahu im, jepi përparësi këtij të vdekuri nga ne dhe jepi shpërblim.",
        "transliteration": "All-llahummexh-’alhu lena feretan, ve selefen ve exhren",
        "count": 1,
        "reference": "Shënon Begaviu në veprën e tij “Sherh es-Sunneh” 5/357."
      },
      {
        "id": 226,
        "ar": "",
        "sq": "1. Të kërkuarit mbrojtje nga Allahu i Lartësuar, prej tij. 2. Këndimi i ezanit. 3. Duatë, dhikret dhe leximi i Kuranit.",
        "transliteration": "",
        "count": 100,
        "reference": "Ebu Davudi 1/206, Tirmidhiu “Sahih et-Tirmidhi” 1/77, Mu’minun, 98-99. Buhariu 1/151, Muslimi 1/291. I Dërguari ka thënë: “Mos i bëni shtëpitë tuaja si varre, me të vërtetë djalli ik nga ajo shtëpi në të cilën lexohet sure Bekare”. Shënon Muslimi 1/539. Pastaj, ajo që e largon shejtanin janë edhe lutjet e mëngjesit dhe të mbrëmjes, para zgjimit, lutjet me rastin e hyrjes dhe daljes nga shtëpia, lutjet e hyrjes dhe daljes nga xhamia, si dhe lutje të tjera të cilat janë të transmetuara, si p.sh. leximi i Ajetul-Kursisë para fjetjes, leximi i dy ajeteve të fundit të sures Bekare, po ashtu, i Dërguari ka thënë: “Kush në ditë thotë 100 herë: [La ilahe il-la-ll-llahu vahdehu la sherike leh, lehul mulku ve lehul hamdu ve huve ala kul-li shejin kadir]”. “Nuk ka hyjni që meriton të adhurohet pos Allahut, të Vetëm e i pa rival. Atij I takon Sundimi dhe Lavdërimi dhe Ai është i Gjithëfuqishëm mbi çdo gjë.”, do të jetë i mbrojtur prej shejtanit tërë ditën.” Po ashtu, e cekëm se edhe ezani e largon shejtanin."
      }
    ]
  },
  {
    "id": 58,
    "categoryId": "sëmundja-dhe-vdekja",
    "title": "Duaja me rastin e ngushëllimit",
    "duas": [
      {
        "id": 154,
        "ar": "إِنَّ لِلَّهِ مَا أَخَذ، وَلَهُ مَا أَعْـطـى، وَكُـلُّ شَيءٍ عِنْـدَهُ بِأَجَلٍ مُسَـمَّى.فَلْتَصْـبِر وَلْتَحْـتَسِب",
        "sq": "Me të vërtetë e Allahut është ajo që e ka marrë dhe e Atij është ajo që e dha, si dhe çdo send tek Ai është me kohë të caktuar. Pra, të jeni të durueshëm dhe të llogarisni shpërblim nga Allahu.",
        "transliteration": "Inne lil-lahi ma ehadhe, ve lehu ma a’ëtá, ve kul-lu shej’in indehu bi exhelin musemma, fel tasbir, vel tahtesib",
        "count": 1,
        "reference": "Buhariu 2/80, Muslimi 2/636."
      },
      {
        "id": 227,
        "ar": "بَارَكَ اللَّهُ لَكَ فِي الْمَوْهُوبِ لَكَ، وَشَكَرْتَ الْوَاهِبَ، وَبَلَغَ أَشُدَّهُ، وَرُزِقْتَ بِرَّهُ",
        "sq": "Allahu të bekoftë në atë që të ka dhuruar, e Falënderofsh Dhuruesin, e lus Allahun që të rritet dhe të jetë i sjellshëm.",
        "transliteration": "BarekAll-llahu leke fil-mevhubi leke, ve shekertel-vahibe, ve belega eshuddehu, ve ruzikte birreh",
        "count": 1,
        "reference": "“Edhkar” fq.349, Neveviu, “Sahih el-Edhkar lin-Nevevi” 2/713, Selim Hilali."
      },
      {
        "id": 228,
        "ar": "Kurse ky ia kthen duke thënë: بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ، وَجَزَاكَ اللَّهُ خَيْراً، وَرَزَقَكَ اللَّهُ مِثْلَهُ، وَأَجْزَلَ ثَوَابَكَ",
        "sq": "Edhe ty të bekoftë Allahu, të shpërbleftë me të mira, të dhuroftë edhe ty një fëmijë sikur ky dhe ta shtoftë shpërblimin.",
        "transliteration": "BarekAll-llahu leke ve alejke, ve xhezakAll-llahu hajren, ve rezekakAll-llahu mithlehu ve exhzele thevabehu",
        "count": 1,
        "reference": "“Edhkar” fq.349, Neveviu, “Sahih el-Edhkar lin-Nevevi” 2/713, Selim Hilali."
      }
    ]
  },
  {
    "id": 59,
    "categoryId": "sëmundja-dhe-vdekja",
    "title": "Duaja gjatë lëshimit të vdekurit në varr",
    "duas": [
      {
        "id": 155,
        "ar": "بِسْـمِ اللَّهِ وَعَلـى سُـنَّةِ رَسـولِ اللَّهِ",
        "sq": "Me Emrin e Allahut dhe në bazë të Sunetit të Dërguarit të Allahut.",
        "transliteration": "Bismil-lah ve ala Sunneti Resulil-lah",
        "count": 1,
        "reference": "Ebu Davudi 3/314 me sened të vërtetë. Po ashtu Ah-medi e shënon versionin tjetër me sened të vërtetë: “Bismil-lah ve Ala mil-leti Resulil-lah” (Me emër të Allahut dhe në fenë e të Dërguarit të Allahut)."
      }
    ]
  },
  {
    "id": 60,
    "categoryId": "sëmundja-dhe-vdekja",
    "title": "Duaja pas varrosjes së të vdekurit",
    "duas": [
      {
        "id": 156,
        "ar": "اللَّهُمَّ اغْفِرْ لَهُ الَّلهُمَّ ثَبِّتْهُ",
        "sq": "O Allahu im, fale atë, O Allahu im, forcoje atë.",
        "transliteration": "All-llahummeg-fir lehu All-llahumme thebbit hu",
        "count": 1,
        "reference": "I Dërguari (a.s) pas përfundimit të varrimit ngrihej në këmbë dhe thoshte: “Kërkoni falje për vëllain tuaj dhe luteni Allahun që ta forcojë atë, sepse tani ai merret në pyetje”, Ebu Davudi 3/315, Hakimi e ka autentifikuar, kurse Dhehebiu e ka pëlqyer 1/370."
      },
      {
        "id": 229,
        "ar": "",
        "sq": "I Dërguari (a.s) ka thënë: “Nëse një njeri e viziton vëllain e tij musliman të sëmurë, ecë nëpër rrugën e Xhenetit derisa të ulet, ndërsa kur të ulet do ta përfshijë mëshira e Allahut, nëse e ka vizituar në mëngjes, shtatëdhjetë mijë melaike bëjnë dua për atë person deri në mbrëmje, e nëse e ka vizituar në mbrëmje, shtatëdhjetë mijë melaike bëjnë dua për atë person deri në mëngjes.”",
        "transliteration": "",
        "count": 1,
        "reference": "Tirmidhiu, Ibën Maxheh dhe Ahmedi “Sahih Ibën Maxhe” 1/244 dhe “Sahih et-Tirmidhi” 1/286. Gjithashtu hadithin e ka bërë të vërtetë edhe Ahmed Shakiri."
      }
    ]
  },
  {
    "id": 61,
    "categoryId": "natyra",
    "title": "Duaja gjatë vizitës së varrezave",
    "duas": [
      {
        "id": 157,
        "ar": "السَّلامُ عَلَـيْكُمْ أَهْلَ الدِّيارِ مِنَ المؤْمِنيـنَ وَالْمُسْلِمينَ، وَإِنّا إِنْ شاءَ اللَّهُ بِكُـمْ لاحِقُـونَ،\\n\\n(وَ يَرْحَمُ اللَّهُ الْمُسْتَقْدِمِينَ مِنَّا وَالْمُسْتَأْخِرِينَ) نَسْـاَلُ اللَّهَ لَنَـا وَلَكُـمْ العَـافِيَةَ ",
        "sq": "Shpëtimi qoftë mbi ju banorë të varrezave besimtarë dhe muslimanë, edhe ne, në dashtë Allahu, do t’ju bashkangjitemi, [Allahu i mëshiroftë ata që kanë kaluar prej nesh edhe ata që do të vijnë pas nesh]; e lus Allahun që të na shpëtojë ne dhe ju.",
        "transliteration": "Es-selamu alejkum ehled-dijari minel-mu’minine vel-muslimin, ve inna inshaAll-llahu bikum lahikun, [ve jerhamull-llahul-mustakdimine minna vel-muste’hirin] Es’elull-llahe lena ve lekumul-áfijeh",
        "count": 1,
        "reference": "Muslimi 2/671 dhe Ibën Maxheh 1/494, versioni i Bu-rejdes (r.a) , ndërsa në kllapa shënohet shtesa e Muslimit nga hadithi i Aishes (r.a) , 2/671."
      }
    ]
  },
  {
    "id": 62,
    "categoryId": "natyra",
    "title": "Duaja kur frynë era",
    "duas": [
      {
        "id": 158,
        "ar": "اللَّهُمَّ  إِنَّـي أَسْـأَلُـكَ خَيْـرَها، وَأَعـوذُ بِكَ مِنْ شَـرِّها",
        "sq": "O Allahu im, kërkoj nga Ti të mirën e saj dhe kërkoj që të më mbrosh nga e keqja e saj.",
        "transliteration": "All-llahumme inni es’eluke hajreha ve eudhu bike min sherriha",
        "count": 1,
        "reference": "Ebu Davudi 4/326 dhe Ibën Maxheh 2/1228 “Sahih Ibën Maxheh” 2/305."
      },
      {
        "id": 159,
        "ar": "اللَّهُمَّ  إِنَّـي أَسْـأَلُـكَ خَيْـرَها، وَخَيْـرَ مَا فيهـا، وَخَيْـرَ مَا اُرْسِلَـتْ بِه، وَأَعـوذُ بِكَ مِنْ شَـرِّها، وَشَـرِّ مَا فيهـا، وَشَـرِّ مَا\\n\\nاُرْسِلَـتْ بِه",
        "sq": "O Allahu im, kërkoj nga Ti të mirën e saj, të mirën që ka në të, të mirën që është dërguar me të; më mbroj prej të keqes së saj, të keqes që ka në të dhe prej të keqes që është dërguar me të.",
        "transliteration": "All-llahumme inni es’eluke hajreha ve hajre ma fiha, ve hajre ma ursilet bihi, ve eudhu bike min sherriha ve sherri ma fiha, ve sherri ma ursilet bihi",
        "count": 1,
        "reference": "Muslimi 2/616, Buhariu 4/76."
      }
    ]
  },
  {
    "id": 63,
    "categoryId": "natyra",
    "title": "Duaja kur të murmuron",
    "duas": [
      {
        "id": 160,
        "ar": "سُبْـحانَ الّذي يُسَبِّـحُ الـرَّعْدُ بِحَمْـدِهِ، وَالملائِكـةُ مِنْ خيـفَته",
        "sq": "I Lartmadhëruar qoftë Allahu, të Cilin e madhëron murmurima me Falënderimin e Tij, e edhe melaiket e madhërojnë, prej frikës ndaj Tij.",
        "transliteration": "Subhanel-ledhi jusebbihur-ra’du bi hamdihi vel melaiketu min hifetihi",
        "count": 1,
        "reference": "Shënohet se Abdullah Ibën Zubejri kur e dëgjonte murmurimën e ndërpriste bisedën dhe thoshte... (ha-dithin), Maliku në “Muveta” 2/992, Albani thotë se senedi është i vërtetë (mevkuf)."
      }
    ]
  },
  {
    "id": 64,
    "categoryId": "natyra",
    "title": "Duatë e shiut",
    "duas": [
      {
        "id": 161,
        "ar": "اللّهُمَّ اَسْقِـنا غَيْـثاً مُغيـثاً مَريئاً مُريـعاً، نافِعـاً غَيْـرَ ضَّارٌ، عاجِـلاً غَـيْرَ آجِلٍ",
        "sq": "O Allahu im, të lutem na lësho shi të këndshëm, freskues, të dobishëm e jo të dëmshëm, të menjëhershëm e jo të vonuar.",
        "transliteration": "All-llahumme eskina gajthen mugithen meri’en meri’an nafi’an gajre darrin axhilen gajre axhilin",
        "count": 1,
        "reference": "Ebu Davudi 1/303, të cilën Albani e ka bërë të vërtetë në librin “Sahih Ebu Davud” 1/216."
      },
      {
        "id": 162,
        "ar": "اللّهُمَّ أغِثْنـَا، اللّهُمَّ أغِثْنـَا، اللّهُمَّ أغِثْنـَا ",
        "sq": "O Allahu im na lësho shi, O Allahu im na lësho shi, O Allahu im na lësho shi.",
        "transliteration": "All-llahumme egithna, Allahumme egithna, Allahumme egithna",
        "count": 1,
        "reference": "Buhariu 1/224, Muslimi 2/613."
      },
      {
        "id": 163,
        "ar": "اللّهُمَّ اسْقِ عِبادَكَ وَبَهـائِمَك، وَانْشُـرْ رَحْمَـتَكَ وَأَحْيِي بَلَـدَكَ المَيِّـت",
        "sq": "O Allahu im, begatoji me ujë robërit e Tu dhe gjallesat Tua, shpërndaje mëshirën Tënde dhe gjallëroje këtë vendin Tënd të vdekur.",
        "transliteration": "All-llahumme iski ibádek, ve behaimek ven-shur rahmetek, ve Ahji beledekel-mejjit",
        "count": 1,
        "reference": "Ebu Davudi 1/305, Albani e ka bërë këtë hadith të mirë (hasen). Shih “Sahih Ebu Davud” 1/218."
      }
    ]
  },
  {
    "id": 65,
    "categoryId": "natyra",
    "title": "Duaja kur bie shi",
    "duas": [
      {
        "id": 164,
        "ar": "اللّهُمَّ صَيِّـباً نافِـعاً",
        "sq": "O Allahu im bëje këtë shi të begatshëm, e të dobishëm.",
        "transliteration": "All-llahumme sajjiben nafi’an",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 2/518."
      }
    ]
  },
  {
    "id": 66,
    "categoryId": "natyra",
    "title": "Duaja pasi të bie shiu",
    "duas": [
      {
        "id": 165,
        "ar": "مُطِـرْنا بِفَضْـلِ اللَّهِ وَرَحْمَـتِه",
        "sq": "U furnizuam me shi, me mirësinë e Allahut dhe mëshirën e Tij.",
        "transliteration": "Mutirna bi fadlil-lahi ve rahmetihi",
        "count": 1,
        "reference": "Buhariu 1/205, Muslimi 1/83."
      },
      {
        "id": 230,
        "ar": "Mirë është të thotë edhe:\\nاَللَّهُمَّ اجْعَلْهُ فَرَطاً وَذُخْراً لِوَالِدَيْهِ، وَشَفِيعاً مُجَاباً، اَللَّهُمَّ ثَقِّلْ بِهِ مَوَازِينَهُمَا، وَأَعْظِمْ بِهِ أُجورَهُمَا، وَأَلْحِقْهُ بِصَالِحِ الْمُؤْمِنِينَ، وَاجْعَلْهُ فِي كَفَالَةِ إِبْرَاهِيمَ، وَقِهِ بِرَحْمَتِكَ عَذَابَ الْجَحِيمِ، وَأَبْدِلْهُ دَاراً خَيْراً مِنْ دَارِهِ، وَأَهْلاً خَيْراً مِنْ أَهْلِهِ، اَللَّهُمَّ اغْفِرْ لِأَسْلاَفِنَا، وَأَفْرَاطِنَا، وَمَنْ سَبَقَنَا بِالْإِيمَانِ\\n",
        "sq": "O Allahu im, bëje këtë fëmijë prijës dhe shpërblim për prindërit e tij, si dhe bëje prej atyre të cilëve u pranohet ndërmjetësimi. O Allahu im, rëndoje peshojën e tyre me të dhe shtojua shpërblimet e tyre dhe bashkoje këtë fëmijë me besimtarët e mirë. Bëje që të jetë nën kujdesin e Ibrahimit, mbroje atë me mëshirën Tënde prej dënimit të zjarrit, zëvendësoja shtëpinë me një shtëpi më të mirë dhe familjen me një familje më të mirë. O Allahu im, fali të parët dhe prijësit tanë dhe të gjithë ata të cilët kanë kaluar para nesh me besim.",
        "transliteration": "All-llahummexh-alhu feretan ve dhuhren li validejhi, ve shefi’an muxhaben. All-llahumme thekkil bihi mevazinehuma, ve e’ëdhim bihi uxhurehuma, ve elhikhu bi salihil-mu’minín, vexh’alhu fi kefaleti Ibrahim, vekihi bi rahmetike adhabel-xhehim, ve ebdilhu daren hajren min darihi, ve ehlen hajren min ehlihi, All-llahumme-gfir li eslafina, ve efratina, ve men sebekana bil-íman",
        "count": 1,
        "reference": "“Mugni” Ibën Kudame 3/416, “Mësime të rëndësishme për Umetin në përgjithësi” të Ibën Bazit fq.15."
      }
    ]
  },
  {
    "id": 67,
    "categoryId": "natyra",
    "title": "Duaja kundër vërshimit",
    "duas": [
      {
        "id": 166,
        "ar": "اللّهُمَّ حَوالَيْنا وَلا عَلَيْـنا، اللّهُمَّ عَلى الآكـامِ وَالظِّـراب، وَبُطـونِ الأوْدِية، وَمَنـابِتِ الشَّجـر ",
        "sq": "O Allahu im, rreth nesh e jo mbi ne. O Allahu im, ktheje kodrave dhe kodrinave, pyjeve dhe luginave.",
        "transliteration": "All-llahumme havalejna la alejna. All-llahumme alel-ákami vedh-dhirabi, ve butunil-evdijeti, ve menabitish-shexheri",
        "count": 1,
        "reference": "Buhariu 1/244, Muslimi 2/614."
      },
      {
        "id": 231,
        "ar": "Gjithashtu mund të thuhet:\\nأَعْظَمَ اللَّهُ أَجْرَكَ، وَأَحْسَنَ عَزَاءَكَ، وَغَفَرَ لِمَيِّتِكَ\\n",
        "sq": "Allahu ta zmadhoftë shpërblimin dhe ta shtoftë durimin dhe e faltë këtë të vdekur.",
        "transliteration": "A’ëdhemAll-llahu exhrek, ve Ahsene azaek ve gafere limejjitik",
        "count": 1,
        "reference": "Shënon Imam Neveviu në librin “Edhkar” fq.126."
      }
    ]
  },
  {
    "id": 68,
    "categoryId": "ushqim-dhe-pije",
    "title": "Duaja kur të shihet hëna e re",
    "duas": [
      {
        "id": 167,
        "ar": "اللَّهُ أَكْـبَر، اللّهُمَّ أَهِلَّـهُ عَلَيْـنا بِالأمْـنِ وَالإيمـان، والسَّلامَـةِ والإسْلامِ، وَالتَّـوْفيـقِ لِما تُحِـبُّ وَتَـرْضَـى، رَبُّنـا وَرَبُّكَ اللَّهُ  ",
        "sq": "Allahu është më i Madhi. O Allahu im, na mundëso që këtë hënë të re, ta presim në qetësi dhe besim, me shpëtim dhe me nënshtrim, me suksese në atë që Ti, o Zoti ynë, dëshiron dhe je i kënaqur me të; oj Hënë, Zoti ynë dhe i yti është Allahu.",
        "transliteration": "All-llahu Ekber, All-llahumme ehil-lehu alejna bil-emni vel-imani, ves-selameti vel-Islami, vet-tevfiki lima tuhibbu Rabbena ve terda, Rabbuna ve Rabbuke All-llah",
        "count": 1,
        "reference": "Tirmidhiu 5/504 dhe Ed-Daremiu 1/336, “Sahih et-Tirmidhi” 3/157."
      }
    ]
  },
  {
    "id": 69,
    "categoryId": "ushqim-dhe-pije",
    "title": "Duaja e agjëruesit kur të bëjë iftar",
    "duas": [
      {
        "id": 168,
        "ar": "ذَهَـبَ الظَّمَـأُ، وَابْتَلَّـتِ العُـروق، وَثَبَـتَ الأجْـرُ إِنْ شـاءَ اللَّهِ",
        "sq": "Kaloi etja, u lagën venat dhe u realizua shpërblimi inshAllah.",
        "transliteration": "Dhehebe edh-dhameu, veb-tel-letil-uruku ve thebetel-exhru inshaAll-llah",
        "count": 1,
        "reference": "Ebu Davudi 2/306 dhe të tjerë. “Sahih el-Xhamiu” 4/209."
      },
      {
        "id": 169,
        "ar": "اللَّهُمَّ  إِنَّـي أَسْـأَلُـكَ بِرَحْمَـتِكَ الّتي وَسِـعَت كُلَّ شيء، أَنْ تَغْـفِرَ لِي",
        "sq": "O Allahu im, të lutem me mëshirën Tënde, e cila ka përfshirë çdo gjë, të m’i falësh mëkatet.",
        "transliteration": "All-llahumme inni es’eluke bi rahmetikel-leti vesi’at kul-le shej’in en tagfire li",
        "count": 1,
        "reference": "Ibën Maxheh 1/557, prej lutjeve të Abdullah ibën Ameit, Hafidh ibën Haxheri e ka bërë të mirë “Sherh e-Edhkar” 4/342."
      }
    ]
  },
  {
    "id": 70,
    "categoryId": "ushqim-dhe-pije",
    "title": "Duaja para ushqimit",
    "duas": [
      {
        "id": 170,
        "ar": "بِسْمِ اللَّهِ",
        "sq": "Me emër të Allahut.",
        "transliteration": "Bismil-lah",
        "count": 1,
        "reference": "Shënon Ebu Davudi 3/347, Tirmidhiu 4/288, “Sahih et-Tirmidhi” 2/167."
      },
      {
        "id": 171,
        "ar": "Atij të cilit Allahu i Madhërishëm ia mundëson të ushqehet, le të thotë:\\nاَللَّهُمَّ بَارِكْ لَنَا فِيهِ وَأَطْعِمْنَا خَيْراً مِنْهُ \\n",
        "sq": "O Allahu im, na beko në këtë ushqim dhe na furnizo me ushqim më të mirë se ky.",
        "transliteration": "All-llahumme barik lena fihi ve et’imna hajren minhu",
        "count": 1,
        "reference": "Shënon Tirmidhiu 5/506, “Sahih et-Tirmidhi” 3/158."
      },
      {
        "id": 172,
        "ar": "E atij që Allahu ia mundëson që të pijë qumësht, le të thotë:\\nاَللَّهُمَّ بَارِكْ لَنَا فِيهِ وَزِدْنَا مِنْهُ\\n",
        "sq": "O Allahu im, na beko në këtë dhe na shto nga ky.",
        "transliteration": "All-llahumme barik lena fihi ve zidna minhu",
        "count": 1,
        "reference": "Shënon Tirmidhiu 5/506, “Sahih et-Tirmidhi” 3/158."
      },
      {
        "id": 232,
        "ar": "E nëse harron në fillim të ushqimit, atëherë le të thotë:\\nبسمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ",
        "sq": "Me emrin e Allahut në fillim dhe në mbarim.",
        "transliteration": "Bismil-lahi fi evvelihi ve Ahirihi",
        "count": 1,
        "reference": "Shënon Ebu Davudi 3/347, Tirmidhiu 4/288, “Sahih et-Tirmidhi” 2/167."
      }
    ]
  },
  {
    "id": 71,
    "categoryId": "ushqim-dhe-pije",
    "title": "Duaja pas ushqimit",
    "duas": [
      {
        "id": 173,
        "ar": "الْحَمْـدُ لِلَّهِ الَّذي أَطْعَمَنـي هـذا وَرَزَقَنـيهِ مِنْ غَـيْرِ حَوْلٍ مِنِّي وَلا قُوَّة",
        "sq": "Falënderimi i takon Allahut i cili ma mundësoi ta ha këtë ushqim dhe më furnizoi pa mundin dhe fuqinë time.",
        "transliteration": "Elhamdulil-lahil-ledhi et’ameni hadha, ve rezekanihi min gajri havlin minni ve la kuvvetin",
        "count": 1,
        "reference": "Ebu Davudi, Tirmidhiu dhe Ibën Maxheh, “Sahih et-Tirmidhi” 3/159."
      },
      {
        "id": 174,
        "ar": "الْحَمْـدُ لِلَّهِ حَمْـداً كَثـيراً طَيِّـباً مُبـارَكاً فيه، [غَيْرَ مَكْفِيٍّ] وَلا مُوَدَّعٍ وَلا مُسْتَغْـنىً عَنْـهُ رَبُّـنا ",
        "sq": "E Falënderojmë Allahun me Falënderime të shumta, të mira dhe të bekuara [të cilat janë të pamjaftueshme], Falënderime të pandërprera, për të cilat kemi nevojë, o Zoti ynë.",
        "transliteration": "Elhamdulil-lahi hamden kethiren tajjiben mubareken fihi, gajre [mekfijjin ve la] muvedde’in, ve la mustagnen anhu Rabbena",
        "count": 1,
        "reference": "Buhariu 6/214 dhe Tirmidhiu 5/507."
      }
    ]
  },
  {
    "id": 72,
    "categoryId": "ushqim-dhe-pije",
    "title": "Duaja e mysafirit për nikoqirin",
    "duas": [
      {
        "id": 175,
        "ar": "اللَّهُمَّ بارِكْ لَهُمْ فيما رَزَقْـتَهُم، وَاغْفِـرْ لَهُـمْ وَارْحَمْهُمْ",
        "sq": "O Allahu im bekoji në atë që i ke furnizuar, falu mëkatet dhe mëshiroji ata.",
        "transliteration": "All-llahumme barik lehum fi ma rezaktehum vagfir lehum verhamhum",
        "count": 1,
        "reference": "Muslimi 3/1615."
      }
    ]
  },
  {
    "id": 73,
    "categoryId": "ushqim-dhe-pije",
    "title": "Duaja për atë që të jep ushqim apo ujë",
    "duas": [
      {
        "id": 176,
        "ar": "اللَّهُمَّ أَطْعِمْ مَن أَطْعَمَني، وَاسْقِ مَن سَقَانِي",
        "sq": "O Allahu im, ushqeje atë që më ushqeu mua dhe jepi të pijë atij që më dha të pi mua.",
        "transliteration": "All-llahumme et’im men et’ameni ve-ski men sekani",
        "count": 1,
        "reference": "Muslimi 3/126."
      }
    ]
  },
  {
    "id": 74,
    "categoryId": "ushqim-dhe-pije",
    "title": "Duaja kur të bësh iftar tek ndonjë familje",
    "duas": [
      {
        "id": 177,
        "ar": "أَفْطَـرَ عِنْدَكُم الصّـائِمونَ وَأَكَلَ طَعامَـكُمُ الأبْـرار، وَصَلَّـتْ عَلَـيْكُمُ الملائِكَـة",
        "sq": "Bëfshin iftar tek ju agjëruesit, ushqimin tuaj e ngrënshin njerëzit e mirë dhe për ju bëfshin lutje melaiket.",
        "transliteration": "Eftare indekumus-saimun, ve ekele ta’amukumul-ebrar, ve sal-let alejkumul-melaike",
        "count": 1,
        "reference": "Ebu Davudi 3/367, Ibën Maxheh 1/556 dhe Nesaiu në “Amel el-Jevmi ve Lejleh” #296-298, i cili thotë se i Dërguari i Allahut e ka thënë këtë kur ka ngrënë iftar te ndonjë familje. Këtë hadith e ka bërë të vërtetë Albani në “Sahih Ebu Davud” 2/730."
      }
    ]
  },
  {
    "id": 75,
    "categoryId": "mirësjellja",
    "title": "Duaja e agjëruesit kur prezenton në ushqim dhe nuk ha",
    "duas": [
      {
        "id": 270,
        "ar": "",
        "sq": "I Dërguari i Allahut (a.s) ka thënë: “Kur të ftohet ndokush prej jush le t’i përgjigjet ftesës. Nëse është agjërues, le të lutet për atë person, e nëse nuk është agjërues, le të hajë.”",
        "transliteration": "",
        "count": 1,
        "reference": "Muslimi 2/1054."
      }
    ]
  },
  {
    "id": 76,
    "categoryId": "natyra",
    "title": "Çfarë duhet të thotë agjëruesi kur ta ofendojë ndokush",
    "duas": [
      {
        "id": 178,
        "ar": "إنِّي صَائِمٌ,  إنِّي صَائِمٌ",
        "sq": "Unë jam agjërues, unë jam agjërues.",
        "transliteration": "Inni Saim, Inni Saim",
        "count": 1,
        "reference": "Buhariu me “Fet’h” 4/103, Muslimi 2/806."
      }
    ]
  },
  {
    "id": 77,
    "categoryId": "mirësjellja",
    "title": "Duaja kur të shohim pemën e posapjekur",
    "duas": [
      {
        "id": 179,
        "ar": "اللَّهُمَّ بارِكْ لَنا فِي ثَمَـرِنا، وَبارِكْ لَنا فِي مَدينَتِنـا، وَبارِكْ لَنا فِي صَاعِنـَا، وَبارِكْ لَنا فِي مُدِّنا",
        "sq": "O Allahu im, na i beko frytet tona, na e beko qytetin tonë, na i beko njësitë matëse tona (sain dhe muddin) me të cilat matim.",
        "transliteration": "All-llahumme barik lena fi themerina, ve barik lena fi medinetina, ve barik lena fi si’ina, ve barik lena fi muddina",
        "count": 1,
        "reference": "Muslimi 2/1000."
      }
    ]
  },
  {
    "id": 78,
    "categoryId": "mirësjellja",
    "title": "Duaja e teshtitjes",
    "duas": [
      {
        "id": 180,
        "ar": "يَهْـديكُـمُ اللَّهُ وَيُصْـلِحُ بالَـكُم",
        "sq": "Falënderimi i qoftë Allahut. Allahu të Mëshiroftë. Allahu ju udhëzoftë dhe ua përmirësoftë gjendjen tuaj.",
        "transliteration": "Elhamdulil-lah JerhamukAll-llah Jehdikumull-llahu ve juslih balekum",
        "count": 1,
        "reference": "Buhariu 7/125."
      }
    ]
  },
  {
    "id": 79,
    "categoryId": "shtëpia-dhe-familja",
    "title": "Çfarë u duhet thënë jobesimtarëve kur të teshtisin",
    "duas": [
      {
        "id": 181,
        "ar": "يَهْـديكُـمُ اللَّهُ وَيُصْـلِحُ بالَـكُم",
        "sq": "Allahu ju udhëzoftë dhe ua përmirësoftë gjendjen tuaj.",
        "transliteration": "Jehdikumull-llahu ve juslih balekum",
        "count": 1,
        "reference": "Tirmidhiu 5/82, Ahmedi 4/400, Ebu Davud 4/308, “Sahih et-Tirmidhi” 2/354."
      }
    ]
  },
  {
    "id": 80,
    "categoryId": "mirësjellja",
    "title": "Duaja për të porsamartuarit",
    "duas": [
      {
        "id": 182,
        "ar": "بارَكَ اللَّهُ لَك، وَبارَكَ عَلَـيْك، وَجَمَعَ بَيْـنَكُما فِي خَـيْر",
        "sq": "Allahu të bekoftë ty dhe pasardhësit e tu, si dhe ju bashkoftë ju të dy në të mirë.",
        "transliteration": "BarekAll-llahu leke, ve bareke alejke, ve xheme’a bejnekuma, fi hajrin",
        "count": 1,
        "reference": "Transmetojnë autorët e katër suneneve përveç Nesaiut “Sahih et-Tirmidhi” 1/316."
      }
    ]
  },
  {
    "id": 81,
    "categoryId": "shtëpia-dhe-familja",
    "title": "Duaja gjatë martesës dhe blerjes së kafshës",
    "duas": [
      {
        "id": 183,
        "ar": "Transmetohet se i Dërguari i Allahut (a.s) ka thënë: “Kur dikush prej juve martohet ose blenë ndonjë robëreshë, le të thotë:\\nاَللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا، وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا، وَشَرِّ مَا جَبَلْتَهَا عَلَيْهِ\\n",
        "sq": "“O Allahu im, kërkoj prej Teje të më dhurosh të mirën e saj dhe të mirën që e ke bërë natyrë të saj, si dhe të lutem të më mbrosh nga e keqja e saj dhe e keqja që e ke bërë natyrë të saj.”",
        "transliteration": "All-llahumme inni es’eluke hajreha ve hajre ma xhebelteha alejhi, ve eudhu bike min sherriha ve sherri ma xhebelteha alejhi",
        "count": 1,
        "reference": "Po ashtu, nëse dikush blen ndonjë kafshë le ta merr për gungën më të lartë dhe le ta thotë këtë dua. Ebu Davudi 2/248, Ibën Maxheh 1/617, “Sahih Ibën Maxheh” 1/324."
      }
    ]
  },
  {
    "id": 82,
    "categoryId": "mirësjellja",
    "title": "Duaja para se t’i afrohesh bashkëshortes",
    "duas": [
      {
        "id": 184,
        "ar": "بِسْمِ اللَّهِ اللَّهُمَّ جَنِّبْنا الشَّيْـطانَ، وَجَنِّبِ الشَّـيْطانَ مَا رَزَقْـتَنا",
        "sq": "Me emrin e Allahut, O Allahu im, na e largo djallin prej neve dhe prej asaj që do të na furnizosh me të.",
        "transliteration": "Bismil-lah, All-llahumme xhennibnesh-shejtane, ve xhennibish-shejtane ma rezaktena",
        "count": 1,
        "reference": "Buhariu 6/141 Muslimi 2/1028."
      }
    ]
  },
  {
    "id": 83,
    "categoryId": "mirësjellja",
    "title": "Duaja e hidhërimit",
    "duas": [
      {
        "id": 185,
        "ar": "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطانِ الرَّجِيْمِ",
        "sq": "Kërkoj mbrojtjen e Allahut prej djallit të mallkuar.",
        "transliteration": "Eudhu bil-lahi minesh-shejtanir-raxhim",
        "count": 1,
        "reference": "Buhariu 7/99 dhe Muslimi 4/2015."
      },
      {
        "id": 233,
        "ar": "",
        "sq": "I Dërguari i Allahut (a.s) ka thënë: “Kur të ftohet ndokush prej jush le t’i përgjigjet ftesës. Nëse është agjërues, le të lutet për atë person, e nëse nuk është agjërues, le të hajë.”",
        "transliteration": "",
        "count": 1,
        "reference": "Muslimi 2/1054."
      }
    ]
  },
  {
    "id": 84,
    "categoryId": "mirësjellja",
    "title": "Duaja kur të shohim ndokënd me të meta",
    "duas": [
      {
        "id": 186,
        "ar": "الْحَمْـدُ لِلَّهِ الّذي عافاني مِمّا ابْتَـلاكَ بِهِ، وَفَضَّلَـني عَلى كَثيـرٍ مِمَّنْ خَلَـقَ تَفْضـيلا",
        "sq": "Falënderimi i qoftë Allahut i cili më ka mbrojtur nga kjo me të cilën të ka sprovuar ty dhe më ka begatuar nga shumë krijesat e Tij.",
        "transliteration": "Elhamdulil-lahil-ledhi afani mimmabtelake bihi ve feddaleni ala kethirin mimmen haleka tefdila",
        "count": 1,
        "reference": "Tirmidhiu 5/493, 5/494, “Sahih et-Tirmidhi” 3/153”."
      }
    ]
  },
  {
    "id": 85,
    "categoryId": "mirësjellja",
    "title": "Çfarë duhet thënë në tubim",
    "duas": [
      {
        "id": 187,
        "ar": "Shënohet nga Ibën Omeri (r.a) i cili thotë: “I Dërguari (a.s), para se të ngrihej nga një tubim numëronte duke thënë 100 herë:\\nرَبِّ اغْفِرْ لِي، وَتُبْ عَلَيَّ، إِنَّكَ أَنْتَ التَّوَّابُ الغَفُورُ\\n",
        "sq": "O Zoti im, më fal dhe ma prano pendimin, sepse Ti je Pranues i faljes dhe i pendimit.",
        "transliteration": "Rabbi-gfir li ve tub alejje, inneke Ente et-Tevvabul-Gafur",
        "count": 1,
        "reference": "Tirmidhiu dhe të tjerë, “Sahih et-Tirmidhi” 3/153 dhe “Sahih Ibën Maxheh” 2/321."
      }
    ]
  },
  {
    "id": 86,
    "categoryId": "mirësjellja",
    "title": "Duaja kur të përfundoj tubimi",
    "duas": [
      {
        "id": 188,
        "ar": "سُبْحـانَكَ اللَّهُمَّ وَبِحَمدِك، أَشْهَـدُ أَنْ لَا إِلهَ إِلاّ أَنْتَ أَسْتَغْفِرُكَ وَأَتوبُ إِلَـيْك",
        "sq": "I Lartësuar qofsh, o Allahu im, Ty të takon Falënderimi; dëshmoj se nuk ka të adhuruar tjetër përveç Teje; kërkoj faljen Tënde dhe tek Ti pendohem.",
        "transliteration": "Subhaneke All-llahumme ve biham-dike, Eshhedu en la Ilahe il-la Ente estagfiruke ve etubu ilejke",
        "count": 1,
        "reference": "Autorët e katër Suneneve, “Sahih et-Tirmidhi” 3/153, është vërtetuar nga Aishja e cila ka thënë: “S’është ulur i Dërguari i Allahut në asnjë tubim apo s’ka lexuar Kuran apo s’ka falur namaz pa e përfunduar me këto fjalë...” (Hadithi). Nesaiu në “Amel el-Jevmi ve Lejleh” #308 dhe Ahmedi 6/77, sahih sipas dr. Faruk Hamadeh në recensimin e “Amel el-Jevmi ve Lejleh” të Nesaiut fq.273."
      }
    ]
  },
  {
    "id": 87,
    "categoryId": "mirësjellja",
    "title": "Duaja për atë i cili të thotë",
    "duas": [
      {
        "id": 189,
        "ar": "Duaja për atë i cili të thotë: \\n غَفَــرَ اللَّهُ لَكَ\\nGaferAll-llahu leke\\n“Allahu t’i faltë mëkatet.”\\n\\nوَلَكَ\\n",
        "sq": "Edhe ty.",
        "transliteration": "Ve Leke",
        "count": 1,
        "reference": "Shënojnë Ahmedi 5/82 dhe Nesaiu në “Amel el-Jevmi ve Lejleh” fq.218, nr. 421 me recensimin e dr. Faruk Hamades."
      }
    ]
  },
  {
    "id": 88,
    "categoryId": "falënderimi-ndaj-Allahut",
    "title": "Duaja për atë i cili ta bën ndonjë të mirë",
    "duas": [
      {
        "id": 190,
        "ar": "جَزاكَ اللَّهُ خَـيْراً",
        "sq": "Allahu të shpërbleftë me të mira.",
        "transliteration": "XhezakAll-llahu hajren",
        "count": 1,
        "reference": "Tirmidhiu nr. 2035, “Sahih el-Xhamiu” #6244 dhe “Sahih et-Tirmidhi” 2/200."
      }
    ]
  },
  {
    "id": 89,
    "categoryId": "mirësjellja",
    "title": "Dhikri me të cilin allahu të mbron prej dexhallit",
    "duas": [
      {
        "id": 271,
        "ar": "",
        "sq": "Thotë i Dërguari (a.s) : “Kush i mëson përmendësh dhjetë ajetet e para të sures “Kehf”, është i mbrojtur prej dexhallit.” Si dhe të kërkuarit mbrojtje nga Allahu i Madhëruar nga sprova e dexhallit pas teshehudit të fundit në çdo namaz.",
        "transliteration": "",
        "count": 1,
        "reference": "Shënon Muslimi 1/555 dhe në transmetimin tjetër: “Dhjetë Ajetet e fundit të sures Kehf”, 1/556. Shih hadithet nën fusnotën: 75 dhe 76."
      }
    ]
  },
  {
    "id": 90,
    "categoryId": "mirësjellja",
    "title": "Duaja për atë i cili të thotë",
    "duas": [
      {
        "id": 191,
        "ar": "Duaja për atë i cili të thotë\\nإِنِّي أُحِبُّكَ فِي اللَّهِ\\nInni uhibbuke fil-lah\\n“Unë të dua për hir të Allahut.”\\n\\nأَحَبَّكَ الَّذِي أَحْبَبْتَنِي لَهُ\\n\\n",
        "sq": "Të dashtë Ai për të cilin më deshe.",
        "transliteration": "Ehabbekel-ledhi ahbebteni leh",
        "count": 1,
        "reference": "Ebu Davudi 4/333, i mirë (hasen) sipas shejh Albanit, shih “Sahih Sunen Ebi Davud” 3/965."
      }
    ]
  },
  {
    "id": 91,
    "categoryId": "mirësjellja",
    "title": "Duaja për atë i cili të ofron pasuri",
    "duas": [
      {
        "id": 192,
        "ar": "بارَكَ اللَّهُ لَكَ فِي أَهْلِكَ وَمالِك، إِنَّما جَـزاءُ السَّلَفِ الْحَمْدُ والأَدَاء",
        "sq": "Të bekoftë Allahu në familjen dhe pasurinë Tënde.",
        "transliteration": "BarekAll-llahu leke fi Ehlike ve malike",
        "count": 1,
        "reference": "Buhariu me “Fet’h” 4/88."
      }
    ]
  },
  {
    "id": 92,
    "categoryId": "gëzim-dhe-shqetësim",
    "title": "Duaja e atij i cili të ka borxh kur ta kthen atë",
    "duas": [
      {
        "id": 193,
        "ar": "بارَكَ اللَّهُ لَكَ فِي أَهْلِكَ وَمالِك، إِنَّما جَـزاءُ السَّلَفِ الْحَمْدُ والأَدَاء",
        "sq": "Të bekoftë Allahu në familjen dhe pasurinë Tënde, vërtetë shpërblimi i borxhit është falënderimi dhe kthimi.",
        "transliteration": "BarekAll-llahu leke fi Ehlike ve malike, inn-ema xhezaus-selefi el hamdu vel-edau",
        "count": 1,
        "reference": "Nesaiu në “Amel el-Jevmi ve Lejleh” fq. 300 dhe Ibën Maxheh 2/809, “Sahih Ibën Maxheh” 2/55"
      }
    ]
  },
  {
    "id": 93,
    "categoryId": "mirësjellja",
    "title": "Duaja e frikës nga shirku",
    "duas": [
      {
        "id": 194,
        "ar": "اللَّهُمَّ  إِنّـي أَعـوذُبِكَ أَنْ أُشْـرِكَ بِكَ وَأَنا أَعْـلَمْ، وَأَسْتَـغْفِرُكَ لِما لَا أَعْـلَم",
        "sq": "O Allahu im, kërkoj mbrojtjen Tënde nga shirku të cilin e di dhe kërkoj faljen Tënde për atë që nuk e di.",
        "transliteration": "All-llahumme inni eudhu bike en ushrike bike ve ene a’ëlemu ve estagfiruke lima la a’ëlemu",
        "count": 1,
        "reference": "Ahmedi 4/403 dhe të tjerë, “Sahih el-Xhamiu” 3/233 dhe “Sahih et-Tergib vet-Terhib” të autorit Albani 1/19."
      }
    ]
  },
  {
    "id": 94,
    "categoryId": "gëzim-dhe-shqetësim",
    "title": "Duaja për atë i cili të thotë",
    "duas": [
      {
        "id": 195,
        "ar": "Duaja për atë i cili të thotë\\nبَارَكَ اللَّهُ فِيكَ\\nBarekAll-llahu fike\\n“Allahu të bekoftë.”\\n\\nوَفِيكَ بَارَكَ اللَّهُ\\n",
        "sq": "Edhe ty të bekoftë Allahu.",
        "transliteration": "Ve fike barekAll-llahu",
        "count": 1,
        "reference": "Ibën Sunnij fq. 138, nr. 278 “Vabil es-Sajjib” të Ibën Kajjimit fq. 304, me recensimin e Beshir Muhamed Nuajm."
      }
    ]
  },
  {
    "id": 95,
    "categoryId": "udhëtim",
    "title": "Duaja e urrejtjes së parashikimit të keq",
    "duas": [
      {
        "id": 196,
        "ar": "اللَّهُمَّ لَا طَيْـرَ إِلاّ طَيْـرُك، وَلا خَـيْرَ إِلاّ خَـيْرُك، وَلا إِلهَ غَيْـرُك",
        "sq": "O Allahu im, nuk ka tajre përveç tajres Tënde, nuk ka të mirë përveç të mirës Tënde dhe nuk ka të adhuruar tjetër përveç Teje.",
        "transliteration": "All-llahumme la tajre il-la tajruke ve la hajre il-la hajruke, ve la ilahe gajruke",
        "count": 1,
        "reference": "Mbështetje në ogure, në parashenja të këqija ose të mira. Ahmedi 2/220 dhe Ibën Sunnij nr. 292, i vërtetë sipas Albanit, shih “Silsileh Ehadith es-Sahiha” 3/54, nr. 1065, kurse sa i përket parashikimit të së mirës (që ara-bët e përdorin termin fe’lun sh.p.) kjo fjalë i pëlqente të të Dërguarit dhe kur e dëgjoi një fjalë të mirë prej një personi dhe i pëlqeu i tha: “E morëm fjalën tënde të mirë (fe’lin), nga goja jote”. Ebu Davudi dhe Ahmedi. sahih sipas shejh Albanit, shih “Silsileh Ehadith Es-Sahiha” 2/363."
      }
    ]
  },
  {
    "id": 96,
    "categoryId": "udhëtim",
    "title": "Duaja gjatë hipjes në mjetin e udhëtimit",
    "duas": [
      {
        "id": 197,
        "ar": "بِسْـمِ اللَّهِ وَالْحَمْـدُ لله، سُـبْحانَ الّذي سَخَّـرَ لَنا هَـٰذَا وَما كُنّا لَهُ مُقْـرِنين، وَإِنّا إِلى رَبِّنا لَمُنـقَلِبون، الحَمْـدُ لله، الحَمْـدُ لله،\\n\\n الحَمْـدُ لله، اللَّهُ أكْـبَر، اللَّهُ أكْـبَر، اللَّهُ أكْـبَر، سُـبْحانَكَ اللَّهُمَّ  إِنّي ظَلَـمْتُ نَفْسي فَاغْـفِرْ لي، فَإِنَّهُ لَا يَغْفِـرُ الذُّنوبَ إِلاّ أَنْـت ",
        "sq": "Me emrin e Allahut, Falënderimi i takon Allahut, i Lartmadhëruar qoftë Ai i Cili i nënshtroi këto për ne, sepse ne nuk do të kishim mundësi ta bënim këtë; ne me të vërtetë tek Zoti ynë do të kthehemi; Falënderimi i qoftë Allahut, Falënderimi i qoftë Allahut. Falënderimi i qoftë Allahut, Allahu është më i Madhi, Allahu është më i Madhi; Allahu është më i Madhi, i Lartësuar qofsh o Allahu im, unë i kam bërë dëm vetvetes, prandaj më fal mua, sepse askush përveç teje nuk mund t’i falë mëkatet.",
        "transliteration": "Bismil-lah, vElhamdulil-lah [Subhanel-ledhi sehare lena hadha ve ma kunna lehu mukrinin ve inna ila Rabbina le munka-libun], El-Hamdulil-lah, (3 herë), All-llahu Ekber, (3 herë), Subhaneke All-llahumme inni dhalemtu nefsi fagfir li, fe innehu la jagfirudh-dhunube il-la Ente.",
        "count": 3,
        "reference": "Ebu Davudi 3/34, Tirmidhiu 5/501 “Sahih et-Tirmidhi” 3/156."
      },
      {
        "id": 234,
        "ar": "",
        "sq": "Thotë i Dërguari (a.s) : “Kush i mëson përmendësh dhjetë ajetet e para të sures “Kehf”, është i mbrojtur prej dexhallit.” Si dhe të kërkuarit mbrojtje nga Allahu i Madhëruar nga sprova e dexhallit pas teshehudit të fundit në çdo namaz.",
        "transliteration": "",
        "count": 1,
        "reference": "Shënon Muslimi 1/555 dhe në transmetimin tjetër: “Dhjetë Ajetet e fundit të sures Kehf”, 1/556. Shih hadithet nën fusnotën: 75 dhe 76."
      }
    ]
  },
  {
    "id": 97,
    "categoryId": "udhëtim",
    "title": "Duaja e udhëtimit",
    "duas": [
      {
        "id": 198,
        "ar": "اَللَّهُ أَكْبَرُ، اَللَّهُ أَكْبَرُ، اَللَّهُ أَكْبَرُ، ﴿سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ۞ وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ﴾ اَللَّهُمَّ إِنّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا البِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى، اَللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ، اَللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَليفَةُ فِي الْأَهْلِ، اَللَّهُمَّ إِنِّي أَعُوذُبِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ\\n\\nI Dërguari i Allahut (a.s) kur kthehej nga udhëtimi, i thoshte të njëjtat fjalë dhe shtonte:\\nآيِبُونَ، تائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ\\n",
        "sq": "“Allahu është më i madhi!” (3 herë). I Lartmadhëruar qoftë Ai që i nënshtroi këto për ne, sepse ne nuk do të kishim mundësi ta bënim këtë. Ne me të vërtetë tek Zoti ynë do të kthehemi. O Allahu ynë, të lutemi që në udhëtimin tonë të na mundësosh të bëjmë mirësi dhe të jemi të devotshëm, të bëjmë vepra me të cilat Ti je i kënaqur. O Allah, na e lehtëso neve udhëtimin tonë dhe na e bëj të rehatshme rrugën tonë. O Allahu im, Ti je shoqërues në udhëtim dhe mbrojtës i familjes sonë. O Allahu im, kërkoj që të më mbrosh nga vështirësitë e udhëtimit dhe nga kënaqësitë e tij, nga shikimet qëllim këqija dhe nga telashet me pasuri dhe familje. U kthyem me pendim dhe përkushtim, duke i bërë Zotit tonë Falënderim.",
        "transliteration": "All-llahu ekber, All-llahu ekber, All-llahu ekber! Subhanel-ledhi sehare lena hadha ve ma kunna lehu mukrinin ve inna ila Rabbina le munkalibun. All-llahumme inna nes’eluke fi seferina hadha el-birre vet-takva ve minel-ameli ma terda, All-llahumme hevvin alejna seferena hadha vetvi anna bu’deh, All-llahumme entes-sahibu fis-seferi vel-halifetu fil ehli, All-llahumme inní eudhu bike min vua’thais-sefer ve keabetil-mendhar ve su’il-munkalebi fil-mali vel-ehl Ajibune taibune abidune li Rabbina hamidune",
        "count": 3,
        "reference": "Shënon Muslimi 2/998"
      }
    ]
  },
  {
    "id": 98,
    "categoryId": "udhëtim",
    "title": "Duaja e hyrjes në ndonjë fshat apo qytet",
    "duas": [
      {
        "id": 199,
        "ar": "أللّـهُمَّ رَبَّ السَّـمواتِ السّـبْعِ وَما أَظْلَلَـنَ، وَرَبَّ الأَراضيـنَ السّـبْعِ وَما أقْلَلْـنَ، وَرَبَّ الشَّيـاطينِ وَما أَضْلَلْـنَ، وَرَبَّ\\n\\nالرِّياحِ وَما ذَرَيْـنَ، أَسْـأَلُـكَ خَيْـرَ هذهِ الْقَـرْيَةِ وَخَيْـرَ أَهْلِـها، وَخَيْـرَ مَا فِيهَا، وَأَعـوذُ بِكَ مِنْ شَـرِّها وَشَـرِّ أَهْلِـها، وَشَـرِّ\\n\\nمَا فِيهَا ",
        "sq": "O Allahu im, Zot i shtatë qiejve dhe i asaj që i mbulojnë, Zot i shtatë tokave dhe i asaj që ato e mbajnë, Zot i shejtanëve dhe atyre që ata i kanë dërguar në humbje, Zot i erës dhe i asaj që ato shpërndajnë, të lutem të më japësh të mirën e këtij fshati, mirësinë e banorëve të tij, të mirën e asaj që gjendet në të dhe kërkoj që të më mbrosh nga dëmi i këtij fshati, dëmi i banorëve të tij dhe dëmi i asaj që gjendet në të.",
        "transliteration": "All-llahumme Rabbes-semavatis-seb’i ve ma adhlelne, ve Rabbel-eredines-seb’i ve eklelne, Rabbesh-shejatini ve ma adlelne, ve Rabber-rijahi ve ma dherejne. Es’eluke hajre hadhihil-karjeti ve hajre ehliha, ve hajre ma fíha, ve eudhu bike min sherriha ve sherri ehliha, ve sherri ma fiiha",
        "count": 1,
        "reference": "Hakimi, i cili e ka vërtetuar dhe e ka pëlqyer Dhehebiu 2/100, si dhe Ibën Sunnij nr. 524. Ibën Haxheri në “Edhkar” 5/154 e ka bërë të mirë. Ibën Bazi thotë: “Këtë hadith e shënon Nesaiu me sened të mirë në Tuhfetul-Ahjar, fq. 37.”"
      }
    ]
  },
  {
    "id": 99,
    "categoryId": "udhëtim",
    "title": "Duaja e hyrjes në treg",
    "duas": [
      {
        "id": 200,
        "ar": "لَا إِلَـٰهَ إِلَّا اللّه وحدَهُ لَا شريكَ لهُ، لهُ المُلْـكُ ولهُ الحَمْـد، يُحْيـي وَيُميـتُ  وَهُوَ حَيٌّ لَا يَمُـوت، بِيَـدِهِ الْخَـيْرُ وَهوَ عَلىَ كلّ\\n\\nشيءٍ قَدِيرٌ ",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Allahut, Ai është Një dhe i pa rival; Atij i takon sundimi dhe vetëm Atij i takon falënderimi; Ai jep jetë dhe vdekje, ndërsa Ai është i Gjalli i Cili nuk vdes kurrë. Në Dorën e Tij është gjithë e mira dhe Ai është i Plotfuqishëm mbi çdo gjë.",
        "transliteration": "La ilahe il-lAll-llahu vahdehu la sherike leh, lehul-Mulku ve lehul-hamdu, juhji ve jumitu, ve Huve hajjun la jemutu bi jedihi el-hajru ve Huve ala kul-li shej’in Kadir",
        "count": 1,
        "reference": "Tirmidhiu 5/291, Hakimi 1/538, i mirë sipas Albanit, “Sahih Ibën Maxheh” 2/21 dhe “Sahih et-Tirmidhi” 3/152."
      }
    ]
  },
  {
    "id": 100,
    "categoryId": "udhëtim",
    "title": "Duaja kur të pengohet mjeti i udhëtimit",
    "duas": [
      {
        "id": 201,
        "ar": "بِسْمِ اللَّهِ",
        "sq": "Me emrin e Allahut.",
        "transliteration": "Bismil-lah",
        "count": 1,
        "reference": "Ebu Davudi 4/296, i vërtetë sipas Albanit, shih “Sahih Ebu Davud” 3/941."
      }
    ]
  },
  {
    "id": 101,
    "categoryId": "udhëtim",
    "title": "Duaja e udhëtarit për atë i cili nuk udhëton",
    "duas": [
      {
        "id": 202,
        "ar": "أَسْتَـوْدِعُكُـمُ اللَّهَ الَّذي لَا تَضِـيعُ وَدائِعُـهُ ",
        "sq": "Ju lë nën kujdes të Allahut, i Cili nuk i humb porositë e Tij.",
        "transliteration": "Estevdi ukumull-llahe el-ledhi la tedi’u ve-dai’uhu.",
        "count": 1,
        "reference": "Ahmedi 2/403, Ibën Maxheh 2/943 “Sahih Ibën Maxheh” 2/133."
      }
    ]
  },
  {
    "id": 102,
    "categoryId": "udhëtim",
    "title": "Duaja e atij që nuk udhëton për udhëtarin",
    "duas": [
      {
        "id": 203,
        "ar": "أَسْتَـوْدِعُ اللَّهَ دِيـنَكَ وَأَمانَتَـكَ، وَخَـواتيـمَ عَمَـلِكَ  ",
        "sq": "Në mbrojtjen e Allahut qofshin feja jote, besa jote dhe përfundimi i punëve tuaja.",
        "transliteration": "Estevdi ull-llahe dineke ve emaneteke, ve havatime amelike",
        "count": 1,
        "reference": "Ahmedi 2/7, Tirmidhiu 5/499 ”Sahih et-Tirmidhi” 2/155.”"
      },
      {
        "id": 204,
        "ar": "زَوَّدَكَ اللَّهُ التقْوى، وَغَفَـرَذَنْـبَكَ، وَيَسَّـرَ لَكَ الخَـيْرَ حَيْـثُما كُنْـت",
        "sq": "Të furnizoftë Allahu me devotshmëri, t’i faltë mëkatet dhe t’i lehtësoftë punët e mira kudo që të jesh.",
        "transliteration": "Zevvedeke All-llahu et-takva, ve Gafere dhenbeke, ve jessere lekel-hajre hajthu ma kunte",
        "count": 1,
        "reference": "Tirmidhiu në “Sahih et-Tirmidhi” 3/155."
      }
    ]
  },
  {
    "id": 103,
    "categoryId": "udhëtim",
    "title": "Tekbiri dhe tesbihu gjatë udhëtimit",
    "duas": [
      {
        "id": 272,
        "ar": "",
        "sq": "Shënohet nga Xhabiri (r.a) , i cili ka thënë: “Kur hipnim përpjetë, merrnim tekbir, thonim All-llahu Ekber, ndërsa kur zbrisnim bënim tesbih, thonim SubhanAll-llah.”",
        "transliteration": "",
        "count": 1,
        "reference": "Buhariu, “Fet’hul-Bari” 6/135"
      }
    ]
  },
  {
    "id": 104,
    "categoryId": "udhëtim",
    "title": "Duaja e udhëtarit para agimit të mëngjesit",
    "duas": [
      {
        "id": 205,
        "ar": "سَمِـعَ سـامِعُ بِحَمْـدِ اللَّهِ وَحُسْـنِ بَلائِـهِ عَلَيْـنا. رَبَّنـا صـاحِبْـنا وَأَفْـضِل عَلَيْـنا عائِذاً باللهِ مِنَ النّـار",
        "sq": "Le të dëgjoj çdo dëgjues për Falënderimin tonë ndaj Allahut, si dhe për begatitë e Tij dhe mirësitë e Tij ndaj nesh; O Zoti ynë, na shoqëro dhe na jep dhunti duke kërkuar mbrojtjen Tënde prej zjarrit.",
        "transliteration": "Semmi’a sami’un bi hamdil-lahi, ve husni belaihi alejna. Rabbena Sahibna ve efdil alejna aidhen bil-lahi minen-nari",
        "count": 1,
        "reference": "Muslimi 4/2086. Shih Komentimin e Neveviut 4/2080."
      }
    ]
  },
  {
    "id": 105,
    "categoryId": "udhëtim",
    "title": "Duaja kur të ndalesh në ndonjë vend, qoftë në udhëtim apo jo",
    "duas": [
      {
        "id": 206,
        "ar": "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        "sq": "Kërkoj mbrojtje me fjalët e përsosura të Allahut nga e keqja që e ka krijuar.",
        "transliteration": "Eudhu bi kelimatil-lahit-tammati min sherri ma halaka",
        "count": 1,
        "reference": "Muslimi 4/2080. Këtë e thoshte kur kthehej prej ndonjë beteje ose kur kthehej nga haxhi."
      }
    ]
  },
  {
    "id": 106,
    "categoryId": "gëzim-dhe-shqetësim",
    "title": "Dhikri i kthimit nga udhëtimi",
    "duas": [
      {
        "id": 207,
        "ar": "اَلهُ  أَكْبَرُ، اَللهُ أَكْبَرُ، اَللهُ َكْبَرُ لَا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنا حَامِدُونَ، صَدَقَ اللَّهُ وَعْدَهُ، وَنَصَرَ عَبْدَهُ، وَهَزَمَ الْأَحْزابَ وَحْدَهُ",
        "sq": "Allahu është më i Madhi, Allahu është më i Madhi, Allahu është më i Madhi: Nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival. Atij i takon sundimi dhe Lavdërimi, Ai është i Plotfuqishëm mbi çdo gjë. U kthyem me pendim dhe përkushtim, duke i bërë Zotit tonë Falënderim, Allahu e përmbushi premtimin e Tij, e ndihmoi robin e Tij dhe i mposhti grupacionet i Vetëm.",
        "transliteration": "All-llahu Ekber, All-llahu Ekber, All-llahu Ekber: La ilahe il-lAll-llahu vahdehu la sherike leh, lehul mulku ve lehul hamdu ve huve ala kul-li shej’in kadir ajibúne taibúne abidúne li Rabbina hamidun. SadekAll-llahu va’deh, ve nesare abdeh, ve hezemel-ahzabe vahdeh",
        "count": 1,
        "reference": "Buhariu 7/163, Muslimi 2/980."
      }
    ]
  },
  {
    "id": 107,
    "categoryId": "falënderimi-ndaj-Allahut",
    "title": "Çfarë duhet të thotë ai të cilit i vjen diç që e gëzon apo që e urren",
    "duas": [
      {
        "id": 273,
        "ar": "I Dërguari i Allahut (a.s) kur i vinte ndonjë çështje e cila e gëzonte thoshte:\\nاَلْحَمْدُ لِلهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ\\n\\nNdërsa kur i vinte ndonjë çështje të cilën e urrente, thoshte:\\nاَلْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ\\n",
        "sq": "Falënderimi i qoftë Allahut, i Cili me begatinë e Tij i plotëson punët e mira. Falënderimi i takon Allahut për çdo gjendje.",
        "transliteration": "Elhamdulil-lahil-ledhi bi ni’ëmetihi tetimmus-salihat Elhamdulil-lahi ala kul-li hal",
        "count": 1,
        "reference": "Ibën Sunnij në “Amel el-Jevmi ve Lejleh” dhe Hakimi, i cili e ka vërtetuar 1/499. Gjithashtu shejh Albani e ka autentifikuar në “Sahih el-Xhamiu” 4/201."
      }
    ]
  },
  {
    "id": 108,
    "categoryId": "mirësjellja",
    "title": "Vlera e salavatit mbi të dërguarin",
    "duas": [
      {
        "id": 274,
        "ar": "",
        "sq": "1. I Dërguari i Allahut (a.s) ka thënë: “Kush më dërgon mua një salavat, Allahu i Madhëruar ka për t’i dërguar atij për atë salavat, dhjetë salavate.” 2. Pastaj ai ka vazhduar duke thënë: “Mos e bëni varrin tim festë për vizita, por bini salavat mbi mua, se salavati i juaj më arrin mua kudo që të jeni.” 3. Për këtë ai (a.s) po ashtu ka thënë: “Koprrac është ai i cili kur përmendem pranë tij nuk bie salavat mbi mua.” 4. Ai (a.s) gjithashtu ka thënë: “Allahu ka melaike, të cilat shëtisin nëpër tokë dhe m’i përcjellin përshëndetjet e umetit tim.” 5. Si dhe: “Nuk më përshëndet askush e që Allahu të mos ma kthejë shpirtin derisa t’ia kthej përshëndetjen.”",
        "transliteration": "",
        "count": 1,
        "reference": "Muslimi 1/288. Ebu Davudi 2/218, Ahmedi 2/367. I vërtetë sipas Albanit “Sahih Ebu Davud” 2/383. Tirmidhiu dhe të tjerë “Sahih el-Xhamiu” 3/25 dhe “Sahih et-Tirmidhi” 3/177. Nesaiu dhe Hakimi 2/421. I vërtetë sipas Albanit, shih “Sahih En-Nesai” 1/274. Ebu Davudi nr.2041, i mirë sipas Albanit, shih “Sahih Ebu Davud”."
      }
    ]
  },
  {
    "id": 109,
    "categoryId": "mirësjellja",
    "title": "Përhapja e selamit",
    "duas": [
      {
        "id": 235,
        "ar": "",
        "sq": "Shënohet nga Xhabiri (r.a), i cili ka thënë: “Kur hipnim përpjetë, merrnim tekbir, thonim All-llahu Ekber, ndërsa kur zbrisnim bënim tesbih, thonim SubhanAll-llah.”",
        "transliteration": "",
        "count": 1,
        "reference": "Buhariu, “Fet’hul-Bari” 6/135"
      }
    ]
  },
  {
    "id": 110,
    "categoryId": "natyra",
    "title": "Si duhet kthyer selamin jobesimtarëve, nëse japin selam",
    "duas": [
      {
        "id": 208,
        "ar": "Transmetohet se i Dërguari i Allahut (a.s) ka thënë: “Nëse u japin selam Ehli Kitabët  thuajuni:\\n\\nوَعَلَيْكُمْ\\n",
        "sq": "Edhe mbi ju.",
        "transliteration": "Ve alejkum",
        "count": 1,
        "reference": "Buhariu me “Fet’h” 11/42, Muslimi 4/1795."
      },
      {
        "id": 236,
        "ar": "I Dërguari i Allahut (a.s) kur i vinte ndonjë çështje e cila e gëzonte thoshte:\\nاَلْحَمْدُ لِلهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ\\n\\nNdërsa kur i vinte ndonjë çështje të cilën e urrente, thoshte:\\nاَلْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ\\n",
        "sq": "Falënderimi i qoftë Allahut, i Cili me begatinë e Tij i plotëson punët e mira. Falënderimi i takon Allahut për çdo gjendje.",
        "transliteration": "Elhamdulil-lahil-ledhi bi ni’ëmetihi tetimmus-salihat Elhamdulil-lahi ala kul-li hal",
        "count": 1,
        "reference": "Ibën Sunnij në “Amel el-Jevmi ve Lejleh” dhe Hakimi, i cili e ka vërtetuar 1/499. Gjithashtu shejh Albani e ka autentifikuar në “Sahih el-Xhamiu” 4/201."
      }
    ]
  },
  {
    "id": 111,
    "categoryId": "natyra",
    "title": "Çfarë duhet thënë kur të këndon gjeli dhe të pëllet gomari",
    "duas": [
      {
        "id": 237,
        "ar": "",
        "sq": "1. I Dërguari i Allahut (a.s) ka thënë: “Kush më dërgon mua një salavat, Allahu i Madhëruar ka për t’i dërguar atij për atë salavat, dhjetë salavate.” 2. Pastaj ai ka vazhduar duke thënë: “Mos e bëni varrin tim festë për vizita, por bini salavat mbi mua, se salavati i juaj më arrin mua kudo që të jeni.” 3. Për këtë ai (a.s) po ashtu ka thënë: “Koprrac është ai i cili kur përmendem pranë tij nuk bie salavat mbi mua.” 4. Ai (a.s) gjithashtu ka thënë: “Allahu ka melaike, të cilat shëtisin nëpër tokë dhe m’i përcjellin përshëndetjet e umetit tim.” 5. Si dhe: “Nuk më përshëndet askush e që Allahu të mos ma kthejë shpirtin derisa t’ia kthej përshëndetjen.”",
        "transliteration": "",
        "count": 1,
        "reference": "Muslimi 1/288. Ebu Davudi 2/218, Ahmedi 2/367. I vërtetë sipas Albanit “Sahih Ebu Davud” 2/383. Tirmidhiu dhe të tjerë “Sahih el-Xhamiu” 3/25 dhe “Sahih et-Tirmidhi” 3/177. Nesaiu dhe Hakimi 2/421. I vërtetë sipas Albanit, shih “Sahih En-Nesai” 1/274. Ebu Davudi nr.2041, i mirë sipas Albanit, shih “Sahih Ebu Davud”."
      }
    ]
  },
  {
    "id": 112,
    "categoryId": "mirësjellja",
    "title": "Çfarë duhet thënë kur të lehin qentë natën",
    "duas": [
      {
        "id": 238,
        "ar": "",
        "sq": "1. I Dërguari (a.s) ka thënë: “Nuk keni për të hyrë në Xhenet, derisa të besoni dhe nuk keni besuar derisa të duheni. A t’ju udhëzoj në një gjë, të cilën nëse e veproni keni për t’u dashur. Përhapeni selamin ndërmjet jush.” 2. “Kush i tubon tri cilësi, e ka përfshirë besimin: ‘Të qenit joegoist, dhënia e selamit njerëzve dhe dhënia e lëmoshës në skamje.’” 3. Shënohet nga Abdullah ibën Omeri (r.a) se një njeri e ka pyetur të Dërguarin : “Cili është Islami më i mirë?” I Dërguari i Allahut (a.s) i tha: “T’i ushqesh nevojtarët, t’i japësh selam atij që e njeh dhe atij që nuk e njeh.”",
        "transliteration": "",
        "count": 1,
        "reference": "Muslimi 1/74 dhe të tjerë. Buhariu me “Fet’h” 1/82, nga Amari mevkuf. Buhariu me “Fet’h” 1/55, Muslimi 1/65."
      },
      {
        "id": 239,
        "ar": "",
        "sq": "Shënohet se i Dërguari i Allahut (a.s) ka thënë: “Kur ta dëgjoni gjelin duke kënduar, luteni Allahun që t’ju jap nga të mirat e Tij, sepse gjeli e ka parë melekun, ndërsa kur ta dëgjoni palljen e gomarit, kërkoni mbrojtjen e Allahut prej shejtanit, sepse ai e ka parë shejtanin.”",
        "transliteration": "",
        "count": 1,
        "reference": "Buhariu “Fet’h” 6/350, Muslimi 4/2092."
      }
    ]
  },
  {
    "id": 113,
    "categoryId": "mirësjellja",
    "title": "Duaja për atë të cilin e ke ofenduar",
    "duas": [
      {
        "id": 209,
        "ar": "اللهُمَّ فأَيُّمَا مُؤْمِنٍ سَبَبْتُهُ فَاجْعَلْ ذَلِكَ لهُ قُرْبةً إليكَ يَوْمَ القِيَامةِ",
        "sq": "O Allahu im, cilindo besimtar që e kam ofenduar, bëja këtë ofendim atij afrim tek Ti Ditën e Gjykimit.",
        "transliteration": "All-llahumme fe ejjuma mu’minin sebebtuhu fexh’al dhalike lehu kurbeten ilejke jevmel kijameti",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 11/171” dhe Muslimi 4/2007."
      },
      {
        "id": 240,
        "ar": "",
        "sq": "Shënohet se i Dërguari i Allahut (a.s) ka thënë: “Kur t’i dëgjoni të lehurat e qenve dhe palljet e gomarëve në mbrëmje, kërkoni mbrojtjen e Allahut prej tyre, sepse ata shohin atë që ju nuk e shihni.”",
        "transliteration": "",
        "count": 1,
        "reference": "Ebu Davudi 4/327 dhe Ahmedi 3/306, shejh Albani e ka bërë të vërtetë në librin “Sahih Ebi Davud”."
      }
    ]
  },
  {
    "id": 114,
    "categoryId": "mirësjellja",
    "title": "Çfarë thotë muslimani kur ta lavdërojë muslimanin",
    "duas": [
      {
        "id": 210,
        "ar": "",
        "sq": "I Dërguari i Allahut (a.s) ka thënë: “Nëse ndonjëri prej jush e lavdëron shokun e tij, le të thotë: “E konsideroj filanin të këtillë, Allahu e di më së miri për të dhe nuk e lavdëroj askënd para Allahut, e konsideroj kështu dhe kështu.”",
        "transliteration": "",
        "count": 1,
        "reference": "Muslimi 4/2296."
      }
    ]
  },
  {
    "id": 115,
    "categoryId": "haxh-dhe-umre",
    "title": "Çfarë duhet të thotë muslimani kur të lavdërohet prej ndokujt",
    "duas": [
      {
        "id": 212,
        "ar": "اللَّهُمّ لَا تُؤاَخِذْنِي ِبَما يَقُولُونُ ، وَاغْفِرْ لِي مَالا يَعْلَمُونَ [وَاجْعَلْنِي خَيْراً مِمَّا َيظُنُّونَ]",
        "sq": "O Allahu im, mos më dëno për atë që thonë, m’i fal ato që nuk i di, [dhe më bën më të mirë se sa më mendojnë të tjerët].",
        "transliteration": "All-llahumme la tuahidhni bima jeku-lun, vagfir li ma la ja’ëlemun [vexh-alni hajren mimma jedhunnun]",
        "count": 1,
        "reference": "Buhariu në “Edebul Mufred” #761, senedin e këtij hadithi e ka autentifikuar Albani në “Sahih Edebul Mufred” #585, ndërsa ajo që është ndërmjet kllapave është pjesa e Bejhekiut e marrë nga libri i tij “Shuabul-Iman” 4/228, me rrugë tjetër të transmetimit."
      }
    ]
  },
  {
    "id": 116,
    "categoryId": "haxh-dhe-umre",
    "title": "Telbia për haxhxh dhe umre",
    "duas": [
      {
        "id": 213,
        "ar": "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ ، لَا شَرِيكَ لَكَ لَبَّيْكَ ،إنَّ الْحَمْدَ ،وَالنِّعْمَةَ ،لَكَ وَالْمُلْكُ ، لَا شَرِيكَ لَكَ",
        "sq": "Të përgjigjem o Allahu im, të përgjigjem Ty, Ti je i pa rival, vetëm Ty të përgjigjem, Falënderimi të takon vetëm Ty. Të gjitha begatitë dhe e tërë pasuria është e Jotja, Ti je i pa rival.",
        "transliteration": "Lebbejke All-llahumme Lebbejk, Leb-bejke La sherike Leke Lebbejk, innel-Hamde ven-ni’ëmete leke vel-Mulk La sherike Lek",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 3/408, 2/841 dhe Muslimi."
      }
    ]
  },
  {
    "id": 117,
    "categoryId": "haxh-dhe-umre",
    "title": "Tekbiri me rastin e afrimit të haxherul-esvedit",
    "duas": [
      {
        "id": 241,
        "ar": "",
        "sq": "I Dërguari i Allahut (a.s) ka bërë tavaf rreth Qabes i hipur mbi deve dhe sa herë që vinte te Haxherul-esvedi ia drejtonte atë që e kishte në dorë dhe merrte tekbir.",
        "transliteration": "",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 3/476 dhe 3/472."
      }
    ]
  },
  {
    "id": 118,
    "categoryId": "haxh-dhe-umre",
    "title": "Duaja ndërmjet ruknul-jemanit dhe haxherul-esvedit",
    "duas": [
      {
        "id": 214,
        "ar": "رَبَّنَا آتِنَا فِي الدُّنْيَا حسَنَةً وفي الآخِرَةِ حسَنةً وقِنَا عذَابَ النَّارِ",
        "sq": "O Zoti ynë, na jep të mira në këtë botë dhe të mira në Ahiret, si dhe na ruaj prej dënimit të Xhehenemit.",
        "transliteration": "Rabbena atina fid-dunja haseneten ve fil-ahireti haseneten vekina adhaben-nar",
        "count": 1,
        "reference": "Ebu Davudi 2/179, Ahmedi 3/411 dhe Begaviu në “Sherh es-Sunneh” 7/128. Shejh Albani e ka bërë të mirë në “Sahih Ebi Davud” 1/354, ndërsa ajeti është në suren Bekare 201."
      }
    ]
  },
  {
    "id": 119,
    "categoryId": "haxh-dhe-umre",
    "title": "Duaja e qëndrimit mbi saffa dhe merve",
    "duas": [
      {
        "id": 215,
        "ar": "Atëherë kur i është afruar i Dërguari i Allahut Safas e ka lexuar ajetin:\\n۞إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَآئِرِ اللهِ۞\\n\\nGjithashtu i Dërguari ka thënë: \\nأَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ\\n",
        "sq": "Po filloj me atë që ka filluar Allahu.",
        "transliteration": "Innes-saf-fa vel-mervete min she’airil-lah ebdeu bima bedeAll-llahu bihi.",
        "count": 1,
        "reference": ""
      },
      {
        "id": 242,
        "ar": "I Dërguari (a.s) ka thënë: “Fjala më e mirë të cilën e kam thënë unë dhe të Dërguarit para meje, është:\\nلَا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ\\n",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival. Atij i takon Sundimi dhe Lavdërimi dhe Ai është i Gjithëfuqishëm mbi çdo gjë; e përmbushi premtimin e Tij, e ndihmoi robin e Tij dhe i Vetëm i mposhti grupacionet.",
        "transliteration": "La ilahe il-lAll-llahu vahdehu la sherike leh, lehul-Mulku ve lehul-Hamdu ve Huve ala kul-li shej’in Kadir, La ilahe il-lAll-llahu vahdehu, enxheze va’dehu, ve nesare abdehu, ve hezemel-ahzabu vahdeh",
        "count": 1,
        "reference": "Muslimi 2/888."
      }
    ]
  },
  {
    "id": 120,
    "categoryId": "haxh-dhe-umre",
    "title": "Duaja në ditën e arafatit",
    "duas": [
      {
        "id": 243,
        "ar": "I Dërguari (a.s) ka thënë: “Fjala më e mirë të cilën e kam thënë unë dhe të Dërguarit para meje, është:\\nلَا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ\\n",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival. Atij i takon Sundimi dhe Lavdërimi dhe Ai është i Gjithëfuqishëm mbi çdo gjë.",
        "transliteration": "La ilahe il-lAll-llahu vahdehu la sherike leh, lehul-Mulku ve lehul-Hamdu ve Huve ala kul-li shej’in Kadír",
        "count": 1,
        "reference": "Tirmidhiu. Shejh Albani e ka bërë të mirë “Sahih et-Tirmidhi” 3/184 dhe “Silsileh Ehadith es-Sahiha” 4/6."
      }
    ]
  },
  {
    "id": 121,
    "categoryId": "haxh-dhe-umre",
    "title": "Të përkujtuarit e allahut tek mesh’aril-harami (muzdelife)",
    "duas": [
      {
        "id": 244,
        "ar": "",
        "sq": "I Dërguari i Allahut (a.s) i hipi devesë derisa arriti tek Mesh’aril-harami, iu drejtua kibles, u lut, mori tekbire, lartësoi madhërinë e Allahut dhe njësinë e Tij. Kështu vazhdoi përderisa nuk u bë qielli shumë i kuqërremtë dhe u largua para se të perëndojë dielli.",
        "transliteration": "",
        "count": 1,
        "reference": "Muslimi 2/891."
      }
    ]
  },
  {
    "id": 122,
    "categoryId": "gëzim-dhe-shqetësim",
    "title": "Marrja e tekbireve gjatë gjuajtjes së çdo guraleci në xhemerat",
    "duas": [
      {
        "id": 245,
        "ar": "",
        "sq": "Sa herë që i Dërguari i Allahut (a.s) e gjuante një gurë në Mina në cilindo nga tri gjuajtjet (xhemeratet), ecte pak, ndalej dhe me duar të ngritura bënte dua i kthyer nga Kibla. Këtë e bënte gjatës gjuajtjes së gurit të parë dhe të dytë, ndërsa kur bënte gjuajtjen e tretë, në çdo guri të hedhur merrte tekbir dhe largohej duke mos u ndalur fare tek ai.",
        "transliteration": "",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 3/581, 3/583, 3/584” dhe Muslimi."
      }
    ]
  },
  {
    "id": 123,
    "categoryId": "gëzim-dhe-shqetësim",
    "title": "Duaja me rastin e dëgjimit të ndonjë lajmi të çuditshëm apo të gëzueshëm",
    "duas": [
      {
        "id": 216,
        "ar": "سُبْحَانَ اللَّهِ",
        "sq": "I Lartësuar qoftë Allahu, sa i pa të metë është Ai.",
        "transliteration": "SubhanAll-llah",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 1/210, 390, 414” dhe Muslimi 4/1857."
      },
      {
        "id": 217,
        "ar": "اللَّهُ أَكْبرُ",
        "sq": "Allahu është më i madhi.",
        "transliteration": "All-llahu Ekber",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 8/441, “Sahih et-Tirmidhi” 3/103 dhe 2/235 dhe shih Musnedin e Imam Ahmedit, 5/218."
      }
    ]
  },
  {
    "id": 124,
    "categoryId": "sëmundja-dhe-vdekja",
    "title": "Çfarë duhet të veprojë ai të cilit i ndodh diç që e gëzon",
    "duas": [
      {
        "id": 221,
        "ar": "",
        "sq": "I Dërguari i Allahut (a.s) kur i ndodhte ndonjë gjë e cila e gëzonte, përulej në sexhde, në shenjë falënderimi për Allahun e Madhëruar.",
        "transliteration": "",
        "count": 1,
        "reference": "Transmetojnë autorët e katër Suneneve përveç Nesaiut “Sahih ibën Maxheh”, 1/233 dhe “Irvaul-Galil”, 2/226."
      }
    ]
  },
  {
    "id": 125,
    "categoryId": "shtëpia-dhe-familja",
    "title": "Çfarë duhet të thotë ai i cili ndien dhimbje në trupin e tij",
    "duas": [
      {
        "id": 246,
        "ar": "Vendos dorën në vendin që të dhemb dhe thuaj:\\nبِسْمِ اللَّهِ\\n\\nDhe pastaj thuaj:\\nأَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ\\n",
        "sq": "Në emër të Allahut. Kërkoj mbrojtjen e Allahut me fuqinë e Tij nga e keqja e kësaj që ndiej dhe frikohem.",
        "transliteration": "Bismil-lah. (3 herë) Eudhu bil-lahi ve kudretihi min sherri ma exhidu ve uhadhiru (7 herë)",
        "count": 7,
        "reference": "Muslimi 4/1728."
      }
    ]
  },
  {
    "id": 126,
    "categoryId": "gëzim-dhe-shqetësim",
    "title": "Duaja e atij i cili frikohet se mos po merr mësysh diçka me syrin e tij",
    "duas": [
      {
        "id": 247,
        "ar": "",
        "sq": "Nëse ndokush prej jush sheh diç e cila i pëlqen tek vëllai i tij, në veten e tij apo në pasurinë e tij, le të lutet që Allahu t’ia bekojë këtë gjë, sepse syri është i vërtetë.",
        "transliteration": "",
        "count": 1,
        "reference": "Ahmedi në Musnedin e tij 4/447, Ibën Maxheh dhe Ma-liku. Albani e ka vërtetuar në “Sahih el-Xhamiu” 1/212. Shih recensionin e librit “Zadul-Me’ad” të Shuajb dhe Abdulkadër Arnautit 4/170."
      }
    ]
  },
  {
    "id": 127,
    "categoryId": "haxh-dhe-umre",
    "title": "Çfarë duhet thënë në raste të frikës",
    "duas": [
      {
        "id": 248,
        "ar": "لَا إِلَـٰهَ إِلَّا اللّه",
        "sq": "Nuk ka të adhuruar tjetër përveç Allahut.",
        "transliteration": "La Ilahe il-lAll-llah",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 6/181 dhe Muslimi 4/2208."
      }
    ]
  },
  {
    "id": 128,
    "categoryId": "shtëpia-dhe-familja",
    "title": "Çfarë duhet thënë me rastin e therjes së kafshëve apo të kurbanit",
    "duas": [
      {
        "id": 249,
        "ar": "بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ [اَللَّهُمَّ مِنْكَ وَلَكَ] اَللَّهُمَّ تَقَبَّلْ مِنِّي",
        "sq": "Me emrin e Allahut, Allahu është më i madhi [O Allahu im kjo është nga Ti dhe për Ty], O Allahu im, pranoje këtë nga unë.",
        "transliteration": "Bismil-lah, vAll-llahu Ekber, [All-llahumme minke ve leke] All-llahumme tekabbel minni",
        "count": 1,
        "reference": "Muslimi 3/1557 dhe Bejhekiu 9/287, pjesa e hadithit ndërmjet kllapave gjendet te Bejhekiu 9/287. Fjalinë e fundit e kam cekur në bazë të kuptimit nga transmetimi i Muslimit."
      }
    ]
  },
  {
    "id": 129,
    "categoryId": "falënderimi-ndaj-Allahut",
    "title": "Çfarë thuhet për largimin e kurtheve të shejtanëve",
    "duas": [
      {
        "id": 250,
        "ar": "أَعُوذُ بكَلِمَاتِ اللَّهِ التَّامَّاتِ الَّتِي لَا يُجَاوِزُهُنَّ بَرٌّ وَلاَ فَاجِرٌ: مِنْ شَرِّ مَا خَلَقَ، وَبَرَأَ وَذَرَأَ، وَمِنْ شَرِّ مَا يَنْزِلُ مِنَ السَّمَاءِ، وَمِنْ شَرِّ مَا يَعْرُجُ فيهَا، وَمِنْ شَرِّ مَا ذَرَأَ فِي الْأَرْضِ، وَمِنْ شَرِّ مَا يَخْرُجُ مِنْهَا، وَمِنْ شَرِّ فِتَنِ اللَّيْلِ وَالنَّهَارِ، وَمِنْ شَرِّ كُلِّ طَارِقٍ إِلاَّ طَارِقاً يَطْرُقُ بِخَيْرٍ يَا رَحْمَنُ",
        "sq": "Kërkoj mbrojtje me fjalët e përsosura të Allahut, të cilat nuk mund t’i tejkalojë asnjë bamirës e as i prishur, nga dëmi i asaj që ka krijuar, nga dëmi i asaj që zbret nga qielli, nga dëmi i asaj që ngjitet në të, nga dëmi i asaj që është mbi tokë dhe i asaj që del nga ajo, nga dëmi i sprovave të natës dhe të ditës, si dhe nga dëmi i çdo udhëtari të natës përveç Atij i cili do të vijë me të mirë, o i Gjithëmëshirshëm.",
        "transliteration": "Eudhu bi kelimatil-lahi Et-tammati el-leti la juxhavizu hunne berrun ve la faxhirun min sherri ma halaka, ve bere’e ve dher’e, ve min sherri ma jenzilu mines-semái, ve min sherri ma je’ëruxhu fíha, ve min sherri ma dhere’e fil-erdi, ve min sherri ma jahruxhu minha, ve min sherri fitenil-lejli ven-nehar, ve min sherri kul-li tarikin il-la tarikan, jatruku bi hajrin, ja Rahmanu",
        "count": 1,
        "reference": "Ahmedi 3/419 me sened të vërtetë. Gjithashtu e shënoj Ibën Sunnijj nr. 637. Abdulkadër Arnauti e ka vërtetuar senedin e tij në vlerësimin e tij të librit të Tahaviut fq.133 dhe “Mexhmeuz-Zevaid” 1/127."
      }
    ]
  },
  {
    "id": 130,
    "categoryId": "falënderimi-ndaj-Allahut",
    "title": "Të kërkuarit falje dhe pendim",
    "duas": [
      {
        "id": 251,
        "ar": "أَسْتَغْفِرُ اللَّهَ الْعَظيمَ الَّذِي لَا إِلَهَ إِلاَّ هُوَ الْحَيُّ القَيّوُمُ وَأَتُوبُ إِلَيهِ",
        "sq": "1.Ebu Hurejra (r.a) thotë: “E kam dëgjuar të Dërguarin (a.s) duke thënë: “Pasha Allahun, unë kërkoj falje prej Allahut dhe pendohem tek Ai më tepër se shtatëdhjetë herë në ditë.” 2.I Dërguari (a.s) gjithashtu ka thënë: “O ju njerëz, pendohuni tek Allahu, sepse unë pendohem njëqind herë në ditë.” 3.Po ashtu i Dërguari (a.s) ka thënë: “Kush thotë: “Kërkoj faljen e Allahut të Madhërueshëm, e të Cilit nuk ka të adhuruar tjetër përveç Tij, që është i Gjallë përgjithmonë dhe Mbikëqyrës i Përhershëm dhe vetëm tek Ai pendohem.” Allahu do t’ia falë atij edhe nëqoftëse ka ikur nga beteja.” 4. I Dërguari (a.s) gjithashtu ka thënë: “Allahu më së tepërmi i afrohet robit të Vet në pjesën e fundit të natës, nëse ke mundësi të jesh prej atyre të cilët e përmendin Allahun në atë moment, bëhu.” 5. Po ashtu i Dërguari i Allahut (a.s) ka thënë: “Robi është më afër Zotit të Tij kur është në sexhde, pra shpeshtoni lutjet në sexhde.” 6. Dhe i Dërguari (a.s) ka thënë: “Me të vërtetë disa herë zemrën time e kaplon pakujdesia, andaj kërkoj falje prej Allahut njëqind herë në ditë.”",
        "transliteration": "Estagfirull-llahe el-Adhim el-ledhi la ilahe il-la Huve, El-Hajjul-Kajjumu ve etubu ilejhi",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 11/101. Muslimi 4/2076. Ebu Davudi 2/85, Tirmidhiu 5/569 dhe Hakimi, i cili e ka vërtetuar, kurse Dhehebiu e ka pëlqyer 1/511. Gjithashtu Albani e ka autentifikuar në “Sahih et-Tirmidhi” 3/183. Shih po ashtu “Xhamiu Usul li Ehadith er-Resul” 4/389, 390 me recension të Arnautit. Tirmidhiu, Nesaiu 1/279 dhe Hakimi “Sahih et-Tirmidhi” 3/183 dhe “Xhamiu Usul” me recension të Arnautit 4/144. Muslimi 1/350. Muslimi, “Xhamiu Usul”, 4/386."
      }
    ]
  },
  {
    "id": 131,
    "categoryId": "falënderimi-ndaj-Allahut",
    "title": "Vlera e tesbihut, tahmidit, tehlilit dhe e tekbirit",
    "duas": [
      {
        "id": 254,
        "ar": "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        "sq": "“I Lartësuar qoftë Allahu dhe Atij i takon falënderimi, njëqind herë në ditë, i fshihen mëkatet edhe nëse ato janë të shumta aq sa shkuma e detit.”",
        "transliteration": "SubhanAll-llahi ve bihamdihi",
        "count": 1,
        "reference": "Buhariu 7/168 dhe Muslimi 4/2071."
      },
      {
        "id": 255,
        "ar": "I Dërguari (a.s) ka thënë: “Kush thotë:  \\nلَا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ، وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ\\n",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival. Atij i takon Sundimi dhe Lavdërimi dhe Ai është i Gjithëfuqishëm mbi çdo gjë. \"Ka shpërblimin sikur t’i ketë liruar katër persona nga bijtë e Ismailit.\"",
        "transliteration": "La Ilahe il-lAll-llahu vahdehu la sherike Lehu, Lehul mulku ve Lehul hamdu ve Huve ala kul-li shej’in kadir. (10 herë)",
        "count": 10,
        "reference": "Buhariu 7/167 dhe Muslimi 4/2071."
      },
      {
        "id": 256,
        "ar": "I Dërguari i Allahut (a.s) ka thënë: “Dy fjalë janë të lehta për gjuhën, të rënda në peshojë, e të dashura te i Gjithmëshirshmi.”\\nسُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحانَ اللَّهِ الْعَظِيمِ\\n",
        "sq": "I Lartësuar qoftë Allahu, vetëm Atij i takon Falënderimi. I Lartësuar qoftë Allahu, vetëm Atij i takon Madhërimi.",
        "transliteration": "SubhanAll-llahi ve bihamdihi, SubhanAll-llahil-Adhim",
        "count": 1,
        "reference": "Buhariu 7/168 dhe Muslimi 4/2072."
      },
      {
        "id": 257,
        "ar": "I Dërguari i Allahut (a.s) ka thënë: “Të them: \\nسُبْحَانَ اللهِ، وَالْحَمْدُ لِلهِ، وَلاَ إِلَهَ إِلاَّ اللهُ، وَاللَّهُ أَكْبَرُ",
        "sq": "I Lartësuar qoftë Allahu, Falënderimi i takon Allahut. Nuk ka hyjni që meriton të adhurohet përveç Allahut, Allahu është më i Madhi \"Është më e dashur për mua se sa e tërë ajo që e rrezaton dielli.\"",
        "transliteration": "SubhanAll-llahi, vElhamdulil-lahi, ve la ilahe il-lAll-llahu, vAll-llahu Ekber",
        "count": 1,
        "reference": "Muslimi 4/2072."
      },
      {
        "id": 258,
        "ar": "",
        "sq": "Gjithashtu i Dërguari i Allahut (a.s) ka thënë: “A nuk dëshironi që çdo ditë t’i fitoni nga njëmijë sevape? Njëri prej të pranishmëve e pyeti: Si t’i fitojmë njëmijë sevape? Ai i tha: Thuaj njëqind herë SubhanAll-llah, e të shkruhen njëmijë të mira, apo të shlyhen një mijë mëkate.”",
        "transliteration": "",
        "count": 1,
        "reference": "Muslimi 4/2073."
      },
      {
        "id": 259,
        "ar": "Kush thotë:\\nسُبْحَانَ اللَّهِ الْعَظِيمِ وَبِحَمْدِهِ\\n",
        "sq": "I Lartësuar qoftë Allahu dhe Atij i takon falënderimi dhe madhërimi “I mbjellët një pemë në xhenet.”",
        "transliteration": "SubhanAll-llahil-Adhim ve bihamdihi",
        "count": 1,
        "reference": "Tirmidhiu 5/511, Hakimi 1/501 e ka bërë të vërtetë, kurse Dhehebiu e ka pëlqyer. “Sahih el-Xhamiu” 5/531 dhe “Sahih et-Tirmidhi” 3/160.”"
      },
      {
        "id": 260,
        "ar": "Po ashtu i Dërguari i Allahut (a.s) ka thënë: “O Abdullah ibën Kajs, a dëshiron që të të udhëzoj tek një thesar prej thesareve të Xhenetit? Unë i thashë: “Po, o i Dërguari i Allahut”. Ai më tha: “Thuaj:\\nلَا حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ\\n",
        "sq": "Nuk ka ndryshim e as forcë pa ndihmën e Allahut.",
        "transliteration": "La Havle ve la kuvvete il-la bil-lah",
        "count": 1,
        "reference": "Buhariu me Fet’h 11/213 dhe Muslimi 4/2076."
      },
      {
        "id": 261,
        "ar": "I Dërguari i Allahut (a.s) ka thënë: “Të them: \\nسُبْحَانَ اللهِ، وَالْحَمْدُ لِلهِ، وَلاَ إِلَهَ إِلاَّ اللهُ، وَاللَّهُ أَكْبَرُ",
        "sq": "I Lartësuar qoftë Allahu, Falënderimi i takon Allahut. Nuk ka hyjni që meriton të adhurohet përveç Allahut, Allahu është më i Madhi \"Nuk të bëhet dëm me cilëndo prej tyre që të fillosh.\"",
        "transliteration": "SubhanAll-llah, vElhamdulil-lah, ve La ilahe il-lAll-llah, vAll-llahu Ekber",
        "count": 1,
        "reference": "Muslimi 3/1685."
      },
      {
        "id": 262,
        "ar": "Ka ardhur një beduin te i Dërguari (a.s) dhe i ka thënë: “Ma mëso një fjalë të cilën gjithmonë do ta them”. I Dërguari i Allahut i tha: “Thuaj:\\nلَا إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، اللَّهُ أَكْبَرُ كَبِيراً، وَالْحَمْدُ لِلهِ كَثِيراً، سُبْحَانَ اللَّهِ رَبِّ العَالَمِينَ، لَا حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ الْعَزِيزِ الْحَكِيمِ\\n\\nBeduini tha: “Këto janë për Zotin tim, e çka të them për mua? I Dërguari i Allahut (a.s) i tha, thuaj:\\nاَللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَارْزُقْنِي\\n",
        "sq": "Nuk ka hyjni që meriton të adhurohet përveç Allahut, Një dhe i pashoq, Allahu është më i Madhi, Falënderimi i shumtë i takon Allahut, i Lartësuar qoftë Allahu, Zoti i botëve. Nuk ka ndryshim e as forcë pa ndihmën e Allahut. O Allahu im, më fal mua, më mëshiro, më udhëzo dhe më furnizo.",
        "transliteration": "La ilahe il-lAll-llahu vahdehu la sherike lehu, All-llahu Ekberu kebira, vElhamdulil-lahi kethira, SubhanAll-llahi Rabbil-Alemin, La Havle ve La Kuvvete il-la bil-lahil-Azizil-Hakim All-llahummeg-fir li, ver-hamni, veh-dini, ver-zukni",
        "count": 1,
        "reference": "Muslimi 4/2072, ndërsa Ebu Davudi ka shtuar: “Pasi e ka kthyer shpinën beduini, i Dërguari ka thënë: I ka mbushur të dy duart me mirësi.” 1/220"
      },
      {
        "id": 263,
        "ar": "Kur ndonjë njeri e pranonte fenë Islame, i Dërguari i Allahut (a.s) ia mësonte namazin, pastaj e urdhëronte që të lutet me këto fjalë:\\nاَللَّهُمَّ اغْفِرْ لِي، وَارْحَمْنِي، وَاهْدِنِي، وَارْزُقْنِي\\n",
        "sq": "O Allahu im, më fal mua, më mëshiro, më udhëzo dhe më furnizo.",
        "transliteration": "All-llahummag-fir li, ver-hamni, veh-dini, ver-zukni",
        "count": 1,
        "reference": "Muslimi 4/2073 dhe në një transmetim tjetër të Muslimit: “Sepse me të vërtetë këto fjalë i bashkojnë këtë botë dhe ahiretin.”"
      },
      {
        "id": 264,
        "ar": "",
        "sq": "Duaja më e vlefshme është: Elhamdulil-lah, kurse dhikri më i mirë është: La ilahe il-lAll-llah.",
        "transliteration": "",
        "count": 1,
        "reference": "Tirmidhiu 5/462, Ibën Maxheh 2.1249 dhe Hakimi 1/503 të cilin ky e ka bërë të vërtetë, kurse Dhehebiu e ka pëlqyer “Sahih El Xhamiu”, 1/362."
      },
      {
        "id": 265,
        "ar": "Fjalët më të mira dhe më të sinqerta të cilat mbesin përgjithmonë janë:\\nسُبْحَانَ اللهِ، وَالْحَمْدُ لِلهِ، وَلاَ إِلَهَ إِلاَّ اللهُ، وَاللَّهُ أَكْبَرُ، وَلاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ\\n",
        "sq": "I Lartësuar qoftë Allahu, Falënderimi i takon Allahut. Nuk ka hyjni që meriton të adhurohet përveç Allahut, Allahu është më i Madhi dhe se nuk ka ndryshim e as forcë përveç se me ndihmën e Allahut.",
        "transliteration": "SubhanAll-llah, vElhamdulil-lah, ve La Ilahe il-lAll-llah, vAll-llahu Ekber, ve La havle ve la kuvvete il-la bil-lah",
        "count": 1,
        "reference": "Ahmedi nën nr. 513. Sipas renditjes së Ahmed Shakirit edhe isnadi i këtij hadithi është i vërtetë “Mexhmeuz-Zevaid” 1/297, Ibën Haxheri në “Bulugul-Meram” thotë se e Nesaiu me transmetimin e Ebi Seidit. Hadithin e kanë bërë të vërtetë edhe Ibën Hibbani dhe Hakimi."
      }
    ]
  },
  {
    "id": 132,
    "categoryId": "shtëpia-dhe-familja",
    "title": "Si bënte tesbih i dërguari i allahut",
    "duas": [
      {
        "id": 252,
        "ar": "",
        "sq": "Shënohet nga Abdullah ibën Omeri (r.a) të ketë thënë: “E kam parë të Dërguarin e Allahut duke bërë tesbih me dorën e djathtë.”",
        "transliteration": "",
        "count": 1,
        "reference": "Ebu Davudi 2/81, Tirmidhiu 5/521, “Sahih el-Xhamiu” 4/27 #4865."
      }
    ]
  },
  {
    "id": 133,
    "categoryId": "mëngjes-dhe-mbrëmje",
    "title": "Disa vepra të mira dhe rregulla të përgjithshme",
    "duas": [
      {
        "id": 253,
        "ar": "وَصَلَّى اللَّهُ وَسَلَّمَ وَبَارَكَ عَلَى نَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَأَصْحَابِهِ أَجْمَعِينَ",
        "sq": "Kur të arrijë mbrëmja, ndaloni fëmijët e juaj, sepse shejtanët shpërndahen në atë kohë, ndërsa kur të kalojë një pjesë e natës, atëherë lëshoni ata, mbyllni dyert dhe përmendeni Allahun [thuani bismil-lah], sepse shejtani nuk e hapë derën e mbyllur; lidhni vorbat dhe përmendeni emrin e Allahut, mbuloni enët dhe përmendeni emrin e Allahut ose mund të vendosni mbi to diçka për së gjëri (p.sh. ndonjë thupër sh.p.) dhe fikni llambat tuaja (d.m.th. fike dritën, zjarrin). Mëshira, shpëtimi dhe bekimi i Allahut qofshin mbi të Dërguarin tonë Muhammedin, familjen e tij dhe mbi të gjithë shokët e tij!",
        "transliteration": "Ve sal-lAll-llahu ve sel-leme ve bareke ala nebij-jina Muhammedin ve ala alihi ve as-habihi exhme’in.",
        "count": 1,
        "reference": "Buhariu “Fet’hul-Bari” 10/88 dhe Muslimi 3/1595."
      }
    ]
  }
];

export function getChaptersByCategory(categoryId: string): MburojaChapter[] {
  return MBUROJA_CHAPTERS.filter(ch => ch.categoryId === categoryId);
}
