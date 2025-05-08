import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import ClientDashboard from "@/pages/client-dashboard";
import HealerDashboard from "@/pages/healer-dashboard";
import AuraAnalysis from "@/pages/aura-analysis";
import DailyHoroscope from "@/pages/daily-horoscope";
import Numerology from "@/pages/numerology";
import Journal from "@/pages/journal";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import { AuthProvider } from "@/hooks/use-auth";
import { PremiumProvider } from "@/hooks/use-premium";
import { ProtectedRoute } from "./lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/client-dashboard" component={ClientDashboard} />
      <ProtectedRoute path="/healer-dashboard" component={HealerDashboard} />
      <ProtectedRoute path="/aura-analysis" component={AuraAnalysis} />
      <ProtectedRoute path="/daily-horoscope" component={DailyHoroscope} />
      <ProtectedRoute path="/numerology" component={Numerology} />
      <ProtectedRoute path="/journal" component={Journal} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
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
            <Router />
          </TooltipProvider>
        </PremiumProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
