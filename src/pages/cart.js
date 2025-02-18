    "use client";

    import { useState, useEffect } from "react";
    import { useRouter } from "next/router";
    import { getCart, updateQuantity, removeFromCart, clearCart } from "../lib/cart";
    import Navbar from "../components/Navbar";

    export default function Cart() {
        const [cart, setCart] = useState([]);
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

        return (
            <div className="min-h-screen flex">
                <Navbar />
                <div className="pt-32 p-6 max-w-6xl mx-auto flex-grow">
                    <h1 className="text-2xl font-bold mb-4">🛒 Shopping Cart</h1>

                    {cart.length === 0 ? (
                        <p>Your cart is empty.</p>
                    ) : (
                        <div className="flex flex-col h-full">
                        {/* 购物车商品列表 */}
                        <div className="flex-grow">
                            {cart.map((item) => (
                                <div key={`${item.id}-${item.option}`} className="flex justify-between items-center mb-4">
                                    <span>{item.name} - {item.option}</span>
                                    <div className="flex items-center">
                                        <button onClick={() => setCart(updateQuantity(item.id, item.option, item.quantity - 1))}>-</button>
                                        <span className="mx-2 ml-4 mr-4">{item.quantity}</span>
                                        <button onClick={() => setCart(updateQuantity(item.id, item.option, item.quantity + 1))}>+</button>
                                        <span className="mx-2 ml-4 mr-4">${(item.price * item.quantity)}</span>
                                        <button onClick={() => setCart(removeFromCart(item.id, item.option))} className="ml-4 text-red-500 hover:underline">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>

                            {cart.length > 0 && (
                                <div className="bg-white p-6 w-full max-w-7xl mx-auto sticky bottom-0">
                                    <h2 className="text-xl font-bold text-end">Total: ${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</h2>
                                    <div className="flex justify-between items-center gap-8 lg:gap-60">
                                        <button 
                                            onClick={() => setCart(clearCart())} 
                                            className="mt-4 bg-gray-300 text-black p-4 w-full rounded-md transition"
                                        >
                                            Clear Cart
                                        </button>
                                        <button
                                            onClick={() => router.push("/checkout")}
                                            className="mt-4 bg-black text-white p-4 w-full rounded-md transition"
                                        >
                                            Checkout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }