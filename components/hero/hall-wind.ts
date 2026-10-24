import * as THREE from "three";

/**
 * A breeze through the hall: it comes in at the stained-glass windows (back
 * wall) and flows toward the door, in slow uneven gusts. The same gust drives
 * the cloth, the dust and the wind sound, so they all swell together.
 */

/** Wind direction in the interior model frame (from the windows toward the door). */
export const WIND_DIR = new THREE.Vector3(0.22, 0, 1).normalize();

/** Gust strength 0.25..1: a steady breath with slower swells and lulls. */
export function gust(t: number) {
  const g =
    0.6 +
    0.22 * Math.sin(t * 0.31) +
    0.14 * Math.sin(t * 0.83 + 1.7) +
    0.08 * Math.sin(t * 2.1 + 0.4) -
    0.18 * Math.max(0, Math.sin(t * 0.07 + 2)) ** 6;
  return THREE.MathUtils.clamp(g, 0.25, 1);
}

/**
 * How freely each garment piece moves. `flex` scales the sway; pieces hang from
 * their own top (waist, shoulder, knot), so the hem moves most and the pin not at all.
 */
const CLOTH: [RegExp, number][] = [
  [/^W_O\d_Dupatta$/, 1.0],
  [/^O4R_(Skirt|HemBand|BeadCurtain)$/, 1.0],
  [/^W_O\d_Skirt$/, 1.0],
  [/^O4R_Latkans$/, 1.8],
  [/^W_O3_Tassel/, 3.0],
  [/^W_O3_Stole/, 0.8],
  [/^W_O3_Plume$/, 0.6],
  [/^W_O\d_(Kurta|Jacket|Coat)$/, 0.35],
  [/^W_O\d_(Trouser_[LR]|Pant[LR])$/, 0.22],
  [/^(W_O\d_|O4R_)(Sleeve_?[LR]|Cuff[LR]|Blouse)$/, 0.15],
];

type ClothUniforms = {
  windTime: { value: number };
  windGust: { value: number };
  windPhase: { value: number };
};

const CLOTH_GLSL = /* glsl */ `
  uniform float windTime;
  uniform float windGust;
  uniform float windPhase;
  uniform mat4 clothRel;
  uniform mat3 clothRelInv;
  uniform vec4 clothPin;   // xz = hanging axis, y = pin height, w = flex
  uniform vec3 windDir;
  vec3 clothWind(vec3 local) {
    vec3 mp = (clothRel * vec4(local, 1.0)).xyz;
    float hang = max(clothPin.y - mp.y, 0.0);
    float reach = pow(hang, 1.3) * clothPin.w;
    vec2 r = mp.xz - clothPin.xz;
    float ang = atan(r.y, r.x);
    // Steady push with the gust, plus ripples running down and around the hem.
    float push = 0.055 * windGust * (0.75 + 0.25 * sin(windPhase * 2.3 + mp.x * 1.7));
    float ripple = 0.022 * (0.4 + windGust)
      * sin(windTime * 3.1 - hang * 7.5 + ang * 3.0 + mp.x * 2.0)
      * (0.6 + 0.4 * sin(windTime * 1.3 + ang * 2.0));
    vec3 side = vec3(-windDir.z, 0.0, windDir.x);
    float flutter = 0.018 * windGust * sin(windTime * 4.7 - hang * 11.0 + ang);
    // Leeward side billows out, windward side presses in.
    vec3 radial = length(r) > 1e-4 ? vec3(r.x, 0.0, r.y) / length(r) : vec3(0.0);
    float billow = 0.02 * windGust * dot(radial, windDir);
    vec3 d = reach * (windDir * push + radial * (ripple + billow) + side * flutter);
    d.y += reach * 0.012 * windGust * sin(windTime * 2.2 - hang * 6.0 + ang * 2.0);
    return local + clothRelInv * d;
  }
`;

function inject(shader: THREE.WebGLProgramParametersWithUniforms, uniforms: Record<string, THREE.IUniform>) {
  Object.assign(shader.uniforms, uniforms);
  shader.vertexShader = shader.vertexShader
    .replace("#include <common>", `#include <common>\n${CLOTH_GLSL}`)
    .replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed = clothWind(transformed);");
}

/**
 * Make the garments sway in the breeze (vertex shader, per piece). Call after
 * the outfits are in `interiorRoot` and before it is placed in the scene.
 */
export function addClothWind(interiorRoot: THREE.Object3D) {
  const shared: ClothUniforms = {
    windTime: { value: 0 },
    windGust: { value: 0.6 },
    windPhase: { value: 0 },
  };
  interiorRoot.updateMatrixWorld(true);
  const rootInv = interiorRoot.matrixWorld.clone().invert();
  const v = new THREE.Vector3();

  interiorRoot.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || Array.isArray(mesh.material)) return;
    const flex = CLOTH.find(([re]) => re.test(mesh.name))?.[1];
    if (flex === undefined) return;
    // Mesh-local → interior model frame (metres, Y up), and back for offsets.
    const rel = rootInv.clone().multiply(mesh.matrixWorld);
    const relInv = new THREE.Matrix3().setFromMatrix4(rel).invert();
    const pos = mesh.geometry.attributes.position;
    const box = new THREE.Box3();
    for (let i = 0; i < pos.count; i++) box.expandByPoint(v.fromBufferAttribute(pos, i).applyMatrix4(rel));
    const c = box.getCenter(new THREE.Vector3());
    const uniforms: Record<string, THREE.IUniform> = {
      ...shared,
      clothRel: { value: rel },
      clothRelInv: { value: relInv },
      clothPin: { value: new THREE.Vector4(c.x, box.max.y, c.z, flex) },
      windDir: { value: WIND_DIR },
    };
    // Keep any shader patch the garment already has (e.g. the O3 embroidery).
    const original = mesh.material as THREE.Material;
    const prev = original.onBeforeCompile;
    const prevKey = original.customProgramCacheKey();
    const material = original.clone();
    material.onBeforeCompile = (shader, renderer) => {
      prev.call(original, shader, renderer);
      inject(shader, uniforms);
    };
    material.customProgramCacheKey = () => `cloth-wind:${prevKey}`;
    mesh.material = material;
    // Shadows move with the cloth too.
    const depth = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    depth.onBeforeCompile = (shader) => inject(shader, uniforms);
    depth.customProgramCacheKey = () => "cloth-wind-depth";
    const distance = new THREE.MeshDistanceMaterial();
    distance.onBeforeCompile = (shader) => inject(shader, uniforms);
    distance.customProgramCacheKey = () => "cloth-wind-distance";
    mesh.customDepthMaterial = depth;
    mesh.customDistanceMaterial = distance;
  });

  return {
    update(t: number, windPhase: number) {
      shared.windTime.value = t;
      shared.windGust.value = gust(t);
      shared.windPhase.value = windPhase;
    },
  };
}
