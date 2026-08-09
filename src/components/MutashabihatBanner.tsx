import React, { useState } from 'react';
import { getMutashabihatForAyah } from '../data/mutashabihatData';
import { Sparkles, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

interface Props {
 surahNumber: number;
 ayahNumber: number;
}

export const MutashabihatBanner: React.FC<Props> = ({ surahNumber, ayahNumber }) => {
 const groups = getMutashabihatForAyah(surahNumber, ayahNumber);
 const [isOpen, setIsOpen] = useState(false);

 if (groups.length === 0) {
 return null;
 }

 const group = groups[0];

 return (
 <div className="w-full my-4 bg-amber-950/30 border border-amber-900/50 rounded-xl overflow-hidden transition-all text-left">
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="w-full p-3.5 flex items-center justify-between bg-amber-950/40 hover:bg-amber-900/40 transition-colors"
 >
 <div className="flex items-center space-x-2.5">
 <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
 <div>
 <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
 Mutashabihat Alert (Ajet i ngjashëm)
 </span>
 <span className="text-xs text-slate-300 font-medium">
 {group.title}
 </span>
 </div>
 </div>
 <div className="flex items-center space-x-1 text-slate-400 hover:text-slate-200">
 <span className="text-[11px] font-mono">{isOpen ? 'Mbyll' : 'Krahaso'}</span>
 {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
 </div>
 </button>

 {isOpen && (
 <div className="p-4 bg-slate-950/80 border-t border-amber-900/30 space-y-4 animate-in fade-in duration-200">
 <p className="text-xs text-slate-300 leading-relaxed">
 {group.descriptionSq}
 </p>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {group.verses.map(v => (
 <div
 key={v.ayahKey}
 className={`p-3 rounded-lg border text-xs space-y-2 ${
 v.surahNumber === surahNumber && v.ayahNumber === ayahNumber
 ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
 : 'bg-slate-900 border-slate-800 text-slate-300'
 }`}
 >
 <div className="flex items-center justify-between font-mono text-[11px] border-b border-slate-800/80 pb-1.5">
 <span className="font-semibold">{v.surahNameSq} ({v.ayahKey})</span>
 {v.surahNumber === surahNumber && v.ayahNumber === ayahNumber && (
 <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded text-[10px]">Ajeti Aktual</span>
 )}
 </div>
 <p className="text-lg leading-[1.8] font-arabic dir-rtl text-right py-1" dir="rtl">
 {v.textAr}
 </p>
 <p className="text-[11px] text-slate-400 italic">
 "{v.textSq}"
 </p>
 </div>
 ))}
 </div>

 <div className="bg-amber-900/20 border border-amber-800/30 p-3 rounded-lg flex items-start space-x-2.5 text-xs text-amber-300/90">
 <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
 <div>
 <strong className="block text-amber-400 text-[11px] uppercase tracking-wider mb-0.5">Dallimi Kryesor</strong>
 {group.keyDifferenceSq}
 </div>
 </div>
 </div>
 )}
 </div>
 );
};
