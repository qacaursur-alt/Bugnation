import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "../lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });



  // With the custom queryFn, 401 errors return null instead of throwing
  // So if user is null and we're not loading, the user is not authenticated
  const isUnauthorized = !user && !isLoading;
  
  return {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    error: isUnauthorized ? null : error,
  };
}
