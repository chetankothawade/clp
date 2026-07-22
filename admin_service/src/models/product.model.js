import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Product.belongsTo(models.Category, {
        as: "category",
        foreignKey: { name: "category_id", field: "category_id" },
      });
      Product.hasMany(models.Purchase, {
        as: "purchases",
        foreignKey: { name: "productId", field: "product_id" },
      });
    }
  }
  Product.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, unique: true },
      name: DataTypes.STRING,
      sku: DataTypes.STRING,
      price: DataTypes.DECIMAL(10, 2),
      description: DataTypes.TEXT,
      loyalty_points: DataTypes.INTEGER,
      category_id: DataTypes.INTEGER,
      status: DataTypes.ENUM("active", "inactive"),
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      timestamps: true,
      underscored: true,
    },
  );
  return Product;
};
