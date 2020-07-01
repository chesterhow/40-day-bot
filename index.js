require('dotenv').config();
const { Telegram } = require('telegraf');
const schedule = require('node-schedule');

const URL = 'https://lovesingapore.org.sg/40day/2020/';
const CHANNEL_NAME = '@fortyday2020';

const bot = new Telegram(process.env.BOT_TOKEN);

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

schedule.scheduleJob('0 7 * * *', function () {
  bot.sendMessage(CHANNEL_NAME, getMessage(), { parse_mode: 'HTML' });
});
