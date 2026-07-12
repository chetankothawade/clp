import express from "express";
import router from "./routes/index.js";

const app = express();
const port = Number(process.env.AUTH_PORT || 3003);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "auth" });
});

app.use("/", router);

app.listen(port, () => {
  console.log(`Auth service running on port ${port}`);
});

export default app;
