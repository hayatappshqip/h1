import { fetchQuranPageData } from './netlify/functions/quran-page.ts';

async function checkBoundary(p1, p2, vKeys) {
  const d1 = await fetchQuranPageData(String(p1));
  const d2 = await fetchQuranPageData(String(p2));
  
  const allVerses = [...d1.data.verses, ...d2.data.verses];
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
  await checkBoundary(105, 106, ['4:176']);
  await checkBoundary(254, 255, ['13:43']);
  await checkBoundary(439, 440, ['35:45']);
  await checkBoundary(585, 586, ['80:41', '80:42']);
}
run();
