import React from 'react';
import { useTranslation } from "../../../context/TranslationContext";

export default function HeroSection() {
    const { t } = useTranslation();

    return (
        <section id="herosection" className="relative bg-transparent text-darker h-screen mb-40 scroll-mt-16">
            {/* 内容 */}
            <div className="mt-32 relative z-10 flex flex-col items-center justify-center h-full text-center w-full">
                <img src="/indexbg.jpeg" alt='indexbg'></img>
                <h1 className="absolute top-1/3 text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-darkest">
                    {t("welcome")}
                </h1>
                <div className='flex justify-center py-20 bg-black w-full'>
                    <p className='w-1/3 text-red-600 text-3xl'>picture</p>
                    <p className="w-2/3 px-8 text-md font-light text-white sm:text-lg md:text-xl lg:text-2xl text-darker mb-6">
                        {t("description")}
                    </p>
                </div>
            </div>
        </section>
    );
}
