import React from 'react';

/**
 * Allowlisted CSS classes for audited tajweed tags from official/proofread datasets
 */
const ALLOWED_TAJWEED_CLASSES = new Set([
 'madda_normal',
 'madda_permissible',
 'madda_necessary',
 'madda_obligatory',
 'qalqalah',
 'ikhfa',
 'idgham',
 'ghunnah',
 'ham_wasl',
 'laam_shamsiyah',
 'silent',
 'ikhafa_shafawi',
 'idgham_shafawi',
 'iqlab'
]);

/**
 * Safely renders Quranic text.
 * - If audited tags exist in the input string, parses allowed tags into safe React elements.
 * - If standard text is passed without audited tags, returns plain text in Madinah 1441H QCF4 font.
 * - NEVER uses heuristics or character-level regexes to guess rules.
 */
export function renderTajweedText(text: string, enabled?: boolean): React.ReactNode {
 if (!enabled || !text) {
 return text;
 }

 // If text does not contain audited tajweed tags, render clean plain text
 if (!text.includes('<tajweed') && !text.includes('<span class=')) {
 return text;
 }

 // Controlled safe parser for <tajweed class="X">text</tajweed> or <span class="X">text</span>
 const tagRegex = /<(?:tajweed|span)\s+class=["']([^"']+)["']>(.*?)<\/(?:tajweed|span)>/gi;
 const elements: React.ReactNode[] = [];
 let lastIndex = 0;
 let match: RegExpExecArray | null;
 let count = 0;

 while ((match = tagRegex.exec(text)) !== null) {
 if (match.index > lastIndex) {
 elements.push(text.substring(lastIndex, match.index));
 }

 const rawClass = match[1].trim();
 const innerText = match[2];
 const allowedClass = ALLOWED_TAJWEED_CLASSES.has(rawClass) ? rawClass : '';

 elements.push(
 <span key={count++} className={`tajweed-mark ${allowedClass}`}>
 {innerText}
 </span>
 );

 lastIndex = tagRegex.lastIndex;
 }

 if (lastIndex < text.length) {
 elements.push(text.substring(lastIndex));
 }

 return <>{elements}</>;
}

export const TajweedLegend: React.FC<{ onOpenModal?: () => void }> = ({ onOpenModal }) => {
 return (
 <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-mono">
 <div className="flex flex-wrap items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
 <span>ℹ️ Pamja e texhvidit po përgatitet me dataset të kontrolluar të Mushafit 1441H.</span>
 </div>

 {onOpenModal && (
 <button
 onClick={onOpenModal}
 type="button"
 className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 hover:underline font-sans font-semibold text-xs py-0.5 px-1.5 rounded bg-emerald-500/10"
 >
 <span>ℹ️ Rreth Texhvidit</span>
 </button>
 )}
 </div>
 );
};

export const TajweedLegendModal: React.FC<{
 isOpen: boolean;
 onClose: () => void;
 highContrast?: boolean;
}> = ({ isOpen, onClose }) => {
 if (!isOpen) return null;

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
 <div className="relative w-full max-w-xl max-h-[88vh] flex flex-col rounded-2xl bg-stone-50 dark:bg-stone-900 border border-amber-900/10 dark:border-amber-100/10 text-stone-800 dark:text-stone-100 shadow-2xl overflow-hidden">
 {/* Modal Header */}
 <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-100/70 dark:bg-stone-800/50">
 <div className="flex items-center space-x-3">
 <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl font-bold">
 📖
 </div>
 <div>
 <h3 className="text-base sm:text-lg font-bold font-serif leading-tight">
 Pamja e Texhvid-it
 </h3>
 <p className="text-xs opacity-70">
 Informacion rreth dataset-it të kontrolluar të Texhvidit
 </p>
 </div>
 </div>
 <button
 onClick={onClose}
 className="w-8 h-8 rounded-full flex items-center justify-center text-stone-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800 transition-all text-lg font-bold"
 aria-label="Mbyll"
 >
 ✕
 </button>
 </div>

 {/* Modal Content */}
 <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
 <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 space-y-2">
 <h4 className="font-bold text-sm">Statusi i Dataset-it të Texhvidit</h4>
 <p className="leading-relaxed">
 Pamja e texhvidit nuk është ende e disponueshme. Do të aktivizohet pasi të integrohet dhe auditohet dataset-i përkatës.
 </p>
 </div>
 </div>

 {/* Modal Footer */}
 <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-100/70 dark:bg-stone-800/50 flex justify-end">
 <button
 onClick={onClose}
 className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
 >
 U kuptua ✓
 </button>
 </div>
 </div>
 </div>
 );
};


