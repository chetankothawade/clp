'use strict';
const timestamps = (Sequelize) => ({ created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }, updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') } });
const id = (Sequelize) => ({ id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true }, uuid: { type: Sequelize.UUID, allowNull: false, unique: true, defaultValue: Sequelize.UUIDV4 } });
export default {
  async up(q, S) {
    await q.createTable('users', { ...id(S), name: { type: S.STRING(100), allowNull: false }, email: { type: S.STRING(150), allowNull: false, unique: true }, password: { type: S.STRING, allowNull: false }, phone: S.STRING(20), avatar: S.STRING, role: { type: S.ENUM('user', 'admin', 'super_admin'), allowNull: false, defaultValue: 'user' }, status: { type: S.ENUM('active', 'inactive'), allowNull: false, defaultValue: 'active' }, reset_password_token: S.STRING, reset_password_expires: S.DATE, ...timestamps(S) });
    await q.createTable('modules', { ...id(S), parent_id: { type: S.INTEGER, defaultValue: 0 }, name: { type: S.STRING(50), allowNull: false, unique: true }, url: { type: S.STRING(100), allowNull: false }, icon: { type: S.STRING(100), allowNull: false }, seq_no: S.INTEGER, is_sub_module: { type: S.ENUM('Y', 'N'), defaultValue: 'N' }, status: { type: S.ENUM('active', 'inactive'), defaultValue: 'active' }, is_permission: { type: S.ENUM('Y', 'N'), defaultValue: 'N' }, ...timestamps(S) });
    await q.createTable('permissions', { ...id(S), action: { type: S.STRING(50), allowNull: false }, status: { type: S.ENUM('active', 'inactive'), defaultValue: 'active' }, ...timestamps(S) });
    await q.createTable('module_permissions', { ...id(S), module_id: { type: S.INTEGER, allowNull: false, references: { model: 'modules', key: 'id' } }, permission_id: { type: S.INTEGER, allowNull: false, references: { model: 'permissions', key: 'id' } }, ...timestamps(S) });
    await q.createTable('role_modules', { ...id(S), role: { type: S.ENUM('super_admin', 'admin', 'user'), allowNull: false }, module_id: { type: S.INTEGER, allowNull: false }, ...timestamps(S) });
    await q.createTable('user_permissions', { ...id(S), user_id: { type: S.INTEGER, allowNull: false, references: { model: 'users', key: 'id' } }, module_permission_id: { type: S.INTEGER, allowNull: false, references: { model: 'module_permissions', key: 'id' } }, ...timestamps(S) });
  },
  async down(q) { for (const table of ['user_permissions', 'role_modules', 'module_permissions', 'permissions', 'modules', 'users']) await q.dropTable(table); },
};
