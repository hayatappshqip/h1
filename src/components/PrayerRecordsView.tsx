/**
 * PrayerRecordsView Component
 * Consolidated view combining Prayer Logs Calendar & Analytics into a single "Regjistrimet" subtab.
 * Strictly non-gamified, judgment-free design based strictly on manual logs in Hayat.
 */
import React, { useState, useMemo } from 'react';
import { PrayerLog, PrayerName, PostPrayerDhikrSession, MburojaState } from '../types';
import {
 Calendar as CalendarIcon,
 BarChart2,
 Info,
 MapPin,
 Users,
 CheckCircle2,
 Clock,
 Sparkles,
 Filter,
 Check
} from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';

interface PrayerRecordsViewProps {
 prayerLogs: PrayerLog[];
 postPrayerDhikrSessions?: PostPrayerDhikrSession[];
 mburojaState?: MburojaState;
}

type TimePeriod = 'week' | 'month' | 'all';
type ViewType = 'calendar' | 'analytics';

const PRAYER_ALBANIAN_NAMES: Record<PrayerName, string> = {
 imsak: 'Imsaku',
 fajr: 'Sabahu',
 sunrise: 'Lindja e Diellit',
 dhuhr: 'Dreka',
 asr: 'Ikindia',
 maghrib: 'Akshami',
 isha: 'Jacia'
};

