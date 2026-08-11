import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface BadgeContextValue {
  checkBadges: () => Promise<void>;
  showBadges: boolean;
}

// Gamification badges are awarded server-side in production. Locally this is a
// no-op stub that keeps the vibe flow working without the badge service.
const BadgeContext = createContext<BadgeContextValue | undefined>(undefined);

export function BadgeProvider({ children }: { children: ReactNode }) {
  const [showBadges] = useState(false);

  const value = useMemo<BadgeContextValue>(
    () => ({
      checkBadges: async () => {},
      showBadges,
    }),
    [showBadges],
  );

  return <BadgeContext.Provider value={value}>{children}</BadgeContext.Provider>;
}

export function useBadgeContext(): BadgeContextValue {
  const ctx = useContext(BadgeContext);
  if (!ctx) {
    throw new Error("useBadgeContext must be used within a BadgeProvider");
  }
  return ctx;
}
