import { Home, User, Heart, Scan, Users, HelpCircle } from "lucide-react";
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
    name: "Profile", 
    icon: User,
    href: "/client-dashboard",
    dataTestId: "nav-profile"
  },
  {
    name: "Meditations",
    icon: Heart,
    href: "/meditations",
    dataTestId: "nav-meditations"
  },
  {
    name: "Scan",
    icon: Scan,
    href: "/aura-analysis",
    dataTestId: "nav-scan"
  },
  {
    name: "Healers",
    icon: Users,
    href: "/healers",
    dataTestId: "nav-healers"
  },
  {
    name: "Help",
    icon: HelpCircle,
    href: "/help",
    dataTestId: "nav-help"
  }
];

export default function MobileNavigation() {
  const [location] = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-orange-100 z-50 pb-safe" 
      role="navigation" 
      aria-label="Primary navigation"
    >
      <div className="flex justify-around items-center py-2 px-2">
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
                  ? "bg-gradient-to-br from-orange-400 to-pink-400 text-white shadow-lg transform scale-105" 
                  : "text-gray-600 hover:text-orange-500 hover:bg-orange-50"
              )}
              data-testid={item.dataTestId}
            >
              <Icon className={cn("h-5 w-5 mb-1", isActive ? "drop-shadow-sm" : "")} />
              <span className={cn(
                "text-xs font-medium",
                isActive ? "text-white" : "text-gray-600"
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