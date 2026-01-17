import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { MessageSquare, Send } from "lucide-react";
import { SlEnvolope } from "react-icons/sl"; // 邮件图标
import { IoClose } from "react-icons/io5"; // 关闭按钮
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';

// XSS防护：清理用户输入
const sanitizeInput = (input) => {
    if (typeof input !== 'string') return '';
    return DOMPurify.sanitize(input.trim(), {
        ALLOWED_TAGS: [], // 不允许任何HTML标签
        ALLOWED_ATTR: [] // 不允许任何HTML属性
    });
};

export default function Chatbot({ activeComponent, setActiveComponent, user, orderHistory }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [feedbackOpen, setFeedbackOpen] = useState(false); // 反馈表单的开关状态
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const endOfMessagesRef = useRef(null);
    const isOpen = activeComponent === "chatbot"; // 只在 activeComponent === 'chatbot' 时打开
    const chatRef = useRef(null); 
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

    // 初始化欢迎消息，包含用户名
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage = user ? 
                `Hi ${user.name}! 👋 Welcome back to BioByte! I can help you with your study materials or answer any questions about your orders. Is there anything specific you'd like to know? 📚` :
                "Hi! I'm BioByte Agent, happy to help you! 👋 I can tell you about our A-Level biology study materials or answer any other questions you might have.";
            
            setMessages([{ 
                role: "assistant",
                content: welcomeMessage
            }]);
        }
    }, [isOpen, user]);

    // 监听键盘事件
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            sendMessage();
        }
    };

    // 发送聊天消息
    const sendMessage = async () => {
        const sanitizedInput = sanitizeInput(input);
        if (!sanitizedInput) return;

        const newMessages = [...messages, { role: "user", content: sanitizedInput }];
        setMessages(newMessages);
        setInput("");

        // 添加 "Processing..." 消息
        setMessages((prevMessages) => [
            ...prevMessages,
            { role: "assistant", content: "Processing..." },
        ]);

        try {
            // 检查是否是询问订单历史的消息
            const isOrderHistoryQuery = (
                sanitizedInput.toLowerCase().includes('order') ||
                sanitizedInput.includes('订单')
            );

            if (isOrderHistoryQuery && user && orderHistory && orderHistory.length > 0) {
                // 移除 "Processing..." 消息
                const filteredMessages = newMessages.filter(msg => msg.content !== "Processing...");
                
                // 使用 Markdown 格式化订单历史信息
                const orderSummary = orderHistory.map(order => 
                    `### Order Details\n\n` +
                    `**Product:** ${order.products.join(", ")}\n\n` +
                    `**Type:** ${order.type}\n\n` +
                    `**Level:** ${order.level}\n\n` +
                    `${order.chapter ? `**Chapter:** ${order.chapter}\n\n` : ''}` +
                    `**Purchase Date:** ${new Date(order.date).toLocaleDateString()}\n\n` +
                    `**Price:** $${order.price}\n\n` +
                    `---\n`
                ).join("\n");

                const response = `### Your Order History 📚\n\n${orderSummary}\nIs there anything specific about these orders you'd like to know? 😊`;
                
                setMessages([...filteredMessages, { 
                    role: "assistant", 
                    content: response
                }]);
            } else {
                // 发送常规请求
                const response = await axios.post("/api/chat", { 
                    message: sanitizedInput,
                    user: user ? {
                        id: user.id,
                        email: sanitizeInput(user.email)
                    } : null,
                    orderHistory: orderHistory || []
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-XSS-Protection': '1; mode=block'
                    }
                });
                
                // 移除 "Processing..." 消息并添加新回复
                setMessages(messages => {
                    const filteredMessages = messages.filter(msg => msg.content !== "Processing...");
                    return [...filteredMessages, { role: "assistant", content: response.data.message }];
                });
            }
        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages(messages => {
                const filteredMessages = messages.filter(msg => msg.content !== "Processing...");
                return [...filteredMessages, { 
                    role: "assistant", 
                    content: "I apologize, but I encountered an error. Please try again or contact our support team. 😔" 
                }];
            });
        }
    };

    // 处理反馈表单输入
    const handleEmailChange = (e) => {
        const sanitizedEmail = sanitizeInput(e.target.value);
        setEmail(sanitizedEmail);
        localStorage.setItem("feedback_email", sanitizedEmail);
    };

    const handleMessageChange = (e) => {
        const sanitizedMessage = sanitizeInput(e.target.value);
        setMessage(sanitizedMessage);
        localStorage.setItem("feedback_message", sanitizedMessage);
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
        <div className="fixed bottom-8 lg:bottom-16 right-4 lg:right-16 z-50 flex flex-col items-end space-y-4">
            {/* 聊天窗口 - 只有在 isOpen 时才显示 */}
            {isOpen && (
                <div className="transform transition-all duration-300 ease-in-out translate-y-0 opacity-100">
                    <div
                        ref={chatRef}
                        className="bg-white p-4 border border-gray-200 w-[450px] max-w-[92vw] h-[600px] max-h-[65vh] mb-4 flex flex-col"
                    >
                        {/* 标题栏 */}
                        <div className="flex items-center justify-between h-8 mb-4 pb-2">
                            <h2 className="text-md font-light tracking-wider">24/7 Support - BioByte</h2>
                            <button
                                onClick={() => setActiveComponent(null)}
                                className="text-black hover:text-gray-600 transition duration-200 flex items-center justify-center h-8 w-8"
                            >
                                <IoClose size={18} />
                            </button>
                        </div>

                        {/* 聊天内容区域 */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`p-3 max-w-[75%] break-words rounded-lg border tracking-wider ${
                                            msg.role === "user"
                                                ? "bg-black text-white border-black"
                                                : "bg-white text-black border-black"
                                        } text-sm font-light markdown-content`}
                                    >
                                        <ReactMarkdown 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                                a: ({node, ...props}) => <a className="text-blue-500 hover:underline" {...props} />,
                                                ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                                ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                                                li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                                code: ({node, inline, ...props}) => 
                                                    inline 
                                                        ? <code className="bg-gray-100 px-1 rounded" {...props} />
                                                        : <code className="block bg-gray-100 p-2 rounded my-2" {...props} />,
                                                blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-gray-300 pl-4 my-2" {...props} />,
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            <div ref={endOfMessagesRef} />
                        </div>

                        {/* 固定在底部的输入区域 */}
                        <div className="mt-auto pt-2 border-t border-black">
                            {/* 反馈表单 */}
                            <div className={`transform transition-all duration-1000 ease-in-out overflow-hidden ${feedbackOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="mb-4 p-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-md font-light tracking-wider">Contact Us</h2>
                                        <button
                                            onClick={() => setFeedbackOpen(false)}
                                            className="text-black hover:text-gray-600 transition duration-200"
                                        >
                                            <IoClose size={18} />
                                        </button>
                                    </div>
                                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
                                        <input
                                            type="email"
                                            name="customer_email"
                                            value={email}
                                            onChange={handleEmailChange}
                                            className="w-full p-2 border border-black text-sm font-light focus:outline-none focus:border-2"
                                            placeholder="Your email address..."
                                            required
                                        />
                                        <textarea
                                            name="message"
                                            rows="3"
                                            value={message}
                                            onChange={handleMessageChange}
                                            className="w-full p-2 border border-black text-sm font-light focus:outline-none focus:border-2"
                                            placeholder="Your message..."
                                            required
                                        ></textarea>
                                        <button
                                            type="submit"
                                            className="w-full py-2 border border-black text-sm font-light hover:bg-black hover:text-white transition-all duration-300"
                                        >
                                            Send Message
                                        </button>
                                    </form>
                                </div>
                            </div>

                            {/* 输入框和按钮 */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFeedbackOpen(!feedbackOpen);
                                    }}
                                    className="p-2 border border-black hover:bg-black hover:text-white transition-all duration-300"
                                >
                                    <SlEnvolope className="w-5 h-5" />
                                </button>
                                <input
                                    type="text"
                                    className="flex-1 p-2 border border-black text-sm font-light focus:outline-none focus:border-2"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Enter your question..."
                                />
                                <button 
                                    onClick={sendMessage} 
                                    className="p-2 border border-black hover:bg-black hover:text-white transition-all duration-300"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 悬浮按钮 - 总是显示 */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setActiveComponent(isOpen ? null : "chatbot");
                }}
                className="bg-black text-white p-3 rounded-full hover:bg-black hover:text-white transition-all duration-300"
            >
                <MessageSquare className="w-6 h-6" />
            </button>
        </div>
    );
}
