import { Op } from 'sequelize';
import db from '../models/index.js';
import { BaseService } from './base.service.js';
import { buildPaginationMeta, getPaginationParams } from './pagination.service.js';

const { Category, Product } = db;

const categoryInclude = [{ model: Category, as: 'category', attributes: ['id', 'uuid', 'name', 'status'] }];

const ensureCategoryExists = async (categoryId) => {
  const category = await Category.findByPk(categoryId);
  if (!category) BaseService.throwError(422, 'validation.category_not_found');
};

const ensureSkuIsAvailable = async (sku, productId = null) => {
  const where = { sku };
  if (productId) where.id = { [Op.ne]: productId };

  const product = await Product.findOne({ where });
  if (product) BaseService.throwError(409, 'validation.sku_already_exists');
};

export const productService = {
  async listProducts(query) {
    const { page, limit, offset, sortedField, sortedBy } = getPaginationParams(query);
    const search = query.search?.trim();
    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(search ? { [Op.or]: [{ name: { [Op.iLike]: `%${search}%` } }, { sku: { [Op.iLike]: `%${search}%` } }] } : {}),
    };

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: categoryInclude,
      limit,
      offset,
      order: [[sortedField, sortedBy]],
      distinct: true,
    });

    return { products: rows, pagination: buildPaginationMeta(count, page, limit) };
  },

  async createProduct(payload) {
    await ensureCategoryExists(payload.category_id);
    await ensureSkuIsAvailable(payload.sku);
    return Product.create(payload);
  },

  async getProduct(uuid) {
    const product = await Product.findOne({ where: { uuid }, include: categoryInclude });
    if (!product) BaseService.throwError(404, 'error.not_found');
    return product;
  },

  async updateProduct(uuid, payload) {
    const product = await Product.findOne({ where: { uuid } });
    if (!product) BaseService.throwError(404, 'error.not_found');

    await ensureCategoryExists(payload.category_id);
    await ensureSkuIsAvailable(payload.sku, product.id);
    await product.update(payload);
    return product.reload({ include: categoryInclude });
  },

  async updateProductStatus(uuid, status) {
    const product = await Product.findOne({ where: { uuid } });
    if (!product) BaseService.throwError(404, 'error.not_found');

    product.status = status;
    await product.save();
    return product;
  },
};
