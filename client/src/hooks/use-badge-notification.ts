import { useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface BadgeReward {
  type: string;
  title: string;
  description: string;
  icon: string;
  level: "bronze" | "silver" | "gold" | "platinum";
}

export function useBadgeNotification() {
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
        setBadges(response.newBadges);
        setCurrentBadgeIndex(0);
        setIsShowing(true);
      }
      
      return response;
    } catch (error) {
      console.error("Error checking badges:", error);
      return null;
    }
  }, [checkBadgesMutation]);

  const handleCloseBadge = useCallback(() => {
    if (currentBadgeIndex < badges.length - 1) {
      setCurrentBadgeIndex(currentBadgeIndex + 1);
    } else {
      setIsShowing(false);
      setBadges([]);
      setCurrentBadgeIndex(0);
    }
  }, [currentBadgeIndex, badges.length]);

  const currentBadge = isShowing && currentBadgeIndex < badges.length ? badges[currentBadgeIndex] : null;

  return {
    checkBadges,
    isShowing,
    currentBadge,
    handleCloseBadge,
    badges,
    isLoading: checkBadgesMutation.isPending,
  };
}
