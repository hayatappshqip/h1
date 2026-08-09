import React from 'react';
import { FastingState, FastingStatus } from '../types';
import { Settings, CheckCircle2, Circle, Star, Calendar, RefreshCw } from 'lucide-react';

interface FastingTrackerProps {
 fastingState: FastingState;
 onUpdateFastingState: (newState: FastingState) => void;
 selectedDate: string;
}

export const FastingTracker: React.FC<FastingTrackerProps> = ({ fastingState, onUpdateFastingState, selectedDate }) => {
 const [showSettings, setShowSettings] = React.useState(false);

 const { preferences, logs } = fastingState;

 if (!preferences.enabled && !showSettings) {
 return (
 <div className="flex justify-end mb-4">
 <button onClick={() => setShowSettings(true)} className="text-xs text-slate-500 hover:text-emerald-400 flex items-center space-x-1">
 <Settings className="w-3.5 h-3.5" />
 <span>Gjurmuesi i Agjërimit</span>
 </button>
 </div>
 );
 }

 // Calculate if the selected date is a recommended fasting day
 const dateObj = new Date(selectedDate);
 const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 1 is Monday, 4 is Thursday

 const isMonday = dayOfWeek === 1;
 const isThursday = dayOfWeek === 4;

 // Extremely basic white days approximation using Hijri calendar
 // 13, 14, 15 of Islamic month
 let isWhiteDay = false;
 let hijriDay = 0;
 try {
 const hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic', { day: 'numeric' });
 const hijriDayStr = hijriFormatter.format(dateObj);
 hijriDay = parseInt(hijriDayStr, 10);
 if (hijriDay === 13 || hijriDay === 14 || hijriDay === 15) {
 isWhiteDay = true;
 }
 } catch (e) {
 // Fallback if not supported
 }

 let recommendationMessage = '';
 if (isMonday && preferences.trackMondays) recommendationMessage = 'Sunet: E Hënë';
 else if (isThursday && preferences.trackThursdays) recommendationMessage = 'Sunet: E Enjte';
 else if (isWhiteDay && preferences.trackWhiteDays) recommendationMessage = `Ditët e Bardha (Dita ${hijriDay})`;

 const status = logs[selectedDate] || 'none';

 const handleUpdateStatus = (newStatus: FastingStatus) => {
 const updatedLogs = { ...logs, [selectedDate]: newStatus };
 if (newStatus === 'none') {
 delete updatedLogs[selectedDate];
 }
 onUpdateFastingState({ ...fastingState, logs: updatedLogs });
 };

 const togglePreferences = (key: keyof typeof preferences) => {
 onUpdateFastingState({
 ...fastingState,
 preferences: { ...preferences, [key]: !preferences[key] }
 });
 };

 return (
 <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 mb-6 space-y-4">
 <div className="flex items-center justify-between">
 <h3 className="font-bold text-sm text-emerald-300 flex items-center space-x-2">
 <Star className="w-4 h-4 text-emerald-400" />
 <span>Gjurmuesi i Agjërimit</span>
 </h3>
 <button onClick={() => setShowSettings(!showSettings)} className="text-slate-500 hover:text-emerald-400">
 <Settings className="w-4 h-4" />
 </button>
 </div>

 {showSettings ? (
 <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/60 space-y-3">
 <label className="flex items-center justify-between">
 <span className="text-xs text-slate-300">Aktivizo Gjurmuesin</span>
 <input type="checkbox" checked={preferences.enabled} onChange={() => togglePreferences('enabled')} className="accent-emerald-500" />
 </label>
 {preferences.enabled && (
 <>
 <label className="flex items-center justify-between">
 <span className="text-xs text-slate-400">Rikujto të Hënat</span>
 <input type="checkbox" checked={preferences.trackMondays} onChange={() => togglePreferences('trackMondays')} className="accent-emerald-500" />
 </label>
 <label className="flex items-center justify-between">
 <span className="text-xs text-slate-400">Rikujto të Enjtet</span>
 <input type="checkbox" checked={preferences.trackThursdays} onChange={() => togglePreferences('trackThursdays')} className="accent-emerald-500" />
 </label>
 <label className="flex items-center justify-between">
 <span className="text-xs text-slate-400">Rikujto Ditët e Bardha</span>
 <input type="checkbox" checked={preferences.trackWhiteDays} onChange={() => togglePreferences('trackWhiteDays')} className="accent-emerald-500" />
 </label>
 </>
 )}
 </div>
 ) : (
 <div className="space-y-3">
 {recommendationMessage ? (
 <div className="flex items-center space-x-2 bg-emerald-950/40 border border-emerald-900/40 px-3 py-2 rounded-lg">
 <Calendar className="w-4 h-4 text-emerald-400" />
 <span className="text-xs text-emerald-200">Ditë e rekomanduar: <strong>{recommendationMessage}</strong></span>
 </div>
 ) : (
 <div className="text-xs text-slate-400 italic px-1">Nuk ka agjërim të theksuar sunet për sot.</div>
 )}

 <div className="flex items-center space-x-2">
 <button
 onClick={() => handleUpdateStatus('completed')}
 className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-medium border transition-colors ${
 status === 'completed' 
 ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300' 
 : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
 }`}
 >
 {status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
 <span>Agjërova</span>
 </button>
 <button
 onClick={() => handleUpdateStatus('missed')}
 className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-medium border transition-colors ${
 status === 'missed' 
 ? 'bg-amber-900/60 border-amber-500/50 text-amber-300' 
 : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
 }`}
 >
 <Circle className="w-4 h-4" />
 <span>Nuk Agjërova</span>
 </button>
 {status !== 'none' && (
 <button onClick={() => handleUpdateStatus('none')} className="p-2 text-slate-500 hover:text-slate-300">
 <RefreshCw className="w-4 h-4" />
 </button>
 )}
 </div>
 </div>
 )}
 </div>
 );
};
