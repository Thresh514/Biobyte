import { pool } from "../../lib/db"; // 数据库连接
import { sendOrderEmail } from "./sendOrderEmail"; // 发送邮件的函数
import jwt from "jsonwebtoken"; // 解析 JWT

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { name, email:inputEmail, address, cart, totalPrice } = req.body;

        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        if (!name || !address || cart.length === 0) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        let userEmail = inputEmail; // 默认使用用户输入的 email（未登录）
        let userId = null; // 默认用户 ID 为空（未登录）

        // **解析 JWT Token（检查是否已登录）**
        const token = req.headers.authorization?.split(" ")[1];

        console.log("🔍 Authorization 头:", req.headers.authorization);
        console.log("🔍 解析出的 token:", token);

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET); // ✅ 解析 JWT
                userEmail = decoded.email; // ✅ 使用 JWT 里的 email
                console.log("✅ 解析 JWT 成功，userEmail:", userEmail);
            } catch (error) {
                console.error("❌ JWT 解析失败:", error);
                return res.status(401).json({ message: "Invalid token" });
            }
        }

        // **如果用户已登录，查询 user_id**
        if (token) {
            console.log("🔍 查询用户 ID，userEmail:", userEmail);
            const [rows] = await pool.query("SELECT id FROM users WHERE email = ?", [userEmail]);
            console.log("🔍 查询结果:", rows);
            if (rows.length === 0) {
                console.warn("⚠️ 数据库中未找到该用户:", userEmail);
                return res.status(404).json({ message: "User not found in database" });
            }

            userId = rows[0].id;
            console.log("✅ 查询成功，userId:", userId);
        }


        // **模拟支付（90% 成功）**
        const paymentSuccess = Math.random() > 0.1;

        if (!paymentSuccess) {
            return res.status(402).json({ message: "Payment failed. Please try again." });
        }

        // **如果用户已登录，存入 user_study_resources**
        if (userId) {
            for (const item of cart) {
                console.log(`📌 尝试存入数据库: userId=${userId}, study_resource_id=${item.id}`);

                // **查询 study_resources 表，获取正确的 id**
                const [resource] = await pool.query("SELECT id FROM study_resources WHERE title = ?", [item.name]);

                if (resource.length === 0) {
                    console.warn(`⚠️ 资源未找到: ${item.name}，跳过插入`);
                    continue;
                }
                const studyResourceId = resource[0].id; // ✅ 获取 study_resources.id
                console.log(`✅ 资源匹配成功，study_resource_id: ${studyResourceId}`);

                await pool.query(
                    "INSERT INTO user_study_resources (user_id, study_resource_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE purchase_date = NOW()",
                    [userId, studyResourceId]
                );
            }
            console.log("✅ 数据存入完成！");
        }else{
            console.warn("⚠️ userId 为空，未存入数据库！");
        }


        // **发送订单邮件**
        await sendOrderEmail(name, userEmail, address, cart, totalPrice);

        return res.status(200).json({ message: "Order processed successfully" });

    } catch (error) {
        console.error("Checkout Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}
