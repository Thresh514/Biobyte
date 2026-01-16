import { getUserPurchaseRecords } from "../../lib/db-helpers";
import jwt from "jsonwebtoken";
import { sendOrderEmail } from "./sendOrderEmail";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    try {
        const { study_resource_id } = req.body;

        if (!study_resource_id) {
            return res.status(400).json({ message: "Study resource ID is required" });
        }

        // 获取用户邮箱
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let userEmail;
        let userId;

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            userEmail = decoded.email;
            userId = decoded.id;
        } catch (error) {
            console.error("JWT验证失败:", error);
            return res.status(401).json({ message: "Invalid token" });
        }

        // 查询用户的资源购买记录
        const purchaseRecords = await getUserPurchaseRecords(userId, study_resource_id);

        if (purchaseRecords.length === 0) {
            return res.status(404).json({ message: "Resource purchase record not found" });
        }

        const resource = purchaseRecords[0];
        // 移除对order_id的引用

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

        // 调用 sendOrderEmail 重发邮件，不传递订单ID
        await sendOrderEmail("Customer", userEmail, cart, parseFloat(resource.price));
        console.log("✅ 邮件重发成功");

        return res.status(200).json({ message: "Order email resent successfully" });
    } catch (error) {
        console.error("❌ 重发邮件失败:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}
