import React, {useState, useEffect} from 'react';
import testimonialsData from '../../lib/SuccessStoriesSheet.json';

const SuccessStories = () => {
    const [testimonials, setTestimonials] = useState([]);

    useEffect(() => {
        // 只在客户端执行随机化
        const shuffled = [...testimonialsData].sort(() => 0.5 - Math.random()).slice(0, 3);
        setTestimonials(shuffled);
    }, []);
    return (
        <section id= "SuccessStories" className="hidden py-16 bg-white px-16 md:px-12 scroll-mt-16">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-semibold text-darker mb-12">User Reviews</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
            <div
                key={testimonial.id}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
                <img
                    src={testimonial.avatar}
                    alt={`${testimonial.name}头像`}
                    className="w-24 h-24 mx-auto rounded-full mb-4"
                />
                <h3 className="text-xl font-semibold text-darker mb-2">{testimonial.name}</h3>
                <p className="text-gray-600 mb-4">{testimonial.review}</p>
                <div className="text-sm text-gray-500">
                    完成笔记数：<span className="font-semibold">{testimonial.completedNotes}</span>
                </div>
            </div>
            ))}
        </div>
        </div>
    </section>
    );
};

export default SuccessStories;
    