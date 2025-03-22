import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { getCart } from "../lib/cart";

export default function Navbar() {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setUserIsDropdownOpen] = useState(false);
    const [isDropdownHovered, setIsDropdownHovered] = useState(false);
    const [isUserHovered, setIsUserHovered] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    
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
        const storedUsername = localStorage.getItem("email");
        const token = localStorage.getItem("token");
        if (token) {
            setIsLoggedIn(true);
            setUsername(storedUsername);
        }
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

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const handleLogin = () => {
        router.push('/login');
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        setUsername(null);
        setIsLoggedIn(false);
        router.push('/');
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

    return (
        <nav className="fixed left-0 right-0 sm:p-2 md:px-10 md:py-0 z-30 bg-white bg-opacity-[75%] text-gray-800 font-normal">
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
                            <div className={`absolute top-full right-0 mt-2 w-40 bg-white 
                                transition-all duration-300 ease-out transform ${
                                    isUserDropdownOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
                                }`}
                                onMouseEnter={() => setIsUserHovered(true)}
                                onMouseLeave={() => setIsUserHovered(false)}
                            >
                                <button
                                    onClick={() => router.push("/dashboard")}
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
                    <Link href="/cart">
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
            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full bg-white shadow-lg p-4">
                    <div className="flex flex-col ml-8 space-y-4">
                        {Object.entries(menuItems).map(([category, items]) => (
                            <div key={category}>
                                <h3 className="font-bold text-lg text-gray-700 mt-2 mb-2">{category}</h3>
                                <ul className="space-y-2">
                                    {items.map((item) => (
                                        <li key={item.slug}>
                                            <Link
                                                href={`/unit/${item.slug}`}
                                                className="text-gray-600 hover:text-black transition-colors"
                                            >
                                                {item.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-6 mb-4 flex flex-col space-y-4 justify-center items-center bg-gray-100 py-3 rounded-xl">
                        {isLoggedIn ? (
                            <div className="flex flex-col items-center space-y-2">
                                <span className="font-semibold">{username || "User"}</span>
                                <button
                                    onClick={() => router.push("/dashboard")}
                                    className="hover:text-black transition-colors"
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="hover:text-black transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleLogin}
                                className="hover:text-black transition-colors mb-2"
                            >
                                Login
                            </button>
                        )}
                        <Link href="/cart" className="relative mt-2 block">
                            <Image src="/cart.svg" alt="cart" width={28} height={28} />
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
