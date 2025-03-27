import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { pool } from "../../lib/db"; // 添加数据库连接

export async function sendOrderEmail(name, email, cart, totalPrice) {
    if (!email || !name || !cart.length) {
        throw new Error("Invalid order data");
    }

    const uploadsDir = path.join(process.cwd(), "uploads");

    // 创建邮件发送器
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // 生成订单详情
    const orderDetails = cart.map(item => 
        `${item.name} (${item.option}) - $${item.price.toFixed(2)}`
    ).join("\n");

    // 从数据库获取文件路径并生成附件
    console.log("📦 开始处理购物车商品:", cart);

    const attachments = await Promise.all(cart.map(async (item) => {
        try {
            console.log("🔍 处理订单项:", JSON.stringify(item, null, 2));
            
            // 直接通过 id 查询文件路径
            console.log("📝 查询数据库 id:", item.id);
            const [rows] = await pool.query(
                "SELECT id, file_path, title FROM study_resources WHERE id = ?",
                [item.id]
            );
            console.log("📝 数据库查询结果:", JSON.stringify(rows, null, 2));

            if (rows.length === 0 || !rows[0].file_path) {
                console.error(`❌ 未找到资源文件路径: id=${item.id}`);
                return null;
            }

            // 获取文件名（移除所有的 uploads/ 前缀）
            const fileName = rows[0].file_path.replace(/^.*[\/]/, '');
            const filePath = path.join(uploadsDir, fileName);
            
            console.log("📂 上传目录:", uploadsDir);
            console.log("📂 文件名:", fileName);
            console.log("📂 完整文件路径:", filePath);
            
            if (fs.existsSync(filePath)) {
                console.log(`✅ 找到文件: ${filePath}`);
                const attachment = {
                    filename: path.basename(filePath),
                    path: filePath
                };
                console.log("📎 生成的附件对象:", attachment);
                return attachment;
            } else {
                console.error(`❌ 文件不存在: ${filePath}`);
                // 列出 uploads 目录内容
                console.log("📁 uploads 目录内容:", fs.readdirSync(uploadsDir));
                return null;
            }
        } catch (error) {
            console.error(`❌ 处理附件时出错:`, error);
            return null;
        }
    }));

    // 过滤掉空值
    const validAttachments = attachments.filter(attachment => attachment !== null);
    console.log("📎 最终的附件列表:", JSON.stringify(validAttachments, null, 2));
    
    // 邮件内容
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your Order Confirmation",
        text: `
        Dear ${name},

        Thank you for your order!

        Order Details:
        ${orderDetails}

        Total Price: $${totalPrice.toFixed(2)}

        We appreciate your support!

        Best regards,
        BioByte Team
        `,
        html: `
        <div style="background-color:#f9f9f9;padding:30px 0;">
            <div style="max-width:600px;margin:auto;background:white;padding:40px;border-radius:8px;font-family:Arial,sans-serif;color:#333;">
                <h2 style="color:#1a1a1a;">🎉 Your A-Level Biology resource is ready!</h2>
                <p style="color:#333;font-size:16px;">Dear ${name},</p>
                <p style="color:#333;font-size:16px;">Thank you for your purchase! Here are your order details:</p>
                
                <div style="background:#f8f9fa;border-radius:8px;padding:20px;margin:20px 0;">
                    <h3 style="color:#1a1a1a;margin-bottom:15px;">Order Summary:</h3>
                    <div style="color:#555;font-size:14px;">
                        ${cart.map(item => `
                            <table width="100%" style="margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid #eee;">
                                <tr>
                                    <td style="font-weight: bold;">${item.name} (${item.option})</td>
                                    <td align="right" style="color:#666;">$${item.price.toFixed(2)}</td>
                                </tr>
                            </table>
                        `).join('')}
                        <div style="text-align: right;margin-top:15px;font-weight:bold;font-size:16px;">
                            Total: $${totalPrice.toFixed(2)}
                        </div>
                    </div>
                </div>

                <p style="color:#333;font-size:16px;">Your resources are attached to this email. If you have any questions, feel free to reply to this email.</p>
                <p style="color:#333;font-size:16px;margin-top:20px;">Best regards,<br/>The BioByte Team</p>
                
                <hr style="margin:40px 0;border:none;border-top:1px solid #eee;">
                <p style="font-size:12px;color:#888;text-align:center;">
                    © 2025 BioByte. All rights reserved.<br/>
                    Contact: biomindbot@gmail.com
                </p>
            </div>
        </div>
        `,
        attachments: validAttachments
    };

    console.log("📧 准备发送邮件，完整选项:", JSON.stringify(mailOptions, null, 2));

    try {
        await transporter.sendMail(mailOptions);
        console.log("✅ 邮件发送成功，发送至:", email);
    } catch (error) {
        console.error("❌ 邮件发送失败:", error);
        throw new Error("Email sending failed");
    }
}
