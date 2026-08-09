import React, { useMemo, useState } from 'react';
import {
 ResponsiveContainer,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 Tooltip,
 Legend,
 CartesianGrid,
 AreaChart,
 Area,
 ReferenceLine
} from 'recharts';
import { QuranReadingState, QuranBookmark, QuranNote, QuranReadingSettings } from '../types';
import { BookOpen, Bookmark, FileText, Activity, CalendarCheck, Target, BarChart2, Flame } from 'lucide-react';
import { getLocalDateString } from '../utils/dateUtils';

interface QuranStatsChartProps {
 readingState: QuranReadingState;
 bookmarks: QuranBookmark[];
 notes: QuranNote[];
 readingSettings: QuranReadingSettings;
}

export const QuranStatsChart: React.FC<QuranStatsChartProps> = ({
 readingState,
 bookmarks,
 notes,
 readingSettings
}) => {
 const [chartView, setChartView] = useState<'daily' | 'weekly'>('daily');

 const dailyGoal = readingSettings.dailyAyahGoal || 0;
 const weeklyGoal = dailyGoal * 7;

 const chartData = useMemo(() => {
 const dailyProgress = readingState.dailyProgress || {};
 
 if (chartView === 'daily') {
 const daysAlbanian = ['Di', 'Hë', 'Ma', 'Më', 'En', 'Pr', 'Sh'];
 const result = [];
 for (let i = 6; i >= 0; i--) {
 const d = new Date();
 d.setDate(d.getDate() - i);
 const dateStr = getLocalDateString(d);
 const dayLabel = i === 0 ? 'Sot' : `${daysAlbanian[d.getDay()]} ${d.getDate()}`;
 const ayahsRead = dailyProgress[dateStr] || 0;
 result.push({
 dateStr,
 dayLabel,
 'Ajete të Lexuara': ayahsRead,
 });
 }
 return result;
 } else {
 // Weekly view (last 4 weeks)
 const result = [];
 for (let w = 3; w >= 0; w--) {
 let weeklyTotal = 0;
 // week 0 is last 7 days, week 1 is previous 7 days, etc.
 for (let i = 0; i < 7; i++) {
 const d = new Date();
 d.setDate(d.getDate() - (w * 7 + i));
 const dateStr = getLocalDateString(d);
 weeklyTotal += (dailyProgress[dateStr] || 0);
 }
 result.push({
 dayLabel: w === 0 ? 'Kjo Javë' : `Java -${w}`,
 'Ajete të Lexuara': weeklyTotal,
 });
 }
 return result;
 }
 }, [readingState.dailyProgress, chartView]);

 const totalAyahs = chartData.reduce((acc, c) => acc + c['Ajete të Lexuara'], 0);
 const avgAyahs = Math.round(totalAyahs / chartData.length);
 
 // Calculate today's specific metrics for the top cards
 const todayRead = useMemo(() => {
 const today = getLocalDateString();
 return (readingState.dailyProgress && readingState.dailyProgress[today]) || 0;
 }, [readingState.dailyProgress]);

 const percentageGoalToday = dailyGoal > 0 ? Math.min(100, Math.round((todayRead / dailyGoal) * 100)) : 0;

 // Calculate reading streak (consecutive days of reading > 0 ayahs)
 const readingStreak = useMemo(() => {
 const dailyProgress = readingState.dailyProgress || {};
 const d = new Date();
 let dateStr = getLocalDateString(d);
 
 let todayProgress = dailyProgress[dateStr] || 0;
 if (todayProgress === 0) {
 d.setDate(d.getDate() - 1);
 dateStr = getLocalDateString(d);
 if ((dailyProgress[dateStr] || 0) === 0) {
 return 0; // Neither today nor yesterday has progress
 }
 }
 
 let streak = 0;
 const checkDate = new Date();
 if (todayProgress === 0) {
 checkDate.setDate(checkDate.getDate() - 1);
 }

 while (true) {
 const checkStr = getLocalDateString(checkDate);
 if ((dailyProgress[checkStr] || 0) > 0) {
 streak++;
 checkDate.setDate(checkDate.getDate() - 1);
 } else {
 break;
 }
 }

 return streak;
 }, [readingState.dailyProgress]);

 return (
 <div className="space-y-6 animate-fadeIn">
 {/* Overview Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 {/* Ayahs Read Today */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
 <div className="space-y-1">
 <h4 className="text-[11px] text-slate-400 font-medium flex items-center space-x-1.5">
 <Activity className="w-3.5 h-3.5 text-emerald-400" />
 <span>Ajete Sot</span>
 </h4>
 <div className="flex items-baseline space-x-2">
 <span className="text-2xl font-mono font-bold text-slate-100">{todayRead}</span>
 {dailyGoal > 0 && (
 <span className="text-[10px] text-slate-500 font-mono">/ {dailyGoal} synimi</span>
 )}
 </div>
 {dailyGoal > 0 && (
 <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
 <div 
 className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
 style={{ width: `${percentageGoalToday}%` }} 
 />
 </div>
 )}
 </div>
 <div className="w-10 h-10 rounded-full bg-emerald-950/50 flex items-center justify-center border border-emerald-900/50">
 <Target className="w-5 h-5 text-emerald-400" />
 </div>
 </div>

 {/* Reading Streak */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
 <div className="space-y-1">
 <h4 className="text-[11px] text-slate-400 font-medium flex items-center space-x-1.5">
 <Flame className="w-3.5 h-3.5 text-orange-500" />
 <span>Zinxhiri</span>
 </h4>
 <div className="flex items-baseline space-x-2">
 <span className="text-2xl font-mono font-bold text-slate-100">{readingStreak}</span>
 <span className="text-[10px] text-slate-500 font-mono">ditë radhazi</span>
 </div>
 </div>
 <div className="w-10 h-10 rounded-full bg-orange-950/30 flex items-center justify-center border border-orange-900/50">
 <Flame className="w-5 h-5 text-orange-500" />
 </div>
 </div>

 {/* Total Bookmarks */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
 <div className="space-y-1">
 <h4 className="text-[11px] text-slate-400 font-medium flex items-center space-x-1.5">
 <Bookmark className="w-3.5 h-3.5 text-amber-400" />
 <span>Bookmarks</span>
 </h4>
 <div className="flex items-baseline space-x-2">
 <span className="text-2xl font-mono font-bold text-slate-100">{bookmarks.length}</span>
 </div>
 </div>
 <div className="w-10 h-10 rounded-full bg-amber-950/50 flex items-center justify-center border border-amber-900/50">
 <BookOpen className="w-5 h-5 text-amber-400" />
 </div>
 </div>

 {/* Total Notes */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
 <div className="space-y-1">
 <h4 className="text-[11px] text-slate-400 font-medium flex items-center space-x-1.5">
 <FileText className="w-3.5 h-3.5 text-blue-400" />
 <span>Shënime</span>
 </h4>
 <div className="flex items-baseline space-x-2">
 <span className="text-2xl font-mono font-bold text-slate-100">{notes.length}</span>
 </div>
 </div>
 <div className="w-10 h-10 rounded-full bg-blue-950/50 flex items-center justify-center border border-blue-900/50">
 <FileText className="w-5 h-5 text-blue-400" />
 </div>
 </div>
 </div>

 {/* Trend Chart */}
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div>
 <h4 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
 <BarChart2 className="w-4 h-4 text-emerald-400" />
 <span>Progresi i Leximit</span>
 </h4>
 <p className="text-[11px] text-slate-400">
 {chartView === 'daily' ? 'Numri i ajeteve të lexuara në 7 ditët e fundit' : 'Numri i ajeteve të lexuara në 4 javët e fundit'}
 </p>
 </div>
 
 <div className="flex items-center space-x-3">
 {/* Toggle Switch */}
 <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center">
 <button
 onClick={() => setChartView('daily')}
 className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
 chartView === 'daily'
 ? 'bg-emerald-600 text-slate-950 shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 7 Ditë
 </button>
 <button
 onClick={() => setChartView('weekly')}
 className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
 chartView === 'weekly'
 ? 'bg-emerald-600 text-slate-950 shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 4 Javë
 </button>
 </div>
 
 {/* Average Stat */}
 <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex flex-col items-end hidden sm:flex">
 <span className="text-[10px] text-slate-500 uppercase tracking-wider">Mesatarja</span>
 <span className="font-mono font-bold text-emerald-300 text-sm">
 {avgAyahs} {chartView === 'daily' ? 'ajete/ditë' : 'ajete/javë'}
 </span>
 </div>
 </div>
 </div>

 <div className="h-56 w-full pt-4">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
 <XAxis dataKey="dayLabel" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
 <YAxis 
 stroke="#94a3b8" 
 fontSize={11} 
 tickLine={false} 
 axisLine={false}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: '#0f172a',
 borderColor: '#334155',
 borderRadius: '12px',
 color: '#f8fafc',
 fontSize: '12px'
 }}
 itemStyle={{ color: '#34d399' }}
 formatter={(value: any) => [`${value} ajete`, 'Lexuar']}
 />
 {chartView === 'daily' && dailyGoal > 0 && (
 <ReferenceLine 
 y={dailyGoal} 
 stroke="#10b981" 
 strokeDasharray="4 4" 
 strokeWidth={1.5}
 label={{ value: 'Synimi Ditor', fill: '#10b981', fontSize: 10, position: 'insideTopLeft' }} 
 />
 )}
 {chartView === 'weekly' && weeklyGoal > 0 && (
 <ReferenceLine 
 y={weeklyGoal} 
 stroke="#10b981" 
 strokeDasharray="4 4" 
 strokeWidth={1.5}
 label={{ value: 'Synimi Javor', fill: '#10b981', fontSize: 10, position: 'insideTopLeft' }} 
 />
 )}
 <Bar 
 dataKey="Ajete të Lexuara" 
 fill="#10b981" 
 radius={[4, 4, 0, 0]} 
 maxBarSize={40}
 />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 );
};

