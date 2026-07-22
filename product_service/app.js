import dotenv from "dotenv";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";

import compressionMiddleware from "./src/middlewares/compression.js";
import corsMiddleware from "./src/middlewares/cors.js";
import errorHandler from "./src/middlewares/errorHandler.js";
import helmetMiddleware from "./src/middlewares/helmet.js";
import i18nMiddleware from "./src/middlewares/i18n.js";
import limiter from "./src/middlewares/limiter.js";
import requestId from "./src/middlewares/requestId.js";
import requestLogger from "./src/middlewares/logger.js";
import v1Routes from "./src/routes/v1/index.js";
import v2Routes from "./src/routes/v2/index.js";
import internalRoutes from "./src/routes/internal.route.js";
import { initializeAppTimezone } from "./src/bootstrap/timezone.js";

dotenv.config({ quiet: true });
initializeAppTimezone();

const app = express();
const UPLOAD_PATH = process.env.UPLOAD_PATH || "uploads";

app.use(`/${UPLOAD_PATH}`, express.static(path.join(process.cwd(), UPLOAD_PATH)));

app.use(requestId);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.use(compressionMiddleware);
app.use(cookieParser());
app.use(requestLogger);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(i18nMiddleware);
app.use(limiter);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    requestId: req.id,
    timestamp: Date.now(),
  });
});

app.use("/api/v1", v1Routes);
app.use("/api/v2", v2Routes);
app.use("/internal", internalRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Not found", requestId: req.id });
});

app.use(errorHandler);

export default app;
