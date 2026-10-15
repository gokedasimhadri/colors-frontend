import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  EVENT_START_DATE,
  EVENT_DATE_RAW,
  EVENT_DAYS,
  EVENT_DATE_FORMAL,
  EVENT_DATE_RANGE_SHORT,
  getDayShortDate,
} from '../../utils/eventDate';
import './Home.css';

// ─── Countdown Timer ─────────────────────────────────────────────────────────
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

// ─── Ticker ───────────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  'Cultural Performances', 'Sports Championships', 'Music Concerts',
  'Dance Competitions', 'Art Exhibitions', 'Drama & Theatre',
  'Stand-Up Comedy', 'Fashion Show', 'Literary Events',
  'Singing Competitions', 'Photography Contest',
];

// ─── Stats (below hero) ───────────────────────────────────────────────────────
const STATS = [
  { icon: '🎭', number: '100', plus: true, label: 'Events' },
  { icon: '🏫', number: '50', plus: true, label: 'Colleges' },
  { icon: '👥', number: '25K', plus: true, label: 'Students' },
  { icon: '🌟', number: '3', plus: false, label: 'Days of Fest' },
];

// ─── Big Description Stats ─────────────────────────────────────────────────────
const DESC_STATS = [
  { number: '50+', label: 'Colleges', color: '#e8005a' },
  { number: '100+', label: 'Events', color: '#7c3aed' },
  { number: '25000+', label: 'Students', color: '#0891b2' },
  { number: '35000+', label: 'Visitors', color: '#f59e0b' },
];

const EDITION_YEARS = ['Colours 2019', 'Colours 2020', 'Colours 2021', 'Colours 2022', 'Colours 2023', 'Colours 2024'];

// ─── Events ───────────────────────────────────────────────────────────────────
const FEATURED_EVENTS = [
  {
    id: 1, emoji: '🎭',
    bg: 'linear-gradient(135deg, #4a0030 0%, #9b1a6e 100%)',
    badge: 'cultural', badgeText: 'Cultural',
    title: 'Grand Drama Night',
    desc: 'Witness breath-taking theatrical performances by the most talented student actors.',
    date: getDayShortDate(1), venue: 'Main Auditorium',
  },
  {
    id: 2, emoji: '🎵',
    bg: 'linear-gradient(135deg, #1a0050 0%, #5a1ab0 100%)',
    badge: 'music', badgeText: 'Music',
    title: 'Battle of Bands',
    desc: 'Electrifying bands compete live on stage – rock, fusion, jazz and more.',
    date: getDayShortDate(2), venue: 'Open Air Stage',
  },
  {
    id: 3, emoji: '💃',
    bg: 'linear-gradient(135deg, #5a0025 0%, #c0305a 100%)',
    badge: 'dance', badgeText: 'Dance',
    title: 'Rhythms of India',
    desc: 'Classical to contemporary – dance forms from across the nation come alive.',
    date: getDayShortDate(3), venue: 'Dance Arena',
  },
  {
    id: 4, emoji: '⚽',
    bg: 'linear-gradient(135deg, #004030 0%, #007a50 100%)',
    badge: 'sports', badgeText: 'Sports',
    title: 'Inter-University Sports',
    desc: 'Championships across cricket, football, basketball, athletics and more.',
    date: EVENT_DATE_RANGE_SHORT, venue: 'Sports Complex',
  },
  {
    id: 5, emoji: '🎨',
    bg: 'linear-gradient(135deg, #503000 0%, #a06010 100%)',
    badge: 'art', badgeText: 'Art',
    title: 'Canvas Carnival',
    desc: 'Paintings, sculptures, digital art – a visual feast celebrating student creativity.',
    date: getDayShortDate(2), venue: 'Art Gallery',
  },
  {
    id: 6, emoji: '💻',
    bg: 'linear-gradient(135deg, #002050 0%, #0050a0 100%)',
    badge: 'tech', badgeText: 'Tech',
    title: '48hr Hackathon',
    desc: 'Code, collaborate and create. The ultimate technology challenge awaits.',
    date: getDayShortDate(3), venue: 'Tech Hub',
  },
];

