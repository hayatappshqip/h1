import React, { useState, useEffect, useRef } from 'react';
import { getSurahData } from '../services/quranApi';
import { sanitizeArabicText } from '../utils/arabicUtils';
import { QuranSurahData, Ayah } from '../types';
import { ALL_SURAHS_META } from '../data/quranData';
import { Play, Pause, ChevronRight, Check, Eye, EyeOff, RotateCcw, Volume2, BookOpen, Mic } from 'lucide-react';
import { hifzDb, HifzSettings, DEFAULT_HIFZ_SETTINGS } from '../services/hifzDb';
import { processReviewResult } from '../services/hifzScheduler';
import { QURAN_RECITERS } from './KuraniView';
import { HifzSelfRecorder } from './HifzSelfRecorder';
import { MutashabihatBanner } from './MutashabihatBanner';

interface WordByWord {
 id: number;
 position: number;
 textUthmani: string;
 translation: string;
 transliteration: string;
 audioUrl: string | null;
}

type Stage = 'LISTEN' | 'UNDERSTAND' | 'READ_ALONG' | 'RECITE_VISIBLE' | 'RECITE_HIDDEN' | 'CONNECT' | 'ASSESS';

interface Props {
 surahNumber: number;
 ayahNumber: number;
 onComplete: (result: 'KNEW' | 'STRUGGLED' | 'FORGOT', stumblePoints: number[]) => void;
 onClose: () => void;
}

