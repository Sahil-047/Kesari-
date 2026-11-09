# Kesari — Deploy & Update Guide

Production stack on a shared Ubuntu VPS: **Docker Compose** for the app, **host nginx** for HTTP(S), **host MongoDB** for data.

**Live domain (this project):** `kesaribybhumikapatel.in`  
**Git branch:** `kesari-site`  
**Server path:** `/var/www/Kesari-`  
**Repo:** `https://github.com/Sahil-047/Kesari-.git`

---

## Architecture

```
Browser
   │
   ▼
nginx :80 / :443          (TLS via Certbot)
   │
   ├─ /  /admin  /_next…  →  127.0.0.1:3020   frontend (Next.js)
   └─ /api /img /api-docs /health
                          →  127.0.0.1:4000   backend  (Express)
                                              │
                                              ▼
                                    host mongod :27017
                                    database: kesari
```

| Piece | Where it runs | Notes |
|---|---|---|
| Frontend | Docker `kesari-web` | Built with `NEXT_PUBLIC_API_URL=https://DOMAIN/api` |
| Backend | Docker `kesari-api` | Reads **root** `.env` (not `backend/.env`) |
| MongoDB | Host `mongod` | URI must reach the host from Docker — never `localhost` inside a container |
| nginx | Host | Existing sites stay as they are; Kesari is one more `sites-enabled` entry |
| Media photos/films | Disk under `frontend/public/` | **Not in git** — sync separately |
| Brand logos | `frontend/src/assets/brand/` | **In git** (required at build time) |

Do **not** start the Compose `caddy` profile on this VPS — nginx already owns 80/443.

---

## Prerequisites (server)

- Ubuntu with Docker Engine + Compose plugin
- nginx + (recommended) Certbot
- MongoDB running (`systemctl status mongod`)
- DNS **A** record for the domain → server IP
- Ports 80/443 open (UFW: Nginx Full / OpenSSH is enough; do **not** need to expose 3020/4000 publicly)

```bash
docker --version
docker compose version
nginx -v
mongosh --quiet --eval 'db.runCommand({ ping: 1 })'
```

---

## First-time deploy

### 1. Clone the right branch

```bash
cd /var/www
git clone -b kesari-site https://github.com/Sahil-047/Kesari-.git Kesari-
cd /var/www/Kesari-
git rev-parse --short HEAD    # confirm you are on kesari-site tip
```

If the folder already exists but was on `main`:

```bash
cd /var/www/Kesari-
git fetch origin
git checkout kesari-site
git reset --hard origin/kesari-site
```

> **Common mistake:** server stays on `main` while all site work is pushed to `kesari-site`. Always check `git branch -vv`.

### 2. Create root `.env`

```bash
cp .env.example .env
nano .env
```

Minimum for this VPS:

```env
DOMAIN=kesaribybhumikapatel.in

# Host Mongo from Docker (best practice on this box)
MONGODB_URI=mongodb://172.17.0.1:27017/kesari?directConnection=true

JWT_SECRET=<paste: openssl rand -base64 48>
JWT_EXPIRES_IN=7d

AWS_REGION=ap-south-1
AWS_S3_BUCKET=<your-bucket>
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>

MAX_UPLOAD_MB=200
PAGE_SIZE=10
LOG_LEVEL=info
```

Videos: **MP4** / **WebM** (MOV uploads too). `MAX_UPLOAD_MB` and nginx `client_max_body_size` must both be ≥ the file (e.g. `200m` when `MAX_UPLOAD_MB=200`).

Rules:

| Rule | Why |
|---|---|
| Edit `/var/www/Kesari-/.env` | Compose loads **root** `.env` only |
| Never `mongodb://localhost:...` in Docker | `localhost` = the container, not the host |
| Prefer `172.17.0.1` + `directConnection=true` | Avoids replica-set discovery rewriting host to `localhost` |
| `DOMAIN` must match nginx `server_name` | CORS + browser API URL |
| Changing `DOMAIN` → rebuild frontend | `NEXT_PUBLIC_API_URL` is baked in at build |

Optional ports (defaults match nginx example):

