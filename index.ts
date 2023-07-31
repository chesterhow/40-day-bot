import 'dotenv/config';
import { Settings, DateTime, Interval } from 'luxon';
import { Telegram } from 'telegraf';
import puppeteer from 'puppeteer';

const isProduction = process.env.NODE_ENV === 'production';
const CHANNEL_NAME = isProduction
  ? process.env.CHANNEL_NAME
  : process.env.TEST_CHANNEL_NAME;
const BOT_TOKEN = isProduction
  ? process.env.BOT_TOKEN
  : process.env.TEST_BOT_TOKEN;

Settings.defaultZone = 'Asia/Singapore';

async function run() {
  // Retrieve current date data.
  const currDate = DateTime.now();
  console.log('Current Date:', currDate.toString());
  const year = currDate.year;
  const month = currDate.monthLong;
  const day = currDate.day;

  const startDate = DateTime.fromObject({ month: 7, day: 1 });
  const endDate = DateTime.fromObject({ month: 8, day: 10 });
  console.log('Start Date:', startDate.toString());

  const diff = currDate.diff(startDate, ['days']);
  const daysDiff = Math.ceil(diff.days);

  // Guard: Exit if date is not in interval.
  if (!Interval.fromDateTimes(startDate, endDate).contains(currDate)) {
    throw new Error(`Current date is not in range ${currDate.toString()}`);
  }

  // Scrape PDF url.
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();

  // const URL = `https://lovesingapore.org.sg/40day/${year}/${month.toLowerCase()}-${day}`;
  const URL = `https://lovesingapore.org.sg/day-${daysDiff}`;
  await page.goto(URL);

  const elementHandle = await page.waitForSelector('div.video-embed iframe');
  const frame = await elementHandle?.contentFrame();

  const videoUrl = await frame?.$eval('.ytp-impression-link', (a) =>
    a.getAttribute('href')
  );

  if (typeof videoUrl !== 'string') {
    throw new Error('Could not retrieve video url');
  }

  const pdfUrl = await page.$eval('#article-post > div > p a', (a) =>
    a.getAttribute('href')
  );

  if (pdfUrl === null) {
    throw new Error('Could not retrieve PDF url');
  }

  // Send messages.
  if (BOT_TOKEN === undefined) {
    throw new Error('No BOT_TOKEN provided');
  }

  const bot = new Telegram(BOT_TOKEN);

  const message = `📆 <b>Today's Prayer Guide</b> - <i>${month} ${day}, ${year} (Day ${daysDiff})</i>\n\nArticle: ${URL}\n\nVideo: ${
    videoUrl.split('&')[0]
  }`;
  console.log('Days diff:', daysDiff, diff.days);

  if (CHANNEL_NAME === undefined) {
    throw new Error('No CHANNEL_NAME provided');
  }

  await bot.sendMessage(CHANNEL_NAME, message, { parse_mode: 'HTML' });
  console.log('Sent message');

  await bot.sendDocument(CHANNEL_NAME, pdfUrl);
  console.log('Sent PDF');

  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(0);
});
