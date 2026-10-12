# Deploying HeyFutureJasmine! to Render

The repo ships a `render.yaml` Blueprint that provisions two services:

| Service | Type | Root | What it is |
|---|---|---|---|
| `heyfuturejasmine-api` | Web (Node) | Repository root | Express API in `server/` |
| `heyfuturejasmine-web` | Static | Repository root | Vite React frontend in `client/` |

Leave Render's **Root Directory** empty for both services. The frontend imports
schemas from `shared/`, which Render would exclude with a `client/` root directory.
The Blueprint runs commands with the appropriate subdirectory paths and publishes
`client/dist`. It also sets `NODE_VERSION=24.14.1` explicitly for both services.

Redis is intentionally skipped — the five-minute cron **delivery sweep** delivers
letters without it. MongoDB is hosted separately on **MongoDB Atlas** (free M0).

Node is pinned to 24.14.1 in `.node-version` for local development, CI, and Render.

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
   - `RESEND_API_KEY` — required for a public launch: verification, password
     reset, and delivery emails need a working key and a verified `EMAIL_FROM`
     sender. Leaving it blank only logs email subjects; users cannot verify
     their accounts from those logs.
   - `CLIENT_URL` and `CLIENT_URLS` — set after noting the frontend URL (step 3).
   - `VITE_API_URL` belongs to **`heyfuturejasmine-web`**, not the API (step 3).
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
  `CLIENT_URL = https://heyfuturejasmine-web.onrender.com` and
  `CLIENT_URLS = https://heyfuturejasmine-web.onrender.com`
  (comma-separate `CLIENT_URLS` if you add a custom domain later). `CLIENT_URL`
  is the canonical frontend URL used in email links; if absent, the first
  origin in `CLIENT_URLS` is used. Saving redeploys the API.
- The Blueprint sets `TRUST_PROXY=1` for Render's reverse proxy. This keeps
  rate limits per client IP. If adding another proxy, verify the proxy chain
  and adjust the hop count; do not use an unrestricted `trust proxy=true`.

## 4. Verify

### Email without your own domain (small deployment)

Create a free Brevo account. In **Settings → Senders, Domains & IPs → Senders**,
add an email address you own (for example, your Gmail address) and verify it using
the email Brevo sends. Enable transactional email if Brevo asks for account review.
Create an **API key** under **SMTP & API** (use the API key, not the SMTP key).

On the Render **API service**, set:

```env
EMAIL_PROVIDER=brevo
BREVO_API_KEY=<your Brevo API key>
BREVO_SENDER_EMAIL=<your verified sender email address>
```

Keep credentials in Render, not git or chat. Resend settings are ignored when
`EMAIL_PROVIDER=brevo`. Keep `CLIENT_URL` pointed to the frontend so verification
links open the app. Brevo currently substitutes its own sender domain for free
email addresses; it describes this as a temporary solution:
https://help.brevo.com/hc/en-us/articles/14925263522578-Comply-with-Gmail-Yahoo-and-Microsoft-s-requirements-for-email-senders

After redeploying both services, existing unverified users can sign in and click
**Resend verification**. Failed sends show an error instead of a success notice.

### Live checks

- `https://heyfuturejasmine-api.onrender.com/api/health` → `{"status":"ok"}`
- Open the web URL, register, write a letter, and use a near-future delivery
  date to watch the reveal.
- Receive a real verification email, follow its HTTPS link, then test password
  reset, login, page reload, and refresh-token renewal in your target browsers.
- With Cloudinary configured, upload a photo and a voice note. Uploads and avatars
  are limited to 8 MB per file; an oversized upload returns `413`.
- Confirm `/api/dev/sweep` is unavailable in production.

Before deploying, run `npm test`, `npm run build`, and `npm audit --prefix server`
plus `npm audit --prefix client`. The deployment tests use temporary MongoDB and
mock email HTTP responses; the checks above still require your live services.

The patched frontend uses Tailwind 4 and targets Safari 16.4+, Chrome 111+, and
Firefox 128+. The editor preserves the existing formatting toolbar and letter HTML.
To roll back this code/configuration change, redeploy the preceding commit with
its matching lockfiles; no database migration is required.

---

### Notes & gotchas

- **Free plan cold starts:** the API sleeps after ~15 min idle and takes
  ~30–50s to wake, which stops the in-process cron sweep. Two things cover this:
  1. **Sweep on request** (`server/src/middleware/sweepOnRequest.js`) — every
     request, including the health check, runs an overdue-letter sweep at most
     once per 5 minutes (`SWEEP_MIN_INTERVAL_MS`). A letter can arrive late, but
     it can never be *missed*: the first visit after any downtime delivers it.
  2. **Keep-alive ping** (`.github/workflows/keepalive.yml`) — a scheduled
     workflow curling `/api/health` every 10 minutes, which also acts as a
     delivery tick. Set the repo variable `API_HEALTH_URL` (Settings → Secrets
     and variables → Actions → Variables) to
     `https://heyfuturejasmine-api.onrender.com/api/health` to enable it.

  Caveats worth knowing: GitHub delays scheduled workflows under load and
  disables them after 60 days of repo inactivity, so treat the ping as
  best-effort — layer 1 is what makes delivery correct. A free external monitor
  (cron-job.org, UptimeRobot) is a firmer guarantee. Also, keeping one free web
  service warm around the clock burns ~730 of Render's 750 free instance-hours
  per month; the static site doesn't consume hours, so this fits, but only just.
- **`NODE_ENV=production`** disables the `/api/dev` force-deliver routes and
  switches the refresh-token cookie to `SameSite=None; Secure` so it works
  across the two subdomains.
- **Custom domain:** add it to the web service, then append it to
  `CLIENT_URLS` and update `CLIENT_URL` on the API, then rebuild the web service with the new
  `VITE_API_URL` if the API domain also changes.
