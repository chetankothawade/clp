import db from "../models/index.js";

const { RoleModule } = db;

export const roleModuleRepository = {
  findAll() {
    return RoleModule.findAll({ raw: true });
  },

  getRoles() {
    return ["super_admin", "admin", "user"];
  },

  async upsert(data) {
    const moduleId = Number(data.moduleId ?? data.module_id);
    const role = data.role;

    const [roleModule] = await RoleModule.findOrCreate({
      where: { role, moduleId },
      defaults: { role, moduleId },
    });

    return roleModule;
  },

  delete(where) {
    const moduleId = Number(where?.moduleId ?? where?.module_id);
    return RoleModule.destroy({
      where: {
        role: where.role,
        ...(Number.isInteger(moduleId) && moduleId > 0 ? { moduleId } : {}),
      },
    });
  },
};
