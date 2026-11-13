import React, { forwardRef } from 'react';
import './SplitBackground.css';

/**
 * SplitBackground
 *
 * A reusable, performant React container component that renders a sharp dual-tone
 * vertical split background (Left 50%: Pure White #FFFFFF | Right 50%: Pure Black #000000).
 *
 * Features:
 * - Perfectly straight vertical split at exactly 50% viewport width
 * - Full page coverage with 100vh minimum height
 * - Zero gradients, borders, shadows, or blur across the seam
 * - Non-blocking stacking context (all children render on top with full clickability)
 * - Polymorphic (`as` prop defaults to 'div')
 * - Responsive across desktop, tablet, and mobile with zero horizontal overflow
 *
 * @param {React.ReactNode} children - The content rendered above the split background.
 * @param {React.ElementType} [as='div'] - Polymorphic HTML tag or React component.
 * @param {number} [splitPercent=50] - Vertical split position percentage (0–100).
 * @param {string} [leftColor='#FFFFFF'] - Left side color (defaults to Pure White #FFFFFF).
 * @param {string} [rightColor='#000000'] - Right side color (defaults to Pure Black #000000).
 * @param {string} [className=''] - Additional custom CSS class names.
 * @param {React.CSSProperties} [style={}] - Custom inline styles merged onto container.
 */
export const SplitBackground = forwardRef(function SplitBackground(
  {
    children,
    as: Component = 'div',
    splitPercent = 50,
    leftColor = '#FFFFFF',
    rightColor = '#000000',
    className = '',
    style = {},
    ...rest
  },
  ref
) {
  // Check if non-default colors or custom split percent were passed
  const isCustom =
    leftColor !== '#FFFFFF' ||
    rightColor !== '#000000' ||
    splitPercent !== 50;

  let dynamicStyle = style;
  if (isCustom) {
    const clampedPercent = Math.min(100, Math.max(0, Number(splitPercent) ?? 50));
    const sharpGradient = `linear-gradient(to right, ${leftColor} 0%, ${leftColor} ${clampedPercent}%, ${rightColor} ${clampedPercent}%, ${rightColor} 100%)`;
    dynamicStyle = {
      background: sharpGradient,
      ...style,
    };
  }

  return (
    <Component
      ref={ref}
      className={`split-background ${className}`.trim()}
      style={dynamicStyle}
      {...rest}
    >
      {children}
    </Component>
  );
});

export default SplitBackground;
