import * as THREE from "three";

/**
 * Cinematic atmosphere for the haveli hall, matching the Blender "Interior"
 * scene: baked carpets, low sun through the stained-glass windows (shadows fall
 * toward the door), coloured volumetric shafts, drifting dust and warm haze.
 * Everything lives in the interior model's local frame (Y up, door at z = 0,
 * back wall at z ≈ -19.3).
 */

/** Blender `InteriorSun` (rot x 1.2, z π) in glTF axes: low, toward the door. */
const SUN_DIR = new THREE.Vector3(0, -0.361, 0.933).normalize();
/** Hall volume the dust drifts in. */
const HALL_MIN = new THREE.Vector3(-6.6, 1.0, -18.8);
const HALL_MAX = new THREE.Vector3(6.6, 6.8, -3.4);
const SHAFT_LENGTH = 15;
const DUST_COUNT = 1400;

type Window = { origin: THREE.Vector3; right: THREE.Vector3; up: THREE.Vector3 };

function localBox(root: THREE.Object3D, obj: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const inv = root.matrixWorld.clone().invert();
  const box = new THREE.Box3();
  obj.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.geometry.computeBoundingBox();
    const b = mesh.geometry.boundingBox!.clone();
    b.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, mesh.matrixWorld));
    box.union(b);
  });
  return box;
}

/** Replace the flat cream carpet bake with the real Blender pattern (top-down bake). */
export function applyCarpets(interiorRoot: THREE.Object3D) {
  const loader = new THREE.TextureLoader();
  for (const side of ["N", "S", "E", "W"]) {
    const mesh = interiorRoot.getObjectByName(`W_Carpet_${side}`) as THREE.Mesh | undefined;
    if (!mesh?.isMesh) continue;
    const geo = mesh.geometry;
    geo.computeBoundingBox();
    const { min, max } = geo.boundingBox!;
    const pos = geo.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    // Bake camera looked straight down: image x = +x, image up = -z.
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = (pos.getX(i) - min.x) / Math.max(max.x - min.x, 1e-6);
      uv[i * 2 + 1] = (max.z - pos.getZ(i)) / Math.max(max.z - min.z, 1e-6);
    }
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));

    const map = loader.load(`/textures/carpets/carpet_${side.toLowerCase()}.jpg`);
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    const mat = new THREE.MeshStandardMaterial({
      name: "carpet_baked",
      map,
      // Woven wool reads softer than the flat bake.
      color: "#d8c8b6",
      roughness: 0.94,
      metalness: 0,
    });
    mat.envMapIntensity = 0.15;
    mesh.material = mat;
    mesh.receiveShadow = true;
  }
}

function findWindows(interiorRoot: THREE.Object3D) {
  const windows: Window[] = [];
  let glass: THREE.Texture | null = null;
  for (const side of ["L", "R"]) {
    const obj = interiorRoot.getObjectByName(`W_Int_Window_${side}`) as THREE.Mesh | undefined;
    if (!obj) continue;
    const box = localBox(interiorRoot, obj);
    windows.push({
      origin: new THREE.Vector3(box.min.x, box.min.y, box.max.z + 0.02),
      right: new THREE.Vector3(box.max.x - box.min.x, 0, 0),
      up: new THREE.Vector3(0, box.max.y - box.min.y, 0),
    });
    const mat = obj.material as THREE.MeshStandardMaterial;
    glass = glass ?? mat.emissiveMap ?? mat.map ?? null;
  }
  return { windows, glass };
}

/**
 * Sun through each window as a projector spot: the stained-glass texture is
 * the light cookie, so coloured patches land on the floor, and the fountain,
 * elephants and outfits throw shadows toward the door like the Blender render.
 */
function addWindowSun(group: THREE.Group, windows: Window[], glass: THREE.Texture | null) {
  const suns: THREE.SpotLight[] = [];
  const back = 14;
  for (const w of windows) {
    const center = w.origin.clone().addScaledVector(w.right, 0.5).addScaledVector(w.up, 0.5);
    const sun = new THREE.SpotLight("#fff0d6", 0, 0, 0.2, 0.12, 0);
    sun.position.copy(center).addScaledVector(SUN_DIR, -back);
    sun.target.position.copy(center).addScaledVector(SUN_DIR, 10);
    const half = Math.max(w.right.length(), w.up.length()) * 0.5;
    sun.angle = Math.atan(half / back) * 1.08;
    sun.map = glass;
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.bias = -0.0003;
    sun.shadow.normalBias = 0.03;
    sun.shadow.radius = 3;
    sun.shadow.camera.near = back - 1;
    sun.shadow.camera.far = back + 30;
    // decay 0 → no falloff, like sunlight; value is irradiance-like.
    sun.userData.base = 9;
    group.add(sun, sun.target);
    suns.push(sun);
  }
  return suns;
}

