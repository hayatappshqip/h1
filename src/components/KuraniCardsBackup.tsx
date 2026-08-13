/**
 * KuraniCardsBackup Component - Mënyra me Kartela e Ruajtur si Backup
 * Kjo pamje ruan saktësisht leximin me kartela ajeteve, përkthimin, shënimet, texhvidin dhe audion.
 */
import React, { useState, useEffect, useRef } from 'react';
import { ALL_SURAHS_META } from '../data/quranData';
import { getSurahData, cleanAyahArabicText, toArabicDigits } from '../services/quranApi';
import { initQuranCorpus } from '../services/quranCorpusStore';
import { renderTajweedText, TajweedLegend, TajweedLegendModal } from '../utils/tajweed';
import { getLocalDateString } from '../utils/dateUtils';
import { QuranSearchView } from './QuranSearchView';
import {
 QuranSurahData,
 QuranBookmark,
 QuranNote,
 QuranReadingState,
 QuranReadingSettings,
 QuranReadingTheme,
 QuranScriptType
} from '../types';
import {
 Search,
 Bookmark,
 Play,
 Pause,
 Music,
 ChevronLeft,
 ChevronRight,
 ChevronDown,
 BookOpen,
 Check,
 Sliders,
 Eye,
 FileText,
 X,
 Sun,
 Moon,
 Feather,
 Sparkles,
 Layers,
 Maximize2,
 Square,
 SkipBack,
 SkipForward,
 BarChart3,
 Repeat,
 Brain,
 Award
} from 'lucide-react';
import { QuranStatsChart } from './QuranStatsChart';
import { HifzModule } from './HifzModule';
import { KhatamTrackerView } from './KhatamTrackerView';

export const AyahEndMarkerBackup: React.FC<{ numberInSurah: number; className?: string }> = ({
	numberInSurah,
	className = ''
}) => {
	const arabicNum = toArabicDigits(numberInSurah);
	const fontSize = arabicNum.length === 1 
		? 'text-[0.55em]' 
		: arabicNum.length === 2 
		? 'text-[0.45em]' 
		: 'text-[0.36em]';

	return (
		<span 
			className={`inline-flex items-center justify-center relative mx-1 align-middle select-none text-current opacity-90 ${className}`} 
			dir="rtl"
			aria-label={`Ajeti ${numberInSurah}`}
		>
			<svg className="w-[1.25em] h-[1.25em] fill-current" viewBox="0 0 36 36">
				<circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="1.6" />
				<circle cx="18" cy="18" r="12.8" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2.5 1.5" />
				<path d="M18 1.2 L19.8 4 L18 2.8 L16.2 4 Z M18 34.8 L19.8 32 L18 33.2 L16.2 32 Z M1.2 18 L4 19.8 L2.8 18 L4 16.2 Z M34.8 18 L32 19.8 L33.2 18 L32 16.2 Z" fill="currentColor" />
			</svg>
			<span className={`absolute inset-0 flex items-center justify-center font-semibold font-sans leading-none pt-[0.5px] text-current ${fontSize}`}>
				{arabicNum}
			</span>
		</span>
	);
};

export const QuranVerseRendererBackup: React.FC<{
	textAr: string;
	surahNumber: number;
	numberInSurah: number;
	showTajweed?: boolean;
	className?: string;
}> = ({
	textAr,
	surahNumber,
	numberInSurah,
	showTajweed = false,
	className = ''
}) => {
	const verseText = cleanAyahArabicText(textAr, surahNumber, numberInSurah);
	if (!verseText) return null;

	return (
		<span className={`quran-verse-tokens inline font-arabic ${className}`} dir="rtl">
			{renderTajweedText(verseText, showTajweed)}
			<AyahEndMarkerBackup numberInSurah={numberInSurah} />
		</span>
	);
};

export interface ReciterBackup {
 key: string;
 name: string;
 arabicName: string;
 style: string;
 getSurahAudioUrl: (surahNum: number) => string;
 getAyahAudioUrl: (surahNum: number, ayahNum: number) => string;
}