```env
FRONTEND_HOST_PORT=3020
BACKEND_HOST_PORT=4000
```

### 3. Sync storefront media (gitignored)

Photos and films are **not** in git:

- ignored: `frontend/public/images/`, `frontend/public/videos/`
- still in git: fonts, textures, logos under `src/assets/brand/`

From your laptop (PowerShell / WSL), once:

```bash
rsync -avz --progress \
  frontend/public/images/ frontend/public/videos/ \
  root@YOUR_SERVER_IP:/var/www/Kesari-/frontend/public/
```

Or `scp -r`. Confirm on the server:

```bash
ls frontend/public/images | head
ls frontend/public/videos | head
```

Without this step the site builds, but many pages show missing images/video.

### 4. Build & start containers

```bash
cd /var/www/Kesari-
docker compose up -d --build
docker compose ps
```

Expect `backend` **healthy** and `frontend` **running/healthy**.

Smoke tests:

```bash
curl -s http://127.0.0.1:4000/health
# {"status":"ok","db":"up"}

curl -sI http://127.0.0.1:3020/ | head -5
# HTTP/1.1 200 …
```

Create the first Studio admin (once):

```bash
docker compose exec backend node dist/scripts/create-admin.js \
  you@kesari.in 'a-long-password' 'Your Name'
```

Optional empty page seeds:

```bash
docker compose exec backend node dist/scripts/seed-pages.js
```

### 5. Nginx site

```bash
sudo cp /var/www/Kesari-/deploy/nginx.conf.example /etc/nginx/sites-available/kesari
sudo nano /etc/nginx/sites-available/kesari
```

Set:

```nginx
server_name kesaribybhumikapatel.in www.kesaribybhumikapatel.in;
```

Enable and reload:

```bash
sudo ln -sf /etc/nginx/sites-available/kesari /etc/nginx/sites-enabled/kesari
sudo nginx -t && sudo systemctl reload nginx
curl -sI -H "Host: kesaribybhumikapatel.in" http://127.0.0.1/ | head -5
```

> If `server_name` is still `kesari.example.com`, nginx returns a **404** from another/default vhost — the containers can be fine while the public domain looks broken.

### 6. HTTPS (Certbot)

```bash
sudo certbot --nginx -d kesaribybhumikapatel.in -d www.kesaribybhumikapatel.in
sudo nginx -t && sudo systemctl reload nginx

curl -sI https://kesaribybhumikapatel.in/ | head -8
curl -s https://kesaribybhumikapatel.in/health
```

Studio: `https://kesaribybhumikapatel.in/admin`  
API docs: `https://kesaribybhumikapatel.in/api-docs`

---

## Kesari Studio (admin panel)

Studio is **not a separate deploy**. It is the same Next frontend at `/admin`, talking to the same Express API at `/api`. nginx already routes both.

| URL | What |
|---|---|
| `https://kesaribybhumikapatel.in/admin` | Dashboard (redirects to login if signed out) |
| `https://kesaribybhumikapatel.in/admin/login` | Sign in |
| `https://kesaribybhumikapatel.in/api` | JSON API the CMS uses |
| `https://kesaribybhumikapatel.in/api-docs` | Swagger (useful when debugging CMS calls) |

### What you manage in Studio

| Nav | Path | Purpose |
|---|---|---|
| Dashboard | `/admin` | Overview |
| Products | `/admin/products` | Catalogue (sizes, placements, media, pricing) |
| Media library | `/admin/media` | Uploads to **S3**, served via `/img/...` |
| Pages | `/admin/content` | Website page copy/sections (Home, etc.) |
| Orders | `/admin/orders` | Sales |
| Enquiries | `/admin/enquiries` | House enquiries |
| Team | `/admin/users` | Users (**admin role only**) |

Auth: JWT in browser `localStorage` key `kesari.cms.token`. Logout clears it. `JWT_SECRET` in root `.env` must stay stable or every session is invalidated.

### First admin user (required once)

Containers must be up and Mongo reachable:

```bash
cd /var/www/Kesari-
docker compose exec backend node dist/scripts/create-admin.js \
  you@kesaribybhumikapatel.in 'a-long-password' 'Your Name'
```

