const puppeteer = require('puppeteer');

const sleep = ms => new Promise(r => setTimeout(r, ms));

const url = process.env['URL'] || 'http://localhost:3000';

const reloodInterval = +(process.env['RELOAD_INTERVAL'] || 5 * 60 * 1000);

const login = async (page) => {
    await page.type('#email', process.env['EMAIL']);
    await page.type('#password', process.env['PASSWORD']);
    await page.click('#login');
};

const toggleOnSnapshotSwitch = async (page) => {
    const snapshotSwitch = await page.waitForSelector('#snapshot-switch')
    await snapshotSwitch.click();
};

const main = async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    await login(page);
    await toggleOnSnapshotSwitch(page);

    while (true) {
        console.log(`${new Date().toISOString()} - Taking snapshot`);
        await sleep(reloodInterval);
        await page.reload({ waitUntil: 'networkidle2' });
        await toggleOnSnapshotSwitch(page);
    }
};

main();
