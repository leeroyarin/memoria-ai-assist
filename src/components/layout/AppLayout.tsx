import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import MicButton from "./MicButton";
import { useOfflineSync } from "@/hooks/useOfflineSync";

const AppLayout = () => {
  useOfflineSync();
  return (
    <div className="relative min-h-screen bg-background pb-28">
      <main className="mx-auto max-w-lg px-4 pt-6">
        <Outlet />
      </main>
      <MicButton />
      <BottomNav />
    </div>
  );
};

export default AppLayout;
