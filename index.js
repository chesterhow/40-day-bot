require('dotenv').config();
const { Telegram } = require('telegraf');
const puppeteer = require('puppeteer');

const CHANNEL_NAME = '@fortydaySG';

async function run() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const currDate = new Date();
  const year = currDate.getFullYear();
  const month = currDate.getMonth();
  const day = currDate.getDate();

  // Guard: Exit if before July or after 9th August
  if (month < 6 || (month === 7 && day > 9) || month > 7) {
    console.log(year, month, day, 'Not in range');
    process.exit(0);
  }

  const monthString = currDate.toLocaleString('default', { month: 'long' });

  const URL = `https://lovesingapore.org.sg/40day/${year}/${monthString.toLowerCase()}-${day}`;
  await page.goto(URL);

  const pdfUrl = await page.$eval('.et_pb_text_inner > a', (a) =>
    a.getAttribute('href')
  );

  const getMessage = () => {
    const startDate = new Date(year, 6, 1); // 1 JULY XXXX
    const daysDiff = Math.ceil(
      (currDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)
    );

    return `📆 <b>Today's Prayer Guide</b> - <i>${monthString} ${day}, ${year} (Day ${daysDiff})</i>\n${URL}`;
  };

  const bot = new Telegram(process.env.BOT_TOKEN);

  await bot.sendMessage(CHANNEL_NAME, getMessage(), { parse_mode: 'HTML' });
  console.log('Sent message');

  await bot.sendDocument(CHANNEL_NAME, pdfUrl);
  console.log('Sent PDF');
  process.exit(0);
}

run().catch((e) => {
  console.log(e);
});
