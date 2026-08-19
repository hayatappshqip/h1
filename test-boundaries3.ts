import { fetchQuranPageData } from './netlify/functions/quran-page.ts';

async function checkBoundary(p1, p2, vKeys) {
  const d1 = await fetchQuranPageData(String(p1));
  const d2 = await fetchQuranPageData(String(p2));
  
  const allVerses = [...(d1.data?.verses || []), ...(d2.data?.verses || [])];
  for (const vKey of vKeys) {
    const v = allVerses.find(x => x.verse_key === vKey);
    if (!v) {
      console.log(`Missing ${vKey}`);
      continue;
    }
    const pages = new Set(v.words.map(w => w.v2_page));
    console.log(`${vKey}: fetched in page ${v.page_number}, words v2_page: ${Array.from(pages).join(',')}`);
  }
}

async function run() {
  await checkBoundary(599, 600, ['100:6', '100:7', '100:8', '100:9']);
}
run();
