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
        console.log("Fetching resource with id:", id);
        // 查询数据库
        const [rows] = await pool.query("SELECT * FROM study_resources WHERE LOWER(REPLACE(title, ' ', '-')) = LOWER(?) OR id = ?", [id, id]);

        console.log("Resource lookup result:", rows);

        if (rows.length === 0) {
            return res.status(404).json({ error: "找不到该课程" });
        }

        let options = [];
        if (rows[0].type === "Mindmap") {
            const [chapters] = await pool.query("SELECT title, chapter, file_path, image, price FROM study_resources WHERE type = ? AND level = ? ORDER BY FIELD(id, 46, 47) DESC, id", [rows[0].type, rows[0].level]);
            options = chapters.map((row) => ({
                chapter: row.chapter.startsWith("Chapter") ? row.chapter : `Chapter ${row.chapter}`,
                title: row.title,
                file_path: row.file_path,
                image: row.image,
                price: row.price ? parseFloat(row.price) : 0.00,
            }));
            console.log("Fetched Options:", options); // ✅ Debug 确保 title 正确
        }

        res.status(200).json({
            id: rows[0].id,
            title: rows[0].title,
            description: rows[0].description,
            type: rows[0].type,
            level: rows[0].level,
            file_path: rows[0].file_path || "No file available",
            image: rows[0].image || "/default.jpg",
            price: rows[0].price ? parseFloat(rows[0].price) : 0.00,
            options: options || [],
        });

    } catch (error) {
        console.error("数据库查询出错:", error);
        res.status(500).json({ error: "服务器错误" });
    }
}
