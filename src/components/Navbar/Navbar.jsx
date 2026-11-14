import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getLoggedStudent, logoutStudent } from '../../services/api';
import StudentAuthModal from '../RegistrationModals/StudentAuthModal';
import ThemeButton from '../ThemeComponents/ThemeButton';
import SplitColorText from '../ThemeComponents/SplitColor/SplitColorText';
import NavbarMenu from './NavbarMenu';
import './Navbar.css';

const navItems = [
  { label: 'Events', path: '/events' },
  { label: 'Invitation', path: '/invitation' },
  { label: 'Events Schedule', href: '/Schedule_of_Events.pdf' },
  { label: 'Sponsors', path: '/sponsors' },
  { label: 'Contact', path: '/contact' },
];

function UniversityLogo() {
  const [imgError, setImgError] = useState(false);

  return (
    <Link to="/" className="navbar-logo" aria-label="Aditya University – Colours 2027 Home">
      {!imgError ? (
        <img
          src="/aus-logo.svg"
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
  const isHome = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [student, setStudent] = useState(getLoggedStudent());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement?.scrollTop || document.body?.scrollTop || 0;
      setScrolled(scrollY > 15);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
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
        className={`navbar ${!isHome ? 'navbar-subpage' : ''} ${scrolled ? 'scrolled' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="navbar-glass-backdrop" aria-hidden="true" />
        <div className="navbar-inner">
          {/* University Logo & Branding */}
          <UniversityLogo />

          {/* Desktop Nav Links */}
          <NavbarMenu key={location.pathname} items={navItems} />

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
                /* Commented out Login button as requested
                <ThemeButton
                  onClick={handleLoginClick}
                  id="navbar-login-btn"
                  key={location.pathname}
                >
                  <SplitColorText leftColor="#0f172a" rightColor="#ffffff">
                    Login
                  </SplitColorText>
                </ThemeButton>
                */
                null
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

        {/* Mobile Navigation Links */}
        <NavbarMenu
          items={navItems}
          isMobile
          onItemClick={closeMenu}
        />

        {/* Commented out Mobile Login button as requested
        {!student && (
          <ThemeButton
            onClick={handleLoginClick}
            id="mobile-navbar-login-btn"
            width="100%"
            style={{ marginTop: '0.8rem' }}
          >
            Login
          </ThemeButton>
        )}
        */}
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
