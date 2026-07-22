import db from '../models/index.js';
import { BaseService } from './base.service.js';
import { buildPaginationMeta, getPaginationParams } from './pagination.service.js';
import logger from '../utils/logger.js';

const { Purchase, IdempotencyKey, sequelize } = db;

const formatCurrency = (amount) => Number(amount).toFixed(2);
const productServiceTimeoutMs = () => Number(process.env.PRODUCT_SERVICE_TIMEOUT_MS || 3000);
const productReadRetries = () => Number(process.env.PRODUCT_SERVICE_READ_RETRIES || 1);
const circuitFailureThreshold = () => Number(process.env.PRODUCT_SERVICE_CIRCUIT_FAILURES || 3);
const circuitOpenMs = () => Number(process.env.PRODUCT_SERVICE_CIRCUIT_OPEN_MS || 30000);
const productCircuit = { failures: 0, openedUntil: 0 };

const logProductClient = (entry) => logger.info({
  callerService: 'loyalty-service',
  targetService: 'product-service',
  ...entry,
}, 'REST client request');

const isProductCircuitOpen = () => Date.now() < productCircuit.openedUntil;
const recordProductCircuitResult = (ok) => {
  if (ok) {
    productCircuit.failures = 0;
    productCircuit.openedUntil = 0;
    return;
  }
  productCircuit.failures += 1;
  if (productCircuit.failures >= circuitFailureThreshold()) productCircuit.openedUntil = Date.now() + circuitOpenMs();
};

const fetchPurchaseDetails = async (productUuid, requestId) => {
  if (isProductCircuitOpen()) {
    logProductClient({ requestId, method: 'GET', status: 503, latencyMs: 0, error: 'CircuitOpen' });
    BaseService.throwError(503, 'purchase.product_service_unavailable');
  }

  const startedAt = Date.now();
  const url = `${process.env.PRODUCT_SERVICE_URL || 'http://127.0.0.1:8002'}/internal/products/${productUuid}/purchase-details`;
  const maxAttempts = productReadRetries() + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), productServiceTimeoutMs());
    try {
      const response = await fetch(url, {
        headers: { 'X-Request-Id': requestId || '', 'X-Internal-Service-Key': process.env.INTERNAL_SERVICE_KEY || '' },
        signal: controller.signal,
      });
      if (response.status < 500 || attempt === maxAttempts) {
        recordProductCircuitResult(response.status < 500);
        logProductClient({ requestId, method: 'GET', status: response.status, latencyMs: Date.now() - startedAt, attempt });
        return response;
      }
    } catch (error) {
      if (attempt === maxAttempts) {
        recordProductCircuitResult(false);
        logProductClient({ requestId, method: 'GET', status: error.name === 'AbortError' ? 504 : 502, latencyMs: Date.now() - startedAt, attempt, error: error.name });
        BaseService.throwError(503, 'purchase.product_service_unavailable');
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  recordProductCircuitResult(false);
  BaseService.throwError(503, 'purchase.product_service_unavailable');
};

export const purchaseService = {
  async createPurchase(userUuid, payload, requestId, idempotencyKey) {
    if (!idempotencyKey) BaseService.throwError(400, 'purchase.idempotency_key_required');
    const previous = await IdempotencyKey.findOne({ where: { userUuid, key: idempotencyKey } });
    if (previous) return this.getPurchase(userUuid, previous.purchaseUuid);

    const response = await fetchPurchaseDetails(payload.product_uuid, requestId);
    if (!response?.ok) BaseService.throwError(response?.status === 404 ? 404 : 503, response?.status === 404 ? 'purchase.product_not_available' : 'purchase.product_service_unavailable');
    let responseBody;
    try {
      responseBody = await response.json();
    } catch (_) {
      BaseService.throwError(503, 'purchase.product_service_unavailable');
    }
    const product = responseBody.data?.product;
    if (!product) BaseService.throwError(503, 'purchase.product_service_unavailable');
    if (product.status !== 'active') BaseService.throwError(404, 'purchase.product_not_available');

    try {
      return await sequelize.transaction(async (transaction) => {
      const quantity = Number(payload.quantity);
      const unitPrice = formatCurrency(product.price);
      const totalAmount = formatCurrency(Number(product.price) * quantity);
      const pointsEarned = Number(product.loyalty_points) * quantity;

      const purchase = await Purchase.create({
        userUuid,
        productUuid: product.uuid,
        productName: product.name,
        productSku: product.sku,
        quantity,
        unitPrice,
        totalAmount,
        pointsEarned,
        purchaseDate: new Date(),
        status: 'completed',
      }, { transaction });
      await IdempotencyKey.create({ userUuid, key: idempotencyKey, purchaseUuid: purchase.uuid }, { transaction });
      return purchase;
      });
    } catch (error) {
      if (error.name !== 'SequelizeUniqueConstraintError') throw error;
      const duplicate = await IdempotencyKey.findOne({ where: { userUuid, key: idempotencyKey } });
      if (duplicate) return this.getPurchase(userUuid, duplicate.purchaseUuid);
      throw error;
    }
  },

  async listPurchases(userUuid, query) {
    const { page, limit, offset, sortedField, sortedBy } = getPaginationParams(query, { sortedField: 'purchaseDate' });
    const { count, rows } = await Purchase.findAndCountAll({
      where: { userUuid },
      limit,
      offset,
      order: [[sortedField, sortedBy]],
      distinct: true,
    });

    return { purchases: rows, pagination: buildPaginationMeta(count, page, limit) };
  },

  async getPurchase(userUuid, uuid) {
    const purchase = await Purchase.findOne({
      where: { uuid, userUuid },
    });
    if (!purchase) BaseService.throwError(404, 'error.not_found');
    return purchase;
  },
};
