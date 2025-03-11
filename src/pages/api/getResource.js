import { pool } from "../../lib/db"; // 引入数据库连接池

// 定义 slug 到实际标题的映射
const slugToTitle = {
    'as-mindmap': 'AS Mindmap',  // 修改为可能的实际标题
    'a2-mindmap': 'A2 Mindmap',
    'as-syllabus-analysis': 'AS Syllabus Analysis',
    'a2-syllabus-analysis': 'A2 Syllabus Analysis'
};

export default async function handler(req, res) {
    if (req.method !== "GET") {
        return res.status(405).json({ error: "请求方法不被允许" });
    }

    try {
        // 首先获取并显示所有记录，用于调试
        const [allRecords] = await pool.query(
            "SELECT id, title, type, level FROM study_resources"
        );
        console.log("📚 数据库中的所有记录:", JSON.stringify(allRecords, null, 2));

        const { title: slug } = req.query;
        console.log("📌 收到的原始 slug 参数:", slug);

        // 输入验证
        if (!slug || typeof slug !== 'string') {
            console.log("❌ slug 参数无效:", slug);
            return res.status(400).json({ 
                error: "缺少有效的 slug 参数",
                availableRecords: allRecords
            });
        }

        // 根据 slug 确定要查询的类型和级别
        let resourceType, level, chapter;
        
        // 处理具体章节的情况
        if (slug.includes('Mindmap Chapter')) {
            const match = slug.match(/^(AS|A2) Mindmap Chapter (\d+|All)$/);
            if (match) {
                resourceType = 'Mindmap';
                level = match[1];
                chapter = match[2];
            }
        }
        // 处理主页面的情况
        else if (slug === 'as-mindmap') {
            resourceType = 'Mindmap';
            level = 'AS';
        } else if (slug === 'a2-mindmap') {
            resourceType = 'Mindmap';
            level = 'A2';
        } else if (slug === 'as-syllabus-analysis') {
            resourceType = 'Syllabus Analysis';
            level = 'AS';
        } else if (slug === 'a2-syllabus-analysis') {
            resourceType = 'Syllabus Analysis';
            level = 'A2';
        } else {
            // 尝试直接查找完整标题
            const [directMatch] = await pool.query(
                "SELECT * FROM study_resources WHERE title = ?",
                [slug]
            );

            if (directMatch.length > 0) {
                resourceType = directMatch[0].type;
                level = directMatch[0].level;
                chapter = directMatch[0].chapter;
            } else {
                console.log("❌ 无效的 slug:", slug);
                return res.status(404).json({ 
                    error: "无效的资源类型",
                    searchedSlug: slug,
                    availableRecords: allRecords
                });
            }
        }

        console.log("🔍 查询参数:", { type: resourceType, level, chapter });
        
        // 查找主记录
        let query, params;
        if (chapter) {
            if (chapter === 'All') {
                query = `SELECT * FROM study_resources WHERE type = ? AND level = ? AND chapter = 'All'`;
                params = [resourceType, level];
            } else {
                query = `SELECT * FROM study_resources WHERE type = ? AND level = ? AND chapter = ?`;
                params = [resourceType, level, chapter];
            }
        } else {
            query = `SELECT * FROM study_resources WHERE type = ? AND level = ? AND chapter = 'All'`;
            params = [resourceType, level];
        }

        const [rows] = await pool.query(query, params);

        console.log("✅ 查询结果行数:", rows.length);
        if (rows.length > 0) {
            console.log("📊 查询结果:", JSON.stringify(rows.map(row => ({
                id: row.id,
                title: row.title,
                type: row.type,
                level: row.level,
                chapter: row.chapter
            })), null, 2));
        }

        if (rows.length === 0) {
            console.log("❌ 未找到匹配的课程");
            return res.status(404).json({ 
                error: "找不到该课程",
                searchParams: { type: resourceType, level, chapter },
                availableRecords: allRecords
            });
        }

        let options = [];

        if (resourceType === "Mindmap") {
            console.log("📍 处理 Mindmap 类型资源");
            // 获取所有相关章节
            const [chapters] = await pool.query(
                `SELECT * FROM study_resources 
                 WHERE type = ? AND level = ?
                 ORDER BY CASE 
                    WHEN chapter = 'All' THEN 0 
                    ELSE CAST(REGEXP_REPLACE(chapter, '[^0-9]', '') AS UNSIGNED) 
                 END`,
                [resourceType, level]
            );
            
            console.log("📚 找到相关章节:", JSON.stringify(chapters.map(row => ({
                title: row.title,
                chapter: row.chapter,
                type: row.type,
                level: row.level
            })), null, 2));
            
            options = chapters.map((row) => ({
                chapter: row.chapter === 'All' ? 'Chapter All' : `Chapter ${row.chapter}`,
                title: row.title,
                file_path: row.file_path || "",
                description: row.description || "",
                image: row.image || "/default.jpg",
                price: row.price ? parseFloat(row.price) : 0.00,
            }));
        }

        // 确保数值类型的正确处理
        const response = {
            id: parseInt(rows[0].id, 10),
            title: rows[0].title,
            description: rows[0].description || "",
            type: rows[0].type,
            level: rows[0].level,
            file_path: rows[0].file_path || "No file available",
            image: rows[0].image || "/default.jpg",
            price: rows[0].price ? parseFloat(rows[0].price) : 0.00,
            options: options,
        };

        console.log("✅ 成功构建响应:", JSON.stringify(response, null, 2));
        res.status(200).json(response);

    } catch (error) {
        console.error("❌ 数据库查询错误:", error);
        res.status(500).json({ 
            error: "服务器错误",
            message: error.message,
            stack: error.stack
        });
    }
}
