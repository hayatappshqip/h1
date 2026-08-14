import "@testing-library/jest-dom/vitest";
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, act, fireEvent, cleanup } from '@testing-library/react';
import { MushafReader } from '../components/quran/mushaf/MushafReader';
import { QuranPositionProvider } from '../context/QuranPositionContext';
import * as prefetchService from '../services/quran/mushafPrefetchService';

// Mock prefetch service
vi.mock('../services/quran/mushafPrefetchService', () => ({
  prefetchQcfFont: vi.fn().mockResolvedValue('QCF_P1'),
  fetchMushafPageData: vi.fn().mockResolvedValue({
    page_number: 1,
    verses: [
      {
        page_number: 1,
        juz_number: 1,
        hizb_number: 1,
        rub_el_hizb_number: 1,
        chapter_id: 1,
        verse_number: 1,
        verse_key: '1:1',
        words: [
          { position: 1, char_type_name: 'word', code_v2: 'ﱁ', v2_page: 1, line_number: 1, page_number: 1 },
          { position: 2, char_type_name: 'end', code_v2: 'ﱂ', v2_page: 1, line_number: 1, page_number: 1 }
        ]
      }
    ]
  }),
  prefetchPageNeighborhood: vi.fn(),
  clearPageDataCache: vi.fn()
}));

describe('MushafReader Auto-Hide Controls', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.useRealTimers();
    cleanup();
  });

  it('renders controls initially, then auto-hides them after inactivity period', async () => {
    render(
      <QuranPositionProvider initialPage={1}>
        <MushafReader />
      </QuranPositionProvider>
    );

    // Initial state: controls are visible
    expect(document.getElementById('mushaf-top-header')).toBeInTheDocument();
    expect(document.getElementById('mushaf-bottom-footer')).toBeInTheDocument();

    // Fast-forward 4500ms
    act(() => {
      vi.advanceTimersByTime(4500);
    });

    // Controls should now be automatically hidden
    expect(document.getElementById('mushaf-top-header')).not.toBeInTheDocument();
    expect(document.getElementById('mushaf-bottom-footer')).not.toBeInTheDocument();
  });

  it('allows tapping empty canvas area to toggle controls back on and re-triggers auto-hide', async () => {
    render(
      <QuranPositionProvider initialPage={1}>
        <MushafReader />
      </QuranPositionProvider>
    );

    // Advance to hide
    act(() => {
      vi.advanceTimersByTime(4500);
    });
    expect(document.getElementById('mushaf-top-header')).not.toBeInTheDocument();

    // Tap canvas to show controls
    const canvas = document.getElementById('mushaf-reading-canvas');
    expect(canvas).toBeInTheDocument();
    
    act(() => {
      fireEvent.click(canvas!);
    });

    // Controls should be visible again
    expect(document.getElementById('mushaf-top-header')).toBeInTheDocument();

    // Advance 4500ms again
    act(() => {
      vi.advanceTimersByTime(4500);
    });

    // Controls auto-hide once more
    expect(document.getElementById('mushaf-top-header')).not.toBeInTheDocument();
  });

  it('does not auto-hide controls when a modal is open', async () => {
    render(
      <QuranPositionProvider initialPage={1}>
        <MushafReader />
      </QuranPositionProvider>
    );

    // Open Surah modal
    const surahPill = screen.getByTitle('Zgjidh Suren');
    act(() => {
      fireEvent.click(surahPill);
    });

    expect(screen.getByText('Zgjidhni Suren')).toBeInTheDocument();

    // Advance time by 5000ms
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Controls and modal should remain intact
    expect(document.getElementById('mushaf-top-header')).toBeInTheDocument();
    expect(screen.getByText('Zgjidhni Suren')).toBeInTheDocument();
  });
});
