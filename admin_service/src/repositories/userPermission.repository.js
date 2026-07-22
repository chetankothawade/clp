import db from "../models/index.js";

const { User, RoleModule, Module, Permission, ModulePermission, UserPermission } = db;

export class UserPermissionRepository {
  findUser(where, attributes) {
    return User.findOne({ where, attributes: attributes ? Object.keys(attributes) : undefined });
  }

  findRoleModules(role) {
    return RoleModule.findAll({
      where: { role },
      attributes: ["moduleId"],
      raw: true,
    });
  }

  findModules(params = {}) {
    return Module.findAll(params);
  }

  findPermissions(params = {}) {
    return Permission.findAll(params);
  }

  findModulePermissionById(id) {
    return ModulePermission.findByPk(id, { attributes: ["id"] });
  }

  findModulePermissionByModuleAndPermission(moduleId, permissionId) {
    return ModulePermission.findOne({
      where: { moduleId, permissionId },
      attributes: ["id"],
    });
  }

  findModulePermissions(params = {}) {
    return ModulePermission.findAll(params);
  }

  findUserPermissions(params = {}) {
    return UserPermission.findAll(params);
  }

  async upsertUserPermission(userId, modulePermissionId) {
    const [userPermission] = await UserPermission.findOrCreate({
      where: { userId, modulePermissionId },
      defaults: { userId, modulePermissionId },
    });

    return userPermission;
  }

  deleteUserPermission(userId, modulePermissionId) {
    return UserPermission.destroy({
      where: { userId, modulePermissionId },
    });
  }
}

export const userPermissionRepository = new UserPermissionRepository();
