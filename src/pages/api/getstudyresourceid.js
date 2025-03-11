import { pool } from "../../lib/db"; 

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { title } = req.query;

    if (!title) {
        return res.status(400).json({ error: "Missing title or chapter parameter" });
    }

    try {
        let cleanedTitle = title.trim();
        console.log("📌 查询数据库的 title:", cleanedTitle);

        // **查询数据库，直接用 title 进行匹配**
        const [rows] = await pool.query(
            "SELECT id FROM study_resources WHERE title = ?", 
            [cleanedTitle]
        );

        console.log("🔍 数据库查询结果：", rows); 


        if (rows.length === 0) {
            console.warn(`⚠️ 未找到匹配的 study_resource_id: ${cleanedTitle}`);
            return res.status(404).json({ error: "No matching study_resource_id found" });
        }

        return res.status(200).json({ id: rows[0].id });

    } catch (error) {
        console.error("❌ 数据库查询出错:", error);
        res.status(500).json({ error: "Server Error" });
    }
}
