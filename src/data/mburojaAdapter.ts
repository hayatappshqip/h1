import rawPackage from '../../paketa/data/mburoja.json';
import type {
  DuaItem,
  MburojaCategory,
  MburojaChapter,
  MburojaItemKey,
  MburojaRoutine,
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
  { id: 'mëngjes-dhe-mbrëmje', title: 'Mëngjes dhe mbrëmje', icon: 'Sun', chapterIds: [1, 27, 271, 28, 29, 30, 31] },
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

/**
 * Rutina "Dhikri i mëngjesit dhe i mbrëmjes" është NJË kapitull në libër (27),
 * por aplikacioni e shfaq si dy hyrje të veçanta — ashtu siç lexohet:
 * një herë në mëngjes, një herë në mbrëmje. Duatë e përbashkëta (Ayat al-Kursi,
 * tri suret, sayyidul istigfar…) shfaqen në të dyja listat, secila me tekstin e
 * kohës së vet; çelësat e ruajtjes mbeten `mburoja:27:<id>` për të dyja, sepse
 * përmbajtja është e njëjta hyrje e librit.
 */
export const ROUTINE_CHAPTER_IDS = { mengjesi: 27, mbremja: 271 } as const;

/** Kapitujt ku luajtësi i zërit shfaqet edhe pa incizim (me "Nuk ka audio"). */
export const AUDIO_ROUTINE_CHAPTER_IDS: readonly number[] = [27, 271, 28, 29];

export const isRoutineChapterId = (chapterId: number): boolean =>
  AUDIO_ROUTINE_CHAPTER_IDS.includes(chapterId);

export const duaHasAudio = (dua: DuaItem): boolean =>
  Boolean(dua.audio) || Boolean(dua.audioParts && dua.audioParts.length > 0);

type RoutineView = { id: number; title: string; routine: MburojaRoutine; time: 'mëngjes' | 'mbrëmje' };

const ROUTINE_SPLITS: Record<number, RoutineView[]> = {
  27: [
    { id: ROUTINE_CHAPTER_IDS.mengjesi, title: 'DHIKRI I MËNGJESIT', routine: 'mëngjes', time: 'mëngjes' },
    { id: ROUTINE_CHAPTER_IDS.mbremja, title: 'DHIKRI I MBRËMJES', routine: 'mbrëmje', time: 'mbrëmje' },
  ],
};

const toDua = (packageChapterId: number, item: PackageItem): DuaItem => ({
  id: item.id,
  key: makeMburojaItemKey(packageChapterId, item.id),
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
});

const mapPackageChapter = (chapter: PackageChapter): MburojaChapter[] => {
  const categoryId = categoryByChapter.get(chapter.id) ?? 'mirësjellja';
  const split = ROUTINE_SPLITS[chapter.id];

  if (!split) {
    return [{
      id: chapter.id,
      categoryId,
      title: chapter.title,
      page: chapter.page,
      isRoutine: chapter.id === 28 ? 'gjumi' : undefined,
      duas: chapter.items.map(item => toDua(chapter.id, item)),
    }];
  }

  return split.map(view => ({
    id: view.id,
    categoryId,
    title: view.title,
    page: chapter.page,
    isRoutine: view.routine,
    packageChapterId: chapter.id,
    // Mëngjesi ruan çdo hyrje që nuk është shprehimisht e mbrëmjes (dhe anasjelltas),
    // që asnjë hyrje e librit të mos humbasë nga të dyja listat.
    duas: chapter.items
      .filter(item => item.time !== (view.time === 'mëngjes' ? 'mbrëmje' : 'mëngjes'))
      .map(item => toDua(chapter.id, item)),
  }));
};

export const MBUROJA_CHAPTERS: MburojaChapter[] = data.chapters.flatMap(mapPackageChapter);

export const EMPTY_MBUROJA_STATE: MburojaState = {
  schemaVersion: 3,
  favChapters: [27, 271, 28],
  savedDuas: [],
  completedByDate: {},
  dailyCountsByDate: {},
  situationalCounts: {},
  duaGoals: {},
};

export const MBUROJA_STATE_VERSION = 3;

/**
 * v2.1.0 → v2.2.0: brenda ch27 dy hyrjet e mbrëmjes u bashkuan në një të vetme,
 * ndaj id-të pasuese u zhvendosën me -1 (id 6 → 5). Çelësat e ruajtjes rimëkëmben
 * një herë, vetëm për gjendjet e vjetra, që numëruesit të mos kalojnë te dua e gabuar.
 */
const CH27_ID_REMAP = (id: number): number => (id === 6 ? 5 : id >= 7 ? id - 1 : id);

const remapCh27Key = (key: MburojaItemKey): MburojaItemKey => {
  const match = /^mburoja:27:(\d+)$/.exec(key);
  return match ? makeMburojaItemKey(27, CH27_ID_REMAP(Number(match[1]))) : key;
};

/** Numërimi i kapitujve në gjendjet shumë të vjetra (para v2). */
const migrateLegacyChapterId = (id: number): number => (id === 28 ? 27 : id === 29 ? 28 : id);

/**
 * Migrates the v1 numeric state without guessing item identity. Old numeric dua IDs were
 * global while package v2 IDs are chapter-local; unresolved IDs are retained explicitly
 * so no user data is silently attributed to the wrong dua.
 */
export function migrateMburojaState(input: unknown): MburojaState {
  if (!input || typeof input !== 'object') return { ...EMPTY_MBUROJA_STATE };
  const old = input as Record<string, unknown>;
  const storedVersion = Number(old.schemaVersion ?? 1);
  const isLegacy = storedVersion < MBUROJA_STATE_VERSION;
  const isV1 = storedVersion < 2;
  const composite = (value: unknown): value is MburojaItemKey =>
    typeof value === 'string' && /^mburoja:\d+:\d+$/.test(value);
  const fixKey = (key: MburojaItemKey): MburojaItemKey => (isLegacy ? remapCh27Key(key) : key);
  const fixChapterIds = (values: unknown, mirrorRoutine: boolean): number[] => [...new Set(
    (Array.isArray(values) ? values : [])
      .filter((v): v is number => Number.isInteger(v))
      .map(id => (isV1 ? migrateLegacyChapterId(id) : id))
      .flatMap(id => (isLegacy && mirrorRoutine && id === 27 ? [27, 271] : [id]))
  )];
  const legacyIds = new Set<number>();
  const saved = Array.isArray(old.savedDuas) ? old.savedDuas : [];
  saved.forEach(value => { if (typeof value === 'number' && Number.isInteger(value)) legacyIds.add(value); });

  const migrateKeyRecord = (value: unknown): Record<MburojaItemKey, number> => {
    if (!value || typeof value !== 'object') return {};
    const out: Record<string, number> = {};
    for (const [key, count] of Object.entries(value as Record<string, unknown>)) {
      if (composite(key) && typeof count === 'number' && Number.isFinite(count)) {
        const fixed = fixKey(key);
        // Dy hyrje të vjetra që tani janë një: numëruesit mblidhen, nuk humbin.
        out[fixed] = (out[fixed] ?? 0) + count;
      } else if (/^\d+$/.test(key)) legacyIds.add(Number(key));
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
      completed[date] = fixChapterIds(chapters, false);
    }
  }

  return {
    schemaVersion: MBUROJA_STATE_VERSION,
    favChapters: fixChapterIds(old.favChapters, true),
    savedDuas: [...new Set(saved.filter(composite).map(fixKey))],
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
