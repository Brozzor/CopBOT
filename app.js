const puppeteer = require("puppeteer")
const mysql = require('./bdd');
const Copbot = require('./func');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: false })

        const copbot = await Copbot(browser);

        let args = process.argv.slice(2);

        // insertion dans la base de donnée
        //await copbot.importUrlFollowingSupreme();

        // achat 
        await copbot.buy(args[0]);

 } catch (error) {
    console.log(error);
}
    
})();