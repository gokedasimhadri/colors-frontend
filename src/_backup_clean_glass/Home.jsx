import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLoggedStudent } from '../../services/api';
import { EVENT_START_DATE } from '../../utils/eventDate';
import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown';
import '@leenguyen/react-flip-clock-countdown/dist/index.css';
import SplitColorText from '../../components/ThemeComponents/SplitColor/SplitColorText';
import SplitBackground from '../../components/ThemeComponents/backgrounds/SplitBackground';
import ThemeButton from '../../components/ThemeComponents/ThemeButton';
import { LiquidGlass } from '../../components/ThemeComponents/LiquidGlass';
import { Phone } from 'lucide-react';
import './Home.css';

const EVENT_DATE = EVENT_START_DATE;

// ─── The Festival Arenas (Culturals, Sports, Creo, Fete) ───────────────────
const FEST_PILLARS = [
  {
    // code: 'Colours',
    name: 'Culturals',
    tagline: 'Music, Dance, Theatre & Expressions',
    coordinator: 'Dr. N. Rambabu',
    phone: '8473917384',
    color: '#e11d48',
    icon: '🎭',
    events: ['Dance Solo & Group', 'Classical & Western Singing', 'Mime Championship', 'Mono Action', 'Battle of Bands'],
    bgImage: '/culturals_bg.png'
  },
  {
    // code: 'Colours',
    name: 'Sports',
    tagline: 'Athletics, Team Championships & Glory',
    coordinator: 'Dr. N. Ravi',
    phone: '9912393905',
    color: '#0284c7',
    icon: '🏆',
    events: ['100m / 200m Sprint', 'Volleyball Tournament', 'Basketball League', 'Relay 4x100m', 'Badminton Singles'],
    bgImage: '/sports_bg.png'
  },
  {
    // code: 'Colours',
    name: 'Creo',
    tagline: 'Fine Arts, Media, Fashion & Innovation',
    coordinator: 'Dr. B. Srinivas',
    phone: '9866732745',
    color: '#d97706',
    icon: '🎨',
    events: ['Ethnic & Modern Runway', 'Spot Painting Contest', 'Treasure Quest', 'Short Film Making', 'Mobile Photography'],
    bgImage: '/creo_bg.png'
  },
  {
    // code: 'Colours',
    name: 'Fete',
    tagline: 'Food Carnival, Fun Fiesta, Games & Stalls',
    coordinator: 'Mr. J. D. Venkatesh',
    phone: '7036266661',
    color: '#059669',
    icon: '🎪',
    events: ['Master Chef & Cookery', 'Carnival & Fun Games', 'Youth Flea Market', 'Live Acoustic & DJ Arena', 'Flash Mob & Open Mic'],
    bgImage: '/hero_bg.png'
  }
];

function Home() {
  const [student, setStudent] = useState(getLoggedStudent());

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

        {/* ROW 2 (MIDDLE): Save the Dates (Centered across 50/50 Canvas with SplitColorText) */}
        <div className="hero-dates-center-section">
          <span className="save-dates-label">SAVE THE DATES</span>
          <div className="dates-display-row">
            <SplitColorText
              as="h2"
              className="dates-split-heading"
              splitPercent={50}
              leftColor="#0d1536"
              rightColor="#ffffff"
            >
              7 • 8 • 9 JANUARY
            </SplitColorText>
          </div>
        </div>

        {/* COMING SOON (Large SplitColorText Centered across 50/50 Canvas) */}
        <div className="hero-coming-soon-section">
          <SplitColorText
            as="h2"
            className="hero-coming-soon-text"
            splitPercent={50}
            leftColor="#0d1536"
            rightColor="#ffffff"
          >
            COMING SOON
          </SplitColorText>
        </div>

        {/* ROW 3 (BOTTOM): Centered Action CTAs (Commented out) */}
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
          FOUR MAIN FESTIVAL DOMAINS (FROM OFFICIAL POSTER)
          CULTURALS • SPORTS • CREO • FETE (Commented out)
          ───────────────────────────────────────────────────────────── */}
      {/*
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
            {FEST_PILLARS.map((pillar, index) => (
              <LiquidGlass
                key={pillar.code || pillar.name}
                className="pillar-card"
                theme={index < 2 ? 'light' : 'dark'}
              >
                <div className="pillar-header">
                  <div className="pillar-icon-box">
                    <span className="pillar-icon">{pillar.icon}</span>
                  </div>
                  <div className="pillar-title-group">
                    <span className="pillar-code">{pillar.code}</span>
                    <h3 className="pillar-name">{pillar.name}</h3>
                  </div>
                </div>

                <p className="pillar-tagline">{pillar.tagline}</p>

                <div className="pillar-events-snippet">
                  <span className="events-snippet-label">Key Competitions:</span>
                  <ul className="snippet-list">
                    {pillar.events.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>

                <div className="pillar-coordinator-box">
                  <span className="coord-chip-label">Domain In-charge:</span>
                  <div className="coord-person-row">
                    <span className="coord-name">{pillar.coordinator}</span>
                    <a href={`tel:${pillar.phone}`} className="coord-phone-pill">
                      <Phone size={13} className="coord-phone-icon" strokeWidth={2} />
                      <span>{pillar.phone}</span>
                    </a>
                  </div>
                </div>

                <div className="pillar-card-footer">
                  <ThemeButton
                    as={Link}
                    to="/events"
                    className="btn-pillar-explore"
                    borderRadius={12}
                    width="100%"
                    color={index < 2 ? '#0f172a' : '#ffffff'}
                  >
                    Check Out {pillar.name} Events
                  </ThemeButton>
                </div>
              </LiquidGlass>
            ))}
          </div>
        </div>
      </section>
      */}

      {/* ─────────────────────────────────────────────────────────────
          CAMPUS & REGISTRATION CTA WITH QR CODE (Commented out)
          ───────────────────────────────────────────────────────────── */}
      {/*
      <section className="fest-final-cta" id="register">
        <div className="container">
          <LiquidGlass className="final-cta-card" theme="light" borderRadius={16} enableShader={false}>
            <div className="cta-left-details">
              <span className="cta-celebration-tag">JOIN THE CELEBRATION</span>
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
                leftColor="#475569"
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
                    <SplitColorText>Register Now</SplitColorText>
                  </ThemeButton>
                ) : (
                  <ThemeButton
                    as={Link}
                    to="/events"
                    borderRadius={12}
                    className="cta-theme-btn"
                  >
                    <SplitColorText>Browse Events</SplitColorText>
                  </ThemeButton>
                )}
                <ThemeButton
                  as={Link}
                  to="/contact"
                  borderRadius={12}
                  className="cta-theme-btn"
                >
                  <SplitColorText>Support & Help Desk</SplitColorText>
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
      */}
    </SplitBackground>
  );
}

export default Home;
