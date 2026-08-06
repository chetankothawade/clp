'use strict';

import { randomUUID } from 'crypto';
import { fetchUsers, fetchProducts } from './helpers/db.helper.js';

// The loyalty DB denormalizes product & user references by UUID (no FK to users/products tables).
// Product metadata (name/sku/price/points) used as fallback when the product-service row is unavailable.
const PRODUCT_META = [
  { name: 'Coffee Voucher', sku: 'LOYALTY-DEMO-COFFEE', price: 150.0, loyalty_points: 25 },
  { name: 'Travel Backpack', sku: 'LOYALTY-DEMO-BACKPACK', price: 2500.0, loyalty_points: 250 },
  { name: 'Wireless Headphones', sku: 'LOYALTY-DEMO-HEADPHONES', price: 5000.0, loyalty_points: 500 },
];

// Fallback user emails (by role) used to locate real UUIDs in the auth-service users table.
const USER_EMAILS = [
  'superadmin@yopmail.com',
  'admin@yopmail.com',
  'user@yopmail.com',
];

const PRODUCT_SKUS = PRODUCT_META.map((product) => product.sku);

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

  // Fetch the real product UUIDs from the product-service `products` table (by SKU).
  const productRows = await fetchProducts();
  const productBySku = Object.fromEntries(productRows.map((product) => [product.sku, product]));
  const missingSkus = PRODUCT_SKUS.filter((sku) => !productBySku[sku]);
  if (missingSkus.length) {
    throw new Error(`Run the product-service product seeder first. Missing SKUs: ${missingSkus.join(', ')}`);
  }

  // Fetch the real user UUIDs from the auth-service `users` table (by email).
  const userRows = await fetchUsers();
  const userByEmail = Object.fromEntries(userRows.map((user) => [user.email, user]));
  const missingEmails = USER_EMAILS.filter((email) => !userByEmail[email]);
  if (missingEmails.length) {
    throw new Error(`Run the auth-service user seeder first. Missing users: ${missingEmails.join(', ')}`);
  }

  const USER_UUIDS = USER_EMAILS.map((email) => userByEmail[email].uuid);

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
    product_sku: { [Sequelize.Op.in]: PRODUCT_META.map((product) => product.sku) },
  });
}
