import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Book, ShoppingCart, RefreshCcw, User, LogOut, Library } from 'lucide-react';
import SellPage from "./SellPage";
import PurchasePage from "./PurchasePage";
import Profile from "./Profile";
import ExchangePage from "./ExchangePage";
import LibraryDashboard from "./AIBookRecommendationBot";

const Dashboard = () => {
  const [location, setLocation] = useState("Fetching location...");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await axios.get(
              `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=8d5793d6e03a408ab7606194e4acadc0`
            );
            const result = response.data.results[0];
            setLocation(result?.formatted || "Location not found");
          } catch {
            setError("Failed to fetch location.");
          }
        },
        () => setError("Unable to retrieve location.")
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  const handleSignout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <Profile user={user} />;
      case "sell":
        return <SellPage location={location} user={user} />;
      case "purchase":
        return <PurchasePage user={user} />;
      case "exchange":
        return <ExchangePage location={location} user={user} />;
      case "library":
        return <LibraryDashboard user={user} />;
      default:
        return <Profile user={user} />;
    }
  };

  const toggleMobileNav = () => {
    setIsMobileNavOpen(!isMobileNavOpen);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-sm py-2">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Brand/Logo */}
          <div className="text-2xl font-bold text-white">
            BookShare
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileNav}
              className="text-white hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition duration-300"
            >
              {isMobileNavOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className={`${isMobileNavOpen ? "fixed inset-0 bg-white z-50 flex flex-col items-center justify-center space-y-6" : "hidden md:flex items-center space-x-4"}`}>
            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "profile" ? "bg-teal-500 text-white" : "text-white hover:bg-white hover:bg-opacity-10"
              }`}
              onClick={() => { setActiveTab("profile"); setIsMobileNavOpen(false); }}
            >
              <User size={18} />
              <span>Profile</span>
            </button>

            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "sell" ? "bg-teal-500 text-white" : "text-white hover:bg-white hover:bg-opacity-10"
              }`}
              onClick={() => { setActiveTab("sell"); setIsMobileNavOpen(false); }}
            >
              <Book size={18} />
              <span>Sell</span>
            </button>

            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "purchase" ? "bg-teal-500 text-white" : "text-white hover:bg-white hover:bg-opacity-10"
              }`}
              onClick={() => { setActiveTab("purchase"); setIsMobileNavOpen(false); }}
            >
              <ShoppingCart size={18} />
              <span>Purchase</span>
            </button>

            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "exchange" ? "bg-teal-500 text-white" : "text-white hover:bg-white hover:bg-opacity-10"
              }`}
              onClick={() => { setActiveTab("exchange"); setIsMobileNavOpen(false); }}
            >
              <RefreshCcw size={18} />
              <span>Exchange</span>
            </button>

            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "library" ? "bg-teal-500 text-white" : "text-white hover:bg-white hover:bg-opacity-10"
              }`}
              onClick={() => { setActiveTab("library"); setIsMobileNavOpen(false); }}
            >
              <Library size={18} />
              <span>Book Recommendation Bot</span>
            </button>
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img
                src={user?.profileImage || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <span className="text-sm font-medium text-white hidden md:inline">
                {user?.name || "User"}
              </span>
            </div>

            <button
              onClick={handleSignout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span className="hidden md:inline" onClick={()=>{navigate('/')}}>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;