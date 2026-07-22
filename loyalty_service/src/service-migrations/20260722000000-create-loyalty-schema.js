'use strict';
const timestamps = (S) => ({ created_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') }, updated_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') } });
const id = (S) => ({ id: { type: S.INTEGER, autoIncrement: true, primaryKey: true }, uuid: { type: S.UUID, allowNull: false, unique: true, defaultValue: S.UUIDV4 } });
export default {
  async up(q, S) {
    await q.createTable('rewards', { ...id(S), name: { type: S.STRING, allowNull: false }, description: S.TEXT, reward_type: { type: S.STRING, allowNull: false }, points_required: { type: S.INTEGER, allowNull: false }, stock: { type: S.INTEGER, allowNull: false, defaultValue: 0 }, expiry_date: S.DATE, status: { type: S.ENUM('active', 'inactive'), allowNull: false, defaultValue: 'active' }, ...timestamps(S) });
    await q.createTable('purchases', { ...id(S), user_uuid: { type: S.UUID, allowNull: false }, product_uuid: { type: S.UUID, allowNull: false }, product_name: { type: S.STRING, allowNull: false }, product_sku: { type: S.STRING, allowNull: false }, quantity: { type: S.INTEGER, allowNull: false }, unit_price: { type: S.DECIMAL(10, 2), allowNull: false }, total_amount: { type: S.DECIMAL(10, 2), allowNull: false }, points_earned: { type: S.INTEGER, allowNull: false, defaultValue: 0 }, purchase_date: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') }, status: { type: S.ENUM('pending', 'completed', 'cancelled'), allowNull: false, defaultValue: 'completed' }, ...timestamps(S) });
    await q.createTable('redemptions', { ...id(S), user_uuid: { type: S.UUID, allowNull: false }, reward_id: { type: S.INTEGER, allowNull: false, references: { model: 'rewards', key: 'id' } }, points_used: { type: S.INTEGER, allowNull: false }, redeemed_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') }, status: { type: S.ENUM('pending', 'completed', 'cancelled'), allowNull: false, defaultValue: 'completed' }, ...timestamps(S) });
  },
  async down(q) { await q.dropTable('redemptions'); await q.dropTable('purchases'); await q.dropTable('rewards'); },
};
