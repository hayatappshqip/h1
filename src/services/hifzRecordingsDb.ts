import Dexie, { Table } from 'dexie';

export interface AyahRecording {
 id?: string;
 ayahKey: string; // "114:1"
 timestamp: number;
 blob: Blob;
}

export class HifzRecordingsDatabase extends Dexie {
 recordings!: Table<AyahRecording, string>;

 constructor() {
 super('HayatHifzRecordingsDb');
 this.version(1).stores({
 recordings: '++id, ayahKey, timestamp' // Note: ++id doesn't work well with strings, let's use string id but no auto-increment, or just use string id
 });
 }
}

export const hifzRecordingsDb = new HifzRecordingsDatabase();

export async function saveRecording(ayahKey: string, blob: Blob) {
 const id = `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
 const timestamp = Date.now();
 
 await hifzRecordingsDb.recordings.add({
 id,
 ayahKey,
 timestamp,
 blob
 });

 // keep only the last 3 recordings per ayah
 const allForAyah = await hifzRecordingsDb.recordings
 .where('ayahKey').equals(ayahKey)
 .sortBy('timestamp');
 
 if (allForAyah.length > 3) {
 const toDelete = allForAyah.slice(0, allForAyah.length - 3);
 for (const rec of toDelete) {
 if (rec.id) await hifzRecordingsDb.recordings.delete(rec.id);
 }
 }
}

export async function getRecordings(ayahKey: string): Promise<AyahRecording[]> {
 return await hifzRecordingsDb.recordings
 .where('ayahKey').equals(ayahKey)
 .sortBy('timestamp');
}

export async function deleteRecording(id: string) {
 await hifzRecordingsDb.recordings.delete(id);
}
