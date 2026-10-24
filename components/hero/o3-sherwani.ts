import * as THREE from "three";
import type { O3Textures } from "@/components/hero/hall-textures";

/**
 * The ivory sherwani (outfit O3), dressed to the Kesari reference photos:
 *
 * - coat: raw dupion silk with cherry-blossom embroidery all over (tan-gold
 *   stems, outlined ivory five-petal flowers with peach centres, cutdana and
 *   sequins); a zari border band down both sides of the front opening, on
 *   the stand collar and round the hem. Below the hips the front opens in a
 *   narrow inverted V that shows the plain silk kurta underneath;
 * - cuffs: the zari band;
 * - stole: soft fine-weave ivory, zari border down both long edges, a dense
 *   end band and silk tassels. It hangs over his right shoulder (viewer's
 *   left) and its other end over his left forearm (viewer's right);
 * - churidar: plain raw silk, gathered at the ankle; turban: wrapped cream
 *   silk with a pleated fan.
 *
 * The exported UVs are not laid out for borders, so everything is projected
 * in the mannequin's own frame (metres, Y up, front = +z): fabric triplanar,
 * borders placed analytically. Embroidery relief comes from a height map
 * turned into a normal per pixel.
 */

const MODE = { coat: 0, silk: 1, cuff: 2, stole: 3, churidar: 4, turban: 5, plume: 6, kurta: 7, tassel: 8 } as const;

