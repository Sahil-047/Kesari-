import type { CSSProperties } from "react";

/** An isometric cube drawn from three faces with a hairline outline. */
export function IsoCube({
  size = 34,
  top,
  left,
  right,
  className = "",
}: {
  size?: number;
  top?: string;
  left?: string;
  right?: string;
  className?: string;
}) {
  const style = {
    width: size,
    height: size,
    ...(top && { "--cube-top": top }),
    ...(left && { "--cube-left": left }),
    ...(right && { "--cube-right": right }),
  } as CSSProperties;

  return (
    <span aria-hidden className={`iso-cube inline-block shrink-0 ${className}`} style={style}>
      <i />
      <i />
      <i />
      <svg viewBox="0 0 100 100" fill="none" stroke="var(--cms-line)" strokeWidth="2.2" strokeLinejoin="round">
        <path d="M50 1 99 25v50L50 99 1 75V25z M1 25l49 25 49-25 M50 50v49" />
      </svg>
    </span>
  );
}

/** The Kesari Studio mark: a saffron cube. */
export function StudioMark({ size = 36 }: { size?: number }) {
  return <IsoCube size={size} top="#f0a15f" left="var(--cms-accent)" right="var(--cms-accent-side)" />;
}

/**
 * Sections of a page as stacked isometric slabs; the active one lifts and
 * turns saffron. Clicking a slab selects that section.
 */
export function IsoStack({
  layers,
  active,
  onSelect,
}: {
  layers: { key: string; label: string }[];
  active: string;
  onSelect: (key: string) => void;
}) {
  const gap = 46;
  const height = 120 + layers.length * gap;

  return (
    <div className="relative mx-auto w-full max-w-[300px]" style={{ height }}>
      <div className="absolute left-1/2 top-[70px] h-[150px] w-[150px] -translate-x-1/2 [perspective:none]">
        <div className="iso-plane relative h-full w-full">
          {layers.map((layer, i) => {
            const isActive = layer.key === active;
            const z = (layers.length - 1 - i) * gap + (isActive ? 14 : 0);
            return (
              <button
                key={layer.key}
                type="button"
                onClick={() => onSelect(layer.key)}
                data-active={isActive}
                aria-label={`Edit ${layer.label}`}
                aria-pressed={isActive}
                className="iso-slab absolute inset-0 cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-[var(--cms-accent)]"
                style={{ transform: `translateZ(${z}px)`, ["--slab-depth" as string]: "9px" }}
              />
            );
          })}
        </div>
      </div>

      {/* Labels sit outside the 3D plane so they stay flat and readable. */}
      {layers.map((layer, i) => {
        const isActive = layer.key === active;
        const y = 92 + i * gap * 0.82 - (isActive ? 10 : 0);
        return (
          <button
            key={layer.key}
            type="button"
            onClick={() => onSelect(layer.key)}
            className="absolute right-0 flex items-center gap-2 text-left"
            style={{ top: y }}
          >
            <span className={`h-px w-6 ${isActive ? "bg-[var(--cms-accent)]" : "bg-[var(--cms-border-strong)]"}`} />
            <span
              className={`cms-mono text-[11px] uppercase tracking-[0.08em] ${
                isActive ? "font-semibold text-[var(--cms-accent-ink)]" : "text-[var(--cms-muted)]"
              }`}
            >
              {layer.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
