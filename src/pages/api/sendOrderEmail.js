import nodemailer from "nodemailer";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { name, email, address, cart, totalPrice } = req.body;

    if (!email || !name || !address || !cart.length) {
        return res.status(400).json({ message: "Invalid order data" });
    }

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

        Shipping Address:
        ${address}

        Total Price: $${totalPrice.toFixed(2)}

        We appreciate your support!

        Best regards,
        BioByte Team
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Email send error:", error);
        return res.status(500).json({ message: "Email sending failed" });
    }
}
