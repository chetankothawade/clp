import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Reward extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Reward.hasMany(models.Redemption, { as: 'redemptions', foreignKey: { name: 'rewardId', field: 'reward_id' } });
    }
  }
  Reward.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    rewardType: { type: DataTypes.STRING, allowNull: false, field: 'reward_type' },
    pointsRequired: { type: DataTypes.INTEGER, allowNull: false, field: 'points_required' },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    expiryDate: { type: DataTypes.DATE, allowNull: true, field: 'expiry_date' },
    status: { type: DataTypes.ENUM('active', 'inactive'), allowNull: false, defaultValue: 'active' }
  }, {
    sequelize,
    modelName: 'Reward',
    tableName: 'rewards',
    timestamps: true,
    underscored: true,
  });
  return Reward;
};