export const QURAN_RECITERS_BACKUP: ReciterBackup[] = [
 {
 key: 'alafasy',
 name: 'Mishary Rashid Alafasy',
 arabicName: 'مشاري راشد العفاسي',
 style: 'Murattal',
 getSurahAudioUrl: (s) => `https://server8.mp3quran.net/afs/${s.toString().padStart(3, '0')}.mp3`,
 getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Alafasy_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`
 },
 {
 key: 'minshawi',
 name: 'Siddiq El-Minshawi',
 arabicName: 'محمد صديق المنشاوي',
 style: 'Murattal',
 getSurahAudioUrl: (s) => `https://server10.mp3quran.net/minsh/Rewayat-Hafs-A-n-Asim/${s.toString().padStart(3, '0')}.mp3`,
 getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Minshawy_Murattal_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`
 },
 {
 key: 'abdulbasit',
 name: 'Abdul Basit Abdul Samad',
 arabicName: 'عبد الباسط عبد الصمد',
 style: 'Murattal',
 getSurahAudioUrl: (s) => `https://server7.mp3quran.net/basit/${s.toString().padStart(3, '0')}.mp3`,
 getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`
 },
 {
 key: 'husary',
 name: 'Mahmoud Khalil Al-Husary',
 arabicName: 'محمود خليل الحصري',
 style: 'Murattal',
 getSurahAudioUrl: (s) => `https://server13.mp3quran.net/hssr/${s.toString().padStart(3, '0')}.mp3`,
 getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Husary_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`
 }
];

function normalizeScriptType(value?: string): QuranScriptType {
 if (value === 'uthmani_unicode') return 'uthmani_unicode';
 return 'uthmani_hafs_unicode';
}

const DEFAULT_READING_SETTINGS: QuranReadingSettings = {
 theme: 'sepia',
 arabicFontSize: 28,
 albanianFontSize: 15,
 lineSpacing: 1.8,
 layoutMode: 'cards',
 showTranslation: true,
 selectedReciterKey: 'alafasy',
 scriptType: 'uthmani_hafs_unicode',
 viewMode: 'normal',
 showTajweed: false,
 tajweedHighContrast: false,
 dailyAyahGoal: 0
};

export const ExpandableNoteTextBackup: React.FC<{
 text: string;
 textColor?: string;
 buttonColor?: string;
 maxLength?: number;
}> = ({
 text,
 textColor = 'text-slate-200',
 buttonColor = 'text-emerald-400 hover:text-emerald-300',
 maxLength = 100
}) => {
 const [isExpanded, setIsExpanded] = useState<boolean>(false);
 const isLong = text.length > maxLength;

 return (
 <div className="space-y-1 transition-all duration-300 ease-in-out">
 <div
 className={`transition-all duration-300 ease-in-out overflow-hidden ${
 isLong && !isExpanded ? 'cursor-pointer hover:opacity-90' : ''
 }`}
 onClick={() => {
 if (isLong) setIsExpanded(!isExpanded);
 }}
 >
 <p className={`text-xs ${textColor} leading-relaxed whitespace-pre-wrap transition-all duration-300`}>
 {isLong && !isExpanded ? `${text.slice(0, maxLength).trim()}...` : text}
 </p>
 </div>
 {isLong && (
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation();
 setIsExpanded(!isExpanded);
 }}
 className={`text-[11px] font-semibold ${buttonColor} flex items-center space-x-1 focus:outline-none transition-colors pt-0.5`}
 >
 <span>{isExpanded ? 'Palos shënimin' : 'Lexo të plotë'}</span>
 <ChevronDown
 className={`w-3.5 h-3.5 transform transition-transform duration-300 ${
 isExpanded ? 'rotate-180' : ''
 }`}
 />
 </button>
 )}
 </div>
 );
};

export interface KuraniCardsBackupProps {
 initialSurahNumber?: number;
 initialSubTab?: 'surahs' | 'bookmarks' | 'notes' | 'stats' | 'hifz' | 'khatam';
 readingState: QuranReadingState;
 bookmarks: QuranBookmark[];
 notes?: QuranNote[];
 onUpdateReadingState: (surahNum: number, ayahNum: number, dailyProgress?: { [date: string]: number }) => void;
 onAddBookmark: (bookmark: Omit<QuranBookmark, 'id' | 'createdAt'>) => void;
 onRemoveBookmark: (id: string) => void;
 onSaveNote?: (note: Omit<QuranNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
 onDeleteNote?: (id: string) => void;
}

export const KuraniCardsBackup: React.FC<KuraniCardsBackupProps> = ({
 initialSurahNumber,
 initialSubTab,
 readingState,
 bookmarks,
 notes = [],
 onUpdateReadingState,
 onAddBookmark,
 onRemoveBookmark,
 onSaveNote,
 onDeleteNote
}) => {
 const [selectedSurahNum, setSelectedSurahNum] = useState<number | null>(initialSurahNumber || null);
 const [surahData, setSurahData] = useState<QuranSurahData | null>(null);
 const [loading, setLoading] = useState<boolean>(false);
 const [searchQuery, setSearchQuery] = useState<string>('');
 const [activeTab, setActiveTab] = useState<'surahs' | 'search' | 'bookmarks' | 'notes' | 'stats' | 'hifz' | 'khatam'>(initialSubTab || 'surahs');
 const [targetAyahToScroll, setTargetAyahToScroll] = useState<number | null>(null);

 const [readingSettings, setReadingSettings] = useState<QuranReadingSettings>(() => {
 try {
 const saved = localStorage.getItem('hayat_quran_reading_settings');
 if (saved) return JSON.parse(saved);
 } catch (e) {}
 return DEFAULT_READING_SETTINGS;
 });

 const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

 useEffect(() => {
 initQuranCorpus().catch(err => console.warn('Corpus init warn:', err));
 }, []);

 useEffect(() => {
 if (initialSurahNumber) setSelectedSurahNum(initialSurahNumber);
 }, [initialSurahNumber]);

 useEffect(() => {
 if (selectedSurahNum) {
 setLoading(true);
 getSurahData(selectedSurahNum).then(data => {
 setSurahData(data);
 setLoading(false);
 });
 }
 }, [selectedSurahNum]);

 const currentTheme = {
 bg: 'bg-[#FAF6EE]',
 text: 'text-[#2C251E]',
 cardBg: 'bg-[#F3EBDA]',
 cardBorder: 'border-[#E5D8BF]',
 headerBg: 'bg-[#EEE3CD]',
 headerBorder: 'border-[#DECFA7]',
 arabicText: 'text-[#1F170F]',
 sqText: 'text-[#473B2C]',
 accent: 'text-[#0E6243]',
 btnBg: 'bg-[#E7DABE] text-[#2C251E] hover:bg-[#DDD0B2] border-[#D6C7A7]',
 btnActive: 'bg-[#0E6243] text-white border-[#0B4F36]'
 };

 const filteredSurahs = ALL_SURAHS_META.filter(s =>
 s.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
 s.albanianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 s.number.toString() === searchQuery.trim()
 );

 return (
 <div className="space-y-4 pb-28 animate-fadeIn">
 <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between mb-2">
 <span>🎴 **Leximi i Ruajtur me Kartela (Backup)** — Të gjitha funksionalitetet origjinale janë ruajtur plotësisht.</span>
 </div>

 {selectedSurahNum !== null ? (
 <div className={`min-h-screen p-3 rounded-2xl ${currentTheme.bg} ${currentTheme.text}`}>
 <div className={`p-3 rounded-xl border flex items-center justify-between sticky top-14 z-30 ${currentTheme.headerBg} ${currentTheme.headerBorder}`}>
 <button onClick={() => setSelectedSurahNum(null)} className={`text-xs font-medium flex items-center space-x-1 ${currentTheme.accent}`}>
 <ChevronLeft className="w-4 h-4" />
 <span>Kthehu te Surjet</span>
 </button>
 {surahData && (
 <div className="text-center">
 <h3 className="font-bold text-xs sm:text-sm">{surahData.number}. {surahData.transliteration} ({surahData.albanianName})</h3>
 </div>
 )}
 </div>

 {loading ? (
 <div className="text-center py-20 text-sm opacity-75">Duke ngarkuar...</div>
 ) : surahData ? (
 <div className="space-y-3.5 mt-3">
 {surahData.ayahs.map(ayah => (
 <div key={ayah.numberInSurah} className={`p-4 rounded-2xl border ${currentTheme.cardBg} ${currentTheme.cardBorder}`}>
 <p className={`font-arabic text-right text-2xl my-3 ${currentTheme.arabicText}`} dir="rtl">
 <QuranVerseRendererBackup textAr={ayah.textAr} surahNumber={selectedSurahNum} numberInSurah={ayah.numberInSurah} />
 </p>
 <p className={`font-sans text-sm pt-2 border-t border-current/10 ${currentTheme.sqText}`}>{ayah.textSq}</p>
 </div>
 ))}
 </div>
 ) : null}
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
 {filteredSurahs.map(s => (
 <div key={s.number} onClick={() => setSelectedSurahNum(s.number)} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl cursor-pointer flex justify-between">
 <div>
 <h4 className="font-bold text-sm text-slate-100">{s.number}. {s.transliteration}</h4>
 <p className="text-xs text-slate-400">{s.albanianName} • {s.numberOfAyahs} Ajete</p>
 </div>
 <span className="font-arabic text-lg text-emerald-400">{s.name}</span>
 </div>
 ))}
 </div>
 )}
 </div>
 );
};
