import { useState, useEffect } from "react";
import { useRouter } from "next/router";

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
        if (newPassword !== confirmPassword) {
            setMessage("Two passwords do not match.");
            return;
        }

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
            }, 2000);
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
        <div className="w-full">
            <div className="relative">
                <img src="/dashboardbg.jpeg" alt="dashboardbg"></img>
                <p className="absolute bottom-0 left-8 text-4xl text-white md:text-7xl tracking-wide">DASHBOARD</p>
            </div>

            {/* 修改密码模态框 */}
            {showChangePassword && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center p-12">
                    <div className="bg-white rounded-lg shadow-lg max-w-lg w-auto px-12 py-8">
                        <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                        <label className="text-sm text-gray-600 font-semibold">Current password</label>
                        <input type="password" placeholder="Enter current password" className="w-full p-2 border rounded mb-2" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                        <label className="text-sm text-gray-600 font-semibold">New password</label>
                        <input type="password" placeholder="Must be at least 6 Characters" className="w-full p-2 border rounded mb-2" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        <label className="text-sm text-gray-600 font-semibold">Confirm new password</label>
                        <input type="password" placeholder="Must match password above" className="w-full p-2 border rounded mb-2" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                        {message && <p className="text-center text-red-500 mt-4">{message}</p>}
                        <div className="flex justify-end space-x-4 mt-4">
                            <button className="px-4 py-2 border rounded" onClick={() => { setShowChangePassword(false); setMessage(null); }}>Dismiss</button>
                            <button className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded" onClick={handleChangePassword}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 订单管理 */}
            <div className="flex justify-between items-center">
                <div className="mb-8 p-6 bg-white grid grid-col-2 gap-20">
                    <h2 className="text-xl font-semibold mb-4">Order History</h2>
                    {orders.length > 0 ? (
                        <ul className="space-y-4">
                            {orders.map((order, index) => (
                                <li key={`${order.study_resource_id}-${index}`} className="border-b py-4">
                                    <div className="flex flex-col space-y-2">
                                        <p className="text-lg font-medium">{order.title}</p>
                                        <div className="text-sm text-gray-600">
                                            <p>Type: {order.type}</p>
                                            <p>Level: {order.level}</p>
                                            <p>Chapter: {order.chapter || 'Full Version'}</p>
                                            <p>Price: ${order.price}</p>
                                            <p>Purchase Date: {new Date(order.purchase_date).toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => handleResendEmail(order.study_resource_id)}
                                            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 w-fit"
                                        >
                                            Resend Order Email
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No order record in the system</p>
                    )}
                </div>

                    <div className="flex flex-col w-1/2">
                        {/* 个人信息管理 */}
                        <div className="mb-8 p-6 bg-white">
                            <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
                            {user ? (
                                <div className="">
                                    <p className="font-semibold text-gray-700">Email Address</p>
                                    <p className="text-gray-500">{user.email}</p>
                                    <div className="flex justify-end items-center">
                                        <button className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded" onClick={() => setShowChangePassword(true)}>Change Password</button>
                                    </div>
                                </div>
                            ) : (
                                <p>Loading...</p>
                            )}
                        </div>
                        {/* Coupon */}
                        <div className="mb-8 p-6 bg-white">
                            <h2 className="text-xl font-semibold mb-4">My Coupon</h2>
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
                                <p>No available coupon right now</p>
                            )}
                        </div>
                    </div>
                    
                
            </div>
        </div>
    );
};

export default DashboardComponent;
