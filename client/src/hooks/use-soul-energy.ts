import { useQuery } from "@tanstack/react-query";

interface SoulEnergyResponse {
  soulEnergy: number;
}

export function useSoulEnergy() {
  const { data, isLoading, error } = useQuery<SoulEnergyResponse>({
    queryKey: ["/api/soul-energy"],
    retry: false,
  });

  return {
    soulEnergy: data?.soulEnergy || 0,
    isLoading,
    error,
  };
}