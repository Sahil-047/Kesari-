"use client";

import { api, ApiRequestError } from "@/lib/api/client";
import { EASE_FLUENT, useReducedMotionSafe } from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import { useState, type FormEvent } from "react";

const STEPS = [
  { title: "You write", line: "A few lines about the occasion and the piece." },
  { title: "A note comes back", line: "The atelier answers personally." },
  { title: "The sitting", line: "A fitting or appointment at the house." },
];

const fieldClass =
  "mt-2 w-full border-0 border-b border-white/20 bg-transparent px-0 py-2.5 font-serif text-[1.02rem] text-white outline-none transition placeholder:text-white/25 focus:border-gold/70 [color-scheme:dark]";
const labelClass =
  "font-sans text-[0.58rem] uppercase tracking-[0.24em] text-white/50";

export default function AtelierEnquiry() {
  const reduce = useReducedMotionSafe();
  const [started, setStarted] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Steps light up as the visitor moves through the enquiry.
  const stage = sent ? 1 : 0;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSending(true);
    setError(null);
    try {
      await api.post(
        "/enquiries",
        {
          name: form.get("name"),
          email: form.get("email"),
          weddingDate: form.get("date") || undefined,
          note: form.get("note"),
          website: form.get("website") || undefined,
        },
        false,
      );
      setSent(true);
    } catch (err) {
      setError(
        err instanceof ApiRequestError && err.details?.[0]
          ? err.details[0].message
          : "The note could not be sent. Please try again in a moment.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="relative overflow-hidden bg-[#0b0907] px-6 pb-16 pt-44 md:px-10 md:pb-24 md:pt-36 lg:px-14">
      {/* Soft saffron glow instead of photography */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 h-[36rem] w-[36rem] rounded-full bg-gold/10 blur-[120px]"
      />

      <div className="relative mx-auto grid max-w-[1180px] grid-cols-1 gap-12 md:grid-cols-12 md:gap-10 lg:gap-16">
        {/* Intro + steps */}
        <div className="md:col-span-6">
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-gold-soft">
            The House
          </p>
          <h1 className="display mt-3 text-[clamp(2.6rem,7vw,6rem)] uppercase leading-[0.9] tracking-[0.12em] text-white">
            The
            <br />
            Atelier
          </h1>
          <p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-white/65">
            Write to the house for fittings, commissions, and bridal
            appointments. The atelier replies with a note, never a catalogue
            blast.
          </p>

          <ol className="relative mt-10 max-w-md">
            <span
              aria-hidden
              className="absolute bottom-3 left-[0.9rem] top-3 w-px bg-white/12"
            />
            {STEPS.map((s, i) => {
              const lit = i < stage || (i === stage && (started || sent));
              const current = i === stage;
              return (
                <li key={s.title} className="relative flex gap-5 pb-6 last:pb-0">
                  <span
                    className={`relative z-10 grid h-[1.8rem] w-[1.8rem] shrink-0 place-items-center rounded-full border bg-[#0b0907] font-sans text-[0.58rem] tracking-[0.1em] transition-colors duration-500 ${
                      lit
                        ? "border-gold text-gold-soft"
                        : "border-white/20 text-white/40"
                    }`}
                  >
                    0{i + 1}
                    {current && !reduce && (
                      <motion.span
                        layoutId="step-ring"
                        className="absolute -inset-1 rounded-full border border-gold/40"
                        transition={{ duration: 0.6, ease: EASE_FLUENT }}
                      />
                    )}
                  </span>
                  <div className="pt-1">
                    <p
                      className={`font-sans text-[0.62rem] uppercase tracking-[0.26em] transition-colors duration-500 ${
                        lit ? "text-white" : "text-white/45"
                      }`}
                    >
                      {s.title}
                    </p>
                    <p className="mt-1 text-[0.9rem] leading-snug text-white/45">
                      {s.line}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Enquiry */}
        <div className="md:col-span-6">
          <div className="border border-white/12 bg-white/[0.025] p-6 md:p-9">
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div
                  key="sent"
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE_FLUENT }}
                  role="status"
                  className="py-6"
                >
                  <p className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-gold-soft">
                    Received
                  </p>
                  <p className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] uppercase leading-tight tracking-[0.1em] text-white">
                    Your note is with the house
                  </p>
                  <p className="mt-3 text-[0.98rem] leading-relaxed text-white/60">
                    The atelier will write back with a note.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setStarted(false);
                    }}
                    className="mt-8 font-sans text-[0.62rem] uppercase tracking-[0.26em] text-white/70 underline-offset-4 hover:text-white hover:underline"
                  >
                    Write another note
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  onFocus={() => setStarted(true)}
                  className="flex flex-col gap-7"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="font-sans text-[0.62rem] uppercase tracking-[0.3em] text-gold-soft">
                    Enquiry
                  </p>

                  <div className="grid gap-7 sm:grid-cols-2 sm:gap-5">
                    <label className="block">
                      <span className={labelClass}>Name</span>
                      <input
                        type="text"
                        name="name"
                        required
                        autoComplete="name"
                        className={fieldClass}
                      />
                    </label>
                    <label className="block">
                      <span className={labelClass}>Email</span>
                      <input
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        className={fieldClass}
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className={labelClass}>
                      Wedding date{" "}
                      <span className="text-white/30">(optional)</span>
                    </span>
                    <input type="date" name="date" className={fieldClass} />
                  </label>

                  <label className="block">
                    <span className={labelClass}>Note</span>
                    <textarea
                      name="note"
                      rows={4}
                      placeholder="Commission, fitting, or bridal appointment…"
                      className={`${fieldClass} resize-none`}
                    />
                  </label>

                  {/* Honeypot: hidden from people, filled in by bots */}
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    className="absolute -left-[9999px] h-px w-px opacity-0"
                  />

                  {error && (
                    <p role="alert" className="text-sm text-[#e8a598]">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="solid-btn group w-full cursor-pointer gap-3 bg-cream text-ink hover:bg-parchment-light disabled:cursor-wait disabled:opacity-70"
                  >
                    {sending ? "Sending…" : "Write to the House"}
                    <span
                      aria-hidden
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
