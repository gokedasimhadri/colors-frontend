import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Sparkles,
  Calendar,
  User,
  Menu,
  X,
  FileText,
  Award,
  Phone,
  LogOut,
  LogIn,
} from 'lucide-react';
import { getLoggedStudent, logoutStudent } from '../../services/api';
import './MobileBottomBar.css';

export default function MobileBottomBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [student, setStudent] = useState(getLoggedStudent());

  useEffect(() => {
    const handleAuth = () => setStudent(getLoggedStudent());
    window.addEventListener('fest-student-auth-change', handleAuth);
    window.addEventListener('storage', handleAuth);
    return () => {
      window.removeEventListener('fest-student-auth-change', handleAuth);
      window.removeEventListener('storage', handleAuth);
    };
  }, []);

  // Close drawer on page route changes
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const handleAccountClick = () => {
    setDrawerOpen(false);
    const current = getLoggedStudent();
    if (!current) {
      window.dispatchEvent(
        new CustomEvent('fest-open-auth-modal', { detail: { mode: 'login' } })
      );
    } else {
      if (location.pathname !== '/dashboard') {
        navigate('/dashboard');
      }
    }
  };

  const handleRegisterClick = () => {
    setDrawerOpen(false);
    window.dispatchEvent(
      new CustomEvent('fest-open-auth-modal', { detail: { mode: 'register' } })
    );
  };

  const isMoreActive =
    drawerOpen ||
    location.pathname === '/invitation' ||
    location.pathname === '/sponsors' ||
    location.pathname === '/contact';

  return (
    <>
      {/* ── Slide-up "More Menus" Drawer Sheet ── */}
      <div
        className={`mobile-bottom-drawer-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`mobile-bottom-drawer ${drawerOpen ? 'open' : ''}`}
        role="dialog"
        aria-label="Festival Navigation Menu"
      >
        <div className="drawer-handle-bar" onClick={() => setDrawerOpen(false)}>
          <span className="drawer-pill" />
        </div>

        <div className="drawer-header">
          <div className="drawer-title-group">
            <span className="drawer-title">COLOURS 2027</span>
            <span className="drawer-subtitle">National Youth Festival</span>
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close Menu"
          >
            <X size={19} />
          </button>
        </div>

        <div className="drawer-prize-badge">
          <span>🏆 ₹10 Lakhs Cash Prizes</span>
          <span>•</span>
          <span>7 • 8 • 9 January 2027</span>
        </div>

        {/* Student Account Status Card */}
        {student ? (
          <div className="drawer-student-card">
            <div className="drawer-student-info">
              <span className="drawer-student-avatar">👤</span>
              <div>
                <span className="drawer-student-name">{student.name}</span>
                <span className="drawer-student-role">Aditya Student Delegate</span>
              </div>
            </div>
            <div className="drawer-student-actions">
              <Link
                to="/dashboard"
                className="drawer-dash-btn"
                onClick={() => setDrawerOpen(false)}
              >
                Dashboard →
              </Link>
              <button
                type="button"
                className="drawer-logout-btn"
                onClick={() => {
                  logoutStudent();
                  setDrawerOpen(false);
                }}
              >
                <LogOut size={14} /> Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="drawer-auth-buttons">
            <button
              type="button"
              className="drawer-auth-btn login-btn"
              onClick={handleAccountClick}
            >
              <LogIn size={15} /> Student Login
            </button>
            <button
              type="button"
              className="drawer-auth-btn register-btn"
              onClick={handleRegisterClick}
            >
              Register Now
            </button>
          </div>
        )}

        {/* All Festival Menu Links */}
        <div className="drawer-links-grid">
          <Link
            to="/events"
            className={`drawer-link-item ${location.pathname.startsWith('/events') ? 'active' : ''}`}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="drawer-icon-bubble pink">
              <Sparkles size={18} />
            </span>
            <div className="drawer-link-text">
              <span className="drawer-link-label">Browse Events</span>
              <span className="drawer-link-sub">Competitions & Stages</span>
            </div>
          </Link>

          <Link
            to="/invitation"
            className={`drawer-link-item ${location.pathname === '/invitation' ? 'active' : ''}`}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="drawer-icon-bubble gold">
              <FileText size={18} />
            </span>
            <div className="drawer-link-text">
              <span className="drawer-link-label">Invitation Poster</span>
              <span className="drawer-link-sub">Official Festival Invite</span>
            </div>
          </Link>

          <a
            href="/Schedule_of_Events.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="drawer-link-item"
            onClick={() => setDrawerOpen(false)}
          >
            <span className="drawer-icon-bubble blue">
              <Calendar size={18} />
            </span>
            <div className="drawer-link-text">
              <span className="drawer-link-label">Events Schedule</span>
              <span className="drawer-link-sub">3-Day Timeline (PDF)</span>
            </div>
          </a>

          <Link
            to="/sponsors"
            className={`drawer-link-item ${location.pathname === '/sponsors' ? 'active' : ''}`}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="drawer-icon-bubble amber">
              <Award size={18} />
            </span>
            <div className="drawer-link-text">
              <span className="drawer-link-label">Sponsors & Partners</span>
              <span className="drawer-link-sub">Corporate Supporters</span>
            </div>
          </Link>

          <Link
            to="/contact"
            className={`drawer-link-item ${location.pathname === '/contact' ? 'active' : ''}`}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="drawer-icon-bubble teal">
              <Phone size={18} />
            </span>
            <div className="drawer-link-text">
              <span className="drawer-link-label">Helpdesk & Contact</span>
              <span className="drawer-link-sub">Venue & Helplines</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Fixed Bottom Glass Navigation Bar ── */}
      <nav
        className="mobile-bottom-bar"
        role="navigation"
        aria-label="Mobile Bottom Navigation"
      >
        {/* Tab 1: Home */}
        <Link
          to="/"
          className={`bottom-tab ${location.pathname === '/' ? 'active' : ''}`}
          aria-label="Home"
        >
          <span className="bottom-tab-icon">
            <Home size={20} strokeWidth={location.pathname === '/' ? 2.4 : 1.8} />
          </span>
          <span className="bottom-tab-label">Home</span>
          {location.pathname === '/' && <span className="bottom-active-dot" />}
        </Link>

        {/* Tab 2: Events */}
        <Link
          to="/events"
          className={`bottom-tab ${location.pathname.startsWith('/events') ? 'active' : ''}`}
          aria-label="Events"
        >
          <span className="bottom-tab-icon">
            <Sparkles size={20} strokeWidth={location.pathname.startsWith('/events') ? 2.4 : 1.8} />
          </span>
          <span className="bottom-tab-label">Events</span>
          {location.pathname.startsWith('/events') && <span className="bottom-active-dot" />}
        </Link>

        {/* Tab 3: Schedule */}
        <a
          href="/Schedule_of_Events.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="bottom-tab"
          aria-label="Events Schedule PDF"
        >
          <span className="bottom-tab-icon">
            <Calendar size={20} strokeWidth={1.8} />
          </span>
          <span className="bottom-tab-label">Schedule</span>
        </a>

        {/* Tab 4: More / Menus */}
        <button
          type="button"
          className={`bottom-tab ${isMoreActive ? 'active' : ''}`}
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label="Toggle All Festival Menus"
          aria-expanded={drawerOpen}
        >
          <span className="bottom-tab-icon">
            {drawerOpen ? <X size={20} strokeWidth={2.4} /> : <Menu size={20} strokeWidth={isMoreActive ? 2.4 : 1.8} />}
          </span>
          <span className="bottom-tab-label">Menu</span>
          {isMoreActive && !drawerOpen && <span className="bottom-active-dot" />}
        </button>

        {/* Tab 5: Account / Login */}
        <button
          type="button"
          className={`bottom-tab ${location.pathname === '/dashboard' ? 'active' : ''}`}
          onClick={handleAccountClick}
          aria-label={student ? 'Student Dashboard' : 'Student Login'}
        >
          <span className="bottom-tab-icon">
            <User size={20} strokeWidth={location.pathname === '/dashboard' ? 2.4 : 1.8} />
          </span>
          <span className="bottom-tab-label">
            {student ? (student.name ? student.name.split(' ')[0] : 'Account') : 'Login'}
          </span>
          {location.pathname === '/dashboard' && <span className="bottom-active-dot" />}
        </button>
      </nav>
    </>
  );
}

