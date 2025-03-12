import React from 'react';
import { useRouter } from 'next/router';

const ResourceCategories = () => {
    const router = useRouter();

    const colors = ["bg-blue-100", "bg-green-100", "bg-yellow-100", "bg-red-100"];

    const categories = [
        {
            title: "AS Biology Mindmaps",
            description: "Structured mindmaps for AS Biology covering key concepts and topics.",
            icon: "/open-book.svg",
            link: "/unit/as-mindmap",
        },
        {
            title: "A2 Biology Mindmaps",
            description: "Detailed mindmaps for A2 Biology to enhance your understanding.",
            icon: "/open-book.svg",
            link: "/unit/a2-mindmap",
        },
        {
            title: "AS Biology Syllabus Analysis",
            description: "Comprehensive syllabus breakdown for AS Biology.",
            icon: "/open-book.svg",
            link: "/unit/as-syllabus-analysis",
        },
        {
            title: "A2 Biology Syllabus Analysis",
            description: "In-depth syllabus analysis for A2 Biology.",
            icon: "/open-book.svg",
            link: "/unit/a2-syllabus-analysis",
        },
    ];

    return (
        <section id= "resource-categories" className="bg-white scroll-mt-12">
        <div className="flex justify-center items-center">
            <h2 className="w-2/5 text-2xl sm:text-3xl md:text-4xl lg:text-7xl font-normal tracking-wider text-darker mb-16">
                BEST SELLERS
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 md:gap-10 w-3/5">
                {categories.map((category, index) => (
                    <div
                        key={index}
                        className={`w-full max-w-lg h-auto p-8 md:p-12 rounded-lg shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer ${colors[index % colors.length]}`}
                        onClick={() => router.push(category.link)}
                    >
                        <img
                            src={category.icon}
                            alt={category.title}
                            className="w-16 h-16 mx-auto mb-4"
                        />
                        <h3 className="font-semibold mb-4 text-lg sm:text-xl">{category.title}</h3>
                        <p className="text-gray-600 text-sm sm:text-base">{category.description}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
    );
};

export default ResourceCategories;
