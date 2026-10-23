import * as THREE from "three";
import type { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { GTAOPass } from "three/examples/jsm/postprocessing/GTAOPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

/**
 * Hall-only post effects, faded in with `inside`:
 * - GTAO contact shadows so outfits, plinths, elephants and the fountain sit
 *   in the room instead of floating on it;
 * - a cinematic grade: cool deep shadows, amber highlights, filmic contrast
 *   and a lens vignette.
 */

/**
 * GTAO that skips objects tagged `userData.noAO` (additive light shafts) and
 * does not re-render every shadow map for its normal pre-pass.
 */
class HallAOPass extends GTAOPass {
  private hidden: THREE.Object3D[] = [];

  render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget,
    deltaTime: number,
    maskActive: boolean,
  ) {
    this.scene.traverse((o) => {
      if (o.userData.noAO && o.visible) {
        o.visible = false;
        this.hidden.push(o);
      }
    });
    const autoUpdate = renderer.shadowMap.autoUpdate;
    renderer.shadowMap.autoUpdate = false;
    super.render(renderer, writeBuffer, readBuffer, deltaTime, maskActive);
    renderer.shadowMap.autoUpdate = autoUpdate;
    this.hidden.forEach((o) => (o.visible = true));
    this.hidden.length = 0;
  }
}

/**
 * HDR safety net. A lamp grazing a mirror-like coat can overflow the
 * half-float buffer to Inf, and degenerate maths can leave a NaN; bloom then
 * smears that single pixel over the whole frame as a white flash. This pass
 * zeroes non-finite pixels and soft-caps extreme highlights before bloom.
 */
const SanitizeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    cap: { value: 48 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float cap;
    varying vec2 vUv;
    // Bit-level test: D3D/ANGLE compiles isnan()/isinf() and v != v away
    // ("value cannot be NaN"), but cannot optimise the raw exponent bits.
    bool bad(float x) {
      return (floatBitsToUint(x) & 0x7f800000u) == 0x7f800000u;
    }
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 v = c.rgb;
      if (bad(v.r) || bad(v.g) || bad(v.b)) v = vec3(0.0);
      v = clamp(v, 0.0, 65000.0);
      float peak = max(max(v.r, v.g), v.b);
      if (peak > cap) v *= cap / peak;
      float a = bad(c.a) ? 1.0 : clamp(c.a, 0.0, 1.0);
      gl_FragColor = vec4(v, a);
    }
  `,
};

/**
 * Final output (replaces three's OutputPass): tone mapping + sRGB.
 * Outside it is ACES, which suits the aged sunlit facade. Inside it blends to
 * Khronos PBR Neutral — built for e-commerce colour fidelity, it keeps the
 * fabric's hue and saturation (maroon stays maroon instead of drifting to
 * orange) — plus a camera-style white balance that neutralises the warm
 * lamp cast, the way a photographer would for product shots.
 */
const TrueColorShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    toneMappingExposure: { value: 1 },
    neutral: { value: 0 },
    // gains ≈ 3200 K → 5000 K, normalised to keep luminance
    whiteBalance: { value: new THREE.Vector3(0.949, 1.004, 1.11) },
  },
  // Raw shader (like three's OutputShader): a regular ShaderMaterial would get
  // the tone-mapping / colour-space chunks injected again → duplicate symbols.
  vertexShader: /* glsl */ `
    precision highp float;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    attribute vec3 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    precision highp float;
    #include <tonemapping_pars_fragment>
    #include <colorspace_pars_fragment>
    uniform sampler2D tDiffuse;
    uniform float neutral;
    uniform vec3 whiteBalance;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 lin = c.rgb * mix(vec3(1.0), whiteBalance, neutral);
      // Outside: AgX (photographic highlight roll-off, faithful hues);
      // inside: PBR Neutral (product colour fidelity).
      vec3 mapped = mix(AgXToneMapping(lin), NeutralToneMapping(lin), neutral);
      gl_FragColor = sRGBTransferOETF(vec4(clamp(mapped, 0.0, 1.0), c.a));
    }
  `,
};

const GradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    amount: { value: 0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float amount;
    varying vec2 vUv;
    const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
    void main() {
      vec4 src = texture2D(tDiffuse, vUv);
      vec3 col = clamp(src.rgb, 0.0, 1.0);
      float l = dot(col, LUMA);
      vec3 g = col;
      // Split-tone: teal in the shadows, amber in the highlights.
      // (kept subtle: products must keep their true colour)
      g += vec3(-0.012, 0.002, 0.016) * pow(1.0 - l, 2.2);
      g += vec3(0.02, 0.008, -0.014) * l * l;
      g = clamp(g, 0.0, 1.0);
      // Filmic S-curve for deeper blacks and rolled highlights.
      g = mix(g, g * g * (3.0 - 2.0 * g), 0.2);
      g = mix(vec3(dot(g, LUMA)), g, 1.02);
      // Lens vignette, slightly wider than tall.
      vec2 d = (vUv - 0.5) * vec2(1.0, 0.82);
      g *= mix(0.6, 1.0, smoothstep(0.78, 0.18, length(d)));
      gl_FragColor = vec4(mix(col, clamp(g, 0.0, 1.0), amount), src.a);
    }
  `,
};

/**
 * Adds AO (after the scene render) and the grade (at the very end).
 * Call before/after adding bloom + output passes as noted.
 */
export function createHallPost(
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
) {
  const ao = new HallAOPass(scene, camera, width, height);
  ao.updateGtaoMaterial({
    radius: 0.6,
    distanceExponent: 1.4,
    thickness: 1.2,
    distanceFallOff: 1,
    scale: 1.25,
    samples: 16,
  });
  ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, samples: 16 });
  ao.blendIntensity = 0;
  ao.enabled = false;

  const grade = new ShaderPass(GradeShader);
  grade.enabled = false;

  // Always on (outside too): cheap, and the facade sun can spike as well.
  const sanitize = new ShaderPass(SanitizeShader);
  const output = new ShaderPass(
    new THREE.RawShaderMaterial({
      name: "TrueColorOutput",
      uniforms: THREE.UniformsUtils.clone(TrueColorShader.uniforms),
      vertexShader: TrueColorShader.vertexShader,
      fragmentShader: TrueColorShader.fragmentShader,
    }),
  );

  return {
    /** Insert right after the RenderPass. */
    ao,
    /** Insert after AO, before bloom. */
    sanitize,
    /** Tone mapping + sRGB; use in place of OutputPass. */
    output,
    /** Insert after the output pass (works in display space). */
    grade,
    addTo(composer: EffectComposer, stage: "ao" | "sanitize" | "output" | "grade") {
      composer.addPass({ ao, sanitize, output, grade }[stage]);
    },
    update(inside: number, exposure: number) {
      output.uniforms.toneMappingExposure.value = exposure;
      output.uniforms.neutral.value = THREE.MathUtils.smoothstep(inside, 0.15, 0.85);
      // Contact shadows everywhere: carved relief, door frame, pillars, lanterns.
      ao.enabled = true;
      ao.blendIntensity = THREE.MathUtils.lerp(0.6, 0.9, inside);
      grade.enabled = inside > 0.01;
      grade.uniforms.amount.value = inside;
    },
  };
}
