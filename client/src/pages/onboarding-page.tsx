import { Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import WelcomeOnboarding from "@/components/welcome-onboarding";

export default function OnboardingPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect to="/login" />;
  }

  // Show onboarding questions (skip welcome screens)
  return <WelcomeOnboarding skipWelcome={true} />;
}
