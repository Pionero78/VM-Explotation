import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useRoutes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";
import React from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import DeploymentWrapper from "@/components/DeploymentWrapper";

// Component to handle Tempo routes within Router context
const TempoRoutes = () => {
  const [routes, setRoutes] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        if (import.meta.env.VITE_TEMPO === "true") {
          const routesModule = await import("tempo-routes")
            .then((m) => m.default)
            .catch(() => null);
          setRoutes(routesModule);
        }
      } catch (error) {
        console.warn("Tempo routes not available:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, []);

  // Always call useRoutes to maintain hook order
  const routeElements = useRoutes(routes || []);

  if (loading) {
    return null;
  }

  if (import.meta.env.VITE_TEMPO === "true" && routes) {
    try {
      return routeElements;
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

  // Use deployment wrapper to handle different environments
  const AppContent = () => {
    return (
      <DeploymentWrapper>
        <React.Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-300">Chargement de l'application...</p>
              </div>
            </div>
          }
        >
          <Index />
        </React.Suspense>
      </DeploymentWrapper>
    );
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <TempoRoutes />
            <Routes>
              <Route path="/" element={<AppContent />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              {/* Add this before the catchall route */}
              {import.meta.env.VITE_TEMPO === "true" && (
                <Route path="/tempobook/*" />
              )}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
