'use strict';

import { randomUUID } from 'crypto';

const PRODUCT_SKUS = ['LOYALTY-COFFEE', 'LOYALTY-BACKPACK', 'LOYALTY-HEADPHONES'];

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export async function up(queryInterface) {
  // The existing user seeder must be run first so purchases are linked to real user IDs.
  const [users] = await queryInterface.sequelize.query(
    "SELECT id FROM users WHERE role = 'user' ORDER BY id ASC LIMIT 3"
  );
  if (!users.length) throw new Error('Run the user seeder before the purchase seeder.');

  const [products] = await queryInterface.sequelize.query(
    "SELECT id, sku, price, loyalty_points FROM products WHERE sku IN ('LOYALTY-COFFEE', 'LOYALTY-BACKPACK', 'LOYALTY-HEADPHONES') ORDER BY id ASC"
  );
  if (products.length !== PRODUCT_SKUS.length) {
    throw new Error('Run the product seeder before the purchase seeder.');
  }

  const productBySku = Object.fromEntries(products.map((product) => [product.sku, product]));
  const rows = [
    { user: users[0], product: productBySku['LOYALTY-HEADPHONES'], quantity: 2, date: daysAgo(5) },
    { user: users[0], product: productBySku['LOYALTY-BACKPACK'], quantity: 1, date: daysAgo(3) },
    { user: users[Math.min(1, users.length - 1)], product: productBySku['LOYALTY-BACKPACK'], quantity: 2, date: daysAgo(4) },
    { user: users[Math.min(1, users.length - 1)], product: productBySku['LOYALTY-COFFEE'], quantity: 1, date: daysAgo(2) },
    { user: users[Math.min(2, users.length - 1)], product: productBySku['LOYALTY-HEADPHONES'], quantity: 1, date: daysAgo(1) },
  ];

  return queryInterface.bulkInsert('purchases', rows.map(({ user, product, quantity, date }) => ({
    uuid: randomUUID(),
    user_id: user.id,
    product_id: product.id,
    quantity,
    unit_price: Number(product.price).toFixed(2),
    total_amount: (Number(product.price) * quantity).toFixed(2),
    points_earned: Number(product.loyalty_points) * quantity,
    purchase_date: date,
    status: 'completed',
    created_at: date,
    updated_at: date,
  })));
}

export async function down(queryInterface, Sequelize) {
  const [products] = await queryInterface.sequelize.query(
    "SELECT id FROM products WHERE sku IN ('LOYALTY-COFFEE', 'LOYALTY-BACKPACK', 'LOYALTY-HEADPHONES')"
  );
  if (products.length) {
    await queryInterface.bulkDelete('purchases', { product_id: { [Sequelize.Op.in]: products.map((product) => product.id) } });
  }
}
