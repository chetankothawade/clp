# Customer Loyalty Program — Backend

A microservices-based **Customer Loyalty Program** backend built with Node.js, Express, and PostgreSQL. The repository is organized as a **npm-workspaces monorepo** where each domain is an independently deployable service behind a single public **API Gateway**.

## Overview

The architecture follows a **gateway-first** microservices pattern:

- The **API Gateway** is the only public entry point for clients.
- Downstream services own their business logic, databases, migrations, and seeders.
- Services communicate via REST only when needed (e.g., Loyalty → Product for purchase details).
- **Auth Service** is the single JWT issuer; the gateway verifies tokens and forwards trusted identity headers.
- Each service connects **only** to its own database.

## Services

| Service | Responsibility | Default Port | Database |
| --- | --- | --- | --- |
| `api-gateway` | Public entry point, routing, JWT verification, CORS, rate limiting, request IDs, logging, circuit breaking | `8000` | — |
| `auth-service` | Authentication, user accounts, roles, permissions, modules, JWT issuance | `8001` | `auth_db` |
| `product-service` | Product catalog, categories, purchase pricing details | `8002` | `product_db` |
| `loyalty-service` | Purchases, rewards, redemptions, dashboard, point balance | `8003` | `loyalty_db` |
| `admin-service` | CMS/editor content management, administrative workflows, uploads | `8004` | `admin_db` |

## Monorepo Layout

```text
backend/
  apps/
    api-gateway/          # Public API gateway
    auth-service/         # Authentication & auth database
    product-service/      # Products & categories
    loyalty-service/      # Purchases, rewards, redemptions
    admin-service/        # CMS / editor / admin
  packages/
    shared/               # @loyalty/shared cross-cutting utilities
  infra/
    docker/               # docker-compose.yml
    k8s/                  # Kubernetes manifests (reserved)
  docs/                   # Architecture & operations docs
  uploads/                # Uploaded files (images, docs, etc.)
  postman_collection.json # Sample API requests
```

- `apps/` — runnable domain services.
- `packages/shared/` — shared logger, response helpers, error handling, token utilities, and middleware.
- `infra/` — deployment and environment configuration.
- `docs/` — migration guide, loyalty program details, and testing/operations notes.

### Shared package (`@loyalty/shared`)

`packages/shared` exports common utilities used across services:

- `logger` / `getServiceEnv`
- `sendResponse`, `sendListResponse`, `handleError`
- `asyncHandler`, `requestId`
- `signToken`, `verifyToken`

## Prerequisites

- **Node.js** 20+ (the services use `node --watch` and modern ESM features)
- **npm** 9+ (npm workspaces)
- **PostgreSQL** 14+ (one database per service)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

This installs all workspace dependencies (all `apps/*` and `packages/*`).

### 2. Configure environment

Each service reads its own environment file. The server entry point loads `.env.local` by default (overridable via `DOTENV_CONFIG_PATH`), falling back to `.env` in other modules. Copy an existing service's `.env`/`.env.local` template or create one per service.

Example `.env.local` for a service:

```bash
PORT=8003
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=loyalty_db
DB_USER=postgres
DB_PASS=postgres
DB_DIALECT=postgres
CLIENT_ORIGIN=http://localhost:3000
```

### 3. Run migrations and seeders

Database commands can be run either from the repository root (applies the command to **all** services sequentially) or inside a specific service folder (only that service):

```bash
# From the repository root — runs db:migrate in every service that supports it
npm run db:migrate
npm run db:seed

# From a service folder, e.g. apps/loyalty-service — only that service
cd apps/loyalty-service
npm run db:migrate
npm run db:seed
```

Available root-level convenience scripts: `db:migrate`, `db:migrate:undo`, `db:seed`, `db:seed:undo`. Each runs the same-named script across all workspaces (`--workspaces --if-present`), so the API gateway and shared package (which have no `db:*` scripts) are safely skipped.

### 4. Start the services

From the repository root, each service has a dedicated dev script:

```bash
npm run dev:gateway   # API gateway        -> http://localhost:8000
npm run dev:auth      # auth-service        -> http://localhost:8001
npm run dev:product   # product-service     -> http://localhost:8002
npm run dev:loyalty   # loyalty-service     -> http://localhost:8003
npm run dev:admin     # admin-service       -> http://localhost:8004
```

> The gateway proxies to downstream services using the `*_SERVICE_URL` environment variables (defaults: `8001`–`8004`). Start at least the gateway and the target service(s) you want to reach.

### Service lifecycle commands

Each service supports the following common scripts (run from inside the service folder):

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start with hot reload (nodemon) |
| `npm start` | Start the server |
| `npm test` | Run unit/integration tests |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run db:migrate` | Run database migrations |
| `npm run db:migrate:undo` | Undo the last migration |
| `npm run db:seed` | Run all seeders |
| `npm run db:seed:undo` | Undo all seeders |
| `npm run postman:generate` | Regenerate local Postman collection |

Legacy data migration scripts (for migrating from the previous monolith):

- `auth-service`: `npm run db:migrate:legacy-auth`
- `product-service`: `npm run db:migrate:legacy-product`
- `loyalty-service`: `npm run db:migrate:legacy-loyalty`
- `admin-service`: `npm run db:migrate:legacy-cms`

## Environment Configuration

Common environment variables across services:

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP port for the service | Service-specific (8000–8004) |
| `NODE_ENV` | `development` / `test` / `production` | `development` |
| `DB_HOST` / `DB_HOSTNAME` | PostgreSQL host | `127.0.0.1` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` / `DB_DATABASE` | Database name | Service-specific (`*_db`) |
| `DB_USER` / `DB_USERNAME` | Database user | `postgres` |
| `DB_PASS` / `DB_PASSWORD` | Database password | `postgres` |
| `DB_DIALECT` | Sequelize dialect | `postgres` |
| `DB_LOGGING` | Enable SQL logging (`true`/`false`) | `false` |
| `CLIENT_ORIGIN` | Allowed CORS origin | — |
| `JWT_EXPIRES_IN` | Access token lifetime | — |
| `MAIL_HOST` / `MAIL_USER` / `MAIL_PASS` | SMTP settings for email | — |
| `UPLOAD_PATH` | Static uploads directory | `uploads` |

