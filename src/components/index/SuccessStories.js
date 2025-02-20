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
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-semibold text-darker mb-12">User Reviews</h2>
        
        {/* 展示每个用户的评价 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
            <div
                key={testimonial.id}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              {/* 用户头像 */}
                <img
                    src={testimonial.avatar}
                    alt={`${testimonial.name}头像`}
                    className="w-24 h-24 mx-auto rounded-full mb-4"
                />
                {/* 用户名字 */}
                <h3 className="text-xl font-semibold text-darker mb-2">{testimonial.name}</h3>
                {/* 用户评价 */}
                <p className="text-gray-600 mb-4">{testimonial.review}</p>
                {/* 用户学习数据 */}
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
    