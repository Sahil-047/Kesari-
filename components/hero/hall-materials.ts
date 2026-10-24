import * as THREE from "three";
import { applySet, tiled, type HallTextures } from "@/components/hero/hall-textures";

/**
 * Material study for the haveli hall. Every interior material is upgraded to
 * MeshPhysicalMaterial and given the response its real-world counterpart has:
 * polished marble and floor with a lacquer-like clear coat, lacquered gold,
 * silk and embroidery with sheen, iridescent organza, glazed ceramics,
 * varnished paintings, water with real transmission.
 *
 * Reflection strengths assume the warm interior cube map from
 * `bakeInteriorEnv`, not the neutral room environment.
 */

type Phys = THREE.MeshPhysicalMaterial;

const MIN_ROUGHNESS = 0.1;

function toPhysical(src: THREE.MeshStandardMaterial): Phys {
  if ((src as Phys).isMeshPhysicalMaterial) return src as Phys;
  const phys = new THREE.MeshPhysicalMaterial();
  THREE.MeshStandardMaterial.prototype.copy.call(phys, src);
  phys.defines = { STANDARD: "", PHYSICAL: "" };
  phys.name = src.name;
  return phys;
}

/** Sheen tinted from the fabric's own colour, lifted toward white. */
function fabricSheen(m: Phys, amount: number, roughness: number, lift = 0.45) {
  m.sheen = amount;
  m.sheenRoughness = roughness;
  m.sheenColor = m.color.clone().lerp(new THREE.Color("#ffffff"), lift);
}

