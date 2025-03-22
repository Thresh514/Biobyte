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
            localStorage.setItem("token_exp", data.token_exp);  // 存 token 过期时间
            localStorage.setItem("email", email);  // 存 email
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

    useEffect(() => {
        // 检查 token 是否过期
        const checkTokenExpiration = () => {
            const tokenExp = localStorage.getItem("token_exp");
            if (tokenExp && Date.now() > parseInt(tokenExp, 10)) {
                logout();
            } else {
                // 设置定时器，在 token 过期时登出
                const timeout = parseInt(tokenExp, 10) - Date.now();
                if (timeout > 0) {
                    setTimeout(logout, timeout);
                }
            }
        };

        checkTokenExpiration();
    }, []);

    const logout = () => {
        localStorage.removeItem("userLoggedIn");
        localStorage.removeItem("token");
        localStorage.removeItem("token_exp");
        localStorage.removeItem("email");
        router.push("/login");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-lightest">
            {/* 登录框 */}
            <div className="flex flex-col justify-center items-center max-w-lg p-12 bg-white">
                <h2 className="text-center text-3xl font-light mb-8">LOG IN</h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="relative w-[400px]">
                        {/* 输入框 */}
                        <input
                            type="email"
                            id="email"
                            value={email}
                            className="peer w-full px-0 py-2 h-6 text-md font-light border-b border-gray-400
                                bg-transparent text-gray-900 focus:outline-none focus:border-black placeholder-transparent"
                            placeholder=""
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        {/* Label 作为 Placeholder */}
                        <label
                            htmlFor="email"
                            className="absolute left-0 top-2 text-gray-400 text-lg transition-all 
                                peer-placeholder-shown:top-1 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                                peer-focus:top-[-16px] peer-focus:text-xs peer-focus:text-gray-600
                                peer-[:not(:placeholder-shown)]:top-[-16px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-600"
                            >
                            EMAIL
                        </label>
                    </div>
                    <div className="flex flex-col">
                        <div className="relative w-[400px]">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                className="peer w-full px-0 py-2 h-6 text-md font-light border-b border-gray-400
                                    bg-transparent text-gray-900 focus:outline-none focus:border-black placeholder-transparent"
                                placeholder=""
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <label
                                htmlFor="password"
                                className="absolute left-0 top-2 text-gray-400 text-lg transition-all 
                                    peer-placeholder-shown:top-1 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                                    peer-focus:top-[-16px] peer-focus:text-xs peer-focus:text-gray-600
                                    peer-[:not(:placeholder-shown)]:top-[-16px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-600"
                            >
                                PASSWORD
                            </label>
                        </div>
                        <a className="text-sm text-gray-600 mt-2 cursor-pointer hover:underline" onClick={handleForgotPasswordClick}>Forgot your password?</a>
                    </div>
                    <div className="flex flex-col w-1/2 space-y-4 pt-6">
                        <button
                            type="submit"
                            className="w-auto px-16 py-2 text-white bg-black text-xs tracking-wider font-light border-black border hover:bg-opacity-[75%] transition duration-200"
                        >
                            LOG IN
                        </button>
                        <button 
                            onClick={handleSignupClick} 
                            className="w-auto px-16 py-2 text-gray-500 text-xs tracking-wider font-light border-black border hover:text-gray-300 transition duration-200"
                        >
                            SIGN UP
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
