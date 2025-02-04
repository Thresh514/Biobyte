import React from 'react';

export default function ResourceCategories() {
    const categories = [
        {
            title: 'Mathematics',
            description: 'Access resources for mastering Mathematics, including step-by-step tutorials, practice problems, and test prep materials.',
            icon: '/open-book.svg',
            link: '#resources/mathematics'
        },
        {
            title: 'Chemistry',
            description: 'Explore a variety of Chemistry resources, from basic concepts to complex chemical reactions, to help you succeed in your studies.',
            icon: '/open-book.svg',
            link: '#resources/chemistry'
        },
        {
            title: 'Physics',
            description: 'Dive into Physics with resources covering fundamental principles, advanced theories, and problem-solving strategies.',
            icon: '/open-book.svg',
            link: '#resources/physics'
        },
        {
            title: 'Computer Science',
            description: 'Find Computer Science resources that cover programming, algorithms, and problem-solving to help you excel in your studies.',
            icon: '/open-book.svg',
            link: '#resources/computer-science'
        },
        {
            title: 'Economics',
            description: 'Explore Economics resources to understand market structures, financial systems, and economic theory for your academic success.',
            icon: '/open-book.svg',
            link: '#resources/economics'
        },
        {
            title: 'Biology',
            description: 'Master Biology concepts with resources on genetics, ecosystems, and human biology, ideal for students preparing for exams.',
            icon: '/open-book.svg',
            link: '#resources/biology'
        }
    ];

    return (
        <section className="py-16 bg-transparent">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-semibold text-darker mb-12">Explore Our Resource Categories</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-8">
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-lg shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer"
                            onClick={() => window.location.href = category.link}
                        >
                            <img
                                src={category.icon}
                                alt={category.title}
                                className="w-16 h-16 mx-auto mb-4"
                            />
                            <h3 className="text-xl font-semibold text-darker mb-4">{category.title}</h3>
                            <p className="text-gray-600">{category.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
