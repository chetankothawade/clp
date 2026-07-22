import crypto from "crypto";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import db from "../src/models/index.js";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env.local" });
const legacy = new Sequelize(
  process.env.LEGACY_PRODUCT_DB_NAME || process.env.LEGACY_DB_NAME || "loyality",
  process.env.LEGACY_DB_USER || process.env.DB_USER || "postgres",
  process.env.LEGACY_DB_PASSWORD || process.env.DB_PASS || "postgres",
  { host: process.env.LEGACY_DB_HOST || process.env.DB_HOST || "127.0.0.1", port: Number(process.env.LEGACY_DB_PORT || process.env.DB_PORT || 5432), dialect: "postgres", logging: false },
);

try {
  await legacy.authenticate();
  await db.sequelize.transaction(async (transaction) => {
    const [[{ count }]] = await db.sequelize.query("SELECT COUNT(*)::int AS count FROM categories", { transaction });
    if (count > 0) throw new Error("product_db is not empty; refusing to import duplicate legacy data");
    const [categories] = await legacy.query("SELECT * FROM categories ORDER BY id");
    const [products] = await legacy.query("SELECT * FROM products ORDER BY id");
    for (const row of [...categories, ...products]) if (!row.uuid) row.uuid = crypto.randomUUID();
    const queryInterface = db.sequelize.getQueryInterface();
    if (categories.length) await queryInterface.bulkInsert("categories", categories, { transaction });
    if (products.length) await queryInterface.bulkInsert("products", products, { transaction });
    for (const table of ["categories", "products"]) await db.sequelize.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 1), true)`, { transaction });
  });
  console.info("Legacy product data migrated successfully; existing UUIDs were preserved.");
} finally {
  await legacy.close();
  await db.sequelize.close();
}
