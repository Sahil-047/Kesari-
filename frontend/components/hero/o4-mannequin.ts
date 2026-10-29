import * as THREE from "three";

/**
 * Bust sculpting for the last lehenga (O4, top-right at x ≈ 4.2, z ≈ -7.4).
 *
 * `lehenga_o4.glb` replaces the original O4 garment in the interior scene
 * frame (world X ≈ 4.02..4.38, Y ≈ 2.10..2.47, Z ≈ -7.51..-7.27), while the
 * underlying mannequin torso `W_O4_Form` sits in local coordinates around its
 * node translation (4.2, 0.98, -7.4). We convert vertices to the interior
 * scene frame, sculpt two anatomical cup volumes on the front chest (left and
 * right breasts with natural cleavage separation, fuller projection, slight
 * under-bust lift, and smooth torso falloff), and recompute vertex normals so
 * the embroidered blouse, neckline border, and mannequin form fit seamlessly.
 */

const O4_MANNEQUIN_AND_BLOUSE = /^(W_O4_Form|W_O4_Blouse|O4R_Blouse|O4R_NeckFront|O4R_HemBand)$/;

// Bust centres in the interior scene frame (metres, Y up, front = +Z).
const BUST_X_CENTER = 4.2;
const BUST_X_OFFSET = 0.068; // left/right cup separation from sternum
const BUST_Y_CENTER = 2.275; // mid-bust height on the blouse (2.10..2.47)
const BUST_Z_SPINE = -7.39;  // torso mid-plane; front is > BUST_Z_SPINE

// Ellipsoid radii of each cup (horizontal, vertical, depth)
const CUP_RX = 0.078;
const CUP_RY = 0.088;

export function sculptO4Bust(interiorRoot: THREE.Object3D) {
  interiorRoot.updateMatrixWorld(true);
  const rootInv = interiorRoot.matrixWorld.clone().invert();
  const v = new THREE.Vector3();

  interiorRoot.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh || !O4_MANNEQUIN_AND_BLOUSE.test(mesh.name)) return;

    // Clone geometry if shared with another mannequin (e.g. W_O2_Form shares mesh 123 with W_O4_Form).
    mesh.geometry = mesh.geometry.clone();
    const geo = mesh.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    if (!pos) return;

    const toRoot = rootInv.clone().multiply(mesh.matrixWorld);
    const toLocal = toRoot.clone().invert();

    // Slightly more projection on the outer garment so the mannequin never pokes through.
    const isForm = mesh.name === "W_O4_Form";
    const forwardAmp = isForm ? 0.036 : 0.042;
    const liftAmp = isForm ? 0.008 : 0.01;
    const sideAmp = isForm ? 0.007 : 0.009;

    let modified = false;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(toRoot);

      // Only affect the front of the chest within the blouse vertical span.
      if (v.z <= BUST_Z_SPINE - 0.01 || v.y < 2.11 || v.y > 2.44) continue;

      const frontMask = THREE.MathUtils.smoothstep(v.z, BUST_Z_SPINE - 0.005, BUST_Z_SPINE + 0.045);
      const yMask =
        THREE.MathUtils.smoothstep(v.y, 2.11, 2.18) *
        (1 - THREE.MathUtils.smoothstep(v.y, 2.37, 2.44));
      if (frontMask <= 0 || yMask <= 0) continue;

      const dxL = (v.x - (BUST_X_CENTER - BUST_X_OFFSET)) / CUP_RX;
      const dxR = (v.x - (BUST_X_CENTER + BUST_X_OFFSET)) / CUP_RX;
      const dy = (v.y - BUST_Y_CENTER) / CUP_RY;

      // Asymmetric vertical profile: fuller lower cup roundness, gentler upper slope.
      const dyShaped = dy < 0 ? dy * 1.12 : dy * 0.88;
      const r2L = dxL * dxL + dyShaped * dyShaped;
      const r2R = dxR * dxR + dyShaped * dyShaped;

      const cupL = Math.max(0, 1 - r2L) ** 1.65;
      const cupR = Math.max(0, 1 - r2R) ** 1.65;

      // Soft cleavage bridge between the two cups so the fabric drapes across the sternum.
      const centerDist = Math.abs(v.x - BUST_X_CENTER) / BUST_X_OFFSET;
      const bridge =
        Math.max(0, 1 - centerDist * centerDist) *
        Math.max(0, 1 - dyShaped * dyShaped) ** 1.8 *
        0.28;

      const w = (cupL + cupR + bridge) * frontMask * yMask;
      if (w <= 1e-5) continue;

      // Forward projection (+Z), subtle upward fullness (+Y), and slight outer roundness (±X).
      v.z += forwardAmp * w;
      v.y += liftAmp * w * (0.65 - 0.35 * dy);
      v.x += sideAmp * (cupR - cupL) * frontMask * yMask;

      v.applyMatrix4(toLocal);
      pos.setXYZ(i, v.x, v.y, v.z);
      modified = true;
    }

    if (modified) {
      pos.needsUpdate = true;
      geo.computeVertexNormals();
      geo.computeBoundingBox();
      geo.computeBoundingSphere();
    }
  });
}
