import { 
  getUserByEmail, 
  createOrder, 
  createOrderItem, 
  updateOrderToPaid 
} from "../../lib/db-helpers";
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

        // **解析 JWT Token（检查是否已登录）- 从cookie或header获取**
        const { getUserFromRequest } = await import("../../lib/auth");
        const user = getUserFromRequest(req);

        if (user) {
            userEmail = user.email; // ✅ 使用token里的email
            console.log("✅ 解析 JWT 成功，userEmail:", userEmail);
        }

        // **如果用户已登录，查询 user_id**
        if (token) {
            console.log("🔍 查询用户 ID，userEmail:", userEmail);
            const user = await getUserByEmail(userEmail);
            if (!user) {
                console.warn("⚠️ 数据库中未找到该用户:", userEmail);
                return res.status(404).json({ message: "User not found in database" });
            }

            userId = user.id;
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

        // **创建订单和订单明细**
        console.log("🔄 开始处理购物车:", JSON.stringify(cart, null, 2));
        
        // 创建订单
        const order = await createOrder({
            order_id: finalOrderId,
            user_id: userId,
            user_email: userEmail,
            user_name: name,
            total_price: totalPrice,
            payment_method: isPayPalPayment ? 'paypal' : 'free'
        });
        console.log("✅ 订单创建成功:", order.id);

        // 创建订单明细
        for (const item of cart) {
            try {
                console.log(`📌 准备存入订单明细:
                    - order_id: ${finalOrderId}
                    - studyResourceId: ${item.id}
                    - price: ${item.price}
                `);

                await createOrderItem({
                    order_id: finalOrderId,
                    study_resource_id: item.id,
                    quantity: 1,
                    unit_price: item.price,
                    total_price: item.price
                });
                console.log(`✅ 订单明细创建成功: resource_id=${item.id}`);
            } catch (error) {
                console.error(`❌ 创建订单明细失败:`, error);
                throw error;
            }
        }

        // 如果支付成功，更新订单状态
        if (paymentSuccess && transaction_id) {
            await updateOrderToPaid(finalOrderId, transaction_id);
            console.log("✅ 订单状态已更新为已支付");
        }

        console.log("✅ 所有订单记录处理完成");

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
