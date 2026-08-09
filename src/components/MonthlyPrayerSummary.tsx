/**
 * MonthlyPrayerSummary Component
 * Summarizes registered prayers for the selected month in a simple table or list format.
 * Strictly non-gamified, judgment-free design.
 */
import React, { useState, useMemo } from 'react';
import { PrayerLog, PrayerName } from '../types';
import {
 ChevronLeft,
 ChevronRight,
 Calendar as CalendarIcon,
 CheckCircle2,
 List,
 Table as TableIcon,
 Info,
 MapPin,
 Users
} from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';

interface MonthlyPrayerSummaryProps {
 prayerLogs: PrayerLog[];
}

const MONTH_NAMES_AL = [
 'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
 'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'
];

const FARZ_PRAYERS: { name: PrayerName; label: string }[] = [
 { name: 'fajr', label: 'Sabahu' },
 { name: 'dhuhr', label: 'Dreka' },
 { name: 'asr', label: 'Ikindia' },
 { name: 'maghrib', label: 'Akshami' },
 { name: 'isha', label: 'Jacia' }
];

export const MonthlyPrayerSummary: React.FC<MonthlyPrayerSummaryProps> = ({ prayerLogs }) => {
 const now = new Date();
 const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
 const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth()); // 0-indexed
 const [viewType, setViewType] = useState<'table' | 'list'>('table');

 const handlePrevMonth = () => {
 if (currentMonth === 0) {
 setCurrentMonth(11);
 setCurrentYear(prev => prev - 1);
 } else {
 setCurrentMonth(prev => prev - 1);
 }
 };

 const handleNextMonth = () => {
 if (currentMonth === 11) {
 setCurrentMonth(0);
 setCurrentYear(prev => prev + 1);
 } else {
 setCurrentMonth(prev => prev + 1);
 }
 };

 const handleCurrentMonth = () => {
 setCurrentYear(now.getFullYear());
 setCurrentMonth(now.getMonth());
 };

 // Generate array of days for the selected year & month
 const daysInMonth = useMemo(() => {
 const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
 const daysArr = [];

 for (let day = 1; day <= totalDays; day++) {
 const dateObj = new Date(currentYear, currentMonth, day);
 const dateStr = getLocalDateString(dateObj);
 const dayOfWeekShort = dateObj.toLocaleDateString('sq-AL', { weekday: 'short' });

 daysArr.push({
 day,
 dateStr,
 dayOfWeekShort,
 isToday: dateStr === getLocalDateString()
 });
 }

 return daysArr;
 }, [currentYear, currentMonth]);

 // Map of logs for quick lookup: dateStr -> prayerName -> PrayerLog
 const logsMap = useMemo(() => {
 const map: Record<string, Record<string, PrayerLog>> = {};

 prayerLogs.forEach(log => {
 if (log.completed) {
 if (!map[log.date]) {
 map[log.date] = {};
 }
 map[log.date][log.prayer] = log;
 }
 });

 return map;
 }, [prayerLogs]);

 // Statistics for selected month
 const monthStats = useMemo(() => {
 const monthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
 const logsInMonth = prayerLogs.filter(l => l.completed && l.date.startsWith(monthPrefix));

 let mosque = 0;
 let home = 0;
 let outside = 0;
 let jamaat = 0;
 let alone = 0;

 logsInMonth.forEach(log => {
 if (log.location === 'mosque') mosque++;
 else if (log.location === 'home') home++;
 else if (log.location === 'outside') outside++;

 if (log.method === 'jamaat') jamaat++;
 else if (log.method === 'alone') alone++;
 });

 return {
 total: logsInMonth.length,
 mosque,
 home,
 outside,
 jamaat,
 alone
 };
 }, [prayerLogs, currentYear, currentMonth]);

 return (
 <div className="space-y-4 animate-fadeIn">
 {/* Month Navigation & View Toggle Header */}
 <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
 <div className="flex items-center justify-between sm:justify-start space-x-2">
 <button
 id="btn-prev-month"
 onClick={handlePrevMonth}
 className="p-1.5 bg-slate-950 border border-slate-800/80 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
 title="Muaji i mëparshëm"
 >
 <ChevronLeft className="w-4 h-4" />
 </button>

 <div className="flex items-center space-x-2">
 <CalendarIcon className="w-4 h-4 text-emerald-400" />
 <h3 className="font-bold text-sm text-slate-100 font-serif">
 {MONTH_NAMES_AL[currentMonth]} {currentYear}
 </h3>
 </div>

 <button
 id="btn-next-month"
 onClick={handleNextMonth}
 className="p-1.5 bg-slate-950 border border-slate-800/80 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
 title="Muaji i ardhshëm"
 >
 <ChevronRight className="w-4 h-4" />
 </button>

 {(currentYear !== now.getFullYear() || currentMonth !== now.getMonth()) && (
 <button
 id="btn-current-month"
 onClick={handleCurrentMonth}
 className="text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 px-2 py-1 rounded-lg hover:bg-emerald-900/60 transition-colors"
 >
 Këtë Muaj
 </button>
 )}
 </div>

 {/* View Switcher: Table vs List */}
 <div className="flex bg-slate-950 border border-slate-800/80 p-0.5 rounded-xl self-end sm:self-auto text-xs">
 <button
 id="btn-view-table"
 onClick={() => setViewType('table')}
 className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
 viewType === 'table'
 ? 'bg-slate-800 text-emerald-300 font-medium shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <TableIcon className="w-3.5 h-3.5" />
 <span>Tabelë</span>
 </button>
 <button
 id="btn-view-list"
 onClick={() => setViewType('list')}
 className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
 viewType === 'list'
 ? 'bg-slate-800 text-emerald-300 font-medium shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <List className="w-3.5 h-3.5" />
 <span>Listë</span>
 </button>
 </div>
 </div>

 {/* Neutral Summary Note */}
 <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex items-start space-x-2.5 text-slate-300 text-xs">
 <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
 <p className="leading-relaxed">
 Përmbledhja mujore tregon vetëm regjistrimet e kryera manualisht gjatë muajit. I paregjistruar nuk do të thotë i pafalur.
 </p>
 </div>

 {/* Monthly Stats Quick Overview */}
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
 <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 space-y-1">
 <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
 Regjistrime Gjithsej
 </span>
 <span className="text-base font-bold font-mono text-emerald-400 block">
 {monthStats.total}
 </span>
 </div>

 <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 space-y-1">
 <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block flex items-center gap-1">
 <MapPin className="w-3 h-3 text-emerald-400" /> Vendi
 </span>
 <div className="text-[11px] text-slate-300 space-x-2 font-mono">
 <span>Xhami: <strong className="text-emerald-400">{monthStats.mosque}</strong></span>
 <span>Shtëpi: <strong className="text-blue-400">{monthStats.home}</strong></span>
 </div>
 </div>

 <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 space-y-1 col-span-2 sm:col-span-1">
 <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block flex items-center gap-1">
 <Users className="w-3 h-3 text-blue-400" /> Mënyra
 </span>
 <div className="text-[11px] text-slate-300 space-x-2 font-mono">
 <span>Xhemat: <strong className="text-blue-400">{monthStats.jamaat}</strong></span>
 <span>Vetëm: <strong className="text-purple-400">{monthStats.alone}</strong></span>
 </div>
 </div>
 </div>

 {/* VIEW TYPE 1: TABLE */}
 {viewType === 'table' && (
 <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-mono">
 <th className="py-3 px-3.5 font-semibold text-slate-300 min-w-[100px]">Data</th>
 {FARZ_PRAYERS.map(p => (
 <th key={p.name} className="py-3 px-2.5 font-semibold text-center min-w-[90px]">
 {p.label}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-800/60 text-slate-200">
 {daysInMonth.map(dayObj => {
 const dayLogs = logsMap[dayObj.dateStr] || {};

 return (
 <tr
 key={dayObj.dateStr}
 className={`hover:bg-slate-800/40 transition-colors ${
 dayObj.isToday ? 'bg-emerald-950/20' : ''
 }`}
 >
 {/* Date Column */}
 <td className="py-2.5 px-3.5 whitespace-nowrap">
 <div className="flex items-center space-x-1.5">
 <span
 className={`font-mono font-bold text-xs ${
 dayObj.isToday ? 'text-emerald-400' : 'text-slate-200'
 }`}
 >
 {String(dayObj.day).padStart(2, '0')}
 </span>
 <span className="text-[10px] text-slate-500 uppercase">
 ({dayObj.dayOfWeekShort})
 </span>
 {dayObj.isToday && (
 <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1 py-0.2 rounded font-semibold">
 Sot
 </span>
 )}
 </div>
 </td>

 {/* Prayers Columns */}
 {FARZ_PRAYERS.map(p => {
 const log = dayLogs[p.name];

 return (
 <td key={p.name} className="py-2.5 px-2 text-center align-middle">
 {log && log.completed ? (
 <div className="flex flex-col items-center justify-center space-y-0.5">
 <div className="flex items-center space-x-1 text-emerald-400">
 <CheckCircle2 className="w-4 h-4 fill-emerald-950 text-emerald-400" />
 <span className="text-[11px] font-semibold">E kryer</span>
 </div>
 {(log.location || log.method) && (
 <div className="flex items-center gap-1 text-[9px] text-slate-400">
 {log.location === 'mosque' && <span className="text-emerald-300">Xhami</span>}
 {log.location === 'home' && <span className="text-blue-300">Shtëpi</span>}
 {log.location === 'outside' && <span className="text-amber-300">Jashtë</span>}
 {log.location && log.method && <span>•</span>}
 {log.method === 'jamaat' && <span className="text-blue-300">Xhemat</span>}
 {log.method === 'alone' && <span className="text-slate-400">Vetëm</span>}
 </div>
 )}
 </div>
 ) : (
 <span className="text-slate-600 font-mono text-sm">—</span>
 )}
 </td>
 );
 })}
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 )}

 {/* VIEW TYPE 2: DAILY LIST */}
 {viewType === 'list' && (
 <div className="space-y-2.5">
 {daysInMonth.map(dayObj => {
 const dayLogs = logsMap[dayObj.dateStr] || {};
 const completedCount = Object.keys(dayLogs).length;

 return (
 <div
 key={dayObj.dateStr}
 className={`bg-slate-900 border rounded-xl p-3.5 space-y-2 transition-all ${
 dayObj.isToday
 ? 'border-emerald-600/50 bg-slate-900/90 shadow'
 : 'border-slate-800'
 }`}
 >
 <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
 <div className="flex items-center space-x-2">
 <span className="font-mono font-bold text-xs text-slate-100">
 {String(dayObj.day).padStart(2, '0')} {MONTH_NAMES_AL[currentMonth]} {currentYear}
 </span>
 <span className="text-xs text-slate-400 font-mono">({dayObj.dayOfWeekShort})</span>
 {dayObj.isToday && (
 <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-medium">
 Sot
 </span>
 )}
 </div>
 <span className="text-[11px] font-mono text-slate-400">
 {completedCount} të regjistruara
 </span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
 {FARZ_PRAYERS.map(p => {
 const log = dayLogs[p.name];

 return (
 <div
 key={p.name}
 className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
 log && log.completed
 ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-200'
 : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
 }`}
 >
 <span className="font-medium text-slate-300">{p.label}</span>
 {log && log.completed ? (
 <div className="flex items-center space-x-1 text-emerald-400 text-[11px]">
 <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-950 text-emerald-400" />
 <span>E kryer</span>
 </div>
 ) : (
 <span className="text-slate-600 text-[11px] font-mono">—</span>
 )}
 </div>
 );
 })}
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 );
};
