import React, { useState } from "react";
import Head from "next/head";
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
      setMessage('Error: ' + errorData);
    }
  };

  return (
    <div>
      <Head>
        <title>Forgot Password | BioByte</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <SimpleHeader />
      <div className="flex items-center justify-center min-h-screen bg-lightest">
        <div className="flex flex-col items-center w-full max-w-md p-8">
          <h2 className="text-center text-xl font-light mb-6 tracking-wide">
            CAN'T REMEMBER YOUR PASSWORD?
          </h2>
          <p className="text-md font-light text-center">
            Tell us your email address and we'll send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="relative w-[350px] mt-4 mb-6">
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
            <div className="flex justify-center">
              <button
                type="submit"
                className="w-auto px-16 py-2 text-white tracking-wider bg-black text-xs tracking-wider font-light border-black border hover:bg-opacity-[75%] transition duration-200"
              >
                SUBMIT
              </button>
            </div>
          </form>
          {message && (
            <p className="mt-4 font-light text-sm tracking-wider text-gray-800">{message}</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
