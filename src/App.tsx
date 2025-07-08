import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useRoutes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";

// Conditional import for tempo routes
let routes: any = null;
try {
  if (import.meta.env.VITE_TEMPO === "true") {
    routes = await import("tempo-routes")
      .then((m) => m.default)
      .catch(() => null);
  }
} catch (error) {
  console.warn("Tempo routes not available:", error);
}

// Component to handle Tempo routes within Router context
const TempoRoutes = () => {
  if (import.meta.env.VITE_TEMPO === "true" && routes) {
    try {
      return useRoutes(routes);
    } catch (error) {
      console.warn("Error rendering tempo routes:", error);
      return null;
    }
  }
  return null;
};

const App = () => {
  // Create a new QueryClient instance with production-ready configuration
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: import.meta.env.PROD ? 3 : 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: import.meta.env.PROD ? 2 : 0,
          },
        },
      }),
  );

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <TempoRoutes />
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                {/* Add this before the catchall route */}
                {import.meta.env.VITE_TEMPO === "true" && (
                  <Route path="/tempobook/*" />
                )}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
