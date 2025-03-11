import { pool } from "../../lib/db";
import jwt from "jsonwebtoken";
import { sendOrderEmail } from "../api/sendOrderEmail";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // 验证 JWT 并获取用户信息
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const userEmail = decoded.email;

        const { study_resource_id } = req.body;
        if (!study_resource_id) {
            return res.status(400).json({ message: "Missing study_resource_id" });
        }

        console.log(`🔄 准备重发邮件:
            - userId: ${userId}
            - userEmail: ${userEmail}
            - study_resource_id: ${study_resource_id}
        `);

        // 查询资源详情
        const query = `
            SELECT 
                sr.*,
                usr.purchase_date
            FROM user_study_resources usr
            JOIN study_resources sr ON usr.study_resource_id = sr.id
            WHERE usr.user_id = ? AND usr.study_resource_id = ?
        `;
        
        const [resources] = await pool.query(query, [userId, study_resource_id]);
        console.log("📝 查询结果:", JSON.stringify(resources, null, 2));

        if (resources.length === 0) {
            return res.status(404).json({ message: "Resource not found" });
        }

        const resource = resources[0];

        // 构造购物车数据
        const cart = [{
            id: study_resource_id,
            name: resource.title,
            option: resource.chapter === 'All' ? 'Chapter All' : `Chapter ${resource.chapter}`,
            price: parseFloat(resource.price),
            image: resource.image || "/default.jpg",
            file_path: resource.file_path
        }];

        console.log("📦 构造的购物车数据:", JSON.stringify(cart, null, 2));

        // 调用 sendOrderEmail 重发邮件
        await sendOrderEmail("Customer", userEmail, cart, parseFloat(resource.price));
        console.log("✅ 邮件重发成功");

        return res.status(200).json({ message: "Order email resent successfully" });
    } catch (error) {
        console.error("❌ 重发邮件失败:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
