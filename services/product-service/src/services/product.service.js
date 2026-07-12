import { Op } from "sequelize";
import db from "../../../src/models/index.js";
import { BaseService } from "../../../src/services/base.service.js";
import { getPaginationParams, buildPaginationMeta } from "../../../src/services/pagination.service.js";

const { Product, Category } = db;

const ensureCategoryExists = async (categoryId) => {
  if (!categoryId) return null;
  const category = await Category.findOne({ where: { uuid: categoryId } });
  if (!category) BaseService.throwError(404, "error.not_found");
  return category;
};

const ensureSkuIsAvailable = async (sku, excludeUuid) => {
  const existing = await Product.findOne({ where: { sku, ...(excludeUuid ? { uuid: { [Op.ne]: excludeUuid } } : {}) } });
  if (existing) BaseService.throwError(409, "product.sku.exists");
};

export const productService = {
  async listProducts(query = {}) {
    const { page, limit, offset, sortedField, sortedBy } = getPaginationParams(query);
    const search = query.search || "";
    const where = search
      ? { [Op.or]: [{ name: { [Op.like]: `%${search}%` } }, { sku: { [Op.like]: `%${search}%` } }] }
      : {};

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortedField, sortedBy]],
      include: [{ model: Category, as: "category" }],
    });

    return {
      products: rows,
      pagination: buildPaginationMeta(count || 0, page, limit),
    };
  },

  async createProduct(payload) {
    const categoryId = payload.categoryId ?? payload.category_id;
    const { name, sku, price, description, status } = payload;
    if (!name || !sku || !price || !categoryId) BaseService.throwError(400, "validation.missing_fields");

    await ensureCategoryExists(categoryId);
    await ensureSkuIsAvailable(sku);

    return Product.create({
      name,
      sku,
      price,
      category_id: categoryId,
      description,
      status: status ?? "active",
    });
  },

  async getProduct(uuid) {
    const product = await Product.findOne({ where: { uuid }, include: [{ model: Category, as: "category" }] });
    if (!product) BaseService.throwError(404, "error.not_found");
    return product;
  },

  async updateProduct(uuid, payload) {
    const categoryId = payload.categoryId ?? payload.category_id;
    const { name, sku, price, description, status } = payload;
    const product = await Product.findOne({ where: { uuid } });
    if (!product) BaseService.throwError(404, "error.not_found");

    if (sku && sku !== product.sku) {
      await ensureSkuIsAvailable(sku, uuid);
    }

    if (categoryId) {
      await ensureCategoryExists(categoryId);
    }

    product.name = name ?? product.name;
    product.sku = sku ?? product.sku;
    product.price = price ?? product.price;
    product.category_id = categoryId ?? product.category_id;
    product.description = description ?? product.description;
    product.status = status ?? product.status;

    await product.save();
    return product;
  },

  async updateProductStatus(uuid, status) {
    if (status === undefined) BaseService.throwError(400, "validation.missing_fields");

    const product = await Product.findOne({ where: { uuid } });
    if (!product) BaseService.throwError(404, "error.not_found");

    product.status = status;
    await product.save();
    return product;
  },
};
