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
            <div className="uni-social-links">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">IG</a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">YT</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">IN</a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">X</a>
            </div>
          </div>
        </div>
      </div>

      <div className="uni-footer-bottom">
        <div className="container uni-bottom-row">
          <p>© 2027 Aditya University. All rights reserved. Colours 2027 Youth Festival.</p>
          <div className="uni-bottom-links">
            <Link to="/contact">Emergency Contact</Link>
            <span>•</span>
            <Link to="/invitation">Guidelines</Link>
            <span>•</span>
            <Link to="/events">Rules Book</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
