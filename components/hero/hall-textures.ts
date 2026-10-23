import * as THREE from "three";

/**
 * Realistic PBR texture sets for the haveli hall (public/textures/hall), made
 * to replace the Blender export's flat procedural swatches:
 *   floor   — polished Makrana marble tiles, 2.4 m repeat (16 distinct tiles)
 *   marble  — Makrana marble for trims, columns, rims and plinths, 1 m
 *   plaster — ivory araish (burnished lime) plaster, 2 m
 *   dome    — araish plaster with a gold-leaf ogee jaal, 2 m
 *   brass   — aged brass / gilt with brushing and tarnish, 0.5 m
 *   pile    — hand-knotted wool pile detail for the carpets, 0.1 m
 *   pichwai — two lotus-pond Pichwai paintings
 * Each set has basecolor (sRGB), orm (G = roughness, B = metal) and normal.
 */
const BASE = "/textures/hall/";
const SETS = ["floor", "marble", "plaster", "dome", "brass"] as const;

export type PbrSet = { map: THREE.Texture; orm: THREE.Texture; normal: THREE.Texture };
export type HallTextures = Record<(typeof SETS)[number], PbrSet> & {
  pile: { orm: THREE.Texture; normal: THREE.Texture };
  pichwai: THREE.Texture[];
};

/** Box-projected hall UVs run 1 unit = 2 m; repeat so each set lands at real size. */
export const UV_METRES = 2;

function prep(tex: THREE.Texture, srgb: boolean) {
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.flipY = false; // glTF UV convention
  tex.anisotropy = 8;
  return tex;
}

/** Load every set; `onProgress(done, total)` counts finished files. */
export async function loadHallTextures(onProgress: (done: number, total: number) => void) {
  const loader = new THREE.TextureLoader();
  const files: [string, boolean][] = [];
  for (const s of SETS) {
    files.push([`${s}_basecolor.jpg`, true], [`${s}_orm.jpg`, false], [`${s}_normal.jpg`, false]);
  }
  files.push(["pile_orm.jpg", false], ["pile_normal.jpg", false]);
  files.push(["pichwai_a_basecolor.jpg", true], ["pichwai_b_basecolor.jpg", true]);
  let done = 0;
  const loaded = await Promise.all(
    files.map(([name, srgb]) =>
      loader.loadAsync(BASE + name).then((t) => {
        done++;
        onProgress(done, files.length);
        return [name, prep(t, srgb)] as const;
      }),
    ),
  );
  const get = (name: string) => loaded.find(([n]) => n === name)![1];
  const out = {} as HallTextures;
  for (const s of SETS) {
    out[s] = { map: get(`${s}_basecolor.jpg`), orm: get(`${s}_orm.jpg`), normal: get(`${s}_normal.jpg`) };
  }
  out.pile = { orm: get("pile_orm.jpg"), normal: get("pile_normal.jpg") };
  out.pichwai = [get("pichwai_a_basecolor.jpg"), get("pichwai_b_basecolor.jpg")];
  return out;
}

/** A per-material copy of a set with its own repeat (tile size in metres). */
export function tiled(set: PbrSet, metres: number, uvMetres = UV_METRES): PbrSet {
  const r = uvMetres / metres;
  const clone = (t: THREE.Texture) => {
    const c = t.clone();
    c.repeat.set(r, r);
    c.needsUpdate = true;
    return c;
  };
  return { map: clone(set.map), orm: clone(set.orm), normal: clone(set.normal) };
}

/** Apply a PBR set to a physical material (roughness/metal come from the ORM). */
export function applySet(m: THREE.MeshPhysicalMaterial, set: PbrSet, normalScale = 1) {
  m.map = set.map;
  m.color.set("#ffffff");
  m.roughnessMap = set.orm;
  m.metalnessMap = set.orm;
  m.roughness = 1;
  m.metalness = 1;
  m.normalMap = set.normal;
  m.normalScale = new THREE.Vector2(normalScale, normalScale);
  m.needsUpdate = true;
}
