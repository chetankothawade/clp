import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Purchase extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Purchase.belongsTo(models.User, { as: 'user', foreignKey: { name: 'userId', field: 'user_id' } });
      Purchase.belongsTo(models.Product, { as: 'product', foreignKey: { name: 'productId', field: 'product_id' } });
    }
  }
  Purchase.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, unique: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    productId: { type: DataTypes.INTEGER, allowNull: false, field: 'product_id' },
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
