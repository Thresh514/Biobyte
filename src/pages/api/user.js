import jwt from "jsonwebtoken";
import { pool } from "../../lib/db";

// 输入验证工具函数
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    return input.replace(/[<>()'"\\]/g, ''); // 移除潜在的危险字符
};

// 验证用户ID格式
const isValidUserId = (id) => {
    return typeof id === 'number' && Number.isInteger(id) && id > 0;
};

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = sanitizeInput(authHeader.split(" ")[1]);

    try {
        // 解析 JWT Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);

        if (!isValidUserId(decoded.id)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        // 使用参数化查询
        const query = "SELECT id, email, role FROM users WHERE id = ?";
        const [rows] = await pool.query(query, [decoded.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // 清理返回数据
        const sanitizedUser = {
            id: rows[0].id,
            email: sanitizeInput(rows[0].email),
            role: sanitizeInput(rows[0].role)
        };

        return res.status(200).json(sanitizedUser);
    } catch (error) {
        console.error("JWT Decode Error:", error);
        return res.status(403).json({ message: "Invalid Token" });
    }
}
