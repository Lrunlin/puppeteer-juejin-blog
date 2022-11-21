import { load } from "cheerio";

/** 删除包含掘金二字的元素*/
function removeJueJinKeyWord(content: string) {
  let $ = load(content);
  $("body>*").each((i, el) => {
    if ($(el).text().includes("掘金")) {
      $(el).remove();
    }
  });
  return $("body").html() + "";
}
export default removeJueJinKeyWord;
