import React from 'react';
import { useTranslation } from "../../../context/TranslationContext";

export default function HeroSection() {
    const { t } = useTranslation();

    return (
        <section id="herosection" className="relative bg-transparent text-darker h-screen mb-40 scroll-mt-16">
            {/* 内容 */}
            <div className="mt-32 relative z-10 flex flex-col items-center justify-center h-full text-center w-full">
                <img src="/indexbg.jpeg" alt='indexbg' className='bg-opacity-[40%] bg-gray-300'></img>
                <h1 className="absolute top-1/3 text-black tracking-wider font-normal text-3xl sm:text-4xl md:text-5xl lg:text-8xl font-bold text-darkest">
                    {t("welcome")}
                </h1>
                <div className='flex py-20 bg-black w-full'>
                    <p className='w-1/4 text-red-600 text-3xl  justify-center'></p>
                    <p className="w-3/4 text-start px-8 text-md font-light text-white sm:text-lg md:text-xl lg:text-2xl text-darker mb-6">
                        {t("description")}
                    </p>
                </div>
            </div>
        </section>
    );
}
