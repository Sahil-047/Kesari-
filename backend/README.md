# Kesari API

Express 5 + TypeScript API behind the Kesari website and Kesari Studio (the CMS). MongoDB through Mongoose. Requests enter at `src/server.ts`, mount under `/api`, and follow a fixed path: **route → middleware → controller → use case → Mongoose model**.

## Stack

- **Express 5** for routing and middleware
- **TypeScript** (ESM, `nodenext`) compiled with `tsc` to `dist/`
- **MongoDB** via Mongoose 8
- **Yup** for request validation
- **JWT** authentication and role-permission (RBAC) checks
- **Multer** + **AWS S3** for the media library, streamed back through `/img`
- **Winston** logging, **Swagger** docs

## Folder structure

```
src/
├── server.ts                 # helmet, CORS, JSON, /img proxy, /api, Swagger, error handler, Mongo connect
├── config/index.ts           # single env-backed config object (validated with Yup)
├── routes/                   # one router per domain, assembled in routes/index.ts
│   ├── auth/  product/  craft/  collection/  editEntry/
│   ├── enquiry/  media/  page/  order/  user/
├── controller/<domain>/      # request handlers: one class per domain, exported as a singleton
├── usecase/<domain>/         # business rules: slugs, totals, guards, S3, analytics
├── model/                    # Mongoose schemas and models (shared.ts: base options, image schema)
├── validator/                # Yup schemas for body, query and params
├── middleware/               # authenticate, authorize, validateRequest, uploadFile, errorHandler, requestContext
├── util/
│   ├── enum/                 # modules, permissions + role map, domain option lists
│   ├── interface/            # TypeScript document types (extend mongoose Document)
│   └── helper/               # CustomError, JWT, S3 keys, slugs, pagination, responses
├── lib/                      # mongoose, swagger, winston, aws (S3 client)
├── docs/                     # Swagger @openapi blocks
└── scripts/                  # create-admin, seed-pages, s3-healthcheck
```

A feature has matching pieces across layers. Products, for example: `routes/product`, `controller/product/productController.ts`, `usecase/product/productUseCase.ts`, `model/product.model.ts`, `validator/productSchema.ts`, `util/interface/catalogue.interface.ts`, `util/enum/product.enum.ts`.

| Domain | Public | CMS | Module (RBAC) |
|---|---|---|---|
| Auth | `POST /api/auth/login` | `GET /api/auth/me`, `PATCH /api/auth/password` | — |
| Products | `GET /api/products`, `/products/:slug` | `/api/admin/products` | `PRODUCT MANAGEMENT` |
| Crafts | `GET /api/crafts`, `/crafts/:slug` | `/api/admin/crafts` | `CRAFT MANAGEMENT` |
| Collections | `GET /api/collections`, `/collections/:slug` | `/api/admin/collections` | `COLLECTION MANAGEMENT` |
| The Edit | `GET /api/edit` | `/api/admin/edit`, `PUT /admin/edit/order` | `THE EDIT` |
| Enquiries | `POST /api/enquiries` | `/api/admin/enquiries` | `ENQUIRY MANAGEMENT` |
| Media | `GET /img/<key>` | `/api/admin/media` | `MEDIA LIBRARY` |
| Pages | `GET /api/pages/:slug` | `/api/admin/pages`, `PUT /:slug`, `POST /:slug/publish` | `WEBSITE CONTENT` |
| Orders | `POST /api/orders` | `/api/admin/orders` | `ORDER MANAGEMENT` |
| Analytics | — | `GET /api/admin/analytics/sales` | `SALES ANALYTICS` |
| Team | — | `/api/admin/users` | `USER MANAGEMENT` (admin only) |

`GET /api/ping` returns a health payload; `GET /health` is kept for uptime checks. `/api/v1/*` is a legacy alias of `/api/*`.

## How a request is written

A protected route is a middleware chain, then a controller method:

1. **`authenticate`** reads a `Bearer` JWT, verifies it, checks the account is still active, and sets `req.user`.
2. **`authorize(ModulesEnum.X, PermissionEnum.Y)`** checks the role against `RolePermissions` in `util/enum/permission.enum.ts`. Admins hold every permission; editors hold everything except `USER MANAGEMENT`.
3. **`validateRequest({ schema, type })`** runs a Yup schema against `req.body`, `req.query` or `req.params` (`PayloadType`) and replaces it with the cast value.
4. The **controller** reads the validated input and calls the **use case**, which runs the Mongoose queries and business rules.
5. Failures call `next(error)`; use cases throw `new CustomError(message, statusCode)`. `errorHandler` answers `{ success: false, error: { message, details?, requestId } }`.

Controllers are classes of `RequestHandler` methods, exported as singletons:

```ts
class ProductController {
  createProduct: RequestHandler = async (req, res, next) => {
    try {
      sendCreated(res, await ProductUseCase.createProduct(bodyOf<CreateProductInput>(req)));
    } catch (error) {
      next(error);
    }
  };
}
export default new ProductController();
```

Status codes use Axios `HttpStatusCode`. Successful responses are `{ success: true, data, meta? }`; list endpoints page with `commonConfig.pageSize` (`PAGE_SIZE`, default 20).

## How schemas are designed

**Mongoose models (`src/model`)** are the database shape: an interface in `util/interface` that extends `Document`, `new Schema<IThing>({ ... }, baseSchemaOptions)`, then `mongoose.model`. Controlled values use `enum: Object.values(SomeEnum)`. Nested schemas set `{ _id: false }`. JSON output uses `id` instead of `_id`, and users never serialise `passwordHash`.

**Yup validators (`src/validator`)** are the request shape. Each resource defines its field rules once; the create schema adds `required()` and defaults, the update schema leaves every field optional, so a PATCH only changes what it sends. Enums are shared with the models (`.oneOf(Object.values(Enum))`).

## Adding a feature

1. Add option lists to `src/util/enum`.
2. Add an interface in `src/util/interface` and a model in `src/model`.
3. Add Yup schemas in `src/validator`.
4. Add a use-case class in `src/usecase/<domain>` and export `new UseCase()`.
5. Add a controller class in `src/controller/<domain>` and export `new Controller()`.
6. Add a router in `src/routes/<domain>` chaining `authenticate`, `authorize`, `validateRequest`, then the handler, and mount it in `src/routes/index.ts`.
7. Add the module to `ModulesEnum` (and `RolePermissions` if editors should not have it), and document it in `src/docs`.

## Scripts

- `npm run dev` — start with `tsx watch`
- `npm run build` — compile to `dist/`
- `npm start` — run `node dist/server.js`
- `npm run typecheck`
- `npm run create-admin -- <email> <password> "<name>"`
- `npm run seed-pages` — publish empty content for pages never published
- `npm run s3-healthcheck`

Copy `.env.example` to `.env` first. `MONGODB_URI` (or `MONGO_URI`) and `JWT_SECRET` (32+ characters) are required. The server listens on `0.0.0.0:PORT` (default 4000).

## API docs

Swagger UI: `http://localhost:4000/api-docs` (raw spec at `/api-docs.json`). Add `@openapi` blocks to `.ts` files under `src/docs/`.
