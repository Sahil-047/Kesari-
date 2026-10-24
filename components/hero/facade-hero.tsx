"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { daylight, outdoorEnvironment, trueFacadeMaterials } from "@/components/hero/facade-daylight";
import { addHallAtmosphere } from "@/components/hero/hall-atmosphere";
import { createHallAudio } from "@/components/hero/hall-audio";
import { addClothWind, gust } from "@/components/hero/hall-wind";
import { dressO3 } from "@/components/hero/o3-sherwani";
import { studyInteriorMaterial } from "@/components/hero/hall-materials";
import { loadHallTextures, type HallTextures, type PbrSet } from "@/components/hero/hall-textures";
import { createHallPost } from "@/components/hero/hall-post";
import { LightRays } from "@/components/hero/light-rays";
import { WarmDust } from "@/components/hero/warm-dust";
import { getIstLightState } from "@/lib/ist-light";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

/** Where the fountain is heard from (interior model frame, mid-height of the tiers). */
const FOUNTAIN_SOUND = new THREE.Vector3(0, 2.8, -11);

const MODEL_URL = "/3d%20model/haveli_facade_door.glb";
const INTERIOR_URL = "/3d%20model/haveli_interior.glb";
/** Rebuilt top-right lehenga (O4), modelled to the reference photos; same frame as the interior. */
const LEHENGA_O4_URL = "/3d%20model/lehenga_o4.glb";
/** Old O4 garment meshes in the interior GLB, replaced by LEHENGA_O4_URL (mannequin stays). */
const O4_REPLACED = /^W_O4_(Skirt|Blouse|Sleeve[LR]|Dupatta|Waistband)$/;
const DRACO_PATH = "/draco/";
const WALL = "#d8c4a0";

/** Frame from the wall only so crop/proportions match the previous facade. */
const FACADE_WALL = /Facade_Atlas|Facade_Metal/i;
/** Wall plus carved door leaves, brass, props and the jhumka lanterns. */
const FACADE_SURFACE = /Facade_Atlas|Facade_Metal|Facade_Props|Door_|Lantern_(L|R)(_Bracket)?$/i;
const FACADE_HIDDEN = /Facade_Ground/i;
/** Blender's jhumka / chandelier bulb colour (1, 0.72, 0.42). */
const LAMP_COLOR = "#ffb86b";

/** Max yaw from mouse (radians) — slight left/right turn toward the cursor. */
const PARALLAX_YAW = 0.045;
/** Max pitch from mouse (radians) — slight up/down tilt toward the cursor. */
const PARALLAX_PITCH = 0.03;
/** Resting pitch: 0 = the door faces the screen square-on. */
const TILT_X = 0;
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
  // Keep these `s` values in sync with OUTFITS (the follow-spot uses them).
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
  onProgress: (loaded: number, total: number) => void,
) {
  return new Promise<GLTF>((resolve, reject) => {
    loader.load(url, resolve, (event) => onProgress(event.loaded, event.total), reject);
  });
}

/** Byte sizes of the models (scripts/model-manifest.mjs), for real progress when
 * the server streams them gzip-compressed without a Content-Length. */
const MANIFEST_URL = "/3d%20model/manifest.json";
/** Rough fallback sizes if the manifest is missing (bytes). */
const FALLBACK_BYTES: Record<string, number> = {
  "haveli_facade_door.glb": 12_000_000,
  "haveli_interior.glb": 20_000_000,
  "lehenga_o4.glb": 5_000_000,
};

/**
 * Full anisotropic filtering on every texture in the scene: carving, wood
 * grain, marble and fabric stay sharp at grazing angles instead of smearing
 * into the blurry low mip levels (glTF textures load with anisotropy 1).
 */
function sharpenTextures(root: THREE.Object3D, renderer: THREE.WebGLRenderer) {
  const max = renderer.capabilities.getMaxAnisotropy();
  const seen = new Set<THREE.Texture>();
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      for (const value of Object.values(mat)) {
        const tex = value as THREE.Texture | null;
        if (!tex || !(tex as THREE.Texture).isTexture || seen.has(tex)) continue;
        seen.add(tex);
        if (tex.anisotropy < max) {
          tex.anisotropy = max;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.needsUpdate = true;
        }
      }
    }
  });
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

