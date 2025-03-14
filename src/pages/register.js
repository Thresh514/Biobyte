// /pages/register.js

import React, { useState } from "react";
import { useRouter } from "next/router";
import SimpleHeader from "../components/SimpleHeader";
import Footer from "../components/Footer";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const router = useRouter();

  const handleSendCode = async () => {
    if (countdown > 0) return; // 如果倒计时未结束，不允许点击

    const response = await fetch("/api/send-verification-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Verification code sent to your email.");
      setIsCodeSent(true);
      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      alert(`Failed to send verification code. Please try again. Reason: ${data.message || "Unknown error."}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (!verificationCode) {
      alert("Please enter the verification code.");
      return;
    }

    // 发送注册请求到后端 API
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, verificationCode: String(verificationCode).trim() }),
    });

    const data = await response.json();

    if (response.ok) {
      // 注册成功后的操作，如跳转到登录页面
      alert("Registration successful! Redirecting to login...");
      await router.push('/login');
    } else {
      if (data.message === "Email already registered. Please log in.") {
        alert("This email is already registered. Redirecting to login...");
        await router.push("/login"); // 跳转到登录页面
      } else {
        alert(`Registration failed. Reason: ${data.message || "Unknown error."}`);
      }
    }
  };

  return (
    <div>
      <SimpleHeader />
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center w-full max-w-md p-8 bg-white">
          <h2 className="text-center text-3xl font-light tracking-wider mb-8">CREATE ACCOUNT</h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="relative w-[400px]">
              {/* 输入框 */}
              <input
                type="email"
                id="email"
                value={email}
                className="peer w-full px-0 py-2 h-6 text-md font-light border-b border-gray-400
                bg-transparent text-gray-900 focus:outline-none focus:border-black placeholder-transparent"
                placeholder="EMAIL"
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
            <div>
              <div className="relative w-[400px]">
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="PASSWORD"
                  className="peer w-full px-0 py-2 h-6 text-md font-light border-b border-gray-400
                  bg-transparent text-gray-900 focus:outline-none focus:border-black placeholder-transparent"
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
            </div>

            {/* Confirm Password */}
            <div className="relative w-[400px]">
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm Password"
                className="peer w-full px-0 py-2 h-6 text-md font-light border-b border-gray-400 
                bg-transparent text-gray-900 focus:outline-none focus:border-black placeholder-transparent"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <label
                htmlFor="confirmPassword"
                className="absolute left-0 top-2 text-gray-400 text-lg transition-all 
                peer-placeholder-shown:top-1 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                peer-focus:top-[-16px] peer-focus:text-xs peer-focus:text-gray-600
                peer-[:not(:placeholder-shown)]:top-[-16px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-600"
              >
                CONFIRM PASSWORD
              </label>
            </div>

            {/* Verification Code */}
            <div className="flex space-x-4 space-y-[-16px]">
              <div className="relative w-[300px]">
                <input
                  type="text"
                  name="verificationCode"
                  id="verificationCode"
                  placeholder="Enter verification code"
                  className="peer w-full px-0 py-2 h-6 text-md font-light border-b border-gray-400 
                  bg-transparent text-gray-900 focus:outline-none focus:border-black placeholder-transparent"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
                <label
                  htmlFor="verificationCode"
                  className="absolute left-0 top-2 text-gray-400 text-lg transition-all 
                  peer-placeholder-shown:top-1 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400
                  peer-focus:top-[-16px] peer-focus:text-xs peer-focus:text-gray-600
                  peer-[:not(:placeholder-shown)]:top-[-16px] peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-gray-600"
                >
                  VERIFICATION CODE
                </label>
              </div>
              {/*Send Code 按钮*/}
              <button
                type="button"
                className={`px-5 py-2 w-[80px] font-light text-white text-sm tracking-wider bg-black bg-opacity-[95%] hover:bg-opacity-[75%] transition duration-300 ${
                  countdown > 0
                    ? "text-white bg-black cursor-not-allowed"
                    : ""
                }`}
                onClick={handleSendCode}
                disabled={countdown > 0} // 倒计时期间禁用按钮
              >
                {countdown > 0 ? `${countdown}s` : "Send"}
              </button>
            </div>
            <div className="flex w-1/2 pt-2">
              <button
                type="submit"
                className="w-auto px-16 py-2 text-gray-700 text-sm tracking-wider font-light border-black border hover:text-gray-400 transition duration-300"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
