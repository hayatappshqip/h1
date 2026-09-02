/**
 * KHATMAH V2 — Testet e Fazës 2 (K2, K3)
 *
 * Këto teste shkruhen PARA rregullimit.
 *
 * Vendimet e marra NGA PËRDORUESI (jo nga agjenti):
 *
 *   K2 — kur të 604 faqet janë të përfunduara, `nextPage` bëhet 0, sepse nuk
 *        ka faqe tjetër. UI tregon përfundimin në vend të "Vazhdo hatmen
 *        (Faqja 604)" dhe në vend të një butoni të çaktuar.
 *
 *   K3 — OPSIONI C: logjika e `nextPage` NUK ndryshon (mbetet
 *        lastCompletedPage + 1), por shtohet një pasqyrë e faqeve të mbetura
 *        që i bën të dukshme boshllëqet dhe lejon kërcim te to.
 *        Ky opsion u zgjodh pikërisht sepse nuk thyen asnjë test ekzistues.
 *
 * NUK ndryshohet asnjë test ekzistues. Ky është skedar i ri.
 */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

const { idbStore } = vi.hoisted(() => ({ idbStore: {} as Record<string, unknown> }));

vi.mock('../services/db', () => ({
  getMeta: vi.fn(async (key: string) => (key in idbStore ? idbStore[key] : null)),
  saveMeta: vi.fn(async (key: string, value: unknown) => {
    idbStore[key] = value;
  }),
}));

import {
  createDefaultKhatamPlan,
  normalizeKhatamPlan,
  confirmPageCompleted,
  confirmPageRangeCompleted,
  removePageCompleted,
  calculateKhatamStats,
  getMissingPageRanges,
  LOCAL_STORAGE_ACTIVE_KHATAM_KEY,
  TOTAL_MUSHAF_PAGES,
} from '../services/quran/manualKhatmahService';
import { ManualKhatamPlan } from '../types';
import { KhatamTrackerView } from '../components/KhatamTrackerView';

const planiPlotë = (): ManualKhatamPlan => {
  const p = createDefaultKhatamPlan('Hatmja e plotë');
  return confirmPageRangeCompleted(p, 1, TOTAL_MUSHAF_PAGES);
};

const planMeBoshllëqe = (): ManualKhatamPlan => {
  let p = createDefaultKhatamPlan('Me boshllëqe');
  p = confirmPageCompleted(p, 2);
  p = confirmPageCompleted(p, 10);
  p = confirmPageCompleted(p, 37);
  return p;
};

const seedLS = (plan: ManualKhatamPlan) =>
  localStorage.setItem(LOCAL_STORAGE_ACTIVE_KHATAM_KEY, JSON.stringify(plan));

describe('K2 — një hatme e përfunduar nuk ka faqe tjetër', () => {
  it('1. nextPage bëhet 0 kur të 604 faqet janë të përfunduara', () => {
    const plan = planiPlotë();

    expect(plan.completedPages).toHaveLength(TOTAL_MUSHAF_PAGES);
    expect(plan.status).toBe('completed');
    expect(plan.nextPage).toBe(0);
  });

  it('2. statistikat vazhdojnë të jenë të sakta', () => {
    const stats = calculateKhatamStats(planiPlotë());

    expect(stats.percentage).toBe(100);
    expect(stats.isCompleted).toBe(true);
    expect(stats.completedPagesCount).toBe(TOTAL_MUSHAF_PAGES);
  });

  it('3. heqja e një faqeje e kthen nextPage në një vlerë reale', () => {
    let plan = planiPlotë();
    expect(plan.nextPage).toBe(0);

    plan = removePageCompleted(plan, 604);

    expect(plan.status).not.toBe('completed');
    expect(plan.nextPage).toBeGreaterThan(0);
  });

  it('4. normalizeKhatamPlan e ruan këtë sjellje edhe pas ruajtjes', () => {
    const restored = normalizeKhatamPlan(planiPlotë());

    expect(restored.nextPage).toBe(0);
    expect(restored.status).toBe('completed');
  });
});

