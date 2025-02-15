import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SimpleHeader from "../components/SimpleHeader";

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
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-6 bg-white rounded shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Reset Password</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium">New Password</label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Confirm Password</label>
            <input
              type="password"
              className="w-full p-2 border border-gray-300 rounded"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            className={`w-full p-2 text-white rounded mt-4 ${
              isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>
        {message && <p className="mt-4 text-green-500">{message}</p>}
      </div>
    </div>
    </div>
  );
};

export default ResetPassword;
