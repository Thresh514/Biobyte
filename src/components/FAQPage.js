import React from 'react';
import FAQSheet from '../lib/FAQSheet.json'

const FAQPage = () => {
    return (
        <main className="max-w-5xl mx-auto px-6 py-12">
            <h1 className="text-4xl font-bold text-left mb-10">Frequently Asked Questions</h1>
            <div className="space-y-6">
                {FAQSheet.map((faq, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold text-darker mb-2">{faq.question}</h2>
                        <p className="text-gray-700">{faq.answer}</p>
                    </div>
                ))}
            </div>
        </main>
    );
};

export default FAQPage;
