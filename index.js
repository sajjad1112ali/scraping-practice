const request = require('request-promise');
const cheerio = require('cheerio');
const fs = require("fs/promises");

const URL = 'http://books.toscrape.com';
const writeCSV = async (data) => {
    const csvData =  data.map(function(d){
       return d.join(",");
   }).join("\r\n");
    await fs.writeFile("data.csv", csvData);
}

(async () => {
    const response = await request(URL);
    let $ = cheerio.load(response);
    const data = [['Image URL', "Title", "Price"]];
    const re = new RegExp(',', 'g');
     let items = $('ol.row > li');
     const itemsLength = items.length;
     extractItemData();
     await writeCSV(data);

    function extractItemData() {
        for (let index = 0; index < itemsLength; index++) {
            const itemData = [];
            const item = items[index];
            const image = $(item).find('div.image_container > a > img').attr('src');
            const title = $(item).find('h3 > a').attr('title').replace(re, '~');
            const price = $(item).find('.product_price > p.price_color').text();
            itemData.push(image);
            itemData.push(title);
            itemData.push(price);
            data.push(itemData);
        }
    }
})()