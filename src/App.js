import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

// Components
import AuthForm from "./AuthForm";
import Homepage from "./HomePage";
import CreateForm from "./CreateForm";
import PageDetails from "./PageDetails";
import EditForm from "./EditForm"; 

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "1.5rem"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={<AuthForm />} />

      {/* Protected Routes */}
      <Route
        path="/homepage"
        element={user ? <Homepage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/create-form"
        element={user ? <CreateForm /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/page-details"
        element={user ? <PageDetails /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/edit/:userId" // ✅ Dynamic route for editing
        element={user ? <EditForm /> : <Navigate to="/login" replace />}
      />

      {/* Redirect root to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
