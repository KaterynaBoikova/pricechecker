const zamokUkrURLs = require('../db/ZamokUkr.json');
const kreminURLs = require('../db/KreminLB.json');
const hlURLs = require('../db/HL.json');
const topZamokURLs = require('../db/TopZamok.json');
const ukrLockURLs = require('../db/UkrLock.json');
const kupiZamokURLs = require('../db/KupiZamok.json');
const svitZamkivURLs = require('../db/SvitZamkiv.json');
const zamochnikiURLs = require('../db/Zamochniki.json');
const urls740 = require('../db/740.json');
const HTMLParser = require('node-html-parser');
const axios = require('axios');
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const bluebird = require("bluebird");
const randomUseragent = require('random-useragent');

puppeteer.use(StealthPlugin());

const getZamokUkr = async () => {
    const gettingPrices = await bluebird.map(zamokUkrURLs, async function(item) {
        if(item.link.length !== 0){
            const browser = await puppeteer.launch({
                "timeout": 0,
                "args": [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ]});
            const userAgent = randomUseragent.getRandom();
            const page = await browser.newPage();
            await page.setUserAgent(userAgent);
            await page.setJavaScriptEnabled(true);
            await page.setRequestInterception(true);
            await page.on('request', (request) => {
                if (['image', 'stylesheet', 'font'].indexOf(request.resourceType()) !== -1)
                {request.abort();} else {request.continue();};});
            await page.setDefaultNavigationTimeout(0);
            await page.goto(item.link, {waitUntil: 'networkidle2', timeout: 0});
            const content = await page.content();
            let root = HTMLParser.parse(content.toString());
            let a = root.querySelector('a[data-qaid="buy-button"]');
            if(a===null){
                let mobile = root.querySelector('p[data-qaid="price-field"]');
                await browser.close();
                const priceString = mobile===null?"TBC": mobile.childNodes[0].childNodes[0]._rawText;
                return {
                    model: item.model,
                    priceZamokUkr: mobile===null? "TBC" : (priceString.includes('&nbsp;')? priceString.slice(0, priceString.indexOf('&nbsp;'))+priceString.slice(priceString.indexOf(';')+1) : mobile.childNodes[0].childNodes[0]._rawText),
                    link: item.link}
            }
            await browser.close();
            return {model: item.model, priceZamokUkr: a===null? "TBA" : (a._attrs['data-product-discounted-price']? a._attrs['data-product-discounted-price']:a._attrs['data-product-price'] ), link: item.link}
        }
        return {model: item.model, priceZamokUkr: "N/A", link: "N/A" }
    }, {concurrency: 5});
    return gettingPrices;
};

const getKremin = async () => {
const gettingPrices  = kreminURLs.map(item=>{
    if(item.link.length !== 0){
    return axios.get(item.link)
        .then(response =>{
                let root = HTMLParser.parse(response.data.toString());
                let span = root.querySelector('span.jsTotal');
                return {model: item.model, priceKremin: span===null?"TBA":span.childNodes[0]._rawText, link: item.link}
            }
        )}
    return {model: item.model, priceKremin: "N/A", link: item.link}
});
    const gettingRes = Promise.all(gettingPrices);
    return gettingRes;
};
const getHL = async () => {
    const gettingPrices  = hlURLs.map(item=>{
        if(item.link.length !== 0){
        return axios.get(item.link)
            .then(response =>{
                    let root = HTMLParser.parse(response.data.toString());
                    let div = root.querySelector('div.price');
                    return {model: item.model, priceHouseLock: div===null?"TBA":div.childNodes[0]._rawText, link: item.link}
                }
            )}
        return {model: item.model, priceHouseLock: "N/A", link: item.link}
    });
    const gettingRes = Promise.all(gettingPrices);
    return gettingRes;
};
const getTopZamok = async () => {
    const gettingPrices = await bluebird.map(topZamokURLs, async function(item) {
        if(item.link.length !== 0){
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
            return {model: item.model, priceTopZamok: div === null? "TBC" : div.childNodes[0].childNodes[0]._rawText, link: item.link}
        }
        return {model: item.model, priceTopZamok: "N/A", link: item.link}
    }, {concurrency: 5});
        return gettingPrices;

};
const getKupiZamok = async () => {
    const gettingPrices  = kupiZamokURLs.map(item=>{
        if(item.link.length !== 0){
        return axios.get(item.link)
            .then(response =>{
                    let root = HTMLParser.parse(response.data.toString());
                    let meta = root.querySelector('meta[itemprop="price"]');

                    return {model: item.model, priceKupiZamok: meta===null? "TBA" : meta._attrs.content, link: item.link}
                }
            )}
        return {model: item.model, priceKupiZamok: "N/A", link: item.link}
    });
    const gettingRes = Promise.all(gettingPrices);
    return gettingRes;
};
const getUkrLock = async () => {
    const gettingPrices  = ukrLockURLs.map(item=>{
        if(item.link.length !== 0){
        return axios.get(item.link)
            .then(response =>{
                    let root = HTMLParser.parse(response.data.toString());
                    let div = root.querySelector('div.product-price');
                    return {model: item.model, priceUkrLock: div===null?"N/A":div.childNodes[0]._rawText, link: item.link}
                }
            )}
        return {model: item.model, priceUkrLock: "N/A", link: item.link}
    });
    const gettingRes = Promise.all(gettingPrices);
    return gettingRes;
};
const getSvitZamkiv = async () => {
    const gettingPrices  = svitZamkivURLs.map(item=>{
        if(item.link.length !== 0){
        return axios.get(item.link)
            .then(response =>{
                    let root = HTMLParser.parse(response.data.toString());
                    let span = root.querySelector('span.priceVal');
                    return {model: item.model, priceSvitZamkiv: span===null?"TBA":span.childNodes[0]._rawText, link: item.link}
                }
            )}
        return {model: item.model, priceSvitZamkiv: "N/A", link: item.link}
    });
    const gettingRes = Promise.all(gettingPrices);
    return gettingRes;
};
const getZamochniki = async () => {
    const gettingPrices  = zamochnikiURLs.map(item=>{
        if(item.link.length !== 0){
        return axios.get(item.link)
            .then(response =>{
                    let root = HTMLParser.parse(response.data.toString());
                    let span = root.querySelector('span.price-value');
                    return {model: item.model, priceZamochniki: span===null?"TBA":span._attrs.content, link: item.link}
                }
            )}
        return {model: item.model, priceZamochniki: "N/A", link: item.link}
    });
    const gettingRes = Promise.all(gettingPrices);
    return gettingRes;
};
const get740 = async () => {
    const gettingPrices  = urls740.map(item=>{
        if(item.link.length !== 0){
        return axios.get(item.link)
            .then(response =>{
                    let root = HTMLParser.parse(response.data.toString());
                    let meta = root.querySelector('meta[itemprop="price"]');
                    return {model: item.model, price740: meta===null?"TBA":meta._attrs.content, link: item.link}
                }
            )}
        return {model: item.model, price740: "N/A", link: item.link}
    });
    const gettingRes = Promise.all(gettingPrices);
    return gettingRes;
};

module.exports = {
    getZamokUkr,
    getKremin,
    getHL,
    getTopZamok,
    getKupiZamok,
    getUkrLock,
    getSvitZamkiv,
    getZamochniki,
    get740,
}