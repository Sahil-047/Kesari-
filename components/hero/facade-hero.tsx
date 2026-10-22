"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { addHallAtmosphere } from "@/components/hero/hall-atmosphere";
import { LightRays } from "@/components/hero/light-rays";
import { WarmDust } from "@/components/hero/warm-dust";
import { getIstLightState } from "@/lib/ist-light";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

const MODEL_URL = "/3d%20model/haveli_facade_door.glb";
const INTERIOR_URL = "/3d%20model/haveli_interior.glb";
const DRACO_PATH = "/draco/";
const WALL = "#d8c4a0";

/** Frame from the wall only so crop/proportions match the previous facade. */
const FACADE_WALL = /Facade_Atlas|Facade_Metal/i;
/** Wall plus carved door leaves, brass, props and the jhumka lanterns. */
const FACADE_SURFACE = /Facade_Atlas|Facade_Metal|Facade_Props|Door_|Lantern_(L|R)(_Bracket)?$/i;
const FACADE_HIDDEN = /Facade_Ground/i;
const FACADE_METAL = /Metal|Lock|brass|grey|gold|Lantern/i;
/** Emissive lamp glass — keeps its own glow, skipped by the ageing pass. */
const FACADE_GLOW = /_Glow/i;
/** Blender's jhumka / chandelier bulb colour (1, 0.72, 0.42). */
const LAMP_COLOR = "#ffb86b";

/** Max yaw from mouse (radians) — slight left/right only. */
const PARALLAX_YAW = 0.045;
/** Pitch downward — top tips away so we look down onto the facade. */
const TILT_X = 0.16;
/** Levitate amplitude as fraction of wall height. */
const LEVITATE_AMP = 0.0035;
/** Levitate period in seconds — slowest comfortable float. */
const LEVITATE_PERIOD = 22;

/**
 * Crop rect in wall-bbox UVs (0–1).
 * Image 1 = full wall (scalloped top/bottom). Image 2 = this crop.
 * Cut the scalloped crown + base; keep door + 3 floral columns/side.
 */
const CROP_U0 = 0.0;
const CROP_U1 = 1.0;
const CROP_V0 = 0.085;
const CROP_V1 = 0.915;

function wallBox(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  let found = false;
  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh || !obj.visible) return;
    if (!FACADE_WALL.test(obj.name)) return;
    box.union(new THREE.Box3().setFromObject(obj));
    found = true;
  });
  if (!found) box.setFromObject(root);
  return box;
}

/** Hero lens. Perspective, so the camera can really walk through the door. */
const HERO_FOV = 30;
/** Total wheel travel for the whole door → hall journey (smaller = longer scroll). */
const SCROLL_SPEED = 0.00032;
/** Mouse look inside the hall (radians at the screen edge). */
const LOOK_YAW = 0.55;
const LOOK_PITCH = 0.22;
const _up = new THREE.Vector3(0, 1, 0);

/** Camera pose in world space. */
type Pose = { pos: THREE.Vector3; look: THREE.Vector3; fov: number };

function span(p: number, a: number, b: number) {
  return THREE.MathUtils.clamp((p - a) / Math.max(b - a, 1e-6), 0, 1);
}

function smooth(p: number, a: number, b: number) {
  const t = span(p, a, b);
  return t * t * (3 - 2 * t);
}

/** Wall crop that fills the screen — same framing as the old orthographic hero. */
function frameWall(root: THREE.Object3D, viewW: number, viewH: number): Pose {
  const box = wallBox(root);
  const size = box.getSize(new THREE.Vector3());
  const midZ = box.getCenter(new THREE.Vector3()).z;

  const x0 = box.min.x + size.x * CROP_U0;
  const x1 = box.min.x + size.x * CROP_U1;
  const y0 = box.min.y + size.y * CROP_V0;
  const y1 = box.min.y + size.y * CROP_V1;
  const frameW = x1 - x0;
  const frameH = y1 - y0;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  const aspect = viewW / Math.max(viewH, 1);
  const t = Math.tan(THREE.MathUtils.degToRad(HERO_FOV) / 2);
  const dist = Math.min(frameH / 2 / t, frameW / 2 / (t * aspect));

  return {
    pos: new THREE.Vector3(cx, cy, midZ + dist),
    look: new THREE.Vector3(cx, cy, midZ),
    fov: HERO_FOV,
  };
}

/**
 * Door-to-hall flight, authored in the model's own frame (Y up, facade at z≈0
 * facing +z, door at x=0, lobby to z=-3, hall to z=-19, outfits at z≈-7.4).
 * `s` is scroll progress 0..1.
 */
