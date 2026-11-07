# Deploy Kesari (nginx + Docker)

Shared VPS with existing nginx: containers stay on localhost; nginx terminates HTTP(S).

```
https://DOMAIN
        │
     nginx :80/:443
    ┌─────┴──────┐
 /  │            │  /api /img /api-docs /health
 web│3020        │4000 api
```

## 1. Code + env

```bash
cd /var/www/Kesari-
git fetch origin && git checkout kesari-site && git reset --hard origin/kesari-site
cp .env.example .env && nano .env   # DOMAIN, MONGODB_URI, JWT_SECRET, S3
```

`DOMAIN` must match the nginx `server_name`. Changing it requires a frontend rebuild.

Media (`frontend/public/images`, `videos`) is gitignored — rsync it onto the server before building if the site needs those files.

## 2. Containers

```bash
docker compose up -d --build
docker compose ps          # backend + frontend healthy
curl -s http://127.0.0.1:4000/health
curl -sI http://127.0.0.1:3020/
```

No Caddy. Ports: `127.0.0.1:3020` (web), `127.0.0.1:4000` (api).

First admin:

```bash
docker compose exec backend node dist/scripts/create-admin.js you@kesari.in 'password' 'Name'
```

## 3. Nginx

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/kesari
sudo nano /etc/nginx/sites-available/kesari   # set server_name to DOMAIN
sudo ln -sf /etc/nginx/sites-available/kesari /etc/nginx/sites-enabled/kesari
sudo nginx -t && sudo systemctl reload nginx
```

Optional TLS (only if you want HTTPS):

```bash
sudo certbot --nginx -d your.domain -d www.your.domain
```

## 4. Update later

```bash
git pull origin kesari-site
docker compose up -d --build
```

| Check | Command |
|---|---|
| Status | `docker compose ps` |
| Logs | `docker compose logs -f backend frontend` |
| Health | `curl https://DOMAIN/health` |
