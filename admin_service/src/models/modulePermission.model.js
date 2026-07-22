import { DataTypes } from "sequelize";

export default (sequelize) => {
  const ModulePermission = sequelize.define(
    "ModulePermission",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
      },
      moduleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "module_id",
      },
      permissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "permission_id",
      },
    },
    {
      tableName: "module_permissions",
      timestamps: true,
      underscored: true,
    }
  );

  ModulePermission.associate = (models) => {
    ModulePermission.belongsTo(models.Module, { foreignKey: { name: "moduleId", field: "module_id" }, as: "module" });
    ModulePermission.belongsTo(models.Permission, { foreignKey: { name: "permissionId", field: "permission_id" }, as: "permission" });
    ModulePermission.hasMany(models.UserPermission, { foreignKey: { name: "modulePermissionId", field: "module_permission_id" }, as: "userPermissions" });
  };

  return ModulePermission;
};
