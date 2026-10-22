"use client";

import { useEffect, useMemo, useState } from "react";
import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";
import { getIstDustDrift, getIstHour } from "@/lib/ist-light";

function DustLayer() {
  const [drift, setDrift] = useState(() => getIstDustDrift(getIstHour()));

  useEffect(() => {
    const tick = () => setDrift(getIstDustDrift(getIstHour()));
    tick();
    const id = window.setInterval(tick, 45_000);
    return () => window.clearInterval(id);
  }, []);

  // Stretch blur along travel axis for a soft motion-streak.
  const blur = useMemo(() => {
    const rad = ((drift.angle + 360 - drift.lift) % 360) * (Math.PI / 180);
    const along = 1.35;
    const across = 0.12;
    return {
      x: Math.max(0.08, Math.abs(Math.cos(rad)) * along + across),
      y: Math.max(0.08, Math.abs(Math.sin(rad)) * along + across),
    };
  }, [drift]);

  const options = useMemo<ISourceOptions>(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: "transparent" } },
      fpsLimit: 45,
      detectRetina: true,
      particles: {
        number: {
          value: 70,
          density: { enable: true, width: 1400, height: 900 },
        },
        color: {
          value: [
            "#ffffff",
            "#fff8ea",
            "#ffe9c2",
            "#ffd89a",
            "#f0c878",
            "#e8b85c",
          ],
        },
        shape: { type: "circle" },
        opacity: {
          value: { min: 0.22, max: 0.78 },
          animation: {
            enable: true,
            speed: 0.18,
            sync: false,
            startValue: "random",
            destroy: "none",
          },
        },
        size: {
          value: { min: 0.45, max: 1.55 },
          animation: {
            enable: true,
            speed: 0.2,
            sync: false,
            startValue: "random",
            destroy: "none",
          },
        },
        move: {
          enable: true,
          // Slow cinematic crawl — opposite the sun.
          speed: { min: 0.025, max: 0.1 },
          direction: "none",
          angle: {
            value: (drift.angle + 360 - drift.lift) % 360,
            offset: 28,
          },
          drift: 0.28,
          random: true,
          straight: false,
          outModes: { default: "out" },
          gravity: {
            enable: true,
            acceleration: { min: -0.025, max: 0.008 },
          },
        },
        life: {
          count: 0,
          duration: { value: { min: 22, max: 48 }, sync: false },
          delay: { value: { min: 0, max: 6 }, sync: false },
        },
      },
      interactivity: {
        events: {
          onHover: { enable: false },
          onClick: { enable: false },
          resize: { enable: true },
        },
      },
    }),
    [drift],
  );

  return (
    <>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      >
        <filter
          id="kesari-dust-motion"
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation={`${blur.x} ${blur.y}`} />
        </filter>
      </svg>
      <Particles
        key={`dust-${drift.direction}-${Math.round(drift.angle)}`}
        id="kesari-warm-dust"
        className="hero-dust pointer-events-none absolute inset-0 z-[6] h-full w-full"
        options={options}
      />
    </>
  );
}

export function WarmDust() {
  return (
    <ParticlesProvider init={loadSlim}>
      <DustLayer />
    </ParticlesProvider>
  );
}
