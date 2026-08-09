import { hifzDb, AyahMemorizationRecord, ReviewResult } from './hifzDb';

const MIN_EASE = 1.3;
const MAX_EASE = 2.8;
const MAX_INTERVAL = 180;

export async function processReviewResult(
 ayahKey: string,
 result: ReviewResult,
 stumblePoints: number[],
 listens: number = 0
): Promise<AyahMemorizationRecord> {
 const record = await hifzDb.ayahRecords.get(ayahKey);
 const now = Date.now();

 let nextRecord: AyahMemorizationRecord;

 if (!record) {
 nextRecord = {
 ayahKey,
 status: 'LEARNING',
 strength: 0,
 easeFactor: 2.5,
 intervalDays: 1,
 dueDate: now + 24 * 60 * 60 * 1000,
 repetitions: 0,
 lapses: 0,
 lastReviewedAt: now,
 lastResult: result,
 totalListens: listens,
 stumblePoints,
 createdAt: now,
 };
 } else {
 nextRecord = { ...record };
 nextRecord.totalListens += listens;
 }

 nextRecord.lastReviewedAt = now;
 nextRecord.lastResult = result;
 nextRecord.stumblePoints = Array.from(new Set([...nextRecord.stumblePoints, ...stumblePoints]));

 // SM-2 logic
 if (result === 'FORGOT') {
 nextRecord.intervalDays = 1;
 nextRecord.easeFactor = Math.max(MIN_EASE, nextRecord.easeFactor - 0.20);
 nextRecord.lapses += 1;
 nextRecord.repetitions = 0; // Reset consecutive KNEWs
 } else if (result === 'STRUGGLED') {
 nextRecord.intervalDays = Math.min(MAX_INTERVAL, Math.max(1, nextRecord.intervalDays * 1.2));
 nextRecord.easeFactor = Math.max(MIN_EASE, nextRecord.easeFactor - 0.05);
 nextRecord.repetitions = 0; // Reset consecutive KNEWs
 } else if (result === 'KNEW') {
 nextRecord.intervalDays = Math.min(MAX_INTERVAL, Math.max(1, nextRecord.intervalDays * nextRecord.easeFactor));
 nextRecord.easeFactor = Math.min(MAX_EASE, nextRecord.easeFactor + 0.05);
 nextRecord.repetitions += 1;
 }

 // Status transitions
 if (result === 'FORGOT') {
 nextRecord.status = 'LEARNING';
 } else {
 if (nextRecord.status === 'LEARNING' && nextRecord.repetitions >= 3) {
 nextRecord.status = 'REVIEWING';
 }
 
 if (nextRecord.status === 'REVIEWING' && nextRecord.intervalDays >= 21 && nextRecord.lapses <= 1) {
 nextRecord.status = 'CONSOLIDATED';
 }
 }

 nextRecord.dueDate = now + nextRecord.intervalDays * 24 * 60 * 60 * 1000;
 nextRecord.strength = Math.min(100, Math.floor((nextRecord.intervalDays / 21) * 100));

 await hifzDb.ayahRecords.put(nextRecord);
 return nextRecord;
}

export type ReviewMode = 'ADAPTIVE' | 'WEEKLY_MANZIL' | 'MONTHLY_JUZ';

// The seven Manzils (approximate start surahs/ayahs)
// 1: 1-4, 2: 5-9, 3: 10-16, 4: 17-25, 5: 26-36, 6: 37-49, 7: 50-114
export const MANZIL_STARTS = [
 { surah: 1, ayah: 1 },
 { surah: 5, ayah: 1 },
 { surah: 10, ayah: 1 },
 { surah: 17, ayah: 1 },
 { surah: 26, ayah: 1 },
 { surah: 37, ayah: 1 },
 { surah: 50, ayah: 1 },
];

export async function getReviewQueue(mode: ReviewMode = 'ADAPTIVE'): Promise<AyahMemorizationRecord[]> {
 const allRecords = await hifzDb.ayahRecords.toArray();
 const now = Date.now();

 if (mode === 'ADAPTIVE') {
 // Only return ayahs that are due
 return allRecords.filter(r => r.dueDate <= now).sort((a, b) => a.dueDate - b.dueDate);
 }

 if (mode === 'WEEKLY_MANZIL') {
 const todayDayOfWeek = new Date().getDay(); // 0 = Sunday, 1 = Monday ...
 // Manzil index (0-6). Let's map Friday (5) to Manzil 1 (0)? Or just use todayDayOfWeek % 7.
 // Standard is usually starting on Friday.
 const manzilIndex = (todayDayOfWeek + 2) % 7; // e.g. Friday -> 0
 const startSurah = MANZIL_STARTS[manzilIndex].surah;
 const endSurah = manzilIndex === 6 ? 114 : MANZIL_STARTS[manzilIndex + 1].surah - 1;

 return allRecords.filter(r => {
 const [s] = r.ayahKey.split(':').map(Number);
 return s >= startSurah && s <= endSurah;
 }).sort((a, b) => {
 const [sA, ayA] = a.ayahKey.split(':').map(Number);
 const [sB, ayB] = b.ayahKey.split(':').map(Number);
 return sA !== sB ? sA - sB : ayA - ayB;
 });
 }

 if (mode === 'MONTHLY_JUZ') {
 const todayDayOfMonth = new Date().getDate(); 
 const juzIndex = Math.min(30, todayDayOfMonth); // 1 to 30
 // A mapping of Juz to Surah is complex without the full data.
 // For now, we will sort all records and split them into 30 chunks evenly 
 // or just rely on a juz mapper if available. Since juz limits aren't in this file,
 // we'll filter by due date as fallback or need a Juz map.
 // Since we don't have Juz data, let's just use the adaptive for now or dummy implementation.
 
 // We can assume juz ends approximately every 114/30 surahs (very inaccurate).
 // Let's just return a placeholder logic: sort all memorized ayahs, divide into 30 buckets.
 const sorted = allRecords.sort((a, b) => {
 const [sA, ayA] = a.ayahKey.split(':').map(Number);
 const [sB, ayB] = b.ayahKey.split(':').map(Number);
 return sA !== sB ? sA - sB : ayA - ayB;
 });
 
 const chunkSize = Math.ceil(sorted.length / 30);
 const startIndex = (juzIndex - 1) * chunkSize;
 return sorted.slice(startIndex, startIndex + chunkSize);
 }

 return [];
}
