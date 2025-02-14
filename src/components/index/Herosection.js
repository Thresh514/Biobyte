import React, { useState, useEffect } from 'react';
import { useRef } from 'react';

export default function HeroSection() {
    const [isClient, setIsClient] = useState(false);
    const nextSectionRef = useRef(null);

    const scrollToNextSection = (e) => {
        e.preventDefault();
        if (nextSectionRef.current) {
            nextSectionRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <section className="relative bg-transparent text-darker h-screen top-32">
            {/* 内容 */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                <h1 className="text-5xl font-bold text-darkest mb-8">
                    Unlock quality study notes for an effective learning journey!
                </h1>
                <p className="text-xl text-darker mb-6">
                    Download thousands of professional notes, access exclusive learning resources, and master new knowledge on the go.
                </p>
            
                {/* 跳动的向下箭头 */}
                <a 
                    href="#resource-categories" 
                    className="mt-48 animate-bounce"
                    onClick={scrollToNextSection}
                >
                    <img src="/scrolldown.svg" alt="down arrow" className="w-16 h-16"/>
                </a>
            </div>
            <div ref={nextSectionRef} className="scroll-mt-44"></div>
        </section>
    );
}
