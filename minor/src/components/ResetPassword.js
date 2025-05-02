import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";
import "./ResetPassword.css";

function ResetPassword() {
  const [formData, setFormData] = useState({ identifier: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // Initialize navigate function

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("https://book-share-backend2.vercel.app/api/reset-password", formData);
      setMessage(response.data.message);

      if (response.data.message === "Password reset successfully!") {
        setTimeout(() => {
          navigate("/login"); // Redirect to the home page after 2 seconds
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Error occurred.");
    }
  };

  return (
    <div className="reset-password-container" style={{ textAlign: "center", marginTop: "50px" }}>
      <div className="reset-password-form">
        <h2>Reset Password</h2>
        <form onSubmit={handleSubmit} style={{ display: "inline-block", textAlign: "left" }}>
          <div className="form-group" style={{ marginBottom: "10px" }}>
            <label className="form-label" style={{ display: "inline-block", width: "150px" }}>
              Username or Email:
            </label>
            <input
              type="text"
              name="identifier"
              placeholder="Enter your username or email"
              value={formData.identifier}
              onChange={handleChange}
              required
              style={{ width: "300px" }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: "10px" }}>
            <label className="form-label" style={{ display: "inline-block", width: "150px" }}>
              New Password:
            </label>
            <input
              type="password"
              name="newPassword"
              placeholder="Enter your new password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              style={{ width: "300px" }}
            />
          </div>
          <button type="submit" className="btn">Reset Password</button>
        </form>
        <p className="message" style={{ marginTop: "20px" }}>{message}</p>
      </div>
    </div>
  );
}

export default ResetPassword;