async function run() {
  const publicUrl = `https://api.quran.com/api/v4/verses/by_page/600?words=true&word_fields=v2_page,code_v2,line_number,position,char_type_name,page_number&per_page=50`;
  const res = await fetch(publicUrl);
  const json = await res.json();
  const v100_6 = json.verses.find(v => v.verse_key === '100:6');
  console.log("Is 100:6 in page 600 API response?", !!v100_6);
  console.log("First verse in page 600 API response:", json.verses[0]?.verse_key);
}
run();
