# Sky Planner

Weather-aware planner: checks plans against the forecast, suggests better times, travel options and regional ideas. Live at https://weathergout.netlify.app.

## Layout

- `site/index.html` — the whole app (HTML, CSS, JS in one file, no build step).
- `netlify.toml` — Netlify publishes `site/`. Pushing to `main` on GitHub (anastasiia621/sky-planner) auto-deploys.
- `tools/serve.js` — local preview on http://localhost:8765 (launch config `sky-planner` in `.claude/launch.json`).

## Working here

- Git: plain `git` may fail until the Xcode license is accepted (`sudo xcodebuild -license accept`, the owner runs it). Fallback: `/Library/Developer/CommandLineTools/usr/bin/git`.
- Commit after each change with a short message in Russian; the owner pushes from GitHub Desktop ("Push origin"). Commit author is already set in the repo config (GitHub noreply email).
- Never put secrets (bot tokens, API keys) in the repo. They go into Netlify environment variables or a git-ignored `.env`.
- User data (plans, places) lives only in the browser's `localStorage` (keys `sky.*`). When testing in the preview browser, back up and restore `localStorage` so the owner's data stays intact.

## App notes

- Weather: Open-Meteo (no key). City search: Open-Meteo geocoding + Photon, with `CITY_ALIASES` for regions (Cappadocia). Addresses: Photon autocomplete, or a pasted Google Maps link (`parseMapsLink`).
- Activity rules: `CATS` (per-activity limits for rain/wind/heat). Plans created from ideas store `cat`.
- Known places with coordinates and tips: `KNOWN_SPOTS`. Idea sets per region: `REGIONS` / `IDEAS_*` (activities, `kind: 'food'`, `kind: 'trip'`). Photos: Wikipedia page summaries (`wiki` field, 500px thumbnails).
- Destination far from the chosen city → separate forecast (`localWx`, `needsLocal`). Routes start from home if within 60 km, else from the city centre.

## Telegram bot @weathergout_bot (v1)

- `netlify/functions/telegram.mjs` — webhook at `/api/telegram` (commands /start, /today, /ideas, /city, /stop, /help; city choice via inline buttons). Checks Telegram's secret header (derived from the token).
- `netlify/functions/morning.mjs` — runs hourly, sends forecast + warnings + idea of the day to subscribers whose local time is 8:00.
- `netlify/functions/telegram-setup.mjs` — open `/api/telegram-setup` once after deploy to register the webhook and the command menu.
- `netlify/lib/bot.mjs` (weather, texts, Telegram API, Netlify Blobs store `subscribers`), `netlify/lib/ideas.mjs` (copy of the site's ideas: update both).
- Token: Netlify env var `TELEGRAM_BOT_TOKEN`. The bot cannot see the site's plans (they are in `localStorage`); shared plans and reminders are v2.
- `python3` is also blocked by the Xcode license: use node for scripts.
