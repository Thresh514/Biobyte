import axios from "axios";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { message } = req.body;

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini-2024-07-18", // 使用最便宜的 GPT-4o-mini
                messages: [
                    { role: "system", content: `
                        你是一个智能 AI 客服，专门为 BioByte 提供咨询服务。
                        - 我们提供 IGCSE 和 A-Level 学习资料，包括：思维导图、教材解析。
                        - 会员制：每月 $9.99 可访问所有资料，或者可以单独购买某个资源。
                        - 支持 PayPal 和信用卡支付，下单后 10 分钟内邮件发送下载链接。
                        - 退款政策：仅限未下载的订单可申请退款。
                        - 你需要回答用户的问题，并且用休闲简洁友好的语气回复。
                    `},
                    { role: "user", content: message }
                ],
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.status(200).json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        console.error("AI Chatbot Error:", error);
        res.status(500).json({ message: "Error connecting to OpenAI", error });
    }
}
