# AJ SHADOW — Website and Admin CMS

Full-stack music artist site with cinematic parallax and a no-code content editor.

## Vercel deployment

- Framework: Vite
- Root directory: repository root
- Build: `npm run build`
- Output: `client/dist`
- Frontend route: `/`
- Admin route: `/admin`
- API routes: `/api/content` and `/api/admin`

## Required environment variables for the editor

Set these under Vercel → Project → Settings → Environment Variables, then redeploy:

| Variable | Notes |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas URI; server-side only |
| `ADMIN_PASSWORD` | Choose a unique strong password; server-side only |
| `ADMIN_SESSION_SECRET` | Random secret at least 32 characters; server-side only |

The public site still renders bundled starter content without them, but editing, saving and publishing require all three.

**Never use a `VITE_` prefix for secrets. Never commit real credentials.**

## Using the editor

Open `https://YOUR-VERCEL-DOMAIN/admin`, enter the admin password, customize sections, click **Save Draft**, preview the changes, and then **Publish**. Public pages fetch the published document. You can change text, colors, song order, labels, artwork URLs, video IDs, social links, and section visibility/order.

Use HTTPS URLs for images. Song audio playback needs an authorized public audio file URL; Spotify song links can open the official Spotify page. YouTube video IDs enable the in-page video modal.

## Local development

Requires Node.js 20+ and MongoDB Atlas.

```bash
npm install
npm run dev
```

The local Vite dev server can proxy /api routes only when you run a serverless emulator, such as `vercel dev`, or deploy a Vercel preview. Regular `npm run dev` runs the static client with starter content.

## Vercel deployment notes

The API is implemented as Vercel functions in `api/`. The original `server/` Express scaffold remains for future independent backend deployment; it is not used by the admin editor.

The repo contains no real passwords, API keys, or MongoDB credentials.
