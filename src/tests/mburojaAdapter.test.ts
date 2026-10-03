import { describe, expect, it } from 'vitest';
import {
  MBUROJA_CHAPTERS,
  MBUROJA_PACKAGE_VERSION,
  ROUTINE_CHAPTER_IDS,
  makeMburojaItemKey,
  migrateMburojaState,
  resolveMburojaAudioUrls,
} from '../data/mburojaData';

describe('Mburoja certified package adapter', () => {
  it('adapts the complete certified v2.2 package with unique composite keys', () => {
    expect(MBUROJA_PACKAGE_VERSION).toBe('2.2.0');
    // 132 kapituj të librit + pamja e dytë e rutinës së ch27 (mbrëmja)
    expect(MBUROJA_CHAPTERS).toHaveLength(133);
    const items = MBUROJA_CHAPTERS.flatMap(chapter => chapter.duas);
    // Ch27 ndahet në dy pamje; duatë e përbashkëta shfaqen në të dyja, por çelësi
    // mbetet i njëjti sepse përmbajtja është e njëjta hyrje e librit.
    const unique = new Map(items.map(item => [item.key, item]));
    expect(unique.size).toBe(269);
    expect(items.every(item => item.key === makeMburojaItemKey(
      Number(item.key.split(':')[1]), item.id
    ))).toBe(true);
  });

  it('keeps dua and rrefim fields separate and never uses albanian_alt', () => {
    const unique = [...new Map(
      MBUROJA_CHAPTERS.flatMap(chapter => chapter.duas).map(item => [item.key, item])
    ).values()];
    expect(unique.filter(item => item.type === 'dua')).toHaveLength(252);
    expect(unique.filter(item => item.type === 'rrefim')).toHaveLength(17);
    expect(unique.filter(item => item.type === 'dua').every(item => item.ar.length > 0)).toBe(true);
    expect(unique.filter(item => item.type === 'rrefim').every(item => Boolean(item.lead))).toBe(true);
  });

  it('ndan ch27 në dy rutina: mëngjesi dhe mbrëmja, pa përzierje tekstesh', () => {
    const mengjesi = MBUROJA_CHAPTERS.find(c => c.id === ROUTINE_CHAPTER_IDS.mengjesi);
    const mbremja = MBUROJA_CHAPTERS.find(c => c.id === ROUTINE_CHAPTER_IDS.mbremja);
    expect(mengjesi?.title).toBe('DHIKRI I MËNGJESIT');
    expect(mbremja?.title).toBe('DHIKRI I MBRËMJES');
    expect(mengjesi?.duas).toHaveLength(23);
    expect(mbremja?.duas).toHaveLength(23);
    expect(mengjesi?.duas.every(dua => dua.time !== 'mbrëmje')).toBe(true);
    expect(mbremja?.duas.every(dua => dua.time !== 'mëngjes')).toBe(true);
    // Duatë e përbashkëta janë në të dyja listat me të njëjtin çelës.
    const emri = (d: { key: string }) => d.key;
    const tePerbashketa = mengjesi!.duas.filter(d => mbremja!.duas.some(m => emri(m) === emri(d)));
    expect(tePerbashketa).toHaveLength(16);
    expect(tePerbashketa.every(d => d.time === 'të dyja')).toBe(true);
  });

  it('mban tri suret (Iḫlãs, Feleḳ, Nãs) si një hyrje të vetme me zë', () => {
    const surat = ['huwall-llãhu eḥad', 'bi rabbil feleḳ', 'bi rabbin-nãs'];
    for (const chapterId of [25, 27, 28]) {
      const chapter = MBUROJA_CHAPTERS.find(c => c.id === chapterId);
      expect(chapter).toBeDefined();
      const bashkuar = chapter!.duas.filter(item =>
        surat.every(s => (item.transliteration ?? '').includes(s)));
      expect(bashkuar).toHaveLength(1);
      const paths = bashkuar[0].audioParts?.length
        ? bashkuar[0].audioParts
        : bashkuar[0].audio ? [bashkuar[0].audio] : [];
      expect(paths.length).toBeGreaterThan(0);
    }
  });

  it('retains ambiguous v1 IDs instead of assigning them to the wrong item', () => {
    const migrated = migrateMburojaState({
      schemaVersion: 1,
      favChapters: [27, 28, 29],
      savedDuas: [7, 'mburoja:27:2'],
      completedByDate: { '2026-10-02': [28, 29] },
      dailyCountsByDate: { '2026-10-02': { 7: 3, 'mburoja:27:2': 1 } },
      situationalCounts: {},
      duaGoals: { 8: 10 },
    });
    expect(migrated.schemaVersion).toBe(3);
    // Kapitujt 28/29 të gjendjes v1 u zhvendosën dikur në 27/28; 27 shpaloset në të dyja pamjet.
    expect(migrated.favChapters).toEqual([27, 271, 28]);
    expect(migrated.savedDuas).toEqual(['mburoja:27:2']);
    expect(migrated.dailyCountsByDate['2026-10-02']).toEqual({ 'mburoja:27:2': 1 });
    expect(migrated.unresolvedLegacyDuaIds).toEqual([7, 8]);
  });

  it('rimëkëmb çelësat e ch27 një herë, vetëm për gjendjet e vjetra', () => {
    const v2 = migrateMburojaState({
      schemaVersion: 2,
      favChapters: [27, 28],
      savedDuas: ['mburoja:27:5', 'mburoja:27:6', 'mburoja:27:31'],
      completedByDate: { '2026-10-03': [27] },
      dailyCountsByDate: { '2026-10-03': { 'mburoja:27:5': 3, 'mburoja:27:6': 2, 'mburoja:27:31': 1 } },
      situationalCounts: {},
      duaGoals: {},
    });
    // id 6 u bashkua me 5 → numëruesit mblidhen; id-të pasuese zhvendosen me -1.
    expect(v2.dailyCountsByDate['2026-10-03']).toEqual({ 'mburoja:27:5': 5, 'mburoja:27:30': 1 });
    expect(v2.savedDuas).toEqual(['mburoja:27:5', 'mburoja:27:30']);
    expect(v2.favChapters).toEqual([27, 271, 28]);
    expect(v2.completedByDate['2026-10-03']).toEqual([27]);

    // Gjendja e tashme (v3) nuk preket më — migrimi është idempotent.
    const again = migrateMburojaState(v2);
    expect(again.dailyCountsByDate).toEqual(v2.dailyCountsByDate);
    expect(again.savedDuas).toEqual(v2.savedDuas);
    expect(again.favChapters).toEqual(v2.favChapters);
  });

  it('resolves only package-declared audio paths', () => {
    const items = MBUROJA_CHAPTERS.flatMap(chapter => chapter.duas);
    const withAudio = items.find(item => item.audio);
    const withParts = items.find(item => (item.audioParts?.length ?? 0) > 1);
    const withoutAudio = items.find(item => !item.audio);
    expect(withAudio).toBeDefined();
    expect(withParts).toBeDefined();
    expect(resolveMburojaAudioUrls(withAudio!)[0]).toContain('/paketa/audios/');
    expect(resolveMburojaAudioUrls(withParts!)).toHaveLength(withParts!.audioParts!.length);
    expect(resolveMburojaAudioUrls(withoutAudio!)).toEqual([]);
  });
});
