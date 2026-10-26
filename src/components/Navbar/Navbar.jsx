import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { getLoggedStudent, logoutStudent } from '../../services/api';
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
  const [student, setStudent] = useState(getLoggedStudent());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleAuth = () => setStudent(getLoggedStudent());
    window.addEventListener('fest-student-auth-change', handleAuth);
    return () => window.removeEventListener('fest-student-auth-change', handleAuth);
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

          {/* Register CTA & Logged in Student Info */}
          <div className="navbar-cta" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {student ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '4px 12px', borderRadius: '50px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                  👤 {student.name ? student.name.split(' ')[0] : 'Student'}
                </span>
                <button
                  type="button"
                  onClick={() => logoutStudent()}
                  style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', padding: '0 2px' }}
                  title="Log out student account"
                >
                  Logout
                </button>
              </div>
            ) : null}
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
        {student ? (
          <div style={{ padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: '12px', margin: '0.5rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#0f172a' }}>👤 {student.name}</span>
            <button
              type="button"
              onClick={() => {
                logoutStudent();
                closeMenu();
              }}
              style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer' }}
            >
              Logout
            </button>
          </div>
        ) : null}
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
