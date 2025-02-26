import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MessageSquare, Send } from "lucide-react";
import { IoClose } from "react-icons/io5"; // 关闭按钮

export default function Chatbot({ activeComponent, setActiveComponent }) {  // 这里解构 props
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const chatRef = useRef(null); // 用于检测点击区域
    const endOfMessagesRef = useRef(null); // 用于滚动到最新消息
    const isOpen = activeComponent === "chatbot"; // 只在 activeComponent === 'chatbot' 时打开

    // 监听点击外部关闭聊天框
    useEffect(() => {
        function handleClickOutside(event) {
            if (chatRef.current && !chatRef.current.contains(event.target)) {
                setActiveComponent(null); // 关闭 Chatbot
            }
        }

        if (isOpen) {
            window.addEventListener("click", handleClickOutside);
        } else {
            window.removeEventListener("click", handleClickOutside);
        }

        return () => window.removeEventListener("click", handleClickOutside);
    }, [isOpen]);

    // 欢迎消息
    useEffect(() => {
        if (isOpen&&messages.length===0) {
            setMessages([{ role: "assistant", 
                content: "您好！我是 BioByte 客服 AI 🤖，欢迎咨询！我们提供 A-Level 生物学习资料。下单后 10 分钟内通过邮件发送PDF文件哦📩 如果有其他问题可以随时问我哦！😊"
            }]);
        }
    }
    , [isOpen]);

    useEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }
    , [messages]);

    // 监听键盘事件
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault(); // 防止换行
            sendMessage();
        }
    };

    // 发送消息
    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { role: "user", content: input }];
        setMessages(newMessages);
        setInput("");

        try {
            const response = await axios.post("/api/chat", { message: input });
            setMessages([...newMessages, { role: "assistant", content: response.data.reply }]);
        } catch (error) {
            console.error("Chatbot error:", error);
        }
    };

    return (
        <div className="flex flex-col items-end">
            {/* 聊天窗口 */}
            {isOpen && (
                <div 
                ref={chatRef} 
                className="bg-white shadow-lg p-4 rounded-lg border border-gray-200 w-[350px] max-w-[75vw] h-[610px] max-h-[75vh] mb-4 flex flex-col overflow-hidden"
            >
                {/* 标题栏 & 关闭按钮 */}
                <div className="flex justify-between items-center pb-2">
                    <p className="text font-semibold">24/7 Support - Powered by OpenAI</p>
                    <button
                        onClick={() => setActiveComponent(null)}
                        className="text-gray-500 hover:text-gray-600 transition duration-200"
                    >
                        <IoClose size={20} />
                    </button>
                </div>
            
                {/* 聊天内容区域 (滚动) */}
                <div className="flex-1 overflow-y-auto border-b p-2">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex mb-4 mt-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`p-3 max-w-[75%] break-words rounded-lg shadow ${
                                    msg.role === "user"
                                        ? "bg-gray-500 text-white text-end self-end"
                                        : "bg-gray-100 text-black text-start self-start"
                                }`}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    <div ref={endOfMessagesRef} />
                </div>
            
                {/* 输入框区域 (固定在底部) */}
                <div className="flex border-t pt-2 flex-shrink-0 bg-white">
                    <input
                        type="text"
                        className="flex-grow p-2 border rounded-md"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter your question..."
                    />
                    <button onClick={sendMessage} className="ml-2 bg-gray-400 text-white p-2 rounded-md">
                        <Send className="w-6 h-6" />
                    </button>
                </div>
            </div>
            )}
        

            {/* 悬浮按钮 */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // 防止点击按钮时关闭窗口
                    setActiveComponent(isOpen ? null : "chatbot"); // 只允许打开 Chatbot
                }}
                className="bg-gray-100/85 text-black p-4 rounded-full shadow-lg hover:scale-110 transition duration-300 ease-out"
            >
                <MessageSquare className="w-6 h-6" />
            </button>
        </div>
    );
}
