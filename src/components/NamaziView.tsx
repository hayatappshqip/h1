/**
 * NamaziView Component - Kohët e Namazit, Dhikri pas Namazit & Kompasi i Kiblës
 */
import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PrayerTimes, PrayerSettings, PrayerName, PrayerLog, PostPrayerDhikrSession, MburojaState, PrayerLocation, PrayerMethod } from '../types';
import { getNextPrayer } from '../services/prayerEngine';
import { Clock, Compass, CheckCircle2, Circle, RotateCcw, Award, MapPin, BarChart3, Check, Sparkles, Lock, AlertTriangle, X, Calendar, Sliders, Bell } from 'lucide-react';
import { DhikrStatsChart } from './DhikrStatsChart';
import { QiblaCompass } from './QiblaCompass';
import { MonthlyPrayerSummary } from './MonthlyPrayerSummary';
import { PrayerRecordsView } from './PrayerRecordsView';
import { triggerDhikrFeedback } from '../services/feedbackEngine';
import { getLocalDateString } from '../utils/dateUtils';
import { useDhikrFontSize } from '../utils/useFontSize';
import { FontSizeControl } from './FontSizeControl';

interface NamaziViewProps {
 prayerTimes: PrayerTimes | null;
 prayerSettings: PrayerSettings;
 prayerLogs: PrayerLog[];
 postPrayerDhikrSessions?: PostPrayerDhikrSession[];
 mburojaState?: MburojaState;
 onTogglePrayerLog: (prayerName: PrayerName) => void;
 onUpdatePrayerLogDetails?: (prayerName: PrayerName, details: Partial<PrayerLog>) => void;
 onSavePostPrayerDhikr: (prayerName: PrayerName, items: { [key: string]: number }, isCompleted?: boolean) => void;
 onUpdatePrayerSettings?: (newSettings: PrayerSettings) => void;
}

const PRAYER_RAKATS: Partial<Record<PrayerName, string>> = {
 fajr: '2 Sunet, 2 Farz',
 dhuhr: '4 Sunet, 4 Farz, 2 Sunet',
 asr: '4 Farz (4 Sunet opsionale)',
 maghrib: '3 Farz, 2 Sunet',
 isha: '4 Farz, 2 Sunet, 3 Vitër'
};

