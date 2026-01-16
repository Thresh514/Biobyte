import { getUserByEmail, setUserResetToken } from "../../lib/db-helpers";
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
      console.log("Checking if email exists:", email);
      const user = await getUserByEmail(email);

      if (!user) {
        return res.status(404).json({ message: "Email not found." });
      }

      // 生成一个随机的重置令牌
      const token = crypto.randomBytes(20).toString("hex");

      console.log(`Generated token: ${token}`);

      // 更新数据库，存储这个令牌和过期时间
      // 传入 null 让数据库使用 NOW() + 1小时来计算过期时间，确保时区一致
      await setUserResetToken(email, token, null);

      // 根据环境变量确定基础URL
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                      process.env.VERCEL_URL || 
                      (process.env.NODE_ENV === 'production' 
                        ? 'https://biobyte.shop' 
                        : 'http://localhost:3000');
      
      // 构建重置链接
      const resetLink = `${baseUrl}/reset-password?token=${token}`;
      
      console.log(`Generated reset link: ${resetLink}`);

      // 发送重置链接到用户邮箱
      const mailOptions = {
        from: process.env.EMAIL_USER, // 使用环境变量
        to: email,
        subject: "Password Reset",
        html: `
        <div style="background-color:#ffffff;padding:30px 0;">
            <div style="max-width:600px;margin:auto;background:white;padding:40px;border-radius:8px;font-family:Arial,sans-serif;color:#333;">
                <h2 style="color:#1a1a1a;">Password Reset</h2>
                <p style="color:#333;font-size:16px;">Click the following link to reset your password:</p>
                <div style="text-align:center;margin:30px 0;">
                    <a href="${resetLink}" style="background-color:#000000;color:#ffffff;padding:12px 30px;text-decoration:none;border-radius:2px;font-size:16px;display:inline-block;font-weight:normal;letter-spacing:1px;">Reset Password</a>
                </div>
                <p style="color:#666;font-size:14px;margin-top:20px;">If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
                <p style="word-break:break-all;color:#0066cc;font-size:14px;">${resetLink}</p>
                <p style="color:#333;font-size:14px;margin-top:20px;">Best regards,<br/>The BioByte Team</p>
            </div>
        </div>
        
        <hr style="margin:40px 0;border:none;border-top:1px solid #eee;">
        <p style="font-size:12px;color:#888;text-align:center;">
            © 2025 BioByte. All rights reserved.<br/>
            Contact: <a href="mailto:biomindbot@gmail.com" style="color:#888;text-decoration:underline;">biomindbot@gmail.com</a>
        </p>
        `
        
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
