/**
 * KHATMAH V2 — Testet e Fazës 5 (Arkivi / rimëkëmbja)
 *
 * Këto teste shkruhen PARA rregullimit. Dokumentojnë sjelljen e duhur sipas
 * handoff-it "HAYAT — KHATMAH V2", Definition of Done:
 *   "archive survives LS clearing"
 *   "empty plans not accumulated"
 *   "no silent data loss"
 *
 * Tre probleme të audituara:
 *   A1 — saveDurableCompletedKhatamPlans shkruan në IndexedDB, por NUK ekziston
 *        asnjë lexues i qëndrueshëm. Pas pastrimit të localStorage arkivi është
 *        i paarritshëm, edhe pse të dhënat janë ende në IDB.
 *   A2 — archiveCurrentAndStartNewPlan lexon listën VETËM nga localStorage dhe
 *        pastaj e mbishkruan IDB-në. Nëse LS është pastruar, arkivimi i një
 *        hatmeje të re SHKATËRRON përgjithmonë arkivin e vjetër.
 *   A3 — plane me zero faqe të përfunduara arkivohen, duke grumbulluar mbeturina.
 *
 * IndexedDB simulohet në memorie me vi.mock('../services/db'); nuk shtohet
 * dependencë e re.
 *
 * NUK ndryshohet asnjë test ekzistues. Ky është skedar i ri.
 */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from 'vitest';

const { idbStore } = vi.hoisted(() => ({ idbStore: {} as Record<string, unknown> }));

vi.mock('../services/db', () => ({
  getMeta: vi.fn(async (key: string) => (key in idbStore ? idbStore[key] : null)),
  saveMeta: vi.fn(async (key: string, value: unknown) => {
    idbStore[key] = value;
  }),
}));

import * as khatmah from '../services/quran/manualKhatmahService';
import {
  createDefaultKhatamPlan,
  normalizeKhatamPlan,
  confirmPageCompleted,
  confirmPageRangeCompleted,
  archiveCurrentAndStartNewPlan,
  loadCachedCompletedKhatamPlans,
  saveDurableCompletedKhatamPlans,
  LOCAL_STORAGE_COMPLETED_KHATAM_KEY,
  INDEXEDDB_COMPLETED_KHATAM_KEY,
  TOTAL_MUSHAF_PAGES,
} from '../services/quran/manualKhatmahService';
import { ManualKhatamPlan } from '../types';

/** Ndërton një plan të arkivueshëm me titull dhe faqe të caktuara. */
const archivedPlan = (id: string, title: string, pages: number[]): ManualKhatamPlan =>
  normalizeKhatamPlan({
    ...createDefaultKhatamPlan(title),
    id,
    completedPages: pages,
    status: pages.length >= TOTAL_MUSHAF_PAGES ? 'completed' : 'paused',
    createdAt: 100,
    updatedAt: 100,
  });

const seedArchiveLS = (plans: ManualKhatamPlan[]) => {
  localStorage.setItem(LOCAL_STORAGE_COMPLETED_KHATAM_KEY, JSON.stringify(plans));
};

const seedArchiveIDB = (plans: ManualKhatamPlan[]) => {
  idbStore[INDEXEDDB_COMPLETED_KHATAM_KEY] = plans;
};

const seq = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

/**
 * Lexuesi i qëndrueshëm i arkivit. Nuk ekziston ende — merret nëpërmjet
 * namespace-it që mungesa të japë një dështim testi të lexueshëm, jo gabim moduli.
 */
const loadDurableArchive = (khatmah as Record<string, unknown>).loadDurableCompletedKhatamPlans as
  | (() => Promise<ManualKhatamPlan[]>)
  | undefined;

describe('Faza 5 — arkivi mbijeton pastrimin e localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    for (const k of Object.keys(idbStore)) delete idbStore[k];
  });

  it('1. ekziston një lexues i qëndrueshëm për arkivin', () => {
    expect(typeof loadDurableArchive).toBe('function');
  });

  it('2. LS i pastruar + arkiv në IDB → arkivi rikthehet', async () => {
    // Përdoruesi ka pastruar të dhënat e shfletuesit; IDB ka mbijetuar.
    seedArchiveIDB([
      archivedPlan('a', 'Hatmja e parë', seq(TOTAL_MUSHAF_PAGES)),
      archivedPlan('b', 'Hatmja e dytë', seq(300)),
      archivedPlan('c', 'Hatmja e tretë', seq(45)),
    ]);

    expect(loadCachedCompletedKhatamPlans()).toHaveLength(0); // LS është bosh

    const restored = await loadDurableArchive!();

    expect(restored).toHaveLength(3);
    expect(restored.map((p) => p.title)).toEqual(['Hatmja e parë', 'Hatmja e dytë', 'Hatmja e tretë']);
  });

  it('3. IDB i pastruar + arkiv në LS → arkivi nuk humbet', async () => {
    seedArchiveLS([archivedPlan('a', 'Hatmja e vetme', seq(120))]);

    const loaded = await loadDurableArchive!();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].title).toBe('Hatmja e vetme');
  });

  it('4. lista bashkohen sipas id — asnjë hatme nuk humbet', async () => {
    // Shkrim i pjesshëm: LS ka A dhe B, IDB ka A dhe C.
    seedArchiveLS([archivedPlan('a', 'A', seq(10)), archivedPlan('b', 'B', seq(20))]);
    seedArchiveIDB([archivedPlan('a', 'A', seq(10)), archivedPlan('c', 'C', seq(30))]);

    const loaded = await loadDurableArchive!();

    expect(loaded.map((p) => p.id).sort()).toEqual(['a', 'b', 'c']);
  });

  it('5. për të njëjtën hatme mbetet kopja më e plotë', async () => {
    seedArchiveLS([archivedPlan('a', 'A', seq(10))]);
    seedArchiveIDB([archivedPlan('a', 'A', seq(250))]);

    const loaded = await loadDurableArchive!();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].completedPages).toHaveLength(250);
  });

  it('6. ruajtja pas leximit është e qëndrueshme (round-trip)', async () => {
    const list = [archivedPlan('a', 'A', seq(604))];

    await saveDurableCompletedKhatamPlans(list);
    const loaded = await loadDurableArchive!();

    expect(loaded).toHaveLength(1);
    expect(loaded[0].completedPages).toHaveLength(TOTAL_MUSHAF_PAGES);
  });
});

