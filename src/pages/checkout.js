"use client";

import { useState, useEffect } from "react";
import { getCart, clearCart } from "../lib/cart";
import { useRouter } from "next/navigation";
import SimpleHeader from "../components/SimpleHeader";
import { jwtDecode } from "jwt-decode";


export default function Checkout() {
    const [cart, setCart] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState(""); // ✅ 添加 email 状态
    const [loading, setLoading] = useState(false); // 处理支付中的状态
    const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ 记录用户是否已登录
    const router = useRouter();

    // 读取购物车数据
    useEffect(() => {
        setCart(getCart());

        // **检查 localStorage 里是否有 JWT**
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token); // ✅ 解析 JWT
                setEmail(decoded.email); // ✅ 自动填充 email
                setIsLoggedIn(true);
            } catch (error) {
                console.error("Invalid token:", error);
                localStorage.removeItem("token"); // **JWT 失效，清除**
                setIsLoggedIn(false);
            }
        }
    }, []);

    // 计算总价
    const totalPrice = cart.reduce((total, item) => total + item.price, 0);
    
    // 处理订单提交
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!name || (!isLoggedIn && !email)) {
            alert("请填写所有字段");
            return;
        }

        setLoading(true); // 显示加载状态
    
        // 订单数据
        const orderData = {
            name,
            email,  // ✅ 传入自动获取的 email（登录用户）或用户输入的 email（未登录）
            cart,
            totalPrice,
        };
        console.log("📦 Order Data being sent:", orderData); // 🔍 打印订单数据
        try {
            const headers = { "Content-Type": "application/json" };

            // **如果用户已登录，添加 Token 认证**
            const token = localStorage.getItem("token");
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }

            // 发送订单请求
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: headers, // ✅ 现在包含 `Authorization` 头
                body: JSON.stringify(orderData),
            });

            const result = await response.json();

            if (response.ok) {
                alert(`订单已提交！确认邮件已发送至 ${email}`);
                clearCart(); // **支付成功才清空购物车**
                setCart([]);
                router.push("/order-success");
            } else {
                alert(`支付失败：${result.message}`);
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("订单提交失败，请稍后再试");
        }

        setLoading(false); // 结束加载状态
    };
    
    return (
        <div className="min-h-screen">
            <SimpleHeader />
        <div className="pt-24 max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Checkout</h1>

            {cart.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                <>
                    {/* 商品信息 */}
                    <div className="border p-4 rounded-md mb-6">
                        <h2 className="text-xl font-semibold mb-2">Order Details</h2>
                        {cart.map((item) => (
                            <div key={`${item.id}-${item.option}`} className="flex justify-between mb-2">
                                <span>{item.name} {item.option}</span>
                                <span>${(item.price)}</span>
                            </div>
                        ))}
                        <h3 className="text-lg font-bold mt-4 text-end">Total: ${totalPrice.toFixed(2)}</h3>
                    </div>

                    {/* 结算表单 */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                        />

                        {/* **未登录用户需要输入邮箱** */}
                        {!isLoggedIn && (
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                        )}

                        <button
                            type="submit"
                            className="w-full bg-black text-white font-semibold p-4 rounded-md transition"
                        >
                            {loading ? "Processing..." : "Submit Order"}
                        </button>
                    </form>
                </>
            )}
        </div>
        </div>
    );
}
