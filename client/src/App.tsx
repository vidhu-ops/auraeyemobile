import { Route, Switch, Link } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { BadgeProvider } from "@/hooks/use-badge-context";
import { Toaster } from "@/hooks/use-toast";
import VibePage from "@/pages/vibe";

// The production app has many routes (auth, pricing, healers, journal, ...). Only
// the "What's My Vibe" page is open-sourced in this repo, so unknown routes render
// a lightweight placeholder that links back to the working page.
function Placeholder() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-cyan-950 to-slate-950 flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-bold text-white">Coming soon</h1>
      <p className="max-w-md text-cyan-100">
        This screen isn't part of the open-sourced slice of AuraEye. The
        &ldquo;What&rsquo;s My Vibe&rdquo; experience is fully runnable though.
      </p>
      <Link
        href="/"
        className="rounded-full bg-yellow-500 px-6 py-3 font-semibold text-white hover:bg-yellow-600"
      >
        Back to What&rsquo;s My Vibe
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BadgeProvider>
          <Switch>
            <Route path="/" component={VibePage} />
            <Route path="/vibe" component={VibePage} />
            <Route component={Placeholder} />
          </Switch>
          <Toaster />
        </BadgeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
