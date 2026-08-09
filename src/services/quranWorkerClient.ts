/**
 * Quran Worker Client Service
 * Bridges React UI components with the Quran Search Web Worker.
 * Ensures search executes off the main UI thread with fallback for test environments.
 */
import { SearchFilter, SearchResponse } from '../workers/quranSearchWorker';
import { executeQuranSearch } from './quranSearchEngine';
import { QuranNote } from '../types';

let workerInstance: Worker | null = null;
let pendingListeners: Map<number, (response: SearchResponse) => void> = new Map();

function getWorkerInstance(): Worker | null {
 if (typeof window === 'undefined' || typeof Worker === 'undefined') {
 return null;
 }
 if (!workerInstance) {
 try {
 workerInstance = new Worker(
 new URL('../workers/quranSearchWorker.ts', import.meta.url),
 { type: 'module' }
 );

 workerInstance.onmessage = (e: MessageEvent) => {
 const { type, requestId, response } = e.data || {};
 if (type === 'SEARCH_RESPONSE' && typeof requestId === 'number') {
 const callback = pendingListeners.get(requestId);
 if (callback) {
 callback(response);
 pendingListeners.delete(requestId);
 }
 }
 };

 workerInstance.onerror = (err) => {
 console.warn('Quran Search Worker error, falling back to main thread:', err);
 };
 } catch (err) {
 console.warn('Could not instantiate Web Worker, using main thread fallback:', err);
 workerInstance = null;
 }
 }
 return workerInstance;
}

/**
 * Dispatches a search request to the Web Worker (or main thread fallback)
 */
export async function searchQuranWithWorker(
 requestId: number,
 query: string,
 filter: SearchFilter,
 userBookmarks: { surahNumber: number; ayahNumber: number }[],
 userNotes: QuranNote[]
): Promise<SearchResponse> {
 const worker = getWorkerInstance();

 if (!worker) {
 // Fallback for test runner or environments without Web Worker support
 return executeQuranSearch(query, filter, userBookmarks, userNotes);
 }

 return new Promise<SearchResponse>((resolve) => {
 // Register callback for this requestId
 pendingListeners.set(requestId, (response) => {
 resolve(response);
 });

 // Send message to worker
 worker.postMessage({
 type: 'SEARCH_REQUEST',
 requestId,
 query,
 filter,
 userBookmarks,
 userNotes
 });
 });
}

/**
 * Terminates the Web Worker (used during unmount or reset)
 */
export function terminateQuranWorker(): void {
 if (workerInstance) {
 workerInstance.terminate();
 workerInstance = null;
 }
 pendingListeners.clear();
}
