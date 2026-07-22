import db from '../models/index.js';
import { BaseService } from './base.service.js';
import { buildPaginationMeta, getPaginationParams } from './pagination.service.js';

const { Purchase, sequelize } = db;

const formatCurrency = (amount) => Number(amount).toFixed(2);

export const purchaseService = {
  async createPurchase(userUuid, payload, requestId) {
    return sequelize.transaction(async (transaction) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), Number(process.env.PRODUCT_SERVICE_TIMEOUT_MS || 3000));
      let response;
      try {
        response = await fetch(`${process.env.PRODUCT_SERVICE_URL || 'http://127.0.0.1:8002'}/internal/products/${payload.product_uuid}/purchase-details`, { headers: { 'X-Request-Id': requestId || '', 'X-Internal-Service-Key': process.env.INTERNAL_SERVICE_KEY || '' }, signal: controller.signal });
      } catch (_) { BaseService.throwError(503, 'purchase.product_service_unavailable'); }
      finally { clearTimeout(timeout); }
      if (!response?.ok) BaseService.throwError(response?.status === 404 ? 404 : 503, response?.status === 404 ? 'purchase.product_not_available' : 'purchase.product_service_unavailable');
      const { product } = await response.json();

      const quantity = Number(payload.quantity);
      const unitPrice = formatCurrency(product.price);
      const totalAmount = formatCurrency(Number(product.price) * quantity);
      const pointsEarned = Number(product.loyalty_points) * quantity;

      return Purchase.create({
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
    });
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
