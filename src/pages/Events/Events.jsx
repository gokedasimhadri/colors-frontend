import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Phone, Mail, ArrowLeft } from 'lucide-react';
import {
  EVENT_TYPE,
  fetchCategories,
  fetchAllEvents,
  fetchEventDetails,
  fetchFacultyCoordinators,
  fetchStudentCoordinators,
  getEventImageUrl,
  getFacultyCandidateUrls,
  getLoggedStudent,
  logoutStudent
} from '../../services/api';
import StudentAuthModal from '../../components/RegistrationModals/StudentAuthModal';
import EventRegistrationModal from '../../components/RegistrationModals/EventRegistrationModal';
import SplitBackground from '../../components/ThemeComponents/backgrounds/SplitBackground';
import SplitColorText from '../../components/ThemeComponents/SplitColor/SplitColorText';
import ThemeButton from '../../components/ThemeComponents/ThemeButton/ThemeButton';
import ThemeTab from '../../components/ThemeComponents/ThemeTabDesign/ThemeTab';
import './Events.css';

const FEST_TYPE = EVENT_TYPE || 'COLORS';

/**
 * Formats strings to clean Title Case
 */
export function formatTitleCase(str) {
  if (!str || typeof str !== 'string') return str;
  return str.toLowerCase().replace(/(?:^|\s|-|\/)\S/g, (char) => char.toUpperCase());
}

