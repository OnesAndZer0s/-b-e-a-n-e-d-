// https://docs.google.com/forms/d/e/1FAIpQLSejEJBfcqY3aL6chohfpBGTQCoKxEvYvzSHmMXO_G7zcmVbbg/viewform
let args = process.argv.slice(2);

const puppeteer = require('puppeteer-extra');

var iteration = 25;
var reset = true;

// function delay(time) {
//     return new Promise(function(resolve) {
//         setTimeout(resolve, time);
//     });
// }

// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker');
puppeteer.use(AdblockerPlugin({blockTrackers: true}));

async function run() {

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        executablePath: "/opt/google/chrome/google-chrome",
        args: [
            '--user-data-dir=profile',
            //"--disable-dev-profile",
            '--no-sandbox', '--disable-setuid-sandbox',
            "--password-store=basic"
        ]
    });

        var page = (await browser.pages())[0];
        await page.goto("https://docs.google.com/forms/d/e/1FAIpQLSejEJBfcqY3aL6chohfpBGTQCoKxEvYvzSHmMXO_G7zcmVbbg/viewform");
        await page.waitForSelector("#mG61Hd > div.freebirdFormviewerViewFormCard.exportFormCard > div > div.freebirdFormviewerViewItemList > div:nth-child(1) > div > div > div.freebirdFormviewerComponentsQuestionRadioRoot > div:nth-child(2) > div > span > div > div:nth-child(1) > label > div", { visible: true });
        await page.click("#mG61Hd > div.freebirdFormviewerViewFormCard.exportFormCard > div > div.freebirdFormviewerViewItemList > div:nth-child(1) > div > div > div.freebirdFormviewerComponentsQuestionRadioRoot > div:nth-child(2) > div > span > div > div:nth-child(1) > label > div");
        await delay(250);
        await page.waitForSelector("#mG61Hd > div.freebirdFormviewerViewFormCard.exportFormCard > div > div.freebirdFormviewerViewItemList > div:nth-child(2) > div > div > div.freebirdFormviewerComponentsQuestionRadioRoot > div:nth-child(2) > div > span > div > div:nth-child(1) > label > div", { visible: true });
        await page.click("#mG61Hd > div.freebirdFormviewerViewFormCard.exportFormCard > div > div.freebirdFormviewerViewItemList > div:nth-child(2) > div > div > div.freebirdFormviewerComponentsQuestionRadioRoot > div:nth-child(2) > div > span > div > div:nth-child(1) > label > div");
        await delay(250);
        await page.waitForSelector("#mG61Hd > div.freebirdFormviewerViewFormCard.exportFormCard > div > div.freebirdFormviewerViewItemList > div:nth-child(3) > div > div > div.freebirdFormviewerComponentsQuestionRadioRoot > div:nth-child(2) > div > span > div > div:nth-child(3) > label > div", { visible: true });
        await page.click("#mG61Hd > div.freebirdFormviewerViewFormCard.exportFormCard > div > div.freebirdFormviewerViewItemList > div:nth-child(3) > div > div > div.freebirdFormviewerComponentsQuestionRadioRoot > div:nth-child(2) > div > span > div > div:nth-child(3) > label > div");
        await delay(250);
        await page.waitForSelector("#mG61Hd > div.freebirdFormviewerViewFormCard.exportFormCard > div > div.freebirdFormviewerViewNavigationNavControls > div > div > div > span", { visible: true });
        await page.click("#mG61Hd > div.freebirdFormviewerViewFormCard.exportFormCard > div > div.freebirdFormviewerViewNavigationNavControls > div > div > div > span");
        await delay(250);
        await page.waitForSelector("body > div.freebirdFormviewerViewFormContentWrapper > div:nth-child(2) > div.freebirdFormviewerViewFormCard.exportFormCard > div > div.freebirdFormviewerViewResponseLinksContainer > a", { visible: true });
        await page.click("body > div.freebirdFormviewerViewFormContentWrapper > div:nth-child(2) > div.freebirdFormviewerViewFormCard.exportFormCard > div > div.freebirdFormviewerViewResponseLinksContainer > a");

        console.log(await storage.getItem('votes'));


    await browser.close();
}
run();