import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Sparkles,
  Calendar,
  User,
  Menu,
  X,
  Users,
  Award,
  Phone,
  MailOpen,
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

  // ── Dynamic Background Luminance Tracking per Bottom Tab ──
  const [tabThemes, setTabThemes] = useState({
    home: 'light',
    events: 'light',
    menu: 'dark',
    login: 'dark'
  });
  const tabRefs = useRef({});

  useEffect(() => {
    let ticking = false;

    const detectLuminanceAtPoint = (cx, cy) => {
      if (typeof document === 'undefined') return 1;

      // Active modal or open drawer: background is light/frosted white
      if (document.querySelector('.fest-modal-backdrop, .mobile-bottom-drawer.open')) {
        return 1;
      }

      const elements = typeof document.elementsFromPoint === 'function'
        ? document.elementsFromPoint(cx, cy)
        : [];

      for (const item of elements) {
        if (!item) continue;
        if (item.closest('.mobile-bottom-bar') || item.closest('.mobile-popover-container')) {
          continue;
        }
        if (item.tagName === 'CANVAS' || item.classList.contains('blast-canvas') || item.classList.contains('mouse-animation-canvas')) {
          continue;
        }

        const themeAttr = item.getAttribute('data-theme') || item.closest('[data-theme]')?.getAttribute('data-theme');
        if (themeAttr === 'light') return 1;
        if (themeAttr === 'dark') return 0;

        if (item.closest('.uni-footer-left')) return 0;
        if (item.closest('.uni-footer-right')) return 1;
        if (item.closest('.uni-footer-bottom')) return 0;
        if (item.closest('.hero-dates-card') || item.closest('.pillar-card')) return 1;

        let curr = item;
        while (curr && curr !== document.documentElement && curr !== document.body) {
          if (curr.classList.contains('uni-footer-left')) return 0;
          if (curr.classList.contains('uni-footer-right')) return 1;
          if (curr.classList.contains('uni-footer-bottom')) return 0;

          const comp = window.getComputedStyle(curr);
          const bg = comp.backgroundColor;
          if (bg && bg !== 'transparent' && !bg.includes('rgba(0, 0, 0, 0)')) {
            const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (match) {
              const r = parseInt(match[1], 10);
              const g = parseInt(match[2], 10);
              const b = parseInt(match[3], 10);
              const a = match[4] !== undefined ? parseFloat(match[4]) : 1;
              if (a > 0.25) {
                return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
              }
            }
          }
          curr = curr.parentElement;
        }
      }

      // Default split page detection fallback
      const splitBg = document.querySelector('.split-background');
      const isSplit = Boolean(splitBg) || (!location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/account'));
      if (isSplit) {
        const splitX = window.innerWidth / 2;
        return cx < splitX ? 1 : 0;
      }
      return 1;
    };

    const updateThemes = () => {
      const newThemes = {};
      const keys = ['home', 'events', 'menu', 'login'];
      keys.forEach((k) => {
        const el = tabRefs.current[k];
        if (el) {
          const rect = el.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const lum = detectLuminanceAtPoint(cx, cy);
          newThemes[k] = lum > 0.5 ? 'light' : 'dark';
        } else {
          const isLeft = k === 'home' || k === 'events';
          const isSplit = !location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/account');
          newThemes[k] = isSplit ? (isLeft ? 'light' : 'dark') : 'light';
        }
      });

      setTabThemes((prev) => {
        if (
          prev.home === newThemes.home &&
          prev.events === newThemes.events &&
          prev.menu === newThemes.menu &&
          prev.login === newThemes.login
        ) {
          return prev;
        }
        return newThemes;
      });

      ticking = false;
    };

    const onScrollOrResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateThemes);
        ticking = true;
      }
    };

    updateThemes();
    const rafId = window.requestAnimationFrame(updateThemes);
    const t1 = setTimeout(updateThemes, 60);
    const t2 = setTimeout(updateThemes, 200);

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      window.cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [location.pathname, drawerOpen]);

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

  const isMoreActive =
    drawerOpen ||
    location.pathname === '/teams' ||
    location.pathname === '/team' ||
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
        <div className="drawer-top-header">
          <div className="drawer-header-spacer" />
          <div className="drawer-handle-bar" onClick={() => setDrawerOpen(false)}>
            <span className="drawer-pill" />
          </div>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close Menu"
          >
            <X size={18} />
          </button>
        </div>

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
              <SplitColorText as="span" className="drawer-link-label" screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                Team
              </SplitColorText>
              <SplitColorText as="span" className="drawer-link-sub" screenSync={true} leftColor="#475569" rightColor="#cbd5e1">
                Committee & Organizers
              </SplitColorText>
            </div>
          </Link>

          <Link
            to="/invitation"
            className={`drawer-link-item ${location.pathname === '/invitation' ? 'active' : ''}`}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="drawer-icon-bubble emerald">
              <MailOpen size={18} />
            </span>
            <div className="drawer-link-text">
              <SplitColorText as="span" className="drawer-link-label" screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                Invitation
              </SplitColorText>
              <SplitColorText as="span" className="drawer-link-sub" screenSync={true} leftColor="#475569" rightColor="#cbd5e1">
                Colours Invitation
              </SplitColorText>
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
              <SplitColorText as="span" className="drawer-link-label" screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                Schedule
              </SplitColorText>
              <SplitColorText as="span" className="drawer-link-sub" screenSync={true} leftColor="#475569" rightColor="#cbd5e1">
                Day-wise Schedule
              </SplitColorText>
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
              <SplitColorText as="span" className="drawer-link-label" screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                Sponsors
              </SplitColorText>
              <SplitColorText as="span" className="drawer-link-sub" screenSync={true} leftColor="#475569" rightColor="#cbd5e1">
                Sponsors and Partners
              </SplitColorText>
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
              <SplitColorText as="span" className="drawer-link-label" screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                Contact
              </SplitColorText>
              <SplitColorText as="span" className="drawer-link-sub" screenSync={true} leftColor="#475569" rightColor="#cbd5e1">
                Reach Out & Trasnsit
              </SplitColorText>
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
          ref={(el) => { tabRefs.current.home = el; }}
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`bottom-tab theme-${tabThemes.home} ${location.pathname === '/' && !drawerOpen ? 'active' : ''}`}
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
          ref={(el) => { tabRefs.current.events = el; }}
          className={`bottom-tab theme-${tabThemes.events} ${location.pathname.startsWith('/events') && !drawerOpen ? 'active' : ''}`}
          aria-label="Events"
        >
          <span className="bottom-tab-icon">
            <Sparkles size={20} strokeWidth={location.pathname.startsWith('/events') && !drawerOpen ? 2.2 : 1.8} />
          </span>
          <span className="bottom-tab-label">Events</span>
        </Link>

        {/* Tab 3: Live Stream */}
        <Link
          to="/live"
          onClick={() => {
            if (location.pathname === '/live') {
              const playerEl = document.getElementById('live-player-section');
              if (playerEl) {
                const navEl = document.querySelector('.navbar');
                const navHeight = navEl ? navEl.offsetHeight : 98;
                const rect = playerEl.getBoundingClientRect();
                const targetY = window.pageYOffset + rect.top - navHeight;
                window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
              }
            }
          }}
          className={`bottom-tab bottom-tab-live ${location.pathname === '/live' && !drawerOpen ? 'active' : ''}`}
          aria-label="Colours 2027 Live Stream"
        >
          <span className="bottom-tab-icon bottom-tab-live-icon">
            <img
              src="/live-icon.webp"
              alt="Live Stream"
              className="bottom-tab-live-img"
            />
          </span>
        </Link>

        {/* Tab 4: More / Menus */}
        <button
          type="button"
          ref={(el) => { tabRefs.current.menu = el; }}
          className={`bottom-tab theme-${tabThemes.menu} ${isMoreActive ? 'active' : ''}`}
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
          ref={(el) => { tabRefs.current.login = el; }}
          className={`bottom-tab theme-${tabThemes.login} ${profilePopoverOpen || (location.pathname === '/dashboard' && !drawerOpen) ? 'active' : ''} ${student ? 'logged-in' : ''}`}
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
            <>
              <span className="bottom-tab-icon">
                <User size={20} strokeWidth={1.8} />
              </span>
              <span className="bottom-tab-label">Login</span>
            </>
          )}
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

