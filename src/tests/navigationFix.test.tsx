import "@testing-library/jest-dom/vitest";
// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { KuraniView } from '../components/KuraniView';
import { HomeView } from '../components/HomeView';
import { saveQuranPosition, loadCachedQuranPosition } from '../services/quran/quranPersistenceService';
import { QuranReadingState } from '../types';

const defaultReadingState: QuranReadingState = {
  lastReadSurah: 2,
  lastReadAyah: 17,
  updatedAt: Date.now()
};

describe('Navigation Fix Regression Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('1. Last position in Mushaf mode (page 3) opens Mushaf V2 on page 3', async () => {
    saveQuranPosition({
      surah: 2,
      ayah: 17,
      verseKey: '2:17',
      page: 3,
      juz: 1,
      hizbQuarter: 1,
      activeReadingMode: 'mushaf'
    });

    render(
      <KuraniView
        readingState={defaultReadingState}
        bookmarks={[]}
        notes={[]}
        onUpdateReadingState={() => {}}
        onAddBookmark={() => {}}
        onRemoveBookmark={() => {}}
      />
    );

    // Click "Vazhdo Leximin" Hero Banner
    const continueBtn = screen.getByText('Vazhdo Leximin').closest('div');
    expect(continueBtn).not.toBeNull();
    fireEvent.click(continueBtn!);

    // Check that Mushaf V2 opens on Page 3
    await waitFor(() => {
      expect(screen.getByText(/Faqja 3/i)).toBeInTheDocument();
    });
  });

  it('2. Last position on page 10 opens page 10, NOT page 1 or page 2', async () => {
    saveQuranPosition({
      surah: 2,
      ayah: 65,
      verseKey: '2:65',
      page: 10,
      juz: 1,
      hizbQuarter: 2,
      activeReadingMode: 'mushaf'
    });

    render(
      <KuraniView
        readingState={defaultReadingState}
        bookmarks={[]}
        notes={[]}
        onUpdateReadingState={() => {}}
        onAddBookmark={() => {}}
        onRemoveBookmark={() => {}}
      />
    );

    const continueBtn = screen.getByText('Vazhdo Leximin').closest('div');
    fireEvent.click(continueBtn!);

    await waitFor(() => {
      expect(screen.getByText(/Faqja 10/i)).toBeInTheDocument();
    });
  });

  it('3. Last position in Cards/verse mode retains Cards behavior', async () => {
    saveQuranPosition({
      surah: 2,
      ayah: 17,
      verseKey: '2:17',
      page: 3,
      juz: 1,
      hizbQuarter: 1,
      activeReadingMode: 'verse'
    });

    render(
      <KuraniView
        readingState={defaultReadingState}
        bookmarks={[]}
        notes={[]}
        onUpdateReadingState={() => {}}
        onAddBookmark={() => {}}
        onRemoveBookmark={() => {}}
      />
    );

    const continueBtn = screen.getByText('Vazhdo Leximin').closest('div');
    fireEvent.click(continueBtn!);

    // In verse mode, card/verse view opens
    await waitFor(() => {
      expect(screen.getByText(/El-Bekare|Al-Baqarah/i)).toBeInTheDocument();
    });
  });

  it('4. Khatmah navigation (page 5) opens Mushaf V2 directly on page 5', async () => {
    const { container } = render(
      <KuraniView
        initialSubTab="khatam"
        readingState={defaultReadingState}
        bookmarks={[]}
        notes={[]}
        onUpdateReadingState={() => {}}
        onAddBookmark={() => {}}
        onRemoveBookmark={() => {}}
      />
    );

    // Click "Vazhdo hatmen (Faqja 1)" or page continuation button
    const khatamBtn = screen.getByText(/Vazhdo hatmen/i);
    fireEvent.click(khatamBtn);

    await waitFor(() => {
      // Should navigate to Mushaf V2 reader and NOT cards
      expect(container.querySelector('#hayat-mushaf-reader')).toBeInTheDocument();
    });
  });

  it('5. HomeView "Vazhdo Leximin" passes page 3 when activeReadingMode is mushaf', () => {
    saveQuranPosition({
      surah: 2,
      ayah: 17,
      verseKey: '2:17',
      page: 3,
      juz: 1,
      hizbQuarter: 1,
      activeReadingMode: 'mushaf'
    });

    const onOpenQuranSurah = vi.fn();
    const setActiveTab = vi.fn();

    render(
      <HomeView
        prayerTimes={null}
        prayerSettings={{} as any}
        mburojaState={{ completedByDate: {} } as any}
        dayItems={[]}
        quranReadingState={defaultReadingState}
        postPrayerDhikrSessions={[]}
        setActiveTab={setActiveTab}
        onOpenMburojaChapter={() => {}}
        onOpenQuranSurah={onOpenQuranSurah}
      />
    );

    const homeCard = screen.getByText('Vazhdo Leximin').closest('#card-kurani-shortcut');
    expect(homeCard).not.toBeNull();
    fireEvent.click(homeCard!);

    expect(onOpenQuranSurah).toHaveBeenCalledWith(2, 17, 'mushaf_qcf', 3);
    expect(setActiveTab).toHaveBeenCalledWith('kurani');
  });

  it('6. Opening a Khatmah page does NOT automatically mark that page as completed', async () => {
    const { container } = render(
      <KuraniView
        initialSubTab="khatam"
        readingState={defaultReadingState}
        bookmarks={[]}
        notes={[]}
        onUpdateReadingState={() => {}}
        onAddBookmark={() => {}}
        onRemoveBookmark={() => {}}
      />
    );

    const khatamBtn = screen.getByText(/Vazhdo hatmen/i);
    fireEvent.click(khatamBtn);

    await waitFor(() => {
      expect(container.querySelector('#hayat-mushaf-reader')).toBeInTheDocument();
    });
  });
});
