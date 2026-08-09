import React, { useState, useEffect, useMemo } from 'react';
import { hifzDb, AyahMemorizationRecord, SessionRecord, AyahStatus } from '../services/hifzDb';
import { ALL_JUZ_META, JuzMeta } from '../data/juzData';
import { ALL_SURAHS_META } from '../data/quranData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  Brain,
  Award,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Bell,
  Search,
  Sparkles,
  TrendingUp,
  RefreshCw,
  Flame,
  Zap,
  Layers,
  ChevronDown,
  ChevronUp,
  Sliders,
  BellRing
} from 'lucide-react';

interface HifzAnalyticsViewProps {
  onSelectSurah?: (surahNumber: number) => void;
}

export const HifzAnalyticsView: React.FC<HifzAnalyticsViewProps> = ({ onSelectSurah }) => {
  const [records, setRecords] = useState<AyahMemorizationRecord[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'juz' | 'surahs' | 'history' | 'reminders'>('juz');
  const [searchSurahQuery, setSearchSurahQuery] = useState('');
  const [expandedJuz, setExpandedJuz] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Daily Reminder Settings
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(() => {
    return localStorage.getItem('hayat_hifz_reminder_enabled') === 'true';
  });
  const [reminderTime, setReminderTime] = useState<string>(() => {
    return localStorage.getItem('hayat_hifz_reminder_time') || '08:00';
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const allRecords = await hifzDb.ayahRecords.toArray();
      const allSessions = await hifzDb.sessions.toArray();
      setRecords(allRecords);
      setSessions(allSessions);
    } catch (e) {
      console.warn('Error loading Hifz records:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Seed sample data for testing or demo purposes
  const handleSeedDemoData = async () => {
    if (!window.confirm('Dëshironi të ngarkoni të dhëna demonstrative të memorizimit për grafikët e Hifzit?')) {
      return;
    }

    setLoading(true);
    try {
      const now = Date.now();
      const newRecords: AyahMemorizationRecord[] = [];

      // 1. Memorize Surah Al-Fatihah (7 ayahs) - Consolidated
      for (let a = 1; a <= 7; a++) {
        newRecords.push({
          ayahKey: `1:${a}`,
          status: 'CONSOLIDATED',
          strength: 95,
          easeFactor: 2.5,
          intervalDays: 30,
          dueDate: now + 30 * 24 * 3600 * 1000,
          repetitions: 8,
          lapses: 0,
          totalListens: 20,
          stumblePoints: [],
          createdAt: now - 60 * 24 * 3600 * 1000,
          lastReviewedAt: now - 2 * 24 * 3600 * 1000
        });
      }

      // 2. Memorize Juz 30 (Surahs 78 to 114) - Mix of CONSOLIDATED & REVIEWING
      for (let s = 78; s <= 114; s++) {
        const surah = ALL_SURAHS_META.find(m => m.number === s);
        if (!surah) continue;
        const count = surah.numberOfAyahs;

        for (let a = 1; a <= count; a++) {
          const isConsolidated = s >= 90;
          newRecords.push({
            ayahKey: `${s}:${a}`,
            status: isConsolidated ? 'CONSOLIDATED' : 'REVIEWING',
            strength: isConsolidated ? 88 : 65,
            easeFactor: 2.3,
            intervalDays: isConsolidated ? 14 : 4,
            dueDate: isConsolidated ? now + 10 * 24 * 3600 * 1000 : now - 1 * 24 * 3600 * 1000, // Some due
            repetitions: isConsolidated ? 5 : 2,
            lapses: isConsolidated ? 0 : 1,
            totalListens: 15,
            stumblePoints: [],
            createdAt: now - 30 * 24 * 3600 * 1000,
            lastReviewedAt: now - 3 * 24 * 3600 * 1000
          });
        }
      }

      // 3. Memorize Surah Ya-Sin (36) - Learning
      const yasinSurah = ALL_SURAHS_META.find(m => m.number === 36);
      if (yasinSurah) {
        for (let a = 1; a <= 30; a++) {
          newRecords.push({
            ayahKey: `36:${a}`,
            status: 'LEARNING',
            strength: 45,
            easeFactor: 2.1,
            intervalDays: 1,
            dueDate: now - 3600 * 1000, // Overdue
            repetitions: 1,
            lapses: 0,
            totalListens: 8,
            stumblePoints: [],
            createdAt: now - 5 * 24 * 3600 * 1000,
            lastReviewedAt: now - 1 * 24 * 3600 * 1000
          });
        }
      }

      // 4. Sample Sessions (last 7 days)
      const sampleSessions: SessionRecord[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now - i * 24 * 3600 * 1000);
        sampleSessions.push({
          id: `demo_session_${i}`,
          startedAt: date.getTime() - 600000,
          endedAt: date.getTime(),
          type: 'REVIEW',
          ayahsCovered: ['114:1', '114:2', '114:3', '114:4', '114:5', '114:6'],
          results: [
            { ayahKey: '114:1', result: 'KNEW' },
            { ayahKey: '114:2', result: 'KNEW' },
            { ayahKey: '114:3', result: 'KNEW' },
            { ayahKey: '114:4', result: 'STRUGGLED' },
            { ayahKey: '114:5', result: 'KNEW' },
            { ayahKey: '114:6', result: 'KNEW' }
          ],
          durationSeconds: 350 + i * 40
        });
      }

      await hifzDb.ayahRecords.bulkPut(newRecords);
      await hifzDb.sessions.bulkPut(sampleSessions);

      await loadData();
      showToast('Të dhënat shembull të Hifzit u ngarkuan me sukses!');
    } catch (e) {
      console.error('Error seeding demo data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (window.confirm('A jeni të sigurt që dëshironi të fshini të gjitha rekordet e memorizimit?')) {
      await hifzDb.ayahRecords.clear();
      await hifzDb.sessions.clear();
      await loadData();
      showToast('Të gjitha rekordet e Hifzit u fshinë.');
    }
  };

  // Metric Calculations
  const recordMap = useMemo(() => {
    const map = new Map<string, AyahMemorizationRecord>();
    records.forEach(r => map.set(r.ayahKey, r));
    return map;
  }, [records]);

  const totalMemorizedAyahs = records.length;
  const consolidatedCount = records.filter(r => r.status === 'CONSOLIDATED').length;
  const reviewingCount = records.filter(r => r.status === 'REVIEWING').length;
  const learningCount = records.filter(r => r.status === 'LEARNING').length;

  const now = Date.now();
  const dueReviewsCount = records.filter(r => r.dueDate <= now).length;

  const avgStrength = totalMemorizedAyahs > 0
    ? Math.round(records.reduce((acc, r) => acc + (r.strength || 0), 0) / totalMemorizedAyahs)
    : 0;

  // Juz Breakdown (30 Juz)
  const juzStats = useMemo(() => {
    return ALL_JUZ_META.map(juz => {
      let totalAyahsInJuz = 0;
      let memorizedAyahsInJuz = 0;
      let consolidated = 0;
      let reviewing = 0;
      let learning = 0;

      // Loop through surahs in this juz
      for (let s = juz.startSurah; s <= juz.endSurah; s++) {
        const surah = ALL_SURAHS_META.find(m => m.number === s);
        if (!surah) continue;

        const startAyah = s === juz.startSurah ? juz.startAyah : 1;
        const endAyah = s === juz.endSurah ? juz.endAyah : surah.numberOfAyahs;

        for (let a = startAyah; a <= endAyah; a++) {
          totalAyahsInJuz++;
          const rec = recordMap.get(`${s}:${a}`);
          if (rec) {
            memorizedAyahsInJuz++;
            if (rec.status === 'CONSOLIDATED') consolidated++;
            else if (rec.status === 'REVIEWING') reviewing++;
            else if (rec.status === 'LEARNING') learning++;
          }
        }
      }

      const percent = totalAyahsInJuz > 0 ? Math.round((memorizedAyahsInJuz / totalAyahsInJuz) * 100) : 0;

      return {
        ...juz,
        totalAyahsInJuz,
        memorizedAyahsInJuz,
        consolidated,
        reviewing,
        learning,
        percent
      };
    });
  }, [recordMap]);

  // Total Quran percent
  const TOTAL_QURAN_AYAHS = 6236;
  const quranPercent = ((totalMemorizedAyahs / TOTAL_QURAN_AYAHS) * 100).toFixed(1);

  // Surahs Breakdown
  const surahStats = useMemo(() => {
    return ALL_SURAHS_META.map(surah => {
      let memorizedCount = 0;
      let consolidated = 0;

      for (let a = 1; a <= surah.numberOfAyahs; a++) {
        const rec = recordMap.get(`${surah.number}:${a}`);
        if (rec) {
          memorizedCount++;
          if (rec.status === 'CONSOLIDATED') consolidated++;
        }
      }

      const percent = Math.round((memorizedCount / surah.numberOfAyahs) * 100);

      return {
        ...surah,
        memorizedCount,
        consolidated,
        percent
      };
    }).filter(s => {
      if (!searchSurahQuery.trim()) return true;
      const q = searchSurahQuery.toLowerCase();
      return (
        s.transliteration.toLowerCase().includes(q) ||
        s.albanianName.toLowerCase().includes(q) ||
        s.number.toString() === q
      );
    });
  }, [recordMap, searchSurahQuery]);

  // Status Pie Chart Data
  const pieData = [
    { name: 'Të Konsoliduara (Të forta)', value: consolidatedCount, color: '#10b981' },
    { name: 'Në Rishikim (Rregullt)', value: reviewingCount, color: '#3b82f6' },
    { name: 'Në Mësim e Sipër', value: learningCount, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  // Chart Data for 30 Juz
  const juzBarChartData = juzStats.map(j => ({
    name: `Xh ${j.number}`,
    juzNum: j.number,
    'Të Konsoliduara': j.consolidated,
    'Në Rishikim': j.reviewing,
    'Në Mësim': j.learning
  }));

  // Session activity trend (last 7 days)
  const sessionTrendData = useMemo(() => {
    const days = ['Di', 'Hë', 'Ma', 'Më', 'En', 'Pr', 'Sh'];
    const res = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 3600 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Sot' : days[d.getDay()];

      // Find sessions on this day
      const daySessions = sessions.filter(s => {
        const sDate = new Date(s.startedAt).toISOString().split('T')[0];
        return sDate === dateStr;
      });

      let ayahsReviewed = 0;
      let knewCount = 0;
      daySessions.forEach(s => {
        ayahsReviewed += s.ayahsCovered ? s.ayahsCovered.length : 0;
        if (s.results) {
          knewCount += s.results.filter(r => r.result === 'KNEW').length;
        }
      });

      res.push({
        dayName,
        'Ajete të Rishikuara': ayahsReviewed,
        'Të Mbajtura Mend': knewCount
      });
    }
    return res;
  }, [sessions, now]);

  // Toggle Reminder
  const handleToggleReminder = () => {
    const newVal = !reminderEnabled;
    setReminderEnabled(newVal);
    localStorage.setItem('hayat_hifz_reminder_enabled', String(newVal));
    if (newVal && 'Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
    showToast(newVal ? `Rikujtuesi ditor u aktivizua për në orën ${reminderTime}` : 'Rikujtuesi ditor u çaktivizua');
  };

  const handleSaveReminderTime = (timeStr: string) => {
    setReminderTime(timeStr);
    localStorage.setItem('hayat_hifz_reminder_time', timeStr);
    showToast(`Koha e rikujtuesit u caktua në ${timeStr}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-slate-950 px-4 py-2.5 rounded-xl shadow-xl font-medium text-xs flex items-center space-x-2 border border-emerald-400/50 animate-bounce">
          <Sparkles className="w-4 h-4 fill-current" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-800/60 p-5 sm:p-6 rounded-2xl relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-semibold uppercase tracking-wider flex items-center space-x-1">
                <Brain className="w-3 h-3 text-emerald-400" />
                <span>Statistikat e Hifzit</span>
              </span>
              <span className="text-xs text-slate-400">• Analitika e Memorizimit</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif mt-1">
              Progredimi i Ruajtjes së Kuranit
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {totalMemorizedAyahs} ajete të memorizuara ({quranPercent}% e gjithë Kuranit) • Forca mesatare: <span className="text-emerald-400 font-bold">{avgStrength}%</span>
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={handleSeedDemoData}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow"
              title="Ngarko të dhëna testuese për grafikët"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Të Dhëna Shembull</span>
            </button>

            {records.length > 0 && (
              <button
                onClick={handleClearData}
                className="px-2.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-medium transition-colors"
                title="Pastro të dhënat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Ayahs Memorized */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
              Ajete Të Memorizuara
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-mono text-slate-100">{totalMemorizedAyahs}</span>
              <span className="text-xs text-slate-500 font-mono">/ 6,236</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold">
              {quranPercent}% e të gjithë Kuranit
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        {/* Consolidated vs Learning */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
              Të Konsoliduara (Të Forta)
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-mono text-emerald-400">{consolidatedCount}</span>
              <span className="text-xs text-slate-400 font-mono">ajete</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {reviewingCount} në rishikim • {learningCount} në mësim
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Due for Review */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
              Presin Rishikim Sot
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className={`text-2xl font-bold font-mono ${dueReviewsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {dueReviewsCount}
              </span>
              <span className="text-xs text-slate-400 font-mono">ajete</span>
            </div>
            <div className="text-[10px] text-slate-400">
              {dueReviewsCount > 0 ? 'Rekomandohet rishikim ditor' : 'Çdo gjë është në rregull!'}
            </div>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
            dueReviewsCount > 0 ? 'bg-amber-950 border-amber-800/60 text-amber-400' : 'bg-slate-950 border-slate-800 text-emerald-400'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Retention / Memory Strength */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
              Forca e Kujtesës (Retention)
            </span>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl font-bold font-mono text-emerald-300">{avgStrength}%</span>
            </div>
            <div className="w-28 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800 mt-1">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${avgStrength}%` }}
              />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-950 border border-blue-800/60 flex items-center justify-center text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('juz')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'juz'
              ? 'bg-emerald-600 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Sipas 30 Xhuzeve</span>
        </button>

        <button
          onClick={() => setActiveTab('surahs')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'surahs'
              ? 'bg-emerald-600 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Sipas Surave (114)</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'history'
              ? 'bg-emerald-600 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Ecuria & Sesionet</span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-semibold flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'reminders'
              ? 'bg-emerald-600 text-slate-950 font-bold shadow'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Rikujtuesi Ditor</span>
        </button>
      </div>

      {/* TAB 1: JUZ BREAKDOWN & MATRIX CHART */}
      {activeTab === 'juz' && (
        <div className="space-y-5">
          {/* Juz Distribution Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Grafiku i Memorizimit sipas 30 Xhuzeve</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Numri i ajeteve të konsoliduara, në rishikim dhe në mësim për çdo Xhuz
                </p>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={juzBarChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="Të Konsoliduara" stackId="a" fill="#10b981" />
                  <Bar dataKey="Në Rishikim" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Në Mësim" stackId="a" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 30 Juz Detailed Grid Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {juzStats.map(juz => {
              const isExpanded = expandedJuz === juz.number;

              return (
                <div
                  key={juz.number}
                  className={`bg-slate-900 border p-3.5 rounded-2xl transition-all space-y-3 ${
                    juz.percent === 100
                      ? 'border-emerald-600/60 bg-emerald-950/20 shadow-sm'
                      : juz.percent > 0
                      ? 'border-slate-700 bg-slate-900/90'
                      : 'border-slate-800/80 bg-slate-950/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold border ${
                          juz.percent === 100
                            ? 'bg-emerald-600 text-slate-950 border-emerald-400'
                            : juz.percent > 0
                            ? 'bg-slate-800 text-slate-100 border-slate-700'
                            : 'bg-slate-950 text-slate-500 border-slate-800'
                        }`}
                      >
                        {juz.number}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-100">
                          Xhuzi {juz.number} • {juz.transliteration}
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Faqet {juz.startPage}-{juz.endPage} • {juz.memorizedAyahsInJuz} / {juz.totalAyahsInJuz} ajete
                        </p>
                      </div>
                    </div>

                    <span className="font-arabic text-base text-emerald-400 font-medium" dir="rtl">
                      {juz.nameAr}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Progresi</span>
                      <span className="font-bold text-slate-200">{juz.percent}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 flex">
                      <div
                        className="bg-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${(juz.consolidated / juz.totalAyahsInJuz) * 100}%` }}
                        title="Të Konsoliduara"
                      />
                      <div
                        className="bg-blue-500 h-full transition-all duration-500"
                        style={{ width: `${(juz.reviewing / juz.totalAyahsInJuz) * 100}%` }}
                        title="Në Rishikim"
                      />
                      <div
                        className="bg-amber-500 h-full transition-all duration-500"
                        style={{ width: `${(juz.learning / juz.totalAyahsInJuz) * 100}%` }}
                        title="Në Mësim"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80">
                    <div className="flex space-x-2 text-[10px]">
                      <span className="text-emerald-400 font-semibold">{juz.consolidated} Forta</span>
                      <span className="text-blue-400">{juz.reviewing} Rishikim</span>
                    </div>

                    <button
                      onClick={() => setExpandedJuz(isExpanded ? null : juz.number)}
                      className="text-slate-400 hover:text-slate-200 flex items-center space-x-1 font-medium"
                    >
                      <span>Detaje</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>

                  {/* Expanded Juz Info */}
                  {isExpanded && (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs space-y-2 mt-2 animate-fadeIn">
                      <div className="text-[11px] text-slate-300">
                        Përfshin Suratet: <strong className="text-emerald-300">{juz.startSurahName} ({juz.startAyah})</strong> deri në <strong className="text-emerald-300">{juz.endSurahName} ({juz.endAyah})</strong>
                      </div>

                      {onSelectSurah && (
                        <button
                          onClick={() => onSelectSurah(juz.startSurah)}
                          className="w-full py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Hap Këtë Xhuz në Kuran
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: SURAH BREAKDOWN */}
      {activeTab === 'surahs' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Kërko suren (p.sh. Ya-Sin, 36, El-Bakarah)..."
                value={searchSurahQuery}
                onChange={e => setSearchSurahQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="text-xs text-slate-400">
              Shfaqen <strong className="text-slate-200">{surahStats.length}</strong> nga 114 Suret e Kuranit
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {surahStats.map(surah => (
              <div
                key={surah.number}
                className={`bg-slate-900 border p-3.5 rounded-2xl transition-all space-y-2.5 ${
                  surah.percent === 100
                    ? 'border-emerald-600/60 bg-emerald-950/20'
                    : surah.percent > 0
                    ? 'border-slate-700'
                    : 'border-slate-800/80 bg-slate-950/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 flex items-center justify-center font-mono text-xs font-bold">
                      {surah.number}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">
                        {surah.transliteration} <span className="text-[10px] text-slate-400">({surah.albanianName})</span>
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {surah.memorizedCount} / {surah.numberOfAyahs} Ajete • {surah.revelationType === 'Meccan' ? 'Mekkase' : 'Medinase'}
                      </p>
                    </div>
                  </div>

                  <span className="font-arabic text-base text-emerald-400" dir="rtl">
                    {surah.name}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Memorizuar</span>
                    <span className="font-bold text-emerald-400">{surah.percent}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ width: `${surah.percent}%` }}
                    />
                  </div>
                </div>

                {onSelectSurah && (
                  <button
                    onClick={() => onSelectSurah(surah.number)}
                    className="w-full py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-medium transition-colors"
                  >
                    Lexo këtë sure
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ECURIA & HISTORIKU I SESIONEVE */}
      {activeTab === 'history' && (
        <div className="space-y-5">
          {/* Status Breakdown Pie Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Brain className="w-4 h-4 text-emerald-400" />
                <span>Shpërndarja e Statusit të Ajeteve</span>
              </h3>

              {totalMemorizedAyahs > 0 ? (
                <div className="h-56 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-xs text-slate-500 italic">
                  Nuk ka ajete të memorizuara ende. Klikoni "Të Dhëna Shembull" lart për të parë vizualizimin.
                </div>
              )}
            </div>

            {/* Session Activity Trend Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Aktiviteti i Rishikimit (7 Ditët e Fundit)</span>
              </h3>

              <div className="h-56 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sessionTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="dayName" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                    />
                    <Area type="monotone" dataKey="Ajete të Rishikuara" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    <Area type="monotone" dataKey="Të Mbajtura Mend" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Sessions List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-md">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Historiku i Sesioneve të Fundit ({sessions.length})</span>
            </h3>

            {sessions.length > 0 ? (
              <div className="space-y-2">
                {sessions.slice(-5).reverse().map((sess, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">
                        Sesion {sess.type === 'REVIEW' ? 'Rishikimi' : 'Mësimi'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(sess.startedAt).toLocaleDateString('sq-AL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} • Kohëzgjatja: {Math.round(sess.durationSeconds / 60)} min
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono font-bold text-xs">
                      {sess.ayahsCovered ? sess.ayahsCovered.length : 0} Ajete
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-slate-500 italic bg-slate-950 rounded-xl border border-slate-800">
                Nuk ka sesione të regjistruara në historik.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DAILY REVIEW REMINDER SYSTEM */}
      {activeTab === 'reminders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5 shadow-lg max-w-2xl mx-auto">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="w-12 h-12 bg-emerald-950 border border-emerald-800 rounded-2xl flex items-center justify-center text-emerald-400">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 font-serif">
                Rikujtuesi Ditor i Hifzit (Daily Reminder)
              </h3>
              <p className="text-xs text-slate-400">
                Aktivizo njoftimin ditor për të mbajtur zakonin e rishikimit të ajeteve
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Toggle Switch */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200 text-sm">Statusi i Njoftimeve</div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  {reminderEnabled ? 'Rikujtuesi ditor është AKTIV' : 'Rikujtuesi ditor është I ÇAKTIVIZUAR'}
                </div>
              </div>

              <button
                onClick={handleToggleReminder}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  reminderEnabled
                    ? 'bg-emerald-600 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {reminderEnabled ? 'Aktivizuar' : 'Aktivizo'}
              </button>
            </div>

            {/* Time Picker */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="text-slate-200 font-semibold block">
                Zgjidh Orën e Rikujtuesit Ditor:
              </label>

              <div className="flex items-center space-x-3">
                <input
                  type="time"
                  value={reminderTime}
                  onChange={e => handleSaveReminderTime(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm font-mono text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                />

                <div className="flex items-center space-x-1.5 overflow-x-auto">
                  {['07:00', '13:30', '18:00', '21:00'].map(t => (
                    <button
                      key={t}
                      onClick={() => handleSaveReminderTime(t)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono font-medium transition-all ${
                        reminderTime === t
                          ? 'bg-emerald-600 text-slate-950 font-bold border-emerald-400'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Spaced Repetition Info Box */}
            <div className="bg-emerald-950/30 border border-emerald-800/60 p-4 rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-emerald-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Si funksionon Algoritmi i Përsëritjes me Hapësirë Kohore (Spaced Repetition)?</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Algoritmi i Hifzit llogarit kohën optimale për të rishikuar çdo ajet. Ajetet që i dini mirë rishikohen pas disa ditësh ose javësh, ndërsa ajetet që keni harruar risillen në radhë për çdo ditë për të forcuar kujtesën në afat të gjatë.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
