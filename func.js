'use strict';
const mysql = require('./bdd');
const UserAgent = require('user-agents');

module.exports = async (browser) => {
    let page;

    const sleep = (ms, dev = 1) => {
        const msWithDev = ((Math.random() * dev) + 1) * ms;
        console.log('Sleeping', msWithDev / 1000, 'sec');
        return new Promise(resolve => setTimeout(resolve, msWithDev));
    };

    async function importInBddPage(link) {
        let i = 0;
        while (i < link.length){
            await page.goto(link[i]);
            const result = await page.evaluate(() => {
                let price = document.getElementsByClassName('ncss-brand pb6-sm fs14-sm fs16-md')[0].innerText;
                let date = document.getElementsByClassName('ncss-brand pb6-sm fs14-sm fs16-md')[1].innerText;
                  return { price, date}
                });
                console.log('-----------');
                console.log(result.price);
                console.log(result.date);
                console.log('-----------');
            i++;
        }
    }

    async function importUrlFollowing() {
        await page.goto("https://www.nike.com/fr/launch/?s=upcoming")
        await page.waitFor(1000)

        const result = await page.evaluate(() => {
        let i = 0;
          let nameFuturStock = [];
          let linkFuturStock = [];
          while (i < document.getElementsByClassName('pb2-sm va-sm-t ncss-col-sm-12').length){
              let link = document.getElementsByClassName('pb2-sm va-sm-t ncss-col-sm-12')[i].lastChild.getElementsByClassName('card-link d-sm-b')[0].href;
                linkFuturStock.push(link);
                //nameFuturStock.push(document.getElementsByClassName('pb2-sm va-sm-t ncss-col-sm-12')[i].lastChild.innerText);
              i++;
          }
          return linkFuturStock
        });
          importInBddPage(result);
    }

  page = await browser.newPage();
  const userAgent = new UserAgent();
  await page.setUserAgent(userAgent.toString());
  return {
    sleep,
    importUrlFollowing,
  };
};