import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { getCart } from "../lib/cart";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setUserIsDropdownOpen] = useState(false);
    const [isDropdownHovered, setIsDropdownHovered] = useState(false);
    const [isUserHovered, setIsUserHovered] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const mobileMenuRef = useRef(null);
    
    useEffect(() => {
        const updateCartCount = () => {
            const cart = getCart() || [];
            const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            setCartCount(totalCount);
        };
    
        // **监听 `cartAddUpdate` 和 `cartRemoveUpdate` 事件**
        window.addEventListener("cartAddUpdate", updateCartCount);
        window.addEventListener("cartRemoveUpdate", updateCartCount);
    
        updateCartCount(); // 初始化获取数据
    
        return () => {
            window.removeEventListener("cartAddUpdate", updateCartCount);
            window.removeEventListener("cartRemoveUpdate", updateCartCount);
        };
    }, []);
    

    useEffect(() => {
        // 使用新的auth check API来检查登录状态（从cookie读取token）
        fetch("/api/auth/check", {
            method: "GET",
            credentials: 'include'
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.isAuthenticated && data.user) {
                    setIsLoggedIn(true);
                    setUsername(data.user.email);
                    setUserRole(data.user.role);
                    // 存储email到localStorage用于显示
                    localStorage.setItem("email", data.user.email);
                } else {
                    setIsLoggedIn(false);
                    setUsername(null);
                    setUserRole(null);
                }
            })
            .catch((err) => {
                console.error("Auth check error:", err);
                setIsLoggedIn(false);
            });
    }, []);

    useEffect(() => {
        let timeout;
        if (isDropdownHovered) {
            timeout = setTimeout(() => setIsDropdownOpen(true), 100);
        } else {
            timeout = setTimeout(() => setIsDropdownOpen(false), 200);
        }

        return () => clearTimeout(timeout);
    }, [isDropdownHovered]);

    useEffect(() => {
        let timeout;
        if (isUserHovered) {
            timeout = setTimeout(() => setUserIsDropdownOpen(true), 200);
        } else {
            timeout = setTimeout(() => setUserIsDropdownOpen(false), 200);
        }

        return () => clearTimeout(timeout);
    }, [isUserHovered]);

    const getDisplayName = (email) => {
        if (!email) return "User";
        if (email.length > 10) {
            return email.substring(0, 5) + "...";
        }
        return email;
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogin = () => {
        router.push('/login');
    };

    const handleLogout = async () => {
        // 调用logout API清除cookie
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: 'include'
            });
        } catch (error) {
            console.error("Logout error:", error);
        }
        localStorage.removeItem("email");
        setUsername(null);
        setUserRole(null);
        setIsLoggedIn(false);
        router.push('/');
    };

    const handleDashboard = async () => {
        // 如果userRole已经加载，直接使用
        if (userRole === 'admin') {
            router.push('/admin');
            return;
        }
        
        // 如果userRole还没加载，先检查一下
        if (userRole === null && isLoggedIn) {
            try {
                const response = await fetch("/api/auth/check", {
                    method: "GET",
                    credentials: 'include'
                });
                const data = await response.json();
                if (data.isAuthenticated && data.user && data.user.role === 'admin') {
                    router.push('/admin');
                    return;
                }
            } catch (error) {
                console.error("Error checking user role:", error);
            }
        }
        
        // 默认跳转到dashboard
        router.push('/dashboard');
    };

    const menuItems = {
        "Mindmaps": [
            { title: "AS Biology", slug: "as-mindmap" },
            { title: "A2 Biology", slug: "a2-mindmap" },
        ],
        "Syllabus Analysis": [
            { title: "AS Biology", slug: "as-syllabus-analysis" },
            { title: "A2 Biology", slug: "a2-syllabus-analysis" },
        ],
    };

    // 菜单容器的动画变体
    const menuContainerVariants = {
        hidden: { 
            opacity: 0,
            y: -20
        },
        visible: { 
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.2,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: {
                duration: 0.2,
                when: "afterChildren",
                staggerChildren: 0.05,
                staggerDirection: -1
            }
        }
    };

    // 菜单项的动画变体
    const menuItemVariants = {
        hidden: { 
            opacity: 0,
            y: -10
        },
        visible: { 
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.1
            }
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.1
            }
        }
    };

    return (
        <nav className="fixed left-0 right-0 sm:p-2 md:px-10 md:py-0 z-30 bg-white md:bg-opacity-[75%] text-gray-800 font-normal">
            <div className="mx-screen mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-2.5 md:space-x-4">
                    <Link href="/">
                        <Image src="/whiteicon.svg" alt="logo" width={62} height={62} className="w-12 h-12 md:w-20 md:h-20" />
                    </Link>
                    <Link href="/">HOME</Link>
                    <Link href="/about">ABOUT</Link>
                </div>
                {/* Dropdown button */}
                <div className="mx-auto flex justify-center hidden md:flex items-center bg-transparent"
                    onMouseEnter={() => setIsDropdownHovered(true)}
                    onMouseLeave={() => setIsDropdownHovered(false)}>
                    <button className="hover:text-black transition-colors py-7">
                        RESOURCES
                    </button>
                    {/* Dropdown */}
                    <div className={`absolute top-full right-0 left-0 w-screen z-30 bg-white
                        transition-all duration-500 ease-out transform ${
                            isDropdownOpen ? "opacity-75" : "opacity-0 pointer-events-none"
                        }`}
                    >
                        <div className="grid grid-cols-2 gap-8 px-24 pb-6 border-b border-gray-500">
                            {Object.entries(menuItems).map(([category, items]) => (
                                <div key={category} className="relative">
                                    <h3 className="font-normal text-lg text-gray-700 mb-4 tracking-wider">
                                        {category}
                                    </h3>
                                    <ul className="space-y-2">
                                        {items.map((item) => (
                                            <li key={item.slug}>
                                                <button
                                                    onClick={() => router.push(`/unit/${item.slug}`)}
                                                    className="relative text-gray-800 font-light tracking-wider hover:text-black transition-colors 
                                                    before:content-[''] before:absolute before:left-0 before:bottom-0 before:w-full before:h-[1.5px] before:bg-gray-600 
                                                    before:origin-left before:scale-x-0 before:transition-transform before:duration-300 hover:before:scale-x-100"
                                                >
                                                    {item.title}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex items-center space-x-6">
                    {/* User Dropdown */}
                    {isLoggedIn ? (
                        <div
                            className="relative"
                            onMouseEnter={() => setIsUserHovered(true)}
                            onMouseLeave={() => setIsUserHovered(false)}
                        >
                            <button className="hover:text-black transition-colors p-2">
                                {getDisplayName(username) || "User"}
                            </button>
                            <div className={`absolute top-full right-0 mt-5 w-40 bg-opacity-75 bg-white 
                                transition-all duration-300 ease-out transform ${
                                    isUserDropdownOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                                }`}
                                onMouseEnter={() => setIsUserHovered(true)}
                                onMouseLeave={() => setIsUserHovered(false)}
                            >
                                <button
                                    onClick={handleDashboard}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    DASHBOARD
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    LOGOUT
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="hover:text-black transition-colors p-2"
                        >
                            LOGIN
                        </button>
                    )}
                    {/* 暂时隐藏购物车 */}
                    <Link href="/cart" className="hidden">
                        <Image src="/cart.svg" alt="cart" width={28} height={28} />
                        <span className="absolute top-4 right-6 z-50 text-black text-xs px-2 py-1 rounded-full">
                            {cartCount}
                        </span>
                    </Link>
                </div>

                {/* Mobile menu button */}
                <button className="md:hidden p-4 text-xl" onClick={toggleMobileMenu}>
                    ☰
                </button>
            </div>
            
            {/* Mobile menu - using AnimatePresence for exit animations */}
            <AnimatePresence mode="wait">
                {isMobileMenuOpen && (
                    <motion.div 
                        className="md:hidden fixed top-20 left-0 w-full bg-white shadow-md p-4"
                        variants={menuContainerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="flex flex-col ml-8 space-y-4">
                            {Object.entries(menuItems).map(([category, items], categoryIndex) => (
                                <div key={category}>
                                    <motion.h3 
                                        className="font-normal tracking-wider text-lg text-gray-800 mt-2 mb-2"
                                        variants={menuItemVariants}
                                    >
                                        {category}
                                    </motion.h3>
                                    <ul className="space-y-2">
                                        {items.map((item) => (
                                            <motion.li 
                                                key={item.slug}
                                                variants={menuItemVariants}
                                            >
                                                <Link
                                                    href={`/unit/${item.slug}`}
                                                    className="text-gray-800 tracking-wider font-light hover:text-black transition-colors"
                                                >
                                                    {item.title}
                                                </Link>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <motion.div 
                            className="mt-6 mb-4 flex flex-col space-y-2 justify-center items-center py-3 border-t border-gray-200"
                            variants={menuItemVariants}
                        >
                            {isLoggedIn ? (
                                <div className="flex flex-col items-center space-y-2">
                                    <motion.span 
                                        className="font-light tracking-wider"
                                        variants={menuItemVariants}
                                    >
                                        {username || "User"}
                                    </motion.span>
                                    <motion.button
                                        onClick={handleDashboard}
                                        className="font-light tracking-wider hover:text-black transition-colors"
                                        variants={menuItemVariants}
                                    >
                                        Dashboard
                                    </motion.button>
                                    <motion.button
                                        onClick={handleLogout}
                                        className="font-light tracking-wider hover:text-black transition-colors"
                                        variants={menuItemVariants}
                                    >
                                        Logout
                                    </motion.button>
                                </div>
                            ) : (
                                <motion.button
                                    onClick={handleLogin}
                                    className="hover:text-black mb-2 font-light tracking-wider"
                                    variants={menuItemVariants}
                                >
                                    Login
                                </motion.button>
                            )}
                            {/* 暂时隐藏购物车 */}
                            <motion.div
                                variants={menuItemVariants}
                                className="hidden"
                            >
                                <Link href="/cart" className="relative mt-2 block">
                                    <Image src="/cart.svg" alt="cart" width={28} height={28} />
                                    <span className="absolute bottom-4 left-6 z-50 text-black text-xs px-2 py-1">
                                        {cartCount}
                                    </span>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
