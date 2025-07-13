import { useQuery } from "@tanstack/react-query";

export function useCredits() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/credits"],
    retry: false,
  });

  return {
    credits: data?.credits || 0,
    isLoading,
    error,
  };
}