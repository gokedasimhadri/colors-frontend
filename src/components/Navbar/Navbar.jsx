import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import './Navbar.css';

const navItems = [
  { label: 'Home',            path: '/' },
  { label: 'Events',          path: '/events' },
  { label: 'Invitation',      path: '/invitation' },
  { label: 'Events Schedule', path: '/events-schedule' },
  { label: 'Sponsors',        path: '/sponsors' },
  { label: 'Contact',         path: '/contact' },
];

// ─────────────────────────────────────────────────────────────────────────────
// University Logo Component
// To use your real logo: place your image file at  public/university-logo.png
// The img tag below will display it. If the file is missing, the text fallback
// is shown automatically.
// ─────────────────────────────────────────────────────────────────────────────
function UniversityLogo() {
  const [imgError, setImgError] = useState(false);

  return (
    <Link to="/" className="navbar-logo" aria-label="Aditya University – Colours 2027 Home">
      {!imgError ? (
        <img
          src="/university-logo.png"
          alt="Aditya University"
          className="navbar-logo-img"
          onError={() => setImgError(true)}
        />
      ) : (
        /* Fallback when logo image is not yet provided */
        <div className="navbar-logo-fallback">
          <div className="logo-icon-circle">AU</div>
          <div className="logo-text-group">
            <span className="logo-main-text">
              COLOURS <span>2027</span>
            </span>
            <span className="logo-sub-text">Aditya University Fest</span>
          </div>
        </div>
      )}
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <nav
        className={`navbar ${scrolled ? 'scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="navbar-inner">
          {/* University Logo */}
          <UniversityLogo />

          {/* Desktop Nav Links */}
          <ul className="navbar-links">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Register CTA */}
          <div className="navbar-cta">
            <Link to="/events" className="btn-register" id="navbar-register-btn">
              ✦ Register Now
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} role="menu">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
            role="menuitem"
          >
            {item.label}
          </NavLink>
        ))}
        <Link
          to="/events"
          className="btn-register"
          onClick={closeMenu}
          style={{ textAlign: 'center', marginTop: '0.5rem' }}
        >
          ✦ Register Now
        </Link>
      </div>
    </>
  );
}
