import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import './SmoothTransition.css';

/**
 * SmoothTransition
 *
 * Universal, butter-smooth content and tab-view switcher.
 * Provides GPU-accelerated crossfades, directional slides, and auto-animating
 * height adjustment so content and modals never snap or jump abruptly.
 *
 * @param {React.ReactNode} children - Active view content
 * @param {string|number} transitionKey - Trigger key (e.g. mode, activeTab, step)
 * @param {'fade-slide'|'fade'|'scale'|'slide-up'|'slide-down'|'crossfade'} [variant='fade-slide']
 * @param {number} [duration=320] - Transition duration in ms
 * @param {boolean} [animateHeight=true] - Smoothly animate container height
 * @param {string} [className=''] - Extra classes
 * @param {React.CSSProperties} [style={}] - Inline styles
 */
export default function SmoothTransition({
  children,
  transitionKey,
  variant = 'fade-slide',
  duration = 320,
  animateHeight = true,
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState('auto');
  const [isAnimating, setIsAnimating] = useState(false);
  const prevKeyRef = useRef(transitionKey);

  useLayoutEffect(() => {
    if (!animateHeight || !contentRef.current || !containerRef.current) return;

    if (prevKeyRef.current !== transitionKey) {
      prevKeyRef.current = transitionKey;
      setIsAnimating(true);

      const targetHeight = contentRef.current.scrollHeight;
      setContainerHeight(`${targetHeight}px`);

      const timer = setTimeout(() => {
        setIsAnimating(false);
        setContainerHeight('auto');
      }, duration + 40);

      return () => clearTimeout(timer);
    }
  }, [transitionKey, animateHeight, duration, children]);

  // Keep height in sync with dynamic form field changes
  useEffect(() => {
    if (!contentRef.current || isAnimating) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (!isAnimating && containerRef.current && containerHeight !== 'auto') {
          // If not in transition, ensure container remains flexible
          setContainerHeight('auto');
        }
      }
    });

    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, [isAnimating, containerHeight]);

  return (
    <div
      ref={containerRef}
      className={`smooth-transition-container ${isAnimating ? 'animating-height' : ''} ${className}`.trim()}
      style={{
        ...style,
        ...(animateHeight && containerHeight !== 'auto' ? { height: containerHeight } : {}),
        '--smooth-duration-normal': `${duration}ms`
      }}
    >
      <div
        key={String(transitionKey)}
        ref={contentRef}
        className={`smooth-transition-content variant-${variant}`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * SmoothReveal
 *
 * Entrance animation for cards, sections, or individual items.
 */
export function SmoothReveal({
  children,
  delay = 0,
  direction = 'up',
  duration = 340,
  className = '',
  style = {},
  as: Component = 'div'
}) {
  const [revealed, setRevealed] = useState(false);
  const elRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Component
      ref={elRef}
      className={`smooth-reveal dir-${direction} ${revealed ? 'revealed' : ''} ${className}`.trim()}
      style={{
        ...style,
        '--smooth-duration-normal': `${duration}ms`
      }}
    >
      {children}
    </Component>
  );
}

/**
 * SmoothCard
 *
 * Reusable animated card container with fluid hover physics,
 * subtle lift, and active tactile response.
 */
export function SmoothCard({
  children,
  as: Component = 'div',
  className = '',
  style = {},
  onClick,
  ...rest
}) {
  return (
    <Component
      className={`smooth-card ${className}`.trim()}
      style={style}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Component>
  );
}
