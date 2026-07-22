// utils/token.js
import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    throw new Error("Tokens can only be issued by Auth Service");
};

export const verifyToken = (token, role = null) => {
    try {
        return jwt.verify(token, process.env.JWT_PUBLIC_KEY || process.env.SECRET_KEY, { algorithms: [process.env.JWT_ALGORITHM || "HS256"], issuer: "auth-service", audience: "clp-api" });
    } catch (_error) {
        return null;
    }
};
