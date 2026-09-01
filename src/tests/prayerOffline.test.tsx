/**
 * @vitest-environment jsdom
 *
 * Namazi — N1 dhe N2 (docs/namazi-audit.md)
 *
 * N1: kur nuk ka internet, kodi kthente një listë orësh TË SHKRUARA PËRGJITHMONË
 *     në kod, të njëjta çdo ditë të vitit. Në janar gabimi arrinte 3 orë e 20 min.
 * N2: ato vlera të shpikura ruheshin në localStorage me të njëjtin çelës si vlerat
 *     reale, pa asnjë shenjë dalluese. Një ditë pa internet e prishte atë ditë
 *     PËRGJITHMONË — edhe pas rikthimit të lidhjes.
 *
 * Këto teste e mbërthejnë sjelljen e re: pa internet nuk shpiket asgjë.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

import { getPrayerTimes, DEFAULT_PRAYER_SETTINGS } from '../services/prayerEngine';
import type { PrayerSettings } from '../types';

// Orët e shpikura që kodi i kthente më parë kur nuk kishte internet.
// Nëse ndonjëra prej tyre shfaqet sërish, N1 është kthyer.
const ORËT_E_SHPIKURA = ['04:15', '05:45', '12:45', '16:30', '19:45', '21:15', '23:50'];

// Përgjigje reale nga AlAdhan për Tiranën, 1 janar 2026 (verifikuar kundër KMSH).
const ALADHAN_TIRANA_2026_01_01 = {
  data: {
    timings: {
      Fajr: '05:27',
      Sunrise: '07:00',
      Dhuhr: '11:49',
      Asr: '14:08',
      Maghrib: '16:29',
      Isha: '17:56',
      Imsak: '05:17',
      Midnight: '23:44'
    }
  }
};

const TIRANA: PrayerSettings = { ...DEFAULT_PRAYER_SETTINGS };

function mockFetchSucceeds(payload: unknown = ALADHAN_TIRANA_2026_01_01) {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    json: async () => payload
  })));
}

function mockFetchOffline() {
  // Simulon gjendjen reale: fetch hidhni gabim kur nuk ka lidhje.
  vi.stubGlobal('fetch', vi.fn(async () => {
    throw new Error('Failed to fetch');
  }));
}

function cachedEntries(): string[] {
  const out: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith('prayer_times_')) out.push(k);
  }
  return out;
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('N1 — pa internet nuk shpiken orë', () => {
  it('kthen vlerat reale kur AlAdhan përgjigjet', async () => {
    mockFetchSucceeds();

    const times = await getPrayerTimes('2026-01-01', TIRANA);

    expect(times).not.toBeNull();
    expect(times?.fajr).toBe('05:27');
    expect(times?.maghrib).toBe('16:29');
    expect(times?.isha).toBe('17:56');
  });

  it('kthen null — jo orë të shpikura — kur nuk ka internet', async () => {
    mockFetchOffline();

    const times = await getPrayerTimes('2026-01-01', TIRANA);

    expect(times).toBeNull();
  });

  it('asnjë orë e shpikur nuk del kurrë pa internet', async () => {
    mockFetchOffline();

    const times = await getPrayerTimes('2026-01-15', TIRANA);

    const serialized = JSON.stringify(times ?? {});
    for (const orë of ORËT_E_SHPIKURA) {
      expect(
        serialized.includes(orë),
        `Ora e shpikur ${orë} u shfaq sërish — N1 është kthyer.serialized=${serialized}`
      ).toBe(false);
    }
  });

  it('kthen null edhe kur përgjigja nuk është e vlefshme (HTTP 500)', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) })));

    const times = await getPrayerTimes('2026-01-01', TIRANA);

    expect(times).toBeNull();
  });

  it('kthen null edhe kur përgjigja është e cunguar (mungon timings)', async () => {
    mockFetchSucceeds({ data: {} });

    const times = await getPrayerTimes('2026-01-01', TIRANA);

    expect(times).toBeNull();
  });
});

describe('N2 — vlerat e pasigurta nuk futen kurrë në kujtesë', () => {
  it('nuk shkruan asgjë në kujtesë kur nuk ka internet', async () => {
    mockFetchOffline();

    await getPrayerTimes('2026-01-01', TIRANA);

    expect(cachedEntries()).toHaveLength(0);
  });

  it('një ditë pa internet NUK e prish atë ditë përgjithmonë', async () => {
    // Hapi 1: pa internet
    mockFetchOffline();
    const offline = await getPrayerTimes('2026-01-01', TIRANA);
    expect(offline).toBeNull();

    // Hapi 2: interneti rikthehet — duhet të marrë vlerat reale,
    // jo të mbetet i helmuar nga hera e parë.
    mockFetchSucceeds();
    const online = await getPrayerTimes('2026-01-01', TIRANA);

    expect(online?.fajr).toBe('05:27');
    expect(online?.maghrib).toBe('16:29');
  });

  it('i ruan vlerat reale kur AlAdhan përgjigjet', async () => {
    mockFetchSucceeds();

    await getPrayerTimes('2026-01-01', TIRANA);

    expect(cachedEntries()).toHaveLength(1);
  });

  it('kur ka internet, vlera e ruajtur lexohet dhe nuk bëhet kërkesë e re', async () => {
    mockFetchSucceeds();
    await getPrayerTimes('2026-01-01', TIRANA);

    mockFetchOffline();
    const ngaKujtesa = await getPrayerTimes('2026-01-01', TIRANA);

    expect(ngaKujtesa?.fajr).toBe('05:27');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('një hyrje e vjetër e helmuar (çelësi i mëparshëm) nuk lexohet më', async () => {
    // Ky është çelësi i vjetër, pa version — aty ku mund të ishte ruajtur
    // një vlerë e shpikur para rregullimit.
    const çelësiIVjetër =
      `prayer_times_2026-01-01_${TIRANA.latitude}_${TIRANA.longitude}_${TIRANA.method}_${TIRANA.asrSchool}`;
    localStorage.setItem(çelësiIVjetër, JSON.stringify({
      date: '2026-01-01',
      imsak: '04:05',
      fajr: '04:15',
      sunrise: '05:45',
      dhuhr: '12:45',
      asr: '16:30',
      maghrib: '19:45',
      isha: '21:15',
      midnight: '23:50'
    }));

    mockFetchOffline();
    const times = await getPrayerTimes('2026-01-01', TIRANA);

    expect(times).toBeNull();
  });

  it('një hyrje e ruajtur pa imsak normalizohet si Fajr − 10', async () => {
    mockFetchSucceeds({
      data: {
        timings: {
          Fajr: '05:27',
          Sunrise: '07:00',
          Dhuhr: '11:49',
          Asr: '14:08',
          Maghrib: '16:29',
          Isha: '17:56',
          Midnight: '23:44'
          // Imsak mungon qëllimisht
        }
      }
    });

    const times = await getPrayerTimes('2026-01-01', TIRANA);

    expect(times?.fajr).toBe('05:27');
    expect(times?.imsak).toBe('05:17');
  });

  it('korrigjimet me dorë zbatohen edhe mbi vlerat reale', async () => {
    mockFetchSucceeds();
    const meKorrigjim: PrayerSettings = {
      ...TIRANA,
      manualAdjustments: { ...TIRANA.manualAdjustments, maghrib: 3 }
    };

    const times = await getPrayerTimes('2026-01-01', meKorrigjim);

    expect(times?.maghrib).toBe('16:32');
  });
});

describe('UI — Namazi tregon qartë kur orët nuk janë të disponueshme', () => {
  const NamaziView = async () => (await import('../components/NamaziView')).NamaziView;

  const propsBazë = {
    prayerSettings: TIRANA,
    prayerLogs: [],
    onTogglePrayerLog: () => {},
    onSavePostPrayerDhikr: () => {}
  };

  it('kur orët mungojnë, shfaqet një mesazh — jo një listë bosh', async () => {
    const Namazi = await NamaziView();

    render(<Namazi {...propsBazë} prayerTimes={null} />);

    expect(
      screen.getByText(/nuk janë të disponueshme/i),
      'NamaziView duhet të shpjegojë pse lista është bosh'
    ).toBeTruthy();
  });

  it('mesazhi nuk shfaqet kur orët janë të pranishme', async () => {
    const Namazi = await NamaziView();

    render(
      <Namazi
        {...propsBazë}
        prayerTimes={{
          date: '2026-01-01',
          imsak: '05:17',
          fajr: '05:27',
          sunrise: '07:00',
          dhuhr: '11:49',
          asr: '14:08',
          maghrib: '16:29',
          isha: '17:56',
          midnight: '23:44'
        }}
      />
    );

    expect(screen.queryByText(/nuk janë të disponueshme/i)).toBeNull();
    expect(screen.getByText('05:27')).toBeTruthy();
  });
});
