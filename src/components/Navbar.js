import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Navbar() {
    const router = useRouter();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setUserIsDropdownOpen] = useState(false);
    const [isDropdownHovered, setIsDropdownHovered] = useState(false);
    const [isUserHovered, setIsUserHovered] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState(null);

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
        <nav className="fixed left-0 right-0 sm:p-2 md:px-10 md:py-2.5 z-50 bg-white shadow-lg text-gray-800 font-normal">
            <div className="mx-screen mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-2.5 md:space-x-4">
                    <Link href="/">
                        <Image src="/whiteicon.svg" alt="logo" width={48} height={48} className="w-12 h-12 md:w-14 md:h-14" />
                    </Link>
                    <Link href="/">Home</Link>
                    <Link href="/about">About</Link>
                </div>
                {/* Dropdown button */}
                <div className="mx-auto flex justify-center hidden md:flex items-center px-4 bg-transparent"
                    onMouseEnter={() => setIsDropdownHovered(true)}
                    onMouseLeave={() => setIsDropdownHovered(false)}>
                    <button className="hover:text-black transition-colors p-2">
                        Resources
                    </button>
                    {/* Dropdown */}
                    <div className={`absolute top-full right-0 left-0 w-screen z-50 p-6 rounded-md border-b bg-white shadow-xl
                        transition-all duration-500 ease-out transform ${
                            isDropdownOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8 pointer-events-none"
                        }`}
                    >
                        <div className="grid grid-cols-2 gap-8 px-24 py-2">
                            {Object.entries(menuItems).map(([category, items]) => (
                                <div key={category} className="relative">
                                    <h3 className="font-bold text-lg text-gray-700 mb-4">
                                        {category}
                                    </h3>
                                    <ul className="space-y-2">
                                        {items.map((item) => (
                                            <li key={item.slug}>
                                                <button
                                                    onClick={() => router.push(`/unit/${item.slug}`)}
                                                    className="text-gray-600 hover:text-black transition-colors"
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

                            <div className={`absolute top-full right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg 
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
                                    Dashboard
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="hover:text-black transition-colors p-2"
                        >
                            Login
                        </button>
                    )}
                    <Link href="/cart">
                        <Image src="/cart.svg" alt="cart" width={28} height={28} />
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
                        <Link href="/cart" className="mt-2">
                            <Image src="/cart.svg" alt="cart" width={28} height={28} />
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
