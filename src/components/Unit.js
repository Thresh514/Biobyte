import { useEffect, useState } from "react";
import { addToCart } from "../lib/cart.js";

const ProductDetail = ({ title, description, image, price, options}) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedOption, setSelectedOption] = useState(options ? options[0] : "");
    const [totalPrice, setTotalPrice] = useState(price);

    useEffect(() => {
        setQuantity(1);
        setTotalPrice(price);  // 价格也需要更新
    }, [title, price]); // 添加 price 依赖项

    const updateQuantity = (amount) => {
        const newQuantity = Math.max(1, quantity + amount);
        setQuantity(newQuantity);
        setTotalPrice((newQuantity * price)); // 确保显示两位小数
    };
    
    const handleAddToCart = () => {
        const product = {
            id: title, // 这里的 id 可能需要从 props 传入
            name: title,
            price,
            quantity,
            option: selectedOption,
            image,
        };

        addToCart(product);
        alert(`已加入购物车: ${title} ${selectedOption} x${quantity}`);
    };

    const handleBuyNow = () => {
        alert(`直接购买: ${title} ${selectedOption} x${quantity}`);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* 第一部分：商品主要信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-10">
                {/* 左侧商品图片 */}
                <div className="flex justify-center">
                    <img src={image} alt={title} className="w-full max-w-md rounded-lg shadow-lg" width={102} height={102} />
                </div>

                {/* 右侧商品详情 */}
                <div className="space-y-12">
                    <h1 className="text-3xl font-bold">{title}</h1>
                    <p className="text-gray-600 text-lg">{description}</p>
                    <p className="text-2xl font-semibold text-red-500">${totalPrice}</p>
                    
                    {/* 数量选择 */}
                    <div className="flex items-center space-x-3">
                        <label className="font-semibold">Amount:</label>
                        <button
                            className="px-3 py-1 border rounded-md hover:bg-gray-100"
                            onClick={() => updateQuantity(-1)}
                        >
                            -
                        </button>
                        <span className="px-3">{quantity}</span>
                        <button
                            className="px-3 py-1 border rounded-md hover:bg-gray-100"
                            onClick={() => updateQuantity(+1)}
                        >
                            +
                        </button>
                    </div>

                    {/* 款式选择 */}
                    {options && (
                        <div className="space-y-2">
                            <label className="font-semibold">Choose an option:</label>
                            <select
                                className="border p-2 rounded-md w-full"
                                value={selectedOption}
                                onChange={(e) => setSelectedOption(e.target.value)}
                            >
                                {options.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* 按钮 */}
                    <div className="flex flex-col space-y-4 mt-4">
                        <button
                            onClick={handleAddToCart}
                            className="bg-yellow-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-600 transition"
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600 transition"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            {/* 第二部分：商品大图 & 更多描述 */}
            <div className="py-10">
                <h2 className="text-2xl font-bold mb-4">Product Description</h2>
                <img src={image} alt={title} className="w-full rounded-lg shadow-md" height={500} width={500}/>
                <p className="text-gray-700 mt-4 text-lg">{description}</p>
            </div>
        </div>
    );
};

export default ProductDetail;
