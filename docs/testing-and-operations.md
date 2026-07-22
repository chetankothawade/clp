# Testing and Operations

## Service ownership

| Service | Database | Public routes | Internal contract |
| --- | --- | --- | --- |
| Auth | `auth_db` | Auth, users, access, modules, permissions | JWT issuer |
| Product | `product_db` | Products, category | `GET /internal/products/:uuid/purchase-details` |
| Loyalty | `loyalty_db` | Purchases, rewards, redemptions, dashboard | Calls Product with `X-Request-Id` |
| Admin/CMS | `admin_db` | CMS, editor | None |
| Gateway | None | All `/api/v1` public routes | Routes and validates JWTs |

## Health checks

Every service exposes `GET /health` and `GET /ready`. Both return a request ID. Deployments should use `/health` for liveness and `/ready` for traffic admission.

## Required test coverage

- Keep copied monolith tests as historical coverage until replacement tests are passing.
- Auth integration tests must cover login, registration, password reset, and RBAC against `auth_db`.
- Product integration tests must cover categories, products, and its internal purchase-details contract against `product_db`.
- Loyalty integration tests must cover purchases, rewards, redemptions, UUID ownership, duplicate `Idempotency-Key`, and Product timeout/503 behavior against `loyalty_db`.
- Gateway E2E tests must cover route ownership, JWT rejection, request-ID propagation, and downstream 502/504 responses.

## Runtime configuration

Set one database variable per service: `AUTH_DB_NAME`, `PRODUCT_DB_NAME`, `LOYALTY_DB_NAME`, and `ADMIN_DB_NAME`. Gateway targets use `AUTH_SERVICE_URL`, `PRODUCT_SERVICE_URL`, `LOYALTY_SERVICE_URL`, and `ADMIN_SERVICE_URL`. All services share JWT verification settings and an `INTERNAL_SERVICE_KEY` for the Product internal endpoint.

## Gateway deployment policy

Expose only the gateway to web and mobile clients. Bind Auth, Product, Loyalty, and Admin/CMS to private networking or firewall rules that accept traffic only from the gateway and approved internal callers. Gateway proxy logs are structured JSON and include `requestId`, downstream service, HTTP status, and latency.

Production must set `JWT_ALGORITHM` to `RS256` or `ES256`, configure Auth with the private signing key, and configure the gateway and downstream services with only the corresponding public verification key. The gateway refuses to start with an HMAC algorithm in production.
