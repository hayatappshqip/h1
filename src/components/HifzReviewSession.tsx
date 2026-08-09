import React, { useState, useEffect } from 'react';
import { AyahMemorizationRecord } from '../services/hifzDb';
import { getSurahData } from '../services/quranApi';
import { processReviewResult } from '../services/hifzScheduler';
import { ALL_SURAHS_META } from '../data/quranData';
import { Check, Eye, EyeOff, RotateCcw, ChevronRight } from 'lucide-react';
import { HifzSelfRecorder } from './HifzSelfRecorder';
import { MutashabihatBanner } from './MutashabihatBanner';
import { QURAN_RECITERS } from './KuraniView';
import { hifzDb, HifzSettings, DEFAULT_HIFZ_SETTINGS } from '../services/hifzDb';

interface Props {
 queue: AyahMemorizationRecord[];
 onClose: () => void;
 onComplete: () => void;
}

export const HifzReviewSession: React.FC<Props> = ({ queue, onClose, onComplete }) => {
 const [currentIndex, setCurrentIndex] = useState(0);
 const [ayahTextAr, setAyahTextAr] = useState<string>('');
 const [ayahTextSq, setAyahTextSq] = useState<string>('');
 const [isRevealed, setIsRevealed] = useState(false);
 const [loading, setLoading] = useState(true);
 const [settings, setSettings] = useState<HifzSettings>(DEFAULT_HIFZ_SETTINGS);

 const currentRecord = queue[currentIndex];

 useEffect(() => {
 hifzDb.settings.get(1).then(s => {
 if (s) setSettings(s);
 });
 }, []);

 useEffect(() => {
 if (!currentRecord) return;
 setLoading(true);
 setIsRevealed(false);
 const [surah, ayah] = currentRecord.ayahKey.split(':').map(Number);
 
 getSurahData(surah).then(data => {
 const a = data.ayahs.find(x => x.numberInSurah === ayah);
 if (a) {
 setAyahTextAr(a.textAr);
 setAyahTextSq(a.textSq);
 }
 setLoading(false);
 });
 }, [currentRecord]);

 if (!currentRecord) {
 return null;
 }

 const [surahNum, ayahNum] = currentRecord.ayahKey.split(':').map(Number);
 const surahMeta = ALL_SURAHS_META.find(s => s.number === surahNum);

 const handleResult = async (result: 'KNEW' | 'STRUGGLED' | 'FORGOT') => {
 await processReviewResult(currentRecord.ayahKey, result, []);
 
 if (currentIndex < queue.length - 1) {
 setCurrentIndex(prev => prev + 1);
 } else {
 onComplete();
 }
 };

 return (
 <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col h-[85vh]">
 {/* Header */}
 <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
 <div className="flex flex-col">
 <span className="text-xs font-medium text-emerald-500 font-mono tracking-wider uppercase">Review Session</span>
 <h2 className="text-lg font-semibold text-slate-100">
 {surahMeta?.transliteration} • Ayah {ayahNum}
 </h2>
 </div>
 <div className="flex items-center space-x-4">
 <span className="text-sm font-mono text-slate-400">
 {currentIndex + 1} / {queue.length}
 </span>
 <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/50 rounded-full transition-colors">
 <ChevronRight className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Content Area */}
 <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col items-center justify-center relative">
 {loading ? (
 <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
 ) : (
 <div className="w-full max-w-2xl text-center space-y-8">
 <h3 className="text-xl font-medium text-slate-300">Recite from Memory</h3>
 
 {!isRevealed ? (
 <button 
 onClick={() => setIsRevealed(true)}
 className="w-full py-16 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 border-dashed rounded-2xl transition-colors flex flex-col items-center justify-center space-y-4"
 >
 <Eye className="w-10 h-10 text-slate-500" />
 <span className="text-slate-400 font-medium">Tap to reveal Ayah</span>
 </button>
 ) : (
 <div className="space-y-6 animate-in fade-in zoom-in duration-300">
 <p className="text-[32px] sm:text-[42px] leading-[1.8] text-slate-100 font-arabic text-right dir-rtl px-4" dir="rtl">
 {ayahTextAr}
 </p>
 <p className="text-slate-400">{ayahTextSq}</p>
 </div>
 )}
 
 <div className="mt-8 pt-8 border-t border-slate-800/50 w-full space-y-4">
 <MutashabihatBanner surahNumber={surahNum} ayahNumber={ayahNum} />
 <HifzSelfRecorder 
 ayahKey={currentRecord.ayahKey}
 referenceAudioUrl={(QURAN_RECITERS.find(r => r.key === settings.reciterId) || QURAN_RECITERS[0]).getAyahAudioUrl(surahNum, ayahNum)}
 />
 </div>

 {isRevealed && (
 <div className="pt-8 border-t border-slate-800/50 animate-in slide-in-from-bottom-4 duration-500">
 <h4 className="text-lg font-semibold text-slate-200 mb-6">How did you do?</h4>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <button 
 onClick={() => handleResult('FORGOT')}
 className="p-4 bg-red-950/30 text-red-400 hover:bg-red-900/40 border border-red-900/50 rounded-xl transition-colors flex flex-col items-center space-y-2"
 >
 <EyeOff className="w-6 h-6" />
 <span className="font-medium">I Forgot</span>
 <span className="text-xs opacity-70">&lt; 1d</span>
 </button>
 <button 
 onClick={() => handleResult('STRUGGLED')}
 className="p-4 bg-amber-950/30 text-amber-400 hover:bg-amber-900/40 border border-amber-900/50 rounded-xl transition-colors flex flex-col items-center space-y-2"
 >
 <RotateCcw className="w-6 h-6" />
 <span className="font-medium">I Struggled</span>
 <span className="text-xs opacity-70">Hard</span>
 </button>
 <button 
 onClick={() => handleResult('KNEW')}
 className="p-4 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40 border border-emerald-900/50 rounded-xl transition-colors flex flex-col items-center space-y-2"
 >
 <Check className="w-6 h-6" />
 <span className="font-medium">I Knew It</span>
 <span className="text-xs opacity-70">Good</span>
 </button>
 </div>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 );
};
