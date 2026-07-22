import { DataTypes } from "sequelize";

export default (sequelize) => {
  const UserPermission = sequelize.define(
    "UserPermission",
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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_id",
      },
      modulePermissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "module_permission_id",
      },
    },
    {
      tableName: "user_permissions",
      timestamps: true,
      underscored: true,
    }
  );

  UserPermission.associate = (models) => {
    UserPermission.belongsTo(models.User, { foreignKey: { name: "userId", field: "user_id" }, as: "user" });
    UserPermission.belongsTo(models.ModulePermission, { foreignKey: { name: "modulePermissionId", field: "module_permission_id" }, as: "modulePermission" });
  };

  return UserPermission;
};
