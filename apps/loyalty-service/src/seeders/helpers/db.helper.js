'use strict';

// Helper to read from the sibling microservice databases (auth_db / product_db).
// The loyalty_db denormalizes user/product references by UUID, so we need the
// real UUIDs from the source systems instead of hardcoded demo values.
import pg from 'pg';

const { Client } = pg;

/**
 * Resolve DB connection options for a given service database.
 * @param {string} service - 'auth' | 'product'
 */
function resolveDbConfig(service) {
  const envName =
    service === 'auth'
      ? 'AUTH_DB_NAME'
      : service === 'product'
        ? 'PRODUCT_DB_NAME'
        : null;

  const fallback = service === 'auth' ? 'auth_db' : service === 'product' ? 'product_db' : 'loyalty_db';
  const serviceDatabase = envName && process.env[envName];

  return {
    user: process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASS || process.env.DB_PASSWORD || 'postgres',
    database: serviceDatabase || fallback,
    host: process.env.DB_HOST || process.env.DB_HOSTNAME || '127.0.0.1',
    port: Number.parseInt(process.env.DB_PORT || '5432', 10),
  };
}

/**
 * Run a query against a sibling service database.
 * @param {'auth'|'product'} service
 * @param {string} sql - The SQL to execute
 * @param {Array} [params] - Parameterized query values
 * @returns {Promise<Array>} - The result rows
 */
export async function queryExternalDb(service, sql, params = []) {
  const client = new Client(resolveDbConfig(service));
  try {
    await client.connect();
    const { rows } = await client.query(sql, params);
    return rows;
  } finally {
    await client.end();
  }
}

/**
 * Fetch real user UUIDs from the auth-service `users` table.
 * @returns {Promise<{uuid: string, email: string, role: string}[]>}
 */
export async function fetchUsers() {
  return queryExternalDb(
    'auth',
    'SELECT uuid, email, role FROM users ORDER BY id ASC'
  );
}

/**
 * Fetch real product rows from the product-service `products` table.
 * @returns {Promise<{uuid: string, name: string, sku: string, price: string|number, loyalty_points: number}[]>}
 */
export async function fetchProducts() {
  return queryExternalDb(
    'product',
    'SELECT uuid, name, sku, price, loyalty_points FROM products ORDER BY id ASC'
  );
}
