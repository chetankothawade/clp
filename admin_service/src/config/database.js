import dotenv from "dotenv";
import { Sequelize } from "sequelize";

import logger from "../utils/logger.js";

dotenv.config({ quiet: true });

const database = process.env.ADMIN_DB_NAME || process.env.DB_NAME || process.env.DB_DATABASE || "admin_db";
const username = process.env.DB_USER || process.env.DB_USERNAME || "postgres";
const password = process.env.DB_PASS || process.env.DB_PASSWORD || "postgres";
const host = process.env.DB_HOST || process.env.DB_HOSTNAME || "127.0.0.1";
const port = Number.parseInt(process.env.DB_PORT || "5432", 10);
const dialect = process.env.DB_DIALECT || "postgres";

const sequelize = new Sequelize(database, username, password, {
  host,
  port,
  dialect,
  logging: process.env.DB_LOGGING === "true" ? (msg) => logger.debug({ sql: msg }) : false,
  pool: {
    max: Number(process.env.DB_POOL_MAX || 10),
    min: Number(process.env.DB_POOL_MIN || 0),
    acquire: Number(process.env.DB_POOL_ACQUIRE || 30000),
    idle: Number(process.env.DB_POOL_IDLE || 10000),
  },
  define: {
    timestamps: true,
  },
});

export default sequelize;
