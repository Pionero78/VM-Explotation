import { MissionOrderProvider } from "@/context/MissionOrderContext";
import Layout from "@/components/MissionOrderGenerator/Layout";
import HealthCheck from "@/components/HealthCheck";
import DeploymentWrapper from "@/components/DeploymentWrapper";

const Index = () => {
  return (
    <DeploymentWrapper>
      <div className="bg-gray-50 min-h-screen">
        <MissionOrderProvider>
          <Layout />
          {/* Show health check only in development or when there are issues */}
          {(!import.meta.env.PROD ||
            import.meta.env.VITE_SHOW_HEALTH_CHECK === "true") && (
            <HealthCheck />
          )}
        </MissionOrderProvider>
      </div>
    </DeploymentWrapper>
  );
};

export default Index;
