'use strict';

import { randomUUID } from 'crypto';

// The loyalty DB denormalizes product & user references by UUID (no FK to users/products tables).
const PRODUCTS = [
  { uuid: 'b1a3f05c-18d7-4ad9-9179-3d0c4b8c8e11', name: 'Coffee Voucher', sku: 'LOYALTY-DEMO-COFFEE', price: 150.0, loyalty_points: 25 },
  { uuid: 'b1a3f05c-18d7-4ad9-9179-3d0c4b8c8e12', name: 'Travel Backpack', sku: 'LOYALTY-DEMO-BACKPACK', price: 2500.0, loyalty_points: 250 },
  { uuid: 'b1a3f05c-18d7-4ad9-9179-3d0c4b8c8e13', name: 'Wireless Headphones', sku: 'LOYALTY-DEMO-HEADPHONES', price: 5000.0, loyalty_points: 500 },
];

// Deterministic user UUIDs matching the auth-service demo users (superadmin/admin/customer/user).
const USER_UUIDS = [
  'c8f2f05c-18d7-4ad9-9179-3d0c4b8c8e21',
  'c8f2f05c-18d7-4ad9-9179-3d0c4b8c8e22',
  'c8f2f05c-18d7-4ad9-9179-3d0c4b8c8e23',
];

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export async function up(queryInterface) {
  const [existingPurchases] = await queryInterface.sequelize.query(
    "SELECT id FROM purchases WHERE product_sku IN ('LOYALTY-DEMO-COFFEE', 'LOYALTY-DEMO-BACKPACK', 'LOYALTY-DEMO-HEADPHONES')"
  );
  if (existingPurchases.length) return;

  const productBySku = Object.fromEntries(PRODUCTS.map((product) => [product.sku, product]));
  const rows = [
    { user: USER_UUIDS[0], product: productBySku['LOYALTY-DEMO-HEADPHONES'], quantity: 2, date: daysAgo(5) },
    { user: USER_UUIDS[0], product: productBySku['LOYALTY-DEMO-BACKPACK'], quantity: 1, date: daysAgo(3) },
    { user: USER_UUIDS[1], product: productBySku['LOYALTY-DEMO-BACKPACK'], quantity: 2, date: daysAgo(4) },
    { user: USER_UUIDS[1], product: productBySku['LOYALTY-DEMO-COFFEE'], quantity: 1, date: daysAgo(2) },
    { user: USER_UUIDS[2], product: productBySku['LOYALTY-DEMO-HEADPHONES'], quantity: 1, date: daysAgo(1) },
  ];

  return queryInterface.bulkInsert('purchases', rows.map(({ user, product, quantity, date }) => ({
    uuid: randomUUID(),
    user_uuid: user,
    product_uuid: product.uuid,
    product_name: product.name,
    product_sku: product.sku,
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
  await queryInterface.bulkDelete('purchases', {
    product_sku: { [Sequelize.Op.in]: PRODUCTS.map((product) => product.sku) },
  });
}
