import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageCircle, Brain, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/chat", icon: MessageCircle, label: "Chat" },
  { to: "/memories", icon: Brain, label: "Memories" },
  { to: "/reminders", icon: Bell, label: "Reminders" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/95 backdrop-blur-xl pb-safe">
      <div className="mx-auto grid max-w-lg grid-cols-5 py-1.5">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1 text-[10px] transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground/70 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-[18px] w-[18px]", isActive && "stroke-[2.5]")} />
              <span className={cn("font-medium", isActive && "font-semibold")}>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
