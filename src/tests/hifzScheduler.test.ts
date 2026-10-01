/**
 * HIFZ — TESTE MBROJTËSE të motorit SM-2 (hifzScheduler.ts)
 *
 * Shkruhen PARA ÇDO NDRYSHIMI TJETËR te moduli Hifz (detyra: metoda e
 * mësimit nuk arrin te HifzLearnView).
 *
 * Këto teste e pin-kojnë sjelljen AKTUALE të algoritmit SM-2, e cila është
 * e verifikuar si e saktë:
 *   - MIN_EASE = 1.3, MAX_EASE = 2.8, MAX_INTERVAL = 180
 *   - FORGOT:    interval = 1, ease - 0.20, lapses + 1, rep = 0, status LEARNING
 *   - STRUGGLED: interval × 1.2 (min 1), ease - 0.05, rep = 0 (status nuk bie)
 *   - KNEW:      interval × ease (min 1, max 180), ease + 0.05, rep + 1
 *   - status: LEARNING → REVIEWING te rep >= 3; → CONSOLIDATED te interval >= 21 && lapses <= 1
 *   - strength = floor(intervalDays / 21 * 100) (cap 100)
 *   - dueDate = now + intervalDays (ri-përditësohet gjithmonë)
 *
 * RREGULL: hifzScheduler.ts NUK ndryshohet në këtë fazë. Nëse ndonjëri nga
 * këto teste dështon, motori ka regresuar — rregullohet kodi, JO testi.
 *
 * MOSHËSHTET: MONTHLY_JUZ (defekt i njohur nga auditimi, gjetja H3 —
 * "placeholder" me slice pozicionale). Vendimi D5 për to është ende i hapur;
 * ta përfshin këtu do ta ngjithej placeholder-i si kontratë.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const tables = vi.hoisted(() => {
  const ayahRecords = new Map<string, any>();
  return {
    ayahRecords,
    api: {
      get: async (key: string) => ayahRecords.get(key),
      put: async (rec: any) => {
        ayahRecords.set(rec.ayahKey, rec);
        return rec.ayahKey;
      },
      toArray: async () => Array.from(ayahRecords.values()),
    },
  };
});

vi.mock('../services/hifzDb', () => ({
  hifzDb: { ayahRecords: tables.api },
}));

import {
  processReviewResult,
  getReviewQueue,
  MANZIL_STARTS,
} from '../services/hifzScheduler';

const DAY = 24 * 60 * 60 * 1000;

function baseRecord(over: Record<string, any> = {}): any {
  return {
    ayahKey: '1:1',
    status: 'REVIEWING',
    strength: 50,
    easeFactor: 2.5,
    intervalDays: 10,
    dueDate: Date.now(),
    repetitions: 3,
    lapses: 0,
    lastReviewedAt: 0,
    lastResult: 'KNEW',
    totalListens: 0,
    stumblePoints: [] as number[],
    createdAt: 0,
    ...over,
  };
}

function seed(rec: any) {
  tables.ayahRecords.set(rec.ayahKey, rec);
}

beforeEach(() => {
  tables.ayahRecords.clear();
  vi.setSystemTime(new Date('2026-09-02T12:00:00'));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('Konstantet e hapsirëzimit (të pin-kuara përmes sjelljes)', () => {
  it('MIN_EASE = 1.3: FORGOT nuk e zbrit easeFactor nën 1.3', async () => {
    seed(baseRecord({ easeFactor: 1.4 }));
    const r = await processReviewResult('1:1', 'FORGOT', []);
    // 1.4 - 0.20 = 1.2 → kufizohet te 1.3
    expect(r.easeFactor).toBe(1.3);
  });

  it('MAX_EASE = 2.8: KNEW nuk e ngjit easeFactor mbi 2.8', async () => {
    seed(baseRecord({ easeFactor: 2.79 }));
    const r = await processReviewResult('1:1', 'KNEW', []);
    // 2.79 + 0.05 = 2.84 → kufizohet te 2.8
    expect(r.easeFactor).toBe(2.8);
  });

  it('MAX_INTERVAL = 180: KNEW nuk e mban intervalin mbi 180 ditë', async () => {
    seed(baseRecord({ intervalDays: 170, easeFactor: 2.5 }));
    const r = await processReviewResult('1:1', 'KNEW', []);
    // 170 * 2.5 = 425 → kufizohet te 180
    expect(r.intervalDays).toBe(180);
  });

  it('MAX_INTERVAL = 180: edhe STRUGGLED (×1.2) kufizohet te 180', async () => {
    seed(baseRecord({ intervalDays: 170 }));
    const r = await processReviewResult('1:1', 'STRUGGLED', []);
    // 170 * 1.2 = 204 → kufizohet te 180
    expect(r.intervalDays).toBe(180);
  });

  it('Intervali minimal: STRUGGLED nuk e mban intervalin nën 1 ditë', async () => {
    seed(baseRecord({ intervalDays: 0.5 }));
    const r = await processReviewResult('1:1', 'STRUGGLED', []);
    // 0.5 * 1.2 = 0.6 → max(1, 0.6) = 1
    expect(r.intervalDays).toBe(1);
  });
});

describe('Regjistri i ri (ajet që nuk ekziston ende)', () => {
  it('KNEW: krijohet LEARNING me interval 1*ease, ease +0.05, strength nga intervali', async () => {
    const before = Date.now();
    const r = await processReviewResult('2:255', 'KNEW', [3], 4);
    expect(r.ayahKey).toBe('2:255');
    expect(r.status).toBe('LEARNING');
    expect(r.easeFactor).toBe(2.55); // 2.5 + 0.05
    expect(r.intervalDays).toBe(2.5); // max(1, 1 * 2.5)
    expect(r.repetitions).toBe(1);
    expect(r.lapses).toBe(0);
    expect(r.strength).toBe(11); // floor(2.5 / 21 * 100)
    expect(r.totalListens).toBe(4);
    expect(r.stumblePoints).toEqual([3]);
    expect(r.dueDate).toBeGreaterThanOrEqual(before + 2.5 * DAY - 5000);
    expect(r.dueDate).toBeLessThan(before + 2.5 * DAY + DAY);
  });

  it('FORGOT: krijohet LEARNING me interval 1, ease 2.3, lapses 1, strength 4', async () => {
    const r = await processReviewResult('114:6', 'FORGOT', []);
    expect(r.status).toBe('LEARNING');
    expect(r.intervalDays).toBe(1);
    expect(r.easeFactor).toBe(2.3); // 2.5 - 0.20
    expect(r.lapses).toBe(1);
    expect(r.repetitions).toBe(0);
    expect(r.strength).toBe(4); // floor(1 / 21 * 100)
  });

  it('STRUGGLED: interval 1.2, ease 2.45, rep 0, status LEARNING, strength 5', async () => {
    const r = await processReviewResult('112:1', 'STRUGGLED', []);
    expect(r.intervalDays).toBe(1.2); // max(1, 1 * 1.2)
    expect(r.easeFactor).toBeCloseTo(2.45, 9);
    expect(r.repetitions).toBe(0);
    expect(r.lapses).toBe(0);
    expect(r.status).toBe('LEARNING');
    expect(r.strength).toBe(5); // floor(1.2 / 21 * 100)
  });
});

describe('Gjurmëzgjatja e KNEW (shpina e algoritmit — e pin-kuar saktë)', () => {
  it('5 KNEW nga zero: intervali rritet me faktorin e lehtësisë, statusi kalon LEARNING→REVIEWING→CONSOLIDATED', async () => {
    const intervals: number[] = [];
    const eases: number[] = [];
    const reps: number[] = [];
    const statuses: string[] = [];
    for (let i = 0; i < 5; i++) {
      const r = await processReviewResult('53:23', 'KNEW', []);
      intervals.push(r.intervalDays);
      eases.push(r.easeFactor);
      reps.push(r.repetitions);
      statuses.push(r.status);
    }
    // intervali: 1 → 2.5 → 6.375 → 16.575 → 43.92375 → 118.594125
    expect(intervals[0]).toBe(2.5);
    expect(intervals[1]).toBeCloseTo(6.375, 6);
    expect(intervals[2]).toBeCloseTo(16.575, 6);
    expect(intervals[3]).toBeCloseTo(43.92375, 6);
    expect(intervals[4]).toBeCloseTo(118.594125, 6);
    // ease: 2.5 → 2.55 → 2.6 → 2.65 → 2.7 → 2.75
    expect(eases[0]).toBeCloseTo(2.55, 9);
    expect(eases[1]).toBeCloseTo(2.6, 9);
    expect(eases[2]).toBeCloseTo(2.65, 9);
    expect(eases[3]).toBeCloseTo(2.7, 9);
    expect(eases[4]).toBeCloseTo(2.75, 9);
    // rep: 1..5
    expect(reps).toEqual([1, 2, 3, 4, 5]);
    // status: te rep 3 → REVIEWING; te interval >= 21 (hapja 4) → CONSOLIDATED
    expect(statuses).toEqual(['LEARNING', 'LEARNING', 'REVIEWING', 'CONSOLIDATED', 'CONSOLIDATED']);
  });

  it('KNEW e 6-ta dhe e 7-ta: intervali kufizohet te 180, ease te 2.8, statusi mbetet CONSOLIDATED', async () => {
    for (let i = 0; i < 6; i++) await processReviewResult('53:24', 'KNEW', []);
    const r = await processReviewResult('53:24', 'KNEW', []);
    expect(r.intervalDays).toBe(180);
    expect(r.easeFactor).toBe(2.8);
    expect(r.status).toBe('CONSOLIDATED');
    expect(r.strength).toBe(100);
  });
});

describe('STRUGGLED: shtyhet intervali, nuk bie statusi', () => {
  it('nga REVIEWING (interval < 21): statusi MBETEJ REVIEWING, rep resetohet në 0', async () => {
    seed(baseRecord({ status: 'REVIEWING', intervalDays: 10, easeFactor: 2.5, repetitions: 3 }));
    const r = await processReviewResult('1:1', 'STRUGGLED', []);
    expect(r.intervalDays).toBe(12); // 10 * 1.2
    expect(r.easeFactor).toBeCloseTo(2.45, 9);
    expect(r.repetitions).toBe(0);
    expect(r.lapses).toBe(0);
    expect(r.status).toBe('REVIEWING'); // vetëm FORGOT e bie te LEARNING
    expect(r.strength).toBe(57); // floor(12 / 21 * 100)
  });

  it('nga CONSOLIDATED: statusi MBETEJ CONSOLIDATED (demovimi vetëm me FORGOT)', async () => {
    seed(baseRecord({ status: 'CONSOLIDATED', intervalDays: 40, easeFactor: 2.5, repetitions: 10, lapses: 0 }));
    const r = await processReviewResult('1:1', 'STRUGGLED', []);
    expect(r.status).toBe('CONSOLIDATED');
    expect(r.repetitions).toBe(0);
    expect(r.intervalDays).toBe(48); // 40 * 1.2
  });
});

describe('FORGOT: demovimi i fortë', () => {
  it('nga CONSOLIDATED: bie te LEARNING, interval 1, lapses +1, rep 0', async () => {
    seed(baseRecord({ status: 'CONSOLIDATED', intervalDays: 60, easeFactor: 2.5, repetitions: 10, lapses: 0 }));
    const r = await processReviewResult('1:1', 'FORGOT', []);
    expect(r.status).toBe('LEARNING');
    expect(r.intervalDays).toBe(1);
    expect(r.lapses).toBe(1);
    expect(r.repetitions).toBe(0);
    expect(r.easeFactor).toBe(2.3);
    expect(r.strength).toBe(4);
  });

  it('lapses > 1 bllokon kalimin te CONSOLIDATED (edhe me interval >= 21)', async () => {
    seed(baseRecord({ status: 'LEARNING', intervalDays: 1, easeFactor: 2.5, repetitions: 0, lapses: 2, strength: 4 }));
    let r = await processReviewResult('1:1', 'KNEW', []);
    expect(r.status).toBe('LEARNING');
    r = await processReviewResult('1:1', 'KNEW', []);
    expect(r.status).toBe('LEARNING');
    r = await processReviewResult('1:1', 'KNEW', []);
    expect(r.status).toBe('REVIEWING'); // rep 3
    // intervali kalon 21, por lapses = 2 > 1 → SË PAKTEN CONSOLIDATED
    r = await processReviewResult('1:1', 'KNEW', []);
    expect(r.intervalDays).toBeCloseTo(43.92375, 6);
    expect(r.status).toBe('REVIEWING');
  });
});

describe('Fushat e ndihmëse: dueDate, totalListens, stumblePoints', () => {
  it('dueDate = now + intervalDays (ri-llogaritet në çdo rishikim)', async () => {
    const before = Date.now();
    const r = await processReviewResult('1:1', 'KNEW', []);
    expect(r.dueDate).toBeGreaterThanOrEqual(before + 2.5 * DAY);
    expect(r.dueDate).toBeLessThan(before + 2.5 * DAY + DAY);
  });

  it('STRUGGLED nga 10 ditë: dueDate = now + 12 ditë', async () => {
    seed(baseRecord({ intervalDays: 10 }));
    const before = Date.now();
    const r = await processReviewResult('1:1', 'STRUGGLED', []);
    expect(r.dueDate).toBeGreaterThanOrEqual(before + 12 * DAY);
    expect(r.dueDate).toBeLessThan(before + 12 * DAY + DAY);
  });

  it('totalListens accumulon mbi ekzistuesin; stumblePoints = bashkimi pa dublikime', async () => {
    seed(baseRecord({ totalListens: 7, stumblePoints: [1, 2] }));
    const r = await processReviewResult('1:1', 'KNEW', [2, 3], 5);
    expect(r.totalListens).toBe(12);
    expect(r.stumblePoints).toEqual([1, 2, 3]);
  });
});

describe('getReviewQueue — ADAPTIVE (burimi i butonit "Rishiko")', () => {
  it('kthen vetëm ajetet due (dueDate <= now), renditur nga më e vjetra', async () => {
    const now = Date.now();
    seed(baseRecord({ ayahKey: '2:1', dueDate: now + DAY })); // NUK eshte due
    seed(baseRecord({ ayahKey: '1:2', dueDate: now - 2 * DAY })); // më e vjetra
    seed(baseRecord({ ayahKey: '1:1', dueDate: now - DAY })); // e mesme
    seed(baseRecord({ ayahKey: '3:1', dueDate: now })); // kufi: due saktësisht tani
    const q = await getReviewQueue('ADAPTIVE');
    expect(q.map(r => r.ayahKey)).toEqual(['1:2', '1:1', '3:1']);
  });
});

describe('getReviewQueue — WEEKLY_MANZIL (rruga e vërtetë e rishikimit javor)', () => {
  it('MANZIL_STARTS: 7 manzilët me sure e fillimit të sakta', () => {
    expect(MANZIL_STARTS.map(m => m.surah)).toEqual([1, 5, 10, 17, 26, 37, 50]);
  });

  it('dita e javës → manzili (e premte→1-4, e shtunë→5-9, ..., e enjte→50-114), pa filtrim dueDate', async () => {
    const farFuture = Date.now() + 100 * DAY;
    seed(baseRecord({ ayahKey: '2:1', dueDate: farFuture })); // manzil 1, due e vonuar
    seed(baseRecord({ ayahKey: '7:1', dueDate: farFuture })); // manzil 2, due e vonuar
    seed(baseRecord({ ayahKey: '114:6', dueDate: farFuture })); // manzil 7, due e vonuar

    const cases: Array<[string, string[]]> = [
      ['2026-09-04', ['2:1']], // e premte → manzil 1 (1-4)
      ['2026-09-05', ['7:1']], // e shtunë → manzil 2 (5-9)
      ['2026-09-06', []], // e diel → manzil 3 (10-16)
      ['2026-09-07', []], // e hënë → manzil 4 (17-25)
      ['2026-09-08', []], // e martë → manzil 5 (26-36)
      ['2026-09-09', []], // e mërkurë → manzil 6 (37-49)
      ['2026-09-10', ['114:6']], // e enjte → manzil 7 (50-114)
    ];
    for (const [date, expected] of cases) {
      vi.setSystemTime(new Date(`${date}T12:00:00`));
      const q = await getReviewQueue('WEEKLY_MANZIL');
      expect(q.map(r => r.ayahKey)).toEqual(expected);
    }

    // Rishikimi manzil është sipas dates së javës — ajetet me due të vonuar
    // i përfshihen qëllimisht (dizajn i konfirmuar, jo bug).
    vi.setSystemTime(new Date('2026-09-04T12:00:00'));
    const q = await getReviewQueue('WEEKLY_MANZIL');
    expect(q[0].dueDate).toBeGreaterThan(Date.now());
  });

  it('renditja brenda manzilit: sipas sure, pastaj sipas ajetit', async () => {
    vi.setSystemTime(new Date('2026-09-04T12:00:00')); // e premte → sure 1-4
    seed(baseRecord({ ayahKey: '3:10' }));
    seed(baseRecord({ ayahKey: '2:5' }));
    seed(baseRecord({ ayahKey: '1:1' }));
    seed(baseRecord({ ayahKey: '3:2' }));
    const q = await getReviewQueue('WEEKLY_MANZIL');
    expect(q.map(r => r.ayahKey)).toEqual(['1:1', '2:5', '3:2', '3:10']);
  });
});
