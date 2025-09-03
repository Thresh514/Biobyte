import { useEffect, useState, memo, useCallback, useRef } from "react";
import { useRouter } from "next/router";

import Image from 'next/image';

const ProductDetail = memo(({ title, description, image, image1, image2, price, type, options, file_path, currentUrl }) => {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState(null);
    const [totalPrice, setTotalPrice] = useState(price || 0);
    const shouldShowOptions = type && type.trim().toLowerCase() !== "syllabus analysis";

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
        if (selectedOption) {
            setTotalPrice(selectedOption.price);
        } else {
            setTotalPrice(price || 0);
        }
    }, [selectedOption, price]);

    // 处理选项切换
    const handleOptionChange = useCallback(async (option) => {
        if (isLoading || selectedOption?.chapter === option.chapter) return;

        setIsLoading(true);
        console.log("🔄 切换到章节:", option.title);

        try {
            // 从当前标题中提取 level（AS 或 A2）
            const currentLevel = title.startsWith('AS') ? 'as' : 'a2';
            
            // 构建新的 URL
            const newUrl = option.chapter === "Chapter All"
                ? `/unit/${currentLevel}-mindmap`  // 使用当前 level 构建 URL
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
    }, [isLoading, selectedOption, router, title]);

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

    const handleView = async () => {
        // 直接使用当前URL的路径参数
        const currentPath = currentUrl || router.asPath;
        console.log(`🚀 当前URL路径: ${currentPath}`);
        
        // 从URL中提取参数，例如: /unit/AS%20Mindmap%20Chapter%202 -> AS Mindmap Chapter 2
        const urlParam = currentPath.split('/unit/')[1];
        if (!urlParam) {
            console.error("❌ 无法从URL中提取参数");
            return;
        }
        
        const decodedParam = decodeURIComponent(urlParam);
        console.log("📌 解码后的URL参数:", decodedParam);
        
        // 构建view路由URL，直接传递URL参数
        const viewUrl = `/view/${encodeURIComponent(decodedParam)}`;
        console.log("✅ 跳转到查看页面:", viewUrl);
        
        // 跳转到view页面
        router.push(viewUrl);
    };



    if (!title) {
        return <div>加载中...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-0">
            {/* 移动端垂直布局 */}
            <div className="block md:hidden">
                {/* 商品图片 */}
                <div className="mb-6">
                    <div className="relative w-full h-[550px] bg-white overflow-hidden">
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
                            <div className="flex w-auto" >
                                {images.map((img, index) => (
                                    <div key={index} className="relative w-full h-[550px] flex-shrink-0">
                                        <Image
                                            src={img}
                                            alt={`${title} view ${index + 1}`}
                                            fill
                                            quality={80}
                                            priority={index === 0}
                                            className="object-contain"
                                            draggable={false}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="absolute bottom-2 p-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-light tracking-wide">
                            Scroll to view details
                        </p>
                    </div>
                </div>

                {/* 标题和价格 */}
                <div className="mb-6">
                    <h1 className="text-xl font-normal mb-2">
                        {selectedOption?.title || title}
                    </h1>
                    <p className="text-lg text-gray-800 font-light">
                        $ {typeof totalPrice === "number" ? totalPrice.toFixed(2) : "0.00"}
                    </p>
                </div>

                {/* 款式选择 */}
                {options && shouldShowOptions && (
                    <div className="mb-6">
                        <p className="text-sm mb-2 uppercase tracking-wide">OPTION</p>
                        <div className="grid grid-cols-4 gap-0">
                            {options.map((option) => (
                                <button
                                    key={option.title}
                                    disabled={isLoading}
                                    className={`px-2 py-2 border text-sm transition ${
                                        selectedOption?.chapter === option.chapter
                                            ? "bg-white text-gray-800 border-2 border-gray-900"
                                            : "bg-white text-gray-800 border-gray-300 hover:border-gray-900"
                                    } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                                    onClick={() => handleOptionChange(option)}
                                >
                                    {option.chapter}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 商品描述 */}
                <div className="mb-6 text-gray-600 font-light text-sm">
                    <p>Format: PDF</p>
                    <p>{selectedOption ? selectedOption.description : description}</p>
                </div>

                {/* 查看按钮 */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <button
                        onClick={handleView}
                        className="bg-gray-400 text-white py-3 text-sm hover:bg-gray-500 transition duration-300"
                    >
                        VIEW
                    </button>
                    <button
                        onClick={handleView}
                        className="bg-white text-black border border-black py-3 text-sm hover:bg-black hover:text-white transition duration-300"
                    >
                        VIEW
                    </button>
                </div>
            </div>

            {/* 桌面端双列布局 */}
            <div className="hidden md:grid md:grid-cols-2 gap-20 pb-32">
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
                                    <div key={index} className="relative w-[580px] h-[770px] flex-shrink-0">
                                        <Image
                                            src={img}
                                            alt={`${title} view ${index + 1}`}
                                            fill
                                            quality={80}
                                            priority={index === 0}
                                            className="object-contain"
                                            draggable={false}
                                        />
                                    </div>
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
                            onClick={handleView}
                            className="bg-gray-400 text-white px-12 py-3 hover:bg-gray-500 transition duration-300"
                        >
                            VIEW
                        </button>
                        <button
                            onClick={handleView}
                            className="bg-white text-black border border-black px-12 py-3 hover:bg-black hover:text-white transition duration-300"
                        >
                            VIEW
                        </button>
                    </div>
                    <div className="text-gray-600 font-light text-sm mt-6">
                        <p>Format: PDF</p>
                        <p>{selectedOption ? selectedOption.description : description}</p>
                    </div>
                    
                </div>
            </div>


        </div>
    );
});

export default ProductDetail;
