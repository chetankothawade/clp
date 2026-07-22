import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Module = sequelize.define(
    "Module",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
      },
      parentId: { type: DataTypes.INTEGER, defaultValue: 0, field: "parent_id" },
      name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      url: { type: DataTypes.STRING(100) },
      icon: { type: DataTypes.STRING(100) },
      seqNo: { type: DataTypes.INTEGER, field: "seq_no" },
      isSubModule: { type: DataTypes.ENUM("Y", "N"), defaultValue: "N", field: "is_sub_module" },
      status: { type: DataTypes.ENUM("active", "inactive"), defaultValue: "active" },
      isPermission: { type: DataTypes.ENUM("Y", "N"), defaultValue: "N", field: "is_permission" },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "created_at" },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "updated_at" },
    },
    {
      tableName: "modules",
      timestamps: true,
      underscored: true,
    }
  );

  Module.associate = (models) => {
    Module.hasMany(models.Module, { as: "children", foreignKey: { name: "parentId", field: "parent_id" } });
    Module.belongsTo(models.Module, { as: "parent", foreignKey: { name: "parentId", field: "parent_id" } });

    if (models.ModulePermission) {
      Module.hasMany(models.ModulePermission, { foreignKey: { name: "moduleId", field: "module_id" }, as: "modulePermissions" });
    }

    if (models.RoleModule) {
      Module.hasMany(models.RoleModule, { foreignKey: { name: "moduleId", field: "module_id" }, as: "roleModules" });
    }
  };

  return Module;
};
