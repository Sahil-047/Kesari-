import * as THREE from "three";

/**
 * Running water for the three-tier marble fountain in the hall.
 *
 * Water on white marble under warm light cannot be drawn as "white": it has
 * no contrast and simply disappears. It reads the way real water does —
 * through refraction of what is behind it, sharp lamp glints and motion. So
 * every stream is real geometry with a transmissive (refracting) water
 * material whose normals scroll along the flow:
 * - a crown of arcing jets from the finial into the top bowl;
 * - overflow curtains from each bowl rim into the bowl / basin below;
 * - spray droplets and splashes that sparkle (HDR, so they catch bloom);
 * - rippling water surfaces.
 *
 * Dimensions come from the interior model (model frame, Y up): fountain axis
 * at x = 0, z = -11; bowl rims at (r, y) = (0.50, 4.23), (0.92, 3.66),
 * (1.45, 2.99); water surfaces at y = 4.05, 3.43, 2.68; basin water at 1.585
 * inside x ±2.15, z -11 ± 1.29.
 */

const AXIS = new THREE.Vector2(0, -11);
const G = 9.81;
const FINIAL_TOP = 4.91;
const BASIN_Y = 1.585;
const BASIN_HALF = new THREE.Vector2(2.1, 1.27);
const BASIN_RIM_TOP = 1.86;
/** Water level in the top bowl, where the jets land. */
const TOP_WATER = 4.05;

type Tier = { rimR: number; rimY: number; landY: number; out: number; droplets: number };
const TIERS: Tier[] = [
  { rimR: 0.5, rimY: 4.23, landY: 3.43, out: 0.32, droplets: 500 },
  { rimR: 0.92, rimY: 3.66, landY: 2.68, out: 0.34, droplets: 800 },
  // Lowest bowl spills into the basin; where the ring overhangs the basin
  // walls (z) the water lands on the rim instead.
  { rimR: 1.45, rimY: 2.99, landY: BASIN_Y, out: 0.12, droplets: 1100 },
];

/** Crown of arcing jets from the finial. */
const JET_ARCS = 12;
const JET_UP = 3.2;
const JET_OUT = 0.42;

/** Fall time from height h0 with vertical speed vy to height h1. */
function fallTime(h0: number, vy: number, h1: number) {
  // h0 + vy t - G/2 t² = h1
  const a = -G / 2;
  const disc = vy * vy - 4 * a * (h0 - h1);
  return (-vy - Math.sqrt(Math.max(disc, 0))) / (2 * a);
}

function landingY(tier: Tier, x: number, z: number) {
  if (tier.landY !== BASIN_Y) return tier.landY;
  return Math.abs(z) > BASIN_HALF.y || Math.abs(x) > BASIN_HALF.x ? BASIN_RIM_TOP : BASIN_Y;
}

/* ------------------------------------------------------------------------ */
/* Procedural textures (tileable).                                           */
/* ------------------------------------------------------------------------ */

type Wave = { kx: number; ky: number; amp: number; ph: number };

