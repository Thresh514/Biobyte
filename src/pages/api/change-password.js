import { getUserByEmail, updateUserPassword } from "../../lib/db-helpers";
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
        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: "User doesn't exist" });
        }

        // 2️⃣ 验证旧密码
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "当前密码错误。" });
        }

        // 3️⃣ 加密新密码并更新
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const success = await updateUserPassword(email, hashedPassword);
        
        if (!success) {
            return res.status(500).json({ message: "Failed to update password." });
        }

        return res.status(200).json({ message: "Password changed successful!" });
    } catch (error) {
        console.error("修改密码错误:", error);
        return res.status(500).json({ message: "服务器内部错误，请稍后重试。" });
    }
}
