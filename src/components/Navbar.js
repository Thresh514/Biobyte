import Link from 'next/link';
import { useState, useEffect } from 'react'; 
import { useRouter } from 'next/router';

export default function Navbar(){
    const [isVisible, setIsVisible] = useState(false); // 新增状态控制菜单显示隐藏
    const [isLoggedIn, setIsLoggedIn] = useState(false); 
    const router = useRouter();

     // 从 localStorage 获取登录状态
    useEffect(() => {
        const userLoggedIn = localStorage.getItem("userLoggedIn");
        if (userLoggedIn) {
            setIsLoggedIn(true);
        }
    }, []);

    // 处理登录（跳转到登录页面）
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
        "GCSE / IGCSE": ["Biology", "Chemistry", "Physics", "Maths"],
        "A-Level": ["Biology", "Chemistry", "Physics", "Maths", "Computer Science"],
};

    const handleMouseEnter = () => {
        setIsVisible(true);
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };
    
    return (
    <nav className="fixed left-0 right-0 z-50 flex bg-white shadow-xl p-2 text-gray-600 justify-evenly ">
        <div className="flex flex-row items-center">
            <img src="/whiteicon.svg" alt="logo" className="w-14 h-14" />
            <div>
                <Link href="/" className="mr-12 ml-12 hover:text-black transition-colors">
                    Home
                </Link>
            </div>

          {/* Resource Categories 下拉菜单 */}
                <div
                    className="relative group"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <Link href="#categories" className="mr-12 ml-12 hover:text-black transition-colors">
                        Mindmap
                    </Link>
                    {/* 下拉菜单 */}
                    {isVisible && (
                    <div 
                        className={`absolute text-black bg-white shadow-lg rounded-lg p-4 w-[300px] transition-all duration-300 ease-out ${
                            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                        }`}
                    >
                            <div className="flex flex-row space-x-8">
                                {/* IGCSE */}
                                <div className="p-3">
                                    <a href="#igcse" className="font-bold text-xl cursor-pointer hover:underline">IGCSE</a>
                                    <div className="">
                                                {menuItems["GCSE / IGCSE"].map((subject, idx) => (
                                                    <div key={idx} className="mt-2 mb-2">
                                                        <a href={`#${subject.replace(/\s+/g, '-').toLowerCase()}`} className="hover:underline">{subject}</a>
                                                    </div>
                                                ))}
                                        
                                    </div>
                                </div>

                                {/* A-Level */}
                                <div className="p-3">
                                    <a href="#alevel" className="font-bold text-xl cursor-pointer hover:underline">A-Level</a>
                                    <div className="">
                                                {menuItems["A-Level"].map((subject, idx) => (
                                                    <div key={idx} className="mt-2 mb-2">
                                                        <a href={`#${subject.replace(/\s+/g, '-').toLowerCase()}`} className="hover:underline">{subject}</a>
                                                    </div>
                                                ))}
                                            </div>
                                    </div>
                                </div>
                            </div>
                    )}
                </div>
            
                <div
                    className="relative group"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <Link href="#categories" className="mr-12 ml-12 hover:text-black transition-colors">
                        Syllabus Analysis
                    </Link>
                    {/* 下拉菜单 */}
                    {isVisible && (
                    <div 
                        className={`absolute text-black bg-white shadow-lg rounded-lg p-4 w-[300px] transition-all duration-300 ease-out ${
                            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                        }`}
                    >
                            <div className="flex flex-row space-x-8">
                                {/* IGCSE */}
                                <div className="p-3">
                                    <a href="#igcse" className="font-bold text-xl cursor-pointer hover:underline">IGCSE</a>
                                    <div className="">
                                                {menuItems["GCSE / IGCSE"].map((subject, idx) => (
                                                    <div key={idx} className="mt-2 mb-2">
                                                        <a href={`#${subject.replace(/\s+/g, '-').toLowerCase()}`} className="hover:underline">{subject}</a>
                                                    </div>
                                                ))}
                                        
                                    </div>
                                </div>

                                {/* A-Level */}
                                <div className="p-3">
                                    <a href="#alevel" className="font-bold text-xl cursor-pointer hover:underline">A-Level</a>
                                    <div className="">
                                                {menuItems["A-Level"].map((subject, idx) => (
                                                    <div key={idx} className="mt-2 mb-2">
                                                        <a href={`#${subject.replace(/\s+/g, '-').toLowerCase()}`} className="hover:underline">{subject}</a>
                                                    </div>
                                                ))}
                                            </div>
                                    </div>
                                </div>
                            </div>
                    )}
                </div>

            <div>
            <Link href="/about" className="mr-12 ml-12 hover:text-black transition-colors">
                About Us
            </Link>
            </div>
            
            <div className="relative group">
                {/* 根据登录状态显示 Login 或 Logout */}
                <div>
                    <button 
                        onClick={isLoggedIn ? handleLogout : handleLogin} 
                        className="mr-12 ml-12 hover:text-black transition-colors"
                    >
                        {isLoggedIn ? 'Logout' : 'Login'}
                    </button>
                </div>
            </div>
        </div>
        </nav>
    );
}