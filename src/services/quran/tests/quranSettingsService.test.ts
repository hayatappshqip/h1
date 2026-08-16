// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadQuranReadingSettings,
  saveQuranReadingSettings,
  mapReadingThemeToMushafTheme,
  mapMushafThemeToReadingTheme,
  normalizeScriptType,
  DEFAULT_READING_SETTINGS,
  QURAN_RECITERS,
  SETTINGS_CHANGED_EVENT,
} from '../quranSettingsService';

describe('quranSettingsService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads default settings when localStorage is empty', () => {
    const settings = loadQuranReadingSettings();
    expect(settings).toEqual(DEFAULT_READING_SETTINGS);
    expect(settings.theme).toBe('sepia');
    expect(settings.arabicFontSize).toBe(28);
    expect(settings.selectedReciterKey).toBe('alafasy');
  });

  it('preserves and normalizes stored settings', () => {
    localStorage.setItem(
      'hayat_quran_reading_settings',
      JSON.stringify({
        theme: 'midnight',
        arabicFontSize: 34,
        albanianFontSize: 17,
        lineSpacing: 2.8, // oversized, should be normalized to 1.8
        layoutMode: 'mushaf',
        selectedReciterKey: 'minshawi',
        scriptType: 'qcf4', // legacy value, should normalize to uthmani_hafs_unicode
        dailyAyahGoal: 20,
      })
    );

    const settings = loadQuranReadingSettings();
    expect(settings.theme).toBe('midnight');
    expect(settings.arabicFontSize).toBe(34);
    expect(settings.lineSpacing).toBe(1.8);
    expect(settings.layoutMode).toBe('cards');
    expect(settings.selectedReciterKey).toBe('minshawi');
    expect(settings.scriptType).toBe('uthmani_hafs_unicode');
    expect(settings.dailyAyahGoal).toBe(20);
  });

  it('saves partial updates and syncs mushaf paper theme', () => {
    const listener = vi.fn();
    window.addEventListener(SETTINGS_CHANGED_EVENT, listener);

    const updated = saveQuranReadingSettings({
      theme: 'midnight',
      selectedReciterKey: 'husary',
      dailyAyahGoal: 50,
    });

    expect(updated.theme).toBe('midnight');
    expect(updated.selectedReciterKey).toBe('husary');
    expect(updated.dailyAyahGoal).toBe(50);

    // Verify localStorage persistence
    const savedRaw = localStorage.getItem('hayat_quran_reading_settings');
    expect(savedRaw).toBeTruthy();
    const saved = JSON.parse(savedRaw!);
    expect(saved.theme).toBe('midnight');
    expect(saved.selectedReciterKey).toBe('husary');

    // Verify mushaf paper theme was synchronized
    expect(localStorage.getItem('hayat_mushaf_theme')).toBe('dark');

    // Verify event dispatch
    expect(listener).toHaveBeenCalled();
    window.removeEventListener(SETTINGS_CHANGED_EVENT, listener);
  });

  describe('Theme mapping', () => {
    it('correctly maps reading themes to mushaf themes', () => {
      expect(mapReadingThemeToMushafTheme('sepia')).toBe('sepia');
      expect(mapReadingThemeToMushafTheme('dark')).toBe('dark');
      expect(mapReadingThemeToMushafTheme('light')).toBe('white');
      expect(mapReadingThemeToMushafTheme('midnight')).toBe('dark');
    });

    it('correctly maps mushaf themes to reading themes', () => {
      expect(mapMushafThemeToReadingTheme('ivory')).toBe('sepia');
      expect(mapMushafThemeToReadingTheme('sepia')).toBe('sepia');
      expect(mapMushafThemeToReadingTheme('white')).toBe('light');
      expect(mapMushafThemeToReadingTheme('dark')).toBe('dark');
    });
  });

  describe('Script normalization', () => {
    it('normalizes legacy script keys', () => {
      expect(normalizeScriptType('qcf4')).toBe('uthmani_hafs_unicode');
      expect(normalizeScriptType(undefined)).toBe('uthmani_hafs_unicode');
      expect(normalizeScriptType('uthmani_unicode')).toBe('uthmani_unicode');
      expect(normalizeScriptType('uthmani_hafs_unicode')).toBe('uthmani_hafs_unicode');
    });
  });

  describe('Reciters list', () => {
    it('contains all 14 canonical reciters with valid audio URLs', () => {
      expect(QURAN_RECITERS.length).toBe(14);
      for (const reciter of QURAN_RECITERS) {
        expect(reciter.key).toBeTruthy();
        expect(reciter.name).toBeTruthy();
        expect(reciter.getSurahAudioUrl(1)).toContain('.mp3');
        expect(reciter.getAyahAudioUrl(1, 1)).toContain('.mp3');
      }
    });
  });
});
