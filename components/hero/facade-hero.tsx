"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { LightRays } from "@/components/hero/light-rays";
import { WarmDust } from "@/components/hero/warm-dust";
import { getIstLightState } from "@/lib/ist-light";

const MODEL_URL = "/3d%20model/facade_web_8k.glb";
const DRACO_PATH = "/draco/";
const WALL = "#d8c4a0";

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
    if (!/Facade_Atlas|Facade_Metal/i.test(obj.name)) return;
    box.union(new THREE.Box3().setFromObject(obj));
    found = true;
  });
  if (!found) box.setFromObject(root);
  return box;
}

function frameWall(
  camera: THREE.OrthographicCamera,
  root: THREE.Object3D,
  viewW: number,
  viewH: number,
) {
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
  const frameAspect = frameW / Math.max(frameH, 1e-6);

  // Cover the crop so it fills the screen like image 2.
  let viewHeight: number;
  let viewWidth: number;
  if (frameAspect > aspect) {
    viewHeight = frameH;
    viewWidth = viewHeight * aspect;
  } else {
    viewWidth = frameW;
    viewHeight = viewWidth / aspect;
  }

  camera.left = -viewWidth / 2;
  camera.right = viewWidth / 2;
  camera.top = viewHeight / 2;
  camera.bottom = -viewHeight / 2;
  camera.near = 0.1;
  camera.far = 200;
  camera.position.set(cx, cy, midZ + 20);
  camera.up.set(0, 1, 0);
  camera.lookAt(cx, cy, midZ);
  camera.updateProjectionMatrix();
}

const AGE_SHADOW = new THREE.Color("#6a4020");
const AGE_BRONZE = new THREE.Color("#8a5428");

/** Darker, richer facade — saturate + deepen without emissive glow. */
function ageWarmMaterials(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (!(obj as THREE.Mesh).isMesh || !obj.visible) return;
    const mesh = obj as THREE.Mesh;
    const isMetal = /Facade_Metal/i.test(mesh.name);
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : [mesh.material];

    for (const mat of materials) {
      const std = mat as THREE.MeshStandardMaterial;
      if (!std || !("color" in std)) continue;

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

function reportOpeningProgress(value: number) {
  window.__kesariPendingProgress = value;
  window.__kesariSetProgress?.(value);
}

export function FacadeHero() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    reportOpeningProgress(0.04);

    let frame = 0;
    let disposed = false;
    let facade: THREE.Object3D | null = null;
    let wallHeight = 1;
    let baseY = 0;
    let baseRotY = 0;
    let baseRotX = 0;

    const mouse = { x: 0, current: 0 };
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

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.06).texture;
    scene.environment = env;

    const lights = addWarmLighting(scene);
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
    loader.load(
      MODEL_URL,
      (gltf) => {
        if (disposed) return;
        const root = gltf.scene;

        root.traverse((obj) => {
          if (/Facade_Ground|Facade_Props/i.test(obj.name)) {
            obj.visible = false;
            return;
          }
          if ((obj as THREE.Light).isLight) {
            obj.visible = false;
          }
        });

        ageWarmMaterials(root);

        root.traverse((obj) => {
          if (!(obj as THREE.Mesh).isMesh || !obj.visible) return;
          if (!/Facade_Atlas|Facade_Metal/i.test(obj.name)) return;
          const mesh = obj as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        });

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

        // 3D style: tip top toward the camera / slightly downward.
        root.rotation.x = TILT_X;
        root.updateMatrixWorld(true);
        box = wallBox(root);
        center = box.getCenter(new THREE.Vector3());
        root.position.x -= center.x;
        root.position.y -= box.min.y;
        root.position.z -= center.z;
        root.updateMatrixWorld(true);

        scene.add(root);
        facade = root;
        baseY = root.position.y;
        baseRotY = root.rotation.y;
        baseRotX = root.rotation.x;
        wallHeight = wallBox(root).getSize(new THREE.Vector3()).y || 1;
        frameWall(camera, root, mount.clientWidth, mount.clientHeight);
        ist = getIstLightState();
        placeIstSun(lights.key, lights.shaft, ist.hour, root);
        reportOpeningProgress(1);
      },
      (event) => {
        if (!event.total) {
          reportOpeningProgress(0.12);
          return;
        }
        // Hold a little under 1 until the scene is fully framed.
        reportOpeningProgress(Math.min(0.96, 0.08 + (event.loaded / event.total) * 0.88));
      },
      (error) => {
        console.error(error);
        reportOpeningProgress(1);
      },
    );

    const onResize = () => {
      if (!mount || !facade) return;
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      // Freeze motion pose while reframing so cover math stays correct.
      const y = facade.position.y;
      const ry = facade.rotation.y;
      facade.position.y = baseY;
      facade.rotation.x = baseRotX;
      facade.rotation.y = baseRotY;
      frameWall(camera, facade, mount.clientWidth, mount.clientHeight);
      facade.position.y = y;
      facade.rotation.y = ry;
      wallHeight = wallBox(facade).getSize(new THREE.Vector3()).y || wallHeight;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
      mouse.x = Math.max(-1, Math.min(1, x));
    };

    window.addEventListener("resize", onResize);
    mount.addEventListener("pointermove", onPointerMove);

    const tick = () => {
      if (disposed) return;
      frame = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      mouse.current += (mouse.x - mouse.current) * 0.04;

      if (facade) {
        facade.rotation.x = baseRotX;
        if (!reduceMotion) {
          // Left / right only — subtle yaw from mouse.
          facade.rotation.y = baseRotY + mouse.current * PARALLAX_YAW;
          // Slowest levitation.
          const floatY =
            Math.sin((t * Math.PI * 2) / LEVITATE_PERIOD) *
            wallHeight *
            LEVITATE_AMP;
          facade.position.y = baseY + floatY;
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
      lights.ambient.intensity = ist.ambient * breath;
      lights.hemi.intensity = ist.hemi * breath;
      lights.key.intensity = ist.key * breath;
      lights.shaft.intensity = ist.shaft * (1 + Math.sin(t * 0.09) * 0.06);
      lights.saffron.intensity = ist.saffron * breath;
      lights.rim.intensity = ist.rim;
      renderer.toneMappingExposure = THREE.MathUtils.lerp(
        renderer.toneMappingExposure,
        ist.exposure,
        0.03,
      );

      const section = mount.parentElement as HTMLElement | null;
      if (section) {
        section.style.setProperty("--hero-ray", String(ist.rayStrength));
        section.style.setProperty("--hero-dust", String(ist.dustGain));
        const grade = section.querySelector("[data-hero-grade]") as HTMLElement | null;
        if (grade) grade.style.opacity = String(ist.gradeOpacity);
      }

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("pointermove", onPointerMove);
      dracoLoader.dispose();
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
    <section className="hero-grain-root relative h-[100svh] w-full overflow-hidden bg-[#d8c4a0]">
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
