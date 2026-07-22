// utils/token.js
import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    return jwt.sign({ sub: user.uuid, role: user.role, permissions: user.permissions || [] }, process.env.JWT_PRIVATE_KEY || process.env.SECRET_KEY, {
        algorithm: process.env.JWT_ALGORITHM || "HS256", expiresIn: process.env.JWT_EXPIRES_IN || "15m", issuer: "auth-service", audience: "clp-api",
    });
};

export const verifyToken = (token, role = null) => {
    try {
        return jwt.verify(token, process.env.JWT_PUBLIC_KEY || process.env.JWT_PRIVATE_KEY || process.env.SECRET_KEY, { algorithms: [process.env.JWT_ALGORITHM || "HS256"], issuer: "auth-service", audience: "clp-api" });
    } catch (_error) {
        return null;
    }
};
