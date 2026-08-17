/**
 * Hayat – Jeta Islame Main Application
 * Mobile-First Islamic Life Manager
 */
import React, { useState, useEffect } from 'react';
import { ActiveTab, Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { NamaziView } from './components/NamaziView';
import { KuraniView } from './components/KuraniView';
import { HifzModule } from './components/HifzModule';
import { MburojaView } from './components/MburojaView';
import { DitaImeView } from './components/DitaImeView';
import { SettingsView } from './components/SettingsView';

import {
 PrayerTimes,
 PrayerSettings,
 MburojaState,
 DayItem,
 PrayerLog,
 PostPrayerDhikrSession,
 QuranReadingState,
 QuranBookmark,
 QuranNote,
 PrayerName,
 FastingState
} from './types';

import { DEFAULT_PRAYER_SETTINGS, getPrayerTimes } from './services/prayerEngine';
import { checkPrayerNotifications } from './services/notificationEngine';
import { getLocalDateString } from './utils/dateUtils';
import { useDhikrFontSize } from './utils/useFontSize';
import { initQuranCorpus } from './services/quranCorpusStore';
import {
 getAllFromStore,
 putInStore,
 deleteFromStore,
 getMeta,
 saveMeta
} from './services/db';

export default function App() {
  const { fontScale } = useDhikrFontSize();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
 const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

 // App States
 const [prayerSettings, setPrayerSettings] = useState<PrayerSettings>(DEFAULT_PRAYER_SETTINGS);
 const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
 const [prayerLogs, setPrayerLogs] = useState<PrayerLog[]>([]);
 const [postPrayerDhikrSessions, setPostPrayerDhikrSessions] = useState<PostPrayerDhikrSession[]>([]);

 const [mburojaState, setMburojaState] = useState<MburojaState>({
 favChapters: [27, 28, 29],
 savedDuas: [],
 completedByDate: {},
 dailyCountsByDate: {},
 situationalCounts: {}
 });

 const [quranReadingState, setQuranReadingState] = useState<QuranReadingState>({
 lastReadSurah: 1,
 lastReadAyah: 1,
 updatedAt: Date.now()
 });

 const [quranBookmarks, setQuranBookmarks] = useState<QuranBookmark[]>([]);
 const [quranNotes, setQuranNotes] = useState<QuranNote[]>([]);
 const [dayItems, setDayItems] = useState<DayItem[]>([]);
 const [fastingState, setFastingState] = useState<FastingState>({
 preferences: { enabled: true, trackMondays: true, trackThursdays: true, trackWhiteDays: true },
 logs: {}
 });

 // Jump Target Props for cross-module navigation from Home
 const [targetMburojaChapterId, setTargetMburojaChapterId] = useState<number | null>(null);
 const [targetQuranSurahNum, setTargetQuranSurahNum] = useState<number | undefined>(undefined);
 const [targetQuranAyahNum, setTargetQuranAyahNum] = useState<number | undefined>(undefined);
 const [targetQuranSubTab, setTargetQuranSubTab] = useState<'surahs' | 'mushaf_qcf' | undefined>(undefined);
 const [targetQuranPage, setTargetQuranPage] = useState<number | undefined>(undefined);

 const todayStr = getLocalDateString();

 // Online / Offline listener
 useEffect(() => {
 const handleOnline = () => setIsOffline(false);
 const handleOffline = () => setIsOffline(true);
 window.addEventListener('online', handleOnline);
 window.addEventListener('offline', handleOffline);
 return () => {
 window.removeEventListener('online', handleOnline);
 window.removeEventListener('offline', handleOffline);
 };
 }, []);

 // Register Service Worker v45
 useEffect(() => {
 if ('serviceWorker' in navigator) {
 navigator.serviceWorker
 .register('/service-worker.js')
 .then(reg => console.log('Hayat ServiceWorker v45 registruar:', reg.scope))
 .catch(err => console.warn('ServiceWorker error:', err));
 }
 }, []);

 // Load initial database data
 const loadAllData = async () => {
 try {
 // Load Settings
 const savedSettings = await getMeta('prayerSettings');
 const activeSettings = savedSettings || DEFAULT_PRAYER_SETTINGS;
 setPrayerSettings(activeSettings);

 // Load Prayer Times
 const times = await getPrayerTimes(todayStr, activeSettings);
 setPrayerTimes(times);

 // Load Logs & DayItems from IndexedDB
 const logs = await getAllFromStore<PrayerLog>('prayerLogs');
 setPrayerLogs(logs);

 const dhikrSessions = await getAllFromStore<PostPrayerDhikrSession>('postPrayerDhikrSessions');
 setPostPrayerDhikrSessions(dhikrSessions);

 const items = await getAllFromStore<DayItem>('dayItems');
 setDayItems(items);

 const bkms = await getAllFromStore<QuranBookmark>('quranBookmarks');
 setQuranBookmarks(bkms);

 const notes = await getAllFromStore<QuranNote>('quranNotes');
 setQuranNotes(notes);

 const qReading = await getMeta('quranReadingState');
 if (qReading) setQuranReadingState(qReading);

 const fState = await getMeta('fastingState');
 if (fState) setFastingState(fState);

 const mState = await getMeta('mburojaState');
 if (mState) {
 setMburojaState(mState);
 } else {
 // Migration from localStorage if present
 const localFavs = localStorage.getItem('hayat_fav_chapters');
 if (localFavs) {
 try {
 setMburojaState(prev => ({ ...prev, favChapters: JSON.parse(localFavs) }));
 } catch (e) {}
 }
 }

 // Eagerly pre-initialize local Quran database in background for instant search
 initQuranCorpus().catch(err => console.warn('Pre-initializing corpus warning:', err));
 } catch (err) {
 console.warn('Error loading initial data from IndexedDB:', err);
 }
 };

 useEffect(() => {
 loadAllData();
 }, []);

 // Check prayer notifications periodically when prayerTimes or prayerSettings change
 useEffect(() => {
 if (!prayerTimes || !prayerSettings.notificationsEnabled) return;

 // Check immediately
 checkPrayerNotifications(prayerTimes, prayerSettings);

 // Check every 30 seconds
 const interval = setInterval(() => {
 checkPrayerNotifications(prayerTimes, prayerSettings);
 }, 30000);

 return () => clearInterval(interval);
 }, [prayerTimes, prayerSettings]);

 // Update Prayer Settings
 const handleUpdatePrayerSettings = async (newSettings: PrayerSettings) => {
 setPrayerSettings(newSettings);
 await saveMeta('prayerSettings', newSettings);
 const times = await getPrayerTimes(todayStr, newSettings);
 setPrayerTimes(times);
 };

 // Toggle Prayer Completion Log
 const handleTogglePrayerLog = async (prayerName: PrayerName) => {
 const existingIndex = prayerLogs.findIndex(l => l.date === todayStr && l.prayer === prayerName);
 let updated: PrayerLog[];

 if (existingIndex >= 0) {
 const currentVal = prayerLogs[existingIndex].completed;
 const log = { ...prayerLogs[existingIndex], completed: !currentVal, timestamp: Date.now() };
 updated = [...prayerLogs];
 updated[existingIndex] = log;
 await putInStore('prayerLogs', log);
 } else {
 const newLog: PrayerLog = {
 id: `log_${todayStr}_${prayerName}`,
 date: todayStr,
 prayer: prayerName,
 completed: true,
 timestamp: Date.now()
 };
 updated = [...prayerLogs, newLog];
 await putInStore('prayerLogs', newLog);
 }
 setPrayerLogs(updated);
 };

 const handleUpdatePrayerLogDetails = async (prayerName: PrayerName, details: Partial<PrayerLog>) => {
 const existingIndex = prayerLogs.findIndex(l => l.date === todayStr && l.prayer === prayerName);
 if (existingIndex >= 0) {
 const log = { ...prayerLogs[existingIndex], ...details, timestamp: Date.now() };
 const updated = [...prayerLogs];
 updated[existingIndex] = log;
 await putInStore('prayerLogs', log);
 setPrayerLogs(updated);
 }
 };

 // Post Prayer Dhikr Save
 const handleSavePostPrayerDhikr = async (prayerName: PrayerName, items: { [key: string]: number }, isCompleted?: boolean) => {
 const sumOfCounts = Object.values(items).reduce((acc, curr) => acc + (typeof curr === 'number' ? curr : 0), 0);
 const finalCompleted = isCompleted !== undefined ? isCompleted : sumOfCounts > 0;

 const session: PostPrayerDhikrSession = {
 id: `dhikr_${todayStr}_${prayerName}`,
 date: todayStr,
 prayer: prayerName,
 timestamp: Date.now(),
 completed: finalCompleted,
 items
 };
 await putInStore('postPrayerDhikrSessions', session);
 setPostPrayerDhikrSessions(prev => {
 const idx = prev.findIndex(s => s.id === session.id);
 if (idx >= 0) {
 const copy = [...prev];
 copy[idx] = session;
 return copy;
 }
 return [...prev, session];
 });
 };

 // Mburoja Handlers
 const handleToggleFavChapter = async (chapterId: number) => {
 const isFav = mburojaState.favChapters.includes(chapterId);
 const updatedFavs = isFav
 ? mburojaState.favChapters.filter(id => id !== chapterId)
 : [...mburojaState.favChapters, chapterId];

 const updatedState = { ...mburojaState, favChapters: updatedFavs };
 setMburojaState(updatedState);
 await saveMeta('mburojaState', updatedState);
 };

 const handleToggleSaveDua = async (duaId: number) => {
 const isSaved = mburojaState.savedDuas.includes(duaId);
 const updatedSaved = isSaved
 ? mburojaState.savedDuas.filter(id => id !== duaId)
 : [...mburojaState.savedDuas, duaId];

 const updatedState = { ...mburojaState, savedDuas: updatedSaved };
 setMburojaState(updatedState);
 await saveMeta('mburojaState', updatedState);
 };

 const handleToggleChapterCompletedToday = async (chapterId: number) => {
 const todayCompleted = mburojaState.completedByDate[todayStr] || [];
 const isCompleted = todayCompleted.includes(chapterId);

 const updatedTodayCompleted = isCompleted
 ? todayCompleted.filter(id => id !== chapterId)
 : [...todayCompleted, chapterId];

 const updatedState = {
 ...mburojaState,
 completedByDate: {
 ...mburojaState.completedByDate,
 [todayStr]: updatedTodayCompleted
 }
 };
 setMburojaState(updatedState);
 await saveMeta('mburojaState', updatedState);
 };

 const handleUpdateDuaCount = async (duaId: number, count: number) => {
 const todayCounts = mburojaState.dailyCountsByDate[todayStr] || {};
 const updatedTodayCounts = { ...todayCounts, [duaId]: count };

 const updatedState = {
 ...mburojaState,
 dailyCountsByDate: {
 ...mburojaState.dailyCountsByDate,
 [todayStr]: updatedTodayCounts
 }
 };
 setMburojaState(updatedState);
 await saveMeta('mburojaState', updatedState);
 };

 const handleUpdateDuaGoal = async (duaId: number, goal: number | null) => {
 const updatedGoals = { ...mburojaState.duaGoals };
 if (goal === null || goal <= 0) {
 delete updatedGoals[duaId];
 } else {
 updatedGoals[duaId] = goal;
 }
 const updatedState = {
 ...mburojaState,
 duaGoals: updatedGoals
 };
 setMburojaState(updatedState);
 await saveMeta('mburojaState', updatedState);
 };

 const handleUpdateFastingState = async (newState: FastingState) => {
 setFastingState(newState);
 await saveMeta('fastingState', newState);
 };

 // Quran Reading Handlers
 const handleUpdateQuranReadingState = async (surahNum: number, ayahNum: number, dailyProgress?: { [date: string]: number }) => {
 const newState: QuranReadingState = {
 ...quranReadingState,
 lastReadSurah: surahNum,
 lastReadAyah: ayahNum,
 updatedAt: Date.now(),
 ...(dailyProgress ? { dailyProgress } : {})
 };
 setQuranReadingState(newState);
 await saveMeta('quranReadingState', newState);
 };

 const handleAddQuranBookmark = async (bookmarkData: Omit<QuranBookmark, 'id' | 'createdAt'>) => {
 const newBkm: QuranBookmark = {
 ...bookmarkData,
 id: `bkm_${Date.now()}`,
 createdAt: Date.now()
 };
 const updated = [...quranBookmarks, newBkm];
 setQuranBookmarks(updated);
 await putInStore('quranBookmarks', newBkm);
 };

 const handleRemoveQuranBookmark = async (id: string) => {
 const updated = quranBookmarks.filter(b => b.id !== id);
 setQuranBookmarks(updated);
 await deleteFromStore('quranBookmarks', id);
 };

 const handleSaveQuranNote = async (noteData: Omit<QuranNote, 'id' | 'createdAt' | 'updatedAt'>) => {
 const existing = quranNotes.find(
 n => n.surahNumber === noteData.surahNumber && n.ayahNumber === noteData.ayahNumber
 );

 let updatedNote: QuranNote;
 if (existing) {
 updatedNote = {
 ...existing,
 text: noteData.text,
 updatedAt: Date.now()
 };
 } else {
 updatedNote = {
 ...noteData,
 id: `note_${noteData.surahNumber}_${noteData.ayahNumber}`,
 createdAt: Date.now(),
 updatedAt: Date.now()
 };
 }

 const updated = quranNotes.some(n => n.id === updatedNote.id)
 ? quranNotes.map(n => (n.id === updatedNote.id ? updatedNote : n))
 : [...quranNotes, updatedNote];

 setQuranNotes(updated);
 await putInStore('quranNotes', updatedNote);
 };

 const handleDeleteQuranNote = async (id: string) => {
 const updated = quranNotes.filter(n => n.id !== id);
 setQuranNotes(updated);
 await deleteFromStore('quranNotes', id);
 };

 // DayItems Handlers
 const handleAddDayItem = async (itemData: Omit<DayItem, 'id' | 'createdAt'>) => {
 const newItem: DayItem = {
 ...itemData,
 id: `item_${Date.now()}`,
 createdAt: Date.now()
 };
 const updated = [...dayItems, newItem];
 setDayItems(updated);
 await putInStore('dayItems', newItem);
 };

 const handleToggleDayItem = async (id: string) => {
 const item = dayItems.find(i => i.id === id);
 if (!item) return;

 const updatedItem = { ...item, completed: !item.completed };
 const updated = dayItems.map(i => (i.id === id ? updatedItem : i));
 setDayItems(updated);
 await putInStore('dayItems', updatedItem);
 };

 const handleTogglePriorityDayItem = async (id: string) => {
 const item = dayItems.find(i => i.id === id);
 if (!item) return;

 const updatedItem = { ...item, isHighPriority: !item.isHighPriority };
 const updated = dayItems.map(i => (i.id === id ? updatedItem : i));
 setDayItems(updated);
 await putInStore('dayItems', updatedItem);
 };

 const handleDeleteDayItem = async (id: string) => {
 const updated = dayItems.filter(i => i.id !== id);
 setDayItems(updated);
 await deleteFromStore('dayItems', id);
 };

 return (
 <div
 data-font-scale={fontScale}
 className={`min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950 dhikr-font-scale-${fontScale}`}
 >
 <Navbar activeTab={activeTab} setActiveTab={setActiveTab} isOffline={isOffline} />

        <main className="safe-main max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl px-4 pt-4">
 {activeTab === 'home' && (
 <HomeView
 prayerTimes={prayerTimes}
 prayerSettings={prayerSettings}
 mburojaState={mburojaState}
 dayItems={dayItems}
 quranReadingState={quranReadingState}
 postPrayerDhikrSessions={postPrayerDhikrSessions}
 setActiveTab={setActiveTab}
 onOpenMburojaChapter={(chId) => {
 setTargetMburojaChapterId(chId);
 }}
 onOpenQuranSurah={(surahNum, ayahNum, subTab, pageNum) => {
 setTargetQuranSurahNum(surahNum);
 setTargetQuranAyahNum(ayahNum);
 setTargetQuranSubTab(subTab);
 setTargetQuranPage(pageNum);
 }}
 />
 )}

 {activeTab === 'namazi' && (
 <NamaziView
 prayerTimes={prayerTimes}
 prayerSettings={prayerSettings}
 prayerLogs={prayerLogs}
 postPrayerDhikrSessions={postPrayerDhikrSessions}
 mburojaState={mburojaState}
 onTogglePrayerLog={handleTogglePrayerLog}
 onUpdatePrayerLogDetails={handleUpdatePrayerLogDetails}
 onSavePostPrayerDhikr={handleSavePostPrayerDhikr}
 onUpdatePrayerSettings={handleUpdatePrayerSettings}
 />
 )}

 {activeTab === 'kurani' && (
 <KuraniView
 initialSurahNumber={targetQuranSurahNum}
 initialAyahNumber={targetQuranAyahNum}
 initialSubTab={targetQuranSubTab}
 initialPageNumber={targetQuranPage}
 readingState={quranReadingState}
 bookmarks={quranBookmarks}
 notes={quranNotes}
 onUpdateReadingState={handleUpdateQuranReadingState}
 onAddBookmark={handleAddQuranBookmark}
 onRemoveBookmark={handleRemoveQuranBookmark}
 onSaveNote={handleSaveQuranNote}
 onDeleteNote={handleDeleteQuranNote}
 />
 )}
 {activeTab === 'hifz' && (
 <HifzModule />
 )}

 {activeTab === 'mburoja' && (
 <MburojaView
 initialChapterId={targetMburojaChapterId}
 mburojaState={mburojaState}
 onToggleFavChapter={handleToggleFavChapter}
 onToggleSaveDua={handleToggleSaveDua}
 onToggleChapterCompletedToday={handleToggleChapterCompletedToday}
 onUpdateDuaCount={handleUpdateDuaCount}
 onUpdateDuaGoal={handleUpdateDuaGoal}
 />
 )}

 {activeTab === 'ditaIme' && (
 <DitaImeView
 dayItems={dayItems}
 prayerTimes={prayerTimes}
 fastingState={fastingState}
 onUpdateFastingState={handleUpdateFastingState}
 onAddDayItem={handleAddDayItem}
 onToggleDayItem={handleToggleDayItem}
 onTogglePriorityDayItem={handleTogglePriorityDayItem}
 onDeleteDayItem={handleDeleteDayItem}
 />
 )}

 {activeTab === 'settings' && (
 <SettingsView
 prayerSettings={prayerSettings}
 mburojaState={mburojaState}
 onUpdatePrayerSettings={handleUpdatePrayerSettings}
 onRefreshAllData={loadAllData}
 />
 )}
 </main>
 </div>
 );
}

