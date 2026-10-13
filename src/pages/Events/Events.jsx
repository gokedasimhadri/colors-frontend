import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchCategoriesWithSubCategories,
  fetchEventsInSubCategory,
  fetchEventDetails,
  fetchFacultyCoordinators,
  fetchStudentCoordinators,
  getSubCatImageUrl,
  getLocalFallbackSubCatImageUrl,
  getEventImageUrl,
  getFacultyImageUrl
} from '../../services/api';
import './Events.css';

export default function Events() {
  const { eventCategory, eventSubCategory, eventName } = useParams();
  const navigate = useNavigate();

  // ─────────────────────────────────────────────────────────────
  // RENDER BASED ON URL PARAMS:
  // 1. If eventName is set -> View 3: Event Detail (Screenshot 5)
  // 2. Else if eventSubCategory is set -> View 2: Subcategory Events (Screenshot 4)
  // 3. Else -> View 1: All Categories & Subcategories (Screenshots 1, 2, 3)
  // ─────────────────────────────────────────────────────────────

  if (eventCategory && eventSubCategory && eventName) {
    return (
      <EventDetailView
        category={decodeURIComponent(eventCategory)}
        subCategory={decodeURIComponent(eventSubCategory)}
        eventName={decodeURIComponent(eventName)}
        onBack={() => navigate(`/events/${eventCategory}/${eventSubCategory}`)}
      />
    );
  }

  if (eventCategory && eventSubCategory) {
    return (
      <SubCategoryEventsView
        category={decodeURIComponent(eventCategory)}
        subCategory={decodeURIComponent(eventSubCategory)}
        onBack={() => navigate('/events')}
        onSelectEvent={(name) =>
          navigate(`/events/${encodeURIComponent(eventCategory)}/${encodeURIComponent(eventSubCategory)}/${encodeURIComponent(name)}`)
        }
      />
    );
  }

  return (
    <AllCategoriesView
      onSelectSubCategory={(catName, subCatName) =>
        navigate(`/events/${encodeURIComponent(catName)}/${encodeURIComponent(subCatName)}`)
      }
    />
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 1: All Categories & Subcategories (Screenshots 1, 2, 3)
// ─────────────────────────────────────────────────────────────
function AllCategoriesView({ onSelectSubCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchCategoriesWithSubCategories()
      .then((data) => {
        if (isMounted) {
          setCategories(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to load events');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered categories based on selected tab and search query
  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        if (activeTab === 'ALL') return true;
        return cat._id.toLowerCase().includes(activeTab.toLowerCase());
      })
      .map((cat) => {
        if (!searchQuery.trim()) return cat;
        const q = searchQuery.toLowerCase();
        const filteredItems = (cat.data || []).filter((item) =>
          (item.SubCatogory || item.name || '').toLowerCase().includes(q)
        );
        return { ...cat, data: filteredItems };
      })
      .filter((cat) => (cat.data || []).length > 0);
  }, [categories, activeTab, searchQuery]);

  return (
    <div className="events-page-wrapper">
      {/* University Portal Header Banner */}
      <div className="events-hero-header">
        <div className="container text-center">
          <div className="events-badge-top">ADITYA UNIVERSITY • COLOURS 2027</div>
          <h1 className="events-hero-title">Official Events & Competitions</h1>
          <p className="events-hero-subtitle">
            Compete across Sports, Culturals, Music, Theatre, and Creative Arts. All events are evaluated by
            national-level judges with cash rewards and official university certificates.
          </p>

          {/* Search and Category Filter Bar */}
          <div className="events-control-bar">
            <div className="events-search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search basketball, dance, singing, mono action..."
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

            <div className="events-tabs-group">
              <button
                type="button"
                className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
                onClick={() => setActiveTab('ALL')}
              >
                All Events
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'SPORTS' ? 'active' : ''}`}
                onClick={() => setActiveTab('SPORTS')}
              >
                Sports & Games
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'CULTURALS' ? 'active' : ''}`}
                onClick={() => setActiveTab('CULTURALS')}
              >
                Culturals
              </button>
              <button
                type="button"
                className={`tab-btn ${activeTab === 'CREO' ? 'active' : ''}`}
                onClick={() => setActiveTab('CREO')}
              >
                Creo Arts
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="categories-container">
        {loading && (
          <div className="events-loading">
            <div className="events-spinner" />
            <p>Loading database events...</p>
          </div>
        )}

        {error && (
          <div className="events-error">
            <h3>Unable to load events</h3>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
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

        {!loading && !error && filteredCategories.map((cat) => (
          <section key={cat._id} className="category-section">
            <div className="category-header-row">
              <h2 className="category-heading">{cat._id} Events</h2>
              <span className="category-count-badge">
                {cat.data.length} {cat.data.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>

            <div className="subcat-grid">
              {Array.isArray(cat.data) && cat.data.map((item, idx) => {
                const subCatTitle = item.SubCatogory || item.name;
                const imageSrc = getSubCatImageUrl(item.Image || item.image, subCatTitle);
                const localFallback = getLocalFallbackSubCatImageUrl(item.Image || item.image);

                return (
                  <div
                    key={idx}
                    className="subcat-card"
                    onClick={() => onSelectSubCategory(cat._id, subCatTitle)}
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
                    <div className="subcat-badge">{cat._id}</div>

                    {/* Gradient Overlay with Title and Hover Action */}
                    <div className="subcat-overlay">
                      <div className="subcat-title">{subCatTitle}</div>
                      <div className="subcat-action">
                        <button
                          type="button"
                          className="btn-checkout-subcat"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSubCategory(cat._id, subCatTitle);
                          }}
                        >
                          Check Out →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VIEW 2: Subcategory Events View (Screenshot 4)
// ─────────────────────────────────────────────────────────────
function SubCategoryEventsView({ category, subCategory, onBack, onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchEventsInSubCategory(category, subCategory)
      .then((data) => {
        if (isMounted) {
          setEvents(Array.isArray(data) ? data : []);
          setLoading(false);
        }
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
  }, [category, subCategory]);

  return (
    <div className="events-page-wrapper">
      <div className="subcat-view-wrapper">
        <div className="categories-container">
          {/* Breadcrumb Navigation */}
          <div className="breadcrumb-nav">
            <button onClick={onBack} className="btn-back-breadcrumb">
              ← Back to All Events
            </button>
            <div className="breadcrumb-info">
              <span className="breadcrumb-subtitle">Aditya University Fest</span>
              <h1 className="breadcrumb-heading">
                Events / {category}
              </h1>
            </div>
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
                Back to All Events
              </button>
            </div>
          )}

          {!loading && !error && events.length === 0 && (
            <div className="events-error">
              <p>No events found for {subCategory}.</p>
              <button onClick={onBack} className="btn-checkout-primary" style={{ marginTop: '1rem' }}>
                Back to All Events
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="events-cards-grid">
              {events.map((ev, idx) => {
                const eventImg = getEventImageUrl(ev.eventImage, ev.eventName);

                return (
                  <div key={idx} className="event-sub-card">
                    {/* Title Bar */}
                    <div className="event-sub-title-bar">{ev.eventName}</div>

                    {/* Body with Key-Value Pills & Image */}
                    <div className="event-sub-body">
                      <div className="event-sub-table-col">
                        <div className="event-table-row">
                          <div className="table-pill-label">Event Type</div>
                          <div className="table-pill-value">{ev.eventType || 'Solo'}</div>
                        </div>
                        <div className="event-table-row">
                          <div className="table-pill-label">Event Fee</div>
                          <div className="table-pill-value">₹ {ev.price ?? 'Free'}</div>
                        </div>
                        <div className="event-table-row">
                          <div className="table-pill-label">Enrolled</div>
                          <div className="table-pill-value">100+</div>
                        </div>
                      </div>

                      <div className="event-sub-image-col">
                        <img
                          src="/img/party_mode.jpg"
                          alt={ev.eventName}
                          className="event-sub-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = eventImg;
                          }}
                        />
                      </div>
                    </div>

                    {/* Bottom Checkout Button */}
                    <div className="event-sub-footer">
                      <button
                        className="btn-checkout-primary"
                        onClick={() => onSelectEvent(ev.eventName)}
                      >
                        Check Out
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
// VIEW 3: Event Detail View (Screenshot 5)
// ─────────────────────────────────────────────────────────────
function EventDetailView({ category, subCategory, eventName, onBack }) {
  const [eventData, setEventData] = useState(null);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      fetchEventDetails(category, subCategory, eventName),
      fetchFacultyCoordinators(category, subCategory, eventName),
      fetchStudentCoordinators(category, subCategory, eventName)
    ])
      .then(([details, facultyList, studentsList]) => {
        if (isMounted) {
          setEventData(details);
          setFaculty(Array.isArray(facultyList) ? facultyList : []);
          setStudents(Array.isArray(studentsList) ? studentsList : []);
          setLoading(false);
        }
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
  }, [category, subCategory, eventName]);

  return (
    <div className="events-page-wrapper">
      <div className="event-detail-wrapper">
        <div className="categories-container" style={{ position: 'relative', zIndex: 2 }}>
          {/* Back Navigation Button */}
          <div className="breadcrumb-nav">
            <button onClick={onBack} className="btn-back-breadcrumb">
              ← Back to {subCategory}
            </button>
            <span className="detail-breadcrumb-path">
              Events / {category} / {subCategory}
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
              {/* Event Main Title */}
              <h1 className="detail-main-title">{eventName}</h1>

              {/* Overview Section */}
              <div className="detail-section">
                <div className="detail-pill-badge">Overview</div>
                <p className="detail-overview-text">
                  {eventData.overview || 'No overview provided.'}
                </p>
              </div>

              {/* Event Rules Section */}
              {Array.isArray(eventData.regulations) && eventData.regulations.length > 0 && (
                <div className="detail-section">
                  <div className="detail-pill-badge">Event Rules</div>
                  <ul className="detail-rules-list">
                    {eventData.regulations.map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Event Venue Section */}
              {eventData.venue && (
                <div className="detail-section">
                  <div className="detail-pill-badge">Event Venue</div>
                  <p className="detail-venue-text">{eventData.venue}</p>
                </div>
              )}

              {/* Event Fee Section */}
              <div className="detail-section">
                <div className="detail-pill-badge">
                  Event Fee {eventData.price ? `- Rs ${eventData.price}/-` : '- Free'}
                </div>
              </div>

              {/* Faculty Coordinators Section */}
              {faculty.length > 0 && (
                <div className="coordinators-section">
                  <h2 className="coordinators-heading">Faculty Coordinators</h2>
                  <div className="coordinators-grid">
                    {faculty.map((fc, idx) => {
                      const photoUrl = getFacultyImageUrl(fc.cordinatorImage, idx);

                      return (
                        <div key={idx} className="coordinator-card">
                          <div className="coordinator-photo-container">
                            <img
                              src={photoUrl}
                              alt={fc.cordinatorName}
                              className="coordinator-photo"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = `/img/person/${(idx % 8) + 1}.jpg`;
                              }}
                            />
                          </div>
                          <div className="coordinator-name">{fc.cordinatorName}</div>
                          <div className="coordinator-dept">
                            {fc.departmentName || fc.cordinatorCollege || ''}
                          </div>
                          {fc.cordinatorPhone && (
                            <a href={`tel:${fc.cordinatorPhone}`} className="coordinator-phone">
                              📞 {fc.cordinatorPhone}
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
                            {sc.studentCordinatorCollege || sc.departmentName || ''}
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
        </div>
      </div>
    </div>
  );
}
