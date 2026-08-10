import React, { useState, useEffect } from 'react';
import { HifzLearnView } from './HifzLearnView';
import { HifzReviewSession } from './HifzReviewSession';
import { MutashabihatView } from './MutashabihatView';
import { MyHifzView } from './MyHifzView';
import { BookOpen, Play, Sparkles, ChevronLeft } from 'lucide-react';
import { hifzDb, DEFAULT_HIFZ_SETTINGS } from '../services/hifzDb';
import type { HifzSettings, HifzMethod } from '../services/hifzDb';
import { getReviewQueue } from '../services/hifzScheduler';
import { QURAN_RECITERS } from './KuraniView';

const METHODS: { id: HifzMethod; title: string; desc: string; soon?: boolean }[] = [
  { id: 'A', title: 'Dëgjo & Përsërit', desc: 'Metoda audio për jo-arabishtfolës' },
  { id: 'B', title: 'Fjalë pas fjalë', desc: 'Kuptimi i ajetit (word-by-word)' },
  { id: 'C', title: 'Metoda Osmane', desc: 'Faqe/xhuz me rrotullim', soon: true }
];

export const HifzModule: React.FC = () => {
  const [learningAyah, setLearningAyah] = useState<{ surah: number; ayah: number } | null>(null);
  const [reviewQueue, setReviewQueue] = useState<any[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showMutashabihat, setShowMutashabihat] = useState(false);
  const [showMyHifz, setShowMyHifz] = useState(false);
  const [overdueCount, setOverdueCount] = useState(0);
  const [settings, setSettings] = useState<HifzSettings>(DEFAULT_HIFZ_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<HifzMethod>('B');
  const [tempSurah, setTempSurah] = useState(114);
  const [tempAyah, setTempAyah] = useState(1);

  const loadData = async () => {
    setLoading(true);
    const s = await hifzDb.settings.get(1);
    if (s) { setSettings(s); if (s.preferredMethod) setMethod(s.preferredMethod); }
    const allRecords = await hifzDb.ayahRecords.toArray();
    const now = new Date();
    setOverdueCount(allRecords.filter(r => new Date(r.dueDate) < now).length);
    const queue = await getReviewQueue('ADAPTIVE');
    setReviewQueue(queue);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [learningAyah, isReviewing]);

  const chooseMethod = async (m: HifzMethod) => {
    if (m === 'C') return; // së shpejti
    setMethod(m);
    const s = await hifzDb.settings.get(1);
    if (s) {
      s.preferredMethod = m;
      s.showWordByWord = (m === 'B');
      await hifzDb.settings.put(s);
      setSettings(s);
    }
  };

  const changeReciter = async (id: string) => {
    const s = await hifzDb.settings.get(1);
    if (s) { s.reciterId = id; await hifzDb.settings.put(s); setSettings(s); }
  };

  if (learningAyah) {
    return <HifzLearnView surahNumber={learningAyah.surah} ayahNumber={learningAyah.ayah}
      onComplete={async () => setLearningAyah(null)}
      onClose={() => setLearningAyah(null)} />;
  }
  if (isReviewing && reviewQueue.length > 0) {
    return <HifzReviewSession queue={reviewQueue} onClose={() => setIsReviewing(false)}
      onComplete={() => { setIsReviewing(false); loadData(); }} />;
  }
  if (showMutashabihat) {
    return <div className="space-y-4 max-w-2xl mx-auto pb-24">
      <button onClick={() => setShowMutashabihat(false)} className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200">
        <ChevronLeft className="w-4 h-4" /><span>Kthehu te Hifz</span>
      </button>
      <MutashabihatView onClose={() => setShowMutashabihat(false)} />
    </div>;
  }
  if (showMyHifz) {
    return <MyHifzView onClose={() => setShowMyHifz(false)} />;
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-serif text-slate-100">Hifz</h2>
        </div>
        <select value={settings.reciterId}
          onChange={e => changeReciter(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 max-w-[150px]">
          {QURAN_RECITERS.map(r => <option key={r.key} value={r.key}>{r.name}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {METHODS.map(m => (
          <button key={m.id} onClick={() => chooseMethod(m.id)}
            disabled={m.soon}
            className={`p-3 rounded-xl border text-left transition-all ${m.soon ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-900/50' : method === m.id ? 'border-emerald-500 bg-emerald-950/40' : 'border-slate-800 bg-slate-900 hover:border-emerald-700/50'}`}>
            <div className="text-sm font-medium text-slate-100">{m.title}{m.soon && <span className="text-[10px] text-slate-500 ml-1">së shpejti</span>}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{m.desc}</div>
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-slate-200">Mëso ajet të ri</h3>
        <div className="flex space-x-3">
          <div className="flex-1">
            <label className="text-[11px] text-slate-400 mb-1 block">Surah (1-114)</label>
            <input type="number" min={1} max={114} value={tempSurah}
              onChange={e => setTempSurah(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500" />
          </div>
          <div className="flex-1">
            <label className="text-[11px] text-slate-400 mb-1 block">Ayah (1-286)</label>
            <input type="number" min={1} max={286} value={tempAyah}
              onChange={e => setTempAyah(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500" />
          </div>
        </div>
        <button onClick={() => setLearningAyah({ surah: tempSurah, ayah: tempAyah })}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors">
          Filloj Mësimin
        </button>
      </div>

      {overdueCount > 0 && (
        <button onClick={() => setIsReviewing(true)}
          className="w-full py-3 bg-amber-600/20 text-amber-300 border border-amber-500/30 rounded-xl font-medium hover:bg-amber-600/30 transition-colors flex items-center justify-center space-x-2">
          <Play className="w-4 h-4 fill-current" />
          <span>Rishiko ({overdueCount})</span>
        </button>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setShowMyHifz(true)}
          className="py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 hover:border-emerald-700/50 transition-colors">
          Hifzi Im
        </button>
        <button onClick={() => setShowMutashabihat(true)}
          className="py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-slate-200 hover:border-emerald-700/50 transition-colors flex items-center justify-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Ajete të Ngjashme</span>
        </button>
      </div>
    </div>
  );
};
