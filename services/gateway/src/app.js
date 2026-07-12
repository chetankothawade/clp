import express from "express";
import router from "./routes/index.js";

const app = express();
const port = Number(process.env.GATEWAY_PORT || 3001);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "gateway" });
});

app.use("/", router);

app.listen(port, () => {
  console.log(`Gateway running on port ${port}`);
});

export default app;
