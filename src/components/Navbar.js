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
    <nav className="fixed top-20 left-0 right-0 z-50 flex bg-gradient-to-b from-lightest to-white text-darkest space-x-16 p-6 justify-evenly">
        <div className="flex flex-row items-center">
            <div>
            <Link href="/" className="p-4 ml-4 mr-4 font-semibold text-lg hover:underline">
                Home
            </Link>
            </div>

          {/* Resource Categories 下拉菜单 */}
                <div
                    className="relative group ml-8 mr-8"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <Link href="/categories" className="font-semibold text-lg hover:underline">
                        Resource Categories
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
            <a href="#membership" className="p-4 ml-4 mr-4 font-semibold text-lg hover:underline">
                Membership Zone
            </a>
            </div>

            <div>
            <Link href="/faq" className="p-4 ml-4 mr-4 font-semibold text-lg hover:underline">
                FAQ
            </Link>
            </div>

            <div>
            <Link href="/about" className="p-4 ml-4 mr-4 font-semibold text-lg hover:underline">
                About Us
            </Link>
            </div>
            
            <div className="absolute top-0 right-10 flex items-center space-x-4">
                {/* 根据登录状态显示 Login 或 Logout */}
                <div>
                    <button 
                        onClick={isLoggedIn ? handleLogout : handleLogin} 
                        className="p-4 font-semibold bg-darker rounded-lg text-white text-lg hover:underline"
                    >
                        {isLoggedIn ? 'Logout' : 'Login'}
                    </button>
                </div>

                <div>
                    <a 
                        href="#join" 
                        className="p-5 font-semibold bg-darker rounded-lg text-white text-lg hover:underline"
                    >
                        Join Membership !
                    </a>
                </div>
            </div>

        </div>
        </nav>
    );
}