const GLSL_COMMON = /* glsl */ `
  varying vec3 vO3Pos;
  varying vec3 vO3Nrm;
  uniform sampler2D tSilk;
  uniform sampler2D tSilkData;
  uniform sampler2D tPlain;
  uniform sampler2D tPlainData;
  uniform sampler2D tBorder;
  uniform sampler2D tBorderData;
  uniform sampler2D tStole;
  uniform sampler2D tStoleData;
  uniform float uMode;
  uniform vec4 uBox;    // minY, maxY, centre x, centre z
  uniform vec4 uExtra;  // per mode (stole: centre x, half width, end y)
  vec3 o3Col;
  float o3H;
  float o3R;
  float o3M;

  void o3Tri(sampler2D cm, sampler2D dm, float tile, vec3 p, vec3 n, out vec3 c, out vec3 d) {
    vec3 w = pow(abs(n), vec3(4.0));
    w /= (w.x + w.y + w.z + 1e-5);
    vec2 ux = vec2(p.z * sign(n.x), p.y) / tile;
    vec2 uy = p.xz / tile;
    vec2 uz = vec2(p.x * sign(n.z + 1e-4), p.y) / tile;
    c = texture2D(cm, ux).rgb * w.x + texture2D(cm, uy).rgb * w.y + texture2D(cm, uz).rgb * w.z;
    d = texture2D(dm, ux).rgb * w.x + texture2D(dm, uy).rgb * w.y + texture2D(dm, uz).rgb * w.z;
  }

  // Zari band: u across (0 = inner edge cord, 1 = outer edge cord), v along (metres).
  void o3Band(float u, float v, out vec3 c, out vec3 d) {
    vec2 uv = vec2(clamp(u, 0.0, 1.0), v / 0.192);
    c = texture2D(tBorder, uv).rgb;
    d = texture2D(tBorderData, uv).rgb;
  }

  void o3Shade() {
    vec3 p = vO3Pos;
    vec3 n = normalize(vO3Nrm);
    vec3 c;
    vec3 d;
    float minY = uBox.x;
    float maxY = uBox.y;
    vec2 axis = uBox.zw;
    float around = atan(p.x - axis.x, p.z - axis.y);

    if (uMode < 0.5) {
      // ---- coat
      o3Tri(tSilk, tSilkData, 0.32, p, n, c, d);
      float openY = uExtra.x;
      float ax = abs(p.x - axis.x);
      bool front = p.z > axis.y && n.z > 0.1;
      float gap = mix(0.0022, 0.045, clamp((openY - p.y) / max(openY - minY, 1e-3), 0.0, 1.0));
      bool collar = p.y > maxY - 0.05;
      if (collar) {
        o3Band((maxY - p.y) / 0.05, around * 0.1, c, d);
      } else if (front && ax < gap && p.y < openY) {
        // the plain kurta seen through the front opening
        o3Tri(tPlain, tPlainData, 0.2, p, n, c, d);
        c *= 1.02;
      } else if (front && ax < gap) {
        // closed above the hips: the gold piping of the opening
        o3Band(0.01 + 0.02 * ax / gap, p.y, c, d);
        c = mix(c, vec3(0.86, 0.8, 0.68), 0.5);
        d.b *= 0.5;
      } else if (p.y < minY + 0.05) {
        o3Band((p.y - minY) / 0.05, around * 0.22, c, d);
      } else if (front && ax < gap + 0.048) {
        o3Band((ax - gap) / 0.048, p.y, c, d);
      }
    } else if (uMode < 1.5) {
      o3Tri(tSilk, tSilkData, 0.32, p, n, c, d);
    } else if (uMode < 2.5) {
      o3Band((p.y - minY) / max(maxY - minY, 1e-3), around * 0.05, c, d);
    } else if (uMode < 3.5) {
      // ---- stole
      o3Tri(tStole, tStoleData, 0.15, p, n, c, d);
      float edge = uExtra.y - abs(p.x - uExtra.x);
      if (p.y < uExtra.z + 0.06) {
        o3Band((p.y - uExtra.z) / 0.06, p.x, c, d);
      } else if (edge < 0.03) {
        o3Band(edge / 0.03, p.y + p.z, c, d);
      }
    } else if (uMode < 4.5) {
      // ---- churidar: plain silk, ruched over the ankle
      o3Tri(tPlain, tPlainData, 0.2, p, n, c, d);
      float bunch = 1.0 - smoothstep(minY + 0.1, minY + 0.3, p.y);
      float r = sin(p.y * 260.0 + sin(around * 3.0) * 2.5);
      d.r += bunch * 0.35 * r;
      c *= 1.0 - bunch * 0.05 * (1.0 - r);
    } else if (uMode < 5.5) {
      // ---- turban: wrapped cream silk, diagonal folds
      o3Tri(tPlain, tPlainData, 0.2, p, n, c, d);
      c *= vec3(1.0, 0.975, 0.93);
      float wrap = sin((p.y * 1.0 + around * 0.035) * 6.2832 / 0.022);
      d.r += 0.4 * wrap;
      c *= 0.96 + 0.04 * wrap;
      d.g = 0.38;
      d.b = 0.12;
    } else if (uMode > 7.5) {
      // ---- silk tassel: fine hanging strands under a thread-wrapped cap
      float hgt = (p.y - minY) / max(maxY - minY, 1e-3);
      float strands = sin(around * 46.0 + sin(p.y * 90.0) * 0.6);
      float cap = smoothstep(0.66, 0.72, hgt);
      float wraps = sin(p.y * 2400.0);
      c = vec3(0.93, 0.9, 0.84) * mix(0.93 + 0.07 * strands, 0.95 + 0.05 * wraps, cap);
      d = vec3(mix(0.5 + 0.5 * strands, 0.6 + 0.4 * wraps, cap), 0.5, 0.0);
    } else if (uMode > 6.5) {
      // ---- kurta (the torso form, seen through the coat's front opening)
      o3Tri(tPlain, tPlainData, 0.2, p, n, c, d);
      c *= 1.02;
    } else {
      // ---- pleated fan
      o3Tri(tPlain, tPlainData, 0.2, p, n, c, d);
      float pleat = sin(p.x * 6.2832 / 0.011);
      c *= vec3(1.0, 0.95, 0.84) * (0.95 + 0.05 * pleat);
      d.r += 0.45 * pleat;
      d.g = 0.34;
      d.b = 0.3;
    }
    // real ivory silk reflects ~70% (sRGB ~235 ≈ 0.83 linear is too hot under the key)
    o3Col = c * 0.8;
    o3H = d.r;
    o3R = clamp(d.g, 0.16, 1.0);
    o3M = d.b;
  }
`;

