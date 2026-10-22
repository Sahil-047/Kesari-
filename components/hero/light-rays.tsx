"use client";

/** Soft god-rays — warm historical shafts over the facade. */
export function LightRays() {
  return (
    <div className="ko-rays pointer-events-none absolute inset-0 z-[2] overflow-hidden" aria-hidden="true">
      <span className="ko-ray ko-ray--a" />
      <span className="ko-ray ko-ray--b" />
      <span className="ko-ray ko-ray--c" />
      <span className="ko-ray ko-ray--d" />
    </div>
  );
}
