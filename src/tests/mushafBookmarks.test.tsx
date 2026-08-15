import "@testing-library/jest-dom/vitest";
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { AyahInteractionLayer } from '../components/quran/mushaf/AyahInteractionLayer';
import { MushafReader } from '../components/quran/mushaf/MushafReader';
import { QuranPositionProvider } from '../context/QuranPositionContext';
import { QuranBookmark } from '../types';
import { QuranPageData } from '../components/quran/mushaf/MushafPageRenderer';
import * as prefetchService from '../services/quran/mushafPrefetchService';

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

// Mock prefetch service to return instant mock page data
vi.mock('../services/quran/mushafPrefetchService', () => ({
  fetchMushafPageData: vi.fn().mockResolvedValue({
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
  }),
  prefetchQcfFont: vi.fn().mockResolvedValue(true),
  prefetchPageNeighborhood: vi.fn(),
  clearPageDataCache: vi.fn(),
}));

describe('Mushaf Bookmark System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('AyahInteractionLayer zero-geometry bookmark highlight', () => {
    it('applies subtle amber styling when isBookmarked is true without changing inline display or glyph contents', () => {
      const { container, rerender } = render(
        <AyahInteractionLayer
          verseKey="1:2"
          isSelected={false}
          isBookmarked={false}
        >
          <span>word glyph</span>
        </AyahInteractionLayer>
      );

      const span = container.querySelector('[data-verse-key="1:2"]');
      expect(span).toBeTruthy();
      expect(span?.className).not.toContain('bg-amber-500/20');

      // Rerender with isBookmarked = true
      rerender(
        <AyahInteractionLayer
          verseKey="1:2"
          isSelected={false}
          isBookmarked={true}
        >
          <span>word glyph</span>
        </AyahInteractionLayer>
      );

      const bookmarkedSpan = container.querySelector('[data-verse-key="1:2"]');
      expect(bookmarkedSpan?.className).toContain('bg-amber-500/20');
      expect(bookmarkedSpan?.className).toContain('inline');
    });
  });

  describe('MushafReader bookmark integration & canonical identity', () => {
    it('renders bookmarked state and toggles bookmark via Ayah modal', async () => {
      const mockBookmarks: QuranBookmark[] = [
        {
          id: 'bkm_1_2',
          surahNumber: 1,
          ayahNumber: 2,
          surahName: 'El-Fatiha',
          createdAt: Date.now(),
        },
      ];

      const onAddBookmark = vi.fn();
      const onRemoveBookmark = vi.fn();

      const { container } = render(
        <QuranPositionProvider initialSurah={1} initialAyah={1}>
          <MushafReader
            bookmarks={mockBookmarks}
            onAddBookmark={onAddBookmark}
            onRemoveBookmark={onRemoveBookmark}
          />
        </QuranPositionProvider>
      );

      // Wait for page rendering
      await waitFor(() => {
        const wordSpan = container.querySelector('[data-verse-key="1:2"]');
        expect(wordSpan).toBeInTheDocument();
      });

      // Click on the ayah word to open ayah modal
      const wordSpan = container.querySelector('[data-verse-key="1:2"]');
      expect(wordSpan).toBeTruthy();
      fireEvent.click(wordSpan!);

      // Verify Ayah Modal is open
      await waitFor(() => {
        expect(screen.getByText('Ajeti 1:2')).toBeInTheDocument();
      });

      // Bookmark button should reflect bookmarked state: "Hiq Faqeshënuesin"
      const toggleBtn = screen.getByTestId('mushaf-bookmark-toggle-btn');
      expect(toggleBtn).toHaveTextContent('Hiq Faqeshënuesin');

      // Clicking toggle button should call onRemoveBookmark with 'bkm_1_2'
      fireEvent.click(toggleBtn);
      expect(onRemoveBookmark).toHaveBeenCalledWith('bkm_1_2');
    });

    it('displays saved bookmarks in the Navigation Modal "Ruajtur" tab', async () => {
      const mockBookmarks: QuranBookmark[] = [
        {
          id: 'bkm_1',
          surahNumber: 1,
          ayahNumber: 2,
          surahName: 'El-Fatiha',
          createdAt: Date.now(),
        },
        {
          id: 'bkm_2',
          surahNumber: 2,
          ayahNumber: 255,
          surahName: 'El-Bekare',
          createdAt: Date.now(),
        },
      ];

      const { container } = render(
        <QuranPositionProvider initialSurah={1} initialAyah={1}>
          <MushafReader bookmarks={mockBookmarks} />
        </QuranPositionProvider>
      );

      // Open Navigation Modal by clicking navigation button in header
      const navBtn = screen.getByTitle('Navigo sipas Faqes / Sures / Xhuzit');
      fireEvent.click(navBtn);

      // Verify navigation modal is open
      await waitFor(() => {
        expect(screen.getByText('Navigimi në Mushaf')).toBeInTheDocument();
      });

      // Switch to bookmarks tab
      const bookmarksTab = screen.getByTestId('mushaf-nav-bookmarks-tab');
      expect(bookmarksTab).toHaveTextContent('Ruajtur (2)');
      fireEvent.click(bookmarksTab);

      // Bookmarks should be listed
      await waitFor(() => {
        expect(screen.getByTestId('mushaf-bkm-item-1-2')).toBeInTheDocument();
        expect(screen.getByTestId('mushaf-bkm-item-2-255')).toBeInTheDocument();
      });
    });
  });
});
