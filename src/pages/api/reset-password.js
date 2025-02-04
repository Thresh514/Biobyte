import { pool } from "../../lib/db"; // 数据库连接库
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { token, newPassword } = req.body;

    // 检查 token 是否有效
    const query = "SELECT * FROM users WHERE reset_token = ?";
    const [rows] = await pool.query(query, [token]);

    if (!rows.length) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // 更新用户密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateQuery =
      "UPDATE users SET password = ?, reset_token = NULL WHERE reset_token = ?";
    await pool.query(updateQuery, [hashedPassword, token]);

    return res.status(200).json({ message: "Password reset successfully." });
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
