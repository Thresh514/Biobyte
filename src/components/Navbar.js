import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Navbar() {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isDropdownHovered, setIsDropdownHovered] = useState(false); // 控制悬停状态
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        let timeout;
        const userLoggedIn = localStorage.getItem("userLoggedIn");

        if (userLoggedIn) {
            setIsLoggedIn(true);
        }
        if (isDropdownHovered) {
            timeout = setTimeout(() => setIsDropdownOpen(true), 200); // 延迟显示 200ms
        } else {
            timeout = setTimeout(() => setIsDropdownOpen(false), 1000); // 延迟隐藏 200ms
        }

        return () => clearTimeout(timeout); // 清除定时器，避免多次触发
    }, [isDropdownHovered]);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const handleLogin = () => {
        router.push('/login');  // 跳转到登录页面
    };

    // 处理登出（跳转到主页）
    const handleLogout = () => {
        setIsLoggedIn(false);  // 更新状态
        localStorage.removeItem("userLoggedIn");  // 清除登录状态
        router.push('/');  // 跳转回主页
    }  

    const menuItems = {
        "Mindmaps": ["AS Biology", "A2 Biology"],
        "Syllabus Analysis": ["AS Biology", "A2 Biology"],
    };

    return (
        <nav className="fixed left-0 right-0 py-4 z-50 bg-white shadow-lg text-gray-600">
            {/* 桌面端导航菜单 */}
            <div className="mx-screen mx-auto flex items-center justify-between">
                {/* 左侧 LOGO 和 Home */}
                <div className="flex items-center space-x-4">
                    <Image src="/whiteicon.svg" alt="logo" width={48} height={48} />
                    <Link href="/">
                        Home
                    </Link>
                    <Link href="/about">
                        About
                    </Link>
                </div>

                {/* 中间 Resources 按钮 */}
                <div className="mx-auto flex justify-center items-center px-4 bg-transparent">
                    <div
                        className="hidden md:flex flex-col justify-center items-center h-full"
                        onMouseEnter={() => setIsDropdownHovered(true)} // 鼠标悬停
                        onMouseLeave={() => setIsDropdownHovered(false)} // 鼠标离开
                    >
                        {/* Resources 按钮 */} 
                        <button className="hover:text-black transition-colors p-2">
                            Resources
                        </button>
                    </div>
                </div>
                
                    <div 
                        className={`absolute top-full right-0 left-0 w-screen z-50 p-6 rounded-md border-b bg-white shadow-xl
                            transition-all duration-1000 ease-out transform ${
                                isDropdownOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-12 pointer-events-none"
                            }`}
                    >
                        <div className="grid grid-cols-2 gap-6">
                            {Object.entries(menuItems).map(([category, items]) => (
                                <div key={category} className="relative">
                                    {/* 分类标题 */}
                                    <h3 className="font-bold text-lg text-gray-700 mb-4">
                                        {category}
                                    </h3>
                                    {/* 子分类链接 */}
                                    <ul className="space-y-2">
                                        {items.map((item) => (
                                            <li key={item}>
                                                <button
                                                    onClick={() => router.push(`/unit/${category.toLowerCase().replace(/\s+/g, "-") + "-" + item.toLowerCase().replace(/\s+/g, "-")}`)}
                                                    className="text-gray-600 hover:text-black transition-colors"
                                                >
                                                    {item}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                

                {/* 右侧菜单和购物车 */}
                <div className="hidden md:flex items-center space-x-6">
                    <button
                        onClick={isLoggedIn ? handleLogout : handleLogin}
                        className="hover:text-black transition-colors p-2"
                    >
                        {isLoggedIn ? "Logout" : "Login"}
                    </button>
                    <Link href="/cart">
                        <Image src="/cart.svg" alt="cart" width={28} height={28} />
                    </Link>
                </div>
                {/* 移动端菜单按钮（Hamburger Menu） */}
                <button
                    className="md:hidden p-4 text-xl"
                    onClick={toggleMobileMenu}
                >
                    ☰
                </button>
            </div>
            {/* 移动端下拉菜单 */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white shadow-lg p-4">
                    <div className="flex flex-col ml-8 space-y-4">
                        {Object.entries(menuItems).map(([category, items]) => (
                            <div key={category}>
                                <h3 className="font-bold text-lg text-gray-700 mt-2 mb-2">{category}</h3>
                                <ul className="space-y-2">
                                    {items.map((item) => (
                                        <li key={item}>
                                            <Link
                                                href={`/unit/${category.toLowerCase().replace(/\s+/g, "-") + "-" + item.toLowerCase().replace(/\s+/g, "-")}`}
                                                className="text-gray-600 hover:text-black transition-colors"
                                            >
                                                {item}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    {/* 右侧功能（移动端） */}
                    <div className="mt-6 mb-4 flex flex-col space-y-4 justify-center items-center">
                        <button
                            onClick={isLoggedIn ? handleLogout : handleLogin}
                            className="hover:text-black transition-colors mb-2"
                        >
                            {isLoggedIn ? "Logout" : "Login"}
                        </button>
                        <Link href="/cart" className="mt-2">
                            <Image src="/cart.svg" alt="cart" width={28} height={28} />
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
