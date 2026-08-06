// Ensures the target database exists before sequelize-cli runs.
// Reads the same config.cjs used by sequelize-cli, connects to the
// `postgres` maintenance database, and creates the target DB if missing.
import { Sequelize } from "sequelize";
import { createRequire } from "module";
import path from "path";
import process from "process";

const require = createRequire(import.meta.url);
const env = process.env.NODE_ENV || "development";
const config = require(path.resolve("src/config/config.cjs"))[env];

const quoteIdentifier = (identifier) => `"${String(identifier).replaceAll('"', '""')}"`;

async function ensureDatabase() {
  const { database, username, password, host, port } = config;
  const maintenanceDb = process.env.DB_MAINTENANCE_DATABASE || "postgres";

  const adminSequelize = new Sequelize(maintenanceDb, username, password, {
    host,
    port,
    dialect: "postgres",
    logging: false,
  });

  try {
    await adminSequelize.authenticate();
    const [rows] = await adminSequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = :name`,
      { replacements: { name: database }, type: Sequelize.QueryTypes.SELECT }
    );

    if (!rows) {
      await adminSequelize.query(`CREATE DATABASE ${quoteIdentifier(database)}`);
      console.log(`Database "${database}" created because it did not exist.`);
    } else {
      console.log(`Database "${database}" already exists.`);
    }
  } finally {
    await adminSequelize.close();
  }
}

ensureDatabase().catch((err) => {
  console.error("Failed to ensure database exists:", err.message);
  process.exit(1);
});
