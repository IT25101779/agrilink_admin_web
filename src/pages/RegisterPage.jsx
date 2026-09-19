import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", adminCode: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await api.register(form);
    setIsLoading(false);

    if (result.success) {
      auth.saveSession(result.data);
      navigate("/");
    } else {
      setError(result.message || "Registration failed.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-semibold text-white">AgriLink AI</h1>
          <p className="text-slate-100/50 mt-2 font-body tracking-wide text-sm uppercase">Create Admin Account</p>
        </div>

        <div className="mb-4 text-xs text-amber-500 bg-amber-50/10 border border-amber-500/30 rounded-lg px-3 py-2">
          Admin accounts can only be created with the secret admin sign-up code set on the server.
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-800 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-100/80 mb-1.5">Full name</label>
            <input
              required
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-100/80 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-100/80 mb-1.5">Phone</label>
            <input
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-100/80 mb-1.5">Password (min 6 characters)</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100/80 mb-1.5">Admin sign-up code</label>
            <input
              type="password"
              required
              autoComplete="off"
              value={form.adminCode}
              onChange={(e) => update("adminCode", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && (
            <div className="text-sm text-amber-500 bg-amber-50/10 border border-amber-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            {isLoading ? "Creating account…" : "Create Admin Account"}
          </button>

          <p className="text-center text-sm text-slate-100/40">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