type RigKey = {
  s: number;
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
  /** Widen fov (up to MAX_FIT_FOV) so this half-width at the look point fits the screen. */
  fitHalfWidth?: number;
};

const MAX_FIT_FOV = 74;

const FLIGHT: RigKey[] = [
  { s: 0.1, pos: [0, 3.0, 8.5], look: [0, 2.3, 0], fov: 32 },
  { s: 0.24, pos: [0, 2.4, 4.2], look: [0, 2.2, 0], fov: 36 },
  { s: 0.36, pos: [0, 2.25, 1.8], look: [0, 2.2, -3], fov: 40 },
  { s: 0.45, pos: [0, 2.4, -2.4], look: [0, 2.1, -7.4], fov: 46 },
  // Establishing view just inside the hall: lens widens to fit all four
  // outfits (they span x ≈ ±5.3 on the row at z = -7.4).
  { s: 0.53, pos: [0, 2.55, -3.3], look: [0, 1.85, -7.4], fov: 56, fitHalfWidth: 5.4 },
  // Showcase: glide left → right, stopping in front of each outfit.
  { s: 0.6, pos: [-3.6, 2.1, -4.7], look: [-4.2, 1.8, -7.4], fov: 46 },
  // Lehengas are ~2 m wide, so stand further back for those two.
  { s: 0.67, pos: [-1.3, 2.25, -3.9], look: [-1.45, 1.8, -7.4], fov: 50 },
  { s: 0.74, pos: [1.2, 2.1, -4.7], look: [1.4, 1.9, -7.4], fov: 46 },
  { s: 0.81, pos: [3.55, 2.25, -3.9], look: [4.2, 1.8, -7.4], fov: 50 },
  { s: 0.9, pos: [0.8, 2.5, -5.9], look: [0, 3.0, -12], fov: 46 },
  { s: 1.0, pos: [0, 3.0, -7.4], look: [0, 4.6, -19.3], fov: 48 },
];

type Rig = {
  keys: { s: number; fov: number; fit?: { halfWidth: number; dist: number } }[];
  pos: THREE.CatmullRomCurve3;
  look: THREE.CatmullRomCurve3;
};

/** Hero pose (world) becomes key 0, expressed in the model's local frame. */
function buildRig(root: THREE.Object3D, hero: Pose): Rig {
  const v = (a: [number, number, number]) => new THREE.Vector3(...a);
  const keys = [
    { s: 0, fov: hero.fov },
    ...FLIGHT.map((k) => ({
      s: k.s,
      fov: k.fov,
      fit: k.fitHalfWidth
        ? { halfWidth: k.fitHalfWidth, dist: v(k.pos).distanceTo(v(k.look)) }
        : undefined,
    })),
  ];
  const pos = [root.worldToLocal(hero.pos.clone()), ...FLIGHT.map((k) => v(k.pos))];
  const look = [root.worldToLocal(hero.look.clone()), ...FLIGHT.map((k) => v(k.look))];
  return {
    keys,
    pos: new THREE.CatmullRomCurve3(pos, false, "centripetal"),
    look: new THREE.CatmullRomCurve3(look, false, "centripetal"),
  };
}

function keyFov(key: Rig["keys"][number], aspect: number) {
  if (!key.fit) return key.fov;
  const need = THREE.MathUtils.radToDeg(
    2 * Math.atan(key.fit.halfWidth / (key.fit.dist * Math.max(aspect, 0.1))),
  );
  return THREE.MathUtils.clamp(need, key.fov, MAX_FIT_FOV);
}

const _p = new THREE.Vector3();
const _l = new THREE.Vector3();

function applyRig(
  camera: THREE.PerspectiveCamera,
  root: THREE.Object3D,
  rig: Rig,
  s: number,
) {
  const { keys } = rig;
  const x = THREE.MathUtils.clamp(s, 0, 1);
  let i = 0;
  while (i < keys.length - 2 && x > keys[i + 1].s) i++;
  const local = span(x, keys[i].s, keys[i + 1].s);
  const u = (i + local) / (keys.length - 1);
  rig.pos.getPoint(u, _p);
  rig.look.getPoint(u, _l);
  root.updateMatrixWorld(true);
  camera.position.copy(root.localToWorld(_p));
  camera.up.set(0, 1, 0);
  camera.lookAt(root.localToWorld(_l));
  const fov = THREE.MathUtils.lerp(
    keyFov(keys[i], camera.aspect),
    keyFov(keys[i + 1], camera.aspect),
    local,
  );
  if (Math.abs(camera.fov - fov) > 1e-3) {
    camera.fov = fov;
    camera.updateProjectionMatrix();
  }
}

