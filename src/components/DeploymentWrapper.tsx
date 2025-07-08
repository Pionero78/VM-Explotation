import React from "react";

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
      const AuthProvider = React.lazy(() =>
        import("@/context/AuthContext").then((m) => ({
          default: m.AuthProvider,
        })),
      );
      const ProtectedRoute = React.lazy(
        () => import("@/components/Auth/ProtectedRoute"),
      );

      return (
        <React.Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-300">Chargement...</p>
              </div>
            </div>
          }
        >
          <AuthProvider>
            <ProtectedRoute>{children}</ProtectedRoute>
          </AuthProvider>
        </React.Suspense>
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
