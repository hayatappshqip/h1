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

