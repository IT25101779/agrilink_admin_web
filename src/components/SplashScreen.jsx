import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * A big, branded loading animation shown every time this site loads or is
 * reloaded (it lives at the top of App.jsx, outside the router, so a fresh
 * page load always starts here before the real UI mounts).
 */
export default function SplashScreen({ children }) {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDone(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!done && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: [0, 0, 360] }}
                transition={{ duration: 1.6, times: [0, 0.4, 1], repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 rounded-3xl bg-indigo-500/15 border border-indigo-400/30 flex items-center justify-center mb-6"
              >
                <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-indigo-400">
                  <path d="M12 2C9 6 6 9.5 6 13a6 6 0 0 0 12 0c0-3.5-3-7-6-11Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 13v8" strokeLinecap="round" />
                </svg>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="font-display text-3xl font-semibold text-white tracking-tight"
              >
                AgriLink AI
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-indigo-400 text-xs font-medium tracking-[0.2em] uppercase mt-2"
              >
                Command Center
              </motion.p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-7 flex gap-1.5"
              >
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-indigo-400"
                    animate={{ y: [0, -7, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {done && children}
    </>
  );
}
