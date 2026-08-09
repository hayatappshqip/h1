/**
 * KuraniView Component - Lexuesi i Kuranit Fisnik
 * Text: Uthmani Arabic + Hasan Nahi Albanian Translation
 * Features: 
 * 1. 114 Surahs Directory with Search & Bookmarks
 * 2. Audio Reciter Selector (7 World Famous Reciters: Alafasy, Minshawi, Abdul Basit, Husary, etc.)
 * 3. Per-Ayah and Full-Surah Audio Playback
 * 4. Personal Ayah Notes & Reflections (Ruajtja e shënimeve personale)
 * 5. Eye-Comfort Reading Suite: Sepia (Warm Parchment), Slate Dark, Light, Midnight OLED
 * 6. Font Size Customization, Line Spacing, Continuous Mushaf View, Translation Toggle
 */
import React, { useState, useEffect, useRef } from 'react';
import { ALL_SURAHS_META } from '../data/quranData';
import { getSurahData, cleanAyahArabicText, toArabicDigits, buildAyahEndMarker } from '../services/quranApi';
import { initQuranCorpus } from '../services/quranCorpusStore';
import { renderTajweedText, TajweedLegend, TajweedLegendModal } from '../utils/tajweed';

/**
 * Dedicated Token-Based Quran Verse Renderer
 * Processes verse tokens natively:
 * - Word tokens: rendered with Tajweed or standard font styling
 * - Verse-end token: generated using U+06DD and standard Arabic digits
 */
interface QuranVerseRendererProps {
 textAr: string;
 surahNumber: number;
 numberInSurah: number;
 showTajweed?: boolean;
 className?: string;
}

