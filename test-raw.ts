async function run() {
  const publicUrl = `https://api.quran.com/api/v4/verses/by_page/599?words=true&word_fields=v2_page,code_v2,line_number,position,char_type_name,page_number&per_page=50`;
  const res = await fetch(publicUrl);
  const json = await res.json();
  const v100_6 = json.verses.find(v => v.verse_key === '100:6');
  console.log(JSON.stringify(v100_6, null, 2));
}
run();
