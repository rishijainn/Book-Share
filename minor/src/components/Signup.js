import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Calendar, Phone, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    mobileNumber: "",
  });
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // For multi-step form
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateStep1 = () => {
    const { username, email } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!username.trim()) {
      setError("Username is required");
      return false;
    }
    
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const goToNextStep = () => {
    if (validateStep1()) {
      setStep(2);
      setError("");
    }
  };

  const goToPreviousStep = () => {
    setStep(1);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const { username, email, password, confirmPassword, dob, mobileNumber } = formData;
    
    if (!username || !email || !password || !confirmPassword || !dob || !mobileNumber) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    
    // Validate mobile number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(mobileNumber)) {
      setError("Please enter a valid 10-digit mobile number.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("https://book-share-backend-one.vercel.app/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message);
      
      localStorage.setItem("token", data.token);
      
      // Show success message before redirecting
      setError("");
      setStep(3); // Success step
      
      // Redirect after a brief delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      
    } catch (error) {
      setError(error.message);
      setStep(2); // Go back to second step if there's an error
    } finally {
      setLoading(false);
    }
  };

  // Get field icon based on field name
  const getFieldIcon = (fieldName) => {
    switch (fieldName) {
      case "username":
        return <User size={18} className="text-gray-500" />;
      case "email":
        return <Mail size={18} className="text-gray-500" />;
      case "password":
      case "confirmPassword":
        return <Lock size={18} className="text-gray-500" />;
      case "dob":
        return <Calendar size={18} className="text-gray-500" />;
      case "mobileNumber":
        return <Phone size={18} className="text-gray-500" />;
      default:
        return null;
    }
  };

  // Get human-readable field name
  const getFieldLabel = (fieldName) => {
    switch (fieldName) {
      case "username":
        return "Username";
      case "email":
        return "Email Address";
      case "password":
        return "Password";
      case "confirmPassword":
        return "Confirm Password";
      case "dob":
        return "Date of Birth";
      case "mobileNumber":
        return "Mobile Number";
      default:
        return fieldName;
    }
  };

  // Get placeholder text
  const getPlaceholder = (fieldName) => {
    switch (fieldName) {
      case "username":
        return "Choose a username";
      case "email":
        return "Your email address";
      case "password":
        return "Create a strong password";
      case "confirmPassword":
        return "Confirm your password";
      case "dob":
        return "MM/DD/YYYY";
      case "mobileNumber":
        return "10-digit mobile number";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-700">
        <div className="bg-gradient-to-r from-gray-800 to-teal-600 py-6 px-8">
          <h2 className="text-2xl font-bold text-white text-center">Create Your Account</h2>
          <div className="flex justify-center mt-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-white text-teal-600' : 'bg-gray-600 text-gray-300'} font-bold`}>1</div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-white' : 'bg-gray-600'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-white text-teal-600' : 'bg-gray-600 text-gray-300'} font-bold`}>2</div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-white' : 'bg-gray-600'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-white text-teal-600' : 'bg-gray-600 text-gray-300'} font-bold`}>3</div>
            </div>
          </div>
        </div>
        
        <div className="p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-900/30 border border-red-700 rounded-lg flex items-center text-red-400">
              <AlertCircle size={18} className="mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-gray-200 mb-4">Account Information</h3>
                
                {/* Username field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {getFieldLabel("username")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getFieldIcon("username")}
                    </div>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white"
                      placeholder={getPlaceholder("username")}
                      required
                    />
                  </div>
                </div>
                
                {/* Email field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {getFieldLabel("email")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getFieldIcon("email")}
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white"
                      placeholder={getPlaceholder("email")}
                      required
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow transition-colors flex items-center justify-center"
                  >
                    Continue <ArrowRight size={18} className="ml-2" />
                  </button>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-5">
                <h3 className="text-lg font-medium text-gray-200 mb-4">Security & Personal Details</h3>
                
                {/* Password field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {getFieldLabel("password")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getFieldIcon("password")}
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white"
                      placeholder={getPlaceholder("password")}
                      required
                    />
                  </div>
                </div>
                
                {/* Confirm Password field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {getFieldLabel("confirmPassword")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getFieldIcon("confirmPassword")}
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white"
                      placeholder={getPlaceholder("confirmPassword")}
                      required
                    />
                  </div>
                </div>
                
                {/* Date of Birth field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {getFieldLabel("dob")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getFieldIcon("dob")}
                    </div>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white"
                      required
                    />
                  </div>
                </div>
                
                {/* Mobile Number field */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {getFieldLabel("mobileNumber")}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getFieldIcon("mobileNumber")}
                    </div>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-white"
                      placeholder={getPlaceholder("mobileNumber")}
                      required
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    className="w-1/2 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium rounded-lg shadow transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-1/2 py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow transition-colors flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <>
                        <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></span>
                        Creating...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  <CheckCircle size={64} className="text-teal-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Account Created Successfully!</h3>
                <p className="text-gray-400 mb-6">Redirecting you to dashboard...</p>
                <div className="animate-pulse h-1 bg-teal-500 rounded-full max-w-xs mx-auto"></div>
              </div>
            )}
          </form>
          
          {step !== 3 && (
            <div className="mt-6 text-center">
              <p className="text-gray-400">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
                >
                  Log in
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;