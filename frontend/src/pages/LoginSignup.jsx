import React, { useState } from "react";
import "./CSS/LoginSignup.css";
import googleIcon from "../components/Assets/google-icon.png"; // Import the local image

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = () => {
    // Add Google login functionality here
    console.log("Google login clicked");
  };

  // Validation function to check if any field is empty
  const validateForm = () => {
    if (state === "Sign Up" && !formData.username) {
      alert("Please enter your name.");
      return false;
    }
    if (!formData.email) {
      alert("Please enter your email.");
      return false;
    }
    if (!formData.password) {
      alert("Please enter your password.");
      return false;
    }
    return true;
  };

  const login = async () => {
    if (!validateForm()) return; // Don't proceed if validation fails

    try {
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth-token', data.token);
        window.location.replace("/");
      } else {
        alert(data.errors || "Login failed");
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert("An error occurred. Please try again.");
    }
  };

  const signup = async () => {
    if (!validateForm()) return; // Don't proceed if validation fails

    try {
      const response = await fetch('http://localhost:4000/signup', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth-token', data.token);
        window.location.replace("/");
      } else {
        alert(data.errors || "Signup failed");
      }
    } catch (error) {
      console.error('Error during signup:', error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="loginsignup">
      <div className="loginsignup-container">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state === "Sign Up" && (
            <input 
              type="text" 
              placeholder="Your name" 
              name="username" 
              value={formData.username} 
              onChange={changeHandler} 
            />
          )}
          <input 
            type="email" 
            placeholder="Email address" 
            name="email" 
            value={formData.email} 
            onChange={changeHandler} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            name="password" 
            value={formData.password} 
            onChange={changeHandler} 
          />
        </div>

        <button onClick={() => (state === "Login" ? login() : signup())}>Continue</button>
        
        <button className="loginsignup-google-btn" onClick={handleGoogleLogin}>
          <img
            src={googleIcon} // Use the local image here
            alt="Google Icon"
          />
          Continue with Google
        </button>

        {state === "Login" ? (
          <p className="loginsignup-login">
            Create an account? <span onClick={() => setState("Sign Up")}>Sign up</span>
          </p>
        ) : (
          <p className="loginsignup-login">
            Already have an account? <span onClick={() => setState("Login")}>Login here</span>
          </p>
        )}

        <div className="loginsignup-agree">
          <input type="checkbox" />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