function loadGltf(
  loader: GLTFLoader,
  url: string,
  onProgress: (ratio: number) => void,
) {
  return new Promise<GLTF>((resolve, reject) => {
    loader.load(
      url,
      resolve,
      (event) => onProgress(event.total ? event.loaded / event.total : 0.15),
      reject,
    );
  });
}

/** Interior meshes that throw shadows from the outfit key spots. */
const INT_CASTERS = /^W_O\d_|Fountain|Elephant|Altar|ProductPed|ProductItem/i;
const INT_RECEIVERS = /Floor|Dado|Wall|Carpet|Lobby|Basin|Fountain_Step|ProductPed/i;

/**
 * Per-material look for the hall. Reflection strengths assume the warm
 * interior cube map from `bakeInteriorEnv`, not the neutral room env.
 */
function tuneInteriorMaterial(std: THREE.MeshStandardMaterial) {
  const name = std.name ?? "";
  const phys = std as THREE.MeshPhysicalMaterial;
  if (/gold|brass|chrome/i.test(name)) {
    std.envMapIntensity = 1.15;
    std.roughness = THREE.MathUtils.clamp(std.roughness, 0.18, 0.32);
  } else if (/marble|floor/i.test(name)) {
    std.envMapIntensity = 0.55;
    std.roughness = Math.max(std.roughness, 0.16);
  } else if (/water/i.test(name)) {
    std.envMapIntensity = 1.3;
    std.roughness = 0.04;
    std.transparent = true;
    std.opacity = 0.78;
    std.color.set("#bfe3e6");
  } else if (/glass_amber/i.test(name)) {
    std.envMapIntensity = 1.4;
    if (phys.isMeshPhysicalMaterial) phys.transmission = Math.min(phys.transmission, 0.6);
  } else if (/stained_glass/i.test(name)) {
    // Brighter backlight so the windows bloom like the Blender render.
    std.emissiveIntensity *= 2.6;
    std.envMapIntensity = 0.3;
  } else if (/lamp/i.test(name)) {
    std.emissiveIntensity *= 2.4;
  } else if (/plaster|ceiling|trim|painting/i.test(name)) {
    std.envMapIntensity = 0.22;
  } else {
    // Fabrics, mannequins, carpets: mostly matte.
    std.envMapIntensity = 0.3;
  }
}

function prepareInterior(root: THREE.Object3D) {
  const seen = new Set<THREE.Material>();
  root.traverse((obj) => {
    if ((obj as THREE.Light).isLight) {
      obj.visible = false;
      return;
    }
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    mesh.receiveShadow = INT_RECEIVERS.test(mesh.name);
    mesh.castShadow = INT_CASTERS.test(mesh.name);
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of materials) {
      const std = mat as THREE.MeshStandardMaterial;
      if (!std || seen.has(std)) continue;
      seen.add(std);
      if (std.map) std.map.colorSpace = THREE.SRGBColorSpace;
      if ("envMapIntensity" in std) tuneInteriorMaterial(std);
      std.needsUpdate = true;
    }
  });
}

const AGE_SHADOW = new THREE.Color("#6a4020");
const AGE_BRONZE = new THREE.Color("#8a5428");

/** Darker, richer facade — saturate + deepen without emissive glow. */
function ageWarmMaterials(root: THREE.Object3D) {
  const seen = new Set<THREE.Material>();

  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh || !obj.visible) return;
    const mesh = obj as THREE.Mesh;
    if (FACADE_GLOW.test(mesh.name)) return;
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];

    for (const mat of materials) {
      const std = mat as THREE.MeshStandardMaterial;
      if (!std || !("color" in std) || seen.has(std)) continue;
      seen.add(std);

      if (std.map) std.map.colorSpace = THREE.SRGBColorSpace;

      // No material emissive — only scene lights illuminate the facade.
      std.emissive = new THREE.Color(0x000000);
      std.emissiveIntensity = 0;

      // Deeper lows + richer chroma for higher model contrast.
      const hsl = { h: 0, s: 0, l: 0 };
      std.color.getHSL(hsl);
      std.color.setHSL(
        hsl.h,
        Math.min(1, hsl.s * 1.42 + 0.08),
        Math.max(0.06, hsl.l * 0.68),
      );

      const isMetal = FACADE_METAL.test(`${mesh.name} ${std.name ?? ""}`);
      if (isMetal) {
        std.color.lerp(AGE_BRONZE, 0.26);
        std.metalness = Math.min(1, (std.metalness ?? 0.4) * 0.7 + 0.18);
        std.roughness = Math.min(1, (std.roughness ?? 0.5) + 0.16);
      } else {
        std.color.lerp(AGE_SHADOW, 0.22);
        std.metalness = Math.min(std.metalness ?? 0, 0.04);
        std.roughness = Math.min(1, (std.roughness ?? 0.7) + 0.12);
      }

      if ("envMapIntensity" in std) std.envMapIntensity = 0.1;
      std.needsUpdate = true;
    }
  });
}

