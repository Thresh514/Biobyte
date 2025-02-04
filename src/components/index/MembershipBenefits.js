import React, { useState } from 'react';

export default function MembershipBenefits() {
    const benefits = [
        {
            title: 'Unlimited Resource Downloads',
            description: 'Members can download all learning resources on the platform without limits, gaining new knowledge anytime and anywhere.',
            details: 'In addition to regular resources, members can also get priority access to the latest study materials, ensuring they learn the most up-to-date content.',
            icon: '/unlimited.svg'
        },
        {
            title: 'Exclusive Study Plan',
            description: 'A personalized study plan tailored to your learning goals and progress, helping you study efficiently.',
            details: 'Our study plans are adjusted based on your feedback and progress to ensure the plan suits your learning pace.',
            icon: '/study-plan.svg'
        },
        {
            title: 'Ad-Free Pure Experience',
            description: 'Members will enjoy an ad-free learning environment, focusing solely on self-improvement.',
            details: 'Say goodbye to pop-up ads and interruptions, allowing you to learn efficiently in a clean and focused environment.',
            icon: '/ad-block-icon.svg'
        },
        {
            title: 'Expert Q&A Support',
            description: 'Members can ask experts questions and receive one-on-one support to solve any learning challenges.',
            details: 'Our team of experts is always on standby to answer any questions you encounter during your learning journey.',
            icon: '/expert-icon.svg'
        }
    ];

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-semibold text-darker mb-12">Why Membership?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8"> {/*网格布局：默认一列，屏幕宽度大于640px时为两列，768px以上为四列*/}
                    {benefits.map((benefit, index) => (
                        <div
                            key={index}
                            className="bg-white p-6 rounded-lg shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                        >
                            <img
                                src={benefit.icon}
                                alt={benefit.title}
                                className="w-16 h-16 mx-auto mb-4"
                            />
                            <h3 className="text-xl font-semibold text-darker mb-4">{benefit.title}</h3>
                            <p className="text-gray-600 mb-4">{benefit.description}</p>
                            <p className="text-gray-500">{benefit.details}</p>
                            </div>
                        ))}
                    </div>
                </div>
        </section>
    );
}
