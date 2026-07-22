'use strict';
export default {
  async up(q, S) {
    await q.createTable('cms', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      uuid: { type: S.UUID, allowNull: false, unique: true, defaultValue: S.UUIDV4 },
      title: { type: S.STRING(50), allowNull: false, unique: true },
      content: { type: S.TEXT, allowNull: true },
      status: { type: S.ENUM('active', 'inactive'), allowNull: false, defaultValue: 'active' },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
    });
  },
  async down(q) { await q.dropTable('cms'); },
};
