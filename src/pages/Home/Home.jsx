import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getLoggedStudent } from '../../services/api';
import {
  EVENT_START_DATE,
  EVENT_DAYS,
  EVENT_DATE_FORMAL,
  getDayShortDate,
} from '../../utils/eventDate';
import './Home.css';

// ─── Countdown Timer Hook ───────────────────────────────────────────────────
const EVENT_DATE = EVENT_START_DATE;

function useCountdown() {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = EVENT_DATE - new Date();
      if (diff <= 0) return;
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
      setPulse(true);
      setTimeout(() => setPulse(false), 300);
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, []);

  return { time, pulse };
}

// ─── Ticker Items ───────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  '₹10 Lakhs in Cash Prizes',
  'Culturals: Singing, Dance, Mime & Theatre',
  'Sports: Athletics, Volleyball, Basketball & Cricket',
  'Creo: Fashion Show, Spot Painting & Film Making',
  'Fete: Carnival Games, Food Fiesta & E-Sports',
  '7 • 8 • 9 January 2027',
  'Aditya University Surampalem',
  '50+ Universities & Colleges',
  '25,000+ Student Delegates',
];

// ─── The 4 Pillars from the Official Poster ─────────────────────────────────
const FEST_PILLARS = [
  {
    code: 'CULTURALS',
    name: 'Culturals',
    tagline: 'Music, Dance, Theatre & Expressions',
    coordinator: 'Mr. P. Raju',
    phone: '8374245400',
    color: '#ff007f',
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
    color: '#00d2ff',
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
    color: '#ffe600',
    icon: '🎨',
    events: ['Ethnic & Modern Runway', 'Spot Painting Contest', 'Treasure Quest', 'Short Film Making', 'Mobile Photography'],
    bgImage: '/creo_bg.png'
  },
  {
    code: 'FETE',
    name: 'Fete',
    tagline: 'Carnival, Food Fiesta, Stalls & Games',
    coordinator: 'Mr. J. D. Venkatesh',
    phone: '7036266661',
    color: '#10b981',
    icon: '🎪',
    events: ['Carnival Fun Stalls', 'Food Truck Arena', 'E-Sports Showdown', 'Open Mic Jamming', 'Cosplay Gala'],
    bgImage: '/hero_bg.png'
  }
];

// ─── Schedule (3 Days) ──────────────────────────────────────────────────────
const SCHEDULE_DAYS = EVENT_DAYS.map((d) => d.dayScheduleTitle);

const SCHEDULE_DATA = {
  0: [
    { time: '09:00 AM', name: 'Grand Inaugural Ceremony & Lamp Lighting', venue: 'Main University Amphitheatre', tag: 'Ceremony', track: 'CULTURALS' },
    { time: '11:00 AM', name: 'Inter-College Athletics Prelims & Field Events', venue: 'Olympic Athletic Stadium', tag: 'Sports', track: 'SPORTS' },
    { time: '02:00 PM', name: 'Spot Painting & Fine Arts Canvas Carnival', venue: 'Fine Arts Studio Block', tag: 'Creo', track: 'CREO' },
    { time: '04:30 PM', name: 'Carnival Fiesta & Open Mic Acoustic Jam', venue: 'Campus Central Quad', tag: 'Fete', track: 'FETE' },
    { time: '07:00 PM', name: 'Opening Pro-Night Musical Concert', venue: 'Grand Open Air Stage', tag: 'Music', track: 'CULTURALS' },
  ],
  1: [
    { time: '09:30 AM', name: 'Volleyball & Basketball Championship Knockouts', venue: 'Outdoor Sports Complex', tag: 'Sports', track: 'SPORTS' },
    { time: '11:30 AM', name: 'Classical & Western Solo Singing Showdown', venue: 'University Auditorium Stage A', tag: 'Cultural', track: 'CULTURALS' },
    { time: '02:00 PM', name: 'Campus Treasure Hunt Quest', venue: 'University Landmark Zones', tag: 'Creo', track: 'CREO' },
    { time: '05:00 PM', name: 'Group Dance & Folk Fusion Battles', venue: 'Open Air Amphitheatre', tag: 'Dance', track: 'CULTURALS' },
    { time: '08:00 PM', name: 'Stand-Up Comedy & Mime Gala Night', venue: 'Central Auditorium', tag: 'Comedy', track: 'CULTURALS' },
  ],
  2: [
    { time: '09:30 AM', name: '4x100m Sprint Relay & Sports Final Showdowns', venue: 'Olympic Athletic Stadium', tag: 'Sports', track: 'SPORTS' },
    { time: '11:30 AM', name: 'E-Sports Gaming Finals & Short Film Screening', venue: 'Multimedia Tech Hub', tag: 'Fete', track: 'FETE' },
    { time: '02:30 PM', name: 'Ethnic & Modern Runway Fashion Show', venue: 'Grand Ramp Auditorium', tag: 'Fashion', track: 'CREO' },
    { time: '06:00 PM', name: 'Grand Valedictory & ₹10 Lakhs Prize Distribution', venue: 'Main Auditorium', tag: 'Awards', track: 'ALL' },
    { time: '08:30 PM', name: 'Celebrity DJ Blast & Colours 2027 Farewell', venue: 'Open Air Grounds', tag: 'Pro Night', track: 'ALL' },
  ],
};

