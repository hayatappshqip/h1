import { fetchQuranPageData } from './netlify/functions/quran-page.ts';

async function run() {
  const p599 = await fetchQuranPageData("599");
  const p600 = await fetchQuranPageData("600");
  const p601 = await fetchQuranPageData("601");
  
  // Simulation of normalizeRawVerses for page 600
  const raw = [...(p599.data?.verses || []), ...(p600.data?.verses || []), ...(p601.data?.verses || [])];
  
  const byVerseKey = new Map();
  const seenWords = new Set();
  
  for (const verse of raw) {
    const chapterId = verse.chapter_id;
    const verseNumber = verse.verse_number;
    const verseKey = verse.verse_key;
    
    for (const w of verse.words) {
      if (w.v2_page !== 600) continue; // Route to page 600
      
      const dedupeKey = `${chapterId}:${verseNumber}:${w.position}`;
      if (seenWords.has(dedupeKey)) continue;
      seenWords.add(dedupeKey);
      
      if (!byVerseKey.has(verseKey)) {
        byVerseKey.set(verseKey, { verse_key: verseKey, words: [] });
      }
      byVerseKey.get(verseKey).words.push(w);
    }
  }
  
  const verses = Array.from(byVerseKey.values());
  for (const v of verses) {
    console.log(`${v.verse_key}: ${v.words.length} words mapped to page 600`);
  }
}
run();
