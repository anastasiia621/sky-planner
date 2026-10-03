// Shared code for the Telegram bot: weather, warnings, ideas, message texts, Telegram API, subscriber storage.
import { createHash } from 'node:crypto';
import { getStore } from '@netlify/blobs';
import { CATS, GENERIC, REGIONS } from './ideas.mjs';

export const SITE = 'https://weathergout.netlify.app';
const TOKEN = () => process.env.TELEGRAM_BOT_TOKEN;

// ---------- Telegram ----------
export async function tg(method, body) {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN()}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return res.json();
}
export const send = (chatId, text, extra = {}) =>
  tg('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true }, ...extra });

// Telegram sends this secret with every webhook call, so strangers can't post fake updates. Derived from the token: nothing extra to store.
export const webhookSecret = () => createHash('sha256').update(String(TOKEN())).digest('hex').slice(0, 40);

// ---------- Subscribers (Netlify Blobs) ----------
const store = () => getStore({ name: 'subscribers', consistency: 'strong' });
export const getUser = async (chatId) => (await store().get(String(chatId), { type: 'json' })) || { chatId, subscribed: true };
export const saveUser = (u) => store().setJSON(String(u.chatId), u);
export async function allUsers() {
  const s = store();
  const { blobs } = await s.list();
  return (await Promise.all(blobs.map((b) => s.get(b.key, { type: 'json' })))).filter(Boolean);
}

// ---------- City search ----------
const ALIASES = [
  { re: /^(каппадок|cappadoc|kapadok)/i, name: 'Каппадокия', label: 'Каппадокия (Гёреме, Невшехир), Турция', lat: 38.6431, lon: 34.8289, tz: 'Europe/Istanbul' },
];
export async function searchCity(q) {
  const res = ALIASES.filter((a) => a.re.test(q)).map(({ re, ...a }) => a);
  const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=ru&format=json`);
  const d = await r.json();
  (d.results || []).forEach((c) => res.push({
    name: c.name, label: [c.name, c.admin1, c.country].filter(Boolean).join(', '), lat: c.latitude, lon: c.longitude, tz: c.timezone,
  }));
  return res.slice(0, 5);
}

// ---------- Weather ----------
export async function dayWeather(city) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}`
    + '&current=temperature_2m'
    + '&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m,uv_index'
    + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_gusts_10m_max,uv_index_max,sunrise,sunset'
    + '&timezone=auto&forecast_days=1';
  const res = await fetch(url);
  if (!res.ok) throw new Error('weather ' + res.status);
  const d = await res.json();
  const h = d.hourly;
  return {
    date: d.daily.time[0], nowHour: parseInt(d.current.time.slice(11, 13), 10), now: d.current.temperature_2m,
    code: d.daily.weather_code[0], max: d.daily.temperature_2m_max[0], min: d.daily.temperature_2m_min[0],
    pop: d.daily.precipitation_probability_max[0] ?? 0, gust: d.daily.wind_gusts_10m_max[0], uv: d.daily.uv_index_max[0] ?? 0,
    sunrise: d.daily.sunrise[0].slice(11), sunset: d.daily.sunset[0].slice(11),
    hours: h.time.map((t, i) => ({
      h: i, temp: h.temperature_2m[i], pop: h.precipitation_probability[i] ?? 0, code: h.weather_code[i],
      wind: h.wind_speed_10m[i], gust: h.wind_gusts_10m[i], uv: h.uv_index[i] ?? 0,
    })),
  };
}

function wmo(code) {
  if (code === 0) return ['☀️', 'Ясно'];
  if (code === 1) return ['🌤️', 'Почти ясно'];
  if (code === 2) return ['⛅', 'Переменная облачность'];
  if (code === 3) return ['☁️', 'Пасмурно'];
  if (code === 45 || code === 48) return ['🌫️', 'Туман'];
  if (code >= 51 && code <= 57) return ['🌦️', 'Морось'];
  if (code >= 61 && code <= 67) return ['🌧️', 'Дождь'];
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return ['❄️', 'Снег'];
  if (code >= 80 && code <= 82) return ['🌧️', 'Ливень'];
  if (code >= 95) return ['⛈️', 'Гроза'];
  return ['🌡️', ''];
}
const pad = (n) => String(n).padStart(2, '0');
const deg = (t) => `${t > 0 ? '+' : ''}${Math.round(t)}°`;
export const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
// Hours 9, 10, 11, 14 → "09:00–12:00, 14:00–15:00"
function spans(hours) {
  const out = [];
  hours.forEach((h) => {
    const last = out[out.length - 1];
    if (last && last[1] === h) last[1] = h + 1; else out.push([h, h + 1]);
  });
  return out.map(([a, b]) => `${pad(a)}:00–${pad(b % 24)}:00`).join(', ');
}

function warnings(w) {
  const day = w.hours.filter((x) => x.h >= 7 && x.h <= 22);
  const out = [];
  if (day.some((x) => x.code >= 95)) out.push('⛈️ Возможна гроза: держись подальше от воды и открытых мест');
  const rain = day.filter((x) => x.pop >= 50).map((x) => x.h);
  if (rain.length) out.push(`☔ Дождь вероятен ${spans(rain)}: возьми зонт`);
  if (w.gust >= 50) out.push(`💨 Сильные порывы ветра до ${Math.round(w.gust)} км/ч: лодки и параплан лучше отложить`);
  if (w.max >= 33) out.push(`🥵 Жара до ${deg(w.max)}: пей воду, с 12 до 16 лучше в тени`);
  if (w.min <= 0) out.push(`🥶 Заморозки до ${deg(w.min)}: одевайся теплее, на дорогах может быть скользко`);
  if (w.uv >= 8) out.push(`🧴 Очень сильное солнце (УФ ${Math.round(w.uv)}): крем SPF и головной убор`);
  return out;
}

// Longest stretch of pleasant hours between 7:00 and 21:00 (no rain, wind or extreme temperature).
function bestWindow(w) {
  let best = null, cur = null;
  w.hours.filter((x) => x.h >= Math.max(7, w.nowHour) && x.h <= 21).forEach((x) => {
    const ok = x.pop < 40 && x.gust < 45 && x.code < 95 && x.temp >= 10 && x.temp <= 31;
    if (ok) {
      if (cur && cur[1] === x.h) cur[1] = x.h + 1; else cur = [x.h, x.h + 1];
      if (!best || cur[1] - cur[0] > best[1] - best[0]) best = [...cur];
    } else cur = null;
  });
  return best && best[1] - best[0] >= 2 ? `${pad(best[0])}:00–${pad(best[1])}:00` : null;
}

// ---------- Ideas ----------
function distKm(a, b) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
const regionFor = (c) => REGIONS.find((r) => distKm(c, r) <= r.radius) || null;

function fits(idea, w) {
  const dow = new Date(w.date + 'T12:00').getDay();
  if (idea.weekend && ![0, 6].includes(dow)) return false;
  if (idea.weekday != null && idea.weekday !== dow) return false;
  if (idea.closed && idea.closed.includes(dow)) return false;
  if (idea.hour < w.nowHour) return false;
  if (idea.indoor) return true;
  const lim = CATS[idea.cat] || CATS.outdoor;
  const hrs = w.hours.slice(idea.hour, idea.hour + (idea.dur || 2));
  return hrs.every((x) => x.code < 95 && x.pop < lim.pop && x.wind < lim.wind && (!lim.gust || x.gust < lim.gust)
    && (!lim.hot || x.temp < lim.hot) && (!lim.cold || x.temp > lim.cold) && (!lim.cool || x.temp >= lim.cool));
}
// Good weather → outdoor ideas first; indoor ones fill the list (and save a rainy day).
export function ideasFor(city, w) {
  const all = (regionFor(city) || { ideas: GENERIC }).ideas.filter((i) => fits(i, w));
  return [...all.filter((i) => !i.indoor), ...all.filter((i) => i.indoor)];
}
const ideaLine = (i) => `<b>${esc(i.title)}</b> в ${pad(i.hour)}:00\n${esc(i.why)}`;

// ---------- Messages ----------
export function forecastText(city, w, { morning = false } = {}) {
  const [glyph, label] = wmo(w.code);
  const date = new Date(w.date + 'T12:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const lines = [
    morning ? `${glyph} <b>Доброе утро!</b> ${esc(city.name)}, ${date}` : `${glyph} <b>${esc(city.name)}</b>, ${date}`,
    `${label}, ${deg(w.min)}…${deg(w.max)}, сейчас ${deg(w.now)}`,
    `Дождь до ${w.pop}% · ветер до ${Math.round(w.gust)} км/ч · солнце ${w.sunrise}–${w.sunset}`,
  ];
  const warn = warnings(w);
  if (warn.length) lines.push('', '<b>Обрати внимание</b>', ...warn);
  const win = bestWindow(w);
  if (win) lines.push('', `🕒 Лучшее время на улице: ${win}`);
  const ideas = ideasFor(city, w);
  if (ideas.length) {
    // A different idea each day: pick by the day of the year.
    const n = Math.floor(Date.parse(w.date) / 864e5);
    lines.push('', `💡 Идея дня: ${ideaLine(ideas[n % Math.min(ideas.length, 3)])}`);
  }
  lines.push('', `<a href="${SITE}">Открыть планировщик</a>`);
  return lines.join('\n');
}

export function ideasText(city, w) {
  const ideas = ideasFor(city, w).slice(0, 5).sort((a, b) => a.hour - b.hour);
  if (!ideas.length) return `На сегодня в ${esc(city.name)} подходящих идей уже нет. Загляни завтра утром или открой <a href="${SITE}">планировщик</a>: там идеи на 7 дней.`;
  return [`💡 <b>Идеи на сегодня</b>, ${esc(city.name)}`, '', ideas.map(ideaLine).join('\n\n'), '', `Больше идей на неделю: <a href="${SITE}">планировщик</a>`].join('\n');
}

// Local hour and date in the subscriber's city, for the 8:00 message.
export function localNow(tz) {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: parseInt(p.hour, 10) };
}
