/**
 * DitaImeView Component - Menaxheri i Detyrave dhe Agjendës Ditore
 * Features: Prayer-aware conflict detection, Categories, Priority, Recurrence
 */
import React, { useState } from 'react';
import { DayItem, DayItemCategory, PrayerTimes, FastingState } from '../types';
import { timeToMinutes } from '../services/prayerEngine';
import { Calendar, Plus, CheckCircle2, Circle, AlertTriangle, Clock, Trash2, Filter, Tag, Star, Flame, Bell } from 'lucide-react';
import { FastingTracker } from './FastingTracker';
import { getLocalDateString } from '../utils/dateUtils';

interface DitaImeViewProps {
 dayItems: DayItem[];
 prayerTimes: PrayerTimes | null;
 fastingState?: FastingState;
 onUpdateFastingState?: (newState: FastingState) => void;
 onAddDayItem: (item: Omit<DayItem, 'id' | 'createdAt'>) => void;
 onToggleDayItem: (id: string) => void;
 onTogglePriorityDayItem?: (id: string) => void;
 onDeleteDayItem: (id: string) => void;
}

export const DitaImeView: React.FC<DitaImeViewProps> = ({
 dayItems,
 prayerTimes,
 fastingState,
 onUpdateFastingState,
 onAddDayItem,
 onToggleDayItem,
 onTogglePriorityDayItem,
 onDeleteDayItem
}) => {
 const [activeSubTab, setActiveSubTab] = useState<'agenda' | 'fasting' | 'reminders'>('agenda');
 const [selectedDate, setSelectedDate] = useState<string>(
 getLocalDateString()
 );
 const [selectedCategory, setSelectedCategory] = useState<DayItemCategory | 'all' | 'priority'>('all');
 const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

 // New task form state
 const [newTitle, setNewTitle] = useState('');
 const [newCategory, setNewCategory] = useState<DayItemCategory>('personal');
 const [newStartTime, setNewStartTime] = useState('14:00');
 const [newEndTime, setNewEndTime] = useState('15:00');
 const [newNotes, setNewNotes] = useState('');
 const [newRecurring, setNewRecurring] = useState<'none' | 'daily' | 'weekly'>('none');
 const [newIsHighPriority, setNewIsHighPriority] = useState<boolean>(false);

 const filteredItems = dayItems
 .filter(item => {
 const matchesDate = item.date === selectedDate;
 if (!matchesDate) return false;
 if (selectedCategory === 'priority') return !!item.isHighPriority;
 if (selectedCategory !== 'all') return item.category === selectedCategory;
 return true;
 })
 .sort((a, b) => {
 // Uncompleted items first
 if (a.completed !== b.completed) return a.completed ? 1 : -1;
 // High priority items first
 if (a.isHighPriority !== b.isHighPriority) return a.isHighPriority ? -1 : 1;
 // Sort by start time
 return a.startTime.localeCompare(b.startTime);
 });

 // Prayer Conflict Detector
 const checkPrayerConflict = (startTime: string, endTime: string): string | null => {
 if (!prayerTimes) return null;
 const taskStart = timeToMinutes(startTime);
 const taskEnd = timeToMinutes(endTime);

 const prayers: { name: string; timeStr: string }[] = [
 { name: 'Sabahut', timeStr: prayerTimes.fajr },
 { name: 'Drekës', timeStr: prayerTimes.dhuhr },
 { name: 'Ikindisë', timeStr: prayerTimes.asr },
 { name: 'Akshamit', timeStr: prayerTimes.maghrib },
 { name: 'Jacisë', timeStr: prayerTimes.isha }
 ];

 for (const p of prayers) {
 const pTime = timeToMinutes(p.timeStr);
 if (taskStart <= pTime + 15 && taskEnd >= pTime - 5) {
 return `Përplaset me Namazin e ${p.name} (${p.timeStr})`;
 }
 }
 return null;
 };

 const categoryBadge: { [key in DayItemCategory]: { label: string; bg: string } } = {
 family: { label: 'Familje', bg: 'bg-rose-950 text-rose-300 border-rose-800' },
 work: { label: 'Punë', bg: 'bg-blue-950 text-blue-300 border-blue-800' },
 school: { label: 'Shkollë/Mësime', bg: 'bg-amber-950 text-amber-300 border-amber-800' },
 personal: { label: 'Personale', bg: 'bg-emerald-950 text-emerald-300 border-emerald-800' }
 };

 return (
 <div className="space-y-5 pb-28 animate-fadeIn">
 {/* Subtab Switcher (Agjenda / Agjërimi / Kujtesat) */}
 <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
 <button
 onClick={() => setActiveSubTab('agenda')}
 className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
 activeSubTab === 'agenda'
 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <Calendar className="w-3.5 h-3.5" />
 <span>Detyrat & Agjenda</span>
 </button>
 <button
 onClick={() => setActiveSubTab('fasting')}
 className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
 activeSubTab === 'fasting'
 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <Flame className="w-3.5 h-3.5" />
 <span>Agjërimi</span>
 </button>
 <button
 onClick={() => setActiveSubTab('reminders')}
 className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
 activeSubTab === 'reminders'
 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold shadow'
 : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <Bell className="w-3.5 h-3.5" />
 <span>Kujtesat</span>
 </button>
 </div>

 {activeSubTab === 'agenda' ? (
 <>
 {/* Date Header & Create Button */}
 <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
 <div className="flex items-center space-x-3">
 <Calendar className="w-5 h-5 text-emerald-400" />
 <input
 type="date"
 value={selectedDate}
 onChange={e => setSelectedDate(e.target.value)}
 className="bg-slate-950 border border-slate-800 text-slate-100 rounded-lg px-2.5 py-1 text-xs font-mono font-bold focus:outline-none"
 />
 </div>

 <button
 id="btn-open-new-task-modal"
 onClick={() => {
 setNewIsHighPriority(false);
 setIsModalOpen(true);
 }}
 className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center space-x-1 shadow transition-all"
 >
 <Plus className="w-4 h-4" />
 <span>Shto Detyrë</span>
 </button>
 </div>

 {/* Category & Priority Filter Pills */}
 <div className="flex space-x-2 overflow-x-auto pb-1 items-center">
 <button
 onClick={() => setSelectedCategory('all')}
 className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
 selectedCategory === 'all'
 ? 'bg-slate-800 text-white border-slate-700'
 : 'bg-slate-900 text-slate-400 border-slate-800'
 }`}
 >
 Të Gjitha
 </button>

 <button
 id="filter-priority"
 onClick={() => setSelectedCategory('priority')}
 className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center space-x-1.5 whitespace-nowrap ${
 selectedCategory === 'priority'
 ? 'bg-amber-950 text-amber-300 border-amber-600 font-bold shadow-sm'
 : 'bg-slate-900 text-amber-400/90 border-slate-800 hover:border-amber-800/60'
 }`}
 >
 <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
 <span>Prioritet i Lartë</span>
 </button>

 {(['personal', 'family', 'work', 'school'] as DayItemCategory[]).map(cat => (
 <button
 key={cat}
 onClick={() => setSelectedCategory(cat)}
 className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
 selectedCategory === cat
 ? categoryBadge[cat].bg
 : 'bg-slate-900 text-slate-400 border-slate-800'
 }`}
 >
 {categoryBadge[cat].label}
 </button>
 ))}
 </div>

 {/* Task List */}
 <div className="space-y-2.5">
 {filteredItems.length === 0 ? (
 <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
 {selectedCategory === 'priority'
 ? 'Nuk ka detyra me prioritet të lartë për këtë datë.'
 : 'Nuk ka detyra të regjistruara për këtë datë. Shtoni një të re duke klikuar "Shto Detyrë".'}
 </div>
 ) : (
 filteredItems.map(item => {
 const conflictWarning = checkPrayerConflict(item.startTime, item.endTime);

 return (
 <div
 key={item.id}
 id={`task-item-${item.id}`}
 className={`p-4 rounded-xl border transition-all relative overflow-hidden ${
 item.completed
 ? 'bg-emerald-950/15 border-emerald-900/30 text-slate-400'
 : item.isHighPriority
 ? 'bg-slate-900/90 border-amber-500/50 border-l-4 border-l-amber-500 text-slate-100 shadow-md'
 : 'bg-slate-900 border-slate-800 text-slate-100'
 }`}
 >
 <div className="flex items-start justify-between">
 <div className="flex items-start space-x-3 pr-2">
 <button
 onClick={() => onToggleDayItem(item.id)}
 className="mt-0.5 text-emerald-400 hover:scale-110 transition-transform flex-shrink-0"
 >
 {item.completed ? (
 <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-950" />
 ) : (
 <Circle className="w-5 h-5 text-slate-500" />
 )}
 </button>

 <div className="space-y-1.5">
 <div className="flex flex-wrap items-center gap-2">
 <h4 className={`font-semibold text-sm ${item.completed ? 'line-through text-slate-400' : ''}`}>
 {item.title}
 </h4>

 {/* High Priority Badge */}
 {item.isHighPriority && (
 <span className="inline-flex items-center space-x-1 text-[10px] font-bold bg-amber-950/90 border border-amber-500/60 text-amber-300 px-2 py-0.5 rounded-full shadow-sm">
 <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
 <span>Prioritet i Lartë</span>
 </span>
 )}
 </div>

 <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
 <div className="flex items-center space-x-1">
 <Clock className="w-3.5 h-3.5" />
 <span className="font-mono">{item.startTime} - {item.endTime}</span>
 </div>
 <span className={`text-[10px] px-2 py-0.5 rounded border ${categoryBadge[item.category].bg}`}>
 {categoryBadge[item.category].label}
 </span>
 </div>

 {item.notes && (
 <p className="text-xs text-slate-400 italic pt-0.5">{item.notes}</p>
 )}

 {/* Prayer Conflict Warning */}
 {conflictWarning && !item.completed && (
 <div className="flex items-center space-x-1.5 text-[11px] text-amber-300 bg-amber-950/60 border border-amber-800/50 px-2.5 py-1 rounded-lg mt-2">
 <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
 <span>{conflictWarning}</span>
 </div>
 )}
 </div>
 </div>

 <div className="flex items-center space-x-1 flex-shrink-0">
 {/* Priority Toggle Button */}
 {onTogglePriorityDayItem && (
 <button
 id={`btn-toggle-priority-${item.id}`}
 onClick={() => onTogglePriorityDayItem(item.id)}
 title={item.isHighPriority ? 'Hiq prioritetin e lartë' : 'Shëno si Prioritet i Lartë'}
 className={`p-1.5 rounded-lg transition-colors ${
 item.isHighPriority
 ? 'text-amber-400 bg-amber-950/80 border border-amber-800/60'
 : 'text-slate-500 hover:text-amber-400 hover:bg-slate-800'
 }`}
 >
 <Star className={`w-4 h-4 ${item.isHighPriority ? 'fill-amber-400' : ''}`} />
 </button>
 )}

 {/* Delete Task Button */}
 <button
 onClick={() => onDeleteDayItem(item.id)}
 className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
 title="Fshij detyrën"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 </div>
 );
 })
 )}
 </div>
 </>
 ) : activeSubTab === 'fasting' ? (
 <div className="space-y-4">
 {fastingState && onUpdateFastingState ? (
 <FastingTracker
 fastingState={fastingState}
 onUpdateFastingState={onUpdateFastingState}
 selectedDate={selectedDate}
 />
 ) : (
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
 Menaxheri i agjërimit nuk është i disponueshëm për momentin.
 </div>
 )}
 </div>
 ) : (
 /* Reminders & Notifications Subtab */
 <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-slate-100">
 <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
 <Bell className="w-5 h-5 text-emerald-400" />
 <h3 className="font-bold text-sm">Kujtesat & Njoftimet e Agjendës</h3>
 </div>

 <p className="text-xs text-slate-300 leading-relaxed">
 Marrja e kujtesave automatike për detyrat ditore dhe paralajmërimet e përplasjes me oraret e namazit.
 </p>

 <div className="space-y-3 pt-2">
 <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
 <div>
 <p className="text-xs font-semibold text-slate-200">Kujtesat e Përplasjes me Namazet</p>
 <p className="text-[11px] text-slate-400">Tregon paralajmërim nëse një detyrë hyn në orarin e namazit</p>
 </div>
 <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
 Aktiv
 </span>
 </div>

 <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
 <div>
 <p className="text-xs font-semibold text-slate-200">Detyrat me Prioritet të Lartë</p>
 <p className="text-[11px] text-slate-400">Nxjerr në pah detyrat e shënuara me flamur/yll prioriteti</p>
 </div>
 <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
 Aktiv
 </span>
 </div>
 </div>
 </div>
 )}

 {/* New Task Modal */}
 {isModalOpen && (
 <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
 <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 text-slate-100 shadow-2xl animate-scaleUp">
 <div className="flex items-center justify-between border-b border-slate-800 pb-3">
 <h3 className="font-bold text-base font-serif text-emerald-300">Detyrë e Re në Agjendë</h3>
 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
 </div>

 <div className="space-y-3">
 <div>
 <label className="text-xs text-slate-400 block mb-1">Titulli i Detyrës</label>
 <input
 type="text"
 placeholder="p.sh. Takim pune ose Mësim Kuran"
 value={newTitle}
 onChange={e => setNewTitle(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-600 outline-none"
 />
 </div>

 {/* Priority Toggle Option */}
 <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/80">
 <div className="flex items-center space-x-2.5">
 <div className={`p-1.5 rounded-lg ${newIsHighPriority ? 'bg-amber-950 text-amber-400 border border-amber-800/60' : 'bg-slate-900 text-slate-500'}`}>
 <Flame className={`w-4 h-4 ${newIsHighPriority ? 'fill-amber-400' : ''}`} />
 </div>
 <div>
 <h4 className="text-xs font-semibold text-slate-200">Prioritet i Lartë</h4>
 <p className="text-[10px] text-slate-400">Shëno si shumë të rëndësishme</p>
 </div>
 </div>
 <button
 type="button"
 id="toggle-new-high-priority"
 onClick={() => setNewIsHighPriority(!newIsHighPriority)}
 className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
 newIsHighPriority ? 'bg-amber-500 justify-end' : 'bg-slate-800 justify-start'
 }`}
 >
 <div className="w-4 h-4 rounded-full bg-slate-950 shadow" />
 </button>
 </div>

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-xs text-slate-400 block mb-1">Kategoria</label>
 <select
 value={newCategory}
 onChange={e => setNewCategory(e.target.value as DayItemCategory)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-100"
 >
 <option value="personal">Personale</option>
 <option value="family">Familje</option>
 <option value="work">Punë</option>
 <option value="school">Shkollë</option>
 </select>
 </div>

 <div>
 <label className="text-xs text-slate-400 block mb-1">Përsëritja</label>
 <select
 value={newRecurring}
 onChange={e => setNewRecurring(e.target.value as any)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-100"
 >
 <option value="none">Jo përsëritëse</option>
 <option value="daily">Çdo ditë</option>
 <option value="weekly">Çdo javë</option>
 </select>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2">
 <div>
 <label className="text-xs text-slate-400 block mb-1">Ora e Fillimit</label>
 <input
 type="time"
 value={newStartTime}
 onChange={e => setNewStartTime(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
 />
 </div>
 <div>
 <label className="text-xs text-slate-400 block mb-1">Ora e Përfundimit</label>
 <input
 type="time"
 value={newEndTime}
 onChange={e => setNewEndTime(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
 />
 </div>
 </div>

 <div>
 <label className="text-xs text-slate-400 block mb-1">Shënime Shtesë (opsionale)</label>
 <textarea
 placeholder="Detaje ose përkujtues..."
 value={newNotes}
 onChange={e => setNewNotes(e.target.value)}
 className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 h-16 outline-none"
 ></textarea>
 </div>
 </div>

 <div className="flex space-x-2 pt-2">
 <button
 onClick={() => setIsModalOpen(false)}
 className="flex-1 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-medium"
 >
 Anulo
 </button>
 <button
 id="btn-save-new-task"
 onClick={() => {
 if (!newTitle.trim()) return;
 onAddDayItem({
 title: newTitle.trim(),
 date: selectedDate,
 startTime: newStartTime,
 endTime: newEndTime,
 category: newCategory,
 notes: newNotes.trim(),
 completed: false,
 recurring: newRecurring,
 isHighPriority: newIsHighPriority
 });
 setIsModalOpen(false);
 setNewTitle('');
 setNewNotes('');
 setNewIsHighPriority(false);
 }}
 className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-xl text-xs shadow"
 >
 Ruaj Detyrën
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
};
