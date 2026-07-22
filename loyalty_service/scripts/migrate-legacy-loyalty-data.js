import crypto from "crypto";
import dotenv from "dotenv";
import { Sequelize } from "sequelize";
import db from "../src/models/index.js";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env.local" });
const legacy = new Sequelize(
  process.env.LEGACY_LOYALTY_DB_NAME || process.env.LEGACY_DB_NAME || "loyality",
  process.env.LEGACY_DB_USER || process.env.DB_USER || "postgres",
  process.env.LEGACY_DB_PASSWORD || process.env.DB_PASS || "postgres",
  { host: process.env.LEGACY_DB_HOST || process.env.DB_HOST || "127.0.0.1", port: Number(process.env.LEGACY_DB_PORT || process.env.DB_PORT || 5432), dialect: "postgres", logging: false },
);
const ensureUuid = (row, label) => { if (!row.uuid) row.uuid = crypto.randomUUID(); return row; };

try {
  await legacy.authenticate();
  await db.sequelize.transaction(async (transaction) => {
    const [[{ count }]] = await db.sequelize.query("SELECT COUNT(*)::int AS count FROM rewards", { transaction });
    if (count > 0) throw new Error("loyalty_db is not empty; refusing to import duplicate legacy data");
    const [rewards] = await legacy.query("SELECT * FROM rewards ORDER BY id");
    const [legacyPurchases] = await legacy.query("SELECT pu.*, u.uuid AS user_uuid, pr.uuid AS product_uuid, pr.name AS product_name, pr.sku AS product_sku FROM purchases pu JOIN users u ON u.id = pu.user_id JOIN products pr ON pr.id = pu.product_id ORDER BY pu.id");
    const [legacyRedemptions] = await legacy.query("SELECT re.*, u.uuid AS user_uuid FROM redemptions re JOIN users u ON u.id = re.user_id ORDER BY re.id");
    if ([...legacyPurchases, ...legacyRedemptions].some((row) => !row.user_uuid)) throw new Error("Legacy users require UUIDs before Loyalty data can be migrated");
    if (legacyPurchases.some((row) => !row.product_uuid)) throw new Error("Legacy products require UUIDs before Loyalty data can be migrated");
    const purchases = legacyPurchases.map(({ user_id, product_id, ...row }) => ensureUuid(row, "purchase"));
    const redemptions = legacyRedemptions.map(({ user_id, ...row }) => ensureUuid(row, "redemption"));
    const queryInterface = db.sequelize.getQueryInterface();
    if (rewards.length) await queryInterface.bulkInsert("rewards", rewards.map((row) => ensureUuid(row, "reward")), { transaction });
    if (purchases.length) await queryInterface.bulkInsert("purchases", purchases, { transaction });
    if (redemptions.length) await queryInterface.bulkInsert("redemptions", redemptions, { transaction });
    for (const table of ["rewards", "purchases", "redemptions"]) await db.sequelize.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 1), true)`, { transaction });
  });
  console.info("Legacy Loyalty data migrated successfully with immutable product snapshots.");
} finally { await legacy.close(); await db.sequelize.close(); }
