import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from 'next/image';

const DashboardComponent = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    // 添加密码强度验证
    const isPasswordStrong = (password) => {
        return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        console.log("Token:", token);
        const tokenExp = localStorage.getItem("token_exp");

        // 检查 token 是否存在，是否过期
        if (!token || Date.now() > tokenExp) {
            console.warn("Token expired, logging out...");
            localStorage.removeItem("token");
            localStorage.removeItem("token_exp");
            window.location.href = "/login"; // 自动跳转到登录页面
            return;
        }

        // 获取用户信息
        fetch("/api/user", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("User Data:", data);
                setUser(data);
            })
            .catch((err) => console.error("User Fetch Error:", err));

        // 获取用户订单
        fetch("/api/orders", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Orders Data:", data);
                setOrders(data);
            })
            .catch((err) => console.error("Order Fetch Error:", err));

        // 获取用户优惠券
        fetch("/api/coupons")
            .then((res) => res.json())
            .then((data) => setCoupons(data));

        // 定时检查 token 是否过期
        const interval = setInterval(() => {
            const tokenExpCheck = localStorage.getItem("token_exp");
            if (!tokenExpCheck || Date.now() > tokenExpCheck) {
                console.warn("Token expired, logging out...");
                localStorage.removeItem("token");
                localStorage.removeItem("token_exp");
                window.location.href = "/login";
            }
        }, 60000); // 1分钟检查一次

        return () => clearInterval(interval); // 组件卸载时清除定时器
    }, []);

    const handleChangePassword = async () => {
        setMessage("");

        if (!isPasswordStrong(newPassword)) {
            setMessage("Password must be at least 8 characters long, including a number and a capital letter.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage("两次输入的密码不匹配。");
            return;
        }

        try {
            const response = await fetch("/api/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: user.email, oldPassword, newPassword }),
            });

            const data = await response.json();
            setMessage(data.message);

            if (response.ok) {
                setTimeout(() => {
                    setShowChangePassword(false);
                    setMessage("");
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                }, 2000);
            }
        } catch (error) {
            console.error("Change password error:", error);
            setMessage("网络错误，请稍后重试。");
        }
    };

    const handleResendEmail = async (study_resource_id) => {
        const token = localStorage.getItem("token");

        if (!token) {
            alert("You are not logged in!");
            return;
        }

        try {
            const response = await fetch("/api/resend-order-email", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ study_resource_id }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Order email resent successfully!");
            } else {
                alert(`Failed to resend email: ${data.message}`);
            }
        } catch (error) {
            console.error("Resend Email Error:", error);
            alert("Error resending order email. Please try again later.");
        }
    };

    return (
        <div className="w-full h-full">
            <div className="relative h-[500px]">
                <Image 
                    src="/dashboardbg4-compress.jpg" 
                    alt="dashboardbg" 
                    fill
                    quality={80}
                    priority
                    className="object-cover"
                />
                <p className="absolute bottom-0 left-8 text-4xl text-black md:text-7xl tracking-wide">DASHBOARD</p>
            </div>

            {/* 修改密码模态框 */}
            {showChangePassword && (
                <div className="fixed inset-0 bg-gray-300 bg-opacity-50 flex justify-center items-center p-12">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-auto px-12 py-8">
                        <h2 className="text-xl font-light tracking-wider mb-8">Change Password</h2>
                        <div className="space-y-8">
                            <div className="relative w-[350px]">
                                <input 
                                    type="password"
                                    id="oldPassword"
                                    value={oldPassword}
                                    className="peer w-full px-0 py-2 h-6 text-md font-light border-b border-gray-400
                                    bg-transparent text-gray-900 focus:outline-none focus:border-black placeholder-transparent"
                                    placeholder="Current Password"
                                    onChange={(e) => setOldPassword(e.target.value)}
                                />
                                <label
                                    htmlFor="oldPassword"
                                    className="absolute left-0 top-2 text-gray-400 text-lg transition-all 
                                    peer-placeholder-shown:top-1 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                                    peer-focus:top-[-16px] peer-focus:text-xs peer-focus:text-gray-600
                                    peer-[:not(:placeholder-shown)]:top-[-16px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-600"
                                >
                                    Current Password
                                </label>
                            </div>

                            <div className="relative w-[350px]">
                                <input 
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    className="peer w-full px-0 py-2 h-6 text-md font-light border-b border-gray-400
                                    bg-transparent text-gray-900 focus:outline-none focus:border-black placeholder-transparent"
                                    placeholder="New Password"
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <label
                                    htmlFor="newPassword"
                                    className="absolute left-0 top-2 text-gray-400 text-lg transition-all 
                                    peer-placeholder-shown:top-1 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                                    peer-focus:top-[-16px] peer-focus:text-xs peer-focus:text-gray-600
                                    peer-[:not(:placeholder-shown)]:top-[-16px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-600"
                                >
                                    New Password
                                </label>
                            </div>

                            <div className="relative w-[350px]">
                                <input 
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    className="peer w-full px-0 py-2 h-6 text-md font-light border-b border-gray-400
                                    bg-transparent text-gray-900 focus:outline-none focus:border-black placeholder-transparent"
                                    placeholder="Confirm New Password"
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <label
                                    htmlFor="confirmPassword"
                                    className="absolute left-0 top-2 text-gray-400 text-lg transition-all 
                                    peer-placeholder-shown:top-1 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                                    peer-focus:top-[-16px] peer-focus:text-xs peer-focus:text-gray-600
                                    peer-[:not(:placeholder-shown)]:top-[-16px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-600"
                                >
                                    Confirm New Password
                                </label>
                            </div>
                        </div>
                        {message && <p className="text-center text-red-500 mt-4 text-sm">{message}</p>}
                        <div className="flex justify-end space-x-4 mt-8">
                            <button 
                                className="px-4 py-2 border border-black text-sm font-light tracking-wider hover:bg-gray-100" 
                                onClick={() => { 
                                    setShowChangePassword(false); 
                                    setMessage(""); 
                                    setOldPassword("");
                                    setNewPassword("");
                                    setConfirmPassword("");
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-black hover:bg-opacity-75 text-white tracking-wider text-sm font-light" 
                                onClick={handleChangePassword}
                            >
                                Confirm Change
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 移动端设计 */}
            <div className="block md:hidden px-4 pt-12 mt-12 space-y-24">
                {/* 个人信息管理 - 移动版 */}
                <div className="bg-white mb-8 pb-6">
                    <h2 className="text-xl font-medium mb-4">Personal Information</h2>
                    {user ? (
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm font-light">Email Address</p>
                                <p className="text-base font-light">{user.email}</p>
                            </div>
                            <div className="pt-3">
                                <button 
                                    className="w-full py-2 bg-black font-light text-sm text-white" 
                                    onClick={() => setShowChangePassword(true)}
                                >
                                    CHANGE PASSWORD
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm">Loading...</p>
                    )}
                </div>

                {/* 订单历史 - 移动版 */}
                <div className="bg-white">
                    <h2 className="text-xl font-medium mb-4">Order History</h2>
                    {orders.length > 0 ? (
                        <div className="space-y-4 p-3">
                            {orders.map((order, index) => (
                                <div key={`${order.study_resource_id}-${index}`} className="border border-black p-4">
                                    <div className="p-3">
                                        <h3 className="text-base font-medium">{order.title}</h3>
                                    </div>
                                    <div className="p-3 space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Type:</span>
                                            <span>{order.type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Level:</span>
                                            <span>{order.level}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Chapter:</span>
                                            <span>{order.chapter || 'Full Version'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Price:</span>
                                            <span>${order.price}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Purchase Date:</span>
                                            <span>{new Date(order.purchase_date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="p-3 border-t border-gray-100">
                                        <button
                                            onClick={() => handleResendEmail(order.study_resource_id)}
                                            className="w-full py-2 bg-black text-white text-sm font-light tracking-wider"
                                        >
                                            RESEND ORDER EMAIL
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm">No order record in the system</p>
                    )}
                </div>

                {/* 优惠券 - 移动版 */}
                <div className="bg-white mb-8 pb-6">
                    <h2 className="text-xl font-medium mb-4">My Coupon</h2>
                    {coupons.length > 0 ? (
                        <div className="space-y-3">
                            {coupons.map((coupon) => (
                                <div key={coupon.id} className="bg-gray-50 p-3 rounded-md text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Code:</span>
                                        <span>{coupon.code}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Discount:</span>
                                        <span>{coupon.discount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Expiry Date:</span>
                                        <span>{coupon.expiry_date}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Status:</span>
                                        <span>{coupon.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm">No available coupon right now</p>
                    )}
                </div>
            </div>

            {/* 桌面端设计 */}
            <div className="hidden md:block">
                {/* 订单管理 */}
                <div className="flex px-24 m-24 space-x-24 items-start">
                    <div className="w-2/3">
                        <h2 className="text-xl font-light tracking-wider mb-8">Order History</h2>
                        {orders.length > 0 ? (
                            <div className="grid grid-cols-2 gap-16 w-full">
                                {orders.map((order, index) => (
                                    <div key={`${order.study_resource_id}-${index}`} className="">
                                        <div className="flex flex-col border border-black p-8">
                                            <p className="text-md font-base tracking-wide">{order.title}</p>
                                            <div className="text-sm font-light leading-[0.5rem] mt-4">
                                                <p>Type: {order.type}</p>
                                                <p>Level: {order.level}</p>
                                                <p>Chapter: {order.chapter || 'Full Version'}</p>
                                                <p>Price: ${order.price}</p>
                                                <p>Purchase Date: {new Date(order.purchase_date).toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={() => handleResendEmail(order.study_resource_id)}
                                                className="w-3/5 mt-6 px-3 py-1 bg-black text-white text-sm tracking-wider font-light hover:bg-opacity-[75%] "
                                            >
                                                RESEND ORDER EMAIL
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm font-light mt-2">No order record in the system</p>
                        )}
                    </div>

                    <div className="flex flex-col w-1/3 space-y-24">
                        {/* 个人信息管理 */}
                        <div className="bg-white">
                            <h2 className="text-xl font-light tracking-wider">Personal Information</h2>
                            {user ? (
                                <div className="space-y-4">
                                    <p className="font-light text-md text-gray-700 mt-2">Email Address</p>
                                    <p className="text-black font-light text-sm">{user.email}</p>
                                    <div className="flex justify-start items-center pt-6">
                                        <button className="px-3 py-1.5 bg-black font-light tracking-wide text-sm hover:bg-opacity-[75%] text-white" onClick={() => setShowChangePassword(true)}>CHANGE PASSWORD</button>
                                    </div>
                                </div>
                            ) : (
                                <p>Loading...</p>
                            )}
                        </div>
                        {/* Coupon */}
                        <div className="bg-white space-y-2">
                            <h2 className="text-xl font-light tracking-wider">My Coupon</h2>
                            {coupons.length > 0 ? (
                                <ul>
                                    {coupons.map((coupon) => (
                                        <li key={coupon.id} className="border-b py-2">
                                            <p><strong>优惠码：</strong>{coupon.code}</p>
                                            <p><strong>折扣：</strong>{coupon.discount}</p>
                                            <p><strong>有效期：</strong>{coupon.expiry_date}</p>
                                            <p><strong>状态：</strong>{coupon.status}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm font-light">No available coupon right now</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardComponent;
