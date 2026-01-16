import { upsertVerificationCode, checkVerificationCodeRateLimit } from "../../lib/db-helpers";
import nodemailer from "nodemailer";
import crypto from "crypto";

const sendVerificationCode = async (req, res) => {
  if (req.method === "POST") {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    try {
      // 检查是否在1分钟内发送过验证码（使用数据库时间比较，避免时区问题）
      const rateLimitCheck = await checkVerificationCodeRateLimit(email, 60);
      
      if (!rateLimitCheck.allowed) {
        console.log('Rate limited:', {
          email,
          remainingSeconds: rateLimitCheck.remainingSeconds
        });
        return res.status(429).json({ 
          message: `请等待 ${rateLimitCheck.remainingSeconds} 秒后再发送验证码。`,
          remainingSeconds: rateLimitCheck.remainingSeconds
        });
      }

      const verificationCode = crypto.randomInt(100000, 999999).toString();
      // 不再在应用层计算过期时间，而是在数据库层计算，避免时区问题
      // 传入null，让数据库使用 NOW() + INTERVAL '10 minutes'
      console.log("Generating verification code:", verificationCode);

      // 存入数据库（此时用户还未注册）
      // 传入null作为expires_at，让数据库计算
      const success = await upsertVerificationCode(email, verificationCode, null);
      if (!success) {
        return res.status(400).json({ message: "Failed to insert verification code." });
      }

      // 发送验证码邮件
      const transporter = nodemailer.createTransport({
        service: "gmail", // 这里可以使用其他邮箱服务
        auth: {
          user: process.env.EMAIL_USER,  // 使用环境变量存储邮箱
          pass: process.env.EMAIL_PASS,  // 使用环境变量存储邮箱密码
        },
    });

      const mailOptions = {
        from: "your-email@gmail.com",
        to: email,
        subject: "Verification Code",
        html: `
        <div style="background-color:#f9f9f9;padding:30px 0;">
            <div style="max-width:600px;margin:auto;background:white;padding:40px;border-radius:8px;font-family:Arial,sans-serif;color:#333;">
                <h2 style="color:#1a1a1a;">
                Here is your verification code
                </h2>
                <div style="color:#555;font-size:16px;">
                  Your verification code is: ${verificationCode}. It will expire in 10 minutes.
                </div>
                <p style="color:#333;font-size:14px;margin-top:20px;">Best regards,<br/>The BioByte Team</p>
                
                <hr style="margin:40px 0;border:none;border-top:1px solid #eee;">
                <p style="font-size:12px;color:#888;text-align:center;">
                    © 2025 BioByte. All rights reserved.<br/>
                    Contact: biomindbot@gmail.com
                </p>
            </div>
        </div>
        `
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({ message: "Verification code sent." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: `Internal Server Error. ${error.message}` });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed." });
  }
};

export default sendVerificationCode;
