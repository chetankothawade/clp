import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 10000),
  standardHeaders: true,
  legacyHeaders: false,
});

export default limiter;
