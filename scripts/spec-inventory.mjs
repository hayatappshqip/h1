#!/usr/bin/env -S npx tsx
/**
 * spec-inventory.mjs
 * ---------------------------------------------------------------------------
 * Gjeneron një inventar të verifikueshëm të repos për dokumentin e specifikave.
 * Qëllimi: çdo numër që përmendet në docs/ të derivohet nga repo, jo të shkruhet përmendësh.
 *
 *   npm run inventory            -> tekst i lexueshëm
 *   npm run inventory -- --json  -> JSON (për CI / diff)
 *
 * Duhet të ekzekutohet me `tsx` (jo me `node` të thatë) sepse importon
 * src/data/mburojaData.ts — numërimi bëhet nga moduli real, jo me regex.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '..');
const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', 'coverage', '.cache']);
const AS_JSON = process.argv.includes("--json");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

const allFiles = walk(ROOT);
const rel = (f) => path.relative(ROOT, f);

const isSource = (f) => /\.(ts|tsx)$/.test(f) && !/\.test\.tsx?$/.test(f) && !f.includes('/tests/');
const isTest = (f) => /\.test\.tsx?$/.test(f) || f.includes('/tests/');

const srcFiles = allFiles.filter(isSource);
const testFiles = allFiles.filter(isTest);

const countLines = (files) =>
  files.reduce((n, f) => n + fs.readFileSync(f, 'utf8').split('\n').length, 0);

const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '');

// --- komponentët e deklaruar dhe a janë të lidhur diku ---
const components = fs
  .readdirSync(path.join(ROOT, 'src/components'))
  .filter((f) => f.endsWith('.tsx'))
  .map((f) => f.replace(/\.tsx$/, ''));

const wired = [];
const orphan = [];
for (const c of components) {
  const referencedIn = allFiles.filter(
    (f) =>
      /\.(ts|tsx)$/.test(f) &&
      !f.endsWith(`${c}.tsx`) &&
      new RegExp(`\\b${c}\\b`).test(read(f)),
  );
  (referencedIn.length ? wired : orphan).push(c);
}

// --- hostet e jashtme të referencuara në kod ---
const hosts = new Map();
for (const f of srcFiles) {
  for (const m of read(f).matchAll(/https:\/\/([a-z0-9.-]+)/gi)) {
    const host = m[1].toLowerCase();
    hosts.set(host, (hosts.get(host) || 0) + 1);
  }
}

// --- korpusi i Kuranit ---
const corpusDir = path.join(ROOT, 'public/quran-corpus-v2-chunked');
const corpusManifest = JSON.parse(read(path.join(corpusDir, 'manifest.json')) || '{}');
let corpusBytes = 0;
let corpusVerseCount = 0;
const surahFiles = fs.readdirSync(path.join(corpusDir, 'surahs')).filter((f) => f.endsWith('.json'));
for (const f of surahFiles) {
  const full = path.join(corpusDir, 'surahs', f);
  corpusBytes += fs.statSync(full).size;
  corpusVerseCount += JSON.parse(fs.readFileSync(full, 'utf8')).verses.length;
}
const corpusSha = crypto
  .createHash('sha256')
  .update(fs.readFileSync(path.join(corpusDir, 'surahs', '001.json')))
  .digest('hex');

// --- mburoja: numërohet duke importuar modulin real (jo me regex, që gënjen) ---
const { MBUROJA_CHAPTERS, MBUROJA_CATEGORIES } = await import(
  path.join(ROOT, 'src/data/mburojaData.ts')
);
const duaList = MBUROJA_CHAPTERS.flatMap((c) => c.duas);
const mburoja = {
  categories: MBUROJA_CATEGORIES.length,
  chapters: MBUROJA_CHAPTERS.length,
  duas: duaList.length,
  missingArabic: duaList.filter((d) => !d.ar?.trim()).length,
  missingAlbanian: duaList.filter((d) => !d.sq?.trim()).length,
  missingTransliteration: duaList.filter((d) => !d.transliteration?.trim()).length,
  missingReference: duaList.filter((d) => !d.reference?.trim()).length,
  duplicateChapterIds: MBUROJA_CHAPTERS.map((c) => c.id).filter(
    (v, i, a) => a.indexOf(v) !== i,
  ),
};

// --- kontradiktat e deklaruara (versionet) ---
const swFile = read(path.join(ROOT, 'service-worker.js'));
const appFile = read(path.join(ROOT, 'src/App.tsx'));
const swCacheVersion = (swFile.match(/CACHE_VERSION\s*=\s*'([^']+)'/) || [])[1] || null;
const appSwComment = (appFile.match(/Service Worker (v\d+)/) || [])[1] || null;

// --- manifestët e dyfishtë ---
const manifests = ['manifest.json', 'public/manifest.json', 'public/manifest.webmanifest']
  .filter((f) => fs.existsSync(path.join(ROOT, f)))
  .map((f) => ({
    file: f,
    bytes: fs.statSync(path.join(ROOT, f)).size,
    sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, f))).digest('hex').slice(0, 12),
  }));

// --- dependenci të deklaruara por të papërdorura ---
const pkg = JSON.parse(read(path.join(ROOT, 'package.json')));
const declaredDeps = Object.keys(pkg.dependencies || {});
const allSource = srcFiles.map((f) => read(f)).join('\n') + read(path.join(ROOT, 'server.ts')) +
  fs.readdirSync(path.join(ROOT, 'netlify/functions')).map((f) => read(path.join(ROOT, 'netlify/functions', f))).join('\n');
const unusedDeps = declaredDeps.filter((d) => !new RegExp(`from ['"]${d.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(allSource));

const report = {
  generatedAt: new Date().toISOString(),
  counts: {
    totalFiles: allFiles.length,
    sourceFiles: srcFiles.length,
    testFiles: testFiles.length,
    sourceLines: countLines(srcFiles),
    testLines: countLines(testFiles),
    components: components.length,
    componentsWired: wired.length,
    componentsOrphan: orphan.length,
  },
  orphanComponents: orphan,
  externalHosts: [...hosts.entries()].sort((a, b) => b[1] - a[1]).map(([host, n]) => ({ host, refs: n })),
  quranCorpus: {
    provider: corpusManifest.provider,
    translationName: corpusManifest.translationName,
    declaredSurahs: corpusManifest.totalSurahs,
    declaredVerses: corpusManifest.totalVerses,
    surahFilesOnDisk: surahFiles.length,
    versesCountedOnDisk: corpusVerseCount,
    bytesOnDisk: corpusBytes,
    manifestSha256_001: corpusManifest.surahs?.[0]?.sha256?.slice(0, 16),
    recomputedSha256_001: corpusSha.slice(0, 16),
  },
  mburoja,
  drift: {
    serviceWorkerCacheVersion: swCacheVersion,
    appTSServiceWorkerComment: appSwComment,
    manifests,
    unusedRuntimeDependencies: unusedDeps,
  },
  storage: {
    usesIndexedDBDexie: /from ['"]dexie['"]/.test(allSource),
    usesLocalStorage: /localStorage\./.test(allSource),
    localStorageKeys: [...new Set([...allSource.matchAll(/localStorage\.(?:get|set|remove)Item\(\s*'([^']+)'/g)].map((m) => m[1]))].sort(),
  },
  auth: {
    anyAuthLibrary: /supabase|firebase|@auth0|next-auth|clerk/i.test(allSource),
    signInReferences: (allSource.match(/signIn|signUp|logIn|createUser/g) || []).length,
  },
};

if (AS_JSON) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const L = [];
  L.push('HAYAT — INVENTAR I VERIFIKUAR (i gjeneruar nga scripts/spec-inventory.mjs)');
  L.push('='.repeat(72));
  L.push(`Gjeneruar: ${report.generatedAt}`);
  L.push('');
  L.push('MADHËSIA E KODIT');
  for (const [k, v] of Object.entries(report.counts)) L.push(`  ${k.padEnd(20)} ${v}`);
  L.push('');
  L.push('KOMPONENTË TË PALIDHUR (orphan)');
  L.push(`  ${report.orphanComponents.length ? report.orphanComponents.join(', ') : '(asnjë — të gjithë të lidhur)'}`);
  L.push('');
  L.push('HOSTE TË JASHTME TË REFERENCUARA');
  for (const h of report.externalHosts) L.push(`  ${h.refs.toString().padStart(3)}x  ${h.host}`);
  L.push('');
  L.push("KORPUSI I KURANIT (bundled në repo)");
  for (const [k, v] of Object.entries(report.quranCorpus)) L.push(`  ${k.padEnd(24)} ${v}`);
  L.push('');
  L.push('MBUROJA E MUSLIMANIT');
  for (const [k, v] of Object.entries(report.mburoja)) L.push(`  ${k.padEnd(24)} ${v}`);
  L.push('');
  L.push('DRIFT / PAKONSISTENCA');
  L.push(`  service-worker.js CACHE_VERSION = ${report.drift.serviceWorkerCacheVersion}`);
  L.push(`  src/App.tsx komenti             = ${report.drift.appTSServiceWorkerComment}`);
  L.push(`  manifestë të dyfishtë: ${report.drift.manifests.map((m) => `${m.file} (${m.bytes}B, sha ${m.sha256})`).join(' | ')}`);
  L.push(`  dependenci runtime të papërdorura: ${report.drift.unusedRuntimeDependencies.join(', ') || '(asnjë)'}`);
  L.push('');
  L.push('RUAJTJA E TË DHËNAVE');
  L.push(`  Dexie/IndexedDB: ${report.storage.usesIndexedDBDexie}   localStorage: ${report.storage.usesLocalStorage}`);
  L.push(`  çelësa localStorage: ${report.storage.localStorageKeys.join(', ')}`);
  L.push('');
  L.push('AUTENTIKIM / LLOGARI');
  L.push(`  librari auth: ${report.auth.anyAuthLibrary}   referencat signIn/signUp: ${report.auth.signInReferences}`);
  console.log(L.join('\n'));
}
