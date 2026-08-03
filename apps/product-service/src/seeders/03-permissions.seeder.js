'use strict';

const PERMISSIONS = [
  { uuid: '00000000-0000-0000-0000-000000000101', action: 'create' },
  { uuid: '00000000-0000-0000-0000-000000000102', action: 'read' },
  { uuid: '00000000-0000-0000-0000-000000000103', action: 'update' },
  { uuid: '00000000-0000-0000-0000-000000000104', action: 'delete' },
  { uuid: '00000000-0000-0000-0000-000000000105', action: 'approve' },
];

/** Seed the standard actions used by module permissions. */
export async function up(queryInterface) {
  const [existingPermissions] = await queryInterface.sequelize.query(
    'SELECT uuid FROM permissions WHERE uuid IN (:uuids)',
    { replacements: { uuids: PERMISSIONS.map((permission) => permission.uuid) } }
  );
  const existingUuids = new Set(existingPermissions.map((permission) => permission.uuid));
  const now = new Date();
  const permissionsToInsert = PERMISSIONS
    .filter((permission) => !existingUuids.has(permission.uuid))
    .map((permission) => ({ ...permission, status: 'active', created_at: now, updated_at: now }));

  if (permissionsToInsert.length) {
    await queryInterface.bulkInsert('permissions', permissionsToInsert);
  }
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('permissions', {
    uuid: { [Sequelize.Op.in]: PERMISSIONS.map((permission) => permission.uuid) },
  });
}
