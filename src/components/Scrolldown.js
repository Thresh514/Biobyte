import React, { useState } from 'react';
import { HiOutlineChevronDoubleDown } from "react-icons/hi";

export default function Scrolldown() {
    const [currentTarget, setCurrentTarget] = useState("resource-categories"); // 记录当前滚动的目标

    const scrollToNextSection = (e) => {
        e.preventDefault();

        // 获取当前目标的元素
        const targetElement = document.getElementById(currentTarget);
        if (targetElement) {
            targetElement.scrollIntoView({ behavior: "smooth" });

            // 根据当前目标切换到下一个 section
            if (currentTarget === "resource-categories") {
                setCurrentTarget("SuccessStories"); // 下次点击滚动到 `next-section`
            } 
            else if (currentTarget === "herosection") {
                setCurrentTarget("resource-categories"); // 下次点击滚动到 `next-section`
            }else{
                setCurrentTarget("herosection"); // 下次点击滚动到 `next-section`
            }
        }
    };

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <button 
                className="animate-bounce"
                onClick={scrollToNextSection}
            >
                <HiOutlineChevronDoubleDown size={40} />
            </button>
        </div>
    );
}
