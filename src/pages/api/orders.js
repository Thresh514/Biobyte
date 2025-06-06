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

        // 直接从user_study_resources表查询所有信息，包括订单状态等
        const query = `
            SELECT 
                usr.study_resource_id,
                usr.order_id,
                usr.status,
                usr.transaction_id,
                sr.title,
                sr.price,
                sr.type,
                sr.level,
                sr.chapter,
                usr.purchase_date
            FROM user_study_resources usr
            JOIN study_resources sr ON usr.study_resource_id = sr.id
            WHERE usr.user_id = ?
            ORDER BY usr.purchase_date DESC
        `;
        
        const [orders] = await pool.query(query, [userId]);
        console.log("查询到的订单:", orders);
        return res.status(200).json(orders);
    } catch (error) {
        console.error("Order Fetch Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
