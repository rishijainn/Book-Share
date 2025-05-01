import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import components
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Signout from "./components/Signout";
import SellPage from "./components/SellPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import PurchasePage from "./components/PurchasePage";
import ExchangePage from "./components/ExchangePage";
import LibraryDashboard from "./components/AIBookRecommendationBot";

function App() {
  // Mock user state - replace with your actual user state management
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState('');
  
  // Get user data on component mount (example - replace with your actual auth logic)
  useEffect(() => {
    // Example: Get user from localStorage or context
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser));
    }
    
    // Example: Get location from browser or user data
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(`${position.coords.latitude},${position.coords.longitude}`);
      },
      () => {
        setLocation('Unknown');
      }
    );
  }, []);

  return (
    <Router>
      {/* ToastContainer for global notifications */}
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Protected Routes */}
        <Route path="/Home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/profile" element={<Profile user={user} />} />
        <Route path="/signout" element={<Signout />} />
        <Route path="/sell" element={<SellPage location={location} user={user || {}} />} />
        <Route path="/purchase" element={<PurchasePage user={user} />} />
        <Route path="/exchange" element={<ExchangePage user={user} />} />
        <Route path="/library" element={<LibraryDashboard user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;