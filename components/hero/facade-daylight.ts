import * as THREE from "three";

/**
 * Physically based daylight for the facade (no visible sky — only its light).
 *
 * Real outdoor light is one sun plus the sky: the sun's colour follows its
 * elevation (≈2000 K at the horizon → ≈5600 K overhead), the shadow side is lit
 * by blue skylight, and the ground bounces warm stone colour back up. Earlier
 * the facade used five stylised lights (orange "saffron" fill, brown rim, a
 * second sun) and a colour-ageing pass; this replaces them.
 */

/** Blackbody colour (sRGB) for a temperature in kelvin (Tanner Helland fit). */
export function kelvinColor(kelvin: number) {
  const t = kelvin / 100;
  let r: number, g: number, b: number;
  if (t <= 66) {
    r = 255;
    g = 99.4708025861 * Math.log(t) - 161.1195681661;
    b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  } else {
    r = 329.698727446 * Math.pow(t - 60, -0.1332047592);
    g = 288.1221695283 * Math.pow(t - 60, -0.0755148492);
    b = 255;
  }
  const c = (v: number) => Math.min(Math.max(v, 0), 255) / 255;
  return new THREE.Color().setRGB(c(r), c(g), c(b), THREE.SRGBColorSpace);
}

const smooth = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);

export type Daylight = {
  /** unit vector from the facade toward the sun (model frame: facade faces +z) */
  sunDir: THREE.Vector3;
  sunColor: THREE.Color;
  sunIntensity: number;
  skyColor: THREE.Color;
  groundColor: THREE.Color;
  skyIntensity: number;
  /** 0 day → 1 night (lanterns take over) */
  night: number;
  exposure: number;
};

/** Sun path over the facade from the IST hour: east (−x) morning → west (+x) evening. */
export function daylight(hour: number): Daylight {
  const t = THREE.MathUtils.clamp((hour - 5.6) / 13, 0, 1);
  const az = THREE.MathUtils.lerp(-1.3, 1.3, t);
  const elevDeg = Math.sin(t * Math.PI) * 68 - 2 + (hour < 5.6 || hour > 18.6 ? -12 : 0);
  const el = THREE.MathUtils.degToRad(Math.max(elevDeg, -12));
  const sunDir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el) * 0.75 + 0.35)
    .normalize();

  const up = smooth(-1, 8, elevDeg);                       // sun above the horizon
  const kelvin = 2000 + 3600 * smooth(0, 38, elevDeg);
  // Air mass: low sun is dimmer as well as warmer.
  // Strong key vs. soft sky fill (≈ 4:1) — the cinematic contrast that makes form read.
  const sunIntensity = 4.2 * up * (0.35 + 0.65 * smooth(2, 30, elevDeg));

  const day = smooth(-8, 15, elevDeg);
  const golden = smooth(-2, 6, elevDeg) * (1 - smooth(10, 22, elevDeg));
  const skyColor = new THREE.Color("#2c3550")                // dusk blue
    .lerp(new THREE.Color("#9fbbe6"), day)                    // clear daytime sky
    .lerp(new THREE.Color("#d8b9b0"), golden * 0.45);         // pinkish golden-hour sky
  const groundColor = new THREE.Color("#3a3128").lerp(new THREE.Color("#a68e6e"), day);
  const skyIntensity = 0.14 + 0.55 * day;
  const night = 1 - smooth(-6, 4, elevDeg);
  // Camera-like exposure: brighter at dusk / night, as a photographer would.
  const exposure = THREE.MathUtils.lerp(1.0, 1.6, night);
  return {
    sunDir,
    sunColor: kelvinColor(kelvin),
    sunIntensity,
    skyColor,
    groundColor,
    skyIntensity,
    night,
    exposure,
  };
}

/**
 * Outdoor reflection environment: a soft sky-to-ground gradient (never drawn —
 * scene.environment only), so brass and polished wood reflect daylight.
 */
export function outdoorEnvironment(pmrem: THREE.PMREMGenerator) {
  const scene = new THREE.Scene();
  const geo = new THREE.SphereGeometry(10, 64, 32);
  const colors: number[] = [];
  const zenith = new THREE.Color("#6f97d6");
  const horizon = new THREE.Color("#e3e9ef");
  const ground = new THREE.Color("#8d7b64");
  const pos = geo.attributes.position;
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i) / 10;
    if (y >= 0) c.copy(horizon).lerp(zenith, Math.pow(y, 0.6));
    else c.copy(horizon).lerp(ground, Math.min(1, -y * 4));
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  scene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  // a bright, soft sun patch high in front, for believable specular highlights
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(0.9, 16, 8),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(6, 5.6, 5) }),
  );
  sun.position.set(2, 6, 7);
  scene.add(sun);
  const env = pmrem.fromScene(scene, 0.02).texture;
  geo.dispose();
  return env;
}

const METAL = /Metal|Lock|brass|grey|gold|Lantern/i;

/**
 * Facade materials kept true to their baked colours: no saturation / darkening
 * pass, outdoor reflections, believable roughness for lime plaster, painted
 * pigment, old teak and brass.
 */
export function trueFacadeMaterials(root: THREE.Object3D) {
  const seen = new Set<THREE.Material>();
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !obj.visible) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      const std = mat as THREE.MeshStandardMaterial;
      if (!std || !("color" in std) || seen.has(std)) continue;
      seen.add(std);
      if (std.map) std.map.colorSpace = THREE.SRGBColorSpace;
      if (/_Glow/i.test(mesh.name)) continue;            // lantern glass keeps its glow
      std.emissive = new THREE.Color(0x000000);
      std.emissiveIntensity = 0;
      // Where the Blender bake supplies a roughness map, trust it (factor 1).
      const baked = !!std.roughnessMap;
      if (METAL.test(`${mesh.name} ${std.name ?? ""}`)) {
        // aged brass / iron: metallic, softly worn
        if (!baked) std.roughness = THREE.MathUtils.clamp(std.roughness ?? 0.4, 0.28, 0.55);
        std.envMapIntensity = 0.9;
      } else {
        // lime plaster, mineral paint, carved stone, old wood: matte, no plastic shine
        if (!baked) std.roughness = Math.max(std.roughness ?? 0.85, 0.82);
        std.envMapIntensity = 0.35;
      }
      // deeper relief so carving and plaster texture catch the raking sun
      if (std.normalMap) std.normalScale = new THREE.Vector2(1.45, 1.45);
      std.needsUpdate = true;
    }
  });
}
