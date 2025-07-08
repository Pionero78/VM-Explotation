// Deployment compatibility checks for Vercel and production environments

export const checkDeploymentCompatibility = () => {
  const checks = {
    environment: {
      isProduction: import.meta.env.PROD,
      isTempo: import.meta.env.VITE_TEMPO === "true",
      hasSupabaseConfig: !!(
        import.meta.env.VITE_SUPABASE_URL &&
        import.meta.env.VITE_SUPABASE_ANON_KEY
      ),
    },
    browser: {
      hasLocalStorage: typeof localStorage !== "undefined",
      hasSessionStorage: typeof sessionStorage !== "undefined",
      supportsES6: typeof Promise !== "undefined",
    },
    apis: {
      canAccessSupabase: false,
      canPrint: typeof window !== "undefined" && "print" in window,
    },
  };

  // Test Supabase connection
  if (checks.environment.hasSupabaseConfig) {
    try {
      import("@/lib/supabase").then(({ supabase }) => {
        supabase.auth
          .getSession()
          .then(() => {
            checks.apis.canAccessSupabase = true;
          })
          .catch((error) => {
            console.warn("Supabase connection test failed:", error);
          });
      });
    } catch (error) {
      console.warn("Supabase import failed:", error);
    }
  }

  return checks;
};

export const logDeploymentStatus = () => {
  const checks = checkDeploymentCompatibility();

  console.group("🔍 Deployment Compatibility Check");
  console.log("Environment:", checks.environment);
  console.log("Browser Support:", checks.browser);
  console.log("API Access:", checks.apis);
  console.groupEnd();

  // Check for potential issues
  const issues = [];

  if (!checks.environment.hasSupabaseConfig) {
    issues.push("❌ Missing Supabase configuration");
  }

  if (!checks.browser.hasLocalStorage) {
    issues.push("❌ LocalStorage not available");
  }

  if (!checks.browser.supportsES6) {
    issues.push("❌ ES6 features not supported");
  }

  if (issues.length > 0) {
    console.group("⚠️ Potential Deployment Issues");
    issues.forEach((issue) => console.warn(issue));
    console.groupEnd();
  } else {
    console.log("✅ All deployment compatibility checks passed");
  }

  return { checks, issues };
};

// Error boundary helper for production
export const handleProductionError = (error: Error, errorInfo?: any) => {
  console.error("Production Error:", error);

  if (errorInfo) {
    console.error("Error Info:", errorInfo);
  }

  // In production, you might want to send errors to a monitoring service
  if (import.meta.env.PROD) {
    // Example: Send to monitoring service
    // sendErrorToMonitoring(error, errorInfo);
  }
};
