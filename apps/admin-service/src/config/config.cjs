require("dotenv").config({ path: process.env.DOTENV_CONFIG_PATH || ".env.local" });

const baseConfig = {
  username: process.env.DB_USER || process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASS || process.env.DB_PASSWORD || "postgres",
  database: process.env.ADMIN_DB_NAME || process.env.DB_NAME || "admin_db",
  host: process.env.DB_HOST || process.env.DB_HOSTNAME || "127.0.0.1",
  port: Number.parseInt(process.env.DB_PORT || "5432", 10),
  dialect: process.env.DB_DIALECT || "postgres",
  logging: process.env.DB_LOGGING === "true",
};

module.exports = {
  development: baseConfig,
  test: {
    ...baseConfig,
    database: process.env.DB_TEST_NAME || `${baseConfig.database}_test`,
  },
  production: {
    ...baseConfig,
    logging: false,
  },
};
