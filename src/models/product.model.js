"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Product.init(
    {
      id: DataTypes.INTEGER,
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
