import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="uni-footer">
      <div className="uni-footer-top">
        <div className="container uni-footer-grid">
          {/* Brand & About */}
          <div className="uni-footer-col brand-col">
            <div className="uni-footer-logo-row">
              <div className="uni-crest-badge">AU</div>
              <div>
                <h3 className="uni-footer-title">ADITYA UNIVERSITY</h3>
                <span className="uni-footer-subtitle">COLOURS 2027 | NATIONAL YOUTH FEST</span>
              </div>
            </div>
            <p className="uni-footer-desc">
              Colours 2027 is Aditya University’s flagship National Level Cultural & Sports Festival,
              uniting over 50+ colleges and 25,000+ students in an exhilarating celebration of talent,
              art, athletics, and innovation.
            </p>
            <div className="uni-footer-tags">
              <span className="uni-tag-pill">Accredited A++</span>
              <span className="uni-tag-pill">Autonomous</span>
              <span className="uni-tag-pill">ESTD 1998</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="uni-footer-col">
            <h4 className="uni-col-heading">Festival Portal</h4>
            <ul className="uni-footer-links">
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/events">Browse All Events</Link></li>
              <li><Link to="/events-schedule">Events Schedule</Link></li>
              <li><Link to="/invitation">Official Invitation</Link></li>
              <li><Link to="/sponsors">Sponsors & Partners</Link></li>
              <li><Link to="/contact">Helpdesk & Contact</Link></li>
            </ul>
          </div>

          {/* Event Domains */}
          <div className="uni-footer-col">
            <h4 className="uni-col-heading">Event Categories</h4>
            <ul className="uni-footer-links">
              <li><Link to="/events/Sports%20%26%20Games/Basketball">Sports & Games</Link></li>
              <li><Link to="/events/Culturals/Dance">Culturals & Theatre</Link></li>
              <li><Link to="/events/Culturals/Singing">Music & Vocals</Link></li>
              <li><Link to="/events/Creo/Fashion%20Show">Creo Creative Arts</Link></li>
              <li><Link to="/events/Creo/Movie%20Making">Film & Photography</Link></li>
              <li><Link to="/events/Creo/Spot%20Painting">Fine Arts & Design</Link></li>
            </ul>
          </div>

          {/* University Campus & Contact */}
          <div className="uni-footer-col contact-col">
            <h4 className="uni-col-heading">Campus & Support</h4>
            <p className="uni-contact-item">
              <span className="uni-icon">📍</span>
              <span>Aditya Nagar, ADB Road, Surampalem, Kakinada District, AP – 533437</span>
            </p>
            <p className="uni-contact-item">
              <span className="uni-icon">✉️</span>
              <a href="mailto:colours@adityauniversity.in">colours@adityauniversity.in</a>
            </p>
            <p className="uni-contact-item">
              <span className="uni-icon">📞</span>
              <a href="tel:+919999999999">+91 99999 99999 / +91 99887 76655</a>
            </p>
            <div className="uni-social-wrapper">
              <span className="uni-social-label">Follow Us on</span>
              <div className="uni-social-links">
                <a
                  href="https://www.facebook.com/adityauniversity9"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                  className="social-btn facebook"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://x.com/adityauniv"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter / X"
                  className="social-btn twitter"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/school/adityauniversity"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="social-btn linkedin"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@adityauniversity"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="YouTube"
                  className="social-btn youtube"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
