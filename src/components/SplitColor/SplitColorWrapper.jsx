import React, { forwardRef } from 'react';
import './SplitColorWrapper.css';

/**
 * SplitColorText (SplitColorWrapper)
 *
 * A polymorphic React component that applies a sharp dual-tone split-color gradient
 * effect to any text element or custom component.
 *
 * Visual Defaults:
 * - Left side: Deep Navy Blue (#0A1128)
 * - Right side: Pure White (#FFFFFF)
 * - Split point: 50% sharp boundary
 *
 * @param {React.ReactNode} children - The text or nested elements to be styled.
 * @param {React.ElementType} [as='span'] - Polymorphic HTML tag or React component (h1, h2, p, button, a, etc.).
 * @param {number} [splitPercent=50] - Number (0–100) where the sharp color change occurs.
 * @param {string} [leftColor='#0A1128'] - Hex or CSS color string for the left side.
 * @param {string} [rightColor='#FFFFFF'] - Hex or CSS color string for the right side.
 * @param {string} [className=''] - Additional custom CSS class names.
 * @param {React.CSSProperties} [style={}] - Custom inline styles merged with the split gradient.
 */
export const SplitColorText = forwardRef(function SplitColorText(
  {
    children,
    as: Component = 'span',
    splitPercent = 50,
    leftColor = '#0A1128',
    rightColor = '#FFFFFF',
    className = '',
    style = {},
    ...rest
  },
  ref
) {
  // Clamp split percentage safely between 0 and 100
  const clampedPercent = Math.min(100, Math.max(0, Number(splitPercent) ?? 50));

  // Sharp dual-tone linear gradient with identical split stops (zero blur transition)
  const sharpSplitGradient = `linear-gradient(to right, ${leftColor} 0%, ${leftColor} ${clampedPercent}%, ${rightColor} ${clampedPercent}%, ${rightColor} 100%)`;

  const mergedStyle = {
    backgroundImage: sharpSplitGradient,
    WebkitBackgroundImage: sharpSplitGradient,
    ...style,
  };

  return (
    <Component
      ref={ref}
      className={`split-color-text ${className}`.trim()}
      style={mergedStyle}
      {...rest}
    >
      {children}
    </Component>
  );
});

// Convenient alias matching the filename
export const SplitColorWrapper = SplitColorText;

export default SplitColorText;

/* ─────────────────────────────────────────────────────────────────────────────
   INTEGRATION EXAMPLES
   Demonstrates how to use SplitColorText with Headings, Paragraphs, Buttons, Links
   ───────────────────────────────────────────────────────────────────────────── */
export function SplitColorExamples() {
  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#334155' }}>
      {/* 1. Grand H1 Heading */}
      <SplitColorText as="h1" splitPercent={50} style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '0.04em' }}>
        COLOURS 2027
      </SplitColorText>

      {/* 2. Sub-heading (H2) with custom split at 60% */}
      <SplitColorText as="h2" splitPercent={60} style={{ fontSize: '1.8rem', fontWeight: 800 }}>
        A NATIONAL LEVEL YOUTH FESTIVAL
      </SplitColorText>

      {/* 3. Paragraph text */}
      <SplitColorText as="p" splitPercent={50} style={{ fontSize: '1.1rem', fontWeight: 700 }}>
        Join 25,000+ student delegates across Culturals, Sports, and Creo arts.
      </SplitColorText>

      {/* 4. Interactive Button */}
      <button
        type="button"
        style={{
          padding: '0.8rem 1.8rem',
          borderRadius: '50px',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(10px)',
          width: 'fit-content',
        }}
      >
        <SplitColorText as="span" splitPercent={50} style={{ fontWeight: 800, fontSize: '1rem' }}>
          ✦ Register Now
        </SplitColorText>
      </button>

      {/* 5. Anchor / Link */}
      <a href="#explore" style={{ width: 'fit-content' }}>
        <SplitColorText as="span" splitPercent={50} style={{ fontSize: '1rem', fontWeight: 700, textDecoration: 'underline' }}>
          Explore 50+ Events →
        </SplitColorText>
      </a>

      {/* 6. Custom Colors (Amber to White) */}
      <SplitColorText
        as="h3"
        leftColor="#d97706"
        rightColor="#fde68a"
        splitPercent={45}
        style={{ fontSize: '1.5rem', fontWeight: 800 }}
      >
        ₹10 LAKHS IN CASH PRIZES
      </SplitColorText>
    </div>
  );
}

