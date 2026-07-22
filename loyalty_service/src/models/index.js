import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const directory = path.dirname(fileURLToPath(import.meta.url));
const db = {};
for (const file of fs.readdirSync(directory)) {
  if (!file.endsWith(".model.js")) continue;
  const model = (await import(`./${file}`)).default(sequelize, DataTypes);
  db[model.name] = model;
}
for (const model of Object.values(db)) model.associate?.(db);
db.sequelize = sequelize;
export default db;
