import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../services/api.js";
import { auth } from "../services/auth.js";

// Photos must stay small (server limit 300 KB): shrink to 900px JPEG in the browser first.
function shrink(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 900 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.6).split(",")[1]);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", adminCode: "" });
  // "details" -> "otp" -> "avatar" (every account needs a profile picture before it's ready to use).
  const [step, setStep] = useState("details");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Step 1 only validates (including the admin sign-up code) and emails a code — nothing is created yet.
    const result = await api.registerStart(form);
    setIsLoading(false);

    if (result.success) {
      setStep("otp");
    } else {
      setError(result.message || "Registration failed.");
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await api.registerVerify({ email: form.email, otp });
    setIsLoading(false);

    if (result.success) {
      auth.saveSession(result.data);
      setStep("avatar");
    } else {
      setError(result.message || "Could not verify that code.");
    }
  }

  async function handleAvatar(e) {
    e.preventDefault();
    if (!avatarFile) {
      setError("Please choose a profile picture — it's required to finish setting up your account.");
      return;
    }
    setIsLoading(true);
    setError("");
    const token = auth.getSession().token;
    const imageBase64 = await shrink(avatarFile);
    const result = await api.call(token, "PUT", "/auth/me/avatar", { imageBase64 });
    setIsLoading(false);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.message || "Could not upload that photo.");
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

        <form
          onSubmit={step === "details" ? handleSubmit : step === "otp" ? handleVerify : handleAvatar}
          className="bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-800 space-y-4"
        >
          {step === "details" && (
            <>
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
            </>
          )}

          {step === "otp" && (
            <div>
              <p className="text-sm text-slate-100/70 mb-3">
                We emailed a 6-digit code to <b>{form.email}</b>. It expires in 1 hour.
              </p>
              <label className="block text-sm font-medium text-slate-100/80 mb-1.5">6-digit code</label>
              <input
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-widest text-center text-lg"
              />
              <button type="button" disabled={isLoading} onClick={handleSubmit} className="text-sm text-indigo-400 font-medium hover:underline mt-2">
                Resend code
              </button>
            </div>
          )}

          {step === "avatar" && (
            <div>
              <p className="text-sm text-slate-100/70 mb-3">
                Last step — a profile picture is required so other admins and the system know who's who.
              </p>
              <input required type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="w-full text-sm text-slate-100/80" />
            </div>
          )}

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
            {isLoading
              ? "Please wait…"
              : step === "details"
              ? "Send verification code"
              : step === "otp"
              ? "Confirm & create account"
              : "Finish setting up account"}
          </button>

          {step === "details" && (
            <p className="text-center text-sm text-slate-100/40">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-400 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
}
