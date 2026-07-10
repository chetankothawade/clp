# Node Admin API

Express 5 API using Sequelize and PostgreSQL. The project follows the same layered architecture and middleware pattern as the Prisma reference project while keeping Sequelize as the ORM.

## Features

- JWT authentication with register, login, forgot/reset password, logout, and protected routes
- User management with UUID-based public operations
- RBAC modules, permissions, role-module mapping, and user-permission assignment
- CMS, editor uploads, categories
- Versioned API route groups under `/api/v1` and `/api/v2`
- Thin controller, service, and repository architecture
- PostgreSQL migrations using snake_case database columns
- Sequelize models using camelCase JavaScript attributes mapped to snake_case columns with `field`
- Centralized async handling, validation, error handling, and API responses
- HTTP access logging through Morgan
- Application, database, auth, i18n, and error logging through Pino
- Security and request middleware: Helmet, CORS, rate limiting, compression, request ID, cookie parser, and i18n

## Stack

- Node.js with ES modules
- Express 5
- Sequelize 6
- PostgreSQL via `pg` and `pg-hstore`
- JWT
- Zod validation
- Morgan for HTTP request logging
- Pino for application and error logging
- Multer and Cloudinary for uploads
- Socket.io for chat infrastructure
- ESLint with Node and security rules

## Project Structure

```text
app.js                  # Express app, middleware, health check, route mounting
index.js                # Legacy entry point compatibility
server.js               # Server bootstrap pattern
eslint.config.js        # ESLint flat config

src/
  bootstrap/            # App bootstrap helpers
  config/               # Sequelize/PostgreSQL config
  controllers/          # Thin HTTP handlers
  middlewares/          # Auth, RBAC, validation, logging, error handling, security
  migrations/           # PostgreSQL schema migrations
  models/               # Sequelize models and associations
  repositories/         # Database access layer
  routes/               # Route files plus versioned route groups
  seeders/              # Sequelize seed data
  services/             # Business logic
  utils/                # Shared logger, response, token, migration, upload helpers
  validations/          # Zod request validation rules
```

## API Base

- Base URL: `http://localhost:8000`
- Health check: `GET /health`
- v1 prefix: `/api/v1`
- v2 prefix: `/api/v2`

## Mounted v1 Routes

Defined in `src/routes/v1/index.js`:

- `/api/v1`
- `/api/v1/user`
- `/api/v1/access`
- `/api/v1/module`
- `/api/v1/cms`
- `/api/v1/editor`
- `/api/v1/category`
- `/api/v1/user-permissions`
- `/api/v1/role-modules`

`/api/v2` is mounted and currently exposes a readiness endpoint.

## Architecture Pattern

The app uses a layered pattern:

```text
route -> middleware -> controller -> service -> repository -> Sequelize model
```

- Controllers only map HTTP input/output.
- Services hold business logic and permission decisions.
- Repositories isolate database access.
- Models define Sequelize attributes, associations, and PostgreSQL column mapping.
- Middleware handles auth, RBAC, validation, request IDs, logging, and errors.

## Middleware

Core middleware is mounted in `app.js`:

- `requestId` adds `req.id` and response request IDs.
- `helmet` applies secure HTTP headers.
- `cors` centralizes cross-origin rules.
- `compression` enables response compression.
- `cookieParser` parses cookies.
- `logger` uses Morgan for HTTP request logs and writes them through Pino.
- `express.json` and `express.urlencoded` parse request bodies.
- `i18n` attaches localized API messages.
- `limiter` applies rate limiting.
- `errorHandler` centralizes error responses and Pino error logs.

Auth and route-level middleware:

- `isAuthenticated` verifies JWT access tokens.
- `authorizeRoles` supports role checks.
- `validateRequest` applies Zod schemas.
- `asyncHandler` wraps async controllers.

## Logging

Morgan and Pino are used together:

- HTTP request logging: `src/middlewares/logger.js`
- Application and error logging: `src/utils/logger.js`

Set log level with:

```env
LOG_LEVEL=info
```

Enable SQL logging with:

```env
DB_LOGGING=true
```

## Database

The project uses PostgreSQL with Sequelize.

Important files:

- `src/config/database.js`
- `src/config/config.cjs`
- `.sequelizerc`
- `src/migrations/`
- `src/models/`
- `src/seeders/`

Common environment variables:

```env
PORT=8000
NODE_ENV=development

DB_DIALECT=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=express_db
DB_USER=postgres
DB_PASS=
DB_LOGGING=false

JWT_SECRET=change_me
JWT_EXPIRES_IN=1d
```

## Database Naming Convention

- Database columns use snake_case.
- JavaScript model attributes remain camelCase where useful.
- Sequelize model attributes map to PostgreSQL columns with `field`.
- Migrations and seeders must use actual snake_case database column names.

Example:

```js
createdBy: {
  type: DataTypes.INTEGER,
  allowNull: false,
  field: "created_by",
}
```

## RBAC

RBAC mirrors the Prisma reference project concepts:

- Modules are stored in `modules`.
- Permissions are stored in `permissions`.
- Module-permission pairs are stored in `module_permissions`.
- Role-module access is stored in `role_modules`.
- User-specific permission access is stored in `user_permissions`.

Related files:

- `src/controllers/module.controller.js`
- `src/controllers/roleModule.controller.js`
- `src/controllers/userPermission.controller.js`
- `src/services/module.service.js`
- `src/services/roleModule.service.js`
- `src/services/userPermission.service.js`
- `src/repositories/module.repository.js`
- `src/repositories/roleModule.repository.js`
- `src/repositories/userPermission.repository.js`
- `src/routes/module.route.js`
- `src/routes/roleModule.route.js`
- `src/routes/userPermission.route.js`

## Setup

Install dependencies:

```bash
npm install
```

Configure `.env` with PostgreSQL, JWT, mail, upload, and Cloudinary settings as needed.

Run migrations:

```bash
npm run db:migrate
```

Run seeders:

```bash
npm run db:seed
```

Start development server:

```bash
npm run dev
```

Start production server:

```bash
npm start
```

## Scripts

- `npm run dev` starts the API with nodemon.
- `npm start` starts the API with Node.
- `npm run lint` runs ESLint.
- `npm run lint:fix` runs ESLint auto-fix.
- `npm run db:migrate` runs Sequelize migrations.
- `npm run db:migrate:undo` reverts the latest migration.
- `npm run db:seed` runs all seeders.
- `npm run db:seed:undo` reverts all seeders.
- `npm run postman:generate` generates a Postman collection from `app.js`.

## Verification

Useful checks after changes:

```bash
npm run lint
node -e "import('./app.js').then(() => console.log('app import ok'))"
node -e "import('./src/models/index.js').then(({ default: db }) => console.log(Object.keys(db).filter((key) => key !== 'sequelize' && key !== 'Sequelize').length + ' models loaded'))"
```

## Notes

- Keep Sequelize and PostgreSQL in the target project.
- Keep migrations and raw seed data aligned with PostgreSQL snake_case column names.
- Keep API route payloads and JavaScript code stable unless an endpoint explicitly needs a response contract change.
- Use Morgan only for HTTP request logging.
- Use Pino for application logs, SQL logs, auth/i18n warnings, and error logs.
