import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";

interface DeploymentWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that handles different deployment environments
 * - Tempo environment: Full authentication system
 * - External deployments (Vercel/Netlify): Direct access without auth
 */
const DeploymentWrapper: React.FC<DeploymentWrapperProps> = ({ children }) => {
  // Check if we're in a Tempo environment or have Supabase configured
  const isTempoEnvironment = import.meta.env.VITE_TEMPO === "true";
  const hasSupabaseConfig = !!(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  // For external deployments without Supabase, render directly
  if (!hasSupabaseConfig && !isTempoEnvironment) {
    return <>{children}</>;
  }

  // For Tempo environment or when Supabase is configured, use authentication
  if (hasSupabaseConfig) {
    try {
      return (
        <AuthProvider>
          <ProtectedRoute>{children}</ProtectedRoute>
        </AuthProvider>
      );
    } catch (error) {
      console.warn(
        "Authentication components not available, falling back to direct access:",
        error,
      );
      return <>{children}</>;
    }
  }

  // Default fallback
  return <>{children}</>;
};

export default DeploymentWrapper;
