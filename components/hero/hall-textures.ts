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
 *   glass   — leaded antique stained glass for the two hall windows
 *   frame   — the Kesari photos in carved royal giltwood frames (wall niches)
 *   o3/*    — the ivory sherwani (O3): embroidered silk, plain silk, zari
 *             border, stole weave; basecolor + data (R height, G rough, B metal)
 * Each set has basecolor (sRGB), orm (G = roughness, B = metal) and normal.
 */
const BASE = "/textures/hall/";
const SETS = ["floor", "marble", "plaster", "dome", "brass", "glass"] as const;

export type PbrSet = { map: THREE.Texture; orm: THREE.Texture; normal: THREE.Texture };
export type HallTextures = Record<(typeof SETS)[number], PbrSet> & {
  pile: { orm: THREE.Texture; normal: THREE.Texture };
  pichwai: THREE.Texture[];
  /** transmitted daylight through the stained glass */
  glassEmissive: THREE.Texture;
  /** softened, richer glass pattern: the light it throws into the room */
  glassCookie: THREE.Texture;
  /** framed photos for the wall niches: one basecolor each, shared gilt ORM + relief */
  frames: PbrSet[];
  o3: O3Textures;
};

const FRAMED_PHOTOS = 4;

const O3_SETS = ["silk", "plain", "border", "stole"] as const;
export type O3Textures = Record<(typeof O3_SETS)[number], { map: THREE.Texture; data: THREE.Texture }>;

/** Box-projected hall UVs run 1 unit = 2 m; repeat so each set lands at real size. */
export const UV_METRES = 2;

function prep(tex: THREE.Texture, srgb: boolean) {
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.flipY = false; // glTF UV convention
  tex.anisotropy = 16; // clamped to the GPU max
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
  files.push(["glass_emissive.jpg", true], ["glass_cookie.jpg", true]);
  files.push(["frame_orm.jpg", false], ["frame_normal.jpg", false]);
  for (let i = 1; i <= FRAMED_PHOTOS; i++) files.push([`frame_${i}_basecolor.jpg`, true]);
  for (const s of O3_SETS) files.push([`../o3/o3_${s}_basecolor.jpg`, true], [`../o3/o3_${s}_data.jpg`, false]);
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
  out.glassEmissive = get("glass_emissive.jpg");
  out.glassCookie = get("glass_cookie.jpg");
  out.o3 = {} as O3Textures;
  for (const s of O3_SETS) {
    const map = get(`../o3/o3_${s}_basecolor.jpg`);
    const data = get(`../o3/o3_${s}_data.jpg`);
    // projected in garment space: image top = up
    map.flipY = data.flipY = true;
    map.anisotropy = data.anisotropy = 16;
    map.needsUpdate = data.needsUpdate = true;
    out.o3[s] = { map, data };
  }
  out.frames = [];
  for (let i = 1; i <= FRAMED_PHOTOS; i++) {
    out.frames.push({ map: get(`frame_${i}_basecolor.jpg`), orm: get("frame_orm.jpg"), normal: get("frame_normal.jpg") });
  }
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
