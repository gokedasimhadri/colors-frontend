import { useEffect } from 'react';

// Counter to track number of open modals concurrently (handles multiple or nested modals)
let openModalCount = 0;
let savedBodyOverflow = '';
let savedHtmlOverflow = '';
let savedBodyPaddingRight = '';

export function lockBodyScroll() {
  if (typeof document === 'undefined') return;

  openModalCount++;
  if (openModalCount === 1) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    savedBodyOverflow = document.body.style.overflow;
    savedHtmlOverflow = document.documentElement.style.overflow;
    savedBodyPaddingRight = document.body.style.paddingRight;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    // Prevent horizontal layout pop when vertical scrollbar hides
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.documentElement.classList.add('fest-modal-scroll-locked');
    document.body.classList.add('fest-modal-scroll-locked');
  }
}

export function unlockBodyScroll() {
  if (typeof document === 'undefined') return;

  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount === 0) {
    document.documentElement.style.overflow = savedHtmlOverflow;
    document.body.style.overflow = savedBodyOverflow;
    document.body.style.paddingRight = savedBodyPaddingRight;

    document.documentElement.classList.remove('fest-modal-scroll-locked');
    document.body.classList.remove('fest-modal-scroll-locked');
  }
}

/**
 * Custom React hook that locks background body/html scrolling while isOpen is true.
 * Automatically restores background scroll when closed or component unmounts.
 */
export function useModalScrollLock(isOpen) {
  useEffect(() => {
    if (!isOpen) return;

    lockBodyScroll();

    return () => {
      unlockBodyScroll();
    };
  }, [isOpen]);
}

export default useModalScrollLock;
