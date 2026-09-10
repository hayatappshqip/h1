import React, { useState, useEffect, useRef } from 'react';
import { HifzLearnView } from './HifzLearnView';
import { HifzReviewSession } from './HifzReviewSession';
import { MutashabihatView } from './MutashabihatView';
import { MyHifzView } from './MyHifzView';
import { BookOpen, Play, Sparkles, ChevronLeft } from 'lucide-react';
import { hifzDb, DEFAULT_HIFZ_SETTINGS } from '../services/hifzDb';
import type { HifzSettings, HifzMethod, AyahStatus } from '../services/hifzDb';
import { setMemorizedUnified, newSessionId } from '../services/hifzDb';
import { getReviewQueue, processReviewResult } from '../services/hifzScheduler';
import { QURAN_RECITERS } from './KuraniView';

// S6: etiketat shqip të statuseve SM-2 (identifikuesit mbesin anglisht).
const STATUS_ETIKETAT: Record<AyahStatus, string> = {
  NEW: 'Të reja',
  LEARNING: 'Në mësim',
  REVIEWING: 'Në rishikim',
  CONSOLIDATED: 'Të forcuara',
};

const DITET_SHKURTIM = ['Di', 'Hë', 'Ma', 'Më', 'En', 'Pr', 'Sh'];
const DAY_MS = 24 * 60 * 60 * 1000;

