import { getUserFromRequest } from "../../../lib/auth";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    // 从cookie或header获取用户信息
    const authUser = getUserFromRequest(req);
    if (!authUser) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    try {
        const userId = authUser.id;

        // 检查是否为管理员（从token中读取role）
        if (authUser.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admin role required." });
        }

        return res.status(200).json({ 
            isAdmin: true,
            user: {
                id: authUser.id,
                email: authUser.email,
                role: authUser.role
            }
        });
    } catch (error) {
        console.error("Admin verify error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}