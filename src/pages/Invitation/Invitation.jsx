import { Link } from 'react-router-dom';
import {
  EVENT_BADGE_TEXT,
  EVENT_DATE_FORMAL,
  getDayFullDate,
} from '../../utils/eventDate';
import './Invitation.css';

export default function Invitation() {
  const festChairs = [
    {
      category: 'CULTURALS',
      name: 'Mr. P. Raju',
      role: 'Chairperson – Cultural Arts',
      phone: '8374245400',
      email: 'raju.p@adityauniversity.in',
      icon: '🎭',
      color: '#ff007f'
    },
    {
      category: 'SPORTS',
      name: 'Dr. N. Ravi',
      role: 'Chairperson – Athletics & Games',
      phone: '9912393905',
      email: 'ravi.n@adityauniversity.in',
      icon: '🏆',
      color: '#00d2ff'
    },
    {
      category: 'CREO',
      name: 'Dr. B. Srinivas',
      role: 'Chairperson – Creative Arts & Media',
      phone: '9866732745',
      email: 'srinivas.b@adityauniversity.in',
      icon: '🎨',
      color: '#ffe600'
    },
    {
      category: 'FETE',
      name: 'Mr. J. D. Venkatesh',
      role: 'Chairperson – Carnival & Fete',
      phone: '7036266661',
      email: 'venkatesh.jd@adityauniversity.in',
      icon: '🎪',
      color: '#10b981'
    }
  ];

  const leadership = [
    {
      name: 'Dr. N. Sesha Reddy',
      role: 'Hon’ble Chairman',
      institution: 'Aditya University',
      quote: 'Colours represents the vibrant spirit of youth, leadership, artistic brilliance, and athletic perseverance.',
      avatar: '👑'
    },
    {
      name: 'Dr. M. Sreenivasa Reddy',
      role: 'Vice-Chancellor',
      institution: 'Aditya University',
      quote: 'We welcome student talent from universities nationwide to experience our grandest festival of 2027.',
      avatar: '🎓'
    },
    {
      name: 'Dr. K. Kishore',
      role: 'Convener – Colours 2027',
      institution: 'Aditya University',
      quote: 'Our stages, athletic tracks, and open-air arenas are primed to host an unforgettable collegiate spectacle.',
      avatar: '🌟'
    }
  ];

  const dignitaries = [
    {
      title: 'Chief Guest – Inaugural Ceremony',
      name: 'Padma Shri Awardee',
      field: 'Eminent Performing Artist & Cultural Icon',
      date: getDayFullDate(1, '09:30 AM'),
      venue: 'University Grand Amphitheatre'
    },
    {
      title: 'Celebrity Guest – Pro Musical Night',
      name: 'National Playback Singer & Band',
      field: 'Music Director & Live Concert Performer',
      date: getDayFullDate(2, '07:00 PM'),
      venue: 'Central Open Air Stage'
    },
    {
      title: 'Valedictory Guest – Prize Ceremony',
      name: 'Olympic Medalist Athlete',
      field: 'Indian Sports Personality',
      date: getDayFullDate(3, '05:00 PM'),
      venue: 'Main University Auditorium'
    }
  ];

  return (
    <div className="invitation-page-wrapper">
      {/* ── Official Poster & Royal Banner Hero ── */}
      <section className="invitation-hero">
        <div className="container text-center">
          <div className="invitation-crest-row">
            <div className="invitation-crest">AU</div>
            <span className="invitation-uni-label">ADITYA UNIVERSITY • ACCREDITED A++</span>
          </div>

          <span className="invitation-tagline">YOU'RE CORDIALLY INVITED TO</span>
          <h1 className="invitation-title">COLOURS 2027</h1>
          <p className="invitation-sub">
            A National Level Youth Festival • Culturals, Sports, Creo & Fete
          </p>

          <div className="invitation-dates-badge">
            <span className="badge-item">📅 {EVENT_BADGE_TEXT}</span>
            <span className="badge-sep">•</span>
            <span className="badge-item">🏆 ₹10 LAKHS IN CASH PRIZES</span>
            <span className="badge-sep">•</span>
            <span className="badge-item">📍 SURAMPALEM, AP</span>
          </div>
        </div>
      </section>

      {/* ── Poster Showcase Section ── */}
      <section className="invitation-poster-showcase-section">
        <div className="container">
          <div className="poster-showcase-grid">
            {/* Visual Poster Frame */}
            <div className="poster-frame-col">
              <div className="poster-frame-card">
                <img
                  src="/colours_poster_theme.png"
                  alt="Official Colours 2027 Invitation Poster"
                  className="official-poster-img"
                />
                <div className="poster-actions-row">
                  <a
                    href="/colours_poster_theme.png"
                    download="Colours2027_Official_Invitation_Poster.png"
                    className="btn-poster-action"
                  >
                    📥 Download Poster
                  </a>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="btn-poster-action"
                  >
                    🖨️ Print Invitation
                  </button>
                </div>
              </div>
            </div>

            {/* Formal Invitation Letter */}
            <div className="poster-letter-col">
              <div className="royal-letter-card">
                <div className="letter-header">
                  <span className="letter-salutation">To,</span>
                  <h3 className="letter-recipient">The Vice-Chancellors, Principals, Directors & Student Deans</h3>
                  <p className="letter-colleges">Universities & Colleges Across India</p>
                </div>

                <div className="letter-body">
                  <p>
                    <strong>Respected Leaders & Dear Student Delegates,</strong>
                  </p>
                  <p>
                    It gives us immense pleasure and pride to invite your esteemed institution to participate in
                    <strong> Colours 2027</strong>, the flagship National Youth Festival hosted by Aditya University
                    from <strong>{EVENT_DATE_FORMAL}</strong>.
                  </p>
                  <p>
                    Colours has grown into one of India’s most vibrant youth celebrations, uniting delegations from
                    over <strong>50+ universities</strong> and more than <strong>25,000 enthusiastic participants</strong>.
                    Spanning four grand domains — <strong>Culturals, Sports, Creo, and Fete</strong> — the festival offers
                    direct cash awards of over <strong>₹10,00,000</strong> along with championship merit cups.
                  </p>
                  <p>
                    We eagerly look forward to hosting your student contingent on our world-class campus in Surampalem, Kakinada.
                    Complimentary lodging, multi-cuisine meals, and seamless local transport have been arranged for all verified outstation delegations.
                  </p>
                </div>

                <div className="letter-footer">
                  <div className="letter-signature-block">
                    <span className="sign-title">Organizing Directorate</span>
                    <span className="sign-name">Colours 2027 Central Committee</span>
                    <span className="sign-uni">Aditya University, Andhra Pradesh</span>
                  </div>

                  <div className="letter-actions">
                    <Link to="/events" className="btn-royal-primary">
                      ✦ Register Your Contingent Now →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Official Domain Chairpersons from Poster ── */}
      <section className="invitation-chairs-section">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-tag">OFFICIAL DOMAIN CONTACTS</span>
            <h2 className="section-title">
              Festival Domain <span>Chairpersons</span>
            </h2>
            <p className="section-desc" style={{ margin: '0 auto' }}>
              Direct contact coordinates for departmental contingencies as announced on the official invitation poster.
            </p>
          </div>

          <div className="chairs-grid">
            {festChairs.map((chair) => (
              <div
                key={chair.category}
                className="chair-contact-card"
                style={{ '--chair-accent': chair.color }}
              >
                <div className="chair-top">
                  <span className="chair-icon">{chair.icon}</span>
                  <span className="chair-cat-pill">{chair.category}</span>
                </div>
                <h3 className="chair-name">{chair.name}</h3>
                <span className="chair-role">{chair.role}</span>

                <div className="chair-contact-box">
                  <a href={`tel:${chair.phone}`} className="chair-phone-btn">
                    📞 Call: {chair.phone}
                  </a>
                  <a href={`mailto:${chair.email}`} className="chair-email-link">
                    ✉️ {chair.email}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Leadership Messages ── */}
      <section className="invitation-patrons-section">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-tag">PATRONS & LEADERSHIP</span>
            <h2 className="section-title">
              Messages from <span>Management</span>
            </h2>
          </div>

          <div className="patrons-grid">
            {leadership.map((item, idx) => (
              <div key={idx} className="patron-card">
                <div className="patron-avatar">{item.avatar}</div>
                <h4 className="patron-name">{item.name}</h4>
                <span className="patron-role">{item.role}</span>
                <span className="patron-inst">{item.institution}</span>
                <p className="patron-quote">"{item.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dignitaries & Chief Guests ── */}
      <section className="invitation-dignitaries-section">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-tag">HONORED GUESTS</span>
            <h2 className="section-title">
              Keynotes & <span>Celebrities</span>
            </h2>
          </div>

          <div className="dignitaries-grid">
            {dignitaries.map((guest, idx) => (
              <div key={idx} className="dignitary-card">
                <div className="dignitary-tag">{guest.title}</div>
                <h3 className="dignitary-name">{guest.name}</h3>
                <p className="dignitary-field">{guest.field}</p>
                <div className="dignitary-meta">
                  <span>📅 {guest.date}</span>
                  <span>📍 {guest.venue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Outstation Contingent Support ── */}
      <section className="invitation-hospitality-section">
        <div className="container">
          <div className="hospitality-card">
            <div className="hosp-text">
              <span className="section-tag">DELEGATION HOSPITALITY</span>
              <h3>Outstation Contingent Support</h3>
              <p>
                Free campus hostel lodging, hygienic multi-cuisine dining, and 24x7 transit shuttles from
                Samalkot Junction & Kakinada Town railway stations are extended to all registered college delegations.
              </p>
            </div>
            <div className="hosp-buttons">
              <Link to="/contact" className="btn-royal-primary">
                Contact Hospitality Desk
              </Link>
              <Link to="/events-schedule" className="btn-royal-outline">
                View Schedule Protocol
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
