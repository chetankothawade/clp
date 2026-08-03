import { Op } from "sequelize";

import db from "../models/index.js";
import { BaseRepository } from "./base.repository.js";

const { sequelize, Module, Permission, ModulePermission, RoleModule } = db;

const normalizeOrder = (orderBy = {}) => {
  if (Array.isArray(orderBy)) {
    return orderBy.flatMap(normalizeOrder);
  }

  return Object.entries(orderBy).map(([field, direction]) => [field, String(direction).toUpperCase()]);
};

const normalizeWhere = (where = {}) => {
  const normalized = {};

  for (const [key, value] of Object.entries(where || {})) {
    if (key === "OR" && Array.isArray(value)) {
      normalized[Op.or] = value.map(normalizeWhere);
      continue;
    }

    if (value && typeof value === "object" && !Array.isArray(value)) {
      if (Object.prototype.hasOwnProperty.call(value, "contains")) {
        normalized[key] = { [Op.like]: `%${value.contains}%` };
        continue;
      }

      if (Object.prototype.hasOwnProperty.call(value, "in")) {
        normalized[key] = { [Op.in]: value.in };
        continue;
      }
    }

    normalized[key] = value;
  }

  return normalized;
};

class ModuleRepository extends BaseRepository {
  constructor() {
    super(Module);
  }

  transaction(fn) {
    return sequelize.transaction((transaction) => fn(transaction));
  }

  count(where) {
    return Module.count({ where: normalizeWhere(where) });
  }

  findMany(params = {}) {
    return Module.findAll({
      where: normalizeWhere(params.where),
      limit: params.take,
      offset: params.skip,
      order: normalizeOrder(params.orderBy),
      include: params.include,
    });
  }

  findByUuid(uuid, include) {
    return Module.findOne({
      where: { uuid },
      ...(include ? { include } : {}),
    });
  }

  create(data, transaction = null) {
    return Module.create(data, { transaction });
  }

  updateById(id, data, transaction = null) {
    return Module.findByPk(id, { transaction }).then(async (module) => {
      if (!module) return null;
      return module.update(data, { transaction });
    });
  }

  deleteById(id, transaction = null) {
    return Module.destroy({ where: { id }, transaction });
  }

  findPermissions(where, transaction = null) {
    return Permission.findAll({ where: normalizeWhere(where), transaction });
  }

  findModulePermissions(params = {}, transaction = null) {
    return ModulePermission.findAll({
      where: normalizeWhere(params.where),
      include: params.include,
      transaction,
    });
  }

  createModulePermissions(data, transaction = null) {
    return ModulePermission.bulkCreate(data, {
      transaction,
      ignoreDuplicates: true,
    });
  }

  deleteModulePermissions(where, transaction = null) {
    return ModulePermission.destroy({ where: normalizeWhere(where), transaction });
  }

  deleteRoleModules(where, transaction = null) {
    return RoleModule.destroy({ where: normalizeWhere(where), transaction });
  }

  async createRoleModule(data, transaction = null) {
    const moduleId = Number(data.moduleId ?? data.module_id);
    const role = data.role;

    const [roleModule] = await RoleModule.findOrCreate({
      where: { role, moduleId },
      defaults: { role, moduleId },
      transaction,
    });

    return roleModule;
  }
}

export const moduleRepository = new ModuleRepository();
