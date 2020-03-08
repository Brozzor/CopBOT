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
    let res = true;
    const nb = await mysql.query( `SELECT count(*) as nb FROM cop_stuff WHERE id_product = '${idProduct}'` );
        if (nb[0].nb != '0')
        {
          res = true;
        }else{
          res = false;
        }
    return res;
  }

  async function insertCopStuff(site,idProduct, link, title, model, price, imgLink, available_date) {

   if (!await checkProductIsExist(idProduct)){
    let titleCheck = title.replace(/'/g, '\\\\\"');
    let modelCheck = model.replace(/'/g, '\\\\\"');
    let sqlRequest = `INSERT INTO cop_stuff(id_website,id_product,link,title,model,price,imgLink,available_date) VALUES('${site}','${idProduct}','${link}','${titleCheck}','${modelCheck}','${price}','${imgLink}','${available_date}')`;
    mysql.conn.query(sqlRequest);
   }

  }

  async function importInfo(link, site) {
    let i = 0;
    while (i < link.length) {
      await page.goto(link[i]);
      //await page.waitForNavigation();
      let result, price, date, idProduct, title, model, img, website;
      if (site == "nike") {
        result = await page.evaluate(() => {
          price = document.getElementsByClassName("ncss-brand pb6-sm fs14-sm fs16-md")[0].innerText;
          date = document.getElementsByClassName("ncss-brand pb6-sm fs14-sm fs16-md")[1].innerText;
          return { price, date };
        });
        website = '2';
      } else if (site == "supreme") {
        result = await page.evaluate(() => {
          price = document.getElementsByClassName("price")[0].lastElementChild.innerText;
          title = document.getElementsByClassName("protect")[0].innerText;
          model = document.getElementsByClassName("style protect")[0].innerText;
          img = document.getElementById("img-main").src;
          date = "rien";
          return { price, date, title, model, img };
        });
        website = '1';
        result.price = await extractNbr(result.price);
        idProduct = link[i].split("/")[5] + "/" + link[i].split("/")[6];
      }
      //console.log(result.title)
      await insertCopStuff(website,idProduct, link[i], result.title, result.model, result.price, result.img, "0");
      i++;
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
