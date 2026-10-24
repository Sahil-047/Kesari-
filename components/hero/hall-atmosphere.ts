import * as THREE from "three";
import { addFountainWater } from "@/components/hero/hall-fountain";
import { gust, WIND_DIR } from "@/components/hero/hall-wind";
import type { HallTextures } from "@/components/hero/hall-textures";

/**
 * Cinematic atmosphere for the haveli hall, matching the Blender "Interior"
 * scene: baked carpets, low sun through the stained-glass windows (shadows fall
 * toward the door), drifting dust that shows the beams, and warm haze. (The
 * beams themselves are screen-space god rays in hall-post: earlier slice-based
 * 3D shafts cut hard seam lines wherever their sheets met the floor.)
 * Everything lives in the interior model's local frame (Y up, door at z = 0,
 * back wall at z ≈ -19.3).
 */

/** Blender `InteriorSun` (rot x 1.2, z π) in glTF axes: low, toward the door. */
const SUN_DIR = new THREE.Vector3(0, -0.361, 0.933).normalize();
const SHAFT_LENGTH = 15;

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
export function applyCarpets(interiorRoot: THREE.Object3D, tex?: HallTextures) {
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
    const mat = new THREE.MeshPhysicalMaterial({
      name: "carpet_baked",
      map,
      // natural-dye wool: true colour (the texture carries knots, heather, abrash)
      color: "#f2f2f2",
      roughness: 0.94,
      metalness: 0,
      // wool pile glows softly, silvery, where light grazes the fibre tips
      sheen: 0.65,
      sheenRoughness: 0.5,
      sheenColor: new THREE.Color("#cfc5ba"),
    });
    mat.envMapIntensity = 0.15;
    if (tex) {
      // hand-knotted pile: knot grid + fibres, tiled every 10 cm of carpet
      const sx = (max.x - min.x) / 0.1;
      const sz = (max.z - min.z) / 0.1;
      const n = tex.pile.normal.clone();
      const r = tex.pile.orm.clone();
      for (const t of [n, r]) {
        t.repeat.set(sx, sz);
        t.needsUpdate = true;
      }
      mat.normalMap = n;
      mat.normalScale = new THREE.Vector2(1.2, 1.2);
      mat.roughnessMap = r;
      mat.roughness = 1;
    }
    mesh.material = mat;
    mesh.receiveShadow = true;
    // Cotton warp fringe on the short ends of the large carpets (the runners
    // butt into them, so they have none).
    if (max.x - min.x > max.z - min.z) mesh.add(fringe(min, max));
  }
}

const FRINGE_MAT = new THREE.MeshStandardMaterial({
  name: "carpet_fringe",
  color: "#e7dfcd",
  roughness: 0.92,
  side: THREE.DoubleSide,
});

/**
 * Knotted warp-thread fringe: flat cotton ribbons (≈3 mm) every 1.2 cm along
 * both short ends, 6–9 cm long, drooping from the rug edge to the floor with a
 * little random splay and curl, like a real hand-knotted rug.
 */
