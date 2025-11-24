import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { UserStats } from "@shared/schema";

const defaultStats: UserStats = {
  meditationHours: 0,
  healersConsulted: 0,
  auraScans: 0,
  vibeScans: 0,
  numerologyReadings: 0,
  objectScans: 0,
  totalSessions: 0,
  journalEntries: 0,
};

export function useUserStats() {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery<UserStats>({
    queryKey: ["/api/user-stats", user?.id], // Include user ID to ensure separate cache per user
    enabled: !!user, // Only fetch when user is authenticated
  });

  return {
    stats: data || defaultStats,
    isLoading,
    error,
    hasError: !!error,
  };
}
