"use client";

type QtySelectProps = {
  value: number;
  onChange: (qty: number) => void;
};

export function QtySelect({ value, onChange }: QtySelectProps) {
  return (
    <div className="flex items-center gap-4">
      <p className="nav-link text-ink-soft">Qty</p>
      <div className="flex border border-gold/35">
        <button
          type="button"
          className="px-3 py-2 text-ink"
          onClick={() => onChange(Math.max(1, value - 1))}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="min-w-8 py-2 text-center text-sm tracking-widest">{value}</span>
        <button
          type="button"
          className="px-3 py-2 text-ink"
          onClick={() => onChange(value + 1)}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>
    </div>
  );
}
