import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import Image from 'next/image';

const AboutPage = () => {
    useEffect(() => {
        document.body.classList.add('fade-in');
        return () => {
            document.body.classList.remove('fade-in');
        };
    }, []);

const teamRef = useRef(null);
const isInView = useInView(teamRef, { once: true, margin: "-100px 0px" });

    return (
        <div className="min-h-screen bg-white text-darker w-auto mx-auto">
            {/* Hero Section */}
            <section className="text-darkest sm:py-32">
                <p className="text-4xl md:text-7xl mb-4 ml-8">About Us</p>
                <img src="aboutbg-compress.jpg" alt="About Background" />
            </section>

            {/* Our Mission Section */}
            <section className="">
                <div className="max-w-7xl mx-auto px-6 flex md:justify-end ">
                    <div className="w-1/2 p-6">
                        <p className="text-3xl font-light leading-tigh tracking-wide">
                            At BioByte, we are committed to making learning easier, faster, and more
                            accessible for students worldwide.
                        </p>
                        <p className="text leading-relaxed">
                            Our journey started with a simple idea: to bridge the gap between students
                            and high-quality learning resources. Founded by a team of experienced educators
                            and technologists, we saw how many students struggle to find comprehensive and affordable materials.
                        </p>
                        <p className="text leading-relaxed">
                            Today, our platform supports thousands of students worldwide, offering
                            expertly curated resources for IGCSE, A-Level, and beyond—ensuring that
                            every learner has the tools they need to succeed.
                        </p>
                        <div className="mt-6">
                            <a href="#" className="text-lg font-light hover:underline tracking-wide block">→ Explore Our Resources</a>
                            <a href="#" className="text-lg font-light hover:underline tracking-wide block mt-2">→ How It Works</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Team */}
            <section ref={teamRef} className="py-20 sm:py-32" >
                <p className="text-4xl md:text-7xl mb-4 ml-8">Our Team</p>
                <div className="bg-black bg-opacity-[88%] py-32 flex flex-col">
                    <motion.div
                        initial={{ opacity: 0, x: 500 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 1, x: 500 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="flex items-center justify-center text-white"
                    >
                        <div className="relative w-64 h-64">
                            <Image 
                                src="/team1.jpg" 
                                alt="Team Member1" 
                                fill
                                quality={80}
                                className="object-cover rounded-sm"
                            />
                        </div>
                        <div className="flex flex-col justify-center tracking-wider p-20 ml-32 space-y-8">
                            <h3 className="text-2xl font-light ">Jiayong Tu</h3>
                            <p className="text-sm mt-2 font-light italic">Frontend Developer</p>
                            <p className="text-sm mt-2 font-light">Email: tonytudaodao@gmail.com</p>
                            <div className="flex space-x-8">
                                <a href="https://www.linkedin.com/in/jiayongtu/" target="_blank">
                                    <div className="relative w-12 h-12">
                                        <Image 
                                            src="/linkedin.svg" 
                                            alt="linkedin" 
                                            fill
                                            quality={80}
                                            className="bg-white rounded-lg hover:scale-105 transition duration-300"
                                        />
                                    </div>
                                </a>
                                <a href="https://github.com/Thresh514" target="_blank">
                                    <div className="relative w-12 h-12">
                                        <Image 
                                            src="/github.svg" 
                                            alt="github" 
                                            fill
                                            quality={80}
                                            className="bg-white rounded-lg hover:scale-105 transition duration-300"
                                        />
                                    </div>
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -500 }}
                        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 1, x: -500 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="flex items-center justify-center text-white flex-row-reverse"
                    >
                        <div className="relative w-64 h-64">
                            <Image 
                                src="/team2.jpg" 
                                alt="Team Member2" 
                                fill
                                quality={80}
                                className="object-cover rounded-sm"
                            />
                        </div>
                        <div className="flex flex-col justify-center tracking-wider p-20 mr-32 space-y-8">
                            <h3 className="text-2xl font-light ">Kunyu Zheng</h3>
                            <p className="text-sm mt-2 font-light italic">Backend Developer</p>
                            <p className="text-sm font-light">Email: zzzzky999@gmail.com</p>
                            <div className="flex space-x-8">
                                <a href="/" target="_blank">
                                    <div className="relative w-12 h-12">
                                        <Image 
                                            src="/linkedin.svg" 
                                            alt="linkedin" 
                                            fill
                                            quality={80}
                                            className="bg-white rounded-lg hover:scale-105 transition duration-300"
                                        />
                                    </div>
                                </a>
                                <a href="/" target="_blank">
                                    <div className="relative w-12 h-12">
                                        <Image 
                                            src="/github.svg" 
                                            alt="github" 
                                            fill
                                            quality={80}
                                            className="bg-white rounded-lg hover:scale-105 transition duration-300"
                                        />
                                    </div>
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
