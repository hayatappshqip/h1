/**
 * Arabic text sanitization and rendering utilities to prevent dotted circle (U+25CC)
 * rendering artifacts caused by orphan diacritics, U+06DF (Sifr Mustadir / small rounded zero),
 * or Uthmanic font layout quirks on standard system fonts.
 */

/**
 * Cleans orphan diacritics and Uthmanic zero marks (like U+06DF  on Alif)
 * that cause browser layout engines to render a dotted circle ().
 */
export function sanitizeArabicText(text: string): string {
  if (!text) return text;

  return text
    // 1. Remove literal Unicode Dotted Circle character if present
    .replace(/\u25CC/g, '')
    // 2. Remove U+06DF (Arabic Small High Rounded Zero ۟), U+06E0 (Rectangular Zero ۠), and U+06EC
    // which cause dotted circle artifacts (◌) on silent Alif/Waw (e.g. كَفَرُوا۟ -> كَفَرُوا, أُو۟لَـٰٓئِكَ -> أُولَـٰٓئِكَ)
    .replace(/[\u06DF\u06E0\u06EC]/g, '')
    // 3. Attach Quranic Waqf / Tajweed stop marks (ۖ ۗ ۘ ۙ ۚ ۛ ۜ ۢ) directly to preceding letter when preceded by space
    // This prevents font rendering engines from drawing a dotted circle (◌) under standalone Waqf marks
    .replace(/\s+([\u06D6-\u06DC\u06E2])/g, (match, p1) => p1 + ' ')
    // 4. Remove orphan diacritics NOT attached to an Arabic base letter or diacritic chain
    .replace(/(?<![\u0621-\u064A\u066E\u066F\u0671-\u06D5\u064B-\u065F\u0670])[\u064B-\u0653\u0670]+/g, '')
    // 5. Normalize multiple spaces
    .replace(/  +/g, ' ');
}

/**
 * Formats Arabic text safely for display, ensuring punctuation like the Arabic comma (،)
 * and Uthmanic silent Alif marks render cleanly without triggering font layout artifacts or dotted circles.
 */
export function formatArabicText(text: string): string {
  return sanitizeArabicText(text);
}