/**
 * Interior meshes that throw shadows (window sun + main chandelier).
 * Not Int_Columns: it holds the window mullions, a few cm thin, standing right
 * in the sunlight. Their shadow is already in the window light's glass
 * pattern (cookie); cast again through the shadow map at that low sun angle
 * each bar became a hard, aliased, dashed line across the whole hall floor.
 */
const INT_CASTERS =
  /^W_O\d_|^O4R_(Skirt|Blouse|Sleeve|Latkans|BeadCurtain)|Fountain|Elephant|Altar|ProductPed|ProductItem|Frame_|Basin_Rim/i;
const INT_RECEIVERS =
  /Floor|Dado|Wall|Carpet|Lobby|Basin|Fountain|ProductPed|ProductItem|Int_Columns|Dome|Ceiling|Cornice|Elephant|Altar|^W_O\d_|^O4R_|Painting|Frame_|Window/i;

/**
 * UV transform that shows an image upright on a flat wall mesh, whatever its
 * UV layout: the mesh's UV axes are related to world "right" (as seen facing
 * the wall) and world up via the first non-degenerate triangle, then the UV
 * bounds are mapped to the image's 0..1 (flipY=false: t = 0 is the top row).
 */
function uprightUvTransform(mesh: THREE.Mesh) {
  const g = mesh.geometry;
  const uv = g.attributes.uv, pos = g.attributes.position, nrm = g.attributes.normal;
  if (!uv || !pos) return null;
  mesh.updateWorldMatrix(true, false);
  const P = (i: number) => new THREE.Vector3().fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld);
  const idx = g.index;
  const tri = (k: number) => (idx ? idx.getX(k) : k);
  const triCount = (idx ? idx.count : pos.count) / 3;
  const dPdu = new THREE.Vector3(), dPdv = new THREE.Vector3();
  let found = false;
  for (let t = 0; t < triCount && !found; t++) {
    const [a, b, c] = [tri(3 * t), tri(3 * t + 1), tri(3 * t + 2)];
    const e1 = P(b).sub(P(a)), e2 = P(c).sub(P(a));
    const du1 = uv.getX(b) - uv.getX(a), dv1 = uv.getY(b) - uv.getY(a);
    const du2 = uv.getX(c) - uv.getX(a), dv2 = uv.getY(c) - uv.getY(a);
    const det = du1 * dv2 - du2 * dv1;
    if (Math.abs(det) < 1e-9) continue;
    dPdu.copy(e1).multiplyScalar(dv2).addScaledVector(e2, -dv1).divideScalar(det);
    dPdv.copy(e2).multiplyScalar(du1).addScaledVector(e1, -du2).divideScalar(det);
    found = true;
  }
  if (!found) return null;
  const n = nrm
    ? new THREE.Vector3().fromBufferAttribute(nrm, 0).transformDirection(mesh.matrixWorld)
    : dPdu.clone().cross(dPdv).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const right = up.clone().cross(n).normalize();
  const [a, b, d, e] = [right.dot(dPdu), right.dot(dPdv), up.dot(dPdu), up.dot(dPdv)];
  let r0 = Infinity, r1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i < uv.count; i++) {
    const r = a * uv.getX(i) + b * uv.getY(i), y = d * uv.getX(i) + e * uv.getY(i);
    r0 = Math.min(r0, r); r1 = Math.max(r1, r);
    y0 = Math.min(y0, y); y1 = Math.max(y1, y);
  }
  const rw = r1 - r0 || 1, yh = y1 - y0 || 1;
  return new THREE.Matrix3().set(a / rw, b / rw, -r0 / rw, -d / yh, -e / yh, y1 / yh, 0, 0, 1);
}

function fitUpright(tex: THREE.Texture, mesh: THREE.Mesh) {
  const m = uprightUvTransform(mesh);
  const t = tex.clone();
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  if (m) {
    t.matrixAutoUpdate = false;
    t.matrix.copy(m);
  }
  t.needsUpdate = true;
  return t;
}

/** Each painting gets its own Pichwai, fitted upright to its frame. */
function hangPainting(mesh: THREE.Mesh, material: THREE.Material, tex: HallTextures, index: number) {
  const m = (material as THREE.MeshPhysicalMaterial).clone();
  m.map = fitUpright(tex.pichwai[index % tex.pichwai.length], mesh);
  m.color.set("#ffffff");
  m.needsUpdate = true;
  return m;
}

