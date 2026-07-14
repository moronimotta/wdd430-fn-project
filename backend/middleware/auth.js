const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    const authHeader = req.get("Authorization");

    if (!authHeader) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        return res.status(500).json({ message: "JWT secret is not configured" });
    }

    try {
        req.user = jwt.verify(token, jwtSecret);
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid token", error: error.message });
    }
}

module.exports = authMiddleware;