/** Returns the studied (physical) version of an interior material. */
export function studyInteriorMaterial(
  src: THREE.MeshStandardMaterial,
  tex?: HallTextures,
): THREE.Material {
  if (src.map) src.map.colorSpace = THREE.SRGBColorSpace;
  const name = src.name ?? "";

  // Self-lit materials keep their type; they only need more punch for bloom.
  if (/stained_glass/i.test(name)) {
    if (!tex) {
      src.emissiveIntensity *= 2.6;
      src.envMapIntensity = 0.3;
      return src;
    }
    // Leaded antique glass, backlit by daylight: clear cathedral panes blaze
    // (soft bloom), jewel colours stay deep, the lead came is dull grey metal,
    // and the inner surface is glossy enough to mirror the chandeliers.
    const g = toPhysical(src);
    applySet(g, tex.glass, 1.0);
    g.emissiveMap = tex.glassEmissive;
    g.emissive.set("#ffffff");
    g.emissiveIntensity = 8.5;
    g.clearcoat = 1;
    g.clearcoatRoughness = MIN_ROUGHNESS;
    g.envMapIntensity = 0.8;
    g.side = THREE.DoubleSide;
    g.needsUpdate = true;
    return g;
  }
  if (/lamp/i.test(name)) {
    src.emissiveIntensity *= 2.4;
    return src;
  }
  // Rebuilt O4 lehenga: maps (colour, zari/sequin metal & roughness, relief,
  // sheen, net alpha) are authored in Blender — only set reflection strength.
  if (/^o4_/i.test(name)) {
    src.envMapIntensity = /bead_gold/i.test(name) ? 1.2 : /net/i.test(name) ? 0.5 : 0.45;
    if (/net/i.test(name)) src.side = THREE.DoubleSide;
    return src;
  }

  const m = toPhysical(src);

  if (/gold|brass/i.test(name)) {
    // Lacquered gilt: metal underneath a thin glossy coat.
    m.metalness = 1;
    m.roughness = THREE.MathUtils.clamp(m.roughness, 0.2, 0.3);
    m.clearcoat = 0.45;
    m.clearcoatRoughness = 0.12;
    m.envMapIntensity = 1.25;
    if (tex && /int_gold/i.test(name)) {
      // aged brass: brushing, tarnish in the recesses (these UVs run 1 unit = 1 m)
      applySet(m, tiled(tex.brass, 0.5, 1), 0.8);
      m.clearcoat = 0.3;
    }
  } else if (/chrome/i.test(name)) {
    m.metalness = 1;
    m.roughness = 0.1;
    m.envMapIntensity = 1.3;
  } else if (/int_floor/i.test(name)) {
    // Polished Makrana marble tiles: low roughness with smudges (ORM) under a
    // light polish coat that catches the lamps; hairline grout stays matte.
    if (tex) applySet(m, tiled(tex.floor, 2.4), 0.7);
    else m.roughness = Math.max(m.roughness, 0.35);
    m.clearcoat = 0.5;
    m.clearcoatRoughness = 0.08;
    m.envMapIntensity = 0.65;
  } else if (/marble/i.test(name)) {
    if (tex) applySet(m, tiled(tex.marble, 1), 0.6);
    else m.roughness = Math.max(m.roughness, 0.28);
    m.clearcoat = 0.4;
    m.clearcoatRoughness = 0.12;
    m.envMapIntensity = 0.55;
  } else if (/water/i.test(name)) {
    m.color.set("#cfeef0");
    m.roughness = 0.03;
    m.metalness = 0;
    m.transmission = 0.85;
    m.ior = 1.333;
    m.thickness = 0.25;
    m.attenuationColor = new THREE.Color("#8fd0d4");
    m.attenuationDistance = 0.6;
    m.envMapIntensity = 1.4;
    m.transparent = false;
    m.opacity = 1;
  } else if (/glass_amber/i.test(name)) {
    m.transmission = Math.min(m.transmission || 0.6, 0.6);
    m.ior = 1.5;
    m.envMapIntensity = 1.5;
  } else if (/organza/i.test(name)) {
    // Sheer silk organza: soft metallic shimmer that shifts with the angle.
    m.metalness = 0.35;
    m.roughness = 0.38;
    fabricSheen(m, 1, 0.3, 0.6);
    m.iridescence = 0.35;
    m.iridescenceIOR = 1.3;
    m.iridescenceThicknessRange = [220, 420];
    m.side = THREE.DoubleSide;
    m.envMapIntensity = 0.8;
  } else if (/emb|gore|hem|Embroidery/i.test(name)) {
    // Zari / thread embroidery: dense sheen with a faint metallic glint.
    m.roughness = Math.max(m.roughness, 0.5);
    m.metalness = Math.max(m.metalness, 0.12);
    fabricSheen(m, 0.9, 0.38, 0.55);
    m.sheenColor.lerp(new THREE.Color("#ffd99a"), 0.35);
    m.envMapIntensity = 0.45;
  } else if (/silk|blouse|stole|button|dupatta/i.test(name)) {
    m.roughness = Math.max(m.roughness, 0.45);
    fabricSheen(m, 1, 0.32);
    m.envMapIntensity = 0.4;
  } else if (/linen|plain|turban|shoe|tassel|seam/i.test(name)) {
    // Matte weaves: broad, rough sheen only at grazing angles.
    m.roughness = Math.max(m.roughness, 0.8);
    fabricSheen(m, 0.5, 0.8, 0.5);
    m.envMapIntensity = 0.25;
  } else if (/mannequin/i.test(name)) {
    m.clearcoat = Math.max(m.clearcoat, 0.35);
    m.clearcoatRoughness = 0.25;
    m.envMapIntensity = 0.5;
  } else if (/stand_black/i.test(name)) {
    m.clearcoat = 0.8;
    m.clearcoatRoughness = 0.08;
    m.envMapIntensity = 0.8;
  } else if (/prod_(terracotta|blue|green|maroon|cream)/i.test(name)) {
    // Glazed ceramics on the niches: hard, wet-looking glaze.
    m.clearcoat = 1;
    m.clearcoatRoughness = 0.04;
    m.envMapIntensity = 0.9;
  } else if (/painting/i.test(name)) {
    // Varnished miniatures: a gentle sheen of varnish over matte paint.
    m.roughness = Math.max(m.roughness, 0.7);
    m.clearcoat = 0.5;
    m.clearcoatRoughness = 0.22;
    m.envMapIntensity = 0.35;
  } else if (/dark_wood/i.test(name)) {
    m.clearcoat = 0.55;
    m.clearcoatRoughness = 0.18;
    m.envMapIntensity = 0.5;
  } else if (/ceiling/i.test(name)) {
    // Dome and ceilings: araish lime plaster with a gold-leaf ogee jaal.
    if (tex) applySet(m, tiled(tex.dome, 2), 0.8);
    m.clearcoat = 0.15;
    m.clearcoatRoughness = 0.35;
    m.envMapIntensity = 0.35;
  } else if (/trim/i.test(name)) {
    // Columns, window trims: carved Makrana marble.
    if (tex) applySet(m, tiled(tex.marble, 1), 0.6);
    m.clearcoat = 0.25;
    m.clearcoatRoughness = 0.2;
    m.envMapIntensity = 0.45;
  } else if (/plaster/i.test(name)) {
    // Araish: burnished lime plaster, semi-gloss ivory.
    if (tex) applySet(m, tiled(tex.plaster, 2), 0.7);
    else m.roughness = Math.max(m.roughness, 0.88);
    m.envMapIntensity = 0.3;
  } else if (/int_product/i.test(name)) {
    // Niche backs: same plaster (these UVs are centred metres).
    if (tex) applySet(m, tiled(tex.plaster, 2, 1), 0.7);
    m.envMapIntensity = 0.3;
  } else {
    m.envMapIntensity = 0.3;
  }

  // Near-mirror lobes under close point lights overflow half-float HDR and
  // flash the screen through bloom; keep every lobe above this floor.
  m.roughness = Math.max(m.roughness, MIN_ROUGHNESS);
  if (m.clearcoat > 0) m.clearcoatRoughness = Math.max(m.clearcoatRoughness, MIN_ROUGHNESS);

  m.needsUpdate = true;
  return m;
}
