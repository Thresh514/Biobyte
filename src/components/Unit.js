import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { addToCart, saveCart } from "../lib/cart.js";

const ProductDetail = ({ title, description, image, price, type, options, file_path, onSelectOption }) => {
    const router = useRouter();
    const { chapter } = router.query;
    const [selectedOption, setSelectedOption] = useState(options && options.length > 0 ? options[0] : null);
    const [totalPrice, setTotalPrice] = useState(price || 0);
    const shouldShowOptions = type && type.trim().toLowerCase() !== "syllabus analysis";
    const [toastMessage, setToastMessage] = useState(""); // ✅ Toast 消息状态
    const [showToast, setShowToast] = useState(false); // ✅ 控制 Toast 显示
    const [fadeOut, setFadeOut] = useState(false); // ✅ 控制加载状态

    useEffect(() => {
        if (options && options.length > 0) {
            // ✅ 如果 URL 里有 `chapter`，选择对应章节
            const initialOption = options.find(opt => opt.chapter === `Chapter ${chapter}`) || options[0];
            setSelectedOption({ ...initialOption });
        }
    }, [options, chapter]); // ✅ 监听 `options` 和 `chapter`，确保选项正确更新

    // **当 selectedOption 变化时，更新 totalPrice**
    useEffect(() => {
        if (selectedOption) {
            setTotalPrice(selectedOption.price);
        }
    }, [selectedOption]);

    useEffect(() => {
        console.log("Unit.js useEffect triggered, title:", title);
    }, [title]);

    const handleAddToCart = () => {
        const product = {
            id: title, // 这里的 id 可能需要从 props 传入
            name: title,
            price: selectedOption ? selectedOption.price : price,
            option: selectedOption ? selectedOption.chapter : "Full",
            image: selectedOption ? selectedOption.image : image,
            file_path: selectedOption ? selectedOption.file_path : file_path
        };

        addToCart(product);
        setToastMessage(`${title} ${selectedOption ? selectedOption.chapter : ""} is added to cart!`);
        setShowToast(true);
        setFadeOut(false);

        setTimeout(() => {
            setFadeOut(true); // 2秒后开始淡出
            setTimeout(() => setShowToast(false), 500);
        }, 2500); // 2.5秒后完全消失
    };

    const handleBuyNow = () => {
        const product = {
            id: title, // 这里的 id 可能需要从 props 传入
            name: title,
            price: selectedOption ? selectedOption.price : price,
            option: selectedOption ? selectedOption.chapter : "Full",
            image: selectedOption ? selectedOption.image : image,
            file_path: selectedOption ? selectedOption.file_path : file_path
        };

        saveCart([product]);

        // 跳转到 Checkout 页面
        router.push("/checkout");
    };

    if (!title) {
        return <div>加载中...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-0">
            {/* 第一部分：商品主要信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-32">
                {/* 左侧商品图片 */}
                <div className="flex justify-center p-6">
                    <img src={selectedOption ? selectedOption.image : image} alt={title} className="w-[500px] h-[530px]"/>
                </div>

                {/* 右侧商品详情 */}
                <div className="mt-16">
                    <p key={title} className="text-2xl font-normal">{selectedOption ? selectedOption.title : title}</p>
                    <p className="text-xl text-gray-800">$ {typeof totalPrice === "number" ? totalPrice.toFixed(2) : "0.00"}</p>

                    {/* 款式选择 */}
                    {options && shouldShowOptions && (
                        <div className="space-y-4 mt-8">
                            <label className="">OPTION</label>
                            <div className="grid grid-cols-5">
                                {options.map((option) => (
                                    <button
                                        key={option.chapter}
                                        className={`px-2 py-3 border transition ${
                                            selectedOption?.chapter === option.chapter
                                                ? "bg-white text-sm text-gray-800 border-2 border-gray-900"
                                                : "bg-white text-sm text-gray-800 border-gray-300 hover:border-2 hover:border-gray-900"
                                        }`}
                                        onClick={() => {
                                            setSelectedOption(option);
                                            router.push(`/unit/${router.query.id}?chapter=${option.chapter.split(" ")[1]}`, undefined, { shallow: true }); // ✅ 更新 URL
                                            onSelectOption(option);
                                        }}
                                    >
                                        {option.chapter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 按钮 */}
                    <div className="flex flex-rows space-x-12 mt-10">
                        <button
                            onClick={handleAddToCart}
                            className="bg-gray-400 text-white px-12 py-3 hover:bg-gray-500 transition duration-300"
                        >
                            ADD TO CART
                        </button>
                        <button
                            onClick={handleBuyNow}
                            className="bg-white text-black border border-black px-12 py-3 hover:bg-black hover:text-white transition duration-300"
                        >
                            Buy Now
                        </button>
                    </div>
                    <div className="text-gray-600 font-light text-sm mt-6">
                        <p>Format: PDF</p>
                        <p>{selectedOption ? selectedOption.description : description}</p>
                    </div>
                    
                </div>
            </div>

            {/* 第二部分：商品大图 & 更多描述 */}
            <div className="py-10">
                <h2 className="text-2xl font-bold mb-4 border-b border-gray-300">Product Description</h2>
                
            </div>

            {/* Toast 通知 */}
            {showToast && (
                <div className={`fixed top-1/2 right-1/3 text-white bg-gray-600 bg-opacity-75 z-20 p-6 text-sm rounded-lg shadow-md transition-all duration-200" ${
                    fadeOut ? "opacity-0" : "opacity-100"
                }`}
                >
                    {toastMessage}
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
