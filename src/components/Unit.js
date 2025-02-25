import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { addToCart, saveCart } from "../lib/cart.js";

const ProductDetail = ({ title, description, image, price, options, file_path, onSelectOption }) => {
    const router = useRouter();
    const { chapter } = router.query;
    const [quantity, setQuantity] = useState(1);
    const [selectedOption, setSelectedOption] = useState(options && options.length > 0 ? options[0] : null);
    const [totalPrice, setTotalPrice] = useState(price || 0);
    const [currentTitle, setCurrentTitle] = useState(title || "");

    useEffect(() => {
        setQuantity(1); // ✅ 每次切换商品，数量重置为 1
    
        if (options && options.length > 0) {
            // ✅ 如果 URL 里有 `chapter`，选择对应章节
            const initialOption = options.find(opt => opt.chapter === `Chapter ${chapter}`) || options[0];
            setSelectedOption(initialOption);
            if (initialOption && initialOption.title) { // ✅ title 是 props.title，而 props 不会随着 selectedOption 变化自动更新：需要手动更新
                setCurrentTitle(initialOption.title);
            }
        }
    }, [options,chapter]); // ✅ 监听 `options` 和 `chapter`，确保选项正确更新
    
    // **当 selectedOption 变化时，更新 totalPrice**
    useEffect(() => {
        if (selectedOption) {
            setTotalPrice(selectedOption.price);
        }
    }, [selectedOption]);

    const updateQuantity = (amount) => {
        const newQuantity = Math.max(1, quantity + amount);
        setQuantity(newQuantity);
        setTotalPrice((newQuantity * (selectedOption ? selectedOption.price : price))); // 确保显示两位小数
    };
    
    const handleAddToCart = () => {
        const product = {
            id: title, // 这里的 id 可能需要从 props 传入
            name: title,
            price: selectedOption ? selectedOption.price : price,
            quantity,
            option: selectedOption ? selectedOption.chapter : "No Option",
            image: selectedOption ? selectedOption.image : image,
            file_path: selectedOption ? selectedOption.file_path : file_path
        };

        addToCart(product);
        alert(`已加入购物车: ${title} ${selectedOption ? selectedOption.chapter : ""} x${quantity}`);
    };

    const handleBuyNow = () => {
        const product = {
            id: title, // 这里的 id 可能需要从 props 传入
            name: title,
            price: selectedOption ? selectedOption.price : price,
            quantity,
            option: selectedOption ? selectedOption.chapter : "No Option",
            image: selectedOption ? selectedOption.image : image,
            file_path: selectedOption ? selectedOption.file_path : file_path
        };

        saveCart([product]);

        // 跳转到 Checkout 页面
        router.push("/checkout");
        
        alert(`直接购买: ${title} ${selectedOption} x${quantity}`);
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* 第一部分：商品主要信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b pb-10">
                {/* 左侧商品图片 */}
                <div className="flex justify-center">
                    <img src={selectedOption ? selectedOption.image : image} alt={title} className="w-full max-w-md rounded-lg shadow-lg" width={102} height={102} />
                </div>

                {/* 右侧商品详情 */}
                <div className="space-y-12">
                    <h1 className="text-3xl font-bold">{currentTitle}</h1>
                    <p className="text-gray-600 text-lg">{description}</p>
                    <p className="text-2xl font-semibold text-red-500">${typeof totalPrice === "number" ? totalPrice.toFixed(2) : "0.00"}</p>
                    
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
                                value={selectedOption ? selectedOption.chapter : ""}
                                onChange={(e) => {
                                    const selected = options.find((opt) => opt.chapter === e.target.value);
                                    setSelectedOption(selected);
                                    router.push(`/unit/${router.query.id}?chapter=${selected.chapter.split(" ")[1]}`); // ✅ 更新 URL
                                    onSelectOption(selected); // 调用父组件传递的回调函数，以触发 URL 更新
                                }}
                            >
                                {options.map((option) => (
                                    <option key={option.chapter} value={option.chapter}>
                                        {option.chapter}
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
                <img src={selectedOption ? selectedOption.image : image} alt={title} className="w-full rounded-lg shadow-md" height={500} width={500}/>
                <p className="text-gray-700 mt-4 text-lg">{description}</p>
            </div>
        </div>
    );
};

export default ProductDetail;