export const HifzLearnView: React.FC<Props> = ({ surahNumber, ayahNumber, onComplete, onClose }) => {
 const [stage, setStage] = useState<Stage>('LISTEN');
 const [settings, setSettings] = useState<HifzSettings>(DEFAULT_HIFZ_SETTINGS);
 const [surahData, setSurahData] = useState<QuranSurahData | null>(null);
 const [ayahData, setAyahData] = useState<Ayah | null>(null);
 const [words, setWords] = useState<WordByWord[]>([]);
 const [loading, setLoading] = useState(true);
 
 // Audio state
 const audioRef = useRef<HTMLAudioElement | null>(null);
 const [isPlaying, setIsPlaying] = useState(false);
 const [listenCount, setListenCount] = useState(0);
 
 // Hidden state
 const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set());
 const [allStumblePoints, setAllStumblePoints] = useState<Set<number>>(new Set());
 
 const currentReciter = QURAN_RECITERS.find(r => r.key === settings.reciterId) || QURAN_RECITERS[0];
 
 useEffect(() => {
 // Load settings
 hifzDb.settings.get(1).then(s => {
 if (s) setSettings(s);
 });
 
 // Load ayah data
 getSurahData(surahNumber).then(data => {
 setSurahData(data);
 const a = data.ayahs.find(x => x.numberInSurah === ayahNumber);
 if (a) setAyahData(a);
 });
 
 // Load word by word
 fetch(`https://api.quran.com/api/v4/verses/by_key/${surahNumber}:${ayahNumber}?language=${settings.uiLanguage}&words=true&word_fields=text_uthmani,translation`)
 .then(res => res.json())
 .then(json => {
 if (json.verse && json.verse.words) {
 const w = json.verse.words.filter((x: any) => x.char_type_name === 'word').map((x: any) => ({
 id: x.id,
 position: x.position,
 textUthmani: sanitizeArabicText(x.text_uthmani),
 translation: x.translation?.text || '',
 transliteration: x.transliteration?.text || '',
 audioUrl: x.audio_url ? `https://verses.quran.com/${x.audio_url}` : null
 }));
 setWords(w);
 }
 setLoading(false);
 })
 .catch(() => setLoading(false));
 
 return () => {
 if (audioRef.current) {
 audioRef.current.pause();
 }
 };
 }, [surahNumber, ayahNumber]);
 
 // Stage logic
 const handleNextStage = () => {
 if (audioRef.current) {
 audioRef.current.pause();
 setIsPlaying(false);
 }
 setListenCount(0);
 
 switch (stage) {
 case 'LISTEN': setStage(settings.showWordByWord ? 'UNDERSTAND' : 'READ_ALONG'); break;
 case 'UNDERSTAND': setStage('READ_ALONG'); break;
 case 'READ_ALONG': setStage('RECITE_VISIBLE'); break;
 case 'RECITE_VISIBLE': setStage('RECITE_HIDDEN'); break;
 case 'RECITE_HIDDEN': setStage('CONNECT'); break;
 case 'CONNECT': setStage('ASSESS'); break;
 default: break;
 }
 };
 
 // Play audio
 const toggleAudio = () => {
 if (!audioRef.current) {
 const url = currentReciter.getAyahAudioUrl(surahNumber, ayahNumber);
 audioRef.current = new Audio(url);
 audioRef.current.onended = () => {
 setListenCount(prev => prev + 1);
 setIsPlaying(false);
 // Auto replay if in LISTEN or READ_ALONG and not reached target
 const target = stage === 'LISTEN' ? settings.listenRepeats : settings.readAlongRepeats;
 if (listenCount + 1 < target) {
 setTimeout(() => {
 audioRef.current?.play().catch(() => {});
 setIsPlaying(true);
 }, 500);
 }
 };
 }
 
 if (isPlaying) {
 audioRef.current.pause();
 setIsPlaying(false);
 } else {
 audioRef.current.play().catch(e => console.error(e));
 setIsPlaying(true);
 }
 };
 
 // Auto play when entering LISTEN or READ_ALONG
 useEffect(() => {
 if (stage === 'LISTEN' || stage === 'READ_ALONG') {
 if (audioRef.current) {
 audioRef.current.pause();
 audioRef.current = null;
 }
 setListenCount(0);
 setTimeout(toggleAudio, 300);
 }
 }, [stage]);

 if (loading || !ayahData) {
 return (
 <div className="flex items-center justify-center h-64">
 <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
 </div>
 );
 }
 
 const surahMeta = ALL_SURAHS_META.find(s => s.number === surahNumber);

 return (
 <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col h-[85vh]">
 {/* Header */}
 <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
 <div className="flex flex-col">
 <span className="text-xs font-medium text-emerald-500 font-mono tracking-wider uppercase">Hifz Module</span>
 <h2 className="text-lg font-semibold text-slate-100">{surahMeta?.transliteration} • Ayah {ayahNumber}</h2>
 </div>
 <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/50 rounded-full transition-colors">
 <ChevronRight className="w-5 h-5" />
 </button>
 </div>
 
 {/* Stage Indicator */}
 <div className="flex items-center justify-center p-3 border-b border-slate-800 bg-slate-900">
 <div className="flex space-x-1 sm:space-x-2">
 {['LISTEN', 'UNDERSTAND', 'READ_ALONG', 'RECITE_VISIBLE', 'RECITE_HIDDEN', 'CONNECT', 'ASSESS'].map((s, idx) => {
 if (s === 'UNDERSTAND' && !settings.showWordByWord) return null;
 const stages = ['LISTEN', 'UNDERSTAND', 'READ_ALONG', 'RECITE_VISIBLE', 'RECITE_HIDDEN', 'CONNECT', 'ASSESS'];
 const currentIndex = stages.indexOf(stage);
 const isPast = stages.indexOf(s) < currentIndex;
 const isCurrent = s === stage;
 return (
 <div key={s} className="flex items-center">
 <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${isCurrent ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : isPast ? 'bg-emerald-700' : 'bg-slate-700'}`} />
 {idx < stages.length - 1 && <div className={`h-px w-3 sm:w-6 ${isPast ? 'bg-emerald-700' : 'bg-slate-800'}`} />}
 </div>
 );
 })}
 </div>
 </div>
 
 {/* Content Area */}
 <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center relative">
 
 {stage === 'LISTEN' && (
 <div className="w-full max-w-2xl text-center space-y-8">
 <div className="inline-flex items-center justify-center p-4 bg-emerald-950/30 rounded-full text-emerald-400 mb-2">
 <Volume2 className="w-8 h-8" />
 </div>
 <h3 className="text-xl font-medium text-slate-300">Listen Carefully</h3>
 <p className="text-[32px] sm:text-[42px] leading-[1.8] text-slate-100 font-arabic text-right dir-rtl px-4" dir="rtl">
 {ayahData.textAr}
 </p>
 <div className="font-mono text-emerald-400 text-lg">
 {listenCount} / {settings.listenRepeats}
 </div>
 </div>
 )}
 
 {stage === 'UNDERSTAND' && (
 <div className="w-full max-w-2xl space-y-8">
 <h3 className="text-xl font-medium text-slate-300 text-center mb-6">Understand Word by Word</h3>
 <div className="flex flex-wrap justify-end gap-x-6 gap-y-8 dir-rtl" dir="rtl">
 {words.map((w, idx) => (
 <div key={idx} className="flex flex-col items-center">
 <span className="text-[28px] text-emerald-300 font-arabic mb-2">{w.textUthmani}</span>
 <span className="text-sm text-slate-400 font-mono mb-1">{w.transliteration}</span>
 <span className="text-sm text-slate-200">{w.translation}</span>
 </div>
 ))}
 </div>
 <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
 <p className="text-slate-300 text-center">{ayahData.textSq}</p>
 </div>
 </div>
 )}
 
 {stage === 'READ_ALONG' && (
 <div className="w-full max-w-2xl text-center space-y-8">
 <div className="inline-flex items-center justify-center p-4 bg-blue-950/30 rounded-full text-blue-400 mb-2">
 <BookOpen className="w-8 h-8" />
 </div>
 <h3 className="text-xl font-medium text-slate-300">Read Along with Audio</h3>
 <p className="text-[32px] sm:text-[42px] leading-[1.8] text-slate-100 font-arabic text-right dir-rtl px-4" dir="rtl">
 {ayahData.textAr}
 </p>
 <div className="font-mono text-blue-400 text-lg">
 {listenCount} / {settings.readAlongRepeats}
 </div>
 </div>
 )}
 
 {stage === 'RECITE_VISIBLE' && (
 <div className="w-full max-w-2xl text-center space-y-8">
 <div className="inline-flex items-center justify-center p-4 bg-amber-950/30 rounded-full text-amber-400 mb-2">
 <Mic className="w-8 h-8" />
 </div>
 <h3 className="text-xl font-medium text-slate-300">Recite Aloud (Text Visible)</h3>
 <p className="text-[32px] sm:text-[42px] leading-[1.8] text-slate-100 font-arabic text-right dir-rtl px-4" dir="rtl">
 {ayahData.textAr}
 </p>
 <div className="flex flex-col items-center justify-center space-y-4">
 <div className="font-mono text-amber-400 text-lg">
 {listenCount} / {settings.reciteVisibleRepeats}
 </div>
 <button 
 onClick={() => setListenCount(p => p + 1)}
 className="px-6 py-2 bg-amber-600/20 text-amber-400 rounded-full hover:bg-amber-600/30 transition-colors border border-amber-500/30"
 >
 I recited it
 </button>
 </div>
 
 <div className="mt-8 pt-8 border-t border-slate-800/50 w-full space-y-4">
 <MutashabihatBanner surahNumber={surahNumber} ayahNumber={ayahNumber} />
 <HifzSelfRecorder 
 ayahKey={`${surahNumber}:${ayahNumber}`}
 referenceAudioUrl={currentReciter.getAyahAudioUrl(surahNumber, ayahNumber)}
 />
 </div>
 </div>
 )}
 
 {stage === 'RECITE_HIDDEN' && (
 <div className="w-full max-w-2xl text-center space-y-8">
 <div className="inline-flex items-center justify-center p-4 bg-purple-950/30 rounded-full text-purple-400 mb-2">
 <EyeOff className="w-8 h-8" />
 </div>
 <h3 className="text-xl font-medium text-slate-300">Recite from Memory</h3>
 <p className="text-sm text-slate-400">Tap any blurred word if you forget it</p>
 
 <div className="flex flex-wrap justify-end gap-x-2 gap-y-6 dir-rtl mt-6" dir="rtl">
 {words.map((w, idx) => (
 <button 
 key={idx} 
 onClick={() => {
 setRevealedWords(prev => new Set(prev).add(w.position));
 setAllStumblePoints(prev => new Set(prev).add(w.position));
 }}
 className={`px-1 py-0.5 rounded transition-all duration-300 ${revealedWords.has(w.position) ? 'bg-transparent' : 'bg-slate-700/80 blur-sm hover:blur-none cursor-pointer'}`}
 >
 <span className="text-[32px] sm:text-[42px] text-slate-100 font-arabic">{w.textUthmani}</span>
 </button>
 ))}
 </div>
 
 <div className="flex flex-col items-center justify-center space-y-4 pt-8">
 <div className="font-mono text-purple-400 text-lg">
 {listenCount} / {settings.reciteHiddenRepeats}
 </div>
 <button 
 onClick={() => {
 setListenCount(p => p + 1);
 setRevealedWords(new Set()); // re-hide
 }}
 className="px-6 py-2 bg-purple-600/20 text-purple-400 rounded-full hover:bg-purple-600/30 transition-colors border border-purple-500/30"
 >
 I recited it
 </button>
 </div>

 <div className="mt-8 pt-8 border-t border-slate-800/50 w-full space-y-4">
 <MutashabihatBanner surahNumber={surahNumber} ayahNumber={ayahNumber} />
 <HifzSelfRecorder 
 ayahKey={`${surahNumber}:${ayahNumber}`}
 referenceAudioUrl={currentReciter.getAyahAudioUrl(surahNumber, ayahNumber)}
 />
 </div>
 </div>
 )}
 
 {stage === 'CONNECT' && (
 <div className="w-full max-w-2xl text-center space-y-8">
 <h3 className="text-xl font-medium text-slate-300">Connect with Previous</h3>
 <p className="text-sm text-slate-400 mb-6">Recite from the beginning of the Surah (or previous 3 ayahs) up to this one to build the transition.</p>
 <div className="flex flex-col space-y-2 opacity-70">
 {surahData && surahData.ayahs
 .filter(a => a.numberInSurah >= Math.max(1, ayahNumber - 3) && a.numberInSurah < ayahNumber)
 .map(a => (
 <p key={a.numberInSurah} className="text-[28px] leading-[1.8] text-slate-300 font-arabic text-right dir-rtl" dir="rtl">
 {a.textAr} 
 <span className="text-slate-500 text-sm ml-2 font-sans mr-2">({a.numberInSurah})</span>
 </p>
 ))}
 </div>
 <p className="text-[32px] leading-[1.8] text-emerald-300 font-arabic text-right dir-rtl mt-4 border-r-4 border-emerald-500 pr-4" dir="rtl">
 {ayahData.textAr}
 <span className="text-emerald-500 text-sm font-sans mr-2">({ayahNumber})</span>
 </p>
 
 <button 
 onClick={handleNextStage}
 className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 transition-colors font-medium shadow-lg shadow-emerald-900/50"
 >
 Ready for Assessment
 </button>
 </div>
 )}
 
 {stage === 'ASSESS' && (
 <div className="w-full max-w-2xl text-center space-y-8">
 <h3 className="text-2xl font-semibold text-slate-100">How well do you know it?</h3>
 <p className="text-slate-400">Be honest. This schedules your next review.</p>
 
 <div className="flex flex-col space-y-4 max-w-xs mx-auto pt-6">
 <button 
 onClick={() => onComplete('KNEW', Array.from(allStumblePoints))}
 className="px-6 py-4 bg-emerald-600/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/20 rounded-xl transition-all font-medium text-lg flex items-center justify-center space-x-2"
 >
 <Check className="w-5 h-5" />
 <span>I Knew It</span>
 </button>
 <button 
 onClick={() => onComplete('STRUGGLED', Array.from(allStumblePoints))}
 className="px-6 py-4 bg-amber-600/10 text-amber-400 border border-amber-500/30 hover:bg-amber-600/20 rounded-xl transition-all font-medium text-lg flex items-center justify-center space-x-2"
 >
 <RotateCcw className="w-5 h-5" />
 <span>I Struggled</span>
 </button>
 <button 
 onClick={() => onComplete('FORGOT', Array.from(allStumblePoints))}
 className="px-6 py-4 bg-red-600/10 text-red-400 border border-red-500/30 hover:bg-red-600/20 rounded-xl transition-all font-medium text-lg flex items-center justify-center space-x-2"
 >
 <EyeOff className="w-5 h-5" />
 <span>I Forgot</span>
 </button>
 </div>
 </div>
 )}
 
 </div>
 
 {/* Footer Controls */}
 {stage !== 'ASSESS' && stage !== 'CONNECT' && (
 <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
 <button 
 onClick={toggleAudio}
 className={`p-3 rounded-full transition-colors ${isPlaying ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
 disabled={stage === 'RECITE_VISIBLE' || stage === 'RECITE_HIDDEN'}
 >
 {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
 </button>
 
 <button 
 onClick={handleNextStage}
 className="px-6 py-2 bg-slate-100 text-slate-900 rounded-full font-medium hover:bg-white transition-colors flex items-center space-x-2"
 >
 <span>Next Stage</span>
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 )}
 </div>
 );
};