const shaftVert = /* glsl */ `
  attribute vec3 wuv;
  varying vec3 vWuv;
  varying vec3 vView;
  varying vec3 vNormalV;
  void main() {
    vWuv = wuv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    vNormalV = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * mv;
  }
`;

const shaftFrag = /* glsl */ `
  uniform sampler2D glass;
  uniform float strength;
  uniform float time;
  varying vec3 vWuv;
  varying vec3 vView;
  varying vec3 vNormalV;
  void main() {
    vec2 uv = vWuv.xy;
    float s = vWuv.z;
    vec3 tint = texture2D(glass, uv).rgb;
    tint = mix(vec3(1.0, 0.86, 0.66), tint, 0.65);
    float edge = smoothstep(0.0, 0.12, uv.x) * smoothstep(1.0, 0.88, uv.x)
               * smoothstep(0.0, 0.1, uv.y) * smoothstep(1.0, 0.9, uv.y);
    float along = smoothstep(0.0, 0.06, s) * pow(1.0 - s, 1.6);
    float facing = abs(dot(normalize(vView), normalize(vNormalV)));
    float drift = 0.82 + 0.18 * sin(time * 0.35 + uv.x * 7.0 + s * 5.0);
    // Fade slices near the lens so walking through a shaft never fogs the view.
    float near = smoothstep(0.6, 4.0, length(vView));
    float a = edge * along * facing * drift * near * strength;
    gl_FragColor = vec4(tint * a, a);
  }
`;

/**
 * Volumetric shafts: stacks of soft additive slices swept along the sun
 * direction from each window, tinted by the glass they passed through.
 */
function createShafts(windows: Window[], glass: THREE.Texture | null) {
  const uniforms = {
    glass: { value: glass ?? new THREE.Texture() },
    strength: { value: 0 },
    time: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: shaftVert,
    fragmentShader: shaftFrag,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    fog: false,
  });

  const group = new THREE.Group();
  const SEG = 24;
  const SLICES = 9;
  for (const w of windows) {
    const positions: number[] = [];
    const wuvs: number[] = [];
    const index: number[] = [];
    const point = (u: number, v: number, s: number) => {
      // Slight spread so the beam softens as it travels.
      const spread = 1 + s * 0.18;
      const p = w.origin
        .clone()
        .addScaledVector(w.right, 0.5 + (u - 0.5) * spread)
        .addScaledVector(w.up, 0.5 + (v - 0.5) * spread)
        .addScaledVector(SUN_DIR, s * SHAFT_LENGTH);
      positions.push(p.x, p.y, p.z);
      wuvs.push(u, v, s);
    };
    const sheet = (fixU: number | null, fixV: number | null) => {
      const base = positions.length / 3;
      for (let i = 0; i <= SEG; i++) {
        for (let j = 0; j <= SEG; j++) {
          const a = j / SEG;
          const s = i / SEG;
          point(fixU ?? a, fixV ?? a, s);
        }
      }
      for (let i = 0; i < SEG; i++) {
        for (let j = 0; j < SEG; j++) {
          const k = base + i * (SEG + 1) + j;
          index.push(k, k + SEG + 1, k + 1, k + 1, k + SEG + 1, k + SEG + 2);
        }
      }
    };
    for (let k = 0; k < SLICES; k++) sheet((k + 0.5) / SLICES, null);
    for (let k = 0; k < SLICES; k++) sheet(null, (k + 0.5) / SLICES);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("wuv", new THREE.Float32BufferAttribute(wuvs, 3));
    geo.setIndex(index);
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = 10;
    group.add(mesh);
  }
  return { group, uniforms, material };
}

