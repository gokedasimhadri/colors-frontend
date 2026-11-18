import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getLoggedStudent } from '../../services/api';
import { EVENT_START_DATE, EVENT_CONFIG } from '../../utils/eventDate';
import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown';
import '@leenguyen/react-flip-clock-countdown/dist/index.css';
import SplitColorText from '../../components/ThemeComponents/SplitColor/SplitColorText';
import SplitBackground from '../../components/ThemeComponents/backgrounds/SplitBackground';
import ThemeButton from '../../components/ThemeComponents/ThemeButton';
import { LiquidGlass } from '../../components/ThemeComponents/LiquidGlass';
import { Phone } from 'lucide-react';
import './Home.css';
import '../Invitation/Invitation.css';

const EVENT_DATE = EVENT_START_DATE;

// ─── The Festival Arenas (Culturals, Sports, Creo, Fete) ───────────────────
const FEST_PILLARS = [
  {
    name: 'Culturals',
    coordinator: 'Dr. N. Ram Babu',
    phone: '8473917384',
    color: '#e11d48',
    icon: '🎭',
    events: [
      'Dance: Classical (Solo & Group)',
      'Dance: Western, Hip Hop & Folk',
      'Music: Vocal Singing & Duet',
      'Drama: Skit, Mime & Stage Play',
      'Comedy: Stand-up & Mono Action'
    ],
    bgImage: '/culturals_bg.png'
  },
  {
    name: 'Sports',
    coordinator: 'Dr. N. Ravi',
    phone: '9912393905',
    color: '#0284c7',
    icon: '🏆',
    events: [
      'Running: 100M, 200M, 400M & 800M',
      'Distance: 1500M & 5K Marathon',
      'Relay: 4x100M & 4x400M Relay',
      'Jumping: Long, High & Triple Jump',
      'Throwing: Shotput & Discus Throw'
    ],
    bgImage: '/sports_bg.png'
  },
  {
    name: 'Creo',
    coordinator: 'Dr. B. Srinivas',
    phone: '9866732745',
    color: '#d97706',
    icon: '🎨',
    events: [
      'Visual: Spot Photography & Clicks',
      'Fine Arts: Spot Painting & Rangoli',
      'Cinema: Movie & Short Film Making',
      'Fashion: Modern & Ethnic Runway',
      'Literary: Sahityam, Charades & Hunt'
    ],
    bgImage: '/creo_bg.png'
  },
  {
    name: 'Fete',
    coordinator: 'Mr. J. D. Venkatesh',
    phone: '7036266661',
    color: '#059669',
    icon: '🎪',
    events: [
      'Culinary: Master Chef & Cookery',
      'Fiesta: Carnival & Fun Games',
      'Bazaar: Youth Flea Market',
      'Acoustic: Live Band & DJ Arena',
      'Entertainment: Open Mic & VR Arena'
    ],
    bgImage: '/hero_bg.png'
  }
];

