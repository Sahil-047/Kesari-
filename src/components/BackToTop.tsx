"use client";

export default function BackToTop() {
  return (
    <button
      type="button"
      onClick={() => {
        const reduce = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
      className="group inline-flex items-center gap-2 uppercase tracking-[0.22em] text-white/55 transition hover:text-gold"
    >
      Back to top
      <span
        aria-hidden
        className="transition-transform duration-300 group-hover:-translate-y-0.5"
      >
        ↑
      </span>
    </button>
  );
}
