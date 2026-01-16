import { getUserFromRequest } from "../../../lib/auth";
import { getUserById, getUserByEmail, grantResourceToUser, getResource } from "../../../lib/db-helpers";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    // 从cookie或header获取用户信息
    const adminUser = getUserFromRequest(req);
    if (!adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    try {
        const { userId, userEmail, resourceId } = req.body;

        // 输入验证
        if (!resourceId) {
            return res.status(400).json({ message: "Resource ID is required" });
        }

        // 验证资源是否存在
        const resource = await getResource(resourceId);
        if (!resource) {
            return res.status(404).json({ message: "Resource not found" });
        }

        // 获取用户信息
        let user = null;
        if (userId) {
            user = await getUserById(userId);
        } else if (userEmail) {
            user = await getUserByEmail(userEmail);
        } else {
            return res.status(400).json({ message: "Either userId or userEmail must be provided" });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 赠送资源
        const order = await grantResourceToUser(
            user.id,
            resourceId,
            user.email,
            user.name || user.email
        );

        return res.status(200).json({
            message: `Resource granted successfully`,
            order: {
                order_id: order.order_id,
                user_id: order.user_id,
                user_email: order.user_email,
                status: order.status,
                payment_method: order.payment_method
            },
            resource: {
                id: resource.id,
                title: resource.title
            }
        });
    } catch (error) {
        console.error("Admin grant resource error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}