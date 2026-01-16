import { getUserFromRequest } from "../../../lib/auth";
import { pool } from "../../../lib/db";

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
        const { search } = req.query;
        let query = 'SELECT id, email, name, role, created_at FROM users';
        const params = [];

        // 如果提供了搜索参数，添加WHERE子句
        if (search) {
            // 支持按邮箱或ID搜索
            const searchParam = `%${search}%`;
            if (!isNaN(search)) {
                // 如果是数字，按ID搜索
                query += ' WHERE id = $1';
                params.push(parseInt(search));
            } else {
                // 否则按邮箱搜索
                query += ' WHERE email ILIKE $1';
                params.push(searchParam);
            }
        }

        query += ' ORDER BY created_at DESC LIMIT 50';

        const [users] = await pool.query(query, params);

        return res.status(200).json(users);
    } catch (error) {
        console.error("Admin users fetch error:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
}