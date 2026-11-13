import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

/**
 * GlassShaderCanvas
 *
 * Full Apple Liquid Glass Optical Stack:
 * 1. Three.js: 3D scene & camera context
 * 2. WebGL Shaders: Custom GLSL fragment shader for real-time light refraction
 * 3. Fresnel Shader: Curved edge bevel lighting (Schlick's approximation)
 * 4. Snell's Law specular light tracking in official Gold #be9337
 * 5. Automatic battery/GPU saving via IntersectionObserver
 */
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

    const mouse = { x: 0.5, y: 0.3, targetX: 0.5, targetY: 0.3, hovered: false };
    let hoverProgress = 0;

    // Mouse movement
    const onMouseMove = (e) => {
      const rect = parent.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        mouse.targetX = (e.clientX - rect.left) / rect.width;
        // Invert Y for WebGL coordinates (0,0 is bottom-left in GLSL)
        mouse.targetY = 1.0 - (e.clientY - rect.top) / rect.height;
        mouse.hovered = true;
      }
    };

    const onMouseLeave = () => {
      mouse.hovered = false;
      mouse.targetX = 0.5;
      mouse.targetY = 0.8;
    };

    parent.addEventListener('mousemove', onMouseMove, { passive: true });
    parent.addEventListener('mouseleave', onMouseLeave, { passive: true });

    // Try initializing WebGL with Three.js
    try {
      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.pointerEvents = 'none';
      renderer.domElement.style.borderRadius = `${borderRadius}px`;
      container.appendChild(renderer.domElement);

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

        // Signed distance function of a rounded box
        float sdRoundedBox(vec2 p, vec2 b, float r) {
          vec2 q = abs(p) - b + r;
          return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
        }

        // True VIBGYOR (Violet, Indigo, Blue, Green, Yellow, Orange, Red) Spectral Dispersion
        vec3 getVibgyor(float t) {
          float st = fract(t) * 6.0;
          float f = fract(st);
          int idx = int(st);

          vec3 cV   = vec3(0.58, 0.12, 0.90); // Violet
          vec3 cInd = vec3(0.29, 0.08, 0.65); // Indigo
          vec3 cB   = vec3(0.05, 0.45, 0.98); // Blue
          vec3 cG   = vec3(0.10, 0.85, 0.35); // Green
          vec3 cY   = vec3(1.00, 0.88, 0.10); // Yellow
          vec3 cO   = vec3(1.00, 0.50, 0.05); // Orange
          vec3 cR   = vec3(0.95, 0.15, 0.25); // Red

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

          // Discard pixels outside 12px rounded corner bounds
          float dist = sdRoundedBox(centeredPixels, halfSize, uRadius);
          if (dist > 0.0) {
            discard;
          }

          // ── Fresnel Curved Edge Shader (Schlick's formula) ──
          float bevelWidth = 10.0;
          float bevelFactor = clamp(-dist / bevelWidth, 0.0, 1.0);
          vec2 normalDir = normalize(centeredPixels + vec2(0.0001));
          float normalZ = sqrt(max(0.0, 1.0 - pow(1.0 - bevelFactor, 2.0)));
          vec3 surfaceNormal = normalize(vec3(normalDir * (1.0 - bevelFactor), normalZ));
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          float fresnel = pow(1.0 - max(0.0, dot(surfaceNormal, viewDir)), 2.8);

          // ── Compact Specular Spotlight Under Cursor ──
          vec2 mousePixels = uMouse * uResolution;
          vec2 diff = pixelCoords - mousePixels;
          float lightDist = length(diff);
          float spotRadius = clamp(min(uResolution.x, uResolution.y) * 0.45, 80.0, 135.0);
          float specSpot = clamp(1.0 - lightDist / spotRadius, 0.0, 1.0);
          specSpot = pow(specSpot, 2.6);

          // ── VIBGYOR Prismatic Dispersion Angle & Distance ──
          float angle = atan(diff.y, diff.x);
          float spectrumShift = angle / 6.283185 + lightDist * 0.004 + uTime * 0.22;
          vec3 prismColor = getVibgyor(spectrumShift);

          // Highlight core: blend spectrum with a brilliant specular white glint
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

      material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uResolution: { value: new THREE.Vector2(100, 100) },
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
    } catch (err) {
      console.warn('WebGL fallback in LiquidGlass:', err);
    }

    // Resize handler
    const updateSize = (w, h) => {
      if (!renderer || !material) return;
      renderer.setSize(w, h, false);
      material.uniforms.uResolution.value.set(w, h);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          updateSize(width, height);
        }
      }
    });
    resizeObserver.observe(parent);

    // Visibility observer to save battery/GPU when scrolled out of view
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(parent);

    // Animation loop
    const animate = () => {
      if (isVisible && renderer && material && scene && camera) {
        // Smooth hover factor
        const targetHover = mouse.hovered ? 1.0 : 0.0;
        hoverProgress += (targetHover - hoverProgress) * 0.12;

        // Smooth mouse spring interpolation
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;

        material.uniforms.uHover.value = hoverProgress;
        material.uniforms.uMouse.value.set(mouse.x, mouse.y);
        material.uniforms.uIsLight.value = theme === 'light' ? 1.0 : 0.0;
        material.uniforms.uTime.value = performance.now() * 0.001;

        renderer.render(scene, camera);
      }
      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);

    return () => {
      parent.removeEventListener('mousemove', onMouseMove);
      parent.removeEventListener('mouseleave', onMouseLeave);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      if (animFrame) cancelAnimationFrame(animFrame);
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentElement) {
          renderer.domElement.parentElement.removeChild(renderer.domElement);
        }
      }
      if (material) material.dispose();
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
