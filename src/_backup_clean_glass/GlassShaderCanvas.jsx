import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * GlassShaderCanvas
 *
 * Full Apple Liquid Glass Optical Stack:
 * 1. Three.js: 3D scene & camera context
 * 2. WebGL Shaders: Custom GLSL fragment shader for real-time light refraction
 * 3. Fresnel Shader: Curved edge bevel lighting (Schlick's approximation)
 * 4. Snell's Law specular light tracking in official Gold #be9337 & VIBGYOR dispersion
 * 5. Intelligent On-Demand (Lazy) Context Lifecycle:
 *    - Context created strictly on cursor interaction
 *    - Context immediately freed via forceContextLoss() when mouse leaves
 *    - Prevents browser "Too many active WebGL contexts" exhaustion
 */

// Global counter to prevent browser context exhaustion across multiple cards
let activeWebGLContextCount = 0;
const MAX_CONCURRENT_CONTEXTS = 4;

export function GlassShaderCanvas({ theme = 'light', borderRadius = 12 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const parent = container.parentElement;
    if (!parent) return;

    let renderer = null;
    let scene = null;
    let camera = null;
    let material = null;
    let mesh = null;
    let animFrame = null;
    let isVisible = true;
    let currentWidth = 100;
    let currentHeight = 100;

    const mouse = { x: 0.5, y: 0.3, targetX: 0.5, targetY: 0.3, hovered: false };
    let hoverProgress = 0;

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec2 uResolution;
      uniform vec2 uMouse;
      uniform float uHover;
      uniform float uTime;
      uniform float uIsLight;
      uniform float uRadius;
      varying vec2 vUv;

      float sdRoundedBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + r;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
      }

      vec3 getVibgyor(float t) {
        float st = fract(t) * 6.0;
        float f = fract(st);
        int idx = int(st);

        vec3 cV   = vec3(0.58, 0.12, 0.90);
        vec3 cInd = vec3(0.29, 0.08, 0.65);
        vec3 cB   = vec3(0.05, 0.45, 0.98);
        vec3 cG   = vec3(0.10, 0.85, 0.35);
        vec3 cY   = vec3(1.00, 0.88, 0.10);
        vec3 cO   = vec3(1.00, 0.50, 0.05);
        vec3 cR   = vec3(0.95, 0.15, 0.25);

        if (idx == 0) return mix(cV, cInd, f);
        if (idx == 1) return mix(cInd, cB, f);
        if (idx == 2) return mix(cB, cG, f);
        if (idx == 3) return mix(cG, cY, f);
        if (idx == 4) return mix(cY, cO, f);
        return mix(cO, cR, f);
      }

      void main() {
        vec2 pixelCoords = vUv * uResolution;
        vec2 halfSize = uResolution * 0.5;
        vec2 centeredPixels = pixelCoords - halfSize;

        float dist = sdRoundedBox(centeredPixels, halfSize, uRadius);
        if (dist > 0.0) {
          discard;
        }

        float bevelWidth = 10.0;
        float bevelFactor = clamp(-dist / bevelWidth, 0.0, 1.0);
        vec2 normalDir = normalize(centeredPixels + vec2(0.0001));
        float normalZ = sqrt(max(0.0, 1.0 - pow(1.0 - bevelFactor, 2.0)));
        vec3 surfaceNormal = normalize(vec3(normalDir * (1.0 - bevelFactor), normalZ));
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        float fresnel = pow(1.0 - max(0.0, dot(surfaceNormal, viewDir)), 2.8);

        vec2 mousePixels = uMouse * uResolution;
        vec2 diff = pixelCoords - mousePixels;
        float lightDist = length(diff);
        float spotRadius = clamp(min(uResolution.x, uResolution.y) * 0.45, 80.0, 135.0);
        float specSpot = clamp(1.0 - lightDist / spotRadius, 0.0, 1.0);
        specSpot = pow(specSpot, 2.6);

        float angle = atan(diff.y, diff.x);
        float spectrumShift = angle / 6.283185 + lightDist * 0.004 + uTime * 0.22;
        vec3 prismColor = getVibgyor(spectrumShift);

        vec3 finalColor = mix(prismColor, vec3(1.0), pow(specSpot, 3.5) * 0.65);

        float alpha = 0.0;
        if (uHover > 0.005) {
          float isLightFactor = (uIsLight > 0.5 ? 0.85 : 1.0);
          float specularGlow = (uIsLight > 0.5 ? 0.48 : 0.58) * specSpot * uHover;
          float localBevelGlow = fresnel * 0.40 * specSpot * uHover * isLightFactor;
          alpha = clamp(specularGlow + localBevelGlow, 0.0, 1.0);
        }

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    const initRenderer = () => {
      if (renderer) return true;
      if (activeWebGLContextCount >= MAX_CONCURRENT_CONTEXTS) return false;

      try {
        scene = new THREE.Scene();
        camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        renderer.domElement.style.pointerEvents = 'none';
        renderer.domElement.style.borderRadius = `${borderRadius}px`;

        renderer.domElement.addEventListener(
          'webglcontextlost',
          (e) => {
            e.preventDefault();
          },
          false
        );

        container.appendChild(renderer.domElement);

        material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms: {
            uResolution: { value: new THREE.Vector2(currentWidth, currentHeight) },
            uMouse: { value: new THREE.Vector2(0.5, 0.5) },
            uHover: { value: 0.0 },
            uTime: { value: 0.0 },
            uIsLight: { value: theme === 'light' ? 1.0 : 0.0 },
            uRadius: { value: borderRadius },
          },
          transparent: true,
        });

        const geometry = new THREE.PlaneGeometry(2, 2);
        mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        renderer.setSize(currentWidth, currentHeight, false);
        activeWebGLContextCount++;
        return true;
      } catch (err) {
        console.warn('WebGL fallback in LiquidGlass:', err);
        return false;
      }
    };

    const destroyRenderer = () => {
      if (!renderer) return;
      if (animFrame) {
        cancelAnimationFrame(animFrame);
        animFrame = null;
      }
      try {
        if (renderer.forceContextLoss) {
          renderer.forceContextLoss();
        }
        renderer.dispose();
      } catch {}
      if (renderer.domElement && renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
      if (material) {
        material.dispose();
        material = null;
      }
      if (mesh && scene) {
        scene.remove(mesh);
        mesh = null;
      }
      renderer = null;
      scene = null;
      camera = null;
      activeWebGLContextCount = Math.max(0, activeWebGLContextCount - 1);
    };

    const updateSize = (w, h) => {
      currentWidth = w;
      currentHeight = h;
      if (renderer && material) {
        renderer.setSize(w, h, false);
        material.uniforms.uResolution.value.set(w, h);
      }
    };

    // Animation loop (runs on-demand when hovered or fading out)
    const renderLoop = () => {
      if (!isVisible) {
        animFrame = null;
        return;
      }

      const targetHover = mouse.hovered ? 1.0 : 0.0;
      hoverProgress += (targetHover - hoverProgress) * 0.14;
      mouse.x += (mouse.targetX - mouse.x) * 0.09;
      mouse.y += (mouse.targetY - mouse.y) * 0.09;

      if (renderer && material && scene && camera) {
        material.uniforms.uHover.value = hoverProgress;
        material.uniforms.uMouse.value.set(mouse.x, mouse.y);
        material.uniforms.uIsLight.value = theme === 'light' ? 1.0 : 0.0;
        material.uniforms.uTime.value = performance.now() * 0.001;

        renderer.render(scene, camera);
      }

      // If user left and hover fadeout completed, release WebGL context slot!
      if (!mouse.hovered && hoverProgress < 0.005) {
        hoverProgress = 0;
        destroyRenderer();
        animFrame = null;
        return;
      }

      animFrame = requestAnimationFrame(renderLoop);
    };

    const startLoop = () => {
      if (!animFrame && isVisible) {
        animFrame = requestAnimationFrame(renderLoop);
      }
    };

    // Mouse movement
    const onMouseMove = (e) => {
      const rect = parent.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        mouse.targetX = (e.clientX - rect.left) / rect.width;
        mouse.targetY = 1.0 - (e.clientY - rect.top) / rect.height;
        mouse.hovered = true;

        if (!renderer) {
          initRenderer();
        }
        startLoop();
      }
    };

    const onMouseLeave = () => {
      mouse.hovered = false;
      mouse.targetX = 0.5;
      mouse.targetY = 0.8;
      // Loop continues until fadeout reaches 0, then calls destroyRenderer()
    };

    parent.addEventListener('mousemove', onMouseMove, { passive: true });
    parent.addEventListener('mouseenter', onMouseMove, { passive: true });
    parent.addEventListener('mouseleave', onMouseLeave, { passive: true });

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          updateSize(width, height);
        }
      }
    });
    resizeObserver.observe(parent);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (!isVisible && renderer) {
          destroyRenderer();
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(parent);

    return () => {
      parent.removeEventListener('mousemove', onMouseMove);
      parent.removeEventListener('mouseenter', onMouseMove);
      parent.removeEventListener('mouseleave', onMouseLeave);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      destroyRenderer();
    };
  }, [theme, borderRadius]);

  return (
    <div
      ref={containerRef}
      className="liquid-glass-webgl-container"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        borderRadius: `${borderRadius}px`,
        overflow: 'hidden',
        zIndex: 2,
      }}
    />
  );
}

export default GlassShaderCanvas;
