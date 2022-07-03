const zamokUkrURLs = require('../db/ZamokUkr.json');
const topZamokURLs = require('../db/TopZamok.json');
const HTMLParser = require('node-html-parser');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const bluebird = require("bluebird");
const randomUseragent = require('random-useragent');

puppeteer.use(StealthPlugin());

const jobZamokUkr = async (job) => {
    let progress = 0;

    const gettingPrices = await bluebird.map(zamokUkrURLs, async function(item) {
        for (i=0; i<85; i++) {

            if (item.link.length !== 0) {
                const browser = await puppeteer.launch({
                    "timeout": 0,
                    "args": [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                    ]
                });
                const userAgent = randomUseragent.getRandom();
                const page = await browser.newPage();
                await page.setUserAgent(userAgent);
                await page.setJavaScriptEnabled(true);
                await page.setRequestInterception(true);
                await page.on('request', (request) => {
                    if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1) {
                        request.abort();
                    } else {
                        request.continue();
                    }
                    ;
                });
                await page.setDefaultNavigationTimeout(0);
                await page.goto(item.link, {waitUntil: 'networkidle2', timeout: 0});
                const content = await page.content();
                let root = HTMLParser.parse(content.toString());
                let a = root.querySelector('a[data-qaid="buy-button"]');
                if (a === null) {
                    let mobile = root.querySelector('p[data-qaid="price-field"]');
                    await browser.close();
                    const priceString = mobile === null ? "TBC" : mobile.childNodes[0].childNodes[0]._rawText;
                    progress += 1;
                    job.progress(Math.round((progress*100)/85));
                    return {
                        model: item.model,
                        priceZamokUkr: mobile === null ? "TBC" : (priceString.includes('&nbsp;') ? priceString.slice(0, priceString.indexOf('&nbsp;')) + priceString.slice(priceString.indexOf(';') + 1) : mobile.childNodes[0].childNodes[0]._rawText),
                        link: item.link
                    }
                }
                await browser.close();
                progress += 1;
                job.progress(Math.round((progress*100)/85));
                return {
                    model: item.model,
                    priceZamokUkr: a === null ? "TBA" : (a._attrs['data-product-discounted-price'] ? a._attrs['data-product-discounted-price'] : a._attrs['data-product-price']),
                    link: item.link
                }
            }
            progress += 1;
            job.progress(Math.round((progress*100)/85));
            return {model: item.model, priceZamokUkr: "N/A", link: "N/A"}
        }
    }, {concurrency: 5});
    return gettingPrices;
};

const jobTopZamok = async (job) => {
    let progress = 0;
        const gettingPrices = await bluebird.map(topZamokURLs, async function(item) {

            for (i=0; i<85; i++){
            if(item.link.length !== 0){
                console.log(`started ${item.model}`);
                const browser = await puppeteer.launch({
                    "timeout": 0,
                    "args": [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                    ]
                });
                const page = await browser.newPage();
                await page.setRequestInterception(true);
                await page.on('request', (request) => {
                    if (['image', 'stylesheet', 'font', 'script'].indexOf(request.resourceType()) !== -1)
                    {request.abort();} else {request.continue();};});
                await page.setDefaultNavigationTimeout(0);
                await page.goto(item.link, {waitUntil: 'networkidle2', timeout: 0});
                const content = await page.content();
                let root = HTMLParser.parse(content.toString());
                let div = root.querySelector('div.total-price');
                await browser.close();
                console.log(`ended ${item.model}`);
                progress+=1;
                job.progress(Math.round((progress*100)/85));
                return {model: item.model, priceTopZamok: div === null? "TBC" : div.childNodes[0].childNodes[0]._rawText, link: item.link}
            }
            progress+=1;
                job.progress(Math.round((progress*100)/85));
            return {model: item.model, priceTopZamok: "N/A", link: "N/A"}
            }
        }, {concurrency: 5});
    return gettingPrices;

};

module.exports = {
    jobZamokUkr,
    jobTopZamok,
}
