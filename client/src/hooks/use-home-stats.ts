import { useQuery } from "@tanstack/react-query";

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
  const { data, isLoading, error } = useQuery<HomeStats>({
    queryKey: ["/api/home-stats"],
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