function fringe(min: THREE.Vector3, max: THREE.Vector3) {
  const positions: number[] = [];
  const index: number[] = [];
  const SEG = 4;
  const width = 0.003;
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (const end of [-1, 1]) {
    const x0 = end < 0 ? min.x : max.x;
    for (let z = min.z + 0.006; z < max.z - 0.004; z += 0.012) {
      const len = 0.06 + rand() * 0.03;
      const splay = (rand() - 0.5) * 0.45;          // radians, sideways
      const curl = (rand() - 0.5) * 0.6;
      const base = positions.length / 3;
      for (let k = 0; k <= SEG; k++) {
        const t = k / SEG;
        const a = splay + curl * t * t;
        const along = len * t;
        const x = x0 + end * along * Math.cos(a);
        const zz = z + along * Math.sin(a);
        // leaves the rug mid-thickness, settles onto the floor
        const y = min.y + 0.01 * (1 - t) * (1 - t) + 0.0015;
        const nx = -Math.sin(a) * width * 0.5;
        const nz = Math.cos(a) * width * 0.5;
        positions.push(x + nx * end, y, zz + nz, x - nx * end, y, zz - nz);
        if (k < SEG) {
          const i = base + k * 2;
          index.push(i, i + 1, i + 2, i + 1, i + 3, i + 2);
        }
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, FRINGE_MAT);
  mesh.name = "carpet_fringe";
  mesh.receiveShadow = true;
  return mesh;
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
    // soft beam edge: the sun is a disc, not a point
    const sun = new THREE.SpotLight("#fff0d6", 0, 0, 0.2, 0.3, 0);
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
    sun.userData.base = 10;
    sun.userData.home = sun.position.clone();
    group.add(sun, sun.target);
    suns.push(sun);
  }
  return suns;
}

/**
 * Dust motes that live around the light sources, not everywhere:
 * - lamp clouds swirl slowly around each chandelier, lobby jhumka and niche
 *   lamp, rising on warm air and wrapping back down;
 * - shaft motes hang inside the sun beams, tinted by the glass they crossed.
 * Each mote is a few millimetres across (about 1–2 px), lit by its own light
 * with forward (Mie-like) scattering, so dust really shows only when it sits
 * between you and a light — like real dust. Flakes glint as they tumble, and
 * motes right in front of the lens blur into faint bokeh.
 */
const dustVert = /* glsl */ `
  uniform float time;
  uniform float strength;
  uniform float pxScale;
  uniform vec3 sunDir;
  uniform vec3 winO0;
  uniform vec3 winR0;
  uniform vec3 winU0;
  uniform vec3 winO1;
  uniform vec3 winR1;
  uniform vec3 winU1;
  uniform float shaftLength;
  uniform sampler2D glass;
  uniform float windPhase;
  uniform float windGust;
  uniform vec3 windDir;
  attribute vec4 anchor;
  attribute vec2 kind;
  attribute vec4 seed;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSoft;

  vec3 wobble(vec3 p, float t, vec4 s) {
    return vec3(
      sin(p.y * 1.7 + t * 0.23 + s.x * 6.283) + 0.5 * sin(p.z * 3.1 - t * 0.41 + s.y * 6.283),
      sin(p.z * 1.3 + t * 0.19 + s.y * 6.283) + 0.5 * sin(p.x * 2.7 + t * 0.37 + s.z * 6.283),
      sin(p.x * 1.5 - t * 0.21 + s.z * 6.283) + 0.5 * sin(p.y * 2.9 + t * 0.33 + s.w * 6.283)
    );
  }

  float henyeyGreenstein(float c, float g) {
    float g2 = g * g;
    return (1.0 - g2) / pow(1.0 + g2 - 2.0 * g * c, 1.5);
  }

  void main() {
    float t = time;
    vec3 p;
    vec3 color;
    float light;
    vec3 lightDir;

    if (kind.x < 0.5) {
      // Lamp cloud: offset lives in a sphere of radius R around the lamp.
      float R = anchor.w;
      vec3 o = position;
      // Slow warm-air vortex, faster close to the lamp.
      float ang = t * (0.04 + 0.08 * seed.x) / (0.45 + length(o.xz) / R);
      float c = cos(ang);
      float sn = sin(ang);
      o.xz = mat2(c, -sn, sn, c) * o.xz;
      // Convection: rise and wrap through the cloud height, fading at the seam.
      float h = 2.0 * R;
      float y = mod(o.y + R + t * (0.01 + 0.025 * seed.y), h);
      float seam = smoothstep(0.0, 0.18 * h, y) * smoothstep(h, 0.82 * h, y);
      o.y = y - R;
      // Brownian jitter.
      o += wobble(o * 1.3, t, seed) * 0.05 * R;
      // The breeze leans the cloud downwind and lets it sway with the gusts.
      o += windDir * R * (0.1 * windGust + 0.05 * sin(windPhase * 1.7 + seed.x * 6.283));
      p = anchor.xyz + o;

      float d = length(o) / R;
      light = kind.y * seam * smoothstep(1.05, 0.55, d) / (1.0 + d * d * 9.0);
      color = vec3(1.0, 0.74, 0.46);
      // Offset can be ~0 right at the bulb; avoid normalize(0) = NaN.
      vec3 ld = mat3(modelMatrix) * o;
      lightDir = dot(ld, ld) > 1e-8 ? normalize(ld) : vec3(0.0, -1.0, 0.0);
    } else {
      // Shaft mote: position is (u, v, s) inside the beam from one window.
      bool first = kind.x < 1.5;
      vec3 O = first ? winO0 : winO1;
      vec3 Rv = first ? winR0 : winR1;
      vec3 Uv = first ? winU0 : winU1;
      vec3 q = position;
      q.xy += wobble(vec3(q.xy * 3.0, q.z * 4.0), t * 0.5, seed).xy * 0.015;
      q.z += t * 0.0015 * (seed.z - 0.5);
      // Motes ride the breeze in from the window, faster in a gust.
      q.z += windPhase * (0.004 + 0.004 * seed.w);
      q.xy += sin(windPhase * 0.9 + seed.xy * 6.283) * 0.01 * windGust;
      q = fract(q);
      // Spread motes 15% past each beam edge so dust also hangs around the rays.
      vec2 b = q.xy * 1.3 - 0.15;
      float spread = 1.0 + q.z * 0.18;
      p = O + Rv * (0.5 + (b.x - 0.5) * spread)
            + Uv * (0.5 + (b.y - 0.5) * spread)
            + sunDir * q.z * shaftLength;
      float edge = smoothstep(0.0, 0.1, b.x) * smoothstep(1.0, 0.9, b.x)
                 * smoothstep(0.0, 0.1, b.y) * smoothstep(1.0, 0.9, b.y);
      float outside = max(max(-b.x, b.x - 1.0), max(-b.y, b.y - 1.0));
      float halo = 0.22 * smoothstep(0.15, 0.0, max(outside, 0.0));
      light = kind.y * max(edge, halo) * smoothstep(0.0, 0.04, q.z) * pow(1.0 - q.z, 1.3);
      color = mix(vec3(1.0, 0.9, 0.76), texture2D(glass, clamp(b, 0.0, 1.0)).rgb, 0.55);
      lightDir = normalize(mat3(modelMatrix) * sunDir);
    }

    vec4 wp = modelMatrix * vec4(p, 1.0);
    vec3 tc = cameraPosition - wp.xyz;
    vec3 toCam = tc / max(length(tc), 1e-4);
    // Forward scattering: motes blaze when backlit, almost vanish side-on.
    float hg = henyeyGreenstein(dot(lightDir, toCam), 0.62);
    // beam motes are in direct sun: they show from most angles, blaze backlit
    float phase = kind.x > 0.5 ? hg * 0.3 + 0.35 : hg * 0.22 + 0.08;
    // Tumbling flakes catch the light now and then.
    float glint = pow(max(0.0, sin(t * (0.5 + seed.w * 1.8) + seed.x * 60.0)), 28.0) * 3.0;
    float lum = light * phase * (1.0 + glint) * strength;

    vec4 mv = viewMatrix * wp;
    float dist = max(-mv.z, 0.05);
    // Real dust: 2–6 mm, i.e. about a pixel or two at room distances.
    float worldSize = (0.002 + 0.004 * seed.z * seed.z) * (kind.x > 0.5 ? 2.2 : 1.0);
    float px = worldSize * pxScale / dist;
    // Shallow depth of field: anything closer than ~1 m melts into bokeh.
    float coc = clamp((1.0 - dist) * 18.0, 0.0, 22.0);
    float foot = max(px, 1.0);
    float size = foot + coc;
    // Conserve energy: sub-pixel motes dim instead of growing; blur spreads light.
    vAlpha = lum * min(px * px, 1.0) * foot * foot / (size * size);
    vSoft = clamp(coc / 6.0, 0.0, 1.0);
    vColor = color;

    gl_PointSize = size;
    gl_Position = projectionMatrix * mv;
  }
`;

const dustFrag = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vSoft;
  void main() {
    vec2 c = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(c, c);
    if (r2 > 1.0) discard;
    float mote = exp(-r2 * 4.5);
    float bokeh = smoothstep(1.0, 0.7, r2) * (0.7 + 0.3 * r2);
    float a = clamp(mix(mote, bokeh, vSoft) * vAlpha, 0.0, 8.0);
    if (a < 0.0015) discard;
    gl_FragColor = vec4(vColor * a, a);
  }
`;

type DustSource = { center: THREE.Vector3; radius: number; power: number; count: number };

/** Lamp positions read from the glow meshes in the model. */
function findLampSources(interiorRoot: THREE.Object3D) {
  const sources: DustSource[] = [];
  const add = (name: string, radius: number, power: number, count: number) => {
    const obj = interiorRoot.getObjectByName(name);
    if (!obj) return;
    const center = localBox(interiorRoot, obj).getCenter(new THREE.Vector3());
    sources.push({ center, radius, power, count });
  };
  add("W_Chand_Main_Bulbs", 2.6, 3.2, 700);
  add("W_Chand_N_Bulbs", 2.0, 2.6, 420);
  add("W_Chand_S_Bulbs", 2.0, 2.6, 420);
  for (let i = 0; i < 4; i++) add(`W_Jhumka_Lobby_${i}_Glow`, 0.85, 2.2, 110);
  for (let i = 1; i <= 6; i++) add(`W_ProductLamp_L0${i}`, 0.6, 1.4, 60);
  return sources;
}

const SHAFT_MOTES = 3200;

function createDust(
  interiorRoot: THREE.Object3D,
  windows: Window[],
  glass: THREE.Texture | null,
) {
  const lamps = findLampSources(interiorRoot);
  const total = lamps.reduce((n, l) => n + l.count, 0) + SHAFT_MOTES * windows.length;

  const position = new Float32Array(total * 3);
  const anchor = new Float32Array(total * 4);
  const kind = new Float32Array(total * 2);
  const seed = new Float32Array(total * 4);
  let i = 0;
  const v = new THREE.Vector3();
  const push = (a: THREE.Vector4, k: number, power: number) => {
    position.set([v.x, v.y, v.z], i * 3);
    anchor.set([a.x, a.y, a.z, a.w], i * 4);
    kind.set([k, power], i * 2);
    seed.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
    i++;
  };

  for (const lamp of lamps) {
    const a = new THREE.Vector4(lamp.center.x, lamp.center.y, lamp.center.z, lamp.radius);
    for (let n = 0; n < lamp.count; n++) {
      // Denser toward the bulb, thinning out to the cloud edge.
      v.randomDirection().multiplyScalar(lamp.radius * Math.pow(Math.random(), 0.8));
      push(a, 0, lamp.power);
    }
  }
  const none = new THREE.Vector4();
  windows.forEach((_, w) => {
    for (let n = 0; n < SHAFT_MOTES; n++) {
      // (u, v, s) in the beam; more motes near the window where it is brightest.
      v.set(Math.random(), Math.random(), Math.pow(Math.random(), 1.4));
      push(none, w === 0 ? 1 : 2, 6.0);
    }
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geo.setAttribute("anchor", new THREE.BufferAttribute(anchor, 4));
  geo.setAttribute("kind", new THREE.BufferAttribute(kind, 2));
  geo.setAttribute("seed", new THREE.BufferAttribute(seed, 4));

  const w0 = windows[0];
  const w1 = windows[Math.min(1, windows.length - 1)];
  const uniforms = {
    time: { value: 0 },
    strength: { value: 0 },
    pxScale: { value: 1000 },
    sunDir: { value: SUN_DIR },
    winO0: { value: w0.origin },
    winR0: { value: w0.right },
    winU0: { value: w0.up },
    winO1: { value: w1.origin },
    winR1: { value: w1.right },
    winU1: { value: w1.up },
    shaftLength: { value: SHAFT_LENGTH },
    windPhase: { value: 0 },
    windGust: { value: 0.6 },
    windDir: { value: WIND_DIR },
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

/**
 * Build the whole hall atmosphere. Call `update(t, inside, camera, bufferHeight)`
 * every frame; `bufferHeight` is the drawing-buffer height in device pixels.
 */
export function addHallAtmosphere(
  interiorRoot: THREE.Object3D,
  scene: THREE.Scene,
  tex?: HallTextures,
) {
  applyCarpets(interiorRoot, tex);
  const found = findWindows(interiorRoot);
  const windows = found.windows;
  // The light a sunlit window throws is its glass pattern, softened by the
  // sun's disc over several metres and a touch richer in colour.
  const glass = tex?.glassCookie ?? found.glass;
  const group = new THREE.Group();
  if (!windows.length) {
    interiorRoot.add(group);
    return { update() {}, rayTargets: () => [] } as {
      update(...args: unknown[]): void;
      rayTargets(): RayTarget[];
    };
  }
  let sunlight = 0;
  let windPhase = 0;
  let lastT = 0;

  const suns = addWindowSun(group, windows, glass);
  const dust = createDust(interiorRoot, windows, glass);
  const fountain = addFountainWater(interiorRoot);
  group.add(dust.points);
  interiorRoot.add(group);

  // Warm haze — density follows `inside` so the daylit facade stays clear.
  const fog = new THREE.FogExp2("#c9a173", 0);
  scene.fog = fog;

  return {
    update(t: number, inside: number, camera: THREE.PerspectiveCamera, bufferHeight: number) {
      const on = THREE.MathUtils.smoothstep(inside, 0.2, 1);
      // Clouds drifting past the sun: slow, uneven swells and dips.
      const cloud = THREE.MathUtils.clamp(
        0.78 + Math.sin(t * 0.045) * 0.16 + Math.sin(t * 0.11 + 1.3) * 0.09 + Math.sin(t * 0.023 + 4) * 0.08,
        0.45,
        1.15,
      );
      suns.forEach((s, i) => {
        s.intensity = s.userData.base * on * cloud * (1 + Math.sin(t * 0.13 + i) * 0.04);
        s.castShadow = on > 0.02;
        // The sun creeps sideways, so the coloured window patches crawl over the carpets.
        const home = s.userData.home as THREE.Vector3;
        s.position.set(home.x + Math.sin(t * 0.021 + i) * 0.9, home.y + Math.sin(t * 0.017) * 0.3, home.z);
      });
      sunlight = on * cloud;
      dust.uniforms.time.value = t;
      windPhase += Math.min(Math.max(t - lastT, 0), 0.1) * gust(t);
      lastT = t;
      dust.uniforms.windPhase.value = windPhase;
      dust.uniforms.windGust.value = gust(t);
      dust.uniforms.strength.value = on * (0.55 + 0.45 * cloud);
      dust.uniforms.pxScale.value =
        bufferHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
      fountain.update(t, on, dust.uniforms.pxScale.value);
      dust.points.visible = on > 0.01;
      fog.density = 0.011 * on;
    },
    /** Windows in world space (centre + size) for the screen-space god rays. */
    rayTargets(): RayTarget[] {
      return windows.map((w) => ({
        center: interiorRoot.localToWorld(
          w.origin.clone().addScaledVector(w.right, 0.5).addScaledVector(w.up, 0.5),
        ),
        size: Math.max(w.right.length(), w.up.length()),
        strength: sunlight,
        dir: SUN_DIR.clone().transformDirection(interiorRoot.matrixWorld),
      }));
    },
  };
}

export type RayTarget = { center: THREE.Vector3; size: number; strength: number; dir: THREE.Vector3 };
