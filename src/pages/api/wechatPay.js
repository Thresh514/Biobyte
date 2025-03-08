import axios from "axios";
import fs from "fs";
import crypto from "crypto";
import path from "path";

// 读取环境变量
const WX_MCHID = process.env.WX_MCHID;
const WX_NOTIFY_URL = process.env.WX_NOTIFY_URL;
const WX_PAY_URL = process.env.WX_PAY_URL;
const WX_SERIAL_NO = process.env.WX_SERIAL_NO;

// 读取 API 证书
const privateKeyPath = path.resolve(process.env.WX_PRIVATE_KEY_PATH);
const privateKey = fs.readFileSync(privateKeyPath, "utf8");

// 生成 API v3 签名
const generateSignature = (method, url, body) => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonceStr = crypto.randomBytes(16).toString("hex");
    const message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`;

    const sign = crypto.createSign("RSA-SHA256");
    sign.update(message);
    sign.end();
    const signature = sign.sign(privateKey, "base64");

    return { timestamp, nonceStr, signature };
};

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "请求方法不被允许" });
    }

    try {
        const { orderId, totalFee, description } = req.body;

        // 订单信息
        const requestData = {
            mchid: WX_MCHID,
            description,
            out_trade_no: orderId,
            notify_url: WX_NOTIFY_URL,
            amount: {
                total: totalFee,
                currency: "CNY",
            },
        };

        // 生成签名
        const { timestamp, nonceStr, signature } = generateSignature(
            "POST",
            "/v3/pay/transactions/native",
            JSON.stringify(requestData)
        );

        // **修正 Authorization 头**
        const authorization = `WECHATPAY2-SHA256-RSA2048 mchid="${WX_MCHID}",serial_no="${WX_SERIAL_NO}",nonce_str="${nonceStr}",timestamp="${timestamp}",signature="${signature}"`;

        // 发送请求到微信支付 API
        const response = await axios.post(WX_PAY_URL, requestData, {
            headers: {
                "Content-Type": "application/json",
                "Wechatpay-Serial": WX_SERIAL_NO,
                "Authorization": authorization, // API 签名修正
            },
        });

        res.status(200).json(response.data);
    } catch (error) {
        console.error("微信支付请求失败:", error);
        res.status(500).json({ error: "支付请求失败", details: error.response?.data });
    }
}
