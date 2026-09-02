/**
 * Prayer Engine & Qibla Calculation
 * Preset Default: Tirana (41.3275° N, 19.8187° E)
 * AlAdhan API + Offline Resilience Math Fallback
 */
import { PrayerTimes, PrayerSettings, PrayerName } from '../types';

export const DEFAULT_PRAYER_SETTINGS: PrayerSettings = {
 locationName: 'Tiranë, Shqipëri',
 latitude: 41.3275,
 longitude: 19.8187,
 method: 13, // Diyanet / European Standard
 asrSchool: 'standard',
 manualAdjustments: {
 fajr: 0,
 sunrise: 0,
 dhuhr: 0,
 asr: 0,
 maghrib: 0,
 isha: 0
 },
 showKahfFriday: true,
 showSajdahMulkNight: true,
 notificationsEnabled: false,
 notifyMinutesBefore: 15,
 notifyPrayers: {
 imsak: true,
 fajr: true,
 sunrise: false,
 dhuhr: true,
 asr: true,
 maghrib: true,
 isha: true
 },
 dhikrHapticEnabled: true,
 dhikrSoundEnabled: true
};

// Kaaba Coordinates
const MECCA_LAT = 21.4225;
const MECCA_LNG = 39.8262;

export function calculateQiblaBearing(lat: number, lng: number): number {
 const phi1 = (lat * Math.PI) / 180;
 const phi2 = (MECCA_LAT * Math.PI) / 180;
 const deltaLambda = ((MECCA_LNG - lng) * Math.PI) / 180;

 const y = Math.sin(deltaLambda);
 const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

 let bearing = (Math.atan2(y, x) * 180) / Math.PI;
 return (bearing + 360) % 360;
}

// Convert "HH:mm" to minutes since midnight
export function timeToMinutes(timeStr: string): number {
 if (!timeStr) return 0;
 const parts = timeStr.trim().split(':');
 if (parts.length < 2) return 0;
 const hours = parseInt(parts[0], 10) || 0;
 const mins = parseInt(parts[1], 10) || 0;
 return hours * 60 + mins;
}

