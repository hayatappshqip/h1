import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

async function generatePocPdf(outputPath: string, isTajweed: boolean) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const pagesData = [
    {
      page: 1,
      surahAr: 'سُورَةُ الفَاتِحَةِ',
      surahSq: 'Sura El-Fatiha',
      lines: [
        'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾',
        'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾',
        'الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾',
        'مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾',
        'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾',
        'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾',
        'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ',
        'غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾'
      ]
    },
    {
      page: 2,
      surahAr: 'سُورَةُ البَقَرَةِ',
      surahSq: 'Sura El-Bekare (1-5)',
      lines: [
        'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        'الم ﴿١﴾ ذَٰلِكَ الْكِتَابُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ ﴿٢﴾',
        'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ',
        'وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ ﴿٣﴾',
        'وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ وَمَا أُنزِلَ مِن قَبْلِكَ',
        'وَبِالْآخِرَةِ هُمْ يُوقِنُونَ ﴿٤﴾',
        'أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ ﴿٥﴾'
      ]
    },
    {
      page: 3,
      surahAr: 'سُورَةُ البَقَرَةِ',
      surahSq: 'Sura El-Bekare (6-16)',
      lines: [
        'إِنَّ الَّذِينَ كَفَرُوا سَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ ﴿٦﴾',
        'خَتَمَ اللَّهُ عَلَىٰ قُلُوبِهِمْ وَعَلَىٰ سَمْعِهِمْ ۖ وَعَلَىٰ أَبْصَارِهِمْ غِشَاوَةٌ ۖ وَلَهُمْ عَذَابٌ عَظِيمٌ ﴿٧﴾',
        'وَمِنَ النَّاسِ مَن يَقُولُ آمَنَّا بِاللَّهِ وَبِالْآخِرَةِ وَمَا هُم بِمُؤْمِنِينَ ﴿٨﴾',
        'يُخَادِعُونَ اللَّهَ وَالَّذِينَ آمَنُوا وَمَا يَخْدَعُونَ إِلَّا أَنفُسَهُمْ وَمَا يَشْعُرُونَ ﴿٩﴾',
        'فِي قُلُوبِهِم مَّرَضٌ فَزَادَهُمُ اللَّهُ مَرَضًا ۖ وَلَهُمْ عَذَابٌ أَلِيمٌ بِمَا كَانُوا يَكْذِبُونَ ﴿١٠﴾',
        'وَإِذَا قِيلَ لَهُمْ لَا تُفْسِدُوا فِي الْأَرْضِ قَالُوا إِنَّمَا نَحْنُ مُصْلِحُونَ ﴿١١﴾',
        'أَلَا إِنَّهُمْ هُمُ الْمُفْسِدُونَ وَلَٰكِن لَّا يَشْعُرُونَ ﴿١٢﴾'
      ]
    },
    {
      page: 4,
      surahAr: 'سُورَةُ البَقَرَةِ',
      surahSq: 'Sura El-Bekare (17-24)',
      lines: [
        'مَثَلُهُمْ كَمَثَلِ الَّذِي اسْتَوْقَدَ نَارًا فَلَمَّا أَضَاءَتْ مَا حَوْلَهُ ذَهَبَ اللَّهُ بِنُورِهِمْ ﴿١٧﴾',
        'صُمٌّ بُكْمٌ عُمْيٌ فَهُمْ لَا يَرْجِعُونَ ﴿١٨﴾ أَوْ كَصَيِّبٍ مِّنَ السَّمَاءِ فِيهِ ظُلُمَاتٌ وَرَعْدٌ وَبَرْقٌ',
        'يَجْعَلُونَ أَصَابِعَهُمْ فِي آذَانِهِم مِّنَ الصَّوَاعِقِ حَذَرَ الْمَوْتِ ۚ وَاللَّهُ مُحِيطٌ بِالْكَافِرِينَ ﴿١٩﴾',
        'يَكَادُ الْبَرْقُ يَخْطَفُ أَبْصَارَهُمْ ۖ كُلَّمَا أَضَاءَ لَهُم مَّشَوْا فِيهِ وَإِذَا أَظْلَمَ عَلَيْهِمْ قَامُوا ﴿٢٠﴾',
        'يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ وَالَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ ﴿٢١﴾',
        'الَّذِي جَعَلَ لَكُمُ الْأَرْضَ فِرَاشًا وَالسَّمَاءَ بِنَاءً وَأَنزَلَ مِنَ السَّمَاءِ مَاءً فَأَخْرَجَ بِهِ مِنَ الثَّمَرَاتِ رِزْقًا لَّكُمْ ﴿٢٢﴾',
        'فَإِن لَّمْ تَفْعَلُوا وَلَن تَفْعَلُوا فَاتَّقُوا النَّارَ الَّتِي وَقُودُهَا النَّاسُ وَالْحِجَارَةُ ۖ أُعِدَّتْ لِلْكَافِرِينَ ﴿٢٤﴾'
      ]
    },
    {
      page: 5,
      surahAr: 'سُورَةُ البَقَرَةِ',
      surahSq: 'Sura El-Bekare (25-29)',
      lines: [
        'وَبَشِّرِ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ أَنَّ لَهُمْ جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ ﴿٢٥﴾',
        'إِنَّ اللَّهَ لَا يَسْتَحْيِي أَن يَضْرِبَ مَثَلًا مَّا بَعُوضَةً فَمَا فَوْقَهَا ۚ فَأَمَّا الَّذِينَ آمَنُوا فَيَعْلَمُونَ أَنَّهُ الْحَقُّ مِن رَّبِّهِمْ ﴿٢٦﴾',
        'الَّذِينَ يَنقُضُونَ عَهْدَ اللَّهِ مِن بَعْدِ مِيثَاقِهِ وَيَقْطَعُونَ مَا أَمَرَ اللَّهُ بِهِ أَن يُوصَلَ وَيُفْسِدُونَ فِي الْأَرْضِ ﴿٢٧﴾',
        'كَيْفَ تَكْفُرُونَ بِاللَّهِ وَكُنتُمْ أَمْوَاتًا فَأَحْيَاكُمْ ۖ ثُمَّ يُمِيتُكُمْ ثُمَّ يُحْيِيكُمْ ثُمَّ إِلَيْهِ تُرْجَعُونَ ﴿٢٨﴾',
        'هُوَ الَّذِي خَلَقَ لَكُم مَّا فِي الْأَرْضِ جَمِيعًا ثُمَّ اسْتَوَىٰ إِلَى السَّمَاءِ فَسَوَّاهُنَّ سَبْعَ سَمَاوَاتٍ ۚ وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ ﴿٢٩﴾'
      ]
    }
  ];

  const pageWidth = 595.28; // A4 width
  const pageHeight = 841.89; // A4 height

  for (const p of pagesData) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Page Background - Creamy parchment paper feel
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: isTajweed ? rgb(0.98, 0.97, 0.94) : rgb(0.97, 0.95, 0.90)
    });

    // Outer Decorative Border Lines (Double Ornate Frame)
    const margin = 24;
    page.drawRectangle({
      x: margin,
      y: margin,
      width: pageWidth - margin * 2,
      height: pageHeight - margin * 2,
      borderColor: isTajweed ? rgb(0.18, 0.45, 0.32) : rgb(0.65, 0.48, 0.22),
      borderWidth: 2.5,
      color: undefined
    });

    page.drawRectangle({
      x: margin + 6,
      y: margin + 6,
      width: pageWidth - (margin + 6) * 2,
      height: pageHeight - (margin + 6) * 2,
      borderColor: isTajweed ? rgb(0.25, 0.55, 0.38) : rgb(0.80, 0.62, 0.35),
      borderWidth: 1.0,
      color: undefined
    });

    // Top Header Banner Box
    const headerY = pageHeight - margin - 50;
    page.drawRectangle({
      x: margin + 15,
      y: headerY,
      width: pageWidth - (margin + 15) * 2,
      height: 32,
      color: isTajweed ? rgb(0.91, 0.95, 0.91) : rgb(0.94, 0.90, 0.82),
      borderColor: isTajweed ? rgb(0.18, 0.45, 0.32) : rgb(0.65, 0.48, 0.22),
      borderWidth: 1.5
    });

    // Header Text
    page.drawText(`Juz 1  |  ${p.surahSq}  |  ${isTajweed ? 'Tajweed Color' : 'Madinah 15 Lines'}`, {
      x: margin + 30,
      y: headerY + 10,
      size: 11,
      font,
      color: isTajweed ? rgb(0.1, 0.35, 0.2) : rgb(0.4, 0.28, 0.1)
    });

    page.drawText(p.surahAr, {
      x: pageWidth - margin - 160,
      y: headerY + 10,
      size: 12,
      font,
      color: isTajweed ? rgb(0.1, 0.35, 0.2) : rgb(0.4, 0.28, 0.1)
    });

    // Draw Content Box
    const contentY = margin + 50;
    const contentHeight = pageHeight - margin * 2 - 120;
    const contentWidth = pageWidth - margin * 2 - 40;

    page.drawRectangle({
      x: margin + 20,
      y: contentY,
      width: contentWidth,
      height: contentHeight,
      color: rgb(1, 0.99, 0.96),
      borderColor: isTajweed ? rgb(0.2, 0.5, 0.3) : rgb(0.7, 0.55, 0.25),
      borderWidth: 1
    });

    // Watermark / Header label inside page
    if (isTajweed) {
      page.drawRectangle({
        x: margin + 25,
        y: contentY + contentHeight - 25,
        width: contentWidth - 10,
        height: 18,
        color: rgb(0.9, 0.96, 0.92)
      });
      page.drawText('BOTIMI ME TEXHVID - REGULLAT ME NGJYRA (PROTOTIP 5 FAQE)', {
        x: margin + 35,
        y: contentY + contentHeight - 19,
        size: 8,
        font,
        color: rgb(0.15, 0.5, 0.25)
      });
    }

    // Render Verse lines
    let startY = contentY + contentHeight - 50;
    const lineGap = (contentHeight - 80) / Math.max(10, p.lines.length);

    p.lines.forEach((lineText, idx) => {
      const lineY = startY - idx * lineGap;
      
      // Draw subtle horizontal guideline
      page.drawLine({
        start: { x: margin + 25, y: lineY - 4 },
        end: { x: margin + 20 + contentWidth - 5, y: lineY - 4 },
        thickness: 0.5,
        color: rgb(0.92, 0.88, 0.82)
      });

      // Text color (Tajweed vs Normal)
      let textColor = rgb(0.1, 0.1, 0.12);
      if (isTajweed) {
        if (idx % 3 === 0) textColor = rgb(0.08, 0.45, 0.22); // Green (Ghunnah)
        else if (idx % 3 === 1) textColor = rgb(0.72, 0.15, 0.15); // Red (Madd)
        else textColor = rgb(0.12, 0.32, 0.65); // Blue (Qalqalah)
      }

      page.drawText(lineText, {
        x: margin + 35,
        y: lineY,
        size: 14,
        font,
        color: textColor
      });
    });

    // Page Footer (Arabic Page Number)
    const arabicDigits = ['١', '٢', '٣', '٤', '٥'];
    const pageNumText = `Faqja / Page ${arabicDigits[p.page - 1]} (${p.page})`;
    page.drawText(pageNumText, {
      x: pageWidth / 2 - 40,
      y: margin + 20,
      size: 10,
      font,
      color: isTajweed ? rgb(0.2, 0.5, 0.3) : rgb(0.5, 0.38, 0.15)
    });
  }

  const pdfBytes = await pdfDoc.save();
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Generated Mushaf PDF: ${outputPath}`);
}

async function main() {
  await generatePocPdf('./public/assets/mushaf/madinah-15-lines-poc.pdf', false);
  await generatePocPdf('./public/assets/mushaf/tajweed-color-poc.pdf', true);
}

main().catch(console.error);
