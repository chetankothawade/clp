import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import db from "../src/models/index.js";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env.local" });

const legacy = new Sequelize(
  process.env.LEGACY_AUTH_DB_NAME || process.env.LEGACY_DB_NAME || "loyality",
  process.env.LEGACY_DB_USER || process.env.DB_USER || "postgres",
  process.env.LEGACY_DB_PASSWORD || process.env.DB_PASS || "postgres",
  { host: process.env.LEGACY_DB_HOST || process.env.DB_HOST || "127.0.0.1", port: Number(process.env.LEGACY_DB_PORT || process.env.DB_PORT || 5432), dialect: "postgres", logging: false },
);
const tables = ["users", "modules", "permissions", "module_permissions", "role_modules", "user_permissions"];

try {
  await legacy.authenticate();
  await db.sequelize.authenticate();
  await db.sequelize.transaction(async (transaction) => {
    for (const table of tables) {
      const [rows] = await legacy.query(`SELECT * FROM ${table}`);
      if (rows.length) await db.sequelize.getQueryInterface().bulkInsert(table, rows, { transaction });
      await db.sequelize.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 1), true)`, { transaction });
    }
  });
  console.info("Legacy Auth data migrated successfully.");
} finally {
  await legacy.close();
  await db.sequelize.close();
}
