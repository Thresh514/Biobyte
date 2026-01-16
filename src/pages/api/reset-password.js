import { getUserByResetToken, updateUserPassword, setUserResetToken } from "../../lib/db-helpers";
import bcrypt from "bcryptjs";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { token, newPassword } = req.body;

    // 检查 token 是否有效
    const user = await getUserByResetToken(token);

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // 更新用户密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const success = await updateUserPassword(user.email, hashedPassword);
    
    if (!success) {
      return res.status(500).json({ message: "Failed to update password." });
    }
    
    // 清除重置令牌（通过再次设置）
    await setUserResetToken(user.email, null, null);

    return res.status(200).json({ message: "Password reset successfully." });
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
