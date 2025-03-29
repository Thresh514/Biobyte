import crypto from "crypto";

const WX_API_KEY = process.env.WX_API_KEY; // API v3 密钥

// **解密微信支付回调数据**
const decryptWeChatData = (associatedData, nonce, ciphertext) => {
    try {
        const key = Buffer.from(WX_API_KEY, "utf-8");
        const authTag = Buffer.from(ciphertext, "base64").slice(-16);
        const data = Buffer.from(ciphertext, "base64").slice(0, -16);

        const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(nonce, "base64"));
        decipher.setAuthTag(authTag);
        decipher.setAAD(Buffer.from(associatedData, "utf-8"));

        const decryptedText = decipher.update(data, "base64", "utf-8") + decipher.final("utf-8");
        return JSON.parse(decryptedText);
    } catch (error) {
        console.error("解密失败:", error);
        throw new Error("支付回调解密失败");
    }
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "请求方法不允许" });
    }

    try {
        const body = req.body;

        if (!body.resource) {
            return res.status(400).json({ error: "缺少 resource 数据" });
        }

        console.log("收到微信支付回调:", JSON.stringify(body, null, 2));

        // **解密支付数据**
        const decryptedData = decryptWeChatData(
            body.resource.associated_data,
            body.resource.nonce,
            body.resource.ciphertext
        );

        console.log("解密后的微信支付数据:", decryptedData);

        if (body.event_type === "TRANSACTION.SUCCESS") {
            const orderId = decryptedData.out_trade_no; // 订单号
            const transactionId = decryptedData.transaction_id; // 微信支付订单号

            console.log(`订单 ${orderId} 支付成功，交易号: ${transactionId}`);

            // ✅ **这里删除 `updateOrderStatus()`，暂时不更新数据库**
            res.status(200).json({ message: "支付成功" });
        } else {
            res.status(400).json({ error: "支付未成功" });
        }
    } catch (error) {
        console.error("支付回调处理失败:", error);
        res.status(500).json({ error: "服务器处理失败" });
    }
}
