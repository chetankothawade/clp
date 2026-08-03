import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Redemption extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Redemption.belongsTo(models.User, { as: 'user', foreignKey: { name: 'userId', field: 'user_id' } });
      Redemption.belongsTo(models.Reward, { as: 'reward', foreignKey: { name: 'rewardId', field: 'reward_id' } });
    }
  }
  Redemption.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    uuid: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, allowNull: false, unique: true },
    userId: { type: DataTypes.INTEGER, allowNull: false, field: 'user_id' },
    rewardId: { type: DataTypes.INTEGER, allowNull: false, field: 'reward_id' },
    pointsUsed: { type: DataTypes.INTEGER, allowNull: false, field: 'points_used' },
    redeemedAt: { type: DataTypes.DATE, allowNull: false, field: 'redeemed_at' },
    status: { type: DataTypes.ENUM('pending', 'completed', 'cancelled'), allowNull: false, defaultValue: 'completed' }
  }, {
    sequelize,
    modelName: 'Redemption',
    tableName: 'redemptions',
    timestamps: true,
    underscored: true,
  });
  return Redemption;
};
