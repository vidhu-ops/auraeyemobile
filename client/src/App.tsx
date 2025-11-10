import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFoundPage from "@/pages/not-found";
import HealersPage from "@/pages/healers";
import HealerCRM from "@/pages/healer-crm";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ClientDashboard from "@/pages/client-dashboard";
import HealerDashboard from "@/pages/healer-dashboard";
import AuraAnalysis from "@/pages/aura-analysis";
import ObjectAnalysis from "@/pages/object-analysis";
import DailyHoroscope from "@/pages/daily-horoscope";
import PersonalizedHoroscope from "@/pages/personalized-horoscope";
import Numerology from "@/pages/numerology";
import Journal from "@/pages/journal";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Services from "@/pages/services";
import PricingPage from "@/pages/pricing";
import ForgotPassword from "@/pages/forgot-password";
import MeditationsPage from "@/pages/meditations";
import HelpPage from "@/pages/help";
import ColorMeaningsPage from "@/pages/color-meanings";
import VibePage from "@/pages/vibe";
import WelcomeOnboarding from "@/components/welcome-onboarding";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { PremiumProvider } from "@/hooks/use-premium";
import { LightsProvider, useLights } from "@/hooks/use-lights";
import { ProtectedRoute } from "./lib/protected-route";
import LightsActivation from "@/components/lights-activation";
import Mascot from "@/components/mascot/mascot";
import { useEffect, useState } from "react";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/welcome" component={WelcomeOnboarding} />
      <ProtectedRoute path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/services" component={Services} />
      <ProtectedRoute path="/vibe" component={VibePage} />
      <ProtectedRoute path="/client-dashboard" component={ClientDashboard} />
      <ProtectedRoute path="/dashboard" component={ClientDashboard} />
      <ProtectedRoute path="/healer-dashboard" component={HealerDashboard} />
      <ProtectedRoute path="/aura-analysis" component={AuraAnalysis} />
      <ProtectedRoute path="/object-analysis" component={ObjectAnalysis} />
      <ProtectedRoute path="/daily-horoscope" component={DailyHoroscope} />
      <ProtectedRoute path="/personalized-horoscope" component={PersonalizedHoroscope} />
      <ProtectedRoute path="/numerology" component={Numerology} />
      <ProtectedRoute path="/journal" component={Journal} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/healers" component={HealersPage} />
      <Route path="/healer-crm" component={HealerCRM} />
      <ProtectedRoute path="/meditations" component={MeditationsPage} />
      <ProtectedRoute path="/help" component={HelpPage} />
      <ProtectedRoute path="/color-meanings" component={ColorMeaningsPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const { lightsOn } = useLights();
  const [location, setLocation] = useLocation();
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  // Check if user needs onboarding - only for authenticated users who haven't completed it
  useEffect(() => {
    // Wait for user data to load
    if (isLoading) {
      return;
    }
    
    // If user is logged in and hasn't completed onboarding, redirect to welcome
    if (user && !user.hasCompletedOnboarding && location !== '/welcome') {
      setLocation('/welcome');
    }
    
    // Mark that we've checked onboarding status
    setOnboardingChecked(true);
  }, [user, isLoading, location, setLocation]);

  // Don't render anything until we've checked onboarding status
  if (isLoading || !onboardingChecked) {
    return null;
  }

  // If on welcome page, show it directly
  if (location === '/welcome') {
    return <WelcomeOnboarding />;
  }

  // Public routes that don't require lights activation
  const publicRoutes = ['/auth', '/login', '/forgot-password', '/about', '/contact', '/pricing', '/services', '/healers', '/healer-crm'];
  const isPublicRoute = publicRoutes.some(route => location.startsWith(route));

  // Show lights activation only if user is logged in, not on a public route, and lights are off
  if (user && !isPublicRoute && !lightsOn && !isLoading) {
    return <LightsActivation />;
  }

  return (
    <>
      <Router />
      {user && !isPublicRoute && <Mascot />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LightsProvider>
          <PremiumProvider>
            <TooltipProvider>
              <Toaster />
              <div className="min-h-screen flex flex-col">
                <AppContent />
              </div>
            </TooltipProvider>
          </PremiumProvider>
        </LightsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;