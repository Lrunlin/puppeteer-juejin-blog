import Browser from "../modules/browser";
import mysql from "../modules/mysql";
import { load } from "cheerio";
import sleep from "./sleep";
import switchImagePath from "./switchImagePath";
import downLoadImgae from "./downLoadImgae";
import language from "./language";
import axios from "axios";
import uploadImage from "./uploadImage";
import fs from "fs";
import allowSetCover from "./allowSetCover";
import changeLinkHref from "./changeLinkHref";
import removeJuejinTitle from "./removeJuejinTitle";
import { setCount } from "../modules/count";
import { Page } from "puppeteer";
import config from "../config";

let tagListawait = [] as { id: number; name: string }[];
mysql.query(`select id,name from tag;`).then(([rows]) => {
  tagListawait = rows as { id: number; name: string }[];
});

async function save(url: string) {
  console.log(`开始:${url} 的抓取`);
  let browser = await Browser();
  // 如果有掘金文章页面，就不在创建
  let page = await browser.newPage();

  let status = await page
    .goto(url, { timeout: 0, referer: `https://juejin.cn/` })
    .then(r => (r?.status() == 200 ? r : (false as false)))
    .catch(() => false as false);

  if (!status) {
    await page.close();
    console.log(`响应了错误的Http状态码，等待2分钟`);
    await sleep(120_000);
    return;
  }

  await page.waitForSelector("main");
  await page.waitForSelector(".tag-list-box");
  await sleep(200);
  console.log("判断标签");
  //判断标签数
  let _tags = await (
    await page.$$eval(".tag-list-box .item", el => el.map(item => (item as any).innerText))
  )
    .map((item: string) => {
      return (
        tagListawait.find(_item =>
          _item.name.toLocaleLowerCase().includes(item.toLocaleLowerCase())
        )?.id ||
        tagListawait.find(_item =>
          item.toLocaleLowerCase().includes(_item.name.toLocaleLowerCase())
        )?.id
      );
    })
    .filter(item => item);

  if (!_tags.length) {
    console.log(`tag数量为0，不保存`);
    await sleep(1000);
    await page.close();
    await sleep(200);
    return;
  }
  let $ = load(await page.content());

  await sleep(2678);

  //滚动到底部
  await page.evaluate(() => {
    return new Promise((resolve, reject) => {
      let _height = -1;
      let timer = setInterval(() => {
        let height = document.documentElement.scrollTop || document.body.scrollTop;
        if (height == _height) {
          clearInterval(timer);
          resolve("");
        }
        _height = height;
        (document.getElementById("comment-box") as HTMLDivElement).scrollIntoView({
          behavior: "smooth",
        });
      }, 600);
    });
  });

  await sleep(1678);

  //开始处理数据
  let title = $("title").eq(0).text().replace(/\n/g, "").replace(" - 掘金", "").substring(0, 190);

  let coverSrc = $(".article-hero").attr("src");
  let content = $(".markdown-body").remove("style").html() as string;
  content = await switchImagePath(changeLinkHref(language(content)));
  if (config.removeJueJinKeyWord) {
    content = removeJuejinTitle(content);
  }

  let description = $("meta[name=description]").attr("content")?.substring(0, 190) || null;
  let cover = coverSrc
    ? await uploadImage(allowSetCover(await downLoadImgae(coverSrc)), "cover")
    : null;
  let tag = ([...new Set(_tags)] as number[]).slice(0, 5);

  console.log("开始创建文章");
  return axios
    .post("/article", {
      content,
      title,
      cover_file_name: cover,
      description,
      tag,
      state: 1,
      reprint: url,
    })
    .then(res => {
      setCount();
      return res.data;
    })
    .catch(err => {
      console.log("创建文章失败");
      fs.writeFileSync(`log/${+new Date()}.txt`, `创建文章错误\n${JSON.stringify(err)}`);
      return false;
    })
    .finally(async () => {
      console.log(`结束:${url} 的抓取`);
      await (page as Page).close();
      await sleep(1200);
    });
}
export default save;
