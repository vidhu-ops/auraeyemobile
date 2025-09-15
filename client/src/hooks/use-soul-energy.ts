import { useQuery } from "@tanstack/react-query";

export function useSoulEnergy() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/soul-energy"],
    retry: false,
  });

  return {
    soulEnergy: data?.soulEnergy || 0,
    isLoading,
    error,
  };
}