### Gateway-specific variables

| Variable | Description | Default |
| --- | --- | --- |
| `AUTH_SERVICE_URL` | Auth service URL | `http://127.0.0.1:8001` |
| `PRODUCT_SERVICE_URL` | Product service URL | `http://127.0.0.1:8002` |
| `LOYALTY_SERVICE_URL` | Loyalty service URL | `http://127.0.0.1:8003` |
| `ADMIN_SERVICE_URL` | Admin service URL | `http://127.0.0.1:8004` |
| `JWT_PUBLIC_KEY` / `JWT_PRIVATE_KEY` / `SECRET_KEY` | JWT verification/signing key | — |
| `JWT_ALGORITHM` | JWT algorithm (`HS256`/`RS256`/`ES256`) | `HS256` (or `RS256` if public key set) |
| `DOWNSTREAM_TIMEOUT_MS` | Downstream request timeout | `5000` |
| `DOWNSTREAM_READ_RETRIES` | Retries for idempotent reads | `1` |
| `DOWNSTREAM_CIRCUIT_FAILURES` | Failures before circuit opens | `3` |
| `DOWNSTREAM_CIRCUIT_OPEN_MS` | Circuit-open duration | `30000` |

> In production the gateway requires `JWT_ALGORITHM=RS256` or `ES256`.

## API Gateway

The gateway exposes the public `/api/v1` routes and proxies them to the right service:

| Gateway route | Target service |
| --- | --- |
| `/api/v1/register`, `/api/v1/login`, `/api/v1/logout`, `/api/v1/forgot-password`, `/api/v1/reset-password`, `/api/v1/user`, `/api/v1/access`, `/api/v1/module`, `/api/v1/role-modules`, `/api/v1/user-permissions` | `auth-service` |
| `/api/v1/products`, `/api/v1/category` | `product-service` |
| `/api/v1/purchases`, `/api/v1/rewards`, `/api/v1/redemptions`, `/api/v1/dashboard` | `loyalty-service` |
| `/api/v1/cms`, `/api/v1/editor` | `admin-service` |

Public (unauthenticated) paths: `/api/v1/register`, `/api/v1/login`, `/api/v1/forgot-password`, and `/api/v1/reset-password/*`.

The gateway also provides health endpoints:

```text
GET /health   -> { status: "ok", ... }
GET /ready    -> { status: "ready", ... }
```

### Gateway behavior

- **JWT verification** — protected routes require a `Bearer` token; the gateway validates it and forwards trusted headers (`X-User-Id`, `X-User-Role`, `X-User-Permissions`) to downstream services.
- **Request ID** — injects/forwards `X-Request-Id` for correlation.
- **Rate limiting** — 120 requests/minute per IP by default.
- **Circuit breaker** — opens after repeated downstream failures and returns `503`.
- **Timeouts** — returns `504` on timeout, `502` on other downstream failures.
- **Security** — Helmet, CORS, and JSON body limits.

## Databases

Each service must connect **only** to its own database:

- `auth-service` → `auth_db`
- `product-service` → `product_db`
- `loyalty-service` → `loyalty_db`
- `admin-service` → `admin_db`

Rules:

- No cross-service direct database access.
- No cross-database foreign key joins.
- Use UUIDs for public IDs and cross-service references (e.g., `user_uuid`, `product_uuid`).
- Loyalty stores purchase snapshots (product name, SKU, price, points) so product changes don't alter purchase history.

## Testing & Linting

Run from the repository root:

```bash
npm run lint    # Lint all workspaces
npm test        # Run tests for all workspaces
```

Or run service-specific commands inside each service folder:

```bash
cd apps/loyalty-service
npm test
npm run lint
```

## Docker

A `docker-compose.yml` is provided under `infra/docker/`:

```bash
cd infra/docker
docker-compose up
```

This mounts the repository into Node 20 Alpine containers and runs each service. Ports `3000`–`3003` are mapped in the default compose file. Adjust the compose file to match your service ports and add a PostgreSQL service as needed.

## Kubernetes

The `infra/k8s/` folder is reserved for future Kubernetes manifests and deployment templates (one deployment per service, shared ingress, and service discovery). See `infra/k8s/README.md`.

## Documentation

- `docs/microservices-migration-guide.md` — architecture plan and migration strategy.
- `docs/loyalty-program.md` — loyalty program domain details.
- `docs/testing-and-operations.md` — testing and operating the services.

## Postman Collection

Import `postman_collection.json` from the repository root for example API requests. The collection uses the public API Gateway endpoints only — set `base_url` to the gateway host/port (default `http://localhost:8000`), not individual service URLs.

## Notes

- The root repo is a workspace container and monorepo entry point.
- The gateway is the public façade; keep client-facing `/api/v1` routes stable.
- During migration, run service-specific commands inside each service folder for backwards compatibility.
