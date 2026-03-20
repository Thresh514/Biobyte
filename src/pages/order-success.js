import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import SimpleHeader from "../components/SimpleHeader";
import { clearCart } from "../lib/cart";
import confetti from "canvas-confetti";

export default function OrderSuccess() {
    const [loading, setLoading] = useState(true);
    const [orderInfo, setOrderInfo] = useState(null);
    const [error, setError] = useState(null);
    const router = useRouter();
    const confettiTriggered = useRef(false);

    // 触发彩带特效的函数
    const triggerConfetti = () => {
        if (confettiTriggered.current) return; // 防止重复触发
        confettiTriggered.current = true;
        
        // 从两侧向上喷射彩带
        const duration = 1.5 * 1000; // 持续3秒
        const animationEnd = Date.now() + duration;
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        
        // 随机范围函数
        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }
        
        // 从左侧向上喷射
        function frameLeft() {
            const timeLeft = animationEnd - Date.now();
            
            if (timeLeft <= 0) {
                return;
            }
            
            const particleCount = 3; // 每帧发射的彩带数量
            
            confetti({
                particleCount,
                angle: randomInRange(80, 100), // 向上喷射
                spread: 70,
                origin: { x: 0.1, y: 0.9 }, // 从左下角
                colors: [colors[Math.floor(randomInRange(0, colors.length))]],
                ticks: 300,
                gravity: 0.8,
                decay: 0.94,
                startVelocity: randomInRange(35, 45),
                zIndex: 1000,
            });
            
            requestAnimationFrame(frameLeft);
        }
        
        // 从右侧向上喷射
        function frameRight() {
            const timeLeft = animationEnd - Date.now();
            
            if (timeLeft <= 0) {
                return;
            }
            
            const particleCount = 3; // 每帧发射的彩带数量
            
            confetti({
                particleCount,
                angle: randomInRange(80, 100), // 向上喷射
                spread: 70,
                origin: { x: 0.9, y: 0.9 }, // 从右下角
                colors: [colors[Math.floor(randomInRange(0, colors.length))]],
                ticks: 300,
                gravity: 0.8,
                decay: 0.94,
                startVelocity: randomInRange(35, 45),
                zIndex: 1000,
            });
            
            requestAnimationFrame(frameRight);
        }
        
        // 立即启动两侧彩带
        frameLeft();
        frameRight();
    };

    useEffect(() => {
        async function processPendingOrder() {
            // 从URL获取PayPal订单ID
            const urlParams = new URLSearchParams(window.location.search);
            const paypalOrderId = urlParams.get('token');
            
            if (!paypalOrderId) {
                // 没有支付令牌，可能是直接访问了成功页面
                setLoading(false);
                // 即使是直接访问也触发彩带
                triggerConfetti();
                return;
            }
            
            // 从localStorage获取之前存储的订单信息
            const pendingOrderStr = localStorage.getItem('pending_order');
            if (!pendingOrderStr) {
                setError("Order information not found");
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
                console.log("Order capture response:", result);
                
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
                    await fetch("/api/checkout", {
                        method: "POST",
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(orderData)
                    });
                    
                    // 立即触发彩带效果，无延迟
                    triggerConfetti();
                    
                } else {
                    setError(result.message || "Payment processing failed");
                }
            } catch (err) {
                console.error("Error processing payment:", err);
                setError("Error processing payment: " + err.message);
            } finally {
                setLoading(false);
            }
        }
        
        processPendingOrder();
    }, [router]);

    // 页面加载完成立即触发彩带
    useEffect(() => {
        if (!loading && !error) {
            // 立即触发，无延迟
            triggerConfetti();
        }
    }, [loading, error]);

    return (
        <div className="min-h-screen">
            <Head>
                <title>Order Success | BioByte</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <SimpleHeader />
            <div className="pt-12 p-6 max-w-6xl mx-auto w-full flex-grow">
                <h1 className="text-4xl md:text-5xl font-light mb-4 tracking-wide">Order Status</h1>
                
                {loading ? (
                    <div className="flex flex-col items-center justify-center mt-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-6"></div>
                        <p className="text-lg font-light tracking-wide text-gray-600">Processing your payment, please wait...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-start border-b border-gray-400 pb-12 mt-12">
                        <h2 className="text-lg font-light mb-6 tracking-wider text-red-500">Payment Processing Error</h2>
                        <p className="text-sm font-light tracking-wide mb-8">{error}</p>
                        <a 
                            href="/" 
                            className="bg-white border border-gray-500 hover:border-2 text-gray-900 font-light px-12 py-3 transition flex items-center justify-center"
                        >
                            Return to Homepage
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col items-start justify-between mt-12 mb-12">
                        <div className="w-1/2 items-center justify-center border-b border-gray-400 pb-48">
                            <h2 className="text-lg font-light mb-6 tracking-wider text-green-600">🎉 Order Successfully Placed!</h2>
                            <p className="text-sm font-light tracking-wide mb-8">Thank you for your purchase. We've sent a confirmation email with your resources to your inbox.</p>
                        </div>
                        
                        <div className="flex flex-col items-start justify-center mt-12 space-y-4">
                            <p className="text-lg font-light tracking-wide text-gray-600">What's Next?</p>
                            <div className="flex flex-col space-y-6">
                                <p className="text-sm font-light tracking-wide">Your resources have been sent to your email. If you don't see them, please check your spam folder.</p>
                                <a 
                                    href="/" 
                                    className="bg-white border border-gray-500 hover:border-2 text-gray-900 font-light w-1/3 p-3 tracking-wide transition flex items-center justify-center"
                                >
                                    Return to Homepage
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* 隐藏的canvas用于确保confetti正常工作 */}
            <canvas 
                id="confetti-canvas" 
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 999
                }}
            />
        </div>
    );
}