// Helper: Format minutes to "HH:mm"
export function minutesToTime(totalMins: number): string {
 const normalized = (totalMins + 1440) % 1440;
 const h = Math.floor(normalized / 60);
 const m = Math.floor(normalized % 60);
 return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Merr oraret e namazit për një datë.
 *
 * Kthen `null` kur oraret nuk mund të merren nga një burim i besueshëm — pa
 * internet, ose me përgjigje të pavlefshme. Të tre ekranet që i përdorin
 * (NamaziView, HomeView, DitaImeView) kanë tashmë degë për këtë rast.
 *
 * KJO ËSHTË ME QËLLIM. Më parë ky funksion kthente një listë orësh të shkruara
 * përgjithmonë në kod kur nuk kishte internet: të njëjta çdo ditë të vitit, me
 * gabim deri 3 orë e 20 minuta në janar (Akshami 19:45 kur ishte 16:28). Dhe i
 * ruante ato në localStorage me të njëjtin çelës si vlerat reale, pa asnjë
 * shenjë dalluese — pra një ditë e vetme pa internet e prishiste atë ditë
 * PËRGJITHMONË, edhe pas rikthimit të lidhjes.
 * Shih docs/namazi-audit.md, gjetjet N1 dhe N2.
 */
export async function getPrayerTimes(dateStr: string, settings: PrayerSettings): Promise<PrayerTimes | null> {
 // Çelësi mban versionin v2. Çelësi i vjetër (pa version) mund të përmbajë vlera
 // të shpikura të ruajtura para rregullimit; duke e ndryshuar çelësin ato hyrje
 // nuk lexohen më kurrë. Ky është riparimi për kujtesën tashmë të helmuar.
 const cacheKey = `prayer_times_v2_${dateStr}_${settings.latitude}_${settings.longitude}_${settings.method}_${settings.asrSchool}`;
 const cached = localStorage.getItem(cacheKey);
 if (cached) {
 try {
 const parsed = JSON.parse(cached);
 // Ensure Imsak normalization
 if (!parsed.imsak && parsed.fajr) {
 parsed.imsak = minutesToTime(timeToMinutes(parsed.fajr) - 10);
 }
 return parsed;
 } catch (e) {
 // ignore
 }
 }

 try {
 const school = settings.asrSchool === 'hanafi' ? 1 : 0;
 const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${settings.method}&school=${school}`;
 const response = await fetch(url);
 if (response.ok) {
 const data = await response.json();
 const timings = data?.data?.timings;
 // Përgjigje e cunguar: trajtoje si dështim, mos vazhdo me vlera bosh.
 if (!timings) throw new Error('Përgjigja e AlAdhan nuk përmban timings');

 // AlAdhan returns "HH:mm"
 const fajr = timings.Fajr.split(' ')[0];
 let imsak = timings.Imsak ? timings.Imsak.split(' ')[0] : null;
 if (!imsak) {
 imsak = minutesToTime(timeToMinutes(fajr) - 10);
 }

 const adj = settings.manualAdjustments;
 const result: PrayerTimes = {
 date: dateStr,
 imsak: imsak,
 fajr: minutesToTime(timeToMinutes(fajr) + (adj.fajr || 0)),
 sunrise: minutesToTime(timeToMinutes(timings.Sunrise.split(' ')[0]) + (adj.sunrise || 0)),
 dhuhr: minutesToTime(timeToMinutes(timings.Dhuhr.split(' ')[0]) + (adj.dhuhr || 0)),
 asr: minutesToTime(timeToMinutes(timings.Asr.split(' ')[0]) + (adj.asr || 0)),
 maghrib: minutesToTime(timeToMinutes(timings.Maghrib.split(' ')[0]) + (adj.maghrib || 0)),
 isha: minutesToTime(timeToMinutes(timings.Isha.split(' ')[0]) + (adj.isha || 0)),
 midnight: timings.Midnight ? timings.Midnight.split(' ')[0] : '23:59'
 };

 localStorage.setItem(cacheKey, JSON.stringify(result));
 return result;
 }
 } catch (err) {
 console.warn('Oraret nuk u morën nga AlAdhan:', err);
 }

 // Pa internet ose me përgjigje të pavlefshme: NUK shpikim orë dhe NUK shkruajmë
 // asgjë në kujtesë. Më mirë boshllëk i ndershëm sesa numër i gabuar — veçanërisht
 // për namazin, ku një orë e gabuar prodhon një namaz të pavlefshëm.
 return null;
}

// Get current and next prayer info
export function getNextPrayer(times: PrayerTimes, now: Date = new Date()): { current: PrayerName; next: PrayerName; timeUntil: string; minutesRemaining: number } {
 const currentMins = now.getHours() * 60 + now.getMinutes();

 const schedule: { name: PrayerName; mins: number }[] = [
 { name: 'imsak', mins: timeToMinutes(times.imsak) },
 { name: 'fajr', mins: timeToMinutes(times.fajr) },
 { name: 'sunrise', mins: timeToMinutes(times.sunrise) },
 { name: 'dhuhr', mins: timeToMinutes(times.dhuhr) },
 { name: 'asr', mins: timeToMinutes(times.asr) },
 { name: 'maghrib', mins: timeToMinutes(times.maghrib) },
 { name: 'isha', mins: timeToMinutes(times.isha) }
 ];

 let current: PrayerName = 'isha';
 let next: PrayerName = 'imsak';
 let nextMins = schedule[0].mins;

 for (let i = 0; i < schedule.length; i++) {
 if (currentMins >= schedule[i].mins) {
 current = schedule[i].name;
 if (i < schedule.length - 1) {
 next = schedule[i + 1].name;
 nextMins = schedule[i + 1].mins;
 } else {
 next = 'imsak';
 nextMins = schedule[0].mins + 1440;
 }
 }
 }

 const diff = nextMins - currentMins;
 const hours = Math.floor(diff / 60);
 const mins = diff % 60;

 const timeUntil = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

 return { current, next, timeUntil, minutesRemaining: diff };
}

// Home suggestion windows logic
export interface ActiveSuggestionWindow {
 id: 'mengjesi' | 'mbremjes' | 'gjumi' | 'kahf' | 'sajdah-mulk';
 title: string;
 subtitle: string;
 chapterId: number;
 isRoutine: boolean;
}

export function getActiveSuggestions(
 times: PrayerTimes,
 settings: PrayerSettings,
 now: Date = new Date()
): ActiveSuggestionWindow[] {
 const currentMins = now.getHours() * 60 + now.getMinutes();
 const sunriseMins = timeToMinutes(times.sunrise);
 const dhuhrMins = timeToMinutes(times.dhuhr);
 const maghribMins = timeToMinutes(times.maghrib);
 const ishaMins = timeToMinutes(times.isha);
 const imsakMins = timeToMinutes(times.imsak);

 const suggestions: ActiveSuggestionWindow[] = [];

 // Mëngjesi window: 20 min para lindjes së diellit deri në Drekë
 const mengjesiStart = sunriseMins - 20;
 if (currentMins >= mengjesiStart && currentMins < dhuhrMins) {
 suggestions.push({
 id: 'mengjesi',
 title: 'Dhikri i Mëngjesit',
 subtitle: 'Koha e rekomanduar: Para ose pas Sabahut deri në drekë',
 chapterId: 27,
 isRoutine: true
 });
 }

 // Mbrëmja window: 20 min para Akshamit deri në mesnatë
 const mbremjaStart = maghribMins - 20;
 if (currentMins >= mbremjaStart || currentMins < imsakMins) {
 suggestions.push({
 id: 'mbremjes',
 title: 'Dhikri i Mbrëmjes',
 subtitle: 'Koha e rekomanduar: Pas ikindisë / akshamit deri në mesnatë',
 chapterId: 28,
 isRoutine: true
 });
 }

 // Gjumi window: Pas Jacisë deri në Imsak
 if (currentMins >= ishaMins || currentMins < imsakMins) {
 suggestions.push({
 id: 'gjumi',
 title: 'Dhikri para Gjumit',
 subtitle: 'Lutjet e verifikuara para se të biem në gjumë',
 chapterId: 29,
 isRoutine: true
 });

 if (settings.showSajdahMulkNight) {
 suggestions.push({
 id: 'sajdah-mulk',
 title: 'Leximi i Surjes Es-Sexhde & El-Mulk',
 subtitle: 'E sunetshme të lexohen çdo natë para gjumit',
 chapterId: 67, // Surah El-Mulk
 isRoutine: false
 });
 }
 }

 // El-Kehf on Friday: Të premten nga lindja e diellit deri para Akshamit
 const isFriday = now.getDay() === 5;
 if (isFriday && settings.showKahfFriday && currentMins >= sunriseMins && currentMins < maghribMins) {
 suggestions.push({
 id: 'kahf',
 title: 'Leximi i Surjes El-Kehf',
 subtitle: 'Trëndafili i ditës së Xhumasë',
 chapterId: 18,
 isRoutine: false
 });
 }

 return suggestions;
}
