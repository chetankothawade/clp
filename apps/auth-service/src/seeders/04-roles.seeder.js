'use strict';

import { randomUUID } from 'crypto';

const ADMIN_ROLES = ['super_admin', 'admin'];

/**
 * Grant module access to roles and attach action permissions to every seeded module.
 * Run this after `modules.seeder.js` and `permissions.seeder.js`.
 */
export async function up(queryInterface) {
  const [modules] = await queryInterface.sequelize.query('SELECT id, name FROM modules WHERE status = :status', {
    replacements: { status: 'active' },
  });
  const [permissions] = await queryInterface.sequelize.query('SELECT id FROM permissions WHERE status = :status', {
    replacements: { status: 'active' },
  });
  if (!modules.length || !permissions.length) {
    throw new Error('Run the modules and permissions seeders before the roles seeder.');
  }

  const [existingModulePermissions] = await queryInterface.sequelize.query(
    'SELECT module_id, permission_id FROM module_permissions'
  );
  const existingModulePermissionKeys = new Set(existingModulePermissions.map((row) => `${row.module_id}:${row.permission_id}`));
  const now = new Date();
  const modulePermissions = [];
  for (const module of modules) {
    for (const permission of permissions) {
      if (!existingModulePermissionKeys.has(`${module.id}:${permission.id}`)) {
        modulePermissions.push({
          uuid: randomUUID(), module_id: module.id, permission_id: permission.id, created_at: now, updated_at: now,
        });
      }
    }
  }
  if (modulePermissions.length) await queryInterface.bulkInsert('module_permissions', modulePermissions);

  const [existingRoleModules] = await queryInterface.sequelize.query('SELECT role, module_id FROM role_modules');
  const existingRoleModuleKeys = new Set(existingRoleModules.map((row) => `${row.role}:${row.module_id}`));
  const roleModules = [];
  for (const module of modules) {
    for (const role of ADMIN_ROLES) {
      if (!existingRoleModuleKeys.has(`${role}:${module.id}`)) {
        roleModules.push({ role, module_id: module.id, created_at: now, updated_at: now });
      }
    }
  }
  if (roleModules.length) await queryInterface.bulkInsert('role_modules', roleModules);
}

export async function down(queryInterface, Sequelize) {
  const [modules] = await queryInterface.sequelize.query('SELECT id FROM modules');
  const moduleIds = modules.map((module) => module.id);
  if (!moduleIds.length) return;

  await queryInterface.bulkDelete('role_modules', { module_id: { [Sequelize.Op.in]: moduleIds } });
  await queryInterface.bulkDelete('module_permissions', { module_id: { [Sequelize.Op.in]: moduleIds } });
}
