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
            link: "#resources/mindmaps/as-biology"
        },
        {
            title: "A2 Biology Mindmaps",
            description: "Detailed mindmaps for A2 Biology to enhance your understanding.",
            icon: "/open-book.svg",
            link: "#resources/mindmaps/a2-biology"
        },
        {
            title: "AS Biology Syllabus Analysis",
            description: "Comprehensive syllabus breakdown for AS Biology.",
            icon: "/open-book.svg",
            link: "#resources/syllabus-analysis/as-biology"
        },
        {
            title: "A2 Biology Syllabus Analysis",
            description: "In-depth syllabus analysis for A2 Biology.",
            icon: "/open-book.svg",
            link: "#resources/syllabus-analysis/a2-biology"
        }];

    return (
        <section id="resource-categories" className="py-16 mb-8 bg-transparent">
            <div className="max-sw-7xl mx-auto text-center">
                <h2 className="text-3xl font-semibold text-darker mb-20">Explore Our Resource Categories</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-10">
                    {categories.map((category, index) => (
                        <div
                            key={index}
                            className={`max-w-[400px] max-h-[400px] bg-white p-12 rounded-lg shadow-lg transition-all hover:scale-105 hover:shadow-xl cursor-pointer ${colors[index % colors.length]}`}
                            onClick={() => window.location.href = category.link}
                        >
                            <img
                                src={category.icon}
                                alt={category.title}
                                className="w-16 h-16 mx-auto mb-4"
                            />
                            <h3 className="text-xl font-semibold mb-4">{category.title}</h3>
                            <p className="text-gray-600">{category.description}</p>
                        </div>
                    ))}
                </div>
                <h3 className="text-xl text-gray-700 mt-12">...and more to come!</h3>
            </div>
        </section>
    );
}
