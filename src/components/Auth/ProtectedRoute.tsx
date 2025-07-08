import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthForm from "./AuthForm";
import SessionLockScreen from "./SessionLockScreen";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, isSessionLocked } = useAuth();

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  if (isSessionLocked) {
    return <SessionLockScreen />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
