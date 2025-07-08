import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useRoutes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useState } from "react";
import routes from "tempo-routes";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";

// Component to handle Tempo routes within Router context
const TempoRoutes = () => {
  if (import.meta.env.VITE_TEMPO) {
    return useRoutes(routes);
  }
  return null;
};

const App = () => {
  // Create a new QueryClient instance within the component
  // This ensures it's created during the React lifecycle
  const [queryClient] = useState(() => new QueryClient());

  return (
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
              {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
