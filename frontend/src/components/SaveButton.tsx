"use client";

type SaveButtonProps = {
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function SaveButton({
  active = false,
  onClick,
  className = "",
}: SaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute right-3 top-3 z-10 border border-ink/10 bg-parchment-light/95 px-2.5 py-1 font-sans text-[0.58rem] uppercase tracking-[0.2em] text-ink transition hover:bg-white ${className}`}
      aria-pressed={active}
    >
      {active ? "Saved" : "Save"}
    </button>
  );
}
