import React, { useState, useEffect, useMemo } from 'react';
import { HifzLearnView } from './HifzLearnView';
import { HifzReviewSession } from './HifzReviewSession';
import { MutashabihatView } from './MutashabihatView';
import { HifzAnalyticsView } from './HifzAnalyticsView';
import { HifzFlashcardView } from './HifzFlashcardView';
import { HifzAudioLibraryView } from './HifzAudioLibraryView';
import { ALL_SURAHS_META } from '../data/quranData';
import { ALL_JUZ_META } from '../data/juzData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  BookOpen,
  ShieldAlert,
  CheckCircle2,
  Play,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  BarChart3,
  Brain,
  Bell,
  BellRing,
  Clock,
  Calendar as CalendarIcon,
  Filter,
  RotateCcw,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  Award,
  Zap,
  Grid,
  Target,
  Trophy,
  Flame,
  Check,
  X,
  Edit3,
  Sliders,
  Music
} from 'lucide-react';
import { hifzDb, DEFAULT_HIFZ_SETTINGS, HifzSettings, AyahMemorizationRecord, SessionRecord } from '../services/hifzDb';
import { getReviewQueue } from '../services/hifzScheduler';

export interface SurahReviewSuggestion {
  surahNumber: number;
  transliteration: string;
  albanianName: string;
  arabicName: string;
  numberOfAyahsInSurah: number;
  memorizedAyahsCount: number;
  overdueAyahsCount: number;
  lastReviewedAt: number;
  daysSinceReview: number;
  urgency: 'URGENT' | 'RECOMMENDED' | 'UP_TO_DATE';
}

export interface JuzCompletionData {
  juzNumber: number;
  name: string;
  fullName: string;
  arabicName: string;
  completionPercent: number;
  memorizedCount: number;
  totalAyahs: number;
}

export interface DailyConsistencyData {
  dateKey: string;
  dayLabel: string;
  fullDate: string;
  ayahsReviewed: number;
  consistencyPercent: number;
  target: number;
}

export interface HeatmapDayData {
  dateKey: string;
  dayNumber: number;
  dayNameShort: string;
  fullDateStr: string;
  ayahsCount: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  isCurrentMonth: boolean;
  isToday: boolean;
}

// Helper to determine Juz for a given surah and ayah
function getJuzForSurahAyah(surah: number, ayah: number): number {
  for (const j of ALL_JUZ_META) {
    if (
      (surah > j.startSurah || (surah === j.startSurah && ayah >= j.startAyah)) &&
      (surah < j.endSurah || (surah === j.endSurah && ayah <= j.endAyah))
    ) {
      return j.number;
    }
  }
  return 30; // fallback
}

