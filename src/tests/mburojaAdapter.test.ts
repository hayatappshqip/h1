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
    expect(MBUROJA_PACKAGE_VERSION).toBe('2.0.0');
    expect(MBUROJA_CHAPTERS).toHaveLength(132);
    const items = MBUROJA_CHAPTERS.flatMap(chapter => chapter.duas);
    expect(items).toHaveLength(278);
    expect(new Set(items.map(item => item.key)).size).toBe(278);
    expect(items.every(item => item.key === makeMburojaItemKey(
      Number(item.key.split(':')[1]), item.id
    ))).toBe(true);
  });

  it('keeps dua and rrefim fields separate and never uses albanian_alt', () => {
    const items = MBUROJA_CHAPTERS.flatMap(chapter => chapter.duas);
    expect(items.filter(item => item.type === 'dua')).toHaveLength(261);
    expect(items.filter(item => item.type === 'rrefim')).toHaveLength(17);
    expect(items.filter(item => item.type === 'dua').every(item => item.ar.length > 0)).toBe(true);
    expect(items.filter(item => item.type === 'rrefim').every(item => Boolean(item.lead))).toBe(true);
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
    const withAudio = MBUROJA_CHAPTERS.flatMap(chapter => chapter.duas).find(item => item.audio);
    const withoutAudio = MBUROJA_CHAPTERS.flatMap(chapter => chapter.duas).find(item => !item.audio);
    expect(withAudio).toBeDefined();
    expect(resolveMburojaAudioUrls(withAudio!)[0]).toContain('/paketa/audios/');
    expect(resolveMburojaAudioUrls(withoutAudio!)).toEqual([]);
  });
});
