const puppeteer = require("puppeteer");
const { Parser } = require("json2csv");
const fs = require("fs/promises");

const getTextArray = async (page, selector) => {
  const selectorArray = await page.$$eval(selector, (s) =>
    s.map((g) => ({ value: g.innerText }))
  );
  return selectorArray;
};

const getTagArray = async (page, selector) => {
  const els = await page.$$(selector);
  let tagsOfPost = [];
  for (let i = 0; i < els.length; i++) {
    const link = await els[i].$$eval("a", (a) => a.map((b) => b.innerText));
    tagsOfPost.push(link);
  }
  return tagsOfPost;
};
let sNo = 0;
const getQuotesObject = (quotes, writers, tags, data) => {
  quotes.map((quote, index) => {
    
    data.push({
      SNo: ++sNo,
      quote: quote.value,
      writer: writers[index].value,
      tags: tags[index].join(","),
    });
  });
  return data;
};

const getQuotesData = async (page, data) => {
  const quotesArray = await getTextArray(page, "div.quote > span.text");
  const writersArray = await getTextArray(
    page,
    "div.quote > span > small.author"
  );
  const tagsOfPost = await getTagArray(page, "div.quote > div.tags");
  const nextBtn = await page.evaluate(() => {
    const element = document.querySelector("ul.pager > li.next > a");
    if (element) {
      return true;
    }
    return false;
  });
  getQuotesObject(quotesArray, writersArray, tagsOfPost, data);
  if (nextBtn) {
    await page.click("ul.pager > li.next > a");
    await getQuotesData(page, data);
  }
  return data;
};

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: false,
      userDataDir: "./temp",
    });

    let csvData = [];
    const page = await browser.newPage();

    await page.goto("http://quotes.toscrape.com/js/");

    await getQuotesData(page, csvData);

    const parser = new Parser();
    const csv = parser.parse(csvData);
    await fs.writeFile(`./data/allQuotes.csv`, csv);
    await browser.close();
  } catch (error) {
    console.log(error);
  }
})();
