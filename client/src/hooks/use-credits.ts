import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export function useCredits() {
  const { user } = useAuth();
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/credits"],
    enabled: !!user, // Only fetch when user is authenticated
    retry: false,
    refetchInterval: 5000, // Refetch every 5 seconds to stay current
    staleTime: 0, // Consider data immediately stale to ensure fresh data
  });

  return {
    credits: data?.credits || 0,
    isLoading,
    error,
    refetch, // Allow components to manually refetch if needed
  };
}