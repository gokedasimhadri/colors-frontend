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
} from 'lucide-react';
import { getLoggedStudent } from '../../services/api';
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

        <button
          type="button"
          className="drawer-close-btn"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close Menu"
        >
          <X size={19} />
        </button>

        {/* Festival Menu Links (Only items not directly available on the outer bottom bar, with exact Navbar names) */}
        <div className="drawer-links-grid">
          <Link
            to="/invitation"
            className={`drawer-link-item ${location.pathname === '/invitation' ? 'active' : ''}`}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="drawer-icon-bubble gold">
              <FileText size={18} />
            </span>
            <div className="drawer-link-text">
              <span className="drawer-link-label">Invitation</span>
              <span className="drawer-link-sub">Official Festival Invite</span>
            </div>
          </Link>

          <Link
            to="/sponsors"
            className={`drawer-link-item ${location.pathname === '/sponsors' ? 'active' : ''}`}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="drawer-icon-bubble amber">
              <Award size={18} />
            </span>
            <div className="drawer-link-text">
              <span className="drawer-link-label">Sponsors</span>
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
              <span className="drawer-link-label">Contact</span>
              <span className="drawer-link-sub">Helpdesk & Helplines</span>
            </div>
          </Link>
        </div>
      </div>

      {/* ── Fixed Floating Pill Island Navigation Bar ── */}
      <nav
        className="mobile-bottom-bar"
        role="navigation"
        aria-label="Mobile Bottom Navigation"
      >
        {/* Tab 1: Home */}
        <Link
          to="/"
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`bottom-tab ${location.pathname === '/' && !drawerOpen ? 'active' : ''}`}
          aria-label="Home"
        >
          <span className="bottom-tab-icon">
            <Home size={20} strokeWidth={location.pathname === '/' && !drawerOpen ? 2.2 : 1.8} />
          </span>
          <span className="bottom-tab-label">Home</span>
        </Link>

        {/* Tab 2: Events */}
        <Link
          to="/events"
          className={`bottom-tab ${location.pathname.startsWith('/events') && !drawerOpen ? 'active' : ''}`}
          aria-label="Events"
        >
          <span className="bottom-tab-icon">
            <Sparkles size={20} strokeWidth={location.pathname.startsWith('/events') && !drawerOpen ? 2.2 : 1.8} />
          </span>
          <span className="bottom-tab-label">Events</span>
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
            {drawerOpen ? <X size={20} strokeWidth={2.2} /> : <Menu size={20} strokeWidth={isMoreActive ? 2.2 : 1.8} />}
          </span>
          <span className="bottom-tab-label">Menu</span>
        </button>

        {/* Tab 5: Account / Login */}
        <button
          type="button"
          className={`bottom-tab ${location.pathname === '/dashboard' && !drawerOpen ? 'active' : ''}`}
          onClick={handleAccountClick}
          aria-label={student ? 'Student Dashboard' : 'Student Login'}
        >
          <span className="bottom-tab-icon">
            <User size={20} strokeWidth={location.pathname === '/dashboard' && !drawerOpen ? 2.2 : 1.8} />
          </span>
          <span className="bottom-tab-label">
            {student ? (student.name ? student.name.split(' ')[0] : 'Account') : 'Login'}
          </span>
        </button>
      </nav>
    </>
  );
}

