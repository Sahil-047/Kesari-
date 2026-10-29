"use client";

type Props = { className?: string };

export default function Petal({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 24 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      aria-hidden
    >
      <path
        d="M12 2 C18 10 20 20 12 30 C4 20 6 10 12 2 Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}
