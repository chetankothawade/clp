# Lint Error Fix Plan

## Context
`npm run lint` fails due to ESLint errors in `loyalty-service` and `product-service`.
`admin-service` and `auth-service` already pass (exit 0).
`api-gateway` and `packages/shared` have no `lint` script defined.

## Errors to fix

### loyalty-service
- [ ] `scripts/migrate-legacy-loyalty-data.js` — unused vars: `label`, `user_id`, `product_id`
- [ ] `src/services/purchase.service.js` — `n/no-unsupported-features/node-builtins` for `fetch` (Node 16)
- [ ] `src/utils/generateToken.js` — unused params: `res`, `user`, `message`
- [ ] `tests/contract/loyalty-product.contract.test.js` — `n/no-unsupported-features/node-builtins` for `fetch`, `Response`

### product-service
- [ ] `src/utils/generateToken.js` — unused params: `res`, `user`, `message`

## Verification
- [ ] Run `npm run lint` and confirm it passes (exit 0) for all workspaces
