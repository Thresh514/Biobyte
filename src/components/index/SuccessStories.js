import React from 'react';

const testimonials = [
    {
        id: 1,
        name: 'John Doe',
        avatar: '/head.svg',
        review: 'I used the platform’s A-Level math and physics notes, and it made a huge difference in my studies. The clear explanations and detailed examples helped me grasp difficult concepts and significantly improved my exam performance. I ended up raising my grades by 200 points, and I couldn’t be more grateful for the resources available!',
        completedNotes: 30
    },
    {
        id: 2,
        name: 'Emily Smith',
        avatar: '/head.svg',
        review: 'The platform’s IGCSE chemistry and biology resources were a lifesaver for me. The study guides were comprehensive, and the practice questions gave me a great understanding of what to expect in the exams. Thanks to these materials, I was able to ace my IGCSEs and feel fully prepared for my next academic steps.',
        completedNotes: 25
    },
    {
        id: 3,
        name: 'Michael Johnson',
        avatar: '/head.svg',
        review: 'I’ve been using the platform’s A-Level English literature notes and found them extremely helpful. The detailed analysis of the texts and themes, along with the exam tips, allowed me to improve my writing and critical thinking skills. My grade improved by 2 points, and I now feel much more confident in tackling A-Level exams.',
        completedNotes: 18
    }    
];

export default function SuccessStories() {
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
}
