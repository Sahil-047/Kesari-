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
 * One look for the whole film: Khronos PBR Neutral everywhere — built for
 * e-commerce colour fidelity, it keeps the fabric's hue and saturation —
 * with a camera white balance per scene so both land on the same warm,
 * golden-cream tone: inside it pulls the 3200 K lamp cast part-way toward
 * neutral; outside it warms the daylight by the same amount, so the facade
 * reads as if shot on the same stock and setting as the hall.
 */
const TrueColorShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    toneMappingExposure: { value: 1 },
    neutral: { value: 0 },
    // gains ≈ 3200 K → 5000 K, normalised to keep luminance
    whiteBalance: { value: new THREE.Vector3(0.949, 1.004, 1.11) },
    // daylight → the hall's warm cream (luminance-normalised)
    whiteBalanceOut: { value: new THREE.Vector3(1.025, 1.0, 0.95) },
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
    uniform vec3 whiteBalanceOut;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 lin = c.rgb * mix(whiteBalanceOut, whiteBalance, neutral);
      vec3 mapped = NeutralToneMapping(lin);
      gl_FragColor = sRGBTransferOETF(vec4(clamp(mapped, 0.0, 1.0), c.a));
    }
  `,
};

/**
 * Sunbeams from the stained-glass windows, in screen space (linear HDR, before
 * bloom). Sunlight is parallel, so the streaks run in ONE direction — the
 * sun's direction projected onto the screen — never a radial burst. Each
 * pixel looks back upstream along that direction and gathers only the
 * window's bright glass, fading with distance: parallel shafts leaving the
 * window and slanting down into the hall, tinted by the glass, matching the
 * 3D shafts and the patches on the floor.
 */
const GodRaysShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    lightPos: { value: [new THREE.Vector2(), new THREE.Vector2()] },
    lightRadius: { value: [0, 0] },
    lightOn: { value: [0, 0] },
    /** screen-space travel direction of the sunlight (unit, aspect-corrected) */
    rayDir: { value: [new THREE.Vector2(0, -1), new THREE.Vector2(0, -1)] },
    rayLength: { value: 0.5 },
    aspect: { value: 1 },
    strength: { value: 0 },
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
    uniform vec2 lightPos[2];
    uniform float lightRadius[2];
    uniform float lightOn[2];
    uniform vec2 rayDir[2];
    uniform float rayLength;
    uniform float aspect;
    uniform float strength;
    varying vec2 vUv;
    const int STEPS = 48;
    vec3 beam(vec2 lp, float rad, vec2 dir) {
      // march upstream (against the light's travel), in aspect-corrected units
      vec2 stride = -dir * (rayLength / float(STEPS));
      stride.x /= aspect;
      vec2 uv = vUv;
      vec3 acc = vec3(0.0);
      for (int s = 1; s <= STEPS; s++) {
        uv += stride;
        vec2 d = (uv - lp) * vec2(aspect, 1.0);
        float onGlass = 1.0 - smoothstep(rad * 0.85, rad * 1.05, length(d));
        if (onGlass <= 0.0) continue;
        vec3 c = texture2D(tDiffuse, uv).rgb;
        float fall = exp(-3.0 * float(s) / float(STEPS));   // beams thin out away from the glass
        acc += max(c - vec3(2.0), vec3(0.0)) * onGlass * fall;
      }
      return acc / float(STEPS);
    }
    void main() {
      vec4 src = texture2D(tDiffuse, vUv);
      vec3 rays = vec3(0.0);
      if (lightOn[0] > 0.001) rays += beam(lightPos[0], lightRadius[0], rayDir[0]) * lightOn[0];
      if (lightOn[1] > 0.001) rays += beam(lightPos[1], lightRadius[1], rayDir[1]) * lightOn[1];
      gl_FragColor = vec4(src.rgb + rays * strength, src.a);
    }
  `,
};

