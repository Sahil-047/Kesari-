"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const INTERIOR_URL = "/3d%20model/haveli_interior.glb";
const DRACO_PATH = "/draco/";

export function InteriorLook() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let frame = 0;
    let root: THREE.Object3D | null = null;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.shadowMap.enabled = true;
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#1c120c");

    const camera = new THREE.PerspectiveCamera(
      52,
      Math.max(mount.clientWidth, 1) / Math.max(mount.clientHeight, 1),
      0.1,
      80,
    );

    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.08).texture;
    scene.environment = env;

    scene.add(new THREE.AmbientLight("#e8c8a0", 0.42));
    scene.add(new THREE.HemisphereLight("#f0d8b4", "#3a2010", 0.55));

    const sun = new THREE.DirectionalLight("#ffd7a0", 1.15);
    sun.position.set(4, 10, 6);
    scene.add(sun);

    const lampA = new THREE.PointLight("#ffc078", 2.4, 18, 1.4);
    lampA.position.set(0, 4.2, 0);
    scene.add(lampA);
    const lampB = new THREE.PointLight("#ffb060", 1.8, 14, 1.55);
    lampB.position.set(-3.2, 3.6, -4);
    scene.add(lampB);
    const lampC = new THREE.PointLight("#ffc898", 1.8, 14, 1.55);
    lampC.position.set(3.2, 3.6, -4);
    scene.add(lampC);

    const draco = new DRACOLoader();
    draco.setDecoderPath(DRACO_PATH);
    draco.setDecoderConfig({ type: "wasm" });
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

    const frameCourtyard = (object: THREE.Object3D) => {
      object.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(object);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      object.position.x -= center.x;
      object.position.y -= box.min.y;
      object.position.z -= center.z;
      object.updateMatrixWorld(true);

      const depth = Math.max(size.z, 8);
      camera.position.set(0, Math.min(3.4, size.y * 0.38), depth * 0.36);
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 1.7, -depth * 0.12);
      camera.updateProjectionMatrix();
    };

    loader.load(
      INTERIOR_URL,
      (gltf) => {
        if (disposed) return;
        const interior = gltf.scene;
        const seen = new Set<THREE.Material>();
        interior.traverse((obj) => {
          if ((obj as THREE.Light).isLight) {
            obj.visible = false;
            return;
          }
          if (!(obj as THREE.Mesh).isMesh) return;
          const mesh = obj as THREE.Mesh;
          mesh.castShadow = false;
          mesh.receiveShadow = /Floor|Dado|Wall|Carpet/i.test(mesh.name);
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const mat of mats) {
            const std = mat as THREE.MeshStandardMaterial;
            if (!std || seen.has(std)) continue;
            seen.add(std);
            if (std.map) std.map.colorSpace = THREE.SRGBColorSpace;
            if ("envMapIntensity" in std) std.envMapIntensity = 0.45;
            if (/lamp|bulb|glow|stained|jhumka/i.test(`${mesh.name} ${std.name ?? ""}`)) {
              if (!std.emissive || std.emissive.getHex() === 0) {
                std.emissive = new THREE.Color("#ffb060");
              }
              std.emissiveIntensity = Math.max(std.emissiveIntensity || 0, 2.2);
            }
            std.needsUpdate = true;
          }
        });
        scene.add(interior);
        root = interior;
        frameCourtyard(interior);
      },
      undefined,
      (error) => console.error(error),
    );

    const onResize = () => {
      if (!mount) return;
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = Math.max(mount.clientWidth, 1) / Math.max(mount.clientHeight, 1);
      camera.updateProjectionMatrix();
      if (root) frameCourtyard(root);
    };

    window.addEventListener("resize", onResize);

    const clock = new THREE.Clock();
    const tick = () => {
      if (disposed) return;
      frame = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      lampA.intensity = 2.2 + Math.sin(t * 0.7) * 0.15;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      draco.dispose();
      pmrem.dispose();
      env.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose();
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of mats) mat?.dispose?.();
      });
      if (renderer.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-[#1c120c]">
      <div ref={mountRef} className="absolute inset-0" />
    </section>
  );
}
