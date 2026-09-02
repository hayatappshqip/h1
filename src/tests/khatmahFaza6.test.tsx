/**
 * KHATMAH V2 — Testet e Fazës 6 (K11: dështimet e ruajtjes bëhen të dukshme)
 *
 * Këto teste shkruhen PARA rregullimit.
 *
 * Problemi: kur shkrimi në IndexedDB ose localStorage dështon (kuota plot,
 * modalitet privat, dëmtim i depos), kodi lëshon vetëm një console.warn.
 * Përdoruesi nuk sheh asgjë — për të, progresi është ruajtur. Në një pajisje
 * mobile ku depot kanë kuota të vogla, kjo është mënyra se si humbet punë
 * pa e ditur.
 *
 * Rrënja: saveDurableKhatamPlan kthen Promise<void>, pra thirrësi NUK MUND
 * ta dijë nëse funksionoi. Dhe KhatamTrackerView:116 e thërret pa e pritur.
 *
 * Rregullimi: funksionet e ruajtjes kthejnë një rezultat {localStorage,
 * indexedDB, ok}, dhe UI e shfaq paralajmërimin me toast-in ekzistues.
 *
 * IndexedDB simulohet me vi.mock('../services/db'); nuk shtohet dependencë.
 * NUK ndryshohet asnjë test ekzistues. Ky është skedar i ri.
 */
// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';

const { idbStore, idbFail } = vi.hoisted(() => ({
  idbStore: {} as Record<string, unknown>,
  idbFail: { on: false },
}));

vi.mock('../services/db', () => ({
  getMeta: vi.fn(async (key: string) => (key in idbStore ? idbStore[key] : null)),
  saveMeta: vi.fn(async (key: string, value: unknown) => {
    if (idbFail.on) {
      throw new Error('QuotaExceededError: simulim dështimi të IndexedDB');
    }
    idbStore[key] = value;
  }),
}));

import {
  createDefaultKhatamPlan,
  normalizeKhatamPlan,
  confirmPageCompleted,
  saveDurableKhatamPlan,
  saveDurableCompletedKhatamPlans,
  loadCachedKhatamPlan,
  INDEXEDDB_ACTIVE_KHATAM_KEY,
  LOCAL_STORAGE_ACTIVE_KHATAM_KEY,
} from '../services/quran/manualKhatmahService';
import { ManualKhatamPlan } from '../types';
import { KhatamTrackerView } from '../components/KhatamTrackerView';

/** Rezultati i ruajtjes. Nuk ekziston ende — merret në mënyrë mbrojtëse. */
type PersistResult = { localStorage: boolean; indexedDB: boolean; ok: boolean };

const planWith = (pages: number[]): ManualKhatamPlan =>
  normalizeKhatamPlan({ ...createDefaultKhatamPlan(), completedPages: pages });

const resetStores = () => {
  localStorage.clear();
  for (const k of Object.keys(idbStore)) delete idbStore[k];
  idbFail.on = false;
};

/** E bën localStorage.setItem të dështojë, si kur kuota është plot. */
const failLocalStorage = () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('QuotaExceededError: simulim dështimi të localStorage');
  });
};

