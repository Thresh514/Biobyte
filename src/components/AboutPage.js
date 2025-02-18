import React from "react";
import { useEffect } from "react";

const AboutPage = () => {
    useEffect(() => {
        document.body.classList.add('fade-in');
        return () => {
            document.body.classList.remove('fade-in');
        };
    }, []);

    return (
        <div className="min-h-screen bg-white text-darker max-w-5xl mx-auto px-6 md:px-12">
            {/* Hero Section */}
            <section className="text-darkest py-20 sm:py-32 mt-16 sm:mt-32">
                <div className="text-center">
                    <h1 className="text-4xl sm:text-5xl font-bold mb-6">About Us</h1>
                    <p className="text-lg sm:text-xl">
                        We are dedicated to empowering students worldwide with high-quality educational resources for academic success.
                    </p>
                </div>
            </section>

            {/* Our Mission Section */}
            <section className="py-20 sm:py-32 text-darker">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6">Our Mission</h2>
                    <p className="text-base sm:text-lg">
                        Our mission is to make learning easier, faster, and more accessible for students worldwide by providing professional study materials and expert support.
                    </p>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20 sm:py-32">
                <div className="text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8">Our Story</h2>
                    <p className="text-base sm:text-lg mb-4">
                        Biomind Logic started with a simple idea: to bridge the gap between students and high-quality learning resources. 
                    </p>
                    <p className="text-base sm:text-lg mb-4">
                        Founded by a team of experienced educators and technologists, we realized that many students struggle to find comprehensive and affordable materials. 
                    </p>
                    <p className="text-base sm:text-lg">
                        Today, our platform supports thousands of students worldwide, providing resources tailored to IGCSE, A-Level, and more, ensuring everyone has the tools they need to succeed.
                    </p>
                </div>
            </section>

            {/* Our Team */}
            <section className="py-20 sm:py-32">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Meet Our Team</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <img src="/team1.jpg" alt="Team Member" className="rounded-full w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4" />
                            <h3 className="text-lg sm:text-xl font-bold">Jiayong Tu</h3>
                            <p className="text-sm sm:text-base">Frontend Developer</p>
                        </div>
                        <div className="text-center">
                            <img src="/team2.jpg" alt="Team Member" className="rounded-full w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4" />
                            <h3 className="text-lg sm:text-xl font-bold">Kunyu Zheng</h3>
                            <p className="text-sm sm:text-base">Backend Developer</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
