import React, { useState } from "react";
import SimpleHeader from "../components/SimpleHeader";
import Footer from "../components/Footer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("/api/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
        const data = await response.json();
        console.log(data);
        setMessage(data.message);
    } else {
        const errorData = await response.text();
        console.error('Error:', errorData);
        setMessage('Error: ' + errorData);  // 将错误信息显示给用户
    }
  };

  return (
    <div>
      <SimpleHeader />
    
    <div className="flex items-center justify-center min-h-screen bg-lightest">
      <div className="flex flex-col items-center w-full max-w-md p-8 bg-white rounded-lg md:shadow-lg lg:shadow-lg">
        <h2 className="text-center text-3xl font-semibold mb-6">Forgot Password</h2>
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
          <button
            type="submit"
            className="w-full px-12 py-2.5 bg-gray-500 text-white text-lg font-semibold rounded-md hover:bg-gray-600 transition duration-300"
          >
            Send Reset Link
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
      </div>
    </div>
    <Footer />
    </div>
  );
};

export default ForgotPassword;
