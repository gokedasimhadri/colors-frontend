import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  getLoggedStudent,
  logoutStudent,
  fetchStudentDashboard,
  updateStudentProfile,
  changeStudentPassword,
  fetchAllEvents,
  formatRegistrationId,
  formatPaymentReference,
  EVENT_ACADEMIC_YEAR,
  matchesAcademicYear,
  isValidOtherCollege
} from '../../services/api';
import StudentAuthModal from '../../components/RegistrationModals/StudentAuthModal';
import ManageTeamModal from '../../components/RegistrationModals/ManageTeamModal';
import './StudentDashboard.css';

const COLLEGE_OPTIONS = [
  'AUS',
  'ACET',
  'Other Institution'
];

function normalizeCollege(col) {
  if (!col) return 'AUS';
  const c = col.toString().trim();
  if (c.toUpperCase().includes('ACET')) return 'ACET';
  if (c === 'Other Institution' || c.toUpperCase().includes('OTHER')) return 'Other Institution';
  return 'AUS';
}

const YEAR_OPTIONS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Post Graduate',
  'Alumni / Other'
];

/**
 * Determine if an event strictly belongs to the 'Sports & Games' category.
 * Only events in Sports & Games are permitted to add/manage squads in student dashboard.
 */
export function isSportsAndGamesEvent(item, catalogEvents = []) {
  if (!item) return false;

  // 1. Direct category match
  const cat = (
    item.category ||
    item.categoryName ||
    item.eventCategory ||
    item.event_category ||
    item.eventCategoryName ||
    item.activityCategory ||
    item.backendRegistration?.category ||
    item.backendRegistration?.categoryName ||
    item.backendRegistration?.eventCategory ||
    item.registration?.category ||
    item.registration?.categoryName ||
    ''
  ).toString().trim().toLowerCase();

  if (
    cat.includes('sport') ||
    cat.includes('game') ||
    cat === 'sports' ||
    cat === 'sports & games' ||
    cat === 'sports and games'
  ) {
    return true;
  }

  // Explicit non-sports categories (e.g. Culturals Events, Creo Events)
  if (
    cat.includes('cultural') ||
    cat.includes('creo') ||
    cat.includes('technical') ||
    cat.includes('academic')
  ) {
    return false;
  }

  // 2. Direct subcategory match
  const subcat = (
    item.subcategory ||
    item.subCategory ||
    item.subcategoryName ||
    item.eventSubCategory ||
    item.backendRegistration?.subCategory ||
    item.backendRegistration?.subcategoryName ||
    item.registration?.subCategory ||
    ''
  ).toString().trim().toLowerCase();

  if (subcat.includes('sport') || subcat.includes('game')) {
    return true;
  }

  const NON_SPORTS_KEYWORDS = [
    'singing', 'vocal', 'instrumental', 'mime', 'mono action', 'monoact',
    'stand-up', 'standup', 'comedy', 'skit', 'drama', 'dance', 'mimicry',
    'painting', 'fashion', 'treasure hunt', 'mehandi', 'movie making',
    'photography', 'sahityam', 'dumb charades', 'rangoli', 'literary', 'arts'
  ];
  for (const ns of NON_SPORTS_KEYWORDS) {
    if (subcat.includes(ns)) return false;
  }

  const SPORTS_KEYWORDS = [
    'running', 'jumping', 'throwing', 'volleyball', 'basketball',
    'badminton', 'relay', 'football', 'tennikoit', 'kabaddi',
    'throwball', 'chess', 'kho kho', 'khokho', 'table tennis',
    'cricket', 'athletics', 'sports', 'game'
  ];
  for (const s of SPORTS_KEYWORDS) {
    if (subcat.includes(s)) return true;
  }

  // 3. Match against catalog events
  const title = (
    item.eventTitle ||
    item.eventName ||
    item.event_name ||
    item.title ||
    ''
  ).toString().trim().toLowerCase();

  const eventId = (
    item.eventId ||
    item.rawId ||
    item._id ||
    item.event_id ||
    item.backendRegistration?.eventId ||
    ''
  ).toString().trim();

  if (Array.isArray(catalogEvents) && catalogEvents.length > 0) {
    const matched = catalogEvents.find((ev) => {
      const evTitle = (ev.eventName || ev.title || '').trim().toLowerCase();
      const evId = (ev._id || ev.rawId || '').toString();
      const evSlug = (ev.slug || '').toLowerCase();
      return (
        (eventId && evId === eventId) ||
        (evTitle && (evTitle === title || title.includes(evTitle) || evTitle.includes(title))) ||
        (evSlug && title.includes(evSlug))
      );
    });

    if (matched) {
      const mCat = (matched.category || matched.categoryName || '').toLowerCase();
      if (mCat.includes('sport') || mCat.includes('game')) {
        return true;
      }
      if (mCat.includes('cultural') || mCat.includes('creo')) {
        return false;
      }
    }
  }

  // 4. Fallback keyword check on event title
  for (const ns of NON_SPORTS_KEYWORDS) {
    if (title.includes(ns)) return false;
  }
  for (const s of SPORTS_KEYWORDS) {
    if (title.includes(s)) return true;
  }

  return false;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [student, setStudent] = useState(getLoggedStudent());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [catalogEvents, setCatalogEvents] = useState([]);

  // Active tab: 'profile' | 'security' | 'events'
  const tabParam = searchParams.get('tab') || location.state?.tab;
  const [activeTab, setActiveTab] = useState(
    tabParam && ['profile', 'security', 'events'].includes(tabParam) ? tabParam : 'events'
  );

  useEffect(() => {
    const tab = searchParams.get('tab') || location.state?.tab;
    if (tab && ['profile', 'security', 'events'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search, location.state]);

  // Dashboard live data from backend
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    student: null,
    registrations: [],
    payments: []
  });

  // Modal to edit/add squad members for a registered event (Sports & Games only)
  const [editingTeamReg, setEditingTeamReg] = useState(null);

  useEffect(() => {
    fetchAllEvents('COLORS')
      .then((evs) => {
        if (Array.isArray(evs) && evs.length > 0) {
          setCatalogEvents(evs);
        }
      })
      .catch(() => {});
  }, []);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    roll: '',
    college: 'Aditya University',
    otherCollege: '',
    department: '',
    year: '3rd Year',
    gender: 'Male',
    mobile: '',
    email: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileAlert, setProfileAlert] = useState(null); // { type: 'success' | 'error', message: '' }

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState(null);

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Listen to auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      const current = getLoggedStudent();
      setStudent(current);
    };
    window.addEventListener('fest-student-auth-change', handleAuthChange);
    return () => window.removeEventListener('fest-student-auth-change', handleAuthChange);
  }, []);

  // Fetch Dashboard details when student is present
  const loadDashboard = async () => {
    const current = getLoggedStudent();
    if (!current || !current.roll) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchStudentDashboard(current.roll);
      setDashboardData({
        student: data.student || current,
        registrations: data.registrations || [],
        payments: data.payments || []
      });

      // Synchronize profile form
      const st = data.student || current;
      setProfileForm({
        name: st.name || '',
        roll: st.roll || '',
        college: normalizeCollege(st.college),
        otherCollege: st.otherCollege || '',
        department: st.department || '',
        year: st.year || '3rd Year',
        gender: st.gender || 'Male',
        mobile: st.mobile || '',
        email: st.email || ''
      });
    } catch (err) {
      console.warn('Dashboard fetch notice:', err.message);
      // Fallback to local session
      setDashboardData({
        student: current,
        registrations: [],
        payments: []
      });
      setProfileForm({
        name: current.name || '',
        roll: current.roll || '',
        college: normalizeCollege(current.college),
        otherCollege: current.otherCollege || '',
        department: current.department || '',
        year: current.year || '3rd Year',
        gender: current.gender || 'Male',
        mobile: current.mobile || '',
        email: current.email || ''
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (student) {
      loadDashboard();
    } else {
      setLoading(false);
    }
  }, [student]);

  const [otherCollegeError, setOtherCollegeError] = useState(null);

  // Handle Profile Form Change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    if (profileAlert) setProfileAlert(null);

    if (name === 'otherCollege' && otherCollegeError && isValidOtherCollege(value)) {
      setOtherCollegeError(null);
    }
    if (name === 'college' && value !== 'Other Institution') {
      setOtherCollegeError(null);
    }
  };

  const handleOtherCollegeBlur = (val) => {
    const trimmed = (val || '').trim();
    if (trimmed && !isValidOtherCollege(trimmed)) {
      setOtherCollegeError('⚠️ College name must contain "University" or "Engineering"');
    } else {
      setOtherCollegeError(null);
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileAlert(null);

    if (!profileForm.name.trim()) {
      setProfileAlert({ type: 'error', message: 'Full Name is required' });
      return;
    }
    if (!profileForm.mobile.trim() || profileForm.mobile.trim().length < 10) {
      setProfileAlert({ type: 'error', message: 'Valid 10-digit mobile number is required' });
      return;
    }
    if (profileForm.college === 'Other Institution') {
      const col = (profileForm.otherCollege || '').trim();
      if (!col) {
        setProfileAlert({ type: 'error', message: 'Please specify your institution name' });
        return;
      }
      if (!isValidOtherCollege(col)) {
        setProfileAlert({
          type: 'error',
          message: 'Institution name must contain "University" or "Engineering" to be accepted'
        });
        return;
      }
    }

    try {
      setProfileSaving(true);
      const updated = await updateStudentProfile({
        id: dashboardData.student?._id || student?._id,
        roll: profileForm.roll,
        name: profileForm.name,
        college: profileForm.college,
        otherCollege: profileForm.otherCollege,
        department: profileForm.department,
        year: profileForm.year,
        gender: profileForm.gender,
        mobile: profileForm.mobile,
        email: profileForm.email
      });

      setDashboardData((prev) => ({
        ...prev,
        student: { ...prev.student, ...updated }
      }));
      setStudent((prev) => ({ ...prev, ...updated }));
      setIsEditingProfile(false);
      setProfileAlert({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setProfileAlert(null), 5000);
    } catch (err) {
      setProfileAlert({ type: 'error', message: err.message || 'Failed to update profile' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordAlert(null);

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword) {
      setPasswordAlert({ type: 'error', message: 'Please enter your current password' });
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setPasswordAlert({ type: 'error', message: 'New password must be at least 6 characters long' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordAlert({ type: 'error', message: 'New passwords do not match' });
      return;
    }

    try {
      setPasswordLoading(true);
      await changeStudentPassword({
        roll: student.roll,
        email: student.email,
        currentPassword,
        newPassword
      });

      setPasswordAlert({
        type: 'success',
        message: 'Password changed successfully! Keep your new credentials safe.'
      });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setPasswordAlert(null), 6000);
    } catch (err) {
      setPasswordAlert({
        type: 'error',
        message: err.message || 'Incorrect current password or server error.'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Student Photo Url lookup
  const studentPhotoUrl = student?.roll
    ? `https://info.aec.edu.in/adityacentral/studentphotos/${student.roll.toUpperCase()}.jpg`
    : null;
  const [photoError, setPhotoError] = useState(false);

  // Active student details
  const activeStudent = dashboardData.student || student;
  const paymentsList = dashboardData.payments || [];
  const registrationsList = dashboardData.registrations || [];

  // Combined list of student's registered events (payments + registrations)
  const displayEventsList = useMemo(() => {
    const list = [...paymentsList];
    const seenRegNumbers = new Set(
      list.map((p) => p.registrationNumber || p.registrationId).filter(Boolean)
    );

    registrationsList.forEach((reg) => {
      const regNo = reg.registrationNumber || reg.registrationId;
      if (!seenRegNumbers.has(regNo)) {
        list.push({
          ...reg,
          eventTitle: reg.eventTitle || reg.eventName || reg.event_name || reg.event_title || 'Colours 2027 Event',
          paymentReference: reg.paymentReference || (regNo ? `PAY-${regNo}` : 'N/A'),
          amount: reg.amount !== undefined ? reg.amount : (reg.fee?.amount !== undefined ? reg.fee.amount : (reg.price || 0)),
          status: reg.payment?.status === 'PAID' ? 'PAID' : (reg.status || 'CONFIRMED'),
          participants: Array.isArray(reg.participants) && reg.participants.length > 0
            ? reg.participants
            : (reg.participant ? [reg.participant] : [])
        });
        if (regNo) seenRegNumbers.add(regNo);
      }
    });

    // Filter records matching EVENT_ACADEMIC_YEAR (VITE_EVENT_ACADEMIC_YEAR) from .env
    const academicYearFiltered = list.filter((item) => {
      const itemYear = item.academicYear || item.academic_year;
      return matchesAcademicYear(itemYear, EVENT_ACADEMIC_YEAR);
    });

    // Enrich each registered event with catalog metadata (category, subCategory, participationType)
    return academicYearFiltered.map((item) => {
      const itemTitle = (item.eventTitle || item.eventName || '').toLowerCase();
      const matched = catalogEvents.find((ev) => {
        const evTitle = (ev.eventName || ev.title || '').toLowerCase();
        return (
          (item.eventId && (ev._id === item.eventId || ev.rawId === item.eventId)) ||
          (evTitle && (evTitle === itemTitle || itemTitle.includes(evTitle) || evTitle.includes(itemTitle)))
        );
      });
      return {
        ...item,
        category: item.category || matched?.category || matched?.categoryName || '',
        subCategory: item.subCategory || matched?.subCategory || matched?.subcategoryName || '',
        participationType: item.participationType || matched?.participationType || ''
      };
    });
  }, [paymentsList, registrationsList, catalogEvents]);

  // If not logged in, prompt state
  if (!student) {
    return (
      <div className="student-dashboard-page">
        <div className="dashboard-container">
          <div className="empty-dash-card" style={{ padding: '5rem 2rem' }}>
            <div className="empty-dash-icon">🔒</div>
            <h2 className="empty-dash-title">Student Portal & Account Access</h2>
            <p className="empty-dash-desc">
              Please sign in with your student credentials or register your account to view your enrolled events, download official fest passes, and manage account security.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn-hero-action primary"
                onClick={() => setAuthModalOpen(true)}
              >
                ✦ Sign In / Register Account
              </button>
              <Link to="/events" className="btn-hero-action secondary">
                Browse Events
              </Link>
            </div>
          </div>
        </div>

        <StudentAuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => {
            setAuthModalOpen(false);
            setStudent(getLoggedStudent());
          }}
        />
      </div>
    );
  }

  // Compute stats
  const totalRegistrations = displayEventsList.length;
  const paidCount = displayEventsList.filter(
    (p) => p.status === 'PAID' || p.payment?.status === 'PAID' || p.paymentStatus === 'PAID' || p.status === 'CONFIRMED'
  ).length;
  const totalAmountPaid = displayEventsList.reduce(
    (acc, p) => acc + (Number(p.amount) || Number(p.fee?.amount) || 0),
    0
  );

  return (
    <div className="student-dashboard-page">
      <div className="dashboard-container">
        {/* ── Top Hero Card ── */}
        <section className="dashboard-hero-card">
          <div className="hero-profile-identity">
            <div className="hero-avatar-wrapper">
              {!photoError && studentPhotoUrl ? (
                <img
                  src={studentPhotoUrl}
                  alt={activeStudent.name}
                  className="hero-avatar-img"
                  onError={() => setPhotoError(true)}
                />
              ) : (
                <div className="hero-avatar-fallback">
                  {activeStudent.name ? activeStudent.name.charAt(0) : 'S'}
                </div>
              )}
              <span className="hero-avatar-badge" title="Verified Fest Delegate">
                ✓
              </span>
            </div>

            <div className="hero-info-group">
              <div className="hero-title-row">
                <h1 className="hero-student-name">{activeStudent.name}</h1>
                <span className="hero-roll-chip">{activeStudent.roll}</span>
              </div>
              <div className="hero-college-name">
                🏛️ {activeStudent.college === 'Other Institution' && activeStudent.otherCollege
                  ? activeStudent.otherCollege
                  : normalizeCollege(activeStudent.college)}
              </div>
              <div className="hero-contact-chips">
                <span className="hero-contact-pill">📧 {activeStudent.email}</span>
                <span className="hero-contact-pill">📱 {activeStudent.mobile}</span>
                {activeStudent.department && (
                  <span className="hero-contact-pill">🎓 {activeStudent.department}</span>
                )}
                {activeStudent.year && (
                  <span className="hero-contact-pill">📅 {activeStudent.year}</span>
                )}
              </div>
            </div>
          </div>

          <div className="hero-actions">
            <Link to="/events" className="btn-hero-action primary">
              ✦ Register for Events
            </Link>
            <button
              type="button"
              className="btn-hero-action danger"
              onClick={() => {
                logoutStudent();
                navigate('/events');
              }}
              title="Sign out of student account"
            >
              Sign Out
            </button>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="dashboard-metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-box pink">🎯</div>
            <div className="metric-content">
              <span className="metric-value">{totalRegistrations}</span>
              <span className="metric-label">Enrolled Events</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box emerald">✅</div>
            <div className="metric-content">
              <span className="metric-value">{paidCount}</span>
              <span className="metric-label">Confirmed Passes</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box amber">💳</div>
            <div className="metric-content">
              <span className="metric-value">₹ {totalAmountPaid}</span>
              <span className="metric-label">Total Fee Paid</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-box purple">🎟️</div>
            <div className="metric-content">
              <span className="metric-value">ACTIVE</span>
              <span className="metric-label">Festival Status</span>
            </div>
          </div>
        </section>

        {/* ── Navigation Tabs ── */}
        <nav className="dashboard-tabs-nav" aria-label="Dashboard views">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 Student Profile & ID
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔒 Change Password
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            🎟️ Registered Events & Receipts
            <span className="tab-badge">{displayEventsList.length}</span>
          </button>
        </nav>

        {/* ── Global Alerts ── */}
        {profileAlert && (
          <div className={`dash-alert ${profileAlert.type}`}>
            {profileAlert.type === 'success' ? '✅' : '⚠️'} {profileAlert.message}
          </div>
        )}

        {/* ── TAB 1: Profile & Digital Fest ID ── */}
        {activeTab === 'profile' && (
          <div className="tab-content-panel">
            <div className="profile-panel-grid">
              {/* Profile Card */}
              <div className="profile-card">
                <div className="card-header-row">
                  <div className="card-title-group">
                    <h3>Student Account Information</h3>
                    <p>Verified profile details recorded in central festival register</p>
                  </div>
                  <button
                    type="button"
                    className="btn-toggle-edit"
                    onClick={() => {
                      setIsEditingProfile(!isEditingProfile);
                      setProfileAlert(null);
                    }}
                  >
                    {isEditingProfile ? '✕ Cancel' : '✎ Edit Details'}
                  </button>
                </div>

                {!isEditingProfile ? (
                  /* View Mode */
                  <div className="profile-info-grid">
                    <div className="info-item">
                      <span className="info-label">Full Name</span>
                      <span className="info-value">{activeStudent.name || '—'}</span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Roll / Student ID</span>
                      <span className="info-value highlight">{activeStudent.roll || '—'}</span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Institution</span>
                      <span className="info-value">
                        {activeStudent.college === 'Other Institution' && activeStudent.otherCollege
                          ? activeStudent.otherCollege
                          : normalizeCollege(activeStudent.college)}
                      </span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Department / Branch</span>
                      <span className="info-value">{activeStudent.department || 'General'}</span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Academic Year</span>
                      <span className="info-value">{activeStudent.year || '3rd Year'}</span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Gender</span>
                      <span className="info-value">{activeStudent.gender || '—'}</span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Mobile Number</span>
                      <span className="info-value">{activeStudent.mobile || '—'}</span>
                    </div>

                    <div className="info-item">
                      <span className="info-label">Registered Email</span>
                      <span className="info-value">{activeStudent.email || '—'}</span>
                    </div>
                  </div>
                ) : (
                  /* Edit Mode */
                  <form onSubmit={handleSaveProfile} className="profile-form-grid">
                    <div className="form-group-dash">
                      <label htmlFor="edit-name">Full Name *</label>
                      <input
                        id="edit-name"
                        type="text"
                        name="name"
                        className="form-input-dash"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>

                    <div className="form-group-dash">
                      <label htmlFor="edit-roll">Roll Number (Permanent)</label>
                      <input
                        id="edit-roll"
                        type="text"
                        name="roll"
                        className="form-input-dash"
                        value={profileForm.roll}
                        disabled
                        title="Roll number cannot be changed"
                      />
                    </div>

                    <div className="form-group-dash">
                      <label htmlFor="edit-college">Institution *</label>
                      <select
                        id="edit-college"
                        name="college"
                        className="form-input-dash"
                        value={profileForm.college}
                        onChange={handleProfileChange}
                      >
                        {COLLEGE_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {profileForm.college === 'Other Institution' && (
                      <div className="form-group-dash">
                        <label htmlFor="edit-otherCollege">Specify Institution Name *</label>
                        <input
                          id="edit-otherCollege"
                          type="text"
                          name="otherCollege"
                          className="form-input-dash"
                          value={profileForm.otherCollege}
                          onChange={handleProfileChange}
                          onBlur={(e) => handleOtherCollegeBlur(e.target.value)}
                          placeholder="Enter your college/university name"
                          style={{
                            borderColor: otherCollegeError
                              ? '#ef4444'
                              : profileForm.otherCollege && isValidOtherCollege(profileForm.otherCollege)
                                ? '#10b981'
                                : '#cbd5e1',
                            backgroundColor: otherCollegeError
                              ? '#fef2f2'
                              : profileForm.otherCollege && isValidOtherCollege(profileForm.otherCollege)
                                ? '#f0fdf4'
                                : '#ffffff'
                          }}
                          required
                        />
                        {otherCollegeError ? (
                          <span
                            style={{
                              color: '#dc2626',
                              fontWeight: 600,
                              fontSize: '0.78rem',
                              marginTop: '4px',
                              display: 'block'
                            }}
                          >
                            {otherCollegeError}
                          </span>
                        ) : profileForm.otherCollege && isValidOtherCollege(profileForm.otherCollege) ? (
                          <span
                            style={{
                              color: '#0284c7',
                              fontWeight: 600,
                              fontSize: '0.78rem',
                              marginTop: '4px',
                              display: 'block'
                            }}
                          >
                            ℹ️ College ID Card is required for entry and verification.
                          </span>
                        ) : null}
                      </div>
                    )}

                    <div className="form-group-dash">
                      <label htmlFor="edit-department">Department / Branch</label>
                      <input
                        id="edit-department"
                        type="text"
                        name="department"
                        className="form-input-dash"
                        value={profileForm.department}
                        onChange={handleProfileChange}
                        placeholder="e.g. CSE, ECE, EEE, Mechanical"
                      />
                    </div>

                    <div className="form-group-dash">
                      <label htmlFor="edit-year">Year of Study</label>
                      <select
                        id="edit-year"
                        name="year"
                        className="form-input-dash"
                        value={profileForm.year}
                        onChange={handleProfileChange}
                      >
                        {YEAR_OPTIONS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group-dash">
                      <label htmlFor="edit-gender">Gender *</label>
                      <select
                        id="edit-gender"
                        name="gender"
                        className="form-input-dash"
                        value={profileForm.gender}
                        onChange={handleProfileChange}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="form-group-dash">
                      <label htmlFor="edit-mobile">Mobile Number *</label>
                      <input
                        id="edit-mobile"
                        type="tel"
                        name="mobile"
                        className="form-input-dash"
                        value={profileForm.mobile}
                        onChange={handleProfileChange}
                        maxLength={10}
                        required
                      />
                    </div>

                    <div className="form-group-dash">
                      <label htmlFor="edit-email">Email Address *</label>
                      <input
                        id="edit-email"
                        type="email"
                        name="email"
                        className="form-input-dash"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        required
                      />
                    </div>

                    <div className="form-actions-bar">
                      <button
                        type="button"
                        className="btn-hero-action secondary"
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn-save-profile"
                        disabled={profileSaving}
                      >
                        {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Digital Fest Delegate Card */}
              <div className="fest-pass-card">
                <div className="pass-top-header">
                  <div className="pass-fest-badge">COLOURS 2027</div>
                  <span className="pass-chip-status">OFFICIAL DELEGATE</span>
                </div>

                <div className="pass-body">
                  <div className="pass-photo-frame">
                    {!photoError && studentPhotoUrl ? (
                      <img
                        src={studentPhotoUrl}
                        alt={activeStudent.name}
                        onError={() => setPhotoError(true)}
                      />
                    ) : (
                      <div className="hero-avatar-fallback" style={{ fontSize: '1.75rem' }}>
                        {activeStudent.name ? activeStudent.name.charAt(0) : 'S'}
                      </div>
                    )}
                  </div>
                  <div className="pass-meta">
                    <span className="pass-name">{activeStudent.name}</span>
                    <span className="pass-roll">{activeStudent.roll}</span>
                    <span className="pass-college">
                      {activeStudent.college === 'Other Institution' && activeStudent.otherCollege
                        ? activeStudent.otherCollege
                        : activeStudent.college}
                    </span>
                  </div>
                </div>

                <div className="pass-barcode-box">
                  <div className="pass-barcode-lines" />
                  <span className="pass-barcode-text">CLR27-{activeStudent.roll}</span>
                </div>

                <button
                  type="button"
                  className="btn-print-pass"
                  onClick={() => window.print()}
                >
                  🖨️ Print Delegate Card
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: Change Password ── */}
        {activeTab === 'security' && (
          <div className="tab-content-panel">
            <div className="security-panel-grid">
              <div className="password-card">
                <div className="card-header-row">
                  <div className="card-title-group">
                    <h3>Account Security & Password</h3>
                    <p>Update your portal access key to keep your festival account safe</p>
                  </div>
                </div>

                {passwordAlert && (
                  <div className={`dash-alert ${passwordAlert.type}`}>
                    {passwordAlert.type === 'success' ? '✅' : '⚠️'} {passwordAlert.message}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="profile-form-grid">
                  <div className="form-group-dash full-width">
                    <label htmlFor="current-pw">Current Password *</label>
                    <div className="password-input-wrapper">
                      <input
                        id="current-pw"
                        type={showCurrentPw ? 'text' : 'password'}
                        className="form-input-dash"
                        placeholder="Enter current password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value
                          }))
                        }
                        required
                      />
                      <button
                        type="button"
                        className="btn-eye-toggle"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        aria-label="Toggle Current Password Visibility"
                      >
                        {showCurrentPw ? '👁️' : '🔒'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group-dash full-width">
                    <label htmlFor="new-pw">New Password (minimum 6 characters) *</label>
                    <div className="password-input-wrapper">
                      <input
                        id="new-pw"
                        type={showNewPw ? 'text' : 'password'}
                        className="form-input-dash"
                        placeholder="Enter new strong password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value
                          }))
                        }
                        required
                      />
                      <button
                        type="button"
                        className="btn-eye-toggle"
                        onClick={() => setShowNewPw(!showNewPw)}
                        aria-label="Toggle New Password Visibility"
                      >
                        {showNewPw ? '👁️' : '🔒'}
                      </button>
                    </div>
                  </div>

                  <div className="form-group-dash full-width">
                    <label htmlFor="confirm-pw">Confirm New Password *</label>
                    <div className="password-input-wrapper">
                      <input
                        id="confirm-pw"
                        type={showConfirmPw ? 'text' : 'password'}
                        className="form-input-dash"
                        placeholder="Re-type new password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value
                          }))
                        }
                        required
                      />
                      <button
                        type="button"
                        className="btn-eye-toggle"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        aria-label="Toggle Confirm Password Visibility"
                      >
                        {showConfirmPw ? '👁️' : '🔒'}
                      </button>
                    </div>
                  </div>

                  <div className="form-actions-bar">
                    <button
                      type="submit"
                      className="btn-save-profile"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Safety Tips Card */}
              <div className="security-tips-card">
                <h4>🛡️ Password & Festival Guidelines</h4>
                <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
                  Your password protects your event participation slips, registered team details, and on-spot certificate verification.
                </p>
                <ul className="security-tips-list">
                  <li>
                    <span className="bullet">✦</span>
                    Use at least 6 characters with a combination of letters and numbers.
                  </li>
                  <li>
                    <span className="bullet">✦</span>
                    Do not share your credentials with unauthorized participants.
                  </li>
                  <li>
                    <span className="bullet">✦</span>
                    Your registered Roll Number <strong>{activeStudent.roll}</strong> is required for on-stage attendance verification.
                  </li>
                  <li>
                    <span className="bullet">✦</span>
                    If you forget your password, contact the fest central registration desk with your college ID card.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: Registered Events & Receipts ── */}
        {activeTab === 'events' && (
          <div className="tab-content-panel">
            {displayEventsList.length === 0 ? (
              <div className="empty-dash-card">
                <div className="empty-dash-icon">🎪</div>
                <h3 className="empty-dash-title">No Enrolled Events Found</h3>
                <p className="empty-dash-desc">
                  You haven't registered for any events in Colours 2027 yet. Explore exciting competitions across Sports, Culturals, and Creo!
                </p>
                <Link to="/events" className="btn-hero-action primary">
                  ✦ Explore & Register Events
                </Link>
              </div>
            ) : (
              <div className="events-list-wrapper">
                {displayEventsList.map((payment) => {
                  const rawRegId = payment.registrationNumber || payment.registrationId;
                  const rawPayRef = payment.paymentReference;
                  const regId = formatRegistrationId(rawRegId);
                  const payRef = formatPaymentReference(rawPayRef || rawRegId);
                  const title = payment.eventTitle || payment.eventName || 'Colours 2027 Event';
                  const teamParticipants = Array.isArray(payment.participants)
                    ? payment.participants
                    : [];
                  const isSports = isSportsAndGamesEvent(payment, catalogEvents);

                  return (
                    <article key={payment._id || payRef} className="event-receipt-card">
                      <div className="event-card-header">
                        <div>
                          <div className="event-badge-group">
                            <span className="event-category-pill">
                              {payment.typeCode || 'COLORS'}
                            </span>
                            <span className={`event-status-pill ${String(payment.status || '').toLowerCase() === 'paid' ? 'paid' : 'pending'}`}>
                              ✓ {payment.status || 'PAID'}
                            </span>
                          </div>
                          <h4 className="event-main-title">{title}</h4>
                        </div>

                        <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                          {isSports && (
                            <button
                              type="button"
                              className="btn-manage-team"
                              onClick={() => setEditingTeamReg(payment)}
                              title="Add or update your squad members for this event"
                            >
                              👥 Manage Squad / Add Participants
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-print-receipt"
                            onClick={() => setSelectedReceipt(payment)}
                          >
                            📄 View / Print Slip
                          </button>
                        </div>
                      </div>

                      <div className="event-details-grid">
                        <div className="detail-col">
                          <span className="label">Registration ID</span>
                          <span className="val code">{regId}</span>
                        </div>
                        <div className="detail-col">
                          <span className="label">Payment Reference</span>
                          <span className="val code">{payRef}</span>
                        </div>
                        <div className="detail-col">
                          <span className="label">Razorpay Payment ID</span>
                          <span className="val code">
                            {payment.razorpay?.paymentId || payment.paymentId || 'Verified Gateway'}
                          </span>
                        </div>
                        <div className="detail-col">
                          <span className="label">Amount Paid</span>
                          <span className="val price">₹ {payment.amount}</span>
                        </div>
                        <div className="detail-col">
                          <span className="label">Confirmed Date</span>
                          <span className="val">
                            {payment.createdAt
                              ? new Date(payment.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Confirmed'}
                          </span>
                        </div>
                      </div>

                      {teamParticipants.length > 0 ? (
                        <div className="team-participants-box">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                            <h5 style={{ margin: 0 }}>
                              {isSports
                                ? `Squad / Participants List (${teamParticipants.length})`
                                : `Participant Details (${teamParticipants.length})`}
                            </h5>
                            {isSports && (
                              <button
                                type="button"
                                className="btn-add-squad-inline"
                                onClick={() => setEditingTeamReg(payment)}
                              >
                                ✎ Edit / Add Participants
                              </button>
                            )}
                          </div>
                          <div className="participants-chips-wrap">
                            {teamParticipants.map((p, idx) => (
                              <div
                                key={idx}
                                className={`participant-chip ${p.isLeader ? 'leader' : ''}`}
                              >
                                {p.isLeader ? (isSports ? '👑 ' : '👤 ') : '👤 '}
                                <strong>{p.name}</strong>
                                <span className="roll">({p.rollNumber || p.roll})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="team-participants-box" style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '0.9rem 1.15rem', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                            <span style={{ fontSize: '0.86rem', color: '#64748b' }}>
                              {isSports
                                ? '👥 Only Team Leader registered so far. You can add the rest of your squad participants now!'
                                : '👤 Registered Participant (Solo Entry)'}
                            </span>
                            {isSports && (
                              <button
                                type="button"
                                className="btn-add-squad-inline"
                                onClick={() => setEditingTeamReg(payment)}
                              >
                                + Add Team Participants
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Printable Slip / Receipt Modal ── */}
        {selectedReceipt && (
          <div
            className="receipt-modal-backdrop"
            onClick={() => setSelectedReceipt(null)}
          >
            <div
              className="printable-slip-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="slip-header">
                <div className="slip-logo">COLOURS 2027</div>
                <div className="slip-subtitle">
                  Aditya University Youth Cultural & Sports Festival
                </div>
                <span className="slip-status-badge">✓ OFFICIAL PAYMENT RECEIPT</span>
              </div>

              <table className="slip-table">
                <tbody>
                  <tr>
                    <td className="lbl">Registration ID:</td>
                    <td className="val" style={{ color: '#e11d48' }}>
                      {formatRegistrationId(selectedReceipt.registrationNumber || selectedReceipt.registrationId)}
                    </td>
                  </tr>
                  <tr>
                    <td className="lbl">Payment Reference:</td>
                    <td className="val" style={{ color: '#0284c7' }}>
                      {formatPaymentReference(selectedReceipt.paymentReference || selectedReceipt.registrationNumber || selectedReceipt.registrationId)}
                    </td>
                  </tr>
                  <tr>
                    <td className="lbl">Razorpay Payment ID:</td>
                    <td className="val" style={{ color: '#059669' }}>
                      {selectedReceipt.razorpay?.paymentId || selectedReceipt.paymentId || selectedReceipt.payment?.paymentId || 'Pending Verification'}
                    </td>
                  </tr>
                  <tr>
                    <td className="lbl">Razorpay Order ID:</td>
                    <td className="val" style={{ color: '#7c3aed' }}>
                      {selectedReceipt.razorpay?.orderId || selectedReceipt.payment?.orderId || 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td className="lbl">Event Name:</td>
                    <td className="val">{selectedReceipt.eventTitle || selectedReceipt.eventName || selectedReceipt.event_name}</td>
                  </tr>
                  <tr>
                    <td className="lbl">Lead Participant:</td>
                    <td className="val">
                      {selectedReceipt.student?.name || selectedReceipt.participant?.name || selectedReceipt.student_name || activeStudent?.name} ({selectedReceipt.student?.rollNumber || selectedReceipt.student?.roll || selectedReceipt.participant?.rollNumber || selectedReceipt.roll_number || activeStudent?.roll})
                    </td>
                  </tr>
                  <tr>
                    <td className="lbl">College:</td>
                    <td className="val">{selectedReceipt.student?.college || selectedReceipt.participant?.college || activeStudent?.college}</td>
                  </tr>
                  <tr>
                    <td className="lbl">Amount Paid:</td>
                    <td className="val" style={{ color: '#15803d', fontSize: '1.05rem' }}>
                      ₹ {selectedReceipt.amount !== undefined ? selectedReceipt.amount : (selectedReceipt.fee?.amount || 0)}/-
                    </td>
                  </tr>
                  <tr>
                    <td className="lbl">Status:</td>
                    <td className="val" style={{ color: '#15803d' }}>
                      {selectedReceipt.payment?.status === 'PAID' || selectedReceipt.status === 'PAID' ? 'CONFIRMED & PAID' : (selectedReceipt.status || 'CONFIRMED')}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="slip-barcode-area">
                <div className="pass-barcode-lines" style={{ height: '36px' }} />
                <div className="pass-barcode-text">
                  {formatRegistrationId(selectedReceipt.registrationNumber || selectedReceipt.paymentReference || selectedReceipt.registrationId)}
                </div>
              </div>

              <div className="slip-actions">
                <button
                  type="button"
                  className="btn-slip-print"
                  onClick={() => window.print()}
                >
                  🖨️ Print Receipt
                </button>
                <button
                  type="button"
                  className="btn-slip-close"
                  onClick={() => setSelectedReceipt(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Manage Team Participants Modal (Sports & Games only) ── */}
        {editingTeamReg && isSportsAndGamesEvent(editingTeamReg, catalogEvents) && (
          <ManageTeamModal
            isOpen={Boolean(editingTeamReg)}
            registration={editingTeamReg}
            onClose={() => setEditingTeamReg(null)}
            onUpdated={(updated) => {
              setDashboardData((prev) => ({
                ...prev,
                payments: prev.payments.map((p) =>
                  (p.registrationNumber === updated.registrationNumber || p.paymentReference === updated.paymentReference)
                    ? { ...p, participants: updated.participants, teamSize: updated.teamSize }
                    : p
                ),
                registrations: prev.registrations.map((r) =>
                  (r.registrationNumber === updated.registrationNumber || r.paymentReference === updated.paymentReference)
                    ? { ...r, participants: updated.participants, teamSize: updated.teamSize }
                    : r
                )
              }));
              if (
                selectedReceipt &&
                (selectedReceipt.registrationNumber === updated.registrationNumber ||
                  selectedReceipt.paymentReference === updated.paymentReference)
              ) {
                setSelectedReceipt({
                  ...selectedReceipt,
                  participants: updated.participants,
                  teamSize: updated.teamSize
                });
              }
              loadDashboard();
            }}
          />
        )}
      </div>
    </div>
  );
}
