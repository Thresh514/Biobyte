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

    return (
    <div className="min-h-screen"><Navbar />
        <div className="pt-32 p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🛒 Shopping Cart</h1>

        {cart.length === 0 ? (
            <p>Your cart is empty.</p>
        ) : (
            <div>
            {cart.map((item) => (
                <div key={`${item.id}-${item.option}`} className="flex justify-between items-center mb-4">
                <span>{item.name} ({item.option}) x {item.quantity}</span>
                <div className="flex items-center">
                    <button onClick={() => setCart(updateQuantity(item.id, item.option, item.quantity - 1))}>-</button>
                    <span className="mx-2">{item.quantity}</span>
                    <button onClick={() => setCart(updateQuantity(item.id, item.option, item.quantity + 1))}>+</button>
                    <button onClick={() => setCart(removeFromCart(item.id, item.option))} className="ml-4 text-red-500">Delete</button>
                </div>
                </div>
            ))}
            <h2 className="text-xl font-bold mt-4">Total: ${cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</h2>
            <button onClick={() => setCart(clearCart())} className="mt-4 bg-red-500 text-white p-2 w-full rounded-md hover:bg-red-600 transition">Clear Cart</button>
            <button
                        onClick={() => router.push("/checkout")}
                        className="mt-4 bg-green-500 text-white p-2 w-full rounded-md hover:bg-green-600 transition"
                    >
                        Checkout
            </button>
            </div>
        )}
        </div>
        </div>
    );
    }
