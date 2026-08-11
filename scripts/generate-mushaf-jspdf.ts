import fs from 'fs';
import path from 'path';
import { jsPDF } from 'jspdf';

function createMushafPdf(outputPath: string, isTajweed: boolean) {
  // A4 size: 210 x 297 mm
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const pagesData = [
    {
      page: 1,
      surahAr: 'سُورَةُ الفَاتِحَةِ',
      surahSq: 'Sura El-Fatiha (1:1-7)',
      lines: [
        { ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾', rule: 'bismillah' },
        { ar: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾', rule: 'normal' },
        { ar: 'الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾', rule: 'madd' },
        { ar: 'مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾', rule: 'normal' },
        { ar: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾', rule: 'qalqalah' },
        { ar: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾', rule: 'normal' },
        { ar: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ', rule: 'ghunnah' },
        { ar: 'غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾', rule: 'madd' }
      ]
    },
    {
      page: 2,
      surahAr: 'سُورَةُ البَقَرَةِ',
      surahSq: 'Sura El-Bekare (2:1-5)',
      lines: [
        { ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', rule: 'bismillah' },
        { ar: 'الم ﴿١﴾ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ﴿٢﴾', rule: 'madd' },
        { ar: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ', rule: 'normal' },
        { ar: 'وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ ﴿٣﴾', rule: 'ghunnah' },
        { ar: 'وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ', rule: 'ikhfa' },
        { ar: 'وَبِالْآخِرَةِ هُمْ يُوقِنُونَ ﴿٤﴾', rule: 'normal' },
        { ar: 'أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ ﴿٥﴾', rule: 'madd' }
      ]
    },
    {
      page: 3,
      surahAr: 'سُورَةُ البَقَرَةِ',
      surahSq: 'Sura El-Bekare (2:6-16)',
      lines: [
        { ar: 'إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ ﴿٦﴾', rule: 'ghunnah' },
        { ar: 'خَتَمَ اللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ ۖ وَعَلَىٰ أَبْصَارِهِمْ غِشَاوَةٌ ۖ وَلَهُمْ عَذَابٌ عَظِيمٌ ﴿٧﴾', rule: 'normal' },
        { ar: 'وَمِنَ النَّاسِ مَن يَقُولُ آمَنَّا بِاللَّهِ وَبِالْآخِرَةِ وَمَا هُم بِمُؤْمِنِينَ ﴿٨﴾', rule: 'idgham' },
        { ar: 'يُخَادِعُونَ اللَّهَ وَالَّذِينَ آمَنُوا وَمَا يَخْدَعُونَ إِلَّا أَنفُسَهُمْ وَمَا يَشْعُرُونَ ﴿٩﴾', rule: 'madd' },
        { ar: 'فِي قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا ۖ وَلَهُمْ عَذَابٌ أَلِيمٌ بِمَا كَانُوا يَكْذِبُونَ ﴿١٠﴾', rule: 'iqlab' },
        { ar: 'وَإِذَا قِيلَ لَهُمْ لَا تُفْسِدُوا فِي الْأَرْضِ قَالُوا إِنَّمَا نَحْنُ مُصْلِحُونَ ﴿١١﴾', rule: 'normal' },
        { ar: 'أَلَا إِنَّهُمْ هُمُ الْمُفْسِدُونَ وَلَٰكِن لَّا يَشْعُرُونَ ﴿١٢﴾', rule: 'ghunnah' }
      ]
    },
    {
      page: 4,
      surahAr: 'سُورَةُ البَقَرَةِ',
      surahSq: 'Sura El-Bekare (2:17-24)',
      lines: [
        { ar: 'مَثَلُهُمْ كَمَثَلِ الَّذِي اسْتَوْقَدَ نَارًا فَلَمَّا أَضَاءَتْ مَا حَوْلَهُ ذَهَبَ اللَّهُ بِنُورِهِمْ ﴿١٧﴾', rule: 'madd' },
        { ar: 'صُمٌّ بُكْمٌ عُمْيٌ فَهُمْ لَا يَرْجِعُونَ ﴿١٨﴾ أَوْ كَصَيِّبٍ مِّنَ السَّمَاءِ فِيهِ ظُلُمَاتٌ وَرَعْدٌ وَبَرْقٌ', rule: 'iqlab' },
        { ar: 'يَجْعَلُونَ أَصَابِعَهُمْ فِي آذَانِهِم مِّنَ الصَّوَاعِقِ حَذَرَ الْمَوْتِ ۚ وَاللَّهُ مُحِيطٌ بِالْكَافِرِينَ ﴿١٩﴾', rule: 'qalqalah' },
        { ar: 'يَكَادُ الْبَرْقُ يَخْطَفُ أَبْصَارَهُمْ ۖ كُلَّمَا أَضَاءَ لَهُم مَّشَوْا فِيهِ وَإِذَا أَظْلَمَ عَلَيْهِمْ قَامُوا ﴿٢٠﴾', rule: 'madd' },
        { ar: 'يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ وَالَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ ﴿٢١﴾', rule: 'normal' },
        { ar: 'الَّذِي جَعَلَ لَكُمُ الْأَرْضَ فِرَاشًا وَالسَّمَاءَ بِنَاءً وَأَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجَ بِهِ مِنَ الثَّمَرَاتِ ﴿٢٢﴾', rule: 'madd' },
        { ar: 'فَإِن لَّمْ تَفْعَلُوا وَلَن تَفْعَلُوا فَاتَّقُوا النَّارَ الَّتِي وَقُودُهَا النَّاسُ وَالْحِجَارَةُ ۖ أُعِدَّتْ لِلْكَافِرِينَ ﴿٢٤﴾', rule: 'ghunnah' }
      ]
    },
    {
      page: 5,
      surahAr: 'سُورَةُ البَقَرَةِ',
      surahSq: 'Sura El-Bekare (2:25-29)',
      lines: [
        { ar: 'وَبَشِّرِ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ أَنَّ لَهُمْ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ ﴿٢٥﴾', rule: 'ghunnah' },
        { ar: 'إِنَّ اللَّهَ لَا يَسْتَحْيِي أَن يَضْرِبَ مَثَلًا مَّا بَعُوضَةً فَمَا فَوْقَهَا ۚ فَأَمَّا الَّذِينَ آمَنُوا ﴿٢٦﴾', rule: 'idgham' },
        { ar: 'الَّذِينَ يَنقُضُونَ عَهْدَ اللَّهِ مِن بَعْدِ مِيثَاقِهِ وَيَقْطَعُونَ مَا أَمَرَ اللَّهُ بِهِ أَن يُوصَلَ ﴿٢٧﴾', rule: 'ikhfa' },
        { ar: 'كَيْفَ تَكْفُرُونَ بِاللَّهِ وَكُنتُمْ أَمْوَاتًا فَأَحْيَاكُمْ ۖ ثُمَّ يُمِيتُكُمْ ثُمَّ يُحْيِيكُمْ ثُمَّ إِلَيْهِ تُرْجَعُونَ ﴿٢٨﴾', rule: 'normal' },
        { ar: 'هُوَ الَّذِي خَلَقَ لَكُم مَّا فِي الْأَرْضِ جَمِيعًا ثُمَّ اسْتَوَىٰ إِلَى السَّمَاءِ فَسَوَّاهُنَّ سَبْعَ سَمَاوَاتٍ ﴿٢٩﴾', rule: 'madd' }
      ]
    }
  ];

  pagesData.forEach((p, pageIdx) => {
    if (pageIdx > 0) doc.addPage();

    // Parchment background
    if (isTajweed) {
      doc.setFillColor(252, 250, 245);
    } else {
      doc.setFillColor(250, 246, 238);
    }
    doc.rect(0, 0, 210, 297, 'F');

    // Outer double frame lines (Madinah border style)
    const m = 8;
    doc.setLineWidth(0.8);
    doc.setDrawColor(isTajweed ? 40 : 160, isTajweed ? 110 : 120, isTajweed ? 70 : 50);
    doc.rect(m, m, 210 - m * 2, 297 - m * 2);

    doc.setLineWidth(0.3);
    doc.rect(m + 2, m + 2, 210 - (m + 2) * 2, 297 - (m + 2) * 2);

    // Header Banner
    const hY = m + 6;
    doc.setFillColor(isTajweed ? 232 : 242, isTajweed ? 245 : 234, isTajweed ? 235 : 218);
    doc.rect(m + 4, hY, 210 - (m + 4) * 2, 12, 'FD');

    // Header text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(isTajweed ? 20 : 90, isTajweed ? 90 : 65, isTajweed ? 50 : 25);
    doc.text(`Juz 1  |  ${p.surahSq}  |  ${isTajweed ? 'Tajweed Color Prototype' : 'Madinah 15 Lines'}`, m + 8, hY + 8);
    doc.text(p.surahAr, 210 - m - 45, hY + 8);

    // Inner Page Content Container Box
    const cY = hY + 16;
    const cHeight = 297 - m * 2 - 38;
    const cWidth = 210 - (m + 6) * 2;

    doc.setFillColor(255, 255, 253);
    doc.rect(m + 6, cY, cWidth, cHeight, 'FD');

    // Tajweed Badge Indicator on Top of Content Box
    if (isTajweed) {
      doc.setFillColor(220, 242, 228);
      doc.rect(m + 10, cY + 4, cWidth - 8, 8, 'F');
      doc.setFontSize(7);
      doc.setTextColor(20, 110, 60);
      doc.text('BOTIMI ME TEXHVID - NGJYRAT REALE TE REGULLAVE NE FAQE', m + 14, cY + 9.5);
    }

    // Render 15 Guideline Rows & Text Blocks
    const startY = cY + (isTajweed ? 20 : 14);
    const lineGap = (cHeight - 28) / 15;

    // Draw 15 lines guideline grid
    for (let l = 0; l < 15; l++) {
      const lineY = startY + l * lineGap;
      doc.setLineWidth(0.15);
      doc.setDrawColor(235, 228, 215);
      doc.line(m + 8, lineY + 2, m + 6 + cWidth - 2, lineY + 2);
    }

    // Populate lines into 15 slots
    p.lines.forEach((item, lineIdx) => {
      const lineY = startY + lineIdx * (lineGap * 1.8);
      if (lineY > cY + cHeight - 12) return;

      // Color coding per line
      if (isTajweed) {
        switch (item.rule) {
          case 'ghunnah':
            doc.setTextColor(22, 138, 62); // Emerald Green
            break;
          case 'madd':
            doc.setTextColor(195, 35, 35); // Crimson Red
            break;
          case 'qalqalah':
            doc.setTextColor(30, 95, 185); // Royal Blue
            break;
          case 'ikhfa':
            doc.setTextColor(210, 120, 20); // Amber Orange
            break;
          case 'iqlab':
            doc.setTextColor(140, 40, 160); // Purple
            break;
          default:
            doc.setTextColor(25, 30, 35); // Dark Slate
            break;
        }
      } else {
        doc.setTextColor(20, 22, 25);
      }

      doc.setFontSize(10);
      doc.text(item.ar, 210 - m - 14, lineY, { align: 'right' });
    });

    // Page Number Footer (Arabic numerals)
    const arabicNumbers = ['١', '٢', '٣', '٤', '٥'];
    doc.setFontSize(9);
    doc.setTextColor(isTajweed ? 30 : 120, isTajweed ? 100 : 90, isTajweed ? 50 : 35);
    doc.text(`Faqja / Page ${arabicNumbers[p.page - 1]} (${p.page})`, 105, 297 - m - 4, { align: 'center' });
  });

  const pdfOutput = doc.output('arraybuffer');
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, Buffer.from(pdfOutput));
  console.log(`Successfully generated PDF via jsPDF: ${outputPath}`);
}

createMushafPdf('./public/assets/mushaf/madinah-15-lines-poc.pdf', false);
createMushafPdf('./public/assets/mushaf/tajweed-color-poc.pdf', true);
