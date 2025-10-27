import { Home, Heart, Circle, BookOpen, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export default function MobileNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const isHealer = user?.userType === "healer";
  
  const navigationItems = [
    {
      name: "Home",
      icon: Home,
      href: "/",
      dataTestId: "nav-home"
    },
    {
      name: "Meditate", 
      icon: Heart,
      href: "/meditations",
      dataTestId: "nav-meditate"
    },
    {
      name: "Scan",
      icon: Circle,
      href: "/aura-analysis",
      dataTestId: "nav-scan",
      hasNotification: true
    },
    {
      name: "Journal",
      icon: BookOpen,
      href: "/journal",
      dataTestId: "nav-journal"
    },
    {
      name: "Profile",
      icon: User,
      href: isHealer ? "/healer-dashboard" : "/client-dashboard",
      dataTestId: "nav-profile"
    }
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-slate-700/95 backdrop-blur-xl border-t border-slate-600/50 z-50 pb-safe shadow-lg" 
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
                "relative flex flex-col items-center justify-center py-2 px-2 rounded-xl transition-all duration-200 min-w-[55px]",
                isActive 
                  ? "bg-indigo-500/20" 
                  : ""
              )}
              data-testid={item.dataTestId}
            >
              {item.hasNotification && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-pink-500 rounded-full"></span>
              )}
              <Icon className={cn(
                "h-6 w-6 mb-1 transition-colors", 
                isActive ? "text-white" : "text-slate-400"
              )} />
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive ? "text-white" : "text-slate-400"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* Navigation indicator dots */}
      <div className="flex justify-center gap-1 pb-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1 h-1 rounded-full transition-all",
              i === 2 ? "bg-slate-400 w-6" : "bg-slate-600"
            )}
          />
        ))}
      </div>
    </nav>
  );
}