/**
 * The wall niches (W_ProductSlot_L01..) carry the Kesari photos in carved
 * giltwood frames: burnished gold relief, maroon velvet mat, satin print.
 */
function hangFramedPhoto(mesh: THREE.Mesh, set: PbrSet) {
  const fit = (t: THREE.Texture) => fitUpright(t, mesh);
  return new THREE.MeshPhysicalMaterial({
    map: fit(set.map),
    roughnessMap: fit(set.orm),
    metalnessMap: fit(set.orm),
    roughness: 1,
    metalness: 1,
    normalMap: fit(set.normal),
    normalScale: new THREE.Vector2(1.4, 1.4),
    clearcoat: 0.25,
    clearcoatRoughness: 0.35,
    envMapIntensity: 1.1,
  });
}

function prepareInterior(root: THREE.Object3D, tex?: HallTextures) {
  const studied = new Map<THREE.Material, THREE.Material>();
  let paintings = 0;
  const framed = /^W_ProductSlot_L0(\d)$/;
  const study = (mat: THREE.Material) => {
    if (!studied.has(mat)) {
      const std = mat as THREE.MeshStandardMaterial;
      studied.set(mat, "envMapIntensity" in std ? studyInteriorMaterial(std, tex) : mat);
    }
    return studied.get(mat)!;
  };
  root.traverse((obj) => {
    if ((obj as THREE.Light).isLight) {
      obj.visible = false;
      return;
    }
    if (!(obj as THREE.Mesh).isMesh) return;
    const mesh = obj as THREE.Mesh;
    mesh.receiveShadow = INT_RECEIVERS.test(mesh.name);
    mesh.castShadow = INT_CASTERS.test(mesh.name);
    mesh.material = Array.isArray(mesh.material)
      ? mesh.material.map(study)
      : study(mesh.material);
    if (tex && /^W_Painting_/.test(mesh.name) && !Array.isArray(mesh.material)) {
      mesh.material = hangPainting(mesh, mesh.material, tex, paintings++);
    }
    const slot = tex && framed.exec(mesh.name);
    if (tex && slot && +slot[1] <= tex.frames.length) {
      mesh.material = hangFramedPhoto(mesh, tex.frames[+slot[1] - 1]);
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
  key.shadow.radius = 1.5;   // crisp sun edge, still not razor-hard
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
/** Place the sun on its real IST path (see facade-daylight), aimed at its target. */
function placeIstSun(
  key: THREE.DirectionalLight,
  shaft: THREE.DirectionalLight,
  hour: number,
  root?: THREE.Object3D | null,
) {
  const d = daylight(hour);
  key.position.copy(key.target.position).addScaledVector(d.sunDir, 18);
  shaft.position.copy(key.position);
  if (root) fitSunShadow(key, root);
}

function centerOf(obj: THREE.Object3D) {
  return new THREE.Box3().setFromObject(obj).getCenter(new THREE.Vector3());
}

/** Outfit row in the model frame, and the scroll stop that frames each (see FLIGHT). */
/** `light`: key/rim/follow scale — metered per garment, like a photographer
 * would: the ivory sherwani (O3) needs far less light than the deep lehengas,
 * or its embroidery burns out to flat white. */
const OUTFITS = [
  { x: -4.2, s: 0.6, light: 1 },
  { x: -1.45, s: 0.67, light: 1 },
  { x: 1.4, s: 0.74, light: 0.42 },
  { x: 4.2, s: 0.81, light: 1 },
];
const OUTFIT_Z = -7.4;
const OUTFIT_Y = 1.8;

/**
 * Cinematic hall rig built on the Blender "Interior" lights:
 * - chandeliers (160 / 90 / 90 W) that sway gently, the main one casting
 *   soft shadows so pools and silhouettes move a little, like real lamps;
 * - lobby jhumkas, low warm fills and a very low sky bounce for deep contrast;
 * - per outfit a warm key from the front and a cool rim from behind (teal vs
 *   amber separation), plus a follow-spot that travels from outfit to outfit
 *   with the camera while the others dim — the product always owns the frame.
 */
function addHallLighting(interiorRoot: THREE.Object3D) {
  interiorRoot.updateMatrixWorld(true);
  const group = new THREE.Group();
  group.add(new THREE.HemisphereLight("#ffe2b4", "#1c0f07", 0.12));

  type Lamp = { light: THREE.PointLight; base: number; home: THREE.Vector3; sway: number };
  const lamps: Lamp[] = [];
  const addLamp = (
    obj: THREE.Object3D | undefined,
    power: number,
    drop: number,
    range: number,
    sway: number,
  ) => {
    if (!obj) return null;
    const c = centerOf(obj);
    const light = new THREE.PointLight(LAMP_COLOR, power, range, 2);
    const home = new THREE.Vector3(c.x, c.y - drop, c.z);
    light.position.copy(home);
    group.add(light);
    lamps.push({ light, base: power, home, sway });
    return light;
  };

  const main = addLamp(interiorRoot.getObjectByName("W_Chand_Main_Bulbs"), 74, 0.2, 0, 0.07);
  addLamp(interiorRoot.getObjectByName("W_Chand_N_Bulbs"), 40, 0.2, 0, 0.06);
  addLamp(interiorRoot.getObjectByName("W_Chand_S_Bulbs"), 40, 0.2, 0, 0.06);
  for (let i = 0; i < 4; i++) {
    addLamp(interiorRoot.getObjectByName(`W_Jhumka_Lobby_${i}_Glow`), 9, 0, 7, 0.02);
  }
  if (main) {
    main.castShadow = true;
    main.shadow.mapSize.set(1024, 1024);
    main.shadow.bias = -0.004;
    main.shadow.normalBias = 0.04;
    main.shadow.radius = 6;
    main.shadow.camera.near = 0.3;
    main.shadow.camera.far = 26;
  }

  // Fill_S / Fill_N: kept low so the lamps and sun carve the room.
  for (const z of [-6.8, -15.2]) {
    const fill = new THREE.PointLight("#ffd199", 3, 0, 2);
    fill.position.set(0, 6.6, z);
    group.add(fill);
  }

  const keys: THREE.SpotLight[] = [];
  const rims: THREE.SpotLight[] = [];
  for (const { x } of OUTFITS) {
    // Warm key from the front. Shadows come from the window sun (they fall
    // toward the door, as in Blender), so the key stays shadowless.
    const key = new THREE.SpotLight("#ffe4ce", 34, 12, 0.42, 0.75, 1.6);
    key.position.set(x, 5.4, -4.4);
    key.target.position.set(x, 1.6, OUTFIT_Z);
    group.add(key, key.target);
    keys.push(key);

    // Cool rim from behind and above: outlines the silhouette against the hall.
    const rim = new THREE.SpotLight("#e4eaff", 20, 9, 0.5, 0.9, 1.5);
    rim.position.set(x * 1.05, 4.9, -9.8);
    rim.target.position.set(x, OUTFIT_Y, OUTFIT_Z);
    group.add(rim, rim.target);
    rims.push(rim);
  }

  // Follow-spot: tight warm beam from high front that travels with the camera.
  const follow = new THREE.SpotLight("#ffecdf", 0, 16, 0.2, 0.55, 1.3);
  follow.position.set(0, 6.8, -3.6);
  follow.target.position.set(0, OUTFIT_Y, OUTFIT_Z);
  group.add(follow, follow.target);
  const followAim = new THREE.Vector3(0, OUTFIT_Y, OUTFIT_Z);

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

  // Picture lights: each niche's upper brass bar washes its framed photo from
  // above — tight warm cone grazing down the gilt, falling off toward the hem.
  for (let i = 1; i <= 6; i++) {
    const bar = interiorRoot.getObjectByName(`W_ProductLampU_L0${i}`);
    const slot = interiorRoot.getObjectByName(`W_ProductSlot_L0${i}`);
    if (!bar || !slot) continue;
    const b = centerOf(bar);
    const p = centerOf(slot);
    const wash = new THREE.SpotLight("#ffd9a8", 9, 3.2, 0.62, 0.85, 2);
    wash.position.set(b.x + 0.06, b.y - 0.05, b.z);
    wash.target.position.set(p.x, p.y - 0.35, p.z);
    group.add(wash, wash.target);
  }
  interiorRoot.add(group);

  const weights = OUTFITS.map(() => 0);

  return {
    /** `s` is the scroll progress, used to know which outfit is in frame. */
    update(t: number, s: number) {
      lamps.forEach(({ light, base, home, sway }, i) => {
        // Candle-like breathing with the odd slow dip.
        const breathe =
          1 +
          Math.sin(t * 7.3 + i * 2.1) * 0.02 +
          Math.sin(t * 3.1 + i) * 0.03 -
          Math.max(0, Math.sin(t * 0.37 + i * 1.7)) ** 12 * 0.12;
        light.intensity = base * breathe;
        // Chandeliers sway on their chains; shadows drift with them.
        light.position.set(
          home.x + Math.sin(t * 0.52 + i) * sway,
          home.y,
          home.z + Math.cos(t * 0.41 + i * 1.3) * sway,
        );
      });

      let any = 0;
      let sum = 0;
      let aimX = 0;
      let meter = 0;
      OUTFITS.forEach((o, i) => {
        const w = 1 - THREE.MathUtils.smoothstep(Math.abs(s - o.s), 0.0, 0.05);
        weights[i] = w;
        any = Math.max(any, w);
        sum += w;
        aimX += o.x * w;
        meter += o.light * w;
      });
      OUTFITS.forEach((_, i) => {
        const w = weights[i];
        const k = OUTFITS[i].light;
        keys[i].intensity = 34 * k * (0.45 + 0.55 * (1 - any) + 1.1 * w);
        rims[i].intensity = 20 * Math.sqrt(k) * (0.55 + 1.5 * w);
      });
      if (sum > 1e-3) followAim.set(aimX / sum, OUTFIT_Y, OUTFIT_Z);
      follow.target.position.lerp(followAim, 0.08);
      follow.position.x = THREE.MathUtils.lerp(follow.position.x, follow.target.position.x * 0.6, 0.05);
      follow.intensity = 130 * any * (sum > 1e-3 ? meter / sum : 1);
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
    update(t: number, night = 0) {
      // oil-lamp glow carries the facade at dusk / night
      lights.forEach((l, i) => {
        l.intensity = l.userData.base * (1 + 3 * night) * (1 + Math.sin(t * 6.1 + i * 1.7) * 0.03);
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
  const audioRef = useRef<ReturnType<typeof createHallAudio> | null>(null);
  const [soundOn, setSoundOn] = useState(false);

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
    let cloth: ReturnType<typeof addClothWind> | null = null;
    let interior: THREE.Object3D | null = null;
    let windPhase = 0;
    let lastT = 0;
    const audio = createHallAudio();
    audioRef.current = audio;
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
    const env = outdoorEnvironment(pmrem);
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
    // The composer renders off-screen, where the canvas `antialias` flag does
    // nothing — give its targets 4× MSAA so edges and fine carving stay clean.
    const composer = new EffectComposer(
      renderer,
      new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }),
    );
    composer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(mount.clientWidth, mount.clientHeight);
    composer.addPass(new RenderPass(scene, camera));
    const hallPost = createHallPost(scene, camera, mount.clientWidth, mount.clientHeight);
    hallPost.addTo(composer, "ao");
    hallPost.addTo(composer, "sanitize");
    hallPost.addTo(composer, "rays");
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(mount.clientWidth, mount.clientHeight),
      0,
      0.45,
      // HDR threshold: only lamp bulbs / glass pass, not lamplit marble.
      7,
    );
    bloom.enabled = false;
    composer.addPass(bloom);
    hallPost.addTo(composer, "output");
    hallPost.addTo(composer, "grade");
    let hallEnv: THREE.Texture | null = null;
    const clock = new THREE.Clock();
    let ist = getIstLightState();
    let shadowFitAt = 0;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(DRACO_PATH);
    dracoLoader.setDecoderConfig({ type: "wasm" });

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    // Loading budget: downloads fill 4% → 80% by bytes across all models;
    // the rest is real work after download (setup, shader compile, reflection
    // bake, first frames), so the bar never sits still and never jumps.
    const DOWNLOAD_END = 0.8;
    const files = [MODEL_URL, INTERIOR_URL, LEHENGA_O4_URL].map((url) => {
      const name = decodeURIComponent(url.split("/").pop() ?? "");
      return { url, name, loaded: 0, total: FALLBACK_BYTES[name] ?? 8_000_000 };
    });
    // realistic hall texture sets (public/textures/hall), ≈ 9.5 MB in 23 files
    const TEXTURE_BYTES = 13_700_000;
    files.push({ url: "/textures/hall/", name: "hall-textures", loaded: 0, total: TEXTURE_BYTES });
    let downloadShown = 0;
    const syncProgress = () => {
      const loaded = files.reduce((n, f) => n + Math.min(f.loaded, f.total), 0);
      const total = files.reduce((n, f) => n + f.total, 0);
      // monotonic, never reaches the end of the download band before onLoad
      downloadShown = Math.max(downloadShown, Math.min(loaded / total, 0.99));
      reportOpeningProgress(0.04 + (DOWNLOAD_END - 0.04) * downloadShown);
    };
    const track = (i: number) => (loaded: number, total: number) => {
      files[i].loaded = loaded;
      if (total > 0) files[i].total = total;   // trust Content-Length when present
      syncProgress();
    };
    fetch(MANIFEST_URL)
      .then((r) => (r.ok ? r.json() : {}))
      .then((sizes: Record<string, number>) => {
        for (const f of files) if (sizes[f.name]) f.total = sizes[f.name];
        syncProgress();
      })
      .catch(() => {});

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
      loadGltf(loader, MODEL_URL, track(0)),
      loadGltf(loader, INTERIOR_URL, track(1)),
      // Optional: if it fails, the interior's original O4 outfit stays visible.
      loadGltf(loader, LEHENGA_O4_URL, track(2)).catch((error) => {
        console.warn("lehenga_o4.glb not loaded; keeping the original outfit", error);
        return null;
      }),
      // Optional: without them the hall falls back to the exported swatches.
      loadHallTextures((done, total) => track(3)((done / total) * TEXTURE_BYTES, TEXTURE_BYTES)).catch(
        (error) => {
          console.warn("hall textures not loaded; using exported materials", error);
          return undefined;
        },
      ),
    ])
      .then(async ([doorGltf, interiorGltf, lehengaGltf, hallTextures]) => {
        if (disposed) return;
        reportOpeningProgress(0.82);
        await nextFrame();
        if (disposed) return;

        const doorRoot = doorGltf.scene;
        doorRoot.traverse((obj) => {
          if (FACADE_HIDDEN.test(obj.name)) {
            obj.visible = false;
            return;
          }
          if ((obj as THREE.Light).isLight) obj.visible = false;
        });
        trueFacadeMaterials(doorRoot);
        doorRoot.traverse((obj) => {
          if (!(obj as THREE.Mesh).isMesh || !obj.visible) return;
          if (!FACADE_SURFACE.test(obj.name)) return;
          const mesh = obj as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        });
        lanterns = addLanternLights(doorRoot);

        const interiorRoot = interiorGltf.scene;
        if (lehengaGltf) {
          interiorRoot.traverse((obj) => {
            if (O4_REPLACED.test(obj.name)) obj.visible = false;
          });
          interiorRoot.add(lehengaGltf.scene);
        }
        prepareInterior(interiorRoot, hallTextures);
        if (hallTextures) dressO3(interiorRoot, hallTextures.o3);

        hall = addHallLighting(interiorRoot);
        atmosphere = addHallAtmosphere(interiorRoot, scene, hallTextures);
        cloth = addClothWind(interiorRoot);
        interior = interiorRoot;

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
        sharpenTextures(root, renderer);
        reportOpeningProgress(0.86);
        // Compile every shader now (in parallel where supported) instead of
        // hitching on the first frames after the loader has closed.
        try {
          await renderer.compileAsync(scene, camera);
        } catch {
          renderer.compile(scene, camera);
        }
        if (disposed) return;
        reportOpeningProgress(0.93);
        await nextFrame();
        if (disposed) return;
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

        reportOpeningProgress(0.97);
        // a couple of real frames on screen (textures uploaded) before reveal
        await nextFrame();
        await nextFrame();
        if (disposed) return;
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
      event.preventDefault();
      const delta = event.deltaY * (event.deltaMode === 1 ? 18 : 1);
      scrollTarget = THREE.MathUtils.clamp(scrollTarget + delta * SCROLL_SPEED, 0, 1);
    };

    // Browsers allow sound only after a gesture: the first click / tap / key starts it.
    const onGesture = () => {
      if (audio.muted) return;
      audio.unlock();
      setSoundOn(true);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
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
        facade.rotation.x =
          baseRotX * (1 - smooth(scrollP, 0.08, 0.34)) + mouse.currentY * PARALLAX_PITCH * hold;
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

      // Physical daylight: one sun (blackbody colour by elevation) + skylight.
      const sky = daylight(ist.hour);
      lights.key.color.lerp(sky.sunColor, 0.04);
      lights.hemi.color.lerp(sky.skyColor, 0.04);
      lights.hemi.groundColor.lerp(sky.groundColor, 0.04);

      // Keep sun aim locked to the facade as it levitates / yaws.
      if (facade) {
        const center = wallBox(facade).getCenter(new THREE.Vector3());
        lights.key.target.position.lerp(center, 0.12);
        lights.key.target.updateMatrixWorld();
        lights.key.position.copy(lights.key.target.position).addScaledVector(sky.sunDir, 18);
      }

      // Thin high cloud drifting across the sun now and then.
      const breath = 1 + Math.sin(t * 0.11) * 0.03 + Math.sin(t * 0.37) * 0.015;
      lights.ambient.intensity = 0;
      lights.hemi.intensity = sky.skyIntensity * outside;
      lights.key.intensity = sky.sunIntensity * breath * outside;
      lights.key.castShadow = outside > 0.02 && sky.sunIntensity > 0.01;
      // the old stylised fills (second sun, orange "saffron", brown rim) are retired
      lights.shaft.intensity = 0;
      lights.saffron.intensity = 0;
      lights.rim.intensity = 0;
      // The breeze: gusts accumulate into a phase so motion never jumps.
      const g = gust(t);
      windPhase += Math.min(t - lastT, 0.1) * g;
      lastT = t;
      if (cloth) cloth.update(t, windPhase);
      if (interior) audio.update(camera, interior, FOUNTAIN_SOUND, inside, g);
      if (hall) hall.update(t, scrollP);
      if (lanterns) lanterns.update(t, sky.night);
      if (atmosphere) {
        atmosphere.update(t, inside, camera, renderer.domElement.height);
        hallPost.updateRays(camera, atmosphere.rayTargets(), inside);
      }
      renderer.toneMappingExposure = THREE.MathUtils.lerp(
        renderer.toneMappingExposure,
        THREE.MathUtils.lerp(sky.exposure * 0.82, 0.86, inside),
        0.05,
      );
      (scene.background as THREE.Color).set(WALL).multiplyScalar(0.2 + 0.8 * outside);

      const section = mount.parentElement as HTMLElement | null;
      if (section) {
        // Warm film overlays suit the facade; inside they would tint the
        // outfits, so they fade out for true product colour.
        // Photo-real look: no CSS god-rays / dust / sepia over the facade.
        section.style.setProperty("--hero-ray", "0");
        section.style.setProperty("--hero-dust", "0");
        section.style.setProperty("--hero-inside", inside.toFixed(3));
        const grade = section.querySelector("[data-hero-grade]") as HTMLElement | null;
        if (grade) grade.style.opacity = "0";
      }

      bloom.strength = 0.7 * inside;
      hallPost.update(inside, renderer.toneMappingExposure);
      bloom.enabled = inside > 0.01;
      composer.render();
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      mixer?.stopAllAction();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      audio.dispose();
      audioRef.current = null;
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
            "radial-gradient(ellipse at center, transparent 55%, rgba(0, 0, 0, 0.28) 100%)",
        }}
        aria-hidden="true"
      />

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          const audio = audioRef.current;
          if (!audio) return;
          const next = !soundOn;
          audio.setMuted(!next);
          if (next) audio.unlock();
          setSoundOn(next);
        }}
        onPointerDown={(event) => event.stopPropagation()}
        aria-pressed={soundOn}
        aria-label={soundOn ? "Mute ambient sound" : "Play ambient sound"}
        className="absolute bottom-5 right-5 z-[10] flex h-10 w-10 items-center justify-center rounded-full border border-[#f3dfb8]/40 bg-black/25 text-[#f3dfb8] backdrop-blur-sm transition hover:bg-black/40"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 9v6h4l5 4V5L8 9H4z" />
          {soundOn ? (
            <>
              <path d="M16.5 8.5a5 5 0 0 1 0 7" />
              <path d="M19 6a8.5 8.5 0 0 1 0 12" />
            </>
          ) : (
            <path d="M17 9l5 6M22 9l-5 6" />
          )}
        </svg>
      </button>
    </section>
  );
}
