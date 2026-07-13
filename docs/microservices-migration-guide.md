# Microservices Migration Guide

This document describes how to evolve the Customer Loyalty Program from its current Express and Sequelize monolith into independently deployable services. It is an architecture plan only; it does not change application code.

## Target Architecture

```text
Client
  |
  v
API Gateway
  |---- /api/v1/auth, /users, /access, /module, /role-modules, 
          /user-permissions ----------> Aut Service ------> auth_db
  |---- /api/v1/products, /category ------------> Product Service ---> product_db
  |---- /api/v1/purchases, /rewards,
  |     /redemptions, /dashboard ---------------> Loyalty Service ---> loyalty_db
  |
  `---- ---- /api/v1/cms, /editor,  -------> Admin/CMS Service  ---> admin_db (extract later as Admin/CMS)
                                                    
```

The API Gateway is the single public entry point. Each business service owns its code, database schema, migrations, seeders, and deployment lifecycle.

## Service Boundaries

| Service | Current routes and responsibilities | Database |
| --- | --- | --- |
| API Gateway | Public routing, JWT verification, CORS, rate limiting, request IDs, logging, response/error conventions | None |
| Auth Service | Authentication, user profile, users, access, modules, permissions, role-module mapping, user permissions | `auth_db` |
| Product Service | Products and categories | `product_db` |
| Loyalty Service | Purchases, rewards, redemptions, loyalty dashboard, point balance | `loyalty_db` |
| Admin/CMS Service (later) | CMS and editor uploads; optionally administration functions once independently required | Its own database |

Do not force CMS/editor into Auth, Product, or Loyalty. Keep these features in the monolith during the initial migration, behind the gateway, and extract them only when their independent deployment is useful.

## Independent PostgreSQL Databases

Create one PostgreSQL database for each service:

```text
auth_db
  users, modules, permissions, module_permissions,
  role_modules, user_permissions

product_db
  categories, products

loyalty_db
  purchases, rewards, redemptions