describe('K11 — ruajtja raporton nëse funksionoi', () => {
  beforeEach(resetStores);
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('1. ruajtja e suksesshme raporton sukses në të dyja depot', async () => {
    const result = (await saveDurableKhatamPlan(planWith([1, 2, 3]))) as unknown as PersistResult;

    expect(result).toBeDefined();
    expect(result.localStorage).toBe(true);
    expect(result.indexedDB).toBe(true);
    expect(result.ok).toBe(true);
  });

  it('2. kur IndexedDB dështon, rezultati e tregon — nuk gëlltitet', async () => {
    idbFail.on = true;

    const result = (await saveDurableKhatamPlan(planWith([1, 2, 3]))) as unknown as PersistResult;

    expect(result.indexedDB).toBe(false);
    expect(result.localStorage).toBe(true);
    expect(result.ok).toBe(false);
  });

  it('3. kur localStorage dështon, rezultati e tregon', async () => {
    failLocalStorage();

    const result = (await saveDurableKhatamPlan(planWith([1, 2, 3]))) as unknown as PersistResult;

    expect(result.localStorage).toBe(false);
    expect(result.indexedDB).toBe(true);
    expect(result.ok).toBe(false);
  });

  it('4. kur dështojnë të dyja, ok është false', async () => {
    idbFail.on = true;
    failLocalStorage();

    const result = (await saveDurableKhatamPlan(planWith([5]))) as unknown as PersistResult;

    expect(result.localStorage).toBe(false);
    expect(result.indexedDB).toBe(false);
    expect(result.ok).toBe(false);
  });

  it('5. dështimi i IndexedDB nuk e pengon ruajtjen në localStorage', async () => {
    idbFail.on = true;

    await saveDurableKhatamPlan(planWith([9, 10]));

    // Progresi është ende në pajisje, edhe pse kopja rezervë dështoi.
    expect(loadCachedKhatamPlan().completedPages).toEqual([9, 10]);
  });

  it('6. ruajtja e arkivit raporton gjithashtu', async () => {
    idbFail.on = true;

    const result = (await saveDurableCompletedKhatamPlans([planWith([1])])) as unknown as PersistResult;

    expect(result.indexedDB).toBe(false);
    expect(result.ok).toBe(false);
  });
});

describe('K11 — paralajmërimi shfaqet në ekran', () => {
  beforeEach(resetStores);
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const openModalAndConfirm = async () => {
    const btn = document.getElementById('btn-perditso-progresin');
    if (!btn) throw new Error('Butoni btn-perditso-progresin nuk u gjet');
    fireEvent.click(btn);
    fireEvent.click(await screen.findByText('Po, konfirmo Faqen 1'));
  };

  it('7. kur ruajtja dështon, përdoruesi sheh paralajmërim', async () => {
    idbFail.on = true;
    render(<KhatamTrackerView />);

    await openModalAndConfirm();

    await waitFor(() => {
      const toast = document.getElementById('khatam-toast');
      expect(toast).not.toBeNull();
      expect(toast!.textContent).toMatch(/ruajt|rezerv|humb/i);
    });
  });

  it('8. kur ruajtja funksionon, shfaqet mesazhi i suksesit pa paralajmërim', async () => {
    render(<KhatamTrackerView />);

    await openModalAndConfirm();

    await waitFor(() => {
      const toast = document.getElementById('khatam-toast');
      expect(toast).not.toBeNull();
      expect(toast!.textContent).toContain('u konfirmua');
    });
    expect(document.getElementById('khatam-toast')!.textContent).not.toMatch(/rezerv|humb/i);
  });

  it('9. paralajmërimi dallon kur vetë localStorage dështon', async () => {
    render(<KhatamTrackerView />);
    // E prishim localStorage vetëm pas hapjes së ekranit, që leximi fillestar të funksionojë.
    await openModalAndConfirm();
    failLocalStorage();
    idbFail.on = true;

    // Një veprim tjetër, tani me depo të prishura.
    const btn = document.getElementById('btn-perditso-progresin');
    fireEvent.click(btn!);
    fireEvent.click(await screen.findByText('Po, konfirmo Faqen 2'));

    await waitFor(() => {
      const toast = document.getElementById('khatam-toast');
      expect(toast!.textContent).toMatch(/humb/i);
    });
  });

  it('10. progresi mbetet i dukshëm edhe kur ruajtja dështon', async () => {
    idbFail.on = true;
    render(<KhatamTrackerView />);

    await openModalAndConfirm();

    // Faqja tjetër duhet të jetë 2 — ruajtja e dështuar nuk e kthen gjendjen.
    await waitFor(() => {
      fireEvent.click(document.getElementById('btn-perditso-progresin')!);
      expect(screen.getByText('Po, konfirmo Faqen 2')).toBeTruthy();
    });
  });
});
