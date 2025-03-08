import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Mail, Lock, UserPlus } from "lucide-react";
import { login, register } from "../apiroutes/index";

const LogIn = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? login : register;
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          };

      const response = await axios.post(endpoint, payload);
      console.log("Response:", response.data);
      if (isLogin) {
        navigate("/home");
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 overflow-hidden relative">
      <div className="relative w-[900px] h-[550px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Background Design Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-blue-100 rounded-full opacity-30"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-blue-200 rounded-full opacity-30"></div>
        </div>

        {/* Content Container */}
        <div className="relative w-full h-full flex">
          {/* Border Beam Animation */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 rounded-2xl border-4 border-transparent animate-border-beam" />
          </div>

          <style>
            {`
          @keyframes border-beam {
            0% {
              border-color: #ffaa40;
            }
            50% {
              border-color: #9c40ff;
            }
            100% {
              border-color: #ffaa40;
            }
          }
          .animate-border-beam {
            animation: border-beam 6s linear infinite;
          }
        `}
          </style>
          {/* Form Side */}
          <div
            className={`w-1/2 p-8 transition-transform duration-700 ease-in-out transform ${
              isLogin ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="h-full flex flex-col justify-center max-w-[320px] mx-auto">
              <h2 className="text-3xl font-bold mb-2 text-gray-800">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-gray-600 mb-8">
                {isLogin
                  ? "Please sign in to access your account"
                  : "Sign up to get started with your new account"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Full Name"
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                    <UserPlus
                      className="absolute right-3 top-3 text-gray-400"
                      size={20}
                    />
                  </div>
                )}

                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                  <Mail
                    className="absolute right-3 top-3 text-gray-400"
                    size={20}
                  />
                </div>

                <div className="relative">
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-blue-300 transition-all"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <Lock
                    className="absolute right-3 top-3 text-gray-400"
                    size={20}
                  />
                </div>

                {isLogin && (
                  <div className="text-right">
                    <a
                      href="#"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Forgot Password?
                    </a>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all"
                >
                  {isLogin ? "Sign In" : "Sign Up"}
                </button>
              </form>
            </div>
          </div>

          {/* Image/Welcome Side */}
          <div
            className={`absolute w-1/2 h-full transition-transform duration-700 ease-in-out transform ${
              isLogin ? "translate-x-full" : "translate-x-0"
            }`}
          >
            <div className="h-full bg-gradient-to-br from-blue-600 to-blue-800 p-8 flex flex-col justify-center items-center text-white text-center">
              <h3 className="text-3xl font-bold mb-4">
                {isLogin ? "New Here?" : "One of Us?"}
              </h3>
              <p className="mb-8 max-w-[280px]">
                {isLogin
                  ? "Sign up and discover a great amount of new opportunities!"
                  : "If you already have an account, just sign in. We've missed you!"}
              </p>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="px-8 py-3 border-2 border-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-all"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