/** Normal map from a sum of integer-frequency waves, so it tiles seamlessly. */
function waveNormalMap(waves: Wave[], strength: number, size = 256) {
  const data = new Uint8Array(size * size * 4);
  const n = new THREE.Vector3();
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let dx = 0;
      let dy = 0;
      for (const w of waves) {
        const c = Math.cos(Math.PI * 2 * ((w.kx * x + w.ky * y) / size) + w.ph) * w.amp;
        dx += c * w.kx;
        dy += c * w.ky;
      }
      n.set(-dx * strength, -dy * strength, 1).normalize();
      const i = (y * size + x) * 4;
      data[i] = (n.x * 0.5 + 0.5) * 255;
      data[i + 1] = (n.y * 0.5 + 0.5) * 255;
      data[i + 2] = (n.z * 0.5 + 0.5) * 255;
      data[i + 3] = 255;
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
/** Wrap a scroll offset into [0, 1): textures tile, and it keeps float precision over long sessions. */
const wrap = (x: number) => x - Math.floor(x);
const randInt = (a: number, b: number) => Math.round(rand(a, b));

/** Flow streaks: many thin ridges across the stream, gentle bulges along it. */
function flowNormalMap() {
  const waves: Wave[] = [];
  for (let i = 0; i < 10; i++) waves.push({ kx: randInt(6, 34), ky: randInt(-2, 2), amp: rand(0.3, 1), ph: rand(0, 6.3) });
  for (let i = 0; i < 4; i++) waves.push({ kx: randInt(-3, 3), ky: randInt(3, 9), amp: rand(0.2, 0.5), ph: rand(0, 6.3) });
  return waveNormalMap(waves, 0.012);
}

/** Isotropic ripples for still water surfaces. */
function rippleNormalMap() {
  const waves: Wave[] = [];
  for (let i = 0; i < 9; i++) {
    const kx = randInt(-7, 7);
    const ky = randInt(-7, 7);
    if (kx || ky) waves.push({ kx, ky, amp: rand(0.4, 1), ph: rand(0, 6.3) });
  }
  return waveNormalMap(waves, 0.02);
}

/** Clear water that refracts the marble behind it and mirrors the lamps. */
function waterMaterial(normalMap: THREE.Texture, normalScale: number) {
  return new THREE.MeshPhysicalMaterial({
    name: "fountain_flow",
    color: "#f4fbfa",
    metalness: 0,
    // Slight frosting: falling water is aerated and blurs what is behind it.
    roughness: 0.17,
    transmission: 1,
    thickness: 0.12,
    ior: 1.333,
    // Aqua absorption tints the marble seen through the water — that tint is
    // what makes a clear sheet readable face-on.
    attenuationColor: new THREE.Color("#b4e2dc"),
    attenuationDistance: 0.55,
    sheen: 0.6,
    sheenRoughness: 0.4,
    sheenColor: new THREE.Color("#ffffff"),
    specularIntensity: 1,
    envMapIntensity: 1.3,
    normalMap,
    normalScale: new THREE.Vector2(normalScale, normalScale),
    transparent: true,
    vertexColors: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

/* ------------------------------------------------------------------------ */
/* Overflow curtains (lathe sheets) and jets (tubes), all real water.        */
/* ------------------------------------------------------------------------ */

/**
 * Sheet of water following each bowl's overflow arc. UV u runs around the
 * rim in metres, v along the fall in metres, so the flow texture keeps one
 * scale everywhere. Vertex alpha fades the lip in and lets the sheet tear
 * apart near the bottom, where the droplets take over.
 */
function curtainGeometry(tier: Tier) {
  const AROUND = 192;
  const ALONG = 22;
  const positions: number[] = [];
  const uvs: number[] = [];
  const colors: number[] = [];
  const index: number[] = [];
  const circumference = Math.PI * 2 * tier.rimR;
  for (let i = 0; i <= AROUND; i++) {
    const a = (i / AROUND) * Math.PI * 2;
    const cx = Math.cos(a);
    const sz = Math.sin(a);
    const endX = cx * (tier.rimR + tier.out * 0.5);
    const endZ = sz * (tier.rimR + tier.out * 0.5);
    const life = fallTime(tier.rimY, 0, landingY(tier, endX, endZ));
    let len = 0;
    let prev = new THREE.Vector3();
    for (let j = 0; j <= ALONG; j++) {
      const f = j / ALONG;
      const t = f * life;
      const r = tier.rimR + 0.012 + tier.out * t;
      const p = new THREE.Vector3(AXIS.x + cx * r, tier.rimY - (G / 2) * t * t, AXIS.y + sz * r);
      if (j > 0) len += p.distanceTo(prev);
      prev = p;
      positions.push(p.x, p.y, p.z);
      uvs.push((i / AROUND) * circumference, len);
      const alpha = THREE.MathUtils.smoothstep(f, 0, 0.06) * (1 - 0.65 * THREE.MathUtils.smoothstep(f, 0.55, 1));
      colors.push(1, 1, 1, alpha);
    }
  }
  for (let i = 0; i < AROUND; i++) {
    for (let j = 0; j < ALONG; j++) {
      const k = i * (ALONG + 1) + j;
      index.push(k, k + ALONG + 1, k + 1, k + 1, k + ALONG + 1, k + ALONG + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

/** One arcing jet as a thin tube: up out of the finial, over, into the top bowl. */
function jetGeometry(angle: number) {
  const pts: THREE.Vector3[] = [];
  const life = fallTime(FINIAL_TOP, JET_UP, TOP_WATER);
  const STEPS = 28;
  for (let i = 0; i <= STEPS; i++) {
    const t = (i / STEPS) * life;
    const r = JET_OUT * t;
    pts.push(
      new THREE.Vector3(
        AXIS.x + Math.cos(angle) * r,
        FINIAL_TOP + JET_UP * t - (G / 2) * t * t,
        AXIS.y + Math.sin(angle) * r,
      ),
    );
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, 48, 0.017, 8, false);
  // Tube UVs: u along the arc (0..1) → metres-ish so the flow scrolls evenly.
  const uv = geo.attributes.uv;
  const length = curve.getLength();
  const colors: number[] = [];
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    uv.setXY(i, uv.getY(i) * 0.07, u * length);
    // Jets thin out as they fall back.
    colors.push(1, 1, 1, 1 - 0.5 * THREE.MathUtils.smoothstep(u, 0.6, 1));
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 4));
  return geo;
}

function createStreams() {
  const flow = flowNormalMap();
  flow.repeat.set(1.6, 0.9);
  const curtainMat = waterMaterial(flow, 1.5);
  const jetFlow = flow.clone();
  jetFlow.needsUpdate = true;
  jetFlow.repeat.set(1, 1.4);
  const jetMat = waterMaterial(jetFlow, 0.8);
  jetMat.thickness = 0.05;

  const group = new THREE.Group();
  for (const tier of TIERS) {
    const mesh = new THREE.Mesh(curtainGeometry(tier), curtainMat);
    mesh.renderOrder = 9;
    mesh.userData.noAO = true;
    group.add(mesh);
  }
  // Short central column feeding the crown.
  const column = new THREE.Mesh(
    new THREE.CylinderGeometry(0.026, 0.032, 0.22, 10, 1, true),
    jetMat,
  );
  column.position.set(AXIS.x, FINIAL_TOP + 0.1, AXIS.y);
  column.userData.noAO = true;
  const colAlpha: number[] = [];
  for (let i = 0; i < column.geometry.attributes.position.count; i++) colAlpha.push(1, 1, 1, 1);
  column.geometry.setAttribute("color", new THREE.Float32BufferAttribute(colAlpha, 4));
  group.add(column);
  for (let k = 0; k < JET_ARCS; k++) {
    const mesh = new THREE.Mesh(jetGeometry((k / JET_ARCS) * Math.PI * 2 + 0.13), jetMat);
    mesh.renderOrder = 9;
    mesh.userData.noAO = true;
    group.add(mesh);
  }

  return {
    group,
    materials: [curtainMat, jetMat],
    update(t: number) {
      // Scroll the flow texture down the falls (v is along the flow).
      flow.offset.set(wrap(Math.sin(t * 0.3) * 0.02), wrap(-t * 1.9));
      jetFlow.offset.set(0, wrap(-t * 2.6));
    },
  };
}

/* ------------------------------------------------------------------------ */
/* Spray droplets and splashes: ballistic particles evaluated on the GPU.     */
/* ------------------------------------------------------------------------ */

const dropVert = /* glsl */ `
  uniform float time;
  uniform float pxScale;
  attribute vec3 vel;
  attribute vec3 info; // life, phase, size (m)
  attribute float kind; // 0 stream, 1 jet, 2 splash
  varying float vAlpha;
  varying float vSpark;
  void main() {
    float life = info.x;
    float age = fract(time / life + info.y) * life;
    vec3 p = position + vel * age + vec3(0.0, -4.905 * age * age, 0.0);
    float fade = smoothstep(0.0, 0.08 * life, age) * (1.0 - smoothstep(0.75 * life, life, age));
    // Each drop flashes as it tumbles through the lamplight.
    float phase = fract(sin(info.y * 91.7) * 4375.85);
    vSpark = 0.6 + 2.4 * pow(max(0.0, sin(time * (9.0 + phase * 14.0) + phase * 40.0)), 6.0);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = max(-mv.z, 0.05);
    float px = info.z * pxScale / dist;
    float size = clamp(px, 1.5, 14.0);
    float cover = min(px * px / 2.25, 1.0);
    float k = kind > 1.5 ? 0.9 : (kind > 0.5 ? 1.0 : 0.8);
    vAlpha = fade * cover * k;
    gl_PointSize = size;
    gl_Position = projectionMatrix * mv;
  }
`;

const dropFrag = /* glsl */ `
  uniform float strength;
  varying float vAlpha;
  varying float vSpark;
  void main() {
    vec2 c = gl_PointCoord * 2.0 - 1.0;
    float r2 = dot(c, c);
    if (r2 > 1.0) discard;
    // Bright core with a faint refractive ring, like a lit water bead.
    float core = exp(-r2 * 6.0);
    float ring = smoothstep(1.0, 0.75, r2) * smoothstep(0.3, 0.7, r2) * 0.35;
    float a = (core + ring) * vAlpha * strength;
    // HDR on purpose: glints rise above the marble and bloom slightly.
    vec3 col = vec3(1.0, 0.96, 0.9) * (1.6 * vSpark);
    gl_FragColor = vec4(col * a, a);
  }
`;

function createDroplets() {
  const pos: number[] = [];
  const vel: number[] = [];
  const info: number[] = [];
  const kind: number[] = [];
  const p = new THREE.Vector3();
  const v = new THREE.Vector3();
  const push = (life: number, size: number, k: number) => {
    pos.push(p.x, p.y, p.z);
    vel.push(v.x, v.y, v.z);
    info.push(life, Math.random(), size);
    kind.push(k);
  };
  const splashAt = (x: number, y: number, z: number, n: number, power: number) => {
    const ox = p.x;
    const oy = p.y;
    const oz = p.z;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const out = rand(0.15, 0.6) * power;
      const up = rand(0.5, 1.4) * power;
      p.set(x + rand(-0.03, 0.03), y + 0.01, z + rand(-0.03, 0.03));
      v.set(Math.cos(a) * out, up, Math.sin(a) * out);
      push(fallTime(p.y, up, y), rand(0.008, 0.016), 2);
    }
    p.set(ox, oy, oz);
  };

  // Spray breaking off each curtain, and splashes where the curtains land.
  for (const tier of TIERS) {
    for (let i = 0; i < tier.droplets; i++) {
      const a = Math.random() * Math.PI * 2;
      const cx = Math.cos(a);
      const sz = Math.sin(a);
      const out = tier.out * rand(0.8, 1.35);
      p.set(AXIS.x + cx * tier.rimR, tier.rimY - rand(0, 0.25), AXIS.y + sz * tier.rimR);
      v.set(cx * out, -rand(0, 0.3), sz * out);
      const gx = cx * (tier.rimR + out * 0.5);
      const gz = sz * (tier.rimR + out * 0.5);
      const life = fallTime(p.y, v.y, landingY(tier, gx, gz));
      push(life, rand(0.01, 0.022), 0);
      if (i % 2 === 0) {
        const lx = p.x + v.x * life;
        const lz = p.z + v.z * life;
        splashAt(lx, landingY(tier, lx - AXIS.x, lz - AXIS.y), lz, 1, 0.85);
      }
    }
  }

  // Spray off the jet crown and splashes in the top bowl.
  for (let i = 0; i < 900; i++) {
    const a = Math.random() * Math.PI * 2;
    p.set(AXIS.x, FINIAL_TOP + 0.18, AXIS.y);
    v.set(Math.cos(a) * JET_OUT * rand(0.7, 1.3), JET_UP * rand(0.85, 1.08), Math.sin(a) * JET_OUT * rand(0.7, 1.3));
    push(fallTime(p.y, v.y, TOP_WATER), rand(0.008, 0.016), 1);
  }
  for (let i = 0; i < 300; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = rand(0.28, 0.4);
    splashAt(AXIS.x + Math.cos(a) * r, TOP_WATER, AXIS.y + Math.sin(a) * r, 1, 0.6);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("vel", new THREE.Float32BufferAttribute(vel, 3));
  geo.setAttribute("info", new THREE.Float32BufferAttribute(info, 3));
  geo.setAttribute("kind", new THREE.Float32BufferAttribute(kind, 1));
  const uniforms = {
    time: { value: 0 },
    pxScale: { value: 1000 },
    strength: { value: 0 },
  };
  const points = new THREE.Points(
    geo,
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: dropVert,
      fragmentShader: dropFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    }),
  );
  points.frustumCulled = false;
  points.renderOrder = 12;
  return { points, uniforms };
}

/* ------------------------------------------------------------------------ */
/* Rippling still-water surfaces.                                            */
/* ------------------------------------------------------------------------ */

function animateWaterSurfaces(interiorRoot: THREE.Object3D) {
  const normals = rippleNormalMap();
  const coatNormals = normals.clone();
  coatNormals.needsUpdate = true;
  for (const name of ["W_Basin_Water", "W_Fountain_Water0", "W_Fountain_Water1", "W_Fountain_Water2"]) {
    const mesh = interiorRoot.getObjectByName(name) as THREE.Mesh | undefined;
    if (!mesh?.isMesh) continue;
    // Planar UVs in metres (×1.6) so ripples keep one scale on every bowl.
    const geo = mesh.geometry;
    const pos = geo.attributes.position;
    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      uv[i * 2] = pos.getX(i) * 1.6;
      uv[i * 2 + 1] = pos.getZ(i) * 1.6;
    }
    geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    const src = mesh.material as THREE.MeshPhysicalMaterial;
    if (!src.isMeshPhysicalMaterial) continue;
    const mat = src.clone();
    mat.normalMap = normals;
    mat.normalScale = new THREE.Vector2(0.45, 0.45);
    mat.clearcoat = 0.8;
    mat.clearcoatRoughness = 0.1;
    mat.clearcoatNormalMap = coatNormals;
    mat.clearcoatNormalScale = new THREE.Vector2(0.3, 0.3);
    mat.needsUpdate = true;
    mesh.material = mat;
  }
  return {
    update(t: number) {
      // Two layers drifting in different directions interfere like real ripples;
      // the faster one stands in for the rings spreading from the falls.
      normals.offset.set(wrap(t * 0.06), wrap(t * 0.04));
      coatNormals.offset.set(wrap(-t * 0.05), wrap(t * 0.08));
    },
  };
}

/** Build the running fountain. Call `update(t, on, pxScale)` every frame. */
export function addFountainWater(interiorRoot: THREE.Object3D) {
  const group = new THREE.Group();
  const streams = createStreams();
  const drops = createDroplets();
  group.add(streams.group, drops.points);
  interiorRoot.add(group);
  const water = animateWaterSurfaces(interiorRoot);

  return {
    update(t: number, on: number, pxScale: number) {
      group.visible = on > 0.01;
      streams.update(t);
      drops.uniforms.time.value = t;
      drops.uniforms.pxScale.value = pxScale;
      drops.uniforms.strength.value = on;
      water.update(t);
    },
  };
}
