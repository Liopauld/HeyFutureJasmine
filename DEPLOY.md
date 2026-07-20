# Deploying HeyFutureJasmine! to Render

The repo ships a `render.yaml` Blueprint that provisions two services:

| Service | Type | Root | What it is |
|---|---|---|---|
| `heyfuturejasmine-api` | Web (Node) | `server/` | Express API |
| `heyfuturejasmine-web` | Static | `client/` | Vite React frontend |

Redis is intentionally skipped — the daily cron **delivery sweep** delivers
letters without it. MongoDB is hosted separately on **MongoDB Atlas** (free M0).

---

## 1. MongoDB Atlas (once)

1. Create a free **M0** cluster at <https://cloud.mongodb.com>.
2. **Database Access** → add a user (username + password).
3. **Network Access** → add IP `0.0.0.0/0` (Render's IPs are dynamic on the
   free plan).
4. **Connect → Drivers** → copy the connection string. It looks like:
   `mongodb+srv://<user>:<pass>@cluster.mongodb.net/heyfuturejasmine`
   Add the db name (`heyfuturejasmine`) before the `?`. Keep this for step 2.

## 2. Create the Blueprint on Render

1. Push this branch to GitHub (already done if you ran the deploy).
2. In Render: **New → Blueprint**, pick the `HeyFutureJasmine` repo and the
   branch you deployed.
3. Render reads `render.yaml` and shows both services. It will prompt for the
   `sync:false` secrets. Fill in on **`heyfuturejasmine-api`**:
   - `MONGODB_URI` — the Atlas string from step 1.
   - `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET`
     — optional; leave blank to disable photo/voice uploads.
   - `RESEND_API_KEY` — optional; leave blank and emails log to the service
     console instead of sending.
   - `CLIENT_URLS` and `VITE_API_URL` — leave blank for now (step 3).
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` are auto-generated — skip them.
4. Click **Apply**. Both services build and deploy. Note the two URLs, e.g.
   `https://heyfuturejasmine-api.onrender.com` and
   `https://heyfuturejasmine-web.onrender.com`.

## 3. Cross-wire the two URLs

The frontend needs the API URL, and the API needs the frontend origin for
CORS + the cross-site auth cookie. After the first deploy:

- On **`heyfuturejasmine-web`** → Environment → set
  `VITE_API_URL = https://heyfuturejasmine-api.onrender.com/api`
  then **Manual Deploy → Clear build cache & deploy** (Vite bakes env vars at
  build time, so it must rebuild).
- On **`heyfuturejasmine-api`** → Environment → set
  `CLIENT_URLS = https://heyfuturejasmine-web.onrender.com`
  (comma-separate if you add a custom domain later). Saving redeploys it.

## 4. Verify

- `https://heyfuturejasmine-api.onrender.com/api/health` → `{"status":"ok"}`
- Open the web URL, register, write a letter, and use a near-future delivery
  date to watch the reveal.

---

### Notes & gotchas

- **Free plan cold starts:** the API sleeps after ~15 min idle and takes
  ~30–50s to wake. The cron delivery sweep only runs while the service is
  awake — fine for a low-traffic private app, but a paid instance (or an
  external uptime pinger) guarantees on-time delivery for long-dated letters.
- **`NODE_ENV=production`** disables the `/api/dev` force-deliver routes and
  switches the refresh-token cookie to `SameSite=None; Secure` so it works
  across the two subdomains.
- **Custom domain:** add it to the web service, then append it to
  `CLIENT_URLS` on the API and rebuild the web service with the new
  `VITE_API_URL` if the API domain also changes.
