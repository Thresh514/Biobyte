import { getUserFromRequest } from "../../../lib/auth";
import { getUserById, getUserByEmail, createOrUpdateMembership } from "../../../lib/db-helpers";

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
        const { userId, userEmail, membershipType, days } = req.body;

        // 输入验证
        if (!membershipType || !['premium', 'lifetime'].includes(membershipType)) {
            return res.status(400).json({ message: "Invalid membership type. Must be 'premium' or 'lifetime'" });
        }

        if (membershipType === 'premium' && (!days || days <= 0)) {
            return res.status(400).json({ message: "Days must be provided and greater than 0 for premium membership" });
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

        // 创建或更新会员
        const membershipDays = membershipType === 'lifetime' ? null : parseInt(days);
        const membership = await createOrUpdateMembership(user.id, membershipType, membershipDays);

        return res.status(200).json({
            message: `Membership granted successfully`,
            membership: {
                id: membership.id,
                user_id: membership.user_id,
                membership_type: membership.membership_type,
                start_date: membership.start_date,
                expire_date: membership.expire_date,
                status: membership.status
            }
        });
    } catch (error) {
        console.error("Admin grant membership error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}