import db from '../../../src/models/index.js';
import { BaseService } from '../../../src/services/base.service.js';
import { buildPaginationMeta, getPaginationParams } from '../../../src/services/pagination.service.js';

const { Product, Purchase, User, sequelize } = db;

const productInclude = [{
  model: Product,
  as: 'product',
  attributes: ['id', 'uuid', 'name', 'sku', 'price', 'loyalty_points'],
}];

const formatCurrency = (amount) => Number(amount).toFixed(2);

export const purchaseService = {
  async createPurchase(userId, payload) {
    return sequelize.transaction(async (transaction) => {
      const user = await User.findByPk(userId, { transaction });
      if (!user) BaseService.throwError(404, 'error.not_found');

      const product = await Product.findOne({
        where: { uuid: payload.product_uuid, status: 'active' },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!product) BaseService.throwError(404, 'purchase.product_not_available');

      const quantity = Number(payload.quantity);
      const unitPrice = formatCurrency(product.price);
      const totalAmount = formatCurrency(Number(product.price) * quantity);
      const pointsEarned = Number(product.loyalty_points) * quantity;

      return Purchase.create({
        userId,
        productId: product.id,
        quantity,
        unitPrice,
        totalAmount,
        pointsEarned,
        purchaseDate: new Date(),
        status: 'completed',
      }, { transaction });
    });
  },

  async listPurchases(userId, query) {
    const { page, limit, offset, sortedField, sortedBy } = getPaginationParams(query, { sortedField: 'purchaseDate' });
    const { count, rows } = await Purchase.findAndCountAll({
      where: { userId },
      include: productInclude,
      limit,
      offset,
      order: [[sortedField, sortedBy]],
      distinct: true,
    });

    return { purchases: rows, pagination: buildPaginationMeta(count, page, limit) };
  },

  async getPurchase(userId, uuid) {
    const purchase = await Purchase.findOne({ where: { uuid, userId }, include: productInclude });
    if (!purchase) BaseService.throwError(404, 'error.not_found');
    return purchase;
  },
};
