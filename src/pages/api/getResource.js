import { pool } from "../../lib/db"; // 引入数据库连接池

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "请求方法不被允许" });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: "缺少 id 参数" });
    }

    try {
        // 查询数据库
        const [rows] = await pool.query("SELECT * FROM study_resources WHERE id = ?", [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "找不到该课程" });
        }

        res.status(200).json(rows[0]); // 返回第一条匹配的数据
    } catch (error) {
        console.error("数据库查询出错:", error);
        res.status(500).json({ error: "服务器错误" });
    }
}
