import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import Image from 'next/image';
import Link from 'next/link';

const MembershipPage = () => {
    useEffect(() => {
        document.body.classList.add('fade-in');
        return () => {
            document.body.classList.remove('fade-in');
        };
    }, []);

    const benefitsRef = useRef(null);
    const isInView = useInView(benefitsRef, { once: true, margin: "-100px 0px" });

    return (
        <div className="min-h-screen bg-white text-darker w-auto mx-auto space-y-16 md:space-y-24">
            {/* Hero Section */}
            <section className="text-darkest relative">
                <div className="flex items-start">
                    <h1 className="text-4xl md:text-7xl md:mb-4 mb-2 font-normal md:mt-32 md:ml-12 ml-4 tracking-wide">Membership</h1>
                </div>
                <div className="relative h-[500px] md:h-screen w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 opacity-90"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h2 className="text-3xl md:text-6xl font-light text-white tracking-wider text-center px-8">
                            Unlock Unlimited Access to All Resources
                        </h2>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section ref={benefitsRef} className="py-16 md:pb-32 md:pt-24">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-7xl mb-12 md:mb-16 ml-4 md:ml-8 font-normal tracking-wide"
                    >
                        Membership Benefits
                    </motion.h2>

                    {/* Benefit 1: Free Access to All Resources */}
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="mb-16 md:mb-24"
                    >
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                            <div className="flex-1 p-6 md:p-8 border-l-4 border-purple-500 md:border-l-8">
                                <h3 className="text-2xl md:text-4xl font-light mb-4 md:mb-6 tracking-wide">
                                    Free Access to All Resources
                                </h3>
                                <p className="text-sm md:text-lg font-light leading-relaxed mb-4">
                                    Get unlimited access to all study materials on our platform. Download mindmaps, 
                                    syllabus analysis, and all premium content without any restrictions.
                                </p>
                                <p className="text-sm md:text-md font-light leading-relaxed text-gray-700">
                                    No more pay-per-download. Everything is included with your membership.
                                </p>
                            </div>
                            <div className="w-full md:w-1/3 flex justify-center">
                                <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center border-2 border-purple-300">
                                    <svg className="w-32 h-32 md:w-40 md:h-40 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Benefit 2: Unlimited AI Tutor */}
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="mb-16 md:mb-24"
                    >
                        <div className="flex flex-col md:flex-row-reverse items-center md:items-start gap-8 md:gap-12">
                            <div className="flex-1 p-6 md:p-8 border-r-4 border-orange-500 md:border-r-8">
                                <h3 className="text-2xl md:text-4xl font-light mb-4 md:mb-6 tracking-wide">
                                    Unlimited AI Tutor Access
                                </h3>
                                <p className="text-sm md:text-lg font-light leading-relaxed mb-4">
                                    Get unlimited access to our AI tutor feature. Ask questions anytime, 
                                    get instant help with your biology studies, and receive personalized 
                                    explanations without any usage limits.
                                </p>
                                <p className="text-sm md:text-md font-light leading-relaxed text-gray-700">
                                    24/7 support from our intelligent tutoring system. Learn at your own pace, 
                                    whenever you need help.
                                </p>
                            </div>
                            <div className="w-full md:w-1/3 flex justify-center">
                                <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center border-2 border-orange-300">
                                    <svg className="w-32 h-32 md:w-40 md:h-40 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 py-20 md:py-32">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-3xl md:text-5xl font-light text-white mb-6 md:mb-8 tracking-wide"
                    >
                        Ready to Get Started?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-lg md:text-xl font-light text-white mb-8 md:mb-12 leading-relaxed"
                    >
                        Join thousands of students who are already benefiting from our membership program.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <Link href="/dashboard">
                            <button className="bg-white text-black px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl font-light tracking-wider hover:bg-gray-100 transition duration-300 border-2 border-white">
                                Get Started Now
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default MembershipPage;
