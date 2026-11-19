/**
 * Dual-Corner Dense Metallic Confetti & Spiral Curling Streamers Blast Engine
 *
 * Implements:
 * 1. Dense shower of small, random-shaped shiny metallic foil confetti pieces (rectangles, strips, diamond shards, flakes).
 * 2. Mixed with long, graceful 3D spiral curling streamers (corkscrew ribbons like Image 2).
 * 3. Sudden high-pressure explosive blast covering the entire 100vw x 100vh page.
 */

// ─── Vibrant Metallic Foil Colors (Front, Shaded Interior, Specular Shine) ───
export const FOIL_PALETTES = [
  {
    name: 'gold',
    front: '#FFD700',
    specular: '#FFF9C4',
    shade: '#B8860B',
    back: '#D4AF37',
    glint: '#FFFFFF',
  },
  {
    name: 'electric-blue',
    front: '#0070F3',
    specular: '#BBDEFB',
    shade: '#0D47A1',
    back: '#0052CC',
    glint: '#E3F2FD',
  },
  {
    name: 'hot-pink',
    front: '#FF007F',
    specular: '#F8BBD0',
    shade: '#880E4F',
    back: '#C2185B',
    glint: '#FFFFFF',
  },
  {
    name: 'vivid-orange',
    front: '#FF5722',
    specular: '#FFCCBC',
    shade: '#BF360C',
    back: '#E64A19',
    glint: '#FFE0B2',
  },
  {
    name: 'emerald-green',
    front: '#00E676',
    specular: '#E8F5E9',
    shade: '#1B5E20',
    back: '#00C853',
    glint: '#FFFFFF',
  },
  {
    name: 'royal-purple',
    front: '#9C27B0',
    specular: '#E1BEE7',
    shade: '#4A148C',
    back: '#7B1FA2',
    glint: '#F3E5F5',
  },
  {
    name: 'electric-cyan',
    front: '#00E5FF',
    specular: '#E0F7FA',
    shade: '#006064',
    back: '#00B4D8',
    glint: '#FFFFFF',
  },
  {
    name: 'crimson-red',
    front: '#FF1744',
    specular: '#FFCDD2',
    shade: '#B71C1C',
    back: '#D50000',
    glint: '#FFEBEE',
  },
  {
    name: 'sunburst-yellow',
    front: '#FFEA00',
    specular: '#FFFDE7',
    shade: '#F57F17',
    back: '#FBC02D',
    glint: '#FFFFFF',
  },
  {
    name: 'holographic-silver',
    front: '#ECEFF1',
    specular: '#FFFFFF',
    shade: '#78909C',
    back: '#B0BEC5',
    glint: '#FFFFFF',
  },
];

/**
 * 1. Small Metallic Foil Confetti Piece (Rectangles, Strips, Shards, Flakes)
 * Made significantly smaller and densely populated as requested!
 */
