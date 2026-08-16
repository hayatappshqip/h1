/**
 * Quran Settings & Preferences Canonical Service
 * Manages user reading preferences, theme synchronization between Cards and Mushaf V2,
 * reciter registry, and backward-compatible persistence.
 */

import { QuranReadingSettings, QuranReadingTheme, QuranScriptType } from '../../types';
export type { QuranReadingSettings, QuranReadingTheme, QuranScriptType };

export interface Reciter {
  key: string;
  name: string;
  arabicName: string;
  style: string;
  getSurahAudioUrl: (surahNum: number) => string;
  getAyahAudioUrl: (surahNum: number, ayahNum: number) => string;
}

export const QURAN_RECITERS: Reciter[] = [
  {
    key: 'alafasy',
    name: 'Mishary Rashid Alafasy',
    arabicName: 'مشاري راشد العفاسي',
    style: 'Murattal',
    getSurahAudioUrl: (s) => `https://server8.mp3quran.net/afs/${s.toString().padStart(3, '0')}.mp3`,
    getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Alafasy_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`,
  },
  {
    key: 'minshawi',
    name: 'Siddiq El-Minshawi',
    arabicName: 'محمد صديق المنشاوي',
    style: 'Murattal',
    getSurahAudioUrl: (s) => `https://server10.mp3quran.net/minsh/Rewayat-Hafs-A-n-Asim/${s.toString().padStart(3, '0')}.mp3`,
    getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Minshawy_Murattal_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`,
  },
  {
    key: 'abdulbasit',
    name: 'Abdul Basit Abdul Samad',
    arabicName: 'عبد الباسط عبد الصمد',
    style: 'Murattal',
    getSurahAudioUrl: (s) => `https://server7.mp3quran.net/basit/${s.toString().padStart(3, '0')}.mp3`,
    getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Abdul_Basit_Murattal_192kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`,
  },
  {
    key: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    arabicName: 'محمود خليل الحصري',
    style: 'Murattal',
    getSurahAudioUrl: (s) => `https://server13.mp3quran.net/hssr/${s.toString().padStart(3, '0')}.mp3`,
    getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Husary_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`,
  },
  {
    key: 'ghamdi',
    name: 'Saad Al-Ghamdi',
    arabicName: 'سعد الغامدي',
    style: 'Murattal',
    getSurahAudioUrl: (s) => `https://server7.mp3quran.net/s_gmd/${s.toString().padStart(3, '0')}.mp3`,
    getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Ghamadi_40kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`,
  },
  {
    key: 'shatri',
    name: 'Abu Bakr Al-Shatri',
    arabicName: 'أبو بكر الشاطري',
    style: 'Murattal',
    getSurahAudioUrl: (s) => `https://server11.mp3quran.net/shatri/${s.toString().padStart(3, '0')}.mp3`,
    getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Shatri_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`,
  },
  {
    key: 'muaiqly',
    name: 'Maher Al-Muaiqly',
    arabicName: 'ماهر المعيقلي',
    style: 'Murattal',
    getSurahAudioUrl: (s) => `https://server12.mp3quran.net/maher/${s.toString().padStart(3, '0')}.mp3`,
    getAyahAudioUrl: (s, a) => `https://everyayah.com/data/MaherAlMuaiqly128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`,
  },
  {
    key: 'shuraim',
    name: 'Saud Al-Shuraim',
    arabicName: 'سعود الشريم',
    style: 'Murattal',
    getSurahAudioUrl: (s) => `https://server7.mp3quran.net/shrm/${s.toString().padStart(3, '0')}.mp3`,
    getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Saood_ash-Shuraym_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`,
  },
  {
    key: 'hudhaify',
    name: 'Ali Al-Hudhaify',
    arabicName: 'علي بن عبد الرحمن الحذيفي',
    style: 'Murattal',
    getSurahAudioUrl: (s) => `https://server9.mp3quran.net/hthfi/${s.toString().padStart(3, '0')}.mp3`,
    getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Hudhaify_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`,
  },
  {
    key: 'dosari',
    name: 'Yasser Al-Dosari',
    arabicName: 'ياسر الدوسري',
    style: 'Murattal',
    getSurahAudioUrl: (s) => `https://server11.mp3quran.net/yasser/${s.toString().padStart(3, '0')}.mp3`,
    getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`,
  },
  {
    key: 'qatami',
    name: 'Nasser Al-Qatami',
    arabicName: 'ناصر القطامي',
    style: 'Murattal',
    getSurahAudioUrl: (s) => `https://server6.mp3quran.net/qtm/${s.toString().padStart(3, '0')}.mp3`,
    getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Nasser_Alqatami_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`,
  },
  {
    key: 'ayyub',
    name: 'Muhammad Ayyub',
    arabicName: 'محمد أيوب',
    style: 'Murattal',
    getSurahAudioUrl: (s) => `https://server8.mp3quran.net/ayyub/${s.toString().padStart(3, '0')}.mp3`,
    getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Muhammad_Ayyoub_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`,
  },
  {
    key: 'budair',
    name: 'Salah Al-Budair',
    arabicName: 'صلاح البدير',
    style: 'Murattal',
    getSurahAudioUrl: (s) => `https://server10.mp3quran.net/bdr/${s.toString().padStart(3, '0')}.mp3`,
    getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Salah_Al_Budair_128kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`,
  },
  {
    key: 'basfar',
    name: 'Abdullah Basfar',
    arabicName: 'عبد الله بصفر',
    style: 'Murattal',
    getSurahAudioUrl: (s) => `https://server6.mp3quran.net/bsfr/${s.toString().padStart(3, '0')}.mp3`,
    getAyahAudioUrl: (s, a) => `https://everyayah.com/data/Abdullah_Basfar_192kbps/${s.toString().padStart(3, '0')}${a.toString().padStart(3, '0')}.mp3`,
  },
];

