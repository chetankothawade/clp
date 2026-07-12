# Microservices Refactor Plan

## 1. Folder structure
- api-gateway/
- auth-service/
- product-service/
- loyalty-service/
- shared/

## 2. File movement plan
- Move auth, user, role, and permission controllers into auth-service.
- Move product and category controllers into product-service.
- Move purchase, reward, redemption, and dashboard controllers into loyalty-service.
- Keep existing business logic in the corresponding service layer and update imports.
- Keep existing response helper, middleware, validation, and logger patterns.

## 3. Database separation plan
- Auth DB: users, roles, permissions
- Product DB: products, categories
- Loyalty DB: purchases, rewards, redemptions
- Start with a shared database if needed, then split gradually.

## 4. Gateway routes
- /api/auth/* -> auth-service
- /api/products/* -> product-service
- /api/loyalty/* -> loyalty-service

## 5. Service-to-service communication
- Use REST calls via axios for cross-service lookups.
- Example: loyalty-service calls product-service for product price details before creating purchases.

## 6. Docker
- Each service has its own Dockerfile.
- docker-compose.yml starts the gateway, services, and PostgreSQL.

## 7. Migration checklist
- [x] Create gateway skeleton
- [x] Create auth-service skeleton
- [x] Create product-service skeleton
- [x] Create loyalty-service skeleton
- [x] Create Dockerfiles and docker-compose entries
- [ ] Move real controllers into each service
- [ ] Split Sequelize models per service
- [ ] Introduce service-to-service HTTP calls
- [ ] Replace shared DB access with service APIs
- [ ] Add env-specific config per service
