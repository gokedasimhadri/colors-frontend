import React, { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import SplitColorText from '../SplitColor/SplitColorText';
import './ThemeTab.css';

/**
 * ThemeTab - Fully Transparent Liquid Glass Segmented Tab Bar with Merging Search Bar
 *
 * Capabilities:
 * 1. Liquid Glass Aesthetic: Translucent glass track with backdrop-filter blur,
 *    specular border highlights, and zero solid opaque background.
 * 2. SplitColorText Integration: Tab labels invert automatically across the 50/50 canvas.
 *    Magnifier icons use SplitColorText with mode="fallback" for crystal clear contrast
 *    (pure white on dark canvas, dark navy on light canvas).
 * 3. Active White-Tinted Glass & VIBGYOR Wave: Selected tab features clean frosted glass
 *    with a continuous 7-color VIBGYOR rainbow text animation.
 * 4. Hover State: 100% transparent background with VIBGYOR text animation.
 * 5. Smooth Merging Search Bar:
 *    - In collapsed state, search is a sleek round circle button beside the tabs with a clear magnifier icon.
 *    - On click, the search circle smoothly glides and merges into the tabs container.
 *    - The search bar takes over the container at the EXACT SAME SIZE as the tabs,
 *      with the magnifier icon on the far left, focused input with "Search" placeholder,
 *      and a clean frosted close/clear button on the far right.
 *    - Smoothly morphs back into tabs on close, outside click, or Escape.
 *
 * @param {Array<Object|string>} tabs - List of tab objects [{ id, label, icon, disabled }] or string labels
 * @param {string|number} [activeTab] - Currently active tab identifier
 * @param {string|number} [value] - Alias for activeTab
 * @param {function} [onChange] - Tab change callback (tabId, tabObj) => void
 * @param {function} [onTabChange] - Alias for onChange
 * @param {function} [onSelect] - Alias for onChange
 * @param {'sm'|'md'|'lg'} [size='md'] - Tab bar size preset
 * @param {string} [leftColor='#0f172a'] - Text color on light / left canvas
 * @param {string} [rightColor='#ffffff'] - Text color on dark / right canvas
 * @param {boolean} [screenSync=true] - Synchronize split color stop with screen center
 * @param {string} [searchQuery] - Current search query string
 * @param {function} [onSearchChange] - Search change callback (query) => void
 * @param {string} [searchPlaceholder='Search'] - Search input placeholder
 * @param {boolean} [showSearch=true] - Whether to show the integrated search circle
 * @param {string} [className=''] - Extra container classes
 * @param {React.CSSProperties} [style={}] - Inline container styles
 * @param {string} [ariaLabel='Filter Tabs'] - Accessibility label for tablist
 */
export default function ThemeTab({
  tabs = [],
  activeTab,
  value,
  onChange,
  onTabChange,
  onSelect,
  size = 'md',
  leftColor = '#0f172a',
  rightColor = '#ffffff',
  screenSync = true,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search',
  showSearch = true,
  className = '',
  style = {},
  ariaLabel = 'Filter Tabs'
}) {
  const currentActive = activeTab !== undefined ? activeTab : value;
  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(searchQuery));
  const [tabsWidth, setTabsWidth] = useState(null);

  const containerRef = useRef(null);
  const listRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchCircleRef = useRef(null);

  const hasSearch = Boolean(showSearch && typeof onSearchChange === 'function');

  // Measure natural width of the tabs list when search is closed
  useEffect(() => {
    if (!isSearchOpen && listRef.current) {
      const w = listRef.current.offsetWidth;
      if (w > 0) {
        setTabsWidth(w + 10);
      }
    }
  }, [isSearchOpen, tabs]);

  useEffect(() => {
    const handleResize = () => {
      if (!isSearchOpen && listRef.current) {
        const w = listRef.current.offsetWidth;
        if (w > 0) {
          setTabsWidth(w + 10);
        }
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSearchOpen]);

  // Automatically focus input when search is opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Keep search open if query is present
  useEffect(() => {
    if (searchQuery) {
      setIsSearchOpen(true);
    }
  }, [searchQuery]);

  // Outside click to collapse search if query is empty
  useEffect(() => {
    if (!isSearchOpen) return;
    const handleOutsideClick = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        searchCircleRef.current &&
        !searchCircleRef.current.contains(e.target)
      ) {
        if (!searchQuery) {
          setIsSearchOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isSearchOpen, searchQuery]);

  const handleOpenSearch = () => {
    if (!isSearchOpen && listRef.current) {
      const w = listRef.current.offsetWidth;
      if (w > 0) {
        setTabsWidth(w + 10);
      }
    }
    setIsSearchOpen(true);
  };

  const handleCloseSearch = (e) => {
    if (e) e.stopPropagation();
    if (typeof onSearchChange === 'function') {
      onSearchChange('');
    }
    setIsSearchOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('split-color-sync'));
      setTimeout(() => window.dispatchEvent(new CustomEvent('split-color-sync')), 60);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCloseSearch(e);
    }
  };

  const normalizedTabs = (tabs || []).map((tab) => {
    if (typeof tab === 'string' || typeof tab === 'number') {
      return { id: String(tab), label: String(tab) };
    }
    return {
      id: tab.id !== undefined ? tab.id : (tab.value !== undefined ? tab.value : tab.key),
      label: tab.label !== undefined ? tab.label : (tab.title !== undefined ? tab.title : tab.name),
      icon: tab.icon,
      disabled: Boolean(tab.disabled)
    };
  });

  const handleSelect = (tab) => {
    if (tab.disabled || isSearchOpen) return;
    if (typeof onChange === 'function') onChange(tab.id, tab);
    if (typeof onTabChange === 'function') onTabChange(tab.id, tab);
    if (typeof onSelect === 'function') onSelect(tab.id, tab);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('split-color-sync'));
      setTimeout(() => window.dispatchEvent(new CustomEvent('split-color-sync')), 50);
      setTimeout(() => window.dispatchEvent(new CustomEvent('split-color-sync')), 160);
    }
  };

  const activeIndex = normalizedTabs.findIndex(
    (tab) => String(tab.id) === String(currentActive)
  );
  const validIndex = activeIndex >= 0 ? activeIndex : 0;
  const activeTabObj = normalizedTabs[validIndex] || normalizedTabs[0];

  const handlePrevTab = (e) => {
    if (e) e.stopPropagation();
    if (normalizedTabs.length <= 1) return;
    const prevIndex = (validIndex - 1 + normalizedTabs.length) % normalizedTabs.length;
    handleSelect(normalizedTabs[prevIndex]);
  };

  const handleNextTab = (e) => {
    if (e) e.stopPropagation();
    if (normalizedTabs.length <= 1) return;
    const nextIndex = (validIndex + 1) % normalizedTabs.length;
    handleSelect(normalizedTabs[nextIndex]);
  };

  if (!normalizedTabs.length && !hasSearch) return null;

  return (
    <div
      className={`theme-tab-outer-wrapper ${className}`.trim()}
      style={style}
      onKeyDown={handleKeyDown}
    >
      {/* 1. Liquid Glass Segmented Tab Bar - Morphs into Search Bar of Exact Same Size */}
      <div
        ref={containerRef}
        className={`theme-tab-container size-${size} ${isSearchOpen ? 'search-active' : ''}`}
        style={isSearchOpen && tabsWidth ? { width: `${tabsWidth}px` } : {}}
        role={isSearchOpen ? 'search' : 'tablist'}
        aria-label={ariaLabel}
      >
        {/* A. Segmented Tab Items List (Desktop / Tablet view) */}
        <div ref={listRef} className="theme-tab-list theme-tab-desktop-list" aria-hidden={isSearchOpen}>
          {normalizedTabs.map((tab) => {
            const isActive = currentActive === tab.id;

            return (
              <button
                key={String(tab.id)}
                type="button"
                role="tab"
                tabIndex={isSearchOpen ? -1 : 0}
                aria-selected={isActive}
                disabled={tab.disabled}
                className={`theme-tab-item ${isActive ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
                onClick={() => handleSelect(tab)}
              >
                {tab.icon && <span className="theme-tab-icon">{tab.icon}</span>}

                {isActive ? (
                  <span className="theme-tab-label active">{tab.label}</span>
                ) : (
                  <SplitColorText
                    as="span"
                    className="theme-tab-label"
                    screenSync={screenSync}
                    leftColor={leftColor}
                    rightColor={rightColor}
                  >
                    {tab.label}
                  </SplitColorText>
                )}
              </button>
            );
          })}
        </div>

        {/* B. Mobile Single Tab Stepper with Left and Right Chevrons */}
        <div className="theme-tab-mobile-stepper" aria-hidden={isSearchOpen}>
          <button
            type="button"
            className="theme-tab-chevron-btn theme-tab-chevron-prev"
            onClick={handlePrevTab}
            disabled={normalizedTabs.length <= 1}
            title="Previous Tab"
            aria-label="Previous Tab"
            tabIndex={isSearchOpen ? -1 : 0}
          >
            <SplitColorText
              as="span"
              mode="fallback"
              className="theme-tab-chevron-icon-wrap"
              screenSync={screenSync}
              leftColor={leftColor}
              rightColor={rightColor}
            >
              <ChevronLeft size={18} strokeWidth={2.8} className="theme-tab-chevron-svg" />
            </SplitColorText>
          </button>

          <div className="theme-tab-mobile-active-wrap">
            {activeTabObj && (
              <button
                key={String(activeTabObj.id)}
                type="button"
                role="tab"
                aria-selected={true}
                tabIndex={isSearchOpen ? -1 : 0}
                className="theme-tab-item active theme-tab-mobile-active-item"
                onClick={() => handleSelect(activeTabObj)}
              >
                {activeTabObj.icon && <span className="theme-tab-icon">{activeTabObj.icon}</span>}
                <span className="theme-tab-label active">{activeTabObj.label}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            className="theme-tab-chevron-btn theme-tab-chevron-next"
            onClick={handleNextTab}
            disabled={normalizedTabs.length <= 1}
            title="Next Tab"
            aria-label="Next Tab"
            tabIndex={isSearchOpen ? -1 : 0}
          >
            <SplitColorText
              as="span"
              mode="fallback"
              className="theme-tab-chevron-icon-wrap"
              screenSync={screenSync}
              leftColor={leftColor}
              rightColor={rightColor}
            >
              <ChevronRight size={18} strokeWidth={2.8} className="theme-tab-chevron-svg" />
            </SplitColorText>
          </button>
        </div>

        {/* B. Integrated Search Bar inside container (Reveals when search circle merges into tabs) */}
        {hasSearch && (
          <div className="theme-tab-integrated-search" aria-hidden={!isSearchOpen}>
            {/* Search Icon at the Far Left with SplitColorText fallback contrast */}
            <div className="theme-tab-integrated-search-icon" aria-hidden="true">
              <SplitColorText
                as="span"
                mode="fallback"
                className="theme-tab-search-icon-wrap"
                screenSync={screenSync}
                leftColor={leftColor}
                rightColor={rightColor}
              >
                <Search size={18} strokeWidth={2.4} className="theme-tab-search-svg" />
              </SplitColorText>
            </div>

            {/* Focused Search Input */}
            <input
              ref={searchInputRef}
              type="text"
              tabIndex={isSearchOpen ? 0 : -1}
              className="theme-tab-integrated-search-input"
              placeholder={searchPlaceholder}
              value={searchQuery || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search events"
            />

            {/* Close / Clear Button at Far Right */}
            <button
              type="button"
              className="theme-tab-integrated-search-close"
              onClick={handleCloseSearch}
              title="Close search"
              aria-label="Close search"
              tabIndex={isSearchOpen ? 0 : -1}
            >
              <SplitColorText
                as="span"
                mode="fallback"
                className="theme-tab-close-icon-wrap"
                screenSync={screenSync}
                leftColor={leftColor}
                rightColor="#ffffff"
              >
                <X size={14} strokeWidth={3} className="theme-tab-close-svg" />
              </SplitColorText>
            </button>
          </div>
        )}
      </div>

      {/* 2. Standalone Round Circle Search Button (Smoothly merges into tabs when opened) */}
      {hasSearch && (
        <div
          ref={searchCircleRef}
          className={`theme-tab-search-circle size-${size} ${isSearchOpen ? 'merged' : ''}`}
        >
          <button
            type="button"
            className="theme-tab-search-icon-btn"
            onClick={handleOpenSearch}
            title="Open Search"
            aria-label="Search"
            tabIndex={isSearchOpen ? -1 : 0}
          >
            <SplitColorText
              as="span"
              mode="fallback"
              className="theme-tab-search-icon-wrap"
              screenSync={screenSync}
              leftColor={leftColor}
              rightColor={rightColor}
            >
              <Search size={18} strokeWidth={2.4} className="theme-tab-search-svg" />
            </SplitColorText>
          </button>
        </div>
      )}
    </div>
  );
}
