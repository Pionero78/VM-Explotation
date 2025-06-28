
import { MissionOrderProvider } from "@/context/MissionOrderContext";
import Layout from "@/components/MissionOrderGenerator/Layout";

const Index = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <MissionOrderProvider>
        <Layout />
      </MissionOrderProvider>
    </div>
  );
};

export default Index;
