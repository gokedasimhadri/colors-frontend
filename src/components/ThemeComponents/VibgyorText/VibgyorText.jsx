import React from 'react';
import { NavLink } from 'react-router-dom';
import './VibgyorText.css';

/**
 * VibgyorText - Reusable component for Nav/Footer links and menu text.
 * 
 * Features:
 * - On Hover OR when Active (route active / active prop):
 *   1. Text color animates through the 7 VIBGYOR colors in a continuous, smooth wave.
 *   2. Text scales up smoothly (scale(1.08)).
 * - ZERO text duplication (styles strictly applied to single inner text element).
 */
export default function VibgyorText({
  as,
  to,
  href,
  active = false,
  showActive = true,
  end,
  className = '',
  style = {},
  children,
  onClick,
  ...restProps
}) {
  // 1. Router NavLink (Automatic route active detection only if showActive is true)
  if (to) {
    const isExactEnd = end !== undefined ? end : to === '/';
    return (
      <NavLink
        to={to}
        end={isExactEnd}
        onClick={onClick}
        className={({ isActive }) =>
          `vibgyor-interactive-link ${(showActive && isActive) || active ? 'active' : ''} ${className}`.trim()
        }
        style={style}
        {...restProps}
      >
        <span className="vibgyor-text-inner">
          {children}
        </span>
      </NavLink>
    );
  }

  // 2. External / anchor link
  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        className={`vibgyor-interactive-link ${active ? 'active' : ''} ${className}`.trim()}
        style={style}
        {...restProps}
      >
        <span className="vibgyor-text-inner">
          {children}
        </span>
      </a>
    );
  }

  // 3. Polymorphic wrapper / span
  const Component = as || 'span';
  return (
    <Component
      className={`vibgyor-interactive-link ${active ? 'active' : ''} ${className}`.trim()}
      style={style}
      onClick={onClick}
      {...restProps}
    >
      <span className="vibgyor-text-inner">
        {children}
      </span>
    </Component>
  );
}

export { VibgyorText };
