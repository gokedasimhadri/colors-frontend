import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { User, Phone, Mail, ArrowLeft, Tag, Users, MapPin, Calendar } from 'lucide-react';
import {
  EVENT_TYPE,
  fetchCategoriesWithSubCategories,
  fetchAllEvents,
  fetchEventsInSubCategory,
  fetchEventDetails,
  fetchFacultyCoordinators,
  fetchStudentCoordinators,
  getSubCatImageUrl,
  getLocalFallbackSubCatImageUrl,
  getEventImageUrl,
  getFacultyCandidateUrls,
  getLoggedStudent,
  logoutStudent
} from '../../services/api';
import StudentAuthModal from '../../components/RegistrationModals/StudentAuthModal';
import EventRegistrationModal from '../../components/RegistrationModals/EventRegistrationModal';
import SplitBackground from '../../components/ThemeComponents/backgrounds/SplitBackground';
import SplitColorText from '../../components/ThemeComponents/SplitColor/SplitColorText';
import { LiquidGlass } from '../../components/ThemeComponents/LiquidGlass';
import ThemeButton from '../../components/ThemeComponents/ThemeButton/ThemeButton';
import ThemeTab from '../../components/ThemeComponents/ThemeTabDesign/ThemeTab';
import CardScrollAnimation from '../../components/ThemeComponents/CardScrollAnimation/CardScrollAnimation';
import './Events.css';

const FEST_TYPE = EVENT_TYPE || 'COLORS';

/**
 * Formats strings to clean Title Case (each word capitalized)
 * instead of all-caps from backend data
 */
export function formatTitleCase(str) {
  if (!str || typeof str !== 'string') return str;
  return str.toLowerCase().replace(/(?:^|\s|-|\/)\S/g, (char) => char.toUpperCase());
}