describe('K3 — faqet e mbetura bëhen të dukshme', () => {
  it('5. getMissingPageRanges grupon boshllëqet në intervale', () => {
    const ranges = getMissingPageRanges(planMeBoshllëqe());

    expect(ranges).toEqual([
      { start: 1, end: 1 },
      { start: 3, end: 9 },
      { start: 11, end: 36 },
      { start: 38, end: TOTAL_MUSHAF_PAGES },
    ]);
  });

  it('6. numri total i faqeve të mbetura është i saktë', () => {
    const ranges = getMissingPageRanges(planMeBoshllëqe());
    const total = ranges.reduce((acc, r) => acc + (r.end - r.start + 1), 0);

    expect(total).toBe(TOTAL_MUSHAF_PAGES - 3);
  });

  it('7. një hatme e përfunduar nuk ka faqe të mbetura', () => {
    expect(getMissingPageRanges(planiPlotë())).toEqual([]);
  });

  it('8. një hatme e paprekur ka një interval të vetëm 1..604', () => {
    expect(getMissingPageRanges(createDefaultKhatamPlan())).toEqual([
      { start: 1, end: TOTAL_MUSHAF_PAGES },
    ]);
  });

  it('9. K3 NUK e ndryshon logjikën e nextPage (opsioni C)', () => {
    const plan = planMeBoshllëqe();

    // Kjo është sjellja ekzistuese dhe duhet të mbetet e pandryshuar.
    expect(plan.nextPage).toBe(38);
  });

  it('10. kërcimi te një faqe e largët nuk i fsheh faqet e mbetura', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 300);

    const ranges = getMissingPageRanges(plan);
    const total = ranges.reduce((acc, r) => acc + (r.end - r.start + 1), 0);

    expect(total).toBe(TOTAL_MUSHAF_PAGES - 1);
    expect(ranges[0]).toEqual({ start: 1, end: 299 });
  });
});

describe('Faza 2 — sjellja në ekran', () => {
  beforeEach(() => {
    localStorage.clear();
    for (const k of Object.keys(idbStore)) delete idbStore[k];
  });

  afterEach(() => cleanup());

  it('11. një hatme e përfunduar nuk tregon më "Vazhdo hatmen (Faqja 604)"', () => {
    seedLS(planiPlotë());

    render(<KhatamTrackerView />);

    expect(screen.queryByText(/Vazhdo hatmen \(Faqja 604\)/)).toBeNull();
  });

  it('12. një hatme e përfunduar tregon mesazhin e përfundimit', () => {
    seedLS(planiPlotë());

    render(<KhatamTrackerView />);

    expect(screen.getByText(/Hatmja u përfundua/i)).toBeTruthy();
  });

  it('13. seksioni i faqeve të mbetura shfaqet kur ka boshllëqe', () => {
    seedLS(planMeBoshllëqe());

    render(<KhatamTrackerView />);

    expect(screen.getByText(/Faqet e mbetura/i)).toBeTruthy();
    // 601 faqe të palexuara. getAllByText sepse numri përmbahet edhe te
    // elementi prind, dhe getByText do të hidhte gabim për përputhje të shumëfishta.
    expect(screen.getAllByText(/601/).length).toBeGreaterThan(0);
  });

  it('14. seksioni i faqeve të mbetura nuk shfaqet kur hatmja është e plotë', () => {
    seedLS(planiPlotë());

    render(<KhatamTrackerView />);

    expect(screen.queryByText(/Faqet e mbetura/i)).toBeNull();
  });

  it('15. një hatme në progres vazhdon të tregojë butonin e zakonshëm', () => {
    seedLS(planMeBoshllëqe());

    render(<KhatamTrackerView />);

    // Opsioni C: butoni kryesor mbetet si më parë.
    expect(screen.getByText(/Vazhdo hatmen \(Faqja 38\)/)).toBeTruthy();
  });
});
