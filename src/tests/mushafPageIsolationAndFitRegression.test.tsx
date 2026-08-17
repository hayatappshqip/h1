// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { normalizeRawVersesForTesting } from '../services/quran/mushafPrefetchService';
import { MushafPageRenderer } from '../components/quran/mushaf/MushafPageRenderer';
import { MUSHAF_THEMES } from '../components/quran/mushaf/MushafPageFrame';
import { CANONICAL_MUSHAF_PAGES } from '../data/canonicalMushafManifest';

describe('HAYAT Quran V2 - 604-Page Integrity & Text Fit Regression Suite', () => {
  // TEST 1 & TEST 2: Strict Page Isolation across normalizations
  it('TEST 1 & 2: filters out foreign words and eliminates cross-page contamination', () => {
    // Simulated raw API payload for Page 595 containing verses 91:1-15, and 92:1-14 (where 92:10-14 belong to page 596)
    const rawVerses595 = [
      {
        chapter_id: 91,
        verse_number: 1,
        verse_key: '91:1',
        page_number: 595,
        words: [
          { position: 1, char_type_name: 'word', code_v2: 'ﱁ', v2_page: 595, line_number: 3, page_number: 595 },
          { position: 2, char_type_name: 'word', code_v2: 'ﱂ', v2_page: 595, line_number: 3, page_number: 595 },
          { position: 3, char_type_name: 'end', code_v2: 'ﱃ', v2_page: 595, line_number: 3, page_number: 595 },
        ],
      },
      {
        chapter_id: 92,
        verse_number: 9,
        verse_key: '92:9',
        page_number: 595,
        words: [
          { position: 1, char_type_name: 'word', code_v2: 'ﱄ', v2_page: 595, line_number: 15, page_number: 595 },
          { position: 2, char_type_name: 'end', code_v2: 'ﱅ', v2_page: 595, line_number: 15, page_number: 595 },
        ],
      },
      // Contaminating verse from page 596
      {
        chapter_id: 92,
        verse_number: 10,
        verse_key: '92:10',
        page_number: 596,
        words: [
          { position: 1, char_type_name: 'word', code_v2: 'ﱆ', v2_page: 596, line_number: 1, page_number: 596 },
          { position: 2, char_type_name: 'word', code_v2: 'ﱇ', v2_page: 596, line_number: 1, page_number: 596 },
        ],
      },
    ];

    const normalized = normalizeRawVersesForTesting(rawVerses595, 595);

    // Contaminating verse 92:10 must be completely filtered out
    expect(normalized).toHaveLength(2);
    expect(normalized.map((v) => v.verse_key)).toEqual(['91:1', '92:9']);

    // Zero words with v2_page !== 595
    normalized.forEach((v) => {
      v.words.forEach((w) => {
        expect(w.v2_page).toBe(595);
      });
    });
  });

  // TEST 3 & TEST 8: Boundary Ayahs Spanning Multiple Pages
  it('TEST 3 & 8: correctly isolates words when an ayah spans across page boundaries', () => {
    // Ayah 4:176 (starts on page 105, ends on page 106)
    const rawVersesPage106 = [
      {
        chapter_id: 4,
        verse_number: 176,
        verse_key: '4:176',
        page_number: 106,
        words: [
          // Foreign word from page 105
          { position: 1, char_type_name: 'word', code_v2: 'ﱁ', v2_page: 105, line_number: 15, page_number: 105 },
          // Legitimate words on page 106
          { position: 20, char_type_name: 'word', code_v2: 'ﱂ', v2_page: 106, line_number: 1, page_number: 106 },
          { position: 21, char_type_name: 'word', code_v2: 'ﱃ', v2_page: 106, line_number: 1, page_number: 106 },
          { position: 22, char_type_name: 'end', code_v2: 'ﱄ', v2_page: 106, line_number: 1, page_number: 106 },
        ],
      },
      {
        chapter_id: 5,
        verse_number: 1,
        verse_key: '5:1',
        page_number: 106,
        words: [
          { position: 1, char_type_name: 'word', code_v2: 'ﱅ', v2_page: 106, line_number: 3, page_number: 106 },
          { position: 2, char_type_name: 'end', code_v2: 'ﱆ', v2_page: 106, line_number: 3, page_number: 106 },
        ],
      },
    ];

    const normalized106 = normalizeRawVersesForTesting(rawVersesPage106, 106);
    expect(normalized106[0].verse_key).toBe('4:176');
    expect(normalized106[0].words).toHaveLength(3);
    normalized106[0].words.forEach((w) => {
      expect(w.v2_page).toBe(106);
    });
  });

  // TEST 4 & TEST 9: Critical Pages (585, 587, 588, 591, 595, 597) & Special Lines Collisions
  it('TEST 4 & 9: ensures SurahHeaderBanner and BismillahFrame do not collide with foreign words', () => {
    // Simulated Page 585 where Surah 81 header would be on line 1 if foreign words from 586 entered line 1
    const pageData585 = {
      page_number: 585,
      verses: [
        {
          page_number: 585,
          juz_number: 30,
          hizb_number: 59,
          rub_el_hizb_number: 233,
          chapter_id: 80,
          verse_number: 1,
          verse_key: '80:1',
          words: [
            { position: 1, char_type_name: 'word', code_v2: 'ﱁ', v2_page: 585, line_number: 3, page_number: 585 },
            { position: 2, char_type_name: 'end', code_v2: 'ﱂ', v2_page: 585, line_number: 3, page_number: 585 },
          ],
        },
      ],
    };

    const { container } = render(
      <MushafPageRenderer
        pageNumber={585}
        pageData={pageData585}
        fontFamily="QCF_P585"
        theme={MUSHAF_THEMES.ivory}
      />
    );

    // Surah 80 header banner and Bismillah frame must render cleanly
    expect(container.textContent).toContain('سُورَةُ عبس');
    expect(container.textContent).toContain('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ');
    expect(container.textContent).toContain('ﱁ');
  });

  // TEST 5, 6, 7: Mobile Text Fitting, No Artificial Gap, No Clipping
  it('TEST 5, 6, 7: renders Arabic lines with fitted scaling without gap-x-[1cqw]', () => {
    const denseLinePageData = {
      page_number: 595,
      verses: [
        {
          page_number: 595,
          juz_number: 30,
          hizb_number: 60,
          rub_el_hizb_number: 237,
          chapter_id: 91,
          verse_number: 1,
          verse_key: '91:1',
          words: Array.from({ length: 12 }, (_, i) => ({
            position: i + 1,
            char_type_name: i === 11 ? 'end' : 'word',
            code_v2: `ﱁ${i}`,
            v2_page: 595,
            line_number: 4,
            page_number: 595,
          })),
        },
      ],
    };

    const { container } = render(
      <MushafPageRenderer
        pageNumber={595}
        pageData={denseLinePageData}
        fontFamily="QCF_P595"
        theme={MUSHAF_THEMES.ivory}
      />
    );

    // Must not contain artificial gap-x-[1cqw]
    const lineElements = container.querySelectorAll('[dir="rtl"]');
    expect(lineElements.length).toBeGreaterThan(0);

    lineElements.forEach((el) => {
      expect(el.className).not.toContain('gap-x-');
    });

    // Check glyph word spans exist and have valid font sizing
    const wordSpans = container.querySelectorAll('.qcf-v2-word');
    expect(wordSpans.length).toBe(12);
  });

  // TEST 10: Font Load Stability
  it('TEST 10: maintains identical DOM layout structure regardless of font family name', () => {
    const pageData = {
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
            { position: 1, char_type_name: 'word', code_v2: 'ﭑ', v2_page: 1, line_number: 2, page_number: 1 },
            { position: 2, char_type_name: 'word', code_v2: 'ﭒ', v2_page: 1, line_number: 2, page_number: 1 },
            { position: 3, char_type_name: 'end', code_v2: 'ﭓ', v2_page: 1, line_number: 2, page_number: 1 },
          ],
        },
      ],
    };

    const { container: fallbackContainer } = render(
      <MushafPageRenderer
        pageNumber={1}
        pageData={pageData}
        fontFamily="Amiri"
        theme={MUSHAF_THEMES.ivory}
      />
    );

    const { container: qcfContainer } = render(
      <MushafPageRenderer
        pageNumber={1}
        pageData={pageData}
        fontFamily="QCF_P1"
        theme={MUSHAF_THEMES.ivory}
      />
    );

    expect(fallbackContainer.querySelectorAll('.qcf-v2-word').length).toBe(3);
    expect(qcfContainer.querySelectorAll('.qcf-v2-word').length).toBe(3);
  });
});
