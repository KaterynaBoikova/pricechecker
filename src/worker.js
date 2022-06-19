const express = require('express');
const {asyncWrapper} = require("./helpers/asyncWrapper");
const router = express.Router();
let Queue = require('bull');
const process = require("process");
const bluebird = require("bluebird");
const zamokUkrURLs = require("./db/ZamokUkr.json");
const puppeteer = require("puppeteer-extra");
const randomUseragent = require("random-useragent");
const HTMLParser = require("node-html-parser");
const axios = require("axios");
let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
let workQueue = new Queue('work', REDIS_URL);
const topZamokURLs = require("./db/TopZamok.json");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require('fs');
puppeteer.use(StealthPlugin());

router.post('/zamokukr/job', async (req, res) => {
    let job = await workQueue.add("zamokUkr");
    res.json({ id: job.id });
});

router.post('/topzamok/job',async (req, res) => {
    let job = await workQueue.add("topzamok");
    res.json({ id: job.id });
});

workQueue.process("zamokUkr", async (job, done)=>{
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
    let data = JSON.stringify(gettingPrices);
    fs.writeFileSync('zamokUkr.json', data);
    return gettingPrices;

    done();
})
workQueue.process("topzamok", async (job, done)=>{
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
            let data = JSON.stringify(gettingPrices);
            fs.writeFileSync('topZamok.json', data);
    return gettingPrices;
    done();
})


const marathonQueue = new Queue('marathon', 'redis://127.0.0.1:6379');
marathonQueue.getJobCounts().then(res => console.log('Job Count:\n',res));

workQueue.on('global:completed', (jobId, result) => {
    console.log(`Job completed with result ${result}`);
});

module.exports = router;
