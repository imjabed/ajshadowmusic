# AJ SHADOW — website + protected editing studio

Cinematic React/Vite artist portfolio with a no-code admin studio, Express API on Render, and MongoDB Atlas.

## Live services

- Public website and admin: https://ajshadowmusic.vercel.app/ and https://ajshadowmusic.vercel.app/admin
- Render API: https://ajshadowmusic-api.onrender.com
- MongoDB Atlas database: `ajshadowmusic`, collection: `shadowsites`
- Draft and published pages are separate records (`slug: draft`, `slug: published`).

## Architecture

Vercel serves the React frontend. In production, requests to `/backend/api/*` are proxied by `vercel.json` to Render's `/api/*` endpoints. The frontend can also fall back to the direct Render origin if the proxy isn't available, with Render permitting only explicitly configured origins through CORS. A direct Render deployment serves the same React frontend and API on one domain.

Admin logins issue signed sessions valid for eight hours. Save Draft saves only to the draft record; Publish replaces the published record. Artwork uploads require optional Cloudinary credentials.

## Required environment variables — Render ONLY

Configure on Render's **Environment** page; don't store credentials in GitHub or in the browser:

| Key | Value |
| --- | --- |
| `MONGODB_URI` | Atlas URL for a user with `readWrite` on `ajshadowmusic` |
| `ADMIN_PASSWORD` | A unique strong password for the studio |
| `ADMIN_SESSION_SECRET` | Cryptographically random string of **at least 32 characters** |
| `CLIENT_ORIGIN` | `https://ajshadowmusic.vercel.app` |

Optional image uploads require `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET` **on Render**.

**Never put `MONGODB_URI`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, or Cloudinary secrets in Vite / Vercel `VITE_*` settings.** Avoid importing example `.env` placeholders over working production variables.

## Vercel deployment

- Framework: Vite
- Root: repository root
- Build: `npm run build`
- Output: `client/dist`
- No environment variables are required for the production website to contact Render. `VITE_API_BASE_URL` is supported for local development only.
- `vercel.json` configures `/backend/:path*` as a reverse proxy to Render, followed by the SPA fallback.

## Render deployment

Render workspace: AJ Shadow; service: `ajshadowmusic-api`. The Node web service builds with `npm install --no-audit --no-fund` and starts with `npm run start:api`. The `RENDER=true` environment marker makes `postinstall` build the React static assets **during deployment**, avoiding slow rebuilds when Render wakes from sleep.

The Render outbound CIDR blocks `74.220.52.0/24` and `74.220.60.0/24` are allowed in Atlas Network Access. The API health endpoint is `/api/health`. Logs report only whether admin credentials are configured; they never print secret values.

## Admin usage

Open `/admin`. Enter the password configured on Render. Edit the hero, tracks, labels, videos, texts, colors, fonts and section order. Preview changes, **Save Draft**, then **Publish**. Published changes should appear on the public page after a refresh.

If login fails, look for a specific UI error or the browser Network tab response. A backend `503` from `/api/admin` means `ADMIN_PASSWORD` is missing or `ADMIN_SESSION_SECRET` is under 32 characters. A `401` from a login attempt means the password is wrong; an unauthenticated GET should return `401`.

## New admin tabs: Branding and Motion FX

Use **Branding** inside `/admin` to change:

- Artist name, header/footer logos, monogram letters, display mode (wordmark / image / combination), and logo height.
- Browser tab title for the public website and Admin Studio, tab favicon, browser theme color, and page description.
- Four included favicon choices: classic, mask, orbit, and AJ monogram; or set a custom image URL.
- Built-in AJ and mask logo picks require no external image host. Custom image URLs work immediately; **Upload image** requires optional signed Cloudinary credentials on Render.

Use **Motion FX** to control:

- Master animation and glow switches, hero spotlight, ambient section glow, mouse glow, moving scanlines, and glitch title.
- Particle on/off, particle quantity/speed, floating Shadow symbols, breathing artwork, float timing.
- Scroll reveal, reveal distance/duration, parallax intensity, and card hover effects.
- Cinematic, Subtle, and Minimal one-click presets.

Motion effects respect `prefers-reduced-motion` and use bounded settings for performance. All edits are staged in the admin's live desktop/mobile preview, then saved using **Save Draft** and made public using **Publish**. Settings are stored in the existing MongoDB content document, and older content is merged with defaults.

Browser-tab metadata changes are applied client-side after page load; if social media previews or search-engine metadata need server-rendered updates, a separate server-side metadata implementation is required.

## Development and tests

```bash
npm install
npm run dev          # Vite development server
npm run build        # Production frontend
npm run test:e2e     # Playwright browser regression tests
npm run start:api    # Express server (serve built frontend)
```

GitHub Actions runs Admin E2E tests (mocked backend) and live API smoke checks. Don't treat mocked test success as proof that production authentication works.

The repository contains no real database passwords or admin secrets.
