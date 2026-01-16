import jwt from "jsonwebtoken";
import { getUserById } from "../../lib/db-helpers";

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

    // 优先从cookie获取token，如果没有则从Authorization header获取（向后兼容）
    const token = req.cookies?.token || 
                  (req.headers.authorization ? sanitizeInput(req.headers.authorization.split(" ")[1]) : null);
    
    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        // 解析 JWT Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded);

        if (!isValidUserId(decoded.id)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        // 使用 db-helpers 获取用户
        const user = await getUserById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 清理返回数据
        const sanitizedUser = {
            id: user.id,
            email: sanitizeInput(user.email),
            role: sanitizeInput(user.role)
        };

        return res.status(200).json(sanitizedUser);
    } catch (error) {
        console.error("JWT Decode Error:", error);
        return res.status(403).json({ message: "Invalid Token" });
    }
}
