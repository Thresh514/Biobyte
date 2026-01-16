import { getUserFromRequest } from "../../../lib/auth";
import { getAllResources } from "../../../lib/db-helpers";

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    // 从cookie或header获取用户信息
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin role required." });
    }

    try {
        const resources = await getAllResources();
        return res.status(200).json(resources);
    } catch (error) {
        console.error("Admin resources fetch error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}