export class SmallFoilConfetti {
  constructor(emitter, startX, startY, viewportW, viewportH) {
    this.emitter = emitter;

    const paletteIndex = Math.floor(Math.random() * FOIL_PALETTES.length);
    this.palette = FOIL_PALETTES[paletteIndex];

    // Diverse small shapes
    const typeRoll = Math.random();
    if (typeRoll < 0.35) {
      this.type = 'strip'; // Mini metallic foil strip
      this.w = Math.random() * 2.5 + 4;   // 4 to 6.5px width
      this.h = Math.random() * 10 + 12;   // 12 to 22px length
      this.shear = (Math.random() - 0.5) * 4;
    } else if (typeRoll < 0.65) {
      this.type = 'rectangle'; // Mini confetti cut
      this.w = Math.random() * 3 + 4.5;  // 4.5 to 7.5px
      this.h = Math.random() * 5 + 7.5;  // 7.5 to 12.5px
      this.shear = 0;
    } else if (typeRoll < 0.85) {
      this.type = 'shard'; // Angle-cut diamond shard
      this.w = Math.random() * 3 + 4;    // 4 to 7px
      this.h = Math.random() * 6 + 9;    // 9 to 15px
      this.shear = (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 4 + 2);
    } else {
      this.type = 'flake'; // Square sparkle flake
      this.w = Math.random() * 2.5 + 4;
      this.h = this.w;
      this.shear = (Math.random() - 0.5) * 2;
    }

    // Starting nozzle position
    this.x = startX + (Math.random() - 0.5) * 14;
    this.y = startY + (Math.random() - 0.5) * 14;

    // Wide full-page fan explosion angle
    let angle;
    if (emitter === 'left') {
      const minAngle = -Math.PI * 0.46; // ~-83° (steep)
      const maxAngle = -Math.PI * 0.06; // ~-11° (shallow flat reach)
      angle = minAngle + Math.random() * (maxAngle - minAngle);
    } else {
      const minAngle = -Math.PI * 0.94; // ~-169° (shallow flat reach)
      const maxAngle = -Math.PI * 0.54; // ~-97° (steep)
      angle = minAngle + Math.random() * (maxAngle - minAngle);
    }

    // High explosive sudden muzzle velocity
    const diagonal = Math.hypot(viewportW, viewportH);
    const speedBase = Math.min(2600, Math.max(1300, diagonal * 1.45));
    const speed = speedBase * (Math.random() * 0.85 + 0.5);

    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    // 3D tumbling rotation
    this.rotZ = Math.random() * Math.PI * 2;
    this.rotZSpeed = (Math.random() * 10 + 6) * (Math.random() < 0.5 ? 1 : -1);

    this.flipX = Math.random() * Math.PI * 2;
    this.flipXSpeed = (Math.random() * 16 + 10) * (Math.random() < 0.5 ? 1 : -1);

    this.flipY = Math.random() * Math.PI * 2;
    this.flipYSpeed = (Math.random() * 12 + 8) * (Math.random() < 0.5 ? 1 : -1);

    // Gravity & air resistance
    this.gravity = Math.random() * 120 + 380; // px/s^2
    this.drag = Math.random() * 0.004 + 0.016;
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.wobbleSpeed = Math.random() * 8 + 6;
    this.wobbleAmp = Math.random() * 32 + 16;

    this.age = 0;
    this.lifespan = Math.random() * 1.2 + 3.8; // 3.8s to 5.0s
    this.alpha = 1.0;
  }

  update(dt) {
    this.age += dt;
    if (this.age >= this.lifespan) return false;

    const remaining = this.lifespan - this.age;
    this.alpha = remaining < 0.9 ? Math.max(0, remaining / 0.9) : 1.0;

    const speed = Math.hypot(this.vx, this.vy);
    const dynamicDrag = this.drag * (1 + (speed / 750) * 0.6);
    this.vx *= Math.max(0.65, 1 - dynamicDrag * dt * 60);
    this.vy *= Math.max(0.65, 1 - dynamicDrag * dt * 60);

    this.vy += this.gravity * dt;

    this.wobblePhase += this.wobbleSpeed * dt;
    this.vx += Math.sin(this.wobblePhase) * this.wobbleAmp * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.rotZ += this.rotZSpeed * dt;
    this.flipX += this.flipXSpeed * dt;
    this.flipY += this.flipYSpeed * dt;

    return true;
  }

  draw(ctx) {
    if (this.alpha <= 0.005) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotZ);

    const scaleX = Math.cos(this.flipX);
    const scaleY = Math.cos(this.flipY);
    ctx.scale(scaleX, scaleY);

    const isFront = scaleX * scaleY >= 0;
    const halfW = this.w / 2;
    const halfH = this.h / 2;
    const s = this.shear;

    // Glossy metallic sheen
    const grad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
    if (isFront) {
      grad.addColorStop(0.0, this.palette.shade);
      grad.addColorStop(0.35, this.palette.front);
      grad.addColorStop(0.5, this.palette.specular);
      grad.addColorStop(0.7, this.palette.front);
      grad.addColorStop(1.0, this.palette.shade);
    } else {
      grad.addColorStop(0.0, '#718096');
      grad.addColorStop(0.4, this.palette.back);
      grad.addColorStop(0.5, this.palette.glint);
      grad.addColorStop(0.6, this.palette.back);
      grad.addColorStop(1.0, '#4A5568');
    }

    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(-halfW + s, -halfH);
    ctx.lineTo(halfW + s, -halfH);
    ctx.lineTo(halfW - s, halfH);
    ctx.lineTo(-halfW - s, halfH);
    ctx.closePath();
    ctx.fill();

    // Edge shine glint
    if (Math.abs(scaleX) > 0.85 || Math.abs(scaleY) > 0.85) {
      ctx.strokeStyle = this.palette.glint;
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(-halfW + s, -halfH);
      ctx.lineTo(halfW + s, -halfH);
      ctx.stroke();
    }

