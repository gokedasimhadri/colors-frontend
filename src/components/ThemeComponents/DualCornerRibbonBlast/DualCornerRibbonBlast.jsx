import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { RibbonBlastEngine } from './ribbonPhysics';
import './DualCornerRibbonBlast.css';

const SESSION_STORAGE_KEY = 'fest_dual_corner_ribbon_blast_fired';

/**
 * Checks whether the ribbon blast should fire:
 * 1. ALWAYS fires if URL has `?test_ribbon=1` (or `?blast=1` or `forceRun=true`).
 * 2. On regular visits, ONLY fires the very FIRST TIME the page is opened in the browser session.
 * 3. Does NOT fire on normal page refresh (F5/reload) or route navigation.
 */
function shouldActivateOnLoad(autoPlay, forceRun) {
  if (!autoPlay) return false;
  if (typeof window === 'undefined') return false;

  // 1. Explicit test URL parameter check (e.g., ?test_ribbon=1)
  const isTestUrl = window.location.search.includes('test_ribbon=1') ||
                    window.location.search.includes('test_ribbon') ||
                    window.location.search.includes('blast');
  if (isTestUrl || forceRun) {
    return true; // Always trigger when ?test_ribbon=1 is present
  }

  // 2. Motion preference check
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return false;
    }
  } catch {
    // ignore
  }

  // 3. First-time open vs. page refresh check using sessionStorage
  try {
    const hasAlreadyFired = sessionStorage.getItem(SESSION_STORAGE_KEY) === 'true';
    if (hasAlreadyFired) {
      // Already fired previously in this session -> DO NOT fire on refresh
      return false;
    }
  } catch {
    // fallback if sessionStorage unavailable
  }

  // First time opening the website
  return true;
}

/**
 * DualCornerRibbonBlast Component
 */
export const DualCornerRibbonBlast = forwardRef(function DualCornerRibbonBlast(
  {
    autoPlay = true,
    delay = 120, // Snappy instant burst right after DOM mount
    forceRun = false,
    className = '',
  },
  ref
) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const hasFiredRef = useRef(false);

  // Manual trigger function
  const trigger = useCallback(() => {
    if (!canvasRef.current) return;
    if (!engineRef.current) {
      engineRef.current = new RibbonBlastEngine(canvasRef.current);
    }
    engineRef.current.start();
  }, []);

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    trigger,
  }));

  useEffect(() => {
    // Attach global testing hook for convenient manual triggers in browser console
    if (typeof window !== 'undefined') {
      window.__triggerDualCornerRibbonBlast = trigger;
    }

    const shouldRun = shouldActivateOnLoad(autoPlay, forceRun);
    if (!shouldRun) return;

    // Prevent double firing on StrictMode mount
    if (hasFiredRef.current) return;

    if (!canvasRef.current) return;
    if (!engineRef.current) {
      engineRef.current = new RibbonBlastEngine(canvasRef.current);
    }

    const handleResize = () => {
      if (engineRef.current) engineRef.current.resize();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const timer = setTimeout(() => {
      hasFiredRef.current = true;
      if (engineRef.current) {
        engineRef.current.start();

        // Mark as fired in sessionStorage so page refreshes will NOT re-trigger
        try {
          sessionStorage.setItem(SESSION_STORAGE_KEY, 'true');
        } catch {
          // ignore
        }
      }
    }, delay);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [autoPlay, delay, forceRun, trigger]);

  return (
    <canvas
      ref={canvasRef}
      className={`dual-corner-ribbon-canvas ${className}`.trim()}
      aria-hidden="true"
    />
  );
});

export default DualCornerRibbonBlast;
