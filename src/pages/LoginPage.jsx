import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await api.login({ email, password });
    setIsLoading(false);

    if (!result.success) {
      setError(result.message || "Login failed.");
      return;
    }
    if (result.data.user.role !== "admin") {
      setError("This account is not an admin account. Use the Admin Command Center only with an admin login.");
      return;
    }

    auth.saveSession(result.data);
    navigate("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-semibold text-white">AgriLink AI</h1>
          <p className="text-slate-100/50 mt-2 font-body tracking-wide text-sm uppercase">Admin Command Center</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-800">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-100/80 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="admin@agrilink.lk"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-100/80 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="mb-4 text-sm text-amber-500 bg-amber-50/10 border border-amber-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {isLoading ? "Signing in…" : "Sign In"}
          </button>

          <p className="text-center text-sm text-slate-100/40 mt-5">
            First time setting up?{" "}
            <Link to="/register" className="text-indigo-400 font-medium hover:underline">
              Create admin account
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
