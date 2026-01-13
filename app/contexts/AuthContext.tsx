// contexts/AuthContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiFetch } from "../lib/api";
import { useRouter } from "next/navigation";

interface SipConfig {
  username: string;
  password: string;
}

interface AuthContextType {
  user: any | null;
  sipConfig: SipConfig;
  isAuthenticated: boolean;
  setUser: (user: any) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<any | null>(null);
  const [sipConfig, setSipConfig] = useState<SipConfig>({
    username: "",
    password: "",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const setUser = (newUser: any) => {
    setUserState(newUser);
    if (newUser) {
      setIsAuthenticated(true);
      setSipConfig({
        username: newUser.sip_username || newUser.id || "",
        password: newUser.sip_password || "",
      });
    } else {
      setIsAuthenticated(false);
      setSipConfig({ username: "", password: "" });
    }
  };

  useEffect(() => {
    let mounted = true;

    // 🔒 Do NOT fetch /me on login page
    if (window.location.pathname === "/login") {
      setIsLoading(false);
      return;
    }

    const fetchMe = async () => {
      try {
        const data = await apiFetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          skipLogoutOn401: true,
          showToast: false,
        });
        if (!mounted) return;
        setUser(data?.user ?? null);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchMe();

    const onLogout = () => {
      setUser(null);
    };

    window.addEventListener("nextjs:logout", onLogout);
    return () => {
      mounted = false;
      window.removeEventListener("nextjs:logout", onLogout);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, sipConfig, isAuthenticated, setUser, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
