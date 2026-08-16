/**
 * HomeView Component - Kreu i Hayat
 * Prayer Countdown, Suggestion Windows, Completion Badges & Quick Access
 */
import React from 'react';
import { PrayerTimes, PrayerSettings, MburojaState, DayItem, QuranReadingState, PostPrayerDhikrSession } from '../types';
import { getNextPrayer, getActiveSuggestions } from '../services/prayerEngine';
import { MBUROJA_CHAPTERS } from '../data/mburojaData';
import { Clock, ShieldCheck, CheckCircle2, ChevronRight, Compass, BookOpen, Calendar, Sparkles, Activity } from 'lucide-react';
import { ALL_SURAHS_META } from '../data/quranData';
import { ActiveTab } from './Navbar';
import { getLocalDateString } from '../utils/dateUtils';
import { AyahOfTheDay } from './AyahOfTheDay';

interface HomeViewProps {
 prayerTimes: PrayerTimes | null;
 prayerSettings: PrayerSettings;
 mburojaState: MburojaState;
 dayItems: DayItem[];
 quranReadingState: QuranReadingState;
 postPrayerDhikrSessions: PostPrayerDhikrSession[];
 setActiveTab: (tab: ActiveTab) => void;
 onOpenMburojaChapter: (chapterId: number) => void;
 onOpenQuranSurah: (surahNum: number, ayahNum?: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
 prayerTimes,
 prayerSettings,
 mburojaState,
 dayItems,
 quranReadingState,
 postPrayerDhikrSessions,
 setActiveTab,
 onOpenMburojaChapter,
 onOpenQuranSurah
}) => {
 const todayStr = getLocalDateString();
 const completedToday = mburojaState.completedByDate[todayStr] || [];

 const nextPrayerInfo = prayerTimes ? getNextPrayer(prayerTimes) : null;
 const activeSuggestions = prayerTimes ? getActiveSuggestions(prayerTimes, prayerSettings) : [];

 const todayTasks = dayItems.filter(item => item.date === todayStr);
 const pendingTasksCount = todayTasks.filter(t => !t.completed).length;

 const prayerLabels: { [key: string]: string } = {
 imsak: 'Imsaku',
 fajr: 'Sabahu',
 sunrise: 'Lindja e Diellit',
 dhuhr: 'Dreka',
 asr: 'Ikindia',
 maghrib: 'Akshami',
 isha: 'Jacia'
 };

 return (
 <div className="space-y-6 pb-24 animate-fadeIn">
 {/* Prayer Countdown Card */}
 <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/80 border border-emerald-900/40 rounded-2xl p-5 shadow-xl text-slate-100 relative overflow-hidden">
 <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

 <div className="flex items-center justify-between mb-3">
 <div className="flex items-center space-x-2">
 <Clock className="w-5 h-5 text-emerald-400" />
 <span className="text-xs font-medium text-emerald-300 tracking-wide uppercase">
 {prayerSettings.locationName}
 </span>
 </div>
 <button
 id="open-qibla-btn"
 onClick={() => setActiveTab('namazi')}
 className="text-xs bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/50 px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-colors"
 >
 <Compass className="w-3.5 h-3.5 text-emerald-400" />
 <span>Kibla</span>
 </button>
 </div>

 {nextPrayerInfo ? (
 <div className="flex items-baseline justify-between py-2">
 <div>
 <p className="text-xs text-slate-400 font-sans">Namazi i ardhshëm</p>
 <h2 className="text-2xl font-bold font-serif text-white tracking-tight">
 {prayerLabels[nextPrayerInfo.next] || nextPrayerInfo.next}
 </h2>
 </div>
 <div className="text-right">
 <span className="text-3xl font-mono font-bold text-emerald-400 tracking-tight">
 {nextPrayerInfo.timeUntil}
 </span>
 <p className="text-[11px] text-slate-400 mt-0.5">mbetur</p>
 </div>
 </div>
 ) : (
 <p className="text-sm text-slate-400 italic py-2">Duke ngarkuar kohët e namazit...</p>
 )}

 {prayerTimes && (
 <div className="grid grid-cols-5 gap-1.5 mt-4 pt-4 border-t border-slate-800/80 text-center text-xs">
 {[
 { id: 'fajr', label: 'Sabahu', time: prayerTimes.fajr },
 { id: 'dhuhr', label: 'Dreka', time: prayerTimes.dhuhr },
 { id: 'asr', label: 'Ikindia', time: prayerTimes.asr },
 { id: 'maghrib', label: 'Akshami', time: prayerTimes.maghrib },
 { id: 'isha', label: 'Jacia', time: prayerTimes.isha }
 ].map(p => {
 const isCurrent = nextPrayerInfo?.current === p.id;
 const isNext = nextPrayerInfo?.next === p.id;
 return (
 <div
 key={p.id}
 className={`p-1.5 rounded-lg border transition-all ${
 isNext
 ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 font-semibold shadow-inner'
 : isCurrent
 ? 'bg-slate-800/60 border-slate-700 text-slate-200'
 : 'bg-slate-900/40 border-slate-800/50 text-slate-400'
 }`}
 >
 <p className="text-[10px] truncate">{p.label}</p>
 <p className="font-mono text-xs mt-0.5">{p.time}</p>
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* Suggestion Windows Section */}
 <div className="space-y-3">
 <div className="flex items-center justify-between px-1">
 <div className="flex items-center space-x-2">
 <Sparkles className="w-4 h-4 text-emerald-400" />
 <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
 Sugjerimet Ditore me Orar
 </h3>
 </div>
 <span className="text-[11px] font-mono text-slate-400">
 {activeSuggestions.length} aktive sot
 </span>
 </div>

 {activeSuggestions.length === 0 ? (
 <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center text-slate-400 text-xs">
 Nuk ka sugjerime të veçanta për këtë fashë orare. Mund të hapni Mburojën e Muslimanit në çdo kohë.
 </div>
 ) : (
 <div className="grid grid-cols-1 gap-2.5">
 {activeSuggestions.map(sug => {
 const isDone = completedToday.includes(sug.chapterId);
 return (
 <div
 key={sug.id}
 id={`suggestion-card-${sug.id}`}
 onClick={() => {
 if (sug.id === 'sajdah-mulk') {
 onOpenQuranSurah(67);
 setActiveTab('kurani');
 } else if (sug.id === 'kahf') {
 onOpenQuranSurah(18);
 setActiveTab('kurani');
 } else {
 onOpenMburojaChapter(sug.chapterId);
 setActiveTab('mburoja');
 }
 }}
 className={`group p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between shadow-sm ${
 isDone
 ? 'bg-emerald-950/30 border-emerald-800/50 text-slate-300'
 : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-emerald-700/50 text-slate-100'
 }`}
 >
 <div className="space-y-1 pr-3">
 <div className="flex items-center space-x-2">
 <span className="font-medium text-sm text-slate-100 group-hover:text-emerald-300 transition-colors">
 {sug.title}
 </span>
 {isDone && (
 <span className="text-[11px] bg-emerald-950 text-emerald-400 border border-emerald-700/60 px-2 py-0.5 rounded-full flex items-center space-x-1">
 <CheckCircle2 className="w-3 h-3 text-emerald-400" />
 <span>U krye sot</span>
 </span>
 )}
 </div>
 <p className="text-xs text-slate-400 line-clamp-1">{sug.subtitle}</p>
 </div>
 <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
 </div>
 );
 })}
 </div>
 )}
 </div>

 {/* Modules Quick Access Bento */}
 <div className="grid grid-cols-2 gap-3">
 {/* Post-Prayer Dhikr Dynamic Card */}
 {(() => {
 const currentPrayerId = nextPrayerInfo?.current;
 let dhikrLabel = "Dhikri pas Namazit";
 let isDhikrCompleted = false;

 if (currentPrayerId && currentPrayerId !== 'sunrise' && currentPrayerId !== 'imsak') {
 const currentPrayerNameAlbanian = prayerLabels[currentPrayerId];
 if (currentPrayerNameAlbanian) {
 dhikrLabel = `Dhikri i ${currentPrayerNameAlbanian.replace('a', 'ës').replace('i', 'it').replace('A', 'ës')}`; // Basic rough inflection
 dhikrLabel = `Dhikri pas ${currentPrayerNameAlbanian}`;
 // Check if completed today for this prayer
 const session = postPrayerDhikrSessions.find(
 s => s.date === todayStr && s.prayer.toLowerCase() === currentPrayerId
 );
 if (session?.completed) {
 isDhikrCompleted = true;
 }
 }
 }

 return (
 <div
 id="card-dhikr-shortcut"
 onClick={() => setActiveTab('namazi')}
 className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-700/50 p-4 rounded-xl cursor-pointer transition-all space-y-2 shadow-sm relative overflow-hidden"
 >
 {isDhikrCompleted && (
 <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
 )}
 <div className="flex justify-between items-start">
 <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDhikrCompleted ? 'bg-emerald-950/70 border-emerald-800/40 text-emerald-400' : 'bg-slate-800/70 border-slate-700/40 text-slate-400'}`}>
 <Activity className="w-5 h-5" />
 </div>
 {isDhikrCompleted && (
 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
 )}
 </div>
 <div>
 <h4 className="font-semibold text-sm text-slate-100 leading-tight pr-2">Dhikri pas Namazit</h4>
 <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
 {currentPrayerId ? `Për namazin e ${prayerLabels[currentPrayerId] || currentPrayerId}` : 'Kujtesë për dhikrin'}
 </p>
 </div>
 </div>
 );
 })()}

 {/* Kurani Dynamic Card */}
 {(() => {
 const { lastReadSurah, lastReadAyah } = quranReadingState;
 const surah = ALL_SURAHS_META.find(s => s.number === lastReadSurah);
 
 return (
 <div
 id="card-kurani-shortcut"
 onClick={() => {
 onOpenQuranSurah(lastReadSurah, lastReadAyah);
 setActiveTab('kurani');
 }}
 className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-700/50 p-4 rounded-xl cursor-pointer transition-all space-y-2 shadow-sm"
 >
 <div className="w-9 h-9 rounded-lg bg-emerald-950/70 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
 <BookOpen className="w-5 h-5" />
 </div>
 <div>
 <h4 className="font-semibold text-sm text-slate-100">Vazhdo Leximin</h4>
 <p className="text-[11px] text-slate-400 mt-1 truncate">
 {surah ? `${surah.albanianName}, Ajeti ${lastReadAyah}` : `Surja ${lastReadSurah}, Ajeti ${lastReadAyah}`}
 </p>
 </div>
 </div>
 );
 })()}

 {/* Dita Ime Card */}
 <div
 id="card-dita-ime-shortcut"
 onClick={() => setActiveTab('ditaIme')}
 className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-emerald-700/50 p-4 rounded-xl cursor-pointer transition-all space-y-2 shadow-sm col-span-2 flex items-center justify-between"
 >
 <div className="flex items-center space-x-3">
 <div className="w-9 h-9 rounded-lg bg-amber-950/70 border border-amber-800/40 flex items-center justify-center text-amber-400">
 <Calendar className="w-5 h-5" />
 </div>
 <div>
 <h4 className="font-semibold text-sm text-slate-100">Dita Ime (Detyrat & Agjenda)</h4>
 <p className="text-[11px] text-slate-400">
 {pendingTasksCount > 0 ? `${pendingTasksCount} detyra të hapura sot` : 'Nuk ke detyra të hapura sot'}
 </p>
 </div>
 </div>
 <ChevronRight className="w-5 h-5 text-slate-500" />
 </div>
 </div>

 {/* Daily Verse / Remembrance Highlight */}
 <AyahOfTheDay onOpenAyah={(surah, ayah) => onOpenQuranSurah(surah)} />

 </div>
 );
};
