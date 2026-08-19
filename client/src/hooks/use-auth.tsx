import { createContext, ReactNode, useContext, useState, useEffect } from "react";
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const authQuery = useQuery<SelectUser | undefined, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 60000,
    retry: 2,
    refetchOnWindowFocus: false,
    enabled: isMounted,
  });

  const { data: user, error, isLoading } = authQuery;

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      queryClient.refetchQueries({ queryKey: ["/api/user"] });
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
      queryClient.refetchQueries({ queryKey: ["/api/user"] });
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

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-950" />;
  }

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
