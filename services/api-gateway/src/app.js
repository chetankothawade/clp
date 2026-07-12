import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/index.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get("/health", (_req, res) => res.json({ status: "ok", service: "api-gateway" }));
app.use("/", router);

app.listen(port, () => {
  console.log(`API Gateway running on port ${port}`);
});

export default app;
