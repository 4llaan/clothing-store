import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // To get email from state and navigate

const OtpModal = () => {
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const location = useLocation(); // Get state passed from signup
  const navigate = useNavigate();
  const email = location.state?.email; // Access the email passed through the navigate state

  const handleVerify = async () => {
    try {
      const response = await fetch('http://localhost:4000/verify-otp', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        // OTP is verified successfully, navigate to login page
        navigate("/login");
      } else {
        setErrorMessage(data.message || "OTP verification failed.");
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="otp-modal">
      <div className="otp-modal-content">
        <h2>Enter OTP</h2>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
        />
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button onClick={handleVerify}>Verify</button>
      </div>
    </div>
  );
};

export default OtpModal;
