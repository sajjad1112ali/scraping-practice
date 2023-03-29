const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs/promises");

const URL =
  "https://www.instagram.com/api/v1/users/web_profile_info/?username=safridiofficial";
const writeCSV = async (data, name) => {
  const csvData = data
    .map(function (d) {
      return d.join(",");
    })
    .join("\r\n");

  console.log(`Creating ${name}.csv file with ${data.length} records`);
  await fs.writeFile(`./data/${name}.csv`, csvData);
};
(async () => {
  const response = await request({
    uri: URL,
    method: "GET",
    headers: {
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br",
      "accept-language": "en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7",
      cookie:
        "ig_nrcb=1; mid=ZCPwbwAEAAHSBBRhOGR1hDUhixfq; ig_did=F849BF4A-3A20-4F58-A2C4-EA8C1474BE2D; csrftoken=EIvttBzo5qSoGCYirYoi8EofYzRc0oiV",
      referer: "https://www.instagram.com/safridiofficial/",
      "sec-ch-prefers-color-scheme": "light",
      "sec-ch-ua":
        '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "Linux",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
      "viewport-width": "718",
      "x-asbd-id": "198387",
      "x-csrftoken": "EIvttBzo5qSoGCYirYoi8EofYzRc0oiV",
      "x-ig-app-id": "936619743392459",
      "x-ig-www-claim": "0",
      "x-requested-with": "XMLHttpRequest",
    },
    resolveWithFullResponse: true,
    gzip: true,
  });
  const body = JSON.parse(response.body);
  const {
    data: { user },
  } = body;
  const {
    biography,
    edge_followed_by: { count: followedBy },
    edge_follow: { count: following },
    full_name,
    profile_pic_url,
    edge_owner_to_timeline_media: { count: noOfPosts },
  } = user;
  const profilePicURL = decodeURI(profile_pic_url);
  const csvData = [
    ["name", "Biography", "Profile Pic URL", "Followed By", "Following", "Total Posts"],
  ];
  const data = [full_name, biography, profilePicURL, followedBy, following, noOfPosts];
  csvData.push(data);
  console.log(csvData);
  await writeCSV(csvData, "Insta data");
})();
