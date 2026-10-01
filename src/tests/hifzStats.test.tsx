// @vitest-environment jsdom
/**
 * HIFZ — FAZA A, FA1.3 (S6): statistikat e Hifzit.
 *
 * Karta "Statistikat e Hifzit" te HifzModule (nën zgjedhjen e metodës):
 * - totali i memorizuar (memorized.count),
 * - grupimi sipas statusit (NEW / LEARNING / REVIEWING / CONSOLIDATED),
 * - "Për rishikim sot" (dueDate <= tani),
 * - mini-grafik 7-ditor i sesioneve (bare Tailwind, pa recharts në teste),
 * - gjendja e ngarkimit + gjendja bosh.
 *
 * Ton neutral, pa gamification agresive (pa flakë, pa "streak").
 * Tabelat falsohen në memorie si te hifzWiring.test.tsx; logjika është reale.
 */
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';

import { HifzModule } from '../components/HifzModule';
import { hifzDb, DEFAULT_HIFZ_SETTINGS } from '../services/hifzDb';

const DAY = 24 * 60 * 60 * 1000;

// --- Prapavija në memorie (e pavarur nga skedarët e tjerë të testit) ------
const memStore = new Map<string, any>();
const recStore = new Map<string, any>();
let sessStore: any[] = [];
let settingsRow: any = { ...DEFAULT_HIFZ_SETTINGS };

const origMetoda: Array<{ obj: any; emer: string }> = [];
function vendosStub(obj: any, emer: string, impl: (...args: any[]) => Promise<any>) {
  if (!origMetoda.some(m => m.obj === obj && m.emer === emer)) {
    origMetoda.push({ obj, emer });
  }
  obj[emer] = impl;
}
function hiqStubet() {
  for (const { obj, emer } of origMetoda) delete obj[emer];
  origMetoda.length = 0;
}

function vendosStubetBaze() {
  vendosStub(hifzDb.memorized, 'put', async (v: any) => {
    memStore.set(v.ayahKey, v);
    return v.ayahKey;
  });
  vendosStub(hifzDb.memorized, 'get', async (k: any) => memStore.get(k));
  vendosStub(hifzDb.memorized, 'toArray', async () => Array.from(memStore.values()));
  vendosStub(hifzDb.memorized, 'count', async () => memStore.size);
  vendosStub(hifzDb.ayahRecords, 'toArray', async () => Array.from(recStore.values()));
  vendosStub(hifzDb.sessions, 'toArray', async () => [...sessStore]);
  vendosStub(hifzDb.settings, 'get', async (id: any) =>
    id === 1 ? { ...settingsRow } : undefined,
  );
  vendosStub(hifzDb.settings, 'put', async (s: any) => {
    settingsRow = { ...s };
    return s.id;
  });
}

beforeEach(() => {
  memStore.clear();
  recStore.clear();
  sessStore = [];
  settingsRow = { ...DEFAULT_HIFZ_SETTINGS };
  vendosStubetBaze();
});

afterEach(() => {
  cleanup();
  hiqStubet();
});

// --- Ndihmëse ------------------------------------------------------------

function mbjellMemorized(surah: number, ayah: number) {
  const key = `${surah}:${ayah}`;
  memStore.set(key, { ayahKey: key, surah, ayah, memorizedAt: Date.now() });
}

function mbjellRekord(over: Record<string, any>) {
  const key = over.ayahKey as string;
  recStore.set(key, {
    status: 'LEARNING',
    strength: 0,
    easeFactor: 2.5,
    intervalDays: 1,
    dueDate: Date.now() + DAY,
    repetitions: 0,
    lapses: 0,
    totalListens: 0,
    stumblePoints: [],
    createdAt: Date.now(),
    ...over,
  });
}

function mbjellSesion(filluarParaMs: number, type: 'LEARN' | 'REVIEW' = 'LEARN') {
  const startedAt = Date.now() - filluarParaMs;
  sessStore.push({
    id: `ses-${sessStore.length}`,
    startedAt,
    endedAt: startedAt + 60_000,
    type,
    ayahsCovered: ['114:1'],
    results: [{ ayahKey: '114:1', result: 'KNEW' }],
    durationSeconds: 60,
  });
}