```

Rules for database ownership:

- A service may connect only to its own database.
- Every service owns and runs its own Sequelize migrations and seeders.
- Do not create cross-database foreign keys or direct SQL joins.
- Use UUIDs in public APIs and between services; do not use another service's integer database IDs.
- Store external references as values, such as `user_uuid` and `product_uuid`.
- Keep historical purchase snapshots in `loyalty_db`, including product name, SKU, unit price, and points earned. Product changes must not change purchase history.

## API Gateway

The gateway should be the only service exposed to web and mobile clients.

### Responsibilities

- Route requests to the correct downstream service.
- Apply shared CORS, Helmet, request ID, rate limit, logging, and error format.
- Verify access tokens on protected routes.
- Propagate a correlation ID using `X-Request-Id`.
- Forward trusted identity headers after successful JWT verification:

  ```text
  X-User-Id: <user-uuid>
  X-User-Role: <role>
  X-Request-Id: <request-id>
  ```

- Enforce downstream timeouts and return consistent `502` or `504` errors when a service is unavailable.

### Gateway constraints

- Do not put product, loyalty, or user business logic in the gateway.
- Do not let the gateway query any service database.
- Keep existing `/api/v1` paths during migration to avoid breaking clients.

Example path mapping:

```text
POST /api/v1/login                 -> Auth Service
GET  /api/v1/user/me               -> Auth Service
GET  /api/v1/products              -> Product Service
POST /api/v1/purchases             -> Loyalty Service
GET  /api/v1/dashboard             -> Loyalty Service
```

## JWT Authentication

Auth Service is the only service that issues access and refresh tokens.

Use a consistent access-token payload:

```json
{
  "sub": "user-uuid",
  "role": "user",
  "permissions": ["purchase:create"],
  "iss": "auth-service",
  "aud": "clp-api",
  "exp": 1234567890
}
```

Recommended security model:

- Sign JWTs with an asymmetric algorithm such as `RS256` or `ES256`.
- Only Auth Service stores the private signing key.
- Gateway and downstream services verify tokens using the public key or a JWKS endpoint.
- Use short-lived access tokens, for example 15 minutes.
- Keep refresh tokens in Auth Service only; store and revoke them there.
- Do not call Auth Service for every protected request. Validate tokens locally with the public key.
- Replace the current role-specific shared HMAC secrets with this single key rotation-capable approach before splitting services.

## REST Service-to-Service Communication

Use synchronous REST only when the caller needs an immediate result. All internal clients must set a timeout, propagate `X-Request-Id`, and use a consistent error contract.

### Purchase flow

1. The client sends `POST /api/v1/purchases` to the gateway.
2. The gateway validates the JWT and forwards the authenticated user identity to Loyalty Service.
3. Loyalty Service requests current purchasable product information from Product Service:

   ```text
   GET /internal/products/{productUuid}/purchase-details
   ```

4. Product Service returns product UUID, name, SKU, active status, price, and loyalty-point value.
5. Loyalty Service creates the purchase in a transaction inside `loyalty_db`. It saves a product snapshot with the purchase.

There is no distributed database transaction. If Product Service is not available, do not create the purchase.

### Redemption flow

Redemption belongs completely to Loyalty Service. Reward stock, redemption records, and available-points calculation remain in `loyalty_db`, where the service can safely use one local database transaction and row locking.

### Dashboard flow

Loyalty Service owns the current loyalty dashboard because it is calculated from purchases, rewards, and redemptions. If a dashboard requires profile data, request it through an Auth Service internal endpoint or maintain a minimal profile snapshot. Never query `auth_db` directly.

## Reliability Requirements

Apply these rules to every REST client:

- Use short timeouts, normally two to five seconds.
- Retry only idempotent read operations when appropriate.
- Add circuit breaking or temporary fail-fast behavior for repeatedly failing downstream services.
- Add an `Idempotency-Key` header for write operations, particularly purchase creation, to prevent duplicate loyalty transactions.
- Log request ID, caller service, target service, response status, and latency.
- Return a clear dependency error when a required service is unavailable; never report it as a validation failure.
- Maintain API contract tests for Gateway-to-service and Loyalty-to-Product interactions.

## Required Model Changes When Extracting

The monolith currently uses Sequelize associations and one transaction across users, products, purchases, rewards, and redemptions. That cannot continue once the data is split.

| Current dependency | Microservice replacement |
| --- | --- |
| `Purchase -> User` association | Store `user_uuid`; identity comes from JWT/gateway headers. |
| `Purchase -> Product` association | Store `product_uuid` plus product snapshot; fetch current purchasable data through Product Service. |
| Purchase transaction loads User and Product | Validate user from authenticated token and product through REST, then use a Loyalty-only transaction. |
| `Redemption -> User` association | Store `user_uuid`; calculate earned/used points in Loyalty Service. |
| Dashboard joins User/Product/Reward | Keep loyalty calculations local; use an internal Auth call or snapshot only for profile display. |

## Incremental Migration Plan

Use a gradual "strangler" migration. The gateway forwards unextracted routes to the monolith while newly extracted services take ownership of their routes.

### Phase 1: Prepare contracts and platform

1. Freeze and document public `/api/v1` request/response contracts.
2. Define common error responses, JWT claims, request-ID behavior, and service environment-variable conventions.
3. Introduce the API Gateway in front of the existing monolith without changing public routes.
4. Add gateway end-to-end tests alongside existing monolith integration tests.

### Phase 2: Extract Auth Service

1. Move users, login, registration, password reset, and RBAC data into `auth_db`.
2. Make Auth Service the only JWT issuer.
3. Have the gateway verify Auth Service tokens.
4. Continue forwarding non-auth routes to the monolith.

### Phase 3: Extract Product Service

1. Move categories and products into `product_db`.
2. Route `/products` and `/category` through the gateway to Product Service.
3. Publish the internal purchase-details endpoint.
4. Preserve product UUIDs while migrating data.

### Phase 4: Extract Loyalty Service

1. Move purchases, rewards, and redemptions into `loyalty_db`.
2. Replace direct Product and User Sequelize associations with UUID references and REST calls where needed.
3. Route purchases, rewards, redemptions, and dashboard endpoints to Loyalty Service.
4. Add idempotency, timeout, and downstream-failure tests.

### Phase 5: Complete extraction

1. Decide whether CMS/editor and administration need a separate Admin/CMS Service.
2. Migrate those routes only after their ownership and data model are clear.
3. Remove the corresponding monolith routes after traffic, contract, and data migration validation is complete.

## Testing and Operations

Each service should provide:

- Unit tests for services and domain rules.
- Integration tests against its own PostgreSQL database.
- Contract tests for internal REST APIs.
- Gateway end-to-end tests for public routes.
- `/health` and `/ready` endpoints.
- Structured logs that include `requestId`.
- Independent environment configuration, migrations, and deployment pipeline.

Do not remove current monolith tests while extracting. Convert them gradually: service-specific behavior becomes service integration tests, while public client behavior becomes gateway end-to-end tests.
