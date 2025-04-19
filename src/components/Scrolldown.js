import React, { useState, useEffect } from 'react';
import { HiOutlineChevronDoubleDown } from "react-icons/hi";

export default function Scrolldown() {
    const [isVisible, setIsVisible] = useState(true);
    const [isInHeroSection, setIsInHeroSection] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            // 获取页面总高度（包括滚动部分）
            const totalHeight = document.documentElement.scrollHeight;
            // 获取视窗高度
            const windowHeight = window.innerHeight;
            // 获取已滚动的距离
            const scrolled = window.scrollY;

            // 如果滚动到距离底部100px以内，就隐藏按钮
            const threshold = 100;
            if (totalHeight - (scrolled + windowHeight) < threshold) {
                setIsVisible(false);
            } else {
                setIsVisible(true);
            }
            
            // 检测视窗是否完全在hero section区域内
            const heroSection = document.getElementById('herosection');
            if (heroSection) {
                // 获取heroSection的位置信息
                const heroRect = heroSection.getBoundingClientRect();
                
                // 检查视窗是否完全在hero section内
                // 1. 视窗顶部应该在或低于hero section的顶部边界 (scrolled >= heroSection.offsetTop)
                // 2. 视窗底部应该在或高于hero section的底部边界 (scrolled + windowHeight <= heroSection.offsetTop + heroSection.offsetHeight)
                const isViewportTopInHero = scrolled >= heroSection.offsetTop;
                const isViewportBottomInHero = (scrolled + windowHeight) <= (heroSection.offsetTop + heroSection.offsetHeight);
                
                // 只有当视窗完全在hero section内时，才显示黑色背景
                setIsInHeroSection(isViewportTopInHero && isViewportBottomInHero);
            }
        };

        // 添加滚动监听
        window.addEventListener('scroll', handleScroll);
        
        // 初始检查
        handleScroll();

        // 清理监听器
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none">
            <div 
                className={`rounded-full p-3 animate-bounce ${
                    isInHeroSection 
                    ? 'bg-transparent text-white' 
                    : 'bg-transparent text-black'
                } transition-all duration-300`}
                aria-hidden="true"
            >
                <HiOutlineChevronDoubleDown className="w-8 h-8 md:w-10 md:h-10" />
            </div>
        </div>
    );
}
