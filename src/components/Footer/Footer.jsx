import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const contacts = [
    { label: 'Culturals', name: 'Mr. P. Raju', phone: '8374245400' },
    { label: 'Sports', name: 'Dr. N. Ravi', phone: '9912393905' },
    { label: 'Creo', name: 'Dr. B. Srinivas', phone: '9866732745' },
    { label: 'Fete', name: 'Dr. K. Kishore', phone: '9490111222' },
  ];

  return (
    <footer className="uni-footer">
      <div className="uni-footer-top">
        <div className="container uni-footer-grid">
          {/* Left Half: Pure White Canvas (Brand & Domain Chairs) */}
          <div className="uni-footer-half uni-footer-left">
            {/* Brand & About */}
            <div className="uni-footer-col brand-col">
              <div className="uni-footer-logo-row">
                <div className="uni-crest-badge">AU</div>
                <div>
                  <h3 className="uni-footer-title">ADITYA UNIVERSITY</h3>
                  <span className="uni-footer-subtitle">COLOURS 2027 • NATIONAL YOUTH FESTIVAL</span>
                </div>
              </div>
              <p className="uni-footer-desc">
                Colours 2027 is Aditya University’s flagship National Level Cultural, Sports & Arts Festival,
                uniting 50+ premier universities and over 25,000+ student delegates with a grand ₹10,00,000 cash prize pool.
              </p>
              <div className="uni-footer-tags">
                <span className="uni-tag-pill gold">🏆 ₹10 Lakhs Cash Prizes</span>
                <span className="uni-tag-pill">Accredited A++</span>
                <span className="uni-tag-pill">7 • 8 • 9 January 2027</span>
              </div>
            </div>

            {/* Domain Incharges from Poster */}
            <div className="uni-footer-col chairs-col">
              <h4 className="uni-col-heading">Festival Domain Chairs</h4>
              <ul className="uni-chairs-list">
                {contacts.map((c) => (
                  <li key={c.label} className="uni-chair-item">
                    <span className="chair-badge">{c.label}</span>
                    <div className="chair-detail">
                      <span className="chair-person">{c.name}</span>
                      <a href={`tel:${c.phone}`} className="chair-tel">📞 {c.phone}</a>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Half: Pure Black Canvas (Portal Links & Campus/Social) */}
          <div className="uni-footer-half uni-footer-right">
            {/* Quick Navigation */}
            <div className="uni-footer-col portal-col">
              <h4 className="uni-col-heading">Festival Portal</h4>
              <ul className="uni-footer-links">
                <li><Link to="/">Home Overview</Link></li>
                <li><Link to="/events">Browse All Events</Link></li>
                <li><a href="/Schedule_of_Events.pdf" target="_blank" rel="noopener noreferrer">Events Schedule</a></li>
                <li><Link to="/invitation">Official Invitation Poster</Link></li>
                <li><Link to="/sponsors">Sponsors & Partners</Link></li>
                <li><Link to="/contact">Helpdesk & Support</Link></li>
              </ul>
            </div>

            {/* Campus Location & Social */}
            <div className="uni-footer-col contact-col">
              <h4 className="uni-col-heading">Campus & Venue</h4>
              <p className="uni-contact-item">
                <span className="uni-icon">📍</span>
                <span>Aditya Nagar, ADB Road, Surampalem, Kakinada District, AP – 533437</span>
              </p>
              <p className="uni-contact-item">
                <span className="uni-icon">✉️</span>
                <a href="mailto:colours@adityauniversity.in">colours@adityauniversity.in</a>
              </p>
              <p className="uni-contact-item">
                <span className="uni-icon">🌐</span>
                <a href="https://adityauniversity.in" target="_blank" rel="noreferrer">adityauniversity.in/colours2027</a>
              </p>

              <div className="uni-social-wrapper">
                <span className="uni-social-label">Follow Official Channels</span>
                <div className="uni-social-links">
                  <a href="https://www.facebook.com/adityauniversity9" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-btn facebook">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="https://x.com/adityauniv" target="_blank" rel="noreferrer" aria-label="Twitter / X" className="social-btn twitter">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://www.linkedin.com/school/adityauniversity" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-btn linkedin">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                  </a>
                  <a href="https://www.youtube.com/@adityauniversity" target="_blank" rel="noreferrer" aria-label="YouTube" className="social-btn youtube">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
