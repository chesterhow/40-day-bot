require('dotenv').config();
const { Telegram } = require('telegraf');
const puppeteer = require('puppeteer');

const URL = 'https://lovesingapore.org.sg/40day/2020/';
// const CHANNEL_NAME = '@fortyday2020';
const CHANNEL_NAME = '@chestestchannel';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(URL);
  await page._client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: './',
  });

  const pdfUrl = await page.$eval('.et_pb_text_inner > a', (a) =>
    a.getAttribute('href')
  );

  const getMessage = () => {
    const startDate = new Date(2020, 6, 1); // 1 JULY 2020
    const currDate = new Date();
    const daysDiff = Math.ceil(
      (currDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    );
    const month = currDate.toLocaleString('default', { month: 'long' });
    const day = currDate.getDate();

    return `📆 <b>Today's Prayer Guide</b> - <i>${month} ${day}, 2020 (Day ${daysDiff})</i>\n${URL}${month.toLowerCase()}-${day}`;
  };

  const bot = new Telegram(process.env.TEST_BOT_TOKEN);

  bot.sendMessage(CHANNEL_NAME, getMessage(), { parse_mode: 'HTML' });
  await bot.sendDocument(CHANNEL_NAME, pdfUrl);
})();
