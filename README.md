# भारतीय रेल · Rail Musafir

A nostalgic Indian railway music station. Choose a train + region and the **whole site re-themes** — background, accents, station board, platform vendors and artwork — to match that train's real Indian Railways livery and zone.

## Features

- **Compact docked player** (YouTube backend) — prev / play / next, shuffle, repeat, mute, volume, seek bar. Slim fixed bar instead of the old oversized hero block. Reliability: single persistent player (StrictMode-safe — never destroyed), standard `www.youtube.com` embed with `origin`, **muted-autoplay fallback** when the browser blocks sound in the preview iframe, **auto-skip** of embed-restricted videos, plus a live **status chip** (LIVE / READY / ⚠ / 🔇) in the top bar and an explicit error banner with a **Watch on YouTube ↗** escape hatch. Player sequence is logged to the DevTools console as `[RailMusafir] …` for diagnostics.
- **🚂 Train Horn button** — a WAP-style two-tone air horn synthesized with WebAudio (no files), on the platform panel.
- **🎧 My Playlist** — paste any **YouTube Music or YouTube playlist** URL (`…/playlist?list=PL…`) to play your own list: the player loads the playlist, shows its metadata, next/prev/repeat work, and "Back to station" resumes the theme's music.
- **8 region-wise train themes** (switcher in the top bar, persisted to `localStorage`):

| Theme | Devanagari | Region | Zone |
|---|---|---|---|
| Vande Bharat Express | वंदे भारत | North–West India | Western Railway |
| Rajdhani Express | राजधानी | Delhi hub | Northern Railway |
| Shatabdi Express | शताब्दी | North–Central | North Central Railway |
| Tejas Express | तेजस | Konkan coast | Konkan Railway |
| Duronto Express | दुरंतो | East India | Eastern Railway |
| Mumbai Local | मुंबई लोकल | Mumbai Suburban | WR / CR |
| Darjeeling Himalayan Rly | डार्जिलिंग | Himalayas | NER · UNESCO heritage |
| Palace on Wheels | पैलेस ऑन व्हील्स | Rajasthan | North Western Railway |

- **New artwork set** (`src/assets/themes/*.jpg`): one illustrated scene per theme — the default hero shows the **भारतीय रेल** engine at a platform; all themes show their train, region and platform.
- **Vendor calls** (`chai lelo chai lelo`, garam samose, pake aam, garam bhutta, kulfi, pani, bhelpuri, vada pav, momos) region-filtered per theme. Tap a chip to hear the hawker: a WebAudio hand-bell + spoken Hindi call via `SpeechSynthesis`. **Ambience ON** makes a random vendor stroll past every ~24–46 s.
- **Region-wise station playlists (42 tracks)** — switching the theme re-tunes the station to that region's songs:

| Theme | Tracks |
|---|---|
| Vande Bharat | Chaiyya Chaiyya · Ghar More Pardesiya · Channa Mereya · Kesariya · Peace Train |
| Rajdhani | Main Zindagi Ka Saath · Hai Apna Dil · Masakali · Phir Se Ud Chala · Kun Faya Kun · Sadda Haq |
| Shatabdi | Mere Sapno Ki Rani · Pukarta Chala Hoon · Koi Haseena · Aaj Mausam · Kuch Kuch Hota Hai · Kabhi Kabhi Aditi |
| Tejas | Sooraj Dooba Hain · Tere Hawaale · Chand Sifarish · Tu Hi Re |
| Duronto | Gaadi Bula Rahi Hai · Last Train Home · Chander Pahar (Beng) · Shantiniketan (Beng) · Alada Alada (Beng) |
| Mumbai Local | Rail Gaadi Chhuk Chhuk · Apna Time Aayega · Mere Gully Mein · Jai Ho · Bombay Theme · Apna Bombay Talkies |
| Darjeeling | Resham Firiri (Nepali) · Ala Barfi · Kanchhi Re · Deorali Darah · Lopchu ko Orali |
| Palace on Wheels | Ghoomar · Nimbooda · Padharo Mhare Des · Kesariya Balam · Banna Re |

- **Non-copyright lofi pool** — each theme's station also gets 2 free-to-stream lofi tracks (`Chillhop Essentials` mixes + free-use artists Purrple Cat, Saib, Kudasaibeats, idealism). All `videoId`s were verified via YouTube oEmbed (public + embeddable).

Every `videoId` in `src/data/playlist.ts` was verified via YouTube oEmbed (video exists, public, and hosted by the label/artist channel where possible — T-Series, Sony Music, Zee Music, YRF, Saregama, Tips, SVF, Anupam Roy, Bipul Chettri, Chillhop Music, etc.). If a video ever becomes unavailable, the player auto-skips to the next track.

## Vendor audio note

No freely-licensed “chai lelo / garam samose” recordings were found online (available clips are meme/stock files behind paywalls), so calls are synthesized in-browser. Each vendor has an optional `audioUrl` field in `src/data/vendors.ts` — drop a licensed recording there and it plays instead of TTS automatically.

## Commands

```bash
npm install
npm run dev     # dev server (host 0.0.0.0, any host allowed for previews)
npm run build   # single-file build in dist/
```

## Structure

- `src/data/themes.ts` — theme metadata, palettes, routes, zones, vendors per region
- `src/data/vendors.ts` — vendor call scripts & regional availability
- `src/hooks/useThemeRail.ts` — applies CSS variables + persists selection
- `src/hooks/useVendorCalls.ts` — WebAudio bell + Hindi TTS + ambience scheduler
- `src/hooks/useYoutubePlayer.ts` — YouTube iframe API player (unchanged core)
- `src/index.css` — theme-driven design system (all colours via CSS variables)

## 🔧 Player debugging notes (root cause history)

Symptoms in the dev preview ("▶ does nothing") were traced to two real bugs, now fixed:

1. **React StrictMode double-mount killed the player.** `npm run dev` uses the dev React build, which mounts effects twice (run → cleanup → run). The old logic flagged the first run as "already created", so the *second* run (the one that survives) never created the YouTube player at all. Fix: each effect invocation tracks its own cancellation, and the shared `playerRef` is the only guard — the surviving run creates the player exactly once and it is **never destroyed**.
2. **YouTube replaced a React-owned `<div>` with an `<iframe>`.** On the next React re-render React tried to reconcile its "div" and tore down the live iframe. Fix: the host element is created by the hook and appended to `<body>` **outside the React tree**; React never touches it (there is no `#rail-gaadi-player` div in `App.tsx` anymore).

Verified with two harnesses: the production smoke suite (26 checks) and a new **dev-StrictMode suite** that builds with `vite build --mode development` and asserts the player is created exactly once, ready fires once, it's never destroyed, and the host becomes an iframe. If playback still fails in a browser, open DevTools console — `[RailMusafir] …` logs show the exact player lifecycle (api loaded → player ready → state — embed errors with codes 101/150/153 mean the video owner forbids embedding and the UI shows a "Watch on YouTube" link).
