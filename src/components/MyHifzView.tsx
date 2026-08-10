import React, { useState, useEffect } from 'react';
import { ALL_SURAHS_META } from '../data/quranData';
import { ChevronLeft, ChevronDown, BookOpen } from 'lucide-react';
import { getAllMemorized, setMemorized } from '../services/hifzDb';

export const MyHifzView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [memSet, setMemSet] = useState<Set<string>>(new Set());
  const [count, setCount] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = async () => {
    const all = await getAllMemorized();
    setMemSet(new Set(all.map(a => a.ayahKey)));
    setCount(all.length);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (surah: number, ayah: number) => {
    const key = `${surah}:${ayah}`;
    const val = !memSet.has(key);
    await setMemorized(surah, ayah, val);
    const next = new Set(memSet);
    if (val) next.add(key); else next.delete(key);
    setMemSet(next);
    setCount(next.size);
  };

  const surahMemCount = (surah: number) => {
    let c = 0;
    memSet.forEach(k => { if (k.startsWith(`${surah}:`)) c++; });
    return c;
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-24">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          <span>Kthehu te Hifz</span>
        </button>
        <span className="text-xs text-slate-400 font-mono">{count} / 6236 ajete të mësuar</span>
      </div>

      <div className="flex items-center space-x-2">
        <BookOpen className="w-5 h-5 text-emerald-400" />
        <h2 className="text-xl font-serif text-slate-100">Hifzi Im</h2>
      </div>
      <p className="text-xs text-slate-400">Shëno surjet dhe ajetet që ke mësuar. Regjistër personal (pa AI-dëgjues).</p>

      <div className="space-y-2">
        {ALL_SURAHS_META.map(s => {
          const total = s.numberOfAyahs;
          const mem = surahMemCount(s.number);
          const isOpen = expanded === s.number;
          return (
            <div key={s.number} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-3">
                <button onClick={() => setExpanded(isOpen ? null : s.number)} className="flex items-center space-x-2 flex-1 text-left">
                  <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  <span className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs flex items-center justify-center">{s.number}</span>
                  <span className="text-sm text-slate-200">{s.transliteration} <span className="text-xs text-slate-400">({s.albanianName})</span></span>
                </button>
                <span className="text-[11px] text-slate-400 font-mono mr-2">{mem}/{total}</span>
              </div>
              {isOpen && (
                <div className="px-3 pb-3 pt-1 grid grid-cols-6 gap-1.5">
                  {Array.from({ length: total }, (_, i) => i + 1).map(a => {
                    const key = `${s.number}:${a}`;
                    const on = memSet.has(key);
                    return (
                      <button key={a} onClick={() => toggle(s.number, a)}
                        className={`aspect-square rounded-md border text-xs font-mono flex items-center justify-center transition-colors ${on ? 'bg-emerald-600 border-emerald-500 text-slate-950' : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-emerald-700'}`}>
                        {a}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};