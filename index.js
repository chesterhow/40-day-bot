require('dotenv').config();
const { DateTime, Interval } = require('luxon');
const { Telegram } = require('telegraf');
const puppeteer = require('puppeteer');

const { CHANNEL_NAME, BOT_TOKEN } = process.env;

async function run() {
  // Retrieve current date data.
  const currDate = DateTime.now().setZone('Asia/Singapore');
  console.log('Current Date:', currDate.toString());
  const year = currDate.year;
  const month = currDate.monthLong;
  const day = currDate.day;

  const startDate = DateTime.fromObject({ month: 7, day: 1 }).setZone(
    'Asia/Singapore'
  );
  const endDate = DateTime.fromObject({ month: 8, day: 10 }).setZone(
    'Asia/Singapore'
  );

  // Guard: Exit if date is not in interval.
  if (!Interval.fromDateTimes(startDate, endDate).contains(currDate)) {
    console.log(currDate.toString(), 'Not in range');
    process.exit(0);
  }

  // Scrape PDF url.
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  const URL = `https://lovesingapore.org.sg/40day/${year}/${month.toLowerCase()}-${day}`;
  await page.goto(URL);

  const pdfUrl = await page.$eval('.et_pb_text_inner > a', (a) =>
    a.getAttribute('href')
  );

  // Send messages.
  const bot = new Telegram(BOT_TOKEN);

  const diff = currDate.diff(startDate, ['days']);
  const daysDiff = Math.ceil(diff.days);
  const message = `📆 <b>Today's Prayer Guide</b> - <i>${month} ${day}, ${year} (Day ${daysDiff})</i>\n${URL}`;
  console.log('Days diff:', daysDiff);

  await bot.sendMessage(CHANNEL_NAME, message, { parse_mode: 'HTML' });
  console.log('Sent message');

  await bot.sendDocument(CHANNEL_NAME, pdfUrl);
  console.log('Sent PDF');

  process.exit(0);
}

run().catch((e) => {
  console.log(e);
});
