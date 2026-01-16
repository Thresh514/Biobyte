import { getUserOrders } from "../../lib/db-helpers";
import { getUserFromRequest } from "../../lib/auth";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    // 从cookie或header获取用户信息
    const user = getUserFromRequest(req);
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const userId = user.id;

        // 使用 db-helpers 获取订单
        const orders = await getUserOrders(userId);
        console.log("查询到的订单:", orders);
        return res.status(200).json(orders);
    } catch (error) {
        console.error("Order Fetch Error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
