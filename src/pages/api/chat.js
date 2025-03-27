import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
    baseURL: "https://api.deepseek.com",  // 使用 DeepSeek 的 API 地址
    apiKey: process.env.DEEPSEEK_API_KEY,  // 你的 DeepSeek API key
    defaultHeaders: { 
        "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        "Content-Type": "application/json" 
    }
    });

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { message, user, orderHistory } = req.body;

    
    let systemPrompt = "";
    try {
        const filePath = path.join(process.cwd(), "public/chatbot-response.txt");
        systemPrompt = fs.readFileSync(filePath, "utf-8");

        // 如果用户已登录，添加用户相关信息到系统提示
        if (user) {
            const userContext = `
                Current User Information:
                - Name: ${user.name}
                - Email: ${user.email}
                - User ID: ${user.id}

                Order History:
                ${orderHistory.map(order => `- Order ID: ${order.id}, Date: ${order.date}, Products: ${order.products.join(", ")}`).join("\n")}

                Please use this information to provide personalized responses. When discussing orders or materials, refer to the user's specific purchases and history.
                `;
            systemPrompt = systemPrompt + "\n\n" + userContext;
        }
    } catch (error) {
        console.error("Error reading chatbot prompt:", error);
        return res.status(500).json({ message: "Failed to load chatbot prompt" });
    }
    

    try {
        const response = await openai.chat.completions.create({
            model: "deepseek-chat", // 使用 DeepSeek 的聊天模型
            messages: [
                { role: "system", content: systemPrompt},
                { role: "user", content: message },
            ],
        });

        // 检查并提取消息内容
        if (response.choices && response.choices[0] && response.choices[0].message) {
            const messageContent = response.choices[0].message.content;
            res.status(200).json({ message: messageContent });  // 返回给前端
        } else {
            console.error("Unexpected response structure:", response);
            res.status(500).json({ message: "Unexpected API response structure" });
        }
    } catch (error) {
        console.error("AI Chatbot Error:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: "Error connecting to OpenAI", error });
    }
}
