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
                <img src="/dashboardbg4.jpg" alt="dashboardbg"></img>
                <p className="absolute bottom-0 left-8 text-4xl text-black md:text-7xl tracking-wide">DASHBOARD</p>
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
    );
};

export default DashboardComponent;
