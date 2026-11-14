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
import './Home.css';

const EVENT_DATE = EVENT_START_DATE;

// ─── The Festival Arenas (Culturals, Sports, Creo, Fete) ───────────────────
const FEST_PILLARS = [
  {
    code: 'CULTURALS',
    name: 'Culturals',
    tagline: 'Music, Dance, Theatre & Expressions',
    coordinator: 'Mr. P. Raju',
    phone: '8374245400',
    color: '#e11d48',
    icon: '🎭',
    events: ['Dance Solo & Group', 'Classical & Western Singing', 'Mime Championship', 'Mono Action', 'Battle of Bands'],
    bgImage: '/culturals_bg.png'
  },
  {
    code: 'SPORTS',
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
    code: 'CREO',
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
    code: 'FETE',
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

        {/* ROW 2 (MIDDLE): Dates on Left (White), ₹10 Lakhs on Right (Black) in ONE Even Row */}
        <div className="hero-split-container hero-split-middle-row">

          {/* LEFT HALF: Pure White Canvas */}
          <div className="hero-half hero-half-light">
            {/* Save the Dates Block from Poster */}
            <div className="hero-dates-card">
              <span className="save-dates-label">SAVE THE DATES</span>
              <div className="dates-display">
                <span className="dates-highlight">7 • 8 • 9</span>
                <span className="month-highlight">JANUARY</span>
              </div>
            </div>
          </div>

          {/* RIGHT HALF: Deep Midnight Black Canvas */}
          <div className="hero-half hero-half-dark">
            {/* ₹10 Lakhs In Cash Prizes Text Heading (Transparent & Borderless) */}
            <div className="hero-prize-heading-block">
              <div className="prize-amount-title">
                <span className="prize-rupee">₹</span>
                <span className="prize-val">10 Lakhs</span>
              </div>
              <span className="prize-tagline">IN CASH PRIZES</span>
            </div>
          </div>

        </div>

        {/* ROW 3 (BOTTOM): Centered Action CTAs */}
        <div className="hero-bottom-actions-section">
          <div className="hero-center-actions">
            {/* Commented out Register button as requested
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
            */}

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
            {FEST_PILLARS.map((pillar, index) => (
              <LiquidGlass
                key={pillar.code}
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

                {/* Coordinator pill with telephone link matching poster */}
                <div className="pillar-coordinator-box">
                  <span className="coord-chip-label">Domain In-charge:</span>
                  <div className="coord-person-row">
                    <span className="coord-name">{pillar.coordinator}</span>
                    <a href={`tel:${pillar.phone}`} className="coord-phone-pill">
                      📞 {pillar.phone}
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

      {/* ─────────────────────────────────────────────────────────────
          CAMPUS & REGISTRATION CTA WITH QR CODE
          ───────────────────────────────────────────────────────────── */}
      <section className="fest-final-cta" id="register">
        <div className="container">
          <div className="final-cta-card">
            <div className="cta-left-details">
              <span className="section-tag">JOIN THE CELEBRATION</span>
              <h2 className="cta-title">
                Be Part of <span>Colours 2027</span>
              </h2>
              <p className="cta-desc">
                Don't miss the biggest national collegiate festival of 2027. Secure your student participation,
                represent your college contingent, and battle for the grand ₹10,00,000 prize pool!
              </p>

              <div className="cta-location-block">
                <span className="loc-icon">📍</span>
                <div className="loc-info">
                  <strong>Aditya University</strong>
                  <span>Aditya Nagar, ADB Road, Surampalem – 533437, Kakinada Dist., AP</span>
                </div>
              </div>

              <div className="cta-buttons-row">
                {/* Commented out Register Online Now button as requested
                {!student ? (
                  <button
                    type="button"
                    className="btn-hero-primary"
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('fest-open-auth-modal', { detail: { mode: 'register' } }));
                    }}
                  >
                    ✦ Register Online Now
                  </button>
                ) : (
                  <Link to="/events" className="btn-hero-primary">
                    ✦ Browse & Enter Events
                  </Link>
                )}
                */}
                <Link to="/contact" className="btn-hero-secondary">
                  ✉️ Hospitality & Support Desk
                </Link>
              </div>
            </div>

            {/* QR Code and Poster Card matching Poster Bottom */}
            <div className="cta-qr-card">
              <div className="poster-thumbnail-wrapper">
                <img
                  src="/colours_poster_theme.png"
                  alt="Colours 2027 Official Festival Poster"
                  className="poster-thumbnail-img"
                />
              </div>
              <div className="qr-info-block">
                <span className="qr-headline">SCAN OR VISIT</span>
                <span className="qr-url">adityauniversity.in/colours2027</span>
                <span className="qr-dates">7 • 8 • 9 JANUARY 2027</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </SplitBackground>
  );
}

export default Home;
