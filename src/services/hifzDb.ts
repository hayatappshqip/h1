import Dexie, { Table } from 'dexie';

export type AyahStatus = 'NEW' | 'LEARNING' | 'REVIEWING' | 'CONSOLIDATED';
export type ReviewResult = 'KNEW' | 'STRUGGLED' | 'FORGOT';
export type SessionType = 'LEARN' | 'REVIEW' | 'TEST';
export type MemorizationOrder = 'MUSHAF' | 'REVERSE' | 'CUSTOM';
export type HifzMethod = 'A' | 'B' | 'C';

export interface AyahMemorizationRecord {
  ayahKey: string;
  status: AyahStatus;
  strength: number;
  easeFactor: number;
  intervalDays: number;
  dueDate: number;
  repetitions: number;
  lapses: number;
  lastReviewedAt ? : number;
  lastResult ? : ReviewResult;
  totalListens: number;
  stumblePoints: number[];
  createdAt: number;
}

export interface SessionRecord {
  id ? : string;
  startedAt: number;
  endedAt: number;
  type: SessionType;
  ayahsCovered: string[];
  results: { ayahKey: string;result: ReviewResult } [];
  durationSeconds: number;
}

// Regjistri i ajeve te mesuara manualisht ("Hifzi Im").
// Izoluar nga scheduler-i (ayahRecords) qe te mos bien ne rrezik logjika e SM-2.
export interface MemorizedAyah {
  ayahKey: string;
  surah: number;
  ayah: number;
  memorizedAt: number;
}

export interface HifzSettings {
  id ? : number;
  uiLanguage: string;
  translationId: string;
  reciterId: string;
  listenRepeats: number;
  readAlongRepeats: number;
  reciteVisibleRepeats: number;
  reciteHiddenRepeats: number;
  dailyNewAyahLimit: number;
  reviewDebtThreshold: number;
  showWordByWord: boolean;
  showTransliteration: boolean;
  memorizationOrder: MemorizationOrder;
  preferredMethod: HifzMethod;
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
  preferredMethod: 'B'
};

export class HifzDatabase extends Dexie {
  ayahRecords!: Table < AyahMemorizationRecord, string > ;
  sessions!: Table < SessionRecord, string > ;
  settings!: Table < HifzSettings, number > ;
  memorized!: Table < MemorizedAyah, string > ;
  
  constructor() {
    super('HayatHifzDatabase');
    this.version(1).stores({
      ayahRecords: 'ayahKey, status, dueDate, createdAt',
      sessions: 'id, startedAt, type',
      settings: 'id'
    });
    this.version(2).stores({
      ayahRecords: 'ayahKey, status, dueDate, createdAt',
      sessions: 'id, startedAt, type',
      settings: 'id',
      memorized: 'ayahKey, surah, ayah'
    });
  }
}

export const hifzDb = new HifzDatabase();

hifzDb.on('populate', () => {
  hifzDb.settings.add(DEFAULT_HIFZ_SETTINGS);
});

// --- Hifzi Im: regjistri i ajeve te mesuara (manual, pa AI) ---
export async function getAllMemorized(): Promise < MemorizedAyah[] > {
  return hifzDb.memorized.toArray();
}

export async function setMemorized(surah: number, ayah: number, value: boolean): Promise < void > {
  const key = `${surah}:${ayah}`;
  if (value) {
    await hifzDb.memorized.put({ ayahKey: key, surah, ayah, memorizedAt: Date.now() });
  } else {
    await hifzDb.memorized.delete(key);
  }
}

export async function isMemorized(surah: number, ayah: number): Promise < boolean > {
  return !!(await hifzDb.memorized.get(`${surah}:${ayah}`));
}

export async function getMemorizedCount(): Promise < number > {
  return hifzDb.memorized.count();
}