import Dexie, { Table } from 'dexie';

export type AyahStatus = 'NEW' | 'LEARNING' | 'REVIEWING' | 'CONSOLIDATED';
export type ReviewResult = 'KNEW' | 'STRUGGLED' | 'FORGOT';
export type SessionType = 'LEARN' | 'REVIEW' | 'TEST';
export type MemorizationOrder = 'MUSHAF' | 'REVERSE' | 'CUSTOM';

export interface AyahMemorizationRecord {
 ayahKey: string; // "surah:ayah" (e.g., "114:1")
 status: AyahStatus;
 strength: number; // 0..100
 easeFactor: number; // 1.3..2.8 (SM-2 style)
 intervalDays: number; // current review interval
 dueDate: number; // next review timestamp (milliseconds)
 repetitions: number; // successful reviews in a row
 lapses: number; // times user failed after knowing it
 lastReviewedAt?: number; // timestamp
 lastResult?: ReviewResult;
 totalListens: number; // how many times audio was played
 stumblePoints: number[]; // array of word indices where user paused/failed
 createdAt: number; // timestamp
}

export interface SessionRecord {
 id?: string; // UUID for syncability
 startedAt: number;
 endedAt: number;
 type: SessionType;
 ayahsCovered: string[]; // array of ayahKeys
 results: { ayahKey: string; result: ReviewResult }[];
 durationSeconds: number;
}

export interface HifzSettings {
 id?: number; // Single record, ID = 1
 uiLanguage: string; // ISO code
 translationId: string;
 reciterId: string;
 listenRepeats: number;
 readAlongRepeats: number;
 reciteVisibleRepeats: number;
 reciteHiddenRepeats: number;
 dailyNewAyahLimit: number;
 reviewDebtThreshold: number; // gate trigger
 showWordByWord: boolean;
 showTransliteration: boolean;
 memorizationOrder: MemorizationOrder;
 dailyTargetAyahs?: number; // Target ayahs per day for goal tracking
 weeklyTargetAyahs?: number; // Target ayahs per week for goal tracking
}

export const DEFAULT_HIFZ_SETTINGS: HifzSettings = {
 id: 1,
 uiLanguage: 'sq',
 translationId: 'sq.nahi',
 reciterId: 'ar.alafasy',
 listenRepeats: 10,
 readAlongRepeats: 5,
 reciteVisibleRepeats: 5,
 reciteHiddenRepeats: 5,
 dailyNewAyahLimit: 3,
 reviewDebtThreshold: 15,
 showWordByWord: true,
 showTransliteration: false,
 memorizationOrder: 'REVERSE',
 dailyTargetAyahs: 5,
 weeklyTargetAyahs: 30,
};

export class HifzDatabase extends Dexie {
 ayahRecords!: Table<AyahMemorizationRecord, string>;
 sessions!: Table<SessionRecord, string>;
 settings!: Table<HifzSettings, number>;

 constructor() {
 super('HayatHifzDatabase');
 this.version(1).stores({
 ayahRecords: 'ayahKey, status, dueDate, createdAt', 
 sessions: 'id, startedAt, type',
 settings: 'id'
 });
 }
}

export const hifzDb = new HifzDatabase();

// Initialize default settings if not exists
hifzDb.on('populate', () => {
 hifzDb.settings.add(DEFAULT_HIFZ_SETTINGS);
});
