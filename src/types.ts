/**
 * Hayat – Jeta Islame Types & Interfaces
 */

export type PrayerName = 'imsak' | 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type PrayerLocation = 'home' | 'mosque' | 'outside';
export type PrayerMethod = 'jamaat' | 'alone';

export interface PrayerTimes {
 date: string; // YYYY-MM-DD
 imsak: string; // HH:mm
 fajr: string; // HH:mm
 sunrise: string; // HH:mm
 dhuhr: string; // HH:mm
 asr: string; // HH:mm
 maghrib: string; // HH:mm
 isha: string; // HH:mm
 midnight?: string; // HH:mm
}

export interface PrayerLog {
 id: string;
 date: string;
 prayer: PrayerName;
 completed: boolean;
 timestamp: number;
 location?: PrayerLocation;
 method?: PrayerMethod;
}

export interface PostPrayerDhikrSession {
 id: string;
 date: string;
 prayer: PrayerName;
 timestamp: number;
 completed: boolean;
 items: { [key: string]: number }; // item ID -> count
}

export interface PrayerSettings {
 locationName: string;
 latitude: number;
 longitude: number;
 method: number; // Calculation method ID (e.g. 3 = MWL, 13 = Diyanet, etc.)
 asrSchool: 'standard' | 'hanafi'; // 0 = standard, 1 = hanafi
 manualAdjustments: {
 fajr: number;
 sunrise: number;
 dhuhr: number;
 asr: number;
 maghrib: number;
 isha: number;
 };
 showKahfFriday: boolean;
 showSajdahMulkNight: boolean;
 notificationsEnabled?: boolean;
 notifyMinutesBefore?: number; // Minutes before prayer time to trigger alert (e.g., 5, 10, 15, 30)
 notifyPrayers?: {
 imsak?: boolean;
 fajr?: boolean;
 sunrise?: boolean;
 dhuhr?: boolean;
 asr?: boolean;
 maghrib?: boolean;
 isha?: boolean;
 };
 dhikrHapticEnabled?: boolean;
 dhikrSoundEnabled?: boolean;
}

// Quran Types
export interface SurahMeta {
 number: number;
 name: string; // Arabic name
 transliteration: string;
 englishNameTranslation: string;
 albanianName: string;
 numberOfAyahs: number;
 revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
 numberInSurah: number;
 textAr: string;
 textSq: string; // Hasan Nahi translation
 transliteration?: string;
}

export interface QuranSurahData {
 number: number;
 name: string;
 transliteration: string;
 albanianName: string;
 numberOfAyahs: number;
 revelationType: 'Meccan' | 'Medinan';
 ayahs: Ayah[];
}

export interface QuranReadingState {
 lastReadSurah: number;
 lastReadAyah: number;
 updatedAt: number;
 dailyProgress?: { [date: string]: number }; // date (YYYY-MM-DD) -> number of ayahs read
}

export interface QuranBookmark {
 id: string;
 surahNumber: number;
 ayahNumber: number;
 surahName: string;
 createdAt: number;
 note?: string;
}

export interface QuranNote {
 id: string;
 surahNumber: number;
 ayahNumber: number;
 surahName: string;
 text: string;
 createdAt: number;
 updatedAt: number;
}

export type QuranReadingTheme = 'dark' | 'sepia' | 'light' | 'midnight';
export type QuranLayoutMode = 'cards' | 'continuous' | 'mushaf';
export type QuranScriptType = 'uthmani_hafs_unicode' | 'uthmani_unicode';
export type QuranViewMode = 'normal' | 'tajweed';

export interface QuranReadingSettings {
 theme: QuranReadingTheme;
 arabicFontSize: number; // e.g. 28 (px / rem equivalent)
 albanianFontSize: number; // e.g. 15
 lineSpacing: number; // e.g. 1.8 - 2.0 line height
 layoutMode: QuranLayoutMode;
 showTranslation: boolean;
 selectedReciterKey: string; // reciter identifier
 scriptType?: QuranScriptType; // 'uthmani_hafs_unicode' (KFGQPC Uthmanic Script Hafs, Unicode) vs 'uthmani_unicode'
 viewMode?: QuranViewMode; // 'normal' vs 'tajweed'
 showTajweed?: boolean; // Toggle Tajweed coloring
 tajweedHighContrast?: boolean;
 dailyAyahGoal?: number; // default e.g. 0
}

// Mburoja (Hisnul Muslim) Types
export interface MburojaCategory {
 id: string;
 title: string;
 icon?: string;
 chapterIds: number[];
}

export interface DuaItem {
 id: number;
 ar: string;
 sq: string;
 transliteration?: string;
 count: number;
 reference?: string;
 note?: string;
}

export interface MburojaChapter {
 id: number;
 categoryId: string;
 title: string;
 titleAr?: string;
 duas: DuaItem[];
 isRoutine?: 'mengjesi' | 'mbremjes' | 'gjumi';
}

export interface MburojaState {
 favChapters: number[]; // Chapter IDs
 savedDuas: number[]; // Dua IDs
 completedByDate: { [date: string]: number[] }; // date -> array of chapter IDs completed today
 dailyCountsByDate: { [date: string]: { [duaId: number]: number } }; // date -> (duaId -> count)
 situationalCounts: { [duaId: number]: number };
 duaGoals?: { [duaId: number]: number }; // duaId -> daily goal
}

// Dita Ime (My Day Task & Agenda Manager) Types
export type DayItemCategory = 'family' | 'work' | 'school' | 'personal';

export interface DayItem {
 id: string;
 title: string;
 date: string; // YYYY-MM-DD
 startTime: string; // HH:mm
 endTime: string; // HH:mm
 category: DayItemCategory;
 notes?: string;
 completed: boolean;
 recurring: 'none' | 'daily' | 'weekly';
 createdAt: number;
 isHighPriority?: boolean;
}

export interface DayItemOccurrence {
 id: string;
 dayItemId: string;
 date: string; // YYYY-MM-DD
 completed: boolean;
}

export interface Article {
 id: string;
 title: string;
 category: string;
 excerpt: string;
 content: string;
 readTime: string;
 author: string;
 publishedAt: string;
}

export interface FastingPreferences {
 enabled: boolean;
 trackMondays: boolean;
 trackThursdays: boolean;
 trackWhiteDays: boolean;
}

export type FastingStatus = 'completed' | 'missed' | 'none';

export interface FastingState {
 preferences: FastingPreferences;
 logs: { [date: string]: FastingStatus }; // YYYY-MM-DD -> status
}

// Backup v2 Format
export interface HayatBackupV2 {
 version: 2;
 exportedAt: string;
 settings: PrayerSettings;
 mburojaState: MburojaState;
 quranReadingState: QuranReadingState;
 quranBookmarks: QuranBookmark[];
 quranNotes?: QuranNote[];
 dayItems: DayItem[];
 dayItemOccurrences: DayItemOccurrence[];
 prayerLogs: PrayerLog[];
 postPrayerDhikrSessions: PostPrayerDhikrSession[];
 fastingState?: FastingState;
}
