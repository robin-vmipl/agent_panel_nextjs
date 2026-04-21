"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { apiFetch } from "@/app/lib/api";

interface SipConfig {
  username: string;
  password: string;
}

interface AuthContextType {
  user: any | null;
  sipConfig: SipConfig;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [sipConfig, setSipConfig] = useState<SipConfig>({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        skipLogoutOn401: true,
        showToast: false,
      });

      const u = data?.user ?? null;
      setUser(u);

      if (u) {
        setSipConfig({
          username: u.sip_username || u.user || "",
          password: u.sip_password || "",
        });
      }
    } catch {
      setUser(null);
      setSipConfig({ username: "", password: "" });
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        sipConfig,
        isAuthenticated: !!user,
        isLoading,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
