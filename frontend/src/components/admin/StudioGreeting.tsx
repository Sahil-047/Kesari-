"use client";

import { STUDIO_WELCOME_KEY } from "@/components/admin/AdminProviders";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

function greetingWord() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

/**
 * Dashboard welcome line. After sign-in it writes in with a soft stagger;
 * later visits show the line immediately.
 */
export default function StudioGreeting({ name }: { name: string }) {
  const reduceMotion = useReducedMotion();
  const text = useMemo(() => {
    const who = name.trim() || "there";
    return `${greetingWord()}, ${who}`;
  }, [name]);

  const [animateIn, setAnimateIn] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let welcome = false;
    try {
      welcome = sessionStorage.getItem(STUDIO_WELCOME_KEY) === "1";
      if (welcome) sessionStorage.removeItem(STUDIO_WELCOME_KEY);
    } catch {
      /* ignore */
    }
    setAnimateIn(welcome && !reduceMotion);
    setReady(true);
  }, [reduceMotion]);

  if (!ready) {
    return <span className="studio-greeting">{text}</span>;
  }

  if (!animateIn) {
    return <span className="studio-greeting">{text}</span>;
  }

  const chars = Array.from(text);

  return (
    <AnimatePresence>
      <motion.span
        className="studio-greeting"
        aria-label={text}
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: { staggerChildren: 0.028, delayChildren: 0.12 },
          },
        }}
      >
        {chars.map((ch, i) => (
          <motion.span
            key={`${ch}-${i}`}
            className="studio-greeting-char"
            aria-hidden
            variants={{
              hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
              show: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.38, ease: [0.23, 1, 0.32, 1] },
              },
            }}
          >
            {ch === " " ? "\u00A0" : ch}
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
}
