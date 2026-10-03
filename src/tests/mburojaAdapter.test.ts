import { describe, expect, it } from 'vitest';
import {
  MBUROJA_CHAPTERS,
  MBUROJA_PACKAGE_VERSION,
  makeMburojaItemKey,
  migrateMburojaState,
  resolveMburojaAudioUrls,
} from '../data/mburojaData';

describe('Mburoja certified package adapter', () => {
  it('adapts the complete certified v2 package with unique composite keys', () => {
    expect(MBUROJA_PACKAGE_VERSION).toBe('2.1.0');
    expect(MBUROJA_CHAPTERS).toHaveLength(132);
    const items = MBUROJA_CHAPTERS.flatMap(chapter => chapter.duas);
    expect(items).toHaveLength(270);
    expect(new Set(items.map(item => item.key)).size).toBe(270);
    expect(items.every(item => item.key === makeMburojaItemKey(
      Number(item.key.split(':')[1]), item.id
    ))).toBe(true);
  });

  it('keeps dua and rrefim fields separate and never uses albanian_alt', () => {
    const items = MBUROJA_CHAPTERS.flatMap(chapter => chapter.duas);
    expect(items.filter(item => item.type === 'dua')).toHaveLength(253);
    expect(items.filter(item => item.type === 'rrefim')).toHaveLength(17);
    expect(items.filter(item => item.type === 'dua').every(item => item.ar.length > 0)).toBe(true);
    expect(items.filter(item => item.type === 'rrefim').every(item => Boolean(item.lead))).toBe(true);
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
      favChapters: [27, 28, 29],
      savedDuas: [7, 'mburoja:27:2'],
      completedByDate: { '2026-10-02': [28, 29] },
      dailyCountsByDate: { '2026-10-02': { 7: 3, 'mburoja:27:2': 1 } },
      situationalCounts: {},
      duaGoals: { 8: 10 },
    });
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.favChapters).toEqual([27, 28]);
    expect(migrated.savedDuas).toEqual(['mburoja:27:2']);
    expect(migrated.dailyCountsByDate['2026-10-02']).toEqual({ 'mburoja:27:2': 1 });
    expect(migrated.unresolvedLegacyDuaIds).toEqual([7, 8]);
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
