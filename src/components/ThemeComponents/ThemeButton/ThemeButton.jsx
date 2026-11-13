import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ThemeButton.css';

/**
 * ThemeButton - Pure Transparent Liquid Glass Button Component
 * 
 * Optical characteristics:
 * - 100% transparent backdrop-filter glass (NO solid background color).
 * - Naturally absorbs and blends whatever colors/gradients/images are behind it.
 * - Cleanses/resets conflicting styles (solid backgrounds, heavy borders, default shadows).
 * - Only width and height dictate the dimensions; all other styling is pure fluid glass physics.
 * 
 * Props:
 * @param {React.ReactNode} children - Button text or inner elements
 * @param {string|React.Component} as - Render tag or component ('button', 'a', Link, etc.)
 * @param {string|number} width - Explicit width (e.g. '200px', 200, '100%')
 * @param {string|number} height - Explicit height (e.g. '48px', 48)
 * @param {string|number} blur - Glass blur radius (e.g. 16 or '16px')
 * @param {string|number} borderRadius - Corner radius (e.g. 9999 or '9999px')
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 * @param {string} to - React Router path (automatically sets `as={Link}`)
 * @param {string} href - External URL link (automatically sets `as="a"`)
 * @param {function} onClick - Click handler
 * @param {string} type - Button type ('button', 'submit', 'reset')
 * @param {boolean} disabled - Disabled state
 */
const ThemeButton = forwardRef(function ThemeButton(
  {
    children,
    as,
    width,
    height,
    color,
    border,
    blur,
    borderRadius,
    className = '',
    style = {},
    showBlast = true,
    blastSrc = '/blast.png',
    blastSize,
    to,
    href,
    type,
    disabled = false,
    ...rest
  },
  ref
) {
  const internalRef = useRef(null);
  const [dynamicBlastSize, setDynamicBlastSize] = useState(null);

  // Dynamically calculate blast size based on button width & height
  useEffect(() => {
    if (!showBlast) return;
    const el = internalRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const w = rect.width || el.offsetWidth || 100;
      const h = rect.height || el.offsetHeight || 42;
      // Radius must strictly NEVER exceed button height (stays cleanly within the button's vertical bounds)
      const radius = Math.min(h * 0.88, Math.max(h * 0.65, w * 0.40));
      const diameter = Math.round(radius * 2);
      setDynamicBlastSize(diameter);
    };

    measure();

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        measure();
      });
      ro.observe(el);
    } else {
      window.addEventListener('resize', measure);
    }

    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', measure);
    };
  }, [showBlast]);

  const handleRef = (el) => {
    internalRef.current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref && typeof ref === 'object') {
      ref.current = el;
    }
  };

  // Determine component tag
  let Component = as;
  if (!Component) {
    if (to) {
      Component = Link;
    } else if (href) {
      Component = 'a';
    } else {
      Component = 'button';
    }
  }

  // Format dimensions (numbers convert to px)
  const formatDim = (val) => {
    if (val === undefined || val === null || val === '') return undefined;
    return typeof val === 'number' ? `${val}px` : val;
  };

  const dynamicStyles = {
    ...style,
  };

  if (width !== undefined) {
    dynamicStyles['--tb-width'] = formatDim(width);
    dynamicStyles.width = formatDim(width);
  }
  if (height !== undefined) {
    dynamicStyles['--tb-height'] = formatDim(height);
    dynamicStyles.height = formatDim(height);
  }
  if (color !== undefined) {
    dynamicStyles['--tb-color'] = color;
    dynamicStyles.color = color;
  }
  if (border !== undefined) {
    dynamicStyles['--tb-border'] = border;
    dynamicStyles.border = border;
  }
  if (blur !== undefined) {
    dynamicStyles['--tb-blur'] = formatDim(blur);
  }
  if (borderRadius !== undefined) {
    dynamicStyles['--tb-radius'] = formatDim(borderRadius);
    dynamicStyles.borderRadius = formatDim(borderRadius);
  }
  if (blastSize !== undefined) {
    dynamicStyles['--tb-blast-size'] = formatDim(blastSize);
  } else if (dynamicBlastSize) {
    dynamicStyles['--tb-blast-size'] = `${dynamicBlastSize}px`;
  }

  // Prepare element props
  const elementProps = {
    ref: handleRef,
    className: `theme-glass-btn ${className}`.trim(),
    style: dynamicStyles,
    disabled: Component === 'button' ? disabled : undefined,
    'aria-disabled': disabled || undefined,
    ...rest,
  };

  if (Component === 'button' && !type) {
    elementProps.type = 'button';
  } else if (type) {
    elementProps.type = type;
  }

  if (to) {
    elementProps.to = to;
  }
  if (href) {
    elementProps.href = href;
  }

  return (
    <Component {...elementProps}>
      <span className="theme-glass-btn-content">{children}</span>
      {showBlast && (
        <img
          src={typeof showBlast === 'string' ? showBlast : blastSrc}
          alt=""
          aria-hidden="true"
          className="theme-glass-btn-blast"
        />
      )}
    </Component>
  );
});

ThemeButton.displayName = 'ThemeButton';

export default ThemeButton;

