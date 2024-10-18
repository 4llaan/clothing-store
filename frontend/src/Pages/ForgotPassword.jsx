import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './CSS/ForgotPassword.css'; // Assuming you have a CSS file for styling

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP, Step 3: Reset Password
  const navigate = useNavigate(); // Initialize navigate

  // Function to send OTP to email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/send-otp', { email });
      Swal.fire({
        title: 'Success!',
        text: response.data.message,
        icon: 'success',
        confirmButtonText: 'OK',
      });
      setStep(2); // Move to the OTP step
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'An unexpected error occurred.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  // Function to verify the OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:4000/verify-otp', { email, otp });
      Swal.fire({
        title: 'Success!',
        text: response.data.message,
        icon: 'success',
        confirmButtonText: 'OK',
      });
      setStep(3); // Move to reset password step
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'An unexpected error occurred.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  // Function to reset the password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return Swal.fire({
        title: 'Error!',
        text: 'Passwords do not match.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }

    try {
      const response = await axios.post('http://localhost:4000/reset-password', { email, password: newPassword });
      Swal.fire({
        title: 'Success!',
        text: response.data.message,
        icon: 'success',
        confirmButtonText: 'OK',
      });
      navigate('/login'); // Redirect to login after password reset
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'An unexpected error occurred.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };

  return (
    <div className="forgot-password-container">
      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <h1>Forgot Password</h1>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send OTP</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <h1>Verify OTP</h1>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit">Verify OTP</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <h1>Reset Password</h1>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Reset Password</button>
        </form>
      )}
    </div>
  );
}

export default ForgotPassword;
