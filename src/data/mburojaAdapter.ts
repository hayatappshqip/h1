import rawPackage from '../../paketa/data/mburoja.json';
import type {
  DuaItem,
  MburojaCategory,
  MburojaChapter,
  MburojaItemKey,
  MburojaState,
} from '../types';

type PackageNote = { nr: number | null; tekst: string };
type PackageItem = {
  id: number;
  n: number;
  type: 'dua' | 'rrefim';
  lead: string | null;
  arabic: string | null;
  transliteration: string | null;
  albanian: string | null;
  count: number;
  notes: PackageNote[];
  audio: string | null;
  audio_parts: string[] | null;
  has_audio: boolean;
  time: string | null;
};
type PackageChapter = {
  id: number;
  title: string;
  page: number;
  items: PackageItem[];
};
type MburojaPackage = {
  meta: { version: string; counts: { chapters: number; items: number } };
  chapters: PackageChapter[];
};

const data = rawPackage as MburojaPackage;

export const makeMburojaItemKey = (chapterId: number, itemId: number): MburojaItemKey =>
  `mburoja:${chapterId}:${itemId}`;

const CATEGORY_DEFINITIONS: MburojaCategory[] = [
  { id: 'mëngjes-dhe-mbrëmje', title: 'Mëngjes dhe mbrëmje', icon: 'Sun', chapterIds: [1, 27, 28, 29, 30, 31] },
  { id: 'shtëpia-dhe-familja', title: 'Shtëpia dhe familja', icon: 'Home', chapterIds: [2,3,4,5,6,7,10,11,45,79,81,125,128,132] },
  { id: 'udhëtim', title: 'Udhëtim', icon: 'Compass', chapterIds: [95,96,97,98,99,100,101,102,103,104,105] },
  { id: 'ushqim-dhe-pije', title: 'Ushqim dhe pije', icon: 'Utensils', chapterIds: [68,69,70,71,72,73,74] },
  { id: 'gëzim-dhe-shqetësim', title: 'Gëzim dhe shqetësim', icon: 'Heart', chapterIds: [34,35,36,37,38,39,40,41,53,92,94,106,122,123,126] },
  { id: 'namazi', title: 'Namazi', icon: 'Clock', chapterIds: [8,9,12,13,14,15,16,17,18,19,20,21,22,23,24,25,32,33,42] },
  { id: 'falënderimi-ndaj-Allahut', title: 'Falënderimi ndaj Allahut', icon: 'Sparkles', chapterIds: [26,43,44,46,88,107,129,130,131] },
  { id: 'mirësjellja', title: 'Mirësjellja', icon: 'UserCheck', chapterIds: [47,75,77,78,80,82,83,84,85,86,87,89,90,91,93,108,109,112,113,114] },
  { id: 'haxh-dhe-umre', title: 'Haxh dhe Umre', icon: 'Landmark', chapterIds: [115,116,117,118,119,120,121,127] },
  { id: 'natyra', title: 'Natyra', icon: 'CloudRain', chapterIds: [61,62,63,64,65,66,67,76,110,111] },
  { id: 'sëmundja-dhe-vdekja', title: 'Sëmundja dhe vdekja', icon: 'Activity', chapterIds: [48,49,50,51,52,54,55,56,57,58,59,60,124] },
];

const categoryByChapter = new Map<number, string>();
for (const category of CATEGORY_DEFINITIONS) {
  for (const chapterId of category.chapterIds) categoryByChapter.set(chapterId, category.id);
}

export const MBUROJA_CATEGORIES = CATEGORY_DEFINITIONS;
export const MBUROJA_PACKAGE_VERSION = data.meta.version;

