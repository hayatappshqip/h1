import fs from 'fs';
fetch('https://api.alquran.cloud/v1/surah/2/editions/quran-uthmani,sq.nahi')
  .then(res => res.json())
  .then(json => {
    const arabic = json.data[0];
    const albanian = json.data[1];
    console.log(arabic.name);
    console.log(arabic.ayahs[0].text);
    console.log(albanian.ayahs[0].text);
  });
