require('dotenv').config();
const { Telegram } = require('telegraf');
const puppeteer = require('puppeteer');

// const CHANNEL_NAME = '@fortydaySG';
const CHANNEL_NAME = '@chestestchannel';

async function run() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const currDate = new Date();
  const year = currDate.getFullYear();
  const month = currDate.toLocaleString('default', { month: 'long' });
  const day = currDate.getDate();

  const URL = `https://lovesingapore.org.sg/40day/${year}/${month.toLowerCase()}-${day}`;
  await page.goto(URL);

  const pdfUrl = await page.$eval('.et_pb_text_inner > a', (a) =>
    a.getAttribute('href')
  );

  const getMessage = () => {
    const startDate = new Date(year, 6, 1); // 1 JULY XXXX
    const daysDiff = Math.ceil(
      (currDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    );

    return `📆 <b>Today's Prayer Guide</b> - <i>${month} ${day}, ${year} (Day ${daysDiff})</i>\n${URL}`;
  };

  const bot = new Telegram(process.env.BOT_TOKEN);

  bot
    .sendMessage(CHANNEL_NAME, getMessage(), { parse_mode: 'HTML' })
    .then(() => {
      console.log('Sent message');
      bot.sendDocument(CHANNEL_NAME, pdfUrl).then(() => {
        console.log('Sent PDF');
        process.exit(0);
      });
    });
}

run().catch((e) => {
  console.log(e);
});