    ctx.restore();
  }
}

/**
 * 2. Miniature 3D Spiral / Helical Curling Streamer (1/4th size or smaller as requested!)
 * Erupts gracefully and tumbles in 3D space, unrolling in an authentic delicate corkscrew coil.
 */
export class SpiralCurlingStreamer {
  constructor(emitter, startX, startY, viewportW, viewportH) {
    this.emitter = emitter;

    const paletteIndex = Math.floor(Math.random() * FOIL_PALETTES.length);
    this.palette = FOIL_PALETTES[paletteIndex];

    // Mini Streamer geometry (1/4th size or smaller than before)
    this.totalTurns = Math.random() * 1.5 + 3.0; // 3.0 to 4.5 turns
    this.coilRadius = Math.random() * 1.4 + 2.8; // 2.8 to 4.2px radius (tiny coil: 6-8px across)
    this.turnPitch = Math.random() * 2.2 + 5.0;  // 5.0 to 7.2px pitch per turn (total length ~18-32px)
    this.ribbonWidth = Math.random() * 0.6 + 1.8;// 1.8 to 2.4px delicate ribbon width

    // Starting position at emitter nozzle
    this.x = startX + (Math.random() - 0.5) * 16;
    this.y = startY + (Math.random() - 0.5) * 16;

    // Upward launch angle
    let angle;
    if (emitter === 'left') {
      angle = -Math.PI * (0.22 + Math.random() * 0.22); // -40° to -79°
    } else {
      angle = -Math.PI * (0.56 + Math.random() * 0.22); // -101° to -140°
    }

    const diagonal = Math.hypot(viewportW, viewportH);
    const speed = diagonal * (Math.random() * 0.55 + 1.25);

    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;

    // Natural tumbling rotation across 2D/3D space
    this.rotation = (Math.random() - 0.5) * Math.PI * 2;
    this.rotSpeed = (Math.random() * 2.8 + 1.2) * (Math.random() < 0.5 ? 1 : -1);

    // 3D Corkscrew spin around its own spiral axis
    this.spinAngle = Math.random() * Math.PI * 2;
    this.spinSpeed = (Math.random() * 4 + 3) * (Math.random() < 0.5 ? 1 : -1);

    // Aerodynamic floating properties
    this.gravity = Math.random() * 60 + 300;
    this.drag = 0.016;
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.wobbleSpeed = Math.random() * 5 + 3;
    this.wobbleAmp = Math.random() * 28 + 14;

    this.age = 0;
    this.lifespan = Math.random() * 1.0 + 4.5; // 4.5s to 5.5s
    this.alpha = 1.0;
  }

  update(dt) {
    this.age += dt;
    if (this.age >= this.lifespan) return false;

    const remaining = this.lifespan - this.age;
    this.alpha = remaining < 1.0 ? Math.max(0, remaining / 1.0) : 1.0;

    const speed = Math.hypot(this.vx, this.vy);
    const dynamicDrag = this.drag * (1 + (speed / 750) * 0.7);
    this.vx *= Math.max(0.65, 1 - dynamicDrag * dt * 60);
    this.vy *= Math.max(0.65, 1 - dynamicDrag * dt * 60);

    this.vy += this.gravity * dt;

    this.wobblePhase += this.wobbleSpeed * dt;
    this.vx += Math.sin(this.wobblePhase) * this.wobbleAmp * dt;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Natural tumbling rotation + internal 3D corkscrew spin
    this.rotation += this.rotSpeed * dt;
    this.spinAngle += this.spinSpeed * dt;

    return true;
  }

