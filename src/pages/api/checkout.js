import { pool } from "../../lib/db"; // 数据库连接
import { sendOrderEmail } from "./sendOrderEmail"; // 发送邮件的函数
import jwt from "jsonwebtoken"; // 解析 JWT

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { name, email:inputEmail, cart, totalPrice, transaction_id, order_id } = req.body;

        if (!cart || cart.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        if (!name || cart.length === 0) {
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

        // 检查是否来自PayPal支付
        const isPayPalPayment = !!transaction_id;
        
        // 如果不是PayPal支付，则进行模拟支付
        let paymentSuccess = true;
        let finalOrderId = order_id; // 最终使用的订单ID
        
        if (!isPayPalPayment) {
            // **模拟支付（90% 成功）**
            paymentSuccess = Math.random() > 0.1;

            if (!paymentSuccess) {
                return res.status(402).json({ message: "Payment failed. Please try again." });
            }
            
            // 如果是模拟支付且没有提供订单ID，则生成一个
            if (!finalOrderId) {
                finalOrderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
                console.log(`✅ 生成模拟支付订单ID: ${finalOrderId}`);
            }
        } else {
            console.log(`✅ PayPal支付已确认 - 交易ID: ${transaction_id}, 订单ID: ${finalOrderId}`);
        }

        // **如果用户已登录，存入 user_study_resources**
        if (userId) {
            console.log("🔄 开始处理购物车:", JSON.stringify(cart, null, 2));
            
            // 设置时区为东八区
            await pool.query("SET time_zone = '+08:00'");
            
            for (const item of cart) {
                try {
                    console.log(`📌 准备存入数据:
                        - userId: ${userId}
                        - studyResourceId: ${item.id}
                        - finalOrderId: ${finalOrderId}
                        - transaction_id: ${transaction_id || "NULL"}
                    `);

                    // 直接在user_study_resources表中更新所有信息
                    const result = await pool.query(
                        "INSERT INTO user_study_resources (user_id, study_resource_id, purchase_date, order_id, status, transaction_id) VALUES (?, ?, NOW(), ?, 'PAID', ?) ON DUPLICATE KEY UPDATE purchase_date = NOW(), order_id = VALUES(order_id), status = 'PAID', transaction_id = VALUES(transaction_id)",
                        [userId, item.id, finalOrderId, transaction_id || null]
                    );
                    console.log(`✅ SQL执行结果:`, JSON.stringify(result, null, 2));

                } catch (error) {
                    console.error(`❌ 记录购买失败:`, error);
                    throw error;
                }
            }
            console.log("✅ 所有购买记录处理完成");
        } else {
            // 未登录用户处理 - 在没有用户的情况下创建一个临时记录
            console.log("🔄 未登录用户，创建临时记录");
            
            try {
                // 查找默认的临时用户ID（可以创建一个固定的访客用户）
                const [guestUserRows] = await pool.query(
                    "SELECT id FROM users WHERE email = 'guest@example.com' LIMIT 1"
                );
                
                let guestUserId;
                if (guestUserRows.length > 0) {
                    guestUserId = guestUserRows[0].id;
                } else {
                    // 如果没有访客用户，则尝试创建一个
                    const [insertResult] = await pool.query(
                        "INSERT INTO users (name, email, created_at) VALUES ('Guest User', 'guest@example.com', NOW()) ON DUPLICATE KEY UPDATE id=id"
                    );
                    guestUserId = insertResult.insertId || 1; // 使用插入ID或默认为1
                }
                
                // 为每个购物车商品创建临时记录
                for (const item of cart) {
                    await pool.query(
                        "INSERT INTO user_study_resources (user_id, study_resource_id, purchase_date, order_id, status, transaction_id) VALUES (?, ?, NOW(), ?, 'PAID', ?) ON DUPLICATE KEY UPDATE purchase_date = NOW(), order_id = VALUES(order_id), status = 'PAID', transaction_id = VALUES(transaction_id)",
                        [guestUserId, item.id, finalOrderId, transaction_id || null]
                    );
                }
                
                console.log(`✅ 已为未登录用户创建临时记录，订单ID: ${finalOrderId}`);
            } catch (error) {
                console.warn("⚠️ 创建临时记录失败，但继续处理:", error.message);
                // 继续处理，不中断流程
            }
        }

        // **发送订单邮件**
        await sendOrderEmail(name, userEmail, cart, totalPrice, finalOrderId);

        return res.status(200).json({ 
            message: "Order processed successfully",
            order_id: finalOrderId
        });

    } catch (error) {
        console.error("Checkout Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
}
