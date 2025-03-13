import { useEffect, useState, memo, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { addToCart, saveCart, getCart } from "../lib/cart.js";

const ProductDetail = memo(({ title, description, image, image1, image2, price, type, options, file_path, currentUrl }) => {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState(null);
    const [totalPrice, setTotalPrice] = useState(price || 0);
    const shouldShowOptions = type && type.trim().toLowerCase() !== "syllabus analysis";
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const scrollContainerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const resetTimerRef = useRef(null);

    // 创建图片数组
    const images = [
        image || '/default-product.jpg',
        image1 || image || '/default-product.jpg',
        image2 || image || '/default-product.jpg'
    ].filter(Boolean);

    // 重置到第一张图片
    const resetToFirstImage = useCallback(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        }
    }, []);

    // 重置计时器
    const resetTimer = useCallback(() => {
        if (resetTimerRef.current) {
            clearTimeout(resetTimerRef.current);
        }
        resetTimerRef.current = setTimeout(() => {
            resetToFirstImage();
        }, 5000);
    }, [resetToFirstImage]);

    // 处理用户交互
    const handleUserInteraction = useCallback(() => {
        resetTimer();
    }, [resetTimer]);

    // 初始化重置计时器
    useEffect(() => {
        resetTimer();
        return () => {
            if (resetTimerRef.current) {
                clearTimeout(resetTimerRef.current);
            }
        };
    }, [resetTimer]);

    // 处理鼠标按下事件
    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
        handleUserInteraction();
    };

    // 处理鼠标移动事件
    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
        handleUserInteraction();
    };

    // 处理鼠标释放事件
    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // 处理滚轮滚动
    const handleWheel = useCallback((e) => {
        handleUserInteraction();
    }, [handleUserInteraction]);

    // 监听滚轮事件
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: true });
            return () => {
                container.removeEventListener('wheel', handleWheel);
            };
        }
    }, [handleWheel]);

    // 初始化滚动位置
    useEffect(() => {
        if (scrollContainerRef.current) {
            // 设置初始位置为第一张图片
            scrollContainerRef.current.scrollLeft = 0;
        }
    }, []);

    // 初始化选项
    useEffect(() => {
        if (!options || options.length === 0) return;

        // 从 URL 中获取章节信息
        const urlTitle = decodeURIComponent(currentUrl.split('/unit/')[1]);
        console.log("🔄 初始化章节，URL:", urlTitle);

        // 如果当前选中的选项与 URL 匹配，不需要更新
        if (selectedOption?.title === urlTitle) {
            console.log("📍 当前选项已匹配 URL，跳过更新");
            return;
        }

        // 查找匹配的选项
        const matchingOption = options.find(opt => opt.title === urlTitle);
        if (matchingOption) {
            console.log("✨ 找到对应章节:", matchingOption.title);
            setSelectedOption(matchingOption);
            return;
        }

        // 如果是主页面或找不到对应章节，使用 Chapter All
        const mainOption = options.find(opt => opt.chapter === "Chapter All");
        if (mainOption) {
            console.log("📍 设置默认章节:", mainOption.title);
            setSelectedOption(mainOption);
        }
    }, [options, currentUrl, selectedOption]);

    // 更新价格
    useEffect(() => {
        if (selectedOption && selectedOption.price !== totalPrice) {
            setTotalPrice(selectedOption.price);
        }
    }, [selectedOption, totalPrice]);

    // 处理选项切换
    const handleOptionChange = useCallback(async (option) => {
        if (isLoading || selectedOption?.chapter === option.chapter) return;

        setIsLoading(true);
        console.log("🔄 切换到章节:", option.title);

        try {
            // 构建新的 URL
            const newUrl = option.chapter === "Chapter All"
                ? `/unit/as-mindmap`
                : `/unit/${option.title}`;

            // 同步更新状态和 URL
            setSelectedOption(option);
            
            // 使用 replace 和 shallow routing
            await router.replace(newUrl, undefined, { 
                shallow: true,
                scroll: false 
            });
        } catch (error) {
            console.error("❌ 切换章节失败:", error);
            // 如果失败，回滚状态
            setSelectedOption(selectedOption);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, selectedOption, router]);

    // **查询 study_resources 表，获取正确的 id**
    const getStudyResourceId = async (title) => {
        try {
            let cleanedTitle = title.trim();
            console.log("📌 传入 API 的 title:", cleanedTitle);  

            const response = await fetch(`/api/getstudyresourceid?title=${encodeURIComponent(cleanedTitle)}`);
            const data = await response.json();

            if (!data.id) {
                console.warn(`❌未找到 ${cleanedTitle} 对应的 study_resource_id`);
                return null;
            }

            console.log(`✅ 获取到 studyResourceId: ${data.id}，对应 ${cleanedTitle} `);
            return data.id;
        } catch (error) {
            console.error("❌ 获取 studyResourceId 失败:", error);
            return null;
        }
    };

    const handleAddToCart = async () => {
        // 使用主标题作为商品名称
        const itemTitle = title;
        console.log(`🚀 Trying to add to cart: ${itemTitle}`);

        if (!itemTitle) {
            console.error("❌ 错误: title 为空，无法添加到购物车！");
            return;
        }

        const cleanTitle = itemTitle.trim();
        console.log("📌 handleAddToCart: 传入 API 的 cleanTitle:", cleanTitle);

        // 获取 studyResourceId
        const studyResourceId = await getStudyResourceId(cleanTitle);
        
        if (!studyResourceId) {  
            console.error("❌ 获取 studyResourceId 失败，未能添加到购物车");
            return;
        }
        
        const product = {
            id: studyResourceId, 
            name: title.replace(/\s+Chapter\s+\d+$/, ''), // 移除标题中可能的章节信息
            price: selectedOption ? selectedOption.price : price,
            option: selectedOption ? selectedOption.chapter : "Full",
            image: selectedOption ? selectedOption.image : image,
            file_path: selectedOption ? selectedOption.file_path : file_path
        };

        console.log("✅ 添加到购物车的商品:", product);
        addToCart(product);
        setToastMessage(`${product.name} ${product.option !== "Full" ? product.option : ""} 已添加到购物车！`);
        setShowToast(true);
        setFadeOut(false);

        setTimeout(() => {
            setFadeOut(true);
            setTimeout(() => setShowToast(false), 500);
        }, 2500);
    };

    const handleBuyNow = async () => {
        // 使用主标题作为商品名称
        const itemTitle = title;
        console.log(`🚀 Trying to buy now: ${itemTitle}`);

        if (!itemTitle) {
            console.error("❌ 错误: title 为空，无法购买！");
            return;
        }

        const cleanTitle = itemTitle.trim();
        console.log("📌 handleBuyNow: 传入 API 的 cleanTitle:", cleanTitle);

        // 获取 studyResourceId
        const studyResourceId = await getStudyResourceId(cleanTitle);

        if (!studyResourceId) {
            console.error("❌ 获取 studyResourceId 失败，未能购买");
            return;
        }

        const product = {
            id: studyResourceId,
            name: title.replace(/\s+Chapter\s+\d+$/, ''), // 移除标题中可能的章节信息
            price: selectedOption ? selectedOption.price : price,
            option: selectedOption ? selectedOption.chapter : "Full",
            image: selectedOption ? selectedOption.image : image,
            file_path: selectedOption ? selectedOption.file_path : file_path
        };

        console.log("✅ 准备购买的商品:", product);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 pb-32">
                {/* 左侧商品图片 */}
                <div className="flex items-center justify-center">
                    <div className="relative w-[580px] h-[770px] bg-white overflow-hidden">
                        <div 
                            ref={scrollContainerRef}
                            className="overflow-x-scroll scrollbar-hide absolute inset-0"
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleUserInteraction}
                            onTouchMove={handleUserInteraction}
                            style={{
                                cursor: isDragging ? 'grabbing' : 'grab',
                                userSelect: 'none',
                                scrollBehavior: 'smooth',
                                '-webkit-overflow-scrolling': 'touch',
                                scrollbarWidth: 'none',  /* Firefox */
                                '-ms-overflow-style': 'none',  /* IE and Edge */
                            }}
                        >
                            <style jsx global>{`
                                .scrollbar-hide::-webkit-scrollbar {
                                    display: none;
                                }
                                .scrollbar-hide {
                                    -ms-overflow-style: none;
                                    scrollbar-width: none;
                                }
                            `}</style>
                            <div className="flex" style={{ width: `${images.length * 580}px` }}>
                                {images.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`${title} view ${index + 1}`}
                                        className="w-[580px] h-[770px] object-contain flex-shrink-0"
                                        draggable="false"
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="absolute bottom-0 left-1/2 transform -translate-x-1/2 font-light tracking-wide text-gray-600">
                            Swipe Image to View Details
                        </p>
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 右侧商品详情 */}
                <div className="mt-32">
                    <p key={selectedOption?.title || title} className="text-2xl font-normal">
                        {selectedOption?.title || title}
                    </p>
                    <p className="text-xl text-gray-800">
                        $ {typeof totalPrice === "number" ? totalPrice.toFixed(2) : "0.00"}
                    </p>

                    {/* 款式选择 */}
                    {options && shouldShowOptions && (
                        <div className="space-y-4 mt-8">
                            <label className="">OPTION</label>
                            <div className="grid grid-cols-5">
                                {options.map((option) => (
                                    <button
                                        key={option.title}
                                        disabled={isLoading}
                                        className={`px-2 py-3 border transition ${
                                            selectedOption?.chapter === option.chapter
                                                ? "bg-white text-sm text-gray-800 border-2 border-gray-900"
                                                : "bg-white text-sm text-gray-800 border-gray-300 hover:border-2 hover:border-gray-900"
                                        } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                                        onClick={() => handleOptionChange(option)}
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
});

export default ProductDetail;
