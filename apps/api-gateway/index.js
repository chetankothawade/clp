import dotenv from "dotenv";

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || ".env.local" });

const { default: app } = await import("./app.js");

const port = Number.parseInt(process.env.PORT, 10) || 8000;
app.listen(port, () => console.info(`API gateway listening on ${port}`));
