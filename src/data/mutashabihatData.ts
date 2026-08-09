export interface MutashabiVerse {
 ayahKey: string; // "109:3"
 surahNumber: number;
 ayahNumber: number;
 surahNameAr: string;
 surahNameEn: string;
 surahNameSq: string;
 textAr: string;
 textSq: string;
 textEn: string;
 highlightedPhraseAr?: string;
 highlightedPhraseSq?: string;
}

export interface MutashabiGroup {
 id: string;
 title: string;
 descriptionSq: string;
 descriptionEn: string;
 verses: MutashabiVerse[];
 keyDifferenceSq: string;
 keyDifferenceEn: string;
}

export const MUTASHABIHAT_DATASET: MutashabiGroup[] = [
 {
 id: 'kafirun-3-5',
 title: 'Surah Al-Kafirun (109:3 & 109:5)',
 descriptionSq: 'Përsëritja e fjalëve "Wa laa antum \'aabidoona maa \'aabud" në ajetet 3 dhe 5 të Surës Al-Kafirun.',
 descriptionEn: 'Repetition of "Nor will you be worshippers of what I worship" in Surah Al-Kafirun verses 3 and 5.',
 verses: [
 {
 ayahKey: '109:3',
 surahNumber: 109,
 ayahNumber: 3,
 surahNameAr: 'الكافرون',
 surahNameEn: 'Al-Kafirun',
 surahNameSq: 'Al-Kafirun',
 textAr: 'وَلَا أَنْتُم عَابِدُون مَا أَعْبُدُ',
 textSq: 'E as ju nuk jeni adhurues të Atij që unë adhuroj.',
 textEn: 'Nor are you worshippers of what I worship.',
 highlightedPhraseAr: 'وَلَا أَنْتُم عَابِدُونَ',
 highlightedPhraseSq: 'E as ju nuk jeni adhurues'
 },
 {
 ayahKey: '109:5',
 surahNumber: 109,
 ayahNumber: 5,
 surahNameAr: 'الكافرون',
 surahNameEn: 'Al-Kafirun',
 surahNameSq: 'Al-Kafirun',
 textAr: 'وَلَا أَنْتُم عَابِدُون مَا أَعْبُدُ',
 textSq: 'E as ju nuk do të jeni adhurues të Atij që unë adhuroj.',
 textEn: 'Nor will you be worshippers of what I worship.',
 highlightedPhraseAr: 'وَلَا أَنْتُم عَابِدُونَ',
 highlightedPhraseSq: 'E as ju nuk do të jeni'
 }
 ],
 keyDifferenceSq: 'Ajeti 3 i drejtohet të tashmes (ju nuk adhuroni tani), ndërsa ajeti 5 i drejtohet të ardhmes pas ajetit 4 (dhe as në të ardhmen nuk do të adhuroni).',
 keyDifferenceEn: 'Verse 3 addresses present state, whereas verse 5 addresses future consistency following verse 4.'
 },
 {
 id: 'abraar-infitar-mutaffifin',
 title: 'Innal-Abraara Lafi Na\'im (82:13 vs 83:22)',
 descriptionSq: 'Përshkrimi i shpërblimit të bamirësve (Al-Abrar) në Surën Al-Infitar dhe Surën Al-Mutaffifin.',
 descriptionEn: 'Description of the reward of the righteous (Al-Abrar) in Al-Infitar and Al-Mutaffifin.',
 verses: [
 {
 ayahKey: '82:13',
 surahNumber: 82,
 ayahNumber: 13,
 surahNameAr: 'الإنفطار',
 surahNameEn: 'Al-Infitar',
 surahNameSq: 'Al-Infitar',
 textAr: 'إِن الْأَبْرَار لَفِي نَعِيمٍ',
 textSq: 'Me të vërtetë, bamirësit do të jenë në mirëqenie (Xhenet).',
 textEn: 'Indeed, the righteous will be in pleasure.',
 highlightedPhraseAr: 'إِن الْأَبْرَار لَفِي نَعِيمٍ',
 highlightedPhraseSq: 'bamirësit do të jenë në mirëqenie'
 },
 {
 ayahKey: '83:22',
 surahNumber: 83,
 ayahNumber: 22,
 surahNameAr: 'المطففين',
 surahNameEn: 'Al-Mutaffifin',
 surahNameSq: 'Al-Mutaffifin',
 textAr: 'إِن الْأَبْرَار لَفِي نَعِيمٍ',
 textSq: 'Me të vërtetë, punëmirët do të jenë në mirëqenie e kënaqësi.',
 textEn: 'Indeed, the righteous will be in pleasure.',
 highlightedPhraseAr: 'إِن الْأَبْرَار لَفِي نَعِيمٍ',
 highlightedPhraseSq: 'punëmirët do të jenë në mirëqenie'
 }
 ],
 keyDifferenceSq: 'Në Al-Infitar (82:13) pasrohet menjëherë me ajetin e kundërt "Wa innal fujjaara lafi xhahim" (82:14). Në Al-Mutaffifin (83:22) pason përshkrimi i kolltuqeve "Alal araa\'iki yandhurun" (83:23).',
 keyDifferenceEn: 'In Al-Infitar (82:13) it is immediately followed by the wicked in Hellfire (82:14). In Al-Mutaffifin (83:22) it is followed by reclining on couches (83:23).'
 },
 {
 id: 'fujjaar-infitar-mutaffifin',
 title: 'Fujjaar & Sijjeen vs Jahim (82:14 vs 83:7)',
 descriptionSq: 'Përshkrimi i të këqijve (Al-Fujjar) në Surën Al-Infitar dhe Surën Al-Mutaffifin.',
 descriptionEn: 'Description of the wicked in Al-Infitar vs Al-Mutaffifin.',
 verses: [
 {
 ayahKey: '82:14',
 surahNumber: 82,
 ayahNumber: 14,
 surahNameAr: 'الإنفطار',
 surahNameEn: 'Al-Infitar',
 surahNameSq: 'Al-Infitar',
 textAr: 'وَإِن الْفُجَّار لَفِي جَحِيمٍ',
 textSq: 'Dhe me të vërtetë, mëkatarët (fujjar) do të jenë në Xhehenem (Jahim).',
 textEn: 'And indeed, the wicked will be in Hellfire.',
 highlightedPhraseAr: 'لَفِي جَحِيمٍ',
 highlightedPhraseSq: 'do të jenë në Xhehenem (Jahim)'
 },
 {
 ayahKey: '83:7',
 surahNumber: 83,
 ayahNumber: 7,
 surahNameAr: 'المطففين',
 surahNameEn: 'Al-Mutaffifin',
 surahNameSq: 'Al-Mutaffifin',
 textAr: 'كَلَّا إِن كِتَاب الْفُجَّار لَفِي سِجِّينٍ',
 textSq: 'Rregullisht, libri i mëkatarëve është në Sijjin.',
 textEn: 'No! Indeed, the record of the wicked is in Sijjeen.',
 highlightedPhraseAr: 'كِتَاب الْفُجَّار لَفِي سِجِّينٍ',
 highlightedPhraseSq: 'libri i mëkatarëve është në Sijjin'
 }
 ],
 keyDifferenceSq: 'Al-Infitar thotë "Wa innal fujjaara lafii XHAHIM". Al-Mutaffifin përmend "Kalla inna KITAABAL fujjaari lafii SIJJEEN".',
 keyDifferenceEn: 'Al-Infitar directly mentions place "Jahim", while Al-Mutaffifin mentions "Kitaab" (record) in "Sijjeen".'
 },
 {
 id: 'wujoohun-ghashiyah',
 title: 'Wujoohun Yawma\'idhin (88:2 vs 88:8)',
 descriptionSq: 'Fytyrat atë ditë në Surën Al-Ghashiyah (Khashi\'ah vs Na\'imah).',
 descriptionEn: 'Faces on that Day in Surah Al-Ghashiyah (Humiliated vs Joyful).',
 verses: [
 {
 ayahKey: '88:2',
 surahNumber: 88,
 ayahNumber: 2,
 surahNameAr: 'الغاشية',
 surahNameEn: 'Al-Ghashiyah',
 surahNameSq: 'Al-Ghashiyah',
 textAr: 'وُجُوه يَوْمَئِذ خَاشِعَةٌ',
 textSq: 'Fytyrat atë ditë do të jenë të përulura (dhe të turpëruara).',
 textEn: 'Some faces, that Day, will be humbled,',
 highlightedPhraseAr: 'خَاشِعَةٌ',
 highlightedPhraseSq: 'të përulura (khashi\'ah)'
 },
 {
 ayahKey: '88:8',
 surahNumber: 88,
 ayahNumber: 8,
 surahNameAr: 'الغاشية',
 surahNameEn: 'Al-Ghashiyah',
 surahNameSq: 'Al-Ghashiyah',
 textAr: 'وُجُوه يَوْمَئِذ نَاعِمَةٌ',
 textSq: 'Fytyra të tjera atë ditë do të jenë të gëzuara e të ndritshme.',
 textEn: 'Other faces, that Day, will show pleasure,',
 highlightedPhraseAr: 'نَاعِمَةٌ',
 highlightedPhraseSq: 'të gëzuara (na\'imah)'
 }
 ],
 keyDifferenceSq: 'Ajeti 2 hap përshkrimin e banorëve të Zjarrit (Khashi\'ah - të përulura). Ajeti 8 kalon te përshkrimi i banorëve të Xhenetit (Na\'imah - të gëzuara).',
 keyDifferenceEn: 'Verse 2 starts description of Hell dwellers (Khashi\'ah). Verse 8 shifts to Paradise dwellers (Na\'imah).'
 },
 {
 id: 'takathur-sawfa-ta\'lamun',
 title: 'Kalla Sawfa Ta\'lamun (102:3 vs 102:4)',
 descriptionSq: 'Përsëritja me "Thumma" në Surën At-Takathur.',
 descriptionEn: 'Repetition with "Thumma" in Surah At-Takathur.',
 verses: [
 {
 ayahKey: '102:3',
 surahNumber: 102,
 ayahNumber: 3,
 surahNameAr: 'التكاثر',
 surahNameEn: 'At-Takathur',
 surahNameSq: 'At-Takathur',
 textAr: 'كَلَّا سَوْف تَعْلَمُونَ',
 textSq: 'Përseri jo! Më vonë do ta merrni vesh!',
 textEn: 'No! You are going to know.',
 highlightedPhraseAr: 'كَلَّا سَوْفَ',
 highlightedPhraseSq: 'Përseri jo!'
 },
 {
 ayahKey: '102:4',
 surahNumber: 102,
 ayahNumber: 4,
 surahNameAr: 'التكاثر',
 surahNameEn: 'At-Takathur',
 surahNameSq: 'At-Takathur',
 textAr: 'ثُم كَلَّا سَوْف تَعْلَمُونَ',
 textSq: 'Aty për aty, jo! Më vonë përsëri do ta merrni vesh!',
 textEn: 'Then no! You are going to know.',
 highlightedPhraseAr: 'ثُم كَلَّا',
 highlightedPhraseSq: 'Aty për aty, jo! (Thumma kalla)'
 }
 ],
 keyDifferenceSq: 'Ajeti 4 shton fjalën "Thumma" (ثُم) në fillim për theksim edhe më të fortë paralajmërues.',
 keyDifferenceEn: 'Verse 4 adds the word "Thumma" (Then) at the beginning for stronger emphasis.'
 },
 {
 id: 'mawaazinuh-qariah',
 title: 'Mawazinuh: Thaqulat vs Khaffat (101:6 vs 101:8)',
 descriptionSq: 'Pesha e veprave në Surën Al-Qari\'ah.',
 descriptionEn: 'The weight of deeds in Surah Al-Qari\'ah.',
 verses: [
 {
 ayahKey: '101:6',
 surahNumber: 101,
 ayahNumber: 6,
 surahNameAr: 'القارعة',
 surahNameEn: 'Al-Qari\'ah',
 surahNameSq: 'Al-Qari\'ah',
 textAr: 'فَأَمَّا مَن ثَقُلَت مَوَازِينُهُ',
 textSq: 'E sa i përket atij që i rëndohet peshoja e veprave të mira,',
 textEn: 'Then as for one whose scales are heavy [with good deeds],',
 highlightedPhraseAr: 'ثَقُلَتْ',
 highlightedPhraseSq: 'i rëndohet (Thaqulat)'
 },
 {
 ayahKey: '101:8',
 surahNumber: 101,
 ayahNumber: 8,
 surahNameAr: 'القارعة',
 surahNameEn: 'Al-Qari\'ah',
 surahNameSq: 'Al-Qari\'ah',
 textAr: 'وَأَمَّا مَن خَفَّت مَوَازِينُهُ',
 textSq: 'Kurse ai që i lehtësohet peshoja e veprave të mira,',
 textEn: 'But as for one whose scales are light,',
 highlightedPhraseAr: 'خَفَّتْ',
 highlightedPhraseSq: 'i lehtësohet (Khaffat)'
 }
 ],
 keyDifferenceSq: 'Në ajetin 6 përdoret "Fa-ammaa" me "Thaqulat" (e rëndë -> "ishatin radiyah"). Në ajetin 8 përdoret "Wa-ammaa" me "Khaffat" (e lehtë -> "Fa-ummuhu hawiyah").',
 keyDifferenceEn: 'Verse 6 uses "Fa-ammaa" + "Thaqulat" (heavy). Verse 8 uses "Wa-ammaa" + "Khaffat" (light).'
 }
];

export function getMutashabihatForAyah(surahNumber: number, ayahNumber: number): MutashabiGroup[] {
 const key = `${surahNumber}:${ayahNumber}`;
 return MUTASHABIHAT_DATASET.filter(group => 
 group.verses.some(v => v.ayahKey === key)
 );
}
