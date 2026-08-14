import "@testing-library/jest-dom/vitest";
// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, act } from '@testing-library/react';
import { MushafPageRenderer, QuranPageData } from '../components/quran/mushaf/MushafPageRenderer';
import { MUSHAF_THEMES } from '../components/quran/mushaf/MushafPageFrame';
import { MushafReader } from '../components/quran/mushaf/MushafReader';
import { QuranPositionProvider } from '../context/QuranPositionContext';
import * as prefetchService from '../services/quran/mushafPrefetchService';

describe('Mushaf Content Rendering Suite', () => {
  const defaultTheme = MUSHAF_THEMES.ivory;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders Surah Header and Bismillah on Page 106 (Surah 5 Al-Ma\'idah start page)', () => {
    // Mock data for page 106 where 5:1 starts on line 3
    const mockPage106Data: QuranPageData = {
      page_number: 106,
      verses: [
        {
          page_number: 106,
          juz_number: 6,
          hizb_number: 11,
          rub_el_hizb_number: 21,
          chapter_id: 5,
          verse_number: 1,
          verse_key: '5:1',
          words: [
            { position: 1, char_type_name: 'word', code_v2: 'ﭬ', v2_page: 106, line_number: 3, page_number: 106 },
            { position: 2, char_type_name: 'word', code_v2: 'ﭭ', v2_page: 106, line_number: 3, page_number: 106 },
            { position: 3, char_type_name: 'end', code_v2: 'ﭮ', v2_page: 106, line_number: 3, page_number: 106 },
          ],
        },
      ],
    };

    const { container } = render(
      <MushafPageRenderer
        pageNumber={106}
        pageData={mockPage106Data}
        fontFamily="QCF_P106"
        theme={defaultTheme}
      />
    );

    // Verify Surah Header banner is present
    const surahHeader = container.querySelector('[data-surah-header="5"]');
    expect(surahHeader).toBeInTheDocument();
    expect(surahHeader).toHaveTextContent(/المائدة/i);

    // Verify Bismillah frame is present
    const bismillah = container.querySelector('[data-bismillah-frame="true"]');
    expect(bismillah).toBeInTheDocument();
    expect(bismillah).toHaveTextContent('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ');

    // Verify Ayah word is rendered
    expect(screen.getByText('ﭬ')).toBeInTheDocument();
  });

  it('renders standard verse lines without Bismillah/Header on Page 107 (continuation page)', () => {
    // Mock data for page 107 where verses 5:3 continues (no new surah)
    const mockPage107Data: QuranPageData = {
      page_number: 107,
      verses: [
        {
          page_number: 107,
          juz_number: 6,
          hizb_number: 11,
          rub_el_hizb_number: 21,
          chapter_id: 5,
          verse_number: 3,
          verse_key: '5:3',
          words: [
            { position: 1, char_type_name: 'word', code_v2: 'ﭑ', v2_page: 107, line_number: 1, page_number: 107 },
            { position: 2, char_type_name: 'word', code_v2: 'ﭒ', v2_page: 107, line_number: 1, page_number: 107 },
          ],
        },
      ],
    };

    const { container } = render(
      <MushafPageRenderer
        pageNumber={107}
        pageData={mockPage107Data}
        fontFamily="QCF_P107"
        theme={defaultTheme}
      />
    );

    // There should be NO Bismillah frame on page 107 (continuation)
    expect(container.querySelector('[data-bismillah-frame="true"]')).not.toBeInTheDocument();
    expect(container.querySelector('[data-surah-header="5"]')).not.toBeInTheDocument();

    // Line 1 word should be present
    expect(screen.getByText('ﭑ')).toBeInTheDocument();
  });

  it('renders Surah Header but omits Bismillah on Page 187 (Surah 9 At-Tawbah)', () => {
    const mockPage187Data: QuranPageData = {
      page_number: 187,
      verses: [
        {
          page_number: 187,
          juz_number: 10,
          hizb_number: 19,
          rub_el_hizb_number: 37,
          chapter_id: 9,
          verse_number: 1,
          verse_key: '9:1',
          words: [
            { position: 1, char_type_name: 'word', code_v2: 'ﭐ', v2_page: 187, line_number: 2, page_number: 187 },
          ],
        },
      ],
    };

    const { container } = render(
      <MushafPageRenderer
        pageNumber={187}
        pageData={mockPage187Data}
        fontFamily="QCF_P187"
        theme={defaultTheme}
      />
    );

    // Header banner for Surah 9 (التوبة) should be present
    const surahHeader = container.querySelector('[data-surah-header="9"]');
    expect(surahHeader).toBeInTheDocument();
    expect(surahHeader).toHaveTextContent(/التوبة/i);

    // Bismillah MUST NOT be rendered for Surah 9
    expect(container.querySelector('[data-bismillah-frame="true"]')).not.toBeInTheDocument();
  });

  it('renders multiple Surah headers and Bismillahs on multi-surah pages (Page 604)', () => {
    const mockPage604Data: QuranPageData = {
      page_number: 604,
      verses: [
        {
          page_number: 604,
          juz_number: 30,
          hizb_number: 60,
          rub_el_hizb_number: 240,
          chapter_id: 112,
          verse_number: 1,
          verse_key: '112:1',
          words: [
            { position: 1, char_type_name: 'word', code_v2: 'ﭪ', v2_page: 604, line_number: 3, page_number: 604 },
          ],
        },
        {
          page_number: 604,
          juz_number: 30,
          hizb_number: 60,
          rub_el_hizb_number: 240,
          chapter_id: 113,
          verse_number: 1,
          verse_key: '113:1',
          words: [
            { position: 1, char_type_name: 'word', code_v2: 'ﭫ', v2_page: 604, line_number: 8, page_number: 604 },
          ],
        },
        {
          page_number: 604,
          juz_number: 30,
          hizb_number: 60,
          rub_el_hizb_number: 240,
          chapter_id: 114,
          verse_number: 1,
          verse_key: '114:1',
          words: [
            { position: 1, char_type_name: 'word', code_v2: 'ﭬ', v2_page: 604, line_number: 13, page_number: 604 },
          ],
        },
      ],
    };

    const { container } = render(
      <MushafPageRenderer
        pageNumber={604}
        pageData={mockPage604Data}
        fontFamily="QCF_P604"
        theme={defaultTheme}
      />
    );

    // Verify headers for Surah 112, 113, 114
    expect(container.querySelector('[data-surah-header="112"]')).toBeInTheDocument();
    expect(container.querySelector('[data-surah-header="113"]')).toBeInTheDocument();
    expect(container.querySelector('[data-surah-header="114"]')).toBeInTheDocument();

    // Verify 3 Bismillahs are rendered on this page
    const bismillahFrames = container.querySelectorAll('[data-bismillah-frame="true"]');
    expect(bismillahFrames).toHaveLength(3);
  });

  it('fetches distinct page data for single-page reading when navigating pages', async () => {
    const fetchSpy = vi.spyOn(prefetchService, 'fetchMushafPageData').mockImplementation(async (pageNum) => ({
      page_number: pageNum,
      verses: [
        {
          page_number: pageNum,
          juz_number: 1,
          hizb_number: 1,
          rub_el_hizb_number: 1,
          chapter_id: 1,
          verse_number: 1,
          verse_key: `1:${pageNum}`,
          words: [
            { position: 1, char_type_name: 'word', code_v2: `code_${pageNum}`, v2_page: pageNum, line_number: 1, page_number: pageNum },
          ],
        },
      ],
    }));

    // Start on page 106
    let renderResult: ReturnType<typeof render>;
    await act(async () => {
      renderResult = render(
        <QuranPositionProvider initialPage={106}>
          <MushafReader />
        </QuranPositionProvider>
      );
    });

    expect(fetchSpy).toHaveBeenCalledWith(106, false);

    // Clean up
    fetchSpy.mockRestore();
  });
});
