import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<SelectUser, Error, InsertUser>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      // Refetch the user query to ensure component gets updated state
      queryClient.refetchQueries({ queryKey: ["/api/user"] });
      // Immediately refetch credits and other user data after login (use predicate to match any user-specific key)
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/credits" });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/soul-energy" });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/user-stats" });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/home-stats" });
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      // Refetch the user query to ensure component gets updated state
      queryClient.refetchQueries({ queryKey: ["/api/user"] });
      // Immediately refetch credits and other user data after registration (use predicate to match any user-specific key)
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/credits" });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/soul-energy" });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/user-stats" });
      queryClient.invalidateQueries({ predicate: (query) => query.queryKey[0] === "/api/home-stats" });
      queryClient.invalidateQueries({ queryKey: ["/api/notification-preferences"] });
      toast({
        title: "Registration successful",
        description: `Welcome to AuraEye, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      // Clear all user-specific caches using predicates to match user-scoped keys (e.g., ["/api/credits", userId])
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] === "/api/credits" });
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] === "/api/soul-energy" });
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] === "/api/user-stats" });
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] === "/api/home-stats" });
      queryClient.removeQueries({ queryKey: ["/api/notification-preferences"] });
      toast({
        title: "Logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
