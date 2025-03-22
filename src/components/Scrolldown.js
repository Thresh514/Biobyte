import React, { useState, useEffect } from 'react';
import { HiOutlineChevronDoubleDown } from "react-icons/hi";

export default function Scrolldown() {
    const [isVisible, setIsVisible] = useState(true);

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
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-opacity">
            <button 
                className="bg-transparent pointer-events-none rounded-full p-2 animate-bounce"
            >
                <HiOutlineChevronDoubleDown size={40} />
            </button>
        </div>
    );
}
