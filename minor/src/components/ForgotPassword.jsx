import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [formData, setFormData] = useState({ identifier: "", dob: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://book-share-backend-one.vercel.app/api/forgot-password", formData);
      setMessage(response.data.message);
      if (response.data.message === "Verification successful! You can reset your password.") {
        navigate("/reset-password");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error occurred.");
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-wrapper">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <h2>Forgot Password</h2>
          </div>
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="identifier">
                Username or Email:
              </label>
              <input
                type="text"
                id="identifier"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                placeholder="Enter username or email"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dob">
                Date of Birth:
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="verify-button">
              Verify
            </button>
            {message && (
              <div className={`message ${message.includes("successful") ? "success" : "error"}`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;