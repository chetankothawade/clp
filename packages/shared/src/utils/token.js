import jwt from "jsonwebtoken";

export function signToken(payload, options = {}) {
  const key = process.env.JWT_PRIVATE_KEY || process.env.SECRET_KEY;
  const opts = {
    algorithm: process.env.JWT_ALGORITHM || "HS256",
    issuer: "auth-service",
    audience: "clp-api",
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    ...options,
  };
  return jwt.sign(payload, key, opts);
}

export function verifyToken(token) {
  const key = process.env.JWT_PUBLIC_KEY || process.env.JWT_PRIVATE_KEY || process.env.SECRET_KEY;
  return jwt.verify(token, key, { algorithms: [process.env.JWT_ALGORITHM || "HS256"], issuer: "auth-service", audience: "clp-api" });
}

export default { signToken, verifyToken };
