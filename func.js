const mysql = require("./bdd");
const UserAgent = require("user-agents");

module.exports = async browser => {
  let page;

  const sleep = (ms, dev = 1) => {
    const msWithDev = (Math.random() * dev + 1) * ms;
    console.log("Sleeping", msWithDev / 1000, "sec");
    return new Promise(resolve => setTimeout(resolve, msWithDev));
  };
  async function extractNbr(str) {
    return Number(str.replace(/[^\d]/g, ""));
  }

  async function checkProductIsExist(idProduct) {
    let sqlRequest = `SELECT count(*) as nb FROM cop_stuff WHERE id_product = '${idProduct}'`;
    mysql.conn.query(sqlRequest, function(err, rows, fields) {
        if (rows[0].nb != '0')
        {
            return true;
        }
        return false;
    });
  }

  async function insertCopStuff(idProduct, link, title, model, price, imgLink, available_date) {
   await checkProductIsExist(idProduct);
    /*let sqlRequest = "SELECT * FROM number ORDER BY id DESC LIMIT 10";
    mysql.conn.query(sqlRequest, function(err, rows, fields) {
     
    });*/
  }

  async function importInfo(link, site) {
    let i = 0;
    while (i < link.length) {
      await page.goto(link[i]);
      let result, price, date, idProduct, title, model, img;
      if (site == "nike") {
        result = await page.evaluate(() => {
          price = document.getElementsByClassName("ncss-brand pb6-sm fs14-sm fs16-md")[0].innerText;
          date = document.getElementsByClassName("ncss-brand pb6-sm fs14-sm fs16-md")[1].innerText;
          return { price, date };
        });
      } else if (site == "supreme") {
        result = await page.evaluate(() => {
          price = document.getElementsByClassName("price")[0].lastElementChild.innerText;
          title = document.getElementsByClassName("protect")[0].innerText;
          model = document.getElementsByClassName("style protect")[0].innerText;
          img = document.getElementById("img-main").src;
          date = "rien";
          return { price, date, title, model, img };
        });
        result.price = await extractNbr(result.price);
        idProduct = link[i].split("/")[5] + "/" + link[i].split("/")[6];
      }
      await insertCopStuff(idProduct, link[i], result.title, result.model, result.price, result.img, "0");
      i++;
      await sleep(1000);
    }
  }

  async function importUrlFollowing() {
    await page.goto("https://www.nike.com/fr/launch/?s=upcoming");
    await page.waitFor(1000);

    const result = await page.evaluate(() => {
      let i = 0;
      let linkFuturStock = [];
      while (i < document.getElementsByClassName("pb2-sm va-sm-t ncss-col-sm-12").length) {
        let link = document.getElementsByClassName("pb2-sm va-sm-t ncss-col-sm-12")[i].lastChild.getElementsByClassName("card-link d-sm-b")[0].href;
        linkFuturStock.push(link);
        //nameFuturStock.push(document.getElementsByClassName('pb2-sm va-sm-t ncss-col-sm-12')[i].lastChild.innerText);
        i++;
      }
      return linkFuturStock;
    });
    importInfo(result, "nike");
  }

  async function importUrlFollowingSupreme() {
    await page.goto("https://www.supremenewyork.com/shop/all");
    await page.waitFor(1000);

    const result = await page.evaluate(() => {
      let i = 0;
      let linkFuturStock = [];
      while (i < document.getElementsByClassName("inner-article").length) {
        let link = document.getElementsByClassName("inner-article")[i].lastChild.href;
        linkFuturStock.push(link);
        //nameFuturStock.push(document.getElementsByClassName('pb2-sm va-sm-t ncss-col-sm-12')[i].lastChild.innerText);
        i++;
      }
      return linkFuturStock;
    });
    importInfo(result, "supreme");
  }

  page = await browser.newPage();
  const userAgent = new UserAgent();
  await page.setUserAgent(userAgent.toString());
  return {
    sleep,
    importUrlFollowing,
    importUrlFollowingSupreme
  };
};