export const AyahEndMarker: React.FC<{ numberInSurah: number; className?: string }> = ({
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

export const QuranVerseRenderer: React.FC<QuranVerseRendererProps> = ({
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
			<AyahEndMarker numberInSurah={numberInSurah} />
		</span>
	);
};
import { getLocalDateString } from '../utils/dateUtils';
import { QuranSearchView } from './QuranSearchView';
import {
 QuranSurahData,
 QuranBookmark,
 QuranNote,
 QuranReadingState,
 QuranReadingSettings,
 QuranReadingTheme,
 QuranLayoutMode,
 QuranScriptType
} from '../types';
import {
 Search,
 Bookmark,
 Play,
 Pause,
 Volume2,
 ChevronLeft,
 ChevronRight,
 ChevronDown,
 BookOpen,
 Book,
 Check,
 Settings,
 Sliders,
 Eye,
 FileText,
 Plus,
 Trash2,
 Edit3,
 X,
 Sun,
 Moon,
 Feather,
 Music,
 Sparkles,
 Layers,
 Aperture,
 Share2,
 CornerDownRight,
 Maximize2,
 Square,
 SkipBack,
 SkipForward,
 VolumeX,
 BarChart3,
 Repeat,
 Brain,
 Award
} from 'lucide-react';
import { QuranStatsChart } from './QuranStatsChart';
import { HifzModule } from './HifzModule';
import { KhatamTrackerView } from './KhatamTrackerView';

export interface Reciter {
 key: string;
 name: string;
 arabicName: string;
 style: string;
 getSurahAudioUrl: (surahNum: number) => string;
 getAyahAudioUrl: (surahNum: number, ayahNum: number) => string;
}

export const QURAN_RECITERS: Reciter[] = [
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
 },
 {
 key: 'ghamdi',
 name: 'Saad Al-Ghamdi',
 arabicName: 'سعد الغامدي',
 style: 'Murattal',
 getSurahAudioUrl: (s) => `https://server7.mp3quran.net/s_gmd/${s.toString().padStart(3, '0')}.mp3`,
 getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Ghamadi_40kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`
 },
 {
 key: 'shatri',
 name: 'Abu Bakr Al-Shatri',
 arabicName: 'أبو بكر الشاطري',
 style: 'Murattal',
 getSurahAudioUrl: (s) => `https://server11.mp3quran.net/shatri/${s.toString().padStart(3, '0')}.mp3`,
 getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Shatri_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`
 },
 {
 key: 'muaiqly',
 name: 'Maher Al-Muaiqly',
 arabicName: 'ماهر المعيقلي',
 style: 'Murattal',
 getSurahAudioUrl: (s) => `https://server12.mp3quran.net/maher/${s.toString().padStart(3, '0')}.mp3`,
 getAyahAudioUrl: (s, a) => `https://everyayah.com/data/MaherAlMuaiqly128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`
 },
 {
 key: 'shuraim',
 name: 'Saud Al-Shuraim',
 arabicName: 'سعود الشريم',
 style: 'Murattal',
 getSurahAudioUrl: (s) => `https://server7.mp3quran.net/shrm/${s.toString().padStart(3, '0')}.mp3`,
 getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Saood_ash-Shuraym_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`
 },
 {
 key: 'hudhaify',
 name: 'Ali Al-Hudhaify',
 arabicName: 'علي بن عبد الرحمن الحذيفي',
 style: 'Murattal',
 getSurahAudioUrl: (s) => `https://server9.mp3quran.net/hthfi/${s.toString().padStart(3, '0')}.mp3`,
 getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Hudhaify_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`
 },
 {
 key: 'dosari',
 name: 'Yasser Al-Dosari',
 arabicName: 'ياسر الدوسري',
 style: 'Murattal',
 getSurahAudioUrl: (s) => `https://server11.mp3quran.net/yasser/${s.toString().padStart(3, '0')}.mp3`,
 getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`
 },
 {
 key: 'qatami',
 name: 'Nasser Al-Qatami',
 arabicName: 'ناصر القطامي',
 style: 'Murattal',
 getSurahAudioUrl: (s) => `https://server6.mp3quran.net/qtm/${s.toString().padStart(3, '0')}.mp3`,
 getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Nasser_Alqatami_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`
 },
 {
 key: 'ayyub',
 name: 'Muhammad Ayyub',
 arabicName: 'محمد أيوب',
 style: 'Murattal',
 getSurahAudioUrl: (s) => `https://server8.mp3quran.net/ayyub/${s.toString().padStart(3, '0')}.mp3`,
 getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Muhammad_Ayyoub_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`
 },
 {
 key: 'budair',
 name: 'Salah Al-Budair',
 arabicName: 'صلاح البدير',
 style: 'Murattal',
 getSurahAudioUrl: (s) => `https://server10.mp3quran.net/bdr/${s.toString().padStart(3, '0')}.mp3`,
 getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Salah_Al_Budair_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`
 },
 {
 key: 'basfar',
 name: 'Abdullah Basfar',
 arabicName: 'عبد الله بصفر',
 style: 'Murattal',
 getSurahAudioUrl: (s) => `https://server6.mp3quran.net/bsfr/${s.toString().padStart(3, '0')}.mp3`,
 getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Abdullah_Basfar_192kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`
 }
];

/**
 * Migrim i cilesimeve te ruajtura: emri i vjeter 'qcf4' ishte cshenjues, sepse
 * aplikacioni NUK perdor fonte QCF4 per faqe. Perdoret KFGQPC Uthmanic Script
 * Hafs (Unicode). Vlerat e vjetra te ruajtura ne pajisje perkthehen ne heshtje.
 */
function normalizeScriptType(value?: string): QuranScriptType {
 if (value === 'uthmani_unicode') return 'uthmani_unicode';
 return 'uthmani_hafs_unicode'; // perfshin edhe vleren e vjeter 'qcf4' dhe undefined
}

const DEFAULT_READING_SETTINGS: QuranReadingSettings = {
 theme: 'sepia', // Default to Sepia for ultimate eye comfort
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

interface ExpandableNoteTextProps {
 text: string;
 textColor?: string;
 buttonColor?: string;
 maxLength?: number;
}

export const ExpandableNoteText: React.FC<ExpandableNoteTextProps> = ({
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

interface KuraniViewProps {
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

export const KuraniView: React.FC<KuraniViewProps> = ({
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

 // Reading Settings state (Persisted in localStorage)
 const [readingSettings, setReadingSettings] = useState<QuranReadingSettings>(() => {
 try {
 const saved = localStorage.getItem('hayat_quran_reading_settings');
 if (saved) {
 const parsed = JSON.parse(saved);
 if (parsed.lineSpacing && parsed.lineSpacing > 2.0) {
 parsed.lineSpacing = 1.8;
 }
 return parsed;
 }
 } catch (e) {
 // fallback
 }
 return DEFAULT_READING_SETTINGS;
 });

 const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

 const [reciters, setReciters] = useState<Reciter[]>(QURAN_RECITERS);

 // Initialize local Quran database (6,236 verses) on mount - available offline once downloaded
 useEffect(() => {
 initQuranCorpus().catch(err => {
 console.warn('Could not auto-initialize Quran corpus:', err);
 });
 }, []);

 // Fetch reciters from alquran.cloud API
 useEffect(() => {
 fetch('https://api.alquran.cloud/v1/edition?format=audio&language=ar')
 .then(res => res.json())
 .then(json => {
 if (json.data && Array.isArray(json.data)) {
 const apiReciters: Reciter[] = json.data.map((edition: any) => {
 const identifier = edition.identifier;
 return {
 key: identifier,
 name: edition.englishName || edition.name,
 arabicName: edition.name,
 style: edition.type || 'Murattal',
 getSurahAudioUrl: (s: number) => `https://cdn.islamic.network/quran/audio-surah/128/${identifier}/${s}.mp3`,
 getAyahAudioUrl: (s: number, a: number) => {
 let absolute = 0;
 for (let i = 1; i < s; i++) {
 const sm = ALL_SURAHS_META.find(x => x.number === i);
 if (sm) absolute += sm.numberOfAyahs;
 }
 absolute += a;
 return `https://cdn.islamic.network/quran/audio/128/${identifier}/${absolute}.mp3`;
 }
 };
 });
 
 setReciters(prev => {
 const existingKeys = new Set(prev.map(p => p.key));
 const newReciters = apiReciters.filter(r => !existingKeys.has(r.key));
 return [...prev, ...newReciters];
 });
 }
 })
 .catch(err => console.warn('Failed to fetch reciters from API:', err));
 }, []);

 // Audio Player state
 const [isPlaying, setIsPlaying] = useState<boolean>(false);
 const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null); // 'surah_X' or 'ayah_X_Y'
 const [currentPlayingSurahNum, setCurrentPlayingSurahNum] = useState<number | null>(null);
 const [currentPlayingAyahNum, setCurrentPlayingAyahNum] = useState<number | null>(null);
 const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
 const [audioDuration, setAudioDuration] = useState<number>(0);
 const [playbackRate, setPlaybackRate] = useState<number>(1);
 const [loopMode, setLoopMode] = useState<'off' | 'single' | 'range' | 'surah'>('off');
 const [loopRange, setLoopRange] = useState<{ start: number; end: number }>({ start: 1, end: 1 });
 const [showLoopSettings, setShowLoopSettings] = useState<boolean>(false);
 const audioRef = useRef<HTMLAudioElement | null>(null);

 // Audio time formatting helper
 const formatAudioTime = (secs: number) => {
 if (isNaN(secs) || !isFinite(secs) || secs < 0) return '0:00';
 const m = Math.floor(secs / 60);
 const s = Math.floor(secs % 60);
 return `${m}:${s.toString().padStart(2, '0')}`;
 };

 // Personal Note Editor State
 const [editingNoteAyah, setEditingNoteAyah] = useState<number | null>(null);
 const [noteInputText, setNoteInputText] = useState<string>('');

 // Daily Reading Progress Auto-Tracker
 const [localDailyAyahs, setLocalDailyAyahs] = useState<number>(0);
 const sessionReadAyahs = useRef<Set<string>>(new Set());
 const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

 useEffect(() => {
 const today = getLocalDateString();
 setLocalDailyAyahs(readingState.dailyProgress?.[today] || 0);
 }, [readingState.dailyProgress]);

 useEffect(() => {
 if (!selectedSurahNum || !readingSettings.dailyAyahGoal || readingSettings.dailyAyahGoal <= 0) return;

 const observer = new IntersectionObserver((entries) => {
 let newlyRead = 0;
 entries.forEach(entry => {
 if (entry.isIntersecting) {
 const ayahNum = entry.target.getAttribute('data-ayah-num');
 const surahNum = entry.target.getAttribute('data-surah-num');
 if (ayahNum && surahNum) {
 const ayahId = `${surahNum}-${ayahNum}`;
 if (!sessionReadAyahs.current.has(ayahId)) {
 sessionReadAyahs.current.add(ayahId);
 newlyRead++;
 }
 }
 }
 });

 if (newlyRead > 0) {
 setLocalDailyAyahs(prev => {
 const next = prev + newlyRead;
 
 if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
 syncTimeoutRef.current = setTimeout(() => {
 const today = getLocalDateString();
 onUpdateReadingState(readingState.lastReadSurah || 1, readingState.lastReadAyah || 1, {
 ...(readingState.dailyProgress || {}),
 [today]: next
 });
 }, 3000); // Sync after 3 seconds of inactivity

 return next;
 });
 }
 }, { threshold: 0.5 });

 const timeoutId = setTimeout(() => {
 const elements = document.querySelectorAll('.ayah-container-trackable');
 elements.forEach(el => observer.observe(el));
 }, 800); // Allow DOM to render

 return () => {
 clearTimeout(timeoutId);
 if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
 observer.disconnect();
 };
 }, [selectedSurahNum, surahData, readingSettings.dailyAyahGoal, readingSettings.layoutMode]);

 // Focus Reading Modal State
 const [focusAyahNumber, setFocusAyahNumber] = useState<number | null>(null);
 const [focusFontScale, setFocusFontScale] = useState<number>(38);

 // Tajweed Legend Modal State
 const [isTajweedModalOpen, setIsTajweedModalOpen] = useState<boolean>(false);

 // Selected Reciter Object
 const currentReciter = reciters.find(r => r.key === readingSettings.selectedReciterKey) || reciters[0];

 // Cleanup audio on unmount
 useEffect(() => {
 return () => {
 if (audioRef.current) {
 audioRef.current.pause();
 audioRef.current = null;
 }
 };
 }, []);

 useEffect(() => {
 if (audioRef.current) {
 audioRef.current.playbackRate = playbackRate;
 }
 }, [playbackRate]);

 useEffect(() => {
 if (audioRef.current) {
 // Native audio loop only if playing a Surah file and mode is 'surah', or if mode is 'single' and playing an ayah file
 // Actually, let's handle looping entirely in JS so we can smoothly loop ranges, but native loop is seamless for single tracks.
 if (loopMode === 'single' || (loopMode === 'surah' && !playingAudioKey?.startsWith('ayah_'))) {
 audioRef.current.loop = true;
 } else {
 audioRef.current.loop = false;
 }
 }
 }, [loopMode, playingAudioKey]);

 // Save settings helper
 const updateSettings = (newPartialSettings: Partial<QuranReadingSettings>) => {
 setReadingSettings(prev => {
 const updated = { ...prev, ...newPartialSettings };
 try {
 localStorage.setItem('hayat_quran_reading_settings', JSON.stringify(updated));
 } catch (e) {
 // ignore
 }
 return updated;
 });
 };

 useEffect(() => {
 if (initialSurahNumber) {
 setSelectedSurahNum(initialSurahNumber);
 }
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

 useEffect(() => {
 if (surahData && !loading && targetAyahToScroll) {
 const timer = setTimeout(() => {
 // Wait for page render then scroll
 setTimeout(() => {
 const el = document.getElementById(`ayah-${targetAyahToScroll}`);
 if (el) {
 el.scrollIntoView({ behavior: 'smooth', block: 'center' });
 // Highlight the ayah briefly
 el.classList.add('bg-emerald-500/20', 'transition-colors', 'duration-1000');
 setTimeout(() => {
 el.classList.remove('bg-emerald-500/20');
 }, 2000);
 }
 setTargetAyahToScroll(null);
 }, 100);
 }, 100);
 return () => clearTimeout(timer);
 }
 }, [surahData, loading, targetAyahToScroll, readingSettings.layoutMode]);

 // Audio Playback Handler for Full Surah or Single Ayah
 const playAudio = async (url: string, key: string, surahNum: number, ayahNum: number | null, onEndedNext?: () => void) => {
 try {
 if (playingAudioKey === key && audioRef.current) {
 if (isPlaying) {
 audioRef.current.pause();
 setIsPlaying(false);
 } else {
 audioRef.current.play().then(() => setIsPlaying(true)).catch(err => {
 console.warn('Audio resume error:', err);
 setIsPlaying(false);
 });
 }
 return;
 }

 if (audioRef.current) {
 audioRef.current.pause();
 audioRef.current.ontimeupdate = null;
 audioRef.current.onloadedmetadata = null;
 audioRef.current.onended = null;
 }

 const audio = new Audio(url);
 audio.playbackRate = playbackRate;
 // Native loop setup
 if (loopMode === 'single' || (loopMode === 'surah' && key.startsWith('surah_'))) {
 audio.loop = true;
 } else {
 audio.loop = false;
 }
 audioRef.current = audio;
 setPlayingAudioKey(key);
 setCurrentPlayingSurahNum(surahNum);
 setCurrentPlayingAyahNum(ayahNum);
 setAudioCurrentTime(0);
 setAudioDuration(0);

 audio.ontimeupdate = () => {
 setAudioCurrentTime(audio.currentTime || 0);
 };

 audio.onloadedmetadata = () => {
 setAudioDuration(audio.duration || 0);
 };

 audio.onended = () => {
 setIsPlaying(false);
 setAudioCurrentTime(0);
 if (onEndedNext) {
 onEndedNext();
 } else {
 setPlayingAudioKey(null);
 setCurrentPlayingAyahNum(null);
 }
 };

 await audio.play();
 setIsPlaying(true);
 } catch (err) {
 console.warn('Audio playback error:', err);
 setIsPlaying(false);
 setPlayingAudioKey(null);
 }
 };

 const toggleSurahAudio = () => {
 if (!selectedSurahNum) return;
 const key = `surah_${selectedSurahNum}`;
 const url = currentReciter.getSurahAudioUrl(selectedSurahNum);
 playAudio(url, key, selectedSurahNum, null);
 };

 const playAyahAudio = (ayahNum: number, targetSurahNum?: number) => {
 const activeSurahNum = targetSurahNum || selectedSurahNum;
 if (!activeSurahNum) return;
 const key = `ayah_${activeSurahNum}_${ayahNum}`;
 const url = currentReciter.getAyahAudioUrl(activeSurahNum, ayahNum);
 
 // On ended, automatically play next Ayah
 const onEndedNext = () => {
 const totalAyahsInSurah = surahData && selectedSurahNum === activeSurahNum 
 ? surahData.numberOfAyahs 
 : ALL_SURAHS_META.find(s => s.number === activeSurahNum)?.numberOfAyahs || 286;

 if (loopMode === 'single') {
 playAyahAudio(ayahNum, activeSurahNum);
 } else if (loopMode === 'range') {
 if (ayahNum >= loopRange.end) {
 playAyahAudio(loopRange.start, activeSurahNum);
 } else if (ayahNum < totalAyahsInSurah) {
 playAyahAudio(ayahNum + 1, activeSurahNum);
 } else {
 // Fallback if range end is out of bounds
 playAyahAudio(loopRange.start, activeSurahNum);
 }
 } else if (loopMode === 'surah') {
 if (ayahNum < totalAyahsInSurah) {
 playAyahAudio(ayahNum + 1, activeSurahNum);
 } else {
 playAyahAudio(1, activeSurahNum);
 }
 } else {
 // off
 if (ayahNum < totalAyahsInSurah) {
 playAyahAudio(ayahNum + 1, activeSurahNum);
 } else {
 setPlayingAudioKey(null);
 setCurrentPlayingAyahNum(null);
 }
 }
 };

 playAudio(url, key, activeSurahNum, ayahNum, onEndedNext);
 };

 const stopAudio = () => {
 if (audioRef.current) {
 audioRef.current.pause();
 audioRef.current.currentTime = 0;
 }
 setIsPlaying(false);
 setPlayingAudioKey(null);
 setCurrentPlayingSurahNum(null);
 setCurrentPlayingAyahNum(null);
 setAudioCurrentTime(0);
 setAudioDuration(0);
 };

 const handleNextAyahControl = () => {
 if (currentPlayingSurahNum && currentPlayingAyahNum !== null) {
 const totalAyahs = surahData && selectedSurahNum === currentPlayingSurahNum
 ? surahData.numberOfAyahs
 : ALL_SURAHS_META.find(s => s.number === currentPlayingSurahNum)?.numberOfAyahs || 286;
 if (currentPlayingAyahNum < totalAyahs) {
 playAyahAudio(currentPlayingAyahNum + 1, currentPlayingSurahNum);
 }
 }
 };

 const handlePrevAyahControl = () => {
 if (currentPlayingSurahNum && currentPlayingAyahNum !== null && currentPlayingAyahNum > 1) {
 playAyahAudio(currentPlayingAyahNum - 1, currentPlayingSurahNum);
 }
 };

 const handleSeek = (timeSec: number) => {
 if (audioRef.current) {
 audioRef.current.currentTime = timeSec;
 setAudioCurrentTime(timeSec);
 }
 };

 // Open note modal/editor for an Ayah
 const openNoteEditor = (ayahNum: number) => {
 if (!selectedSurahNum) return;
 const existing = notes.find(n => n.surahNumber === selectedSurahNum && n.ayahNumber === ayahNum);
 setNoteInputText(existing ? existing.text : '');
 setEditingNoteAyah(ayahNum);
 };

 const handleSaveNoteSubmit = () => {
 if (!selectedSurahNum || !surahData || editingNoteAyah === null) return;
 if (noteInputText.trim() === '') {
 // If empty and note exists, delete note
 const existing = notes.find(n => n.surahNumber === selectedSurahNum && n.ayahNumber === editingNoteAyah);
 if (existing && onDeleteNote) {
 onDeleteNote(existing.id);
 }
 } else if (onSaveNote) {
 onSaveNote({
 surahNumber: selectedSurahNum,
 ayahNumber: editingNoteAyah,
 surahName: surahData.transliteration,
 text: noteInputText.trim()
 });
 }
 setEditingNoteAyah(null);
 setNoteInputText('');
 };

 // Theme Styles Builder
 const getThemeStyles = (theme: QuranReadingTheme) => {
 switch (theme) {
 case 'sepia':
 return {
 bg: 'bg-[#FAF6EE]',
 text: 'text-[#2C251E]',
 cardBg: 'bg-[#F3EBDA]',
 cardBorder: 'border-[#E5D8BF]',
 headerBg: 'bg-[#EEE3CD]',
 headerBorder: 'border-[#DECFA7]',
 arabicText: 'text-[#1F170F]',
 sqText: 'text-[#473B2C]',
 accent: 'text-[#0E6243]',
 badgeBg: 'bg-[#E7DABE] text-[#0E6243] border-[#D6C7A7]',
 btnBg: 'bg-[#E7DABE] text-[#2C251E] hover:bg-[#DDD0B2] border-[#D6C7A7]',
 btnActive: 'bg-[#0E6243] text-white border-[#0B4F36]'
 };
 case 'light':
 return {
 bg: 'bg-slate-50',
 text: 'text-slate-900',
 cardBg: 'bg-white',
 cardBorder: 'border-slate-200 shadow-sm',
 headerBg: 'bg-slate-100',
 headerBorder: 'border-slate-200',
 arabicText: 'text-slate-950',
 sqText: 'text-slate-700',
 accent: 'text-emerald-700',
 badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
 btnBg: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200',
 btnActive: 'bg-emerald-700 text-white border-emerald-800'
 };
 case 'midnight':
 return {
 bg: 'bg-black',
 text: 'text-zinc-100',
 cardBg: 'bg-zinc-950',
 cardBorder: 'border-zinc-900',
 headerBg: 'bg-zinc-900',
 headerBorder: 'border-zinc-800',
 arabicText: 'text-zinc-100',
 sqText: 'text-zinc-400',
 accent: 'text-emerald-400',
 badgeBg: 'bg-zinc-900 text-emerald-400 border-zinc-800',
 btnBg: 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border-zinc-800',
 btnActive: 'bg-emerald-600 text-slate-950 font-bold border-emerald-500'
 };
 case 'dark':
 default:
 return {
 bg: 'bg-slate-950',
 text: 'text-slate-100',
 cardBg: 'bg-slate-900/90',
 cardBorder: 'border-slate-800',
 headerBg: 'bg-slate-900',
 headerBorder: 'border-slate-800',
 arabicText: 'text-slate-100',
 sqText: 'text-slate-300',
 accent: 'text-emerald-400',
 badgeBg: 'bg-slate-800 text-emerald-300 border-slate-700',
 btnBg: 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700',
 btnActive: 'bg-emerald-600 text-slate-950 font-bold border-emerald-500'
 };
 }
 };

 const currentTheme = getThemeStyles(readingSettings.theme);

 const filteredSurahs = ALL_SURAHS_META.filter(s =>
 s.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
 s.albanianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 s.number.toString() === searchQuery.trim()
 );

 const filteredNotes = notes.filter(n =>
 n.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
 n.surahName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 n.surahNumber.toString() === searchQuery.trim()
 );

 return (
 <div className="space-y-4 pb-28 animate-fadeIn">
 {/* Reader View Modal/Overlay if a Surah is opened */}
 {selectedSurahNum !== null ? (
 <div className={`min-h-screen p-3 rounded-2xl transition-colors duration-200 ${currentTheme.bg} ${currentTheme.text}`}>
 
 {/* Reader Sticky Header Bar */}
 <div className={`p-3 rounded-xl border flex items-center justify-between sticky top-14 z-30 backdrop-blur shadow-md transition-colors ${currentTheme.headerBg} ${currentTheme.headerBorder}`}>
 <button
 id="btn-back-surahs"
 onClick={() => {
 setSelectedSurahNum(null);
 if (isPlaying) {
 audioRef.current?.pause();
 setIsPlaying(false);
 setPlayingAudioKey(null);
 }
 }}
 className={`text-xs font-medium flex items-center space-x-1 ${currentTheme.accent}`}
 >
 <ChevronLeft className="w-4 h-4" />
 <span>Surjet</span>
 </button>

 {surahData && (
 <div className="text-center px-1">
 <h3 className="font-bold font-serif text-xs sm:text-sm">
 {surahData.number}. {surahData.transliteration} ({surahData.albanianName})
 </h3>
 <p className="text-[10px] opacity-75 font-mono">
 {surahData.revelationType === 'Meccan' ? 'Mekase' : 'Medinase'} • {surahData.numberOfAyahs} Ajete
 </p>
 </div>
 )}

 <div className="flex items-center space-x-1.5">
 {/* Eye Comfort & Reading Settings Button */}
 <button
 id="btn-reading-settings"
 onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
 className={`p-2 rounded-lg border transition-all ${
 showSettingsDrawer ? currentTheme.btnActive : currentTheme.btnBg
 }`}
 title="Cilësimet e Pamjes & Sytë"
 >
 <Eye className="w-4 h-4" />
 </button>

 {/* Play/Pause Surah Audio */}
 <button
 id="btn-audio-play"
 onClick={toggleSurahAudio}
 className={`p-2 rounded-lg border transition-colors ${
 playingAudioKey === `surah_${selectedSurahNum}` && isPlaying
 ? 'bg-emerald-600 text-slate-950 border-emerald-500 animate-pulse'
 : currentTheme.btnBg
 }`}
 title={`Dëgjo Surjen (${currentReciter.name})`}
 >
 {playingAudioKey === `surah_${selectedSurahNum}` && isPlaying ? (
 <Pause className="w-4 h-4" />
 ) : (
 <Play className="w-4 h-4" />
 )}
 </button>
 </div>
 </div>

 {/* Eye-Comfort Settings Control Panel (Drawer) */}
 {showSettingsDrawer && (
 <div className={`my-3 p-4 rounded-xl border space-y-4 shadow-lg animate-fadeIn ${currentTheme.cardBg} ${currentTheme.cardBorder}`}>
 <div className="flex items-center justify-between border-b pb-2.5 border-current/10">
 <div className="flex items-center space-x-2">
 <Sliders className={`w-4 h-4 ${currentTheme.accent}`} />
 <h4 className="text-xs font-bold uppercase tracking-wider">Cilësimet e Pamjes & Sytë</h4>
 </div>
 <button
 onClick={() => setShowSettingsDrawer(false)}
 className="p-1 rounded-lg opacity-70 hover:opacity-100"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Theme Selector (Pamja e Sytë) */}
 <div className="space-y-1.5">
 <label className="text-[11px] font-semibold opacity-80 block">Tema e Leximit (Relaksim për sytë)</label>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
 <button
 onClick={() => updateSettings({ theme: 'sepia' })}
 className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition-all ${
 readingSettings.theme === 'sepia'
 ? 'border-[#0E6243] bg-[#EAE0CD] text-[#0E6243] font-bold shadow'
 : 'border-[#E5D8BF] bg-[#FAF0DD] text-[#3D3327]'
 }`}
 >
 <Feather className="w-3.5 h-3.5" />
 <span>Letër e Ngrohtë</span>
 </button>

 <button
 onClick={() => updateSettings({ theme: 'dark' })}
 className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition-all ${
 readingSettings.theme === 'dark'
 ? 'border-emerald-500 bg-slate-800 text-emerald-400 font-bold shadow'
 : 'border-slate-800 bg-slate-900 text-slate-300'
 }`}
 >
 <Moon className="w-3.5 h-3.5" />
 <span>Nata (Slate)</span>
 </button>

 <button
 onClick={() => updateSettings({ theme: 'light' })}
 className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition-all ${
 readingSettings.theme === 'light'
 ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold shadow'
 : 'border-slate-200 bg-white text-slate-700'
 }`}
 >
 <Sun className="w-3.5 h-3.5" />
 <span>Dritë e Pastër</span>
 </button>

 <button
 onClick={() => updateSettings({ theme: 'midnight' })}
 className={`p-2.5 rounded-xl border text-xs font-medium flex items-center space-x-2 transition-all ${
 readingSettings.theme === 'midnight'
 ? 'border-emerald-500 bg-zinc-900 text-emerald-400 font-bold shadow'
 : 'border-zinc-800 bg-black text-zinc-400'
 }`}
 >
 <Sparkles className="w-3.5 h-3.5" />
 <span>Mbrëmje OLED</span>
 </button>
 </div>
 </div>

 {/* Font Size & Spacing Controls */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-current/10">
 {/* Arabic Font Size */}
 <div className="space-y-1.5">
 <div className="flex justify-between items-center text-[11px]">
 <span className="font-semibold opacity-80">Madhësia e Tekstit Arabisht</span>
 <span className="font-mono text-xs">{readingSettings.arabicFontSize}px</span>
 </div>
 <div className="flex items-center space-x-1.5">
 {[22, 28, 34, 42].map(size => (
 <button
 key={size}
 onClick={() => updateSettings({ arabicFontSize: size })}
 className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
 readingSettings.arabicFontSize === size
 ? currentTheme.btnActive
 : currentTheme.btnBg
 }`}
 >
 {size === 22 ? 'S' : size === 28 ? 'M' : size === 34 ? 'L' : 'XL'}
 </button>
 ))}
 </div>
 </div>

 {/* Albanian Translation Font Size */}
 <div className="space-y-1.5">
 <div className="flex justify-between items-center text-[11px]">
 <span className="font-semibold opacity-80">Madhësia e Përkthimit Shqip</span>
 <span className="font-mono text-xs">{readingSettings.albanianFontSize}px</span>
 </div>
 <div className="flex items-center space-x-1.5">
 {[13, 15, 17, 19].map(size => (
 <button
 key={size}
 onClick={() => updateSettings({ albanianFontSize: size })}
 className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
 readingSettings.albanianFontSize === size
 ? currentTheme.btnActive
 : currentTheme.btnBg
 }`}
 >
 {size === 13 ? '13' : size === 15 ? '15' : size === 17 ? '17' : '19'}
 </button>
 ))}
 </div>
 </div>
 </div>

 {/* Display Mode & Translation Toggle */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-current/10">
 <div className="space-y-1.5">
 <label className="text-[11px] font-semibold opacity-80 block">Mënyra e Paraqitjes</label>
 <div className="flex space-x-2">
 <button
 onClick={() => updateSettings({ layoutMode: 'cards' })}
 className={`flex-1 py-2 px-2 rounded-xl border text-[10px] font-medium flex flex-col items-center justify-center space-y-1 ${
 readingSettings.layoutMode === 'cards'
 ? currentTheme.btnActive
 : currentTheme.btnBg
 }`}
 >
 <Layers className="w-4 h-4" />
 <span>Ajete</span>
 </button>

 <button
 onClick={() => updateSettings({ layoutMode: 'mushaf' })}
 className={`flex-1 py-2 px-2 rounded-xl border text-[10px] font-medium flex flex-col items-center justify-center space-y-1 ${
 readingSettings.layoutMode === 'mushaf'
 ? currentTheme.btnActive
 : currentTheme.btnBg
 }`}
 >
 <BookOpen className="w-4 h-4" />
 <span>Mushaf</span>
 </button>
 </div>
 </div>

 <div className="space-y-1.5">
 <label className="text-[11px] font-semibold opacity-80 block">Përkthimi Shqip</label>
 <button
 onClick={() => updateSettings({ showTranslation: !readingSettings.showTranslation })}
 className={`w-full py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-2 ${
 readingSettings.showTranslation
 ? currentTheme.btnActive
 : currentTheme.btnBg
 }`}
 >
 <span>{readingSettings.showTranslation ? 'Tregon Përkthimin Shqip' : 'Vetëm Arabisht (Përkthimi i fshehur)'}</span>
 </button>
 </div>
 </div>

 {/* Font Script Picker: Shkrimi i Kuranit */}
 <div className="pt-2 border-t border-current/10 space-y-1.5">
 <label className="text-[11px] font-semibold opacity-80 block">Shkrimi i Kuranit</label>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 <button
 onClick={() => updateSettings({ scriptType: 'uthmani_hafs_unicode' })}
 className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
 normalizeScriptType(readingSettings.scriptType) === 'uthmani_hafs_unicode'
 ? currentTheme.btnActive
 : currentTheme.btnBg
 }`}
 >
 <div className="font-bold">KFGQPC Uthmanic Script Hafs — Unicode</div>
 <div className="text-[10px] opacity-70">خط قرآن مصحف المدينة (KFGQPC)</div>
 </button>

 <button
 onClick={() => updateSettings({ scriptType: 'uthmani_unicode' })}
 className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
 readingSettings.scriptType === 'uthmani_unicode'
 ? currentTheme.btnActive
 : currentTheme.btnBg
 }`}
 >
 <div className="font-bold">Uthmani Hafs Unicode — fallback i lehtë</div>
 <div className="text-[10px] opacity-70">Tekst standard Uthmani</div>
 </button>
 </div>
 </div>

 {/* Tajweed & View Mode Control */}
 <div className="pt-2 border-t border-current/10 space-y-2.5">
 <div className="flex items-center justify-between">
 <div>
 <label className="text-[11px] font-semibold opacity-80 block">Pamja e Tekstit</label>
 <p className="text-[10px] opacity-65">Lloji i shikimit të tekstit kuranor</p>
 </div>
 <div className="flex space-x-1.5">
 <button
 onClick={() => updateSettings({ viewMode: 'normal', showTajweed: false })}
 className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition-all ${
 (readingSettings.viewMode || 'normal') === 'normal' && !readingSettings.showTajweed
 ? currentTheme.btnActive
 : currentTheme.btnBg
 }`}
 >
 Normale
 </button>
 <button
 onClick={() => updateSettings({ viewMode: 'tajweed', showTajweed: true })}
 className={`py-1.5 px-3 rounded-xl border text-xs font-bold transition-all ${
 readingSettings.viewMode === 'tajweed' || readingSettings.showTajweed
 ? 'bg-amber-600 text-white border-amber-500 shadow-md'
 : currentTheme.btnBg
 }`}
 >
 Texhvid
 </button>
 </div>
 </div>

 {(readingSettings.viewMode === 'tajweed' || readingSettings.showTajweed) && (
 <div className="space-y-2 pt-1 border-t border-current/10">
 <TajweedLegend onOpenModal={() => setIsTajweedModalOpen(true)} />
 </div>
 )}
 </div>

 {/* Daily Ayah Goal Setting */}
 <div className="pt-2 border-t border-current/10 space-y-1.5">
 <label className="text-[11px] font-semibold opacity-80 block">Synimi Ditor i Leximit</label>
 <div className="flex space-x-2">
 {[0, 20, 50, 100].map(goal => (
 <button
 key={goal}
 onClick={() => updateSettings({ dailyAyahGoal: goal })}
 className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
 (readingSettings.dailyAyahGoal || 0) === goal
 ? currentTheme.btnActive
 : currentTheme.btnBg
 }`}
 >
 {goal === 0 ? 'Fikur' : `${goal} Ajete`}
 </button>
 ))}
 </div>
 </div>

 {/* Reciter Selector */}
 <div className="pt-2 border-t border-current/10 space-y-1.5">
 <div className="flex items-center space-x-2 text-[11px] font-semibold opacity-80">
 <Music className="w-3.5 h-3.5" />
 <span>Recituesi i Zgjedhur i Audio-s</span>
 </div>
 <select
 value={readingSettings.selectedReciterKey}
 onChange={e => updateSettings({ selectedReciterKey: e.target.value })}
 className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none ${currentTheme.btnBg}`}
 >
 {QURAN_RECITERS.map(reciter => (
 <option key={reciter.key} value={reciter.key}>
 {reciter.name} ({reciter.arabicName})
 </option>
 ))}
 </select>
 </div>

 </div>
 )}

 {/* Main Quran Text Area */}
 {loading ? (
 <div className="text-center py-20 text-sm italic opacity-75">
 Duke ngarkuar tekstin e Kuranit Fisnik...
 </div>
 ) : surahData ? (
 <div className="space-y-4 mt-3">
 {/* Bismillah Header (Except Surah 9 & 1) */}
 {selectedSurahNum !== 9 && selectedSurahNum !== 1 && (
 <div className={`text-center py-6 px-4 rounded-2xl border ${currentTheme.cardBg} ${currentTheme.cardBorder} flex flex-col items-center justify-center space-y-3`}>
 <div
 className="font-arabic text-3xl transition-all leading-[2.4]"
 style={{ fontSize: `${readingSettings.arabicFontSize + 4}px` }}
 dir="rtl"
 >
 {renderTajweedText("بِسْم اللَّه الرَّحْمَٰن الرَّحِيمِ", readingSettings.showTajweed)}
 </div>
 {readingSettings.showTranslation && (
 <p className="text-xs opacity-75 font-sans pt-1">Me emrin e Allahut, Mëshiruesit, Mëshirëbërësit!</p>
 )}
 </div>
 )}

 {/* Continuous Mushaf View vs Card View */}
 {readingSettings.layoutMode === 'mushaf' ? (
 /* Continuous Mushaf Flow Mode */
 <div className={`p-6 rounded-2xl border space-y-6 ${currentTheme.cardBg} ${currentTheme.cardBorder}`}>
 <div
 className="font-arabic text-right select-text transition-all leading-[2.6]"
 style={{
 fontSize: `${readingSettings.arabicFontSize}px`,
 lineHeight: readingSettings.lineSpacing
 }}
 dir="rtl"
 >
 {surahData.ayahs.map(ayah => (
 <span
 key={ayah.numberInSurah}
 id={`ayah-${ayah.numberInSurah}`}
 className="ayah-container-trackable inline cursor-pointer hover:opacity-90 transition-opacity"
 data-ayah-num={ayah.numberInSurah}
 data-surah-num={selectedSurahNum}
 onClick={() => openNoteEditor(ayah.numberInSurah)}
 title={`Ajeti ${ayah.numberInSurah} - Kliko për të shtuar shënim`}
 >
 <QuranVerseRenderer
 textAr={ayah.textAr}
 surahNumber={selectedSurahNum}
 numberInSurah={ayah.numberInSurah}
 showTajweed={readingSettings.showTajweed}
 className={currentTheme.arabicText}
 />
 {' '}
 </span>
 ))}
 </div>

 {/* Translations below Mushaf text if enabled */}
 {readingSettings.showTranslation && (
 <div className="pt-6 border-t border-current/10 space-y-3">
 <h4 className="text-xs font-bold uppercase tracking-wider opacity-70">Përkthimi i Ajeteve (Hasan Nahi)</h4>
 <div className="space-y-3">
 {surahData.ayahs.map(ayah => (
 <div key={ayah.numberInSurah} className="text-xs space-y-1">
 <span className={`font-mono font-bold mr-1.5 ${currentTheme.accent}`}>
 [{ayah.numberInSurah}]
 </span>
 <span
 className={`${currentTheme.sqText}`}
 style={{ fontSize: `${readingSettings.albanianFontSize}px` }}
 >
 {ayah.textSq}
 </span>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 ) : (
 /* Cards Mode (Default) */
 <div className="space-y-3.5">
 {surahData.ayahs.map(ayah => {
 const isLastRead =
 readingState.lastReadSurah === selectedSurahNum &&
 readingState.lastReadAyah === ayah.numberInSurah;

 const isBookmarked = bookmarks.some(
 b => b.surahNumber === selectedSurahNum && b.ayahNumber === ayah.numberInSurah
 );

 const ayahNote = notes.find(
 n => n.surahNumber === selectedSurahNum && n.ayahNumber === ayah.numberInSurah
 );

 const isAyahPlaying = playingAudioKey === `ayah_${selectedSurahNum}_${ayah.numberInSurah}` && isPlaying;

 return (
 <div
 key={ayah.numberInSurah}
 id={`ayah-${ayah.numberInSurah}`}
 data-ayah-num={ayah.numberInSurah}
 data-surah-num={selectedSurahNum}
 className={`ayah-container-trackable p-4 rounded-2xl border transition-all ${
 isAyahPlaying
 ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
 : isLastRead
 ? 'border-emerald-600/80 shadow-inner'
 : currentTheme.cardBorder
 } ${currentTheme.cardBg}`}
 >
 {/* Ayah Header Bar */}
 <div className="flex items-center justify-between mb-3 border-b border-current/10 pb-2.5">
 <div className="flex items-center space-x-2">
 {/* Play Ayah Audio Button */}
 <button
 onClick={() => playAyahAudio(ayah.numberInSurah)}
 className={`p-1.5 rounded-lg border transition-all text-xs flex items-center space-x-1 ${
 isAyahPlaying
 ? 'bg-emerald-600 text-slate-950 border-emerald-500 font-bold animate-pulse'
 : currentTheme.btnBg
 }`}
 title="Dëgjo këtë Ajet"
 >
 {isAyahPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
 </button>
 </div>

 <div className="flex items-center space-x-1.5">
 {/* Focus Reading Modal Button */}
 <button
 onClick={() => setFocusAyahNumber(ayah.numberInSurah)}
 className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all flex items-center space-x-1 ${currentTheme.btnBg}`}
 title="Modal i Fokusuar i Leximit"
 >
 <Maximize2 className="w-3.5 h-3.5" />
 <span className="hidden sm:inline">Fokus</span>
 </button>

 {/* Personal Note Button */}
 <button
 onClick={() => openNoteEditor(ayah.numberInSurah)}
 className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all flex items-center space-x-1 ${
 ayahNote
 ? 'bg-amber-900/40 border-amber-600 text-amber-300 font-semibold'
 : currentTheme.btnBg
 }`}
 title="Shto/Ndrysho Shënim Personal"
 >
 <FileText className="w-3.5 h-3.5" />
 <span className="hidden sm:inline">{ayahNote ? 'Shënimi yt' : 'Shënim'}</span>
 </button>

 {/* Hatmah Tracker Button */}
 <button
 onClick={() => onUpdateReadingState(selectedSurahNum, ayah.numberInSurah)}
 className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all flex items-center space-x-1 ${
 isLastRead
 ? 'bg-emerald-600 text-white border-emerald-700 font-bold'
 : currentTheme.btnBg
 }`}
 title="Mark last read position"
 >
 <Check className="w-3.5 h-3.5" />
 <span>{isLastRead ? 'Hatmah' : 'Mbeta këtu'}</span>
 </button>

 {/* Bookmark Button */}
 <button
 onClick={() => {
 if (isBookmarked) {
 const b = bookmarks.find(
 bm => bm.surahNumber === selectedSurahNum && bm.ayahNumber === ayah.numberInSurah
 );
 if (b) onRemoveBookmark(b.id);
 } else {
 onAddBookmark({
 surahNumber: selectedSurahNum,
 ayahNumber: ayah.numberInSurah,
 surahName: surahData.transliteration
 });
 }
 }}
 className={`p-1.5 rounded-lg border transition-colors ${
 isBookmarked
 ? 'bg-amber-950 border-amber-700 text-amber-300'
 : currentTheme.btnBg
 }`}
 title="Bookmark"
 >
 <Bookmark className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>

 {/* Arabic Text */}
 <p
 className={`font-arabic text-right select-text my-3 ${currentTheme.arabicText}`}
 style={{
 fontSize: `${readingSettings.arabicFontSize}px`,
 lineHeight: readingSettings.lineSpacing
 }}
 dir="rtl"
 >
 <QuranVerseRenderer
 textAr={ayah.textAr}
 surahNumber={selectedSurahNum}
 numberInSurah={ayah.numberInSurah}
 showTajweed={readingSettings.showTajweed}
 />
 </p>

 {/* Albanian Hasan Nahi Translation */}
 {readingSettings.showTranslation && (
 <p
 className={`font-sans leading-relaxed border-t border-current/10 pt-3 ${currentTheme.sqText}`}
 style={{ fontSize: `${readingSettings.albanianFontSize}px` }}
 >
 {ayah.textSq}
 </p>
 )}

 {/* Personal Note Box Preview under Ayah if exists */}
 {ayahNote && (
 <div className={`mt-3 p-3 rounded-xl border text-xs space-y-1 bg-amber-950/20 border-amber-800/40 text-amber-200`}>
 <div className="flex items-center justify-between font-bold text-[11px] text-amber-400">
 <span className="flex items-center space-x-1">
 <FileText className="w-3 h-3" />
 <span>Shënimi yt personal:</span>
 </span>
 <button
 onClick={() => openNoteEditor(ayah.numberInSurah)}
 className="underline text-[10px] hover:text-amber-300"
 >
 Ndrysho
 </button>
 </div>
 <ExpandableNoteText
 text={ayahNote.text}
 textColor="text-amber-200"
 buttonColor="text-amber-400 hover:text-amber-300"
 maxLength={100}
 />
 </div>
 )}
 </div>
 );
 })}
 </div>
 )}

 {/* Prev/Next Surah Navigation Footer */}
 <div className="flex justify-between items-center pt-5 border-t border-current/10">
 <button
 disabled={selectedSurahNum <= 1}
 onClick={() => setSelectedSurahNum(prev => (prev && prev > 1 ? prev - 1 : prev))}
 className={`px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center space-x-1 disabled:opacity-40 ${currentTheme.btnBg}`}
 >
 <ChevronLeft className="w-4 h-4" />
 <span>Surja e Mëparshme</span>
 </button>

 <button
 disabled={selectedSurahNum >= 114}
 onClick={() => setSelectedSurahNum(prev => (prev && prev < 114 ? prev + 1 : prev))}
 className={`px-4 py-2.5 rounded-xl border text-xs font-medium flex items-center space-x-1 disabled:opacity-40 ${currentTheme.btnBg}`}
 >
 <span>Surja Tjetër</span>
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 ) : null}

 {/* Personal Note Editor Modal */}
 {editingNoteAyah !== null && (
 <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
 <div className="bg-slate-900 border border-slate-800 text-slate-100 p-5 rounded-2xl w-full max-w-md space-y-4 shadow-2xl animate-scaleUp">
 <div className="flex items-center justify-between border-b border-slate-800 pb-3">
 <div className="flex items-center space-x-2">
 <FileText className="w-5 h-5 text-emerald-400" />
 <h3 className="font-bold text-sm">
 Shënim Personal për Ajetin {editingNoteAyah}
 </h3>
 </div>
 <button
 onClick={() => setEditingNoteAyah(null)}
 className="p-1 rounded-lg text-slate-400 hover:text-white"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 <div className="space-y-2">
 <p className="text-xs text-slate-400">
 Shkruani refleksionin, shënimin apo kujtesën tuaj personale për këtë ajet (Surja {surahData?.transliteration}, Ajeti {editingNoteAyah}):
 </p>
 <textarea
 rows={5}
 value={noteInputText}
 onChange={e => setNoteInputText(e.target.value)}
 placeholder="P.sh. Kjo thirrje në ajet më rikujton rëndësinë e durimit dhe falënderimit..."
 className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
 ></textarea>
 </div>

 <div className="flex space-x-2 pt-2">
 <button
 onClick={() => setEditingNoteAyah(null)}
 className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium"
 >
 Anulo
 </button>
 <button
 onClick={handleSaveNoteSubmit}
 className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs shadow transition-colors"
 >
 Ruaj Shënimin
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Focus Reading Modal Overlay */}
 {focusAyahNumber !== null && surahData && (
 <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
 <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col my-auto transition-colors duration-200 ${currentTheme.bg} ${currentTheme.text} ${currentTheme.cardBorder}`}>
 
 {/* Focus Modal Header */}
 <div className={`p-4 sm:p-5 border-b flex items-center justify-between sticky top-0 z-10 backdrop-blur-md ${currentTheme.headerBg} ${currentTheme.headerBorder}`}>
 <div className="flex items-center space-x-3">
 <div>
 <h3 className="font-bold font-serif text-sm sm:text-base">
 Surja {surahData.transliteration} • Ajeti {focusAyahNumber}
 </h3>
 <p className="text-[11px] opacity-75 font-mono">
 Lexim i Fokusuar • Recituesi: {currentReciter.name}
 </p>
 </div>
 </div>

 <div className="flex items-center space-x-2">
 {/* Font size adjustments */}
 <div className="flex items-center bg-black/10 dark:bg-white/10 p-1 rounded-xl space-x-1 border border-current/10">
 <button
 onClick={() => setFocusFontScale(prev => Math.max(26, prev - 4))}
 className="px-2 py-0.5 text-xs font-bold rounded-lg hover:bg-black/10 transition-colors"
 title="Zvogëlo fontin"
 >
 A-
 </button>
 <span className="text-[10px] font-mono px-1 font-semibold">{focusFontScale}px</span>
 <button
 onClick={() => setFocusFontScale(prev => Math.min(64, prev + 4))}
 className="px-2 py-0.5 text-xs font-bold rounded-lg hover:bg-black/10 transition-colors"
 title="Zmadho fontin"
 >
 A+
 </button>
 </div>

 <button
 onClick={() => setFocusAyahNumber(null)}
 className="p-2 rounded-xl opacity-80 hover:opacity-100 hover:bg-black/10 transition-colors"
 title="Mbyll modalin"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 </div>

 {/* Focus Modal Body */}
 {(() => {
 const focusAyah = surahData.ayahs.find(a => a.numberInSurah === focusAyahNumber);
 if (!focusAyah) return null;

 const isAyahPlaying = playingAudioKey === `ayah_${selectedSurahNum}_${focusAyahNumber}` && isPlaying;
 const isLastRead = readingState.lastReadSurah === selectedSurahNum && readingState.lastReadAyah === focusAyahNumber;
 const isBookmarked = bookmarks.some(b => b.surahNumber === selectedSurahNum && b.ayahNumber === focusAyahNumber);
 const focusNote = notes.find(n => n.surahNumber === selectedSurahNum && n.ayahNumber === focusAyahNumber);

 return (
 <>
 <div className="p-6 sm:p-10 space-y-8 overflow-y-auto max-h-[70vh]">
 {/* Arabic Text in Large Comfortable Focus Typography */}
 <div className="text-right py-4" dir="rtl">
 <p
 className={`font-arabic select-text transition-all ${currentTheme.arabicText}`}
 style={{
 fontSize: `${focusFontScale}px`,
 lineHeight: 2.7
 }}
 >
 <QuranVerseRenderer
 textAr={focusAyah.textAr}
 surahNumber={selectedSurahNum}
 numberInSurah={focusAyah.numberInSurah}
 showTajweed={readingSettings.showTajweed}
 />
 </p>
 </div>

 {/* Albanian Hasan Nahi Translation */}
 {readingSettings.showTranslation && (
 <div className="pt-6 border-t border-current/10 space-y-2">
 <p className="text-[11px] font-bold uppercase tracking-wider opacity-60">Përkthimi Shqip (Hasan Nahi)</p>
 <p
 className={`font-sans leading-relaxed text-base sm:text-lg font-medium ${currentTheme.sqText}`}
 style={{ fontSize: `${readingSettings.albanianFontSize + 3}px` }}
 >
 {focusAyah.textSq}
 </p>
 </div>
 )}

 {/* Personal Note Box Preview */}
 {focusNote && (
 <div className="p-4 rounded-2xl border text-xs bg-amber-950/20 border-amber-800/40 text-amber-200 space-y-1">
 <div className="flex justify-between items-center font-bold text-amber-400 text-xs">
 <span className="flex items-center space-x-1">
 <FileText className="w-3.5 h-3.5" />
 <span>Shënimi yt personal:</span>
 </span>
 <button onClick={() => openNoteEditor(focusAyahNumber)} className="underline text-[11px] hover:text-amber-300">
 Ndrysho
 </button>
 </div>
 <ExpandableNoteText
 text={focusNote.text}
 textColor="text-amber-200"
 buttonColor="text-amber-400 hover:text-amber-300"
 maxLength={120}
 />
 </div>
 )}
 </div>

 {/* Focus Modal Footer Navigation & Actions */}
 <div className={`p-4 border-t flex flex-wrap items-center justify-between gap-3 ${currentTheme.headerBg} ${currentTheme.headerBorder}`}>
 <div className="flex items-center space-x-2">
 <button
 onClick={() => playAyahAudio(focusAyahNumber)}
 className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
 isAyahPlaying
 ? 'bg-emerald-600 text-slate-950 border-emerald-500 animate-pulse font-bold'
 : currentTheme.btnBg
 }`}
 >
 {isAyahPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
 <span>{isAyahPlaying ? 'Pauzo' : 'Dëgjo Ajetin'}</span>
 </button>

 <button
 onClick={() => openNoteEditor(focusAyahNumber)}
 className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 ${currentTheme.btnBg}`}
 >
 <FileText className="w-4 h-4" />
 <span>{focusNote ? 'Shënimi yt' : 'Shënim'}</span>
 </button>

 <button
 onClick={() => onUpdateReadingState(selectedSurahNum!, focusAyahNumber)}
 className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 ${
 isLastRead ? 'bg-emerald-600 text-white font-bold' : currentTheme.btnBg
 }`}
 >
 <Check className="w-4 h-4" />
 <span>{isLastRead ? 'Hatmah' : 'Mbeta këtu'}</span>
 </button>

 <button
 onClick={() => {
 if (isBookmarked) {
 const b = bookmarks.find(bm => bm.surahNumber === selectedSurahNum && bm.ayahNumber === focusAyahNumber);
 if (b) onRemoveBookmark(b.id);
 } else {
 onAddBookmark({
 surahNumber: selectedSurahNum!,
 ayahNumber: focusAyahNumber,
 surahName: surahData.transliteration
 });
 }
 }}
 className={`p-2 rounded-xl border transition-colors ${
 isBookmarked ? 'bg-amber-950 border-amber-700 text-amber-300' : currentTheme.btnBg
 }`}
 title="Bookmark"
 >
 <Bookmark className="w-4 h-4" />
 </button>
 </div>

 {/* Prev / Next Ayah Arrows inside modal */}
 <div className="flex items-center space-x-2">
 <button
 disabled={focusAyahNumber <= 1}
 onClick={() => setFocusAyahNumber(prev => (prev && prev > 1 ? prev - 1 : prev))}
 className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1 disabled:opacity-40 ${currentTheme.btnBg}`}
 >
 <ChevronLeft className="w-4 h-4" />
 <span>Mëparshmi</span>
 </button>

 <button
 disabled={focusAyahNumber >= surahData.numberOfAyahs}
 onClick={() => setFocusAyahNumber(prev => (prev && prev < surahData.numberOfAyahs ? prev + 1 : prev))}
 className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-1 disabled:opacity-40 ${currentTheme.btnBg}`}
 >
 <span>Tjetri</span>
 <ChevronRight className="w-4 h-4" />
 </button>
 </div>
 </div>
 </>
 );
 })()}

 </div>
 </div>
 )}

 </div>
 ) : (
 /* Surahs Directory View */
 <div className="space-y-4">
 {/* Sub Navigation */}
 <div className="space-y-3">
 {/* Big Top Search Bar */}
 <div className="relative">
 <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => {
 const val = e.target.value;
 setSearchQuery(val);
 if (val.trim() && activeTab !== 'search') {
 setActiveTab('search');
 }
 }}
 onFocus={() => {
 if (searchQuery.trim() && activeTab !== 'search') {
 setActiveTab('search');
 }
 }}
 placeholder="Kërko sure, ajet, fjalë ose frazë..."
 className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-10 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors shadow-sm font-medium"
 aria-label="Kërko sure, ajet, fjalë ose frazë..."
 />
 {searchQuery && (
 <button
 onClick={() => {
 setSearchQuery('');
 }}
 className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
 aria-label="Pastro kërkimin"
 >
 <X className="w-4 h-4" />
 </button>
 )}
 </div>

 {/* Tabs Header */}
 <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs flex-wrap sm:flex-nowrap gap-1">
 <button
 onClick={() => setActiveTab('surahs')}
 className={`flex-1 min-w-[30%] sm:min-w-0 py-2 px-1.5 rounded-lg font-semibold transition-all text-center ${
 activeTab === 'surahs'
 ? 'bg-emerald-600 text-slate-950 shadow font-bold'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 Surjet (114)
 </button>

 <button
 onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
 className="flex-1 min-w-[30%] sm:min-w-0 py-2 px-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-all text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
 title="Cilësimet e leximit"
 >
 <Sliders className="w-3.5 h-3.5 text-emerald-400" />
 <span className="truncate">Cilësimet e leximit</span>
 </button>

 <button
 onClick={() => setActiveTab('hifz')}
 className={`flex-1 min-w-[30%] sm:min-w-0 py-2 px-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-all ${
 activeTab === 'hifz'
 ? 'bg-emerald-600 text-slate-950 shadow font-bold'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <Brain className="w-3.5 h-3.5" />
 <span>Hifz / Memorizimi</span>
 </button>

  <button
    onClick={() => setActiveTab('khatam')}
    className={`flex-1 min-w-[30%] sm:min-w-0 py-2 px-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-all ${
      activeTab === 'khatam'
        ? 'bg-emerald-600 text-slate-950 shadow font-bold'
        : 'text-slate-400 hover:text-slate-200'
    }`}
  >
    <Award className="w-3.5 h-3.5" />
    <span>Planifikuesi (Hatme)</span>
  </button>

 <button
 onClick={() => setActiveTab('bookmarks')}
 className={`flex-1 min-w-[30%] sm:min-w-0 py-2 px-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-all ${
 activeTab === 'bookmarks'
 ? 'bg-amber-600 text-white shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <Bookmark className="w-3.5 h-3.5" />
 <span>Bookmarks ({bookmarks.length})</span>
 </button>

 <button
 onClick={() => setActiveTab('notes')}
 className={`flex-1 min-w-[30%] sm:min-w-0 py-2 px-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-all ${
 activeTab === 'notes'
 ? 'bg-blue-600 text-white shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <FileText className="w-3.5 h-3.5" />
 <span>Shënimet ({notes.length})</span>
 </button>

 <button
 onClick={() => setActiveTab('stats')}
 className={`flex-1 min-w-[30%] sm:min-w-0 py-2 px-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-all ${
 activeTab === 'stats'
 ? 'bg-purple-600 text-white shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <BarChart3 className="w-3.5 h-3.5" />
 <span>Statistikat</span>
 </button>
 </div>
 </div>

 {/* Quick Settings Drawer on main screen */}
 {showSettingsDrawer && (
 <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
 <div className="flex justify-between items-center border-b border-slate-800 pb-2">
 <span className="text-xs font-bold text-emerald-400">Cilësimet e Leximit</span>
 <button onClick={() => setShowSettingsDrawer(false)} className="text-slate-400">
 <X className="w-4 h-4" />
 </button>
 </div>
 
 <div className="space-y-1.5">
 <label className="text-[11px] text-slate-400">Synimi Ditor i Ajeteve (Daily Goal):</label>
 <div className="flex space-x-2">
 {[0, 20, 50, 100].map(goal => (
 <button
 key={goal}
 onClick={() => updateSettings({ dailyAyahGoal: goal })}
 className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
 (readingSettings.dailyAyahGoal || 0) === goal
 ? 'bg-emerald-600 text-white border-emerald-500'
 : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
 }`}
 >
 {goal === 0 ? 'Fikur' : goal}
 </button>
 ))}
 </div>
 </div>

 <div className="space-y-1.5 pt-2 border-t border-slate-800">
 <label className="text-[11px] text-slate-400">Zgjidhni zërin e hfz/imamit të preferuar:</label>
 <select
 value={readingSettings.selectedReciterKey}
 onChange={e => updateSettings({ selectedReciterKey: e.target.value })}
 className="w-full bg-slate-950 border border-slate-800 text-slate-100 p-2.5 rounded-xl text-xs"
 >
 {QURAN_RECITERS.map(r => (
 <option key={r.key} value={r.key}>
 {r.name} ({r.arabicName})
 </option>
 ))}
 </select>
 </div>
 </div>
 )}

 {/* Daily Progress Tracker Banner */}
 {(readingSettings.dailyAyahGoal || 0) > 0 && activeTab === 'surahs' && (
 <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-2.5">
 <div className="flex justify-between items-center text-xs">
 <div className="flex items-center space-x-1.5">
 <span className="text-emerald-400 font-bold">Synimi Ditor</span>
 <span className="opacity-60 font-mono text-[10px]">Automatikisht gjatë leximit</span>
 </div>
 <span className="font-mono font-bold text-slate-300">
 {localDailyAyahs} / {readingSettings.dailyAyahGoal} <span className="opacity-50">Ajete</span>
 </span>
 </div>
 
 <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
 <div 
 className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
 style={{ width: `${Math.min(100, Math.round((localDailyAyahs / (readingSettings.dailyAyahGoal || 1)) * 100))}%` }}
 />
 </div>
 
 {localDailyAyahs >= (readingSettings.dailyAyahGoal || 1) && (
 <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-center space-x-1 animate-pulse">
 <Check className="w-3 h-3" />
 <span>Elhamdulillah, e keni arritur synimin ditor!</span>
 </div>
 )}
 </div>
 )}

 {/* Last Read Tracker Banner */}
 {readingState.lastReadSurah && activeTab === 'surahs' && (
 <div
 onClick={() => setSelectedSurahNum(readingState.lastReadSurah)}
 className="bg-emerald-950/40 border border-emerald-800/60 p-3.5 rounded-xl cursor-pointer hover:bg-emerald-950/60 transition-colors flex items-center justify-between"
 >
 <div className="flex items-center space-x-3">
 <div className="w-8 h-8 rounded-lg bg-emerald-900/60 border border-emerald-700/50 flex items-center justify-center text-emerald-300 font-bold">
 <BookOpen className="w-4 h-4" />
 </div>
 <div>
 <p className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Vazhdo Leximin (Hatmah)</p>
 <h4 className="text-xs font-bold text-slate-100">
 Surja {readingState.lastReadSurah} • Ajeti {readingState.lastReadAyah}
 </h4>
 </div>
 </div>
 <ChevronRight className="w-4 h-4 text-emerald-400" />
 </div>
 )}

 {activeTab === 'search' ? (
 <QuranSearchView
 searchQuery={searchQuery}
 onQueryChange={setSearchQuery}
 hideInputBar={true}
 onSelectSurahAndAyah={(surahNumber, ayahNumber) => {
 setSelectedSurahNum(surahNumber);
 if (ayahNumber) {
 setTargetAyahToScroll(ayahNumber);
 }
 }}
 bookmarks={bookmarks}
 onAddBookmark={(surahNumber, ayahNumber, textSq, textAr) => {
 onAddBookmark(surahNumber, ayahNumber, textSq, textAr);
 }}
 onRemoveBookmark={(surahNumber, ayahNumber) => {
 const bkm = bookmarks.find(b => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber);
 if (bkm) {
 onRemoveBookmark(bkm.id);
 }
 }}
 userNotes={notes}
 />
 ) : activeTab === 'surahs' ? (
 /* Surahs List */
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
 {filteredSurahs.map(surah => (
 <div
 key={surah.number}
 id={`surah-card-${surah.number}`}
 onClick={() => setSelectedSurahNum(surah.number)}
 className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-700/50 p-3.5 rounded-xl cursor-pointer transition-all flex items-center justify-between shadow-sm"
 >
 <div className="flex items-center space-x-3">
 <span className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs flex items-center justify-center font-bold">
 {surah.number}
 </span>
 <div>
 <h4 className="font-bold text-sm text-slate-100">
 {surah.transliteration} <span className="text-xs font-normal text-slate-400">({surah.albanianName})</span>
 </h4>
 <p className="text-[11px] text-slate-400">
 {surah.revelationType === 'Meccan' ? 'Mekase' : 'Medinase'} • {surah.numberOfAyahs} Ajete
 </p>
 </div>
 </div>

 <span className="font-arabic text-lg text-emerald-400/90 font-medium" dir="rtl">
 {surah.name}
 </span>
 </div>
 ))}
 </div>
 ) : activeTab === 'bookmarks' ? (
 /* Bookmarks Tab */
 <div className="space-y-2">
 {bookmarks.length === 0 ? (
 <p className="text-center py-8 text-xs text-slate-400 italic">
 Nuk keni asnjë ajet të ruajtur si bookmark.
 </p>
 ) : (
 bookmarks.map(bkm => (
 <div
 key={bkm.id}
 className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between"
 >
 <div
 onClick={() => setSelectedSurahNum(bkm.surahNumber)}
 className="cursor-pointer space-y-0.5 flex-1"
 >
 <h4 className="text-xs font-bold text-slate-100">
 Surja {bkm.surahName} ({bkm.surahNumber}) • Ajeti {bkm.ayahNumber}
 </h4>
 <p className="text-[10px] text-slate-400">Ruajtur më {new Date(bkm.createdAt).toLocaleDateString()}</p>
 </div>
 <button
 onClick={() => onRemoveBookmark(bkm.id)}
 className="text-xs text-red-400 hover:text-red-300 px-2 py-1 bg-red-950/40 border border-red-900/50 rounded-lg"
 >
 Fshi
 </button>
 </div>
 ))
 )}
 </div>
 ) : activeTab === 'notes' ? (
 /* Personal Notes Tab */
 <div className="space-y-3">
 {filteredNotes.length === 0 ? (
 <div className="text-center py-10 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 space-y-2">
 <FileText className="w-8 h-8 text-slate-500 mx-auto" />
 <p className="text-xs text-slate-300 font-semibold">Nuk keni asnjë shënim personal të ruajtur.</p>
 <p className="text-[11px] text-slate-400">
 Kur të lexoni surjet, klikoni butonin "Shënim" pranë çdo ajeti për të regjistruar refleksionet tuaja.
 </p>
 </div>
 ) : (
 filteredNotes.map(note => (
 <div
 key={note.id}
 className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-2 shadow-sm"
 >
 <div className="flex items-center justify-between border-b border-slate-800 pb-2">
 <div
 onClick={() => setSelectedSurahNum(note.surahNumber)}
 className="cursor-pointer flex items-center space-x-2 text-xs font-bold text-emerald-400 hover:underline"
 >
 <BookOpen className="w-3.5 h-3.5" />
 <span>Surja {note.surahName} ({note.surahNumber}) • Ajeti {note.ayahNumber}</span>
 </div>

 {onDeleteNote && (
 <button
 onClick={() => onDeleteNote(note.id)}
 className="text-xs text-red-400 hover:text-red-300 p-1 bg-red-950/40 border border-red-900/50 rounded-lg"
 title="Fshi Shënimin"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 )}
 </div>

 <ExpandableNoteText
 text={note.text}
 textColor="text-slate-200"
 buttonColor="text-emerald-400 hover:text-emerald-300"
 maxLength={120}
 />

 <div className="flex justify-between items-center pt-1 text-[10px] text-slate-400 font-mono">
 <span>Përditësuar më {new Date(note.updatedAt).toLocaleDateString()}</span>
 <button
 onClick={() => setSelectedSurahNum(note.surahNumber)}
 className="text-emerald-400 flex items-center space-x-1 hover:underline"
 >
 <span>Hap Ajetin</span>
 <CornerDownRight className="w-3 h-3" />
 </button>
 </div>
 </div>
 ))
 )}
 </div>
 ) : activeTab === 'hifz' ? (
 <HifzModule />
  ) : activeTab === 'khatam' ? (
    <KhatamTrackerView onSelectSurah={(surahNum) => {
      setSelectedSurahNum(surahNum);
      setActiveTab('surahs');
    }} />
 ) : activeTab === 'stats' ? (
 <QuranStatsChart
 readingState={readingState}
 bookmarks={bookmarks}
 notes={notes}
 readingSettings={readingSettings}
 />
 ) : null}
 </div>
 )}

 {/* Persistent Floating Audio Player Controller */}
 {playingAudioKey && currentPlayingSurahNum && (
 <div className="fixed bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl bg-slate-900/95 border border-emerald-500/50 text-slate-100 shadow-2xl rounded-2xl p-3 sm:p-4 backdrop-blur-md animate-fadeIn transition-all">
 {/* Header Row: Track Details & Close Button */}
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center space-x-2.5 overflow-hidden pr-2">
 <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
 <Music className={`w-4 h-4 ${isPlaying ? 'animate-bounce' : ''}`} />
 </div>
 <div className="truncate">
 <h4 className="text-xs font-bold text-slate-100 truncate">
 {(() => {
 const sMeta = ALL_SURAHS_META.find(s => s.number === currentPlayingSurahNum);
 const sName = sMeta ? sMeta.transliteration : `Surja ${currentPlayingSurahNum}`;
 return currentPlayingAyahNum !== null
 ? `Surja ${sName} • Ajeti ${currentPlayingAyahNum}`
 : `Surja ${sName} (E plotë)`;
 })()}
 </h4>
 <p className="text-[10px] text-emerald-400/90 font-mono truncate">
 Recituesi: {currentReciter.name}
 </p>
 </div>
 </div>

 <button
 onClick={stopAudio}
 className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
 title="Mbyll kontrolluesin (Stop)"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 {/* Progress Slider Bar */}
 <div className="space-y-1 mb-2">
 <div className="flex items-center space-x-2">
 <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
 {formatAudioTime(audioCurrentTime)}
 </span>
 <input
 type="range"
 min={0}
 max={audioDuration || 100}
 value={audioCurrentTime || 0}
 onChange={e => handleSeek(Number(e.target.value))}
 className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
 />
 <span className="text-[10px] font-mono text-slate-400 w-8">
 {formatAudioTime(audioDuration)}
 </span>
 </div>
 </div>

 {/* Controls Row */}
 <div className="flex items-center justify-between pt-1 border-t border-slate-800">
 {/* Quick Reciter Select & Options */}
 <div className="flex flex-col space-y-2">
 <select
 value={readingSettings.selectedReciterKey}
 onChange={e => updateSettings({ selectedReciterKey: e.target.value })}
 className="bg-slate-950 border border-slate-800 text-slate-200 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500 max-w-[135px] truncate"
 >
 {reciters.map(r => (
 <option key={r.key} value={r.key}>
 {r.name.split(' ')[0]} {r.name.split(' ').slice(-1)}
 </option>
 ))}
 </select>
 <div className="flex items-center space-x-1.5 relative">
 <button
 onClick={() => setShowLoopSettings(!showLoopSettings)}
 className={`p-1.5 rounded-lg border transition-colors ${
 loopMode !== 'off' ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
 }`}
 title="Cilësimet e Përsëritjes (Loop)"
 >
 <Repeat className="w-3.5 h-3.5" />
 </button>
 
 {showLoopSettings && (
 <div className="absolute bottom-full mb-2 left-0 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl w-60 z-50">
 <div className="flex justify-between items-center mb-3">
 <h4 className="text-xs font-semibold text-slate-200">Përsëritja</h4>
 <button onClick={() => setShowLoopSettings(false)} className="text-slate-400 hover:text-slate-200"><X className="w-3.5 h-3.5" /></button>
 </div>
 
 <div className="space-y-2 mb-3">
 <label className="flex items-center space-x-2 text-xs text-slate-300">
 <input type="radio" checked={loopMode === 'off'} onChange={() => setLoopMode('off')} className="accent-emerald-500" />
 <span>Fikur</span>
 </label>
 <label className="flex items-center space-x-2 text-xs text-slate-300">
 <input type="radio" checked={loopMode === 'single'} onChange={() => setLoopMode('single')} className="accent-emerald-500" />
 <span>Një Ajet</span>
 </label>
 <label className="flex items-center space-x-2 text-xs text-slate-300">
 <input type="radio" checked={loopMode === 'range'} onChange={() => setLoopMode('range')} className="accent-emerald-500" />
 <span>Interval Ajetesh (Range)</span>
 </label>
 <label className="flex items-center space-x-2 text-xs text-slate-300">
 <input type="radio" checked={loopMode === 'surah'} onChange={() => setLoopMode('surah')} className="accent-emerald-500" />
 <span>E gjithë Surja</span>
 </label>
 </div>

 {loopMode === 'range' && surahData && (
 <div className="flex items-center space-x-2 pt-2 border-t border-slate-700/50">
 <div className="flex flex-col">
 <label className="text-[10px] text-slate-400 mb-1">Nga Ajeti</label>
 <input 
 type="number" 
 min={1} 
 max={surahData.numberOfAyahs}
 value={loopRange.start}
 onChange={(e) => setLoopRange(prev => ({ ...prev, start: Math.min(Math.max(1, Number(e.target.value)), surahData.numberOfAyahs) }))}
 className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2 py-1 w-16 focus:outline-none focus:border-emerald-500"
 />
 </div>
 <span className="text-slate-500 mt-4">-</span>
 <div className="flex flex-col">
 <label className="text-[10px] text-slate-400 mb-1">Deri në</label>
 <input 
 type="number" 
 min={1} 
 max={surahData.numberOfAyahs}
 value={loopRange.end}
 onChange={(e) => setLoopRange(prev => ({ ...prev, end: Math.min(Math.max(1, Number(e.target.value)), surahData.numberOfAyahs) }))}
 className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2 py-1 w-16 focus:outline-none focus:border-emerald-500"
 />
 </div>
 </div>
 )}
 </div>
 )}

 <select
 value={playbackRate}
 onChange={e => setPlaybackRate(Number(e.target.value))}
 className="bg-slate-950 border border-slate-800 text-slate-400 text-[10px] rounded-lg px-1.5 py-1 focus:outline-none focus:border-emerald-500"
 title="Shpejtësia e recitimit"
 >
 <option value={0.5}>0.5x</option>
 <option value={0.75}>0.75x</option>
 <option value={1}>1.0x</option>
 <option value={1.25}>1.25x</option>
 <option value={1.5}>1.5x</option>
 <option value={2}>2.0x</option>
 </select>
 </div>
 </div>

 {/* Playback Buttons */}
 <div className="flex items-center space-x-2 shrink-0">
 {currentPlayingAyahNum !== null && (
 <button
 disabled={currentPlayingAyahNum <= 1}
 onClick={handlePrevAyahControl}
 className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 disabled:opacity-30 transition-colors"
 title="Ajeti i Mëparshëm"
 >
 <SkipBack className="w-4 h-4" />
 </button>
 )}

 <button
 onClick={() => {
 if (isPlaying) {
 audioRef.current?.pause();
 setIsPlaying(false);
 } else if (audioRef.current) {
 audioRef.current.play().then(() => setIsPlaying(true)).catch(err => {
 console.warn('Audio play error:', err);
 setIsPlaying(false);
 });
 }
 }}
 className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-transform active:scale-95 shadow-md shadow-emerald-950/50"
 title={isPlaying ? 'Pauzo' : 'Luan'}
 >
 {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
 </button>

 {currentPlayingAyahNum !== null && (
 <button
 onClick={handleNextAyahControl}
 className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
 title="Ajeti Tjetër"
 >
 <SkipForward className="w-4 h-4" />
 </button>
 )}

 <button
 onClick={stopAudio}
 className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/50 text-rose-300 transition-colors ml-1"
 title="Ndal Audion (Stop)"
 >
 <Square className="w-4 h-4 fill-current" />
 </button>
 </div>
 </div>
 </div>
 )}
 {/* Tajweed Educational Modal */}
 <TajweedLegendModal
 isOpen={isTajweedModalOpen}
 onClose={() => setIsTajweedModalOpen(false)}
 highContrast={readingSettings.tajweedHighContrast}
 />
 </div>
 );
};