/**
 * Cinematic grade in display space. Outside (facade) it adds clarity — a
 * midtone local-contrast boost so carving, paint and wood grain read crisply —
 * a filmic S-curve, a touch more colour, a warm-highlight / cool-shadow split
 * and a lens vignette. Inside (hall) the same pass stays gentle so products
 * keep their true colour. `inside` blends between the two.
 *
 * Outside it is also shot "on film": a slight lens chromatic fringe toward
 * the frame edges, warm halation bleeding off bright highlights, a film toe
 * (blacks never quite black, highlights rolling off). No grain.
 */
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    inside: { value: 0 },
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
    uniform float inside;
    varying vec2 vUv;
    const vec3 LUMA = vec3(0.2126, 0.7152, 0.0722);
    void main() {
      float outside = 1.0 - inside;
      vec4 src = texture2D(tDiffuse, vUv);
      // Lens: lateral chromatic fringe, growing toward the corners.
      vec2 fromC = vUv - 0.5;
      vec2 ca = fromC * dot(fromC, fromC) * 0.0025 * outside;
      vec3 col = clamp(vec3(texture2D(tDiffuse, vUv + ca).r, src.g, texture2D(tDiffuse, vUv - ca).b), 0.0, 1.0);
      // Contrast-adaptive sharpening (CAS-style): restores the fine texture
      // detail that MSAA and mip filtering soften, backing off where local
      // contrast is already high so edges never ring or halo.
      vec2 px = 1.0 / vec2(textureSize(tDiffuse, 0));
      vec3 n = texture2D(tDiffuse, vUv + vec2(0.0, px.y)).rgb;
      vec3 sth = texture2D(tDiffuse, vUv - vec2(0.0, px.y)).rgb;
      vec3 e = texture2D(tDiffuse, vUv + vec2(px.x, 0.0)).rgb;
      vec3 w = texture2D(tDiffuse, vUv - vec2(px.x, 0.0)).rgb;
      vec3 mn = min(col, min(min(n, sth), min(e, w)));
      vec3 mx = max(col, max(max(n, sth), max(e, w)));
      vec3 amp = sqrt(clamp(min(mn, 1.0 - mx) / max(mx, 1e-4), 0.0, 1.0));
      float sharp = mix(0.55, 0.3, inside);
      vec3 wgt = -amp * mix(0.125, 0.2, sharp);
      col = clamp((col + (n + sth + e + w) * wgt) / (1.0 + 4.0 * wgt), 0.0, 1.0);
      float l = dot(col, LUMA);

      // Clarity: luminance minus a two-ring local mean (≈3 and 7 px), applied
      // mostly to midtones so highlights and blacks don't clip or halo.
      vec2 texel = 1.0 / vec2(textureSize(tDiffuse, 0));
      float mean = 0.0;
      vec3 glow = vec3(0.0);
      for (int i = 0; i < 8; i++) {
        float a = float(i) * 0.785398;
        vec2 dir = vec2(cos(a), sin(a)) * texel;
        mean += dot(texture2D(tDiffuse, vUv + dir * 3.0).rgb, LUMA);
        vec3 far = texture2D(tDiffuse, vUv + dir * 7.0).rgb;
        mean += dot(far, LUMA);
        glow += max(texture2D(tDiffuse, vUv + dir * 14.0).rgb - 0.72, 0.0) + max(far - 0.72, 0.0);
      }
      mean /= 16.0;
      glow /= 16.0;
      float clarity = mix(0.75, 0.5, inside);
      float mid = 4.0 * l * (1.0 - l);
      vec3 g = col + (l - mean) * clarity * mid;
      g = clamp(g, 0.0, 1.0);
      l = dot(g, LUMA);

      // Split-tone: cool shadows, warm highlights (stronger outside).
      float split = 0.7;
      g += vec3(-0.03, 0.004, 0.035) * pow(1.0 - l, 2.2) * split;
      g += vec3(0.05, 0.02, -0.035) * l * l * split;
      g = clamp(g, 0.0, 1.0);
      // Inside: set the black point under the warm haze so the hall has
      // real darks again, then a filmic S-curve and richer colour.
      g = max(g - 0.045, 0.0) / (1.0 - 0.045);
      g = mix(g, g * g * (3.0 - 2.0 * g), 0.5);
      g = mix(vec3(dot(g, LUMA)), g, 1.1);
      // Halation: bright areas bleed a warm red-orange glow into their surroundings.
      g += vec3(1.0, 0.42, 0.2) * dot(glow, LUMA) * 0.9 * outside;
      // Lens vignette, slightly wider than tall.
      vec2 d = (vUv - 0.5) * vec2(1.0, 0.82);
      g *= mix(mix(0.66, 0.5, inside), 1.0, smoothstep(0.78, 0.18, length(d)));
      gl_FragColor = vec4(clamp(g, 0.0, 1.0), src.a);
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
  const rays = new ShaderPass(GodRaysShader);
  rays.enabled = false;
  const _p = new THREE.Vector3();
  const _r = new THREE.Vector3();
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
    /** Insert after sanitize, before bloom. */
    rays,
    /** Tone mapping + sRGB; use in place of OutputPass. */
    output,
    /** Insert after the output pass (works in display space). */
    grade,
    addTo(composer: EffectComposer, stage: "ao" | "sanitize" | "rays" | "output" | "grade") {
      composer.addPass({ ao, sanitize, rays, output, grade }[stage]);
    },
    /**
     * Place the god rays on the windows this frame. `targets` are window
     * centres / sizes in world space; `inside` fades the effect in the hall.
     */
    updateRays(
      cam: THREE.PerspectiveCamera,
      targets: { center: THREE.Vector3; size: number; strength: number; dir: THREE.Vector3 }[],
      inside: number,
    ) {
      const u = rays.uniforms;
      let any = false;
      _r.setFromMatrixColumn(cam.matrixWorld, 0); // camera right, for footprint size
      for (let i = 0; i < 2; i++) {
        const t = targets[i];
        if (!t || inside < 0.01) {
          u.lightOn.value[i] = 0;
          continue;
        }
        _p.copy(t.center).project(cam);
        const behind = _p.z > 1;
        const sx = _p.x * 0.5 + 0.5;
        const sy = _p.y * 0.5 + 0.5;
        u.lightPos.value[i].set(sx, sy);
        // footprint radius on screen (height-normalised, aspect-corrected)
        const edge = _r.clone().multiplyScalar(t.size * 0.5).add(t.center).project(cam);
        u.lightRadius.value[i] = Math.abs(edge.x - _p.x) * 0.5 * cam.aspect;
        // fade as the window leaves the frame; off when behind the camera
        const margin = Math.max(Math.abs(_p.x), Math.abs(_p.y));
        const onScreen = behind ? 0 : 1 - THREE.MathUtils.smoothstep(margin, 1.0, 1.5);
        // the sun's travel direction, projected to the screen (parallel beams)
        const down = t.dir.clone().multiplyScalar(2).add(t.center).project(cam);
        const dx = (down.x - _p.x) * cam.aspect;
        const dy = down.y - _p.y;
        const len = Math.hypot(dx, dy);
        if (len > 1e-4) u.rayDir.value[i].set(dx / len, dy / len);
        u.lightOn.value[i] = onScreen * t.strength;
        any ||= u.lightOn.value[i] > 0.001;
      }
      u.aspect.value = cam.aspect;
      u.strength.value = 0.9 * inside;
      rays.enabled = any;
    },
    update(inside: number, exposure: number) {
      output.uniforms.toneMappingExposure.value = exposure;
      output.uniforms.neutral.value = THREE.MathUtils.smoothstep(inside, 0.15, 0.85);
      // Contact shadows everywhere: carved relief, door frame, pillars, lanterns.
      ao.enabled = true;
      ao.blendIntensity = THREE.MathUtils.lerp(0.6, 0.9, inside);
      grade.enabled = true;
      grade.uniforms.inside.value = THREE.MathUtils.smoothstep(inside, 0.15, 0.85);
    },
  };
}
