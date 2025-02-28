import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // 导入 useRouter hook

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();  // 使用 useRouter 创建 router 对象

    // 跳转到忘记密码页面
    const handleForgotPasswordClick = () => {
        router.push("/forgot-password");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // 发送登录请求
        const response = await fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
            // 登录成功，跳转到主页
            const data = await response.json(); // 解析 JSON 响应
            localStorage.setItem("userLoggedIn", true);
            localStorage.setItem("token", data.token);  // 存 JWT
            localStorage.setItem("username", data.username);  // 存 username
            router.push("/");
        } else {
            // 登录失败，显示错误信息
            alert("Login Failed");
        }
    };

    const handleSignupClick = () => {
        router.push("/register");  // 假设 "/register" 是注册页面的路径
    };

    useEffect(() => {
        document.body.classList.add('fade-in');
        return () => {
            document.body.classList.remove('fade-in');
        };
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-lightest">
                {/* 右侧登录框 */}
                <div className="flex flex-col justify-center items-center max-w-md p-8 bg-white rounded-lg md:shadow-lg lg:shadow-lg">
                    <h2 className="text-center text-3xl font-semibold mb-6">Welcome back!</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700">Username</label>
                            <input
                                type="email"
                                name="email"
                                className="w-[300px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={email}
                                onChange={(e) => setEmail
                                    (e.target.value)}
                                required
                            />
                        </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="w-[300px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full px-16 py-3 bg-darker text-white text-lg font-bold rounded-md hover:bg-middle transition duration-300"
                    >
                        Login
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <a href="#" className="text-sm text-lighter font-semibold hover:underline" onClick={handleForgotPasswordClick}>Forgot Password?</a>
                    <p className="mt-2 text-sm text-gray-600">
                    Need an account? <button onClick={handleSignupClick} className="text-lighter font-semibold hover:underline">Sign Up</button>
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                        By logging in, you agree with Biomind Logic's <a href="#" className="text-lighter font-semibold hover:underline">Service Terms</a> and <a href="#" className="text-lighter font-semibold hover:underline">Honor Code</a> and have read our <a href="#" className="text-lighter font-semibold hover:underline">Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
