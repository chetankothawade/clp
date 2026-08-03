'use strict';

import { randomUUID } from 'crypto';

const MODULES = [
  { name: 'Dashboard', url: '/dashboard', icon: 'dashboard', seq_no: 1, is_permission: 'Y' },
  { name: 'Users', url: '/users', icon: 'users', seq_no: 2, is_permission: 'Y' },
  { name: 'Modules', url: '/modules', icon: 'modules', seq_no: 3, is_permission: 'Y' },
  { name: 'Categories', url: '/categories', icon: 'tags', seq_no: 4, is_permission: 'Y' },
  { name: 'CMS', url: '/cms', icon: 'file-text', seq_no: 5, is_permission: 'Y' },
  { name: 'Products', url: '/products', icon: 'package', seq_no: 6, is_permission: 'Y' },
  { name: 'Rewards', url: '/rewards', icon: 'gift', seq_no: 7, is_permission: 'Y' },
];

/** Seed only the navigation modules required by the administration panel. */
export async function up(queryInterface) {
  const [existingModules] = await queryInterface.sequelize.query(
    'SELECT name FROM modules WHERE name IN (:names)',
    { replacements: { names: MODULES.map((module) => module.name) } }
  );
  const existingNames = new Set(existingModules.map((module) => module.name));
  const now = new Date();
  const modulesToInsert = MODULES
    .filter((module) => !existingNames.has(module.name))
    .map((module) => ({
      uuid: randomUUID(),
      ...module,
      parent_id: 0,
      is_sub_module: 'N',
      status: 'active',
      created_at: now,
      updated_at: now,
    }));

  if (modulesToInsert.length) {
    await queryInterface.bulkInsert('modules', modulesToInsert);
  }
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('modules', {
    name: { [Sequelize.Op.in]: MODULES.map((module) => module.name) },
  });
}