export const HifzModule: React.FC = () => {
  const [learningAyah, setLearningAyah] = useState<{ surah: number; ayah: number } | null>(null);
  const [reviewQueue, setReviewQueue] = useState<any[]>([]);
  const [activeReviewQueue, setActiveReviewQueue] = useState<any[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [showMutashabihat, setShowMutashabihat] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [showAudioLibrary, setShowAudioLibrary] = useState(false);
  const [overdueCount, setOverdueCount] = useState(0);
  const [settings, setSettings] = useState<HifzSettings>(DEFAULT_HIFZ_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [showOverride, setShowOverride] = useState(false);
  const [tempSurah, setTempSurah] = useState(114);
  const [tempAyah, setTempAyah] = useState(1);

  // Goal Setting Modal State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [editDailyTarget, setEditDailyTarget] = useState<number>(5);
  const [editWeeklyTarget, setEditWeeklyTarget] = useState<number>(30);

  // All Ayah Records & Sessions for Dashboard
  const [ayahRecords, setAyahRecords] = useState<AyahMemorizationRecord[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);

  // Recharts Dashboard Controls
  const [dashboardTab, setDashboardTab] = useState<'JUZ_BAR' | 'CONSISTENCY_LINE' | 'HEATMAP'>('HEATMAP');
  const [juzRangeFilter, setJuzRangeFilter] = useState<'ALL' | 'JUZ_1_15' | 'JUZ_16_30'>('ALL');
  const [useDemoData, setUseDemoData] = useState<boolean>(false);
  const [selectedHeatmapDay, setSelectedHeatmapDay] = useState<HeatmapDayData | null>(null);

  // Surah Suggestions & Notifications State
  const [surahSuggestions, setSurahSuggestions] = useState<SurahReviewSuggestion[]>([]);
  const [suggestionFilter, setSuggestionFilter] = useState<'ALL' | 'URGENT' | 'RECOMMENDED' | 'UP_TO_DATE'>('ALL');

  const loadData = async () => {
    setLoading(true);
    const s = await hifzDb.settings.get(1);
    if (s) {
      setSettings(s);
      setEditDailyTarget(s.dailyTargetAyahs || 5);
      setEditWeeklyTarget(s.weeklyTargetAyahs || 30);
    }

    const allRecords = await hifzDb.ayahRecords.toArray();
    const allSessions = await hifzDb.sessions.toArray();
    setAyahRecords(allRecords);
    setSessions(allSessions);

    const now = Date.now();

    // Overdue count calculation
    const overdueAyahs = allRecords.filter(r => new Date(r.dueDate).getTime() <= now);
    setOverdueCount(overdueAyahs.length);

    // General Queue
    const queue = await getReviewQueue('ADAPTIVE');
    setReviewQueue(queue);

    // Group by Surah for Suggestions System
    const surahMap = new Map<number, {
      records: AyahMemorizationRecord[];
      overdueCount: number;
      minLastReviewedAt: number;
    }>();

    allRecords.forEach(r => {
      const [sStr] = r.ayahKey.split(':');
      const surahNum = parseInt(sStr, 10);
      if (isNaN(surahNum)) return;

      if (!surahMap.has(surahNum)) {
        surahMap.set(surahNum, {
          records: [],
          overdueCount: 0,
          minLastReviewedAt: r.lastReviewedAt || r.createdAt || now
        });
      }

      const entry = surahMap.get(surahNum)!;
      entry.records.push(r);

      const isOverdue = (new Date(r.dueDate).getTime() || 0) <= now;
      if (isOverdue) entry.overdueCount++;

      const lastRev = r.lastReviewedAt || r.createdAt || now;
      if (lastRev < entry.minLastReviewedAt) {
        entry.minLastReviewedAt = lastRev;
      }
    });

    const suggestions: SurahReviewSuggestion[] = [];
    surahMap.forEach((data, surahNum) => {
      const meta = ALL_SURAHS_META.find(m => m.number === surahNum);
      if (!meta) return;

      const daysSinceReview = Math.max(0, Math.floor((now - data.minLastReviewedAt) / (1000 * 3600 * 24)));

      let urgency: 'URGENT' | 'RECOMMENDED' | 'UP_TO_DATE' = 'UP_TO_DATE';
      if (data.overdueCount > 0 || daysSinceReview >= 7) {
        urgency = 'URGENT';
      } else if (daysSinceReview >= 3) {
        urgency = 'RECOMMENDED';
      }

      suggestions.push({
        surahNumber: surahNum,
        transliteration: meta.transliteration,
        albanianName: meta.albanianName,
        arabicName: meta.name,
        numberOfAyahsInSurah: meta.numberOfAyahs,
        memorizedAyahsCount: data.records.length,
        overdueAyahsCount: data.overdueCount,
        lastReviewedAt: data.minLastReviewedAt,
        daysSinceReview,
        urgency
      });
    });

    // Sort by Urgency & Days Since Review
    suggestions.sort((a, b) => {
      const tierMap = { URGENT: 1, RECOMMENDED: 2, UP_TO_DATE: 3 };
      if (tierMap[a.urgency] !== tierMap[b.urgency]) {
        return tierMap[a.urgency] - tierMap[b.urgency];
      }
      return b.daysSinceReview - a.daysSinceReview;
    });

    setSurahSuggestions(suggestions);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [learningAyah, isReviewing]);

  // GOAL TARGET TRACKING CALCULATIONS
  const dailyTarget = settings.dailyTargetAyahs || 5;
  const weeklyTarget = settings.weeklyTargetAyahs || 30;

  const todayAyahsCompleted = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(s => new Date(s.startedAt).toISOString().split('T')[0] === todayStr);
    let count = 0;
    todaySessions.forEach(s => {
      count += (s.ayahsCovered ? s.ayahsCovered.length : 1);
    });

    if (count === 0 && useDemoData) {
      return 4; // realistic demo value
    }
    return count;
  }, [sessions, useDemoData]);

  const weeklyAyahsCompleted = useMemo(() => {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 3600 * 1000;
    const weeklySessions = sessions.filter(s => s.startedAt >= sevenDaysAgo);
    let count = 0;
    weeklySessions.forEach(s => {
      count += (s.ayahsCovered ? s.ayahsCovered.length : 1);
    });

    if (count === 0 && useDemoData) {
      return 22; // realistic demo value
    }
    return count;
  }, [sessions, useDemoData]);

  const dailyProgressPct = Math.min(100, Math.round((todayAyahsCompleted / Math.max(1, dailyTarget)) * 100));
  const weeklyProgressPct = Math.min(100, Math.round((weeklyAyahsCompleted / Math.max(1, weeklyTarget)) * 100));

  const handleSaveGoals = async () => {
    const updated: HifzSettings = {
      ...settings,
      dailyTargetAyahs: Math.max(1, editDailyTarget),
      weeklyTargetAyahs: Math.max(1, editWeeklyTarget)
    };
    await hifzDb.settings.put(updated);
    setSettings(updated);
    setShowGoalModal(false);
  };

  // CALCULATION 1: JUZ COMPLETION PERCENTAGE BAR CHART DATA
  const juzCompletionData = useMemo<JuzCompletionData[]>(() => {
    const memorizedPerJuz: Record<number, number> = {};
    for (let i = 1; i <= 30; i++) memorizedPerJuz[i] = 0;

    if (useDemoData && ayahRecords.length === 0) {
      return ALL_JUZ_META.map(j => {
        let pct = 0;
        if (j.number === 30) pct = 100;
        else if (j.number === 29) pct = 80;
        else if (j.number === 28) pct = 55;
        else if (j.number === 1) pct = 70;
        else if (j.number === 2) pct = 40;
        else if (j.number % 2 === 0) pct = Math.floor(Math.random() * 30);
        else pct = Math.floor(Math.random() * 15);

        const approxTotal = j.totalPages * 10;
        const memorized = Math.round((pct / 100) * approxTotal);

        return {
          juzNumber: j.number,
          name: `Xh${j.number}`,
          fullName: `Xhuzi ${j.number} (${j.transliteration})`,
          arabicName: j.nameAr,
          completionPercent: pct,
          memorizedCount: memorized,
          totalAyahs: approxTotal
        };
      });
    }

    ayahRecords.forEach(r => {
      const [sStr, aStr] = r.ayahKey.split(':');
      const s = parseInt(sStr, 10);
      const a = parseInt(aStr, 10);
      if (!isNaN(s) && !isNaN(a)) {
        const jNum = getJuzForSurahAyah(s, a);
        memorizedPerJuz[jNum] = (memorizedPerJuz[jNum] || 0) + 1;
      }
    });

    return ALL_JUZ_META.map(j => {
      const totalAyahsInJuz = j.totalPages * 10;
      const memorized = memorizedPerJuz[j.number] || 0;
      const pct = Math.min(100, Math.round((memorized / Math.max(1, totalAyahsInJuz)) * 100));

      return {
        juzNumber: j.number,
        name: `Xh${j.number}`,
        fullName: `Xhuzi ${j.number} (${j.transliteration})`,
        arabicName: j.nameAr,
        completionPercent: pct,
        memorizedCount: memorized,
        totalAyahs: totalAyahsInJuz
      };
    });
  }, [ayahRecords, useDemoData]);

  const filteredJuzData = useMemo(() => {
    if (juzRangeFilter === 'JUZ_1_15') return juzCompletionData.filter(j => j.juzNumber <= 15);
    if (juzRangeFilter === 'JUZ_16_30') return juzCompletionData.filter(j => j.juzNumber >= 16);
    return juzCompletionData;
  }, [juzCompletionData, juzRangeFilter]);

  // CALCULATION 2: DAILY CONSISTENCY LINE CHART DATA (LAST 14 DAYS)
  const dailyConsistencyData = useMemo<DailyConsistencyData[]>(() => {
    const days: DailyConsistencyData[] = [];
    const now = new Date();
    const targetDailyAyahs = settings.dailyTargetAyahs || 5;

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];

      const dayName = d.toLocaleDateString('sq-AL', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthShort = d.toLocaleDateString('sq-AL', { month: 'short' });
      const dayLabel = `${dayName} ${dayNum}`;

      const daysSessions = sessions.filter(s => {
        const sDate = new Date(s.startedAt).toISOString().split('T')[0];
        return sDate === dateKey;
      });

      let ayahsReviewed = 0;
      daysSessions.forEach(s => {
        ayahsReviewed += (s.ayahsCovered ? s.ayahsCovered.length : 0);
      });

      if (useDemoData && ayahsReviewed === 0) {
        const pseudoRandom = (i * 7 + 3) % 15;
        ayahsReviewed = pseudoRandom > 2 ? pseudoRandom : (i % 2 === 0 ? 12 : 5);
      }

      const consistencyPercent = Math.min(100, Math.round((ayahsReviewed / Math.max(1, targetDailyAyahs)) * 100));

      days.push({
        dateKey,
        dayLabel: `${dayName} ${dayNum}`,
        fullDate: `${dayName}, ${dayNum} ${monthShort}`,
        ayahsReviewed,
        consistencyPercent,
        target: targetDailyAyahs
      });
    }

    return days;
  }, [sessions, settings, useDemoData]);

  // CALCULATION 3: MONTHLY CONTRIBUTION HEATMAP GRID DATA
  const monthlyHeatmapData = useMemo<{
    daysGrid: HeatmapDayData[];
    activeDaysCount: number;
    totalMonthlyAyahs: number;
    maxDailyAyahs: number;
    monthNameStr: string;
  }>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const todayDateKey = now.toISOString().split('T')[0];

    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    const monthNameStr = now.toLocaleDateString('sq-AL', { month: 'long', year: 'numeric' });

    const activityMap: Record<string, number> = {};

    sessions.forEach(s => {
      const sDate = new Date(s.startedAt).toISOString().split('T')[0];
      const count = s.ayahsCovered ? s.ayahsCovered.length : 1;
      activityMap[sDate] = (activityMap[sDate] || 0) + count;
    });

    ayahRecords.forEach(r => {
      if (r.createdAt) {
        const cDate = new Date(r.createdAt).toISOString().split('T')[0];
        activityMap[cDate] = (activityMap[cDate] || 0) + 1;
      }
    });

    const daysGrid: HeatmapDayData[] = [];
    let activeDaysCount = 0;
    let totalMonthlyAyahs = 0;
    let maxDailyAyahs = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, month, day);
      const dateKey = d.toISOString().split('T')[0];
      const dayNameShort = d.toLocaleDateString('sq-AL', { weekday: 'short' });
      const fullDateStr = d.toLocaleDateString('sq-AL', { weekday: 'long', day: 'numeric', month: 'long' });

      let ayahsCount = activityMap[dateKey] || 0;

      if (useDemoData && ayahsCount === 0) {
        const pseudo = (day * 13 + month * 5) % 29;
        if (pseudo > 8) {
          ayahsCount = (pseudo % 18) + 1;
        }
      }

      if (ayahsCount > 0) {
        activeDaysCount++;
        totalMonthlyAyahs += ayahsCount;
        if (ayahsCount > maxDailyAyahs) maxDailyAyahs = ayahsCount;
      }

      let intensity: 0 | 1 | 2 | 3 | 4 = 0;
      if (ayahsCount >= 21) intensity = 4;
      else if (ayahsCount >= 13) intensity = 3;
      else if (ayahsCount >= 6) intensity = 2;
      else if (ayahsCount >= 1) intensity = 1;

      daysGrid.push({
        dateKey,
        dayNumber: day,
        dayNameShort,
        fullDateStr,
        ayahsCount,
        intensity,
        isCurrentMonth: true,
        isToday: dateKey === todayDateKey
      });
    }

    return {
      daysGrid,
      activeDaysCount,
      totalMonthlyAyahs,
      maxDailyAyahs,
      monthNameStr
    };
  }, [sessions, ayahRecords, useDemoData]);

  // Average Consistency Score
  const avgConsistencyScore = useMemo(() => {
    if (dailyConsistencyData.length === 0) return 0;
    const sum = dailyConsistencyData.reduce((acc, curr) => acc + curr.consistencyPercent, 0);
    return Math.round(sum / dailyConsistencyData.length);
  }, [dailyConsistencyData]);

  // Max streak calculation
  const currentStreakDays = useMemo(() => {
    let streak = 0;
    for (let i = dailyConsistencyData.length - 1; i >= 0; i--) {
      if (dailyConsistencyData[i].ayahsReviewed > 0) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [dailyConsistencyData]);

  const handleStartSpecificSurahReview = async (surahNumber: number) => {
    const allRecords = await hifzDb.ayahRecords.toArray();
    const surahAyahs = allRecords.filter(r => r.ayahKey.startsWith(`${surahNumber}:`));

    if (surahAyahs.length > 0) {
      setActiveReviewQueue(surahAyahs);
      setIsReviewing(true);
    }
  };

  const handleStartGeneralReview = () => {
    setActiveReviewQueue(reviewQueue);
    setIsReviewing(true);
  };

  if (learningAyah) {
    return (
      <HifzLearnView
        surahNumber={learningAyah.surah}
        ayahNumber={learningAyah.ayah}
        onComplete={async () => {
          setLearningAyah(null);
        }}
        onClose={() => setLearningAyah(null)}
      />
    );
  }

  if (isReviewing && activeReviewQueue.length > 0) {
    return (
      <HifzReviewSession
        queue={activeReviewQueue}
        onClose={() => setIsReviewing(false)}
        onComplete={() => {
          setIsReviewing(false);
          loadData();
        }}
      />
    );
  }

  if (showMutashabihat) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto pb-24">
        <button
          onClick={() => setShowMutashabihat(false)}
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kthehu te Hifz Dashboard</span>
        </button>
        <MutashabihatView onClose={() => setShowMutashabihat(false)} />
      </div>
    );
  }

  if (showAnalytics) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto pb-24">
        <button
          onClick={() => { setShowAnalytics(false); loadData(); }}
          className="inline-flex items-center space-x-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kthehu te Hifz Dashboard</span>
        </button>
        <HifzAnalyticsView />
      </div>
    );
  }

  if (showFlashcards) {
    return (
      <HifzFlashcardView onClose={() => { setShowFlashcards(false); loadData(); }} />
    );
  }

  if (showAudioLibrary) {
    return (
      <HifzAudioLibraryView onClose={() => { setShowAudioLibrary(false); loadData(); }} />
    );
  }

  const urgentSuggestionsCount = surahSuggestions.filter(s => s.urgency === 'URGENT').length;
  const recommendedSuggestionsCount = surahSuggestions.filter(s => s.urgency === 'RECOMMENDED').length;

  const filteredSuggestions = surahSuggestions.filter(s => {
    if (suggestionFilter === 'ALL') return true;
    return s.urgency === suggestionFilter;
  });

  const isLocked = overdueCount >= settings.reviewDebtThreshold;
  const toClear = Math.max(0, overdueCount - settings.reviewDebtThreshold + 1);
  const progressPercent = Math.min(100, Math.max(0, ((settings.reviewDebtThreshold - overdueCount) / settings.reviewDebtThreshold) * 100));

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-24 animate-fadeIn">
      {/* Title Header */}
      <div className="text-center space-y-2 py-6">
        <div className="w-16 h-16 bg-emerald-950 border border-emerald-800 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-serif text-slate-100 font-bold">Moduli i Hifzit</h2>
        <p className="text-xs text-slate-400">Sistemi Inteligjent i Memorizimit të Kuranit & Analitika e Konsistencës</p>
      </div>

      {/* DAILY & WEEKLY MEMORIZATION GOALS & TARGET TRACKING CARD */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border border-emerald-800/60 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Target className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-1.5">
                <span>Objektivat & Synimet e Memorizimit</span>
              </h3>
              <p className="text-xs text-slate-400">
                Përcaktoni dhe ndiqni synimet ditore e javore për përparim të vazhdueshëm
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditDailyTarget(dailyTarget);
              setEditWeeklyTarget(weeklyTarget);
              setShowGoalModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-emerald-300 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow shrink-0"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cakto Synimet</span>
          </button>
        </div>

        {/* 2-Column Progress Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Daily Goal Card */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-200">Synimi Ditor</span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {todayAyahsCompleted} / {dailyTarget} <span className="text-[10px] text-slate-400">ajete</span>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${dailyProgressPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Progresi: <strong className="text-slate-200 font-mono">{dailyProgressPct}%</strong></span>
              {todayAyahsCompleted >= dailyTarget ? (
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Arritur Sot! 🎉</span>
                </span>
              ) : (
                <span className="text-amber-300 font-medium">
                  Edhe {dailyTarget - todayAyahsCompleted} ajete sot
                </span>
              )}
            </div>
          </div>

          {/* Weekly Goal Card */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2.5 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">Synimi Javor</span>
              </div>
              <span className="font-mono text-xs font-bold text-emerald-400">
                {weeklyAyahsCompleted} / {weeklyTarget} <span className="text-[10px] text-slate-400">ajete</span>
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${weeklyProgressPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Progresi: <strong className="text-slate-200 font-mono">{weeklyProgressPct}%</strong></span>
              {weeklyAyahsCompleted >= weeklyTarget ? (
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>Objektivi u Arrit! 🏆</span>
                </span>
              ) : (
                <span className="text-emerald-300/90 font-medium">
                  Mbeten edhe {weeklyTarget - weeklyAyahsCompleted} ajete
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATION INDICATOR BANNER FOR DAILY SURAH REVIEW */}
      {surahSuggestions.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-800/80 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3 relative overflow-hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <BellRing className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-100">Rikujtuesi Ditor i Surave</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                    {urgentSuggestionsCount + recommendedSuggestionsCount} Sugjerime
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {urgentSuggestionsCount > 0
                    ? `Keni ${urgentSuggestionsCount} Sure me vonesë rishikimi. Rekomandohet rishikimi i tyre sot.`
                    : `Sot rekomandohet rishikimi i ${recommendedSuggestionsCount} Surave për të mbajtur memorizimin e fortë.`}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action for top urgent surah */}
          {surahSuggestions.length > 0 && (
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-200 font-medium">
                  Rekomandim parësor: <strong className="text-emerald-300">{surahSuggestions[0].transliteration}</strong> ({surahSuggestions[0].memorizedAyahsCount} ajete)
                </span>
              </div>
              <button
                onClick={() => handleStartSpecificSurahReview(surahSuggestions[0].surahNumber)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg font-bold text-[11px] transition-all flex items-center space-x-1"
              >
                <span>Rishiko</span>
                <Play className="w-3 h-3 fill-current" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* RECHARTS VISUAL DASHBOARD SECTION (JUZ COMPLETION BAR, DAILY CONSISTENCY LINE, CONTRIBUTION HEATMAP) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-100">Paneli Vizual i Hifzit</h3>
            </div>
            <p className="text-xs text-slate-400">
              Analitika vizuale e memorizimit: Harta e aktivitetit, % e Xhuzeve dhe konsistenca ditore
            </p>
          </div>

          {/* Demo Toggle & Expanded View Button */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setUseDemoData(!useDemoData)}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1 transition-colors ${
                useDemoData
                  ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Shfaq të dhëna testuese për grafikët"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{useDemoData ? 'Të Dhëna Demo (Aktiv)' : 'Shfaq Demo'}</span>
            </button>

            <button
              onClick={() => setShowAnalytics(true)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center space-x-1 transition-colors"
            >
              <span>Shiko Analitikën e Plotë</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dashboard Top KPI Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-0.5">
            <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold flex items-center space-x-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Seria e Rishikimit (Streak)</span>
            </div>
            <div className="text-lg font-bold font-mono text-amber-400 flex items-baseline space-x-1">
              <span>{currentStreakDays}</span>
              <span className="text-xs text-slate-400 font-normal">ditë radhazi</span>
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-0.5">
            <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold flex items-center space-x-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>Konsistenca Mesatare</span>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              {avgConsistencyScore}%
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-0.5">
            <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold flex items-center space-x-1">
              <Layers className="w-3 h-3 text-blue-400" />
              <span>Ajete të Memorizuara</span>
            </div>
            <div className="text-lg font-bold font-mono text-slate-100 flex items-baseline space-x-1">
              <span>{ayahRecords.length}</span>
              <span className="text-xs text-slate-500 font-normal">/ 6,236</span>
            </div>
          </div>
        </div>

        {/* Dashboard Tab Navigation Buttons */}
        <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <div className="grid grid-cols-3 gap-1 w-full">
            <button
              onClick={() => setDashboardTab('HEATMAP')}
              className={`py-2 px-2.5 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                dashboardTab === 'HEATMAP'
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="truncate">Harta e Aktivitetit</span>
            </button>

            <button
              onClick={() => setDashboardTab('JUZ_BAR')}
              className={`py-2 px-2.5 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                dashboardTab === 'JUZ_BAR'
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="truncate">Xhuzet (%)</span>
            </button>

            <button
              onClick={() => setDashboardTab('CONSISTENCY_LINE')}
              className={`py-2 px-2.5 rounded-lg font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                dashboardTab === 'CONSISTENCY_LINE'
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="truncate">Konsistenca</span>
            </button>
          </div>
        </div>

        {/* CHART DISPLAY VIEW 1: VISUAL CONTRIBUTION HEAT MAP */}
        {dashboardTab === 'HEATMAP' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-slate-200 flex items-center space-x-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Harta e Aktivitetit Ditor: <strong className="text-emerald-300 capitalize">{monthlyHeatmapData.monthNameStr}</strong></span>
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Shkalla e ngjyrave tregon intensitetin e ajeteve të rishikuara ose memorizuara çdo ditë
                </p>
              </div>

              {/* Monthly Stats Summary Pill */}
              <div className="flex items-center space-x-2 text-[11px] font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-400">Ditë aktive: <strong className="text-emerald-400">{monthlyHeatmapData.activeDaysCount}</strong></span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Total: <strong className="text-emerald-400">{monthlyHeatmapData.totalMonthlyAyahs} ajete</strong></span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-3">
              {/* Day Labels Row */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono text-slate-400 pb-1 border-b border-slate-800/60">
                <span>Hën</span>
                <span>Mar</span>
                <span>Mër</span>
                <span>Enj</span>
                <span>Pre</span>
                <span>Sht</span>
                <span>Di</span>
              </div>

              {/* Day Cells Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {monthlyHeatmapData.daysGrid.map((day) => {
                  let bgClasses = 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700';
                  if (day.intensity === 1) bgClasses = 'bg-emerald-950/90 border-emerald-900/80 text-emerald-400 font-semibold hover:border-emerald-700';
                  if (day.intensity === 2) bgClasses = 'bg-emerald-800/80 border-emerald-600/80 text-emerald-100 font-bold hover:border-emerald-500';
                  if (day.intensity === 3) bgClasses = 'bg-emerald-600 border-emerald-500 text-slate-950 font-bold hover:bg-emerald-500';
                  if (day.intensity === 4) bgClasses = 'bg-emerald-400 border-emerald-300 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20 hover:bg-emerald-300';

                  const isSelected = selectedHeatmapDay?.dateKey === day.dateKey;

                  return (
                    <button
                      key={day.dateKey}
                      onClick={() => setSelectedHeatmapDay(day)}
                      className={`h-9 rounded-lg border text-xs flex flex-col items-center justify-center relative transition-all duration-150 transform hover:scale-105 active:scale-95 ${bgClasses} ${
                        day.isToday ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-slate-950' : ''
                      } ${isSelected ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950 scale-105' : ''}`}
                    >
                      <span className="text-[11px] leading-none">{day.dayNumber}</span>
                      {day.ayahsCount > 0 && (
                        <span className="text-[9px] font-mono opacity-90 leading-none mt-0.5">
                          {day.ayahsCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Heatmap Legend */}
              <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 gap-2">
                <span className="font-medium">Intensiteti i Mësimit:</span>
                <div className="flex items-center space-x-1.5 font-mono">
                  <span className="text-slate-500">Më pak</span>
                  <div className="w-3.5 h-3.5 rounded bg-slate-900 border border-slate-800" title="0 Ajete" />
                  <div className="w-3.5 h-3.5 rounded bg-emerald-950 border border-emerald-900" title="1-5 Ajete" />
                  <div className="w-3.5 h-3.5 rounded bg-emerald-800 border border-emerald-600" title="6-12 Ajete" />
                  <div className="w-3.5 h-3.5 rounded bg-emerald-600 border border-emerald-500" title="13-20 Ajete" />
                  <div className="w-3.5 h-3.5 rounded bg-emerald-400 border border-emerald-300" title="21+ Ajete" />
                  <span className="text-emerald-400 font-bold">Më shumë</span>
                </div>
              </div>

              {/* Selected Day Details Panel */}
              {selectedHeatmapDay && (
                <div className="mt-3 bg-slate-900 p-3 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs animate-fadeIn">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="capitalize">{selectedHeatmapDay.fullDateStr}</span>
                      {selectedHeatmapDay.isToday && (
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] rounded font-bold">Sot</span>
                      )}
                    </div>
                    <div className="text-slate-300 text-[11px]">
                      Aktiviteti ditor: <strong className="text-emerald-400 font-mono">{selectedHeatmapDay.ayahsCount} ajete</strong>
                      {selectedHeatmapDay.ayahsCount === 0 ? ' (Asnjë rishikim gjatë kësaj dite)' : ' të rishikuara ose memorizuara'}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedHeatmapDay(null)}
                    className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 rounded bg-slate-800"
                  >
                    Mbyll
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CHART DISPLAY VIEW 2: JUZ COMPLETION BAR CHART */}
        {dashboardTab === 'JUZ_BAR' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Përsimi për 30 Xhuzet e Kuranit</span>

              {/* Range Filters */}
              <div className="flex items-center space-x-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => setJuzRangeFilter('ALL')}
                  className={`px-2 py-0.5 rounded ${juzRangeFilter === 'ALL' ? 'bg-slate-800 text-slate-100 font-bold' : 'text-slate-400'}`}
                >
                  30 Xhuze
                </button>
                <button
                  onClick={() => setJuzRangeFilter('JUZ_1_15')}
                  className={`px-2 py-0.5 rounded ${juzRangeFilter === 'JUZ_1_15' ? 'bg-slate-800 text-slate-100 font-bold' : 'text-slate-400'}`}
                >
                  Xh 1-15
                </button>
                <button
                  onClick={() => setJuzRangeFilter('JUZ_16_30')}
                  className={`px-2 py-0.5 rounded ${juzRangeFilter === 'JUZ_16_30' ? 'bg-slate-800 text-slate-100 font-bold' : 'text-slate-400'}`}
                >
                  Xh 16-30
                </button>
              </div>
            </div>

            <div className="h-64 w-full bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredJuzData} margin={{ top: 15, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    unit="%"
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as JuzCompletionData;
                        return (
                          <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs space-y-1 shadow-2xl">
                            <div className="font-bold text-emerald-400">{data.fullName}</div>
                            <div className="text-slate-300 font-arabic text-sm" dir="rtl">{data.arabicName}</div>
                            <div className="text-slate-200">
                              Kompletueshmëria: <strong className="text-emerald-400 font-mono">{data.completionPercent}%</strong>
                            </div>
                            <div className="text-slate-400 text-[11px]">
                              {data.memorizedCount} nga ~{data.totalAyahs} ajete të memorizuara
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="completionPercent" radius={[4, 4, 0, 0]}>
                    {filteredJuzData.map((entry, index) => (
                      <Cell
                        key={`juz-cell-${index}`}
                        fill={
                          entry.completionPercent === 100
                            ? '#10b981'
                            : entry.completionPercent > 50
                            ? '#34d399'
                            : entry.completionPercent > 0
                            ? '#059669'
                            : '#1e293b'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* CHART DISPLAY VIEW 3: DAILY CONSISTENCY LINE CHART */}
        {dashboardTab === 'CONSISTENCY_LINE' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Përparimi i Rishikimeve & Konsistenca Ditore (14 Ditët e Fundit)</span>
              <span className="text-[11px] font-mono text-emerald-400">Synimi Ditor: {dailyTarget} Ajete</span>
            </div>

            <div className="h-64 w-full bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyConsistencyData} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="dayLabel" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as DailyConsistencyData;
                        return (
                          <div className="bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs space-y-1 shadow-2xl">
                            <div className="font-bold text-slate-100">{data.fullDate}</div>
                            <div className="text-emerald-400">
                              Konsistenca: <strong className="font-mono">{data.consistencyPercent}%</strong>
                            </div>
                            <div className="text-blue-400">
                              Ajete të rishikuara: <strong className="font-mono">{data.ayahsReviewed}</strong> (Synimi: {data.target})
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Line
                    type="monotone"
                    dataKey="consistencyPercent"
                    name="Konsistenca Ditore (%)"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6, fill: '#34d399' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ayahsReviewed"
                    name="Ajete të Rishikuara"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ fill: '#3b82f6', r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* OVERDUE LOCK / REVIEW PROMPT */}
      {isLocked && !showOverride ? (
        <div className="bg-amber-950/20 border border-amber-900/50 rounded-2xl p-6 shadow-lg text-center space-y-6">
          <div className="w-12 h-12 bg-amber-900/40 rounded-full flex items-center justify-center mx-auto text-amber-500">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-medium text-amber-400">Mbroni Memorizimin Tuaj</h3>
            <p className="text-slate-300 text-xs">
              Keni <strong className="text-white">{overdueCount}</strong> ajete që presin për rishikim.
              Forconi atë që keni mësuar së pari — ajetet e reja zhbllokohen pasi të rishikoni <strong className="text-white">{toClear}</strong> prej tyre.
            </p>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4 overflow-hidden">
            <div className="bg-amber-500 h-1.5 rounded-full transition-all" style={{ width: `${Math.max(5, progressPercent)}%` }} />
          </div>

          <button
            onClick={handleStartGeneralReview}
            className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-amber-900/20 flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Rishiko Tani</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm("A jeni të sigurt? Shtimi i materialit të ri gjatë kohës që keni borxh rishikimi mund të dëmtojë ruajtjen në afat të gjatë. Dëshironi të vazhdoni?")) {
                setShowOverride(true);
              }
            }}
            className="text-xs text-slate-500 hover:text-slate-400 underline decoration-slate-600 underline-offset-4"
          >
            Kapërce kufizimin dhe mëso material të ri gjithsesi
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* GENERAL OVERDUE BANNER */}
          {overdueCount > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-lg flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-200">Presin për Rishikim</h3>
                <p className="text-slate-400 text-xs">{overdueCount} ajete presin në radhë</p>
              </div>
              <button
                onClick={handleStartGeneralReview}
                className="px-5 py-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 rounded-xl font-semibold text-xs transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Rishiko Radhën</span>
              </button>
            </div>
          )}

          {overdueCount === 0 && !loading && (
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-5 text-center space-y-1.5">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-emerald-400">Të gjitha rishikimet u kryen!</h3>
              <p className="text-xs text-emerald-500/70">Kujtesa juaj është e fortë sot.</p>
            </div>
          )}

          {showOverride && (
            <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-xl flex items-start space-x-3 text-left">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-400">Kapërcimi Aktiv</p>
                <p className="text-xs text-red-300/70">Mësimi i materialit të ri me rishikime pezull ndikon në ruajtjen e memories.</p>
              </div>
            </div>
          )}

          {/* DETAILED SURAH REVIEW SUGGESTIONS LIST / INDICATORS */}
          {surahSuggestions.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span>Indikatorët e Rishikimit sipas Surave</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Sugjerime të kalkuluara nga data e fundit e rishikimit të secilës sure
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
                  <button
                    onClick={() => setSuggestionFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      suggestionFilter === 'ALL'
                        ? 'bg-slate-800 text-slate-100 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Gjithsej ({surahSuggestions.length})
                  </button>
                  <button
                    onClick={() => setSuggestionFilter('URGENT')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      suggestionFilter === 'URGENT'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🔴 Urgent ({urgentSuggestionsCount})
                  </button>
                  <button
                    onClick={() => setSuggestionFilter('RECOMMENDED')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      suggestionFilter === 'RECOMMENDED'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🟡 Rekomanduar ({recommendedSuggestionsCount})
                  </button>
                </div>
              </div>

              {/* Suggestions Cards */}
              <div className="space-y-2.5">
                {filteredSuggestions.map(surah => {
                  const isUrgent = surah.urgency === 'URGENT';
                  const isRecommended = surah.urgency === 'RECOMMENDED';

                  return (
                    <div
                      key={surah.surahNumber}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isUrgent
                          ? 'bg-rose-950/20 border-rose-900/50 hover:border-rose-700/60'
                          : isRecommended
                          ? 'bg-amber-950/15 border-amber-900/40 hover:border-amber-700/50'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center font-mono text-xs font-bold">
                            {surah.surahNumber}
                          </span>
                          <h4 className="text-xs font-bold text-slate-100">
                            {surah.transliteration} <span className="text-slate-400 font-normal">({surah.albanianName})</span>
                          </h4>
                          <span className="font-arabic text-sm text-emerald-400 font-medium" dir="rtl">
                            {surah.arabicName}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          {/* Urgency Badge */}
                          {isUrgent && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-950 text-rose-300 border border-rose-800 font-semibold text-[10px] flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              <span>Rishikim Urgent ({surah.overdueAyahsCount > 0 ? `${surah.overdueAyahsCount} ajete jashtë afatit` : 'Pa rishikuar prej kohësh'})</span>
                            </span>
                          )}

                          {isRecommended && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 border border-amber-800 font-semibold text-[10px] flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              <span>E Rekomanduar</span>
                            </span>
                          )}

                          {!isUrgent && !isRecommended && (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold text-[10px] flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Në Rregull</span>
                            </span>
                          )}

                          <span className="text-slate-400">
                            Rishikuar para: <strong className="text-slate-200">{surah.daysSinceReview === 0 ? 'Sot' : `${surah.daysSinceReview} ditësh`}</strong>
                          </span>
                          <span className="text-slate-500">• {surah.memorizedAyahsCount} ajete të memorizuara</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartSpecificSurahReview(surah.surahNumber)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center justify-center space-x-1.5 shadow ${
                          isUrgent
                            ? 'bg-rose-600 hover:bg-rose-500 text-slate-950'
                            : isRecommended
                            ? 'bg-amber-600 hover:bg-amber-500 text-slate-950'
                            : 'bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Rishiko Surën</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* LEARN NEW AYAH CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-slate-200 mb-2">Mëso Ajet të Ri</h3>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">Sureja (1-114)</label>
                <input
                  type="number" min={1} max={114}
                  value={tempSurah} onChange={e => setTempSurah(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-400 mb-1 block">Ajeti (1-286)</label>
                <input
                  type="number" min={1} max={286}
                  value={tempAyah} onChange={e => setTempAyah(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                />
              </div>
            </div>
            <button
              onClick={() => setLearningAyah({ surah: tempSurah, ayah: tempAyah })}
              className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-lg shadow-emerald-900/20"
            >
              Fillo Mësimin e Ajetit
            </button>
          </div>

          {/* FLASHCARD GENERATOR ENTRY CARD */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-800/60 rounded-2xl p-6 shadow-lg space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-900/40 border border-emerald-800/50 rounded-xl text-emerald-400">
                <Brain className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-emerald-300">Gjeneruesi i Flashcards (Kartat e Kujtesës)</h3>
                <p className="text-xs text-slate-400">Testoni kujtesën e ajeteve duke parë fjalët e para të ajetit dhe duke zbuluar tekstin e plotë</p>
              </div>
            </div>
            <button
              onClick={() => setShowFlashcards(true)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/20 flex items-center justify-center space-x-1.5"
            >
              <Brain className="w-4 h-4" />
              <span>Fillo Testin me Flashcards</span>
            </button>
          </div>

          {/* AUDIO RECITATIONS LIBRARY & QARIS CARD */}
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-800/60 rounded-2xl p-6 shadow-lg space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-900/40 border border-emerald-800/50 rounded-xl text-emerald-400">
                <Music className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-emerald-300">Libraria e Audios & Karitë (Lexuesit)</h3>
                <p className="text-xs text-slate-400">Kërkoni audio recitimet sipas sureve, dëgjoni ajet për ajet dhe ruani lexuesit tuaj të preferuar</p>
              </div>
            </div>
            <button
              onClick={() => setShowAudioLibrary(true)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/20 flex items-center justify-center space-x-1.5"
            >
              <Music className="w-4 h-4" />
              <span>Hap Librarinë e Audios</span>
            </button>
          </div>

          {/* HIFZ ANALYTICS ENTRY CARD */}
          <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-2xl p-6 shadow-lg space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-900/40 border border-emerald-800/50 rounded-xl text-emerald-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-emerald-300">Statistikat e Memorizimit (Hifz Analytics)</h3>
                <p className="text-xs text-slate-400">Grafikë sipas 30 Xhuzeve & Surave, analitika e ruajtjes dhe rikujtuesi ditor</p>
              </div>
            </div>
            <button
              onClick={() => setShowAnalytics(true)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-900/20 flex items-center justify-center space-x-1.5"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Hap Grafikët & Analitikën e Hifzit</span>
            </button>
          </div>

          {/* MUTASHABIHAT ENTRY CARD */}
          <div className="bg-amber-950/20 border border-amber-900/40 rounded-2xl p-6 shadow-lg space-y-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-900/40 border border-amber-800/50 rounded-xl text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-amber-300">Ajete të Ngjashme (Mutashabihat)</h3>
                <p className="text-xs text-slate-400">Krahaso ajetet që ngjajnë dhe provo veten me drill test</p>
              </div>
            </div>
            <button
              onClick={() => setShowMutashabihat(true)}
              className="w-full py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-medium transition-colors"
            >
              Hap Modulin Mutashabihat & Drill
            </button>
          </div>
        </div>
      )}

      {/* GOAL CUSTOMIZATION MODAL */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">Cakto Synimet e Memorizimit</h3>
              </div>
              <button
                onClick={() => setShowGoalModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg bg-slate-950 border border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Përzgjidhni sa ajete dëshironi të memorizoni ose rishikoni çdo ditë dhe javë:
            </p>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">Planifikime të Gatshme</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => { setEditDailyTarget(3); setEditWeeklyTarget(20); }}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left space-y-0.5"
                >
                  <div className="font-bold text-emerald-400">Filletar</div>
                  <div className="text-[10px] text-slate-400">3 ajete/ditë • 20/javë</div>
                </button>
                <button
                  type="button"
                  onClick={() => { setEditDailyTarget(5); setEditWeeklyTarget(30); }}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left space-y-0.5"
                >
                  <div className="font-bold text-emerald-400">Standard</div>
                  <div className="text-[10px] text-slate-400">5 ajete/ditë • 30/javë</div>
                </button>
                <button
                  type="button"
                  onClick={() => { setEditDailyTarget(10); setEditWeeklyTarget(60); }}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left space-y-0.5"
                >
                  <div className="font-bold text-amber-400">Intensiv</div>
                  <div className="text-[10px] text-slate-400">10 ajete/ditë • 60/javë</div>
                </button>
                <button
                  type="button"
                  onClick={() => { setEditDailyTarget(20); setEditWeeklyTarget(120); }}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-left space-y-0.5"
                >
                  <div className="font-bold text-rose-400">Hafiz Pro</div>
                  <div className="text-[10px] text-slate-400">20 ajete/ditë • 120/javë</div>
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Synimi Ditor (Ajete në Ditë)</span>
                  <span className="font-mono text-emerald-400 font-bold">{editDailyTarget} ajete</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={editDailyTarget}
                  onChange={(e) => setEditDailyTarget(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Synimi Javor (Ajete në Javë)</span>
                  <span className="font-mono text-emerald-400 font-bold">{editWeeklyTarget} ajete</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={editWeeklyTarget}
                  onChange={(e) => setEditWeeklyTarget(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowGoalModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 text-xs font-semibold transition-colors"
              >
                Anulo
              </button>
              <button
                type="button"
                onClick={handleSaveGoals}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-colors flex items-center space-x-1.5 shadow"
              >
                <Check className="w-4 h-4" />
                <span>Ruaj Synimet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
