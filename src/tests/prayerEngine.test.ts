import { describe, it, expect } from 'vitest';
import { getNextPrayer } from '../services/prayerEngine';
import { PrayerTimes } from '../types';

describe('Prayer Engine Countdown Tests', () => {
 it('verifies minutesRemaining is ALWAYS > 0 and < 1440 across all 1440 minutes of the day', () => {
 const times: PrayerTimes = {
 date: '2026-08-06',
 imsak: '03:41',
 fajr: '03:51',
 sunrise: '05:26',
 dhuhr: '12:52',
 asr: '16:45',
 maghrib: '19:59',
 isha: '21:34',
 midnight: '23:59'
 };

 for (let m = 0; m < 1440; m++) {
 const hours = Math.floor(m / 60);
 const mins = m % 60;
 const testDate = new Date(2026, 7, 6, hours, mins, 0);

 const result = getNextPrayer(times, testDate);

 expect(
 result.minutesRemaining,
 `Failed at time ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} (minute ${m})`
 ).toBeGreaterThan(0);

 expect(
 result.minutesRemaining,
 `Failed at time ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} (minute ${m})`
 ).toBeLessThan(1440);
 }
 });
});