function o3Material(tex: O3Textures, mode: number, box: THREE.Vector4, extra: THREE.Vector4) {
  const m = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: 1,
    metalness: 0,
    // raw silk / zari: a soft satin sheen over the weave
    sheen: mode === MODE.stole ? 0.25 : 0.35,
    sheenRoughness: 0.45,
    sheenColor: new THREE.Color("#fff3e0"),
    envMapIntensity: 0.6,
    side: THREE.DoubleSide,
  });
  const uniforms = {
    tSilk: { value: tex.silk.map },
    tSilkData: { value: tex.silk.data },
    tPlain: { value: tex.plain.map },
    tPlainData: { value: tex.plain.data },
    tBorder: { value: tex.border.map },
    tBorderData: { value: tex.border.data },
    tStole: { value: tex.stole.map },
    tStoleData: { value: tex.stole.data },
    uMode: { value: mode },
    uBox: { value: box },
    uExtra: { value: extra },
  };
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vO3Pos;\nvarying vec3 vO3Nrm;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvO3Pos = position;\nvO3Nrm = normal;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${GLSL_COMMON}`)
      .replace("#include <map_fragment>", "#include <map_fragment>\no3Shade();\ndiffuseColor.rgb = o3Col;")
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = o3R;")
      .replace("#include <metalnessmap_fragment>", "#include <metalnessmap_fragment>\nmetalnessFactor = o3M;")
      .replace(
        "#include <normal_fragment_maps>",
        /* glsl */ `#include <normal_fragment_maps>
        {
          // embroidery relief: ~1.2 mm of height → per-pixel normal (Mikkelsen bump)
          float hm = o3H * 0.0012;
          vec3 sp = -vViewPosition;
          vec3 sx = dFdx(sp);
          vec3 sy = dFdy(sp);
          vec3 r1 = cross(sy, normal);
          vec3 r2 = cross(normal, sx);
          float det = dot(sx, r1) * faceDirection;
          vec3 grad = sign(det) * (dFdx(hm) * r1 + dFdy(hm) * r2);
          normal = normalize(abs(det) * normal - grad);
        }`,
      );
  };
  m.customProgramCacheKey = () => "o3-sherwani";
  return m;
}

function boxOf(mesh: THREE.Mesh) {
  const g = mesh.geometry;
  if (!g.boundingBox) g.computeBoundingBox();
  const b = g.boundingBox!;
  const c = b.getCenter(new THREE.Vector3());
  return { b, box: new THREE.Vector4(b.min.y, b.max.y, c.x, c.z) };
}

/**
 * The stole's second end, over his left forearm (viewer's right): a soft panel
 * from the forearm down to the hem line, with its own tassels.
 */
function addStoleEnd(root: THREE.Object3D, stole: THREE.Mesh, material: THREE.Material) {
  const COLS = 8;
  const ROWS = 32;
  const x0 = 0.21;
  const x1 = 0.36;
  const top = 0.98;
  const bottom = 0.62;
  const pos: number[] = [];
  const index: number[] = [];
  for (let j = 0; j <= ROWS; j++) {
    const t = j / ROWS;
    const y = top - (top - bottom) * t;
    // tucked over the forearm at the top, then hanging free, flaring a little
    const z = 0.085 * Math.min(1, t / 0.18) ** 0.6 + 0.01 * t;
    for (let i = 0; i <= COLS; i++) {
      const s = i / COLS;
      const x = x0 + (x1 - x0) * s + (s - 0.5) * 0.02 * t;
      pos.push(x, y, z + 0.006 * Math.sin(s * Math.PI * 2 + t * 5));
    }
  }
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const k = j * (COLS + 1) + i;
      index.push(k, k + COLS + 1, k + 1, k + 1, k + COLS + 1, k + COLS + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  const panel = new THREE.Mesh(geo, material);
  panel.name = "W_O3_StoleEnd";
  panel.position.copy(stole.position);
  panel.quaternion.copy(stole.quaternion);
  panel.scale.copy(stole.scale);
  panel.castShadow = true;
  panel.receiveShadow = true;
  stole.parent?.add(panel);

  // tassels: copies of the stole's front-end tassels, moved to this end
  const front: THREE.Mesh[] = [];
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !/^W_O3_Tassel/.test(m.name)) return;
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    if (m.geometry.boundingBox!.getCenter(new THREE.Vector3()).z > 0) front.push(m);
  });
  front.forEach((t, i) => {
    const c = t.clone();
    c.name = `W_O3_TasselR${i}`;
    c.position.add(new THREE.Vector3((x0 + x1) / 2 + 0.15, bottom - 0.66, 0.095 - 0.165));
    t.parent?.add(c);
  });
}

/**
 * Tailored shoulders. The model's coat top is a round dome (down to ~1.45 m
 * at the shoulder edge) with a full sphere for each sleeve head sitting on it,
 * which reads as two balls. A cut sherwani has a straight shoulder seam
 * falling ~21° from the collar to a crisp shoulder point, then a short,
 * firm roll into the sleeve. Upper vertices are lifted onto that line;
 * `lift` keeps a layer on top (the stole) just above the coat.
 */
const NECK = { x: 0.07, y: 1.56 };
const SHOULDER_POINT = { x: 0.235, y: 1.495 };

function shoulderLine(ax: number) {
  const t = THREE.MathUtils.clamp((ax - NECK.x) / (SHOULDER_POINT.x - NECK.x), 0, 1);
  return THREE.MathUtils.lerp(NECK.y, SHOULDER_POINT.y, t);
}

function tailorShoulders(mesh: THREE.Mesh, lift: number) {
  const pos = mesh.geometry.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const ax = Math.abs(x);
    if (y < 1.38 || ax < NECK.x + 0.005) continue;
    // fade in away from the neckline, and over the upper torso only
    const w =
      THREE.MathUtils.smoothstep(y, 1.38, 1.47) * THREE.MathUtils.smoothstep(ax, NECK.x + 0.005, NECK.x + 0.03);
    const target = shoulderLine(ax) + lift;
    if (target > y) pos.setY(i, THREE.MathUtils.lerp(y, target, w));
  }
  pos.needsUpdate = true;
  mesh.geometry.computeVertexNormals();
  mesh.geometry.computeBoundingBox();
  mesh.geometry.computeBoundingSphere();
}

/**
 * Sleeves as a person wears them, not a mannequin's ball-and-socket arm: one
 * continuous tube per arm that starts inside the torso under the shoulder
 * seam, rounds over the deltoid, runs down the upper arm with a slight
 * outward hang, bends a little forward at the elbow (soft creases on the
 * inside) and tapers to the wrist, where the zari cuff closes it.
 * Model frame: metres, Y up, front +z; `side` = ±1.
 */
function sleeveGeometry(side: number) {
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.115 * side, 1.47, 0.0),
    new THREE.Vector3(0.18 * side, 1.445, 0.0),
    new THREE.Vector3(0.228 * side, 1.31, -0.004),
    new THREE.Vector3(0.262 * side, 1.165, -0.016),
    new THREE.Vector3(0.287 * side, 1.045, -0.032),
    new THREE.Vector3(0.305 * side, 0.93, -0.045),
  ]);
  // radius along the arm: shoulder cap, deltoid, upper arm, elbow, forearm, wrist
  const R: [number, number][] = [
    [0, 0.05],
    [0.08, 0.066],
    [0.2, 0.061],
    [0.42, 0.053],
    [0.56, 0.049],
    [0.78, 0.046],
    [1, 0.042],
  ];
  const radius = (t: number) => {
    for (let i = 1; i < R.length; i++) {
      if (t <= R[i][0]) {
        const k = (t - R[i - 1][0]) / (R[i][0] - R[i - 1][0]);
        const s = k * k * (3 - 2 * k);
        return R[i - 1][1] + (R[i][1] - R[i - 1][1]) * s;
      }
    }
    return R[R.length - 1][1];
  };
  const ALONG = 72;
  const AROUND = 40;
  const pos: number[] = [];
  const index: number[] = [];
  const P = new THREE.Vector3();
  const T = new THREE.Vector3();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const Z = new THREE.Vector3(0, 0, 1);
  for (let j = 0; j <= ALONG; j++) {
    const t = j / ALONG;
    path.getPointAt(t, P);
    path.getTangentAt(t, T);
    a.crossVectors(T, Z).normalize(); // across the arm (left/right)
    b.crossVectors(a, T).normalize(); // front/back
    const r = radius(t);
    for (let i = 0; i <= AROUND; i++) {
      const th = (i / AROUND) * Math.PI * 2;
      const cs = Math.cos(th);
      const sn = Math.sin(th);
      // inner-elbow creases (front of the arm), a few soft drape folds lower down
      const front = Math.max(0, sn * Math.sign(b.z || 1));
      const crease = 0.035 * Math.sin(t * 95) * Math.exp(-(((t - 0.55) / 0.08) ** 2)) * front;
      const drape = 0.018 * Math.sin(th * 3 + t * 7) * THREE.MathUtils.smoothstep(t, 0.3, 0.9);
      // slightly deeper front-to-back than across, like a real upper arm
      const rr = r * (1 + crease + drape);
      pos.push(
        P.x + rr * (cs * a.x * 0.96 + sn * b.x * 1.04),
        P.y + rr * (cs * a.y * 0.96 + sn * b.y * 1.04),
        P.z + rr * (cs * a.z * 0.96 + sn * b.z * 1.04),
      );
    }
  }
  for (let j = 0; j < ALONG; j++) {
    for (let i = 0; i < AROUND; i++) {
      const k = j * (AROUND + 1) + i;
      if (side > 0) index.push(k, k + 1, k + AROUND + 1, k + 1, k + AROUND + 2, k + AROUND + 1);
      else index.push(k, k + AROUND + 1, k + 1, k + 1, k + AROUND + 1, k + AROUND + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(index);
  geo.computeVertexNormals();
  return geo;
}

function addHumanSleeves(coat: THREE.Mesh, material: THREE.Material) {
  for (const side of [-1, 1]) {
    const sleeve = new THREE.Mesh(sleeveGeometry(side), material);
    sleeve.name = side < 0 ? "W_O3_ArmSleeveL" : "W_O3_ArmSleeveR";
    sleeve.position.copy(coat.position);
    sleeve.quaternion.copy(coat.quaternion);
    sleeve.scale.copy(coat.scale);
    sleeve.castShadow = true;
    sleeve.receiveShadow = true;
    coat.parent?.add(sleeve);
  }
}

/**
 * The bandhgala stand collar (~5 cm), zari all round, open at the front with
 * the two ends meeting at the throat — the model's coat stops at the neckline.
 */
function addCollar(coat: THREE.Mesh, tex: O3Textures, coatTop: number) {
  const height = 0.05;
  const gap = 0.16; // half-angle of the front opening (radians)
  const geo = new THREE.CylinderGeometry(0.064, 0.07, height, 48, 4, true, gap, Math.PI * 2 - gap * 2);
  geo.translate(0, coatTop - 0.008 + height / 2, -0.005);
  const box = new THREE.Vector4(coatTop - 0.008, coatTop - 0.008 + height, 0, -0.005);
  const collar = new THREE.Mesh(geo, o3Material(tex, MODE.cuff, box, new THREE.Vector4()));
  collar.name = "W_O3_Collar";
  collar.position.copy(coat.position);
  collar.quaternion.copy(coat.quaternion);
  collar.scale.copy(coat.scale);
  collar.castShadow = true;
  collar.receiveShadow = true;
  coat.parent?.add(collar);
}

/** Dress O3 in its reference look. Call after prepareInterior. */
export function dressO3(root: THREE.Object3D, tex: O3Textures) {
  const shoe = new THREE.MeshPhysicalMaterial({
    color: "#d6ccb8",
    roughness: 0.5,
    sheen: 0.6,
    sheenColor: new THREE.Color("#fff4e2"),
    envMapIntensity: 0.5,
  });
  let stole: THREE.Mesh | null = null;
  let stoleMat: THREE.MeshPhysicalMaterial | null = null;
  const meshes: THREE.Mesh[] = [];
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && /^W_O3_/.test(m.name)) meshes.push(m);
  });
  for (const mesh of meshes) {
    if (mesh.name === "W_O3_Coat") tailorShoulders(mesh, 0);
    else if (mesh.name === "W_O3_Form") tailorShoulders(mesh, -0.012);
    else if (mesh.name === "W_O3_Stole") tailorShoulders(mesh, 0.012);
    else if (/^W_O3_(Sleeve[LR]|ShCap|Arm[LR])/.test(mesh.name)) mesh.visible = false;
  }
  for (const mesh of meshes) {
    const name = mesh.name;
    const { b, box } = boxOf(mesh);
    const extra = new THREE.Vector4();
    let mode: number | null = null;
    if (name === "W_O3_Coat") {
      mode = MODE.coat;
      extra.set(b.min.y + (b.max.y - b.min.y) * 0.37, 0, 0, 0);
      addCollar(mesh, tex, b.max.y);
      addHumanSleeves(mesh, o3Material(tex, MODE.silk, new THREE.Vector4(0.93, 1.5, 0, 0), new THREE.Vector4()));
    } else if (/^W_O3_(Sleeve[LR]|ShCap)/.test(name)) mode = MODE.silk;
    else if (/^W_O3_Cuff[LR]$/.test(name)) mode = MODE.cuff;
    else if (name === "W_O3_Stole") {
      mode = MODE.stole;
      extra.set((b.min.x + b.max.x) / 2, (b.max.x - b.min.x) / 2, b.min.y, 0);
    } else if (/^W_O3_Pant[LR]$/.test(name)) mode = MODE.churidar;
    else if (name === "W_O3_Turban") mode = MODE.turban;
    else if (name === "W_O3_Plume") mode = MODE.plume;
    else if (name === "W_O3_Form") mode = MODE.kurta;
    else if (/^W_O3_Tassel/.test(name)) mode = MODE.tassel;
    else if (/^W_O3_Shoe[LR]$/.test(name)) mesh.material = shoe;
    if (mode === null) continue;
    const mat = o3Material(tex, mode, box, extra);
    mesh.material = mat;
    if (mode === MODE.stole) {
      stole = mesh;
      stoleMat = mat;
    }
  }
  if (stole && stoleMat) {
    const endMat = o3Material(
      tex,
      MODE.stole,
      new THREE.Vector4(0.62, 0.98, 0.285, 0.08),
      new THREE.Vector4(0.285, 0.075, 0.62, 0),
    );
    addStoleEnd(root, stole, endMat);
  }
}
