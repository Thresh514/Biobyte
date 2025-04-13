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
            alert("请填写所有字段");
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
                throw new Error(orderData.message || "创建订单失败");
            }
            
            console.log("PayPal订单创建成功:", orderData);
            
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
            console.error("支付处理错误:", error);
            alert(`支付处理失败: ${error.message}`);
            setLoading(false);
        }
    };
    
    // 提交表单
    const handleSubmit = async (e) => {
        e.preventDefault();
        // 调用PayPal支付
        await handlePayPalPayment();
    };
    
    return (
        <div className="min-h-screen">
            <SimpleHeader />
            <div className="pt-24 max-w-3xl mx-auto p-6">
                <h1 className="text-2xl font-bold mb-4">结账</h1>

                {cart.length === 0 ? (
                    <p>您的购物车是空的</p>
                ) : (
                    <>
                        {/* 商品信息 */}
                        <div className="border p-4 rounded-md mb-6">
                            <h2 className="text-xl font-semibold mb-2">订单详情</h2>
                            {cart.map((item) => (
                                <div key={`${item.id}-${item.option}`} className="flex justify-between mb-2">
                                    <span>{item.name} {item.option !== "Full" && item.option}</span>
                                    <span>${item.price.toFixed(2)}</span>
                                </div>
                            ))}
                            <h3 className="text-lg font-bold mt-4 text-end">总计: ${totalPrice.toFixed(2)}</h3>
                        </div>

                        {/* 结算表单 */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                type="text"
                                placeholder="姓名"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-2 border rounded-md"
                                required
                            />

                            {/* 未登录用户需要输入邮箱 */}
                            {!isLoggedIn && (
                                <input
                                    type="email"
                                    placeholder="邮箱"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            )}

                            <button
                                type="submit"
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold p-4 rounded-md transition"
                                disabled={loading}
                            >
                                {loading ? "处理中..." : "使用PayPal支付"}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
