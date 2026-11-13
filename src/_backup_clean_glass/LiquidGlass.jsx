import React, { forwardRef } from 'react';
import './LiquidGlassCard.css';

/**
 * LiquidGlass - Clean Optical Liquid Glass Container
 *
 * Features:
 * - 100% transparent backdrop-filter glass with blur.
 * - Built-in 12px border radius.
 * - Split color text contrast awareness (light / dark).
 * - Minimal, uncluttered API without excess props.
 */
export const LiquidGlass = forwardRef(function LiquidGlass(
  {
    children,
    as: Component = 'div',
    theme = 'auto',
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
      style={style}
      {...rest}
    >
      <div className="lg-card-content">
        {children}
      </div>
    </Component>
  );
});

export const LiquidGlassCard = LiquidGlass;
export default LiquidGlass;

