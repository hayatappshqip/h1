import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MBUROJA_CHAPTERS } from '../src/data/mburojaData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function normalizeArabic(s) {
  if (!s) return '';
  let clean = s.replace(/<[^>]+>/g, ' ');
  clean = clean.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  clean = clean.replace(/\u0640/g, '');
  clean = clean.replace(/[^\u0600-\u06FF\s]/g, ' ');
  clean = clean.replace(/\s+/g, ' ').trim();
  return clean;
}

export function jaccard(a, b) {
  const wordsA = new Set(a.split(' ').filter(Boolean));
  const wordsB = new Set(b.split(' ').filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) {
      intersection++;
    }
  }
  const union = new Set([...wordsA, ...wordsB]).size;
  return union > 0 ? intersection / union : 0;
}

async function run() {
  console.log('Fetching adhkar.json from GitHub...');
  const res = await fetch('https://raw.githubusercontent.com/rn0x/Adhkar-json/main/adhkar.json');
  if (!res.ok) {
    throw new Error(`Failed to fetch adhkar.json: ${res.statusText}`);
  }
  const adhkarCategories = await res.json();

  // Index all Hisnul Muslim items across all categories
  const hisnIndex = [];
  for (const cat of adhkarCategories) {
    if (cat && Array.isArray(cat.array)) {
      for (const item of cat.array) {
        if (item && item.text && item.filename) {
          hisnIndex.push({
            categoryId: cat.id,
            categoryName: cat.category,
            filename: String(item.filename),
            text: item.text,
            normalized: normalizeArabic(item.text),
            audioUrl: `https://www.hisnmuslim.com/audio/ar/${item.filename}.mp3`
          });
        }
      }
    }
  }

  console.log(`Indexed ${hisnIndex.length} audio items from Hisnul Muslim.`);

  const targetChapterIds = [27, 28, 29];
  const audioMap = {};

  for (const chapterId of targetChapterIds) {
    const chapter = MBUROJA_CHAPTERS.find((c) => c.id === chapterId);
    if (!chapter) {
      console.warn(`Chapter ${chapterId} not found in MBUROJA_CHAPTERS`);
      continue;
    }

    audioMap[chapterId] = {};
    console.log(`\nProcessing Chapter ${chapterId}: "${chapter.title}" (${chapter.duas.length} duas)...`);

    for (const dua of chapter.duas) {
      const duaNorm = normalizeArabic(dua.ar);
      let bestMatch = null;
      let highestScore = 0;

      for (const item of hisnIndex) {
        const score = jaccard(duaNorm, item.normalized);
        if (score > highestScore) {
          highestScore = score;
          bestMatch = item;
        }
      }

      if (highestScore >= 0.35 && bestMatch) {
        audioMap[chapterId][dua.id] = {
          file: bestMatch.filename,
          url: `https://www.hisnmuslim.com/audio/ar/${bestMatch.filename}.mp3`,
          score: parseFloat(highestScore.toFixed(3))
        };
        console.log(`  ✓ Dua ${dua.id}: Matched -> ${bestMatch.filename}.mp3 (score: ${highestScore.toFixed(3)})`);
      } else {
        audioMap[chapterId][dua.id] = null;
        console.log(`  ✗ Dua ${dua.id}: No match (best score: ${highestScore.toFixed(3)})`);
      }
    }
  }

  const outputPath = path.join(__dirname, '../src/data/audioMap.json');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(audioMap, null, 2), 'utf-8');
  console.log(`\nSuccessfully wrote audioMap.json to ${outputPath}`);
}

run().catch((err) => {
  console.error('Error building audio map:', err);
  process.exit(1);
});
