import axios from "axios";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { message } = req.body;

    let systemPrompt = "";
    try {
        const filePath = path.join(process.cwd(), "public/chatbot-response.txt");
        systemPrompt = fs.readFileSync(filePath, "utf-8");
    } catch (error) {
        console.error("Error reading chatbot prompt:", error);
        return res.status(500).json({ message: "Failed to load chatbot prompt" });
    }

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini-2024-07-18", // 使用最便宜的 GPT-4o-mini
                messages: [
                    { role: "system", content:systemPrompt },
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
