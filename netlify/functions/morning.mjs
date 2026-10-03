// Runs every hour. Sends the morning message to everyone whose local time is now 8:00 (cities can be in different time zones).
import { send, allUsers, saveUser, dayWeather, forecastText, localNow } from '../lib/bot.mjs';

export default async () => {
  const users = (await allUsers()).filter((u) => u.subscribed && u.city && u.tz);
  await Promise.all(users.map(async (u) => {
    const now = localNow(u.tz);
    if (now.hour !== 8 || u.lastMorning === now.date) return;
    try {
      const res = await send(u.chatId, forecastText(u.city, await dayWeather(u.city), { morning: true }));
      if (res.ok) u.lastMorning = now.date;
      else if (res.error_code === 403) u.subscribed = false; // the user blocked the bot
      await saveUser(u);
    } catch (e) {
      console.error(u.chatId, e);
    }
  }));
};

export const config = { schedule: '@hourly' };
