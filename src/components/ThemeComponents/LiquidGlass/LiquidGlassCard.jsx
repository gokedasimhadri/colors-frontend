import React, { forwardRef } from 'react';
import './LiquidGlassCard.css';

/**
 * LiquidGlassCard - Pure Optical Liquid Glass Container Component
 *
 * Designed specifically for Colours 2027 festival UI:
 * - 100% transparent backdrop-filter glass with blur and saturation.
 * - Ambient top glare highlight creating fluid optical depth.
 * - Strict 12px border radius (configurable via `borderRadius` prop).
 * - Dual-Tone Split Color aware (supports 'light', 'dark', or 'auto' theme).
 * - High performance pure CSS (zero heavy WebGL or shader overhead).
 *
 * @param {React.ReactNode} children - Content rendered inside the glass card
 * @param {string|React.Component} as - Polymorphic component tag ('div', 'article', etc.)
 * @param {'auto'|'light'|'dark'} theme - Theme variant for contrast ('light' for white canvas, 'dark' for black canvas)
 * @param {string|number} borderRadius - Corner radius (defaults to 12)
 * @param {string|number} blur - Glass blur intensity in px (defaults to 16)
 * @param {string} accentColor - Header accent or glow color (e.g. #e11d48)
 * @param {boolean} interactive - Enable subtle 3D lift and glow on hover
 * @param {string} className - Additional CSS class names
 * @param {React.CSSProperties} style - Custom inline styles
 */
export const LiquidGlassCard = forwardRef(function LiquidGlassCard(
  {
    children,
    as: Component = 'div',
    theme = 'auto',
    borderRadius = 12,
    blur = 16,
    accentColor,
    interactive = true,
    className = '',
    style = {},
    ...rest
  },
  ref
) {
  const radiusVal = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;
  const blurVal = typeof blur === 'number' ? `${blur}px` : blur;

  const dynamicStyles = {
    '--lg-radius': radiusVal,
    '--lg-blur': blurVal,
    ...(accentColor ? { '--lg-accent': accentColor } : {}),
    ...style,
  };

  const themeClass =
    theme === 'light'
      ? 'lg-card-light'
      : theme === 'dark'
      ? 'lg-card-dark'
      : 'lg-card-auto';

  const interactiveClass = interactive ? 'lg-card-interactive' : '';

  return (
    <Component
      ref={ref}
      className={`liquid-glass-card ${themeClass} ${interactiveClass} ${className}`.trim()}
      style={dynamicStyles}
      {...rest}
    >
      <div className="lg-card-glare" aria-hidden="true" />
      <div className="lg-card-content">
        {children}
      </div>
    </Component>
  );
});

export default LiquidGlassCard;