Then open `https://kesaribybhumikapatel.in/admin/login` and sign in.

Create another admin later the same way, or from **Team** if you already have an admin session.

### Seed empty website pages (optional, once)

Public page reads 404 until a slug is published. After the first admin exists:

```bash
docker compose exec backend node dist/scripts/seed-pages.js
```

That publishes empty drafts for every known page slug so the storefront can merge CMS overlays over defaults. Edit real copy in **Pages**.

### Studio checklist after a fresh deploy

1. `curl -s https://kesaribybhumikapatel.in/health` → `"db":"up"`
2. Create admin (command above)
3. Log in at `/admin/login`
4. **Media:** upload a test image — needs working S3 keys in root `.env`
5. **Products:** create or edit one product; confirm it on `/products`
6. **Pages:** open Home (or seed-pages first), publish, confirm storefront
7. Optional: `docker compose exec backend node dist/scripts/s3-healthcheck.js` if that script is in the image

### Env that Studio depends on

| Variable | Effect on admin |
|---|---|
| `DOMAIN` | Browser calls `https://DOMAIN/api` (baked into frontend build) |
| `MONGODB_URI` | All CMS data |
| `JWT_SECRET` | Login tokens |
| `AWS_*` | Media library uploads |
| `CORS_ORIGINS` | Set automatically from `DOMAIN` in Compose |

If login works locally but production login fails with network/CORS errors, rebuild frontend after fixing `DOMAIN`, and confirm nginx proxies `/api` to `:4000`.

### Updating Studio

Same as the storefront — Studio ships inside the frontend/backend images:

```bash
cd /var/www/Kesari-
git fetch origin && git reset --hard origin/kesari-site
docker compose up -d --build
```

No separate admin container. After deploy, hard-refresh the browser (or clear site data) if an old JS bundle or token acts weird.

| Change | Action |
|---|---|
| CMS UI / admin React code | Rebuild frontend |
| API routes / models / validators | Rebuild backend |
| New admin password for a user | Create new admin or reset via Mongo / Team UI |
| Lost access (no admins) | Run `create-admin.js` again |

### Reset / recover admin access

```bash
# New admin (email must not already exist)
docker compose exec backend node dist/scripts/create-admin.js \
  recovery@kesaribybhumikapatel.in 'new-long-password' 'Recovery'

# Inspect users in Mongo (host mongod)
mongosh kesari --eval 'db.users.find({}, {email:1, role:1, isActive:1}).toArray()'
```

### Studio troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Login page loads, submit fails | API down / wrong `NEXT_PUBLIC_API_URL` | `curl /health`; rebuild frontend with correct `DOMAIN` |
| 401 immediately / kicked to login | Bad or rotated `JWT_SECRET` | Keep secret stable, or sign in again after recreate |
| Media upload errors | S3 keys / bucket / region | Check root `.env` `AWS_*`; run S3 healthcheck |
| Pages 404 on storefront | Never published | `seed-pages.js` or Publish in **Pages** |
| Team menu missing | Non-admin role | Use an ADMIN account |
| `/admin` is storefront 404 | nginx not proxying to frontend | Confirm `location /` → `kesari_web` |

---

## Everyday update (after you push to GitHub)

On your machine: commit + push to **`kesari-site`**.

On the server:

```bash
cd /var/www/Kesari-

# 1) Code
git fetch origin
git checkout kesari-site
git reset --hard origin/kesari-site
git rev-parse --short HEAD

# 2) Media (only if you added/changed photos or films locally)
# rsync from laptop again if needed

# 3) Rebuild & restart
docker compose up -d --build

# 4) Verify
docker compose ps
curl -s http://127.0.0.1:4000/health
curl -sI https://kesaribybhumikapatel.in/ | head -5
```

| Changed what? | Need rebuild? |
|---|---|
| Backend / frontend code | `docker compose up -d --build` |
| Root `.env` (Mongo, JWT, S3) | `docker compose up -d` (recreate). If `DOMAIN` changed → **rebuild frontend** |
| nginx config only | `sudo nginx -t && sudo systemctl reload nginx` |
| Photos / videos on disk | No rebuild if already in the image volume/`public` — but **image rebuild** picks up `public/` into the frontend image, so after rsync run `--build` for frontend |
| Mongo data | Nothing — data lives in host `mongod` |

