import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SimpleHeader from "../components/SimpleHeader";
import { clearCart } from "../lib/cart";

export default function OrderSuccess() {
    const [loading, setLoading] = useState(true);
    const [orderInfo, setOrderInfo] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter();

    useEffect(() => {
        async function processPendingOrder() {
            // 从URL获取PayPal订单ID
            const urlParams = new URLSearchParams(window.location.search);
            const paypalOrderId = urlParams.get('token');
            
            if (!paypalOrderId) {
                // 没有支付令牌，可能是直接访问了成功页面
                setLoading(false);
                return;
            }
            
            // 从localStorage获取之前存储的订单信息
            const pendingOrderStr = localStorage.getItem('pending_order');
            if (!pendingOrderStr) {
                setError("无法找到订单信息");
                setLoading(false);
                return;
            }
            
            try {
                const pendingOrder = JSON.parse(pendingOrderStr);
                
                // 调用捕获订单API，同时传递本地订单ID作为备用
                const response = await fetch('/api/paypal/capture-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        paypal_order_id: paypalOrderId,
                        order_id: pendingOrder.order_id  // 提供本地订单ID作为备用
                    })
                });
                
                const result = await response.json();
                console.log("捕获订单响应:", result);
                
                if (response.ok && result.success) {
                    // 支付成功，保存订单信息并清空购物车
                    setOrderInfo({
                        orderId: result.order_id || pendingOrder.order_id,
                        transactionId: result.transaction_id,
                        status: result.status,
                        ...pendingOrder
                    });
                    
                    // 清空购物车和待处理订单信息
                    clearCart();
                    localStorage.removeItem('pending_order');
                    
                    // 处理邮件发送等订单完成后的操作
                    const orderData = {
                        name: pendingOrder.user_info.name,
                        email: pendingOrder.user_info.email,
                        cart: pendingOrder.cart,
                        totalPrice: pendingOrder.totalPrice,
                        transaction_id: result.transaction_id,
                        order_id: result.order_id || pendingOrder.order_id  // 使用返回的订单ID或本地订单ID
                    };
                    
                    // 调用已有的checkout API处理邮件发送等
                    const token = localStorage.getItem("token");
                    const headers = { "Content-Type": "application/json" };
                    
                    if (token) {
                        headers["Authorization"] = `Bearer ${token}`;
                    }
                    
                    await fetch("/api/checkout", {
                        method: "POST",
                        headers: headers,
                        body: JSON.stringify(orderData)
                    });
                    
                } else {
                    setError(result.message || "支付处理失败");
                }
            } catch (err) {
                console.error("处理支付时出错:", err);
                setError("处理支付时出错: " + err.message);
            } finally {
                setLoading(false);
            }
        }
        
        processPendingOrder();
    }, [router]);

    return (
        <div className="min-h-screen">
            <SimpleHeader />
            <div className="max-w-3xl mx-auto p-6 text-center pt-16">
                {loading ? (
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <p>正在处理您的支付，请稍候...</p>
                    </div>
                ) : error ? (
                    <div className="text-red-500">
                        <h1 className="text-2xl font-bold mb-4">支付处理错误</h1>
                        <p>{error}</p>
                        <a href="/" className="mt-6 inline-block bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition">
                            返回首页
                        </a>
                    </div>
                ) : (
                    <>
                        <h1 className="text-2xl font-bold text-green-600">🎉 您的订单已成功提交！ 🎉</h1>
                        <p className="mt-4">感谢您的购买。我们已将确认邮件和资源发送到您的邮箱。</p>
                        {orderInfo && (
                            <div className="mt-6 text-left p-4 border border-gray-200 rounded-md bg-gray-50">
                                <h2 className="font-semibold mb-2">订单信息:</h2>
                                <p>订单号: {orderInfo.orderId}</p>
                                <p>交易号: {orderInfo.transactionId}</p>
                                <p>状态: {orderInfo.status}</p>
                                <p>总价: ${orderInfo.totalPrice?.toFixed(2)}</p>
                            </div>
                        )}
                        <a href="/" className="mt-6 inline-block bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition">
                            返回首页
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}
