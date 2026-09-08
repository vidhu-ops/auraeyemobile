import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export interface HomeStats {
  meditation: {
    sessions: number;
    energyPerSession: number;
    totalEnergy: number;
    progressPercentage: number;
  };
  healerConsultations: {
    sessions: number;
    energyPerSession: number;
    totalEnergy: number;
    progressPercentage: number;
  };
}

export function useHomeStats() {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery<HomeStats>({
    queryKey: ["/api/home-stats", user?.id], // Include user ID to ensure separate cache per user
    enabled: !!user, // Only fetch when user is authenticated
  });

  return {
    stats: data || {
      meditation: {
        sessions: 0,
        energyPerSession: 25,
        totalEnergy: 0,
        progressPercentage: 0,
      },
      healerConsultations: {
        sessions: 0,
        energyPerSession: 50,
        totalEnergy: 0,
        progressPercentage: 0,
      },
    },
    isLoading,
    error,
    hasError: !!error,
  };
}
