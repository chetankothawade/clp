import { moduleRepository } from "../repositories/module.repository.js";
import { BaseService } from "./base.service.js";
import { getPaginationParams, buildPaginationMeta } from "./pagination.service.js";

const DEFAULT_PERMISSION_ACTIONS = ["create", "read", "update", "delete", "approve"];

const toYN = (value, fallback = "N") => {
  if (value === "Y" || value === "N") return value;
  if (typeof value === "string") {
    const normalized = value.toUpperCase();
    if (normalized === "Y" || normalized === "N") return normalized;
  }
  return fallback;
};

const readField = (payload, camelKey, snakeKey, fallback = undefined) => {
  if (payload?.[camelKey] !== undefined) return payload[camelKey];
  if (payload?.[snakeKey] !== undefined) return payload[snakeKey];
  return fallback;
};

const toParentId = (isSubModule, parentId) => {
  if (isSubModule === "Y") return Number(parentId || 0);
  return 0;
};

export const moduleService = {
  async listModule({ params, query }) {
    const moduleId = Number(params.id || 0);
    const { page, limit, offset, sortedField, sortedBy } = getPaginationParams(query);
    const search = query.search || "";

    const whereClause = {
      parentId: moduleId > 0 ? moduleId : 0,
      ...(search
        ? {
          OR: [
            { name: { contains: search } },
            { url: { contains: search } },
            { icon: { contains: search } },
          ],
        }
        : {}),
    };

    const [count, rows] = await Promise.all([
      moduleRepository.count(whereClause),
      moduleRepository.findMany({
        where: whereClause,
        take: limit,
        skip: offset,
        orderBy: { [sortedField]: sortedBy.toLowerCase() },
      }),
    ]);

    return {
      module: rows || [],
      pagination: buildPaginationMeta(count || 0, page, limit),
    };
  },

  async createModule(payload) {
    const name = payload.name;
    const url = payload.url;
    const icon = payload.icon;
    const seqNo = Number(readField(payload, "seqNo", "seq_no"));
    const parentId = readField(payload, "parentId", "parent_id");
    const isPermission = toYN(readField(payload, "isPermission", "is_permission"), "N");
    const isSubModule = toYN(readField(payload, "isSubModule", "is_sub_module"), "N");

    return moduleRepository.transaction(async (tx) => {
      const newModule = await moduleRepository.create({
        name,
        url,
        icon,
        seqNo,
        isPermission,
        isSubModule,
        parentId: toParentId(isSubModule, parentId),
      }, tx);

      if (isPermission === "Y") {
        const permissions = await moduleRepository.findPermissions({
          action: { in: DEFAULT_PERMISSION_ACTIONS },
        }, tx);

        if (permissions.length > 0) {
          await moduleRepository.createModulePermissions(
            permissions.map((permission) => ({
              moduleId: newModule.id,
              permissionId: permission.id,
            })),
            tx
          );
        }
      }

      await moduleRepository.createRoleModule({
        moduleId: newModule.id,
        role: "super_admin",
      }, tx);

      return newModule;
    });
  },

  async updateModule(uuid, payload) {
    const module = await moduleRepository.findByUuid(uuid);
    if (!module) {
      BaseService.throwError(404, "error.not_found");
    }

    const name = payload.name;
    const url = payload.url;
    const icon = payload.icon;
    const seqNo = Number(readField(payload, "seqNo", "seq_no"));
    const parentId = readField(payload, "parentId", "parent_id");
    const isPermission = toYN(readField(payload, "isPermission", "is_permission"), "N");
    const isSubModule = toYN(readField(payload, "isSubModule", "is_sub_module"), "N");

    return moduleRepository.transaction(async (tx) => {
      const updatedModule = await moduleRepository.updateById(module.id, {
        name,
        url,
        icon,
        seqNo,
        isPermission,
        isSubModule,
        parentId: toParentId(isSubModule, parentId),
      }, tx);

      const existingMappings = await moduleRepository.findModulePermissions({
        where: { moduleId: module.id },
      }, tx);

      if (isPermission === "Y" && existingMappings.length === 0) {
        const permissions = await moduleRepository.findPermissions({
          action: { in: DEFAULT_PERMISSION_ACTIONS },
        }, tx);

        if (permissions.length > 0) {
          await moduleRepository.createModulePermissions(
            permissions.map((permission) => ({
              moduleId: module.id,
              permissionId: permission.id,
            })),
            tx
          );
        }
      }

      if (isPermission !== "Y" && existingMappings.length > 0) {
        await moduleRepository.deleteModulePermissions({ moduleId: module.id }, tx);
      }

      return updatedModule;
    });
  },

  async deleteModule(uuid) {
    const module = await moduleRepository.findByUuid(uuid);
    if (!module) {
      BaseService.throwError(404, "error.not_found");
    }

    await moduleRepository.transaction(async (tx) => {
      await moduleRepository.deleteModulePermissions({ moduleId: module.id }, tx);
      await moduleRepository.deleteRoleModules({ moduleId: module.id }, tx);
      await moduleRepository.deleteById(module.id, tx);
    });
  },

  async getModule(uuid) {
    const module = await moduleRepository.findByUuid(uuid, [
      { association: "parent", attributes: ["id", "name"] },
    ]);

    if (!module) {
      BaseService.throwError(404, "error.not_found");
    }

    return module;
  },

  async moduleStatus(uuid, status) {
    const module = await moduleRepository.findByUuid(uuid);
    if (!module) {
      BaseService.throwError(404, "error.not_found");
    }

    return moduleRepository.updateById(module.id, { status });
  },

  getModuleList() {
    return moduleRepository.findMany({
      where: { parentId: 0, isSubModule: "N", status: "active" },
      orderBy: [{ seqNo: "asc" }, { id: "asc" }],
    });
  },
};
