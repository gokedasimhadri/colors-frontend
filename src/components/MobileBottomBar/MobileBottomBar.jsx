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
  Users,
  Award,
  Phone,
  LayoutDashboard,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { getLoggedStudent, logoutStudent } from '../../services/api';
import LiquidGlass from '../ThemeComponents/LiquidGlass/LiquidGlass';
import SplitColorText from '../ThemeComponents/SplitColor/SplitColorText';
import './MobileBottomBar.css';

export default function MobileBottomBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const [student, setStudent] = useState(getLoggedStudent());

  const studentInitial = student?.name ? student.name.charAt(0).toUpperCase() : 'S';

  useEffect(() => {
    const handleAuth = () => setStudent(getLoggedStudent());
    window.addEventListener('fest-student-auth-change', handleAuth);
    window.addEventListener('storage', handleAuth);
    return () => {
      window.removeEventListener('fest-student-auth-change', handleAuth);
      window.removeEventListener('storage', handleAuth);
    };
  }, []);

  // Close drawer and popover on page route changes
  useEffect(() => {
    setDrawerOpen(false);
    setProfilePopoverOpen(false);
  }, [location.pathname]);

  const handleAccountClick = () => {
    setDrawerOpen(false);
    const current = getLoggedStudent();
    if (!current) {
      window.dispatchEvent(
        new CustomEvent('fest-open-auth-modal', { detail: { mode: 'login' } })
      );
    } else {
      setProfilePopoverOpen((prev) => !prev);
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
    location.pathname === '/teams' ||
    location.pathname === '/team' ||
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
            to="/teams"
            className={`drawer-link-item ${location.pathname === '/teams' || location.pathname === '/team' ? 'active' : ''}`}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="drawer-icon-bubble gold">
              <Users size={18} />
            </span>
            <div className="drawer-link-text">
              <span className="drawer-link-label">Team</span>
              <span className="drawer-link-sub">Festival Committee & Organizers</span>
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
          onClick={() => {
            setProfilePopoverOpen(false);
            setDrawerOpen(!drawerOpen);
          }}
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
          className={`bottom-tab ${profilePopoverOpen || (location.pathname === '/dashboard' && !drawerOpen) ? 'active' : ''}`}
          onClick={handleAccountClick}
          aria-label={student ? 'Student Profile Menu' : 'Student Login'}
          aria-expanded={profilePopoverOpen}
        >
          {student ? (
            <div className="mobile-tab-avatar-ring">
              <div className="mobile-tab-avatar-glass">
                <span className="mobile-tab-avatar-initial">{studentInitial}</span>
              </div>
            </div>
          ) : (
            <span className="bottom-tab-icon">
              <User size={20} strokeWidth={1.8} />
            </span>
          )}
          <span className="bottom-tab-label">
            {student ? (student.name ? student.name.split(' ')[0] : 'Profile') : 'Login'}
          </span>
        </button>
      </nav>

      {/* ── Mobile Profile Popover Sheet (Liquid Glass Floating Above Tab 5) ── */}
      {profilePopoverOpen && student && (
        <>
          <div
            className="mobile-popover-backdrop"
            onClick={() => setProfilePopoverOpen(false)}
            aria-hidden="true"
          />
          <div className="mobile-popover-container">
            <LiquidGlass
              as="div"
              className="profile-popover-card mobile-popover-card"
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
                  onClick={() => {
                    logoutStudent();
                    setStudent(null);
                    setProfilePopoverOpen(false);
                    if (location.pathname === '/dashboard') {
                      navigate('/');
                    }
                  }}
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
          </div>
        </>
      )}
    </>
  );
}

