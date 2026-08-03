import dotenv from "dotenv";
import { initializeAppTimezone } from "./src/bootstrap/timezone.js";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env.local" });

initializeAppTimezone();
process.removeAllListeners("warning");

const [{ default: app }, { default: logger }, { default: db }] = await Promise.all([
  import("./app.js"),
  import("./src/utils/logger.js"),
  import("./src/models/index.js"),
]);

const PORT = Number.parseInt(process.env.PORT, 10) || 8002;

try {
  await db.sequelize.authenticate();
  logger.info("Database connection established");
} catch (err) {
  logger.error({ err }, "Unable to connect to the database");
}

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, "Server is running");
});

export default server;
