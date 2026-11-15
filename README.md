# AJ SHADOW — Official Artist Website

Minimal cinematic MERN website for AJ Shadow. Features a project-led homepage, parallax scrolling, custom audio player, music video gallery, labels and the Shadow manifesto.

## Local setup

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Run the API in another terminal:

```bash
npm run dev:api
```

Open the Vite URL printed by the dev server.

## Deploying

Frontend: Vercel root directory `client`, build command `npm run build`, output `dist` (or use repository-root `vercel.json`).

Backend: run `server` with Node.js on a supported host if you want MongoDB-powered content. Point `VITE_API_BASE_URL` to its public API URL. The frontend works using `client/src/content.js` when no backend is connected.

## Content

Edit `client/src/content.js` to enter verified streaming URLs, songs, YouTube IDs, artwork and label information. Demo artwork is original vector art in `client/public/shadow.svg`.

## Environment

Copy `client/.env.example` to `client/.env` and `server/.env.example` to `server/.env`. All variables intentionally have empty values. Never commit real `.env` files.

## Notes

Audio playback requires publicly accessible audio file URLs. Streaming providers may not permit playing their licensed tracks in a custom player. Video thumbnails open the YouTube channel until actual video IDs are entered. There are no fabricated stream numbers or endorsements.
