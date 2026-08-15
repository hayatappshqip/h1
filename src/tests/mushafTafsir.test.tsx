import "@testing-library/jest-dom/vitest";
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MushafReader } from '../components/quran/mushaf/MushafReader';
import { TafsirOverlay } from '../components/quran/mushaf/TafsirOverlay';
import { QuranPositionProvider } from '../context/QuranPositionContext';
import { QuranBookmark } from '../types';
import { QuranPageData } from '../components/quran/mushaf/MushafPageRenderer';
import * as tafsirService from '../services/quran/tafsirService';

const mockPage1Data: QuranPageData = {
  page_number: 1,
  verses: [
    {
      page_number: 1,
      juz_number: 1,
      hizb_number: 1,
      rub_el_hizb_number: 1,
      chapter_id: 1,
      verse_number: 2,
      verse_key: '1:2',
      words: [
        {
          position: 1,
          char_type_name: 'word',
          code_v2: 'ﭐ',
          v2_page: 1,
          line_number: 3,
          page_number: 1,
        },
        {
          position: 2,
          char_type_name: 'end',
          code_v2: 'ﭑ',
          v2_page: 1,
          line_number: 3,
          page_number: 1,
        },
      ],
    },
  ],
};

vi.mock('../services/quran/mushafPrefetchService', () => ({
  fetchMushafPageData: vi.fn().mockImplementation(async (pageNum: number) => ({
    page_number: pageNum,
    verses: [
      {
        page_number: pageNum,
        juz_number: 1,
        hizb_number: 1,
        rub_el_hizb_number: 1,
        chapter_id: 1,
        verse_number: 2,
        verse_key: '1:2',
        words: [
          {
            position: 1,
            char_type_name: 'word',
            code_v2: 'ﭐ',
            v2_page: pageNum,
            line_number: 3,
            page_number: pageNum,
          },
          {
            position: 2,
            char_type_name: 'end',
            code_v2: 'ﭑ',
            v2_page: pageNum,
            line_number: 3,
            page_number: pageNum,
          },
        ],
      },
    ],
  })),
  prefetchQcfFont: vi.fn().mockResolvedValue(true),
  prefetchPageNeighborhood: vi.fn().mockResolvedValue(undefined),
  clearPageDataCache: vi.fn(),
}));

