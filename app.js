const puppeteer = require("puppeteer");
const mysql = require("./bdd");
const Copbot = require("./func");

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: true });

    const copbot = await Copbot(browser);

    let args = process.argv.slice(2);
    await copbot.checkAllCat();

    // insertion dans la base de donnée
    await copbot.importUrlFollowingSupreme();
    // suppression des produits inexesistant
    await copbot.delOldItems();
    await copbot.sleep(10000);
  } catch (error) {
    console.log(error);
  } finally {
    process.exit(0);
  }
})();
