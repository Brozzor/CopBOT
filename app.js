const puppeteer = require("puppeteer")
const mysql = require('./bdd');
const func = require('./func');

const getData = async () => {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
  
    await page.goto("https://www.nike.com/fr/launch/?s=upcoming")
    await page.waitFor(1000)
      const result = await page.evaluate(() => {
          let i = 0;
          let nameFuturStock = [];
          let linkFuturStock = [];
          while (i < document.getElementsByClassName('pb2-sm va-sm-t ncss-col-sm-12').length){
              nameFuturStock.push(document.getElementsByClassName('pb2-sm va-sm-t ncss-col-sm-12')[i].lastChild.innerText);
              i++;
          }
          return { nameFuturStock };
        })
    console.log(result.nameFuturStock);
    browser.close();
  }
  
  getData();