const dustVert = /* glsl */ `
  uniform float time;
  uniform float size;
  uniform vec3 boxMin;
  uniform vec3 boxMax;
  uniform vec3 sunDir;
  uniform vec3 winO[2];
  uniform vec3 winR[2];
  uniform vec3 winU[2];
  uniform sampler2D glass;
  attribute vec4 seed;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 span = boxMax - boxMin;
    vec3 p = position;
    p.y += time * (0.03 + seed.w * 0.05);
    p.x += sin(time * 0.21 + seed.x * 6.28) * 0.35;
    p.z += cos(time * 0.17 + seed.y * 6.28) * 0.35;
    p = boxMin + mod(p - boxMin, span);

    // Inside a sun shaft? Trace back along the sun to the window plane.
    float lit = 0.0;
    vec3 tint = vec3(1.0, 0.85, 0.62);
    for (int i = 0; i < 2; i++) {
      float t = (p.z - winO[i].z) / sunDir.z;
      if (t > 0.0) {
        vec3 q = p - sunDir * t - winO[i];
        vec2 uv = vec2(dot(q, winR[i]) / dot(winR[i], winR[i]), dot(q, winU[i]) / dot(winU[i], winU[i]));
        if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
          lit = max(lit, 1.0 - t / 16.0);
          tint = mix(vec3(1.0, 0.9, 0.75), texture2D(glass, uv).rgb, 0.5);
        }
      }
    }
    float twinkle = 0.6 + 0.4 * sin(time * (1.0 + seed.z * 2.0) + seed.x * 40.0);
    vColor = tint;
    vAlpha = (0.12 + lit * 0.9) * twinkle;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = size * (0.5 + seed.z) * (1.0 + lit * 0.8) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const dustFrag = /* glsl */ `
  uniform float strength;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    float a = smoothstep(0.25, 0.0, d) * vAlpha * strength;
    gl_FragColor = vec4(vColor * a, a);
  }
`;

function createDust(windows: Window[], glass: THREE.Texture | null, pixelRatio: number) {
  const pos = new Float32Array(DUST_COUNT * 3);
  const seed = new Float32Array(DUST_COUNT * 4);
  const span = HALL_MAX.clone().sub(HALL_MIN);
  for (let i = 0; i < DUST_COUNT; i++) {
    pos[i * 3] = HALL_MIN.x + Math.random() * span.x;
    pos[i * 3 + 1] = HALL_MIN.y + Math.random() * span.y;
    pos[i * 3 + 2] = HALL_MIN.z + Math.random() * span.z;
    for (let k = 0; k < 4; k++) seed[i * 4 + k] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("seed", new THREE.BufferAttribute(seed, 4));
  const w = (i: number) => windows[Math.min(i, windows.length - 1)];
  const uniforms = {
    time: { value: 0 },
    size: { value: 34 * pixelRatio },
    strength: { value: 0 },
    boxMin: { value: HALL_MIN },
    boxMax: { value: HALL_MAX },
    sunDir: { value: SUN_DIR },
    winO: { value: [w(0).origin, w(1).origin] },
    winR: { value: [w(0).right, w(1).right] },
    winU: { value: [w(0).up, w(1).up] },
    glass: { value: glass ?? new THREE.Texture() },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: dustVert,
      fragmentShader: dustFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 11;
  return { points, uniforms };
}

/** Build the whole hall atmosphere. Call `update(t, inside)` every frame. */
export function addHallAtmosphere(
  interiorRoot: THREE.Object3D,
  scene: THREE.Scene,
  pixelRatio: number,
) {
  applyCarpets(interiorRoot);
  const { windows, glass } = findWindows(interiorRoot);
  const group = new THREE.Group();
  if (!windows.length) {
    interiorRoot.add(group);
    return { update() {} };
  }

  const suns = addWindowSun(group, windows, glass);
  const shafts = createShafts(windows, glass);
  const dust = createDust(windows, glass, pixelRatio);
  group.add(shafts.group, dust.points);
  interiorRoot.add(group);

  // Warm haze — density follows `inside` so the daylit facade stays clear.
  const fog = new THREE.FogExp2("#c9a173", 0);
  scene.fog = fog;

  return {
    update(t: number, inside: number) {
      const on = THREE.MathUtils.smoothstep(inside, 0.2, 1);
      suns.forEach((s, i) => {
        s.intensity = s.userData.base * on * (1 + Math.sin(t * 0.13 + i) * 0.04);
        s.castShadow = on > 0.02;
      });
      shafts.uniforms.time.value = t;
      shafts.uniforms.strength.value = 0.12 * on;
      shafts.group.visible = on > 0.01;
      dust.uniforms.time.value = t;
      dust.uniforms.strength.value = on;
      dust.points.visible = on > 0.01;
      fog.density = 0.022 * on;
    },
  };
}
