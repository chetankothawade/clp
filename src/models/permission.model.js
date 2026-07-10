import { DataTypes } from "sequelize";

export default (sequelize) => {
  const Permission = sequelize.define(
    "Permission",
    {
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
    },
    {
      tableName: "permissions",
      timestamps: true,
      underscored: true,
    }
  );

  Permission.associate = (models) => {
    Permission.hasMany(models.ModulePermission, { foreignKey: { name: "permissionId", field: "permission_id" }, as: "modulePermissions" });
  };

  return Permission;
};
