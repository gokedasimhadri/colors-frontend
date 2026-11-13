import React, { forwardRef } from 'react';
import GlassShaderCanvas from './GlassShaderCanvas';
import './LiquidGlassCard.css';

/**
 * LiquidGlass - Advanced Optical Apple-Style Liquid Glass Container
 *
 * Integrated Technologies:
 * 1. React: Component architecture & lifecycle
 * 2. SVG Filters: Optical refraction & caustic distortion
 * 3. Canvas Shaders: Dynamic specular light tracking & Snell's law refraction
 * 4. CSS backdrop-filter: Multi-level background sampling, blur & saturation boost
 * 5. Fluid spring physics: Natural damping response to cursor motion
 *
 * Features:
 * - 12px border radius
 * - Zero borders (border: none)
 * - Zero card hover translation
 * - Split color text contrast (light / dark)
 */
export const LiquidGlass = forwardRef(function LiquidGlass(
  {
    children,
    as: Component = 'div',
    theme = 'auto',
    borderRadius = 12,
    enableShader = true,
    className = '',
    style = {},
    ...rest
  },
  ref
) {
  const themeClass =
    theme === 'light'
      ? 'lg-card-light'
      : theme === 'dark'
      ? 'lg-card-dark'
      : 'lg-card-auto';

  return (
    <Component
      ref={ref}
      className={`liquid-glass-card ${themeClass} ${className}`.trim()}
      style={{
        borderRadius: `${borderRadius}px`,
        ...style,
      }}
      {...rest}
    >
      {/* ── 1. SVG Optical Refraction Filter Definition ── */}
      <svg
        className="liquid-glass-svg-filter"
        style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}
        aria-hidden="true"
      >
        <defs>
          <filter id="apple-glass-refract" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.03 0.05"
              numOctaves="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
          </filter>
        </defs>
      </svg>

      {/* ── 2. Canvas Shader for Real-time Specular Light & Caustics ── */}
      {enableShader && (
        <GlassShaderCanvas theme={theme} borderRadius={borderRadius} />
      )}

      {/* ── 3. Content Container (Keeps text above shader with perfect alignment) ── */}
      <div className="lg-card-content">
        {children}
      </div>
    </Component>
  );
});

export const LiquidGlassCard = LiquidGlass;
export default LiquidGlass;