interface HifzStats {
  total: number;
  byStatus: Record<AyahStatus, number>;
  dueToday: number;
  week: { label: string; count: number }[];
  weekTotal: number;
  weekMax: number;
}

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
  const [stats, setStats] = useState<HifzStats | null>(null);
  const [settings, setSettings] = useState<HifzSettings>(DEFAULT_HIFZ_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState<HifzMethod>('B');
  const didInitialLoad = useRef(false);
  const [tempSurah, setTempSurah] = useState(114);
  const [tempAyah, setTempAyah] = useState(1);
  // Fillimi i mësimit mbahet në ref (jo state) që të mos shkaktojë re-render.
  const learnStartedAt = useRef<number>(0);

  const loadData = async () => {
    setLoading(true);
    const s = await hifzDb.settings.get(1);
    if (s) { setSettings(s); if (!didInitialLoad.current && s.preferredMethod) setMethod(s.preferredMethod); }
    const allRecords = await hifzDb.ayahRecords.toArray();
    const now = new Date();
    setOverdueCount(allRecords.filter(r => new Date(r.dueDate) < now).length);
    const queue = await getReviewQueue('ADAPTIVE');
    setReviewQueue(queue);
    // S6: statistikat — gjithçka nga tabelat lokale (pa rrjet).
    // Dështimi këtu nuk e bllokon ekranin bazë (radha/metoda): kapet dhe
    // karta mbetet në gjendjen e ngarkimit.
    try {
    const total = await hifzDb.memorized.count();
    const byStatus: Record<AyahStatus, number> = { NEW: 0, LEARNING: 0, REVIEWING: 0, CONSOLIDATED: 0 };
    for (const r of allRecords) byStatus[r.status]++;
    const nowMs = now.getTime();
    const dueToday = allRecords.filter(r => r.dueDate <= nowMs).length;
    const sessions = await hifzDb.sessions.toArray();
    const recent = sessions.filter(s => s.startedAt > nowMs - 7 * DAY_MS);
    // Dritare 24-orëshe (jo ditë kalendarike): përputhet saktë me filtrin
    // startedAt > tani-7d dhe nuk thyhet nga ndryshimi i orës (DST).
    const week = Array.from({ length: 7 }, (_, i) => {
      const end = nowMs - (6 - i) * DAY_MS;
      const start = end - DAY_MS;
      const count = recent.filter(s => s.startedAt > start && s.startedAt <= end).length;
      const label = i === 6 ? 'Sot' : DITET_SHKURTIM[new Date(end).getDay()];
      return { label, count };
    });
    const weekTotal = week.reduce((a, d) => a + d.count, 0);
    setStats({ total, byStatus, dueToday, week, weekTotal, weekMax: Math.max(1, ...week.map(d => d.count)) });
    } catch {
      setStats(null);
    }
    setLoading(false);
    didInitialLoad.current = true;
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

  // H1: rezultati i mësimit RUHET — SM-2 + regjistri + sesioni.
  const startLearning = (surah: number, ayah: number) => {
    learnStartedAt.current = Date.now();
    setLearningAyah({ surah, ayah });
  };

  const handleLearnComplete = async (
    result: 'KNEW' | 'STRUGGLED' | 'FORGOT',
    stumblePoints: number[],
  ) => {
    if (!learningAyah) {
      setLearningAyah(null);
      return;
    }
    const ayahKey = `${learningAyah.surah}:${learningAyah.ayah}`;
    // 1) Motori SM-2 (thirret, nuk ndryshohet).
    await processReviewResult(ayahKey, result, stumblePoints);
    // 2) Regjistri "Hifzi Im" rritet bashkë me mësimin (porta e unifikuar H2).
    await setMemorizedUnified(learningAyah.surah, learningAyah.ayah, true);
    // 3) Sesioni LEARN ruhet për statistika.
    const endedAt = Date.now();
    await hifzDb.sessions.add({
      id: newSessionId(),
      startedAt: learnStartedAt.current,
      endedAt,
      type: 'LEARN',
      ayahsCovered: [ayahKey],
      results: [{ ayahKey, result }],
      durationSeconds: Math.max(0, Math.round((endedAt - learnStartedAt.current) / 1000)),
    });
    setLearningAyah(null);
  };

  if (learningAyah) {
    return <HifzLearnView surahNumber={learningAyah.surah} ayahNumber={learningAyah.ayah}
      method={method}
      onComplete={handleLearnComplete}
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

      {/* S6: Statistikat e Hifzit — numra realë nga tabelat, ton neutral. */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-medium text-slate-200">Statistikat e Hifzit</h3>
        {loading || !stats ? (
          <p className="text-xs text-slate-500">Duke ngarkuar statistikat…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center">
                <div data-testid="hifzstat-total" className="text-2xl font-mono font-bold text-slate-100">{stats.total}</div>
                <div className="text-[11px] text-slate-400 mt-1">Të memorizuara</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-center">
                <div data-testid="hifzstat-due" className="text-2xl font-mono font-bold text-amber-300">{stats.dueToday}</div>
                <div className="text-[11px] text-slate-400 mt-1">Për rishikim sot</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(STATUS_ETIKETAT) as AyahStatus[]).map(st => (
                <div key={st} className="bg-slate-950/60 border border-slate-800 rounded-xl p-2 text-center">
                  <div data-testid={`hifzstat-status-${st}`} className="text-lg font-mono font-bold text-slate-200">{stats.byStatus[st]}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{STATUS_ETIKETAT[st]}</div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <p className="text-xs text-slate-400">Sesione këtë javë</p>
                <span data-testid="hifzstat-week" className="text-sm font-mono font-bold text-emerald-300">{stats.weekTotal}</span>
              </div>
              {stats.weekTotal === 0 ? (
                <p className="text-xs text-slate-500">Nuk ka sesione ende — mëso ajetin e parë.</p>
              ) : (
                <div className="flex items-end justify-between gap-1.5 h-20 pt-1">
                  {stats.week.map((d, i) => (
                    <div key={i} className="flex flex-col items-center justify-end flex-1 space-y-1">
                      <div data-testid="hifzstat-bar" data-count={d.count}
                        className={`w-full rounded-t ${d.count > 0 ? 'bg-emerald-600/70' : 'bg-slate-800'}`}
                        style={{ height: `${d.count === 0 ? 4 : Math.max(10, (d.count / stats.weekMax) * 56)}px` }} />
                      <span className="text-[10px] text-slate-500">{d.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
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
        <button onClick={() => startLearning(tempSurah, tempAyah)}
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