function addWarmLighting(scene: THREE.Scene) {
  // Harder contrast: crushed fill, brighter key, sharper relief shadows.
  const ambient = new THREE.AmbientLight("#e0c8a0", 0.12);
  scene.add(ambient);

  const hemi = new THREE.HemisphereLight("#edd8b0", "#3a1c0c", 0.18);
  scene.add(hemi);

  const key = new THREE.DirectionalLight("#f2cc7a", 1.7);
  key.position.set(2.5, 5, 12);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.bias = -0.00008;
  key.shadow.normalBias = 0.016;
  key.shadow.radius = 1.1;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 80;
  key.shadow.autoUpdate = true;
  scene.add(key);
  scene.add(key.target);

  const shaft = new THREE.DirectionalLight("#ffd089", 0.38);
  shaft.position.set(-1.5, 8, 6);
  scene.add(shaft);

  const saffron = new THREE.DirectionalLight("#b84818", 0.36);
  saffron.position.set(-7, 2, 8);
  scene.add(saffron);

  const rim = new THREE.DirectionalLight("#4a2410", 0.14);
  rim.position.set(6, 1, -3);
  scene.add(rim);

  return { ambient, hemi, key, shaft, saffron, rim };
}

/** Fit the sun shadow camera tightly around the facade so carved detail reads. */
function fitSunShadow(
  key: THREE.DirectionalLight,
  root: THREE.Object3D,
) {
  const box = wallBox(root);
  if (box.isEmpty()) return;

  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  key.target.position.copy(center);
  key.target.updateMatrixWorld();

  // Tighter frustum = sharper shadows on carved panels / jali.
  const maxDim = Math.max(size.x, size.y, size.z) * 0.58;
  const cam = key.shadow.camera;
  cam.left = -maxDim;
  cam.right = maxDim;
  cam.top = maxDim;
  cam.bottom = -maxDim;
  cam.near = 0.5;
  cam.far = Math.max(45, key.position.distanceTo(center) + maxDim * 2.2);
  cam.updateProjectionMatrix();
  key.shadow.needsUpdate = true;
}

/** Sun path over the facade from IST hour (east morning → west evening). */
function placeIstSun(
  key: THREE.DirectionalLight,
  shaft: THREE.DirectionalLight,
  hour: number,
  root?: THREE.Object3D | null,
) {
  // 6:00 east (−X), 12:00 high front, 18:00 west (+X)
  // Wider arc so morning/evening shadows rake hard across the relief.
  const t = (hour - 5.5) / 13;
  const az = THREE.MathUtils.lerp(-1.35, 1.35, Math.max(0, Math.min(1, t)));
  const elev = Math.sin(Math.max(0.04, Math.min(1, t)) * Math.PI) * 0.92 + 0.18;
  const dist = 16;
  key.position.set(Math.sin(az) * dist, elev * 11, Math.cos(az) * dist * 0.65 + 5);
  shaft.position.set(
    Math.sin(az - 0.32) * 11,
    elev * 13 + 2,
    Math.cos(az - 0.32) * 9 + 3,
  );
  if (root) fitSunShadow(key, root);
}

function centerOf(obj: THREE.Object3D) {
  return new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
}

/**
 * Hall lights mirroring the Blender "Interior" rig: three chandeliers
 * (160 / 90 / 90 W), four lobby jhumkas (40 W), two warm ceiling fills and a
 * key spot on each outfit — all in the same warm 1 / 0.72 / 0.42 bulb colour.
 * Positions are read from the lamp meshes in the model.
 */
