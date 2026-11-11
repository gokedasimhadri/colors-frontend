import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getLoggedStudent } from '../../services/api';
import { EVENT_START_DATE } from '../../utils/eventDate';
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
  '7 • 8 • 9 January 2027',
  'Aditya University Surampalem',
  '50+ Universities & Colleges',
  '25,000+ Student Delegates',
];

// ─── The 3 Pillars from the Official Poster ─────────────────────────────────
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
  }
];

export default function Home() {
  const { time, pulse } = useCountdown();
  const heroRef = useRef(null);

  const [student, setStudent] = useState(getLoggedStudent());
  const [posterOffsetX, setPosterOffsetX] = useState(0);
  const [isDraggingPoster, setIsDraggingPoster] = useState(false);
  const posterDragRef = useRef({
    active: false,
    startX: 0,
    startOffset: 0,
    maxOffset: 380,
  });

  const clampPosterOffset = (value, max) => Math.max(-max, Math.min(max, value));

  const handlePosterPointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    const heroWidth = heroRef.current?.clientWidth || window.innerWidth;
    const cardWidth = e.currentTarget.offsetWidth || 420;
    const maxOffset = Math.max(180, Math.round((heroWidth - cardWidth) / 2) - 24);

    posterDragRef.current = {
      active: true,
      startX: e.clientX,
      startOffset: posterOffsetX,
      maxOffset,
    };
    setIsDraggingPoster(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePosterPointerMove = (e) => {
    if (!posterDragRef.current.active) return;
    const deltaX = e.clientX - posterDragRef.current.startX;
    setPosterOffsetX(
      clampPosterOffset(posterDragRef.current.startOffset + deltaX, posterDragRef.current.maxOffset)
    );
  };

  const handlePosterPointerEnd = (e) => {
    if (!posterDragRef.current.active) return;
    posterDragRef.current.active = false;
    setIsDraggingPoster(false);
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
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

          {/* CENTER SPLATTER: Interactive Horizontal Draggable Poster Card */}
          <div
            className={`hero-center-splatter-wrapper ${isDraggingPoster ? 'dragging' : ''}`}
            style={{ transform: `translate(calc(-50% + ${posterOffsetX}px), -50%)` }}
            onPointerDown={handlePosterPointerDown}
            onPointerMove={handlePosterPointerMove}
            onPointerUp={handlePosterPointerEnd}
            onPointerCancel={handlePosterPointerEnd}
            onDoubleClick={() => setPosterOffsetX(0)}
            role="slider"
            aria-label="Drag poster card left or right"
            aria-valuemin={-400}
            aria-valuemax={400}
            aria-valuenow={Math.round(posterOffsetX)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft') setPosterOffsetX((prev) => Math.max(-380, prev - 40));
              if (e.key === 'ArrowRight') setPosterOffsetX((prev) => Math.min(380, prev + 40));
              if (e.key === 'Home' || e.key === '0') setPosterOffsetX(0);
            }}
            title="Drag left or right with mouse • Double-click to recenter"
          >
            <div className="splatter-glow-halo" />
            <img
              src="/colours_poster_theme.png"
              alt="Colours 2027 Official Theme Splatter"
              className="hero-center-poster-img"
              draggable={false}
            />
            <div className="hero-poster-drag-hint">
              <span>⇄ Drag Left or Right</span>
            </div>
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
                Massive cash awards, national merit trophies & university honors across Culturals, Sports & Creo!
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
              <a
                href="/Schedule_of_Events.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hero-dark-outline"
              >
                📅 3-Day Schedule
              </a>
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
          THREE MAIN FESTIVAL DOMAINS (FROM OFFICIAL POSTER)
          CULTURALS • SPORTS • CREO
          ───────────────────────────────────────────────────────────── */}
      <section className="fest-pillars-section" id="pillars">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-tag">OFFICIAL FESTIVAL DOMAINS</span>
            <h2 className="section-title">
              Three Arenas of <span>Glory</span>
            </h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Competitions span 3 major tracks, supervised by dedicated university chairpersons with a total cash pool of ₹10,00,000.
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
