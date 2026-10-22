/** Real-time cinematic lighting curve for Asia/Kolkata (IST, UTC+5:30). */

export type IstLightState = {
  hour: number;
  /** 0 night → 1 full day */
  dayFactor: number;
  golden: number;
  exposure: number;
  ambient: number;
  hemi: number;
  key: number;
  shaft: number;
  saffron: number;
  rim: number;
  door: number;
  ember: number;
  spot: number;
  spot2: number;
  keyColor: string;
  shaftColor: string;
  gradeOpacity: number;
  /** CSS god-ray strength */
  rayStrength: number;
  /** Dust visibility in the shafts */
  dustGain: number;
};

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Dust drifts opposite the IST sun (away from the light source).
 * Angle in degrees for tsparticles: 0 = right, 90 = down, 180 = left, 270 = up.
 * Morning sun from left → dust goes right; evening sun from right → dust goes left.
 */
export function getIstDustDrift(hour = getIstHour()) {
  const t = Math.max(0, Math.min(1, (hour - 5.5) / 13));
  const az = -1.35 + 2.7 * t;
  // Same mapping as placeIstSun azimuth → screen drift away from sun.
  const angle = ((az + 1.35) / 2.7) * 180;
  // Slight lift so motes rise through the shafts, not sink.
  const lift = 18 + (1 - Math.abs(t - 0.5) * 2) * 10;
  return {
    /** Primary drift degrees (0 right → 180 left across the day). */
    angle,
    /** Upward bias mixed into motion (degrees toward top). */
    lift,
    /** Named fallback for coarse direction. */
    direction: (az < -0.2 ? "top-right" : az > 0.2 ? "top-left" : "top") as
      | "top-right"
      | "top-left"
      | "top",
  };
}

/** Fractional IST hour, e.g. 14.5 = 2:30pm. */
export function getIstHour(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  }).formatToParts(now);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const second = Number(parts.find((p) => p.type === "second")?.value ?? 0);
  return hour + minute / 60 + second / 3600;
}

/**
 * Maps IST clock time to cinematic warm light.
 * Stronger key / weaker fill so carved shadows read and shift through the day.
 */
export function getIstLightState(now = new Date()): IstLightState {
  const hour = getIstHour(now);

  const dawn = smoothstep(5.0, 6.8, hour);
  const dusk = 1 - smoothstep(17.0, 19.8, hour);
  const dayFactor = Math.max(0.06, dawn * dusk);

  const golden =
    smoothstep(15.8, 17.0, hour) * (1 - smoothstep(18.2, 19.6, hour));
  const morning =
    smoothstep(6.0, 7.8, hour) * (1 - smoothstep(9.2, 10.8, hour));
  const noon =
    smoothstep(10.2, 11.8, hour) * (1 - smoothstep(13.8, 15.2, hour));

  // Higher contrast: lower fill, harder key, deeper shadows.
  const ambient = 0.05 + dayFactor * 0.11 + golden * 0.02;
  const hemi = 0.08 + dayFactor * 0.16;
  const key = 0.75 + dayFactor * 1.35 + noon * 0.35 + golden * 0.32;
  const shaft = 0.14 + dayFactor * 0.32 + golden * 0.42 + morning * 0.18;
  const saffron = 0.18 + morning * 0.45 + golden * 0.4;
  const rim = 0.06 + dayFactor * 0.1 + golden * 0.1;
  const door = 0.35 + dayFactor * 0.35 + golden * 0.45 + (1 - dayFactor) * 0.25;
  const ember = 0.15 + (1 - dayFactor) * 0.45 + golden * 0.28;
  const spot = 0.4 + dayFactor * 0.85 + golden * 0.55;
  const spot2 = 0.25 + dayFactor * 0.55 + golden * 0.35;
  const exposure = 0.52 + dayFactor * 0.24 + golden * 0.08;

  let keyColor = "#f0d8a0";
  let shaftColor = "#ffe4b0";
  if (golden > 0.15) {
    keyColor = "#ffb45c";
    shaftColor = "#ffc06a";
  } else if (morning > 0.2) {
    keyColor = "#f2c488";
    shaftColor = "#f6c890";
  } else if (dayFactor < 0.22) {
    keyColor = "#b8894a";
    shaftColor = "#a07438";
  } else if (noon > 0.35) {
    keyColor = "#ffe8c4";
    shaftColor = "#fff0d4";
  }

  return {
    hour,
    dayFactor,
    golden,
    exposure,
    ambient,
    hemi,
    key,
    shaft,
    saffron,
    rim,
    door,
    ember,
    spot,
    spot2,
    keyColor,
    shaftColor,
    gradeOpacity: 0.45 + (1 - dayFactor) * 0.4 + golden * 0.2,
    rayStrength: 0.25 + dayFactor * 0.45 + golden * 0.55 + morning * 0.25,
    dustGain: 1.15 + dayFactor * 0.35 + golden * 0.45 + morning * 0.3,
  };
}
