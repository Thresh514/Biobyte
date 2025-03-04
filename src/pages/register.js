// /pages/register.js

import React, { useState } from "react";
import { useRouter } from "next/router";
import SimpleHeader from "../components/SimpleHeader";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  

  const router = useRouter(); 

  const handleSendCode = async () => {
    const response = await fetch ("/api/send-verification-code", {
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
    }else{
      alert(`Failed to send verification code. Please try again. Reason: ${data.message || "Unknown error."}`);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if(!verificationCode){
      alert("Please enter the verification code.");
      return;
    }

    // 发送注册请求到后端 API
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, verificationCode: String(verificationCode).trim(), }),
    });

    const data = await response.json();

    if (response.ok) {
      // 注册成功后的操作，如跳转到登录页面
      alert("Registration successful! Redirecting to login...");
      router.push('/login');
    } else {
        if (data.message === "Email already registered. Please log in.") {
          alert("This email is already registered. Redirecting to login...");
          router.push("/login"); // 跳转到登录页面
        } else {
          alert(`Registration failed. Reason: ${data.message || "Unknown error."}`);
        }
    }
  };

  return (
    <div>
      <SimpleHeader />
    <div className="flex items-center justify-center min-h-screen bg-lightest">
      <div className="flex flex-col items-center w-full max-w-md p-8 bg-white rounded-lg md:shadow-lg lg:shadow-lg">
        <h2 className="text-center text-3xl font-semibold mb-6">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-[300px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-[300px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-[300px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            {/* 验证码输入框 */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700">Verification Code</label>
              <input
                type="text"
                name="verificationCode"
                placeholder="Enter verification code"
                className="w-[300px] px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
              />
            </div>
            {/* 发送验证码按钮 */}
            {!isCodeSent && (
              <button
                type="button"
                className="px-4 py-2 bg-gray-500 text-white text-lg font-bold rounded-md hover:bg-gray-300 transition duration-300"
                onClick={handleSendCode}
              >
                Send
              </button>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full px-16 py-3 bg-gray-500 text-white text-white text-lg font-bold rounded-md hover:bg-gray-600 transition duration-300"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default Register;
