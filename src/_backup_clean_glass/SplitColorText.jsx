import React, { forwardRef, useRef, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './SplitColorText.css';

/**
 * SplitColorText - Advanced Scroll-Aware Inverted & Split Color Text Component
 *
 * Capabilities:
 * 1. True Real-Time Pixel Inversion: Uses CSS mix-blend-mode: difference for continuous,
 *    hardware-accelerated pixel-level contrast across white, black, images, gradients, and split screens.
 * 2. Classic Dual-Tone Split Gradient: Preserves sharp linear-gradient background clipping
 *    for headings and labels where splitPercent is specified.
 * 3. Dynamic Stacking-Context Fallback: Uses IntersectionObserver to track background luminance
 *    behind the navbar, providing robust contrast fallbacks with smooth transitions.
 *
 * @param {React.ReactNode} children - Text or nested elements.
 * @param {React.ElementType} [as='span'] - Polymorphic tag ('span', 'h1', 'p', etc.).
 * @param {'auto'|'difference'|'split'|'fallback'} [mode='auto'] - Rendering mode.
 * @param {boolean} [autoInvert=true] - Whether to dynamically invert colors on scroll/backgrounds.
 * @param {number} [splitPercent] - Optional override (0–100) for sharp dual-tone gradient.
 * @param {boolean} [screenSync=true] - Auto-sync split stop with 50vw screen center in split mode.
 * @param {string} [leftColor='#0A1128'] - Left / Light background text color.
 * @param {string} [rightColor='#FFFFFF'] - Right / Dark background text color.
 * @param {string} [blendMode='difference'] - CSS mix-blend-mode ('difference', 'exclusion').
 * @param {boolean} [adaptiveContrast=true] - Enhances contrast on complex surfaces.
 * @param {string} [targetSections='section, header, footer, [data-theme]'] - Observer target selector.
 * @param {string} [transitionDuration='0.25s'] - CSS transition duration for color changes.
 * @param {string} [className=''] - Additional CSS classes.
 * @param {React.CSSProperties} [style={}] - Inline styles.
 */
export const SplitColorText = forwardRef(function SplitColorText(
  {
    children,
    as: Component = 'span',
    mode = 'auto',
    autoInvert = true,
    splitPercent,
    screenSync = true,
    leftColor = '#0A1128',
    rightColor = '#FFFFFF',
    blendMode = 'difference',
    targetSections = 'section, header, footer, [data-theme]',
    transitionDuration = '0.25s',
    className = '',
    style = {},
    ...rest
  },
  ref
) {
  const internalRef = useRef(null);
  const location = useLocation();
  const pathname = location?.pathname || '';
  const isSplitPage = pathname === '/' || pathname === '' || pathname.startsWith('/events');

  // Active rendering mode: if splitPercent or screenSync is provided, prioritize split mode
  const resolvedMode =
    mode !== 'auto'
      ? mode
      : splitPercent !== undefined || screenSync
      ? 'split'
      : autoInvert
      ? 'difference'
      : 'split';

  // State for screenSync split calculation (default to 100% leftColor on non-split subpages)
  const [syncedPercent, setSyncedPercent] = useState(() => {
    if (splitPercent !== undefined) return Number(splitPercent);
    if (!isSplitPage) return 100;
    return 50;
  });

  // State for IntersectionObserver section fallback
  const [detectedTheme, setDetectedTheme] = useState(() => {
    return !isSplitPage ? 'light' : 'dark';
  });

  // Helper: Detect actual effective background luminance under (x, y)
  const detectEffectiveLuminanceAt = (x, y, targetEl, splitX) => {
    if (typeof document === 'undefined') return x < splitX ? 1 : 0;

    const cx = Math.max(0, Math.min(window.innerWidth - 1, x));
    const cy = Math.max(0, Math.min(window.innerHeight - 1, y));

    const elements = typeof document.elementsFromPoint === 'function'
      ? document.elementsFromPoint(cx, cy)
      : [];

    for (const item of elements) {
      if (!item) continue;
      // Skip navbar, menu, buttons, and self
      if (
        item === targetEl ||
        item.closest('.navbar') ||
        item.closest('.navbar-links') ||
        item.closest('.theme-glass-btn') ||
        item.closest('.mobile-menu') ||
        item.closest('.theme-tab-container') ||
        item.closest('.theme-tab-item')
      ) {
        continue;
      }

      // Skip overlay canvases or non-occluding effects
      if (
        item.tagName === 'CANVAS' ||
        item.classList.contains('mouse-animation-canvas') ||
        item.classList.contains('blast-canvas') ||
        item.classList.contains('theme-glass-btn-blast')
      ) {
        continue;
      }

      // 1. Explicit theme attribute
      const themeAttr = item.getAttribute('data-theme') || item.closest('[data-theme]')?.getAttribute('data-theme');
      if (themeAttr === 'light') return 1;
      if (themeAttr === 'dark') return 0;

      // 2. High-priority component checks (cards, hero elements, footer halves)
      if (item.closest('.pillar-card') || item.closest('.final-cta-card')) {
        return cx < splitX ? 1 : 0;
      }
      if (item.closest('.hero-dates-card')) {
        return 1; // Light card surface
      }
      if (item.closest('.uni-footer-left')) {
        return 0; // Dark footer canvas
      }
      if (item.closest('.uni-footer-right')) {
        return 1; // Light footer canvas
      }

      // 3. Computed background color of item or containers (strictly BELOW the split canvas level)
      let curr = item;
      while (
        curr &&
        curr !== document.documentElement &&
        curr !== document.body &&
        !curr.classList.contains('split-background') &&
        !curr.classList.contains('colours-home-main') &&
        !curr.classList.contains('colours-events-main') &&
        !curr.classList.contains('events-page-wrapper') &&
        !curr.classList.contains('home-page') &&
        !curr.classList.contains('app')
      ) {
        if (curr.classList.contains('pillar-card') || curr.classList.contains('final-cta-card')) {
          return cx < splitX ? 1 : 0;
        }
        if (curr.classList.contains('uni-footer-left')) {
          return 0; // Dark footer canvas
        }
        if (curr.classList.contains('uni-footer-right')) {
          return 1; // Light footer canvas
        }

        const bg = window.getComputedStyle(curr).backgroundColor;
        if (bg && bg !== 'transparent' && !bg.includes('rgba(0, 0, 0, 0)')) {
          const match = bg.match(/\d+/g);
          if (match && match.length >= 3) {
            const r = Number(match[0]);
            const g = Number(match[1]);
            const b = Number(match[2]);
            const a = match[3] !== undefined ? Number(match[3]) : 1;
            if (a > 0.4) {
              return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
            }
          }
        }
        curr = curr.parentElement;
      }

      // If we reached the split-background or app root on split page
      return cx < splitX ? 1 : 0;
    }

    return cx < splitX ? 1 : 0;
  };

  // 1. ScreenSync Split Calculation (for mode === 'split' or 'fallback' with dynamic scroll luminance detection)
  useEffect(() => {
    if ((resolvedMode !== 'split' && resolvedMode !== 'fallback') || splitPercent !== undefined || !screenSync) return;
    const el = internalRef.current;
    if (!el) return;

    let ticking = false;
    const calculateSplit = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) {
        ticking = false;
        return;
      }

      if (!isSplitPage) {
        // Non-split pages (Events, Invitation, Sponsors, Contact, etc.):
        // All subpages have light backgrounds (#fff / #fffbeb / #f8fafc).
        // Immediately set 100% leftColor (#0f172a - dark navy) so all text is crystal clear!
        setSyncedPercent(100);
        setDetectedTheme('light');
        ticking = false;
        return;
      }

      const splitBg = document.querySelector('.split-background');
      const bgRect = splitBg?.getBoundingClientRect();
      const splitX = bgRect ? bgRect.left + (bgRect.width / 2) : window.innerWidth / 2;

      // Sample luminance directly underneath this element on scroll
      const cy = rect.top + rect.height / 2;
      const leftX = rect.left + 2;
      const rightX = rect.right - 2;
      const centerX = rect.left + rect.width / 2;

      const lumLeft = detectEffectiveLuminanceAt(leftX, cy, el, splitX);
      const lumRight = detectEffectiveLuminanceAt(rightX, cy, el, splitX);
      const lumCenter = detectEffectiveLuminanceAt(centerX, cy, el, splitX);

      // If both left and right edges sit over a LIGHT surface (lum > 0.5):
      // Force 100% leftColor (#0f172a - dark navy) so text is bold & visible!
      if (lumLeft > 0.5 && lumRight > 0.5) {
        setSyncedPercent(100);
        setDetectedTheme('light');
      }
      // If both left and right edges sit over a DARK surface (lum <= 0.5):
      // Force 0% leftColor (100% rightColor #ffffff - pure white)
      else if (lumLeft <= 0.5 && lumRight <= 0.5) {
        setSyncedPercent(0);
        setDetectedTheme('dark');
      }
      // If element spans across a seam (one side light, other dark):
      else {
        const offset = splitX - rect.left;
        const percent = (offset / rect.width) * 100;
        setSyncedPercent(Math.min(100, Math.max(0, percent)));
        setDetectedTheme(lumCenter > 0.5 ? 'light' : 'dark');
      }

      ticking = false;
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(calculateSplit);
        ticking = true;
      }
    };

    calculateSplit();
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize);
    };
  }, [resolvedMode, splitPercent, screenSync, pathname, isSplitPage]);

  // 2. IntersectionObserver Fallback Background Luminance Tracker
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    // Helper: calculate luminance from RGB
    const getLuminance = (rgbStr) => {
      if (!rgbStr || rgbStr === 'transparent' || rgbStr.includes('rgba(0, 0, 0, 0)')) return null;
      const match = rgbStr.match(/\d+/g);
      if (match && match.length >= 3) {
        const [r, g, b] = match.map(Number);
        return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      }
      return null;
    };

    // Helper: get effective background luminance of element or ancestors
    const getEffectiveLuminance = (el) => {
      let curr = el;
      while (curr && curr !== document.documentElement) {
        const bg = window.getComputedStyle(curr).backgroundColor;
        const lum = getLuminance(bg);
        if (lum !== null) return lum;
        curr = curr.parentElement;
      }
      return 0.5;
    };

    const handleIntersect = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const themeAttr = entry.target.getAttribute('data-theme');
          if (themeAttr === 'light' || themeAttr === 'dark') {
            setDetectedTheme(themeAttr);
          } else {
            const lum = getEffectiveLuminance(entry.target);
            setDetectedTheme(lum > 0.5 ? 'light' : 'dark');
          }
          break;
        }
      }
    };

    // Observe sections around top 0px - 80px where navbar resides
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '0px 0px -85% 0px',
      threshold: [0, 0.1, 0.25],
    });

    const targets = document.querySelectorAll(targetSections);
    targets.forEach((target) => observer.observe(target));

    return () => {
      observer.disconnect();
    };
  }, [targetSections, pathname]);

  const handleRef = (el) => {
    internalRef.current = el;
    if (typeof ref === 'function') {
      ref(el);
    } else if (ref && typeof ref === 'object') {
      ref.current = el;
    }
  };

  // Build merged styles depending on mode
  let mergedStyle = {
    '--split-transition': transitionDuration,
    '--split-active-color': detectedTheme === 'light' ? leftColor : rightColor,
    ...style,
  };

  if (resolvedMode === 'difference') {
    mergedStyle = {
      ...mergedStyle,
      mixBlendMode: blendMode,
      color: '#ffffff',
      WebkitTextFillColor: '#ffffff',
    };
  } else if (resolvedMode === 'split') {
    const activePercent = splitPercent !== undefined ? Number(splitPercent) : syncedPercent;
    const numPercent = Number(activePercent);
    const clampedPercent = Math.min(100, Math.max(0, Number.isFinite(numPercent) ? numPercent : 50));
    const sharpSplitGradient = `linear-gradient(to right, ${leftColor} 0%, ${leftColor} ${clampedPercent}%, ${rightColor} ${clampedPercent}%, ${rightColor} 100%)`;

    mergedStyle = {
      ...mergedStyle,
      backgroundImage: sharpSplitGradient,
      WebkitBackgroundImage: sharpSplitGradient,
    };
  } else if (resolvedMode === 'fallback') {
    const activeColor = detectedTheme === 'light' ? leftColor : rightColor;
    mergedStyle = {
      ...mergedStyle,
      color: activeColor,
      WebkitTextFillColor: activeColor,
      stroke: activeColor,
    };
  }

  const modeClass = `mode-${resolvedMode}`;

  return (
    <Component
      ref={handleRef}
      className={`split-color-text ${modeClass} theme-${detectedTheme} ${className}`.trim()}
      data-mode={resolvedMode}
      data-detected-theme={detectedTheme}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Component>
  );
});

// Convenient alias for backwards compatibility
export const SplitColorWrapper = SplitColorText;

export default SplitColorText;
