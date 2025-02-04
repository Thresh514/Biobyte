import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';

export default function HeroSection() {
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <section className="relative bg-white text-darker h-screen">
        {/* 背景视频 */}
        <div className="absolute top-0 left-0 w-full h-full z-0">
        {isClient && (
            <ReactPlayer
                url="/sample_video.mp4" // replace with your video path or URL
                playing={true}
                loop={true}
                muted={true}
                width="100%"
                height="100%"
                className="object-cover"
                style={{ opacity: 0.2 }} 
            />
        )}
        </div>

        {/* 内容 */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <h1 className="text-5xl font-bold text-darkest mb-8">
                Unlock quality study notes for an effective learning journey!
            </h1>
            <p className="text-xl text-darker mb-6">
                Download thousands of professional notes, access exclusive learning resources, and master new knowledge on the go.
            </p>
            <a
            href="#join"
            className="bg-darker mt-4 p-4 text-white font-semibold px-20 rounded-lg hover:underline transition duration-300"
            >
                Join Now
            </a>
            <p className="text-sm mt-4 text-middle text-middle">
                Members enjoy unlimited downloads of 
                all resources on the site
            </p>
        </div>
    </section>
    );
}