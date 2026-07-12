import { Op } from "sequelize";
import db from "../../../src/models/index.js";
import { BaseService } from "../../../src/services/base.service.js";
import { getPaginationParams, buildPaginationMeta } from "../../../src/services/pagination.service.js";

const { Category } = db;

export const categoryService = {
  async listCategories({ params, query }) {
    const { page, limit, offset, sortedField, sortedBy } = getPaginationParams(query);
    const search = query.search || "";
    const parentId = params.id ?? null;

    const where = {
      parentId,
      ...(search && { name: { [Op.like]: `%${search}%` } }),
    };

    const { count, rows } = await Category.findAndCountAll({
      where,
      limit,
      offset,
      order: [[sortedField, sortedBy]],
      include: [
        { model: Category, as: "subcategories" },
        { model: Category, as: "parent" },
      ],
    });

    return {
      categories: rows,
      pagination: buildPaginationMeta(count || 0, page, limit),
    };
  },

  async createCategory(payload) {
    const parentId = payload.parentId ?? payload.parent_id;
    const { name } = payload;
    if (!name) BaseService.throwError(400, "validation.missing_fields");
    return Category.create({ name, parent_id: parentId || null });
  },

  async updateCategory(uuid, payload) {
    const parentId = payload.parentId ?? payload.parent_id;
    const { name } = payload;
    const category = await Category.findOne({ where: { uuid } });
    if (!category) BaseService.throwError(404, "error.not_found");

    category.name = name || category.name;
    category.parent_id = parentId ?? category.parent_id;
    await category.save();
    return category;
  },

  async deleteCategory(uuid) {
    const category = await Category.findOne({ where: { uuid } });
    if (!category) BaseService.throwError(404, "error.not_found");
    await category.destroy();
  },

  async getCategory(uuid) {
    const category = await Category.findOne({
      where: { uuid },
      include: [{ model: Category, as: "subcategories" }],
    });
    if (!category) BaseService.throwError(404, "error.not_found");
    return category;
  },

  async updateCategoryStatus(uuid, status) {
    if (status === undefined) BaseService.throwError(400, "validation.missing_fields");

    const category = await Category.findOne({ where: { uuid } });
    if (!category) BaseService.throwError(404, "error.not_found");
    category.status = status;
    await category.save();
    return category;
  },

  getCategoryList() {
    return Category.findAll({
      where: { [Op.or]: [{ parentId: 0 }, { parentId: null }] },
    });
  },
};
