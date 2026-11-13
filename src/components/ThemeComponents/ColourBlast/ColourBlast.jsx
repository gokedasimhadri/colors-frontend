import { useEffect, useRef } from 'react';
import { getBlastEngine, DEFAULT_COLORS } from './blastEngine';
import './ColourBlast.css';

/**
 * ColourBlast Component
 *
 * Listens for mouse clicks (and mobile touches) across the page or target element
 * and triggers an independent, realistic colorful powder explosion at the exact click location.
 *
 * @param {Object} props
 * @param {boolean} [props.enabled=true] - Whether click blasting is active
 * @param {number} [props.particleCount=2000] - Particle count per blast
 * @param {number} [props.duration=2000] - Duration in ms
 * @param {string[]} [props.colors] - Array of hex colors
 * @param {number} [props.size=1.0] - Base particle size multiplier
 * @param {number} [props.spread=1.0] - Blast radius / force multiplier
 * @param {number} [props.gravity=60] - Downward gravity drift in px/s^2
 * @param {React.RefObject} [props.targetRef] - Optional element ref to confine click listening
 * @param {string} [props.className=''] - Additional CSS class
 * @param {React.CSSProperties} [props.style={}] - Inline styles
 */
export default function ColourBlast({
  enabled = true,
  particleCount = 420,
  duration = 900,
  colors = DEFAULT_COLORS,
  size = 0.42,
  spread = 0.36,
  gravity = 65,
  targetRef = null,
  className = '',
  style = {},
}) {
  const engineRef = useRef(null);

  // Retain engine instance on mount, release on unmount
  useEffect(() => {
    const engine = getBlastEngine();
    engine.retain();
    engineRef.current = engine;

    return () => {
      if (engineRef.current) {
        engineRef.current.release();
        engineRef.current = null;
      }
    };
  }, []);

  // Click & Touch event listeners
  useEffect(() => {
    if (!enabled) return;

    const triggerAt = (clientX, clientY) => {
      if (!engineRef.current) return;
      engineRef.current.triggerBlast({
        x: clientX,
        y: clientY,
        particleCount,
        duration,
        colors,
        size,
        spread,
        gravity,
      });
    };

    const handleClick = (e) => {
      // Ignore right clicks or auxiliary buttons
      if (e.button !== 0 && e.button !== undefined) return;
      triggerAt(e.clientX, e.clientY);
    };

    const handleTouchStart = (e) => {
      if (!e.touches || e.touches.length === 0) return;
      // Trigger blast at first touch point
      const touch = e.touches[0];
      triggerAt(touch.clientX, touch.clientY);
    };

    // Attach to target element if targetRef provided, otherwise window
    const target = (targetRef && targetRef.current) ? targetRef.current : window;

    target.addEventListener('click', handleClick, { passive: true });
    target.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      target.removeEventListener('click', handleClick);
      target.removeEventListener('touchstart', handleTouchStart);
    };
  }, [enabled, particleCount, duration, colors, size, spread, gravity, targetRef]);

  return (
    <div
      className={`colour-blast-container ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
}

export { ColourBlast };

