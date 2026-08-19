import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

interface SoulEnergyResponse {
  soulEnergy: number;
}

export function useSoulEnergy() {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery<SoulEnergyResponse>({
    queryKey: ["/api/soul-energy", user?.id], // Include user ID to ensure separate cache per user
    enabled: !!user, // Only fetch when user is authenticated
    retry: false,
    refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
    refetchIntervalInBackground: true, // Continue refetching even when tab is not focused
    staleTime: 0, // Always consider data stale to ensure fresh updates
  });

  return {
    soulEnergy: data?.soulEnergy || 0,
    isLoading,
    error,
  };
}