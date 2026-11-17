import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  LogOut,
  LayoutDashboard,
  ChevronRight
} from 'lucide-react';
import { getLoggedStudent, logoutStudent } from '../../services/api';
import StudentAuthModal from '../RegistrationModals/StudentAuthModal';
import ThemeButton from '../ThemeComponents/ThemeButton';
import SplitColorText from '../ThemeComponents/SplitColor/SplitColorText';
import LiquidGlass from '../ThemeComponents/LiquidGlass/LiquidGlass';
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
  const location = useLocation();

  const handleLogoClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Link
      to="/"
      onClick={handleLogoClick}
      className="navbar-logo"
      aria-label="Aditya University – Colours 2027 Home"
    >
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
  const isSplitThemePage = location.pathname === '/' || location.pathname.startsWith('/events');
  const isHome = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [student, setStudent] = useState(getLoggedStudent());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const profilePopoverRef = useRef(null);

  useEffect(() => {
    let lastScrollY = window.scrollY || window.pageYOffset || 0;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY =
            window.scrollY ||
            window.pageYOffset ||
            document.documentElement?.scrollTop ||
            document.body?.scrollTop ||
            0;

          setScrolled(currentScrollY > 15);

          // If menu, popover, or auth modal is open, keep navbar visible
          if (menuOpen || authModalOpen || profilePopoverOpen) {
            setHidden(false);
            lastScrollY = currentScrollY;
            ticking = false;
            return;
          }

          // At top of the page, always show navbar
          if (currentScrollY <= 20) {
            setHidden(false);
          } else {
            const diff = currentScrollY - lastScrollY;
            // Scroll down past 70px threshold: hide navbar smoothly
            if (diff > 6 && currentScrollY > 70) {
              setHidden(true);
            }
            // Scroll up: show navbar smoothly
            else if (diff < -6) {
              setHidden(false);
            }
          }

          lastScrollY = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, [menuOpen, authModalOpen, profilePopoverOpen]);

  // Always show navbar and close popover on route navigation
  useEffect(() => {
    setHidden(false);
    setProfilePopoverOpen(false);
  }, [location.pathname]);

  // Close profile popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profilePopoverRef.current && !profilePopoverRef.current.contains(event.target)) {
        setProfilePopoverOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setProfilePopoverOpen(false);
      }
    };

    if (profilePopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profilePopoverOpen]);

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

  const handleLogout = () => {
    setProfilePopoverOpen(false);
    logoutStudent();
    if (location.pathname === '/dashboard') {
      navigate('/');
    }
  };

  const studentInitial = student?.name
    ? student.name.trim().charAt(0).toUpperCase()
    : (student?.rollNumber ? student.rollNumber.trim().charAt(0).toUpperCase() : 'S');

  const studentAvatar =
    student?.photo ||
    student?.avatar ||
    student?.profilePic ||
    student?.imageUrl ||
    '/student-avatar.png';

  return (
    <>
      <nav
        className={`navbar ${!isSplitThemePage ? 'navbar-subpage' : ''} ${scrolled ? 'scrolled' : ''} ${hidden ? 'nav-hidden' : ''}`}
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
                <div className="navbar-profile-wrapper" ref={profilePopoverRef}>
                  <button
                    type="button"
                    onClick={() => setProfilePopoverOpen((prev) => !prev)}
                    className={`navbar-profile-circle-btn ${profilePopoverOpen ? 'active' : ''}`}
                    aria-expanded={profilePopoverOpen}
                    aria-haspopup="true"
                    aria-label="Student Profile & Account Menu"
                    title={student?.name || 'Student Account'}
                  >
                    <div className="navbar-profile-circle-ring">
                      <div className="navbar-profile-circle-glass">
                        <span className="navbar-profile-circle-initial">
                          {studentInitial}
                        </span>
                      </div>
                    </div>
                  </button>

                  {profilePopoverOpen && (
                    <LiquidGlass
                      as="div"
                      className="profile-popover-card"
                      role="dialog"
                      aria-label="User Profile Menu"
                      borderRadius={16}
                      enableShader={false}
                    >
                      {/* 1. Profile Header */}
                      <div className="profile-popover-header">
                        <div className="profile-popover-avatar-wrap">
                          <div className="profile-popover-avatar">
                            <span className="profile-popover-avatar-initial">
                              {studentInitial}
                            </span>
                          </div>
                        </div>

                        <div className="profile-popover-meta">
                          <div className="profile-popover-name" title={student?.name || 'User Account'}>
                            <SplitColorText leftColor="#0f172a" rightColor="#ffffff">
                              {student?.name || 'User Account'}
                            </SplitColorText>
                          </div>
                          <div className="profile-popover-role-row">
                            <span className="profile-popover-role-badge">
                              <SplitColorText leftColor="#334155" rightColor="#f8fafc">
                                {student?.role || (student?.rollNumber ? 'Student' : 'User')}
                              </SplitColorText>
                            </span>
                          </div>
                          <div
                            className="profile-popover-email"
                            title={student?.email || (student?.rollNumber ? `${student.rollNumber.toLowerCase()}@adityauniversity.in` : 'user@adityauniversity.in')}
                          >
                            <SplitColorText leftColor="#475569" rightColor="#cbd5e1">
                              {student?.email || (student?.rollNumber ? `${student.rollNumber.toLowerCase()}@adityauniversity.in` : 'user@adityauniversity.in')}
                            </SplitColorText>
                          </div>
                          <div
                            className="profile-popover-org"
                            title={student?.college || student?.department || (student?.rollNumber ? `ID: ${student.rollNumber}` : 'Aditya University')}
                          >
                            <SplitColorText leftColor="#64748b" rightColor="#94a3b8">
                              {student?.college || student?.department || (student?.rollNumber ? `ID: ${student.rollNumber}` : 'Aditya University')}
                            </SplitColorText>
                          </div>
                        </div>
                      </div>

                      <div className="profile-popover-divider" />

                      {/* 2. Menu Items (Dashboard) */}
                      <div className="profile-popover-nav">
                        {/* My Dashboard */}
                        <Link
                          to="/dashboard?tab=events"
                          className="profile-popover-nav-item"
                          onClick={() => setProfilePopoverOpen(false)}
                        >
                          <span className="popover-nav-icon">
                            <LayoutDashboard size={16} strokeWidth={1.8} />
                          </span>
                          <span className="popover-nav-title">
                            <SplitColorText leftColor="#0f172a" rightColor="#ffffff">
                              My Dashboard
                            </SplitColorText>
                          </span>
                          <ChevronRight size={14} className="popover-nav-chevron" />
                        </Link>
                      </div>

                      <div className="profile-popover-divider" />

                      {/* 3. Logout Section */}
                      <div className="profile-popover-footer">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="profile-popover-logout-btn"
                          title="Sign out of account"
                        >
                          <LogOut size={15} strokeWidth={2} />
                          <SplitColorText leftColor="#dc2626" rightColor="#fca5a5">
                            Logout
                          </SplitColorText>
                        </button>
                      </div>
                    </LiquidGlass>
                  )}
                </div>
              ) : (
                <ThemeButton
                  onClick={handleLoginClick}
                  id="navbar-login-btn"
                  key={location.pathname}
                >
                  <SplitColorText leftColor="#0f172a" rightColor="#ffffff">
                    Register  |  Sign In
                  </SplitColorText>
                </ThemeButton>
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
            <div className="mobile-student-card-header">
              <div className="mobile-student-avatar">
                <img
                  src={studentAvatar}
                  alt={student.name || 'Student'}
                  className="mobile-student-avatar-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextElementSibling) {
                      e.target.nextElementSibling.style.display = 'flex';
                    }
                  }}
                />
                <span className="mobile-student-avatar-fallback" style={{ display: 'none' }}>
                  {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                </span>
              </div>
              <div className="mobile-student-details">
                <span className="mobile-student-name">{student.name}</span>
                <span className="mobile-student-roll">{student.rollNumber || student.roll || 'Aditya Student'}</span>
              </div>
            </div>

            <div className="mobile-student-actions">
              <Link
                to="/dashboard"
                onClick={closeMenu}
                className="mobile-student-btn-dash"
              >
                <LayoutDashboard size={15} />
                <span>Student Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logoutStudent();
                  closeMenu();
                  if (location.pathname === '/dashboard') {
                    navigate('/');
                  }
                }}
                className="btn-logout-mobile"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* Mobile Navigation Links */}
        <NavbarMenu
          items={navItems}
          isMobile
          onItemClick={closeMenu}
        />

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
      </div>

      {/* Student Account Registration & Login Modal */}
      <StudentAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(loggedStudent) => {
          setStudent(loggedStudent);
          setAuthModalOpen(false);
          navigate('/dashboard');
        }}
        initialMode={authMode}
      />
    </>
  );
}
