import express from "express";
import router from "./routes/index.js";

const app = express();
const port = Number(process.env.LOYALTY_PORT || 3002);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "loyalty" });
});

app.use("/", router);

app.listen(port, () => {
  console.log(`Loyalty service running on port ${port}`);
});

export default app;
