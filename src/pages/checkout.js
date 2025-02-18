"use client";

import { useState, useEffect } from "react";
import { getCart, clearCart } from "../lib/cart";
import { useRouter } from "next/navigation";
import SimpleHeader from "../components/SimpleHeader";

export default function Checkout() {
    const [cart, setCart] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const router = useRouter();

    // 读取购物车数据
    useEffect(() => {
        setCart(getCart());
    }, []);

    // 计算总价
    const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    // 处理订单提交
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!name || !email || !address) {
            alert("请填写所有字段");
            return;
        }
    
        // 订单数据
        const orderData = {
            name,
            email,
            address,
            cart,
            totalPrice,
        };
    
        try {
            // 发送邮件
            const response = await fetch("/api/sendOrderEmail", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            });
    
            if (response.ok) {
                alert(`订单已提交！确认邮件已发送至 ${email}`);
            } else {
                alert("订单提交成功，但邮件发送失败");
            }
        } catch (error) {
            console.error("Error sending email:", error);
            alert("订单提交成功，但邮件发送失败");
        }
    
        // 清空购物车
        clearCart();
        setCart([]);
    
        // 跳转到订单确认页面
        router.push("/order-success");
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
                                <span>x {item.quantity}</span>
                                <span>${(item.price * item.quantity)}</span>
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
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                        />
                        <textarea
                            placeholder="Address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            rows="3"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full bg-black text-white font-semibold p-4 rounded-md transition"
                        >
                            Submit Order
                        </button>
                    </form>
                </>
            )}
        </div>
        </div>
    );
}
