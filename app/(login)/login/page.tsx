"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        router.replace("/dashboard");
        return;
      }
    } catch (e) {
      // ignore
    }
    setCheckingAuth(false);
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: username,
          pass: password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // ✅ FIX IS HERE
      localStorage.setItem("token", data.access_token);

      // (optional but useful)
      localStorage.setItem("user", JSON.stringify(data.user));

      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
        <div className="text-sm text-gray-600">Checking authentication...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F4F6]">
      <form
        onSubmit={handleLogin}
        className="bg-white text-black p-8 rounded-xl w-96 shadow-lg"
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Agent Login</h1>

        <input
          type="text"
          placeholder="Agent ID"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
          required
        />

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-2 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0e4f35] text-white py-3 rounded hover:bg-[#06351f] cursor-pointer"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
