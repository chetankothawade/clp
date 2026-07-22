import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env.local" });
const port = Number.parseInt(process.env.PORT, 10) || 8000;
app.listen(port, () => console.info(`API gateway listening on ${port}`));
