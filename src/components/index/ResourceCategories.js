import React from 'react';
import { useRef } from 'react';

export default function ResourceCategories() {
    const ref = useRef(null);
    const colors = ["bg-blue-100", "bg-green-100", "bg-yellow-100", "bg-red-100"];
    const categories = [
        {
            title: "AS Biology Mindmaps",
            description: "Structured mindmaps for AS Biology covering key concepts and topics.",
            icon: "/open-book.svg",
            link: "/unit/mindmaps-as-biology",
            type: "Mindmap",
            options: 12
        },
        {
            title: "A2 Biology Mindmaps",
            description: "Detailed mindmaps for A2 Biology to enhance your understanding.",
            icon: "/open-book.svg",
            link: "/unit/mindmaps-a2-biology",
            type: "Mindmap",
            options: 8
        },
        {
            title: "AS Biology Syllabus Analysis",
            description: "Comprehensive syllabus breakdown for AS Biology.",
            icon: "/open-book.svg",
            link: "/unit/syllabus-analysis-as-biology",
            type: "Syllabus" 
        },
        {
            title: "A2 Biology Syllabus Analysis",
            description: "In-depth syllabus analysis for A2 Biology.",
            icon: "/open-book.svg",
            link: "/unit/A2 Syllabus Analysis",
            type: "Syllabus" 
        }];

    return (
        <section id="resource-categories" className="py-16 mb-8 bg-transparent scroll-mt-16 px-12 md:px-12">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold text-darker mb-16">Explore Our Resource Categories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8 md:gap-10 ">
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            className={`w-full max-w-lg h-auto p-8 md:p-12 rounded-lg shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer ${colors[index % colors.length]}`}
                            onClick={() => {
                                if (category.type === "Mindmap") {
                                    // ✅ 如果是 Mindmap，跳转到第一页 Chapter
                                    router.push(`${category.link}?chapter=1`);
                                } else {
                                    // ✅ Syllabus 直接跳转
                                    router.push(category.link);
                                }
                            }}
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
                <h3 className="text-xl text-gray-700 mt-12">...and more to come!</h3>
            </div>
        </section>
    );
}
