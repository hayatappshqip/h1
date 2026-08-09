import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';
import { getLocalSurahData } from '../services/quranCorpusStore';
import { ALL_SURAHS_META } from '../data/quranData';
import { QuranVerseRenderer } from './KuraniView';
import { sanitizeArabicText } from '../utils/arabicUtils';

// Ajete te verifikuara kunder korpusit lokal (114/6236). Pa dublime.
const DAILY_VERSE_KEYS = [
 "13:28",
 "2:286",
 "94:5",
 "2:152",
 "3:139",
 "65:3",
 "39:53"
];

interface AyahData {
 textAr: string;
 textSq: string;
 surahName: string;
 reference: string;
 provider: string;
 translationName: string;
 surahId: number;
 ayahId: number;
}

interface AyahOfTheDayProps {
 onOpenAyah: (surah: number, ayah: number) => void;
}

export const AyahOfTheDay: React.FC<AyahOfTheDayProps> = ({ onOpenAyah }) => {
 const [ayahData, setAyahData] = useState<AyahData | null>(null);
 const [loading, setLoading] = useState(true);
 // Rritet sa here qe korpusi lokal behet gati, per te riprovuar burimin lokal.
 const [corpusTick, setCorpusTick] = useState(0);

 // Korpusi ngarkohet asinkronisht. Pa kete, useEffect-i me [] ekzekutohej nje here
 // para se korpusi te ishte gati dhe binte gjithmone te Quran.com API.
 useEffect(() => {
 let cancelled = false;
 let tries = 0;
 const timer = setInterval(() => {
 tries += 1;
 if (cancelled) return;
 if (getLocalSurahData(1)) {
 setCorpusTick(t => t + 1);
 clearInterval(timer);
 } else if (tries >= 20) {
 clearInterval(timer); // ~20s: dorezohemi, mbetet burimi API
 }
 }, 1000);
 return () => { cancelled = true; clearInterval(timer); };
 }, []);

 useEffect(() => {
 let isMounted = true;

 const fetchAyah = async () => {
 try {
 const localDate = getLocalDateString();
 // Deterministic selection
 const hash = localDate.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
 const verseKey = DAILY_VERSE_KEYS[hash % DAILY_VERSE_KEYS.length];
 const [surahStr, ayahStr] = verseKey.split(':');
 const surahId = parseInt(surahStr, 10);
 const ayahId = parseInt(ayahStr, 10);

 const surahMeta = ALL_SURAHS_META.find(s => s.number === surahId);
 const surahName = surahMeta ? surahMeta.transliteration : `Surja ${surahId}`;

 // 1. Try local DB
 const localSurah = getLocalSurahData(surahId);
 if (localSurah && localSurah.ayahs) {
 const ayah = localSurah.ayahs.find(a => a.numberInSurah === ayahId);
 if (ayah) {
 if (isMounted) {
 setAyahData({
 textAr: ayah.textAr,
 textSq: ayah.textSq,
 surahName,
 reference: `${surahName} ${surahId}:${ayahId}`,
 provider: 'Offline Corpus',
 translationName: 'Dr. Hasan Nahi',
 surahId,
 ayahId
 });
 setLoading(false);
 }
 return;
 }
 }

 // 2. Fallback API
 const response = await fetch(`https://api.quran.com/api/v4/verses/by_key/${verseKey}?language=al&words=false&translations=88&fields=text_uthmani`);
 if (response.ok) {
 const data = await response.json();
 const v = data.verse;
 const tr = v.translations.find((t: any) => t.resource_id === 88);
 
 if (v && tr && isMounted) {
 setAyahData({
 textAr: sanitizeArabicText(v.text_uthmani),
 textSq: tr.text,
 surahName,
 reference: `${surahName} ${surahId}:${ayahId}`,
 provider: 'Quran.com API',
 translationName: 'Hasan Nahi',
 surahId,
 ayahId
 });
 setLoading(false);
 return;
 }
 }

 // Neither succeeded
 if (isMounted) {
 setLoading(false);
 }

 } catch (err) {
 if (isMounted) {
 setLoading(false);
 }
 }
 };

 fetchAyah();
 return () => { isMounted = false; };
 }, [corpusTick]);

 if (loading) {
 return (
 <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 animate-pulse">
 <div className="h-4 bg-slate-800 rounded w-1/3 mb-4"></div>
 <div className="h-10 bg-slate-800 rounded mb-2"></div>
 <div className="h-4 bg-slate-800 rounded w-1/4 ml-auto"></div>
 </div>
 );
 }

 if (!ayahData) {
 return (
 <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-center">
 <p className="text-sm text-slate-400">Ajeti i ditës nuk u ngarkua.</p>
 </div>
 );
 }

 return (
 <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3 relative group">
 <div className="flex justify-between items-center mb-1">
 <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
 Ajeti i Ditës • {ayahData.translationName} ({ayahData.provider})
 </span>
 </div>
 
 <p className="font-arabic text-xl sm:text-2xl text-slate-100 text-right leading-[2.2] select-text" dir="rtl">
 <QuranVerseRenderer 
 textAr={ayahData.textAr} 
 surahNumber={ayahData.surahId} 
 numberInSurah={ayahData.ayahId} 
 showTajweed={false}
 />
 </p>

 <blockquote className="text-sm sm:text-base font-serif italic text-slate-200 leading-relaxed border-l-2 border-emerald-500/30 pl-3">
 "{ayahData.textSq}"
 </blockquote>
 
 <div className="flex justify-between items-center pt-2">
 <button 
 onClick={() => onOpenAyah(ayahData.surahId, ayahData.ayahId)}
 className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-400/10 hover:bg-emerald-400/20 px-2 py-1 rounded-md"
 >
 <BookOpen className="w-3.5 h-3.5" />
 <span>Hap në Kuran</span>
 </button>
 <p className="text-[11px] text-slate-400 font-sans font-medium">— {ayahData.reference}</p>
 </div>
 </div>
 );
};
