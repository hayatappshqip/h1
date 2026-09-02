/**
 * Test roje për dokumentin e specifikave (docs/).
 *
 * Qëllimi: të sigurojë që pohimet e shkruara në docs/ mbeten të vërteta
 * ndërsa kodi ndryshon. Nëse dikush heq një modul, shton një manifest,
 * ose prish korpusin e Kuranit, ky test dështon — dhe dokumenti bëhet
 * i ndershëm përsëri.
 *
 * Numrat e pritshëm jetojnë në BASELINE më poshtë. Ato mund të PAKËSOHEN
 * (p.sh. boshllëqet e Mburojës) por çdo rritje duhet të jetë e qëllimshme
 * dhe e dokumentuar.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(__dirname, '../..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const exists = (p: string) => fs.existsSync(path.join(ROOT, p));

/** Vlerat bazë të verifikuara më 2026-08-30 në degën arena/01a053d0-h1. */
const BASELINE = {
  quranSurahs: 114,
  quranVerses: 6236,
  mburojaCategories: 11,
  mburojaChapters: 133,
  mburojaDuas: 294,
  // Pragjet e sipërme: boshllëqet mund të pakësohen, jo të rriten.
  maxMissingArabic: 28,
  maxMissingAlbanian: 1,
  maxMissingTransliteration: 29,
  maxMissingReference: 5,
};

const REQUIRED_DOCS = [
  'docs/README.md',
  'docs/01-gjendja-aktuale.md',
  'docs/02-specifikimi.md',
  'docs/03-arkitektura.md',
  'docs/04-rreziqet.md',
  'docs/05-roadmap.md',
  'docs/06-burimet-e-te-dhenave.md',
  'docs/prompts/README.md',
  'docs/prompts/faza-0.md',
  'docs/prompts/faza-1.md',
  'docs/prompts/faza-2.md',
  'docs/prompts/faza-3.md',
  'docs/prompts/faza-4.md',
  'docs/prompts/faza-5.md',
];

describe('Dokumenti i specifikave — struktura', () => {
  it.each(REQUIRED_DOCS)('ekziston %s', (doc) => {
    expect(exists(doc), `Mungon skedari i dokumentacionit: ${doc}`).toBe(true);
  });

  it('çdo dokument ka përmbajtje (jo skedar bosh)', () => {
    for (const doc of REQUIRED_DOCS) {
      expect(read(doc).trim().length, `${doc} është bosh`).toBeGreaterThan(200);
    }
  });

  it('docs/README.md lidh gjashtë dokumentet kryesore dhe dosjen e prompteve', () => {
    const readme = read('docs/README.md');

    const coreDocs = REQUIRED_DOCS.filter((d) => !d.startsWith('docs/prompts/'));
    for (const doc of coreDocs) {
      if (doc === 'docs/README.md') continue;
      const name = path.basename(doc);
      expect(readme, `docs/README.md nuk përmend ${name}`).toContain(name);
    }

    // Promptet lidhen si dosje, jo një nga një.
    expect(readme, 'docs/README.md nuk lidh dosjen prompts/').toContain('prompts/');
  });

  it('skripti i inventarit ekziston dhe është i lidhur në package.json', () => {
    expect(exists('scripts/spec-inventory.mjs')).toBe(true);
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.scripts.inventory).toContain('spec-inventory.mjs');
  });

  it('inventar.json është JSON i vlefshëm me fushat e pritura', () => {
    expect(exists('docs/inventar.json')).toBe(true);
    const inv = JSON.parse(read('docs/inventar.json'));
    for (const key of [
      'counts',
      'externalHosts',
      'quranCorpus',
      'mburoja',
      'drift',
      'storage',
      'auth',
    ]) {
      expect(inv, `inventar.json nuk ka fushën "${key}"`).toHaveProperty(key);
    }
  });
});

