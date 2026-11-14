import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Mail } from 'lucide-react';
import VibgyorText from '../ThemeComponents/VibgyorText/VibgyorText';
import './Footer.css';

export default function Footer() {
  const [imgError, setImgError] = useState(false);
  const location = useLocation();

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <footer className="uni-footer">
      <div className="uni-footer-top">
        <div className="uni-footer-grid">
          {/* Left Half: Pure Black Canvas (Brand & About) */}
          <div className="uni-footer-half uni-footer-left">
            {/* Brand & About */}
            <div className="uni-footer-col brand-col">
              <div className="uni-footer-logo-row">
                <Link
                  to="/"
                  onClick={handleHomeClick}
                  className="uni-footer-brand-lockup"
                  aria-label="Aditya University – Colours 2027"
                >
                  {!imgError ? (
                    <img
                      src="/aus-logo.svg"
                      alt="Aditya University"
                      className="uni-footer-logo-img"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <span className="uni-footer-logo-fallback">ADITYA UNIVERSITY</span>
                  )}
                  <span className="uni-footer-vr" aria-hidden="true" />
                  <span className="uni-footer-fest-text">COLOURS 2027</span>
                </Link>
              </div>
              <p className="uni-footer-desc">
                Over 50 prestigious colleges 25,000 student delegates participate in Aditya University's National Level Youth Festival Cultural, Sports, and Arts, Colors 2027, which offers a hefty ₹10,000,000 cash prize pool.
              </p>
            </div>
          </div>

          {/* Right Half: Pure White Canvas (Portal Links & Campus/Social) */}
          <div className="uni-footer-half uni-footer-right">
            <div className="uni-footer-columns-group">
              {/* Quick Navigation */}
              <div className="uni-footer-col portal-col">
                <h4 className="uni-col-heading">Explore The Fest</h4>
                <ul className="uni-footer-links">
                  <li><VibgyorText to="/" showActive={false} onClick={handleHomeClick}>Home</VibgyorText></li>
                  <li><VibgyorText to="/events" showActive={false}>Events Lineup</VibgyorText></li>
                  <li><VibgyorText href="/Schedule_of_Events.pdf" target="_blank" rel="noopener noreferrer">Program Schedule</VibgyorText></li>
                  <li><VibgyorText to="/invitation" showActive={false}>Fest Invite</VibgyorText></li>
                  <li><VibgyorText to="/sponsors" showActive={false}>Brand Partners</VibgyorText></li>
                  <li><VibgyorText to="/contact" showActive={false}>Helpdesk & Support</VibgyorText></li>
                </ul>
              </div>

              {/* Campus Location & Social */}
              <div className="uni-footer-col contact-col">
                <h4 className="uni-col-heading">Where To Find Us</h4>
                <p className="uni-contact-item">
                  <MapPin size={18} className="uni-contact-icon" aria-hidden="true" />
                  <span>Aditya Nagar, ADB Road, Surampalem, Kakinada District, AP – 533437</span>
                </p>
                <p className="uni-contact-item">
                  <Mail size={18} className="uni-contact-icon" aria-hidden="true" />
                  <VibgyorText href="mailto:colours@adityauniversity.in">colours@adityauniversity.in</VibgyorText>
                </p>

                {/* Social channels (Desktop only: inside contact-col) */}
                <div className="uni-social-wrapper desktop-only-social">
                  <span className="uni-social-label">Follow Official Channels</span>
                  <div className="uni-social-links">
                    <a href="https://www.facebook.com/adityauniversity9" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-btn facebook">
                      <span className="social-icon icon-facebook" aria-hidden="true" />
                    </a>
                    <a href="https://x.com/adityauniv" target="_blank" rel="noreferrer" aria-label="Twitter / X" className="social-btn twitter">
                      <span className="social-icon icon-twitter" aria-hidden="true" />
                    </a>
                    <a href="https://www.linkedin.com/school/adityauniversity" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-btn linkedin">
                      <span className="social-icon icon-linkedin" aria-hidden="true" />
                    </a>
                    <a href="https://www.youtube.com/@adityauniversity" target="_blank" rel="noreferrer" aria-label="YouTube" className="social-btn youtube">
                      <span className="social-icon icon-youtube" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Social channels (Mobile only: separate full row at the bottom) */}
            <div className="uni-social-wrapper mobile-only-social">
              <span className="uni-social-label">Follow Official Channels</span>
              <div className="uni-social-links">
                <a href="https://www.facebook.com/adityauniversity9" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-btn facebook">
                  <span className="social-icon icon-facebook" aria-hidden="true" />
                </a>
                <a href="https://x.com/adityauniv" target="_blank" rel="noreferrer" aria-label="Twitter / X" className="social-btn twitter">
                  <span className="social-icon icon-twitter" aria-hidden="true" />
                </a>
                <a href="https://www.linkedin.com/school/adityauniversity" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="social-btn linkedin">
                  <span className="social-icon icon-linkedin" aria-hidden="true" />
                </a>
                <a href="https://www.youtube.com/@adityauniversity" target="_blank" rel="noreferrer" aria-label="YouTube" className="social-btn youtube">
                  <span className="social-icon icon-youtube" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Navy Canvas (#0D233B) */}
      <div className="uni-footer-bottom">
        <div className="uni-footer-bottom-inner">
          <p className="uni-footer-copyright">
            © 2027 Aditya University . All Rights Reserved . <span className="credits-highlight">Colours 2027</span>
          </p>
          <p className="uni-footer-credits">
            Design and Developed by <span className="credits-highlight">IT Applications</span>
          </p>
        </div>
      </div>
    </footer >
  );
}