export const DEFAULT_READING_SETTINGS: QuranReadingSettings = {
  theme: 'sepia',
  arabicFontSize: 28,
  albanianFontSize: 15,
  lineSpacing: 1.8,
  layoutMode: 'cards',
  showTranslation: true,
  selectedReciterKey: 'alafasy',
  scriptType: 'uthmani_hafs_unicode',
  viewMode: 'normal',
  showTajweed: false,
  tajweedHighContrast: false,
  dailyAyahGoal: 0,
};

export const SETTINGS_STORAGE_KEY = 'hayat_quran_reading_settings';
export const MUSHAF_THEME_KEY = 'hayat_mushaf_theme';
export const SETTINGS_CHANGED_EVENT = 'hayat_quran_settings_changed';

/**
 * Normalizes script type for backward compatibility
 */
export function normalizeScriptType(value?: string): QuranScriptType {
  if (value === 'uthmani_unicode') return 'uthmani_unicode';
  return 'uthmani_hafs_unicode';
}

/**
 * Maps canonical QuranReadingTheme ('sepia' | 'dark' | 'light' | 'midnight') to Mushaf theme key ('ivory' | 'sepia' | 'white' | 'dark')
 */
export function mapReadingThemeToMushafTheme(theme: QuranReadingTheme): string {
  switch (theme) {
    case 'sepia':
      return 'sepia';
    case 'dark':
    case 'midnight':
      return 'dark';
    case 'light':
      return 'white';
    default:
      return 'sepia';
  }
}

/**
 * Maps Mushaf theme key ('ivory' | 'sepia' | 'white' | 'dark') to canonical QuranReadingTheme
 */
export function mapMushafThemeToReadingTheme(mushafThemeKey: string): QuranReadingTheme {
  switch (mushafThemeKey) {
    case 'sepia':
    case 'ivory':
      return 'sepia';
    case 'dark':
      return 'dark';
    case 'white':
      return 'light';
    default:
      return 'sepia';
  }
}

/**
 * Loads QuranReadingSettings with backward-compatible migration and safe defaults
 */
export function loadQuranReadingSettings(): QuranReadingSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const scriptType = normalizeScriptType(parsed.scriptType);
      const lineSpacing = parsed.lineSpacing && parsed.lineSpacing > 2.0 ? 1.8 : (parsed.lineSpacing || 1.8);
      
      return {
        ...DEFAULT_READING_SETTINGS,
        ...parsed,
        layoutMode: 'cards',
        scriptType,
        lineSpacing,
      };
    }
  } catch (e) {
    console.warn('Failed to parse saved Quran reading settings, using defaults', e);
  }
  return { ...DEFAULT_READING_SETTINGS };
}

/**
 * Saves partial or full settings, synchronizes Mushaf theme key, and dispatches change notification
 */
export function saveQuranReadingSettings(
  partialSettings: Partial<QuranReadingSettings>
): QuranReadingSettings {
  const current = loadQuranReadingSettings();
  const updated: QuranReadingSettings = {
    ...current,
    ...partialSettings,
  };

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));

    // Synchronize Mushaf theme if theme was updated
    if (partialSettings.theme) {
      const mushafTheme = mapReadingThemeToMushafTheme(partialSettings.theme);
      localStorage.setItem(MUSHAF_THEME_KEY, mushafTheme);
    }

    // Dispatch global event for in-tab reactive updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(SETTINGS_CHANGED_EVENT, { detail: updated })
      );
    }
  } catch (e) {
    console.warn('Failed to save Quran reading settings to localStorage', e);
  }

  return updated;
}
