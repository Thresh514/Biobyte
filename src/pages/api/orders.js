import { pool } from "../../lib/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
}

const authHeader = req.headers.authorization;
if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
}

const token = authHeader.split(" ")[1];

try {
    // 验证 JWT 令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // 查询用户的订单（购买的学习资源）
    const query = `
        SELECT 
            usr.study_resource_id, 
            sr.title AS product,  
            sr.price AS amount,
            usr.purchase_date AS date
        FROM user_study_resources usr
        JOIN study_resources sr ON usr.study_resource_id = sr.id  
        WHERE usr.user_id = ?
        ORDER BY usr.purchase_date DESC;
    `;
    const [orders] = await pool.query(query, [userId]);
    return res.status(200).json(orders);
    } catch (error) {
    console.error("Order Fetch Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
    }
}
