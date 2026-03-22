import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
  const { isAuthenticated, role } = useAuth();

  // Agar already login hai
  if (isAuthenticated) {

    // Admin ko admin dashboard par bhejo
    if (role === "Admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }

    // Customer ko home page par bhejo
    return <Navigate to="/" replace />;
  }

  // Agar login nahi hai to page allow karo
  return children;
};

export default PublicRoute;