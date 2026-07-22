import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Purchase extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
  }
  Purchase.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, unique: true },
    userUuid: { type: DataTypes.UUID, allowNull: false, field: 'user_uuid' },
    productUuid: { type: DataTypes.UUID, allowNull: false, field: 'product_uuid' },
    productName: { type: DataTypes.STRING, allowNull: false, field: 'product_name' },
    productSku: { type: DataTypes.STRING, allowNull: false, field: 'product_sku' },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unitPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'unit_price' },
    totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false, field: 'total_amount' },
    pointsEarned: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'points_earned' },
    purchaseDate: { type: DataTypes.DATE, allowNull: false, field: 'purchase_date' },
    status: { type: DataTypes.ENUM('pending', 'completed', 'cancelled'), allowNull: false, defaultValue: 'completed' }
  }, {
    sequelize,
    modelName: 'Purchase',
    tableName: 'purchases',
    timestamps: true,
    underscored: true,
  });
  return Purchase;
};