// ─── Performers ───────────────────────────────────────────────────────────────
const PERFORMERS = [
  { avatar: '🎤', bg: 'linear-gradient(135deg,#9b1a6e,#e8005a)', name: 'Aria Melodics', type: 'Vocalist' },
  { avatar: '🥁', bg: 'linear-gradient(135deg,#2a0080,#7c3aed)', name: 'Beat Syndicate', type: 'Band' },
  { avatar: '💃', bg: 'linear-gradient(135deg,#7a0035,#e8005a)', name: 'Zara Moves', type: 'Dancer' },
  { avatar: '🎸', bg: 'linear-gradient(135deg,#004d33,#00a86b)', name: 'Riff Masters', type: 'Rock Band' },
  { avatar: '🎭', bg: 'linear-gradient(135deg,#6b3000,#d97706)', name: 'Stage Craft', type: 'Drama' },
  { avatar: '🎻', bg: 'linear-gradient(135deg,#003a6b,#0891b2)', name: 'Strings Alive', type: 'Classical' },
];

// ─── Schedule (3 days) ────────────────────────────────────────────────────────
const SCHEDULE_DAYS = EVENT_DAYS.map((d) => d.dayScheduleTitle);

const SCHEDULE_DATA = {
  0: [
    { time: '09:00 AM', name: 'Inaugural Ceremony', venue: 'Main Auditorium', tag: 'Ceremony' },
    { time: '11:00 AM', name: 'Painting Competition', venue: 'Art Gallery', tag: 'Art' },
    { time: '02:00 PM', name: 'Cricket Semi-Finals', venue: 'Cricket Ground', tag: 'Sports' },
    { time: '05:00 PM', name: 'Classical Dance Show', venue: 'Dance Arena', tag: 'Dance' },
    { time: '07:30 PM', name: 'Opening Music Night', venue: 'Open Air Stage', tag: 'Music' },
  ],
  1: [
    { time: '10:00 AM', name: 'Photography Walk', venue: 'Campus Grounds', tag: 'Art' },
    { time: '12:00 PM', name: 'Debate Championship', venue: 'Seminar Hall', tag: 'Literary' },
    { time: '02:30 PM', name: 'Battle of Bands (Semi)', venue: 'Open Air Stage', tag: 'Music' },
    { time: '05:00 PM', name: 'Football Quarter Finals', venue: 'Football Ground', tag: 'Sports' },
    { time: '08:00 PM', name: 'Stand-Up Comedy Night', venue: 'Amphitheatre', tag: 'Comedy' },
  ],
  2: [
    { time: '09:30 AM', name: 'Street Dance Battles', venue: 'Dance Arena', tag: 'Dance' },
    { time: '12:00 PM', name: 'Tech Talk Sessions', venue: 'Tech Hub', tag: 'Tech' },
    { time: '03:00 PM', name: 'Cricket Finals', venue: 'Cricket Ground', tag: 'Sports' },
    { time: '06:00 PM', name: 'Fashion Show', venue: 'Main Auditorium', tag: 'Fashion' },
    { time: '08:30 PM', name: 'Grand Closing Ceremony', venue: 'Main Auditorium', tag: 'Cultural' },
  ],
};

