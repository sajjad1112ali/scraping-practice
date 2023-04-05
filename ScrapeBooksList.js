const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs/promises");

const URL = "http://books.toscrape.com";
const writeCSV = async (data, categoryName) => {
  const csvData = data
    .map(function (d) {
      return d.join(",");
    })
    .join("\r\n");
  console.log(`Creating ${categoryName}.csv file with ${data.length} records`);
  await fs.writeFile(`./data/${categoryName}.csv`, csvData);
};
const extractCategory = async (url, data) => {
  const catResponse = await request(url);
  let categoryPageCheerio = cheerio.load(catResponse);
  const isPaginationAvailable = categoryPageCheerio("li.next > a");
  
  console.log(isPaginationAvailable.length);

  const re = new RegExp(",", "g");

  let items = categoryPageCheerio("ol.row > li");
  const itemsLength = items.length;
  //extractItemData();
  for (let index = 0; index < itemsLength; index++) {
    const itemData = [];
    const item = items[index];
    const image = categoryPageCheerio(item)
      .find("div.image_container > a > img")
      .attr("src");
    const title = categoryPageCheerio(item)
      .find("h3 > a")
      .attr("title")
      .replace(re, "~");
    const price = categoryPageCheerio(item)
      .find(".product_price > p.price_color")
      .text();
    itemData.push(image);
    itemData.push(title);
    itemData.push(price);
    data.push(itemData);
  }

  if (isPaginationAvailable.length){
    const paginationURL = isPaginationAvailable.attr("href");
    const arrOfURL =  url.split("/");
    const removedLastItem = arrOfURL.slice(0, -1);
    const baseURL = removedLastItem.join("/");
    await extractCategory(`${baseURL}/${paginationURL}`, data)
    }
    return data;
};
(async () => {
  const response = await request(URL);
  let mainCheerio = cheerio.load(response);
  const navList = mainCheerio("ul.nav.nav-list > li > ul > li");
  const myTargetArr = [navList[3]];
  const newArr = myTargetArr.splice(0, 1);
  for (nav of navList) {
    const url = mainCheerio(nav).find("a").attr("href");
    const categoryName = mainCheerio(nav).find("a").text().trim();
    console.log(`categoryName = ${categoryName}`);
    const data = [["Image URL", "Title", "Price"]];
    await extractCategory(`${URL}/${url}`, data);
    await writeCSV(data, categoryName);
  }
})();