describe('Mushaf Tafsir Overlay Feature', () => {
  beforeEach(() => {
    tafsirService.clearTafsirCache();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('1. opens Tafsir Overlay from Ayah modal and displays correct verse_key and local Albanian translation', async () => {
    // Mock getTafsir
    vi.spyOn(tafsirService, 'getTafsir').mockResolvedValue({
      verseKey: '1:2',
      surahNumber: 1,
      ayahNumber: 2,
      source: tafsirService.getTafsirSourceById('nahi-footnotes'),
      text: 'Çdo lëvdatë i përket Allahut, Krijuesit dhe Furnizuesit të të gjitha botëve.',
      rawHtml: '<p>Çdo lëvdatë i përket Allahut, Krijuesit dhe Furnizuesit të të gjitha botëve.</p>',
      attribution: 'Përkthimi dhe komentimi nga Hasan I. Nahi / QuranEnc.com',
    });

    const { container } = render(
      <QuranPositionProvider initialSurah={1} initialAyah={1}>
        <MushafReader />
      </QuranPositionProvider>
    );

    // Wait for word to render on page
    await waitFor(() => {
      const wordSpan = container.querySelector('[data-verse-key="1:2"]');
      expect(wordSpan).toBeInTheDocument();
    });

    // Click word to open Ayah Modal
    const wordSpan = container.querySelector('[data-verse-key="1:2"]');
    expect(wordSpan).toBeTruthy();
    fireEvent.click(wordSpan!);

    // Find "Shiko Tefsirin" button
    const viewTafsirBtn = await screen.findByTestId('mushaf-view-tafsir-btn');
    expect(viewTafsirBtn).toBeInTheDocument();

    // Click "Shiko Tefsirin"
    fireEvent.click(viewTafsirBtn);

    // Verify Tafsir Overlay is visible
    const tafsirOverlay = await screen.findByTestId('mushaf-tafsir-overlay');
    expect(tafsirOverlay).toBeInTheDocument();
    expect(screen.getByText(/Ajeti 1:2/i)).toBeInTheDocument();

    // Verify Hasan Nahi Albanian translation label appears
    expect(screen.getByText(/Përkthimi në shqip \(Hasan Nahi\):/i)).toBeInTheDocument();

    // Verify Tafsir success content rendered
    await waitFor(() => {
      expect(screen.getByTestId('tafsir-success-content')).toBeInTheDocument();
    });
    expect(screen.getByText(/Çdo lëvdatë i përket Allahut/i)).toBeInTheDocument();
  });

  it('2. displays loading state while fetching Tafsir', async () => {
    // Delay resolution
    let resolvePromise: (val: any) => void;
    const delayedPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    vi.spyOn(tafsirService, 'getTafsir').mockReturnValue(delayedPromise as any);

    render(<TafsirOverlay verseKey="1:2" onClose={vi.fn()} />);

    // Check loading indicator is shown
    expect(screen.getByTestId('tafsir-loading-state')).toBeInTheDocument();

    // Resolve
    resolvePromise!({
      verseKey: '1:2',
      surahNumber: 1,
      ayahNumber: 2,
      source: tafsirService.getTafsirSourceById('nahi-footnotes'),
      text: 'Komentimi i plotë i ajetit.',
      attribution: 'Attribution test',
    });

    await waitFor(() => {
      expect(screen.getByTestId('tafsir-success-content')).toBeInTheDocument();
    });
  });

  it('3. allows switching Tafsir sources and respects language and attribution', async () => {
    const getTafsirSpy = vi.spyOn(tafsirService, 'getTafsir').mockImplementation(async (key, sourceId) => {
      const source = tafsirService.getTafsirSourceById(sourceId || 'nahi-footnotes');
      return {
        verseKey: key,
        surahNumber: 1,
        ayahNumber: 2,
        source,
        text: `Content for ${source.name}`,
        attribution: source.attribution,
      };
    });

    render(<TafsirOverlay verseKey="1:2" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('tafsir-success-content')).toBeInTheDocument();
    });
    expect(screen.getByText(/Content for Komentimi i Hasan Nahit/i)).toBeInTheDocument();

    // Switch to Ibn Kathir
    const ibnKathirPill = screen.getByTestId('tafsir-source-pill-ibn-kathir');
    fireEvent.click(ibnKathirPill);

    await waitFor(() => {
      expect(screen.getByText(/Content for Tefsiri i Ibn Kethirit/i)).toBeInTheDocument();
    });
    expect(getTafsirSpy).toHaveBeenCalledWith('1:2', 'ibn-kathir', expect.any(AbortSignal));

    // Switch to As-Sa'di
    const saadiPill = screen.getByTestId('tafsir-source-pill-saadi');
    fireEvent.click(saadiPill);

    await waitFor(() => {
      expect(screen.getByText(/Content for Tefsir Es-Sa'di/i)).toBeInTheDocument();
    });
  });

  it('4. uses session memory cache for instant repeated fetches', async () => {
    const originalFetch = global.fetch;
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: {
          footnotes: 'Shënim i ruajtur në cache.',
          translation: 'Përkthim',
        },
      }),
    });
    global.fetch = fetchMock;

    try {
      // First call (fetches network)
      const res1 = await tafsirService.getTafsir('1:2', 'nahi-footnotes');
      expect(res1.text).toBe('Shënim i ruajtur në cache.');
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Second call for same key and source (should hit cache)
      const res2 = await tafsirService.getTafsir('1:2', 'nahi-footnotes');
      expect(res2.text).toBe('Shënim i ruajtur në cache.');
      expect(fetchMock).toHaveBeenCalledTimes(1); // Not called again!
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('5. handles timeout, displays friendly Albanian error, and supports retry', async () => {
    let callCount = 0;
    vi.spyOn(tafsirService, 'getTafsir').mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        throw new Error('Kërkesa vonoi shumë. Ju lutem kontrolloni lidhjen tuaj të internetit.');
      }
      return {
        verseKey: '1:2',
        surahNumber: 1,
        ayahNumber: 2,
        source: tafsirService.getTafsirSourceById('nahi-footnotes'),
        text: 'Teksti pas riprovimit me sukses.',
        attribution: 'Attribution',
      };
    });

    render(<TafsirOverlay verseKey="1:2" onClose={vi.fn()} />);

    // Verify error state
    await waitFor(() => {
      expect(screen.getByTestId('tafsir-error-state')).toBeInTheDocument();
    });
    expect(screen.getByText(/Kërkesa vonoi shumë/i)).toBeInTheDocument();

    // Click retry
    const retryBtn = screen.getByTestId('tafsir-retry-btn');
    fireEvent.click(retryBtn);

    // Verify success after retry
    await waitFor(() => {
      expect(screen.getByTestId('tafsir-success-content')).toBeInTheDocument();
    });
    expect(screen.getByText(/Teksti pas riprovimit me sukses/i)).toBeInTheDocument();
  });

  it('6. handles empty response gracefully with informational state', async () => {
    vi.spyOn(tafsirService, 'getTafsir').mockResolvedValue({
      verseKey: '1:2',
      surahNumber: 1,
      ayahNumber: 2,
      source: tafsirService.getTafsirSourceById('nahi-footnotes'),
      text: '',
      rawHtml: '',
      attribution: 'Attribution',
    });

    render(<TafsirOverlay verseKey="1:2" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('tafsir-empty-state')).toBeInTheDocument();
    });
    expect(screen.getByText(/Nuk ka komentim të veçantë për këtë ajet/i)).toBeInTheDocument();
  });

  it('7. closes overlay on close button click and Escape key', async () => {
    const handleClose = vi.fn();
    const { rerender } = render(<TafsirOverlay verseKey="1:2" onClose={handleClose} />);

    const closeBtn = screen.getByTestId('tafsir-close-btn');
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Test Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('8. preserves bookmarks and Quran page state when opening/closing Tafsir', async () => {
    const mockBookmark: QuranBookmark = {
      id: 'bm-1',
      surahNumber: 1,
      ayahNumber: 2,
      surahName: 'El-Fatiha',
      createdAt: 1000,
      note: 'My bookmark',
    };

    const { container } = render(
      <QuranPositionProvider initialSurah={1} initialAyah={1}>
        <MushafReader bookmarks={[mockBookmark]} />
      </QuranPositionProvider>
    );

    // Wait for page rendering
    await waitFor(() => {
      const wordSpan = container.querySelector('[data-verse-key="1:2"]');
      expect(wordSpan).toBeInTheDocument();
    });

    // Open ayah modal
    const wordSpan = container.querySelector('[data-verse-key="1:2"]');
    expect(wordSpan).toBeTruthy();
    fireEvent.click(wordSpan!);

    // Open Tafsir
    const viewTafsirBtn = await screen.findByTestId('mushaf-view-tafsir-btn');
    fireEvent.click(viewTafsirBtn);

    // Close Tafsir
    const closeBtn = await screen.findByTestId('tafsir-close-btn');
    fireEvent.click(closeBtn);

    // Overlay is closed
    await waitFor(() => {
      expect(screen.queryByTestId('mushaf-tafsir-overlay')).not.toBeInTheDocument();
    });

    // Page 1 word is still preserved and active
    expect(container.querySelector('[data-verse-key="1:2"]')).toBeInTheDocument();
  });

  it('9. isolates touch events so scrolling does not leak to underlying page', async () => {
    render(<TafsirOverlay verseKey="1:2" onClose={vi.fn()} />);

    const overlay = screen.getByTestId('mushaf-tafsir-overlay');
    const touchStartEvent = new Event('touchstart', { bubbles: true });
    const stopPropagationSpy = vi.spyOn(touchStartEvent, 'stopPropagation');

    overlay.dispatchEvent(touchStartEvent);
    expect(stopPropagationSpy).toHaveBeenCalled();
  });
});
