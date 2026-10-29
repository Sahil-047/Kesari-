"use client";

import { useAuth } from "@/components/admin/AuthProvider";
import Logo from "@/components/Logo";
import Image from "next/image";
import { useState, type FormEvent } from "react";

const inputClass =
  "mt-2 h-12 w-full rounded-md border border-ink/15 bg-white px-4 font-sans text-[0.95rem] text-ink outline-none transition placeholder:text-ink/30 focus:border-ink/60 focus:ring-4 focus:ring-gold/15";
const labelClass = "block font-sans text-[0.68rem] font-medium uppercase tracking-[0.18em] text-ink/60";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await login(String(form.get("email")), String(form.get("password")));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-[#f4efe6] lg:grid-cols-[1.1fr_1fr]">
      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-[#14100b] lg:block">
        <Image
          src="/images/hero-wedding.jpg"
          alt=""
          fill
          priority
          sizes="55vw"
          className="object-cover object-[50%_25%] opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14100b] via-[#14100b]/30 to-[#14100b]/50" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo tone="light" size="md" />
          <div>
            <p className="font-sans text-[0.62rem] uppercase tracking-[0.36em] text-gold-soft">
              Content studio
            </p>
            <p className="display mt-3 max-w-md text-[2.6rem] uppercase leading-[0.95] tracking-[0.08em] text-cream">
              Same traditions. New stories.
            </p>
            <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-cream/65">
              Publish pieces, arrange The Edit, and answer every note written to the house.
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-col px-6 py-10 sm:px-12">
        <div className="lg:hidden">
          <Logo tone="dark" size="sm" />
        </div>

        <div className="flex flex-1 items-center justify-center">
          <form onSubmit={onSubmit} className="w-full max-w-[380px]">
            <p className="font-sans text-[0.62rem] uppercase tracking-[0.32em] text-ink/50">
              Kesari CMS
            </p>
            <h1 className="display mt-3 text-[2.2rem] uppercase leading-none tracking-[0.08em] text-ink">
              Welcome back
            </h1>
            <p className="mt-3 font-sans text-sm text-ink/60">
              Sign in with your CMS account to manage the site.
            </p>

            <div className="mt-10 space-y-6">
              <label className={labelClass}>
                Email
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="you@kesari.in"
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Password
                <span className="relative block">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Your password"
                    className={`${inputClass} pr-20`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 mt-1 -translate-y-1/2 rounded px-3 py-1.5 font-sans text-[0.68rem] normal-case tracking-normal text-ink/60 hover:bg-ink/5 hover:text-ink"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </span>
              </label>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 font-sans text-sm text-red-800"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-md bg-[#14100b] font-sans text-xs uppercase tracking-[0.24em] text-cream transition hover:bg-[#2a2219] disabled:cursor-wait disabled:opacity-70"
            >
              {busy ? "Signing in…" : "Sign in"}
              {!busy && <span aria-hidden>→</span>}
            </button>

            <p className="mt-8 font-sans text-xs leading-relaxed text-ink/45">
              No account? Ask an admin to add you under Users.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
