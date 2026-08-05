# Seeder Fixes - TODO

## Task
Fix `npm run db:seed` errors across services so seeding runs cleanly per service.

## Root Causes
- auth-service: `04-roles.seeder.js` missing `uuid` in role_modules inserts
- loyalty-service: seeders reference users/products tables that don't exist in loyalty DB
- admin-service: no seeders present

## Steps
- [x] A. auth-service: add `uuid` to role_modules inserts in `04-roles.seeder.js`
- [x] B. loyalty-service: rewrite `07-purchases.seeder.js` for loyalty schema
- [x] B. loyalty-service: verify `08-rewards.seeder.js` matches schema
- [x] B. loyalty-service: rewrite `09-redemptions.seeder.js` for loyalty schema
- [x] C. admin-service: add `01-cms.seeder.js` for cms table
- [x] Run `npm run db:seed` and verify all services seed successfully
