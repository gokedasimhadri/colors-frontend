import * as THREE from 'three';

// ─── Default Festival Color Palette (Rich, Vibrant Holi Pigments) ───────────
export const DEFAULT_COLORS = [
  '#e11d48', // Vibrant Rose Pink
  '#ff007f', // Hot Magenta
  '#ea580c', // Electric Orange
  '#f59e0b', // Radiant Sunburst Amber
  '#10b981', // Vivid Emerald Green
  '#06b6d4', // Electric Cyan
  '#2563eb', // Royal Cobalt Blue
  '#7c3aed', // Deep Violet / Purple
];

// ─── Custom GLSL Vertex Shader ───────────────────────────────────────────────
const VERTEX_SHADER = /* glsl */ `
attribute vec3 aVelocity;
attribute vec3 aColor;
attribute float aSize;
attribute float aType;    // 0.0 = Cloud Puff, 1.0 = Radial Streak, 2.0 = Fine Dust Mote
attribute float aSeed;
attribute float aLife;    // Individual lifespan factor (0.7 - 1.3)
attribute float aDelay;   // Micro burst delay (0.0 - 0.06s) for cascade feel

uniform float uTime;
uniform float uDuration;
uniform float uPixelRatio;
uniform float uDrag;
uniform float uGravity;
uniform float uSpread;
uniform float uTurbulence;

varying vec3 vColor;
varying float vAlpha;
varying float vType;
varying float vSeed;

// Fast Simplex-like 3D noise for organic turbulence
vec3 hash33(vec3 p) {
    p = fract(p * vec3(443.8975, 397.2973, 491.1871));
    p += dot(p, p.yxz + 19.19);
    return -1.0 + 2.0 * fract(vec3(
        (p.x + p.y) * p.z,
        (p.x + p.z) * p.y,
        (p.y + p.z) * p.x
    ));
}

float noise3d(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(dot(hash33(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
                       dot(hash33(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
                   mix(dot(hash33(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
                       dot(hash33(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y),
               mix(mix(dot(hash33(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
                       dot(hash33(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
                   mix(dot(hash33(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
                       dot(hash33(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x), u.y), u.z);
}

void main() {
    vColor = aColor;
    vType = aType;
    vSeed = aSeed;

    float t = max(0.0, uTime - aDelay);
    float normT = clamp(t / (uDuration * aLife), 0.0, 1.0);

    // Physics: Air resistance (drag) equation: v(t) = v0 * exp(-k*t), integral is (1 - exp(-k*t)) / k
    float dragTerm = (1.0 - exp(-uDrag * t)) / max(uDrag, 0.001);
    vec3 pos = position + aVelocity * dragTerm * uSpread;

    // Gravity: Downward (+y in our screen space)
    float gravMultiplier = (aType > 1.5) ? 1.4 : ((aType > 0.5) ? 0.9 : 0.35);
    pos.y += 0.5 * uGravity * gravMultiplier * t * t;

    // Organic curl noise / vortex shedding
    vec3 noiseCoord = pos * 0.0035 + vec3(t * 0.5, aSeed * 12.0, t * 0.25);
    vec3 turbulence = vec3(
        noise3d(noiseCoord),
        noise3d(noiseCoord + vec3(31.4, 17.8, 9.2)),
        noise3d(noiseCoord + vec3(14.2, 53.6, 28.1))
    ) * uTurbulence * dragTerm * (0.3 + normT * 0.7);

    pos += turbulence;

    // Particle Lifecycle Size & Alpha Curves
    float currentSize = aSize;
    float alpha = 1.0;

    if (aType < 0.5) {
        // 0.0 = Cloud Puff: Billows and expands, lingers, then softly dissipates
        float expand = 1.0 + 3.2 * smoothstep(0.0, 0.45, normT);
        currentSize *= expand;
        // Alpha: Quick emergence, sustained opacity, smooth long dissipation
        alpha = smoothstep(0.0, 0.06, normT) * (1.0 - smoothstep(0.35, 1.0, normT));
        alpha *= 0.75;
    } else if (aType < 1.5) {
        // 1.0 = Radial Streak: High-velocity finger, stays compact, sharp trail
        currentSize *= (1.0 + 0.6 * normT);
        alpha = smoothstep(0.0, 0.04, normT) * (1.0 - smoothstep(0.45, 0.96, normT));
        alpha *= 0.90;
    } else {
        // 2.0 = Fine Dust Mote: Tiny sparkling powder specks
        currentSize *= (1.0 - 0.25 * normT);
        alpha = smoothstep(0.0, 0.02, normT) * (1.0 - smoothstep(0.55, 1.0, normT));
        alpha *= 0.95;
    }

    vAlpha = alpha;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = max(1.0, currentSize * uPixelRatio);
}
`;

