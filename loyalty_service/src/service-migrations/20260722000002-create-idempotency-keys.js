'use strict';
export default {
  async up(q, S) {
    await q.createTable('idempotency_keys', {
      id: { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      user_uuid: { type: S.UUID, allowNull: false },
      key: { type: S.STRING(255), allowNull: false },
      purchase_uuid: { type: S.UUID, allowNull: false },
      created_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
      updated_at: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
    });
    await q.addConstraint('idempotency_keys', { fields: ['user_uuid', 'key'], type: 'unique', name: 'idempotency_keys_user_key_unique' });
  },
  async down(q) { await q.dropTable('idempotency_keys'); },
};
