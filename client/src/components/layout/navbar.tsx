import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Menu, 
  User, 
  LogOut, 
  CreditCard, 
  Sparkles, 
  Star, 
  Zap,
  Home as HomeIcon,
  Briefcase,
  Users,
  Info,
  Mail,
  Camera,
  Scan,
  Calendar,
  Hash,
  BookOpen,
  Heart,
  Flower2,
  DollarSign,
  LayoutDashboard,
  X,
  Settings
} from "lucide-react";
import logoPath from "@assets/new-logo.jpeg";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { credits } = useCredits();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const closeSheet = () => {
    setOpen(false);
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Healers", href: "/healers" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const menuItems = [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "Aura Scan", href: "/aura-analysis", icon: Camera },
    { name: "Object Scan", href: "/object-scan", icon: Scan },
    { name: "Horoscope", href: "/daily-horoscope", icon: Calendar },
    { name: "Numerology", href: "/numerology", icon: Hash },
    { name: "What's My Vibe", href: "/vibe", icon: Sparkles },
    { name: "Journal", href: "/journal", icon: BookOpen },
    { name: "Meditation", href: "/meditations", icon: Flower2 },
    { name: "Healers", href: "/healers", icon: Heart },
    { name: "Services", href: "/services", icon: Briefcase },
    { name: "Dashboard", href: user?.userType === 'healer' ? "/healer-dashboard" : "/client-dashboard", icon: LayoutDashboard },
    { name: "Pricing", href: "/pricing", icon: DollarSign },
    { name: "About", href: "/about", icon: Info },
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  const isActive = (path: string) => {
    if (path.includes('#')) {
      return location === '/';
    }
    return location === path;
  };

  return (
    <nav className="bg-black sticky top-0 z-30 w-full border-purple-200/30">
      <div className="container bg-black mx-auto px-4 md:px-6 relative">
        <div className="flex justify-between items-center py-2">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img src={logoPath} alt="AuraEye Logo" className="w-12 h-12 rounded-full object-cover glow-mystical transition-all duration-300 group-hover:scale-110" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-mystical rounded-full animate-pulse flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-helvetica font-bold text-xl text-white">AuraEye™</span>
              
              <span className="font-helvetica text-xs text-white">Your energy made visible</span>
            </div>
          </Link>

          {/* Menu button - visible on all screen sizes */}
          <div>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full max-w-md overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-purple-700">Menu</h2>
                  <SheetClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-purple-100" data-testid="button-close-menu">
                      <X className="h-5 w-5 text-purple-600" />
                    </Button>
                  </SheetClose>
                </div>
                <div>
                  {user && (
                    <div className="mb-6 p-4 glass-ethereal rounded-xl border border-purple-200/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10 glow-mystical">
                            <AvatarFallback className="bg-gradient-mystical text-white font-mystical">
                              {getInitials(user.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-purple-700">{user.username}</p>
                            <p className="text-xs text-purple-600/70">{user.userType}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-cyan-500 px-3 py-1.5 rounded-full">
                          <Zap className="h-3 w-3 text-white" />
                          <span className="text-white font-semibold text-sm">{credits}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {menuItems.map((item) => {
                      const Icon = item.icon;
                      const itemActive = isActive(item.href);
                      return (
                        <Link 
                          key={item.name} 
                          href={item.href} 
                          onClick={closeSheet}
                          data-testid={`menu-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 ${
                            itemActive 
                              ? 'bg-gradient-to-br from-purple-500 to-cyan-500 text-white shadow-lg' 
                              : 'bg-gradient-to-br from-purple-100/50 to-cyan-100/50 text-purple-700 hover:from-purple-200/70 hover:to-cyan-200/70'
                          }`}
                        >
                          <Icon className={`h-6 w-6 mb-2 ${itemActive ? 'text-white' : 'text-purple-600'}`} />
                          <span className={`text-xs text-center font-medium ${itemActive ? 'text-white' : 'text-purple-700'}`}>
                            {item.name}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                  
                  <div className="border-t border-purple-200/30 pt-4 space-y-2">
                    {user ? (
                      <>
                        <Link href="/settings" onClick={closeSheet}>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-center text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            data-testid="button-settings"
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-center text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            handleLogout();
                            closeSheet();
                          }}
                          data-testid="button-logout"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Link 
                          href="/auth" 
                          onClick={closeSheet}
                        >
                          <Button className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 text-white" data-testid="button-login">
                            Login / Register
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </nav>
  );
}
