import { Home, User, Heart, Scan, Palette } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Home",
    icon: Home,
    href: "/",
    dataTestId: "nav-home"
  },
  {
    name: "Scan", 
    icon: Scan,
    href: "/aura-analysis",
    dataTestId: "nav-scan"
  },
  {
    name: "Colors",
    icon: Palette,
    href: "/color-meanings",
    dataTestId: "nav-colors"
  },
  {
    name: "Meditate",
    icon: Heart,
    href: "/meditations",
    dataTestId: "nav-meditate"
  },
  {
    name: "Profile",
    icon: User,
    href: "/client-dashboard",
    dataTestId: "nav-profile"
  }
];

export default function MobileNavigation() {
  const [location] = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-indigo-950/90 backdrop-blur-xl border-t border-white/10 z-50 pb-safe shadow-lg" 
      role="navigation" 
      aria-label="Primary navigation"
    >
      <div className="flex justify-around items-center py-3 px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || 
            (item.href === "/" && location === "/") ||
            (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all duration-200 min-w-[60px]",
                isActive 
                  ? "bg-cyan-400/20 border border-cyan-400/50" 
                  : "border border-transparent"
              )}
              data-testid={item.dataTestId}
            >
              <Icon className={cn(
                "h-6 w-6 mb-1 transition-colors", 
                isActive ? "text-cyan-300" : "text-white/50"
              )} />
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive ? "text-white" : "text-white/50"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
