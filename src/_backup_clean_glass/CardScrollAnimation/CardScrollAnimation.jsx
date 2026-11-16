import React, { useRef, useEffect, useState } from 'react';
import './CardScrollAnimation.css';

/**
 * CardScrollAnimation - Reusable Stacking Card Scroll Animation Component
 *
 * In mobile view (<= 768px):
 * Cards smoothly stack on top of each other as the user scrolls down or up,
 * creating an interactive 3D card-deck stacking experience with progressive scale,
 * perspective depth, and elevation shadows.
 *
 * In desktop view (> 768px):
 * Seamlessly behaves as the normal responsive grid layout (e.g. 3 columns)
 * with zero interference to desktop layouts or hover states.
 *
 * @param {React.ReactNode} children - Card elements to wrap and animate
 * @param {string} [className=''] - Additional container classes (e.g. 'subcat-grid')
 * @param {number} [baseTop=85] - Base sticky top offset in px (below navbar)
 * @param {number} [stackOffset=14] - Staggered top offset between stacked cards in px
 * @param {number} [maxOffsetCards=5] - Maximum cards that visually cascade before locking
 * @param {boolean} [disabled=false] - Whether to disable stacking animation
 */
export default function CardScrollAnimation({
  children,
  className = '',
  baseTop = 85,
  stackOffset = 14,
  maxOffsetCards = 5,
  disabled = false
}) {
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const childrenArray = React.Children.toArray(children);
  const totalCards = childrenArray.length;

  // Mobile scroll-driven progressive scaling, depth elevation & stacking state
  useEffect(() => {
    if (!isMobile || disabled || totalCards <= 1) return;

    let ticking = false;

    const updateCardTransforms = () => {
      if (!containerRef.current) return;
      const items = containerRef.current.querySelectorAll('.card-scroll-stack-item');
      const n = items.length;
      if (n <= 1) return;

      // Track which cards are currently in a stacked / overlapping state
      const isCardStacked = new Array(n).fill(false);

      items.forEach((item, i) => {
        const rect = item.getBoundingClientRect();
        const stickyTop =
          parseFloat(item.style.getPropertyValue('--sticky-top')) ||
          baseTop + Math.min(i, maxOffsetCards - 1) * stackOffset;

        // Check if next item is approaching this item's sticky position
        if (i < n - 1) {
          const nextItem = items[i + 1];
          const nextRect = nextItem.getBoundingClientRect();
          const nextStickyTop =
            parseFloat(nextItem.style.getPropertyValue('--sticky-top')) ||
            baseTop + Math.min(i + 1, maxOffsetCards - 1) * stackOffset;

          const distance = nextRect.top - nextStickyTop;
          const triggerDistance = window.innerHeight * 0.45;

          // When current card is pinned and next card is scrolling over it
          if (distance < triggerDistance && rect.top <= stickyTop + 6) {
            const factor = Math.max(0, Math.min(1, 1 - distance / triggerDistance));
            const scale = 1 - factor * 0.045;
            const brightness = 1 - factor * 0.12;

            item.style.transform = `scale(${scale})`;
            item.style.filter = `brightness(${brightness})`;
          } else if (rect.top > stickyTop + 6) {
            item.style.transform = 'scale(1)';
            item.style.filter = 'brightness(1)';
          }

          // STACKING DETECTION:
          // When current card is pinned at sticky top AND next card has reached or overlapped it
          const isCurrentPinned = rect.top <= stickyTop + 6;
          const isNextOverlapping = nextRect.top <= rect.bottom + 15;

          if (isCurrentPinned && isNextOverlapping) {
            isCardStacked[i] = true;
            isCardStacked[i + 1] = true;
          }
        } else {
          // The last card remains full scale
          item.style.transform = 'scale(1)';
          item.style.filter = 'brightness(1)';
        }
      });

      // Dynamically toggle .is-stacked class ONLY when cards are stacked on top of each other
      let changed = false;
      items.forEach((item, i) => {
        const shouldBeStacked = isCardStacked[i];
        const isCurrentlyStacked = item.classList.contains('is-stacked');
        if (shouldBeStacked !== isCurrentlyStacked) {
          changed = true;
          if (shouldBeStacked) {
            item.classList.add('is-stacked');
          } else {
            item.classList.remove('is-stacked');
          }
        }
      });

      if (changed && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('split-color-sync'));
      }

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateCardTransforms);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateCardTransforms();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (containerRef.current) {
        const items = containerRef.current.querySelectorAll('.card-scroll-stack-item');
        items.forEach((item) => {
          item.style.transform = '';
          item.style.filter = '';
          item.classList.remove('is-stacked');
        });
      }
    };
  }, [isMobile, disabled, totalCards, baseTop, stackOffset, maxOffsetCards]);

  if (!childrenArray.length) return null;

  return (
    <div
      ref={containerRef}
      className={`card-scroll-stack-container ${
        isMobile && !disabled ? 'is-mobile-stack' : 'is-desktop-grid'
      } ${className}`.trim()}
    >
      {childrenArray.map((child, index) => {
        const offsetIndex = Math.min(index, maxOffsetCards - 1);
        const cardStickyTop = baseTop + offsetIndex * stackOffset;

        return (
          <div
            key={child.key || index}
            className="card-scroll-stack-item"
            style={{
              '--card-index': index,
              '--card-total': totalCards,
              '--sticky-top': `${cardStickyTop}px`,
              '--card-z-index': index + 1
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
