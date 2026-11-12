import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { getLoggedStudent, logoutStudent } from '../../services/api';
import StudentAuthModal from '../RegistrationModals/StudentAuthModal';
import './Navbar.css';

const navItems = [
  // { label: 'Home', path: '/' },
  // { label: 'Events', path: '/events' },
  // Auxiliary page links commented out for later use:
  // { label: 'Invitation', path: '/invitation' },
  // { label: 'Events Schedule', href: '/Schedule_of_Events.pdf' },
  // { label: 'Sponsors', path: '/sponsors' },
  // { label: 'Contact', path: '/contact' },
];

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
        <div className="navbar-logo-fallback">
          <div className="logo-icon-circle">AU</div>
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
          {/* University Logo & Branding */}
          <UniversityLogo />

          {/* Desktop Nav Links */}
          <ul className="navbar-links">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    <span>{item.label}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>

          {/* Login/Dashboard CTA */}
          <div className="navbar-right-cluster">
            <div className="navbar-cta">
              {student ? (
                <div className="student-logged-box">
                  <Link
                    to="/dashboard"
                    className="student-pill-link"
                    title="Go to Student Dashboard & Account"
                  >
                    <span className="student-name-text">
                      👤 {student.name ? student.name.split(' ')[0] : 'Student'}
                    </span>
                    <span className="student-badge-dash">
                      Dashboard
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => logoutStudent()}
                    className="btn-logout"
                    title="Log out student account"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className="btn-fest-login"
                  id="navbar-login-btn"
                >
                  <span className="btn-glow" />
                  ✦ Login / Register
                </button>
              )}
            </div>
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

      {/* Mobile Drawer Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} role="menu">
        <div className="mobile-prize-banner">
          <span>🏆 ₹10 Lakhs in Cash Prizes</span>
          <span>•</span>
          <span>7 • 8 • 9 January 2027</span>
        </div>

        {student ? (
          <div className="mobile-student-card">
            <Link
              to="/dashboard"
              onClick={closeMenu}
              className="mobile-student-link"
            >
              <span className="mobile-student-name">👤 {student.name}</span>
              <span className="mobile-student-action">Open Student Dashboard →</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                logoutStudent();
                closeMenu();
              }}
              className="btn-logout-mobile"
            >
              Logout
            </button>
          </div>
        ) : null}

        {navItems.map((item) =>
          item.href ? (
            <a
              key={item.label}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              role="menuitem"
            >
              {item.label}
            </a>
          ) : (
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
          )
        )}

        {!student && (
          <button
            type="button"
            className="btn-fest-login"
            onClick={handleLoginClick}
            style={{ textAlign: 'center', marginTop: '0.8rem', width: '100%', justifyContent: 'center' }}
            id="mobile-navbar-login-btn"
          >
            ✦ Login / Register
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
