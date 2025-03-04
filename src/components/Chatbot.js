import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MessageSquare, Send } from "lucide-react";
import { SlEnvolope } from "react-icons/sl"; // 邮件图标
import { IoClose } from "react-icons/io5"; // 关闭按钮

export default function Chatbot({ activeComponent, setActiveComponent }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [feedbackOpen, setFeedbackOpen] = useState(false); // 反馈表单的开关状态
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const chatRef = useRef(null);
    const endOfMessagesRef = useRef(null);
    const isOpen = activeComponent === "chatbot"; // 只在 activeComponent === 'chatbot' 时打开
    const formRef = useRef(null); // 用于检测点击区域

    // 监听点击外部关闭聊天框 & 反馈表单
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                chatRef.current && !chatRef.current.contains(event.target) &&
                formRef.current && !formRef.current.contains(event.target)
            ) {
                setActiveComponent(null); // 关闭 Chatbot
                setFeedbackOpen(false); // 关闭反馈框
            }
        }

        if (isOpen || feedbackOpen) {
            window.addEventListener("click", handleClickOutside);
        } else {
            window.removeEventListener("click", handleClickOutside);
        }

        return () => window.removeEventListener("click", handleClickOutside);
    }, [isOpen, feedbackOpen]);

    // 初始化时从 localStorage 读取数据
    useEffect(() => {
        setEmail(localStorage.getItem("feedback_email") || "");
        setMessage(localStorage.getItem("feedback_message") || "");
    }, []);

    // 监听消息更新，自动滚动到底部
    useEffect(() => {
        if (endOfMessagesRef.current) {
            endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // 初始化欢迎消息
    useEffect(() => {
        if (isOpen&&messages.length===0) {
            setMessages([{ role: "assistant", 
                content: "您好！我是 BioByte 客服 AI 🤖，欢迎咨询！我们提供 A-Level 生物学习资料。下单后 10 分钟内通过邮件发送PDF文件哦📩 如果有其他问题可以随时问我哦！😊"
            }]);
        }
    }
    , [isOpen]);

    // 监听键盘事件
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    // 发送聊天消息
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

    // 处理反馈表单输入
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        localStorage.setItem("feedback_email", e.target.value);
    };

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
        localStorage.setItem("feedback_message", e.target.value);
    };

    // 处理反馈提交
    const handleSubmit = (e) => {
        e.preventDefault();

        // 构造 `mailto:` URL
        const mailtoLink = `mailto:biomindbot@gmail.com?subject=Customer Feedback&body=${encodeURIComponent(message)}`;
        window.location.href = mailtoLink;

        // 清空表单并清除 localStorage
        setEmail("");
        setMessage("");
        localStorage.removeItem("feedback_email");
        localStorage.removeItem("feedback_message");

        // 关闭表单
        setFeedbackOpen(false);
    };

    return (
        <div className="flex flex-col items-end">
            {/* 聊天窗口 */}
            {isOpen && (
                <div
                    ref={chatRef}
                    className="bg-white shadow-lg p-4 rounded-lg border border-gray-200 w-[450px] max-w-[92vw] h-[600px] max-h-[65vh] mb-4 flex flex-col overflow-hidden"
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

                    {/* 反馈表单 (放入聊天框内部) */}
                    {feedbackOpen && (
                        <div
                            ref={formRef}
                            className="bg-white p-2.5 rounded-lg w-auto "
                        >
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="text-lg font-semibold">Feedback</h2>
                                <button
                                    onClick={() => setFeedbackOpen(false)}
                                    className="text-gray-500 hover:text-gray-600 transition duration-200"
                                >
                                    <IoClose size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <input
                                    type="email"
                                    name="customer_email"
                                    value={email}
                                    onChange={handleEmailChange}
                                    className="w-full p-2 border rounded-md"
                                    placeholder="Your email address..."
                                    required
                                />
                                <textarea
                                    name="message"
                                    rows="3"
                                    value={message}
                                    onChange={handleMessageChange}
                                    className="w-full p-2 border rounded-md mt-2"
                                    placeholder="Leave your feedback here..."
                                    required
                                ></textarea>
                                <button
                                    type="submit"
                                    className="bg-gray-500 text-white w-full py-2 rounded-md mt-2 hover:bg-gray-600 transition duration-300"
                                >
                                    Send Feedback
                                </button>
                            </form>
                        </div>
                    )}

                    {/* 输入框区域 */}
                    <div className="flex border-t pt-2 flex-shrink-0 bg-white space-x-2 relative">
                        {/* 反馈按钮 (放入聊天框左侧) */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setFeedbackOpen(!feedbackOpen);
                            }}
                            className="bg-gray-100 hover:bg-gray-200 text-black p-3 rounded-lg"
                        >
                            <SlEnvolope className="w-6 h-6" />
                        </button>

                        <input
                            type="text"
                            className="flex-grow p-2 border rounded-md"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter your question..."
                        />
                        <button onClick={sendMessage} className="ml-2 bg-gray-500 hover:bg-gray-600 text-white p-3 rounded-md">
                            <Send className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            {/* 悬浮按钮 */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveComponent(isOpen ? null : "chatbot");
                }}
                className="bg-gray-100/85 text-black p-4 rounded-full shadow-lg hover:scale-110 transition duration-300 ease-out"
            >
                <MessageSquare className="w-6 h-6" />
            </button>
        </div>
    );
}
