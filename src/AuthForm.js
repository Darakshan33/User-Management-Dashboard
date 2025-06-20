import { useState } from "react";
import "./AuthForm.css";
import { auth } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function AuthForm() {
  const [activeTab, setActiveTab] = useState("login"); // to toggle login/signup
  const [isLoading, setIsLoading] = useState(false);   // to show spinner
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  // Handle user login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      alert("Login successful");
      navigate("/homepage"); // Corrected route name to lowercase
    } catch (error) {
      alert("Login failed: " + error.message);
    }

    setIsLoading(false);
  };

  // Handle user signup
  const handleSignup = async (e) => {
    e.preventDefault();

    if (signupData.password !== signupData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setIsLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, signupData.email, signupData.password);
      alert("Account created successfully");
      navigate("/homepage");
    } catch (error) {
      alert("Signup failed: " + error.message);
    }

    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      {/* Floating animated balls (background effect) */}
      {[...Array(8)].map((_, i) => (
        <div key={i} className={`floating-ball ball-${i + 1}`}></div>
      ))}

      <div className="auth-card">
        {/* Toggle between Login and Signup */}
        <div className="toggle-container">
          <button
            onClick={() => setActiveTab("login")}
            className={`toggle-btn ${activeTab === "login" ? "active" : ""}`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`toggle-btn ${activeTab === "signup" ? "active" : ""}`}
          >
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {activeTab === "login" && (
          <div className="form-wrapper active-form slide-in-right">
            <div className="form-header-wrapper">
              <h2>Welcome Back</h2>
              <p>Please sign in to your account</p>
            </div>
            <form onSubmit={handleLogin} className="auth-form">
              <InputField
                id="email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              />
              <InputField
                id="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              />
              <SubmitButton text="Sign In" loadingText="Signing in..." isLoading={isLoading} />
              <div className="form-footer">
                <button type="button" className="link-btn">Forgot your password?</button>
                <p className="switch-text">
                  Don't have an account?{" "}
                  <button type="button" className="link-btn" onClick={() => setActiveTab("signup")}>
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          </div>
        )}

        {/* Signup Form */}
        {activeTab === "signup" && (
          <div className="form-wrapper active-form slide-in-left">
            <div className="form-header-wrapper">
              <h2>Create Account</h2>
              <p>Please fill in your information</p>
            </div>
            <form onSubmit={handleSignup} className="auth-form">
              <InputField
                id="signup-email"
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              />
              <InputField
                id="signup-password"
                type="password"
                label="Password"
                placeholder="Create a password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              />
              <InputField
                id="confirm-password"
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
              />
              <SubmitButton text="Sign Up" loadingText="Creating account..." isLoading={isLoading} />
              <div className="form-footer">
                <p className="switch-text">
                  Already have an account?{" "}
                  <button type="button" className="link-btn" onClick={() => setActiveTab("login")}>
                    Sign in here
                  </button>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Input Field component
function InputField({ id, label, type, placeholder, value, onChange }) {
  return (
    <div className="input-group">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="form-input"
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
}

// Reusable Submit Button component with loading spinner
function SubmitButton({ text, loadingText, isLoading }) {
  return (
    <button type="submit" className="submit-btn" disabled={isLoading}>
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span>{loadingText}</span>
        </div>
      ) : (
        text
      )}
    </button>
  );
}
