/**
 * KHATMAH V2 — Testet e Fazës 4 (K5: historiku nuk fryhet kur një faqe hiqet)
 *
 * Këto teste shkruhen PARA rregullimit.
 *
 * Problemi: confirmPageCompleted e rrit numëruesin ditor të `history`, por
 * removePageCompleted nuk e prek fare. Pra një faqe që hiqet dhe shënohet
 * sërish numërohet dy herë:
 *   shëno 1..5  -> history: 5
 *   hiq faqen 5 -> history: 5   (duhet 4)
 *   shëno sërish-> history: 6   (përdoruesi ka lexuar 5 faqe, jo 6)
 *
 * Kjo fryn `avgPagesPerDay` dhe `confirmedTodayCount`, pra edhe datën e
 * projektuar të përfundimit — statistika që shfaqen në ekran.
 *
 * VENDIMI SEMANTIK (marrë nga agjenti, i dokumentuar):
 *   Heqja zbret VETËM numëruesin e ditës së sotme, me dysheme 0. Nuk rishkruhet
 *   kurrë një ditë që përdoruesi nuk e ka prekur. Nëse faqja e hequr ishte
 *   kredituar në një ditë të mëparshme, ajo ditë mbetet e fryrë — kjo është
 *   një kufizim i njohur, sepse faqet nuk mbajnë datë (completedPages është
 *   number[], burimi i vetëm i së vërtetës sipas handoff-it). Sjellja në atë
 *   rast është e njëjtë me sot, pra nuk ka regresion.
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
} from '../services/quran/manualKhatmahService';

const DITA = '2026-08-16';
const DITA_MË_HERËT = '2026-08-10';

/** Shuma totale e faqeve të regjistruara në historik. */
const totalHistory = (plan: ReturnType<typeof normalizeKhatamPlan>) =>
  plan.history.reduce((acc, h) => acc + h.pagesCount, 0);

describe('K5 — heqja e një faqeje e zbret historikun', () => {
  it('1. faqja e hequr nuk numërohet më', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageRangeCompleted(plan, 1, 5, DITA);
    expect(totalHistory(plan)).toBe(5);

    plan = removePageCompleted(plan, 5, DITA);

    expect(plan.completedPages).toEqual([1, 2, 3, 4]);
    expect(totalHistory(plan)).toBe(4);
  });

  it('2. heqja dhe shënimi sërish nuk e numëron faqen dy herë', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageRangeCompleted(plan, 1, 5, DITA);

    plan = removePageCompleted(plan, 5, DITA);
    plan = confirmPageCompleted(plan, 5, DITA);

    // Përdoruesi ka lexuar 5 faqe të ndryshme — jo 6.
    expect(plan.completedPages).toEqual([1, 2, 3, 4, 5]);
    expect(totalHistory(plan)).toBe(5);
  });

  it('3. cikli i përsëritur hiq/shëno nuk e fryn historikun', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageRangeCompleted(plan, 1, 5, DITA);

    for (let i = 0; i < 10; i++) {
      plan = removePageCompleted(plan, 5, DITA);
      plan = confirmPageCompleted(plan, 5, DITA);
    }

    expect(totalHistory(plan)).toBe(5);
    expect(plan.completedPages).toHaveLength(5);
  });

  it('4. numëruesi ditor nuk bëhet kurrë negativ', () => {
    // Plani ka vetëm një faqe, të kredituar sot.
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 1, DITA);

    plan = removePageCompleted(plan, 1, DITA);
    plan = removePageCompleted(plan, 1, DITA); // heqje e dytë, tashmë e hequr

    const sot = plan.history.find((h) => h.date === DITA);
    expect(sot ? sot.pagesCount : 0).toBeGreaterThanOrEqual(0);
    expect(totalHistory(plan)).toBe(0);
  });

  it('5. heqja e një xhuzi e zbret historikun me numrin e faqeve', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmJuzCompleted(plan, 1, DITA);
    const pasXhuzit = totalHistory(plan);

    plan = removeJuzCompleted(plan, 1, DITA);

    expect(plan.completedPages).toHaveLength(0);
    expect(totalHistory(plan)).toBe(0);
    expect(pasXhuzit).toBeGreaterThan(0);
  });

  it('6. statistikat pasqyrojnë faqet reale, jo ato të fryra', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageRangeCompleted(plan, 1, 20, DITA);

    plan = removePageCompleted(plan, 20, DITA);
    plan = confirmPageCompleted(plan, 20, DITA);

    const stats = calculateKhatamStats(plan);

    expect(stats.completedPagesCount).toBe(20);
    expect(totalHistory(plan)).toBe(20);
    expect(stats.avgPagesPerDay).toBe(20);
  });
});

