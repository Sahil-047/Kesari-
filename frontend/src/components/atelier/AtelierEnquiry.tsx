"use client";

import { api, ApiRequestError } from "@/lib/api/client";
import type { AtelierContent } from "@/lib/content/pages";
import { EASE_FLUENT, useReducedMotionSafe } from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useState, type FormEvent } from "react";

const fieldClass =
  "mt-2 w-full border-0 border-b border-ink/25 bg-transparent px-0 py-2.5 font-serif text-[1.02rem] text-ink outline-none transition placeholder:text-ink/30 focus:border-gold [color-scheme:light]";
const labelClass =
  "font-sans text-[0.58rem] uppercase tracking-[0.24em] text-ink-soft";

const FALLBACK_IMAGE = "/images/Wedding/DSC07493.jpg";

export default function AtelierEnquiry({ intro }: { intro: AtelierContent["intro"] }) {
  const reduce = useReducedMotionSafe();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const image = intro.image?.trim() || FALLBACK_IMAGE;

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
    <section className="relative" aria-labelledby="contact-title">
      <div className="grid min-h-[calc(100dvh-var(--header-h))] lg:grid-cols-2">
        <div className="relative min-h-[42vh] overflow-hidden bg-ink lg:min-h-full lg:sticky lg:top-0 lg:h-[100dvh]">
          <Image
            src={image}
            alt=""
            fill
            priority
            quality={92}
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-[50%_28%]"
          />
          <div className="absolute inset-0 bg-ink/15" />
        </div>

        <div className="relative flex flex-col justify-center px-6 py-14 md:px-12 md:py-20 lg:px-16 lg:py-24">
          <div className="w-full max-w-lg">
            <p className="font-sans text-[0.6rem] uppercase tracking-[0.32em] text-ink-soft">
              {intro.eyebrow}
            </p>
            <h1
              id="contact-title"
              className="display mt-3 text-[clamp(2.2rem,4.5vw,3.4rem)] uppercase leading-[0.95] tracking-[0.1em] text-ink"
            >
              {intro.title}
            </h1>
            <p className="mt-4 text-[1.02rem] leading-relaxed text-ink-soft">
              {intro.text}
            </p>

            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div
                  key="sent"
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: EASE_FLUENT }}
                  role="status"
                  className="mt-10 py-2"
                >
                  <p className="font-sans text-[0.6rem] uppercase tracking-[0.3em] text-ink-soft">
                    Received
                  </p>
                  <p className="display mt-3 text-[clamp(1.6rem,3vw,2.2rem)] uppercase leading-tight tracking-[0.1em] text-ink">
                    Your note is with the house
                  </p>
                  <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">
                    We will write back with a personal note.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="mt-8 font-sans text-[0.62rem] uppercase tracking-[0.26em] text-ink-soft underline-offset-4 hover:text-ink hover:underline"
                  >
                    Write another note
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  className="mt-10 flex flex-col gap-7"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
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
                    <span className={labelClass}>Date</span>
                    <input type="date" name="date" className={fieldClass} />
                  </label>

                  <label className="block">
                    <span className={labelClass}>Note</span>
                    <textarea
                      name="note"
                      rows={4}
                      placeholder="Commission, fitting, or bridal appointment"
                      className={`${fieldClass} resize-none`}
                    />
                  </label>

                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    className="absolute -left-[9999px] h-px w-px opacity-0"
                  />

                  {error && (
                    <p role="alert" className="text-sm text-[#8a3a2e]">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={sending}
                    className="solid-btn group w-full cursor-pointer gap-3 disabled:cursor-wait disabled:opacity-70"
                  >
                    {sending ? "Sending…" : "Contact Us"}
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
