import React from 'react';
import { useTranslation } from "../../../context/TranslationContext";

export default function HeroSection() {
    const { t } = useTranslation();

    return (
        <section id="herosection" className="relative bg-transparent text-darker h-screen px-6 md:px-12">
            {/* 内容 */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4 max-w-8xl">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-darkest mb-8">
                    {t("welcome")}
                </h1>
                <p className="text-md sm:text-lg md:text-xl lg:text-2xl text-darker mb-6">
                    {t("description")}
                </p>
            </div>
        </section>
    );
}
