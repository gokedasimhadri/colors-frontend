import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { getLoggedStudent, logoutStudent } from '../../services/api';
import StudentAuthModal from '../RegistrationModals/StudentAuthModal';
import './Navbar.css';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Events', path: '/events' },
  { label: 'Invitation', path: '/invitation' },
  { label: 'Events Schedule', path: '/events-schedule' },
  { label: 'Sponsors', path: '/sponsors' },
  { label: 'Contact', path: '/contact' },
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
          src="/ADITYA LOGO2.png"
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
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [student, setStudent] = useState(getLoggedStudent());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleAuth = () => setStudent(getLoggedStudent());
    window.addEventListener('fest-student-auth-change', handleAuth);
    window.addEventListener('storage', handleAuth);
    return () => {
      window.removeEventListener('fest-student-auth-change', handleAuth);
      window.removeEventListener('storage', handleAuth);
    };
  }, []);

  useEffect(() => {
    const handleOpenAuth = (e) => {
      const mode = e?.detail?.mode || 'login';
      setAuthMode(mode);
      setAuthModalOpen(true);
    };
    window.addEventListener('fest-open-auth-modal', handleOpenAuth);
    return () => window.removeEventListener('fest-open-auth-modal', handleOpenAuth);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleLoginClick = (e) => {
    if (e) e.preventDefault();
    closeMenu();
    const current = getLoggedStudent();
    if (!current) {
      setAuthMode('login');
      setAuthModalOpen(true);
    } else {
      if (location.pathname !== '/dashboard') {
        navigate('/dashboard');
      }
    }
  };

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
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link
                  to="/dashboard"
                  style={{
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    background: '#f8fafc',
                    padding: '5px 12px',
                    borderRadius: '50px',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.04)'
                  }}
                  title="Go to Student Dashboard & Account"
                >
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                    👤 {student.name ? student.name.split(' ')[0] : 'Student'}
                  </span>
                  <span style={{ fontSize: '0.7rem', background: '#ffe4e6', color: '#e11d48', padding: '2px 7px', borderRadius: '50px', fontWeight: 800 }}>
                    Dashboard
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => logoutStudent()}
                  style={{ background: 'transparent', border: 'none', color: '#dc2626', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: '0 4px' }}
                  title="Log out student account"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLoginClick}
                className="btn-register btn-login"
                id="navbar-login-btn"
              >
                ✦ Login
              </button>
            )}
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
            <Link
              to="/dashboard"
              onClick={closeMenu}
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column' }}
            >
              <span style={{ fontWeight: 800, color: '#0f172a' }}>👤 {student.name}</span>
              <span style={{ fontSize: '0.75rem', color: '#e11d48', fontWeight: 700 }}>Open Student Dashboard →</span>
            </Link>
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
        {!student && (
          <button
            type="button"
            className="btn-register btn-login"
            onClick={handleLoginClick}
            style={{ textAlign: 'center', marginTop: '0.5rem', width: '100%', justifyContent: 'center' }}
            id="mobile-navbar-login-btn"
          >
            ✦ Login
          </button>
        )}
      </div>



      {/* Student Account Registration & Login Modal */}
      <StudentAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(loggedStudent) => {
          setStudent(loggedStudent);
          setAuthModalOpen(false);
        }}
        initialMode={authMode}
      />
    </>
  );
}