// =====================================================================
describe('FA1.3 (S6): karta "Statistikat e Hifzit"', () => {
  it('gjendja bosh: zero kudo dhe teksti i gjendjes bosh', async () => {
    render(<HifzModule />);

    await screen.findByText('Statistikat e Hifzit');
    expect(screen.getByTestId('hifzstat-total')).toHaveTextContent('0');
    expect(screen.getByTestId('hifzstat-due')).toHaveTextContent('0');
    expect(screen.getByTestId('hifzstat-status-NEW')).toHaveTextContent('0');
    expect(screen.getByTestId('hifzstat-status-LEARNING')).toHaveTextContent('0');
    expect(screen.getByTestId('hifzstat-status-REVIEWING')).toHaveTextContent('0');
    expect(screen.getByTestId('hifzstat-status-CONSOLIDATED')).toHaveTextContent('0');
    expect(screen.getByTestId('hifzstat-week')).toHaveTextContent('0');
    // Gjendja bosh (Definition of Done).
    await screen.findByText('Nuk ka sesione ende — mëso ajetin e parë.');
  });

  it('2 rekord memorized (njëri due): numrat në ekran përputhen me tabelat', async () => {
    mbjellMemorized(114, 1);
    mbjellMemorized(114, 2);
    mbjellRekord({ ayahKey: '114:1', status: 'NEW', dueDate: Date.now() - 1000 });
    mbjellRekord({ ayahKey: '114:2', status: 'LEARNING', dueDate: Date.now() + DAY });

    render(<HifzModule />);

    await screen.findByText('Statistikat e Hifzit');
    expect(screen.getByTestId('hifzstat-total')).toHaveTextContent('2');
    expect(screen.getByText('Për rishikim sot')).toBeDefined();
    expect(screen.getByTestId('hifzstat-due')).toHaveTextContent('1');
    expect(screen.getByTestId('hifzstat-status-NEW')).toHaveTextContent('1');
    expect(screen.getByTestId('hifzstat-status-LEARNING')).toHaveTextContent('1');
    expect(screen.getByTestId('hifzstat-status-REVIEWING')).toHaveTextContent('0');
    expect(screen.getByTestId('hifzstat-status-CONSOLIDATED')).toHaveTextContent('0');
  });

  it('5 ajete me statuse të përzier + sesione: statistika dhe mini-grafik javor', async () => {
    for (const a of [1, 2, 3, 4, 5]) mbjellMemorized(114, a);
    mbjellRekord({ ayahKey: '114:1', status: 'NEW', dueDate: Date.now() - 1000 });
    mbjellRekord({ ayahKey: '114:2', status: 'LEARNING', dueDate: Date.now() - 1000 });
    mbjellRekord({ ayahKey: '114:3', status: 'REVIEWING', dueDate: Date.now() + DAY });
    mbjellRekord({ ayahKey: '114:4', status: 'REVIEWING', dueDate: Date.now() + 2 * DAY });
    mbjellRekord({ ayahKey: '114:5', status: 'CONSOLIDATED', dueDate: Date.now() + 30 * DAY });

    mbjellSesion(60_000); // sot
    mbjellSesion(120_000, 'REVIEW'); // sot
    mbjellSesion(3 * DAY); // para 3 ditësh
    mbjellSesion(8 * DAY); // jashtë dritares 7-ditore — nuk numërohet

    render(<HifzModule />);

    await screen.findByText('Statistikat e Hifzit');
    expect(screen.getByTestId('hifzstat-total')).toHaveTextContent('5');
    expect(screen.getByTestId('hifzstat-due')).toHaveTextContent('2');
    expect(screen.getByTestId('hifzstat-status-NEW')).toHaveTextContent('1');
    expect(screen.getByTestId('hifzstat-status-LEARNING')).toHaveTextContent('1');
    expect(screen.getByTestId('hifzstat-status-REVIEWING')).toHaveTextContent('2');
    expect(screen.getByTestId('hifzstat-status-CONSOLIDATED')).toHaveTextContent('1');

    // Mini-grafiku javor: 7 shtylla, gjithsej 3 sesione (sesioni i ditës 8 përjashtohet).
    expect(screen.getByText('Sesione këtë javë')).toBeDefined();
    expect(screen.getByTestId('hifzstat-week')).toHaveTextContent('3');
    const bars = screen.getAllByTestId('hifzstat-bar');
    expect(bars).toHaveLength(7);
    const counts = bars.map(b => Number(b.getAttribute('data-count')));
    expect(counts[6]).toBe(2); // sot (shtylla e fundit)
    expect(counts[3]).toBe(1); // para 3 ditësh
    expect(counts.reduce((a, b) => a + b, 0)).toBe(3);
  });

  it('ngarkimi: shfaqet teksti i ngarkimit derisa të vijnë të dhënat', async () => {
    // Premtim që nuk zgjidhet kurrë — loadData mbetet pezull.
    vendosStub(hifzDb.settings, 'get', () => new Promise<any>(() => {}));

    render(<HifzModule />);

    await screen.findByText('Statistikat e Hifzit');
    await screen.findByText('Duke ngarkuar statistikat…');
  });
});
