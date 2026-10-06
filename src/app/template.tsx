"use client";
import { motion } from "framer-motion";

/** Short opacity fade on navigation. No sliding, no scroll-triggered effects. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