function addHallLighting(interiorRoot: THREE.Object3D) {
  interiorRoot.updateMatrixWorld(true);
  const group = new THREE.Group();
  // Low sky bounce only — the lamps do the work, like the Blender render.
  group.add(new THREE.HemisphereLight("#ffe2b4", "#2a170b", 0.18));

  const flicker: THREE.PointLight[] = [];
  const addLamp = (obj: THREE.Object3D | undefined, power: number, drop: number, range: number) => {
    if (!obj) return;
    const c = centerOf(obj);
    const light = new THREE.PointLight(LAMP_COLOR, power, range, 2);
    light.position.set(c.x, c.y - drop, c.z);
    light.userData.base = power;
    group.add(light);
    flicker.push(light);
  };

  addLamp(interiorRoot.getObjectByName("W_Chand_Main_Bulbs"), 68, 0.2, 0);
  addLamp(interiorRoot.getObjectByName("W_Chand_N_Bulbs"), 38, 0.2, 0);
  addLamp(interiorRoot.getObjectByName("W_Chand_S_Bulbs"), 38, 0.2, 0);
  for (let i = 0; i < 4; i++) {
    addLamp(interiorRoot.getObjectByName(`W_Jhumka_Lobby_${i}_Glow`), 9, 0, 7);
  }

  // Fill_S / Fill_N area lights: broad, soft, slightly paler warm.
  for (const z of [-6.8, -15.2]) {
    const fill = new THREE.PointLight("#ffd199", 5, 0, 2);
    fill.position.set(0, 6.6, z);
    group.add(fill);
  }

  // Key spots on the four outfits. Shadows come from the window sun instead
  // (hall-atmosphere), so they fall toward the door as in Blender.
  for (const x of [-4.2, -1.4, 1.4, 4.2]) {
    const spot = new THREE.SpotLight("#ffd19e", 38, 12, 0.42, 0.75, 1.6);
    spot.position.set(x, 5.4, -4.4);
    spot.target.position.set(x, 1.6, -7.4);
    group.add(spot, spot.target);
  }

  // Coloured spill from the two stained-glass windows onto the back floor.
  for (const [x, color] of [
    [-3, "#ff9a6e"],
    [3, "#8fb2ff"],
  ] as const) {
    const spill = new THREE.SpotLight(color, 26, 14, 0.55, 0.9, 1.4);
    spill.position.set(x, 4.2, -18.6);
    spill.target.position.set(x * 0.6, 0, -13.5);
    group.add(spill, spill.target);
  }
  interiorRoot.add(group);

  return {
    update(t: number) {
      flicker.forEach((l, i) => {
        l.intensity =
          l.userData.base * (1 + Math.sin(t * 7.3 + i * 2.1) * 0.015 + Math.sin(t * 3.1 + i) * 0.02);
      });
    },
  };
}

/**
 * Capture the lit hall once into a cube map and use it as the interior's own
 * reflection environment, so gold, marble and water mirror warm lamplight
 * instead of a neutral studio. Outside lights are hidden during the capture.
 */
function bakeInteriorEnv(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  pmrem: THREE.PMREMGenerator,
  root: THREE.Object3D,
  interiorRoot: THREE.Object3D,
  outside: THREE.Light[],
) {
  const rotX = root.rotation.x;
  root.rotation.x = 0;
  root.updateMatrixWorld(true);
  const prevBg = scene.background;
  const prevVis = outside.map((l) => l.visible);
  outside.forEach((l) => (l.visible = false));
  scene.background = new THREE.Color("#1a0f08");

  const target = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType });
  const cube = new THREE.CubeCamera(0.1, 60, target);
  cube.position.copy(root.localToWorld(new THREE.Vector3(0, 2.6, -9.5)));
  scene.add(cube);
  cube.update(renderer, scene);
  scene.remove(cube);
  const env = pmrem.fromCubemap(target.texture).texture;
  target.dispose();

  scene.background = prevBg;
  outside.forEach((l, i) => (l.visible = prevVis[i]));
  root.rotation.x = rotX;
  root.updateMatrixWorld(true);

  interiorRoot.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      const std = mat as THREE.MeshStandardMaterial;
      if (!std || !("envMap" in std)) continue;
      std.envMap = env;
      std.needsUpdate = true;
    }
  });
  return env;
}

/** Warm point light inside each exterior jhumka lantern beside the door. */
function addLanternLights(doorRoot: THREE.Object3D) {
  doorRoot.updateMatrixWorld(true);
  const lights: THREE.PointLight[] = [];
  for (const side of ["L", "R"]) {
    const glow = doorRoot.getObjectByName(`Lantern_${side}_Glow`);
    if (!glow) continue;
    const c = doorRoot.worldToLocal(centerOf(glow));
    const light = new THREE.PointLight(LAMP_COLOR, 2.6, 5, 2);
    light.position.copy(c);
    light.userData.base = light.intensity;
    doorRoot.add(light);
    lights.push(light);
  }
  return {
    update(t: number) {
      lights.forEach((l, i) => {
        l.intensity = l.userData.base * (1 + Math.sin(t * 6.1 + i * 1.7) * 0.03);
      });
    },
  };
}

