'use strict';
const timestamps = (S) => ({ created_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') }, updated_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') } });
const id = (S) => ({ id: { type: S.INTEGER, autoIncrement: true, primaryKey: true }, uuid: { type: S.UUID, allowNull: false, unique: true, defaultValue: S.UUIDV4 } });
export default {
  async up(q, S) {
    await q.createTable('categories', { ...id(S), name: { type: S.STRING(255), allowNull: false }, parent_id: { type: S.INTEGER, allowNull: true, references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' }, status: { type: S.ENUM('active', 'inactive'), allowNull: false, defaultValue: 'active' }, ...timestamps(S) });
    await q.createTable('products', { ...id(S), name: { type: S.STRING, allowNull: false }, sku: { type: S.STRING, allowNull: false, unique: true }, price: { type: S.DECIMAL(10, 2), allowNull: false }, description: S.TEXT, loyalty_points: { type: S.INTEGER, allowNull: false }, category_id: { type: S.INTEGER, references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' }, status: { type: S.ENUM('active', 'inactive'), allowNull: false, defaultValue: 'active' }, ...timestamps(S) });
  },
  async down(q) { await q.dropTable('products'); await q.dropTable('categories'); },
};
