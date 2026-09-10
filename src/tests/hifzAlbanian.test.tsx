// @vitest-environment jsdom
/**
 * HIFZ — FAZA A, FA1.4 (H5): moduli Hifz tërësisht në shqip.
 *
 * Komponentët REALË HifzLearnView / HifzReviewSession renderohen dhe
 * pohohet që stringjet e UI-së janë shqip (identifikuesit mbesin anglisht).
 * - HifzSelfRecorder stub-ohet (Dexie + mikrofon, si te testet e tjera).
 * - getSurahData + fetch (fjalë-pas-fjale) kthejnë të dhëna të konservuara.
 * - Audioja e shfletuesit stub-ohet (jsdom nuk luan media).
 */
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

vi.mock('../components/HifzSelfRecorder', () => ({
  HifzSelfRecorder: () =>
    React.createElement('div', { 'data-testid': 'hifz-recorder-stub' }),
}));

vi.mock('../services/quranApi', async () => {
  const actual =
    await vi.importActual<typeof import('../services/quranApi')>('../services/quranApi');
  return {
    ...actual,
    getSurahData: async (surahNumber: number) => ({
      number: surahNumber,
      name: 'Test',
      transliteration: 'An-Nas',
      ayahs: [
        { numberInSurah: 1, textAr: 'آية ١', textSq: 'Ajeti 1 (test)' },
        { numberInSurah: 2, textAr: 'آية ٢', textSq: 'Ajeti 2 (test)' },
        { numberInSurah: 3, textAr: 'آية ٣', textSq: 'Ajeti 3 (test)' },
      ],
    }),
  };
});

import { HifzLearnView } from '../components/HifzLearnView';
import { HifzReviewSession } from '../components/HifzReviewSession';
import { hifzDb, DEFAULT_HIFZ_SETTINGS } from '../services/hifzDb';

const origFetch = globalThis.fetch;
const origPlay = window.HTMLMediaElement.prototype.play;
const origPause = window.HTMLMediaElement.prototype.pause;

beforeEach(() => {
  // Fjalori fjalë-pas-fjale (API e jashtme në prodhim) — i konservuar.
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: async () => ({
        verse: {
          words: [
            {
              char_type_name: 'word',
              id: 1,
              position: 1,
              text_uthmani: 'قُلْ',
              translation: { text: 'Thuaj' },
              transliteration: { text: 'Qul' },
              audio_url: null,
            },
            {
              char_type_name: 'word',
              id: 2,
              position: 2,
              text_uthmani: 'أَعُوذُ',
              translation: { text: 'kërkoj mbrojtje' },
              transliteration: { text: "a'ūdhu" },
              audio_url: null,
            },
          ],
        },
      }),
    }),
  );
  // jsdom nuk luan audio — stub pa zhurmë.
  window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined) as any;
  window.HTMLMediaElement.prototype.pause = vi.fn() as any;
  // Cilësimet: pohim direkt (pa IndexedDB të vërtetë në jsdom).
  (hifzDb.settings as any).get = async (id: number) =>
    id === 1 ? { ...DEFAULT_HIFZ_SETTINGS } : undefined;
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  globalThis.fetch = origFetch;
  window.HTMLMediaElement.prototype.play = origPlay;
  window.HTMLMediaElement.prototype.pause = origPause;
  delete (hifzDb.settings as any).get;
});

// =====================================================================
describe('FA1.4 (H5): moduli Hifz në shqip', () => {
  it('faza ASSESS e HifzLearnView shfaq "E dija" (jo "I Knew It")', async () => {
    const onComplete = vi.fn();
    render(
      <HifzLearnView
        surahNumber={114}
        ayahNumber={1}
        method="A"
        onComplete={onComplete}
        onClose={() => {}}
      />,
    );

    // Kreu + faza LISTEN në shqip.
    await screen.findByText('Moduli Hifz');
    await screen.findByText('Dëgjo me kujdes');
    expect(screen.queryByText('Listen Carefully')).toBeNull();

    // Ecën nëpër faza (metoda A e kapërcen UNDERSTAND).
    fireEvent.click(screen.getByText('Faza tjetër')); // → READ_ALONG
    await screen.findByText('Lexo së bashku me audion');
    fireEvent.click(screen.getByText('Faza tjetër')); // → RECITE_VISIBLE
    await screen.findByText('Recito me zë (teksti i dukshëm)');
    fireEvent.click(screen.getByText('Faza tjetër')); // → RECITE_HIDDEN
    await screen.findByText('Recito nga memorja');
    fireEvent.click(screen.getByText('Faza tjetër')); // → CONNECT
    await screen.findByText('Lidhje me të mëparshmen');
    fireEvent.click(screen.getByText('Gati për vlerësim')); // → ASSESS

    // Vlerësimi përfundimtar — tërësisht shqip.
    await screen.findByText('Sa e di mirë?');
    expect(screen.getByText('E dija')).toBeDefined();
    expect(screen.getByText('Kam pasur vështirësi')).toBeDefined();
    expect(screen.getByText('E harrova')).toBeDefined();
    expect(screen.queryByText('I Knew It')).toBeNull();
    expect(screen.queryByText('I Struggled')).toBeNull();
    expect(screen.queryByText('I Forgot')).toBeNull();

    // Klikimi ruan kontratën (result, stumblePoints).
    fireEvent.click(screen.getByText('E dija'));
    expect(onComplete).toHaveBeenCalledWith('KNEW', expect.any(Array));
  });

  it('HifzReviewSession është tërësisht shqip', async () => {
    const queue = [
      {
        ayahKey: '114:1',
        status: 'LEARNING',
        strength: 4,
        easeFactor: 2.3,
        intervalDays: 1,
        dueDate: Date.now() - 1000,
        repetitions: 0,
        lapses: 1,
        totalListens: 0,
        stumblePoints: [],
        createdAt: Date.now() - 1000,
      },
    ];
    render(<HifzReviewSession queue={queue as any} onClose={() => {}} onComplete={() => {}} />);

    await screen.findByText('Sesion Rishikimi');
    expect(screen.queryByText('Review Session')).toBeNull();
    fireEvent.click(screen.getByText('Preke për ta zbuluar ajetin'));

    await screen.findByText('Si të shkoi?');
    expect(screen.getByText('E dija')).toBeDefined();
    expect(screen.getByText('Kam pasur vështirësi')).toBeDefined();
    expect(screen.getByText('E harrova')).toBeDefined();
    expect(screen.getByText('< 1 ditë')).toBeDefined();
    expect(screen.getByText('Vështirë')).toBeDefined();
    expect(screen.getByText('Mirë')).toBeDefined();
    expect(screen.queryByText('Tap to reveal Ayah')).toBeNull();
    expect(screen.queryByText('How did you do?')).toBeNull();
  });
});
