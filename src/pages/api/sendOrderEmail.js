import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

export async function sendOrderEmail(name, email, cart, totalPrice) {
    if (!email || !name || !cart.length) {
        return res.status(400).json({ message: "Invalid order data" });
    }

    const uploadsDir = path.join(process.cwd(), "uploads");

    // 创建邮件发送器
    const transporter = nodemailer.createTransport({
        service: "gmail", // 使用 Gmail 作为邮件服务器
        auth: {
            user: process.env.EMAIL_USER, // 你的 Gmail 地址
            pass: process.env.EMAIL_PASS, // 你的 Gmail 应用密码
        },
    });

    // 生成订单详情
    const orderDetails = cart.map(item => 
        `${item.name} (${item.option}) x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join("\n");

    

    // 生成附件
    const attachments = cart.flatMap((item) => {
        if (item.option === "Chapter All") {
            // 直接匹配已经打包好的 ZIP 文件
            const zipFilePath = path.join(uploadsDir, `${item.name} Chapter All.zip`);
    
            if (fs.existsSync(zipFilePath)) {
                console.log(`Found pre-packed ZIP: ${zipFilePath}`);
                return [{ filename: `${item.name} Chapter All.zip`, path: zipFilePath }];
            } else {
                console.error(`ZIP file not found: ${zipFilePath}`);
                return [];
            }
        } else {
            // 发送单个 PDF
            const filePath = path.join(uploadsDir, `${item.name} ${item.option}.pdf`);
            if (fs.existsSync(filePath)) {
                return [{ filename: `${item.name} ${item.option}.pdf`, path: filePath }];
            } else {
                console.error("File not found:", filePath);
                return [];
            }
        }
    });    
    
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
        attachments,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to", email);
    } catch (error) {
        console.error("Email send error:", error);
        throw new Error("Email sending failed");
    }
}
