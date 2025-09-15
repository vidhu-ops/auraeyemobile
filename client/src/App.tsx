import { Switch, Route } from "wouter";
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
import { AuthProvider } from "@/hooks/use-auth";
import { PremiumProvider } from "@/hooks/use-premium";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/services" component={Services} />
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PremiumProvider>
          <TooltipProvider>
            <Toaster />
            <div className="min-h-screen flex flex-col">
              <Router />
            </div>
          </TooltipProvider>
        </PremiumProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;