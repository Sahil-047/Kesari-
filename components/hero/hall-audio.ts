import * as THREE from "three";

/**
 * Procedural sound for the hero (Web Audio, no files):
 *  - fountain: falling water — a broadband splash bed with a slow churn, plus
 *    hundreds of tiny droplet "plinks" (resonant chirps) — placed at the
 *    fountain in 3D (HRTF), so it gets louder and moves as you fly past it;
 *  - wind: a soft airy breeze whose loudness and pitch follow the same gusts
 *    that move the cloth and dust.
 * Browsers only allow sound after a click / tap / key, so `unlock()` is
 * called from those; `setMuted` backs the on-screen toggle.
 */

function noiseBuffer(ctx: AudioContext, seconds: number, kind: "white" | "pink" | "brown") {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0, last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      if (kind === "white") d[i] = w;
      else if (kind === "pink") {
        b0 = 0.99765 * b0 + w * 0.099046;
        b1 = 0.963 * b1 + w * 0.2965164;
        b2 = 0.57 * b2 + w * 1.0526913;
        d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18;
      } else {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
    // seamless loop: crossfade the tail into the head
    const fade = Math.floor(ctx.sampleRate * 0.25);
    for (let i = 0; i < fade; i++) {
      const a = i / fade;
      d[i] = d[i] * a + d[len - fade + i] * (1 - a);
    }
  }
  return buf;
}

function loop(ctx: AudioContext, buf: AudioBuffer) {
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  src.loopEnd = buf.duration - 0.25;
  src.start(0, Math.random() * (buf.duration - 0.5));
  return src;
}

