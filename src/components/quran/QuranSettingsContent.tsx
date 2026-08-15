import React, { useEffect, useState } from 'react';
import { 
  Feather, Moon, Sun, Sparkles, Layers, BookOpen, Music, Play
} from 'lucide-react';
import { 
  QuranReadingSettings, 
  loadQuranReadingSettings, 
  saveQuranReadingSettings, 
  SETTINGS_CHANGED_EVENT, 
  QURAN_RECITERS,
  normalizeScriptType,
  mapReadingThemeToMushafTheme
} from '../../services/quran/quranSettingsService';
import { MUSHAF_THEMES } from './mushaf/MushafPageFrame';

export const QuranSettingsContent: React.FC = () => {
  const [readingSettings, setReadingSettings] = useState<QuranReadingSettings>(() => loadQuranReadingSettings());

  useEffect(() => {
    const handleSettingsChange = (e: Event) => {
      const customEv = e as CustomEvent<QuranReadingSettings>;
      if (customEv.detail) {
        setReadingSettings(customEv.detail);
      }
    };

    window.addEventListener(SETTINGS_CHANGED_EVENT, handleSettingsChange);
    return () => window.removeEventListener(SETTINGS_CHANGED_EVENT, handleSettingsChange);
  }, []);

  const updateSettings = (updates: Partial<QuranReadingSettings>) => {
    saveQuranReadingSettings(updates);
  };

  return (
    <div className="space-y-6">
      {/* Theme Selector */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Tema e Leximit (Relaksim për sytë)</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => updateSettings({ theme: 'sepia' })}
            className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center space-y-1.5 transition-all ${
              readingSettings.theme === 'sepia'
                ? 'border-[#0E6243] bg-[#EAE0CD] text-[#0E6243] shadow-inner'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Feather className="w-4 h-4" />
            <span>Letër e Ngrohtë</span>
          </button>
          <button
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center space-y-1.5 transition-all ${
              readingSettings.theme === 'dark'
                ? 'border-emerald-500 bg-slate-800 text-emerald-400 shadow-inner'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Nata (Slate)</span>
          </button>
          <button
            onClick={() => updateSettings({ theme: 'light' })}
            className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center space-y-1.5 transition-all ${
              readingSettings.theme === 'light'
                ? 'border-emerald-600 bg-white text-emerald-800 shadow-inner'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Dritë e Pastër</span>
          </button>
          <button
            onClick={() => updateSettings({ theme: 'midnight' })}
            className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center space-y-1.5 transition-all ${
              readingSettings.theme === 'midnight'
                ? 'border-emerald-500 bg-black text-emerald-400 shadow-inner'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Mbrëmje OLED</span>
          </button>
        </div>
      </div>

      {/* Font Size & Spacing Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Arabic Font Size */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-semibold text-slate-400 uppercase tracking-wider">Madhësia e Tekstit Arabisht</span>
            <span className="font-mono text-emerald-400">{readingSettings.arabicFontSize}px</span>
          </div>
          <div className="flex items-center space-x-2">
            {[22, 28, 34, 42].map(size => (
              <button
                key={size}
                onClick={() => updateSettings({ arabicFontSize: size })}
                className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  readingSettings.arabicFontSize === size
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {size === 22 ? 'S' : size === 28 ? 'M' : size === 34 ? 'L' : 'XL'}
              </button>
            ))}
          </div>
        </div>

        {/* Albanian Translation Font Size */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-semibold text-slate-400 uppercase tracking-wider">Madhësia e Përkthimit Shqip</span>
            <span className="font-mono text-emerald-400">{readingSettings.albanianFontSize}px</span>
          </div>
          <div className="flex items-center space-x-2">
            {[13, 15, 17, 19].map(size => (
              <button
                key={size}
                onClick={() => updateSettings({ albanianFontSize: size })}
                className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                  readingSettings.albanianFontSize === size
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {size === 13 ? '13' : size === 15 ? '15' : size === 17 ? '17' : '19'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Display Mode & Translation Toggle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Mënyra e Paraqitjes</label>
          <div className="flex space-x-2">
            <button
              onClick={() => updateSettings({ layoutMode: 'cards' })}
              className={`flex-1 py-2 px-2 rounded-xl border text-[11px] font-medium flex items-center justify-center space-x-2 ${
                readingSettings.layoutMode === 'cards'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Lista / Ajete</span>
            </button>

            <button
              onClick={() => updateSettings({ layoutMode: 'mushaf' })}
              className={`flex-1 py-2 px-2 rounded-xl border text-[11px] font-medium flex items-center justify-center space-x-2 ${
                readingSettings.layoutMode === 'mushaf'
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Mushaf / Libër</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Përkthimi Shqip</label>
          <button
            onClick={() => updateSettings({ showTranslation: !readingSettings.showTranslation })}
            className={`w-full py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center space-x-2 ${
              readingSettings.showTranslation
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>{readingSettings.showTranslation ? 'Po, trego përkthimin' : 'Jo, vetëm arabisht'}</span>
          </button>
        </div>
      </div>

      {/* Font Script Picker: Shkrimi i Kuranit */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Lloji i Shkrimit Arab (Script)</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => updateSettings({ scriptType: 'uthmani_hafs_unicode' })}
            className={`p-3 rounded-xl border text-xs font-medium text-left transition-all flex flex-col justify-center ${
              normalizeScriptType(readingSettings.scriptType) === 'uthmani_hafs_unicode'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className="font-bold">KFGQPC Uthmanic Hafs</div>
            <div className="text-[10px] opacity-70 mt-1">خط قرآن مصحف المدينة (Hafs)</div>
          </button>

          <button
            onClick={() => updateSettings({ scriptType: 'uthmani_unicode' })}
            className={`p-3 rounded-xl border text-xs font-medium text-left transition-all flex flex-col justify-center ${
              readingSettings.scriptType === 'uthmani_unicode'
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <div className="font-bold">Uthmani Hafs (Klasik)</div>
            <div className="text-[10px] opacity-70 mt-1">Tekst standard Uthmani fallback</div>
          </button>
        </div>
      </div>

      {/* Reciter Selector */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          <Music className="w-3.5 h-3.5" />
          <span>Recituesi i Parazgjedhur (Audio)</span>
        </div>
        <select
          value={readingSettings.selectedReciterKey}
          onChange={e => updateSettings({ selectedReciterKey: e.target.value })}
          className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-200 text-xs font-medium focus:outline-none focus:border-emerald-500 transition-colors"
        >
          {QURAN_RECITERS.map(reciter => (
            <option key={reciter.key} value={reciter.key}>
              {reciter.name} ({reciter.arabicName})
            </option>
          ))}
        </select>
      </div>

      {/* Daily Ayah Goal Setting */}
      <div className="space-y-2">
        <label className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Synimi Ditor i Leximit</label>
        <div className="flex space-x-2">
          {[0, 20, 50, 100].map(goal => (
            <button
              key={goal}
              onClick={() => updateSettings({ dailyAyahGoal: goal })}
              className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-colors ${
                (readingSettings.dailyAyahGoal || 0) === goal
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {goal === 0 ? 'Fikur' : `${goal} Ajete`}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
