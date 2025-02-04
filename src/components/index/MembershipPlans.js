import React from 'react';

export default function MembershipPlans() {
    const plans = [
        {
            title: 'Monthly Membership',
            price: '$10',
            description: 'Access to all resources for one month.',
            popular: false
        },
        {
            title: 'Quarterly Membership',
            price: '$25',
            description: 'Access to all resources for three months.',
            popular: false
        },
        {
            title: 'Annual Membership',
            price: '$80',
            description: 'Access to all resources for one year.',
            popular: true // Highlight this plan as "Most Popular"
        }
    ];

    // Function to handle redirection to the payment page
    const handlePlanClick = (plan) => {
        window.location.href = '#payment'; // Redirect to payment page
    };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-semibold text-darker mb-12">Choose Your Membership Plan</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative bg-white p-6 rounded-lg shadow-lg transition-all hover:scale-105 hover:shadow-xl ${plan.popular ? 'border-4 border-yellow-500' : ''}`}
                            onClick={() => handlePlanClick(plan)}
                        >
                            {plan.popular&& (
                                <span className="absolute top-0 right-0 bg-yellow-500 text-white px-4 py-1 rounded-bl-lg text-sm font-semibold">
                                    Most Popular
                                </span>
                            )}
                            <h3 className="text-xl font-semibold text-darker mb-4">{plan.title}</h3>
                            <p className="text-2xl font-bold text-darker mb-4">{plan.price}</p>
                            <p className="text-gray-600 mb-4">{plan.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
