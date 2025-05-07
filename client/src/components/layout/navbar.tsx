import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
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
import { Menu, User, LogOut } from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
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
    { name: "Services", href: "/#services" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => {
    if (path.includes('#')) {
      return location === '/';
    }
    return location === path;
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-heading font-bold text-xl">A</span>
            </div>
            <span className="font-heading font-bold text-2xl text-primary">Aurfy</span>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.name} 
                      href={link.href} 
                      onClick={closeSheet}
                      className={`py-2 px-2 rounded-lg ${isActive(link.href) ? 'text-primary font-medium' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  
                  <div className="pt-4 border-t border-gray-200 mt-4">
                    {user ? (
                      <>
                        <Link 
                          href={user.userType === "healer" ? "/healer-dashboard" : "/client-dashboard"} 
                          onClick={closeSheet}
                          className="block py-2 px-2 rounded-lg text-primary font-medium"
                        >
                          My Dashboard
                        </Link>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50 px-2"
                          onClick={() => {
                            handleLogout();
                            closeSheet();
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link 
                          href="/auth" 
                          onClick={closeSheet}
                          className="block py-2 px-2 rounded-lg text-primary font-medium"
                        >
                          Login
                        </Link>
                        <Link 
                          href="/auth" 
                          onClick={() => {
                            closeSheet();
                          }}
                        >
                          <Button className="w-full mt-2 bg-primary hover:bg-primary-dark">
                            Register
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`font-medium ${isActive(link.href) ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Login/Register buttons (desktop) */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link href={user.userType === "healer" ? "/healer-dashboard" : "/client-dashboard"}>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary-light/10">
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full h-8 w-8 p-0">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-white">
                          {getInitials(user.username)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>{user.username}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
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
