import crypto from "crypto";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import db from "../src/models/index.js";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env.local" });
const legacy = new Sequelize(
  process.env.LEGACY_ADMIN_DB_NAME || process.env.LEGACY_DB_NAME || "loyality",
  process.env.LEGACY_DB_USER || process.env.DB_USER || "postgres",
  process.env.LEGACY_DB_PASSWORD || process.env.DB_PASS || "postgres",
  { host: process.env.LEGACY_DB_HOST || process.env.DB_HOST || "127.0.0.1", port: Number(process.env.LEGACY_DB_PORT || process.env.DB_PORT || 5432), dialect: "postgres", logging: false },
);

try {
  await legacy.authenticate();
  await db.sequelize.transaction(async (transaction) => {
    const [[{ count }]] = await db.sequelize.query("SELECT COUNT(*)::int AS count FROM cms", { transaction });
    if (count > 0) throw new Error("admin_db is not empty; refusing to import duplicate CMS data");
    const [rows] = await legacy.query("SELECT * FROM cms ORDER BY id");
    for (const row of rows) if (!row.uuid) row.uuid = crypto.randomUUID();
    if (rows.length) await db.sequelize.getQueryInterface().bulkInsert("cms", rows, { transaction });
    await db.sequelize.query("SELECT setval(pg_get_serial_sequence('cms', 'id'), COALESCE((SELECT MAX(id) FROM cms), 1), true)", { transaction });
  });
  console.info("Legacy CMS data migrated successfully.");
} finally { await legacy.close(); await db.sequelize.close(); }