// ─── Custom GLSL Fragment Shader ─────────────────────────────────────────────
const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

varying vec3 vColor;
varying float vAlpha;
varying float vType;
varying float vSeed;

void main() {
    if (vAlpha <= 0.004) discard;

    // Map point coord from 0..1 to -1..1
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float r = length(p);
    if (r > 1.0) discard;

    // Procedural organic powder puff texture (angular harmonic wobble)
    float angle = atan(p.y, p.x);
    float wobble = sin(angle * 5.0 + vSeed * 6.28) * 0.14
                 + cos(angle * 8.0 - vSeed * 3.14) * 0.09;
    float dist = clamp(r + wobble * (1.0 - r), 0.0, 1.0);

    float shape = 0.0;
    if (vType < 0.5) {
        // Cloud puff: Soft gaussian cloud with misty edges
        shape = exp(-3.6 * dist * dist);
        shape *= smoothstep(1.0, 0.1, dist);
    } else if (vType < 1.5) {
        // Radial streak: Dense powder clump
        shape = exp(-4.2 * dist * dist);
        shape *= smoothstep(1.0, 0.05, dist);
    } else {
        // Fine dust mote: Brilliant pinpoint core with subtle luminous halo
        float core = exp(-12.0 * r * r);
        float halo = exp(-3.2 * r * r) * 0.4;
        shape = core + halo;
    }

    float finalAlpha = shape * vAlpha;
    if (finalAlpha <= 0.004) discard;

    // Saturated pigment with a radiant powder core
    vec3 col = vColor * (1.0 + 0.35 * (1.0 - r));

    gl_FragColor = vec4(col, finalAlpha);
}
`;

// ─── BlastEngine Singleton ───────────────────────────────────────────────────
class BlastEngine {
  constructor() {
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.explosions = [];
    this.animationFrameId = null;
    this.lastTime = performance.now();
    this.refCount = 0;
    this.isInitialized = false;

    // Bind event handlers
    this.handleResize = this.handleResize.bind(this);
    this.animate = this.animate.bind(this);
  }

  // Initializes the shared WebGL context and full-screen canvas
  init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    // 1. Create fixed full-screen canvas
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'blast-engine-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    Object.assign(this.canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '99999',
      background: 'transparent',
      display: 'block',
      overflow: 'hidden',
    });
    document.body.appendChild(this.canvas);

    // 2. Setup Three.js Renderer
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    });
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setClearColor(0x000000, 0);

    // 3. Setup Scene & Orthographic Camera (maps 1:1 to screen pixels)
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(0, width, 0, height, -1000, 1000);
    this.camera.position.z = 100;

    window.addEventListener('resize', this.handleResize, { passive: true });
    this.isInitialized = true;
  }

  handleResize() {
    if (!this.renderer || !this.camera) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(pixelRatio);

    this.camera.right = width;
    this.camera.bottom = height;
    this.camera.updateProjectionMatrix();

    // Update pixel ratio uniform across active explosions
    for (const exp of this.explosions) {
      if (exp.material && exp.material.uniforms.uPixelRatio) {
        exp.material.uniforms.uPixelRatio.value = pixelRatio;
      }
    }
  }

  /**
   * Triggers a realistic color powder blast (Omnidirectional or Directional Cannon)
   *
   * @param {Object} options
   * @param {number} options.x - Screen X coordinate in pixels
   * @param {number} options.y - Screen Y coordinate in pixels
   * @param {number} [options.particleCount=2500] - Number of particles
   * @param {number} [options.duration=2200] - Duration in ms
   * @param {string[]} [options.colors] - Array of hex colors
   * @param {number} [options.size=1.0] - Size multiplier
   * @param {number} [options.spread=1.0] - Blast radius spread multiplier
   * @param {number} [options.gravity=60] - Downward gravity drift (px/s^2)
   * @param {number|null} [options.direction=null] - Direction angle in radians (e.g. -Math.PI / 4)
   * @param {number|null} [options.coneSpread=null] - Width of emission cone in radians
   * @param {number} [options.speedMultiplier=1.0] - Velocity multiplier for high-velocity cannons
   * @param {number} [options.drag=2.8] - Air drag coefficient
   * @param {number} [options.cannonOriginJitter=8] - Origin jitter in px
   */
  triggerBlast({
    x = window.innerWidth / 2,
    y = window.innerHeight / 2,
    particleCount = 2500,
    duration = 2200,
    colors = DEFAULT_COLORS,
    size = 1.0,
    spread = 1.0,
    gravity = 60,
    direction = null,
    coneSpread = null,
    speedMultiplier = 1.0,
    drag = 2.8,
    cannonOriginJitter = 8,
  } = {}) {
    if (!this.isInitialized) {
      this.init();
    }

    // Check user preference for reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const actualCount = prefersReducedMotion ? Math.min(particleCount, 500) : particleCount;
    const actualDuration = prefersReducedMotion ? Math.min(duration, 1200) : duration;

    // Convert hex colors to THREE.Color instances
    const palette = (colors && colors.length > 0 ? colors : DEFAULT_COLORS).map(
      (hex) => new THREE.Color(hex)
    );

    const isDirectional = direction !== null && Number.isFinite(direction);
    const halfCone = (coneSpread !== null ? coneSpread : Math.PI / 4) / 2;

    // Number of angular color lobes (simulating multi-color powder packet explosion)
    const numPlumes = Math.min(palette.length, 8);
    const plumeAngles = [];
    for (let i = 0; i < numPlumes; i++) {
      plumeAngles.push((i / numPlumes) * Math.PI * 2);
    }

    // Number of high-speed directional streaks / filaments
    const numStreaks = 20;
    const streakAngles = [];
    for (let i = 0; i < numStreaks; i++) {
      streakAngles.push((i / numStreaks) * Math.PI * 2 + (Math.random() - 0.5) * 0.25);
    }

    // Buffer arrays
    const positions = new Float32Array(actualCount * 3);
    const velocities = new Float32Array(actualCount * 3);
    const colorAttr = new Float32Array(actualCount * 3);
    const sizes = new Float32Array(actualCount);
    const types = new Float32Array(actualCount);
    const seeds = new Float32Array(actualCount);
    const lifes = new Float32Array(actualCount);
    const delays = new Float32Array(actualCount);

    for (let i = 0; i < actualCount; i++) {
      const i3 = i * 3;
      // Particles start clustered tightly around the explosion / cannon nozzle origin
      const originJitter = Math.random() * cannonOriginJitter;
      const originAngle = Math.random() * Math.PI * 2;
      positions[i3] = x + Math.cos(originAngle) * originJitter;
      positions[i3 + 1] = y + Math.sin(originAngle) * originJitter;
      positions[i3 + 2] = (Math.random() - 0.5) * 12;

      // Classify particle into 1 of 3 physical tiers:
      // ~25% Volumetric Clouds, ~35% High-Velocity Radial Streaks, ~40% Fine Dust Motes
      const rand = Math.random();
      let type, baseSpeed, pSize, lifeMult, delay;
      let angle;

      if (rand < 0.25) {
        // ── 0.0 = Volumetric Cloud Puff ──
        type = 0.0;
        pSize = (22 + Math.random() * 26) * size; // 22px - 48px
        baseSpeed = (110 + Math.random() * 230) * speedMultiplier; // Billows outward
        lifeMult = 0.9 + Math.random() * 0.4;
        delay = Math.random() * 0.05;

        if (isDirectional) {
          const bell = Math.random() + Math.random() - 1.0;
          angle = direction + bell * (halfCone * 0.85);
        } else {
          angle = Math.random() * Math.PI * 2;
        }
      } else if (rand < 0.60) {
        // ── 1.0 = High-Velocity Radial Streak Filament (Core Jet) ──
        type = 1.0;
        pSize = (9 + Math.random() * 13) * size;  // 9px - 22px
        baseSpeed = (480 + Math.random() * 640) * speedMultiplier; // High-power jets
        lifeMult = 0.8 + Math.random() * 0.35;
        delay = Math.random() * 0.025;

        if (isDirectional) {
          const bell = Math.random() + Math.random() - 1.0;
          angle = direction + bell * (halfCone * 0.5); // Tightly focused in nozzle core
        } else {
          const streakIdx = Math.floor(Math.random() * numStreaks);
          angle = streakAngles[streakIdx] + (Math.random() - 0.5) * 0.08;
        }
      } else {
        // ── 2.0 = Fine Powder Dust & Sparkle Motes ──
        type = 2.0;
        pSize = (3.2 + Math.random() * 4.8) * size; // 3.2px - 8px
        baseSpeed = (160 + Math.random() * 700) * speedMultiplier; // Wide dispersal
        lifeMult = 0.95 + Math.random() * 0.45;
        delay = Math.random() * 0.07;

        if (isDirectional) {
          const bell = Math.random() + Math.random() - 1.0;
          angle = direction + bell * halfCone + (Math.random() - 0.5) * 0.14;
        } else {
          angle = Math.random() * Math.PI * 2;
        }
      }

      // Assign color according to angular sector or plume
      let normAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
      let closestPlume = Math.floor((normAngle / (Math.PI * 2)) * numPlumes);
      if (Math.random() < 0.18) {
        // 18% random scatter of other festival colors
        closestPlume = Math.floor(Math.random() * palette.length);
      }
      const c = palette[closestPlume % palette.length];

      // Velocity in 3D (Z gives subtle 3D parallax depth)
      const speed = baseSpeed * (0.8 + Math.random() * 0.4);
      velocities[i3] = Math.cos(angle) * speed;
      velocities[i3 + 1] = Math.sin(angle) * speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * (speed * 0.25);

      colorAttr[i3] = c.r;
      colorAttr[i3 + 1] = c.g;
      colorAttr[i3 + 2] = c.b;

      sizes[i] = pSize;
      types[i] = type;
      seeds[i] = Math.random();
      lifes[i] = lifeMult;
      delays[i] = delay;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aVelocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colorAttr, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aType', new THREE.BufferAttribute(types, 1));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute('aLife', new THREE.BufferAttribute(lifes, 1));
    geometry.setAttribute('aDelay', new THREE.BufferAttribute(delays, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0.0 },
        uDuration: { value: actualDuration / 1000.0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
        uDrag: { value: drag },
        uGravity: { value: gravity },
        uSpread: { value: spread },
        uTurbulence: { value: 38.0 },
      },
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const points = new THREE.Points(geometry, material);
    this.scene.add(points);

    const explosion = {
      points,
      geometry,
      material,
      startTime: performance.now(),
      duration: actualDuration,
    };

    this.explosions.push(explosion);

    // Start animation loop if not already running
    if (!this.animationFrameId) {
      this.lastTime = performance.now();
      this.animationFrameId = requestAnimationFrame(this.animate);
    }

    return explosion;
  }

  /**
   * Fires high-pressure dual color powder cannons from bottom-left and bottom-right corners
   * Dynamically adapts angle, velocity, and particle dispersal to viewport width & height
   */
  triggerDualCornerCannons({
    particleCount = 1800,
    duration = 3200,
    size = 1.15,
    spread = 1.0,
    gravity = 50,
  } = {}) {
    if (typeof window === 'undefined') return;
    if (!this.isInitialized) {
      this.init();
    }

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Calculate dynamic distance and speed multiplier based on viewport size
    const screenDiagonal = Math.hypot(w, h);
    // Baseline is 1150px diagonal -> scales naturally across mobile and high-res desktop
    const speedMult = Math.min(1.85, Math.max(0.95, screenDiagonal / 1050));

    // Aim cannons at upper-middle portion of the screen (golden ratio elevation)
    const targetY = h * 0.32;
    const leftTargetX = w * 0.45;
    const rightTargetX = w * 0.55;

    const leftAngle = -Math.atan2(h - targetY, leftTargetX); // ~ -50 deg (upward-right)
    const rightAngle = -Math.PI + Math.atan2(h - targetY, w - rightTargetX); // ~ -130 deg (upward-left)

    // Rich festival pigments: Left fires cool & electric hues, Right fires warm & radiant hues
    const leftColors = [
      '#8b00ff', // Deep Violet
      '#7c3aed', // Purple
      '#2563eb', // Royal Cobalt
      '#06b6d4', // Electric Cyan
      '#10b981', // Vivid Emerald Green
      '#84cc16', // Lime Green
      '#ff007f', // Hot Magenta accent
    ];

    const rightColors = [
      '#ff007f', // Hot Magenta
      '#e11d48', // Vibrant Rose Pink
      '#ea580c', // Electric Orange
      '#f59e0b', // Radiant Sunburst Amber
      '#ffd600', // Bright Golden Yellow
      '#2563eb', // Cobalt Blue accent
      '#7c3aed', // Deep Violet accent
    ];

    // Left cannon: Bottom-Left corner (0, h)
    this.triggerBlast({
      x: 0,
      y: h,
      particleCount,
      duration,
      colors: leftColors,
      size,
      spread,
      gravity,
      direction: leftAngle,
      coneSpread: 0.58, // ~33 degree nozzle cone
      speedMultiplier: speedMult,
      drag: 1.85, // Lower drag so powder shoots high into upper canvas
      cannonOriginJitter: 24,
    });

    // Right cannon: Bottom-Right corner (w, h)
    this.triggerBlast({
      x: w,
      y: h,
      particleCount,
      duration,
      colors: rightColors,
      size,
      spread,
      gravity,
      direction: rightAngle,
      coneSpread: 0.58, // ~33 degree nozzle cone
      speedMultiplier: speedMult,
      drag: 1.85,
      cannonOriginJitter: 24,
    });
  }

  animate(currentTime) {
    if (this.explosions.length === 0) {
      this.animationFrameId = null;
      if (this.renderer && this.scene && this.camera) {
        this.renderer.clear();
      }
      return;
    }

    const completed = [];

    for (let i = 0; i < this.explosions.length; i++) {
      const exp = this.explosions[i];
      const elapsed = currentTime - exp.startTime;

      if (elapsed >= exp.duration) {
        completed.push(i);
      } else {
        exp.material.uniforms.uTime.value = elapsed / 1000.0;
      }
    }

    // Remove and dispose completed explosions in reverse order
    if (completed.length > 0) {
      for (let j = completed.length - 1; j >= 0; j--) {
        const idx = completed[j];
        const exp = this.explosions[idx];
        this.scene.remove(exp.points);
        exp.geometry.dispose();
        exp.material.dispose();
        this.explosions.splice(idx, 1);
      }
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }

    if (this.explosions.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.animate);
    } else {
      this.animationFrameId = null;
      if (this.renderer && this.scene && this.camera) {
        this.renderer.clear();
      }
    }
  }

  // Retain a reference to the engine
  retain() {
    this.refCount++;
    if (!this.isInitialized) {
      this.init();
    }
  }

  // Release a reference; when count hits zero, cleanup resources
  release() {
    this.refCount = Math.max(0, this.refCount - 1);
    if (this.refCount === 0) {
      this.destroy();
    }
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    window.removeEventListener('resize', this.handleResize);

    for (const exp of this.explosions) {
      this.scene.remove(exp.points);
      exp.geometry.dispose();
      exp.material.dispose();
    }
    this.explosions = [];

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
    }

    this.scene = null;
    this.camera = null;
    this.isInitialized = false;
  }
}

// Global shared singleton instance
let instance = null;

export function getBlastEngine() {
  if (!instance) {
    instance = new BlastEngine();
  }
  return instance;
}

export default BlastEngine;

