// @vitest-environment jsdom
/**
 * HIFZ — FAZA A: Lidhja e Hifzit (H1, H2)
 *
 * H1: rezultati i mësimit RUHET. Para rregullimit, HifzModule e thërriste
 * HifzLearnView me onComplete={async () => setLearningAyah(null)} — argumentet
 * (result, stumblePoints) injoroheshin, processReviewResult() nuk thirrej kurrë
 * nga rrjedha e mësimit, tabela ayahRecords mbetej bosh dhe SM-2 ishte kod
 * i vdekur.
 *
 * H2: NJË regjistër, dy porta hyrjeje ("Hifzi Im" ↔ motori SM-2).
 *
 * QASJA E TESTIMIT (pa dependenci të reja, konventa e repos):
 * - Komponentët e rëndë (HifzLearnView) zëvendësohen me stub që kap prop-et,
 *   si te hifzMethodHandoff.test.tsx. onComplete thirret dorazi — njësoj si
 *   ta thërriste faza ASSESS e komponentit real.
 * - HifzSelfRecorder stub-ohet (prek Dexie-n e regjistrimeve + mikrofonin).
 * - getSurahData kthen të dhëna të konservuara (pa rrjet, pa IndexedDB).
 * - Tabelat Dexie (hifzDb) MBETEN ato reale si objekte, por metodat e I/O-së
 *   (get/put/delete/toArray/count/add) mbivendosen me prapavijë në memorie.
 *   Kështu kodi REAL (processReviewResult, setMemorized*, handler-at e
 *   komponentëve) ekzekutohet plotësisht — falsohet vetëm disku.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react';

// --- Stub-e (module mocks) ----------------------------------------------

// Kap prop-et e HifzLearnView; onComplete thirret manualisht në teste.
const capturedLearn: Array<Record<string, any>> = vi.hoisted(() => []);

vi.mock('../components/HifzLearnView', () => ({
  HifzLearnView: (props: Record<string, any>) => {
    capturedLearn.push(props);
    return React.createElement('div', { 'data-testid': 'hifz-learn-stub' });
  },
}));

// Shmang hifzRecordingsDb (Dexie) + navigator.mediaDevices në jsdom.
vi.mock('../components/HifzSelfRecorder', () => ({
  HifzSelfRecorder: () =>
    React.createElement('div', { 'data-testid': 'hifz-recorder-stub' }),
}));

// Të dhëna të konservuara të Kuranit — deterministe, pa rrjet.
vi.mock('../services/quranApi', async () => {
  const actual =
    await vi.importActual<typeof import('../services/quranApi')>('../services/quranApi');
  return {
    ...actual,
    getSurahData: async (surahNumber: number) => ({
      number: surahNumber,
      name: 'Test',
      transliteration: 'Test',
      ayahs: [
        { numberInSurah: 1, textAr: 'آية ١', textSq: 'Ajeti 1 (test)' },
        { numberInSurah: 2, textAr: 'آية ٢', textSq: 'Ajeti 2 (test)' },
      ],
    }),
  };
});

import { HifzModule } from '../components/HifzModule';
import { HifzReviewSession } from '../components/HifzReviewSession';
import {
  hifzDb,
  DEFAULT_HIFZ_SETTINGS,
  getAllMemorized,
} from '../services/hifzDb';

// --- Prapavija në memorie për tabelat Dexie -------------------------------

const memStore = new Map<string, any>();
const recStore = new Map<string, any>();
let sessStore: any[] = [];
let settingsRow: any = { ...DEFAULT_HIFZ_SETTINGS };

// Dexie kthen PromiseExtended, ndaj shmangim vi.spyOn().mockImplementation()
// (do të thyente tsc-në) — mbivendosim direkt metodën në instancë.
const origMetoda: Array<{ obj: any; emer: string }> = [];
function vendosStub(obj: any, emer: string, impl: (...args: any[]) => Promise<any>) {
  if (!origMetoda.some(m => m.obj === obj && m.emer === emer)) {
    origMetoda.push({ obj, emer });
  }
  obj[emer] = impl;
}
function hiqStubet() {
  // Fshin pronësinë vetjake → zbulohet prap metoda e prototipit.
  for (const { obj, emer } of origMetoda) delete obj[emer];
  origMetoda.length = 0;
}

beforeEach(() => {
  memStore.clear();
  recStore.clear();
  sessStore = [];
  settingsRow = { ...DEFAULT_HIFZ_SETTINGS };
  capturedLearn.length = 0;

  // Vetëm I/O-ja falsohet; gjithë logjika (scheduler, helpers, handler-a) është reale.
  vendosStub(hifzDb.memorized, 'put', async (v: any) => {
    memStore.set(v.ayahKey, v);
    return v.ayahKey;
  });
  vendosStub(hifzDb.memorized, 'get', async (k: any) => memStore.get(k));
  vendosStub(hifzDb.memorized, 'delete', async (k: any) => {
    memStore.delete(k);
  });
  vendosStub(hifzDb.memorized, 'toArray', async () => Array.from(memStore.values()));
  vendosStub(hifzDb.memorized, 'count', async () => memStore.size);

  vendosStub(hifzDb.ayahRecords, 'put', async (v: any) => {
    recStore.set(v.ayahKey, v);
    return v.ayahKey;
  });
  vendosStub(hifzDb.ayahRecords, 'get', async (k: any) => recStore.get(k));
  vendosStub(hifzDb.ayahRecords, 'delete', async (k: any) => {
    recStore.delete(k);
  });
  vendosStub(hifzDb.ayahRecords, 'toArray', async () => Array.from(recStore.values()));

  vendosStub(hifzDb.sessions, 'add', async (v: any) => {
    const id = v.id ?? `ses-${sessStore.length}`;
    sessStore.push({ ...v, id });
    return id;
  });
  vendosStub(hifzDb.sessions, 'toArray', async () => [...sessStore]);

  vendosStub(hifzDb.settings, 'get', async (id: any) =>
    id === 1 ? { ...settingsRow } : undefined,
  );
  vendosStub(hifzDb.settings, 'put', async (s: any) => {
    settingsRow = { ...s };
    return s.id;
  });
});

afterEach(() => {
  cleanup();
  hiqStubet();
});

// --- Ndihmëse ------------------------------------------------------------

/** Hap rrjedhën e mësimit te HifzModule dhe kthen prop-et e kapura të LearnView. */
async function hapMesimin() {
  render(<HifzModule />);
  const startBtn = await screen.findByText('Filloj Mësimin');
  fireEvent.click(startBtn);
  await screen.findByTestId('hifz-learn-stub');
  return capturedLearn[capturedLearn.length - 1];
}

