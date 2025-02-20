import mysql from 'mysql2/promise';

// 创建连接池，配置数据库连接信息
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
      return res.status(400).json({ error: "缺少 id 参数" });
  }

  try {
      const [rows] = await pool.query("SELECT * FROM courses WHERE id = ?", [id]);

      if (rows.length === 0) {
          return res.status(404).json({ error: "找不到该课程" });
      }

      res.status(200).json(rows[0]);
  } catch (error) {
      console.error("数据库查询出错:", error);
      res.status(500).json({ error: "服务器错误" });
  }
}