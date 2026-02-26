import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import MicButton from "./MicButton";

const AppLayout = () => {
  return (
    <div className="relative min-h-screen bg-background pb-20">
      <main className="mx-auto max-w-lg px-4 pt-6">
        <Outlet />
      </main>
      <MicButton />
      <BottomNav />
    </div>
  );
};

export default AppLayout;
