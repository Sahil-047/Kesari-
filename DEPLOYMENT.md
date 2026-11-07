# Deploying Kesari (Docker)

One server runs three containers behind one domain:

```
             https://kesari.example.com
                         │
                  ┌──────▼──────┐   automatic HTTPS (Let's Encrypt)
                  │    caddy    │
                  └──┬───────┬──┘
   /, /admin, /_next │       │ /api, /img, /api-docs, /health
            ┌────────▼──┐ ┌──▼────────┐
            │ frontend  │ │  backend  │──► MongoDB (Atlas, or the optional mongo container)
            │ Next 16   │ │ Express 5 │──► AWS S3 (media library)
            └───────────┘ └───────────┘
              server rendering → http://backend:4000/api (private network)
```

| File | Purpose |
|---|---|
| `backend/Dockerfile` | Compiles the API (`tsc`), ships `dist/` + production deps, runs `node dist/server.js` |
| `frontend/Dockerfile` | Builds Next.js in `standalone` mode, ships `server.js` + `.next/static` + `public/` |
| `docker-compose.yml` | backend, frontend, caddy (+ `mongo` under the `local-db` profile) |
| `deploy/Caddyfile` | Routes the domain to the two apps, HTTPS, security headers |
| `.env.example` | Every setting the stack needs; copy to `.env` on the server |

## 1. Server

- A Linux VM (2 vCPU / 4 GB RAM is comfortable) with Docker Engine and the Compose plugin.
- Ports **80** and **443** open.
- A DNS **A** (and **AAAA** if you have IPv6) record for your domain pointing at the server.
- About 6 GB free disk for the images (`public/` alone is ~1.7 GB of photographs and films).

## 2. Configure

```bash
git clone <your repo> kesari && cd kesari
cp .env.example .env
nano .env
```

Fill in at least:

| Variable | Notes |
|---|---|
| `DOMAIN` | e.g. `kesari.in`. The site, CMS (`/admin`), API (`/api`) and media (`/img`) all use it |
| `ACME_EMAIL` | Let's Encrypt contact |
| `MONGODB_URI` | MongoDB Atlas URI (recommended). Allow the server's IP in Atlas *Network Access* |
| `JWT_SECRET` | 32+ random characters: `openssl rand -base64 48` |
| `AWS_REGION`, `AWS_S3_BUCKET`, keys | S3 media bucket. Leave keys empty on AWS to use an instance role |

`CORS_ORIGINS`, `AWS_S3_PUBLIC_URL` (`https://DOMAIN/img`), the public API URL (`https://DOMAIN/api`) and the private API URL are derived in `docker-compose.yml`, so they always agree with `DOMAIN`.

## 3. Launch

```bash
docker compose up -d --build
docker compose ps            # backend and frontend should become "healthy"
docker compose logs -f caddy # watch the certificate being issued
```

Create the first CMS admin (once):

```bash
docker compose exec backend node dist/scripts/create-admin.js you@kesari.in "a-long-password" "Your Name"
```

Optionally publish empty content for every page so public page reads never 404:

```bash
docker compose exec backend node dist/scripts/seed-pages.js
```

Open `https://DOMAIN` (site) and `https://DOMAIN/admin` (Kesari Studio). API docs: `https://DOMAIN/api-docs`.

### Self-hosted MongoDB instead of Atlas

Set `MONGODB_URI=mongodb://mongo:27017/kesari` in `.env`, then:

```bash
docker compose --profile local-db up -d --build
```

Data lives in the `mongo-data` volume. Back it up (`mongodump`) on a schedule.

## 4. Updating

```bash
git pull
docker compose up -d --build
```

- **Changing `DOMAIN` needs a rebuild of the frontend**: the public API URL is compiled into the browser bundle.
- Only one frontend instance is supported as configured (Next's cache and the CMS's instant "publish" refresh are per-instance). Scaling out needs a shared cache handler; see the Next.js self-hosting guide.

## 5. Operations

| Task | Command |
|---|---|
| Status / health | `docker compose ps` |
| Logs | `docker compose logs -f backend` (JSON lines in production) |
| Restart one service | `docker compose restart frontend` |
| Health endpoint | `curl https://DOMAIN/health` → `{"status":"ok","db":"up"}` |
| Shell in the API | `docker compose exec backend sh` |

Persistent volumes: `caddy-data` (certificates; keep it, or Let's Encrypt rate limits apply), `next-cache` (rendered pages and optimised images), `mongo-data` (only with `local-db`).

## Notes

- **Media**: uploads go to S3 and are served through the API at `https://DOMAIN/img/...`, so the bucket can stay private. A CloudFront domain can replace it later by changing `AWS_S3_PUBLIC_URL` in `docker-compose.yml`.
- **Image size**: the frontend image carries `public/` (~1.7 GB, mostly films). Moving `public/videos` to S3/CloudFront would shrink it considerably.
- **Secrets** stay in `.env` on the server only; `.env` is git-ignored and excluded from both Docker build contexts.
- Local dev is unchanged: `npm run dev` in `backend/` and `frontend/`.
