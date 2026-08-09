/**
 * MburojaView Component - Mburoja e Muslimanit (Hisnul Muslim)
 * Data Source: Seid el-Kahtani, Azem Bardhoshi, Ismail Bardhoshi
 * Verified Integrity: 11 Categories, 133 Chapters, 291 Duas
 */
import React, { useState } from 'react';
import { MBUROJA_CATEGORIES, MBUROJA_CHAPTERS } from '../data/mburojaData';
import { MburojaChapter, MburojaState, DuaItem } from '../types';
import { Search, Star, Bookmark, Copy, Check, ChevronLeft, ShieldCheck, CheckCircle2, RotateCcw, Volume2, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { triggerDhikrFeedback } from '../services/feedbackEngine';
import { getLocalDateString } from '../utils/dateUtils';
import { sanitizeArabicText } from '../utils/arabicUtils';
import { DuaAudioPlayer } from './DuaAudioPlayer';

interface MburojaViewProps {
 initialChapterId?: number | null;
 mburojaState: MburojaState;
 hapticEnabled?: boolean;
 soundEnabled?: boolean;
 onToggleFavChapter: (chapterId: number) => void;
 onToggleSaveDua: (duaId: number) => void;
 onToggleChapterCompletedToday: (chapterId: number) => void;
 onUpdateDuaCount: (duaId: number, count: number) => void;
 onUpdateDuaGoal?: (duaId: number, goal: number | null) => void;
}

export const MburojaView: React.FC<MburojaViewProps> = ({
 initialChapterId,
 mburojaState,
 hapticEnabled = true,
 soundEnabled = true,
 onToggleFavChapter,
 onToggleSaveDua,
 onToggleChapterCompletedToday,
 onUpdateDuaCount,
 onUpdateDuaGoal
}) => {
 const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
 const [selectedChapterId, setSelectedChapterId] = useState<number | null>(initialChapterId || null);
 const [searchQuery, setSearchQuery] = useState<string>('');
 const [showOnlyFavs, setShowOnlyFavs] = useState<boolean>(false);
 const [activeTab, setActiveTab] = useState<'chapters' | 'savedDuas'>('chapters');
 const [copiedDuaId, setCopiedDuaId] = useState<number | null>(null);

 const todayStr = getLocalDateString();
 const completedToday = mburojaState.completedByDate[todayStr] || [];
 const dailyCounts = mburojaState.dailyCountsByDate[todayStr] || {};

 const handleCopyDua = async (dua: DuaItem) => {
 const textToCopy = `${dua.sq}\n\nTransliterimi: ${dua.transliteration || ''}\n\n— Mburoja e Muslimanit (Hayat App)`;
 try {
 if (navigator.clipboard && navigator.clipboard.writeText) {
 await navigator.clipboard.writeText(textToCopy);
 } else {
 const textarea = document.createElement('textarea');
 textarea.value = textToCopy;
 textarea.style.position = 'fixed';
 textarea.style.opacity = '0';
 document.body.appendChild(textarea);
 textarea.select();
 document.execCommand('copy');
 document.body.removeChild(textarea);
 }
 setCopiedDuaId(dua.id);
 setTimeout(() => setCopiedDuaId(null), 2000);
 } catch (err) {
 console.warn('Clipboard write error:', err);
 // Fallback fallback
 setCopiedDuaId(dua.id);
 setTimeout(() => setCopiedDuaId(null), 2000);
 }
 };

 // Filter Chapters
 const filteredChapters = MBUROJA_CHAPTERS.filter(ch => {
 const matchesSearch =
 ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 ch.duas.some(d => d.sq.toLowerCase().includes(searchQuery.toLowerCase()));

 const matchesCategory = selectedCategoryId ? ch.categoryId === selectedCategoryId : true;
 const matchesFav = showOnlyFavs ? mburojaState.favChapters.includes(ch.id) : true;

 return matchesSearch && matchesCategory && matchesFav;
 });

 const activeChapter = MBUROJA_CHAPTERS.find(ch => ch.id === selectedChapterId);

 return (
 <div className="space-y-4 pb-28 animate-fadeIn">
 {/* Chapter Reader Overlay */}
 {activeChapter ? (
 <div className="space-y-4">
 {/* Top Bar */}
 <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between sticky top-14 z-30 backdrop-blur shadow-md">
 <button
 id="btn-back-chapters"
 onClick={() => setSelectedChapterId(null)}
 className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1"
 >
 <ChevronLeft className="w-4 h-4" />
 <span>Lista e Kapitujve</span>
 </button>

 <h3 className="font-bold font-serif text-slate-100 text-sm truncate max-w-[200px]">
 {activeChapter.title}
 </h3>

 {/* Chapter Favorite Star Button */}
 <button
 id={`fav-star-chapter-${activeChapter.id}`}
 onClick={() => onToggleFavChapter(activeChapter.id)}
 className={`p-2 rounded-lg border transition-colors ${
 mburojaState.favChapters.includes(activeChapter.id)
 ? 'bg-amber-950 border-amber-700 text-amber-300'
 : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
 }`}
 title="Shto në Kapitujt e Preferuar"
 >
 <Star className="w-4 h-4 fill-current" />
 </button>
 </div>

 {/* Duas List */}
 <div className="space-y-4">
 {activeChapter.duas.map((dua, idx) => {
 const isSaved = mburojaState.savedDuas.includes(dua.id);
 const targetGoal = mburojaState.duaGoals?.[dua.id] ?? dua.count;
 const currentCount = dailyCounts[dua.id] || 0;
 const isDuaFinished = currentCount >= targetGoal;
 const progressPercent = targetGoal > 0 ? Math.min(100, Math.round((currentCount / targetGoal) * 100)) : 100;

 return (
 <div
 key={dua.id}
 id={`dua-card-${dua.id}`}
 className={`p-4 rounded-xl border transition-all space-y-3 ${
 isDuaFinished
 ? 'bg-emerald-950/20 border-emerald-800/40'
 : 'bg-slate-900/90 border-slate-800'
 }`}
 >
 <div className="flex items-center justify-between border-b border-slate-800/70 pb-2">
 <span className="text-[11px] font-mono text-emerald-400 font-bold bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
 Dua #{idx + 1}
 </span>

 <div className="flex items-center space-x-2">
 <button
 onClick={() => handleCopyDua(dua)}
 className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-xs flex items-center space-x-1"
 >
 {copiedDuaId === dua.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
 </button>

 <button
 onClick={() => onToggleSaveDua(dua.id)}
 className={`p-1.5 rounded-lg border ${
 isSaved ? 'bg-amber-950 border-amber-700 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
 }`}
 >
 <Bookmark className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>

 {/* Arabic Text */}
 <p className="font-arabic text-2xl text-slate-100 leading-[2.2] text-right dir-rtl my-2 select-text" dir="rtl">
 {sanitizeArabicText(dua.ar)}
 </p>

 {/* Transliteration */}
 {dua.transliteration && (
 <p className="text-xs font-mono text-amber-200/90 italic bg-slate-950/70 p-2.5 rounded-lg border border-slate-850">
 {dua.transliteration}
 </p>
 )}

 {/* Albanian Translation */}
 <p className="text-sm font-sans text-slate-200 leading-relaxed">
 {dua.sq}
 </p>

 {/* Audio Playback for Pronunciation */}
 <div className="pt-1">
 <DuaAudioPlayer dua={dua} />
 </div>

 {/* Note / Reference */}
 {dua.note && (
 <p className="text-[11px] text-amber-400/90 bg-amber-950/30 p-2 rounded border border-amber-900/40 italic">
 💡 {dua.note}
 </p>
 )}
 {dua.reference && (
 <p className="text-[10px] text-slate-400 font-mono text-right">{dua.reference}</p>
 )}

 {/* Counter Control */}
 <div className="flex flex-col space-y-3 pt-3 border-t border-slate-800/60">
 {/* Progress Bar (visible if goal > 1) */}
 {targetGoal > 1 && (
 <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
 <div
 className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
 style={{ width: `${progressPercent}%` }}
 ></div>
 </div>
 )}
 
 <div className="flex items-center justify-between">
 <div className="flex items-center space-x-2">
 {isSaved && onUpdateDuaGoal ? (
 <div className="flex flex-col space-y-1">
 <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Caku Ditor</span>
 <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800/60">
 <button
 onClick={() => onUpdateDuaGoal(dua.id, null)}
 className={`px-2 py-0.5 text-[10px] rounded-md transition-colors ${
 !mburojaState.duaGoals?.[dua.id] ? 'bg-slate-800 text-slate-200' : 'text-slate-500 hover:text-slate-300'
 }`}
 >
 {dua.count}
 </button>
 <button
 onClick={() => onUpdateDuaGoal(dua.id, 10)}
 className={`px-2 py-0.5 text-[10px] rounded-md transition-colors ${
 mburojaState.duaGoals?.[dua.id] === 10 ? 'bg-emerald-900/60 text-emerald-300 font-medium' : 'text-slate-500 hover:text-slate-300'
 }`}
 >
 10
 </button>
 <button
 onClick={() => onUpdateDuaGoal(dua.id, 33)}
 className={`px-2 py-0.5 text-[10px] rounded-md transition-colors ${
 mburojaState.duaGoals?.[dua.id] === 33 ? 'bg-emerald-900/60 text-emerald-300 font-medium' : 'text-slate-500 hover:text-slate-300'
 }`}
 >
 33
 </button>
 <button
 onClick={() => onUpdateDuaGoal(dua.id, 100)}
 className={`px-2 py-0.5 text-[10px] rounded-md transition-colors ${
 mburojaState.duaGoals?.[dua.id] === 100 ? 'bg-emerald-900/60 text-emerald-300 font-medium' : 'text-slate-500 hover:text-slate-300'
 }`}
 >
 100
 </button>
 </div>
 </div>
 ) : (
 <span className="text-xs text-slate-400">
 Caku: <span className="font-mono font-bold text-slate-200">{targetGoal}x</span>
 </span>
 )}
 </div>

 <div className="flex items-center space-x-2 shrink-0">
 <button
 onClick={() => onUpdateDuaCount(dua.id, 0)}
 className="p-1.5 text-slate-500 hover:text-slate-300"
 title="Ristartoni numëruesin"
 >
 <RotateCcw className="w-3.5 h-3.5" />
 </button>

 <button
 id={`btn-increment-dua-${dua.id}`}
 onClick={() => {
 triggerDhikrFeedback(hapticEnabled, soundEnabled);
 onUpdateDuaCount(dua.id, currentCount + 1);
 }}
 className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all active:scale-95 ${
 isDuaFinished
 ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
 : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 border-emerald-500 shadow'
 }`}
 >
 {currentCount} / {targetGoal}
 </button>
 </div>
 </div>
 </div>
 </div>
 );
 })}
 </div>

 {/* End of Chapter Completion Toggle */}
 <div className="pt-4 border-t border-slate-800 text-center">
 <button
 id="btn-complete-chapter-today"
 onClick={() => onToggleChapterCompletedToday(activeChapter.id)}
 className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border ${
 completedToday.includes(activeChapter.id)
 ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
 : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
 }`}
 >
 <CheckCircle2 className="w-4 h-4 text-emerald-400" />
 <span>
 {completedToday.includes(activeChapter.id)
 ? 'E kryer sot (Kliko për të hequr)'
 : 'E përfundova të gjithë kapitullin sot'}
 </span>
 </button>
 </div>
 </div>
 ) : (
 /* Categories & Chapter Directory */
 <div className="space-y-4">
 {/* Search & Fav Filter */}
 <div className="flex space-x-2">
 <div className="relative flex-1">
 <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
 <input
 type="text"
 placeholder="Kërko në kapituj, dua apo përkthime..."
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-600"
 />
 </div>

 <button
 onClick={() => setShowOnlyFavs(!showOnlyFavs)}
 className={`px-3 py-2.5 rounded-xl border text-xs font-medium flex items-center space-x-1 transition-all ${
 showOnlyFavs
 ? 'bg-amber-950 text-amber-300 border-amber-800'
 : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
 }`}
 title="Filtro vetëm kapitujt e preferuar"
 >
 <Star className="w-4 h-4 fill-current" />
 <span>{mburojaState.favChapters.length}</span>
 </button>
 </div>

 {/* Directory Tabs (Kapitujt vs Duat e Ruajtura) */}
 <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
 <button
 onClick={() => setActiveTab('chapters')}
 className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
 activeTab === 'chapters'
 ? 'bg-emerald-600 text-slate-950 shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 Kapitujt ({MBUROJA_CHAPTERS.length})
 </button>

 <button
 onClick={() => setActiveTab('savedDuas')}
 className={`flex-1 py-2 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-all ${
 activeTab === 'savedDuas'
 ? 'bg-amber-600 text-white shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <Bookmark className="w-3.5 h-3.5" />
 <span>Duat e Ruajtura ({mburojaState.savedDuas.length})</span>
 </button>
 </div>

 {activeTab === 'savedDuas' ? (
 /* Saved Duas List */
 <div className="space-y-3">
 {mburojaState.savedDuas.length === 0 ? (
 <div className="text-center py-10 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 space-y-2">
 <Bookmark className="w-8 h-8 text-slate-500 mx-auto" />
 <p className="text-xs text-slate-300 font-semibold">Nuk keni asnjë dua të ruajtur.</p>
 <p className="text-[11px] text-slate-400">
 Kur të lexoni kapitujt, klikoni ikonën e ruajtjes (Bookmark) për t'i pasur duat tuaja kryesore në këtë listë.
 </p>
 </div>
 ) : (
 (() => {
 const savedList = MBUROJA_CHAPTERS.flatMap(ch =>
 ch.duas
 .filter(d => mburojaState.savedDuas.includes(d.id))
 .map(d => ({ dua: d, chapterTitle: ch.title, chapterId: ch.id }))
 ).filter(item =>
 item.chapterTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
 item.dua.sq.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (item.dua.transliteration && item.dua.transliteration.toLowerCase().includes(searchQuery.toLowerCase()))
 );

 if (savedList.length === 0) {
 return (
 <p className="text-center py-8 text-xs text-slate-400 italic">
 Nuk u gjet asnjë dua e ruajtur që përputhet me kërkimin tuaj.
 </p>
 );
 }

 return (
 <div className="space-y-3">
 {/* Audio Playback Summary Banner for Saved Duas */}
 <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-amber-950/40 border border-emerald-800/60 rounded-xl p-3 flex items-center justify-between shadow-sm">
 <div className="flex items-center space-x-2.5">
 <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-400">
 <Volume2 className="w-4 h-4" />
 </div>
 <div>
 <h4 className="text-xs font-bold text-slate-100">Prononcimi i Duave të Ruajtura</h4>
 <p className="text-[10px] text-slate-400">
 Dëgjoni lexuesin audio për prononcim të saktë të duave tuaja të ruajtura ({savedList.length}).
 </p>
 </div>
 </div>
 </div>

 {savedList.map(({ dua, chapterTitle, chapterId }) => (
 <div
 key={dua.id}
 className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 shadow-sm"
 >
 <div className="flex items-center justify-between border-b border-slate-800 pb-2">
 <button
 onClick={() => setSelectedChapterId(chapterId)}
 className="text-xs font-bold text-emerald-400 hover:underline flex items-center space-x-1"
 >
 <ShieldCheck className="w-3.5 h-3.5" />
 <span>{chapterTitle}</span>
 </button>
 <button
 onClick={() => onToggleSaveDua(dua.id)}
 className="text-xs text-amber-300 bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-lg flex items-center space-x-1"
 >
 <Bookmark className="w-3 h-3 fill-current" />
 <span>Ruajtur</span>
 </button>
 </div>

 <p className="font-arabic text-xl text-slate-100 leading-[2] text-right dir-rtl my-1" dir="rtl">
 {sanitizeArabicText(dua.ar)}
 </p>

 {dua.transliteration && (
 <p className="text-xs font-mono text-amber-200/90 italic bg-slate-950 p-2 rounded border border-slate-850">
 {dua.transliteration}
 </p>
 )}

 <p className="text-xs font-sans text-slate-200 leading-relaxed">
 {dua.sq}
 </p>

 {/* Audio Player for Saved Dua Pronunciation */}
 <div className="pt-1">
 <DuaAudioPlayer dua={dua} />
 </div>
 </div>
 ))}
 </div>
 );
 })()
 )}
 </div>
 ) : (
 <>
 {/* Categories Horizontal Pills */}
 <div className="flex overflow-x-auto space-x-2 pb-1 scrollbar-none">
 <button
 onClick={() => setSelectedCategoryId(null)}
 className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-all ${
 selectedCategoryId === null
 ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
 : 'bg-slate-900 text-slate-400 border-slate-800'
 }`}
 >
 Të Gjitha (11 Kategori)
 </button>
 {MBUROJA_CATEGORIES.map(cat => (
 <button
 key={cat.id}
 onClick={() => setSelectedCategoryId(cat.id)}
 className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-all ${
 selectedCategoryId === cat.id
 ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
 : 'bg-slate-900 text-slate-400 border-slate-800'
 }`}
 >
 {cat.title}
 </button>
 ))}
 </div>

 {/* Chapters Directory List */}
 <div className="grid grid-cols-1 gap-2.5">
 {filteredChapters.map(ch => {
 const isFav = mburojaState.favChapters.includes(ch.id);
 const isCompleted = completedToday.includes(ch.id);

 return (
 <div
 key={ch.id}
 id={`chapter-card-${ch.id}`}
 onClick={() => setSelectedChapterId(ch.id)}
 className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
 isCompleted
 ? 'bg-emerald-950/30 border-emerald-800/40 text-slate-300'
 : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800'
 }`}
 >
 <div className="flex items-center space-x-3 pr-2">
 <span className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">
 #{ch.id}
 </span>
 <div>
 <div className="flex items-center space-x-2">
 <h4 className="font-semibold text-sm text-slate-100">{ch.title}</h4>
 {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
 </div>
 <p className="text-[11px] text-slate-400 font-mono">{ch.duas.length} dua brenda</p>
 </div>
 </div>

 {/* Chapter level favorite star only */}
 <button
 onClick={(e) => {
 e.stopPropagation();
 onToggleFavChapter(ch.id);
 }}
 className={`p-2 rounded-lg ${
 isFav ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'
 }`}
 >
 <Star className="w-4 h-4 fill-current" />
 </button>
 </div>
 );
 })}
 </div>
 </>
 )}
 </div>
 )}
 </div>
 );
};
