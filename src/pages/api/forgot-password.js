import { pool } from "../../lib/db"; // 连接数据库
import nodemailer from "nodemailer";
import crypto from "crypto"; // 用于生成随机令牌

// 创建一个邮件传输器（发送邮件的工具）
const transporter = nodemailer.createTransport({
    service: "gmail", // 这里可以使用其他邮箱服务
    auth: {
      user: process.env.EMAIL_USER,  // 使用环境变量存储邮箱
      pass: process.env.EMAIL_PASS,  // 使用环境变量存储邮箱密码
    },
});

const forgotPassword = async (req, res) => {
  if (req.method === "POST") {
    const { email } = req.body;

    try {
      // 查找邮箱是否存在
      const query = "SELECT * FROM users WHERE email = ?";
      const [user] = await pool.query(query, [email]);

      if (!user.length) {
        return res.status(404).json({ message: "Email not found." });
      }

      // 生成一个随机的重置令牌
      const token = crypto.randomBytes(20).toString("hex");

      // 设置令牌过期时间（例如 1 小时）
      const tokenExpiration = Date.now() + 3600000; // 当前时间加 1 小时

      // 更新数据库，存储这个令牌和过期时间
      const updateQuery = "UPDATE users SET reset_token = ?, reset_token_expiration = ? WHERE email = ?";
      await pool.query(updateQuery, [token, tokenExpiration, email]);

      // 发送重置链接到用户邮箱
      const mailOptions = {
        from: process.env.EMAIL_USER, // 使用环境变量
        to: email,
        subject: "Password Reset",
        text: `Click the following link to reset your password: http://localhost:3000/reset-password?token=${token}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ message: "Error sending email." });
        } else {
          console.log("Email sent: " + info.response);
          return res.status(200).json({
            message: "A reset link has been sent to your email.",
          });
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
};

export default forgotPassword;
