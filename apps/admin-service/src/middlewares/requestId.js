import { randomUUID } from "crypto";

const requestId = (req, res, next) => {
  const id = req.get("x-request-id") || randomUUID();
  req.id = id;
  res.setHeader("x-request-id", id);
  next();
};

export default requestId;
