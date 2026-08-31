import { Switch, Route, useLocation, Redirect } from "wouter";
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
import SettingsPage from "@/pages/settings";
import PrivacyPolicyPage from "@/pages/privacy-policy";
import AdminPage from "@/pages/admin";
import PaymentPage from "@/pages/payment";
import DeleteAccountPage from "@/pages/delete-account";
import WelcomeOnboarding from "@/components/welcome-onboarding";
import OnboardingPage from "@/pages/onboarding-page";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { PremiumProvider } from "@/hooks/use-premium";
import { LightsProvider, useLights } from "@/hooks/use-lights";
import { MascotProvider } from "@/hooks/use-mascot";
import { NotificationProvider } from "@/hooks/use-notifications";
import { BadgeNotification } from "@/components/badge-notification";
import { BadgeProvider, useBadgeContext } from "@/hooks/use-badge-context";
import { ProtectedRoute } from "./lib/protected-route";
import LightsActivation from "@/components/lights-activation";
import Mascot from "@/components/mascot/mascot";
import NotificationPrompt from "@/components/notification-prompt";
import { InstallAppPrompt } from "@/components/install-app-prompt";
import { CookieConsent } from "@/components/legal/cookie-consent";
import PageViewTracker from "@/components/PageViewTracker";
import { useEffect, useState, Component, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
          <div className="bg-red-900/40 border border-red-500 rounded-xl p-6 max-w-lg w-full text-white">
            <h2 className="text-lg font-bold text-red-300 mb-2">Dashboard Error</h2>
            <p className="text-sm text-red-200 font-mono break-all">{this.state.error.message}</p>
            <p className="text-xs text-red-300 mt-2 font-mono break-all">{this.state.error.stack?.split('\n').slice(0,3).join('\n')}</p>
            <button onClick={() => { this.setState({ error: null }); window.location.href = '/'; }} className="mt-4 px-4 py-2 bg-red-600 rounded text-sm">Go Home</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function DashboardRedirect() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-500" />
      </div>
    );
  }
  if (!user) return <Redirect to="/auth" />;
  const isHealer = user.userType === "healer" || user.userType === "semi-healer" || user.userType === "semi_healer";
  return <Redirect to={isHealer ? "/healer-dashboard" : "/client-dashboard"} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/welcome">
        {(props) => <WelcomeOnboarding {...props} />}
      </Route>
      <ProtectedRoute path="/onboarding" component={OnboardingPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/login" component={AuthPage} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/services" component={Services} />
      <ProtectedRoute path="/vibe" component={VibePage} />
      <ProtectedRoute path="/client-dashboard" component={ClientDashboard} />
      <ProtectedRoute path="/healer-dashboard" component={HealerDashboard} />
      <Route path="/dashboard" component={DashboardRedirect} />
      <ProtectedRoute path="/aura-analysis" component={AuraAnalysis} />
      <ProtectedRoute path="/object-analysis" component={ObjectAnalysis} />
      <ProtectedRoute path="/daily-horoscope" component={DailyHoroscope} />
      <ProtectedRoute path="/personalized-horoscope" component={PersonalizedHoroscope} />
      <ProtectedRoute path="/numerology" component={Numerology} />
      <ProtectedRoute path="/journal" component={Journal} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/privacy" component={PrivacyPolicyPage} />
      <Route path="/healers" component={HealersPage} />
      <Route path="/healer-crm" component={HealerCRM} />
      <ProtectedRoute path="/meditations" component={MeditationsPage} />
      <ProtectedRoute path="/help" component={HelpPage} />
      <ProtectedRoute path="/color-meanings" component={ColorMeaningsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/payment" component={PaymentPage} />
      <ProtectedRoute path="/delete-account" component={DeleteAccountPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const { lightsOn } = useLights();
  const [location, setLocation] = useLocation();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const { currentBadge, closeBadge } = useBadgeContext();
  const [appNotification, setAppNotification] = useState<{ title: string; message: string } | null>(null);

  // Force reset zoom on every route change (skip on admin for mobile usability)
  useEffect(() => {
    const isAdmin = location === '/admin' || location.startsWith('/admin/');
    const resetZoom = () => {
      if (isAdmin) {
        document.documentElement.style.zoom = '';
        document.body.style.zoom = '';
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
        }
        return;
      }
      document.documentElement.style.zoom = "1";
      document.body.style.zoom = "1";
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
    };
    resetZoom();
    const timer = setTimeout(resetZoom, 100);
    return () => clearTimeout(timer);
  }, [location]);

  // Check if user has seen onboarding on first load - do this BEFORE any routing
  useEffect(() => {
    // Don't redirect to welcome if user is on login, onboarding, or other specific routes
    const skipOnboardingRedirect = ['/login', '/auth', '/onboarding', '/welcome', '/forgot-password', '/pricing', '/about', '/contact', '/services', '/healers', '/healer-crm', '/admin', '/aura-analysis', '/object-analysis', '/vibe', '/client-dashboard', '/healer-dashboard', '/dashboard', '/journal', '/meditations', '/numerology', '/daily-horoscope', '/personalized-horoscope', '/help', '/color-meanings', '/settings', '/payment'];
    const shouldSkip = skipOnboardingRedirect.some(route => location.startsWith(route));
    
    if (!shouldSkip) {
      const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
      if (!hasSeenOnboarding) {
        setLocation('/welcome');
      }
    }
    
    // Mark that we've checked onboarding status
    setOnboardingChecked(true);
  }, []); // Only run once on mount

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ title: string; message: string }>;
      setAppNotification(customEvent.detail);
      setTimeout(() => setAppNotification(null), 5000);
    };
    window.addEventListener("app-notification", handler);
    return () => window.removeEventListener("app-notification", handler);
  }, []);

  // Don't render anything until we've checked onboarding status
  if (!onboardingChecked) {
    return null;
  }

  // If on welcome page, show it directly
  if (location === '/welcome') {
    return <WelcomeOnboarding />;
  }

  // Public routes that don't require lights activation
  const publicRoutes = ['/auth', '/login', '/forgot-password', '/about', '/contact', '/pricing', '/services', '/healers', '/healer-crm', '/onboarding', '/payment', '/admin'];
  const isPublicRoute = publicRoutes.some(route => location.startsWith(route));

  // Show lights activation only on the home page for first-time session feel
  // Skip it on all dashboard/feature routes so they always load directly
  const isDashboardRoute = location.startsWith('/dashboard') || location.startsWith('/client-dashboard') || location.startsWith('/healer-dashboard');
  if (user && !isPublicRoute && !isDashboardRoute && !lightsOn && !isLoading && location === '/') {
    return <LightsActivation />;
  }

  return (
    <>
      <PageViewTracker />
      <ErrorBoundary>
        <Router />
      </ErrorBoundary>
      {user && !isPublicRoute && <Mascot />}
      {currentBadge && (
        <BadgeNotification
          title={currentBadge.title}
          description={currentBadge.description}
          icon={currentBadge.icon}
          level={currentBadge.level}
          onClose={closeBadge}
        />
      )}
      {appNotification && (
        <div className="fixed top-6 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
          <Card className="border-emerald-500/30 bg-emerald-500 text-white shadow-2xl">
            <CardContent className="p-4 flex items-start gap-3 relative">
              <div className="flex-1">
                <div className="font-semibold text-base">{appNotification.title}</div>
                <div className="text-sm text-white/90">{appNotification.message}</div>
              </div>
              <button
                onClick={() => setAppNotification(null)}
                className="rounded-full p-1 hover:bg-white/10"
                aria-label="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        </div>
      )}
      {user && !isPublicRoute && <NotificationPrompt />}
    </>
  );
}

function App() {
  const [location] = useLocation();
  const returnTo = new URLSearchParams(window.location.search).get("returnTo");
  const isAdminLogin = (location === "/auth" || location === "/login") && returnTo?.startsWith("/admin");
  const suppressGlobalOverlays = [
    "/admin",
    "/privacy",
    "/privacy-policy",
    "/privacypolicy",
  ].some((route) => location === route || location.startsWith(`${route}/`)) || isAdminLogin;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LightsProvider>
          <PremiumProvider>
            <MascotProvider>
              <NotificationProvider>
                <BadgeProvider>
                  <TooltipProvider>
                    <Toaster />
                    <div className="min-h-screen flex flex-col w-full">
                       {!suppressGlobalOverlays && <InstallAppPrompt />}
                      <AppContent />
                       {!suppressGlobalOverlays && <CookieConsent />}
                    </div>
                  </TooltipProvider>
                </BadgeProvider>
              </NotificationProvider>
            </MascotProvider>
          </PremiumProvider>
        </LightsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;