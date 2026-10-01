/**
 * HIFZ — Kalimi i metodës së memorizimit: HifzModule → HifzLearnView
 *
 * Gjetja (e verifikuar me grep në baseline 38919e1):
 *   - HifzModule.tsx:12-16 përcakton metodat A/B/C (C "së shpejti")
 *   - HifzModule.tsx:27 default 'B'; zgjedhja ruhet te settings.preferredMethod
 *   - HifzModule.tsx:63 <HifzLearnView> renderohet PA prop-in "method"
 *   - HifzLearnView.tsx: 0 referenca për metodën (asnjë degëzim)
 *   - Kanal i vetëm ekzistues: side-channel-i settings.showWordByWord
 *     (HifzModule.tsx:51) — jo kontratë: nëse radha e settings mungon,
 *     chooseMethod nuk persiston asgjë dhe HifzLearnView lexon default-in.
 *
 * Këto teste DËSHTOJNË kundrejt baseline-it dhe duhet të kalojnë pas
 * rregullimit. Ata provojnë vetëm KALIMIN e eksplicitë të metodës —
 * sjelljen e skedarëve brenda HifzLearnView e teston faza e rregullimit.
 *
 * HifzLearnView zëvendësohet me një stub që kap prop-et (ashtu si
 * vi.mock i '../services/db' në khatmahFaza3.test.tsx).
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';

const captured: Array<Record<string, any>> = vi.hoisted(() => []);

vi.mock('../components/HifzLearnView', () => ({
  HifzLearnView: (props: Record<string, any>) => {
    captured.push(props);
    return React.createElement('div', { 'data-testid': 'hifz-learn-stub' });
  },
}));

vi.mock('../services/hifzDb', async () => {
  const actual = await vi.importActual<typeof import('../services/hifzDb')>('../services/hifzDb');
  const freshSettings = () => ({ ...actual.DEFAULT_HIFZ_SETTINGS });
  let settings: any = freshSettings();
  const records: any[] = [];
  return {
    ...actual,
    __resetHifzMock: () => { settings = freshSettings(); records.length = 0; },
    hifzDb: {
      settings: {
        get: async (id: number) => (id === settings.id ? { ...settings } : undefined),
        put: async (s: any) => {
          Object.assign(settings, s);
          return s.id;
        },
        add: async (s: any) => {
          Object.assign(settings, s);
          return s.id;
        },
      },
      ayahRecords: {
        get: async (key: string) => records.find(r => r.ayahKey === key),
        put: async (r: any) => {
          const i = records.findIndex(x => x.ayahKey === r.ayahKey);
          if (i >= 0) records[i] = r;
          else records.push(r);
          return r.ayahKey;
        },
        toArray: async () => [...records],
      },
      memorized: {
        toArray: async () => [],
        count: async () => 0,
        get: async () => undefined,
        put: async () => undefined,
        delete: async () => undefined,
      },
    },
  };
});

import { HifzModule } from '../components/HifzModule';
import * as hifzDbMock from '../services/hifzDb';

describe('Kalimi i metodës HifzModule → HifzLearnView', () => {
  beforeEach(() => {
    captured.length = 0;
    (hifzDbMock as any).__resetHifzMock?.();
  });

  afterEach(() => {
    cleanup();
  });

  it('me metodën A të zgjedhur, HifzLearnView merr method="A"', async () => {
    render(<HifzModule />);
    const startBtn = await screen.findByText('Filloj Mësimin');
    fireEvent.click(screen.getByText('Dëgjo & Përsërit'));
    fireEvent.click(startBtn);
    await screen.findByTestId('hifz-learn-stub');

    expect(captured.length).toBeGreaterThanOrEqual(1);
    const props = captured[captured.length - 1];
    expect(props.surahNumber).toBe(114);
    expect(props.ayahNumber).toBe(1);
    // KONTRATA: metoda e zgjedhur duhet të mbërrijë eksplicitë, jo përmes
    // side-channel-it showWordByWord (që humbet kur radha e settings mungon).
    expect(props.method).toBe('A');
  });

  it('me default-in (pa zgjedhje), HifzLearnView merr method="B"', async () => {
    render(<HifzModule />);
    const startBtn = await screen.findByText('Filloj Mësimin');
    fireEvent.click(startBtn);
    await screen.findByTestId('hifz-learn-stub');

    const props = captured[captured.length - 1];
    expect(props.method).toBe('B');
  });

  it('metoda e ruajtur te settings prekon ekrani i mësimit edhe pas "rihapjes"', async () => {
    // Seanca 1: zgjidh metodën A (persistohet te settings.preferredMethod)
    render(<HifzModule />);
    const startBtn = await screen.findByText('Filloj Mësimin');
    fireEvent.click(screen.getByText('Dëgjo & Përsërit'));
    fireEvent.click(startBtn);
    await screen.findByTestId('hifz-learn-stub');
    const firstProps = captured[captured.length - 1];
    expect(firstProps.method).toBe('A');
    cleanup();

    // Seanca 2: render i ri i HifzModule (si rihapja e app-it) —
    // loadData e kthen metodën nga settings.preferredMethod.
    // Prisim derisa karta A të shënohet si e zgjedhur (loadData përfundoi).
    render(<HifzModule />);
    const startBtn2 = await screen.findByText('Filloj Mësimin');
    await waitFor(() => {
      const aBtn = screen.getByText('Dëgjo & Përsërit').closest('button');
      expect(aBtn?.className).toContain('border-emerald-500');
    });
    fireEvent.click(startBtn2);
    await screen.findByTestId('hifz-learn-stub');
    const secondProps = captured[captured.length - 1];
    expect(secondProps.method).toBe('A');
  });
});
