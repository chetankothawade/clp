import { DataTypes } from "sequelize";

export default (sequelize) => {
  const RoleModule = sequelize.define(
    "RoleModule",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      role: {
        type: DataTypes.ENUM("super_admin", "admin", "user"),
        allowNull: false,
      },
      moduleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "module_id",
      },
    },
    {
      tableName: "role_modules",
      timestamps: true,
      underscored: true,
      indexes: [
        { unique: true, fields: ["role", "module_id"], name: "role_module_unique" },
        { fields: ["module_id"], name: "role_modules_module_id_foreign" },
        { fields: ["role"], name: "role_modules_role_index" },
      ],
    }
  );

  RoleModule.associate = (models) => {
    RoleModule.belongsTo(models.Module, { foreignKey: { name: "moduleId", field: "module_id" }, as: "module" });
  };

  return RoleModule;
};