describe('K5 — ditët që nuk janë prekur nuk rishkruhen', () => {
  it('7. heqja e një faqeje të vjetër nuk e rishkruan ditën e vjetër', () => {
    let plan = createDefaultKhatamPlan();
    // 3 faqe të lexuara një javë më parë.
    plan = confirmPageRangeCompleted(plan, 1, 3, DITA_MË_HERËT);
    // 2 faqe të lexuara sot.
    plan = confirmPageRangeCompleted(plan, 10, 11, DITA);

    plan = removePageCompleted(plan, 2, DITA);

    const ditëVjetër = plan.history.find((h) => h.date === DITA_MË_HERËT);
    const ditëSot = plan.history.find((h) => h.date === DITA);

    // Dita e vjetër nuk rishkruhet KURRË — kjo është e garantuar.
    expect(ditëVjetër?.pagesCount).toBe(3);
    // Zbritja absorbohet nga e sotmja. KUFIZIM I NJOSHUR: faqja 2 u lexua në
    // ditën e vjetër, por kjo nuk mund të dihet — completedPages është
    // number[] dhe nuk mban data. Pra e sotmja zbret 2 -> 1.
    expect(ditëSot?.pagesCount).toBe(1);
    // Megjithatë totali mbetet i saktë: 4 faqe të lexuara, 4 të regjistruara.
    expect(totalHistory(plan)).toBe(plan.completedPages.length);
    expect(plan.completedPages).toEqual([1, 3, 10, 11]);
  });

  it('8. kur nuk ka aktivitet sot, historiku nuk preket fare', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageRangeCompleted(plan, 1, 3, DITA_MË_HERËT);
    const para = totalHistory(plan);

    plan = removePageCompleted(plan, 2, DITA);

    // Asnjë hyrje negative nuk shpiket për ditën e sotme.
    expect(plan.history.every((h) => h.pagesCount >= 0)).toBe(true);
    expect(totalHistory(plan)).toBeLessThanOrEqual(para);
  });
});

describe('K5 — sjelljet ekzistuese ruhen', () => {
  it('9. shënimi pa heqje e rrit historikun si më parë', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 5, DITA);
    plan = confirmPageCompleted(plan, 5, DITA); // e dyfishuar, injorohet

    expect(plan.completedPages).toEqual([5]);
    expect(plan.history).toEqual([{ date: DITA, pagesCount: 1 }]);
  });

  it('10. heqja e një faqeje që nuk është në plan nuk e prek historikun', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageRangeCompleted(plan, 1, 4, DITA);
    const para = totalHistory(plan);

    plan = removePageCompleted(plan, 99, DITA);

    expect(totalHistory(plan)).toBe(para);
    expect(plan.completedPages).toEqual([1, 2, 3, 4]);
  });

  it('11. heqja pa argument date përdor ditën e sotme dhe nuk thyhet', () => {
    let plan = createDefaultKhatamPlan();
    plan = confirmPageCompleted(plan, 3);

    // Nënshkrimi i vjetër (pa datë) vazhdon të funksionojë.
    plan = removePageCompleted(plan, 3);

    expect(plan.completedPages).toEqual([]);
    expect(plan.history.every((h) => h.pagesCount >= 0)).toBe(true);
  });
});
