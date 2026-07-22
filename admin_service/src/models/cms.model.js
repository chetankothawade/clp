import { DataTypes } from "sequelize";

export default (sequelize) => {
  const CMS = sequelize.define(
    "CMS",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        unique: true,
      },
      title: { type: DataTypes.STRING(50), allowNull: false, unique: true },
      content: { type: DataTypes.TEXT },
      status: { type: DataTypes.ENUM("active", "inactive"), defaultValue: "active" },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "created_at" },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, field: "updated_at" },
    },
    {
      tableName: "cms",
      timestamps: true,
      underscored: true,
    }
  );
  return CMS;
};
