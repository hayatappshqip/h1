/**
 * KHATMAH V2 — Testet e Fazës 1 (K1, K4, K6)
 *
 * Këto teste shkruhen PARA rregullimit. Ato dokumentojnë sjelljen e duhur
 * sipas handoff-it "HAYAT — KHATMAH V2":
 *   K1 — hatmja është e përfunduar VETËM kur të 604 faqet janë të përfunduara
 *   K4 — një plan "paused" nuk bëhet "active" vetëm sepse u korrigjua një faqe
 *   K6 — completedPages përmban vetëm numra të plotë brenda 1..604
 *
 * NUK ndryshohet asnjë test ekzistues. Ky është skedar i ri.
 */
import { describe, it, expect } from 'vitest';
import {
  createDefaultKhatamPlan,
  normalizeKhatamPlan,
  confirmPageCompleted,
  confirmPageRangeCompleted,
  confirmJuzCompleted,
  removePageCompleted,
  removeJuzCompleted,
  calculateKhatamStats,
  TOTAL_MUSHAF_PAGES,
} from '../services/quran/manualKhatmahService';

/** Ndërton një plan me faqet 1..n të përfunduara. */
const planWithPages = (pages: number[], status: 'active' | 'paused' | 'completed' = 'active') =>
  normalizeKhatamPlan({ ...createDefaultKhatamPlan(), completedPages: pages, status });

const allPages = () => Array.from({ length: TOTAL_MUSHAF_PAGES }, (_, i) => i + 1);

describe('K1 — përfundimi kërkon të 604 faqet, jo faqen 604', () => {
  it('faqja 604 vetëm NUK e bën hatmen "completed"', () => {
    const plan = confirmPageCompleted(createDefaultKhatamPlan(), 604);

    expect(plan.completedPages).toEqual([604]);
    expect(plan.status).not.toBe('completed');
  });

  it('status-i i planit përputhet me stats.isCompleted (invarianti kryesor)', () => {
    // Ky është invarianti që thyhej: plani thoshte "completed" ndërsa
    // statistikat thonin 0.2% dhe isCompleted=false.
    const cases: number[][] = [
      [604],
      [1, 2, 3, 604],
      [600, 601, 602, 603, 604],
      allPages(),
    ];

    for (const pages of cases) {
      const plan = planWithPages(pages);
      const stats = calculateKhatamStats(plan);
      expect(
        plan.status === 'completed',
        `faqet [${pages.length} faqe]: plan.status="${plan.status}" por stats.isCompleted=${stats.isCompleted}`,
      ).toBe(stats.isCompleted);
    }
  });

  it('statistikat mbeten të ndershme për një hatme me vetëm faqen 604', () => {
    const plan = confirmPageCompleted(createDefaultKhatamPlan(), 604);
    const stats = calculateKhatamStats(plan);

    expect(stats.completedPagesCount).toBe(1);
    expect(stats.isCompleted).toBe(false);
    expect(stats.remainingPagesCount).toBe(TOTAL_MUSHAF_PAGES - 1);
  });

  it('të 604 faqet e bëjnë hatmen "completed" (guard kundër regresionit)', () => {
    const plan = planWithPages(allPages());

    expect(plan.completedPages).toHaveLength(TOTAL_MUSHAF_PAGES);
    expect(plan.status).toBe('completed');
    expect(calculateKhatamStats(plan).isCompleted).toBe(true);
    expect(calculateKhatamStats(plan).percentage).toBe(100);
  });

  it('603 faqe NUK mjaftojnë, edhe kur e fundit është 604', () => {
    const pages = allPages().filter((p) => p !== 300);
    const plan = planWithPages(pages);

    expect(plan.completedPages).toHaveLength(TOTAL_MUSHAF_PAGES - 1);
    expect(plan.lastCompletedPage).toBe(604);
    expect(plan.status).not.toBe('completed');
  });

  it('rruga confirmPageCompleted deri në 604 faqe prodhon "completed"', () => {
    let plan = planWithPages(allPages().slice(0, TOTAL_MUSHAF_PAGES - 1));
    expect(plan.status).not.toBe('completed');

    plan = confirmPageCompleted(plan, TOTAL_MUSHAF_PAGES);
    expect(plan.status).toBe('completed');
  });
});

describe('K4 — statusi "paused" ruhet gjatë korrigjimeve', () => {
  it('removePageCompleted e ruan "paused"', () => {
    const plan = planWithPages([1, 2, 3, 4, 5], 'paused');
    const updated = removePageCompleted(plan, 3);

    expect(updated.completedPages).toEqual([1, 2, 4, 5]);
    expect(updated.status).toBe('paused');
  });

  it('removeJuzCompleted e ruan "paused"', () => {
    const juz1 = Array.from({ length: 21 }, (_, i) => i + 1);
    const plan = planWithPages(juz1, 'paused');
    const updated = removeJuzCompleted(plan, 1);

    expect(updated.completedPages).toHaveLength(0);
    expect(updated.status).toBe('paused');
  });

  it('një hatme e përfunduar që humb një faqe kthehet në "active"', () => {
    // Guard: rregullimi i K4 nuk duhet ta mbajë "completed" një plan me 603 faqe.
    const plan = planWithPages(allPages(), 'completed');
    expect(plan.status).toBe('completed');

    const updated = removePageCompleted(plan, 300);
    expect(updated.completedPages).toHaveLength(TOTAL_MUSHAF_PAGES - 1);
    expect(updated.status).toBe('active');
  });

  it('një hatme e përfunduar që humb një xhuz kthehet në "active"', () => {
    const plan = planWithPages(allPages(), 'completed');
    const updated = removeJuzCompleted(plan, 2);

    expect(updated.completedPages.length).toBeLessThan(TOTAL_MUSHAF_PAGES);
    expect(updated.status).toBe('active');
  });

  it('"paused" ruhet edhe nga confirm* (sjellja ekzistuese, si guard)', () => {
    const plan = planWithPages([1, 2, 3], 'paused');

    expect(confirmPageCompleted(plan, 4).status).toBe('paused');
    expect(confirmPageRangeCompleted(plan, 5, 6).status).toBe('paused');
    expect(confirmJuzCompleted(plan, 1).status).toBe('paused');
  });
});

