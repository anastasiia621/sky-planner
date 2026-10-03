// Telegram webhook: Telegram calls this address with every message sent to the bot.
import { send, tg, webhookSecret, getUser, saveUser, searchCity, dayWeather, forecastText, ideasText, esc, SITE } from '../lib/bot.mjs';

const HELP = [
  'Я присылаю прогноз и идеи, чем заняться в хорошую погоду.',
  '',
  '/today — погода на сегодня и предупреждения',
  '/ideas — идеи на сегодня под погоду',
  '/city — сменить город',
  '/stop — не присылать утреннее сообщение',
  '/start — снова присылать его в 8:00',
  '',
  `Планы на неделю: <a href="${SITE}">Sky Planner</a>`,
].join('\n');

async function askCity(u, text = 'Напиши свой город, например: Фетхие, Стамбул или Москва') {
  u.awaitCity = true;
  await saveUser(u);
  await send(u.chatId, text);
}

async function sendToday(u) {
  const w = await dayWeather(u.city);
  await send(u.chatId, forecastText(u.city, w));
}

async function chooseCity(u, c) {
  u.city = { name: c.name, lat: c.lat, lon: c.lon };
  u.tz = c.tz || 'UTC';
  u.awaitCity = false;
  u.candidates = null;
  await saveUser(u);
  await send(u.chatId, `Готово, твой город: <b>${esc(c.label)}</b>.${u.subscribed ? '\nКаждое утро в 8:00 по местному времени пришлю прогноз и идею дня.' : ''}`);
  await sendToday(u);
}

async function onText(u, text) {
  const cmd = text.startsWith('/') ? text.split(/[\s@]/)[0].toLowerCase() : null;
  if (cmd === '/start') {
    u.subscribed = true;
    if (!u.city) return askCity(u, 'Привет! Я бот Sky Planner 🌤️\nКаждое утро в 8:00 пришлю прогноз, предупреждения и идею дня.\n\nВ каком ты городе?');
    await saveUser(u);
    await send(u.chatId, `С возвращением! Утреннее сообщение включено, город: <b>${esc(u.city.name)}</b>.`);
    return sendToday(u);
  }
  if (cmd === '/city') return askCity(u);
  if (cmd === '/help') return send(u.chatId, HELP);
  if (cmd === '/stop') {
    u.subscribed = false;
    await saveUser(u);
    return send(u.chatId, 'Хорошо, утром больше не пишу. Команды /today и /ideas работают как раньше. Включить снова: /start');
  }
  if (!u.city || u.awaitCity) {
    if (cmd) return askCity(u, 'Сначала напиши свой город 🙂');
    const found = await searchCity(text.trim());
    if (!found.length) return send(u.chatId, 'Не нашла такой город. Попробуй написать иначе, например по-английски.');
    if (found.length === 1) return chooseCity(u, found[0]);
    u.candidates = found;
    await saveUser(u);
    return send(u.chatId, 'Какой из них?', {
      reply_markup: { inline_keyboard: found.map((c, i) => [{ text: c.label, callback_data: `city:${i}` }]) },
    });
  }
  if (cmd === '/today') return sendToday(u);
  if (cmd === '/ideas') return send(u.chatId, ideasText(u.city, await dayWeather(u.city)));
  return send(u.chatId, HELP);
}

export default async (req) => {
  if (req.headers.get('x-telegram-bot-api-secret-token') !== webhookSecret()) return new Response('forbidden', { status: 403 });
  const update = await req.json();
  try {
    if (update.message?.text) {
      await onText(await getUser(update.message.chat.id), update.message.text);
    } else if (update.callback_query) {
      const q = update.callback_query;
      await tg('answerCallbackQuery', { callback_query_id: q.id });
      const u = await getUser(q.message.chat.id);
      const c = u.candidates?.[Number(String(q.data).split(':')[1])];
      if (c) {
        await tg('editMessageReplyMarkup', { chat_id: u.chatId, message_id: q.message.message_id });
        await chooseCity(u, c);
      }
    }
  } catch (e) {
    console.error(e);
    const chatId = update.message?.chat.id || update.callback_query?.message.chat.id;
    if (chatId) await send(chatId, 'Что-то пошло не так 😕 Попробуй ещё раз через минуту.').catch(() => {});
  }
  // Always answer 200, otherwise Telegram keeps re-sending the same message.
  return new Response('ok');
};

export const config = { path: '/api/telegram' };