// ─── Memories Gallery ───────────────────────────────────────────────────────
const GALLERY = [
  { emoji: '🎭', bg: 'linear-gradient(135deg, #4a0030, #9b1a6e)', label: 'Drama & Mime Nights' },
  { emoji: '🎵', bg: 'linear-gradient(135deg, #1a0050, #5a1ab0)', label: 'Battle of Bands Live' },
  { emoji: '⚽', bg: 'linear-gradient(135deg, #004030, #007a50)', label: 'Inter-College Athletics' },
  { emoji: '💃', bg: 'linear-gradient(135deg, #5a0025, #c0305a)', label: 'Dance Mega Championship' },
  { emoji: '🎨', bg: 'linear-gradient(135deg, #503000, #a06010)', label: 'Creative Runway & Arts' },
];

export default function Home() {
  const { time, pulse } = useCountdown();
  const [activeDay, setActiveDay] = useState(0);
  const heroRef = useRef(null);

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
    <main className="colours-home-main">
      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION: Split Dual-Tone Canvas with Powder Burst
          Faithful recreation of the official poster design
          ───────────────────────────────────────────────────────────── */}
      <section className="fest-split-hero" ref={heroRef} id="hero">
        <div className="hero-split-container">
          
          {/* LEFT HALF: Pure White Canvas */}
          <div className="hero-half hero-half-light">
            {/* Top Emblem & Institution */}
            <div className="hero-institution-row">
              <div className="au-golden-crest">
                <span className="crest-inner">AU</span>
              </div>
              <div className="au-inst-text">
                <span className="au-gold-title">ADITYA UNIVERSITY</span>
                <span className="au-gold-invite">YOU'RE INVITED TO</span>
              </div>
            </div>

            {/* Split "COLOURS" Title: "COL" in solid black on white */}
            <div className="hero-title-box">
              <h1 className="hero-split-heading">
                <span className="text-col">COL</span>
                <span className="text-ours-ghost">OURS</span>
              </h1>
              <p className="hero-fest-tagline">
                A NATIONAL LEVEL YOUTH FESTIVAL
              </p>
            </div>

            {/* Save the Dates Block from Poster */}
            <div className="hero-dates-card">
              <span className="save-dates-label">SAVE THE DATES</span>
              <div className="dates-display">
                <span className="dates-highlight">7 • 8 • 9</span>
                <span className="month-highlight">JANUARY 2027</span>
              </div>
              <p className="hero-dates-campus">
                📍 Aditya University Campus, Surampalem, Kakinada Dist.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="hero-light-actions">
              <Link to="/events" className="btn-hero-primary" id="hero-explore-btn">
                <span>✦ Explore Events</span>
              </Link>
              <Link to="/invitation" className="btn-hero-secondary" id="hero-invitation-btn">
                <span>📄 View Official Poster</span>
              </Link>
            </div>
          </div>

          {/* CENTER SPLATTER: 3D Color Burst Graphic */}
          <div className="hero-center-splatter-wrapper" aria-hidden="true">
            <div className="splatter-glow-halo" />
            <img
              src="/colours_poster_theme.png"
              alt="Colours 2027 Official Theme Splatter"
              className="hero-center-poster-img"
            />
          </div>

          {/* RIGHT HALF: Deep Midnight Black Canvas */}
          <div className="hero-half hero-half-dark">
            {/* Split "COLOURS" Title continuation: "OURS" in pure white */}
            <div className="hero-dark-header">
              <div className="hero-title-continuation">
                <span className="text-ours-real">OURS</span>
              </div>
              <div className="fest-national-pill">
                <span>2027 EDITION</span>
              </div>
            </div>

            {/* ₹10 Lakhs Cash Prize Card from Poster */}
            <div className="hero-prize-card">
              <div className="prize-badge-glow">
                <span className="prize-symbol">₹</span>
                <span className="prize-number">10 Lakhs</span>
              </div>
              <div className="prize-caption">IN CASH PRIZES</div>
              <p className="prize-sub">
                Massive cash awards, national merit trophies & university honors across Culturals, Sports, Creo & Fete!
              </p>
            </div>

            {/* Live Interactive Countdown Timer */}
            <div className="hero-countdown-box">
              <div className="countdown-label-row">
                <span className="glow-neon-dot" />
                <span>COUNTDOWN TO INAUGURATION</span>
              </div>

              <div className="countdown-neon-grid">
                <div className="countdown-unit">
                  <div className={`countdown-val ${pulse ? 'pulse' : ''}`}>
                    {String(time.days).padStart(2, '0')}
                  </div>
                  <span className="countdown-lbl">DAYS</span>
                </div>
                <div className="countdown-sep">:</div>
                <div className="countdown-unit">
                  <div className={`countdown-val ${pulse ? 'pulse' : ''}`}>
                    {String(time.hours).padStart(2, '0')}
                  </div>
                  <span className="countdown-lbl">HOURS</span>
                </div>
                <div className="countdown-sep">:</div>
                <div className="countdown-unit">
                  <div className={`countdown-val ${pulse ? 'pulse' : ''}`}>
                    {String(time.minutes).padStart(2, '0')}
                  </div>
                  <span className="countdown-lbl">MINS</span>
                </div>
                <div className="countdown-sep">:</div>
                <div className="countdown-unit">
                  <div className={`countdown-val ${pulse ? 'pulse' : ''}`}>
                    {String(time.seconds).padStart(2, '0')}
                  </div>
                  <span className="countdown-lbl">SECS</span>
                </div>
              </div>
            </div>

            {/* Fast Register & Schedule CTA */}
            <div className="hero-dark-actions">
              {!student ? (
                <button
                  type="button"
                  className="btn-hero-gold"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('fest-open-auth-modal', { detail: { mode: 'login' } }));
                  }}
                >
                  ✦ Register / Login Now
                </button>
              ) : (
                <Link to="/dashboard" className="btn-hero-gold">
                  ✦ Open Student Dashboard
                </Link>
              )}
              <Link to="/events-schedule" className="btn-hero-dark-outline">
                📅 3-Day Schedule
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── TICKER TAPE ── */}
      <div className="fest-ticker-bar" aria-hidden="true">
        <div className="ticker-track-wrapper">
          <div className="ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="ticker-badge">
                <span className="ticker-splat">✦</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          FOUR MAIN FESTIVAL DOMAINS (FROM OFFICIAL POSTER)
          CULTURALS • SPORTS • CREO • FETE
          ───────────────────────────────────────────────────────────── */}
      <section className="fest-pillars-section" id="pillars">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-tag">OFFICIAL FESTIVAL DOMAINS</span>
            <h2 className="section-title">
              Four Arenas of <span>Glory</span>
            </h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Competitions span 4 major tracks, supervised by dedicated university chairpersons with a total cash pool of ₹10,00,000.
            </p>
          </div>

          <div className="pillars-grid">
            {FEST_PILLARS.map((pillar) => (
              <div
                key={pillar.code}
                className="pillar-card"
                style={{ '--pillar-accent': pillar.color }}
              >
                <div className="pillar-header">
                  <span className="pillar-icon">{pillar.icon}</span>
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
                  <Link
                    to={`/events`}
                    className="btn-pillar-explore"
                  >
                    Check Out {pillar.name} Events →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          ₹10 LAKHS MEGA CASH PRIZES SHOWCASE
          ───────────────────────────────────────────────────────────── */}
      <section className="fest-cash-showcase">
        <div className="container">
          <div className="cash-showcase-card">
            <div className="cash-glow-orb" />
            <div className="cash-showcase-content">
              <span className="cash-pill-tag">🏆 OFFICIAL PRIZE POOL</span>
              <h2 className="cash-grand-title">
                ₹10,00,000+ <span>in Cash Rewards</span>
              </h2>
              <p className="cash-lead-text">
                Compete against South India’s finest talent. Aditya University awards direct cash rewards,
                championship trophies, and national certificates across every single event category.
              </p>

              <div className="cash-perks-row">
                <div className="cash-perk">
                  <span className="perk-icon">💰</span>
                  <span className="perk-title">Instant Cash Awards</span>
                  <span className="perk-desc">Presented at the Grand Valedictory ceremony on 9th Jan</span>
                </div>
                <div className="cash-perk">
                  <span className="perk-icon">🥇</span>
                  <span className="perk-title">National Merit Cups</span>
                  <span className="perk-desc">Prestigious rolling trophies for champion college delegations</span>
                </div>
                <div className="cash-perk">
                  <span className="perk-icon">📜</span>
                  <span className="perk-title">Authenticated Certificates</span>
                  <span className="perk-desc">University-sealed participation & merit credentials</span>
                </div>
              </div>

              <div className="cash-actions-row">
                <Link to="/events" className="btn-hero-primary">
                  ✦ Register Your Contingent Now
                </Link>
                <Link to="/invitation" className="btn-hero-secondary">
                  📄 Read Official Invitation Letter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          FESTIVAL 3-DAY SCHEDULE
          ───────────────────────────────────────────────────────────── */}
      <section className="fest-schedule-section" id="schedule">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-tag">3-DAY FESTIVAL ITINERARY</span>
            <h2 className="section-title">
              The <span>Lineup</span>
            </h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Mark your schedule for three action-packed days on Aditya University’s state-of-the-art campus.
            </p>
          </div>

          <div className="schedule-day-tabs">
            {SCHEDULE_DAYS.map((dayTitle, i) => (
              <button
                key={i}
                type="button"
                className={`schedule-tab-btn ${activeDay === i ? 'active' : ''}`}
                onClick={() => setActiveDay(i)}
              >
                <span className="tab-circle">{i + 1}</span>
                <span>{dayTitle}</span>
              </button>
            ))}
          </div>

          <div className="schedule-timeline-grid">
            {SCHEDULE_DATA[activeDay].map((item, idx) => (
              <div key={idx} className="timeline-card">
                <div className="timeline-time-col">
                  <span className="timeline-clock">⏰ {item.time}</span>
                  <span className={`timeline-track-pill ${item.track.toLowerCase()}`}>
                    {item.track}
                  </span>
                </div>
                <div className="timeline-info-col">
                  <h4 className="timeline-event-name">{item.name}</h4>
                  <p className="timeline-venue">📍 {item.venue}</p>
                </div>
                <div className="timeline-tag-col">
                  <span className="event-type-chip">{item.tag}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: '2.5rem' }}>
            <Link to="/events-schedule" className="btn-hero-secondary">
              View Complete Detailed Schedule →
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          MEMORIES & GALLERY
          ───────────────────────────────────────────────────────────── */}
      <section className="fest-memories-section" id="gallery">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-tag">FESTIVAL LEGACY</span>
            <h2 className="section-title">
              Moments That <span>Inspire</span>
            </h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              From legendary pro-nights to breathless track sprint finishes, celebrate the unforgettable energy of Colours.
            </p>
          </div>

          <div className="memories-grid">
            {GALLERY.map((g, i) => (
              <div key={i} className="memory-card">
                <div className="memory-card-inner" style={{ background: g.bg }}>
                  <span className="memory-emoji">{g.emoji}</span>
                  <div className="memory-overlay">
                    <span className="memory-label">{g.label}</span>
                  </div>
                </div>
              </div>
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
    </main>
  );
}
