import { pool } from "../../lib/db"; // 数据库连接库
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
        return res.status(400).json({ message: "Must fill all field! " });
    }

    try {
        // 1️⃣ 查找用户
        const query = "SELECT id, password_hash FROM users WHERE email = ?";
        const [rows] = await pool.query(query, [email]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "User doesn't exist" });
        }

        const user = rows[0];

        // 2️⃣ 验证旧密码
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "当前密码错误。" });
        }

        // 3️⃣ 加密新密码并更新
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE users SET password_hash = ? WHERE email = ?", [hashedPassword, email]);

        return res.status(200).json({ message: "Password changed successful!" });
    } catch (error) {
        console.error("修改密码错误:", error);
        return res.status(500).json({ message: "服务器内部错误，请稍后重试。" });
    }
}
