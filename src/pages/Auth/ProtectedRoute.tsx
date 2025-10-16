import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");

  // Agar token nahi hai, to login page par redirect karo
  if (!token) return <Navigate to="/" />;

  return <>{children}</>;
};

export default ProtectedRoute;
