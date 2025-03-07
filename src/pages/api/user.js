import jwt from "jsonwebtoken";
import { pool } from "../../lib/db";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // 解析 JWT Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);

        // 查询数据库获取用户信息
        const query = "SELECT id, email, role FROM users WHERE id = ?";
        const [rows] = await pool.query(query, [decoded.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(rows[0]);
    } catch (error) {
        console.error("JWT Decode Error:", error);
        return res.status(403).json({ message: "Invalid Token" });
    }
}