describe('Dokumenti i specifikave — pohimet përmbajtjesore', () => {
  it('korpusi i Kuranit ka 114 sure dhe 6236 ajete', () => {
    const corpusDir = path.join(ROOT, 'public/quran-corpus-v2-chunked/surahs');
    const files = fs.readdirSync(corpusDir).filter((f) => f.endsWith('.json'));
    expect(files).toHaveLength(BASELINE.quranSurahs);

    let verses = 0;
    for (const f of files) {
      verses += JSON.parse(fs.readFileSync(path.join(corpusDir, f), 'utf8')).verses.length;
    }
    expect(verses).toBe(BASELINE.quranVerses);
  });

  it('SHA-256 i sures 1 përputhet me manifestin (integriteti i tekstit)', () => {
    const manifest = JSON.parse(read('public/quran-corpus-v2-chunked/manifest.json'));
    const declared = manifest.surahs[0].sha256;
    const actual = crypto
      .createHash('sha256')
      .update(read('public/quran-corpus-v2-chunked/surahs/001.json'))
      .digest('hex');
    expect(actual).toBe(declared);
  });

  it('Mburoja ka 11 kategori, 133 kapituj dhe 294 dua', async () => {
    const { MBUROJA_CHAPTERS, MBUROJA_CATEGORIES } = await import('../data/mburojaData');
    expect(MBUROJA_CATEGORIES).toHaveLength(BASELINE.mburojaCategories);
    expect(MBUROJA_CHAPTERS).toHaveLength(BASELINE.mburojaChapters);
    expect(MBUROJA_CHAPTERS.flatMap((c) => c.duas)).toHaveLength(BASELINE.mburojaDuas);
  });

  it('boshllëqet e Mburojës nuk janë rritur mbi pragun e dokumentuar', async () => {
    const { MBUROJA_CHAPTERS } = await import('../data/mburojaData');
    const duas = MBUROJA_CHAPTERS.flatMap((c) => c.duas);

    const missingArabic = duas.filter((d) => !d.ar?.trim()).length;
    const missingAlbanian = duas.filter((d) => !d.sq?.trim()).length;
    const missingTransliteration = duas.filter((d) => !d.transliteration?.trim()).length;
    const missingReference = duas.filter((d) => !d.reference?.trim()).length;

    // Këto pohime janë të shkruara në docs/01-gjendja-aktuale.md dhe
    // docs/06-burimet-e-te-dhenave.md. Nëse rriten, dokumenti gënjen.
    expect(
      missingArabic,
      `Duatë pa tekst arabik u rritën në ${missingArabic} (pragu ${BASELINE.maxMissingArabic}). Përditëso docs/ ose plotëso përmbajtjen.`,
    ).toBeLessThanOrEqual(BASELINE.maxMissingArabic);
    expect(missingAlbanian).toBeLessThanOrEqual(BASELINE.maxMissingAlbanian);
    expect(missingTransliteration).toBeLessThanOrEqual(BASELINE.maxMissingTransliteration);
    expect(missingReference).toBeLessThanOrEqual(BASELINE.maxMissingReference);
  });

  it('numri i manifestëve PWA nuk rritet mbi gjendjen e dokumentuar', () => {
    const candidates = ['manifest.json', 'public/manifest.json', 'public/manifest.webmanifest'];
    const manifests = candidates.filter(exists);

    // GJENDJA AKTUALE (e dokumentuar në docs/01-gjendja-aktuale.md, T6):
    //   manifest.json                545 B  sha c4b8b121f60f
    //   public/manifest.json         545 B  sha c4b8b121f60f  (identik)
    //   public/manifest.webmanifest  480 B  sha 2f67b7e58b49  (i ndryshëm, i pavërejtur)
    // Ky test NUK kalon vetëm kur mbetet një — ai pengon që numri të Rritet.
    // Faza 0, Detyra 0.5 e ul në 1; pasi të bëhet, ule BASELINE_MANIFESTS në 1.
    const BASELINE_MANIFESTS = 3;
    expect(
      manifests.length,
      `U shfaqën manifestë të shumtë: ${manifests.join(', ')}. Shih docs/04-rreziqet.md (T6).`,
    ).toBeLessThanOrEqual(BASELINE_MANIFESTS);
  });

  it('regullimi "imsak = fajr - 10" mbetet i hequr pasi të bëhet Faza 0', () => {
    const engine = read('src/services/prayerEngine.ts');
    const hits = (engine.match(/fajrMins - 10|fajr\) - 10/g) || []).length;

    // Derisa Faza 0 të përfundojë, kodi i ka 3 herë — ky test e dokumenton
    // gjendjen dhe do të dështojë vetëm nëse numri Rritet.
    const baselineHits = 3;
    expect(
      hits,
      `U shtuan raste të reja të "imsak = fajr - 10" (${hits} > ${baselineHits}). Shih docs/prompts/faza-0.md, Detyra 0.2.`,
    ).toBeLessThanOrEqual(baselineHits);
  });

  it('nuk ka librari autentikimi (premtimi local-first / privatësia)', () => {
    const pkg = JSON.parse(read('package.json'));
    const deps = Object.keys(pkg.dependencies || {});
    const authLibs = deps.filter((d) => /supabase|firebase|@auth0|next-auth|@clerk/i.test(d));
    // Para Fazës 3 nuk duhet të ketë asnjë. Pas Fazës 3, përditësoje këtë test
    // dhe shto testin e sigurisë së RLS.
    expect(authLibs, `U shtua librari auth para Fazës 3: ${authLibs.join(', ')}`).toEqual([]);
  });
});
