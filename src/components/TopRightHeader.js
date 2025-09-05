import { useState, useEffect } from 'react';
import { Share, Settings, User, LogOut, UserCircle } from 'lucide-react';

const TopRightHeader = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userInfo, setUserInfo] = useState(null);

    // 检查用户登录状态
    useEffect(() => {
        const checkUserStatus = async () => {
            const token = localStorage.getItem("token");
            const tokenExp = localStorage.getItem("token_exp");
            
            if (!token || Date.now() > tokenExp) {
                setIsLoggedIn(false);
                setUserInfo(null);
                return;
            }
            
            setIsLoggedIn(true);
            
            try {
                const response = await fetch("/api/user", {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                    },
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    setUserInfo(userData);
                }
            } catch (error) {
                console.error("获取用户信息失败:", error);
            }
        };
        
        checkUserStatus();
    }, []);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("token_exp");
        localStorage.removeItem("email");
        setIsLoggedIn(false);
        setUserInfo(null);
        setShowUserMenu(false);
        window.location.href = "/login";
    };

    // 获取用户首字母
    const getUserInitials = () => {
        if (!userInfo?.email) return "U";
        const email = userInfo.email;
        const name = email.split("@")[0];
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="flex items-center space-x-3 bg-white py-2 px-5 rounded-md shadow-sm space-x-4">
                {/* Share按钮 */}
                <button 
                    onClick={handleShare}
                    className={`flex items-center space-x-2 px-5 py-2 rounded-md hover:shadow-sm transition-all duration-200 ${
                        copied 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-gray-500 text-white hover:bg-gray-600'
                    }`}
                >
                    <Share className="w-5 h-5" />
                    <span className="text-sm font-medium">{copied ? 'Copied!' : 'Share'}</span>
                </button>

                {/* 用户头像 */}
                <div className="relative">
                    {isLoggedIn ? (
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center"
                        >
                            <span className="text-black font-bold text-md">{getUserInitials()}</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => window.location.href = "/login"}
                            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
                        >
                            <UserCircle className="w-6 h-6 text-gray-600" />
                        </button>
                    )}
                    
                    {/* 用户菜单 - 只在登录时显示 */}
                    {isLoggedIn && showUserMenu && (
                        <div className="absolute top-12 right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                            <div className="py-2">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <div className="text-sm text-gray-600">{userInfo?.email}</div>
                                </div>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-3">
                                    <Settings className="w-4 h-4 text-gray-600" />
                                    <div className="font-medium text-sm">Account settings</div>
                                </button>
                                <button className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-3">
                                    <User className="w-4 h-4 text-gray-600" />
                                    <div className="font-medium text-sm">Update photo</div>
                                </button>
                                <div className="border-t border-gray-200 my-1"></div>
                                <button 
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-3"
                                >
                                    <LogOut className="w-4 h-4 text-red-600" />
                                    <div className="font-medium text-sm text-red-600">Log out</div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
        </div>
    );
};

export default TopRightHeader;
