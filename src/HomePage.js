import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import "./HomePage.css";

const Dashboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Navigate to Create Form page
  const handleCreateForm = () => {
    navigate("/create-form");
  };

  // Navigate to User Details page
  const handleUserDetails = () => {
    navigate("/page-details");
  };

  // Log out and go back to login
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Background Decorations */}
      <div className="background-elements">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="floating-orb orb-4"></div>
        <div className="floating-dot dot-1"></div>
        <div className="floating-dot dot-2"></div>
        <div
          className="mouse-follower"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />
      </div>

      {/* Main Card */}
      <div className="main-content">
        <div className={`dashboard-card ${isVisible ? "visible" : ""}`}>
          <div className="card-content">

            {/* Header Section */}
            <div className="dashboard-header">
              <div className="header-title">
                <div className="dashboard-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                </div>
                <h2>Welcome</h2>
              </div>
              <p className="welcome-text">What would you like to do today?</p>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              {/* Create Form Button */}
              <div className={`button-container create-form-btn ${isVisible ? "slide-in-left" : ""}`}>
                <button className="action-button green-button" onClick={handleCreateForm}>
                  <div className="button-overlay"></div>
                  <div className="button-content">
                    <div className="button-left">
                      <svg className="button-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                      <span>Create Form</span>
                    </div>
                    <span className="button-arrow">→</span>
                  </div>
                </button>
              </div>

              {/* User Details Button */}
              <div className={`button-container user-details-btn ${isVisible ? "slide-in-right" : ""}`}>
                <button className="action-button blue-button" onClick={handleUserDetails}>
                  <div className="button-overlay"></div>
                  <div className="button-content">
                    <div className="button-left">
                      <svg className="button-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10,9 9,9 8,9" />
                      </svg>
                      <span>User Details</span>
                    </div>
                    <span className="button-arrow">→</span>
                  </div>
                </button>
              </div>

              {/* Logout Button */}
              <div className={`button-container logout-btn ${isVisible ? "slide-in-up" : ""}`}>
                <button className="action-button red-button" onClick={handleLogout}>
                  <div className="button-overlay"></div>
                  <div className="button-content">
                    <div className="button-left">
                      <svg className="button-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16,17 21,12 16,7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Logout</span>
                    </div>
                    <span className="button-arrow">→</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`dashboard-footer ${isVisible ? "fade-in" : ""}`}>
        <p>© 2025 Ayush. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
