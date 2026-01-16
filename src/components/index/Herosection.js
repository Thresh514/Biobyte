import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useTranslation } from "../../../context/TranslationContext";
import dynamic from 'next/dynamic';
// import Image from 'next/image';

// 动态导入粒子组件以避免SSR问题
const ParticlesBackground = dynamic(() => import('./ParticlesBackground'), {
    ssr: false,
    loading: () => <></>
});

export default function HeroSection() {
    const { t } = useTranslation();
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const isTextInView = useInView(textRef, { once: false, amount: 0.3 });
    const [isMounted, setIsMounted] = useState(false);
    
    // 滚动动画效果
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });
    
    // 根据滚动位置转换不同的属性
    const textOpacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
    const textY = useTransform(scrollYProgress, [0, 0.3], [100, 0]);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);
    
    // 打字机效果动画变体
    const titleContainer = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.2 * i }
        })
    };
    
    const titleChild = {
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100
            }
        },
        hidden: {
            opacity: 0,
            y: 20,
            transition: {
                type: "spring",
                damping: 12,
                stiffness: 100
            }
        }
    };
    
    return (
        <motion.section 
            id="herosection" 
            ref={containerRef}
            className="relative bg-black text-white w-screen min-h-screen overflow-hidden scroll-mt-16"
            style={{ position: 'relative' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* 粒子背景 */}
            {isMounted && <ParticlesBackground />}

            {/* 标题区域 */}
            <div className="relative z-10 flex flex-col items-center justify-center h-screen text-center px-4 w-screen">
                {/* 移动端版本 */}
                <motion.div
                    className="overflow-hidden block md:hidden"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="font-mono relative">
                        <div className="flex flex-col items-center">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="relative"
                            >
                                <motion.span 
                                    className="text-white tracking-wide"
                                    style={{ 
                                        fontFamily: "monospace",
                                        letterSpacing: '0.08em',
                                        textTransform: 'uppercase',
                                        fontWeight: '700'
                                    }}
                                >
                                    <motion.span 
                                        className="block text-4xl mb-1 text-start"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.3 }}
                                    >
                                        WELCOME
                                    </motion.span>
                                    <motion.span 
                                        className="block text-5xl mb-1 text-start"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.6 }}
                                    >
                                        TO
                                    </motion.span>
                                    <motion.span 
                                        className="block text-8xl mb-1 text-start"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.9 }}
                                    >
                                        BIO
                                    </motion.span>
                                    <motion.span 
                                        className="block text-8xl text-start"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 1.2 }}
                                    >
                                        BYTE!
                                    </motion.span>
                                </motion.span>
                                <motion.span 
                                    className="absolute -inset-1 block opacity-40"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.4 }}
                                    transition={{ duration: 1, delay: 0.8 }}
                                ></motion.span>
                            </motion.div>
                        </div>
                    </h1>
                </motion.div>

                {/* 桌面端版本 */}
                <motion.div
                    className="overflow-hidden hidden md:block"
                    variants={titleContainer}
                    initial="hidden"
                    animate="visible"
                >
                    <h1 className="text-3xl md:text-8xl font-mono tracking-wide mb-4 relative">
                        <motion.span 
                            className="text-white tracking-wide"
                            style={{ 
                                fontFamily: "'Space Mono', 'Roboto Mono', monospace",
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase'
                            }}
                        >
                            {t("welcome").split('').map((char, index) => (
                                <motion.span
                                    key={index}
                                    variants={titleChild}
                                    className="inline-block"
                                >
                                    {char === ' ' ? '\u00A0' : char}
                                </motion.span>
                            ))}
                        </motion.span>
                        <span className="absolute -inset-1 block rounded-lg bg-gradient-to-r from-cyan-400/10 via-blue-500/5 to-purple-600/10 blur-xl filter opacity-30"></span>
                    </h1>
                </motion.div>
            </div>

            {/* 滚动显示的描述文本 */}
            <motion.div 
                ref={textRef}
                className="relative z-10 flex flex-col items-center justify-center h-auto md:h-[25vh] bg-black pt-12 pb-8 md:py-2 w-screen"
                style={{ opacity: textOpacity, y: textY }}
            >
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={isTextInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                    transition={{ duration: 0.8 }}
                    className="mx-auto px-4 md:px-6 max-w-xl md:max-w-7xl items-end"
                >
                    <p className="text-sm md:text-xl font-light tracking-wider">
                        {t("description")}
                    </p>
                </motion.div>
            </motion.div>
        </motion.section>
    );
}