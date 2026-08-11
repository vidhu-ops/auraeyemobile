import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type UserType = "user" | "healer" | "semi_healer";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  userType: UserType;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: () => void;
  logout: () => void;
}

// The production app authenticates against a backend. For local development we
// seed a signed-in demo user so the full "What's My Vibe" flow is reachable.
const DEMO_USER: AuthUser = {
  id: 1,
  name: "Demo Seeker",
  email: "demo@auraeye.app",
  userType: "user",
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(DEMO_USER);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      login: () => setUser(DEMO_USER),
      logout: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