  draw(ctx) {
    if (this.alpha <= 0.005) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;

    const totalHeight = this.totalTurns * this.turnPitch;
    const numSlices = Math.round(this.totalTurns * 12); // smooth curved segments
    const halfW = this.ribbonWidth / 2;

    const cosR = Math.cos(this.rotation);
    const sinR = Math.sin(this.rotation);

    // Precalculate spine points of the mini 3D helix with tumble rotation
    const points = [];
    for (let i = 0; i <= numSlices; i++) {
      const u = i / numSlices;
      const theta = u * this.totalTurns * Math.PI * 2 + this.spinAngle;

      // Coordinate along spring axis (-totalHeight/2 to +totalHeight/2)
      const s = (u - 0.5) * totalHeight;
      // Lateral spiral deflection
      const lat = Math.cos(theta) * this.coilRadius;

      // Rotated position relative to particle center
      const px = this.x + (cosR * lat - sinR * s);
      const py = this.y + (sinR * lat + cosR * s);
      const depth = Math.sin(theta); // 3D depth

      points.push({ x: px, y: py, depth });
    }

    // Render linked ribbon quads along the corkscrew
    for (let i = 0; i < numSlices; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy) || 0.001;
      const nx = -dy / len;
      const ny = dx / len;

      const isFront = p1.depth >= 0;

      // Front of coil: vibrant metallic; back: shaded interior
      ctx.fillStyle = isFront ? this.palette.front : this.palette.shade;

      ctx.beginPath();
      ctx.moveTo(p1.x + nx * halfW, p1.y + ny * halfW);
      ctx.lineTo(p2.x + nx * halfW, p2.y + ny * halfW);
      ctx.lineTo(p2.x - nx * halfW, p2.y - ny * halfW);
      ctx.lineTo(p1.x - nx * halfW, p1.y - ny * halfW);
      ctx.closePath();
      ctx.fill();

      // Specular highlight gleam on front face
      if (isFront && p1.depth > 0.45) {
        ctx.strokeStyle = this.palette.specular;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p1.x + nx * halfW * 0.35, p1.y + ny * halfW * 0.35);
        ctx.lineTo(p2.x + nx * halfW * 0.35, p2.y + ny * halfW * 0.35);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

/**
 * Dual-Corner Dense Confetti & Spiral Streamer Engine
 */
export class RibbonBlastEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.particles = [];
    this.animId = null;
    this.lastTime = 0;
    this.startTime = 0;
    this.isRunning = false;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(2.5, window.devicePixelRatio || 1);
    this.onComplete = null;
  }

  resize() {
    if (!this.canvas) return;
    this.width = window.innerWidth || document.documentElement.clientWidth || 1920;
    this.height = window.innerHeight || document.documentElement.clientHeight || 1080;
    this.dpr = Math.min(2.5, window.devicePixelRatio || 1);

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  spawnRibbons() {
    this.particles = [];
    const w = this.width;
    const h = this.height;

    // High density: small shiny foil confetti pieces + miniature spiral streamers (1/4th size)
    let confettiCount = 380;
    let streamerCount = 18;

    if (w < 600) {
      confettiCount = 180;
      streamerCount = 10;
    } else if (w < 1024) {
      confettiCount = 260;
      streamerCount = 14;
    }

    // ── Bottom-Left Emitter (0, h) ──
    for (let i = 0; i < confettiCount; i++) {
      this.particles.push(new SmallFoilConfetti('left', 0, h, w, h));
    }
    for (let i = 0; i < streamerCount; i++) {
      this.particles.push(new SpiralCurlingStreamer('left', 0, h, w, h));
    }

    // ── Bottom-Right Emitter (w, h) ──
    for (let i = 0; i < confettiCount; i++) {
      this.particles.push(new SmallFoilConfetti('right', w, h, w, h));
    }
    for (let i = 0; i < streamerCount; i++) {
      this.particles.push(new SpiralCurlingStreamer('right', w, h, w, h));
    }
  }

  start(onComplete) {
    if (this.isRunning) {
      this.stop();
    }
    this.isRunning = true;
    this.onComplete = onComplete;
    this.resize();
    this.spawnRibbons();
    this.lastTime = performance.now();
    this.startTime = this.lastTime;

    const loop = (currentTime) => {
      if (!this.isRunning) return;

      const dt = Math.min(0.045, (currentTime - this.lastTime) / 1000);
      this.lastTime = currentTime;

      this.ctx.clearRect(0, 0, this.width, this.height);

      let anyAlive = false;
      const totalTime = (currentTime - this.startTime) / 1000;

      for (let i = 0; i < this.particles.length; i++) {
        const alive = this.particles[i].update(dt);
        if (alive) {
          anyAlive = true;
          this.particles[i].draw(this.ctx);
        }
      }

      if (anyAlive && totalTime < 5.8) {
        this.animId = requestAnimationFrame(loop);
      } else {
        this.stop();
      }
    };

    this.animId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    this.isRunning = false;
    this.particles = [];
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
    if (typeof this.onComplete === 'function') {
      const cb = this.onComplete;
      this.onComplete = null;
      cb();
    }
  }

  destroy() {
    this.stop();
    this.canvas = null;
    this.ctx = null;
  }
}
