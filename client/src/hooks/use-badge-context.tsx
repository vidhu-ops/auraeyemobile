import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export interface BadgeReward {
  type: string;
  title: string;
  description: string;
  icon: string;
  level: "bronze" | "silver" | "gold" | "platinum";
}

interface BadgeContextType {
  badges: BadgeReward[];
  currentBadgeIndex: number;
  isShowing: boolean;
  checkBadges: () => Promise<any>;
  closeBadge: () => void;
  currentBadge: BadgeReward | null;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export function BadgeProvider({ children }: { children: ReactNode }) {
  const [badges, setBadges] = useState<BadgeReward[]>([]);
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [isShowing, setIsShowing] = useState(false);

  const checkBadgesMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest<{
        newBadges: BadgeReward[];
        allAchievements: any[];
        hasNewBadges: boolean;
      }>("/api/check-badges", { method: "POST" });
    },
  });

  const checkBadges = useCallback(async () => {
    try {
      const response = await checkBadgesMutation.mutateAsync();
      
      if (response.newBadges && response.newBadges.length > 0) {
        // Transform newBadges to have proper level field
        const transformedBadges = response.newBadges.map((badge: any) => ({
          ...badge,
          // Ensure 'level' is set from badgeType or from the badge definition
          level: badge.level || badge.badgeType || "bronze",
        }));
        setBadges(transformedBadges);
        setCurrentBadgeIndex(0);
        setIsShowing(true);
      }
      
      // Invalidate and refetch achievements data to show updated badges in profile
      await queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      await queryClient.refetchQueries({ queryKey: ["/api/achievements"] });
      
      return response;
    } catch (error) {
      console.error("Error checking badges:", error);
      return null;
    }
  }, [checkBadgesMutation]);

  const closeBadge = useCallback(() => {
    if (currentBadgeIndex < badges.length - 1) {
      setCurrentBadgeIndex(currentBadgeIndex + 1);
    } else {
      setIsShowing(false);
      setBadges([]);
      setCurrentBadgeIndex(0);
    }
  }, [currentBadgeIndex, badges.length]);

  const currentBadge = isShowing && currentBadgeIndex < badges.length ? badges[currentBadgeIndex] : null;

  const value: BadgeContextType = {
    badges,
    currentBadgeIndex,
    isShowing,
    checkBadges,
    closeBadge,
    currentBadge,
  };

  return (
    <BadgeContext.Provider value={value}>
      {children}
    </BadgeContext.Provider>
  );
}

export function useBadgeContext() {
  const context = useContext(BadgeContext);
  if (!context) {
    throw new Error("useBadgeContext must be used within BadgeProvider");
  }
  return context;
}
