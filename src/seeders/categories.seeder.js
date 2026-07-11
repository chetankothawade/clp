'use strict';

const CATEGORIES = [
  {
    uuid: 'a8f2f05c-18d7-4ad9-9179-3d0c4b8c8e01',
    name: 'Loyalty Category',
  },
  {
    uuid: 'f5a9fd7a-cdde-49cc-a3ba-69c8a6d1c6a2',
    name: 'Lifestyle Rewards',
  },
  {
    uuid: '1d4319d1-a563-4e96-8c72-c2e3ccde3bd3',
    name: 'Travel Essentials',
  },
];

/**
 * Seed active top-level categories used by the demo product and reward data.
 */
export async function up(queryInterface) {
  const [existingCategories] = await queryInterface.sequelize.query(
    'SELECT uuid FROM categories WHERE uuid IN (:uuids)',
    { replacements: { uuids: CATEGORIES.map((category) => category.uuid) } }
  );
  const existingUuids = new Set(existingCategories.map((category) => category.uuid));
  const now = new Date();
  const categoriesToInsert = CATEGORIES
    .filter((category) => !existingUuids.has(category.uuid))
    .map((category) => ({
      ...category,
      parent_id: null,
      status: 'active',
      created_at: now,
      updated_at: now,
    }));

  if (categoriesToInsert.length) {
    await queryInterface.bulkInsert('categories', categoriesToInsert);
  }
}

/**
 * Remove only the categories created by this demo seeder.
 */
export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('categories', {
    uuid: { [Sequelize.Op.in]: CATEGORIES.map((category) => category.uuid) },
  });
}
