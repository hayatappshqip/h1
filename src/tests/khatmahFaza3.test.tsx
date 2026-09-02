/**
 * KHATMAH V2 — Testet e Fazës 3 (K7, K8)
 *
 * Këto teste shkruhen PARA rregullimit. Ato dokumentojnë sjelljen e duhur
 * sipas handoff-it "HAYAT — KHATMAH V2", Definition of Done:
 *   "LS+IDB correct with conflict resolution and race-condition tests,
 *    no silent data loss"
 *
 *   K8 — një plan bosh/i vjetër në IndexedDB nuk duhet të fshijë planin real
 *        që ndodhet në localStorage.
 *   K7 — rihidratimi asinkron nuk duhet të mbishkruajë progresin që përdoruesi
 *        bëri ndërkohë (stale closure mbi `plan` fillestar).
 *
 * IndexedDB simulohet në memorie përmes vi.mock('../services/db'). Kjo NUK
 * shton dependencë të re: gabimi nuk është te Dexie, por te vendimi i
 * loadDurableKhatamPlan për ta kthyer IDB-në pa e krahasuar me localStorage,
 * dhe te useEffect-i që krahason me një `plan` të kapur në mbyllje.
 *
 * NUK ndryshohet asnjë test ekzistues. Ky është skedar i ri.
 */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';

// Depo e simuluar IndexedDB + një portë që vonon leximin (për garën K7).
const { idbStore, idbGate } = vi.hoisted(() => ({
  idbStore: {} as Record<string, unknown>,
  idbGate: {
    defer: false,
    resolvers: [] as Array<() => void>,
  },
}));

vi.mock('../services/db', () => ({
  getMeta: vi.fn((key: string) => {
    // Vlera kapet në çastin e KËRKESËS, jo të zgjidhjes — ashtu si një
    // transaksion real IndexedDB. Po të lexohej në fund, shkrimi i bërë
    // ndërkohë do ta mbishkruante dhe gara nuk do të dukej kurrë.
    const snapshot = key in idbStore ? idbStore[key] : null;
    if (!idbGate.defer) return Promise.resolve(snapshot);
    // Kur `defer` është i ndezur, përgjigja parkohet derisa testi ta lëshojë.
    // Kjo e bën garën deterministe, pa u varur nga kohëmatësit realë.
    return new Promise((resolve) => {
      idbGate.resolvers.push(() => resolve(snapshot));
    });
  }),
  saveMeta: vi.fn(async (key: string, value: unknown) => {
    idbStore[key] = value;
  }),
}));

import {
  createDefaultKhatamPlan,
  normalizeKhatamPlan,
  loadCachedKhatamPlan,
  loadDurableKhatamPlan,
  saveDurableKhatamPlan,
  confirmPageCompleted,
  resolveKhatamPlanConflict,
  LOCAL_STORAGE_ACTIVE_KHATAM_KEY,
  INDEXEDDB_ACTIVE_KHATAM_KEY,
} from '../services/quran/manualKhatmahService';
import { ManualKhatamPlan } from '../types';
import { KhatamTrackerView } from '../components/KhatamTrackerView';

/** Ndërton një plan me faqet e dhëna dhe një vulë kohore të caktuar. */
const planWith = (pages: number[], updatedAt: number, status: 'active' | 'paused' = 'active'): ManualKhatamPlan =>
  normalizeKhatamPlan({
    ...createDefaultKhatamPlan(),
    id: 'plan_test',
    completedPages: pages,
    status,
    updatedAt,
  });

/** Shkruan direkt në localStorage, duke anashkaluar rrugën e zakonshme. */
const seedLocalStorage = (plan: ManualKhatamPlan) => {
  localStorage.setItem(LOCAL_STORAGE_ACTIVE_KHATAM_KEY, JSON.stringify(plan));
};

/** Shkruan direkt në IndexedDB-në e simuluar. */
const seedIndexedDB = (plan: ManualKhatamPlan) => {
  idbStore[INDEXEDDB_ACTIVE_KHATAM_KEY] = plan;
};

const seq = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

/** Hap modalin "Përditëso progresin". */
const openUpdateModal = () => {
  const btn = document.getElementById('btn-perditso-progresin');
  if (!btn) throw new Error('Butoni btn-perditso-progresin nuk u gjet');
  fireEvent.click(btn);
};

