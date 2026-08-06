import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config({ quiet: true });

const quoteIdentifier = (identifier) => `"${String(identifier).replaceAll('"', '""')}"`;

/**
 * Ensures the target application database exists before the app connects to it.
 *
 * PostgreSQL cannot connect to a database that does not exist, so we first open a
 * temporary connection to the `postgres` system database, check pg_database, and
 * create the target database if it is missing. The temporary connection is closed
 * before returning.
 *
 * @returns {Promise<{database: string, created: boolean}>} Result of the ensure operation.
 */
export default async function ensureDatabase() {
  const database = process.env.ADMIN_DB_NAME || process.env.DB_NAME || process.env.DB_DATABASE || "admin_db";
  const username = process.env.DB_USER || process.env.DB_USERNAME || "postgres";
  const password = process.env.DB_PASS || process.env.DB_PASSWORD || "postgres";
  const host = process.env.DB_HOST || process.env.DB_HOSTNAME || "127.0.0.1";
  const port = Number.parseInt(process.env.DB_PORT || "5432", 10);

  // Connect to the maintenance database. If the user has configured a different
  // maintenance DB, prefer it; otherwise default to `postgres`.
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
      {
        replacements: { name: database },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (!rows) {
      await adminSequelize.query(`CREATE DATABASE ${quoteIdentifier(database)}`);
      return { database, created: true };
    }

    return { database, created: false };
  } finally {
    await adminSequelize.close();
  }
}
