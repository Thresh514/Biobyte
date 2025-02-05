"use client";

import { useState, useEffect } from "react";
import { getCartItems, removeFromCart, clearCart } from "../lib/cart";
import Navbar from "../components/Navbar";

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);

    // 组件加载时读取购物车数据
    useEffect(() => {
        setCartItems(getCartItems());
    }, []);

    // 移除资源
    const handleRemove = (id) => {
        removeFromCart(id);
        setCartItems(getCartItems());
    };

    // 清空购物车
    const handleClear = () => {
        clearCart();
        setCartItems([]);
    };

    return (
        <div className="">
            <Navbar />
            <div className="absolute top-32 left-0 w-full z-0 flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl font-bold mb-4">购物车</h1>
                {cartItems.length > 0 ? (
                    <div>
                        <ul>
                            {cartItems.map((item) => (
                                <li key={item.id} className="flex justify-between border-b py-2">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-gray-600">价格: ${item.price}</p>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        className="text-red-500"
                                    >
                                        移除
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={handleClear}
                            className="bg-red-500 text-white px-4 py-2 mt-4 rounded"
                        >
                            清空购物车
                        </button>
                    </div>
                ) : (
                    <p className="text-gray-500">购物车为空。</p>
                )}
            </div>
        </div>
    );
};

export default CartPage;
