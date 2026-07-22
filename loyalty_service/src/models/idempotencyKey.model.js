import { Model } from 'sequelize';
export default (sequelize, DataTypes) => {
  class IdempotencyKey extends Model {}
  IdempotencyKey.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userUuid: { type: DataTypes.UUID, allowNull: false, field: 'user_uuid' },
    key: { type: DataTypes.STRING(255), allowNull: false },
    purchaseUuid: { type: DataTypes.UUID, allowNull: false, field: 'purchase_uuid' },
  }, { sequelize, modelName: 'IdempotencyKey', tableName: 'idempotency_keys', timestamps: true, underscored: true });
  return IdempotencyKey;
};
