"use client";

import { useAuth } from "@/components/admin/AuthProvider";
import { StudioMark } from "@/components/admin/Iso";
import Image from "next/image";
import { useState, type FormEvent } from "react";

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
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(460px,0.9fr)]">
      {/* Brand side */}
      <div className="relative hidden overflow-hidden bg-[#1a1714] lg:block">
        <Image
          src="/images/hero-wedding.jpg"
          alt=""
          fill
          priority
          sizes="55vw"
          className="object-cover object-[50%_25%] opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1714] via-[#1a1714]/20 to-[#1a1714]/40" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <StudioMark size={40} />
            <span className="cms-display text-[19px]">Kesari Studio</span>
          </div>
          <div className="max-w-md">
            <p className="cms-display text-[40px] leading-[1.1]">Same traditions.<br />New stories.</p>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              Change the site&apos;s words, photos and films, add pieces to the catalogue, and answer every note written to the house.
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="cms-iso-grid flex flex-col border-l border-[var(--cms-line)] px-6 py-10 sm:px-14">
        <div className="flex items-center gap-3 lg:hidden">
          <StudioMark />
          <span className="cms-display text-[17px]">Kesari Studio</span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <form onSubmit={onSubmit} className="cms-card w-full max-w-[420px] p-8">
            <h1 className="cms-display text-[32px] leading-tight">Welcome back</h1>
            <p className="mt-2 text-[15px] text-[var(--cms-muted)]">Sign in to manage the Kesari website.</p>

            <div className="mt-9 space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="cms-label">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="username"
                  placeholder="you@kesari.in"
                  className="cms-input h-11"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="cms-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="Your password"
                    className="cms-input h-11 pr-20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-pressed={showPassword}
                    className="cms-btn cms-btn-ghost cms-btn-sm absolute right-1.5 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-5 rounded-[10px] bg-[var(--cms-danger-soft)] px-4 py-3 text-[13.5px] font-semibold text-[var(--cms-danger)]">
                {error}
              </p>
            )}

            <button type="submit" disabled={busy} className="cms-btn cms-btn-primary mt-7 h-11 w-full text-[15px]">
              {busy ? "Signing in…" : "Sign in"}
            </button>

            <p className="cms-help mt-6 text-center">No account yet? Ask an admin to add you under Team.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
