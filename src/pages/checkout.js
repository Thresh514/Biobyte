"use client";

import { useState, useEffect } from "react";
import { getCart, clearCart } from "../lib/cart";
import { useRouter } from "next/navigation";
import SimpleHeader from "../components/SimpleHeader";
import { jwtDecode } from "jwt-decode";


export default function Checkout() {
    const [cart, setCart] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    // 读取购物车数据
    useEffect(() => {
        setCart(getCart());

        // 检查localStorage里是否有JWT
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setEmail(decoded.email);
                setIsLoggedIn(true);
            } catch (error) {
                console.error("无效的token:", error);
                localStorage.removeItem("token");
                setIsLoggedIn(false);
            }
        }
    }, []);

    // 计算总价
    const totalPrice = cart.reduce((total, item) => total + item.price, 0);
    
    // 生成唯一订单ID
    const generateOrderId = () => {
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substring(2, 8);
        return `order_${timestamp}_${randomPart}`;
    };
    
    // 处理PayPal支付
    const handlePayPalPayment = async () => {
        if (!name || (!isLoggedIn && !email)) {
            alert("Please fill in all required fields");
            return;
        }

        setLoading(true);
        
        try {
            // 生成本地订单ID
            const localOrderId = generateOrderId();
            
            // 创建PayPal订单
            const createResponse = await fetch("/api/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    amount: totalPrice,
                    order_id: localOrderId  // 传递本地生成的订单ID
                })
            });
            
            const orderData = await createResponse.json();
            
            if (!createResponse.ok) {
                throw new Error(orderData.message || "Failed to create order");
            }
            
            console.log("PayPal order created successfully:", orderData);
            
            // 保存订单信息到localStorage，以便支付完成后处理
            localStorage.setItem("pending_order", JSON.stringify({
                order_id: orderData.order_id || localOrderId,
                paypal_order_id: orderData.paypal_order_id,
                user_info: { name, email },
                cart: cart,
                totalPrice: totalPrice
            }));
            
            // 重定向到PayPal支付页面
            window.location.href = orderData.approval_url;
            
        } catch (error) {
            console.error("Payment processing error:", error);
            alert(`Payment processing failed: ${error.message}`);
            setLoading(false);
        }
    };
    
    // 处理微信支付
    const handleWeChatPayment = async () => {
        if (!name || (!isLoggedIn && !email)) {
            alert("Please fill in all required fields");
            return;
        }

        setLoading(true);
        
        try {
            alert("WeChat Pay is currently under development");
            setLoading(false);
            
            // 实际的微信支付处理将在这里添加
            // ...
            
        } catch (error) {
            console.error("WeChat payment error:", error);
            alert(`WeChat payment failed: ${error.message}`);
            setLoading(false);
        }
    };
    
    // 提交表单
    const handleSubmit = async (e) => {
        e.preventDefault();
        // 表单提交时不做任何操作，而是通过按钮点击事件处理
    };
    
    return (
        <div className="min-h-screen">
            <SimpleHeader />
            <div className="pt-12 p-6 max-w-6xl mx-auto w-full flex-grow">
                <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-wide">Checkout</h1>
                {cart.length === 0 ? (
                    <p>Your cart is empty</p>
                ) : (
                    <div className="flex flex-col items-start justify-between mt-12 mb-12">
                        {/* 商品信息 */}
                        <div className="w-1/2 items-center justify-center border-b border-gray-400 pb-12">
                            <h2 className="text-lg font-light mb-2 tracking-wider">Order Details</h2>
                            {cart.map((item) => (
                                <div key={`${item.id}-${item.option}`} className="flex justify-between tracking-wide text-sm font-light space-x-4">
                                    <span>{item.name} {item.option !== "Full" && item.option}</span>
                                    <span>${item.price.toFixed(2)}</span>
                                </div>
                            ))}
                            <h3 className="text-md font-light mt-4 text-end">Total: $ {totalPrice.toFixed(2)}</h3>
                        </div>

                        {/* 结算表单 */}
                        <form onSubmit={handleSubmit} className="space-y-8 w-1/2 border-b border-gray-400 pb-16 pt-12">
                            <p className="text-lg font-light tracking-wide text-gray-600">Basic Information</p>
                            <div className="relative w-[400px]">
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="peer w-full px-0 py-2 h-6 text-md font-light border-b border-gray-400
                                        bg-transparent text-gray-900 focus:outline-none focus:border-black placeholder-transparent"
                                    placeholder=""
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                                <label
                                    htmlFor="name"
                                    className="absolute left-0 top-2 text-gray-400 text-lg transition-all 
                                        peer-placeholder-shown:top-1 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                                        peer-focus:top-[-16px] peer-focus:text-xs peer-focus:text-gray-600
                                        peer-[:not(:placeholder-shown)]:top-[-16px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-600"
                                >
                                    Name
                                </label>
                            </div>

                            {/* 未登录用户需要输入邮箱 */}
                            {!isLoggedIn && (
                                <div className="relative w-[400px]">
                                <input
                                    type="text"
                                    id="email"
                                    name="email"
                                    className="peer w-full px-0 py-2 h-6 text-md font-light border-b border-gray-400
                                        bg-transparent text-gray-900 focus:outline-none focus:border-black placeholder-transparent"
                                    placeholder=""
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-0 top-2 text-gray-400 text-lg transition-all 
                                        peer-placeholder-shown:top-1 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                                        peer-focus:top-[-16px] peer-focus:text-xs peer-focus:text-gray-600
                                        peer-[:not(:placeholder-shown)]:top-[-16px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-600"
                                >
                                    Email
                                </label>
                            </div>
                            )}
                        </form>
                    </div>
                    )}
                    <div className="flex flex-col items-start justify-center mt-12 space-y-4">
                        <p className="text-lg font-light tracking-wide text-gray-600">Choose Payment Method</p>
                        <div className="flex items-center justify-center space-x-8">
                            <button
                                onClick={handlePayPalPayment}
                                className="w-full bg-white border border-gray-500 hover:border-2 text-gray-900 font-light w-[160px] p-4 transition flex items-center justify-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <img src="paypal.svg" alt="PayPal Checkout" className="w-auto" />
                                )}
                            </button>
                            <button
                                onClick={handleWeChatPayment}
                                className="w-full bg-white border border-gray-500 hover:border-2 text-gray-900 font-light w-[160px] p-4 transition flex items-center justify-center cursor-not-allowed"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                                        <span>Processing...</span>
                                    </div>
                                ) : (
                                    <img src="wechatpay.svg" alt="WeChat Pay" className="w-auto" />
                                )}
                            </button>
                        </div>
                    </div>
            </div>
        </div>
    );
}