export const MBUROJA_CHAPTERS: MburojaChapter[] = data.chapters.map(chapter => ({
  id: chapter.id,
  categoryId: categoryByChapter.get(chapter.id) ?? 'mirësjellja',
  title: chapter.title,
  page: chapter.page,
  isRoutine: chapter.id === 27 ? 'mengjesi-mbremja' : chapter.id === 28 ? 'gjumi' : undefined,
  duas: chapter.items.map((item): DuaItem => ({
    id: item.id,
    key: makeMburojaItemKey(chapter.id, item.id),
    type: item.type,
    lead: item.lead ?? undefined,
    ar: item.arabic ?? '',
    sq: item.albanian ?? '',
    transliteration: item.transliteration ?? undefined,
    count: Math.max(1, item.count || 1),
    notes: item.notes,
    audio: item.audio,
    audioParts: item.audio_parts,
    time: item.time ?? undefined,
    reference: item.notes.map(note => note.tekst).join(' · ') || undefined,
  })),
}));

export const EMPTY_MBUROJA_STATE: MburojaState = {
  schemaVersion: 2,
  favChapters: [27, 28],
  savedDuas: [],
  completedByDate: {},
  dailyCountsByDate: {},
  situationalCounts: {},
  duaGoals: {},
};

const migrateRoutineChapterId = (id: number): number => id === 28 ? 27 : id === 29 ? 28 : id;
const uniqueNumbers = (values: unknown): number[] => [...new Set(
  (Array.isArray(values) ? values : []).filter((v): v is number => Number.isInteger(v)).map(migrateRoutineChapterId)
)];

/**
 * Migrates the v1 numeric state without guessing item identity. Old numeric dua IDs were
 * global while package v2 IDs are chapter-local; unresolved IDs are retained explicitly
 * so no user data is silently attributed to the wrong dua.
 */
export function migrateMburojaState(input: unknown): MburojaState {
  if (!input || typeof input !== 'object') return { ...EMPTY_MBUROJA_STATE };
  const old = input as Record<string, unknown>;
  const composite = (value: unknown): value is MburojaItemKey =>
    typeof value === 'string' && /^mburoja:\d+:\d+$/.test(value);
  const legacyIds = new Set<number>();
  const saved = Array.isArray(old.savedDuas) ? old.savedDuas : [];
  saved.forEach(value => { if (typeof value === 'number' && Number.isInteger(value)) legacyIds.add(value); });

  const migrateKeyRecord = (value: unknown): Record<MburojaItemKey, number> => {
    if (!value || typeof value !== 'object') return {};
    const out: Record<string, number> = {};
    for (const [key, count] of Object.entries(value as Record<string, unknown>)) {
      if (composite(key) && typeof count === 'number' && Number.isFinite(count)) out[key] = count;
      else if (/^\d+$/.test(key)) legacyIds.add(Number(key));
    }
    return out as Record<MburojaItemKey, number>;
  };

  const daily: Record<string, Record<MburojaItemKey, number>> = {};
  if (old.dailyCountsByDate && typeof old.dailyCountsByDate === 'object') {
    for (const [date, counts] of Object.entries(old.dailyCountsByDate as Record<string, unknown>)) {
      daily[date] = migrateKeyRecord(counts);
    }
  }
  const completed: Record<string, number[]> = {};
  if (old.completedByDate && typeof old.completedByDate === 'object') {
    for (const [date, chapters] of Object.entries(old.completedByDate as Record<string, unknown>)) {
      completed[date] = uniqueNumbers(chapters);
    }
  }

  return {
    schemaVersion: 2,
    favChapters: uniqueNumbers(old.favChapters),
    savedDuas: saved.filter(composite),
    completedByDate: completed,
    dailyCountsByDate: daily,
    situationalCounts: migrateKeyRecord(old.situationalCounts),
    duaGoals: migrateKeyRecord(old.duaGoals),
    unresolvedLegacyDuaIds: [...legacyIds].sort((a, b) => a - b),
  };
}

export function resolveMburojaAudioUrls(dua: DuaItem): string[] {
  const paths = dua.audioParts?.length ? dua.audioParts : dua.audio ? [dua.audio] : [];
  return paths.map(path => {
    const clean = path.replace(/^\.?\/?/, '');
    return `https://raw.githubusercontent.com/hayatappshqip/h1/main/paketa/${clean}`;
  });
}
