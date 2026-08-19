import { fetchQuranPageData } from './netlify/functions/quran-page.ts';

async function run() {
  const p599 = await fetchQuranPageData("599");
  const p600 = await fetchQuranPageData("600");
  
  console.log("PAGE 599 Verses:", p599.data.verses?.map(v => v.verse_key).join(", "));
  console.log("PAGE 600 Verses:", p600.data.verses?.map(v => v.verse_key).join(", "));
}
run();
