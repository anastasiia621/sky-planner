// Open https://weathergout.netlify.app/api/telegram-setup once after deploy: it tells Telegram where to send messages
// and fills the bot's command menu. Safe to open again, it only repeats the same settings.
import { tg, webhookSecret } from '../lib/bot.mjs';

export default async (req) => {
  if (!process.env.TELEGRAM_BOT_TOKEN) return new Response('Нет переменной TELEGRAM_BOT_TOKEN в Netlify', { status: 500 });
  const url = `${process.env.URL || new URL(req.url).origin}/api/telegram`;
  const hook = await tg('setWebhook', { url, secret_token: webhookSecret(), allowed_updates: ['message', 'callback_query'] });
  const cmds = await tg('setMyCommands', {
    commands: [
      { command: 'today', description: 'Погода на сегодня' },
      { command: 'ideas', description: 'Идеи на сегодня под погоду' },
      { command: 'city', description: 'Сменить город' },
      { command: 'stop', description: 'Не присылать утреннее сообщение' },
      { command: 'help', description: 'Что умеет бот' },
    ],
  });
  const me = await tg('getMe', {});
  const ok = hook.ok && cmds.ok && me.ok;
  return new Response(ok
    ? `Готово! Бот @${me.result.username} подключён к ${url}`
    : `Ошибка: ${hook.description || cmds.description || me.description}`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

export const config = { path: '/api/telegram-setup' };
