"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SRC = "/audio/kesari-cinematic.mp3";
const STORAGE_KEY = "kesari-music-muted";

function SoundIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 9.5v5h3.2L13 19V5l-5.3 4.5H4.5z"
        fill="currentColor"
      />
      {muted ? (
        <path
          d="M16.2 9.3l5 5M21.2 9.3l-5 5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      ) : (
        <>
          <path
            d="M16 9.2a3.6 3.6 0 010 5.6"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
          <path
            d="M18.4 6.8a6.4 6.4 0 010 10.4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

export function AmbientMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const unlockedRef = useRef(false);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    const audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0.42;
    audioRef.current = audio;
    return audio;
  }, []);

  const play = useCallback(async () => {
    const audio = ensureAudio();
    if (audio.muted) return;
    try {
      await audio.play();
      unlockedRef.current = true;
    } catch {
      // Autoplay blocked until a gesture — unlock listeners handle it.
    }
  }, [ensureAudio]);

  const toggle = useCallback(() => {
    const audio = ensureAudio();
    const next = !audio.muted;
    audio.muted = next;
    setMuted(next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
    if (!next) {
      void play();
    } else {
      audio.pause();
    }
  }, [ensureAudio, play]);

  useEffect(() => {
    const audio = ensureAudio();
    let storedMuted = false;
    try {
      storedMuted = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      /* ignore */
    }
    audio.muted = storedMuted;
    setMuted(storedMuted);
    setReady(true);

    const startIfAllowed = () => {
      if (audio.muted) return;
      void play();
    };

    const onOpened = () => startIfAllowed();
    const onGesture = () => {
      if (!unlockedRef.current && !audio.muted) void play();
    };

    window.addEventListener("kesari:opened", onOpened);
    window.addEventListener("pointerdown", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture);

    if (document.body.dataset.kesariOpened === "1") {
      startIfAllowed();
    }

    return () => {
      window.removeEventListener("kesari:opened", onOpened);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      audio.pause();
      audioRef.current = null;
    };
  }, [ensureAudio, play]);

  if (!ready) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      className={`ambient-music-btn${muted ? " is-muted" : ""}`}
      aria-pressed={muted}
      aria-label={muted ? "Turn music on" : "Turn music off"}
      title={muted ? "Sound on" : "Sound off"}
    >
      <SoundIcon muted={muted} />
    </button>
  );
}