const DAY = 24 * 60 * 60 * 1000;

// =====================================================================
// FA1.1 — H1: rezultati i mësimit RUHET
// =====================================================================
describe('FA1.1 (H1): përfundimi i mësimit ruan progresin', () => {
  it('mësimi me result KNEW shkruan ayahRecords, memorized dhe sessions', async () => {
    expect(await getAllMemorized()).toHaveLength(0);

    const props = await hapMesimin();
    await act(async () => {
      await props.onComplete('KNEW', [2]);
    });

    // 1) Motori SM-2 u thirr: rekordi ekziston me status LEARNING.
    const rec = recStore.get('114:1');
    expect(rec).toBeDefined();
    expect(rec.status).toBe('LEARNING');
    expect(rec.stumblePoints).toEqual([2]);

    // 2) Regjistri "Hifzi Im" u rrit 0 → 1.
    expect(memStore.get('114:1')).toBeDefined();
    expect(await getAllMemorized()).toHaveLength(1);

    // 3) Sesioni LEARN u shkrua me formën e plotë.
    expect(sessStore).toHaveLength(1);
    const ses = sessStore[0];
    expect(ses.type).toBe('LEARN');
    expect(ses.ayahsCovered).toEqual(['114:1']);
    expect(ses.results).toEqual([{ ayahKey: '114:1', result: 'KNEW' }]);
    expect(ses.endedAt).toBeGreaterThanOrEqual(ses.startedAt);
    expect(ses.durationSeconds).toBeGreaterThanOrEqual(0);

    // 4) Pamja kthehet te lista (mësimi u mbyll).
    await screen.findByText('Filloj Mësimin');
  });

  it('FORGOT e kthen ajetin te LEARNING me dueDate brenda 24h', async () => {
    const props = await hapMesimin();
    const before = Date.now();
    await act(async () => {
      await props.onComplete('FORGOT', []);
    });

    // Verifikon SM-2 PËRMES thirrjes reale (pa e riprodhuar algoritmin):
    // FORGOT i ri → LEARNING, interval 1 ditë, lapses 1.
    const rec = recStore.get('114:1');
    expect(rec.status).toBe('LEARNING');
    expect(rec.intervalDays).toBe(1);
    expect(rec.lapses).toBe(1);
    expect(rec.dueDate).toBeGreaterThanOrEqual(before);
    expect(rec.dueDate).toBeLessThanOrEqual(before + DAY + 5000);
  });

  it('butoni "Rishiko (N)" shfaqet kur rekordi kalon dueDate', async () => {
    // Rekord i maturuar (due dje) — radha e rishikimit nuk është më bosh.
    recStore.set('114:1', {
      ayahKey: '114:1',
      status: 'LEARNING',
      strength: 4,
      easeFactor: 2.3,
      intervalDays: 1,
      dueDate: Date.now() - DAY,
      repetitions: 0,
      lapses: 1,
      totalListens: 0,
      stumblePoints: [],
      createdAt: Date.now() - 2 * DAY,
    });

    render(<HifzModule />);
    await screen.findByText('Rishiko (1)');
  });

  it('përfundimi i sesionit të rishikimit shkruan NJË SessionRecord REVIEW', async () => {
    const queue = [
      {
        ayahKey: '114:1',
        status: 'LEARNING',
        strength: 4,
        easeFactor: 2.3,
        intervalDays: 1,
        dueDate: Date.now() - DAY,
        repetitions: 0,
        lapses: 1,
        totalListens: 0,
        stumblePoints: [],
        createdAt: Date.now() - 2 * DAY,
      },
      {
        ayahKey: '114:2',
        status: 'LEARNING',
        strength: 4,
        easeFactor: 2.3,
        intervalDays: 1,
        dueDate: Date.now() - DAY,
        repetitions: 0,
        lapses: 1,
        totalListens: 0,
        stumblePoints: [],
        createdAt: Date.now() - 2 * DAY,
      },
    ];
    const onComplete = vi.fn();
    render(<HifzReviewSession queue={queue as any} onClose={() => {}} onComplete={onComplete} />);

    // Ajeti 1: zbulo → "I Knew It".
    fireEvent.click(await screen.findByText('Tap to reveal Ayah'));
    fireEvent.click(await screen.findByText('I Knew It'));

    // Ajeti 2: zbulo → "I Struggled".
    fireEvent.click(await screen.findByText('Tap to reveal Ayah'));
    fireEvent.click(await screen.findByText('I Struggled'));

    // Sesioni u mbyll dhe u shkrua NJË shënim i vetëm REVIEW me të dy rezultatet.
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(sessStore).toHaveLength(1);
    const ses = sessStore[0];
    expect(ses.type).toBe('REVIEW');
    expect(ses.ayahsCovered).toEqual(['114:1', '114:2']);
    expect(ses.results).toEqual([
      { ayahKey: '114:1', result: 'KNEW' },
      { ayahKey: '114:2', result: 'STRUGGLED' },
    ]);
    expect(ses.endedAt).toBeGreaterThanOrEqual(ses.startedAt);

    // Çdo ajet u përpunua edhe nga SM-2 (sjellja ekzistuese u ruajt).
    expect(recStore.get('114:1').repetitions).toBe(1);
    expect(recStore.get('114:2').repetitions).toBe(0);
  });
});
