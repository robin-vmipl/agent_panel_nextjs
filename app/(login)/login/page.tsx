"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { logoutUser } from "@/app/lib/auth";

export default function LoginPage() {
  const { setUser } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setCheckingAuth(false);
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/nextjs/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            user: username,
            pass: password,
          }),
        }
      );

      //  API unreachable / server crashed
      if (!res.ok) {
        let message = "Login failed";

        try {
          const data = await res.json();
          message = data?.message || message;
        } catch {
          message = "Server unreachable. Please try again.";
        }

        //  Invalid session / auth mismatch
        if (res.status === 401 || res.status === 419) {
          throw new Error("Invalid credentials or session expired");
        }

        throw new Error(message);
      }

      const data = await res.json();

      // Backend did not return user
      if (!data?.user) {
        throw new Error("Invalid login response from server");
      }

      setUser(data.user);
      router.replace("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);

      // Network / CORS / server down
      if (err instanceof TypeError) {
        setError("Unable to connect to server. Please check network.");
      } else {
        setError(err.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleForceLogout = () => {
      logoutUser();
    };

    window.addEventListener("nextjs:logout", handleForceLogout);
    return () => window.removeEventListener("nextjs:logout", handleForceLogout);
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b151d]">
        <div className="bg-linear-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-2xl text-center animate-pulse">
          <div className="w-12 h-12 mx-auto mb-4 bg-linear-to-r from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center">
            <div className="w-6 h-6 bg-white/20 rounded-lg animate-spin" />
          </div>
          <div className="text-lg font-bold text-white/90">
            Checking authentication...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0b151d] relative overflow-hidden">
      {/*FLOATING BACKGROUND ELEMENTS */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-linear-to-r from-blue-500/5 to-emerald-500/5 rounded-full blur-3xl animate-[spin_20s_linear_infinite]" />
      </div>

      {/*MAIN LOGIN FORM - EXACT CHANGE PASSWORD STYLE */}
      <form
        onSubmit={handleLogin}
        className="theme-panel bg-linear-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-3xl w-full max-w-md mx-4 p-10 rounded-3xl border border-slate-700/50 shadow-2xl shadow-slate-900/50 relative z-10 overflow-hidden animate-[float_6s_ease-in-out_infinite]"
      >
        {/*BACKGROUND GLOW */}
        <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 via-transparent to-purple-500/5 rounded-3xl blur-xl animate-pulse pointer-events-none -z-10" />

        {/*LOGO HEADER */}
        <div className="text-center space-y-6 mb-10 relative z-20">
          <div className="w-28 h-28 mx-auto bg-linear-to-br from-emerald-500/30 via-blue-500/30 to-purple-500/30 rounded-3xl border-4 border-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
            <User
              className="w-20 h-20 text-white drop-shadow-2xl"
              strokeWidth={2}
            />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-linear-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
              Agent Login
            </h1>
            <p className="text-slate-300 text-lg mt-2 font-medium tracking-wide">
              Welcome back! Please sign in to your account
            </p>
          </div>
        </div>

        {/*INPUT FIELDS */}
        <div className="space-y-6 relative z-20">
          {/* AGENT ID */}
          <div className="relative group">
            <User
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-emerald-400 transition-all z-40 shadow-sm drop-shadow-sm"
              strokeWidth={2.5}
            />
            <input
              type="text"
              placeholder="Agent ID"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-16 pl-12 pr-5 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-slate-700/70 text-white font-semibold text-base placeholder-slate-400/50 focus:border-emerald-500/70 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all duration-300 hover:border-slate-600/80 shadow-lg relative z-30 peer autofill:bg-white/10 autofill:text-white autofill:border-emerald-500/50"
              required
              autoComplete="username"
            />
            <label
              className={`
              absolute -top-4 left-3 px-3 text-xs font-bold bg-linear-to-b from-slate-900/95 to-slate-800/95 text-emerald-400 shadow-sm transition-all duration-300 pointer-events-none z-50 whitespace-nowrap
              ${
                username ||
                document.activeElement ===
                  document.querySelector('input[type="text"]')
                  ? "scale-90 -translate-y-1"
                  : "top-1/2 -translate-y-1/2 left-12 text-sm text-slate-400"
              }
            `}
            >
              Agent ID
            </label>
          </div>

          {/* PASSWORD */}
          <div className="relative group">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5 group-focus-within:text-emerald-400 transition-all z-40 shadow-sm drop-shadow-sm"
              strokeWidth={2.5}
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-16 pl-12 pr-12 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border-2 border-slate-700/70 text-white font-semibold text-base placeholder-slate-400/50 focus:border-emerald-500/70 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all duration-300 hover:border-slate-600/80 shadow-lg relative z-30 peer autofill:bg-white/10 autofill:text-white autofill:border-emerald-500/50"
              required
              autoComplete="current-password"
            />
            <label
              className={`
              absolute -top-4 left-3 px-3 text-xs font-bold bg-linear-to-b from-slate-900/95 to-slate-800/95 text-purple-400 shadow-sm transition-all duration-300 pointer-events-none z-50 whitespace-nowrap
              ${
                password ||
                document.activeElement ===
                  document.querySelector('input[type="password"]')
                  ? "scale-90 -translate-y-1"
                  : "top-1/2 -translate-y-1/2 left-12 text-sm text-slate-400"
              }
            `}
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white transition-all p-1 hover:scale-110 z-50 shadow-sm drop-shadow-sm"
            >
              {showPassword ? (
                <EyeOff className="w-6 h-6" strokeWidth={2.5} />
              ) : (
                <Eye className="w-6 h-6" strokeWidth={2.5} />
              )}
            </button>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="relative p-4 bg-linear-to-r from-rose-500/20 to-pink-500/20 border-2 border-rose-500/40 backdrop-blur-sm rounded-2xl text-rose-200 font-medium shadow-xl animate-pulse z-20">
              <div className="absolute inset-0 bg-linear-to-r from-rose-400/20 to-transparent rounded-2xl blur" />
              <span className="relative z-10">{error}</span>
            </div>
          )}
        </div>

        {/*LOGIN BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-16 mt-8 rounded-3xl bg-linear-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:via-emerald-800 hover:to-teal-800 border-2 border-emerald-500/60 text-white font-black text-xl uppercase tracking-wider transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-emerald-500/40 backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:from-slate-700/60 disabled:to-slate-800/60 cursor-pointer relative z-30 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/20 rounded-3xl -skew-x-12 -translate-x-2 group-hover:translate-x-4 transition-transform duration-700" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-2xl animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </span>
        </button>

        {/*FOOTER TEXT */}
        <div className="text-center mt-8 pt-6 border-t border-white/10 relative z-20">
          <p className="text-slate-400 text-sm font-medium">
            © 2025 Agent Portal. All rights reserved.
          </p>
        </div>
      </form>
    </div>
  );
}