function reportOpeningProgress(value: number) {
  window.__kesariPendingProgress = value;
  window.__kesariSetProgress?.(value);
}

export function FacadeHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const section = sectionRef.current;
    if (!mount || !section) return;

    reportOpeningProgress(0.04);

    let frame = 0;
    let disposed = false;
    let facade: THREE.Object3D | null = null;
    let wallHeight = 1;
    let baseY = 0;
    let baseRotY = 0;
    let baseRotX = 0;
    let scrollP = 0;
    let scrollTarget = 0;
    let startPose: Pose | null = null;
    let rig: Rig | null = null;
    let hall: ReturnType<typeof addHallLighting> | null = null;
    let lanterns: ReturnType<typeof addLanternLights> | null = null;
    let atmosphere: ReturnType<typeof addHallAtmosphere> | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    let doorDuration = 3;

    const mouse = { x: 0, y: 0, current: 0, currentY: 0 };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.78;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(WALL);

    const camera = new THREE.PerspectiveCamera(
      HERO_FOV,
      mount.clientWidth / Math.max(mount.clientHeight, 1),
      0.05,
      200,
    );

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;
    scene.environment = env;

    const lights = addWarmLighting(scene);
    const outsideLights: THREE.Light[] = [
      lights.ambient,
      lights.hemi,
      lights.key,
      lights.shaft,
      lights.saffron,
      lights.rim,
    ];

    // Bloom only matters inside (bulbs, jhumkas, stained glass); it is faded
    // in with `inside` so the daylit facade stays crisp.
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(mount.clientWidth, mount.clientHeight);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(mount.clientWidth, mount.clientHeight),
      0,
      0.45,
      // HDR threshold: only lamp bulbs / glass pass, not lamplit marble.
      7,
    );
    bloom.enabled = false;
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    let hallEnv: THREE.Texture | null = null;
    const clock = new THREE.Clock();
    let ist = getIstLightState();
    const keyColor = new THREE.Color(ist.keyColor);
    const shaftColor = new THREE.Color(ist.shaftColor);
    const targetKeyColor = new THREE.Color(ist.keyColor);
    const targetShaftColor = new THREE.Color(ist.shaftColor);
    let shadowFitAt = 0;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_PATH);
    dracoLoader.setDecoderConfig({ type: "wasm" });

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    const progress = { door: 0, interior: 0 };
    const syncProgress = () => {
      reportOpeningProgress(
        Math.min(0.96, 0.06 + progress.door * 0.44 + progress.interior * 0.48),
      );
    };

    const placeHaveli = (root: THREE.Object3D) => {
      root.position.set(0, 0, 0);
      root.rotation.set(0, 0, 0);
      root.scale.set(1, 1, 1);
      root.updateMatrixWorld(true);

      let box = wallBox(root);
      let size = box.getSize(new THREE.Vector3());
      let center = box.getCenter(new THREE.Vector3());

      if (size.z >= size.x) {
        root.rotation.y = Math.PI / 2;
        root.updateMatrixWorld(true);
        box = wallBox(root);
        size = box.getSize(new THREE.Vector3());
        center = box.getCenter(new THREE.Vector3());
      }

      root.position.x -= center.x;
      root.position.y -= box.min.y;
      root.position.z -= center.z;
      root.updateMatrixWorld(true);

      root.rotation.x = TILT_X;
      root.updateMatrixWorld(true);
      box = wallBox(root);
      center = box.getCenter(new THREE.Vector3());
      root.position.x -= center.x;
      root.position.y -= box.min.y;
      root.position.z -= center.z;
      root.updateMatrixWorld(true);
    };

    Promise.all([
      loadGltf(loader, MODEL_URL, (r) => {
        progress.door = r;
        syncProgress();
      }),
      loadGltf(loader, INTERIOR_URL, (r) => {
        progress.interior = r;
        syncProgress();
      }),
    ])
      .then(([doorGltf, interiorGltf]) => {
        if (disposed) return;

        const doorRoot = doorGltf.scene;
        doorRoot.traverse((obj) => {
          if (FACADE_HIDDEN.test(obj.name)) {
            obj.visible = false;
            return;
          }
          if ((obj as THREE.Light).isLight) obj.visible = false;
        });
        ageWarmMaterials(doorRoot);
        doorRoot.traverse((obj) => {
          if (!(obj as THREE.Mesh).isMesh || !obj.visible) return;
          if (!FACADE_SURFACE.test(obj.name)) return;
          const mesh = obj as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        });
        lanterns = addLanternLights(doorRoot);

        const interiorRoot = interiorGltf.scene;
        prepareInterior(interiorRoot);

        hall = addHallLighting(interiorRoot);
        atmosphere = addHallAtmosphere(interiorRoot, scene, renderer.getPixelRatio());

        const root = new THREE.Group();
        root.add(interiorRoot);
        root.add(doorRoot);
        placeHaveli(root);

        const clip = doorGltf.animations.find((item) => /DoorOpen/i.test(item.name));
        if (clip) {
          doorDuration = clip.duration || 3;
          mixer = new THREE.AnimationMixer(doorRoot);
          const action = mixer.clipAction(clip);
          action.setLoop(THREE.LoopOnce, 0);
          action.clampWhenFinished = true;
          action.play();
          mixer.setTime(0);
        }

        scene.add(root);
        hallEnv = bakeInteriorEnv(renderer, scene, pmrem, root, interiorRoot, outsideLights);
        facade = root;
        baseY = root.position.y;
        baseRotY = root.rotation.y;
        baseRotX = root.rotation.x;
        wallHeight = wallBox(root).getSize(new THREE.Vector3()).y || 1;
        startPose = frameWall(root, mount.clientWidth, mount.clientHeight);
        rig = buildRig(root, startPose);
        applyRig(camera, root, rig, 0);
        ist = getIstLightState();
        placeIstSun(lights.key, lights.shaft, ist.hour, root);

        reportOpeningProgress(1);
      })
      .catch((error) => {
        console.error(error);
        reportOpeningProgress(1);
      });

    const onResize = () => {
      if (!mount || !facade) return;
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      composer.setSize(mount.clientWidth, mount.clientHeight);
      const y = facade.position.y;
      const ry = facade.rotation.y;
      facade.position.y = baseY;
      facade.rotation.x = baseRotX;
      facade.rotation.y = baseRotY;
      camera.aspect = mount.clientWidth / Math.max(mount.clientHeight, 1);
      camera.updateProjectionMatrix();
      const rx = facade.rotation.x;
      facade.rotation.x = baseRotX;
      startPose = frameWall(facade, mount.clientWidth, mount.clientHeight);
      rig = buildRig(facade, startPose);
      facade.rotation.x = rx;
      facade.position.y = y;
      facade.rotation.y = ry;
      wallHeight = wallBox(facade).getSize(new THREE.Vector3()).y || wallHeight;
      if (rig) applyRig(camera, facade, rig, scrollP);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      const y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
      mouse.x = Math.max(-1, Math.min(1, x));
      mouse.y = Math.max(-1, Math.min(1, y));
    };

    const onWheel = (event: WheelEvent) => {
      const delta = event.deltaY * (event.deltaMode === 1 ? 18 : 1);
      const next = THREE.MathUtils.clamp(scrollTarget + delta * SCROLL_SPEED, 0, 1);
      if (next === scrollTarget) return;
      event.preventDefault();
      scrollTarget = next;
    };

    window.addEventListener("resize", onResize);
    mount.addEventListener("pointermove", onPointerMove);
    section.addEventListener("wheel", onWheel, { passive: false });

    const tick = () => {
      if (disposed) return;
      frame = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      mouse.current += (mouse.x - mouse.current) * 0.05;
      mouse.currentY += (mouse.y - mouse.currentY) * 0.05;
      scrollP += (scrollTarget - scrollP) * (reduceMotion ? 1 : 0.085);

      const hold = 1 - smooth(scrollP, 0.02, 0.18);
      // How far we are inside the haveli (outside sun fades, hall lights take over).
      const inside = smooth(scrollP, 0.34, 0.5);
      const outside = 1 - inside;

      if (facade) {
        // Level the model out while flying in, so the hall floor is not tilted.
        facade.rotation.x = baseRotX * (1 - smooth(scrollP, 0.08, 0.34));
        facade.rotation.y = baseRotY + mouse.current * PARALLAX_YAW * hold;
        if (!reduceMotion && hold > 0.001) {
          const floatY =
            Math.sin((t * Math.PI * 2) / LEVITATE_PERIOD) *
            wallHeight *
            LEVITATE_AMP *
            hold;
          facade.position.y = baseY + floatY;
        } else {
          facade.position.y = baseY;
        }
      }

      // Door is fully open before the camera reaches the threshold (s ≈ 0.36).
      const doorAmt = smooth(scrollP, 0.1, 0.33);
      if (mixer) mixer.setTime(doorAmt * doorDuration * 0.999);

      if (facade && rig) {
        applyRig(camera, facade, rig, scrollP);
        // Inside the hall the mouse turns the head: look left/right/up/down
        // around the scripted path (outside, the facade parallax does this).
        if (inside > 0.001) {
          camera.rotateOnWorldAxis(_up, -mouse.current * LOOK_YAW * inside);
          camera.rotateX(-mouse.currentY * LOOK_PITCH * inside);
        }
      }

      // Live IST sample — sun + shadows crawl with real India time.
      ist = getIstLightState();
      placeIstSun(lights.key, lights.shaft, ist.hour, null);
      if (facade && t - shadowFitAt > 2) {
        fitSunShadow(lights.key, facade);
        shadowFitAt = t;
      }

      targetKeyColor.set(ist.keyColor);
      targetShaftColor.set(ist.shaftColor);
      keyColor.lerp(targetKeyColor, 0.04);
      shaftColor.lerp(targetShaftColor, 0.04);
      lights.key.color.copy(keyColor);
      lights.shaft.color.copy(shaftColor);

      // Keep sun aim locked to the facade as it levitates / yaws.
      if (facade) {
        const center = wallBox(facade).getCenter(new THREE.Vector3());
        lights.key.target.position.lerp(center, 0.12);
        lights.key.target.updateMatrixWorld();
      }

      // Soft atmospheric breath on top of IST (clouds passing).
      const breath = 1 + Math.sin(t * 0.11) * 0.045 + Math.sin(t * 0.37) * 0.02;
      lights.ambient.intensity = ist.ambient * breath * (0.5 + 0.5 * outside);
      lights.hemi.intensity = ist.hemi * breath * outside;
      lights.key.intensity = ist.key * breath * outside;
      lights.key.castShadow = outside > 0.02;
      lights.shaft.intensity = ist.shaft * (1 + Math.sin(t * 0.09) * 0.06) * outside;
      lights.saffron.intensity = ist.saffron * breath * outside;
      lights.rim.intensity = ist.rim * outside;
      if (hall) hall.update(t);
      if (lanterns) lanterns.update(t);
      if (atmosphere) atmosphere.update(t, inside);
      renderer.toneMappingExposure = THREE.MathUtils.lerp(
        renderer.toneMappingExposure,
        THREE.MathUtils.lerp(ist.exposure, 1.0, inside),
        0.05,
      );
      (scene.background as THREE.Color).set(WALL).multiplyScalar(0.2 + 0.8 * outside);

      const section = mount.parentElement as HTMLElement | null;
      if (section) {
        section.style.setProperty("--hero-ray", String(ist.rayStrength));
        section.style.setProperty("--hero-dust", String(ist.dustGain));
        const grade = section.querySelector("[data-hero-grade]") as HTMLElement | null;
        if (grade) grade.style.opacity = String(ist.gradeOpacity);
      }

      bloom.strength = 0.55 * inside;
      bloom.enabled = inside > 0.01;
      composer.render();
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      mixer?.stopAllAction();
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("pointermove", onPointerMove);
      section.removeEventListener("wheel", onWheel);
      dracoLoader.dispose();
      composer.dispose();
      hallEnv?.dispose();
      pmrem.dispose();
      env.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          for (const mat of mats) mat?.dispose?.();
        }
      });
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-grain-root relative h-[100svh] w-full overflow-hidden bg-[#d8c4a0]"
    >
      <div ref={mountRef} className="absolute inset-0 z-0" />

      <div
        data-hero-grade
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-[2000ms]"
        style={{
          background: `
            linear-gradient(180deg, rgba(40, 22, 10, 0.12) 0%, rgba(40, 18, 8, 0.3) 100%)
          `,
          mixBlendMode: "multiply",
        }}
        aria-hidden="true"
      />

      <LightRays />
      <WarmDust />

      <div className="hero-warm-grain" aria-hidden="true" />
      <div className="hero-warm-grain hero-warm-grain--fine" aria-hidden="true" />

      <div
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(22, 10, 4, 0.5) 100%)",
        }}
        aria-hidden="true"
      />
    </section>
  );
}
