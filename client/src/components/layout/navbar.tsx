import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
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
  LayoutDashboard
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
    { name: "Horoscope", href: "/horoscope", icon: Calendar },
    { name: "Numerology", href: "/numerology", icon: Hash },
    { name: "What's My Vibe", href: "/vibe", icon: Sparkles },
    { name: "Journal", href: "/journal", icon: BookOpen },
    { name: "Meditation", href: "/meditation", icon: Flower2 },
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
    <nav className="bg-white/80 sticky top-0 z-30 w-full border-b border-purple-200/30">
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="flex justify-between items-center py-2">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <img src={logoPath} alt="AuraEye Logo" className="w-12 h-12 rounded-full object-cover glow-mystical transition-all duration-300 group-hover:scale-110" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-mystical rounded-full animate-pulse flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-helvetica font-bold text-xl text-purple-500">AuraEye™</span>
              <span className="font-helvetica text-xs text-purple-800/70">Your energy made visible</span>
            </div>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full max-w-md overflow-y-auto">
                <div className="mt-8">
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
                  
                  <div className="border-t border-purple-200/30 pt-4">
                    {user ? (
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

          {/* Mystical Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`relative font-cosmic font-medium transition-all duration-300 group ${isActive(link.href) ? 'text-purple-700 font-semibold' : 'text-purple-600/80 hover:text-purple-700'}`}
              >
                <span className="relative z-10">{link.name}</span>
                {isActive(link.href) && (
                  <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-mystical rounded-full"></div>
                )}
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-mystical rounded-full transition-all duration-300 group-hover:w-full"></div>
              </Link>
            ))}
          </div>

          {/* Login/Register buttons (desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="glass-mystical px-4 py-2 rounded-full text-sm font-cosmic font-medium flex items-center space-x-2 glow-ethereal">
                  <div className="w-2 h-2 bg-gradient-aurora rounded-full animate-pulse"></div>
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span className="text-purple-700">{credits}</span>
                  <span className="font-ethereal text-purple-600/70">cosmic credits</span>
                </div>
                <Link href={user.userType === 'healer' ? "/healer-dashboard" : "/client-dashboard"}>
                  <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50 font-cosmic glow-ethereal">
                    <Star className="w-4 h-4 mr-2" />
                    Spiritual Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full h-10 w-10 p-0 group">
                      <div className="relative">
                        <Avatar className="h-10 w-10 glow-mystical transition-all duration-300 group-hover:scale-110">
                          <AvatarFallback className="bg-gradient-mystical text-white font-mystical">
                            {getInitials(user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-aurora rounded-full animate-pulse"></div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 glass-ethereal border-purple-200/30" align="end">
                    <DropdownMenuItem className="flex items-center space-x-3 font-cosmic hover:bg-purple-50/50">
                      <div className="w-2 h-2 bg-gradient-mystical rounded-full"></div>
                      <User className="w-4 h-4 text-purple-600" />
                      <span className="text-purple-700">{user.username}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-3 text-purple-600 hover:text-purple-700 hover:bg-purple-50/50 font-cosmic">
                      <div className="w-2 h-2 bg-gradient-aurora rounded-full"></div>
                      <LogOut className="w-4 h-4" />
                      <span>Complete Journey</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <>
                <Link href="/auth">
                  <Button variant="ghost" className="font-medium text-primary hover:text-primary-dark transition-colors">
                    Login
                  </Button>
                </Link>
                <Link href="/auth">
                  <Button className="bg-primary hover:bg-primary-dark text-white font-medium">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
