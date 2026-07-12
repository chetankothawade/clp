# Customer Loyalty Program

Customer Loyalty Program is a Node.js backend API for managing users, rewards, purchases, redemptions, and administrative modules for a loyalty-driven business. The project is built with Express 5, Sequelize, PostgreSQL, and JWT-based authentication.

## What is included

- User authentication with register, login, forgot password, reset password, logout, and protected routes
- Role-based access control with modules, permissions, role-module mapping, and user-permission assignment
- Loyalty modules for products, purchases, rewards, and redemptions
- Dashboard and reporting endpoints
- CMS and category management
- Editor upload handling and static file serving
- Versioned API routing under `/api/v1` and `/api/v2`
- Centralized validation, error handling, logging, localization, and security middleware

## Tech stack

- Node.js with ES modules
- Express 5
- Sequelize 6
- PostgreSQL with `pg` and `pg-hstore`
- JWT authentication
- Zod validation
- Morgan for HTTP request logging
- Pino for application and error logging
- Multer and Cloudinary for uploads
- ESLint with Node and security rules
- Jest for unit and integration testing

## Project structure

```text
app.js                  # Express app, middleware, health check, route mounting
index.js                # Entry point for the monolithic application
server.js               # Server bootstrap pattern
eslint.config.js        # ESLint flat config

docker-compose.yml      # Local orchestration for PostgreSQL and service containers

src/                    # Main monolith application source
  bootstrap/            # App bootstrap helpers
  config/               # Sequelize and PostgreSQL configuration
  controllers/          # Thin HTTP handlers
  middlewares/          # Auth, RBAC, validation, logging, security, and error handling
  migrations/           # PostgreSQL schema migrations
  models/               # Sequelize models and associations
  repositories/         # Database access layer
  routes/               # Route files and versioned route groups
  seeders/              # Seed data
  services/             # Business logic
  utils/                # Logging, response, token, upload, and helper utilities
  validations/          # Zod request validation schemas

services/               # Service-based migration scaffold
  api-gateway/          # HTTP gateway for routing requests to downstream services
  auth-service/         # Auth and user-domain service package
  product-service/      # Product and category service package
  loyalty-service/     # Purchase, reward, redemption, and dashboard service package
```

## API base

- Monolith base URL: `http://localhost:8000`
- Gateway base URL: `http://localhost:3001`
- Health check: `GET /health`
- API v1 prefix: `/api/v1`
- API v2 prefix: `/api/v2`

## Mounted routes

The main versioned router is defined in `src/routes/v1/index.js` and currently exposes:

- `/api/v1/`
- `/api/v1/user`
- `/api/v1/access`
- `/api/v1/module`
- `/api/v1/products`
- `/api/v1/purchases`
- `/api/v1/rewards`
- `/api/v1/redemptions`
- `/api/v1/dashboard`
- `/api/v1/editor`
- `/api/v1/cms`
- `/api/v1/category`
- `/api/v1/user-permissions`
- `/api/v1/role-modules`

`/api/v2` currently provides a readiness response for versioned API checks.

## Architecture pattern

The application follows a layered structure for the monolith:

```text
route -> middleware -> controller -> service -> repository -> Sequelize model
```

- Controllers handle HTTP input and output.
- Services contain business logic and permission decisions.
- Repositories isolate database access.
- Models define Sequelize attributes, associations, and PostgreSQL column mapping.
- Middleware handles authentication, RBAC, validation, request IDs, logging, and errors.

## Middleware and utilities

Core middleware is applied in `app.js`:

- `requestId` adds a request ID to each request and response
- `helmet` adds secure HTTP headers
- `cors` centralizes cross-origin rules
- `compression` enables response compression
- `cookieParser` parses cookies
- `logger` records HTTP traffic using Morgan and Pino
- `express.json` and `express.urlencoded` parse request bodies
- `i18n` provides localized API messages
- `limiter` applies rate limiting
- `errorHandler` centralizes error responses and logging

## Environment configuration

Create a `.env` or `.env.local` file with the values required for your local setup.

```env
APP_NAME="Customer Loyalty Program"
PORT=8000
NODE_ENV=development
SECRET_KEY=user@100605
ADMIN_SECRET_KEY=admin@100605
JWT_EXPIRES_IN=7d
ADMIN_JWT_EXPIRES_IN=1d
DEBUG=true

DB_HOST=localhost
DB_PORT=5432
DB_NAME=loyalty
DB_USER=postgres
DB_PASS=postgres
DB_DIALECT=postgres

CLIENT_ORIGIN=http://localhost:3000
FRONTEND_USER_URL=http://localhost:3000
FRONTEND_ADMIN_URL=http://localhost:3000/admin

MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=your_mailtrap_user
MAIL_PASS=your_mailtrap_password
MAIL_FROM_EMAIL=no-reply@yopmail.com
MAIL_FROM_NAME="Customer Loyalty Program"
```

## Database

The project uses PostgreSQL with Sequelize and supports migrations and seed data.

Key files:

- `src/config/database.js`
- `src/config/config.cjs`
- `.sequelizerc`
- `src/migrations/`
- `src/models/`
- `src/seeders/`

Database naming convention:

- Database columns use `snake_case`
- JavaScript model attributes remain `camelCase`
- Sequelize model attributes map to database columns with `field`

Example:

```js
createdBy: {
  type: DataTypes.INTEGER,
  allowNull: false,
  field: "created_by",
}
```

## RBAC and permissions

The RBAC model follows the same structure as the reference implementation:

- Modules are stored in `modules`
- Permissions are stored in `permissions`
- Module-permission pairs are stored in `module_permissions`
- Role-module access is stored in `role_modules`
- User-specific permission access is stored in `user_permissions`

## Setup

Install dependencies from the project root:

```bash
npm install
```

Configure your environment file with database, JWT, mail, and upload values.

Run migrations:

```bash
npm run db:migrate
```

Run seeders:

```bash
npm run db:seed
```

Start the monolith development server:

```bash
npm run dev
```

Start the monolith production server:

```bash
npm start
```

Run the gateway and service containers locally:

```bash
docker compose up --build
```

## Available scripts

- `npm run dev` starts the monolith API with nodemon
- `npm start` starts the monolith API with Node.js
- `npm test` runs the Jest unit and integration test suites
- `npm run lint` runs ESLint
- `npm run lint:fix` fixes ESLint issues automatically
- `npm run db:migrate` runs Sequelize migrations
- `npm run db:migrate:undo` reverts the latest migration
- `npm run db:seed` runs all seeders
- `npm run db:seed:undo` reverts all seeders
- `npm run postman:generate` generates a Postman collection from the app entry point

## Testing

The project includes Jest-based tests for both controller/unit behavior and route integration.

- Unit tests live under `tests/unit`
- Integration tests live under `tests/integration`
- Run the full suite with `npm test`

Example:

```bash
npm test
```

## Verification

Useful checks after changes:

```bash
npm run lint
npm test
node -e "import('./app.js').then(() => console.log('app import ok'))"
```

## Notes

- Keep Sequelize and PostgreSQL as the core data layer.
- Keep migrations and seed data aligned with PostgreSQL snake_case columns.
- Use Morgan for HTTP request logging and Pino for application, auth, localization, and error logs.
- Uploaded files are served from the `uploads` folder through the application.
- The gateway under `services/api-gateway` currently proxies loyalty, auth, and product routes to the corresponding service packages.


