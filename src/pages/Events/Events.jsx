import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  getFacultyImageUrl,
  getFacultyCandidateUrls,
  getLoggedStudent,
  logoutStudent
} from '../../services/api';
import StudentAuthModal from '../../components/RegistrationModals/StudentAuthModal';
import EventRegistrationModal from '../../components/RegistrationModals/EventRegistrationModal';
import './Events.css';

const FEST_TYPE = EVENT_TYPE || 'COLORS';

export default function Events() {
  const { eventCategory, eventSubCategory, eventName } = useParams();
  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────
  // RENDER BASED ON URL PARAMS:
  // 1. If eventName is set -> View 3: Event Detail
  // 2. Else if eventSubCategory is set -> View 2: Subcategory Events
  // 3. Else -> View 1: All Categories & Subcategories
  // ─────────────────────────────────────────────────────────────

  if (eventCategory && eventSubCategory && eventName) {
    return (
      <EventDetailView
        category={decodeURIComponent(eventCategory)}
        subCategory={decodeURIComponent(eventSubCategory)}
        eventName={decodeURIComponent(eventName)}
        themeCode={FEST_TYPE}
        onBack={() => navigate(`/events/${eventCategory}/${eventSubCategory}`)}
        onNavigateHome={() => navigate('/events')}
      />
    );
  }

  if (eventCategory && eventSubCategory) {
    return (
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
  }

  return (
    <AllCategoriesView
      themeCode={FEST_TYPE}
      onSelectSubCategory={(catName, subCatName) =>
        navigate(`/events/${encodeURIComponent(catName)}/${encodeURIComponent(subCatName)}`)
      }
      onSelectEvent={(catName, subCatName, nameOrSlug) =>
        navigate(`/events/${encodeURIComponent(catName)}/${encodeURIComponent(subCatName)}/${encodeURIComponent(nameOrSlug)}`)
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 1: All Categories, Subcategories & Events (COLORS)
// ─────────────────────────────────────────────────────────────
function AllCategoriesView({ themeCode, onSelectSubCategory, onSelectEvent }) {
  const [categories, setCategories] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
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

  // Filtered categories based on active category tab & search query
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (activeTab === 'ALL') return true;
        const catCode = (cat.code || cat._id || '').toUpperCase();
        const catName = (cat.name || '').toUpperCase();
        const tab = activeTab.toUpperCase();

        return (
          catCode === tab ||
          catName === tab ||
          catCode.includes(tab) ||
          tab.includes(catCode) ||
          catName.includes(tab) ||
          tab.includes(catName)
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

  // Derived category filter tabs
  const categoryTabs = useMemo(() => {
    if (!categories || categories.length === 0) {
      return [
        { id: 'SPORTS', label: 'Sports & Games' },
        { id: 'CULTURALS', label: 'Culturals Events' },
        { id: 'CREO', label: 'Creo Events' }
      ];
    }
    return categories.map((cat) => {
      const id = cat.code || cat._id;
      let label = cat.name || cat.code;
      if (id === 'CREO' && !label.toLowerCase().includes('events') && !label.toLowerCase().includes('arts')) {
        label = 'Creo Events';
      }
      return { id, label, count: cat.totalEventsCount || (cat.data || []).length };
    });
  }, [categories]);

  // Total metrics across COLORS
  const totalEventsCount = useMemo(() => {
    return allEvents.length || categories.reduce((sum, c) => sum + (c.totalEventsCount || 0), 0);
  }, [allEvents, categories]);

  const totalSubcatsCount = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.data?.length || 0), 0);
  }, [categories]);

  return (
    <div className="events-page-wrapper">
      {/* University Portal Header Banner */}
      <div className="events-hero-header">
        <div className="container text-center">
          {/* Fest Badge */}
          <div className="events-badge-top">
            ADITYA UNIVERSITY • {themeCode} 2027
          </div>

          <h1 className="events-hero-title">Official Events & Competitions</h1>

          {/* Theme Summary Metrics Bar */}


          {/* Search Bar & View Mode Toggle */}
          <div className="events-control-bar">

            <div className="events-search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search events, singing, volleyball, running, solo, cash prize..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="events-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Tabs */}
            <div className="events-tabs-group">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveTab('ALL')}
              >
                All Events ({totalEventsCount})
              </button>
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  {tab.count !== undefined && <span className="tab-count-badge">{tab.count}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="categories-container">
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
            <span style={{ fontSize: '3rem' }}>🎯</span>
            <h3>No events found matching "{searchQuery}"</h3>
            <p>Try searching for a different keyword or switch to All Categories.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveTab('ALL'); }}
              className="btn-checkout-primary"
              style={{ marginTop: '1rem' }}
            >
              Clear Search
            </button>
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
                    <h2 className="category-heading">
                      {cat.name || `${cat.code || cat._id} Events`}
                    </h2>
                    <div className="category-meta-chips">
                      <span className="category-count-badge">
                        {cat.data.length} {cat.data.length === 1 ? 'Subcategory' : 'Subcategories'}
                      </span>
                      {cat.totalEventsCount !== undefined && (
                        <span className="category-count-badge badge-accent">
                          {cat.totalEventsCount} {cat.totalEventsCount === 1 ? 'Event' : 'Events'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Category Coordinator Pill */}
                  {catCoordinator && catCoordinator.name && (
                    <div className="category-coord-pill">
                      <span className="coord-icon">👤</span>
                      <div className="coord-info-col">
                        <span className="coord-role">Major Event Co-ordinator</span>
                        <span className="coord-name">{catCoordinator.name}</span>
                        {catCoordinator.phone && (
                          <a href={`tel:${catCoordinator.phone}`} className="coord-phone-link">
                            📞 {catCoordinator.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Subcategory Grid */}
                <div className="subcat-grid">
                  {Array.isArray(cat.data) && cat.data.map((item, idx) => {
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
                        <div className="subcat-badge">{cat.name || cat.code || cat._id}</div>

                        {/* Event Count Pill (Top Left) */}
                        <div className="subcat-event-count-badge">
                          {eventCount} {eventCount === 1 ? 'Event' : 'Events'}
                        </div>

                        {/* Gradient Overlay with Title and Hover Action */}
                        <div className="subcat-overlay">
                          <div className="subcat-title">{subCatTitle}</div>
                          {subCoord && subCoord.name && (
                            <div className="subcat-coordinator-snippet">
                              👤 {subCoord.name}
                            </div>
                          )}
                          <div className="subcat-action">
                            <button
                              type="button"
                              className="btn-checkout-subcat"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectSubCategory(cat.code || cat.name || cat._id, subCatTitle);
                              }}
                            >
                              Check Out Events →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                    <h2 className="category-heading">{cat.name} Competitions</h2>
                    <span className="category-count-badge badge-accent">
                      {events.length} {events.length === 1 ? 'Event' : 'Events'}
                    </span>
                  </div>
                </div>

                <div className="events-cards-grid">
                  {events.map((ev, idx) => {
                    const eventImg = getEventImageUrl(ev.eventImage || ev.banner?.url, ev.title || ev.eventName);

                    return (
                      <div key={ev._id || idx} className="event-sub-card">
                        <div className="event-sub-title-bar">{ev.title || ev.eventName}</div>
                        <div className="event-sub-body">
                          <div className="event-sub-table-col">
                            <div className="event-table-row">
                              <div className="table-pill-label">Main Event</div>
                              <div className="table-pill-value">
                                {ev.subcategoryName || ev.subCategory || cat.name}
                              </div>
                            </div>
                            <div className="event-table-row">
                              <div className="table-pill-label">Participation</div>
                              <div className="table-pill-value">{ev.eventType || 'Solo'}</div>
                            </div>
                            <div className="event-table-row">
                              <div className="table-pill-label">Registration Fee</div>
                              <div className="table-pill-value fee-highlight">
                                {ev.price ? `₹ ${ev.price}/-` : 'Free Entry'}
                              </div>
                            </div>
                            <div className="event-table-row">
                              <div className="table-pill-label">Venue</div>
                              <div className="table-pill-value" style={{ fontSize: '0.82rem', whiteSpace: 'normal' }}>
                                {ev.venue || 'Aditya University Campus'}
                              </div>
                            </div>
                          </div>

                          <div className="event-sub-image-col">
                            <img
                              src={eventImg}
                              alt={ev.title || ev.eventName}
                              className="event-sub-img"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/hero_bg.png';
                              }}
                            />
                          </div>
                        </div>

                        <div className="event-sub-footer">
                          <button
                            className="btn-checkout-primary"
                            onClick={() =>
                              onSelectEvent(
                                cat.code || cat.name || cat._id,
                                ev.subcategoryName || ev.subCategory || 'General',
                                ev.slug || ev.title || ev.eventName
                              )
                            }
                          >
                            Check Out Details →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
          {/* Breadcrumb Navigation */}
          <div className="breadcrumb-nav">
            <button onClick={onBack} className="btn-back-breadcrumb">
              ← Back to All Categories
            </button>
            <div className="breadcrumb-info">
              <span className="breadcrumb-subtitle">Aditya University Fest • {themeCode}</span>
              <h1 className="breadcrumb-heading">
                Events / {subCatDetails?.categoryName || category} / {subCategory}
              </h1>
            </div>
          </div>

          {/* Subcategory Hero Information Card */}
          <div className="subcat-hero-card">
            <div className="subcat-hero-content">
              <span className="subcat-hero-badge">{category}</span>
              <h2 className="subcat-hero-title">{subCategory}</h2>
              <p className="subcat-hero-desc">
                Official competitive championships under {subCategory}. Browse individual event rules, team
                regulations, entry fees, and coordinator details below.
              </p>
              <div className="subcat-hero-meta">
                <span className="subcat-meta-pill">
                  🎯 {events.length} {events.length === 1 ? 'Competition' : 'Competitions'}
                </span>
                <span className="subcat-meta-pill">
                  🏆 University Certificates & Cash Rewards
                </span>
              </div>
            </div>

            {/* Coordinator Card snippet if available */}
            {coordinator && coordinator.name && (
              <div className="subcat-coord-card">
                <div className="coord-card-header">Faculty In-charge</div>
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
                    <div className="coord-card-name">{coordinator.name}</div>
                    <div className="coord-card-designation">{coordinator.designation || 'Coordinator'}</div>
                    {coordinator.phone && (
                      <a href={`tel:${coordinator.phone}`} className="coord-card-contact">
                        📞 {coordinator.phone}
                      </a>
                    )}
                    {coordinator.email && (
                      <a href={`mailto:${coordinator.email}`} className="coord-card-contact">
                        ✉️ {coordinator.email}
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
            <div className="events-error">
              <h3>Unable to load events for {subCategory}</h3>
              <p>{error}</p>
              <button onClick={onBack} className="btn-checkout-primary" style={{ marginTop: '1rem' }}>
                Back to All Categories
              </button>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="events-empty-state">
              <span style={{ fontSize: '3rem' }}>🎯</span>
              <h3>No events registered yet for {subCategory}</h3>
              <p>New competitions are actively being scheduled for this subcategory.</p>
              <button onClick={onBack} className="btn-checkout-primary" style={{ marginTop: '1rem' }}>
                Back to All Categories
              </button>
            </div>
          )}

          {!loading && !error && events.length > 0 && (
            <div className="events-cards-grid">
              {events.map((ev, idx) => {
                const eventImg = getEventImageUrl(ev.eventImage || ev.banner?.url, ev.eventName || ev.title);

                return (
                  <div key={ev._id || idx} className="event-sub-card">
                    {/* Title Bar */}
                    <div className="event-sub-title-bar">{ev.eventName || ev.title}</div>

                    {/* Body with Key-Value Pills & Image */}
                    <div className="event-sub-body">
                      <div className="event-sub-table-col">
                        <div className="event-table-row">
                          <div className="table-pill-label">Participation</div>
                          <div className="table-pill-value">{ev.eventType || 'Solo'}</div>
                        </div>
                        <div className="event-table-row">
                          <div className="table-pill-label">Registration Fee</div>
                          <div className="table-pill-value fee-highlight">
                            {ev.price ? `₹ ${ev.price}/-` : 'Free Entry'}
                          </div>
                        </div>
                        <div className="event-table-row">
                          <div className="table-pill-label">Venue</div>
                          <div className="table-pill-value" style={{ fontSize: '0.82rem', whiteSpace: 'normal' }}>
                            {ev.venue || 'Aditya University Campus'}
                          </div>
                        </div>
                        <div className="event-table-row">
                          <div className="table-pill-label">Mode / Rounds</div>
                          <div className="table-pill-value">
                            {ev.mode || 'OFFLINE'} • {ev.rounds || 1} {ev.rounds === 1 ? 'Round' : 'Rounds'}
                          </div>
                        </div>
                      </div>

                      <div className="event-sub-image-col">
                        <img
                          src={eventImg}
                          alt={ev.eventName || ev.title}
                          className="event-sub-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/hero_bg.png';
                          }}
                        />
                      </div>
                    </div>

                    {/* Bottom Checkout Button */}
                    <div className="event-sub-footer">
                      <button
                        className="btn-checkout-primary"
                        onClick={() => onSelectEvent(ev.slug || ev.eventName || ev.title)}
                      >
                        Check Out Details →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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

  return (
    <div className="events-page-wrapper">
      <div className="event-detail-wrapper">
        <div className="categories-container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Back Navigation Bar */}
          <div className="breadcrumb-nav">
            <button onClick={onBack} className="btn-back-breadcrumb">
              ← Back to {subCategory}
            </button>
            <span className="detail-breadcrumb-path">
              <span className="breadcrumb-link" onClick={onNavigateHome}>Events</span>
              {' / '}
              <span>{category}</span>
              {' / '}
              <span className="breadcrumb-link" onClick={onBack}>{subCategory}</span>
              {' / '}
              <span className="breadcrumb-current">{eventData?.eventName || eventData?.title || eventName}</span>
            </span>
          </div>

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
              {/* Event Main Banner Hero */}
              <div className="detail-hero-banner">
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
                  <div className="detail-badges-row">
                    <span className="detail-tag-badge">{category}</span>
                    <span className="detail-tag-badge badge-sub">{subCategory}</span>
                    <span className="detail-tag-badge badge-mode">{eventData.mode || 'OFFLINE'}</span>
                  </div>
                  <h1 className="detail-main-title">{eventData.eventName || eventData.title}</h1>
                  <p className="detail-short-desc">
                    {eventData.overview || eventData.description || 'Official competitive event at Aditya University.'}
                  </p>
                  <div className="detail-cta-row">
                    <button
                      type="button"
                      className="btn-register-now-hero"
                      onClick={handleRegisterButtonClick}
                    >
                      ★ Register for this Competition
                    </button>
                    <span className="detail-fee-callout">
                      Entry Fee: <strong>{eventData.price ? `₹ ${eventData.price}/-` : 'Free'}</strong>
                    </span>
                    {currentStudent && (
                      <span className="detail-logged-student-pill" title="Logged in as student">
                        👤 {currentStudent.name} ({currentStudent.roll})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Key Event Parameters Grid */}
              <div className="detail-stats-grid">
                <div className="detail-stat-card">
                  <div className="stat-card-icon">🏷️</div>
                  <div className="stat-card-label">Registration Fee</div>
                  <div className="stat-card-value">
                    {eventData.price ? `₹ ${eventData.price}/-` : 'Free Entry'}
                  </div>
                </div>

                <div className="detail-stat-card">
                  <div className="stat-card-icon">👥</div>
                  <div className="stat-card-label">Participation Type</div>
                  <div className="stat-card-value">{eventData.eventType || 'Solo'}</div>
                </div>

                <div className="detail-stat-card">
                  <div className="stat-card-icon">📍</div>
                  <div className="stat-card-label">Venue Location</div>
                  <div className="stat-card-value stat-small">{eventData.venue}</div>
                </div>

                <div className="detail-stat-card">
                  <div className="stat-card-icon">📅</div>
                  <div className="stat-card-label">Festival Schedule</div>
                  <div className="stat-card-value stat-small">
                    {eventData.schedule?.fromDate
                      ? new Date(eventData.schedule.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Jan 7 - 9, 2027'}
                  </div>
                </div>

                <div className="detail-stat-card">
                  <div className="stat-card-icon">🔄</div>
                  <div className="stat-card-label">Competition Rounds</div>
                  <div className="stat-card-value">
                    {eventData.rounds || 1} {eventData.rounds === 1 ? 'Round' : 'Rounds'}
                  </div>
                </div>

                <div className="detail-stat-card">
                  <div className="stat-card-icon">🎯</div>
                  <div className="stat-card-label">Event Capacity</div>
                  <div className="stat-card-value">{eventData.capacity || 100} Participants</div>
                </div>
              </div>

              {/* Overview Section */}
              <div className="detail-section">
                <div className="detail-pill-badge">Overview & Description</div>
                <p className="detail-overview-text">
                  {eventData.overview || eventData.description || 'Official competitive event at Aditya University fest.'}
                </p>
              </div>

              {/* Event Rules Section */}
              {Array.isArray(eventData.regulations) && eventData.regulations.length > 0 && (
                <div className="detail-section">
                  <div className="detail-pill-badge">Official Rules & Regulations</div>
                  <ul className="detail-rules-list">
                    {eventData.regulations.map((rule, idx) => (
                      <li key={idx}>
                        <span className="rule-number">{idx + 1}</span>
                        <span className="rule-content">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Venue Details Section */}
              {eventData.venueObj && (eventData.venueObj.name || eventData.venueObj.roomNo) && (
                <div className="detail-section">
                  <div className="detail-pill-badge">Venue Information</div>
                  <div className="detail-venue-box">
                    <p className="detail-venue-text">
                      🏛️ <strong>Hall/Ground:</strong> {eventData.venueObj.name || eventData.venue}
                    </p>
                    {eventData.venueObj.roomNo && (
                      <p className="detail-venue-subtext">
                        📍 <strong>Room Number:</strong> {eventData.venueObj.roomNo} • {eventData.venueObj.venueType || 'Indoor'}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Faculty Coordinators Section */}
              {faculty.length > 0 && (
                <div className="coordinators-section">
                  <h2 className="coordinators-heading">Faculty Coordinators</h2>
                  <div className="coordinators-grid">
                    {faculty.map((fc, idx) => {
                      return (
                        <div key={idx} className="coordinator-card">
                          <div className="coordinator-photo-container">
                            <FacultyCoordinatorPhoto
                              coordinator={fc}
                              index={idx}
                              alt={fc.cordinatorName}
                              className="coordinator-photo"
                            />
                          </div>
                          <div className="coordinator-name">{fc.cordinatorName}</div>
                          <div className="coordinator-dept">
                            {fc.cordinatorDesignation || fc.departmentName || fc.cordinatorCollege || 'Coordinator'}
                          </div>
                          {fc.cordinatorPhone && (
                            <a href={`tel:${fc.cordinatorPhone}`} className="coordinator-phone">
                              📞 {fc.cordinatorPhone}
                            </a>
                          )}
                          {fc.cordinatorEmail && (
                            <a href={`mailto:${fc.cordinatorEmail}`} className="coordinator-email">
                              ✉️ {fc.cordinatorEmail}
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Student Coordinators Section */}
              {students.length > 0 && (
                <div className="coordinators-section">
                  <h2 className="coordinators-heading">Student Coordinators</h2>
                  <div className="coordinators-grid">
                    {students.map((sc, idx) => {
                      const photoUrl = sc.studentCordinatorId
                        ? `https://info.aec.edu.in/adityacentral/studentphotos/${sc.studentCordinatorId.toString().trim().toUpperCase()}.jpg`
                        : `/img/person/${(idx % 8) + 2}.jpg`;

                      return (
                        <div key={idx} className="coordinator-card">
                          <div className="coordinator-photo-container">
                            <img
                              src={photoUrl}
                              alt={sc.studentCordinatorName}
                              className="coordinator-photo"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `/img/person/${(idx % 8) + 2}.jpg`;
                              }}
                            />
                          </div>
                          <div className="coordinator-name">{sc.studentCordinatorName}</div>
                          <div className="coordinator-dept">
                            {sc.studentCordinatorCollege || sc.departmentName || 'Student Coordinator'}
                          </div>
                          {sc.studentCordinatorPhone && (
                            <a href={`tel:${sc.studentCordinatorPhone}`} className="coordinator-phone">
                              📞 {sc.studentCordinatorPhone}
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

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
      </div>
    </div>
  );
}