Shorthand when you only changed app code:

```bash
cd /var/www/Kesari- && \
  git fetch origin && git reset --hard origin/kesari-site && \
  docker compose up -d --build
```

---

## MongoDB notes (host DB)

**Recommended URI for this VPS:**

```env
MONGODB_URI=mongodb://172.17.0.1:27017/kesari?directConnection=true
```

Compose also defines:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

so this also works:

```env
MONGODB_URI=mongodb://host.docker.internal:27017/kesari?directConnection=true
```

| Symptom | Cause | Fix |
|---|---|---|
| `Server selection timed out` | Bad host / RS discovery to `localhost` | Use `172.17.0.1` + `directConnection=true` |
| `getaddrinfo ENOTFOUND host.docker.internal` | Missing `extra_hosts` on server compose | Pull latest compose or add the `extra_hosts` block under `backend` |
| Healthy API, empty CMS | Wrong DB name / fresh DB | Confirm URI ends with `/kesari`; create admin + seed |

Hardening (recommended later): enable Mongo auth, and restrict UFW so `27017` is not open to the world.

---

## Ops cheat sheet

```bash
cd /var/www/Kesari-

docker compose ps
docker compose logs -f --tail=100 backend
docker compose logs -f --tail=100 frontend
docker compose restart backend frontend
docker compose up -d --force-recreate backend

curl -s http://127.0.0.1:4000/health
curl -sI http://127.0.0.1:3020/
curl -s https://kesaribybhumikapatel.in/health

# Shell into API
docker compose exec backend sh
```

| URL | Purpose |
|---|---|
| `https://DOMAIN/` | Storefront |
| `https://DOMAIN/admin` | Kesari Studio CMS |
| `https://DOMAIN/api` | API |
| `https://DOMAIN/img/...` | Media proxy (S3) |
| `https://DOMAIN/health` | `{ status, db }` |
| `https://DOMAIN/api-docs` | Swagger |

---

## Troubleshooting

### Public site 404, containers look fine

```bash
grep server_name /etc/nginx/sites-available/kesari
# must be your real domain, not kesari.example.com
sudo nginx -t && sudo systemctl reload nginx
```

### Backend unhealthy / empty `curl :4000/health`

```bash
docker compose logs --tail=80 backend
grep '^MONGODB_URI=' .env
# fix URI, then:
docker compose up -d --force-recreate backend
```

### Frontend build fails: can't resolve `kesari-logo.png`

Logos must live in `frontend/src/assets/brand/` (tracked in git). Pull latest `kesari-site` — do not rely on gitignored `public/images` for the logo import.

### Wrong / old code after pull

```bash
git branch -vv
# must show * kesari-site … origin/kesari-site
git log -1 --oneline
docker compose up -d --build
```

### Port already in use

```bash
ss -tulpn | grep -E '3020|4000'
# change FRONTEND_HOST_PORT / BACKEND_HOST_PORT in .env
# and matching upstreams in /etc/nginx/sites-available/kesari
```

---

## What not to do

- Do not deploy from `main` for the storefront — use **`kesari-site`**
- Do not run Compose **caddy** alongside host nginx on 80/443
- Do not put secrets in git — only root `.env` on the server
- Do not expect photos/films from `git pull` — rsync `public/images` + `public/videos`
- Do not use `backend/.env` for production Compose

---

## Optional: bundled Mongo instead of host

Only if you stop using host `mongod` for Kesari:

```env
MONGODB_URI=mongodb://mongo:27017/kesari
```

```bash
docker compose --profile local-db up -d --build
```

Data then lives in the Docker volume `kesari_mongo-data`.

---

## Optional: Caddy-only box (not this VPS)

If the server has **no** nginx and nothing on 80/443:

```bash
# set DOMAIN + ACME_EMAIL in .env
docker compose --profile caddy up -d --build
```

On `srv927075` keep nginx + Certbot as documented above.
