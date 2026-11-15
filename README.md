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

For optional direct image uploads, also set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` on Vercel. Without them, image URLs can still be pasted into the editor. Allowed image files: up to 8 MB. The secret remains server-side.


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


## MongoDB Atlas and Render backend

- Database: `ajshadowmusic`, collection: `shadowsites`.
- Two initial documents have been seeded: `slug: draft` and `slug: published`.
- The Express API runs through `server/src/index.js` and shares the authenticated handlers under `api/`.
- For Render, import `render.yaml` (GitHub Blueprint) or create a Node web service from the repository. The service uses `npm install --no-audit --no-fund` to build, `npm run start:api` to start, and `/api/health` as its health check.
- On Render, set `MONGODB_URI` to a connection string for a **dedicated least-privilege DB user** with readWrite on the `ajshadowmusic` database. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` as secrets, and `CLIENT_ORIGIN` to the exact Vercel origin (HTTPS). Do not commit credentials.
- Add Render outbound IPs to MongoDB Atlas Network Access. Avoid a broad public CIDR if stable egress is available.
- On Vercel, set `VITE_API_BASE_URL` to the Render API origin, for example `https://ajshadowmusic-api.onrender.com` (replace with the actual URL, do not assume it exists), then rebuild the client.
- The editor uses `/admin`; published public content is returned from the Render `/api/content` endpoint. Uploaded art uses signed Cloudinary uploads only when those secrets are configured.

If the Vercel Git connection does not have project-creation privileges, import the repository manually via the Vercel dashboard after granting the connected GitHub app access. Once imported, use repository root, Vite, build command `npm run build`, and output directory `client/dist`.
