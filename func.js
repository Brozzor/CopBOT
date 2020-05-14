const mysql = require("./bdd");
const UserAgent = require("user-agents");
const fetch = require("node-fetch");

module.exports = async browser => {
  let page;
  let tempProductNow = [];
  let tempProductDel = [];

  const sleep = (ms, dev = 1) => {
    const msWithDev = (Math.random() * dev + 1) * ms;
    console.log("Sleeping", msWithDev / 1000, "sec");
    return new Promise(resolve => setTimeout(resolve, msWithDev));
  };

  async function extractNbr(str) {
    return Number(str.replace(/[^\d]/g, ""));
  }

  async function checkAllCat() {
    await page.goto("https://www.supremenewyork.com/shop/all");
    result = await page.evaluate(() => {
      let i = 2;
      let board = [];
      while (i < document.getElementById("nav-categories").getElementsByTagName("a").length) {
        catname = document.getElementById("nav-categories").getElementsByTagName("a")[i].innerText;
        catnameClean = catname.replace("/", "-");
        board.push(catnameClean);
        //const nb = await mysql.query( `SELECT * FROM cat_stuff WHERE nom = '${idProduct}'` );
        i++;
      }
      return board;
    });
    let i = 0;
    while (i < result.length) {
      const nb = await mysql.query(`SELECT count(*) as nb FROM cat_stuff WHERE name = '${result[i]}'`);
      if (nb[0].nb == "0") {
        let sqlRequest = `INSERT INTO cat_stuff(name) VALUES('${result[i]}')`;
        mysql.conn.query(sqlRequest);
      }

      i++;
    }
  }

  async function delOldItems() {
    let i = 0;
    const row = await mysql.query(`SELECT id_product as id FROM cop_stuff`);
    while (i < row.length) {
      let j = 0;
      let finding = true;
      while (j < tempProductNow.length){
        if (row[i].id == tempProductNow[j]){
          finding = false;
          break;
        }
        j++;
      }
      if (finding){
        tempProductDel.push(row[i].id);
      }
      i++;
    }
    i = 0;
    while(i < tempProductDel.length){
      let sqlRequest = `DELETE FROM cop_stuff WHERE id_product = '${tempProductDel[i]}'`;
      mysql.conn.query(sqlRequest);
      i++;
    }
    return false;
  }
  
  async function checkProductIsExist(idProduct) {
    let res = true;
    const nb = await mysql.query(`SELECT count(*) as nb FROM cop_stuff WHERE id_product = '${idProduct}'`);
    if (nb[0].nb != "0") {
      res = true;
    } else {
      res = false;
    }
    return res;
  }

  async function insertCopStuff(site, idProduct, catProduct, link, title, model, price, imgLink, available_date) {
    if (!(await checkProductIsExist(idProduct))) {
      const idcat = await mysql.query(`SELECT id FROM cat_stuff WHERE name = '${catProduct}' LIMIT 1`);
      let titleCheck = title.replace(/'/g, '\\\\"');
      let modelCheck = model.replace(/'/g, '\\\\"');
      
      let sqlRequest = `INSERT INTO cop_stuff(id_website,id_product,cat_id,link,title,model,price,imgLink,available_date) VALUES('${site}','${idProduct}','${idcat[0].id}','${link}','${titleCheck}','${modelCheck}','${price}','${imgLink}','${available_date}')`;
      mysql.conn.query(sqlRequest);
    }
    tempProductNow.push(idProduct);
    return false;
  }

  async function importInfo(link, site) {
    let i = 0;
    while (i < link.length) {
      await page.goto(link[i]);
      //await page.waitForNavigation();
      let result, price, date, idProduct, title, model, img, website, catProduct;
      if (site == "nike") {
        result = await page.evaluate(() => {
          price = document.getElementsByClassName("ncss-brand pb6-sm fs14-sm fs16-md")[0].innerText;
          date = document.getElementsByClassName("ncss-brand pb6-sm fs14-sm fs16-md")[1].innerText;
          return { price, date };
        });
        website = "2";
      } else if (site == "supreme") {
        result = await page.evaluate(() => {
          price = document.getElementsByClassName("price")[0].lastElementChild.innerText;
          title = document.getElementsByClassName("protect")[0].innerText;
          model = document.getElementsByClassName("style protect")[0].innerText;
          img = document.getElementById("img-main").src;
          date = "rien";
          return { price, date, title, model, img };
        });
        website = "1";
        result.price = await extractNbr(result.price);
        idProduct = link[i].split("/")[5] + "/" + link[i].split("/")[6];
        catProduct = link[i].split("/")[4];
      }

      await insertCopStuff(
        website,
        idProduct,
        catProduct,
        link[i],
        result.title,
        result.model,
        result.price,
        result.img,
        "0"
      );
      //console.log(i);
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
        let link = document
          .getElementsByClassName("pb2-sm va-sm-t ncss-col-sm-12")
          [i].lastChild.getElementsByClassName("card-link d-sm-b")[0].href;
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
    await importInfo(result, "supreme");
  }

  async function times() {
    const response = await fetch('https://www.supremenewyork.com/mobile_stock.json');
    let json = await response.json();
    json = json.products_and_categories.new
    let i = 0;
    while (i < json.length){
      const resItems = await fetch('https://www.supremenewyork.com/shop/' + json[i] + '.json');
      let jsonItems = await resItems.json();
      console.log('--------')
      console.log(json[i])
      console.log(jsonItems)
      console.log('--------')
      i++;
    }
    json = json.products_and_categories.new[1];

    console.log(json.products_and_categories.new[1]);
  }

  page = await browser.newPage();
  const userAgent = new UserAgent();
  await page.setUserAgent(userAgent.toString());
  return {
    sleep,
    importUrlFollowing,
    importUrlFollowingSupreme,
    checkAllCat,
    delOldItems,
    times
  };
};
