const request = require("request-promise");
const cheerio = require("cheerio");
const fs = require("fs/promises");

const URL = "http://quotes.toscrape.com/login";
const getCookies = (req) => {
  return req.headers["set-cookie"].map((c) => c.split(";")[0]).join(" ");
};
const getBasicHeaders = () => {
  return {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "max-age=0",
    Connection: "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded",
    Host: "quotes.toscrape.com",
    Origin: "http://quotes.toscrape.com",
    Referer: "http://quotes.toscrape.com/login",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36",
  };
};

(async () => {
  try {
    const initialRequest = await request({
      uri: URL,
      method: "GET",
      resolveWithFullResponse: true,
    });
    let cookies = getCookies(initialRequest);
    let headers = getBasicHeaders();
    headers["Cookie"] = cookies;
    let $ = cheerio.load(initialRequest.body);
    let csrfToken = $('input[name="csrf_token"]').val();

    const loginRequest = await request({
      uri: URL,
      method: "POST",
      headers,
      form: {
        csrf_token: csrfToken,
        username: "admin",
        password: "admin",
      },
      resolveWithFullResponse: true,
    });
  } catch (response) {
    cookies = getCookies(response.response);
    let headers = getBasicHeaders();
    headers["Cookie"] = cookies;
    delete headers["Content-Type"];
    const loggedInRequest = await request({
      uri: "http://quotes.toscrape.com/",
      method: "GET",
      headers,
    });
  }
})();
