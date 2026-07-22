import { roleModuleRepository } from "../repositories/roleModule.repository.js";
import { moduleRepository } from "../repositories/module.repository.js";

export const roleModuleService = {
  async matrix() {
    const roles = await roleModuleRepository.getRoles();

    const modules = await moduleRepository.findMany({
      where: { status: "active" },
      orderBy: { seqNo: "asc" },
    });

    const roleModules = await roleModuleRepository.findAll();
    const roleModuleMap = {};

    roleModules.forEach((rm) => {
      if (!roleModuleMap[rm.moduleId]) {
        roleModuleMap[rm.moduleId] = [];
      }
      roleModuleMap[rm.moduleId].push(rm.role);
    });

    const matrix = modules.map((module) => {
      const permissions = {};

      roles.forEach((role) => {
        permissions[role] = roleModuleMap[module.id]?.includes(role) || false;
      });

      return {
        id: module.id,
        name: module.name,
        permissions,
      };
    });

    return {
      roles,
      modules: matrix,
    };
  },

  async toggle(payload) {
    const { role, enabled } = payload;
    const moduleId = Number(payload.moduleId ?? payload.module_id);
    const normalizedRole = String(role || "").trim().toLowerCase();

    if (enabled) {
      await roleModuleRepository.upsert({
        role: normalizedRole,
        moduleId,
      });

      return;
    }

    await roleModuleRepository.delete({
      role: normalizedRole,
      moduleId,
    });
  },
};
