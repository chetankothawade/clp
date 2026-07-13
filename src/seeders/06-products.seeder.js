'use strict';

import { randomUUID } from 'crypto';

const DEMO_CATEGORY_UUID = 'a8f2f05c-18d7-4ad9-9179-3d0c4b8c8e01';
const DEMO_PRODUCT_SKUS = ['LOYALTY-DEMO-COFFEE', 'LOYALTY-DEMO-BACKPACK', 'LOYALTY-DEMO-HEADPHONES'];

export async function up(queryInterface) {
  const [existingProducts] = await queryInterface.sequelize.query(
    "SELECT id FROM products WHERE sku IN ('LOYALTY-DEMO-COFFEE', 'LOYALTY-DEMO-BACKPACK', 'LOYALTY-DEMO-HEADPHONES')"
  );
  if (existingProducts.length) return;

  const [categories] = await queryInterface.sequelize.query('SELECT id FROM categories ORDER BY id ASC LIMIT 1');
  const now = new Date();
  let categoryId = categories[0]?.id;

  if (!categoryId) {
    await queryInterface.bulkInsert('categories', [{
      uuid: DEMO_CATEGORY_UUID,
      name: 'Loyalty Category',
      parent_id: null,
      status: 'active',
      created_at: now,
      updated_at: now,
    }]);
    const [seedCategory] = await queryInterface.sequelize.query(
      'SELECT id FROM categories WHERE uuid = :uuid',
      { replacements: { uuid: DEMO_CATEGORY_UUID } }
    );
    categoryId = seedCategory[0].id;
  }

  return queryInterface.bulkInsert('products', [
    {
      uuid: randomUUID(), name: 'Coffee Voucher', sku: DEMO_PRODUCT_SKUS[0], price: 150.00,
      description: 'product for loyalty purchase seeding.', loyalty_points: 25, category_id: categoryId,
      status: 'active', created_at: now, updated_at: now,
    },
    {
      uuid: randomUUID(), name: 'Travel Backpack', sku: DEMO_PRODUCT_SKUS[1], price: 2500.00,
      description: 'product for loyalty purchase seeding.', loyalty_points: 250, category_id: categoryId,
      status: 'active', created_at: now, updated_at: now,
    },
    {
      uuid: randomUUID(), name: 'Wireless Headphones', sku: DEMO_PRODUCT_SKUS[2], price: 5000.00,
      description: 'product for loyalty purchase seeding.', loyalty_points: 500, category_id: categoryId,
      status: 'active', created_at: now, updated_at: now,
    },
  ]);
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete('products', { sku: { [Sequelize.Op.in]: DEMO_PRODUCT_SKUS } });
}
