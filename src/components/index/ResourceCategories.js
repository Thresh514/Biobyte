import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

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

    return (
        <section id="resource-categories" className="bg-white scroll-mt-12 py-40 px-16">
            <div className="flex">
                <div className='w-1/2 flex-col space-y-12'>
                <h2 className="text-2xl mt-12 sm:text-3xl md:text-4xl lg:text-7xl items-start justify-start font-normal tracking-wide text-darker ">
                    Best Sellers
                </h2>
                <p>Transform your home or office with our gorgeous <br></br> best selling seasonal arrangements.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 md:gap-10 w-1/2">
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className="relative w-full h-auto cursor-pointer bg-white group"
                            onClick={() => router.push(`/product/${product.id}`)}
                        >
                            <img
                                src={product.image || '/default-product.jpg'}
                                alt={product.title}
                                className="w-full w-[300px] h-[450px] object-cover mb-4"
                            />
                            <button
                                className='absolute bottom-24 left-16 bg-black text-xs text-white font-normal tracking-wide hidden group-hover:block transition-opacity duration-300 p-4'
                                onClick={() => router.push(`/product/${product.id}`)}
                            >
                                QUICK VIEW
                            </button>
                            <h3 className="font-light tracking-wide text-md">{product.title}</h3>
                            <p className="text-sm font-light text-gray-600">${product.price}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ResourceCategories;
