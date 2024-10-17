import React, { useState } from "react";
import "./CSS/LoginSignup.css";
import googleIcon from '../Components/Assets/google-icon.png'// Import the local image

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({ username: "", email: "", password: "" });
  const [successMessage, setSuccessMessage] = useState(""); // For success message

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Live validation on each field change
    if (e.target.name === "username") {
      if (state === "Sign Up" && !e.target.value.trim()) {
        setErrors((prevErrors) => ({ ...prevErrors, username: "Name is required." }));
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, username: "" }));
      }
    }
    if (e.target.name === "email") {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email pattern
      if (!e.target.value.trim()) {
        setErrors((prevErrors) => ({ ...prevErrors, email: "Email is required." }));
      } else if (!emailPattern.test(e.target.value)) {
        setErrors((prevErrors) => ({ ...prevErrors, email: "Please enter a valid email (e.g., example@gmail.com)." }));
      } else if (!(/\.(com|in)$/).test(e.target.value)) {
        setErrors((prevErrors) => ({ ...prevErrors, email: "Email must end with '.com' or '.in'." }));
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, email: "" }));
      }
    }

    if (e.target.name === "password") {
      const passwordPattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/; // Password must contain uppercase, number, and special character
      if (!e.target.value.trim()) {
        setErrors((prevErrors) => ({ ...prevErrors, password: "Password is required." }));
      } else if (!passwordPattern.test(e.target.value)) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          password: "Password must contain at least 1 uppercase letter, 1 number, and 1 special character.",
        }));
      } else {
        setErrors((prevErrors) => ({ ...prevErrors, password: "" }));
      }
    }
  };

  const handleGoogleLogin = () => {
    // Add Google login functionality here
    console.log("Google login clicked");
  };

  const validateForm = () => {
    let isValid = true;
    let validationErrors = { ...errors };

    if (state === "Sign Up" && !formData.username.trim()) {
      validationErrors.username = "Name is required.";
      isValid = false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      validationErrors.email = "Email is required.";
      isValid = false;
    } else if (!emailPattern.test(formData.email)) {
      validationErrors.email = "Please enter a valid email (e.g., example@gmail.com).";
      isValid = false;
    } else if (!/\.(com|in)$/.test(formData.email)) {
      validationErrors.email = "Email must end with '.com' or '.in'.";
      isValid = false;
    }

    const passwordPattern = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
    if (!formData.password.trim()) {
      validationErrors.password = "Password is required.";
      isValid = false;
    } else if (!passwordPattern.test(formData.password)) {
      validationErrors.password = "Password must contain at least 1 uppercase letter, 1 number, and 1 special character.";
      isValid = false;
    }

    setErrors(validationErrors);
    return isValid;
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
        setSuccessMessage("");
        setFormData({ username: "", email: "", password: "" }); // Reset the form data to empty
        setTimeout(() => {
          setSuccessMessage("");
          setState("Login");
        }, 0); // Redirect to login after 2 seconds
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

        {/* Success Message */}
        {successMessage && <p className="success-message">{successMessage}</p>}

        <div className="loginsignup-fields">
          {state === "Sign Up" && (
            <>
              <input
                type="text"
                placeholder="Your name"
                name="username"
                value={formData.username}
                onChange={changeHandler}
                className={errors.username ? "error-input" : ""}
              />
              {errors.username && <p className="error-message">{errors.username}</p>}
            </>
          )}
          <input
            type="email"
            placeholder="Email address"
            name="email"
            id="emailid"
            value={formData.email}
            onChange={changeHandler}
            className={errors.email ? "error-input" : ""}
          />
          {errors.email && <p className="error-message">{errors.email}</p>}

          <input
            type="password"
            placeholder="Password"
            name="password"
            id="passwords"
            value={formData.password}
            onChange={changeHandler}
            className={errors.password ? "error-input" : ""}
          />
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>
         {/* Forgot Password Link */}
         {state === "Login" && (
            <p className="forgot-password">
              <a href="/forgot-password">Forgot Password?</a>
            </p>
          )}
          

        <button onClick={() => (state === "Login" ? login() : signup())} id="login">Continue</button>
        
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
