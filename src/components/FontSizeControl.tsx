import React from 'react';

interface FontSizeControlProps {
  fontScale: number;
  onChangeScale: (delta: number) => void;
  className?: string;
}

const SCALE_LABELS = ['A-', 'A', 'A+', 'A++'];

export const FontSizeControl: React.FC<FontSizeControlProps> = ({
  fontScale,
  onChangeScale,
  className = ''
}) => {
  return (
    <div
      className={`inline-flex items-center bg-slate-950/90 border border-slate-800 rounded-lg p-0.5 space-x-0.5 shadow-sm ${className}`}
      title="Madhësia e shkrimit (A- / A+)"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onChangeScale(-1);
        }}
        disabled={fontScale <= 0}
        className="px-2 py-1 text-xs font-bold font-sans text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 rounded hover:bg-slate-800 transition-colors flex items-center justify-center min-w-[26px]"
        title="Zvogëlo shkrimin (A-)"
      >
        A-
      </button>

      <span className="text-[10px] font-mono font-bold text-emerald-400 px-1 border-x border-slate-800/80 min-w-[26px] text-center select-none">
        {SCALE_LABELS[fontScale] || 'A'}
      </span>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onChangeScale(1);
        }}
        disabled={fontScale >= 3}
        className="px-2 py-1 text-sm font-bold font-sans text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300 rounded hover:bg-slate-800 transition-colors flex items-center justify-center min-w-[26px]"
        title="Zmadho shkrimin (A+)"
      >
        A+
      </button>
    </div>
  );
};
