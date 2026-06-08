import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

const defaultStats = {
  auraReadings: 0,
  auraScans: 0,
  numerologyReadings: 0,
  vibeReadings: 0,
  journals: 0,
  objectAnalyses: 0,
  meditationSessions: 0,
  totalSessions: 0,
  healersConsulted: 0,
  meditationHours: 0,
};

export function useUserStats() {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery<typeof defaultStats>({
    queryKey: ["/api/user-stats", user?.id],
    enabled: !!user,
  });

  return {
    stats: data || defaultStats,
    isLoading,
    error,
    hasError: !!error,
  };
}
