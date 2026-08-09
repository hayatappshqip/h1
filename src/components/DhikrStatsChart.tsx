/**
 * DhikrStatsChart Component - Registration Statistics & Dhikr Overview
 * Non-gamified, neutral design focused purely on user manual logs.
 */
import React, { useMemo, useState } from 'react';
import {
 ResponsiveContainer,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 Tooltip,
 Cell,
 PieChart,
 Pie
} from 'recharts';
import { PostPrayerDhikrSession, PrayerLog, MburojaState } from '../types';
import { Info, MapPin, Users, Sparkles, Filter, Calendar } from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';

interface DhikrStatsChartProps {
 postPrayerDhikrSessions: PostPrayerDhikrSession[];
 prayerLogs: PrayerLog[];
 mburojaState: MburojaState;
}

const PIE_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'];

export const DhikrStatsChart: React.FC<DhikrStatsChartProps> = ({
 postPrayerDhikrSessions,
 prayerLogs,
 mburojaState
}) => {
 const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('week');
 const todayStr = getLocalDateString();

 // Filtered prayer logs based on timeFilter
 const filteredPrayerLogs = useMemo(() => {
 // Only completed manual logs
 const completedLogs = prayerLogs.filter(l => l.completed);

 if (timeFilter === 'all') return completedLogs;

 const now = new Date();
 const cutoffDate = new Date();
 if (timeFilter === 'week') {
 cutoffDate.setDate(now.getDate() - 7);
 } else if (timeFilter === 'month') {
 cutoffDate.setDate(now.getDate() - 30);
 }

 const cutoffStr = getLocalDateString(cutoffDate);
 return completedLogs.filter(l => l.date >= cutoffStr);
 }, [prayerLogs, timeFilter]);

 // Calculate location stats
 const locationStats = useMemo(() => {
 let mosque = 0;
 let home = 0;
 let outside = 0;
 let unspecified = 0;

 filteredPrayerLogs.forEach(log => {
 if (log.location === 'mosque') mosque++;
 else if (log.location === 'home') home++;
 else if (log.location === 'outside') outside++;
 else unspecified++;
 });

 const totalWithLocation = mosque + home + outside;

 return {
 mosque,
 home,
 outside,
 unspecified,
 totalLogs: filteredPrayerLogs.length,
 mosquePct: totalWithLocation > 0 ? Math.round((mosque / totalWithLocation) * 100) : 0,
 homePct: totalWithLocation > 0 ? Math.round((home / totalWithLocation) * 100) : 0,
 outsidePct: totalWithLocation > 0 ? Math.round((outside / totalWithLocation) * 100) : 0
 };
 }, [filteredPrayerLogs]);

 // Calculate method stats
 const methodStats = useMemo(() => {
 let jamaat = 0;
 let alone = 0;
 let unspecified = 0;

 filteredPrayerLogs.forEach(log => {
 if (log.method === 'jamaat') jamaat++;
 else if (log.method === 'alone') alone++;
 else unspecified++;
 });

 const totalWithMethod = jamaat + alone;

 return {
 jamaat,
 alone,
 unspecified,
 totalLogs: filteredPrayerLogs.length,
 jamaatPct: totalWithMethod > 0 ? Math.round((jamaat / totalWithMethod) * 100) : 0,
 alonePct: totalWithMethod > 0 ? Math.round((alone / totalWithMethod) * 100) : 0
 };
 }, [filteredPrayerLogs]);

 // 7 Days Dhikr Data for chart
 const last7DaysDhikrData = useMemo(() => {
 const daysAlbanian = ['Di', 'Hë', 'Ma', 'Më', 'En', 'Pr', 'Sh'];
 const result = [];

 for (let i = 6; i >= 0; i--) {
 const d = new Date();
 d.setDate(d.getDate() - i);
 const dateStr = getLocalDateString(d);
 const dayLabel = i === 0 ? 'Sot' : `${daysAlbanian[d.getDay()]} ${d.getDate()}`;

 // Sum post prayer dhikrs for dateStr
 const daySessions = postPrayerDhikrSessions.filter(s => s.date === dateStr);
 let postPrayerCount = 0;
 daySessions.forEach(s => {
 if (s.items) {
 Object.values(s.items).forEach(val => {
 postPrayerCount += typeof val === 'number' ? val : 0;
 });
 }
 });

 // Sum Mburoja daily counts for dateStr
 const mburojaCounts = mburojaState.dailyCountsByDate?.[dateStr] || {};
 let mburojaCount = 0;
 Object.values(mburojaCounts).forEach(val => {
 mburojaCount += typeof val === 'number' ? val : 0;
 });

 result.push({
 dateStr,
 dayLabel,
 'Dhikri pas Namazit': postPrayerCount,
 'Dhikri i Përditshëm': mburojaCount,
 'Gjithsej': postPrayerCount + mburojaCount
 });
 }

 return result;
 }, [postPrayerDhikrSessions, mburojaState]);

 // Today's Dhikr Breakdown by Category
 const todayBreakdownData = useMemo(() => {
 let subhanallah = 0;
 let alhamdulillah = 0;
 let allahuakbar = 0;
 let tjerat = 0;

 const todaySessions = postPrayerDhikrSessions.filter(s => s.date === todayStr);
 todaySessions.forEach(s => {
 if (s.items) {
 subhanallah += s.items.subhanallah || 0;
 alhamdulillah += s.items.alhamdulillah || 0;
 allahuakbar += s.items.allahuakbar || 0;
 Object.keys(s.items).forEach(k => {
 if (!['subhanallah', 'alhamdulillah', 'allahuakbar'].includes(k)) {
 tjerat += s.items[k] || 0;
 }
 });
 }
 });

 // Add Mburoja counts for today
 const mburojaToday = mburojaState.dailyCountsByDate?.[todayStr] || {};
 Object.values(mburojaToday).forEach(val => {
 tjerat += typeof val === 'number' ? val : 0;
 });

 const list = [
 { name: 'Subḥãnallãh', value: subhanallah },
 { name: 'El-ḥamdu lillãh', value: alhamdulillah },
 { name: 'Allãhu Ekber', value: allahuakbar },
 { name: 'Të Tjera', value: tjerat }
 ].filter(item => item.value > 0);

 return list.length > 0
 ? list
 : [
 { name: 'Subḥãnallãh', value: 33 },
 { name: 'El-ḥamdu lillãh', value: 33 },
 { name: 'Allãhu Ekber', value: 33 }
 ];
 }, [postPrayerDhikrSessions, mburojaState, todayStr]);

 const totalDhikrRecorded = useMemo(() => {
 let total = 0;
 postPrayerDhikrSessions.forEach(s => {
 if (s.items) {
 Object.values(s.items).forEach(v => {
 total += typeof v === 'number' ? v : 0;
 });
 }
 });
 return total;
 }, [postPrayerDhikrSessions]);

 return (
 <div className="space-y-5 animate-fadeIn">
 {/* Explicit Neutral Disclaimer Card */}
 <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-start space-x-3 shadow-sm text-slate-200">
 <div className="p-2 bg-slate-800 rounded-xl text-slate-300 mt-0.5 flex-shrink-0">
 <Info className="w-4 h-4 text-slate-300" />
 </div>
 <div className="space-y-1">
 <h4 className="font-semibold text-xs text-slate-100 uppercase tracking-wider">
 Njoftim me rëndësi
 </h4>
 <p className="text-xs text-slate-300 leading-relaxed font-sans">
 Statistikat bazohen vetëm në regjistrimet manuale në Hayat. I paregjistruar nuk do të thotë i pafalur.
 </p>
 </div>
 </div>

 {/* Time Filter Tabs */}
 <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800/80 p-1.5 rounded-xl">
 <div className="flex items-center space-x-1.5 px-2 text-slate-400 text-xs font-medium">
 <Filter className="w-3.5 h-3.5" />
 <span>Periudha:</span>
 </div>
 <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800/60 text-xs">
 <button
 id="filter-week"
 onClick={() => setTimeFilter('week')}
 className={`px-3 py-1 rounded-md transition-colors ${
 timeFilter === 'week'
 ? 'bg-slate-800 text-emerald-300 font-medium shadow-sm'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 Këtë Javë
 </button>
 <button
 id="filter-month"
 onClick={() => setTimeFilter('month')}
 className={`px-3 py-1 rounded-md transition-colors ${
 timeFilter === 'month'
 ? 'bg-slate-800 text-emerald-300 font-medium shadow-sm'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 Këtë Muaj
 </button>
 <button
 id="filter-all"
 onClick={() => setTimeFilter('all')}
 className={`px-3 py-1 rounded-md transition-colors ${
 timeFilter === 'all'
 ? 'bg-slate-800 text-emerald-300 font-medium shadow-sm'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 Gjithsej
 </button>
 </div>
 </div>

 {/* Main Registration Statistics Section */}
 <div className="space-y-4">
 <div className="flex items-center justify-between px-1">
 <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
 <Calendar className="w-4.5 h-4.5 text-emerald-400" />
 <span>Statistikat e Regjistrimeve</span>
 </h3>
 <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full">
 {filteredPrayerLogs.length} regjistrime gjithsej
 </span>
 </div>

 {/* Location (Vendi) & Method (Mënyra) Breakdown Cards */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Vendi i Regjistrimeve */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
 <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
 <div className="flex items-center space-x-2 text-emerald-400">
 <MapPin className="w-4 h-4" />
 <h4 className="font-bold text-xs uppercase tracking-wider text-slate-100">Vendi i Namazeve</h4>
 </div>
 <span className="text-[11px] text-slate-400 font-mono">
 {locationStats.totalLogs} të regjistruara
 </span>
 </div>

 <div className="space-y-2.5 pt-1">
 {/* Në xhami */}
 <div className="space-y-1">
 <div className="flex justify-between text-xs text-slate-200">
 <span className="font-medium">Në xhami</span>
 <span className="font-mono text-emerald-400 font-bold">
 {locationStats.mosque} <span className="text-[10px] text-slate-400 font-normal">({locationStats.mosquePct}%)</span>
 </span>
 </div>
 <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
 <div
 className="h-full bg-emerald-500 rounded-full transition-all duration-500"
 style={{ width: `${locationStats.mosquePct}%` }}
 />
 </div>
 </div>

 {/* Në shtëpi */}
 <div className="space-y-1">
 <div className="flex justify-between text-xs text-slate-200">
 <span className="font-medium">Në shtëpi</span>
 <span className="font-mono text-blue-400 font-bold">
 {locationStats.home} <span className="text-[10px] text-slate-400 font-normal">({locationStats.homePct}%)</span>
 </span>
 </div>
 <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
 <div
 className="h-full bg-blue-500 rounded-full transition-all duration-500"
 style={{ width: `${locationStats.homePct}%` }}
 />
 </div>
 </div>

 {/* Në një vend tjetër */}
 <div className="space-y-1">
 <div className="flex justify-between text-xs text-slate-200">
 <span className="font-medium">Në një vend tjetër</span>
 <span className="font-mono text-amber-400 font-bold">
 {locationStats.outside} <span className="text-[10px] text-slate-400 font-normal">({locationStats.outsidePct}%)</span>
 </span>
 </div>
 <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
 <div
 className="h-full bg-amber-500 rounded-full transition-all duration-500"
 style={{ width: `${locationStats.outsidePct}%` }}
 />
 </div>
 </div>

 {locationStats.unspecified > 0 && (
 <p className="text-[10px] text-slate-500 pt-1">
 * {locationStats.unspecified} regjistrime pa specifikuar vendin.
 </p>
 )}
 </div>
 </div>

 {/* Mënyra e Regjistrimeve */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
 <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
 <div className="flex items-center space-x-2 text-blue-400">
 <Users className="w-4 h-4" />
 <h4 className="font-bold text-xs uppercase tracking-wider text-slate-100">Mënyra e Namazeve</h4>
 </div>
 <span className="text-[11px] text-slate-400 font-mono">
 {methodStats.totalLogs} të regjistruara
 </span>
 </div>

 <div className="space-y-2.5 pt-1">
 {/* Me xhemat */}
 <div className="space-y-1">
 <div className="flex justify-between text-xs text-slate-200">
 <span className="font-medium">Me xhemat</span>
 <span className="font-mono text-blue-400 font-bold">
 {methodStats.jamaat} <span className="text-[10px] text-slate-400 font-normal">({methodStats.jamaatPct}%)</span>
 </span>
 </div>
 <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
 <div
 className="h-full bg-blue-500 rounded-full transition-all duration-500"
 style={{ width: `${methodStats.jamaatPct}%` }}
 />
 </div>
 </div>

 {/* Vetëm */}
 <div className="space-y-1">
 <div className="flex justify-between text-xs text-slate-200">
 <span className="font-medium">Vetëm</span>
 <span className="font-mono text-purple-400 font-bold">
 {methodStats.alone} <span className="text-[10px] text-slate-400 font-normal">({methodStats.alonePct}%)</span>
 </span>
 </div>
 <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
 <div
 className="h-full bg-purple-500 rounded-full transition-all duration-500"
 style={{ width: `${methodStats.alonePct}%` }}
 />
 </div>
 </div>

 {methodStats.unspecified > 0 && (
 <p className="text-[10px] text-slate-500 pt-1">
 * {methodStats.unspecified} regjistrime pa specifikuar mënyrën.
 </p>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Recorded Dhikr Section */}
 <div className="space-y-4 pt-2">
 <div className="flex items-center justify-between px-1">
 <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
 <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
 <span>Përmbledhja e Dhikrit</span>
 </h3>
 <span className="text-xs font-mono text-slate-400">
 {totalDhikrRecorded} dhikre pas namazeve
 </span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* Bar Chart: Past 7 Days Dhikr */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
 <div>
 <h4 className="font-bold text-xs text-slate-100 uppercase tracking-wider">Dhikri i 7 Ditëve të Fundit</h4>
 <p className="text-[11px] text-slate-400">Përmbledhje ditore e thënieve të regjistruara</p>
 </div>

 <div className="h-44 w-full pt-1">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={last7DaysDhikrData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <XAxis dataKey="dayLabel" stroke="#94a3b8" fontSize={11} tickLine={false} />
 <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
 <Tooltip
 contentStyle={{
 backgroundColor: '#0f172a',
 borderColor: '#334155',
 borderRadius: '12px',
 color: '#f8fafc',
 fontSize: '11px'
 }}
 />
 <Bar dataKey="Dhikri pas Namazit" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
 <Bar dataKey="Dhikri i Përditshëm" fill="#3b82f6" radius={[4, 4, 0, 0]} stackId="a" />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Pie Chart: Today Breakdown */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-2">
 <div>
 <h4 className="font-bold text-xs text-slate-100 uppercase tracking-wider">Llojet e Dhikrit Sot</h4>
 <p className="text-[11px] text-slate-400">Shpërndarja e thënieve</p>
 </div>

 <div className="h-36 w-full flex items-center justify-center">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={todayBreakdownData}
 cx="50%"
 cy="50%"
 innerRadius={30}
 outerRadius={55}
 paddingAngle={4}
 dataKey="value"
 >
 {todayBreakdownData.map((_, index) => (
 <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
 ))}
 </Pie>
 <Tooltip
 contentStyle={{
 backgroundColor: '#0f172a',
 borderColor: '#334155',
 borderRadius: '12px',
 color: '#f8fafc',
 fontSize: '11px'
 }}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>

 <div className="grid grid-cols-2 gap-1.5 pt-1">
 {todayBreakdownData.map((item, idx) => (
 <div key={item.name} className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/60 px-2 py-1 rounded-lg border border-slate-800/50">
 <div className="flex items-center space-x-1.5 truncate">
 <span
 className="w-2 h-2 rounded-full inline-block flex-shrink-0"
 style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
 />
 <span className="truncate">{item.name}</span>
 </div>
 <span className="font-mono font-bold text-emerald-400 pl-1">{item.value}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>
 );
};
