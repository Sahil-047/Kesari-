"use client";

import { sizes } from "@/lib/catalog";
import { classNames } from "@/lib/format";

type SizeSelectProps = {
  value: string;
  onChange: (size: string) => void;
};

export function SizeSelect({ value, onChange }: SizeSelectProps) {
  return (
    <fieldset>
      <legend className="nav-link mb-3 text-ink-soft">Size</legend>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <label
            key={size}
            className={classNames(
              "min-w-12 cursor-pointer border px-3 py-2 text-center text-sm tracking-[0.16em]",
              value === size
                ? "border-ink bg-ink text-cream"
                : "border-gold/35 text-ink hover:border-ink",
            )}
          >
            <input
              type="radio"
              name="size"
              value={size}
              checked={value === size}
              onChange={() => onChange(size)}
              className="sr-only"
            />
            {size}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
