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
        <div className="min-h-screen bg-white text-darker w-auto mx-auto space-y-16 md:space-y-24">
            {/* Hero Section */}
            <section className="text-darkest relative">
                <div className="flex items-start">
                    <h1 className="text-4xl md:text-7xl md:mb-4 mb-2 font-normal md:mt-32 md:ml-12 ml-4 tracking-wide">About Us</h1>
                </div>
                <div className="relative h-[500px] md:h-screen w-full overflow-hidden">
                    <Image 
                        src="/aboutbg-compress.jpg"
                        alt="About Background"
                        fill
                        priority
                        quality={80}
                        className="object-cover object-center scale-[1.2] sm:scale-100"
                    />
                </div>
            </section>

            {/* Our Mission Section */}
            <section className="">
                <div className="max-w-7xl mx-auto px-6 flex md:justify-end ">
                    <div className="md:w-1/2 w-full p-6">
                        <p className="md:text-3xl text-xl font-light leading-tigh tracking-wide">
                            At BioByte, we are committed to making learning easier, faster, and more
                            accessible for students worldwide.
                        </p>
                        <p className="text-sm md:text-md leading-relaxed">
                            Our journey started with a simple idea: to bridge the gap between students
                            and high-quality learning resources. Founded by a team of experienced educators
                            and technologists, we saw how many students struggle to find comprehensive and affordable materials.
                        </p>
                        <p className="text-sm md:text-md leading-relaxed">
                            Today, our platform supports thousands of students worldwide, offering
                            expertly curated resources for IGCSE, A-Level, and beyond—ensuring that
                            every learner has the tools they need to succeed.
                        </p>
                        <div className="mt-6">
                            <a href="#" className="md:text-lg text-md font-light hover:underline tracking-wide block">→ Explore Our Resources</a>
                            <a href="#" className="md:text-lg text-md font-light hover:underline tracking-wide block mt-2">→ How It Works</a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Team */}
            <section ref={teamRef} className="py-16 md:pb-32 md:pt-24" >
                <p className="text-4xl md:text-7xl mb-4 ml-8">Our Team</p>
                <div className="bg-black bg-opacity-[88%] py-20 md:py-32">
                    {/* 移动端显示 */}
                    <div className="flex flex-col space-y-24 md:hidden">
                        <div className="flex flex-col items-center justify-center text-white space-y-8">
                            <div className="relative w-48 h-48">
                                <Image 
                                    src="/team11.jpg" 
                                    alt="Team Member1" 
                                    fill
                                    quality={80}
                                    className="object-cover rounded-sm"
                                />
                            </div>
                            <div className="flex flex-col justify-center items-center tracking-wider p-4 space-y-4">
                                <h3 className="md:text-2xl text-xl font-light">Jiayong Tu</h3>
                                <p className="md:text-sm text-xs font-light italic">Frontend Developer</p>
                                <p className="md:text-sm text-xs font-light">Email: tonytudaodao@gmail.com</p>
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
                        </div>

                        <div className="flex flex-col items-center justify-center text-white space-y-8">
                            <div className="relative w-48 h-48">
                                <Image 
                                    src="/team21.jpg" 
                                    alt="Team Member2" 
                                    fill
                                    quality={80}
                                    className="object-cover rounded-sm"
                                />
                            </div>
                            <div className="flex flex-col justify-center items-center tracking-wider p-4 space-y-4">
                                <h3 className="md:text-2xl text-xl font-light">Kunyu Zheng</h3>
                                <p className="md:text-sm text-xs font-light italic">Backend Developer</p>
                                <p className="md:text-sm text-xs font-light">Email: zzzzky999@gmail.com</p>
                                <div className="flex space-x-8">
                                    <a href="https://www.linkedin.com/in/kunyu-zheng-0153ba348/" target="_blank">
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
                                    <a href="https://github.com/kyu-z" target="_blank">
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
                        </div>
                    </div>

                    {/* 桌面端显示 */}
                    <div className="hidden md:flex md:flex-col space-y-24">
                        <motion.div
                            initial={{ opacity: 0, x: 500 }}
                            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 1, x: 500 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="flex items-center justify-center text-white"
                        >
                            <div className="relative w-64 h-64">
                                <Image 
                                    src="/team11.jpg" 
                                    alt="Team Member1" 
                                    fill
                                    quality={80}
                                    className="object-cover rounded-sm"
                                />
                            </div>
                            <div className="flex flex-col justify-center tracking-wider p-20 ml-32 space-y-8">
                                <h3 className="text-2xl font-light">Jiayong Tu</h3>
                                <p className="text-sm font-light italic">Frontend Developer</p>
                                <p className="text-sm font-light">Email: tonytudaodao@gmail.com</p>
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
                                    src="/team21.jpg" 
                                    alt="Team Member2" 
                                    fill
                                    quality={80}
                                    className="object-cover rounded-sm"
                                />
                            </div>
                            <div className="flex flex-col justify-center tracking-wider p-20 mr-32 space-y-8">
                                <h3 className="text-2xl font-light">Kunyu Zheng</h3>
                                <p className="text-sm font-light italic">Backend Developer</p>
                                <p className="text-sm font-light">Email: zzzzky999@gmail.com</p>
                                <div className="flex space-x-8">
                                    <a href="https://www.linkedin.com/in/kunyu-zheng-0153ba348/" target="_blank">
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
                                    <a href="https://github.com/kyu-z" target="_blank">
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
                </div>
            </section>
        </div>
    );
};

export default AboutPage;