import express from "express";
import router from "./routes/index.js";

const app = express();
const port = Number(process.env.PRODUCT_PORT || 3004);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "product" });
});

app.use("/", router);

app.listen(port, () => {
  console.log(`Product service running on port ${port}`);
});

export default app;
