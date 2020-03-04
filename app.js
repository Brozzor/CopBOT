'use strict';
const puppeteer = require("puppeteer")
const mysql = require('./bdd');
const Copbot = require('./func');

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: false })

        //const page = await browser.newPage()

        const copbot = await Copbot(browser);
        copbot.importUrlFollowing();

 } catch (error) {
    console.log(error);
}
    
})();