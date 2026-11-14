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

const SESSION_CANNON_KEY = 'fest_initial_cannon_blast';

/**
 * MouseAnimation Component
 *
 * Triggers realistic dual-corner color powder cannons (from bottom-left and bottom-right)
 * on first page load, dynamically calculated from system screen dimensions.
 * Prevents repeating on subsequent page refreshes within the same browser session.
 */
export const MouseAnimation = forwardRef(function MouseAnimation(
  {
    autoPlay = true,
    repeat = false,
    repeatDelay = 4000,
    duration = 3400,
    particleCount = 2200,
    origin = 'center',
    colors = DEFAULT_COLORS,
    size = 1.15,
    spread = 1.0,
    gravity = 50,
    delay = 350,
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

    // Attach global testing trigger so user can test cannons anytime via console or buttons
    if (typeof window !== 'undefined') {
      window.__triggerFestCannonBlast = () => {
        if (engineRef.current) {
          engineRef.current.triggerDualCornerCannons({
            particleCount,
            duration,
            size,
            spread,
            gravity,
          });
        }
      };
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.release();
        engineRef.current = null;
      }
    };
  }, [particleCount, duration, size, spread, gravity]);

  // Callable single trigger function (backward compatibility)
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

  // Callable dual corner cannon trigger (bottom-left and bottom-right)
  const triggerCannons = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.triggerDualCornerCannons({
      particleCount,
      duration,
      size,
      spread,
      gravity,
    });
  }, [particleCount, duration, size, spread, gravity]);

  // Expose imperative handle to parent components
  useImperativeHandle(ref, () => ({
    trigger,
    triggerCannons,
  }));

  // Handle autoPlay on initial page load (session-guarded, dual corner cannons)
  useEffect(() => {
    if (!autoPlay) return;

    // Check if session has already witnessed the entrance blast
    let hasSeenBlast = false;
    let forceTest = false;

    if (typeof window !== 'undefined') {
      try {
        hasSeenBlast = sessionStorage.getItem(SESSION_CANNON_KEY) === 'true';
        const urlParams = new URLSearchParams(window.location.search);
        forceTest = urlParams.has('blast') || urlParams.has('test_blast');
      } catch (err) {
        hasSeenBlast = false;
      }
    }

    // If already fired in this session and not forced by test flag, skip on refresh!
    if (hasSeenBlast && !forceTest && !repeat) {
      return;
    }

    let repeatTimer = null;
    let initialTimer = null;

    if (!firedRef.current) {
      firedRef.current = true;
      initialTimer = setTimeout(() => {
        // Trigger realistic dual corner cannons from bottom-left and bottom-right
        triggerCannons();

        // Mark as fired in sessionStorage so page refreshes don't re-trigger
        try {
          sessionStorage.setItem(SESSION_CANNON_KEY, 'true');
        } catch (err) {
          // ignore storage exceptions
        }

        if (repeat) {
          repeatTimer = setInterval(() => {
            triggerCannons();
          }, Math.max(duration + 500, repeatDelay));
        }
      }, delay);
    } else if (repeat) {
      repeatTimer = setInterval(() => {
        triggerCannons();
      }, Math.max(duration + 500, repeatDelay));
    }

    return () => {
      if (initialTimer) clearTimeout(initialTimer);
      if (repeatTimer) clearInterval(repeatTimer);
    };
  }, [autoPlay, repeat, repeatDelay, duration, delay, triggerCannons]);

  return (
    <div
      className={`mouse-animation-container ${className}`.trim()}
      style={style}
      aria-hidden="true"
    />
  );
});

export default MouseAnimation;

