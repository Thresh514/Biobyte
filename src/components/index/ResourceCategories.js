import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

const ResourceCategories = () => {
    const router = useRouter();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('/api/getRandomProducts');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    const handleProductClick = (product) => {
        // 根据产品类型和级别构建URL
        let urlTitle;
        if (product.type === 'Mindmap') {
            // 处理Mindmap的特殊情况
            const level = product.level.toLowerCase();
            if (product.chapter && product.chapter !== 'All') {
                // 如果有具体章节，使用完整标题
                urlTitle = `${product.level} Mindmap Chapter ${product.chapter}`;
            } else {
                // 如果是主页面或Chapter All
                urlTitle = `${level}-mindmap`;
            }
        } else if (product.type === 'Syllabus Analysis') {
            urlTitle = `${product.level.toLowerCase()}-syllabus-analysis`;
        } else {
            // 如果没有特定格式，直接使用标题
            urlTitle = product.title;
        }
        console.log("🔍 跳转到URL:", `/unit/${encodeURIComponent(urlTitle)}`);
        router.push(`/unit/${encodeURIComponent(urlTitle)}`);
    };

    return (
        <section id="resource-categories" className="bg-white scroll-mt-12 py-12 md:py-24 px-4 md:px-0">
            <div className="flex flex-col md:flex-row md:space-x-48">
                <div className='w-full md:w-1/3 flex-col space-y-4 md:space-y-12 mb-8 md:mb-0'>
                    <h2 className="text-4xl mt-6 md:mt-12 lg:text-7xl font-normal tracking-wide text-black">
                        Best Sellers
                    </h2>
                    <p className="text-sm md:text-base">Transform your home or office with our gorgeous best selling seasonal arrangements.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 w-full md:w-2/3">
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className="relative cursor-pointer bg-white group"
                            onClick={() => handleProductClick(product)}
                        >
                            <div className="relative w-full h-80 md:h-80 mb-3">
                                <Image
                                    src={product.image || '/default-product.jpg'}
                                    alt={product.title}
                                    fill
                                    quality={80}
                                    className="object-contain"
                                />
                            </div>
                            <button
                                className='absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-black text-xs text-white font-normal tracking-wide hidden md:group-hover:block transition-opacity duration-300 p-3'
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleProductClick(product);
                                }}
                            >
                                QUICK VIEW
                            </button>
                            <h3 className="font-light tracking-wide text-md text-center md:text-start">{product.title}</h3>
                            <p className="text-sm font-light tracking-wide text-gray-600 text-center md:text-start">${product.price}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ResourceCategories;