export const NamaziView: React.FC<NamaziViewProps> = ({
 prayerTimes,
 prayerSettings,
 prayerLogs,
 postPrayerDhikrSessions = [],
 mburojaState = { favChapters: [], savedDuas: [], completedByDate: {}, dailyCountsByDate: {}, situationalCounts: {} },
 onTogglePrayerLog,
 onUpdatePrayerLogDetails,
 onSavePostPrayerDhikr,
 onUpdatePrayerSettings
}) => {
 const [activeSubTab, setActiveSubTab] = useState<'schedule' | 'records' | 'qibla' | 'settings'>('schedule');
 const [selectedDhikrPrayer, setSelectedDhikrPrayer] = useState<PrayerName | null>(null);
 const [futureBlockedPrayer, setFutureBlockedPrayer] = useState<{ name: PrayerName; label: string; time: string } | null>(null);
 const [uncheckModalPrayer, setUncheckModalPrayer] = useState<{ name: PrayerName; label: string } | null>(null);
 const [uncheckInputText, setUncheckInputText] = useState<string>('');

 const todayStr = getLocalDateString();

 const isPrayerInFuture = (timeStr?: string): boolean => {
 if (!timeStr) return false;
 const parts = timeStr.split(':');
 if (parts.length < 2) return false;
 const prayerHours = parseInt(parts[0], 10);
 const prayerMinutes = parseInt(parts[1], 10);
 if (isNaN(prayerHours) || isNaN(prayerMinutes)) return false;
 const prayerTotalMins = prayerHours * 60 + prayerMinutes;

 const now = new Date();
 const currentTotalMins = now.getHours() * 60 + now.getMinutes();

 return prayerTotalMins > currentTotalMins;
 };

 const handlePrayerCheckClick = (prayerName: PrayerName, label: string, timeStr?: string, isLogged?: boolean) => {
 if (isLogged) {
 setUncheckModalPrayer({ name: prayerName, label });
 setUncheckInputText('');
 return;
 }

 if (isPrayerInFuture(timeStr)) {
 setFutureBlockedPrayer({ name: prayerName, label, time: timeStr || '' });
 return;
 }

 onTogglePrayerLog(prayerName);
 };

 const nextPrayerInfo = prayerTimes ? getNextPrayer(prayerTimes) : null;

 const prayerItems: { name: PrayerName; label: string; time: string | undefined }[] = prayerTimes
 ? [
 { name: 'imsak', label: 'Imsaku', time: prayerTimes.imsak },
 { name: 'fajr', label: 'Sabahu', time: prayerTimes.fajr },
 { name: 'sunrise', label: 'Lindja e Diellit', time: prayerTimes.sunrise },
 { name: 'dhuhr', label: 'Dreka', time: prayerTimes.dhuhr },
 { name: 'asr', label: 'Ikindia', time: prayerTimes.asr },
 { name: 'maghrib', label: 'Akshami', time: prayerTimes.maghrib },
 { name: 'isha', label: 'Jacia', time: prayerTimes.isha }
 ]
 : [];

 return (
 <div className="space-y-5 pb-24 animate-fadeIn">
 {/* Sub Tab Switcher */}
 <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
 <button
 id="btn-subtab-schedule"
 onClick={() => setActiveSubTab('schedule')}
 className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
 activeSubTab === 'schedule'
 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <Clock className="w-3.5 h-3.5" />
 <span>Orari</span>
 </button>
 <button
 id="btn-subtab-records"
 onClick={() => setActiveSubTab('records')}
 className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
 activeSubTab === 'records'
 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <Calendar className="w-3.5 h-3.5" />
 <span>Regjistrimet</span>
 </button>
 <button
 id="btn-subtab-qibla"
 onClick={() => setActiveSubTab('qibla')}
 className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
 activeSubTab === 'qibla'
 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <Compass className="w-3.5 h-3.5" />
 <span>Kibla</span>
 </button>
 <button
 id="btn-subtab-settings"
 onClick={() => setActiveSubTab('settings')}
 className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1 ${
 activeSubTab === 'settings'
 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <Sliders className="w-3.5 h-3.5" />
 <span>Cilësimet</span>
 </button>
 </div>

 {activeSubTab === 'schedule' ? (
 <div className="space-y-4">
 {/* Header Location Summary */}
 <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
 <div className="flex items-center space-x-2">
 <MapPin className="w-4 h-4 text-emerald-400" />
 <span className="text-xs font-medium text-slate-200">{prayerSettings.locationName}</span>
 </div>
 <span className="text-[11px] font-mono text-slate-400">
 {new Date().toLocaleDateString('sq-AL', { weekday: 'long', day: 'numeric', month: 'long' })}
 </span>
 </div>

 {/* Next Prayer Highlight */}
 {nextPrayerInfo && (
 <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-4 flex items-center justify-between">
 <div>
 <p className="text-[11px] text-emerald-400 uppercase tracking-wider font-semibold">Namazi Pasardhës</p>
 <h3 className="text-xl font-bold font-serif text-white capitalize mt-0.5">{nextPrayerInfo.next}</h3>
 </div>
 <div className="text-right">
 <span className="text-2xl font-mono font-bold text-emerald-300">{nextPrayerInfo.timeUntil}</span>
 <p className="text-[10px] text-slate-400">mbetur</p>
 </div>
 </div>
 )}

 {/* Prayer Timetable List */}
 <div className="space-y-2">
 {prayerItems.map(item => {
 if (item.name === 'sunrise' || item.name === 'imsak') {
 return (
 <div
 key={item.name}
 className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-3 flex items-center justify-between text-slate-400 text-xs"
 >
 <span>{item.label}</span>
 <span className="font-mono text-slate-300 font-medium">{item.time}</span>
 </div>
 );
 }

 const logEntry = prayerLogs.find(
 l => l.date === todayStr && l.prayer === item.name && l.completed
 );
 const isLogged = !!logEntry;
 const isFuture = isPrayerInFuture(item.time);

 const isCurrent = nextPrayerInfo?.current === item.name;
 const rakats = PRAYER_RAKATS[item.name as PrayerName];

 return (
 <div
 key={item.name}
 className={`p-3.5 rounded-xl border flex flex-col transition-all ${
 isCurrent
 ? 'bg-slate-900 border-emerald-600/60 text-slate-100 shadow-md'
 : 'bg-slate-900/70 border-slate-800 text-slate-200'
 }`}
 >
 <div className="flex items-center justify-between w-full">
 <div className="flex items-center space-x-3">
 <button
 id={`log-prayer-${item.name}`}
 onClick={() => handlePrayerCheckClick(item.name, item.label, item.time, isLogged)}
 className="text-emerald-400 hover:scale-110 transition-transform flex-shrink-0"
 title={isFuture && !isLogged ? `Koha e namazit (${item.time}) nuk ka ardhur akoma` : undefined}
 >
 {isLogged ? (
 <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
 ) : isFuture ? (
 <div className="relative flex items-center justify-center">
 <Circle className="w-5 h-5 text-slate-600 hover:text-amber-400" />
 <Lock className="w-2.5 h-2.5 text-amber-500 absolute" />
 </div>
 ) : (
 <Circle className="w-5 h-5 text-slate-500 hover:text-emerald-400" />
 )}
 </button>
 <div>
 <h4 className="font-semibold text-sm flex items-center space-x-2">
 <span>{item.label}</span>
 {isLogged && <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/50 px-1.5 py-0.5 rounded">E kryer</span>}
 {!isLogged && isFuture && (
 <span className="text-[10px] text-amber-400/90 font-mono bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded flex items-center space-x-1">
 <Lock className="w-2.5 h-2.5" />
 <span>Nuk ka ardhur</span>
 </span>
 )}
 </h4>
 {rakats && (
 <p className="text-[10px] text-slate-400 mt-0.5">{rakats}</p>
 )}
 </div>
 </div>

 <div className="flex items-center space-x-2">
 <span className="font-mono font-bold text-base text-emerald-300">{item.time}</span>
 {(() => {
 const isDhikrCompleted = postPrayerDhikrSessions.some(
 s => s.date === todayStr && s.prayer === item.name && s.completed
 );
 return (
 <div className="flex items-center space-x-1">
 <button
 id={`post-dhikr-${item.name}`}
 onClick={() => setSelectedDhikrPrayer(item.name)}
 className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all flex items-center space-x-1 ${
 isDhikrCompleted
 ? 'bg-emerald-950/90 text-emerald-300 border-emerald-700/80 font-semibold shadow-sm hover:bg-emerald-900'
 : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
 }`}
 >
 {isDhikrCompleted ? (
 <>
 <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-950" />
 <span>Dhikri i Kryer</span>
 </>
 ) : (
 <span>Dhikri</span>
 )}
 </button>

 {isDhikrCompleted && (
 <button
 id={`undo-dhikr-${item.name}`}
 onClick={(e) => {
 e.stopPropagation();
 onSavePostPrayerDhikr(item.name as PrayerName, {}, false);
 }}
 title="Zhbëj dhikrin e këtij namazi"
 className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
 >
 <RotateCcw className="w-3.5 h-3.5" />
 </button>
 )}
 </div>
 );
 })()}
 </div>
 </div>

 {isLogged && logEntry && onUpdatePrayerLogDetails && (
 <div className="mt-3 pt-3 border-t border-slate-800/60 flex flex-col gap-2">
 {/* Vendi */}
 <div className="flex flex-wrap items-center justify-between text-xs gap-1.5">
 <span className="text-[11px] text-slate-400 font-medium">Vendi:</span>
 <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800/60">
 <button
 id={`location-mosque-${item.name}`}
 onClick={() =>
 onUpdatePrayerLogDetails(item.name as PrayerName, {
 location: logEntry.location === 'mosque' ? undefined : 'mosque'
 })
 }
 className={`px-2 py-1 text-[10px] rounded-md transition-colors ${
 logEntry.location === 'mosque'
 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold'
 : 'text-slate-400 hover:text-slate-300'
 }`}
 >
 Në xhami
 </button>
 <button
 id={`location-home-${item.name}`}
 onClick={() =>
 onUpdatePrayerLogDetails(item.name as PrayerName, {
 location: logEntry.location === 'home' ? undefined : 'home'
 })
 }
 className={`px-2 py-1 text-[10px] rounded-md transition-colors ${
 logEntry.location === 'home'
 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold'
 : 'text-slate-400 hover:text-slate-300'
 }`}
 >
 Në shtëpi
 </button>
 <button
 id={`location-outside-${item.name}`}
 onClick={() =>
 onUpdatePrayerLogDetails(item.name as PrayerName, {
 location: logEntry.location === 'outside' ? undefined : 'outside'
 })
 }
 className={`px-2 py-1 text-[10px] rounded-md transition-colors ${
 logEntry.location === 'outside'
 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold'
 : 'text-slate-400 hover:text-slate-300'
 }`}
 >
 Në një vend tjetër
 </button>
 </div>
 </div>

 {/* Mënyra */}
 <div className="flex flex-wrap items-center justify-between text-xs gap-1.5">
 <span className="text-[11px] text-slate-400 font-medium">Mënyra:</span>
 <div className="flex bg-slate-950 rounded-lg p-0.5 border border-slate-800/60">
 <button
 id={`method-jamaat-${item.name}`}
 onClick={() =>
 onUpdatePrayerLogDetails(item.name as PrayerName, {
 method: logEntry.method === 'jamaat' ? undefined : 'jamaat'
 })
 }
 className={`px-2.5 py-1 text-[10px] rounded-md transition-colors ${
 logEntry.method === 'jamaat'
 ? 'bg-blue-950 text-blue-300 border border-blue-800/60 font-semibold'
 : 'text-slate-400 hover:text-slate-300'
 }`}
 >
 Me xhemat
 </button>
 <button
 id={`method-alone-${item.name}`}
 onClick={() =>
 onUpdatePrayerLogDetails(item.name as PrayerName, {
 method: logEntry.method === 'alone' ? undefined : 'alone'
 })
 }
 className={`px-2.5 py-1 text-[10px] rounded-md transition-colors ${
 logEntry.method === 'alone'
 ? 'bg-blue-950 text-blue-300 border border-blue-800/60 font-semibold'
 : 'text-slate-400 hover:text-slate-300'
 }`}
 >
 Vetëm
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 ) : activeSubTab === 'records' ? (
 /* Consolidated Prayer Records (Calendar & Analytics) Subtab */
 <PrayerRecordsView
 prayerLogs={prayerLogs}
 postPrayerDhikrSessions={postPrayerDhikrSessions}
 mburojaState={mburojaState}
 />
 ) : activeSubTab === 'qibla' ? (
 /* Qibla Compass Subtab */
 <QiblaCompass
 initialLatitude={prayerSettings.latitude}
 initialLongitude={prayerSettings.longitude}
 initialLocationName={prayerSettings.locationName}
 />
 ) : (
 /* Prayer Settings Subtab */
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 animate-fadeIn">
 <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
 <Sliders className="w-5 h-5 text-emerald-400" />
 <h3 className="font-bold text-sm text-slate-100">Cilësimet e Llogaritjes së Namazit</h3>
 </div>

 <div className="space-y-4">
 <div>
 <label className="text-xs text-slate-400 block mb-1 font-semibold">Qyteti i Përzgjedhur (Preset)</label>
 <select
 value={prayerSettings.locationName}
 onChange={e => {
 if (!onUpdatePrayerSettings) return;
 if (e.target.value === 'Tiranë, Shqipëri') {
 onUpdatePrayerSettings({
 ...prayerSettings,
 locationName: 'Tiranë, Shqipëri',
 latitude: 41.3275,
 longitude: 19.8187
 });
 } else if (e.target.value === 'Prishtinë, Kosovë') {
 onUpdatePrayerSettings({
 ...prayerSettings,
 locationName: 'Prishtinë, Kosovë',
 latitude: 42.6629,
 longitude: 21.1655
 });
 } else if (e.target.value === 'Shkup, Maqedoni e Veriut') {
 onUpdatePrayerSettings({
 ...prayerSettings,
 locationName: 'Shkup, Maqedoni e Veriut',
 latitude: 41.9981,
 longitude: 21.4254
 });
 }
 }}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-600"
 >
 <option value="Tiranë, Shqipëri">Tiranë, Shqipëri</option>
 <option value="Prishtinë, Kosovë">Prishtinë, Kosovë</option>
 <option value="Shkup, Maqedoni e Veriut">Shkup, Maqedoni e Veriut</option>
 </select>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="text-xs text-slate-400 block mb-1 font-semibold">Llogaritja e Ikindisë (Asr)</label>
 <select
 value={prayerSettings.asrSchool}
 onChange={e => {
 if (onUpdatePrayerSettings) {
 onUpdatePrayerSettings({
 ...prayerSettings,
 asrSchool: e.target.value as 'standard' | 'hanafi'
 });
 }
 }}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-600"
 >
 <option value="standard">Standard (Shafi'i, Maliki, Hanbali)</option>
 <option value="hanafi">Hanafi</option>
 </select>
 </div>

 <div>
 <label className="text-xs text-slate-400 block mb-1 font-semibold">Metoda e Llogaritjes</label>
 <select
 value={prayerSettings.method}
 onChange={e => {
 if (onUpdatePrayerSettings) {
 onUpdatePrayerSettings({
 ...prayerSettings,
 method: parseInt(e.target.value, 10)
 });
 }
 }}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-600"
 >
 <option value={13}>Diyanet (Turqi/Ballkan)</option>
 <option value={3}>Liga e Botës Islame (MWL)</option>
 <option value={2}>ISNA (Amerikë)</option>
 </select>
 </div>
 </div>

 {/* Minute offsets */}
 <div className="pt-3 border-t border-slate-800 space-y-2">
 <h4 className="text-xs font-semibold text-emerald-400">Korrigjimet me Minuta (Manual Offsets)</h4>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
 {[
 { key: 'fajr', label: 'Sabahu' },
 { key: 'dhuhr', label: 'Dreka' },
 { key: 'asr', label: 'Ikindia' },
 { key: 'maghrib', label: 'Akshami' },
 { key: 'isha', label: 'Jacia' }
 ].map(p => (
 <div key={p.key} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
 <label className="text-[11px] text-slate-400 block mb-1 font-medium">{p.label}</label>
 <input
 type="number"
 value={prayerSettings.manualOffsets?.[p.key as keyof typeof prayerSettings.manualOffsets] || 0}
 onChange={e => {
 if (onUpdatePrayerSettings) {
 const val = parseInt(e.target.value, 10) || 0;
 onUpdatePrayerSettings({
 ...prayerSettings,
 manualOffsets: {
 ...prayerSettings.manualOffsets,
 [p.key]: val
 }
 });
 }
 }}
 className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-100 font-mono text-center focus:outline-none focus:border-emerald-500"
 />
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Post-Prayer Dhikr Interactive Modal */}
 {selectedDhikrPrayer && (
 <PostPrayerDhikrModal
 prayerName={selectedDhikrPrayer}
 hapticEnabled={prayerSettings.dhikrHapticEnabled ?? true}
 soundEnabled={prayerSettings.dhikrSoundEnabled ?? true}
 existingSession={postPrayerDhikrSessions.find(
 s => s.date === todayStr && s.prayer === selectedDhikrPrayer
 )}
 onClose={() => setSelectedDhikrPrayer(null)}
 onSave={(items, isCompleted) => {
 onSavePostPrayerDhikr(selectedDhikrPrayer, items, isCompleted);
 setSelectedDhikrPrayer(null);
 }}
 />
 )}

 {/* Future Prayer Blocked Notice Modal */}
 {futureBlockedPrayer && (
 <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
 <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 shadow-2xl space-y-4 animate-scaleUp text-slate-100">
 <div className="flex items-center space-x-3 text-amber-400">
 <div className="p-2.5 bg-amber-950/80 border border-amber-800/60 rounded-xl">
 <Lock className="w-5 h-5 text-amber-400" />
 </div>
 <div>
 <h3 className="font-bold text-sm text-amber-300">Namaz i Parakohshëm</h3>
 <p className="text-[11px] text-slate-400 font-mono">Koha nuk ka ardhur akoma</p>
 </div>
 </div>

 <p className="text-xs text-slate-300 leading-relaxed">
 Koha e namazit të <strong className="text-white">{futureBlockedPrayer.label}</strong> është në orën <strong className="text-amber-400 font-mono">{futureBlockedPrayer.time}</strong>. Nuk mund ta seleksiononi si të kryer para se të hyjë kjo kohë.
 </p>

 <button
 id="btn-close-future-blocked"
 onClick={() => setFutureBlockedPrayer(null)}
 className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow"
 >
 Kuptova
 </button>
 </div>
 </div>
 )}

 {/* Uncheck Prayer Confirmation Modal requiring 'pa falur' input */}
 {uncheckModalPrayer && (
 <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
 <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-scaleUp text-slate-100">
 <div className="flex items-center justify-between border-b border-slate-800 pb-3">
 <div className="flex items-center space-x-2.5 text-red-400">
 <div className="p-2 bg-red-950/80 border border-red-800/60 rounded-xl">
 <AlertTriangle className="w-5 h-5 text-red-400" />
 </div>
 <div>
 <h3 className="font-bold text-sm text-slate-100">Deseleksionimi i Namazit</h3>
 <p className="text-[11px] text-slate-400 font-mono">Namazi i {uncheckModalPrayer.label}</p>
 </div>
 </div>
 <button
 id="btn-close-uncheck-modal"
 onClick={() => setUncheckModalPrayer(null)}
 className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <div className="space-y-2">
 <p className="text-xs text-slate-300 leading-relaxed">
 A jeni të sigurt që dëshironi ta heqni namazin e <strong className="text-emerald-400">{uncheckModalPrayer.label}</strong> si të kryer?
 </p>
 <p className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
 Nëse nuk e keni falur me të vërtetë, ju lutemi shkruani fjalën <strong className="text-red-400 font-mono uppercase">'pa falur'</strong> më poshtë për të konfirmuar deseleksionimin:
 </p>
 </div>

 <div className="space-y-1">
 <input
 id="input-pa-falur"
 type="text"
 value={uncheckInputText}
 onChange={(e) => setUncheckInputText(e.target.value)}
 placeholder="Shkruaj 'pa falur'..."
 autoFocus
 className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 outline-none transition-colors"
 />
 {uncheckInputText.length > 0 && uncheckInputText.trim().toLowerCase() !== 'pa falur' && (
 <p className="text-[10px] text-red-400/80 pl-1">
 Duhet të shkruani saktësisht "pa falur".
 </p>
 )}
 </div>

 <div className="flex gap-2 pt-2 border-t border-slate-800">
 <button
 id="btn-cancel-uncheck"
 onClick={() => setUncheckModalPrayer(null)}
 className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold transition-colors border border-slate-700"
 >
 Anulo (E kam falur)
 </button>
 <button
 id="btn-confirm-uncheck"
 onClick={() => {
 if (uncheckInputText.trim().toLowerCase() === 'pa falur') {
 onTogglePrayerLog(uncheckModalPrayer.name);
 setUncheckModalPrayer(null);
 }
 }}
 disabled={uncheckInputText.trim().toLowerCase() !== 'pa falur'}
 className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all shadow ${
 uncheckInputText.trim().toLowerCase() === 'pa falur'
 ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
 : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-800'
 }`}
 >
 Konfirmo
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};

const PRAYER_ALBANIAN_NAMES: Record<PrayerName, string> = {
 imsak: 'Imsaku',
 fajr: 'Sabahu',
 sunrise: 'Lindja e Diellit',
 dhuhr: 'Dreka',
 asr: 'Ikindia',
 maghrib: 'Akshami',
 isha: 'Jacia'
};

interface DhikrItemDef {
 key: string;
 title: string;
 ar: string;
 transliteration: string;
 sq: string;
 reference: string;
 targetCount: number;
}

const getPostPrayerDhikrItemsForPrayer = (prayerName: PrayerName): DhikrItemDef[] => {
 const isMorningOrEvening = prayerName === 'fajr' || prayerName === 'maghrib';
 const isFajr = prayerName === 'fajr';

 const items: DhikrItemDef[] = [
 {
 key: 'estagfirullah',
 title: '1. Istigfari',
 ar: 'أَسْتَغْفِرُ اللَّهَ',
 transliteration: 'Estagfirullah (3 herë)',
 sq: 'Kërkoj falje nga Allahu (3 herë).',
 reference: 'Muslimi 1/414 (Mburoja e Muslimanit #65)',
 targetCount: 3
 },
 {
 key: 'entes_selam',
 title: '2. Duaja pas Selamit',
 ar: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
 transliteration: 'All-llahumme entes-selamu ve minkes-selamu tebarekte ja dhel xhelali vel-ikram',
 sq: 'O Allahu im, Ti je shpëtimi dhe nga Ti vjen shpëtimi, i Lartësuar qofsh o zotërues i Madhërisë dhe i Nderit.',
 reference: 'Muslimi 1/414 (Mburoja e Muslimanit #65)',
 targetCount: 1
 },
 {
 key: 'la_ilahe_la_mania',
 title: '3. Teuhidi & Mbrojtja nga çdo e keqe',
 ar: 'لَا إِلَـٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
 transliteration: 'La ilahe il-lAll-llahu vahdehu la sherike leh, lehul mulku ve lehul hamdu ve huve ala kul-li shejin kadir. All-llahume la mani’a lima a’tajte ve la m’utije lima mena’te ve la jenfe’u dhel xheddi minkel xheddu',
 sq: 'Nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival. Atij i takon Sundimi dhe Lavdërimi, Ai është i Plotfuqishmi mbi çdo send. O Allahu im, nuk ka kush e ndalon atë që Ti e ke dhënë dhe nuk ka kush e jep atë që Ti e ke ndaluar; tek Ti nuk ka vlerë dobia e askujt, ngase çdo dobi vjen prej Teje.',
 reference: 'Buhariu 1/255 & Muslimi 1/414 (Mburoja e Muslimanit #66)',
 targetCount: 1
 },
 {
 key: 'la_ilahe_la_havle',
 title: '4. Dhikri i Madhërimit dhe Sinqeritetit',
 ar: 'لَا إِلَـٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ، لَا إِلَـٰهَ إِلَّا اللَّهُ، وَلَا نَعْبُدُ إِلَّا إِيَّاهُ، لَهُ النِّعْمَةُ وَلَهُ الْفَضْلُ وَلَهُ الثَّنَاءُ الْحَسَنُ، لَا إِلَـٰهَ إِلَّا اللَّهُ مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الْكَافِرُونَ',
 transliteration: 'La ilahe il-lAll-llahu vahdehu la sherike leh... la havle ve la kuvete il-la bil-lah, la ilahe il-lAll-llahu ve la na’budu il-la ijjahu lehun-ni’metu ve lehul-fadlu ve lehuth-thenaul hasen. La ilahe il-lAll-llahu muhlisine lehud-din ve lev kerihel-kafirun',
 sq: 'Nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival. Atij i takon Sundimi dhe Lavdërimi, Ai është i Gjithëfuqishmi mbi çdo gjë. Nuk ka ndryshim e as forcë pa ndihmën e Allahut; nuk ka Zot tjetër përveç Allahut dhe nuk e adhurojmë askënd tjetër përveç Tij...',
 reference: 'Muslimi 1/415 (Mburoja e Muslimanit #67)',
 targetCount: 1
 },
 {
 key: 'subhanallah',
 title: '5. Tasbeeh - Subḥãnallãh',
 ar: 'سُبْحَانَ اللَّهِ',
 transliteration: 'Subḥãnallãh (33 herë)',
 sq: 'I pastër është Allahu nga çdo e metë.',
 reference: 'Muslimi 1/418 (Mburoja e Muslimanit #68)',
 targetCount: 33
 },
 {
 key: 'alhamdulillah',
 title: '6. Tahmeed - El-ḥamdu lillãh',
 ar: 'الْحَمْدُ لِلَّهِ',
 transliteration: 'El-ḥamdu lillãh (33 herë)',
 sq: 'Falënderimi i përket vetëm Allahut.',
 reference: 'Muslimi 1/418 (Mburoja e Muslimanit #68)',
 targetCount: 33
 },
 {
 key: 'allahuakbar',
 title: '7. Takbeer - Allãhu Ekber',
 ar: 'اللَّهُ أَكْبَرُ',
 transliteration: 'Allãhu Ekber (33 herë)',
 sq: 'Allahu është më i Madhi.',
 reference: 'Muslimi 1/418 (Mburoja e Muslimanit #68)',
 targetCount: 33
 },
 {
 key: 'la_ilahe_completion',
 title: '8. Plotësimi i të 100-tës me Teuhid',
 ar: 'لَا إِلَـٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
 transliteration: 'La ilahe il-lAll-llahu vahdehu la sherike leh, lehul mulku ve lehul hamdu ve huve ala kul-li shejin kadir',
 sq: 'Nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival. Atij i takon Sundimi dhe Lavdërimi dhe Ai është i Gjithëfuqishëm mbi çdo gjë.',
 reference: 'Muslimi 1/418 (Mburoja e Muslimanit #68)',
 targetCount: 1
 },
 {
 key: 'ajetul_kursi',
 title: '9. Ajetul Kursi (Mbrojtja e Xhenetit)',
 ar: 'اللَّهُ لَا إِلَـٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْن أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
 transliteration: 'All-llahu La Ilahe il-la huvel-Hajjul-Kajjumu...',
 sq: 'Allahu është Një, nuk ka Zot tjetër përveç Atij, Ai është Mbikëqyrës i përhershëm dhe i përjetshëm... (Kush e lexon pas çdo namazi farz, nuk e pengon asgjë nga hyrja në Xhenet përveç vdekjes).',
 reference: 'Nesaiu & Ibën Sunnijj (Mburoja e Muslimanit #72)',
 targetCount: 1
 },
 {
 key: 'ihlas',
 title: '10. Surja El-Ihlas',
 ar: 'بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ ۞ اللَّهُ الصَّمَدُ ۞ لَمْ يَلِدْ وَلَمْ يُولَدْ ۞ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
 transliteration: 'Kul huvAll-llahu ehad, All-llahus-samed, lem jelid ve lem juled, ve lem jekun lehu kufuven ehad',
 sq: 'Thuaj: “Ai është Allahu, Një dhe i Vetëm! Allahu është Absoluti, të Cilit i përgjërohet gjithçka në amshim. Ai as nuk lind, as nuk është i lindur. Dhe askush nuk është i barabartë me Atë!”',
 reference: 'Ebu Davudi & Nesaiu (Mburoja e Muslimanit #69)',
 targetCount: isMorningOrEvening ? 3 : 1
 },
 {
 key: 'felek',
 title: '11. Surja El-Felek',
 ar: 'بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۞ مِن شَرِّ مَا خَلَقَ ۞ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ۞ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۞ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
 transliteration: 'Kul eudhu bi Rabbil felek, min sherri ma halek, ve min sherri gasikin idha vekab, ve min sherrin-nef-fathati fil ukad, ve min sherr-rri hasidin idha hased',
 sq: 'Thuaj: “Kërkoj mbështetje te Zoti i agimit, që të më mbrojë nga sherri i gjithçkaje që Ai ka krijuar...”.',
 reference: 'Ebu Davudi & Nesaiu (Mburoja e Muslimanit #70)',
 targetCount: isMorningOrEvening ? 3 : 1
 },
 {
 key: 'nas',
 title: '12. Surja En-Nas',
 ar: 'بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ۞ مَلِكِ النَّاسِ ۞ إِلَـٰهِ النَّاسِ ۞ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۞ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۞ مِنَ الْجِنَّةِ وَالنَّاسِ',
 transliteration: 'Kul eudhu bi Rabbin-nas, melikin-nas, ilahin-nas, minsherr-rril vesvasil-han-nas, eledhi juvesvisu fi sudurin-nas, minel xhin-neti ven-nas',
 sq: 'Thuaj: “Kërkoj mbështetje te Zoti i njerëzve, Sundimtari i njerëzve...”.',
 reference: 'Ebu Davudi & Nesaiu (Mburoja e Muslimanit #71)',
 targetCount: isMorningOrEvening ? 3 : 1
 }
 ];

 if (isMorningOrEvening) {
 items.push({
 key: 'juhji_ve_jumitu',
 title: '13. Dhikri pas Sabahut & Akshamit (10 herë)',
 ar: 'لَا إِلَـٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
 transliteration: 'La Ilahe il-lAll-llahu vahdehu la sherike leh, lehul mulku ve lehul hamdu juhji ve jumitu ve huve ala kul-li shej’in kadir',
 sq: 'Nuk ka hyjni që meriton të adhurohet përveç Allahut, të Vetëm e i pa rival. Atij i takon Sundimi dhe Lavdërimi, Ai jep jetë dhe vdekje dhe Ai është i Gjithëfuqishëm mbi çdo gjë.',
 reference: 'Tirmidhiu & Ahmedi (Mburoja e Muslimanit #73)',
 targetCount: 10
 });
 }

 if (isFajr) {
 items.push({
 key: 'ilmen_nafi',
 title: '14. Lutja për Dituri, Furnizim & Vepra të Pranuara (Sabah)',
 ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
 transliteration: 'All-llahume inni es‘eluke ilmen nafi’an ve rizkan tajjiben ve amelen mutekabbelen',
 sq: 'O Allahu im, të lutem më jep dituri të dobishme dhe furnizim të mirë, si dhe të lutem Të m’i pranosh veprat e mia.',
 reference: 'Ibën Maxheh (Mburoja e Muslimanit #74)',
 targetCount: 1
 });
 }

 return items;
};

// Sub-component: Post Prayer Dhikr Modal
const PostPrayerDhikrModal: React.FC<{
 prayerName: PrayerName;
 hapticEnabled?: boolean;
 soundEnabled?: boolean;
 existingSession?: PostPrayerDhikrSession;
 onClose: () => void;
 onSave: (items: { [key: string]: number }, isCompleted?: boolean) => void;
}> = ({ prayerName, hapticEnabled = true, soundEnabled = true, existingSession, onClose, onSave }) => {
 const { fontScale, changeScale } = useDhikrFontSize();
 const dhikrDefs = getPostPrayerDhikrItemsForPrayer(prayerName);

 const [itemCounts, setItemCounts] = useState<{ [key: string]: number }>(() => {
 const initial: { [key: string]: number } = {};
 dhikrDefs.forEach(d => {
 initial[d.key] = existingSession?.items?.[d.key] ?? 0;
 });
 return initial;
 });

 const [recentlyCompletedKey, setRecentlyCompletedKey] = useState<string | null>(null);

 const handleIncrement = (key: string, targetCount: number) => {
 triggerDhikrFeedback(hapticEnabled, soundEnabled);
 setItemCounts(prev => {
 const current = prev[key] || 0;
 const next = Math.min(current + 1, targetCount);

 // Check if this increment hit the target count
 if (current < targetCount && next === targetCount) {
 setRecentlyCompletedKey(key);
 
 // Single Dhikr completion confetti burst
 try {
 confetti({
 particleCount: 50,
 spread: 70,
 origin: { y: 0.6 },
 colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24', '#ffffff']
 });
 } catch {
 // ignore if canvas-confetti unsupported
 }

 setTimeout(() => {
 setRecentlyCompletedKey(null);
 }, 2200);

 // Check if ALL items are now completed
 const updatedCounts = { ...prev, [key]: next };
 const allCompletedNow = dhikrDefs.every(d => (updatedCounts[d.key] || 0) >= d.targetCount);
 if (allCompletedNow) {
 setTimeout(() => {
 try {
 confetti({
 particleCount: 120,
 spread: 100,
 origin: { y: 0.4 },
 colors: ['#10b981', '#059669', '#f59e0b', '#facc15', '#38bdf8']
 });
 } catch {
 // ignore
 }
 }, 350);
 }
 }

 return { ...prev, [key]: next };
 });
 };

 const handleCompleteAll = () => {
 triggerDhikrFeedback(hapticEnabled, soundEnabled);
 const completedAll: { [key: string]: number } = {};
 dhikrDefs.forEach(d => {
 completedAll[d.key] = d.targetCount;
 });
 setItemCounts(completedAll);
 try {
 confetti({
 particleCount: 90,
 spread: 90,
 origin: { y: 0.5 },
 colors: ['#10b981', '#34d399', '#f59e0b', '#fbbf24', '#ffffff']
 });
 } catch {
 // ignore
 }
 };

 const handleResetAll = () => {
 triggerDhikrFeedback(hapticEnabled, soundEnabled);
 const resetAll: { [key: string]: number } = {};
 dhikrDefs.forEach(d => {
 resetAll[d.key] = 0;
 });
 setItemCounts(resetAll);
 };

 const handleUndoDhikr = () => {
 triggerDhikrFeedback(hapticEnabled, soundEnabled);
 const resetAll: { [key: string]: number } = {};
 dhikrDefs.forEach(d => {
 resetAll[d.key] = 0;
 });
 setItemCounts(resetAll);
 onSave(resetAll, false);
 };

 const completedItemsCount = dhikrDefs.filter(d => (itemCounts[d.key] || 0) >= d.targetCount).length;
 const isAllCompleted = completedItemsCount === dhikrDefs.length;
 const progressPercent = Math.round((completedItemsCount / dhikrDefs.length) * 100);

 const prayerTitle = PRAYER_ALBANIAN_NAMES[prayerName] || prayerName;

 return (
 <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-4 overflow-y-auto">
 <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl animate-scaleUp text-slate-100">
 
 {/* Header */}
 <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 rounded-t-2xl">
 <div>
 <div className="flex items-center space-x-2">
 <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded">
 Mburoja e Muslimanit
 </span>
 {isAllCompleted && (
 <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded flex items-center space-x-1">
 <Check className="w-3 h-3 text-emerald-400" />
 <span>E Plotësuar</span>
 </span>
 )}
 </div>
 <h3 className="font-bold text-lg font-serif text-emerald-300 capitalize mt-1">
 Dhikret pas {prayerTitle}
 </h3>
 </div>
 <div className="flex items-center space-x-2">
 <FontSizeControl fontScale={fontScale} onChangeScale={changeScale} />
 <button
 onClick={onClose}
 className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
 >
 ✕
 </button>
 </div>
 </div>

 {/* Progress Bar & Status */}
 <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-850 flex flex-col space-y-1.5">
 <div className="flex justify-between items-center text-xs">
 <span className="text-slate-400 font-medium">Progresi i plotësimit:</span>
 <span className="font-mono font-bold text-emerald-400">
 {completedItemsCount} / {dhikrDefs.length} dhikre ({progressPercent}%)
 </span>
 </div>
 <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
 <div
 className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
 style={{ width: `${progressPercent}%` }}
 />
 </div>
 </div>

 {/* Dhikr List */}
 <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
 {dhikrDefs.map((dhikr) => {
 const currentCount = itemCounts[dhikr.key] || 0;
 const isDone = currentCount >= dhikr.targetCount;
 const isJustCompleted = recentlyCompletedKey === dhikr.key;

 return (
 <div
 key={dhikr.key}
 className={`p-3.5 rounded-xl border transition-all duration-300 relative overflow-hidden ${
 isJustCompleted
 ? 'bg-emerald-900/40 border-emerald-500 ring-2 ring-emerald-400/80 shadow-lg shadow-emerald-500/20 scale-[1.01]'
 : isDone
 ? 'bg-emerald-950/25 border-emerald-800/60 shadow-sm'
 : 'bg-slate-950/80 border-slate-800'
 }`}
 >
 {/* Celebratory Sparkle Burst Overlay for freshly completed item */}
 {isJustCompleted && (
 <div className="absolute top-2 right-2 flex items-center space-x-1 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md animate-bounce z-10">
 <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-amber-300" />
 <span>SYNIMI U PLOTËSUA!</span>
 </div>
 )}

 <div className="flex items-start justify-between gap-3">
 <div className="space-y-1 flex-1">
 <div className="flex items-center space-x-2">
 <h4 className="text-xs font-bold text-slate-200">
 {dhikr.title}
 </h4>
 {isDone && !isJustCompleted && (
 <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold flex items-center space-x-1">
 <Check className="w-3 h-3 text-emerald-400" />
 <span>E kryer</span>
 </span>
 )}
 </div>
 
 {/* Arabic Text */}
 <p className={`font-arabic ${fontScale === 0 ? "text-base leading-relaxed" : fontScale === 2 ? "text-2xl leading-relaxed" : fontScale === 3 ? "text-3xl leading-relaxed" : "text-lg leading-relaxed"} text-emerald-300 pt-1 whitespace-pre-line`} dir="rtl">
 {dhikr.ar}
 </p>
 
 {/* Transliteration */}
 <p className={`${fontScale === 0 ? "text-[10px]" : fontScale === 2 ? "text-sm" : fontScale === 3 ? "text-base" : "text-xs"} text-amber-200/90 font-medium italic pt-0.5`}>
 {dhikr.transliteration}
 </p>

 {/* Translation */}
 <p className={`${fontScale === 0 ? "text-[11px] leading-relaxed" : fontScale === 2 ? "text-sm leading-relaxed" : fontScale === 3 ? "text-base leading-relaxed" : "text-xs leading-relaxed"} text-slate-300 pt-1`}>
 {dhikr.sq}
 </p>

 {/* Reference */}
 <p className="text-[10px] font-mono text-slate-500 pt-1">
 {dhikr.reference}
 </p>
 </div>

 {/* Counter Button with Burst Effect */}
 <div className="flex flex-col items-center justify-center space-y-1.5 flex-shrink-0 pt-1">
 <button
 id={`btn-count-${dhikr.key}`}
 onClick={() => handleIncrement(dhikr.key, dhikr.targetCount)}
 className={`min-w-[70px] py-2 px-3 rounded-xl font-mono font-bold text-xs flex items-center justify-center space-x-1 transition-all active:scale-95 ${
 isJustCompleted
 ? 'bg-amber-400 text-slate-950 border border-amber-300 shadow-md ring-2 ring-amber-300 animate-pulse scale-105'
 : isDone
 ? 'bg-emerald-600 text-slate-950 border border-emerald-400 shadow'
 : 'bg-emerald-950 border border-emerald-700/70 text-emerald-300 hover:bg-emerald-900'
 }`}
 >
 {isDone && <Check className="w-3.5 h-3.5 text-slate-950" />}
 <span>{currentCount} / {dhikr.targetCount}</span>
 </button>
 {isDone && (
 <button
 onClick={() => {
 setItemCounts(prev => ({ ...prev, [dhikr.key]: 0 }));
 }}
 className="text-[10px] text-slate-500 hover:text-slate-300 underline"
 >
 Reset
 </button>
 )}
 </div>
 </div>
 </div>
 );
 })}
 </div>

 {/* Footer Actions */}
 <div className="p-4 border-t border-slate-800 bg-slate-900/90 rounded-b-2xl flex flex-col sm:flex-row gap-2">
 <div className="flex gap-2 flex-1">
 <button
 onClick={handleCompleteAll}
 className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-semibold transition-colors border border-slate-700 flex items-center justify-center space-x-1.5"
 >
 <Sparkles className="w-3.5 h-3.5 text-amber-400" />
 <span>Plotëso të Gjitha</span>
 </button>
 <button
 onClick={handleResetAll}
 className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors border border-slate-700 flex items-center justify-center"
 title="Rifillo të gjithë numëruesit"
 >
 <RotateCcw className="w-3.5 h-3.5" />
 </button>
 </div>

 {(existingSession?.completed || completedItemsCount > 0) && (
 <button
 id="btn-undo-post-dhikr"
 onClick={handleUndoDhikr}
 className="bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 font-semibold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-colors shadow"
 title="Heq statusin 'E kryer' për këtë dhikr"
 >
 <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
 <span>Zhbëj Dhikrin</span>
 </button>
 )}

 <button
 id="btn-save-post-dhikr"
 onClick={() => {
 triggerDhikrFeedback(hapticEnabled, soundEnabled);
 const sum = (Object.values(itemCounts) as number[]).reduce((acc: number, curr: number) => acc + (curr || 0), 0);
 onSave(itemCounts, sum > 0);
 }}
 className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-colors shadow flex items-center justify-center space-x-1.5"
 >
 <CheckCircle2 className="w-4 h-4" />
 <span>Ruaj & Plotëso Dhikrin</span>
 </button>
 </div>

 </div>
 </div>
 );
};
