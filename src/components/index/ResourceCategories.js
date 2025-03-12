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
        <section id="resource-categories" className="bg-white scroll-mt-12">
            <div className="flex justify-center items-center">
                <h2 className="w-2/5 text-2xl sm:text-3xl md:text-4xl lg:text-7xl font-normal tracking-wider text-darker mb-16">
                    BEST SELLERS
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8 md:gap-10 w-3/5">
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            className="w-full max-w-lg h-auto p-8 md:p-12 rounded-lg shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer bg-white"
                            onClick={() => router.push(`/product/${product.id}`)}
                        >
                            <img
                                src={product.image || '/default-product.jpg'}
                                alt={product.title}
                                className="w-full h-48 object-cover mb-4 rounded-lg"
                            />
                            <h3 className="font-semibold mb-4 text-lg sm:text-xl">{product.title}</h3>
                            <p className="text-xl font-bold text-blue-600">${product.price}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ResourceCategories;
