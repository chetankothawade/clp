import jwt from "jsonwebtoken";

export function signToken(payload, options = {}) {
  const isAdmin = payload?.role === "admin";
  const key = isAdmin
    ? process.env.JWT_PRIVATE_KEY || process.env.ADMIN_SECRET_KEY
    : process.env.JWT_PRIVATE_KEY || process.env.SECRET_KEY;
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

export function verifyToken2(token, opts = {}) {
  const pubOrPrivate = process.env.JWT_PUBLIC_KEY || process.env.JWT_PRIVATE_KEY;
  const userKey = pubOrPrivate || process.env.SECRET_KEY;
  const adminKey = pubOrPrivate || process.env.ADMIN_SECRET_KEY;
  const verifyOptions = {
    algorithms: [process.env.JWT_ALGORITHM || "HS256"],
    issuer: "auth-service",
    audience: "clp-api",
  };

  // Support both legacy positional string ("admin") and options-object callers.
  let mode = opts;
  if (typeof opts === "string") mode = { admin: opts === "admin" };

  const keys = mode?.admin ? [adminKey, userKey] : [userKey, adminKey];
  for (const key of keys.filter(Boolean)) {
    try {
      return jwt.verify(token, key, verifyOptions);
    } catch {
      // Try the next key; if none match, throw below.
    }
  }
  throw new Error("Invalid or expired token");
}


export default { signToken, verifyToken };





