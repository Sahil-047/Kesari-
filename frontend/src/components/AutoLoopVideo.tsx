"use client";

import { useEffect, useRef } from "react";

type AutoLoopVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  "aria-label"?: string;
};

export default function AutoLoopVideo({
  src,
  poster,
  className = "",
  "aria-label": ariaLabel,
}: AutoLoopVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const play = () => {
      void el.play().catch(() => {});
    };

    const restart = () => {
      el.currentTime = 0;
      play();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") play();
    };

    el.addEventListener("ended", restart);
    document.addEventListener("visibilitychange", onVisibility);
    play();

    return () => {
      el.removeEventListener("ended", restart);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      poster={poster}
      preload="auto"
      aria-label={ariaLabel}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
