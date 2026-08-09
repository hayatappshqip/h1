import React, { useState } from 'react';
import { MUTASHABIHAT_DATASET, MutashabiGroup, MutashabiVerse } from '../data/mutashabihatData';
import { Sparkles, HelpCircle, CheckCircle2, XCircle, ArrowRight, Layers, BookOpen, RefreshCw } from 'lucide-react';

interface Props {
 onClose?: () => void;
}

export const MutashabihatView: React.FC<Props> = ({ onClose }) => {
 const [activeTab, setActiveTab] = useState<'EXPLORER' | 'DRILL'>('EXPLORER');
 const [selectedGroup, setSelectedGroup] = useState<MutashabiGroup>(MUTASHABIHAT_DATASET[0]);

 // Drill state
 const [drillIndex, setDrillIndex] = useState(0);
 const [selectedOption, setSelectedOption] = useState<string | null>(null);
 const [isAnswered, setIsAnswered] = useState(false);
 const [score, setScore] = useState(0);
 const [drillCompleted, setDrillCompleted] = useState(false);

 // Generate drill questions list
 const drillQuestions = React.useMemo(() => {
 const list: {
 verse: MutashabiVerse;
 group: MutashabiGroup;
 options: { ayahKey: string; label: string; isCorrect: boolean }[];
 }[] = [];

 MUTASHABIHAT_DATASET.forEach(group => {
 group.verses.forEach(verse => {
 // Correct choice
 const correct = {
 ayahKey: verse.ayahKey,
 label: `${verse.surahNameSq} (${verse.surahNumber}:${verse.ayahNumber})`,
 isCorrect: true
 };

 // Distractors from other verses in dataset or other group verses
 const otherVerses = group.verses.filter(v => v.ayahKey !== verse.ayahKey);
 const distractors = otherVerses.map(v => ({
 ayahKey: v.ayahKey,
 label: `${v.surahNameSq} (${v.surahNumber}:${v.ayahNumber})`,
 isCorrect: false
 }));

 // Fill remaining options up to 4 if needed
 const extraDistractors: { ayahKey: string; label: string; isCorrect: boolean }[] = [
 { ayahKey: '87:16', label: 'Al-A\'la (87:16)', isCorrect: false },
 { ayahKey: '88:2', label: 'Al-Ghashiyah (88:2)', isCorrect: false },
 { ayahKey: '89:1', label: 'Al-Fajr (89:1)', isCorrect: false }
 ].filter(d => d.ayahKey !== verse.ayahKey && !distractors.some(x => x.ayahKey === d.ayahKey));

 const allOptions = [correct, ...distractors, ...extraDistractors].slice(0, 4);
 // Shuffle options deterministically based on surahNumber
 const shuffled = [...allOptions].sort((a, b) => a.label.localeCompare(b.label));

 list.push({
 verse,
 group,
 options: shuffled
 });
 });
 });

 return list;
 }, []);

 const currentDrill = drillQuestions[drillIndex];

 const handleOptionSelect = (optionKey: string) => {
 if (isAnswered) return;
 setSelectedOption(optionKey);
 setIsAnswered(true);

 const isCorrect = optionKey === currentDrill.verse.ayahKey;
 if (isCorrect) {
 setScore(prev => prev + 1);
 }
 };

 const handleNextDrill = () => {
 if (drillIndex < drillQuestions.length - 1) {
 setDrillIndex(prev => prev + 1);
 setSelectedOption(null);
 setIsAnswered(false);
 } else {
 setDrillCompleted(true);
 }
 };

 const restartDrill = () => {
 setDrillIndex(0);
 setSelectedOption(null);
 setIsAnswered(false);
 setScore(0);
 setDrillCompleted(false);
 };

 return (
 <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden max-w-2xl mx-auto my-4 text-slate-100">
 {/* Header */}
 <div className="p-4 sm:p-6 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs uppercase tracking-wider mb-1">
 <Sparkles className="w-4 h-4" />
 <span>Mutashabihat Module</span>
 </div>
 <h2 className="text-xl font-semibold text-slate-100">Similar Verses (Ajete të ngjashme)</h2>
 <p className="text-xs text-slate-400">Master verses that resemble each other to prevent recitation errors</p>
 </div>

 {/* Navigation Tabs */}
 <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
 <button
 onClick={() => setActiveTab('EXPLORER')}
 className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 ${
 activeTab === 'EXPLORER' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <Layers className="w-3.5 h-3.5" />
 <span>Comparison</span>
 </button>
 <button
 onClick={() => setActiveTab('DRILL')}
 className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5 ${
 activeTab === 'DRILL' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
 }`}
 >
 <HelpCircle className="w-3.5 h-3.5" />
 <span>Drill Quiz</span>
 </button>
 </div>
 </div>

 {/* Main Content */}
 <div className="p-4 sm:p-6">
 {activeTab === 'EXPLORER' ? (
 <div className="space-y-6">
 {/* Group Selector */}
 <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-thin">
 {MUTASHABIHAT_DATASET.map(group => (
 <button
 key={group.id}
 onClick={() => setSelectedGroup(group)}
 className={`px-3.5 py-2 text-xs font-medium rounded-xl whitespace-nowrap transition-colors border ${
 selectedGroup.id === group.id
 ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
 : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
 }`}
 >
 {group.title}
 </button>
 ))}
 </div>

 {/* Selected Group Card */}
 <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-6">
 <div>
 <h3 className="text-lg font-medium text-amber-400 mb-1">{selectedGroup.title}</h3>
 <p className="text-xs text-slate-400 leading-relaxed">{selectedGroup.descriptionSq}</p>
 </div>

 {/* Side-by-Side Verses Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {selectedGroup.verses.map((verse, idx) => (
 <div
 key={verse.ayahKey}
 className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4"
 >
 <div className="flex items-center justify-between border-b border-slate-800 pb-2">
 <span className="text-xs font-semibold text-emerald-400 font-mono">
 {verse.surahNameSq} ({verse.surahNumber}:{verse.ayahNumber})
 </span>
 <span className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
 Ayah {verse.ayahNumber}
 </span>
 </div>

 <p className="text-2xl leading-[1.8] text-slate-100 font-arabic text-right dir-rtl py-2" dir="rtl">
 {verse.textAr}
 </p>

 <p className="text-xs text-slate-300 italic border-t border-slate-800/50 pt-2">
 "{verse.textSq}"
 </p>
 </div>
 ))}
 </div>

 {/* Distinction Key Note */}
 <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 flex items-start space-x-3">
 <BookOpen className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
 <div className="space-y-1">
 <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
 Dallimi Kryesor (Key Distinction)
 </h4>
 <p className="text-xs text-slate-300 leading-relaxed">
 {selectedGroup.keyDifferenceSq}
 </p>
 </div>
 </div>
 </div>
 </div>
 ) : (
 /* Drill Quiz Tab */
 <div className="space-y-6">
 {!drillCompleted ? (
 <div className="space-y-6">
 {/* Progress bar */}
 <div className="flex items-center justify-between text-xs text-slate-400">
 <span>
 Pyetja <strong className="text-slate-200">{drillIndex + 1}</strong> nga {drillQuestions.length}
 </span>
 <span>
 Saktësia: <strong className="text-emerald-400">{score}</strong> / {drillQuestions.length}
 </span>
 </div>

 <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
 <div
 className="bg-amber-500 h-1.5 transition-all duration-300"
 style={{ width: `${((drillIndex + 1) / drillQuestions.length) * 100}%` }}
 ></div>
 </div>

 {/* Drill Card */}
 <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-6 shadow-inner">
 <span className="text-xs font-mono text-amber-400 uppercase tracking-widest bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800/40">
 Cilës Sure/Ajet i përket ky ajet?
 </span>

 <div className="space-y-3 py-4">
 <p className="text-3xl sm:text-4xl leading-[1.8] text-slate-100 font-arabic dir-rtl" dir="rtl">
 {currentDrill.verse.textAr}
 </p>
 <p className="text-sm text-slate-400 italic font-serif">
 "{currentDrill.verse.textSq}"
 </p>
 </div>

 {/* Multiple Choice Options */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
 {currentDrill.options.map(opt => {
 const isChosen = selectedOption === opt.ayahKey;
 let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';

 if (isAnswered) {
 if (opt.isCorrect) {
 btnStyle = 'bg-emerald-950/50 border-emerald-500 text-emerald-300 font-semibold';
 } else if (isChosen) {
 btnStyle = 'bg-red-950/50 border-red-500 text-red-300';
 } else {
 btnStyle = 'bg-slate-900 border-slate-800/50 text-slate-500 opacity-60';
 }
 }

 return (
 <button
 key={opt.ayahKey}
 onClick={() => handleOptionSelect(opt.ayahKey)}
 disabled={isAnswered}
 className={`p-3.5 border rounded-xl text-xs sm:text-sm transition-all flex items-center justify-between text-left ${btnStyle}`}
 >
 <span>{opt.label}</span>
 {isAnswered && (
 opt.isCorrect ? (
 <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
 ) : isChosen ? (
 <XCircle className="w-4 h-4 text-red-400 shrink-0 ml-2" />
 ) : null
 )}
 </button>
 );
 })}
 </div>

 {/* Explanation after answering */}
 {isAnswered && (
 <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 text-left space-y-2 animate-in fade-in duration-300">
 <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
 Këshillë Kujtese (Memory Tip)
 </p>
 <p className="text-xs text-slate-300">
 {currentDrill.group.keyDifferenceSq}
 </p>
 <button
 onClick={handleNextDrill}
 className="w-full mt-3 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center space-x-2"
 >
 <span>Përpara</span>
 <ArrowRight className="w-4 h-4" />
 </button>
 </div>
 )}
 </div>
 </div>
 ) : (
 /* Drill Completed Screen */
 <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center space-y-6">
 <div className="w-16 h-16 bg-amber-950/50 border border-amber-800 rounded-full flex items-center justify-center mx-auto text-amber-400">
 <Sparkles className="w-8 h-8" />
 </div>
 <div className="space-y-2">
 <h3 className="text-2xl font-serif text-slate-100">Drill i Përfunduar!</h3>
 <p className="text-slate-400 text-sm">
 Keni qëlluar saktë <strong className="text-amber-400">{score}</strong> nga {drillQuestions.length} ajete të ngjashme.
 </p>
 </div>
 <button
 onClick={restartDrill}
 className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2 mx-auto"
 >
 <RefreshCw className="w-4 h-4" />
 <span>Rifillo Drillin</span>
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 );
};
