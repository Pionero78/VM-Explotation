import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { checkDeploymentCompatibility } from "@/utils/deploymentCheck";

interface HealthStatus {
  supabase: "healthy" | "error" | "checking";
  localStorage: "healthy" | "error";
  environment: "healthy" | "warning" | "error";
  browser: "healthy" | "error";
}

const HealthCheck: React.FC = () => {
  const [status, setStatus] = useState<HealthStatus>({
    supabase: "checking",
    localStorage: "error",
    environment: "error",
    browser: "error",
  });
  const [isVisible, setIsVisible] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const runHealthCheck = async () => {
    setStatus((prev) => ({ ...prev, supabase: "checking" }));

    const checks = checkDeploymentCompatibility();
    const newStatus: HealthStatus = {
      supabase: "checking",
      localStorage: checks.browser.hasLocalStorage ? "healthy" : "error",
      environment: checks.environment.hasSupabaseConfig ? "healthy" : "error",
      browser: checks.browser.supportsES6 ? "healthy" : "error",
    };

    // Test Supabase connection
    try {
      await supabase.auth.getSession();
      newStatus.supabase = "healthy";
    } catch (error) {
      console.error("Supabase health check failed:", error);
      newStatus.supabase = "error";
    }

    setStatus(newStatus);
    setLastCheck(new Date());
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "checking":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "checking":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const overallHealth = Object.values(status).every((s) => s === "healthy")
    ? "healthy"
    : Object.values(status).some((s) => s === "error")
      ? "error"
      : "warning";

  if (!isVisible && overallHealth === "healthy") {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Système OK
        </Button>
      </div>
    );
  }

  if (!isVisible && overallHealth !== "healthy") {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsVisible(true)}
          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 animate-pulse"
        >
          <XCircle className="h-4 w-4 mr-2" />
          Problème détecté
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">
              État du système
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={runHealthCheck}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Supabase</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.supabase)}
              <Badge className={getStatusColor(status.supabase)}>
                {status.supabase === "checking"
                  ? "Vérification..."
                  : status.supabase === "healthy"
                    ? "Connecté"
                    : "Erreur"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Stockage local</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.localStorage)}
              <Badge className={getStatusColor(status.localStorage)}>
                {status.localStorage === "healthy"
                  ? "Disponible"
                  : "Indisponible"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Configuration</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.environment)}
              <Badge className={getStatusColor(status.environment)}>
                {status.environment === "healthy" ? "Complète" : "Manquante"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm">Navigateur</span>
            <div className="flex items-center gap-2">
              {getStatusIcon(status.browser)}
              <Badge className={getStatusColor(status.browser)}>
                {status.browser === "healthy" ? "Compatible" : "Incompatible"}
              </Badge>
            </div>
          </div>

          {lastCheck && (
            <div className="text-xs text-gray-500 pt-2 border-t">
              Dernière vérification: {lastCheck.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthCheck;
