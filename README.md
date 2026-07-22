# Customer Loyalty Program

This repository contains a microservices-based Customer Loyalty Program backend, including:
- `api_gateway` — public API gateway, routing, shared middleware, and auth verification
- `auth_service` — authentication, users, roles, permissions, and JWT issuance
- `product_service` — products, categories, and purchasable product details
- `loyalty_service` — purchases, rewards, redemptions, dashboards, and loyalty accounting
- `admin_service` — CMS/editor/admin features and administrative content management

> This repo is organized as a service workspace. Each service is independently deployable and has its own `package.json`, environment config, database, and migration scripts.

## Overview

The architecture follows a gateway-first microservices migration path:
- `api_gateway` is the only public entry point for clients
- downstream services own their business logic and databases
- each service runs its own migrations, seeders, and application lifecycle
- services communicate via REST only when needed
- JWT auth is issued by `auth_service` and verified by the gateway

## Services

### api_gateway
- Public entry point for all client requests
- Does not own domain data
- Handles JWT verification, CORS, rate limiting, request IDs, logging, and response conventions
- Routes:
  - `/api/v1/auth` → Auth Service
  - `/api/v1/products` → Product Service
  - `/api/v1/purchases` → Loyalty Service
  - `/api/v1/dashboard` → Loyalty Service
  - `/api/v1/cms`, `/api/v1/editor` → Admin Service

### auth_service
- Authentication and authorization
- User profile and account management
- Modules, permissions, role-module mapping, and user permission assignments
- JWT access and refresh token issuance
- Owns `auth_db`

### product_service
- Product catalog and category management
- Product purchase information for loyalty flows
- Owns `product_db`

### loyalty_service
- Purchase creation and history
- Rewards and redemptions
- Loyalty dashboard and point balance calculation
- Owns `loyalty_db`

### admin_service
- CMS/editor content management
- Administrative module support
- Upload handling
- Owns its own database and admin data

## Getting Started

There is no top-level Node.js app. Work inside each service folder.

Example workflow:

```bash
cd d:/Projects/clp/api_gateway
npm install
npm run dev
```

Repeat for each service that you need to run locally.

## Service Setup

Each service supports the following common lifecycle commands:

- `npm install`
- `npm run dev`
- `npm start`
- `npm test`
- `npm run lint`
- `npm run db:migrate`
- `npm run db:migrate:undo`
- `npm run db:seed`
- `npm run db:seed:undo`

Legacy migration scripts are available in the service folders, for example:
- `auth_service`: `npm run db:migrate:legacy-auth`
- `product_service`: `npm run db:migrate:legacy-product`
- `loyalty_service`: `npm run db:migrate:legacy-loyalty`
- `admin_service`: `npm run db:migrate:legacy-cms`

## Environment Configuration

Each service uses a `.env` file. Common environment variables include:

- `APP_NAME`
- `PORT`
- `NODE_ENV`
- `JWT_EXPIRES_IN`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASS`
- `DB_DIALECT`
- `CLIENT_ORIGIN`
- `MAIL_HOST`, `MAIL_USER`, `MAIL_PASS`

Adjust service-specific values in the service folder before starting.

## Databases

Each service should connect only to its own database:
- `auth_service` → `auth_db`
- `product_service` → `product_db`
- `loyalty_service` → `loyalty_db`
- `admin_service` → `admin_db`

Rules:
- No cross-service direct database access
- No cross-database foreign key joins
- Use UUIDs between services for public IDs
- Persist external references as values, e.g. `user_uuid`, `product_uuid`

## Microservice Migration Notes

This repository was refactored from a monolith into independent services. The migration goals are:

- keep `/api/v1` public routes stable during migration
- move auth, product, loyalty, and admin domains into separate services
- keep the gateway lean and stateless
- migrate data ownership incrementally with service-specific databases
- preserve purchase history by storing snapshots instead of live joins

### Key design principles

- Auth Service is the single JWT issuer
- Gateway verifies tokens and forwards `X-Request-Id` and `X-User-Id`
- Product Service owns product details and purchase pricing
- Loyalty Service owns loyalty transaction and redemption logic
- Admin Service owns CMS/editor content and administrative workflows

## Documentation

Useful documentation files:
- `docs/microservices-migration-guide.md`
- `docs/loyalty-program.md`
- `docs/testing-and-operations.md`

## Postman Collection

Import `postman_collection.json` from the repository root for example API requests and flows.

## Notes

- The root repo is a workspace container, not a single Node application.
- Run service-specific commands inside each service folder.
- Keep the gateway as the public façade to avoid client-breaking route changes.