// ─── Gallery ──────────────────────────────────────────────────────────────────
const GALLERY = [
  { emoji: '🎭', bg: 'linear-gradient(135deg, #4a0030, #9b1a6e)', label: 'Drama Night 2024' },
  { emoji: '🎵', bg: 'linear-gradient(135deg, #1a0050, #5a1ab0)', label: 'Music Fest' },
  { emoji: '⚽', bg: 'linear-gradient(135deg, #004030, #007a50)', label: 'Sports Finals' },
  { emoji: '💃', bg: 'linear-gradient(135deg, #5a0025, #c0305a)', label: 'Dance Gala' },
  { emoji: '🎨', bg: 'linear-gradient(135deg, #503000, #a06010)', label: 'Art Walk' },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const { time, pulse } = useCountdown();
  const [activeDay, setActiveDay] = useState(0);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [activeYear, setActiveYear] = useState('Colours 2024');
  const heroRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = '/hero_bg.png';
    img.onload = () => setBgLoaded(true);
  }, []);

  return (
    <main>
      {/* ── HERO ── */}
      <section className="hero" ref={heroRef} id="hero">
        <div className={`hero-bg ${bgLoaded ? 'loaded' : ''}`} />
        <div className="hero-overlay" />
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-text">✦ Aditya University Presents</span>
              <span className="hero-year-badge">✦ 2027</span>
            </div>

            <h1 className="hero-title">
              <span className="gradient-text">COLOURS</span>
              <br />
              <span>2027</span>
            </h1>

            <p className="hero-subtitle">Where Talent Meets Triumph</p>

            <p className="hero-desc">
              Three electrifying days of cultural performances, sports championships,
              music concerts, drama nights, and memories that last a lifetime.
              The biggest fest in Aditya University's history.
            </p>

            <div className="hero-actions">
              <Link to="/events" className="btn-primary" id="hero-explore-btn">
                ✦ Explore Events
              </Link>
              <Link to="/events-schedule" className="btn-secondary" id="hero-schedule-btn">
                📅 View Schedule
              </Link>
            </div>
          </div>

          {/* Live Countdown Card */}
          <div className="hero-right">
            <div className="countdown-card">
              <div className="countdown-label">
                <span className="glow-dot" />
                Countdown to Fest
              </div>

              <div className="countdown-units">
                <div className="countdown-unit">
                  <div className={`countdown-number ${pulse ? 'pulse' : ''}`}>
                    {String(time.days).padStart(2, '0')}
                  </div>
                  <span className="countdown-unit-label">Days</span>
                </div>
                <div className="countdown-divider">:</div>
                <div className="countdown-unit">
                  <div className={`countdown-number ${pulse ? 'pulse' : ''}`}>
                    {String(time.hours).padStart(2, '0')}
                  </div>
                  <span className="countdown-unit-label">Hours</span>
                </div>
                <div className="countdown-divider">:</div>
                <div className="countdown-unit">
                  <div className={`countdown-number ${pulse ? 'pulse' : ''}`}>
                    {String(time.minutes).padStart(2, '0')}
                  </div>
                  <span className="countdown-unit-label">Mins</span>
                </div>
                <div className="countdown-divider">:</div>
                <div className="countdown-unit">
                  <div className={`countdown-number ${pulse ? 'pulse' : ''}`}>
                    {String(time.seconds).padStart(2, '0')}
                  </div>
                  <span className="countdown-unit-label">Secs</span>
                </div>
              </div>

              <div className="countdown-event-info">
                <div className="info-row">
                  <span className="info-icon">📅</span>
                  <span className="info-label">Date</span>
                  <span className="info-value">{EVENT_DATE_RAW}</span>
                </div>
                <div className="info-row">
                  <span className="info-icon">📍</span>
                  <span className="info-label">Venue</span>
                  <span className="info-value">Aditya University</span>
                </div>
                <div className="info-row">
                  <span className="info-icon">🎟️</span>
                  <span className="info-label">Entry</span>
                  <span className="info-value">Open for All</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="ticker-section" aria-hidden="true">
        <div className="ticker-inner">
          <div className="ticker-track">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="ticker-item">
                <span className="ticker-dot" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── DESCRIPTION SECTION (from screenshot) ── */}
      <section className="description-section" id="about" aria-label="About Colours 2027">
        <div className="container">
          <div className="description-inner">
            {/* Left – Text content */}
            <div className="description-left">
              <div className="description-festival-badge">
                ✦ A Festival of Non-Stop Entertainment
              </div>

              <h2 className="description-title">
                Colours <span className="highlight">2027</span>
              </h2>

              <div className="description-body">
                <p className="description-para">
                  Mark your calendars for Colours 2027, an international youth festival happening from{' '}
                  <span className="text-accent">{EVENT_DATE_FORMAL}</span>! Get ready for{' '}
                  <span className="text-accent">three days</span> of pure excitement at Colours 2027.
                  This vibrant celebration will be packed with non-stop entertainment, featuring{' '}
                  <span className="text-accent-purple">electrifying dance performances</span>,
                  soul-stirring music, dazzling cultural shows, and captivating art displays.
                </p>

                <p className="description-para">
                  From the rhythmic beats of traditional music to{' '}
                  <span className="text-accent">high-energy modern acts</span>, every moment of
                  Colours 2027 will be a feast for the senses. Experience the joy of unity as
                  performers from around the world come together to celebrate their cultures and talents.
                  Don't miss this incredible event filled with fun, laughter, and unforgettable memories.
                  Colours 2027 is where the world comes to celebrate{' '}
                  <span className="text-accent-purple">youth, diversity, and togetherness</span>!
                </p>
              </div>

              {/* Edition year pills */}
              <div className="edition-years" role="list" aria-label="Past editions">
                {EDITION_YEARS.map((year) => (
                  <button
                    key={year}
                    className={`edition-pill ${activeYear === year ? 'active-year' : ''}`}
                    onClick={() => setActiveYear(year)}
                    role="listitem"
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>

            {/* Right – Big stats grid */}
            <div className="description-stats">
              {DESC_STATS.map((s) => (
                <div
                  key={s.label}
                  className="desc-stat-card"
                  style={{ '--stat-color': s.color }}
                >
                  <div className="desc-stat-number">{s.number}</div>
                  <div className="desc-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="gradient-divider" />

      {/* ── FEATURED EVENTS ── */}
      <section className="events-section" id="events" aria-label="Featured events">
        <div className="container">
          <div className="section-header">
            <div className="section-header-left">
              <span className="section-tag">✦ Featured Events</span>
              <h2 className="section-title">
                What's <span>Happening</span>
              </h2>
              <p className="section-desc">
                From thrilling sports battles to mesmerising stage performances –
                there's something for everyone at Colours 2027.
              </p>
            </div>
            <Link to="/events" className="view-all-link" id="events-view-all-link">
              View All Events →
            </Link>
          </div>

          <div className="events-grid">
            {FEATURED_EVENTS.map((ev) => (
              <div key={ev.id} className="event-card" role="article">
                <div className="event-card-visual">
                  <div className="event-card-bg" style={{ background: ev.bg }} />
                  <span className="event-card-emoji">{ev.emoji}</span>
                  <span className={`event-card-badge badge-${ev.badge}`}>{ev.badgeText}</span>
                </div>
                <div className="event-card-body">
                  <h3 className="event-card-title">{ev.title}</h3>
                  <p className="event-card-desc">{ev.desc}</p>
                  <div className="event-card-meta">
                    <span className="event-meta-item">📅 {ev.date}</span>
                    <span className="event-meta-item">📍 {ev.venue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-section" aria-label="Festival statistics">
        <div className="container">
          <div className="stats-grid">
            {STATS.map((s) => (
              <div key={s.label} className="stat-card">
                <span className="stat-icon">{s.icon}</span>
                <div className="stat-number">
                  {s.number}
                  {s.plus && <span className="plus">+</span>}
                </div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERFORMERS ── */}
      <section className="performers-section" id="performers" aria-label="Featured performers">
        <div className="container">
          <div className="performers-grid">
            <div className="performers-info">
              <span className="section-tag">✦ Spotlight</span>
              <h2 className="section-title">
                Meet the <span>Performers</span>
              </h2>
              <p className="section-desc">
                Extraordinary talent from across the country comes together
                to create unforgettable performances on the grand stage.
              </p>
              <div className="performers-features">
                {['50+ Solo Performances', 'Inter-Dept Band Battles', 'Classical & Contemporary', 'Pro-Am Competitions'].map((f) => (
                  <div key={f} className="performers-feature">
                    <span className="feature-dot" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="performers-cards">
              {PERFORMERS.map((p) => (
                <div key={p.name} className="performer-card">
                  <div className="performer-avatar" style={{ background: p.bg }}>
                    {p.avatar}
                  </div>
                  <div className="performer-name">{p.name}</div>
                  <div className="performer-type">{p.type}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SCHEDULE PREVIEW ── */}
      <section className="schedule-section" id="schedule" aria-label="Events schedule preview">
        <div className="container">
          <div className="section-header">
            <div className="section-header-left">
              <span className="section-tag">✦ Schedule</span>
              <h2 className="section-title">
                3-Day <span>Lineup</span>
              </h2>
            </div>
            <Link to="/events-schedule" className="view-all-link" id="schedule-view-all-link">
              Full Schedule →
            </Link>
          </div>

          <div className="schedule-tabs" role="tablist">
            {SCHEDULE_DAYS.map((day, i) => (
              <button
                key={i}
                className={`schedule-tab ${activeDay === i ? 'active' : ''}`}
                onClick={() => setActiveDay(i)}
                role="tab"
                aria-selected={activeDay === i}
                id={`schedule-tab-${i}`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="schedule-list" role="tabpanel">
            {SCHEDULE_DATA[activeDay].map((item, i) => (
              <div key={i} className="schedule-item">
                <div className="schedule-time">{item.time}</div>
                <div className="schedule-event-info">
                  <div className="schedule-event-name">{item.name}</div>
                  <div className="schedule-event-venue">📍 {item.venue}</div>
                </div>
                <span className="schedule-event-tag">{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="gallery-section" id="gallery" aria-label="Event gallery">
        <div className="container">
          <span className="section-tag">✦ Memories</span>
          <h2 className="section-title">
            From Past <span>Editions</span>
          </h2>
          <div className="gallery-grid">
            {GALLERY.map((g, i) => (
              <div key={i} className="gallery-item">
                <div
                  className="gallery-item-inner"
                  style={{ background: g.bg, height: '100%', minHeight: i === 0 ? '400px' : '200px' }}
                >
                  <span style={{ fontSize: i === 0 ? '6rem' : '3rem' }}>{g.emoji}</span>
                </div>
                <div className="gallery-overlay">
                  <span className="gallery-overlay-text">{g.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPONSORS ── */}
      <section className="sponsors-section" aria-label="Our sponsors">
        <div className="container">
          <p className="sponsors-title">Proudly Supported By</p>
          <div className="sponsors-logos">
            {['NEXUS CORP', 'EDTECH PRO', 'STARLINK', 'CAMPUS CONNECT', 'INNOVATE HUB', 'FUTURA'].map((name) => (
              <div key={name} className="sponsor-logo" aria-label={name}>
                ◆ {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section" id="register" aria-label="Register call to action">
        <div className="cta-bg" />
        <div className="container">
          <div className="cta-content">
            <span className="section-tag">✦ Don't Miss Out</span>
            <h2 className="cta-title">
              Be Part of <span>History</span>
            </h2>
            <p className="cta-desc">
              Register now to secure your spot at the most spectacular
              university festival of 2027. Limited seats available!
            </p>
            <div className="cta-actions">
              <Link to="/events" className="btn-primary" id="cta-register-btn">
                ✦ Register Now
              </Link>
              <Link to="/contact" id="cta-contact-btn" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.85rem 2rem',
                background: 'transparent',
                color: 'var(--clr-primary)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '0.95rem',
                letterSpacing: '0.05em',
                border: '1.5px solid var(--clr-primary)',
                borderRadius: 'var(--radius-sm)',
                textDecoration: 'none',
                transition: 'all 0.35s ease',
              }}>
                ✉️ Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer" role="contentinfo">
        <div className="container">
          <div className="footer-inner">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                {/* Mini logo in footer */}
                <img
                  src="/university-logo.png"
                  alt="Aditya University"
                  style={{ height: 36, width: 'auto', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextSibling.style.display = 'flex';
                  }}
                />
                <div style={{
                  display: 'none', width: 32, height: 32,
                  background: 'linear-gradient(135deg, #e8005a, #7c3aed)',
                  borderRadius: 8, alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Bebas Neue, sans-serif', fontSize: '0.9rem', color: 'white',
                }}>AU</div>
                <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: '1.15rem', letterSpacing: '0.1em', color: '#0f0f1a' }}>
                  COLOURS <span style={{ color: '#e8005a' }}>2027</span>
                </span>
              </div>
              <p className="footer-brand-desc">
                The grand annual cultural and sports festival of Aditya University.
                Three days. Infinite memories. One stage.
              </p>
            </div>

            <div>
              <p className="footer-col-title">Navigate</p>
              <ul className="footer-links">
                {[['Home', '/'], ['Events', '/events'], ['Invitation', '/invitation'], ['Schedule', '/events-schedule']].map(([label, path]) => (
                  <li key={path}><Link to={path}>{label}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <p className="footer-col-title">Events</p>
              <ul className="footer-links">
                {['Cultural Shows', 'Sports Meets', 'Music Nights', 'Art & Drama', 'Tech Events'].map((item) => (
                  <li key={item}><Link to="/events">{item}</Link></li>
                ))}
              </ul>
            </div>

            <div>
              <p className="footer-col-title">Connect</p>
              <ul className="footer-links">
                {[['Sponsors', '/sponsors'], ['Contact Us', '/contact']].map(([label, path]) => (
                  <li key={path}><Link to={path}>{label}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copy">
              © 2027 <span>Colours 2027</span> · Aditya University. All rights reserved.
            </p>
            <div className="footer-social" aria-label="Social media links">
              {['📘', '📸', '🐦', '▶️'].map((icon, i) => (
                <a key={i} href="#" className="social-btn" aria-label={`Social ${i + 1}`}>{icon}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
