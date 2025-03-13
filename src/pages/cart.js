    "use client";

    import { useState, useEffect } from "react";
    import { useRouter } from "next/router";
    import { getCart, updateQuantity, removeFromCart, clearCart } from "../lib/cart";
    import Navbar from "../components/Navbar";
    import Image from 'next/image';

    export default function Cart() {
        const [cart, setCart] = useState([]);
        const [isLoggedIn, setIsLoggedIn] = useState(false);
        const router = useRouter();

        useEffect(() => {
            setCart(getCart());
        }, []);

        
        useEffect(() => {
            document.body.classList.add('fade-in');
            return () => {
                document.body.classList.remove('fade-in');
            };
        }, []);

        useEffect(() => {
            const token = localStorage.getItem("token"); // 读取 JWT 令牌
            setIsLoggedIn(!!token); // 如果有 token，设置 isLoggedIn 为 true
        }, []);

        return (
            <div className="min-h-screen flex">
                <Navbar />
                <div className="pt-32 p-6 max-w-6xl mx-auto flex-grow space-y-12">
                    <h1 className="text-5xl font-light mb-4">SHOPPING CART</h1>
                    <div>
                        
                    </div>
                    {cart.length === 0 ? (
                        <p className="font-semibold">YOUR SHOPPING CART IS EMPTY!</p>
                        
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12">
                            {/* 购物车商品列表 */}
                            <div className="bg-white w-full p-8">
                                {cart.map((item) => (
                                    <div key={`${item.id}-${item.option}`} className="grid grid-cols-3 gap-2 items-center border-b py-8">
                                    {/* 商品图片 */}
                                    <div className="relative w-[150px] h-[200px]">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            quality={80}
                                            className="object-contain"
                                        />
                                    </div>
                                
                                    {/* 商品信息 */}
                                    <div className="flex flex-col space-y-2">
                                        <span className="text-lg">{item.name}</span>
                                        <span className="font-light">{item.option}</span>
                                        <button 
                                            onClick={() => setCart(removeFromCart(item.id, item.option))} 
                                            className="flex justify-start font-light text-gray-400 hover:underline text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                
                                    {/* 价格 & 删除按钮 */}
                                    <div className="flex justify-end items-center">
                                        <span className="text-lg font-semibold">${item.price.toFixed(2)}</span>
                                    </div>
                                </div>
                                ))}
                            </div>
                            <div className="bg-white w-full border border-black p-8 space-y-4">
                                <h2 className="text-2xl font-light ">Order Summary</h2>
                                <div className="flex justify-between items-center text-gray-800">
                                    <span className="">Subtotal</span>
                                    <span className="font-semibold">${cart.reduce((total, item) => total + item.price, 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-800">
                                    <span>Estimated Tax</span>
                                    <span className="font-semibold">$0.00</span>
                                </div>
                                
                                <hr className="my-2 border-gray-400" />
                                <div className="flex justify-between items-center text-gray-800">
                                    <span>TOTAL</span>
                                        <span className="font-semibold">${cart.reduce((total, item) => total + item.price, 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex flex-col items-center space-y-4">
                                        <button
                                            onClick={() => router.push("/checkout")}
                                            className="bg-black text-white p-3 w-full transition"
                                        >
                                            Checkout
                                        </button>
                                        {/* 只有未登录时才显示 Sign in 按钮 */}
                                        {!isLoggedIn && (
                                            <button
                                                onClick={() => router.push("/login")}
                                                className="bg-white border border-black text-gray-800 p-3 w-full transition"
                                            >
                                                Sign in
                                            </button>
                                        )}  
                                    </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