describe('Faza 5 — arkivimi i një hatmeje të re nuk shkatërron arkivin e vjetër', () => {
  beforeEach(() => {
    localStorage.clear();
    for (const k of Object.keys(idbStore)) delete idbStore[k];
  });

  it('7. LS i pastruar + 3 hatme në IDB → arkivimi ruan të katërta', async () => {
    seedArchiveIDB([
      archivedPlan('a', 'Hatmja 1', seq(604)),
      archivedPlan('b', 'Hatmja 2', seq(300)),
      archivedPlan('c', 'Hatmja 3', seq(150)),
    ]);

    let current = createDefaultKhatamPlan('Hatmja 4');
    current = confirmPageRangeCompleted(current, 1, 200);

    const { completedPlans } = await archiveCurrentAndStartNewPlan(current, 'Hatmja 5');

    // Tre hatmet e vjetra plus ajo që sapo u arkivua.
    expect(completedPlans).toHaveLength(4);
    expect(completedPlans.map((p) => p.title)).toEqual([
      'Hatmja 4',
      'Hatmja 1',
      'Hatmja 2',
      'Hatmja 3',
    ]);

    // Dhe duhet të jenë ruajtur realisht, jo vetëm të kthyera.
    const persisted = await loadDurableArchive!();
    expect(persisted).toHaveLength(4);
  });

  it('8. arkivimi i zakonshëm me LS të plotë sjelllet si më parë', async () => {
    let current = createDefaultKhatamPlan('Hatmja aktuale');
    current = confirmPageCompleted(current, 100);

    const { newPlan, completedPlans } = await archiveCurrentAndStartNewPlan(current, 'Hatmja e re', 10);

    expect(newPlan.title).toBe('Hatmja e re');
    expect(newPlan.completedPages).toEqual([]);
    expect(completedPlans).toHaveLength(1);
    expect(completedPlans[0].completedPages).toEqual([100]);
  });

  it('9. hatmja e përfunduar arkivohet me status "completed"', async () => {
    let current = createDefaultKhatamPlan('Hatmja e plotë');
    current = confirmPageRangeCompleted(current, 1, TOTAL_MUSHAF_PAGES);

    await archiveCurrentAndStartNewPlan(current, 'Hatmja e re');

    const archived = loadCachedCompletedKhatamPlans();
    expect(archived).toHaveLength(1);
    expect(archived[0].status).toBe('completed');
  });
});

describe('Faza 5 — plane bosh nuk grumbullohen në arkiv', () => {
  beforeEach(() => {
    localStorage.clear();
    for (const k of Object.keys(idbStore)) delete idbStore[k];
  });

  it('10. një plan me zero faqe nuk arkivohet', async () => {
    const empty = createDefaultKhatamPlan('E paprekur');

    const { completedPlans } = await archiveCurrentAndStartNewPlan(empty, 'Hatmja e re');

    expect(completedPlans).toHaveLength(0);
    expect(loadCachedCompletedKhatamPlans()).toHaveLength(0);
  });

  it('11. plane bosh të përsëritura nuk e mbushin arkivin', async () => {
    for (let i = 0; i < 5; i++) {
      await archiveCurrentAndStartNewPlan(createDefaultKhatamPlan(`Bosh ${i}`), 'Hatmja e re');
    }

    expect(loadCachedCompletedKhatamPlans()).toHaveLength(0);
  });

  it('12. plani bosh nuk e fshin arkivin ekzistues', async () => {
    seedArchiveLS([archivedPlan('a', 'Hatmja e vërtetë', seq(500))]);

    const { completedPlans } = await archiveCurrentAndStartNewPlan(
      createDefaultKhatamPlan('Bosh'),
      'Hatmja e re'
    );

    expect(completedPlans).toHaveLength(1);
    expect(completedPlans[0].title).toBe('Hatmja e vërtetë');
  });

  it('13. plani me qoftë edhe një faqe arkivohet', async () => {
    let current = createDefaultKhatamPlan('Vetëm një faqe');
    current = confirmPageCompleted(current, 7);

    const { completedPlans } = await archiveCurrentAndStartNewPlan(current, 'Hatmja e re');

    expect(completedPlans).toHaveLength(1);
    expect(completedPlans[0].completedPages).toEqual([7]);
  });
});