/** Lëshon leximin IDB të parkuar dhe e lë React-in të riparaqitet. */
const releaseIndexedDB = async () => {
  await act(async () => {
    const resolve = idbGate.resolvers.shift();
    if (resolve) resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
};

/** Rivendos depot dhe fiket vonimin. */
const resetStores = () => {
  localStorage.clear();
  for (const k of Object.keys(idbStore)) delete idbStore[k];
  idbGate.resolvers.length = 0;
  idbGate.defer = false;
};

describe('K8 — localStorage nuk humbet kur IndexedDB ka plan më të vjetër', () => {
  beforeEach(resetStores);

  it('1. plan bosh në IDB + plan real në LS → ruhen faqet e LS-së', async () => {
    // Përdoruesi ka lexuar 20 faqe; LS është burimi i sinkronizuar.
    seedLocalStorage(planWith(seq(20), 2_000));
    // IDB ka mbetur bosh nga një shkrim i dështuar ose nga instalimi i parë.
    seedIndexedDB(planWith([], 1_000));

    const loaded = await loadDurableKhatamPlan();

    expect(loaded.completedPages).toEqual(seq(20));
    expect(loaded.completedPages.length).toBe(20);
  });

  it('2. IDB bosh + LS me progres → nuk kthehet plan zero', async () => {
    seedLocalStorage(planWith(seq(37), 5_000));
    seedIndexedDB(planWith([], 1_000));

    const loaded = await loadDurableKhatamPlan();

    expect(loaded.lastCompletedPage).toBe(37);
    expect(loaded.completedPages).toHaveLength(37);
  });

  it('3. LS bosh + IDB me progres → IDB fiton (rimëkëmbja funksionon)', async () => {
    // Rasti i kundërt: përdoruesi ka pastruar localStorage, IDB ka të dhënat.
    seedLocalStorage(planWith([], 1_000));
    seedIndexedDB(planWith(seq(15), 9_000));

    const loaded = await loadDurableKhatamPlan();

    expect(loaded.completedPages).toEqual(seq(15));
  });

  it('4. të dyja me progres, IDB më e re dhe më e plotë → IDB fiton', async () => {
    seedLocalStorage(planWith(seq(10), 1_000));
    seedIndexedDB(planWith(seq(25), 9_000));

    const loaded = await loadDurableKhatamPlan();

    expect(loaded.completedPages).toEqual(seq(25));
  });

  it('5. të dyja me progres, LS më e re dhe më e plotë → LS fiton', async () => {
    seedLocalStorage(planWith(seq(30), 9_000));
    seedIndexedDB(planWith(seq(10), 1_000));

    const loaded = await loadDurableKhatamPlan();

    expect(loaded.completedPages).toEqual(seq(30));
  });

  it('6. IDB mungon plotësisht → përdoret LS (sjellja ekzistuese ruhet)', async () => {
    seedLocalStorage(planWith(seq(7), 3_000));
    // asgjë në idbStore

    const loaded = await loadDurableKhatamPlan();

    expect(loaded.completedPages).toEqual(seq(7));
  });

  it('7. loadCachedKhatamPlan mbetet burimi i sinkronizuar i pandryshuar', () => {
    const plan = planWith(seq(12), 4_000);
    seedLocalStorage(plan);

    expect(loadCachedKhatamPlan().completedPages).toEqual(seq(12));
  });

  it('8. saveDurableKhatamPlan shkruan në të dyja depot njësoj', async () => {
    const plan = planWith(seq(5), 6_000);

    await saveDurableKhatamPlan(plan);

    expect(loadCachedKhatamPlan().completedPages).toEqual(seq(5));
    const stored = idbStore[INDEXEDDB_ACTIVE_KHATAM_KEY] as ManualKhatamPlan;
    expect(stored.completedPages).toEqual(seq(5));
  });

  it('9. leximi pas ruajtjes është idempotent (nuk humbet asgjë)', async () => {
    let plan = planWith([], 1_000);
    plan = confirmPageCompleted(plan, 4);
    await saveDurableKhatamPlan(plan);

    const loaded = await loadDurableKhatamPlan();

    expect(loaded.completedPages).toEqual([4]);
  });
});

describe('K7 — rihidratimi IDB nuk mbishkruan progresin e bërë ndërkohë', () => {
  beforeEach(() => {
    resetStores();
    // IDB përgjigjet vetëm kur testi e lëshon — si një lexim i ngadaltë në
    // një telefon real. Kjo hap dritaren e garës në mënyrë deterministe.
    idbGate.defer = true;
  });

  afterEach(() => {
    cleanup();
    idbGate.resolvers.length = 0;
    idbGate.defer = false;
  });

  it('10. faqja e konfirmuar gjatë pritjes së IDB-së mbetet e dukshme', async () => {
    // LS dhe IDB kanë të njëjtën vulë kohore — rasti normal, sepse
    // saveDurableKhatamPlan i shkruan të dyja në të njëjtën thirrje.
    const T = 1_000;
    seedLocalStorage(planWith([], T));
    seedIndexedDB(planWith([], T));

    render(<KhatamTrackerView />);

    // Përdoruesi vepron MENJËHERË, para se IDB të përgjigjet.
    openUpdateModal();
    fireEvent.click(await screen.findByText('Po, konfirmo Faqen 1'));

    // Në këtë pikë localStorage është i saktë.
    expect(loadCachedKhatamPlan().completedPages).toEqual([1]);

    // Tani efekti i rihidratimit përfundon.
    await releaseIndexedDB();

    // Progresi nuk duhet të jetë fshirë nga ekrani: faqja tjetër është 2.
    openUpdateModal();
    expect(screen.queryByText('Po, konfirmo Faqen 1')).toBeNull();
    expect(screen.getByText('Po, konfirmo Faqen 2')).toBeTruthy();
  });

  it('11. veprimi pas garës nuk e humbet faqen e parë në localStorage', async () => {
    const T = 1_000;
    seedLocalStorage(planWith([], T));
    seedIndexedDB(planWith([], T));

    render(<KhatamTrackerView />);

    openUpdateModal();
    fireEvent.click(await screen.findByText('Po, konfirmo Faqen 1'));
    await releaseIndexedDB();

    // Përdoruesi vazhdon normalisht dhe konfirmon faqen tjetër.
    openUpdateModal();
    fireEvent.click(screen.getByText('Po, konfirmo Faqen 2'));
    await releaseIndexedDB();

    // Të dyja faqet duhet të jenë ruajtur — jo vetëm e fundit.
    expect(loadCachedKhatamPlan().completedPages).toEqual([1, 2]);
  });

  it('12. plani i vjetër në IDB nuk e kthen mbrapsht një progres të ruajtur', async () => {
    // Përdoruesi ka 10 faqe në LS; IDB ka mbetur me 3 nga një shkrim i dështuar.
    seedLocalStorage(planWith(seq(10), 5_000));
    seedIndexedDB(planWith(seq(3), 5_000));

    render(<KhatamTrackerView />);
    await releaseIndexedDB();

    // Faqja tjetër duhet të jetë 11, jo 4.
    openUpdateModal();
    expect(screen.getByText('Po, konfirmo Faqen 11')).toBeTruthy();
  });
});

describe('K8 — rregulli i zgjidhjes së konfliktit (resolveKhatamPlanConflict)', () => {
  const mk = (id: string, pages: number[], updatedAt: number, createdAt = 100) =>
    normalizeKhatamPlan({
      ...createDefaultKhatamPlan(),
      id,
      completedPages: pages,
      status: 'active' as const,
      updatedAt,
      createdAt,
    });

  it('13. i njëjti plan, IDB me më shumë faqe → fiton IDB', () => {
    const result = resolveKhatamPlanConflict(mk('a', seq(5), 100), mk('a', seq(20), 100));
    expect(result.completedPages).toEqual(seq(20));
  });

  it('14. i njëjti plan, LS me më shumë faqe → fiton LS', () => {
    const result = resolveKhatamPlanConflict(mk('a', seq(20), 100), mk('a', seq(5), 100));
    expect(result.completedPages).toEqual(seq(20));
  });

  it('15. faqe të barabarta → fiton vula kohore më e re', () => {
    const older = mk('a', seq(10), 100);
    const newer = mk('a', seq(10), 999);
    expect(resolveKhatamPlanConflict(older, newer)).toBe(newer);
    expect(resolveKhatamPlanConflict(newer, older)).toBe(newer);
  });

  it('16. barazim i plotë → fiton localStorage (burimi i sinkronizuar)', () => {
    const cached = mk('a', seq(10), 500);
    const durable = mk('a', seq(10), 500);
    expect(resolveKhatamPlanConflict(cached, durable)).toBe(cached);
  });

  it('17. plane me id të ndryshme → fiton ai i krijuar më vonë, pavarësisht faqeve', () => {
    // Hatmja e vjetër e arkivuar ka më shumë faqe, por nuk është plani aktual.
    const archived = mk('e_vjeter', seq(600), 9_000, 100);
    const current = mk('e_re', seq(2), 1_000, 500);

    expect(resolveKhatamPlanConflict(archived, current)).toBe(current);
    expect(resolveKhatamPlanConflict(current, archived)).toBe(current);
  });

  it('18. nuk humbet asnjë faqe në asnjë drejtim', () => {
    const cached = mk('a', [1, 3, 5, 7, 9], 100);
    const durable = mk('a', [2, 4, 6], 200);

    const winner = resolveKhatamPlanConflict(cached, durable);

    expect(winner.completedPages.length).toBe(5);
  });
});
