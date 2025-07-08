import { MissionOrderProvider } from "@/context/MissionOrderContext";
import Layout from "@/components/MissionOrderGenerator/Layout";
import HealthCheck from "@/components/HealthCheck";

const Index = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <MissionOrderProvider>
        <Layout />
        {/* Show health check only in development or when there are issues */}
        {(!import.meta.env.PROD ||
          import.meta.env.VITE_SHOW_HEALTH_CHECK === "true") && <HealthCheck />}
      </MissionOrderProvider>
    </div>
  );
};

export default Index;
