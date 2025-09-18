import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }), // Return null on 401 instead of throwing
    retry: false,
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds  
    gcTime: 2 * 60 * 1000, // Keep in cache for 2 minutes
    refetchOnWindowFocus: false, // Don't refetch to avoid unauthorized flashes
    refetchOnMount: true, // Do refetch when component mounts
    // Remove automatic refetch interval to prevent unauthorized flashes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
  };
}
