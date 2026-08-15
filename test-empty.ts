const linesMap: Record<number, any[]> = { 2: [1], 3: [1], 4: [1] };
const specialLines: Record<number, any> = { 1: { type: 'surah_header' } };
const maxLine = 15;
const sortedLineNumbers = Array.from({ length: maxLine }, (_, i) => i + 1);

// Get the last line that has content or is a special line
const lastContentLine = Math.max(
  ...Object.keys(linesMap).map(Number),
  ...Object.keys(specialLines).map(Number),
  0
);

const emptyLinesAtEnd = sortedLineNumbers.filter(
  (l) => l > lastContentLine
);

const shiftCount = Math.floor(emptyLinesAtEnd.length / 2);
const linesToShiftToTop = emptyLinesAtEnd.slice(0, shiftCount);

console.log("Last content line:", lastContentLine);
console.log("Empty lines at end:", emptyLinesAtEnd);
console.log("Shift count:", shiftCount);
console.log("Lines to shift to top:", linesToShiftToTop);
