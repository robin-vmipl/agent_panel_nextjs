// contexts/AuthContext.tsx - ✅ ADD setUser to interface & value
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface SipConfig {
  username: string;
  password: string;
}

interface AuthContextType {
  user: any | null;
  sipConfig: SipConfig;
  isAuthenticated: boolean;
  setUser: (user: any) => void; // ✅ ADD THIS LINE
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<any | null>(null); // ✅ Rename to avoid conflict
  const [sipConfig, setSipConfig] = useState<SipConfig>({
    username: "",
    password: "",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ ADD setUser function
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
    }
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser); // ✅ Use setUser function
      }
    } catch (e) {
      console.error("Auth load error:", e);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, sipConfig, isAuthenticated, setUser }}>
      {" "}
      {/* ✅ ADD setUser */}
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
