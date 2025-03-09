import { pool } from "../../lib/db";
import jwt from "jsonwebtoken";
import { sendOrderEmail } from "../api/sendOrderEmail"; // 引入邮件发送函数

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

        // 查询订单详情（确保获取所有需要的变量）
        const query = `
            SELECT 
                sr.title AS product, 
                sr.price AS amount, 
                sr.format AS file_format,
                sr.chapter AS chapter,
                usr.purchase_date AS date
            FROM user_study_resources usr
            JOIN study_resources sr ON usr.study_resource_id = sr.id
            WHERE usr.user_id = ? AND usr.study_resource_id = ?
        `;
        const [orders] = await pool.query(query, [userId, study_resource_id]);

        if (orders.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        const order = orders[0];

        console.log("Resending order email for:", order);

        // **确定 `option` 值**
        let option = "Chapter All"; // 默认是完整章节
        if (order.chapter) {
            option = `Chapter ${order.chapter}`; // 如果数据库里有 `chapter` 字段，就使用具体章节
        }

        // **构造 `cart` 数据**
        const cart = [{
            name: order.product,    // 产品名称
            option: option,         // 章节或完整课程
            quantity: 1,            // 固定数量
            price: order.amount,    // 价格
            format: order.file_format // 文件格式（pdf）
        }];

        console.log("Cart Data:", cart); // **确保数据正确**

        const totalPrice = Number(order.amount);

        // 调用 `sendOrderEmail`
        await sendOrderEmail("Customer", userEmail, cart, totalPrice);

        return res.status(200).json({ message: "Order email resent successfully" });
    } catch (error) {
        console.error("Resend Order Email Error:", error.message, error.stack);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
