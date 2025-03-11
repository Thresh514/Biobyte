import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SimpleHeader from "../components/SimpleHeader";
import Footer from "../components/Footer";

const ResetPassword = () => {
  const router = useRouter();
  const { token } = router.query; // 获取 URL 中的 token

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  //检查 token 是否存在
  useEffect(() => {
    if (router.isReady && !token) {
      setMessage("Invalid or expired reset link.");
    }
  }, [token]);

  //添加密码强度验证
  const isPasswordStrong = (password) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("Invalid or expired reset link.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (!isPasswordStrong(newPassword)) {
      setMessage(
        "Password must be at least 8 characters long and include a number and an uppercase letter."
      );
      return;
    }

    setIsSubmitting(true);

    // 发送新密码到后端 API
    const response = await fetch("/api/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });

    if (response.ok) {
      setMessage("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login"); // 重定向到登录页面
      }, 2000); // 2秒后跳转
    } else {
      const errorData = await response.json();
      setMessage(errorData.message || "Error resetting password");
    }
  };

  return (
    <div>
      <SimpleHeader />
      <div className="flex items-center justify-center min-h-screen bg-lightest">
        <div className="flex flex-col items-center w-full max-w-md p-8">
          <h2 className="text-center text-3xl font-light mb-8">Reset Password</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative w-[350px]">
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                placeholder="New password"
                className="peer w-full px-0 py-2 h-6 text-md font-light border-b border-gray-400
                            bg-transparent text-gray-900 focus:outline-none focus:border-black placeholder-transparent"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <label
                htmlFor="newPassword"
                className="absolute left-0 top-2 text-gray-400 text-lg transition-all 
                          peer-placeholder-shown:top-1 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                          peer-focus:top-[-16px] peer-focus:text-xs peer-focus:text-gray-600
                          peer-[:not(:placeholder-shown)]:top-[-16px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-600">
                NEW PASSWORD
              </label>
            </div>

            <div className="relative w-[350px]">
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm new password"
                className="peer w-full px-0 py-2 h-6 text-md font-light border-b border-gray-400
                          bg-transparent text-gray-900 focus:outline-none focus:border-black placeholder-transparent"
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <label
                htmlFor="confirmPassword"
                className="absolute left-0 top-2 text-gray-400 text-lg transition-all 
                  peer-placeholder-shown:top-1 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                  peer-focus:top-[-16px] peer-focus:text-xs peer-focus:text-gray-600
                  peer-[:not(:placeholder-shown)]:top-[-16px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-600">
                CONFIRM PASSWORD
              </label>
            </div>
          </form>
          <div className="flex justify-center mt-10">
              <button
                type="submit"
                className={`w-auto px-16 py-2 text-white tracking-wider text-xs tracking-widest font-light border-black border hover:bg-opacity-[75%] transition duration-200" ${
                  isSubmitting ? "bg-opacity-[75%] bg-black cursor-not-allowed" : "bg-black hover:bg-opacity-[75%]"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
              </button>
          </div>
          {message && <p className="mt-4 font-light text-sm tracking-wider text-gray-800">{message}</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