export default function Events() {
  const { eventCategory, eventSubCategory, eventName } = useParams();
  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────
  // RENDER BASED ON URL PARAMS:
  // 1. If viewing a specific event -> View 2: EventDetailView
  // 2. Else -> View 1: AllCategoriesView (Direct Category & Events List)
  // ─────────────────────────────────────────────────────────────
  let selectedEvent = null;
  let selectedCategory = eventCategory ? decodeURIComponent(eventCategory) : null;

  if (eventCategory && eventSubCategory && eventName) {
    selectedEvent = decodeURIComponent(eventName);
  } else if (eventCategory && eventSubCategory) {
    // When URL matches /events/:eventCategory/:eventName
    selectedEvent = decodeURIComponent(eventSubCategory);
  }

  if (selectedCategory && selectedEvent) {
    return (
      <SplitBackground as="main" className="colours-events-main">
        <EventDetailView
          category={selectedCategory}
          eventName={selectedEvent}
          themeCode={FEST_TYPE}
          onBack={() => navigate('/events')}
          onNavigateHome={() => navigate('/events')}
        />
      </SplitBackground>
    );
  }

  return (
    <SplitBackground as="main" className="colours-events-main">
      <AllCategoriesView
        initialCategory={selectedCategory || 'ALL'}
        themeCode={FEST_TYPE}
        onSelectEvent={(catName, eventSlugOrTitle) =>
          navigate(`/events/${encodeURIComponent(catName)}/${encodeURIComponent(eventSlugOrTitle)}`)
        }
      />
    </SplitBackground>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 1: All Categories & Events (Direct Events Grid)
// ─────────────────────────────────────────────────────────────
function AllCategoriesView({ initialCategory = 'ALL', themeCode, onSelectEvent }) {
  const [categories, setCategories] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(initialCategory || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetchCategories(themeCode),
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

  useEffect(() => {
    if (initialCategory && initialCategory !== 'ALL') {
      setActiveTab(initialCategory);
    }
  }, [initialCategory]);

  // Filtered categories and events based on active category tab & search query
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
        let events = Array.isArray(cat.events) ? [...cat.events] : [];

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          events = events.filter((ev) => {
            const evTitle = (ev.title || ev.eventName || '').toLowerCase();
            const evDesc = (ev.description || ev.overview || '').toLowerCase();
            const evVenue = (ev.venue || '').toLowerCase();
            return evTitle.includes(q) || evDesc.includes(q) || evVenue.includes(q);
          });
        }

        return {
          ...cat,
          events
        };
      })
      .filter((cat) => (cat.events || []).length > 0 || !searchQuery.trim());
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
        return { id, label, count: cat.totalEventsCount || (cat.events || []).length };
      });
  }, [categories]);

  // Combined tabs for ThemeTab (ALL + categories)
  const allCategoryTabs = useMemo(() => [
    { id: 'ALL', label: 'All Events' },
    ...categoryTabs.map((t) => ({ id: t.id, label: t.label }))
  ], [categoryTabs]);

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

          {/* Category Filter Tabs with Integrated Circular Search */}
          <div className="events-control-bar">
            <ThemeTab
              tabs={allCategoryTabs}
              activeTab={activeTab}
              onChange={setActiveTab}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              searchPlaceholder="Search events"
              className="events-filter-themetab"
            />
          </div>
        </div>
      </div>

      <div className="categories-container" id="events-categories-list">
        {loading && (
          <div className="events-loading">
            <div className="events-spinner" />
            <p>Loading events for {themeCode}...</p>
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
            <p>Try searching for a different keyword or switch to All Events.</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveTab('ALL'); }}
              className="btn-checkout-primary"
              style={{ marginTop: '1rem' }}
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Categories List with Direct Events Grid */}
        {!loading && !error && filteredCategories.map((cat) => {
          const catCoordinator = cat.coordinator || (cat.coordinators && cat.coordinators[0]);
          const events = Array.isArray(cat.events) ? cat.events : [];

          return (
            <section key={cat._id || cat.code} className="category-section">
              {/* Category Header Row with Metrics & Coordinator */}
              <div className="category-header-row">
                <div className="category-title-area">
                  <SplitColorText
                    as="h2"
                    className="category-heading"
                    screenSync={true}
                    leftColor="#0f172a"
                    rightColor="#ffffff"
                  >
                    {cat.name || `${cat.code || cat._id} Events`}
                  </SplitColorText>
                  <div className="category-meta-chips">
                    <span className="category-count-badge badge-accent">
                      {events.length} {events.length === 1 ? 'Event' : 'Events'}
                    </span>
                  </div>
                </div>

                {/* Category Coordinator Pill */}
                {catCoordinator && catCoordinator.name && (
                  <div className="category-coord-pill">
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
                        as="span"
                        mode="fallback"
                        screenSync={true}
                        leftColor="#0f172a"
                        rightColor="#ffffff"
                        className="coord-role"
                      >
                        Major Event Co-ordinator
                      </SplitColorText>

                      <SplitColorText
                        as="span"
                        mode="fallback"
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
                            className="coord-phone-split"
                          >
                            <Phone size={12} strokeWidth={2.5} className="coord-phone-lucide" />
                            <span className="coord-phone-number">{catCoordinator.phone}</span>
                          </SplitColorText>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Direct Events Cards Grid */}
              {events.length > 0 ? (
                <div className="events-cards-grid">
                  {events.map((ev, idx) => {
                    const eventImg = getEventImageUrl(ev.eventImage || ev.banner?.url, ev.title || ev.eventName);
                    const participationType = ev.eventType || (ev.participation?.type === 'TEAM' ? 'Team' : 'Solo');

                    return (
                      <div key={ev._id || idx} className="event-sub-card">
                        <SplitColorText
                          as="div"
                          className="event-sub-title-bar"
                          screenSync={true}
                          leftColor="#0f172a"
                          rightColor="#ffffff"
                        >
                          {ev.title || ev.eventName}
                        </SplitColorText>
                        <div className="event-sub-body">
                          <div className="event-sub-table-col">
                            <div className="event-table-row">
                              <div className="table-pill-label">
                                <SplitColorText
                                  as="span"
                                  mode="fallback"
                                  screenSync={true}
                                  leftColor="#475569"
                                  rightColor="#cbd5e1"
                                >
                                  Category
                                </SplitColorText>
                              </div>
                              <div className="table-pill-value">
                                <SplitColorText
                                  as="span"
                                  mode="fallback"
                                  screenSync={true}
                                  leftColor="#0f172a"
                                  rightColor="#ffffff"
                                >
                                  {cat.name}
                                </SplitColorText>
                              </div>
                            </div>
                            <div className="event-table-row">
                              <div className="table-pill-label">
                                <SplitColorText
                                  as="span"
                                  mode="fallback"
                                  screenSync={true}
                                  leftColor="#475569"
                                  rightColor="#cbd5e1"
                                >
                                  Participation
                                </SplitColorText>
                              </div>
                              <div className="table-pill-value">
                                <SplitColorText
                                  as="span"
                                  mode="fallback"
                                  screenSync={true}
                                  leftColor="#0f172a"
                                  rightColor="#ffffff"
                                >
                                  {participationType}
                                </SplitColorText>
                              </div>
                            </div>
                            <div className="event-table-row">
                              <div className="table-pill-label">
                                <SplitColorText
                                  as="span"
                                  mode="fallback"
                                  screenSync={true}
                                  leftColor="#475569"
                                  rightColor="#cbd5e1"
                                >
                                  Registration Fee
                                </SplitColorText>
                              </div>
                              <div className="table-pill-value fee-highlight">
                                <SplitColorText
                                  as="span"
                                  mode="fallback"
                                  screenSync={true}
                                  leftColor="#be123c"
                                  rightColor="#fb7185"
                                >
                                  {ev.price ? `₹ ${ev.price}/-` : 'Free Entry'}
                                </SplitColorText>
                              </div>
                            </div>
                            <div className="event-table-row">
                              <div className="table-pill-label">
                                <SplitColorText
                                  as="span"
                                  mode="fallback"
                                  screenSync={true}
                                  leftColor="#475569"
                                  rightColor="#cbd5e1"
                                >
                                  Venue
                                </SplitColorText>
                              </div>
                              <div className="table-pill-value" style={{ fontSize: '0.82rem', whiteSpace: 'normal' }}>
                                <SplitColorText
                                  as="span"
                                  mode="fallback"
                                  screenSync={true}
                                  leftColor="#0f172a"
                                  rightColor="#ffffff"
                                >
                                  {ev.venue || 'Aditya University Campus'}
                                </SplitColorText>
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
              ) : (
                <div className="category-empty-notice" style={{ padding: '1.5rem', textAlign: 'center', opacity: 0.7 }}>
                  <p>Events are currently being scheduled for {cat.name}.</p>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT: Faculty Coordinator Photo with Multi-Campus Fallback
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
// VIEW 2: Event Detail View
// ─────────────────────────────────────────────────────────────
function EventDetailView({ category, eventName, themeCode, onBack, onNavigateHome }) {
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
      setAuthModalOpen(true);
    } else {
      setCurrentStudent(student);
      setRegModalOpen(true);
    }
  };

  const handleAuthSuccess = (student, regRecord) => {
    setCurrentStudent(student);
    if (regRecord) {
      return;
    }
    setAuthModalOpen(false);
    setRegModalOpen(true);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchEventDetails(category, eventName, themeCode),
      fetchFacultyCoordinators(category, eventName, themeCode),
      fetchStudentCoordinators(category, eventName)
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
  }, [category, eventName, themeCode]);

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
              ← Back to Events
            </button>
            <span className="detail-breadcrumb-path">
              <span className="breadcrumb-link" onClick={onNavigateHome}>Events</span>
              {' / '}
              <span className="breadcrumb-link" onClick={onBack}>{category}</span>
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
                Back to Events
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
                  <div className="stat-card-value stat-small">{eventData.venue || 'Aditya University Campus'}</div>
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
              </div>

              {/* About The Event */}
              <div className="detail-section-card">
                <h2 className="detail-section-title">About The Event</h2>
                <div className="detail-prose">
                  <p>
                    {eventData.overview ||
                      eventData.description ||
                      `${eventData.eventName || eventData.title} is an official competition organized as part of Aditya University's National Level Youth Festival Colours 2027.`}
                  </p>
                </div>
              </div>

              {/* Competition Rules & Regulations */}
              {Array.isArray(eventData.regulations) && eventData.regulations.length > 0 && (
                <div className="detail-section-card">
                  <h2 className="detail-section-title">Rules & Regulations</h2>
                  <ul className="detail-rules-list">
                    {eventData.regulations.map((rule, idx) => (
                      <li key={idx}>
                        <span className="rule-bullet">{idx + 1}</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rounds & Structure */}
              {Array.isArray(eventData.roundsList) && eventData.roundsList.length > 0 && (
                <div className="detail-section-card">
                  <h2 className="detail-section-title">Competition Structure & Rounds</h2>
                  <div className="rounds-timeline">
                    {eventData.roundsList.map((rnd, idx) => (
                      <div key={idx} className="round-timeline-step">
                        <div className="round-number-badge">Round {rnd.roundNumber || idx + 1}</div>
                        <div className="round-content">
                          <h4 className="round-name">{rnd.roundName || `Stage ${idx + 1}`}</h4>
                          <p className="round-desc">{rnd.description || 'Elimination and scoring round.'}</p>
                          {rnd.duration && <span className="round-duration">⏱ {rnd.duration}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cash Prizes & Recognition */}
              <div className="detail-section-card">
                <h2 className="detail-section-title">Cash Prizes & Awards</h2>
                <div className="prizes-grid">
                  <div className="prize-podium-card prize-first">
                    <div className="prize-medal">🥇</div>
                    <div className="prize-title">1st Place</div>
                    <div className="prize-amount">{eventData.prizes?.first || 'Gold Trophy + Merit Certificate'}</div>
                  </div>
                  <div className="prize-podium-card prize-second">
                    <div className="prize-medal">🥈</div>
                    <div className="prize-title">2nd Place</div>
                    <div className="prize-amount">{eventData.prizes?.second || 'Silver Trophy + Merit Certificate'}</div>
                  </div>
                  <div className="prize-podium-card prize-third">
                    <div className="prize-medal">🥉</div>
                    <div className="prize-title">3rd Place</div>
                    <div className="prize-amount">{eventData.prizes?.third || 'Bronze Medal + Certificate'}</div>
                  </div>
                </div>
              </div>

              {/* Faculty Coordinators Section */}
              {faculty.length > 0 && (
                <div className="coordinators-section">
                  <h2 className="coordinators-heading">Faculty Coordinators</h2>
                  <div className="coordinators-grid">
                    {faculty.map((fc, idx) => (
                      <div key={idx} className="coordinator-card">
                        <div className="coordinator-photo-container">
                          <FacultyCoordinatorPhoto coordinator={fc} index={idx} />
                        </div>
                        <div className="coordinator-name">{formatTitleCase(fc.cordinatorName)}</div>
                        <div className="coordinator-dept">
                          {formatTitleCase(fc.cordinatorDesignation || 'Faculty In-Charge')}
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
                    ))}
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
                          <div className="coordinator-name">{formatTitleCase(sc.studentCordinatorName)}</div>
                          <div className="coordinator-dept">
                            {formatTitleCase(sc.studentCordinatorCollege || sc.departmentName || 'Student Coordinator')}
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
