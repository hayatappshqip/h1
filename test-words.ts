import { fetchQuranPageData } from './netlify/functions/quran-page.ts';

async function run() {
  const p599 = await fetchQuranPageData("599");
  
  const v100_6 = p599.data.verses.find(v => v.verse_key === '100:6');
  if (v100_6) {
    console.log("100:6 Words v2_page:");
    v100_6.words.forEach(w => console.log(`  ${w.code_v2} -> v2_page: ${w.v2_page}`));
  }
}
run();