export default function Events() {
  const { eventCategory, eventSubCategory, eventName } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const initialTab =
    searchParams.get('tab') ||
    searchParams.get('category') ||
    location.state?.tab ||
    location.state?.category ||
    'ALL';

  // ─────────────────────────────────────────────────────────────
  // RENDER BASED ON URL PARAMS:
  // 1. If eventName is set -> View 3: Event Detail
  // 2. Else if eventSubCategory is set -> View 2: Subcategory Events
  // 3. Else -> View 1: All Categories & Subcategories
  // ─────────────────────────────────────────────────────────────

  let content;
  if (eventCategory && eventSubCategory && eventName) {
    content = (
      <EventDetailView
        category={decodeURIComponent(eventCategory)}
        subCategory={decodeURIComponent(eventSubCategory)}
        eventName={decodeURIComponent(eventName)}
        themeCode={FEST_TYPE}
        onBack={() => navigate(`/events/${eventCategory}/${eventSubCategory}`)}
        onNavigateHome={() => navigate('/events')}
      />
    );
  } else if (eventCategory && eventSubCategory) {
    content = (
      <SubCategoryEventsView
        category={decodeURIComponent(eventCategory)}
        subCategory={decodeURIComponent(eventSubCategory)}
        themeCode={FEST_TYPE}
        onBack={() => navigate('/events')}
        onSelectEvent={(nameOrSlug) =>
          navigate(`/events/${encodeURIComponent(eventCategory)}/${encodeURIComponent(eventSubCategory)}/${encodeURIComponent(nameOrSlug)}`)
        }
      />
    );
  } else {
    content = (
      <AllCategoriesView
        themeCode={FEST_TYPE}
        initialTab={initialTab}
        onSelectSubCategory={(catName, subCatName) =>
          navigate(`/events/${encodeURIComponent(catName)}/${encodeURIComponent(subCatName)}`)
        }
        onSelectEvent={(catName, subCatName, nameOrSlug) =>
          navigate(`/events/${encodeURIComponent(catName)}/${encodeURIComponent(subCatName)}/${encodeURIComponent(nameOrSlug)}`)
        }
      />
    );
  }

  return (
    <SplitBackground as="main" className="colours-events-main">
      {content}
    </SplitBackground>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 1: All Categories, Subcategories & Events (COLORS)
// ─────────────────────────────────────────────────────────────
function AllCategoriesView({ themeCode, onSelectSubCategory, onSelectEvent, initialTab = 'ALL' }) {
  const [categories, setCategories] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(() => (initialTab ? initialTab.toUpperCase() : 'ALL'));
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('subcategories'); // 'subcategories' | 'events'

  // Load categories and events for COLORS exclusively
  const loadData = () => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetchCategoriesWithSubCategories(themeCode),
      fetchAllEvents(themeCode)
    ])
      .then(([catData, evData]) => {
        setCategories(Array.isArray(catData) ? catData : []);
        setAllEvents(Array.isArray(evData) ? evData : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load events');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, [themeCode]);

  // Synchronize SplitColorText immediately whenever active category tab, search or viewMode changes without page refresh
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('split-color-sync'));
      const t1 = setTimeout(() => window.dispatchEvent(new CustomEvent('split-color-sync')), 50);
      const t2 = setTimeout(() => window.dispatchEvent(new CustomEvent('split-color-sync')), 160);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [activeTab, searchQuery, viewMode]);

  // Filtered categories based on active category tab & search query
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        const cCode = (cat.code || cat._id || '').toUpperCase();
        const cName = (cat.name || '').toUpperCase();
        if (cCode.includes('FETE') || cName.includes('FETE')) return false;
        if (activeTab === 'ALL') return true;
        const tab = activeTab.toUpperCase();

        return (
          cCode === tab ||
          cName === tab ||
          cCode.includes(tab) ||
          tab.includes(cCode) ||
          cName.includes(tab) ||
          tab.includes(cName)
        );
      })
      .map((cat) => {
        if (!searchQuery.trim()) return cat;
        const q = searchQuery.toLowerCase().trim();

        // Search in subcategories
        const filteredSubs = (cat.data || []).filter((item) => {
          const subTitle = (item.SubCatogory || item.name || item.code || '').toLowerCase();
          const hasMatchingEvents = (item.events || []).some((ev) =>
            (ev.title || ev.eventName || '').toLowerCase().includes(q)
          );
          return subTitle.includes(q) || hasMatchingEvents;
        });

        // Search in category events
        const filteredEvents = (cat.events || []).filter((ev) => {
          const evTitle = (ev.title || ev.eventName || '').toLowerCase();
          const evSub = (ev.subcategoryName || ev.subCategory || '').toLowerCase();
          const evDesc = (ev.description || ev.overview || '').toLowerCase();
          return evTitle.includes(q) || evSub.includes(q) || evDesc.includes(q);
        });

        return {
          ...cat,
          data: filteredSubs,
          events: filteredEvents
        };
      })
      .filter((cat) => (cat.data || []).length > 0 || (cat.events || []).length > 0);
  }, [categories, activeTab, searchQuery]);

  // Derived category filter tabs (CULTURALS, SPORTS, CREO)
  const categoryTabs = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [
        { id: 'CULTURALS', label: 'Culturals' },
        { id: 'SPORTS', label: 'Sports' },
        { id: 'CREO', label: 'Creo Events' }
      ];
    }
    return categories
      .filter((cat) => {
        const id = (cat.code || cat._id || '').toUpperCase();
        const nm = (cat.name || '').toUpperCase();
        return !id.includes('FETE') && !nm.includes('FETE');
      })
      .map((cat) => {
        const id = cat.code || cat._id;
        let label = cat.name || cat.code;
        if (id === 'CREO' && !label.toLowerCase().includes('events') && !label.toLowerCase().includes('arts')) {
          label = 'Creo Events';
        }
        return { id, label, count: cat.totalEventsCount || (cat.data || []).length };
      });
  }, [categories]);

  // Sync activeTab when initialTab prop is provided or changes (e.g. from Home View More button)
  useEffect(() => {
    if (initialTab && initialTab !== 'ALL') {
      const target = initialTab.toUpperCase();
      if (categoryTabs && categoryTabs.length > 0) {
        const match = categoryTabs.find(
          (t) =>
            t.id.toUpperCase() === target ||
            t.id.toUpperCase().includes(target) ||
            target.includes(t.id.toUpperCase()) ||
            t.label.toUpperCase().includes(target)
        );
        if (match) {
          setActiveTab(match.id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }
      setActiveTab('ALL');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [initialTab, categoryTabs]);

  // Total metrics across COLORS
  const totalEventsCount = useMemo(() => {
    return allEvents.length || categories.reduce((sum, c) => sum + (c.totalEventsCount || 0), 0);
  }, [allEvents, categories]);

  // Combined tabs for ThemeTab (ALL + categories) - clean labels without count numbers
  const allCategoryTabs = useMemo(() => [
    { id: 'ALL', label: 'All Events' },
    ...categoryTabs.map((t) => ({ id: t.id, label: t.label }))
  ], [categoryTabs]);

  const totalSubcatsCount = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.data?.length || 0), 0);
  }, [categories]);

  return (
    <div className="events-page-wrapper">
      {/* University Portal Header Banner */}
      <div className="events-hero-header">
        <div className="events-hero-header-inner">
          <div className="events-header-row events-title-row">
            <SplitColorText
              as="h1"
              className="events-hero-title"
              splitPercent={50}
              leftColor="#0f172a"
              rightColor="#ffffff"
            >
              Explore Events
            </SplitColorText>
          </div>

          <div className="events-header-row events-subtitle-row">
            <SplitColorText
              as="p"
              className="events-hero-subtitle"
              splitPercent={50}
              leftColor="#0d1536"
              rightColor="#ffffff"
            >
              Compete, Create, and Celebrate across Cultural, Sports, and Creo arenas
            </SplitColorText>
          </div>

          {/* Search Bar & View Mode Toggle */}
          <div className="events-control-bar">

            {/* Category Filter Tabs with Integrated Circular Search */}
            <ThemeTab
              tabs={allCategoryTabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search"
              className="events-filter-themetab"
            />
          </div>
        </div>
      </div>

      <div className="categories-container" id="events-categories-list">
        {loading && (
          <div className="events-loading">
            <div className="events-spinner" />
            <p>Loading database events for {themeCode}...</p>
          </div>
        )}

        {error && (
          <div className="events-error">
            <h3>Unable to load events</h3>
            <p>{error}</p>
            <button
              onClick={loadData}
              className="btn-checkout-primary"
              style={{ marginTop: '1rem' }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredCategories.length === 0 && (
          <div className="events-empty-state">
            <div className="events-empty-icon-wrap">
              <span className="events-empty-emoji">🎯</span>
            </div>
            <SplitColorText
              as="h3"
              className="events-empty-title"
              screenSync={true}
              leftColor="#0f172a"
              rightColor="#ffffff"
            >
              No events found matching "{searchQuery}"
            </SplitColorText>
            <SplitColorText
              as="p"
              className="events-empty-desc"
              screenSync={true}
              leftColor="#475569"
              rightColor="#cbd5e1"
            >
              Try searching for a different keyword or switch to All Categories.
            </SplitColorText>
            <ThemeButton
              as="button"
              type="button"
              borderRadius={9999}
              className="btn-event-checkout-theme btn-events-empty-action"
              onClick={() => { setSearchQuery(''); setActiveTab('ALL'); }}
            >
              <SplitColorText
                as="span"
                screenSync={true}
                leftColor="#0f172a"
                rightColor="#ffffff"
              >
                Clear Search
              </SplitColorText>
            </ThemeButton>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODE A: BROWSE BY SUBCATEGORIES
            ───────────────────────────────────────────────────────────── */}
        {!loading && !error && viewMode === 'subcategories' && (
          filteredCategories.map((cat) => {
            const catCoordinator = cat.coordinator || (cat.coordinators && cat.coordinators[0]);

            return (
              <section key={cat._id || cat.code} className="category-section">
                {/* Category Header Row with Metrics & Coordinator */}
                <div className="category-header-row">
                  <div className="category-title-area">
                    <SplitColorText
                      key={`cat-heading-${cat.name || cat.code || cat._id}-${activeTab}`}
                      as="h2"
                      className="category-heading"
                      screenSync={true}
                      leftColor="#0f172a"
                      rightColor="#ffffff"
                    >
                      {cat.name || `${cat.code || cat._id} Events`}
                    </SplitColorText>
                    <div className="category-meta-chips">
                      {(cat.totalEventsCount !== undefined || cat.events?.length !== undefined) && (
                        <span className="category-count-badge badge-accent">
                          {cat.totalEventsCount ?? cat.events?.length ?? 0} {(cat.totalEventsCount ?? cat.events?.length ?? 0) === 1 ? 'Event' : 'Events'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category Coordinator Pill with Liquid Glass Design & Lucide Icons */}
                  {catCoordinator && catCoordinator.name && (
                    <div className="category-coord-pill" key={`coord-pill-${catCoordinator.name || ''}-${activeTab}`}>
                      <div className="coord-icon-badge" aria-hidden="true">
                        <SplitColorText
                          as="span"
                          mode="fallback"
                          screenSync={true}
                          leftColor="#0f172a"
                          rightColor="#ffffff"
                          className="coord-badge-split"
                        >
                          <User size={18} strokeWidth={2.3} className="coord-avatar-svg" />
                        </SplitColorText>
                      </div>
                      <div className="coord-info-col">
                        <SplitColorText
                          key={`coord-role-${catCoordinator.name || ''}`}
                          as="span"
                          screenSync={true}
                          leftColor="#0f172a"
                          rightColor="#ffffff"
                          className="coord-role"
                        >
                          Major Event Co-ordinator
                        </SplitColorText>

                        <SplitColorText
                          key={`coord-name-${catCoordinator.name || ''}`}
                          as="span"
                          screenSync={true}
                          leftColor="#0f172a"
                          rightColor="#ffffff"
                          className="coord-name"
                        >
                          {formatTitleCase(catCoordinator.name)}
                        </SplitColorText>

                        {catCoordinator.phone && (
                          <a href={`tel:${catCoordinator.phone}`} className="coord-phone-link">
                            <SplitColorText
                              as="span"
                              mode="fallback"
                              screenSync={true}
                              leftColor="#0f172a"
                              rightColor="#ffffff"
                              className="coord-phone-icon-wrap"
                            >
                              <Phone size={13} strokeWidth={2.4} className="coord-phone-lucide" />
                            </SplitColorText>
                            <SplitColorText
                              key={`coord-phone-${catCoordinator.phone}`}
                              as="span"
                              screenSync={true}
                              leftColor="#0f172a"
                              rightColor="#ffffff"
                              className="coord-phone-number"
                            >
                              {catCoordinator.phone}
                            </SplitColorText>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Subcategory Grid with Reusable Stacking Card Scroll Animation on Mobile */}
                {Array.isArray(cat.data) && cat.data.length > 0 && (
                  <CardScrollAnimation className="subcat-grid">
                    {cat.data.map((item, idx) => {
                      const subCatTitle = item.SubCatogory || item.name;
                      const bannerVal = item.banner || item.Image || item.image;
                      const imageSrc = getSubCatImageUrl(bannerVal, subCatTitle);
                      const localFallback = getLocalFallbackSubCatImageUrl(bannerVal, subCatTitle);
                      const eventCount = item.eventCount ?? (item.events ? item.events.length : 0);
                      const subCoord = item.coordinator || (item.coordinators && item.coordinators[0]);

                      return (
                        <div
                          key={item._id || idx}
                          className="subcat-card"
                          onClick={() => onSelectSubCategory(cat.code || cat.name || cat._id, subCatTitle)}
                        >
                          <img
                            src={imageSrc}
                            alt={subCatTitle}
                            className="subcat-image"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = localFallback;
                            }}
                          />

                          {/* Category Badge (Top Right) */}
                          <div className="subcat-badge">
                            <SplitColorText
                              as="span"
                              mode="fallback"
                              screenSync={true}
                              leftColor="#0f172a"
                              rightColor="#ffffff"
                              className="subcat-badge-split"
                            >
                              {cat.name || cat.code || cat._id}
                            </SplitColorText>
                          </div>

                          {/* Default Bottom Content (Title & Coordinator - Fades on Hover) */}
                          <div className="subcat-overlay">
                            <div className="subcat-title">{subCatTitle}</div>
                            {subCoord && subCoord.name && (
                              <div className="subcat-coordinator-snippet">
                                <User size={13} strokeWidth={2.4} className="subcat-coord-icon" />
                                <span>{formatTitleCase(subCoord.name)}</span>
                              </div>
                            )}
                          </div>

                          {/* Hover Blur Overlay (Shows ONLY Centered Checkout) */}
                          <div className="subcat-hover-overlay">
                            <ThemeButton
                              as="button"
                              type="button"
                              borderRadius={9999}
                              border="1px solid rgba(255, 255, 255, 0.35)"
                              className="btn-checkout-subcat"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectSubCategory(cat.code || cat.name || cat._id, subCatTitle);
                              }}
                            >
                              <SplitColorText>CHECKOUT</SplitColorText>
                            </ThemeButton>
                          </div>
                        </div>
                      );
                    })}
                  </CardScrollAnimation>
                )}

                {/* Direct Events Grid (When Category has Direct Events and no Subcategories) */}
                {(!cat.data || cat.data.length === 0) && Array.isArray(cat.events) && cat.events.length > 0 && (
                  <CardScrollAnimation className="events-cards-grid">
                    {cat.events.map((ev, idx) => {
                      const eventImg = getEventImageUrl(ev.eventImage || ev.banner?.url, ev.title || ev.eventName);

                      return (
                        <div key={ev._id || idx} className="event-sub-card">
                          {/* Top Full-Width Image Banner with Small Right-Aligned Title Badge */}
                          <div className="event-sub-image-banner">
                            <img
                              src={eventImg}
                              alt={ev.title || ev.eventName}
                              className="event-sub-banner-img"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/hero_bg.png';
                              }}
                            />
                            <div className="event-sub-img-badge">
                              <SplitColorText
                                as="span"
                                screenSync={true}
                                leftColor="#0f172a"
                                rightColor="#ffffff"
                              >
                                {formatTitleCase(ev.title || ev.eventName)}
                              </SplitColorText>
                            </div>
                          </div>

                          {/* Details / Rows below the image */}
                          <div className="event-sub-details">
                            <div className="event-table-row">
                              <div className="table-pill-label">
                                <SplitColorText
                                  as="span"
                                  screenSync={true}
                                  leftColor="#475569"
                                  rightColor="#cbd5e1"
                                >
                                  Category :
                                </SplitColorText>
                              </div>
                              <div className="table-pill-value">
                                <SplitColorText
                                  as="span"
                                  screenSync={true}
                                  leftColor="#0f172a"
                                  rightColor="#ffffff"
                                >
                                  {formatTitleCase(cat.name)}
                                </SplitColorText>
                              </div>
                            </div>
                            <div className="event-table-row">
                              <div className="table-pill-label">
                                <SplitColorText
                                  as="span"
                                  screenSync={true}
                                  leftColor="#0f172a"
                                  rightColor="#ffffff"
                                >
                                  Participation :
                                </SplitColorText>
                              </div>
                              <div className="table-pill-value">
                                <SplitColorText
                                  as="span"
                                  screenSync={true}
                                  leftColor="#0f172a"
                                  rightColor="#ffffff"
                                >
                                  {formatTitleCase(ev.eventType || 'Solo')}
                                </SplitColorText>
                              </div>
                            </div>
                            <div className="event-table-row">
                              <div className="table-pill-label">
                                <SplitColorText
                                  as="span"
                                  screenSync={true}
                                  leftColor="#0f172a"
                                  rightColor="#ffffff"
                                >
                                  Registration Fee :
                                </SplitColorText>
                              </div>
                              <div className="table-pill-value fee-highlight">
                                <SplitColorText
                                  as="span"
                                  screenSync={true}
                                  leftColor="#0f172a"
                                  rightColor="#ffffff"
                                >
                                  {ev.price ? `₹ ${ev.price}/-` : 'Free Entry'}
                                </SplitColorText>
                              </div>
                            </div>
                            <div className="event-table-row">
                              <div className="table-pill-label">
                                <SplitColorText
                                  as="span"
                                  screenSync={true}
                                  leftColor="#0f172a"
                                  rightColor="#ffffff"
                                >
                                  Venue :
                                </SplitColorText>
                              </div>
                              <div className="table-pill-value" style={{ fontSize: '0.82rem', whiteSpace: 'normal' }}>
                                <SplitColorText
                                  as="span"
                                  screenSync={true}
                                  leftColor="#0f172a"
                                  rightColor="#ffffff"
                                >
                                  {formatTitleCase(ev.venue || 'Aditya University Campus')}
                                </SplitColorText>
                              </div>
                            </div>
                          </div>

                          <div className="event-sub-footer">
                            <ThemeButton
                              as="button"
                              type="button"
                              borderRadius={9999}
                              className="btn-event-checkout-theme"
                              onClick={() =>
                                onSelectEvent(
                                  cat.code || cat.name || cat._id,
                                  ev.subcategoryName || ev.subCategory || 'General',
                                  ev.slug || ev.title || ev.eventName
                                )
                              }
                            >
                              <SplitColorText
                                as="span"
                                screenSync={true}
                                leftColor="#0f172a"
                                rightColor="#ffffff"
                              >
                                Check Out Details →
                              </SplitColorText>
                            </ThemeButton>
                          </div>
                        </div>
                      );
                    })}
                  </CardScrollAnimation>
                )}
              </section>
            );
          })
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODE B: DIRECT ALL EVENTS GRID (Instant View of every Event)
            ───────────────────────────────────────────────────────────── */}
        {!loading && !error && viewMode === 'events' && (
          filteredCategories.map((cat) => {
            const events = cat.events || [];
            if (events.length === 0) return null;

            return (
              <section key={cat._id || cat.code} className="category-section">
                <div className="category-header-row">
                  <div className="category-title-area">
                    <SplitColorText
                      as="h2"
                      className="category-heading"
                      screenSync={true}
                      leftColor="#0f172a"
                      rightColor="#ffffff"
                    >
                      {cat.name} Competitions
                    </SplitColorText>
                    <span className="category-count-badge badge-accent">
                      {events.length} {events.length === 1 ? 'Event' : 'Events'}
                    </span>
                  </div>
                </div>

                <CardScrollAnimation className="events-cards-grid">
                  {events.map((ev, idx) => {
                    const eventImg = getEventImageUrl(ev.eventImage || ev.banner?.url, ev.title || ev.eventName);

                    return (
                      <div key={ev._id || idx} className="event-sub-card">
                        {/* Top Full-Width Image Banner with Small Right-Aligned Title Badge */}
                        <div className="event-sub-image-banner">
                          <img
                            src={eventImg}
                            alt={ev.title || ev.eventName}
                            className="event-sub-banner-img"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/hero_bg.png';
                            }}
                          />
                          <div className="event-sub-img-badge">
                            <SplitColorText
                              as="span"
                              screenSync={true}
                              leftColor="#0f172a"
                              rightColor="#ffffff"
                            >
                              {formatTitleCase(ev.title || ev.eventName)}
                            </SplitColorText>
                          </div>
                        </div>

                        {/* Details / Rows below the image */}
                        <div className="event-sub-details">
                          <div className="event-table-row">
                            <div className="table-pill-label">
                              <SplitColorText
                                as="span"
                                screenSync={true}
                                leftColor="#475569"
                                rightColor="#cbd5e1"
                              >
                                Main Event :
                              </SplitColorText>
                            </div>
                            <div className="table-pill-value">
                              <SplitColorText
                                as="span"
                                screenSync={true}
                                leftColor="#0f172a"
                                rightColor="#ffffff"
                              >
                                {formatTitleCase(ev.subcategoryName || ev.subCategory || cat.name)}
                              </SplitColorText>
                            </div>
                          </div>
                          <div className="event-table-row">
                            <div className="table-pill-label">
                              <SplitColorText
                                as="span"
                                screenSync={true}
                                leftColor="#0f172a"
                                rightColor="#ffffff"
                              >
                                Participation :
                              </SplitColorText>
                            </div>
                            <div className="table-pill-value">
                              <SplitColorText
                                as="span"
                                screenSync={true}
                                leftColor="#0f172a"
                                rightColor="#ffffff"
                              >
                                {formatTitleCase(ev.eventType || 'Solo')}
                              </SplitColorText>
                            </div>
                          </div>
                          <div className="event-table-row">
                            <div className="table-pill-label">
                              <SplitColorText
                                as="span"
                                screenSync={true}
                                leftColor="#0f172a"
                                rightColor="#ffffff"
                              >
                                Registration Fee :
                              </SplitColorText>
                            </div>
                            <div className="table-pill-value fee-highlight">
                              <SplitColorText
                                as="span"
                                screenSync={true}
                                leftColor="#0f172a"
                                rightColor="#ffffff"
                              >
                                {ev.price ? `₹ ${ev.price}/-` : 'Free Entry'}
                              </SplitColorText>
                            </div>
                          </div>
                          <div className="event-table-row">
                            <div className="table-pill-label">
                              <SplitColorText
                                as="span"
                                screenSync={true}
                                leftColor="#0f172a"
                                rightColor="#ffffff"
                              >
                                Venue :
                              </SplitColorText>
                            </div>
                            <div className="table-pill-value" style={{ fontSize: '0.82rem', whiteSpace: 'normal' }}>
                              <SplitColorText
                                as="span"
                                screenSync={true}
                                leftColor="#0f172a"
                                rightColor="#ffffff"
                              >
                                {formatTitleCase(ev.venue || 'Aditya University Campus')}
                              </SplitColorText>
                            </div>
                          </div>
                        </div>

                        <div className="event-sub-footer">
                          <ThemeButton
                            as="button"
                            type="button"
                            borderRadius={9999}
                            className="btn-event-checkout-theme"
                            onClick={() =>
                              onSelectEvent(
                                cat.code || cat.name || cat._id,
                                ev.subcategoryName || ev.subCategory || 'General',
                                ev.slug || ev.title || ev.eventName
                              )
                            }
                          >
                            <SplitColorText
                              as="span"
                              screenSync={true}
                              leftColor="#0f172a"
                              rightColor="#ffffff"
                            >
                              Check Out Details →
                            </SplitColorText>
                          </ThemeButton>
                        </div>
                      </div>
                    );
                  })}
                </CardScrollAnimation>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT: Faculty Coordinator Photo with Dynamic Multi-Campus Fallback
// ─────────────────────────────────────────────────────────────
function FacultyCoordinatorPhoto({
  coordinator,
  index = 0,
  className = 'coordinator-photo',
  alt = '',
  style = {}
}) {
  const profileId = coordinator?.institutionId || coordinator?.empId || coordinator?.cordinatorImage;
  const candidateUrls = useMemo(() => {
    return getFacultyCandidateUrls(coordinator || profileId);
  }, [coordinator, profileId]);

  const [attemptIndex, setAttemptIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  useEffect(() => {
    setAttemptIndex(0);
    setAllFailed(false);
  }, [profileId]);

  const handleError = () => {
    if (!allFailed && attemptIndex + 1 < candidateUrls.length) {
      setAttemptIndex((prev) => prev + 1);
    } else {
      setAllFailed(true);
    }
  };

  const fallbackPerson = `/img/person/${(index % 8) + 1}.jpg`;
  const currentSrc = !allFailed && candidateUrls.length > 0
    ? candidateUrls[attemptIndex]
    : fallbackPerson;

  return (
    <img
      src={currentSrc}
      alt={alt || coordinator?.cordinatorName || coordinator?.name || 'Faculty Coordinator'}
      className={className}
      style={style}
      onError={handleError}
      loading="lazy"
    />
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 2: Subcategory Events View
// ─────────────────────────────────────────────────────────────
function SubCategoryEventsView({ category, subCategory, themeCode, onBack, onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [subCatDetails, setSubCatDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchEventsInSubCategory(category, subCategory, null, themeCode),
      fetchCategoriesWithSubCategories(themeCode).catch(() => [])
    ])
      .then(([eventsList, categoriesList]) => {
        if (!isMounted) return;

        setEvents(Array.isArray(eventsList) ? eventsList : []);

        // Locate current subcategory object for banner & coordinator info
        if (Array.isArray(categoriesList)) {
          const normCat = (category || '').toLowerCase();
          const normSub = (subCategory || '').toLowerCase();
          const matchedCat = categoriesList.find(
            (c) =>
              c.code?.toLowerCase() === normCat ||
              c.name?.toLowerCase() === normCat ||
              c._id?.toLowerCase() === normCat
          );

          if (matchedCat) {
            const matchedSub = (matchedCat.data || []).find(
              (s) => (s.name || s.SubCatogory || '').toLowerCase() === normSub
            );
            if (matchedSub) {
              setSubCatDetails({
                ...matchedSub,
                categoryName: matchedCat.name,
                categoryCoordinator: matchedCat.coordinator
              });
            }
          }
        }

        setLoading(false);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load subcategory events');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [category, subCategory, themeCode]);

  const coordinator = subCatDetails?.coordinator || (subCatDetails?.coordinators && subCatDetails?.coordinators[0]) || subCatDetails?.categoryCoordinator;

  return (
    <div className="events-page-wrapper">
      <div className="subcat-view-wrapper">
        <div className="categories-container">
          {/* Subcategory Hero Information Card with Liquid Glass Design & Split Color Text */}
          <div className="subcat-hero-card">
            {/* Fest Blast Artwork in Right Corner */}
            <img
              src="/blast.png"
              alt=""
              aria-hidden="true"
              className="subcat-hero-blast-corner"
            />

            <div className="subcat-hero-content">
              {/* Back Button & Category Badge Top Row */}
              <div className="subcat-hero-top-row">
                <button
                  type="button"
                  onClick={onBack}
                  className="subcat-circle-back-btn"
                  title="Back to All Categories"
                  aria-label="Back to All Categories"
                >
                  <SplitColorText
                    as="span"
                    mode="fallback"
                    screenSync={true}
                    leftColor="#0f172a"
                    rightColor="#ffffff"
                    className="subcat-circle-back-split"
                  >
                    <ArrowLeft size={15} strokeWidth={2.4} />
                  </SplitColorText>
                </button>

                <span className="subcat-hero-badge">
                  <SplitColorText
                    as="span"
                    mode="fallback"
                    screenSync={true}
                    leftColor="#0f172a"
                    rightColor="#ffffff"
                  >
                    {category}
                  </SplitColorText>
                </span>
              </div>

              <SplitColorText
                as="h2"
                className="subcat-hero-title"
                screenSync={true}
                leftColor="#0f172a"
                rightColor="#ffffff"
              >
                {subCategory}
              </SplitColorText>

              <SplitColorText
                as="p"
                className="subcat-hero-desc"
                screenSync={true}
                leftColor="#0f172a"
                rightColor="#ffffff"
              >
                Official competitive championships under {subCategory}. Browse individual event rules, team
                regulations, entry fees, and coordinator details below.
              </SplitColorText>
            </div>

            {/* Coordinator Card snippet if available */}
            {coordinator && coordinator.name && (
              <div className="subcat-coord-card" key={`subcat-coord-${coordinator.name}`}>
                <SplitColorText
                  as="div"
                  className="coord-card-header"
                  screenSync={true}
                  leftColor="#0f172a"
                  rightColor="#ffffff"
                >
                  Faculty In-charge
                </SplitColorText>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {(coordinator.institutionId || coordinator.empId) && (
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.4)', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                      <FacultyCoordinatorPhoto
                        coordinator={coordinator}
                        index={0}
                        alt={coordinator.name}
                        className="subcat-coord-photo"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="coord-card-body" style={{ flex: 1 }}>
                    <SplitColorText
                      as="div"
                      screenSync={true}
                      leftColor="#0f172a"
                      rightColor="#ffffff"
                      className="coord-card-name"
                      key={`subcat-coord-name-${coordinator.name}`}
                    >
                      {formatTitleCase(coordinator.name)}
                    </SplitColorText>

                    <SplitColorText
                      as="div"
                      screenSync={true}
                      leftColor="#0f172a"
                      rightColor="#ffffff"
                      className="coord-card-designation"
                      key={`subcat-coord-desig-${coordinator.name}`}
                    >
                      {formatTitleCase(coordinator.designation || 'Coordinator')}
                    </SplitColorText>

                    {coordinator.phone && (
                      <a href={`tel:${coordinator.phone}`} className="coord-card-contact">
                        <SplitColorText
                          as="span"
                          mode="fallback"
                          screenSync={true}
                          leftColor="#0f172a"
                          rightColor="#ffffff"
                          className="coord-contact-icon-wrap"
                        >
                          <Phone size={13} strokeWidth={2.3} className="coord-contact-icon" />
                        </SplitColorText>
                        <SplitColorText
                          as="span"
                          screenSync={true}
                          leftColor="#0f172a"
                          rightColor="#ffffff"
                          className="coord-contact-text"
                          key={`subcat-coord-phone-${coordinator.phone}`}
                        >
                          {coordinator.phone}
                        </SplitColorText>
                      </a>
                    )}
                    {coordinator.email && (
                      <a href={`mailto:${coordinator.email}`} className="coord-card-contact">
                        <SplitColorText
                          as="span"
                          mode="fallback"
                          screenSync={true}
                          leftColor="#0f172a"
                          rightColor="#ffffff"
                          className="coord-contact-icon-wrap"
                        >
                          <Mail size={13} strokeWidth={2.3} className="coord-contact-icon" />
                        </SplitColorText>
                        <SplitColorText
                          as="span"
                          screenSync={true}
                          leftColor="#0f172a"
                          rightColor="#ffffff"
                          className="coord-contact-text"
                          key={`subcat-coord-email-${coordinator.email}`}
                        >
                          {coordinator.email}
                        </SplitColorText>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {loading && (
            <div className="events-loading">
              <div className="events-spinner" />
              <p>Loading events for {subCategory}...</p>
            </div>
          )}

          {error && (
            <div className="events-error events-empty-state">
              <div className="events-empty-icon-wrap">
                <span className="events-empty-emoji">⚠️</span>
              </div>
              <SplitColorText
                as="h3"
                className="events-empty-title"
                screenSync={true}
                leftColor="#0f172a"
                rightColor="#ffffff"
              >
                Unable to load events for {subCategory}
              </SplitColorText>
              <SplitColorText
                as="p"
                className="events-empty-desc"
                screenSync={true}
                leftColor="#475569"
                rightColor="#cbd5e1"
              >
                {error}
              </SplitColorText>
              <ThemeButton
                as="button"
                type="button"
                borderRadius={9999}
                className="btn-event-checkout-theme btn-events-empty-action"
                onClick={onBack}
              >
                <SplitColorText
                  as="span"
                  screenSync={true}
                  leftColor="#0f172a"
                  rightColor="#ffffff"
                >
                  ← Back to All Categories
                </SplitColorText>
              </ThemeButton>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="events-empty-state">
              <div className="events-empty-icon-wrap">
                <span className="events-empty-emoji">🎯</span>
              </div>
              <SplitColorText
                as="h3"
                className="events-empty-title"
                screenSync={true}
                leftColor="#0f172a"
                rightColor="#ffffff"
              >
                No events registered yet for {subCategory}
              </SplitColorText>
              <SplitColorText
                as="p"
                className="events-empty-desc"
                screenSync={true}
                leftColor="#475569"
                rightColor="#cbd5e1"
              >
                New competitions are actively being scheduled for this subcategory.
              </SplitColorText>
              <ThemeButton
                as="button"
                type="button"
                borderRadius={9999}
                className="btn-event-checkout-theme btn-events-empty-action"
                onClick={onBack}
              >
                <SplitColorText
                  as="span"
                  screenSync={true}
                  leftColor="#0f172a"
                  rightColor="#ffffff"
                >
                  ← Back to All Categories
                </SplitColorText>
              </ThemeButton>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <CardScrollAnimation className="events-cards-grid">
              {events.map((ev, idx) => {
                const eventImg = getEventImageUrl(ev.eventImage || ev.banner?.url, ev.eventName || ev.title);

                return (
                  <div key={ev._id || idx} className="event-sub-card">
                    {/* Top Full-Width Image Banner with Small Right-Aligned Title Badge */}
                    <div className="event-sub-image-banner">
                      <img
                        src={eventImg}
                        alt={ev.eventName || ev.title}
                        className="event-sub-banner-img"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/hero_bg.png';
                        }}
                      />
                      <div className="event-sub-img-badge">
                        <SplitColorText
                          as="span"
                          screenSync={true}
                          leftColor="#0f172a"
                          rightColor="#ffffff"
                        >
                          {formatTitleCase(ev.eventName || ev.title)}
                        </SplitColorText>
                      </div>
                    </div>

                    {/* Details / Rows below the image */}
                    <div className="event-sub-details">
                      <div className="event-table-row">
                        <div className="table-pill-label">
                          <SplitColorText
                            as="span"
                            screenSync={true}
                            leftColor="#0f172a"
                            rightColor="#ffffff"
                          >
                            Participation :
                          </SplitColorText>
                        </div>
                        <div className="table-pill-value">
                          <SplitColorText
                            as="span"
                            screenSync={true}
                            leftColor="#0f172a"
                            rightColor="#ffffff"
                          >
                            {formatTitleCase(ev.eventType || 'Solo')}
                          </SplitColorText>
                        </div>
                      </div>
                      <div className="event-table-row">
                        <div className="table-pill-label">
                          <SplitColorText
                            as="span"
                            screenSync={true}
                            leftColor="#0f172a"
                            rightColor="#ffffff"
                          >
                            Registration Fee :
                          </SplitColorText>
                        </div>
                        <div className="table-pill-value fee-highlight">
                          <SplitColorText
                            as="span"
                            screenSync={true}
                            leftColor="#0f172a"
                            rightColor="#ffffff"
                          >
                            {ev.price ? `₹ ${ev.price}/-` : 'Free Entry'}
                          </SplitColorText>
                        </div>
                      </div>
                      <div className="event-table-row">
                        <div className="table-pill-label">
                          <SplitColorText
                            as="span"
                            screenSync={true}
                            leftColor="#0f172a"
                            rightColor="#ffffff"
                          >
                            Venue :
                          </SplitColorText>
                        </div>
                        <div className="table-pill-value" style={{ fontSize: '0.82rem', whiteSpace: 'normal' }}>
                          <SplitColorText
                            as="span"
                            screenSync={true}
                            leftColor="#0f172a"
                            rightColor="#ffffff"
                          >
                            {formatTitleCase(ev.venue || 'Aditya University Campus')}
                          </SplitColorText>
                        </div>
                      </div>
                      <div className="event-table-row">
                        <div className="table-pill-label">
                          <SplitColorText
                            as="span"
                            screenSync={true}
                            leftColor="#0f172a"
                            rightColor="#ffffff"
                          >
                            Mode / Rounds :
                          </SplitColorText>
                        </div>
                        <div className="table-pill-value">
                          <SplitColorText
                            as="span"
                            screenSync={true}
                            leftColor="#0f172a"
                            rightColor="#ffffff"
                          >
                            {formatTitleCase(ev.mode || 'Offline')} • {ev.rounds || 1} {ev.rounds === 1 ? 'Round' : 'Rounds'}
                          </SplitColorText>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Checkout Button with ThemeButton */}
                    <div className="event-sub-footer">
                      <ThemeButton
                        as="button"
                        type="button"
                        borderRadius={9999}
                        className="btn-event-checkout-theme"
                        onClick={() => onSelectEvent(ev.slug || ev.eventName || ev.title)}
                      >
                        <SplitColorText
                          as="span"
                          screenSync={true}
                          leftColor="#0f172a"
                          rightColor="#ffffff"
                        >
                          Check Out Details →
                        </SplitColorText>
                      </ThemeButton>
                    </div>
                  </div>
                );
              })}
            </CardScrollAnimation>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT: Coordinators 6*6 Split Grid (Faculty Left / Student Right)
// ─────────────────────────────────────────────────────────────
function CoordinatorsHierarchyFlow({ faculty = [], students = [], title = '' }) {
  if (faculty.length === 0 && students.length === 0) {
    return null;
  }

  const hasBoth = faculty.length > 0 && students.length > 0;

  return (
    <div className="coordinators-hierarchy-container">
      {/* Center-aligned Dynamic Section Heading with SplitColorText */}
      {title && (
        <div className="coordinators-flow-heading-wrap">
          <SplitColorText
            as="h2"
            className="coordinators-flow-title"
            screenSync={true}
            leftColor="#0f172a"
            rightColor="#ffffff"
          >
            {title}
          </SplitColorText>
        </div>
      )}

      {/* 6*6 Split Grid: Faculty Coordinators (Left 6-col) & Student Coordinators (Right 6-col) */}
      <div className={`coordinators-6x6-grid ${!hasBoth ? 'single-column-flow' : ''}`}>
        {/* Left Column (6-cols / 50% split): Faculty Coordinator */}
        {faculty.length > 0 && (
          <div className="coordinators-column coordinators-column-faculty">
            <div className="coordinators-column-header">
              <SplitColorText
                as="h3"
                className="coordinators-column-title"
                screenSync={true}
                leftColor="#0f172a"
                rightColor="#ffffff"
              >
                {faculty.length > 1 ? 'Faculty Coordinators' : 'Faculty Coordinator'}
              </SplitColorText>
            </div>

            <div className="coordinators-grid coordinators-grid-faculty">
              {faculty.map((fc, idx) => (
                <LiquidGlass
                  key={`faculty-${idx}`}
                  className="coordinator-card team-glass-card"
                  borderRadius={20}
                  enableShader={true}
                >
                  <div className="team-card-inner">
                    {/* Avatar Frame with Rotating VIBGYOR Rainbow Border */}
                    <div className="team-avatar-frame">
                      <FacultyCoordinatorPhoto
                        coordinator={fc}
                        index={idx}
                        alt={fc.cordinatorName}
                        className="team-avatar-img"
                      />
                    </div>

                    {/* Name */}
                    <SplitColorText
                      as="h3"
                      className="team-member-name coordinator-name"
                      screenSync={true}
                      leftColor="#0f172a"
                      rightColor="#ffffff"
                    >
                      {formatTitleCase(fc.cordinatorName)}
                    </SplitColorText>

                    {/* Designation */}
                    <SplitColorText
                      as="span"
                      className="team-member-designation coordinator-dept"
                      screenSync={true}
                      leftColor="#be9337"
                      rightColor="#be9337"
                    >
                      {formatTitleCase(fc.cordinatorDesignation || fc.departmentName || fc.cordinatorCollege || 'Coordinator')}
                    </SplitColorText>

                    {/* Department / Institution */}
                    <SplitColorText
                      as="p"
                      className="team-member-dept coordinator-institution"
                      screenSync={true}
                      leftColor="#0f172a"
                      rightColor="#ffffff"
                    >
                      {fc.cordinatorCollege || 'Aditya University'}
                    </SplitColorText>

                    {/* Contacts List */}
                    {(fc.cordinatorPhone || fc.cordinatorEmail) && (
                      <div className="coordinator-contacts-list">
                        {fc.cordinatorPhone && (
                          <a href={`tel:${fc.cordinatorPhone}`} className="coordinator-contact-item">
                            <Phone size={13} strokeWidth={2.4} className="coordinator-lucide-icon" />
                            <SplitColorText as="span" screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                              {fc.cordinatorPhone}
                            </SplitColorText>
                          </a>
                        )}
                        {fc.cordinatorEmail && (
                          <a href={`mailto:${fc.cordinatorEmail}`} className="coordinator-contact-item">
                            <Mail size={13} strokeWidth={2.4} className="coordinator-lucide-icon" />
                            <SplitColorText as="span" screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                              {fc.cordinatorEmail}
                            </SplitColorText>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </LiquidGlass>
              ))}
            </div>
          </div>
        )}

        {/* Right Column (6-cols / 50% split): Student Coordinator */}
        {students.length > 0 && (
          <div className="coordinators-column coordinators-column-student">
            <div className="coordinators-column-header">
              <SplitColorText
                as="h3"
                className="coordinators-column-title"
                screenSync={true}
                leftColor="#0f172a"
                rightColor="#ffffff"
              >
                {students.length > 1 ? 'Student Coordinators' : 'Student Coordinator'}
              </SplitColorText>
            </div>

            <div className="coordinators-grid coordinators-grid-student">
              {students.map((sc, idx) => {
                const photoUrl = sc.studentCordinatorId
                  ? `https://info.aec.edu.in/adityacentral/studentphotos/${sc.studentCordinatorId.toString().trim().toUpperCase()}.jpg`
                  : `/img/person/${(idx % 8) + 2}.jpg`;

                return (
                  <LiquidGlass
                    key={`student-${idx}`}
                    className="coordinator-card team-glass-card"
                    borderRadius={20}
                    enableShader={true}
                  >
                    <div className="team-card-inner">
                      {/* Avatar Frame with Rotating VIBGYOR Rainbow Border */}
                      <div className="team-avatar-frame">
                        <img
                          src={photoUrl}
                          alt={sc.studentCordinatorName}
                          className="team-avatar-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `/img/person/${(idx % 8) + 2}.jpg`;
                          }}
                        />
                      </div>

                      {/* Name */}
                      <SplitColorText
                        as="h3"
                        className="team-member-name coordinator-name"
                        screenSync={true}
                        leftColor="#0f172a"
                        rightColor="#ffffff"
                      >
                        {formatTitleCase(sc.studentCordinatorName)}
                      </SplitColorText>

                      {/* Designation */}
                      <SplitColorText
                        as="span"
                        className="team-member-designation coordinator-dept"
                        screenSync={true}
                        leftColor="#be9337"
                        rightColor="#be9337"
                      >
                        {formatTitleCase(sc.studentCordinatorCollege || sc.departmentName || 'Student Coordinator')}
                      </SplitColorText>

                      {/* Department / Institution */}
                      <SplitColorText
                        as="p"
                        className="team-member-dept coordinator-institution"
                        screenSync={true}
                        leftColor="#0f172a"
                        rightColor="#ffffff"
                      >
                        {sc.cordinatorCollege || 'Aditya University'}
                      </SplitColorText>

                      {/* Contacts List */}
                      {(sc.studentCordinatorPhone || sc.studentCordinatorEmail) && (
                        <div className="coordinator-contacts-list">
                          {sc.studentCordinatorPhone && (
                            <a href={`tel:${sc.studentCordinatorPhone}`} className="coordinator-contact-item">
                              <Phone size={13} strokeWidth={2.4} className="coordinator-lucide-icon" />
                              <SplitColorText as="span" screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                                {sc.studentCordinatorPhone}
                              </SplitColorText>
                            </a>
                          )}
                          {sc.studentCordinatorEmail && (
                            <a href={`mailto:${sc.studentCordinatorEmail}`} className="coordinator-contact-item">
                              <Mail size={13} strokeWidth={2.4} className="coordinator-lucide-icon" />
                              <SplitColorText as="span" screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                                {sc.studentCordinatorEmail}
                              </SplitColorText>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </LiquidGlass>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 3: Event Detail View
// ─────────────────────────────────────────────────────────────
function EventDetailView({ category, subCategory, eventName, themeCode, onBack, onNavigateHome }) {
  const [eventData, setEventData] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Student Authentication & Event Registration Modal States
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(getLoggedStudent());

  useEffect(() => {
    const handleAuthSync = () => {
      setCurrentStudent(getLoggedStudent());
    };
    window.addEventListener('fest-student-auth-change', handleAuthSync);
    return () => window.removeEventListener('fest-student-auth-change', handleAuthSync);
  }, []);

  const handleRegisterButtonClick = () => {
    const student = getLoggedStudent();
    if (!student) {
      // Student is NOT logged in: ask to register or sign in
      setAuthModalOpen(true);
    } else {
      // Student is ALREADY logged in: open registration modal for this particular event!
      setCurrentStudent(student);
      setRegModalOpen(true);
    }
  };

  const handleAuthSuccess = (student, regRecord) => {
    setCurrentStudent(student);
    if (regRecord) {
      // Registration already created and saved into central_event_student_registrations
      return;
    }
    setAuthModalOpen(false);
    // Proceed to event registration for team member addition if needed
    setRegModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchEventDetails(category, subCategory, eventName, themeCode),
      fetchFacultyCoordinators(category, subCategory, eventName, themeCode),
      fetchStudentCoordinators(category, subCategory, eventName)
    ])
      .then(([details, facultyList, studentsList]) => {
        if (!isMounted) return;

        setEventData(details);
        setFaculty(Array.isArray(facultyList) ? facultyList : []);
        setStudents(Array.isArray(studentsList) ? studentsList : []);
        setLoading(false);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load event details');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [category, subCategory, eventName, themeCode]);

  const bannerImg = eventData
    ? getEventImageUrl(eventData.eventImage || eventData.banner?.url, eventData.eventName || eventData.title)
    : '/hero_bg.png';

  const rawOverview = eventData?.overview || eventData?.description || 'Official competitive event at Aditya University.';
  const cleanOverview = typeof rawOverview === 'string' ? rawOverview.replace(/<[^>]*>/g, '').trim() : rawOverview;

  return (
    <div className="events-page-wrapper">
      <div className="event-detail-wrapper">
        <div className="categories-container" style={{ position: 'relative', zIndex: 2 }}>
          {loading && (
            <div className="events-loading">
              <div className="events-spinner" />
              <p>Loading event information...</p>
            </div>
          )}

          {error && (
            <div className="events-error">
              <h3>Unable to load event details</h3>
              <p>{error}</p>
              <button onClick={onBack} className="btn-checkout-primary" style={{ marginTop: '1rem' }}>
                Back to {subCategory}
              </button>
            </div>
          )}

          {!loading && !error && eventData && (
            <>
              {/* Event Main Banner Hero - Liquid Glass & SplitColorText */}
              <div className="detail-hero-banner">
                {/* Back Button & Event Badges Row - Positioned ABOVE the image */}
                <div className="detail-hero-top-row">
                  <button
                    type="button"
                    onClick={onBack}
                    className="subcat-circle-back-btn"
                    title={`Back to ${subCategory}`}
                    aria-label={`Back to ${subCategory}`}
                  >
                    <SplitColorText
                      as="span"
                      mode="fallback"
                      screenSync={true}
                      leftColor="#0f172a"
                      rightColor="#ffffff"
                      className="subcat-circle-back-split"
                    >
                      <ArrowLeft size={16} strokeWidth={2.6} />
                    </SplitColorText>
                  </button>
                  <span className="detail-tag-badge">
                    <SplitColorText as="span" screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                      {category}
                    </SplitColorText>
                  </span>
                  <span className="detail-tag-badge badge-sub">
                    <SplitColorText as="span" screenSync={true} leftColor="#be9337" rightColor="#fbbf24">
                      {subCategory}
                    </SplitColorText>
                  </span>
                  <span className="detail-tag-badge badge-mode">
                    <SplitColorText as="span" screenSync={true} leftColor="#059669" rightColor="#34d399">
                      {eventData.mode || 'OFFLINE'}
                    </SplitColorText>
                  </span>
                </div>

                <div className="detail-hero-main-grid">
                  <div className="detail-hero-img-col">
                    <img
                      src={bannerImg}
                      alt={eventData.eventName || eventData.title}
                      className="detail-hero-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/hero_bg.png';
                      }}
                    />
                  </div>
                  <div className="detail-hero-info-col">
                    <SplitColorText
                      as="h1"
                      className="detail-main-title"
                      screenSync={true}
                      leftColor="#0f172a"
                      rightColor="#ffffff"
                    >
                      {eventData.eventName || eventData.title}
                    </SplitColorText>
                    <SplitColorText
                      as="p"
                      className="detail-short-desc"
                      screenSync={true}
                      leftColor="#475569"
                      rightColor="#cbd5e1"
                    >
                      {cleanOverview}
                    </SplitColorText>
                    <div className="detail-cta-row">
                      <ThemeButton
                        onClick={handleRegisterButtonClick}
                        className="btn-register-hero-theme"
                      >
                        <SplitColorText leftColor="#0f172a" rightColor="#ffffff">
                          Register
                        </SplitColorText>
                      </ThemeButton>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Event Parameters Grid */}
              <div className="detail-stats-grid">
                <div className="detail-stat-card">
                  <div className="stat-card-icon-box">
                    <Tag className="stat-card-lucide-icon" size={22} strokeWidth={2.2} />
                  </div>
                  <div className="stat-card-label">
                    <SplitColorText as="span" screenSync={true} leftColor="#be9337" rightColor="#be9337">
                      Registration Fee
                    </SplitColorText>
                  </div>
                  <div className="stat-card-value">
                    <SplitColorText as="span" screenSync={true} leftColor="#be9337" rightColor="#be9337">
                      {eventData.price ? `₹ ${eventData.price}/-` : 'Free Entry'}
                    </SplitColorText>
                  </div>
                </div>

                <div className="detail-stat-card">
                  <div className="stat-card-icon-box">
                    <Users className="stat-card-lucide-icon" size={22} strokeWidth={2.2} />
                  </div>
                  <div className="stat-card-label">
                    <SplitColorText as="span" screenSync={true} leftColor="#be9337" rightColor="#be9337">
                      Participation Type
                    </SplitColorText>
                  </div>
                  <div className="stat-card-value">
                    <SplitColorText as="span" screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                      {eventData.eventType || 'Solo'}
                    </SplitColorText>
                  </div>
                </div>

                <div className="detail-stat-card">
                  <div className="stat-card-icon-box">
                    <MapPin className="stat-card-lucide-icon" size={22} strokeWidth={2.2} />
                  </div>
                  <div className="stat-card-label">
                    <SplitColorText as="span" screenSync={true} leftColor="#be9337" rightColor="#be9337">
                      Venue
                    </SplitColorText>
                  </div>
                  <div className="stat-card-value stat-small">
                    <SplitColorText as="span" screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                      {eventData.venue}
                    </SplitColorText>
                  </div>
                </div>

                <div className="detail-stat-card">
                  <div className="stat-card-icon-box">
                    <Calendar className="stat-card-lucide-icon" size={22} strokeWidth={2.2} />
                  </div>
                  <div className="stat-card-label">
                    <SplitColorText as="span" screenSync={true} leftColor="#be9337" rightColor="#be9337">
                      Festival Schedule
                    </SplitColorText>
                  </div>
                  <div className="stat-card-value stat-small">
                    <SplitColorText as="span" screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                      {eventData.schedule?.fromDate
                        ? new Date(eventData.schedule.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'Jan 7 - 9, 2027'}
                    </SplitColorText>
                  </div>
                </div>
              </div>

              {/* Overview Section */}
              <div className="detail-section">
                <div className="detail-pill-badge">
                  <SplitColorText as="span" screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                    Overview
                  </SplitColorText>
                </div>
                <SplitColorText
                  as="p"
                  className="detail-overview-text"
                  screenSync={true}
                  leftColor="#334155"
                  rightColor="#e2e8f0"
                >
                  {cleanOverview}
                </SplitColorText>
              </div>

              {/* Event Rules Section */}
              {Array.isArray(eventData.regulations) && eventData.regulations.length > 0 && (
                <div className="detail-section">
                  <div className="detail-pill-badge">
                    <SplitColorText as="span" screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                      Rules
                    </SplitColorText>
                  </div>
                  <ul className="detail-rules-list">
                    {eventData.regulations.map((rule, idx) => (
                      <li key={idx}>
                        <img
                          src="/bullet.png"
                          alt="•"
                          className="rule-bullet-img"
                        />
                        <SplitColorText as="span" className="rule-content" screenSync={true} leftColor="#1e293b" rightColor="#ffffff">
                          {rule}
                        </SplitColorText>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Coordinators Hierarchy with Dynamic Flowchart Connector Lines */}
              {(faculty.length > 0 || students.length > 0) && (() => {
                const rawEventName = eventData?.eventName || eventData?.title || subCategory || eventName || 'Event';
                const cleanEventName = rawEventName.replace(/\s*\([^)]*\)/g, '').trim() || rawEventName;
                const coordinatorsHeading = `${formatTitleCase(cleanEventName)} Coordinators`;

                return (
                  <CoordinatorsHierarchyFlow
                    faculty={faculty}
                    students={students}
                    title={coordinatorsHeading}
                  />
                );
              })()}
            </>
          )}
        </div>
      </div>

      {/* Student Account Registration & Login Modal */}
      <StudentAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        eventTitle={eventData?.eventName || eventData?.title}
        eventData={eventData}
      />

      {/* Event Registration Modal for this particular competition */}
      {currentStudent && (
        <EventRegistrationModal
          isOpen={regModalOpen}
          eventData={eventData}
          student={currentStudent}
          onClose={() => setRegModalOpen(false)}
          onChangeStudent={() => {
            logoutStudent();
            setCurrentStudent(null);
            setRegModalOpen(false);
            setAuthModalOpen(true);
          }}
        />
      )}
    </div>
  );
}