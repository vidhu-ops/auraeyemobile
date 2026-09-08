import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, useLocation } from "wouter";

function isAdminPath(path: string) {
  return path === "/admin" || path.startsWith("/admin/");
}

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();
  const adminRoute = isAdminPath(path) || isAdminPath(location);

  if (isLoading) {
    return (
      <Route path={path}>
        <div
          className={`flex items-center justify-center w-full ${
            adminRoute ? "h-[100dvh] bg-slate-50" : "min-h-screen"
          }`}
        >
          <Loader2 className={`h-8 w-8 animate-spin ${adminRoute ? "text-indigo-600" : "text-primary"}`} />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to={adminRoute ? "/auth?redirect=/admin" : "/auth"} />
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