export function createHallAudio() {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let fountainGain: GainNode | null = null;
  let windGain: GainNode | null = null;
  let windFilter: BiquadFilterNode | null = null;
  let panner: PannerNode | null = null;
  let dropBus: GainNode | null = null;
  let muted = false;
  let nextDrop = 0;

  function build() {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // ---- fountain, positioned in the hall
    panner = new PannerNode(ctx, {
      panningModel: "HRTF",
      distanceModel: "inverse",
      refDistance: 2.5,
      rolloffFactor: 1.1,
      maxDistance: 60,
    });
    fountainGain = ctx.createGain();
    fountainGain.gain.value = 0;
    panner.connect(fountainGain).connect(master);

    // splash bed: pink noise, body ~300 Hz–6 kHz with a sparkle shelf
    const bed = loop(ctx, noiseBuffer(ctx, 6, "pink"));
    const hp = new BiquadFilterNode(ctx, { type: "highpass", frequency: 260, Q: 0.5 });
    const lp = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 3000, Q: 0.4 });
    const air = new BiquadFilterNode(ctx, { type: "peaking", frequency: 2000, Q: 0.8, gain: 1.5 });
    const bedGain = new GainNode(ctx, { gain: 0.42 });
    bed.connect(hp).connect(lp).connect(air).connect(bedGain).connect(panner);
    // churn: low rumble of water landing in the basin, slowly modulated
    const churn = loop(ctx, noiseBuffer(ctx, 5, "brown"));
    const churnLp = new BiquadFilterNode(ctx, { type: "lowpass", frequency: 420, Q: 0.7 });
    const churnGain = new GainNode(ctx, { gain: 0.32 });
    const lfo = new OscillatorNode(ctx, { frequency: 0.11 });
    const lfoDepth = new GainNode(ctx, { gain: 0.08 });
    lfo.connect(lfoDepth).connect(churnGain.gain);
    lfo.start();
    churn.connect(churnLp).connect(churnGain).connect(panner);
    // droplets
    dropBus = new GainNode(ctx, { gain: 0.5 });
    const dropHp = new BiquadFilterNode(ctx, { type: "highpass", frequency: 500 });
    dropBus.connect(dropHp).connect(panner);

    // ---- wind, all around (not positioned)
    const wind = loop(ctx, noiseBuffer(ctx, 7, "brown"));
    windFilter = new BiquadFilterNode(ctx, { type: "bandpass", frequency: 520, Q: 0.6 });
    const whistle = new BiquadFilterNode(ctx, { type: "peaking", frequency: 1400, Q: 3, gain: 3 });
    windGain = new GainNode(ctx, { gain: 0 });
    wind.connect(windFilter).connect(whistle).connect(windGain).connect(master);
    nextDrop = ctx.currentTime;
  }

  /** A droplet: a short resonant chirp, rising as the bubble collapses. */
  function droplet(at: number) {
    if (!ctx || !dropBus) return;
    const f = 500 + Math.random() ** 2 * 1600;
    const dur = 0.05 + Math.random() * 0.09;
    const osc = new OscillatorNode(ctx, { type: "sine", frequency: f });
    osc.frequency.exponentialRampToValueAtTime(f * (1.25 + Math.random() * 0.5), at + dur);
    const g = new GainNode(ctx, { gain: 0 });
    const peak = 0.015 + Math.random() ** 3 * 0.06;
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(peak, at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(g).connect(dropBus);
    osc.start(at);
    osc.stop(at + dur + 0.02);
  }

  const _pos = new THREE.Vector3();
  const _fwd = new THREE.Vector3();
  const _up = new THREE.Vector3();

  return {
    /** Start audio (must run inside a user gesture the first time). */
    unlock() {
      if (!ctx) build();
      if (ctx && ctx.state === "suspended") void ctx.resume();
    },
    get started() {
      return !!ctx && ctx.state === "running";
    },
    get muted() {
      return muted;
    },
    setMuted(m: boolean) {
      muted = m;
    },
    /**
     * `listener` is the camera and `source` the fountain, both in one frame
     * (the interior model frame); `inside` 0..1; `gustAmt` from the wind model.
     */
    update(camera: THREE.Camera, frame: THREE.Object3D, source: THREE.Vector3, inside: number, gustAmt: number) {
      if (!ctx || !master || !panner || !fountainGain || !windGain || !windFilter) return;
      const now = ctx.currentTime;
      master.gain.setTargetAtTime(muted ? 0 : 0.9, now, 0.4);

      // listener in the interior frame
      camera.getWorldPosition(_pos);
      frame.worldToLocal(_pos);
      camera.getWorldDirection(_fwd);
      _up.set(0, 1, 0).applyQuaternion(camera.quaternion);
      const inv = new THREE.Matrix4().copy(frame.matrixWorld).invert();
      _fwd.transformDirection(inv);
      _up.transformDirection(inv);
      const l = ctx.listener;
      if (l.positionX) {
        l.positionX.setTargetAtTime(_pos.x, now, 0.05);
        l.positionY.setTargetAtTime(_pos.y, now, 0.05);
        l.positionZ.setTargetAtTime(_pos.z, now, 0.05);
        l.forwardX.setTargetAtTime(_fwd.x, now, 0.05);
        l.forwardY.setTargetAtTime(_fwd.y, now, 0.05);
        l.forwardZ.setTargetAtTime(_fwd.z, now, 0.05);
        l.upX.setTargetAtTime(_up.x, now, 0.05);
        l.upY.setTargetAtTime(_up.y, now, 0.05);
        l.upZ.setTargetAtTime(_up.z, now, 0.05);
      } else {
        l.setPosition(_pos.x, _pos.y, _pos.z);
        l.setOrientation(_fwd.x, _fwd.y, _fwd.z, _up.x, _up.y, _up.z);
      }
      panner.positionX.value = source.x;
      panner.positionY.value = source.y;
      panner.positionZ.value = source.z;

      // the fountain is heard once the door is open; wind is a hush outside, a breeze inside
      fountainGain.gain.setTargetAtTime(0.95 * THREE.MathUtils.smoothstep(inside, 0.05, 0.6), now, 0.3);
      windGain.gain.setTargetAtTime((0.05 + 0.13 * inside) * (0.35 + 0.65 * gustAmt), now, 0.5);
      windFilter.frequency.setTargetAtTime(380 + 420 * gustAmt, now, 0.6);

      // schedule droplets ~0.2 s ahead, denser when we are inside
      if (inside > 0.02) {
        const rate = 16 * inside;
        while (nextDrop < now + 0.2) {
          nextDrop = Math.max(nextDrop, now) + (-Math.log(1 - Math.random()) / rate);
          droplet(nextDrop);
        }
      } else {
        nextDrop = now;
      }
    },
    dispose() {
      void ctx?.close();
      ctx = null;
    },
  };
}
