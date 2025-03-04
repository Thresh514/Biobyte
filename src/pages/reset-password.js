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
        <div className="flex flex-col items-center w-full max-w-md p-8 bg-white rounded-lg md:shadow-lg lg:shadow-lg">
          <h2 className="text-center text-3xl font-semibold mb-6">Reset Password</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                className="w-[300px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                className="w-[300px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              className={`w-full px-16 py-2.5 text-white text-lg font-bold rounded-md transition duration-300 ${
                isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-gray-500 hover:bg-gray-600"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>
          </form>
          {message && <p className="mt-4 font-semibold text-red-500">{message}</p>}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ResetPassword;
