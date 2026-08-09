/**
 * QuranSearchView Component
 * Intelligent single-input Quran search view.
 * Offloads indexing, normalization, and search over 6,236 verses to a Web Worker.
 * Keeps existing results visible while searching, shows inline spinner inside input.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
 Search,
 X,
 BookOpen,
 Bookmark,
 AlertCircle,
 Sparkles,
 FileText
} from 'lucide-react';
import {
 SearchFilter,
 SearchResponse,
 highlightMatchedText,
 findSurahByQuery
} from '../services/quranSearchEngine';
import { searchQuranWithWorker } from '../services/quranWorkerClient';
import {
 initQuranCorpus,
 getCorpusStatus,
 getCorpusErrorMsg,
 CorpusStatus
} from '../services/quranCorpusStore';
import { ALL_SURAHS_META } from '../data/quranData';
import { QuranNote } from '../types';

interface QuranSearchViewProps {
 onSelectSurahAndAyah: (surahNumber: number, ayahNumber?: number) => void;
 bookmarks: { surahNumber: number; ayahNumber: number }[];
 onAddBookmark: (surahNumber: number, ayahNumber: number, textSq?: string, textAr?: string) => void;
 onRemoveBookmark: (surahNumber: number, ayahNumber: number) => void;
 userNotes?: QuranNote[];
 initialSearchQuery?: string;
 initialFilter?: SearchFilter;
 searchQuery?: string;
 onQueryChange?: (newQuery: string) => void;
 hideInputBar?: boolean;
}

export const QuranSearchView: React.FC<QuranSearchViewProps> = ({
 onSelectSurahAndAyah,
 bookmarks,
 onAddBookmark,
 onRemoveBookmark,
 userNotes = [],
 initialSearchQuery = '',
 initialFilter = 'all',
 searchQuery,
 onQueryChange,
 hideInputBar = false
}) => {
 const [query, setQuery] = useState<string>(searchQuery !== undefined ? searchQuery : initialSearchQuery);
 const [activeFilter, setActiveFilter] = useState<SearchFilter>(initialFilter);
 const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
 const [isSearching, setIsSearching] = useState<boolean>(false);
 const [displayedCount, setDisplayedCount] = useState<number>(20);
 const [corpusState, setCorpusState] = useState<CorpusStatus>(getCorpusStatus());
 const [progressMsg, setProgressMsg] = useState<string>('');

 const searchInputRef = useRef<HTMLInputElement>(null);
 const latestSearchIdRef = useRef<number>(0);

 // Synchronize controlled searchQuery if provided
 useEffect(() => {
 if (searchQuery !== undefined) {
 setQuery(searchQuery);
 }
 }, [searchQuery]);

 // Memoize bookmarks key to avoid re-triggering search effect on array reference identity changes
 const bookmarksKey = useMemo(() => {
 return bookmarks.map(b => `${b.surahNumber}:${b.ayahNumber}`).join(',');
 }, [bookmarks]);

 // Memoize notes key to avoid re-triggering search effect on array reference identity changes
 const notesKey = useMemo(() => {
 return userNotes.map(n => `${n.id}:${n.surahNumber}:${n.ayahNumber}:${n.text}`).join('|');
 }, [userNotes]);

 const runInitCorpus = (forceRetry = false) => {
 setCorpusState('loading');
 initQuranCorpus((msg) => {
 setProgressMsg(msg);
 }, forceRetry)
 .then(() => {
 setCorpusState(getCorpusStatus());
 })
 .catch(() => {
 setCorpusState(getCorpusStatus());
 });
 };

 // Auto-initialize corpus on mount
 useEffect(() => {
 runInitCorpus(false);
 }, []);

 // Main Debounced Search Effect (250 ms debounce)
 useEffect(() => {
 const trimmed = query.trim();

 if (!trimmed) {
 latestSearchIdRef.current += 1;
 setSearchResponse(null);
 setIsSearching(false);
 return;
 }

 if (getCorpusStatus() !== 'ready') {
 setIsSearching(false);
 return;
 }

 setIsSearching(true);
 const currentRequestId = ++latestSearchIdRef.current;

 const timer = setTimeout(async () => {
 try {
 const resp = await searchQuranWithWorker(
 currentRequestId,
 trimmed,
 activeFilter,
 bookmarks,
 userNotes
 );

 if (currentRequestId === latestSearchIdRef.current) {
 setSearchResponse(resp);
 setDisplayedCount(20);
 setIsSearching(false);
 }
 } catch (err) {
 console.error('Quran search execution error:', err);
 // Vetem kerkesa me e fundit lejohet te ndryshoje gjendjen.
 // (me pare ishte 'currentRequestId === currentRequestId' - gjithmone e vertete)
 if (currentRequestId === latestSearchIdRef.current) {
 setIsSearching(false);
 }
 }
 }, 250);

 return () => {
 clearTimeout(timer);
 };
 }, [query, activeFilter, bookmarksKey, notesKey, corpusState]);

 // Dynamic Suggestion Hint Calculation
 const suggestionHint = useMemo(() => {
 const trimmed = query.trim();
 if (!trimmed) return null;

 // Check reference prefix like "2:" or "36:"
 const colonPrefixMatch = trimmed.match(/^(\d{1,3}):$/);
 if (colonPrefixMatch) {
 const sNum = parseInt(colonPrefixMatch[1], 10);
 const surah = ALL_SURAHS_META.find(s => s.number === sNum);
 if (surah) {
 return `Shkruaj një ajet nga 1 deri në ${surah.numberOfAyahs} (psh. ${sNum}:1)`;
 }
 }

 // Check partial surah name
 if (trimmed.length >= 1 && trimmed.length <= 8 && !/\d/.test(trimmed)) {
 const surah = findSurahByQuery(trimmed);
 if (surah) {
 return `${surah.transliteration} · Sureja ${surah.number} (${surah.albanianName})`;
 }
 }

 return null;
 }, [query]);

 // Helper to check if a verse is bookmarked
 const isVerseBookmarked = (surahNum: number, ayahNum?: number) => {
 if (!ayahNum) return false;
 return bookmarks.some(b => b.surahNumber === surahNum && b.ayahNumber === ayahNum);
 };

 const handleFilterChange = (filterKey: SearchFilter) => {
 if (filterKey !== activeFilter) {
 setActiveFilter(filterKey);
 }
 };

 const handleClearQuery = () => {
 setQuery('');
 if (onQueryChange) onQueryChange('');
 latestSearchIdRef.current += 1;
 setSearchResponse(null);
 setIsSearching(false);
 if (searchInputRef.current) {
 searchInputRef.current.focus();
 }
 };

 return (
 <div className="space-y-4 animate-fadeIn" role="search">
 {/* Direct Search Bar (hidden if parent renders top big search bar) */}
 {!hideInputBar && (
 <div className="relative">
 <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
 <input
 id="quran-search-input"
 ref={searchInputRef}
 type="text"
 value={query}
 onChange={e => {
 setQuery(e.target.value);
 if (onQueryChange) onQueryChange(e.target.value);
 }}
 placeholder="Kërko sure, ajet, fjalë ose frazë..."
 className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl pl-10 pr-12 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors shadow-sm font-medium"
 aria-label="Kërko sure, ajet, fjalë ose frazë..."
 />
 <div className="absolute right-3.5 top-3.5 flex items-center space-x-2">
 {isSearching && (
 <div
 className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"
 title="Duke kërkuar..."
 aria-label="Kërkimi në vazhdim"
 />
 )}
 {query && (
 <button
 onClick={handleClearQuery}
 className="text-slate-400 hover:text-slate-200"
 aria-label="Pastro kërkimin"
 >
 <X className="w-4 h-4" />
 </button>
 )}
 </div>
 </div>
 )}

 {/* Dynamic Suggestion Hint (shows only when user types a prefix like 2: or partial surah) */}
 {suggestionHint && (
 <div className="bg-emerald-950/60 border border-emerald-800/60 rounded-xl px-3 py-2 text-xs text-emerald-300 flex items-center space-x-2 animate-fadeIn">
 <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
 <span>Sugjerim: {suggestionHint}</span>
 </div>
 )}

 {/* Corpus Loading Progress Banner */}
 {corpusState === 'loading' && (
 <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl p-4 text-xs text-emerald-300 flex items-center space-x-3 shadow animate-fadeIn">
 <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
 <p className="font-medium">{progressMsg || 'Po përgatitet Kurani lokal...'}</p>
 </div>
 )}

 {/* Corpus Error State Banner with Retry Button */}
 {corpusState === 'corpusError' && (
 <div className="bg-red-950/80 border border-red-800/80 rounded-2xl p-4 text-xs text-red-200 shadow flex items-center justify-between space-x-3 animate-fadeIn">
 <div className="flex items-center space-x-2.5">
 <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
 <div>
 <p className="font-bold text-red-200">Baza e të dhënave nuk është gati</p>
 <p className="text-red-300/90 text-[11px] mt-0.5">
 {getCorpusErrorMsg() || 'Databaza lokale e Kuranit nuk u inicializua.'}
 </p>
 </div>
 </div>
 <button
 onClick={() => runInitCorpus(true)}
 className="bg-red-800 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition-colors flex-shrink-0 shadow"
 >
 Provo përsëri
 </button>
 </div>
 )}

 {/* Invalid Reference Error Warning Banner */}
 {searchResponse?.invalidReferenceError && (
 <div className="bg-amber-950/80 border border-amber-800/80 rounded-2xl p-4 text-amber-200 text-xs space-y-1 shadow flex items-start space-x-3">
 <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
 <div>
 <p className="font-bold text-amber-300">Referenca nuk është e vlefshme</p>
 <p className="text-amber-200/90 leading-relaxed mt-0.5">{searchResponse.invalidReferenceError}</p>
 </div>
 </div>
 )}

 {/* Initial loading state when searching without existing results */}
 {isSearching && !searchResponse && (
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-2">
 <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
 <p className="text-xs text-slate-400">Duke kërkuar në Kuran (Hasan Nahi)...</p>
 </div>
 )}

 {/* Search Results Display (Kept visible while isSearching is true) */}
 {searchResponse && !searchResponse.invalidReferenceError && (
 <div className="space-y-3">
 {/* Results Count Header */}
 <div className="flex items-center justify-between px-1 text-xs text-slate-400" aria-live="polite">
 <span>
 {searchResponse.totalCount === 0
 ? 'Nuk u gjet asnjë rezultat'
 : `${searchResponse.totalCount} ${searchResponse.totalCount === 1 ? 'rezultat' : 'rezultate'}`}
 </span>
 <span className="text-[11px] text-emerald-400/90 font-medium">Përkthimi: Hasan Nahi (Gati offline)</span>
 </div>

 {/* Results List */}
 {searchResponse.results.length === 0 ? (
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
 <Search className="w-8 h-8 text-slate-600 mx-auto" />
 <p className="text-sm font-semibold text-slate-300">Nuk u gjet asnjë rezultat për "{query}"</p>
 <p className="text-xs text-slate-500 max-w-sm mx-auto">
 Kontrollo shkrimin ose provo të kërkosh me numrin e sures dhe ajetit (psh. 2:255 ose El-Bekare 255).
 </p>
 </div>
 ) : (
 <div className="space-y-3">
 {searchResponse.results.slice(0, displayedCount).map(item => {
 const bookmarked = isVerseBookmarked(item.surahNumber, item.ayahNumber);

 if (item.type === 'note') {
 return (
 <div
 key={item.id}
 className="bg-slate-900 border border-blue-900/60 hover:border-blue-700/60 rounded-2xl p-4 transition-all shadow-sm space-y-2.5"
 >
 <div className="flex items-center justify-between border-b border-slate-800 pb-2">
 <div className="flex items-center space-x-2">
 <FileText className="w-4 h-4 text-blue-400" />
 <h3 className="text-xs font-bold text-slate-100">
 Shënim Personal · Surja {item.surahTransliteration} ({item.surahNumber}:{item.ayahNumber})
 </h3>
 </div>
 </div>

 <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-950 p-2.5 rounded-xl border border-slate-800">
 {item.noteText}
 </p>

 <div className="flex justify-end pt-1">
 <button
 onClick={() => onSelectSurahAndAyah(item.surahNumber, item.ayahNumber)}
 className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 transition-colors shadow"
 >
 <BookOpen className="w-3.5 h-3.5" />
 <span>Hap ajetin në Kuran</span>
 </button>
 </div>
 </div>
 );
 }

 return (
 <div
 key={item.id}
 className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all shadow-sm space-y-3"
 >
 {/* Item Header */}
 <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
 <div className="flex items-center space-x-2">
 <span className="w-6 h-6 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center text-[11px] font-mono font-bold">
 {item.ayahNumber ? `${item.surahNumber}:${item.ayahNumber}` : item.surahNumber}
 </span>
 <div>
 <h3 className="text-xs font-bold text-slate-100">
 {item.surahTransliteration} {item.ayahNumber ? `· Ajeti ${item.ayahNumber}` : ''}
 </h3>
 <p className="text-[10px] text-slate-400">{item.surahNameSq}</p>
 </div>
 </div>

 <span className="font-arabic text-base text-emerald-400" dir="rtl">
 {item.surahNameAr}
 </span>
 </div>

 {/* Arabic Text (if verse result) */}
 {item.textAr && (
 <p className="font-arabic text-lg leading-loose text-slate-100 text-right py-1" dir="rtl">
 {item.textAr}
 </p>
 )}

 {/* Albanian Text with Safe Token Highlighting */}
 {item.textSq && (
 <p className="text-xs text-slate-300 leading-relaxed pt-1">
 {highlightMatchedText(item.textSq, item.matchedTerms || []).map((chunk, idx) =>
 chunk.isMatch ? (
 <mark
 key={idx}
 className="bg-emerald-500/30 text-emerald-300 font-semibold rounded px-0.5"
 >
 {chunk.text}
 </mark>
 ) : (
 <span key={idx}>{chunk.text}</span>
 )
 )}
 </p>
 )}

 {/* Action Bar */}
 <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
 <button
 onClick={() => onSelectSurahAndAyah(item.surahNumber, item.ayahNumber)}
 className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1 transition-colors shadow"
 >
 <BookOpen className="w-3.5 h-3.5" />
 <span>Hap në Kuran</span>
 </button>

 {item.ayahNumber && (
 <button
 onClick={() => {
 if (bookmarked) {
 onRemoveBookmark(item.surahNumber, item.ayahNumber!);
 } else {
 onAddBookmark(
 item.surahNumber,
 item.ayahNumber!,
 item.textSq,
 item.textAr
 );
 }
 }}
 className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 border transition-all ${
 bookmarked
 ? 'bg-amber-950/80 text-amber-300 border-amber-800'
 : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
 }`}
 >
 <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
 <span>{bookmarked ? 'Të ruajtura' : 'Ruaj bookmark'}</span>
 </button>
 )}
 </div>
 </div>
 );
 })}

 {/* Show More Pagination Button */}
 {searchResponse.results.length > displayedCount && (
 <button
 onClick={() => setDisplayedCount(prev => prev + 20)}
 className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white py-3 rounded-2xl text-xs font-semibold transition-colors shadow"
 >
 Shfaq më shumë (edhe {searchResponse.results.length - displayedCount})
 </button>
 )}
 </div>
 )}
 </div>
 )}
 </div>
 );
};
