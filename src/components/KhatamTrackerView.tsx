import React, { useState, useEffect } from 'react';
import { ALL_JUZ_META, KHATAM_DUA } from '../data/juzData';
import { ManualKhatamPlan } from '../types';
import {
  loadCachedKhatamPlan,
  loadDurableKhatamPlan,
  saveDurableKhatamPlan,
  confirmPageCompleted,
  confirmPageRangeCompleted,
  confirmJuzCompleted,
  updateDirectPagePosition,
  removePageCompleted,
  removeJuzCompleted,
  getMissingPagesInRange,
  calculateKhatamStats,
  archiveCurrentAndStartNewPlan,
  TOTAL_MUSHAF_PAGES,
} from '../services/quran/manualKhatmahService';
import { CANONICAL_MUSHAF_PAGES_DATA } from '../data/canonicalMushafManifest';
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  RotateCcw,
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle,
  X,
  Book,
  Heart,
  Share2,
  Check,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

interface KhatamTrackerViewProps {
  onSelectSurah?: (surahNumber: number) => void;
  onNavigateToPage?: (pageNumber: number) => void;
}

export const KhatamTrackerView: React.FC<KhatamTrackerViewProps> = ({
  onSelectSurah,
  onNavigateToPage,
}) => {
  const [plan, setPlan] = useState<ManualKhatamPlan>(() => loadCachedKhatamPlan());

  // Rehydrate durable plan asynchronously
  useEffect(() => {
    loadDurableKhatamPlan().then((durable) => {
      if (durable && durable.updatedAt >= plan.updatedAt) {
        setPlan(durable);
      }
    });
  }, []);

  // Modal States
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [updateTab, setUpdateTab] = useState<'quick' | 'direct' | 'juz'>('quick');
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [showDuaModal, setShowDuaModal] = useState<boolean>(false);
  const [juzFilter, setJuzFilter] = useState<'all' | 'completed' | 'unread'>('all');

  // Direct Page Jump State
  const [directPageInput, setDirectPageInput] = useState<number | ''>(plan.nextPage);
  const [jumpPromptPage, setJumpPromptPage] = useState<number | null>(null);

  // Removal Confirmation State
  const [removalTarget, setRemovalTarget] = useState<
    { type: 'page'; page: number } | { type: 'juz'; juz: number; startPage: number; endPage: number } | null
  >(null);

  // New Plan Inputs
  const [newTitleInput, setNewTitleInput] = useState<string>('Hatme e Re');
  const [newDailyTargetInput, setNewDailyTargetInput] = useState<number>(20);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-hide toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Derived Stats
  const stats = calculateKhatamStats(plan);

  // Persistence helper
  const handlePersistPlan = (updatedPlan: ManualKhatamPlan, successMsg?: string) => {
    setPlan(updatedPlan);
    saveDurableKhatamPlan(updatedPlan);
    if (successMsg) {
      setToastMessage(successMsg);
    }
  };

  // 1. Primary CTA: "Vazhdo hatmen" (Does NOT mark page as completed)
  const handleContinueKhatam = () => {
    const targetPage = plan.nextPage || 1;
    if (onNavigateToPage) {
      onNavigateToPage(targetPage);
    } else if (onSelectSurah) {
      const pageMeta = CANONICAL_MUSHAF_PAGES_DATA[targetPage - 1];
      if (pageMeta) {
        onSelectSurah(pageMeta[1]);
      }
    }
  };

  // 2. Quick Confirmation Handlers
  const handleConfirmCurrentPage = () => {
    const targetPage = plan.nextPage;
    if (plan.completedPages.includes(targetPage)) return;
    const updated = confirmPageCompleted(plan, targetPage);
    handlePersistPlan(updated, `Faqja ${targetPage} u konfirmua si e kryer!`);
    setShowUpdateModal(false);
  };

  const handleConfirmPageAmount = (amount: number) => {
    const start = plan.lastCompletedPage + 1;
    const end = Math.min(TOTAL_MUSHAF_PAGES, plan.lastCompletedPage + amount);
    const updated = confirmPageRangeCompleted(plan, start, end);
    handlePersistPlan(updated, `U regjistruan +${amount} faqe të kryera!`);
    setShowUpdateModal(false);
  };

  // 3. Direct Page Jump Handler
  const handleDirectPageSubmit = () => {
    const targetPage = typeof directPageInput === 'number' ? directPageInput : Number(directPageInput);
    if (isNaN(targetPage) || targetPage < 1 || targetPage > TOTAL_MUSHAF_PAGES) return;

    if (plan.completedPages.includes(targetPage)) {
      return;
    }

    const missing = getMissingPagesInRange(plan, plan.lastCompletedPage + 1, targetPage);
    if (targetPage > plan.lastCompletedPage + 1 && missing.length > 0) {
      setJumpPromptPage(targetPage);
    } else {
      const updated = confirmPageCompleted(plan, targetPage);
      handlePersistPlan(updated, `Faqja ${targetPage} u shënua e kryer!`);
      setShowUpdateModal(false);
    }
  };

  const handleConfirmJumpWithPrior = (markPrior: boolean) => {
    if (!jumpPromptPage) return;
    const updated = markPrior
      ? confirmPageRangeCompleted(plan, plan.lastCompletedPage + 1, jumpPromptPage)
      : confirmPageCompleted(plan, jumpPromptPage);
    handlePersistPlan(
      updated,
      markPrior
        ? `Faqet ${plan.lastCompletedPage + 1}–${jumpPromptPage} u konfirmuan si të kryera!`
        : `Faqja ${jumpPromptPage} u shënua e kryer!`
    );
    setJumpPromptPage(null);
    setShowUpdateModal(false);
  };

  // 4. Juz Confirmation Handler
  const handleConfirmJuz = (juzNumber: number) => {
    const juzMeta = ALL_JUZ_META[juzNumber - 1];
    if (!juzMeta) return;
    const missing = getMissingPagesInRange(plan, juzMeta.startPage, juzMeta.endPage);
    if (missing.length === 0) return;
    const updated = confirmJuzCompleted(plan, juzNumber);
    handlePersistPlan(updated, `Xhuzi ${juzNumber} u konfirmua i përfunduar!`);
  };

  // 5. Removal Handler
  const handleRemoveConfirm = () => {
    if (!removalTarget) return;
    if (removalTarget.type === 'page') {
      const updated = removePageCompleted(plan, removalTarget.page);
      handlePersistPlan(updated, `Faqja ${removalTarget.page} u hoq nga progresi.`);
    } else if (removalTarget.type === 'juz') {
      const updated = removeJuzCompleted(plan, removalTarget.juz);
      handlePersistPlan(updated, `Xhuzi ${removalTarget.juz} (faqet ${removalTarget.startPage}–${removalTarget.endPage}) u hoq nga progresi.`);
    }
    setRemovalTarget(null);
  };

  // 5. New / Reset Plan Handler
  const handleCreateNewPlan = async () => {
    const { newPlan } = await archiveCurrentAndStartNewPlan(
      plan,
      newTitleInput || 'Hatme e Re',
      newDailyTargetInput > 0 ? newDailyTargetInput : 20
    );
    setPlan(newPlan);
    setShowPlanModal(false);
    setToastMessage('Plani i ri i Khatmit u krijua me sukses!');
  };

  return (
    <div id="khatam-tracker-view" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Toast Banner */}
      {toastMessage && (
        <div
          id="khatam-toast"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-2.5 rounded-full shadow-2xl text-xs sm:text-sm font-medium flex items-center space-x-2 animate-fadeIn backdrop-blur-md"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Hero Card */}
      <div id="khatam-hero-card" className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Background Subtle Gradient */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Bar: Title & Stats Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[11px] font-semibold tracking-wide">
                  {stats.isCompleted ? 'Khatmi i Kryer 🎉' : 'Në Progres'}
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {plan.id.slice(-6)}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mt-2 font-serif">{plan.title}</h2>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="btn-new-plan"
                onClick={() => setShowPlanModal(true)}
                className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Rregullo Planin</span>
              </button>

              {stats.isCompleted && (
                <button
                  id="btn-dua-khatm"
                  onClick={() => setShowDuaModal(true)}
                  className="px-3.5 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors animate-pulse"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dua Khatm al-Quran</span>
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar & Percentage */}
          <div className="space-y-2">
            <div className="flex justify-between items-baseline text-xs sm:text-sm">
              <span className="text-slate-300 font-medium">Progresi i Përgjithshëm</span>
              <span className="font-mono text-emerald-400 font-bold text-base sm:text-lg">
                {stats.completedPagesCount} / {TOTAL_MUSHAF_PAGES} faqe ({stats.percentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-800/80 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.min(100, stats.percentage)}%` }}
              />
            </div>
          </div>

          {/* Primary Action Buttons Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Primary CTA: "Vazhdo hatmen" */}
            <button
              id="btn-vazhdo-hatmen"
              onClick={handleContinueKhatam}
              className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2.5 transition-all transform active:scale-[0.99]"
            >
              <BookOpen className="w-5 h-5" />
              <span>Vazhdo hatmen (Faqja {plan.nextPage})</span>
              <ArrowRight className="w-4 h-4 text-emerald-200" />
            </button>

            {/* Secondary CTA: "Përditëso progresin" */}
            <button
              id="btn-perditso-progresin"
              onClick={() => {
                setDirectPageInput(plan.nextPage);
                setShowUpdateModal(true);
              }}
              className="w-full py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-sm sm:text-base border border-emerald-500/40 rounded-2xl shadow-md flex items-center justify-center space-x-2.5 transition-all"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Përditëso progresin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics & Daily Stats Grid */}
      <div id="khatam-metrics-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Today's Confirmed Progress */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Konfirmuar Sot</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100 font-mono">
              {stats.confirmedTodayCount} <span className="text-xs font-normal text-slate-400">/ {plan.dailyTargetPages} faqe</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {stats.isDailyGoalReached ? (
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" /> <span>Synimi ditor u arrit!</span>
                </span>
              ) : (
                <span>Edhe {Math.max(0, plan.dailyTargetPages - stats.confirmedTodayCount)} faqe për synimin ditor</span>
              )}
            </p>
          </div>
        </div>

        {/* Card 2: Pace & Recommended Rate */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ritmi Ditor</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100 font-mono">
              ~{stats.avgPagesPerDay} <span className="text-xs font-normal text-slate-400">faqe / ditë</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Mbeten edhe {stats.remainingPagesCount} faqe për të përfunduar Kuranin.
            </p>
          </div>
        </div>

        {/* Card 3: Projected Completion */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Përfundimi i Parashikuar</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-amber-300 font-mono">
              {stats.isCompleted ? 'Përfunduar' : stats.projectedCompletionDate}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {stats.isCompleted ? 'Urime për leximin e Kuranit!' : `Me ritmin aktual prej ${stats.avgPagesPerDay} faqe/ditë`}
            </p>
          </div>
        </div>
      </div>

      {/* 30 Juz Explorer & Manual Confirmation Section */}
      <div id="khatam-juz-section" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Book className="w-4 h-4 text-emerald-400" />
              <span>Progresi sipas Xhuzeve (1–30)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Klikoni një xhuz për ta konfirmuar si të lexuar plotësisht.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setJuzFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                juzFilter === 'all' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Të gjitha (30)
            </button>
            <button
              onClick={() => setJuzFilter('completed')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                juzFilter === 'completed' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Të kryera
            </button>
            <button
              onClick={() => setJuzFilter('unread')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                juzFilter === 'unread' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Paparashikuara
            </button>
          </div>
        </div>

        {/* Juz Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {ALL_JUZ_META.filter((juz) => {
            const pagesInJuz = Array.from(
              { length: juz.endPage - juz.startPage + 1 },
              (_, i) => juz.startPage + i
            );
            const isDone = pagesInJuz.every((p) => plan.completedPages.includes(p));
            if (juzFilter === 'completed') return isDone;
            if (juzFilter === 'unread') return !isDone;
            return true;
          }).map((juz) => {
            const pagesInJuz = Array.from(
              { length: juz.endPage - juz.startPage + 1 },
              (_, i) => juz.startPage + i
            );
            const doneCount = pagesInJuz.filter((p) => plan.completedPages.includes(p)).length;
            const totalCount = pagesInJuz.length;
            const isFullyCompleted = doneCount === totalCount;
            const isPartial = doneCount > 0 && !isFullyCompleted;

            return (
              <div
                key={juz.number}
                className={`p-3 rounded-xl border text-xs transition-all relative flex flex-col justify-between space-y-2 ${
                  isFullyCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : isPartial
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-slate-200">Xhuzi {juz.number}</span>
                  {isFullyCompleted ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      I kryer
                    </span>
                  ) : isPartial ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Në progres
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400">
                      {juz.startPage}-{juz.endPage}
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-arabic text-emerald-400 truncate dir-rtl" dir="rtl">
                  {juz.nameAr}
                </div>

                <div className="pt-1 flex flex-col space-y-1.5 border-t border-slate-800/60 text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-slate-400">
                      {doneCount} / {totalCount} faqe
                    </span>
                    {isPartial && (
                      <span className="text-[9px] font-mono text-amber-400">
                        {totalCount - doneCount} mbetur
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {!isFullyCompleted && (
                      <button
                        onClick={() => handleConfirmJuz(juz.number)}
                        className="flex-1 py-1 px-1.5 rounded bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 font-semibold text-center text-[10px] transition-colors"
                      >
                        {isPartial ? 'Plotëso' : 'Konfirmo'}
                      </button>
                    )}
                    {doneCount > 0 && (
                      <button
                        onClick={() =>
                          setRemovalTarget({
                            type: 'juz',
                            juz: juz.number,
                            startPage: juz.startPage,
                            endPage: juz.endPage,
                          })
                        }
                        className="py-1 px-1.5 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 font-semibold text-center text-[10px] border border-red-800/40 transition-colors"
                        title="Hiq Xhuzin nga progresi"
                      >
                        Hiq
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: "Përditëso progresin" */}
      {showUpdateModal && (
        <div
          id="modal-update-progress"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowUpdateModal(false)}
        >
          <div
            className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Regjistro progresin e leximit</span>
              </h3>
              <button
                onClick={() => setShowUpdateModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs text-center font-medium">
              <button
                onClick={() => setUpdateTab('quick')}
                className={`py-2 rounded-lg transition-colors ${
                  updateTab === 'quick' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Shpejtë
              </button>
              <button
                onClick={() => setUpdateTab('direct')}
                className={`py-2 rounded-lg transition-colors ${
                  updateTab === 'direct' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sipas Faqes
              </button>
              <button
                onClick={() => setUpdateTab('juz')}
                className={`py-2 rounded-lg transition-colors ${
                  updateTab === 'juz' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sipas Xhuzit
              </button>
            </div>

            {/* TAB 1: Quick Confirm */}
            {updateTab === 'quick' && (
              <div className="space-y-4">
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center space-y-2">
                  <span className="text-xs text-slate-400">Faqja tjetër e pritur</span>
                  <div className="text-3xl font-bold text-emerald-400 font-mono">Faqja {plan.nextPage}</div>
                  {plan.completedPages.includes(plan.nextPage) ? (
                    <p className="text-xs text-amber-400 font-medium">
                      Faqja {plan.nextPage} është tashmë e shënuar si e përfunduar.
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400">
                      A e përfundove leximin e faqes {plan.nextPage}?
                    </p>
                  )}
                  <button
                    onClick={handleConfirmCurrentPage}
                    disabled={plan.completedPages.includes(plan.nextPage)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg mt-2 flex items-center justify-center space-x-2 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {plan.completedPages.includes(plan.nextPage)
                        ? `Faqja ${plan.nextPage} është tashmë e shënuar`
                        : `Po, konfirmo Faqen ${plan.nextPage}`}
                    </span>
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300">Ose shto me faqe sot:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {[1, 2, 5, 10].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => handleConfirmPageAmount(amt)}
                        className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 rounded-xl text-xs flex items-center justify-center space-x-1"
                      >
                        <Plus className="w-3 h-3 text-emerald-400" />
                        <span>+{amt} faqe</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Direct Page Entry ("Sipas faqes") */}
            {updateTab === 'direct' && (() => {
              const selectedPageNum = typeof directPageInput === 'number' ? directPageInput : Number(directPageInput);
              const isPageDone = !isNaN(selectedPageNum) && plan.completedPages.includes(selectedPageNum);

              return (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Jam te faqja / Arrita te faqja:</label>
                    <input
                      type="number"
                      min={1}
                      max={TOTAL_MUSHAF_PAGES}
                      value={directPageInput}
                      onChange={(e) => setDirectPageInput(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-lg focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. 120"
                    />
                    {isPageDone ? (
                      <p className="text-xs text-amber-400 font-medium">
                        Faqja {selectedPageNum} është tashmë e shënuar si e përfunduar.
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400">
                        Vendos faqen ekzakte ku ke arritur (1–604).
                      </p>
                    )}
                  </div>

                  {/* Quick increment buttons for direct tab */}
                  <div className="flex items-center space-x-2">
                    {[1, 5, 10].map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => {
                          const base = typeof directPageInput === 'number' ? directPageInput : plan.lastCompletedPage;
                          setDirectPageInput(Math.min(TOTAL_MUSHAF_PAGES, base + step));
                        }}
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-lg border border-slate-700"
                      >
                        +{step}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleDirectPageSubmit}
                    disabled={isPageDone || !directPageInput}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isPageDone ? `Faqja ${selectedPageNum} është e shënuar` : 'Ruaj Progresin'}
                    </span>
                  </button>
                </div>
              );
            })()}

            {/* TAB 3: Juz Selector inside modal */}
            {updateTab === 'juz' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">Përzgjidhni xhuzin për të shënuar ose plotësuar:</p>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {ALL_JUZ_META.map((juz) => {
                    const pagesInJuz = Array.from(
                      { length: juz.endPage - juz.startPage + 1 },
                      (_, i) => juz.startPage + i
                    );
                    const doneCount = pagesInJuz.filter((p) => plan.completedPages.includes(p)).length;
                    const isFullyDone = doneCount === pagesInJuz.length;

                    return (
                      <button
                        key={juz.number}
                        onClick={() => {
                          if (!isFullyDone) {
                            handleConfirmJuz(juz.number);
                            setShowUpdateModal(false);
                          }
                        }}
                        disabled={isFullyDone}
                        className={`p-2.5 rounded-xl text-xs text-left transition-all border flex flex-col justify-between ${
                          isFullyDone
                            ? 'bg-slate-950 border-slate-800/80 text-slate-500 cursor-not-allowed'
                            : doneCount > 0
                            ? 'bg-amber-950/30 border-amber-500/40 text-amber-200 hover:bg-amber-900/40'
                            : 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-200'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-bold">Xhuzi {juz.number}</span>
                          <span className="text-[10px] font-mono">
                            {doneCount}/{pagesInJuz.length}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {isFullyDone
                            ? 'Xhuzi është i përfunduar'
                            : doneCount > 0
                            ? `Plotëso ${pagesInJuz.length - doneCount} faqe`
                            : `Fq. ${juz.startPage}–${juz.endPage}`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1B: Jump Confirmation Dialog for jumps > 20 pages */}
      {jumpPromptPage !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-amber-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-100">Konfirmim i Kërcimit të Faqeve</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Keni bërë një kërcim nga faqja <strong className="text-white">{plan.lastCompletedPage}</strong> te faqja{' '}
              <strong className="text-emerald-400">{jumpPromptPage}</strong> ({jumpPromptPage - plan.lastCompletedPage} faqe).
              A dëshironi t'i shënoni të gjitha faqet e mëparshme si të përfunduara?
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleConfirmJumpWithPrior(true)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Po, shëno të gjitha faqet 1–{jumpPromptPage} si të kryera
              </button>
              <button
                onClick={() => handleConfirmJumpWithPrior(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl border border-slate-700"
              >
                Jo, vetëm faqen {jumpPromptPage}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1C: Removal Confirmation Dialog */}
      {removalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-100">Je i sigurt?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {removalTarget.type === 'page'
                ? `Po heq faqen ${removalTarget.page} nga progresi i Hatmes.`
                : `Po heq faqet ${removalTarget.startPage}–${removalTarget.endPage} nga progresi.`}
            </p>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setRemovalTarget(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
              >
                Anulo
              </button>
              <button
                onClick={handleRemoveConfirm}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                Po, hiqe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Create / Rebuild Plan */}
      {showPlanModal && (
        <div
          id="modal-plan-config"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowPlanModal(false)}
        >
          <div
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
                <span>Rregullo ose Krijo Plan të Ri</span>
              </h3>
              <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Titulli i Planit</label>
                <input
                  type="text"
                  value={newTitleInput}
                  onChange={(e) => setNewTitleInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Synimi Ditor (Faqe në ditë)</label>
                <input
                  type="number"
                  min={1}
                  max={604}
                  value={newDailyTargetInput}
                  onChange={(e) => setNewDailyTargetInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setShowPlanModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium text-xs"
              >
                Anulo
              </button>
              <button
                onClick={handleCreateNewPlan}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
              >
                Krijo Planin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Dua Khatm al-Quran Modal */}
      {showDuaModal && (
        <div
          id="modal-dua-khatm"
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowDuaModal(false)}
        >
          <div
            className="bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-amber-300">{KHATAM_DUA.titleSq}</h3>
              </div>
              <button onClick={() => setShowDuaModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-right font-arabic text-xl sm:text-2xl text-amber-100 leading-loose tracking-wide bg-slate-950/60 p-6 rounded-2xl border border-amber-500/20" dir="rtl">
              {KHATAM_DUA.textAr}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
