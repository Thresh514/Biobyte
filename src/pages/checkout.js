"use client";

import { useState, useEffect } from "react";
import { getCart, clearCart } from "../lib/cart";
import { useRouter } from "next/navigation";
import SimpleHeader from "../components/SimpleHeader";
import Image from "next/image";

export default function Checkout() {
    const [cart, setCart] = useState([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("wechat"); // 默认支付方式为 WeChat Pay
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
    
        if (!name || !email) {
            alert("请填写所有字段");
            return;
        }
    
        // 订单数据
        const orderData = {
            name,
            email,
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

    const handlePayment = async () => {
        if (paymentMethod === "wechat") {
            await handleWeChatPay();
        } else {
            alert("Alipay 支付暂未开放");
        }
    };

    const handleWeChatPay = async () => {
        const orderData = {
            orderId: `order_${Date.now()}`, // 生成唯一订单号
            totalFee: totalPrice * 100, // 微信支付以"分"为单位
            description: "Study Resources Order",
        };

        try {
            const res = await fetch("/api/wechatPay", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
            });

            const data = await res.json();
            if (data.code_url) {
                window.open(data.code_url, "_blank"); // 打开微信支付二维码
            } else {
                alert("支付失败");
            }
        } catch (error) {
            console.error("支付请求失败:", error);
        }
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
                        {/* 选择支付方式 */}
                        <div className="border p-4 rounded-md mb-6">
                                <h2 className="text-xl font-semibold mb-2">Payment Method</h2>
                                <div className="grid grid-cols-2 p-4">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="wechat"
                                        checked={paymentMethod === "wechat"}
                                        onChange={() => setPaymentMethod("wechat")}
                                        className="w-4 h-4 mr-8"
                                    />
                                    <Image src="/wechatpay.svg" alt="WeChat" width={120} height={120} />
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="alipay"
                                        checked={paymentMethod === "alipay"}
                                        onChange={() => setPaymentMethod("alipay")}
                                        className="w-4 h-4 mr-8"
                                    />
                                    <Image src="/alipay.svg" alt="Alipay" width={120} height={120} />
                                </label>
                                </div>
                            </div>

                            {/* 根据选择的支付方式显示相应的支付按钮 */}
                            {paymentMethod === "wechat" && (
                                <button
                                    onClick={handlePayment}
                                    type="button"
                                    className="w-full bg-green-500 text-white font-semibold p-4 rounded-md transition"
                                >
                                    Submit Order
                                </button>
                            )}
                            {paymentMethod === "alipay" && (
                                <button
                                    type="button"
                                    className="w-full bg-blue-500 text-white font-semibold p-4 rounded-md transition"
                                    onClick={handlePayment}
                                >
                                    Submit Order
                                </button>
                            )}
                    </form>
                </>
            )}
        </div>
        </div>
    );
}