const FARZ_PRAYERS: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const PrayerRecordsView: React.FC<PrayerRecordsViewProps> = ({
 prayerLogs,
 postPrayerDhikrSessions = [],
 mburojaState
}) => {
 const [period, setPeriod] = useState<TimePeriod>('month');
 const [viewType, setViewType] = useState<ViewType>('calendar');

 // Compute start date based on selected time period
 const filteredLogs = useMemo(() => {
 const completed = prayerLogs.filter(l => l.completed);
 const now = new Date();

 if (period === 'week') {
 const cutoff = new Date(now);
 cutoff.setDate(now.getDate() - 6);
 const cutoffStr = getLocalDateString(cutoff);
 return completed.filter(l => l.date >= cutoffStr);
 }

 if (period === 'month') {
 const currentYear = now.getFullYear();
 const currentMonth = (now.getMonth() + 1).toString().padStart(2, '0');
 const prefix = `${currentYear}-${currentMonth}`;
 return completed.filter(l => l.date.startsWith(prefix));
 }

 // 'all'
 return completed;
 }, [prayerLogs, period]);

 // Group filtered logs by date for Calendar View
 const groupedByDate = useMemo(() => {
 const map: Record<string, PrayerLog[]> = {};
 filteredLogs.forEach(log => {
 if (!map[log.date]) {
 map[log.date] = [];
 }
 map[log.date].push(log);
 });

 // Sort dates descending
 const dates = Object.keys(map).sort((a, b) => b.localeCompare(a));
 return dates.map(date => ({
 date,
 logs: map[date]
 }));
 }, [filteredLogs]);

 // Analytics Calculations (Location, Method, Prayer Breakdown)
 const analyticsData = useMemo(() => {
 let mosqueCount = 0;
 let homeCount = 0;
 let outsideCount = 0;
 let unspecLocationCount = 0;

 let jamaatCount = 0;
 let aloneCount = 0;
 let unspecMethodCount = 0;

 const prayerCounts: Record<PrayerName, number> = {
 imsak: 0,
 fajr: 0,
 sunrise: 0,
 dhuhr: 0,
 asr: 0,
 maghrib: 0,
 isha: 0
 };

 filteredLogs.forEach(log => {
 if (log.prayer) {
 prayerCounts[log.prayer] = (prayerCounts[log.prayer] || 0) + 1;
 }

 if (log.location === 'mosque') mosqueCount++;
 else if (log.location === 'home') homeCount++;
 else if (log.location === 'outside') outsideCount++;
 else unspecLocationCount++;

 if (log.method === 'jamaat') jamaatCount++;
 else if (log.method === 'alone') aloneCount++;
 else unspecMethodCount++;
 });

 const total = filteredLogs.length;

 return {
 total,
 location: {
 mosque: mosqueCount,
 home: homeCount,
 outside: outsideCount,
 unspecified: unspecLocationCount
 },
 method: {
 jamaat: jamaatCount,
 alone: aloneCount,
 unspecified: unspecMethodCount
 },
 prayers: prayerCounts
 };
 }, [filteredLogs]);

 return (
 <div className="space-y-4 animate-fadeIn">
 {/* Title & Disclaimer Note Header */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-2.5">
 <div className="flex items-center space-x-2">
 <BarChart2 className="w-5 h-5 text-emerald-400" />
 <h2 className="text-base font-bold text-slate-100">Statistikat e regjistrimeve</h2>
 </div>
 
 <div className="flex items-start space-x-2 bg-emerald-950/40 border border-emerald-800/40 rounded-xl p-3 text-xs text-emerald-300 leading-relaxed">
 <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
 <p>
 Statistikat bazohen vetëm në regjistrimet manuale në Hayat. Një namaz i paregjistruar nuk do të thotë se nuk është falur.
 </p>
 </div>
 </div>

 {/* Controls Bar: Time Period & View Type Switcher */}
 <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-col sm:flex-row gap-2 justify-between items-stretch">
 {/* Time Period Filter */}
 <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 flex-1">
 <button
 onClick={() => setPeriod('week')}
 className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
 period === 'week'
 ? 'bg-emerald-600 text-slate-950 shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 Këtë javë
 </button>
 <button
 onClick={() => setPeriod('month')}
 className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
 period === 'month'
 ? 'bg-emerald-600 text-slate-950 shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 Këtë muaj
 </button>
 <button
 onClick={() => setPeriod('all')}
 className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all ${
 period === 'all'
 ? 'bg-emerald-600 text-slate-950 shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 Gjithsej
 </button>
 </div>

 {/* View Type Switcher */}
 <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 flex-1 sm:max-w-[220px]">
 <button
 onClick={() => setViewType('calendar')}
 className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition-all ${
 viewType === 'calendar'
 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 shadow font-bold'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <CalendarIcon className="w-3.5 h-3.5" />
 <span>Kalendari</span>
 </button>
 <button
 onClick={() => setViewType('analytics')}
 className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition-all ${
 viewType === 'analytics'
 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 shadow font-bold'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <BarChart2 className="w-3.5 h-3.5" />
 <span>Analiza</span>
 </button>
 </div>
 </div>

 {/* View Content */}
 {viewType === 'calendar' ? (
 /* KALENDARI VIEW - Judgment-Free Days and Logged Items */
 <div className="space-y-3">
 {groupedByDate.length === 0 ? (
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-2">
 <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto" />
 <p className="text-sm font-semibold text-slate-300">Nuk ka regjistrime për këtë periudhë</p>
 <p className="text-xs text-slate-500 max-w-sm mx-auto">
 Mund të shënosh namazet e kryera te tab-i "Orari" për të ruajtur historikun tënd.
 </p>
 </div>
 ) : (
 groupedByDate.map(({ date, logs }) => {
 const dateObj = new Date(date + 'T00:00:00');
 const formattedDate = dateObj.toLocaleDateString('sq-AL', {
 weekday: 'long',
 year: 'numeric',
 month: 'long',
 day: 'numeric'
 });

 return (
 <div key={date} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
 {/* Date Header */}
 <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
 <div className="flex items-center space-x-2">
 <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
 <h3 className="text-xs font-bold text-slate-200 capitalize">{formattedDate}</h3>
 </div>
 <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/50 px-2.5 py-0.5 rounded-full">
 {logs.length} / 5 të regjistruara
 </span>
 </div>

 {/* Registered Prayer Items */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {FARZ_PRAYERS.map(pName => {
 const log = logs.find(l => l.prayer === pName);
 if (!log) return null; // Show ONLY registered manual items!

 return (
 <div
 key={pName}
 className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs"
 >
 <div className="flex items-center space-x-2">
 <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
 <Check className="w-3.5 h-3.5" />
 </div>
 <span className="font-semibold text-slate-200">
 {PRAYER_ALBANIAN_NAMES[pName]}
 </span>
 </div>

 {/* Details Badges */}
 <div className="flex items-center space-x-1.5 text-[10px]">
 {log.location === 'mosque' && (
 <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
 <MapPin className="w-3 h-3" /> Xhami
 </span>
 )}
 {log.location === 'home' && (
 <span className="bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded font-medium">
 Shtëpi
 </span>
 )}
 {log.location === 'outside' && (
 <span className="bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded font-medium">
 Vend tjetër
 </span>
 )}

 {log.method === 'jamaat' && (
 <span className="bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
 <Users className="w-3 h-3" /> Me xhemat
 </span>
 )}
 {log.method === 'alone' && (
 <span className="bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded font-medium">
 Vetëm
 </span>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
 })
 )}
 </div>
 ) : (
 /* ANALIZA VIEW - Location, Method & Farz Prayer Statistics */
 <div className="space-y-4">
 {/* Overview Summary Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1 text-center">
 <span className="text-xs text-slate-400 font-medium">Gjithsej të Regjistruara</span>
 <p className="text-2xl font-bold font-mono text-emerald-400">{analyticsData.total}</p>
 </div>
 <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1 text-center">
 <span className="text-xs text-slate-400 font-medium">Në Xhami</span>
 <p className="text-2xl font-bold font-mono text-emerald-400">{analyticsData.location.mosque}</p>
 </div>
 <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1 text-center">
 <span className="text-xs text-slate-400 font-medium">Me Xhemat</span>
 <p className="text-2xl font-bold font-mono text-indigo-400">{analyticsData.method.jamaat}</p>
 </div>
 </div>

 {/* Vendi (Location Breakdown) */}
 <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
 <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
 <MapPin className="w-4 h-4 text-emerald-400" />
 <h3 className="text-xs font-bold text-slate-200">Vendi i Kryerjes</h3>
 </div>

 <div className="space-y-3">
 {[
 { label: 'Xhami', count: analyticsData.location.mosque, color: 'bg-emerald-500' },
 { label: 'Shtëpi', count: analyticsData.location.home, color: 'bg-blue-500' },
 { label: 'Vend tjetër', count: analyticsData.location.outside, color: 'bg-amber-500' },
 { label: 'Pa specifikuar', count: analyticsData.location.unspecified, color: 'bg-slate-600' }
 ].map(item => {
 const pct = analyticsData.total > 0 ? Math.round((item.count / analyticsData.total) * 100) : 0;
 return (
 <div key={item.label} className="space-y-1.5">
 <div className="flex justify-between text-xs font-medium">
 <span className="text-slate-300">{item.label}</span>
 <span className="font-mono text-slate-400">{item.count} ({pct}%)</span>
 </div>
 <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
 <div
 className={`h-full ${item.color} transition-all duration-500`}
 style={{ width: `${pct}%` }}
 ></div>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Mënyra (Method Breakdown) */}
 <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
 <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
 <Users className="w-4 h-4 text-indigo-400" />
 <h3 className="text-xs font-bold text-slate-200">Mënyra e Kryerjes</h3>
 </div>

 <div className="space-y-3">
 {[
 { label: 'Me xhemat', count: analyticsData.method.jamaat, color: 'bg-indigo-500' },
 { label: 'Vetëm', count: analyticsData.method.alone, color: 'bg-sky-500' },
 { label: 'Pa specifikuar', count: analyticsData.method.unspecified, color: 'bg-slate-600' }
 ].map(item => {
 const pct = analyticsData.total > 0 ? Math.round((item.count / analyticsData.total) * 100) : 0;
 return (
 <div key={item.label} className="space-y-1.5">
 <div className="flex justify-between text-xs font-medium">
 <span className="text-slate-300">{item.label}</span>
 <span className="font-mono text-slate-400">{item.count} ({pct}%)</span>
 </div>
 <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
 <div
 className={`h-full ${item.color} transition-all duration-500`}
 style={{ width: `${pct}%` }}
 ></div>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* Individual Farz Prayer Counts */}
 <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
 <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
 <Clock className="w-4 h-4 text-emerald-400" />
 <h3 className="text-xs font-bold text-slate-200">Ndarja sipas Namazeve Farz</h3>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
 {FARZ_PRAYERS.map(pName => (
 <div key={pName} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-1">
 <span className="text-[11px] font-semibold text-slate-400 block">{PRAYER_ALBANIAN_NAMES[pName]}</span>
 <span className="text-lg font-bold font-mono text-emerald-400 block">
 {analyticsData.prayers[pName] || 0}
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}
 </div>
 );
};
