# Kesari API

Content API and CMS backend for the Kesari site. Express 5, TypeScript, MongoDB (Mongoose), Zod, JWT, AWS S3.

## Run

```bash
npm install
cp .env.example .env   # fill in MongoDB, JWT secret and S3
npm run create-admin -- you@example.com "a-long-password" "Your Name"
npm run dev            # http://localhost:4000
```

## Structure

A request flows **route → middlewares → controller → service → repository → model**. Each layer has one job and only talks to the layer below it.

```
src/
  server.ts        start-up: connect DB, listen, graceful shutdown
  app.ts           Express app: security, CORS, JSON, routes, errors
  config/          env (validated with Zod), MongoDB, S3 client
  routes/          URL → middleware chain → controller; public vs /admin
  middlewares/     requestContext, validate, authenticate, authorize, upload, notFound, errorHandler
  validators/      Zod schemas for request body / query / params
  controllers/     HTTP only: read validated input, call a service, send the response
  services/        business rules (slugs, reorder, last-admin guard, S3 upload)
  repositories/    the only code that queries MongoDB (BaseRepository + per-resource)
  schemas/         Mongoose schemas and their inferred types
  models/          Mongoose models built from the schemas
  types/           shared types (roles, Express request augmentation)
  utils/           ApiError, logger, response helpers, pagination, slugify
  scripts/         create-admin
```

## Endpoints (`/api/v1`)

| Public | |
| --- | --- |
| `POST /auth/login` | returns `{ token, user }` |
| `GET /products`, `/products/:slug` | published only; `?category&craft&featured&search&page&limit` |
| `GET /crafts`, `/crafts/:slug` | published only |
| `GET /collections`, `/collections/:slug` | published only; `?category=lehenga\|dress\|saree` |
| `GET /edit` | The Edit, in order |
| `POST /enquiries` | Atelier form |

| CMS (`Authorization: Bearer <token>`) | |
| --- | --- |
| `GET /auth/me`, `PATCH /auth/password` | current user |
| `/admin/products`, `/admin/crafts`, `/admin/collections` | full CRUD, drafts included |
| `/admin/edit` + `PUT /admin/edit/order` | The Edit and its order |
| `/admin/enquiries` | list, update status / internal note, delete |
| `/admin/media` | multipart upload (`file`, `alt`) to S3, list, update alt, delete |
| `/admin/users` | admin role only |

Responses are `{ success: true, data, meta? }` or `{ success: false, error: { message, details?, requestId } }`.
