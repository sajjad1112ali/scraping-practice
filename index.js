const puppeteer = require("puppeteer");
const { Parser } = require("json2csv");
const fs = require("fs/promises");

const getTextArray = async (page, selector) => {
  const quotesArray = await page.$$eval(selector, (quote) =>
    quote.map((g) => ({ name: g.innerText }))
  );
  return quotesArray;
};

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: false,
      userDataDir: "./temp",
    });

    let isNextBtnAvailable = true;
    const page = await browser.newPage();
    debugger;

    await page.goto("http://quotes.toscrape.com/js/");

    const quotesArray = await getTextArray(page, "div.quote > span.text");
    const writersArray = await getTextArray(
      page,
      "div.quote > span > small.author"
    );
    const tagsArray = await getTextArray(page, "div.quote > div.tags");

    const nextBtn = await page.evaluate(() => {
      const element = document.querySelector("ul.pager > li.next > a");
      if (element) {
        return true;
      }
      return false;
    });
    if (nextBtn) await page.click("ul.pager > li.next > a");
    // await browser.close();
  } catch (error) {
    console.log(error);
  }
})();
