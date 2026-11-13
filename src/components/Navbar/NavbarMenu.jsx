import React from 'react';
import { NavLink } from 'react-router-dom';
import ThemeButton from '../ThemeComponents/ThemeButton';
import SplitColorText from '../ThemeComponents/SplitColor/SplitColorText';

export const DEFAULT_NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Events', path: '/events' },
  { label: 'Invitation', path: '/invitation' },
  { label: 'Events Schedule', href: '/Schedule_of_Events.pdf' },
  { label: 'Sponsors', path: '/sponsors' },
  { label: 'Contact', path: '/contact' },
];

/**
 * NavbarMenu - Reusable Navigation Menu Component
 * 
 * Powered by ThemeButton (Liquid Glass) and SplitColorText.
 * Forwards all ThemeButton props so they can be customized seamlessly.
 *
 * @param {Array} [items] - Navigation items array [{ label, path, href, ... }]
 * @param {boolean} [showBlast=true] - Whether to show the corner blast effect on hover
 * @param {string} [blastSrc='/blast.png'] - Source of blast image
 * @param {number|string} [blastSize] - Dynamic or fixed size of the blast
 * @param {number|string} [borderRadius=10] - Border radius for buttons
 * @param {number|string} [blur] - Backdrop blur override
 * @param {number|string} [width] - Button width
 * @param {number|string} [height] - Button height
 * @param {string} [className=''] - Container class name
 * @param {string} [buttonClassName=''] - Individual button class name
 * @param {object} [style={}] - Container style
 * @param {object} [buttonStyle={}] - Individual button style
 * @param {function} [onItemClick] - Click handler for each nav item (e.g. closeMenu)
 * @param {boolean} [isMobile=false] - Whether menu is rendered in mobile drawer
 * @param {boolean} [screenSync=true] - Auto-sync text color across 50vw split
 * @param {string} [leftColor='#0A1128'] - Left side text color (white background)
 * @param {string} [rightColor='#FFFFFF'] - Right side text color (black background)
 */
export default function NavbarMenu({
  items = DEFAULT_NAV_ITEMS,
  showBlast = true,
  blastSrc = '/blast.png',
  blastSize,
  borderRadius,
  blur = 20,
  width,
  height,
  gap = '2rem',
  className = '',
  buttonClassName = '',
  style = {},
  buttonStyle = {},
  onItemClick,
  isMobile = false,
  screenSync = true,
  leftColor = '#0f172a',
  rightColor = '#ffffff',
  ...restThemeButtonProps
}) {
  const containerClass = isMobile 
    ? `navbar-menu-mobile ${className}`.trim() 
    : `navbar-links ${className}`.trim();

  const containerStyle = {
    ...(isMobile ? {} : { gap }),
    ...style,
  };

  return (
    <ul className={containerClass} style={containerStyle}>
      {items.map((item) => {
        // Individual item props merged with component-level ThemeButton props
        const itemThemeProps = {
          showBlast: item.showBlast !== undefined ? item.showBlast : showBlast,
          blastSrc: item.blastSrc || blastSrc,
          blastSize: item.blastSize !== undefined ? item.blastSize : blastSize,
          borderRadius: item.borderRadius !== undefined ? item.borderRadius : borderRadius,
          blur: item.blur !== undefined ? item.blur : blur,
          width: item.width !== undefined ? item.width : (isMobile ? '100%' : width),
          height: item.height !== undefined ? item.height : height,
          ...restThemeButtonProps,
          style: {
            ...(isMobile ? { justifyContent: 'flex-start', margin: '0.35rem 0' } : {}),
            ...buttonStyle,
            ...(item.style || {}),
          },
          className: `navbar-theme-btn ${buttonClassName} ${item.className || ''}`.trim(),
        };

        const handleClick = (e) => {
          if (item.onClick) item.onClick(e);
          if (onItemClick) onItemClick(e, item);
        };

        return (
          <li key={item.label} className="navbar-menu-item">
            {item.href ? (
              <ThemeButton
                as="a"
                href={item.href}
                target={item.target || '_blank'}
                rel={item.rel || 'noopener noreferrer'}
                onClick={handleClick}
                {...itemThemeProps}
              >
                <SplitColorText
                  screenSync={screenSync}
                  leftColor={leftColor}
                  rightColor={rightColor}
                >
                  {item.label}
                </SplitColorText>
              </ThemeButton>
            ) : (
              <ThemeButton
                as={NavLink}
                to={item.path}
                end={item.path === '/'}
                onClick={handleClick}
                {...itemThemeProps}
              >
                <SplitColorText
                  screenSync={screenSync}
                  leftColor={leftColor}
                  rightColor={rightColor}
                >
                  {item.label}
                </SplitColorText>
              </ThemeButton>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export { NavbarMenu };

