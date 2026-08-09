import React, { useState, useEffect } from 'react';
import { ALL_JUZ_META, JuzMeta, KHATAM_DUA } from '../data/juzData';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Minus,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle,
  X,
  Book,
  Heart,
  Share2
} from 'lucide-react';

export interface KhatamPlan {
  id: string;
  title: string;
  targetDays: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  planType: 'pages_per_day' | 'juz_per_day' | 'after_prayers';
  dailyTargetPages: number;
  pagesRead: number;
  logs: { date: string; pages: number }[];
  completedJuz: number[]; // Array of Juz numbers (1-30) that are done
  inProgressJuz?: number[];
  createdAt: number;
}

interface KhatamTrackerViewProps {
  onSelectSurah?: (surahNumber: number) => void;
}

const DEFAULT_PLAN: KhatamPlan = {
  id: 'default_plan',
  title: 'Khatmi i Kuranit (30 Ditë)',
  targetDays: 30,
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  planType: 'pages_per_day',
  dailyTargetPages: 20,
  pagesRead: 0,
  logs: [],
  completedJuz: [],
  inProgressJuz: [],
  createdAt: Date.now()
};

const TOTAL_PAGES = 604;
const TOTAL_JUZ = 30;

export const KhatamTrackerView: React.FC<KhatamTrackerViewProps> = ({ onSelectSurah }) => {
  const [plan, setPlan] = useState<KhatamPlan>(() => {
    try {
      const saved = localStorage.getItem('hayat_khatam_active_plan');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading khatam plan:', e);
    }
    return DEFAULT_PLAN;
  });

  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [showDuaModal, setShowDuaModal] = useState<boolean>(false);
  const [juzFilter, setJuzFilter] = useState<'all' | 'completed' | 'in_progress' | 'unread'>('all');

  // Form State for creating/editing plan
  const [targetDaysInput, setTargetDaysInput] = useState<number>(plan.targetDays || 30);
  const [planTypeInput, setPlanTypeInput] = useState<'pages_per_day' | 'juz_per_day' | 'after_prayers'>(plan.planType || 'pages_per_day');
  const [pagesPerPrayerInput, setPagesPerPrayerInput] = useState<number>(4); // Default 4 pages after 5 prayers = 20 pages/day

  // Quick log pages state
  const [quickAddPages, setQuickAddPages] = useState<number>(1);
  const [showSuccessToast, setShowSuccessToast] = useState<string | null>(null);

  // Save plan to localStorage on edit
  useEffect(() => {
    try {
      localStorage.setItem('hayat_khatam_active_plan', JSON.stringify(plan));
    } catch (e) {
      console.warn('Failed to save khatam plan:', e);
    }
  }, [plan]);

  // Toast auto-hide
  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => setShowSuccessToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  // Derived Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const totalPagesRead = Math.min(TOTAL_PAGES, Math.max(0, plan.pagesRead));
  const overallPercentage = Math.round((totalPagesRead / TOTAL_PAGES) * 100);

  // Calculate days elapsed and remaining
  const startDateObj = new Date(plan.startDate);
  const endDateObj = new Date(plan.endDate);
  const nowObj = new Date();
  
  const totalDurationDays = Math.max(1, Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 3600 * 24)));
  const daysPassed = Math.max(0, Math.floor((nowObj.getTime() - startDateObj.getTime()) / (1000 * 3600 * 24)));
  const daysRemaining = Math.max(0, Math.ceil((endDateObj.getTime() - nowObj.getTime()) / (1000 * 3600 * 24)));

  // Target progress vs actual
  const expectedPagesToDate = Math.min(TOTAL_PAGES, Math.round(daysPassed * plan.dailyTargetPages));
  const pageDiff = totalPagesRead - expectedPagesToDate;

  let paceStatus: 'ahead' | 'on_track' | 'behind' = 'on_track';
  if (pageDiff >= 10) paceStatus = 'ahead';
  else if (pageDiff < -10) paceStatus = 'behind';

  // Recommended catch-up daily rate
  const neededDailyPages = daysRemaining > 0 
    ? Math.ceil((TOTAL_PAGES - totalPagesRead) / daysRemaining) 
    : (TOTAL_PAGES - totalPagesRead);

  // Log for today
  const todayLog = plan.logs.find(l => l.date === todayStr);
  const todayPagesRead = todayLog ? todayLog.pages : 0;

  // Handlers
  const handleSavePlan = () => {
    let dailyTarget = 20;
    if (planTypeInput === 'pages_per_day') {
      dailyTarget = Math.ceil(TOTAL_PAGES / targetDaysInput);
    } else if (planTypeInput === 'juz_per_day') {
      dailyTarget = Math.ceil(TOTAL_PAGES / targetDaysInput);
    } else if (planTypeInput === 'after_prayers') {
      dailyTarget = pagesPerPrayerInput * 5;
    }

    const start = new Date();
    const end = new Date(start.getTime() + targetDaysInput * 24 * 60 * 60 * 1000);

    const updated: KhatamPlan = {
      ...plan,
      targetDays: targetDaysInput,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      planType: planTypeInput,
      dailyTargetPages: dailyTarget
    };

    setPlan(updated);
    setShowPlanModal(false);
    setShowSuccessToast('Plani i ri i Khatmit u ruajt me sukses!');
  };

  const handleLogPages = (amount: number) => {
    if (amount <= 0 && todayPagesRead + amount < 0) return;

    const existingIndex = plan.logs.findIndex(l => l.date === todayStr);
    let updatedLogs = [...plan.logs];
    
    if (existingIndex >= 0) {
      const current = updatedLogs[existingIndex].pages;
      const newPages = Math.max(0, current + amount);
      if (newPages === 0) {
        updatedLogs = updatedLogs.filter(l => l.date !== todayStr);
      } else {
        updatedLogs[existingIndex] = { date: todayStr, pages: newPages };
      }
    } else if (amount > 0) {
      updatedLogs.push({ date: todayStr, pages: amount });
    }

    const newTotalPages = Math.min(TOTAL_PAGES, Math.max(0, plan.pagesRead + amount));

    // Auto update completed Juz based on pages read if appropriate
    let newCompletedJuz = [...plan.completedJuz];
    ALL_JUZ_META.forEach(juz => {
      if (newTotalPages >= juz.endPage && !newCompletedJuz.includes(juz.number)) {
        newCompletedJuz.push(juz.number);
      }
    });

    setPlan({
      ...plan,
      pagesRead: newTotalPages,
      logs: updatedLogs,
      completedJuz: newCompletedJuz
    });

    setShowSuccessToast(`U regjistruan ${amount > 0 ? '+' : ''}${amount} faqe!`);
  };

  const toggleJuzStatus = (juzNumber: number) => {
    const isCompleted = plan.completedJuz.includes(juzNumber);
    let newCompleted = [...plan.completedJuz];
    
    if (isCompleted) {
      newCompleted = newCompleted.filter(n => n !== juzNumber);
    } else {
      newCompleted.push(juzNumber);
    }

    // Estimate total pages from completed juz
    const estimatedPages = Math.min(TOTAL_PAGES, newCompleted.length * 20);

    setPlan({
      ...plan,
      completedJuz: newCompleted,
      pagesRead: Math.max(plan.pagesRead, estimatedPages)
    });

    setShowSuccessToast(
      isCompleted 
        ? `Xhuzi ${juzNumber} u hoq nga të përfunduarat.` 
        : `Mashallah! Xhuzi ${juzNumber} u markua si i përfunduar!`
    );
  };

  const handleResetPlan = () => {
    if (window.confirm('A jeni të sigurt që dëshironi të rivendosni progresin e këtij Khatmi?')) {
      setPlan({
        ...DEFAULT_PLAN,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      setShowSuccessToast('Progresi i Khatmit u rivendos.');
    }
  };

  // Filter Juz cards
  const filteredJuzList = ALL_JUZ_META.filter(juz => {
    const isCompleted = plan.completedJuz.includes(juz.number);
    const isInProgress = !isCompleted && totalPagesRead >= juz.startPage && totalPagesRead < juz.endPage;
    
    if (juzFilter === 'completed') return isCompleted;
    if (juzFilter === 'in_progress') return isInProgress;
    if (juzFilter === 'unread') return !isCompleted && !isInProgress;
    return true;
  });

  return (
    <div className="space-y-5 pb-8 animate-fadeIn">
      {/* Toast notification */}
      {showSuccessToast && (
        <div className="fixed top-16 right-4 z-50 bg-emerald-600 text-slate-950 px-4 py-2.5 rounded-xl shadow-xl font-medium text-xs flex items-center space-x-2 border border-emerald-400/50 animate-bounce">
          <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
          <span>{showSuccessToast}</span>
        </div>
      )}

      {/* Header Title Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-800/60 p-5 rounded-2xl relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-semibold uppercase tracking-wider">
                Planifikuesi i Kuranit
              </span>
              <span className="text-xs text-slate-400">• Hatme / Khatam Tracker</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-serif mt-1">
              {plan.title}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Data e përfundimit: <span className="font-semibold text-emerald-300">{plan.endDate}</span> ({daysRemaining} ditë të mbetura)
            </p>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setShowDuaModal(true)}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Dua Khatm</span>
            </button>

            <button
              onClick={() => setShowPlanModal(true)}
              className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Ndrysho Planin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Progress Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
                Progresi i Përgjithshëm
              </span>
              <h3 className="text-2xl font-extrabold text-slate-100 font-mono mt-0.5">
                {overallPercentage}% <span className="text-xs font-normal text-slate-400">({totalPagesRead} / {TOTAL_PAGES} Faqe)</span>
              </h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${overallPercentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>{plan.completedJuz.length} nga 30 Xhuze</span>
              <span>{TOTAL_PAGES - totalPagesRead} Faqe mbetur</span>
            </div>
          </div>
        </div>

        {/* Pace & Rhythm Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
                Ritmi i Leximit
              </span>
              <div className="flex items-center space-x-2 mt-1">
                {paceStatus === 'ahead' && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Para Planit!</span>
                  </span>
                )}
                {paceStatus === 'on_track' && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold flex items-center space-x-1">
                    <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                    <span>Në Orar</span>
                  </span>
                )}
                {paceStatus === 'behind' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Prapa Planit</span>
                  </span>
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-amber-400 font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-xs space-y-1">
            <div className="flex justify-between text-slate-300">
              <span className="opacity-80">Synimi ditor:</span>
              <span className="font-bold text-emerald-400">{plan.dailyTargetPages} faqe/ditë</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="opacity-80">Doza rekomanduar:</span>
              <span className="font-bold text-amber-300">{neededDailyPages} faqe/ditë</span>
            </div>
          </div>
        </div>

        {/* Daily Quick Logger Card */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] text-slate-400 uppercase font-mono tracking-wider font-semibold">
                Leximi Sot
              </span>
              <h3 className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
                {todayPagesRead} <span className="text-xs font-normal text-slate-400">/ {plan.dailyTargetPages} Faqe</span>
              </h3>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleLogPages(-1)}
                className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center justify-center transition-colors"
                title="Zbrit 1 faqe"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleLogPages(1)}
                className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold flex items-center justify-center transition-colors shadow"
                title="Shto 1 faqe"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleLogPages(5)}
              className="flex-1 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-medium transition-colors"
            >
              +5 Faqe
            </button>
            <button
              onClick={() => handleLogPages(10)}
              className="flex-1 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 font-medium transition-colors"
            >
              +10 Faqe
            </button>
            <button
              onClick={() => handleLogPages(plan.dailyTargetPages)}
              className="flex-1 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-800/60 text-[11px] text-emerald-300 font-bold transition-colors"
            >
              Doza Plote
            </button>
          </div>
        </div>
      </div>

      {/* 30 Juz Tracker Section */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Book className="w-4 h-4 text-emerald-400" />
              <span>30 Xhuzet e Kuranit (Juz Tracker)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Kliko mbi xhuzin për ta shënuar si të përfunduar ose për të naviguar direkt tek teksti
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
            <button
              onClick={() => setJuzFilter('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                juzFilter === 'all'
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Të Gjitha (30)
            </button>
            <button
              onClick={() => setJuzFilter('completed')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                juzFilter === 'completed'
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kryer ({plan.completedJuz.length})
            </button>
            <button
              onClick={() => setJuzFilter('unread')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                juzFilter === 'unread'
                  ? 'bg-emerald-600 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Pa Lexuar ({30 - plan.completedJuz.length})
            </button>
          </div>
        </div>

        {/* Grid of 30 Juz Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredJuzList.map(juz => {
            const isCompleted = plan.completedJuz.includes(juz.number);

            return (
              <div
                key={juz.number}
                className={`border p-3.5 rounded-xl transition-all flex flex-col justify-between space-y-3 ${
                  isCompleted
                    ? 'bg-emerald-950/30 border-emerald-800/60 shadow-inner'
                    : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold border ${
                        isCompleted
                          ? 'bg-emerald-600 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      {juz.number}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">
                        Xhuzi {juz.number} • {juz.transliteration}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        Faqet {juz.startPage} - {juz.endPage} ({juz.totalPages} faqe)
                      </p>
                    </div>
                  </div>

                  <span className="font-arabic text-base text-emerald-400/90 font-medium" dir="rtl">
                    {juz.nameAr}
                  </span>
                </div>

                <div className="text-[11px] bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 text-slate-300">
                  <span className="font-semibold text-slate-200">{juz.startSurahName} ({juz.startAyah})</span>
                  {' ➔ '}
                  <span className="font-semibold text-slate-200">{juz.endSurahName} ({juz.endAyah})</span>
                </div>

                <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/60">
                  <button
                    onClick={() => toggleJuzStatus(juz.number)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      isCompleted
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{isCompleted ? 'E Përfunduar' : 'Marko të kryer'}</span>
                  </button>

                  {onSelectSurah && (
                    <button
                      onClick={() => onSelectSurah(juz.startSurah)}
                      className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-lg text-xs font-medium flex items-center space-x-1 transition-colors"
                      title="Lexo këtë xhuz ne Kuran"
                    >
                      <span>Lexo</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plan Settings Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>Ndrysho Planin e Khatmit</span>
              </h3>
              <button
                onClick={() => setShowPlanModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Kohëzgjatja e Synuar (Ditë):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { days: 30, label: '30 Ditë (1 Muaj)' },
                    { days: 60, label: '60 Ditë (2 Muaj)' },
                    { days: 90, label: '90 Ditë (3 Muaj)' },
                    { days: 180, label: '180 Ditë (6 Muaj)' },
                    { days: 365, label: '365 Ditë (1 Vit)' }
                  ].map(opt => (
                    <button
                      key={opt.days}
                      type="button"
                      onClick={() => setTargetDaysInput(opt.days)}
                      className={`p-2 rounded-xl border text-[11px] font-semibold transition-all ${
                        targetDaysInput === opt.days
                          ? 'bg-emerald-600 text-slate-950 border-emerald-400 font-bold shadow'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Mënyra e Shpërndarjes Ditore:
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setPlanTypeInput('pages_per_day')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      planTypeInput === 'pages_per_day'
                        ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold">Faqe të barabarta në ditë</div>
                      <div className="text-[10px] opacity-75">
                        ~{Math.ceil(TOTAL_PAGES / targetDaysInput)} faqe çdo ditë për {targetDaysInput} ditë
                      </div>
                    </div>
                    {planTypeInput === 'pages_per_day' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setPlanTypeInput('after_prayers')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      planTypeInput === 'after_prayers'
                        ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold">Sipas 5 Namazeve Ditore (Farz)</div>
                      <div className="text-[10px] opacity-75">
                        Lexo një numër fletësh pas çdo namazi farz (Fejr, Dhuhr, Asr, Maghrib, Isha)
                      </div>
                    </div>
                    {planTypeInput === 'after_prayers' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </button>
                </div>
              </div>

              {planTypeInput === 'after_prayers' && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <label className="text-slate-300 font-semibold block">
                    Faqe pas çdo namazi farz:
                  </label>
                  <div className="flex items-center space-x-2">
                    {[2, 4, 6, 8, 10].map(cnt => (
                      <button
                        key={cnt}
                        type="button"
                        onClick={() => setPagesPerPrayerInput(cnt)}
                        className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                          pagesPerPrayerInput === cnt
                            ? 'bg-emerald-600 text-slate-950 border-emerald-400'
                            : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        {cnt} Faqe
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-emerald-400">
                    Gjithsejt ditor: {pagesPerPrayerInput * 5} faqe/ditë (Khatmi mbaron për ~{Math.ceil(TOTAL_PAGES / (pagesPerPrayerInput * 5))} ditë)
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-3 border-t border-slate-800">
              <button
                onClick={handleResetPlan}
                className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-semibold flex items-center space-x-1"
                title="Pastro Progresin"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              <button
                onClick={handleSavePlan}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs shadow-md transition-colors"
              >
                Ruaj Planin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dua Khatm al-Quran Modal */}
      {showDuaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl max-h-[90vh] rounded-2xl p-5 space-y-4 shadow-2xl flex flex-col animate-scaleIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold text-slate-100 font-serif">
                    {KHATAM_DUA.titleSq}
                  </h3>
                  <p className="text-[11px] text-amber-400 font-arabic" dir="rtl">
                    {KHATAM_DUA.titleAr}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDuaModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 pr-1 scrollbar-thin">
              {/* Arabic Text */}
              <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-2">
                <span className="text-[10px] text-emerald-400 uppercase font-mono tracking-wider">Teksti Arabisht</span>
                <p className="font-arabic text-xl sm:text-2xl text-slate-100 text-right leading-[2.2] select-text" dir="rtl">
                  {KHATAM_DUA.textAr}
                </p>
              </div>

              {/* Transliteration */}
              <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] text-amber-400 uppercase font-mono tracking-wider">Transkriptimi (Shqipëzim)</span>
                <p className="text-xs text-slate-300 leading-relaxed italic whitespace-pre-line font-serif">
                  {KHATAM_DUA.transliteration}
                </p>
              </div>

              {/* Translation */}
              <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-1.5">
                <span className="text-[10px] text-blue-400 uppercase font-mono tracking-wider">Përkthimi në Shqip</span>
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                  {KHATAM_DUA.translationSq}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowDuaModal(false)}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors"
              >
                Mbyll
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
