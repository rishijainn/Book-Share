import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Lock, LogIn, AlertCircle } from "lucide-react";


function Login() {
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error messages when user starts typing
    if (error) setError("");
    if (message) setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:7654/api/login", formData);
      setMessage(response.data.message);
      if (response.status === 200) {
        // Assuming the backend sends the user data (including username) in the response
        const userData = response.data.user;
        localStorage.setItem('user', JSON.stringify(userData)); // Save user data to localStorage
        // Small delay for better UX
        setTimeout(() => {
          navigate("/"); // Redirect to dashboard
        }, 500);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-xl p-8 overflow-hidden border border-gray-700">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
            <LogIn size={28} className="text-teal-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-200">Welcome Back</h2>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-900/30 border border-red-700 rounded-lg flex items-center text-red-400">
            <AlertCircle size={18} className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && !error && (
          <div className="mb-6 p-3 bg-teal-900/30 border border-teal-700 rounded-lg text-teal-400">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Username or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-gray-500" />
                </div>
                <input
                  type="text"
                  name="identifier"
                  placeholder="Enter your username or email"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-500" />
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow transition-colors flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <LogIn size={18} className="ml-2" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Forgot your password?{" "}
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
            >
              Reset it here
            </button>
          </p>
          <p className="mt-4 text-gray-400">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;