function Home() {
  const navigate = useNavigate();
  const [student, setStudent] = useState(getLoggedStudent());
  const { year } = EVENT_CONFIG;

  const handlePillarClick = (pillar) => {
    const tabId = (pillar.code || pillar.name || '').toUpperCase();
    navigate(`/events?tab=${encodeURIComponent(tabId)}`, {
      state: { tab: tabId, category: pillar.name }
    });
  };

  useEffect(() => {
    const handleAuth = () => setStudent(getLoggedStudent());
    window.addEventListener('fest-student-auth-change', handleAuth);
    window.addEventListener('storage', handleAuth);
    return () => {
      window.removeEventListener('fest-student-auth-change', handleAuth);
      window.removeEventListener('storage', handleAuth);
    };
  }, []);

  return (
    <SplitBackground as="main" className="colours-home-main">
      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION: Split Dual-Tone Canvas with Powder Burst
          Faithful recreation of the official poster design
          ───────────────────────────────────────────────────────────── */}
      <section className="fest-split-hero" id="hero">
        {/* Top Grand Split Header matching the Official Poster (Perfect Page Center Alignment) */}
        <header className="hero-poster-header">
          {/* Row 1: COLOURS (Centered with 50/50 Dual-Tone Split) */}
          <div className="poster-header-row poster-title-row">
            <SplitColorText as="h1" className="poster-colours-heading" splitPercent={50}>
              COLOURS
            </SplitColorText>
          </div>

          {/* Row 2: A NATIONAL LEVEL YOUTH FESTIVAL (Centered with 50/50 Dual-Tone Split) */}
          <div className="poster-header-row poster-tagline-row">
            <SplitColorText as="p" className="poster-tagline-text" splitPercent={50}>
              A NATIONAL LEVEL YOUTH FESTIVAL
            </SplitColorText>
          </div>
        </header>

        {/* ROW 1 (TOP): Live Interactive Split-Flap Countdown Timer (Centered across 50/50 Canvas) */}
        <div className="hero-countdown-center-section hero-countdown-top-row">
          <div className="hero-countdown-box hero-flip-countdown-box">
            <div className="hero-flip-clock-wrapper">
              <FlipClockCountdown
                to={new Date(EVENT_DATE).getTime()}
                labels={['DAYS', 'HOURS', 'MINS', 'SECS']}
                duration={0.6}
                hideOnComplete={false}
                className="hero-flip-clock"
              />
            </div>
          </div>
        </div>

        {/* ROW 2 (MIDDLE): Dates & Month (2 Lines: #be9337 Rounded Squares for Dates + SplitColorText for Month) */}
        <div className="hero-dates-center-section">
          {/* Line 1: Dates (7, 8, 9) in #be9337 Rounded Corner Squares (No Dots) */}
          <div className="dates-squares-row">
            <div className="date-square-tile">
              <span className="date-digit">7</span>
            </div>
            <div className="date-square-tile">
              <span className="date-digit">8</span>
            </div>
            <div className="date-square-tile">
              <span className="date-digit">9</span>
            </div>
          </div>

          {/* Line 2: Month (JANUARY 2027) Centered with SplitColorText */}
          <div className="dates-month-row">
            <SplitColorText
              as="h2"
              className="month-split-heading"
              splitPercent={50}
              leftColor="#0d1536"
              rightColor="#ffffff"
            >
              JANUARY 2027
            </SplitColorText>
          </div>
        </div>

        {/* ROW 3 (BOTTOM): Centered Action CTAs - Commented out as requested */}
        {/*
        <div className="hero-bottom-actions-section">
          <div className="hero-center-actions">
            {!student ? (
              <ThemeButton
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('fest-open-auth-modal', { detail: { mode: 'register' } }));
                }}
                className="hero-action-btn"
              >
                <SplitColorText>Register</SplitColorText>
              </ThemeButton>
            ) : (
              <ThemeButton
                as={Link}
                to="/dashboard"
                className="hero-action-btn"
              >
                <SplitColorText>Student Dashboard</SplitColorText>
              </ThemeButton>
            )}

            <ThemeButton
              as={Link}
              to="/events"
              id="hero-explore-btn"
              className="hero-action-btn"
            >
              <SplitColorText>Explore Events</SplitColorText>
            </ThemeButton>

            <ThemeButton
              as="a"
              href="/Schedule_of_Events.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hero-action-btn"
            >
              <SplitColorText>3-Day Schedule</SplitColorText>
            </ThemeButton>

            <ThemeButton
              as={Link}
              to="/invitation"
              id="hero-invitation-btn"
              className="hero-action-btn"
            >
              <SplitColorText>View Official Poster</SplitColorText>
            </ThemeButton>
          </div>
        </div>
        */}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          OFFICIAL FESTIVAL INVITATION (CHANCELLOR & PRO-CHANCELLOR)
          ───────────────────────────────────────────────────────────── */}
      <section className="home-invitation-section" id="invitation">
        <div className="invitation-hero-header">
          <div className="invitation-header-row invitation-title-row">
            <SplitColorText
              as="h2"
              className="invitation-hero-title"
              splitPercent={50}
              leftColor="#0f172a"
              rightColor="#ffffff"
            >
              Invitation
            </SplitColorText>
          </div>
        </div>

        <div className="container invitation-container">
          <LiquidGlass
            className="invitation-glass-card"
            borderRadius={20}
            enableShader={true}
          >
            <div className="invitation-card-grid">
              {/* ── Left Column: Chancellor Photo & Details ── */}
              <div className="invitation-dignitary-col left-col">
                <div className="invitation-photo-frame">
                  <img
                    src="/invitation/chancellor-sesha-reddy.webp"
                    alt="Dr. N. Sesha Reddy – Chancellor, Aditya University"
                    className="invitation-dignitary-img"
                  />
                </div>
                <h3 className="invitation-dignitary-name">Dr. N. Sesha Reddy</h3>
                <span className="invitation-dignitary-role">Chancellor</span>
                <span className="invitation-dignitary-inst">Aditya University</span>
              </div>

              {/* ── Center Column: Official Joint Invitation Message ── */}
              <div className="invitation-center-col">
                <SplitColorText
                  as="p"
                  className="invitation-joint-paragraph"
                  screenSync={true}
                  leftColor="#1e293b"
                  rightColor="#cbd5e1"
                >
                  It gives us immense pleasure and pride to cordially invite talented students, scholars, and dynamic youth delegates from across the nation to Colours {year}, the premier national youth festival of Aditya University. Taking place from January 7 to 9, 2027, at our Surampalem campus, this vibrant arena celebrates creative brilliance, cultural artistry, and athletic mastery across Culturals, Sports, Creo, and Fete with a ₹10,00,000 cash prize pool. We warmly look forward to welcoming you to three unforgettable days of excellence, camaraderie, and celebration.
                </SplitColorText>
              </div>

              {/* ── Right Column: Pro-Chancellor Photo & Details ── */}
              <div className="invitation-dignitary-col right-col">
                <div className="invitation-photo-frame">
                  <img
                    src="/invitation/pro-chancellor-satish-reddy.webp"
                    alt="Dr. N. Satish Reddy – Pro-Chancellor, Aditya University"
                    className="invitation-dignitary-img"
                  />
                </div>
                <h3 className="invitation-dignitary-name">Dr. N. Satish Reddy</h3>
                <span className="invitation-dignitary-role">Pro-Chancellor</span>
                <span className="invitation-dignitary-inst">Aditya University</span>
              </div>
            </div>
          </LiquidGlass>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FOUR MAIN FESTIVAL DOMAINS (FROM OFFICIAL POSTER)
          CULTURALS • SPORTS • CREO • FETE
          ───────────────────────────────────────────────────────────── */}
      <section className="fest-pillars-section" id="pillars">
        <div className="container pillars-container">
          <div className="section-head text-center pillars-header-centered">
            <div className="pillars-title-wrap">
              <SplitColorText
                as="h2"
                className="section-title pillars-section-title"
                screenSync={true}
                leftColor="#0f172a"
                rightColor="#ffffff"
              >
                Four Arenas of Glory
              </SplitColorText>
            </div>
            <div className="pillars-desc-wrap">
              <SplitColorText
                as="p"
                className="section-desc pillars-section-desc"
                screenSync={true}
                leftColor="#0f172a"
                rightColor="#ffffff"
              >
                Competitions span 4 major tracks, supervised by dedicated university
                <br className="pillars-desc-br" />
                chairpersons with a total cash pool of ₹10,00,000.
              </SplitColorText>
            </div>
          </div>

          <div className="pillars-grid">
            {FEST_PILLARS.map((pillar, index) => {
              return (
                <LiquidGlass
                  key={pillar.code || pillar.name}
                  className="pillar-card"
                  theme={index < 2 ? 'light' : 'dark'}
                  onClick={() => handlePillarClick(pillar)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handlePillarClick(pillar);
                    }
                  }}
                  title={`View all ${pillar.name} events`}
                >
                  <div
                    className="pillar-header"
                    title={`View ${pillar.name} Events in Events Page`}
                  >
                    <div className="pillar-icon-box">
                      <span className="pillar-icon">{pillar.icon}</span>
                    </div>
                    <div className="pillar-title-group">
                      {pillar.code && (
                        <SplitColorText
                          as="span"
                          className="pillar-code"
                          screenSync={true}
                          leftColor="#0f172a"
                          rightColor="#ffffff"
                        >
                          {pillar.code}
                        </SplitColorText>
                      )}
                      <SplitColorText
                        as="h3"
                        className="pillar-name"
                        screenSync={true}
                        leftColor="#0f172a"
                        rightColor="#ffffff"
                      >
                        {pillar.name}
                      </SplitColorText>
                    </div>
                  </div>

                  {pillar.tagline && (
                    <SplitColorText
                      as="p"
                      className="pillar-tagline"
                      screenSync={true}
                      leftColor="#334155"
                      rightColor="#e2e8f0"
                    >
                      {pillar.tagline}
                    </SplitColorText>
                  )}

                  <div className="pillar-events-snippet">
                    <SplitColorText
                      as="span"
                      className="events-snippet-label"
                      screenSync={true}
                      leftColor="#475569"
                      rightColor="#cbd5e1"
                    >
                      Key Competitions:
                    </SplitColorText>
                    <ul className="snippet-list">
                      {(pillar.events || []).map((ev, i) => {
                        const colonIdx = ev.indexOf(':');
                        return (
                          <li key={i}>
                            <SplitColorText
                              as="span"
                              screenSync={true}
                              leftColor="#0f172a"
                              rightColor="#ffffff"
                            >
                              {colonIdx !== -1 ? (
                                <>
                                  <strong style={{ fontWeight: 600 }}>{ev.substring(0, colonIdx + 1)}</strong>
                                  {ev.substring(colonIdx + 1)}
                                </>
                              ) : (
                                ev
                              )}
                            </SplitColorText>
                          </li>
                        );
                      })}
                    </ul>

                    {/* View More Button at bottom center of Key Competitions card */}
                    <div className="pillar-snippet-view-more">
                      <ThemeButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePillarClick(pillar);
                        }}
                        className="btn-snippet-view-more"
                        borderRadius={10}
                        title={`Explore All ${pillar.name} Events`}
                      >
                        <SplitColorText leftColor="#0f172a" rightColor="#ffffff">
                          View More
                        </SplitColorText>
                      </ThemeButton>
                    </div>
                  </div>

                  <div className="pillar-coordinator-box">
                    <SplitColorText
                      as="span"
                      className="coord-chip-label"
                      screenSync={true}
                      leftColor="#475569"
                      rightColor="#cbd5e1"
                    >
                      Domain In-charge:
                    </SplitColorText>
                    <div className="coord-person-row">
                      <SplitColorText
                        as="span"
                        className="coord-name"
                        screenSync={true}
                        leftColor="#0f172a"
                        rightColor="#ffffff"
                        title={pillar.coordinator}
                      >
                        {pillar.coordinator}
                      </SplitColorText>
                      <a
                        href={`tel:${pillar.phone}`}
                        className="coord-phone-pill"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SplitColorText
                          as="span"
                          mode="fallback"
                          className="coord-phone-icon-box"
                          screenSync={true}
                          leftColor="#0f172a"
                          rightColor="#ffffff"
                        >
                          <Phone size={13} className="coord-phone-icon" strokeWidth={2} />
                        </SplitColorText>
                        <SplitColorText
                          as="span"
                          screenSync={true}
                          leftColor="#0f172a"
                          rightColor="#ffffff"
                        >
                          {pillar.phone}
                        </SplitColorText>
                      </a>
                    </div>
                  </div>

                </LiquidGlass>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CAMPUS & REGISTRATION CTA WITH QR CODE
          ───────────────────────────────────────────────────────────── */}
      <section className="fest-final-cta" id="register">
        <div className="container">
          <LiquidGlass className="final-cta-card" theme="light" borderRadius={16} enableShader={false}>
            <div className="cta-left-details">
              <span className="cta-celebration-tag">Join The Celebration</span>
              <SplitColorText
                as="h2"
                className="cta-title"
                screenSync={true}
                leftColor="#0f172a"
                rightColor="#ffffff"
              >
                Be Part of Colours 2027
              </SplitColorText>
              <SplitColorText
                as="p"
                className="cta-desc"
                screenSync={true}
                leftColor="#334155"
                rightColor="#ffffff"
              >
                Don't pass up 2027's largest national college event. Secure student participation, compete for the ₹10,000,000 prize pool, and represent your campus contingent!
              </SplitColorText>

              <div className="cta-buttons-row">
                {!student ? (
                  <ThemeButton
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('fest-open-auth-modal', { detail: { mode: 'register' } }));
                    }}
                    borderRadius={12}
                    className="cta-theme-btn"
                  >
                    <SplitColorText
                      screenSync={true}
                      leftColor="#0f172a"
                      rightColor="#ffffff"
                    >
                      Register Now
                    </SplitColorText>
                  </ThemeButton>
                ) : (
                  <ThemeButton
                    as={Link}
                    to="/events"
                    borderRadius={12}
                    className="cta-theme-btn"
                  >
                    <SplitColorText
                      screenSync={true}
                      leftColor="#0f172a"
                      rightColor="#ffffff"
                    >
                      Browse Events
                    </SplitColorText>
                  </ThemeButton>
                )}
                <ThemeButton
                  as={Link}
                  to="/contact"
                  borderRadius={12}
                  className="cta-theme-btn"
                >
                  <SplitColorText
                    screenSync={true}
                    leftColor="#0f172a"
                    rightColor="#ffffff"
                  >
                    Support & Help Desk
                  </SplitColorText>
                </ThemeButton>
              </div>
            </div>

            <div className="cta-qr-card">
              <div className="poster-thumbnail-wrapper">
                <img
                  src="/colours_poster_theme.webp"
                  alt="Colours 2027 Official Festival Poster"
                  className="poster-thumbnail-img"
                />
              </div>
            </div>
          </LiquidGlass>
        </div>
      </section>
    </SplitBackground>
  );
}

export default Home;
