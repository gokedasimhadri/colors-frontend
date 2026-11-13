import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { getBlastEngine, DEFAULT_COLORS } from '../ColourBlast/blastEngine';
import './MouseAnimation.css';

/**
 * Calculates screen pixel coordinates from origin prop
 */
function resolveOrigin(origin) {
  if (typeof window === 'undefined') return { x: 0, y: 0 };
  const w = window.innerWidth;
  const h = window.innerHeight;

  if (typeof origin === 'string') {
    switch (origin.toLowerCase()) {
      case 'top':
        return { x: w / 2, y: h * 0.25 };
      case 'bottom':
        return { x: w / 2, y: h * 0.75 };
      case 'left':
        return { x: w * 0.25, y: h / 2 };
      case 'right':
        return { x: w * 0.75, y: h / 2 };
      case 'top-left':
        return { x: w * 0.2, y: h * 0.2 };
      case 'top-right':
        return { x: w * 0.8, y: h * 0.2 };
      case 'bottom-left':
        return { x: w * 0.2, y: h * 0.8 };
      case 'bottom-right':
        return { x: w * 0.8, y: h * 0.8 };
      case 'center':
      default:
        return { x: w / 2, y: h / 2 };
    }
  }

  if (origin && typeof origin === 'object') {
    let x = origin.x ?? w / 2;
    let y = origin.y ?? h / 2;
    // Normalize if passed as fraction 0..1
    if (x >= 0 && x <= 1) x *= w;
    if (y >= 0 && y <= 1) y *= h;
    return { x, y };
  }

  return { x: w / 2, y: h / 2 };
}

/**
 * MouseAnimation Component
 *
 * Automatically triggers a grand, colorful powder explosion when the website loads
 * or component mounts. Supports repeat modes, configurable origin, particle count,
 * duration, and realistic powder physics.
 *
 * @param {Object} props
 * @param {boolean} [props.autoPlay=true] - Trigger explosion automatically after mount
 * @param {boolean} [props.repeat=false] - Whether to repeat explosion periodically
 * @param {number} [props.repeatDelay=4000] - Interval between repeated explosions in ms
 * @param {number} [props.duration=2500] - Lifespan of the powder blast in ms
 * @param {number} [props.particleCount=3000] - Number of powder particles
 * @param {string|{x: number, y: number}} [props.origin='center'] - Position ('center'|'top'|'bottom'|coords)
 * @param {string[]} [props.colors] - Array of hex colors for the explosion
 * @param {number} [props.size=1.0] - Base particle size multiplier
 * @param {number} [props.spread=1.2] - Radial burst spread multiplier
 * @param {number} [props.gravity=50] - Downward gravitational drift (px/s^2)
 * @param {number} [props.delay=200] - Initial delay in ms before autoPlay fires
 * @param {string} [props.className=''] - Custom CSS class
 * @param {React.CSSProperties} [props.style={}] - Inline styles
 */
export const MouseAnimation = forwardRef(function MouseAnimation(
  {
    autoPlay = true,
    repeat = false,
    repeatDelay = 4000,
    duration = 2500,
    particleCount = 3000,
    origin = 'center',
    colors = DEFAULT_COLORS,
    size = 1.0,
    spread = 1.2,
    gravity = 50,
    delay = 200,
    className = '',
    style = {},
  },
  ref
) {
  const engineRef = useRef(null);
  const firedRef = useRef(false);

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

  // Callable trigger function
  const trigger = useCallback(
    (customOrigin) => {
      if (!engineRef.current) return;
      const pos = resolveOrigin(customOrigin || origin);
      engineRef.current.triggerBlast({
        x: pos.x,
        y: pos.y,
        particleCount,
        duration,
        colors,
        size,
        spread,
        gravity,
      });
    },
    [origin, particleCount, duration, colors, size, spread, gravity]
  );

  // Expose imperative handle to parent components
  useImperativeHandle(ref, () => ({
    trigger,
  }));

  // Handle autoPlay on mount (preventing duplicate fires on React StrictMode re-renders)
  useEffect(() => {
    if (!autoPlay) return;

    let repeatTimer = null;
    let initialTimer = null;

    if (!firedRef.current) {
      firedRef.current = true;
      initialTimer = setTimeout(() => {
        trigger();

        if (repeat) {
          repeatTimer = setInterval(() => {
            trigger();
          }, Math.max(duration + 500, repeatDelay));
        }
      }, delay);
    } else if (repeat) {
      repeatTimer = setInterval(() => {
        trigger();
      }, Math.max(duration + 500, repeatDelay));
    }

    return () => {
      if (initialTimer) clearTimeout(initialTimer);
      if (repeatTimer) clearInterval(repeatTimer);
    };
  }, [autoPlay, repeat, repeatDelay, duration, delay, trigger]);

  return (
    <div
      className={`mouse-animation-container ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
});

export default MouseAnimation;

