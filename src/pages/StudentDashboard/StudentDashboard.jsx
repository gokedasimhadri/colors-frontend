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
  matchesAcademicYear
} from '../../services/api';
import {
  Ticket,
  User,
  Lock,
  KeyRound,
  Check,
  CheckCircle2,
  AlertTriangle,
  Landmark,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  Target,
  CreditCard,
  Sparkles,
  Zap,
  Printer,
  Eye,
  EyeOff,
  Edit3,
  X,
  ShieldCheck,
  CalendarX2,
  Users,
  FileText,
  UserPlus,
  Crown
} from 'lucide-react';
import StudentAuthModal from '../../components/RegistrationModals/StudentAuthModal';
import ManageTeamModal from '../../components/RegistrationModals/ManageTeamModal';
import { MuiTextField, MuiSelectField } from '../../components/RegistrationModals/MuiTextField';
import LiquidGlass from '../../components/ThemeComponents/LiquidGlass/LiquidGlass';
import ThemeButton from '../../components/ThemeComponents/ThemeButton/ThemeButton';
import ThemeTab from '../../components/ThemeComponents/ThemeTabDesign/ThemeTab';
import SplitColorText from '../../components/ThemeComponents/SplitColor/SplitColorText';
import './StudentDashboard.css';

const COLLEGE_OPTIONS = [
  'Aditya University',
  'Aditya Engineering College (AEC)',
  'Aditya College of Engineering & Technology (ACET)',
  'Aditya College of Engineering (ACOE)',
  'Other Institution'
];

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
      .catch(() => { });
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
        college: st.college || 'Aditya University',
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
        college: current.college || 'Aditya University',
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

  // Handle Profile Form Change
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    if (profileAlert) setProfileAlert(null);
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

  // Navigation tabs definition
  const dashboardTabs = useMemo(() => [
    {
      id: 'events',
      label: (
        <span className="dash-tab-pill-content">
          <Ticket size={16} className="tab-lucide-icon" />
          {activeTab === 'events' ? (
            <span className="dash-tab-title active">Registered Events</span>
          ) : (
            <SplitColorText leftColor="#0f172a" rightColor="#be9337">
              Registered Events
            </SplitColorText>
          )}
          {displayEventsList.length > 0 && (
            <span className="dash-tab-counter-badge">{displayEventsList.length}</span>
          )}
        </span>
      )
    },
    {
      id: 'profile',
      label: (
        <span className="dash-tab-pill-content">
          <User size={16} className="tab-lucide-icon" />
          {activeTab === 'profile' ? (
            <span className="dash-tab-title active">Profile & ID</span>
          ) : (
            <SplitColorText leftColor="#0f172a" rightColor="#be9337">
              Profile & ID
            </SplitColorText>
          )}
        </span>
      )
    },
    {
      id: 'security',
      label: (
        <span className="dash-tab-pill-content">
          <KeyRound size={16} className="tab-lucide-icon" />
          {activeTab === 'security' ? (
            <span className="dash-tab-title active">Change Password</span>
          ) : (
            <SplitColorText leftColor="#0f172a" rightColor="#be9337">
              Change Password
            </SplitColorText>
          )}
        </span>
      )
    }
  ], [activeTab, displayEventsList.length]);

  // If not logged in, prompt state
  if (!student) {
    return (
      <div className="student-dashboard-page">
        <div className="dashboard-container">
          <LiquidGlass
            className="empty-dash-card empty-glass-card"
            theme="light"
            borderRadius={24}
            enableShader={true}
            style={{ padding: '4.5rem 2rem' }}
          >
            <div className="empty-dash-icon">
              <Lock size={44} strokeWidth={1.8} />
            </div>
            <SplitColorText as="h2" className="empty-dash-title" splitPercent={50} leftColor="#0f172a" rightColor="#be9337">
              Student Portal & Account Access
            </SplitColorText>
            <p className="empty-dash-desc">
              Please sign in with your student credentials or register your account to view your enrolled events, download official fest passes, and manage account security.
            </p>
            <div className="dash-empty-actions-row">
              <ThemeButton
                type="button"
                className="btn-dash-primary"
                borderRadius={12}
                height={46}
                showBlast={false}
                onClick={() => setAuthModalOpen(true)}
              >
                <span className="btn-icon-label" style={{ color: '#ffffff' }}>
                  <Sparkles size={16} /> Sign In / Register Account
                </span>
              </ThemeButton>
              <ThemeButton
                to="/events"
                className="btn-dash-secondary"
                borderRadius={12}
                height={46}
                showBlast={false}
              >
                Browse Events
              </ThemeButton>
            </div>
          </LiquidGlass>
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
        <LiquidGlass
          as="section"
          className="dashboard-hero-card dashboard-glass-card"
          theme="light"
          borderRadius={24}
          enableShader={false}
        >
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
                <Check size={14} strokeWidth={3} />
              </span>
            </div>

            <div className="hero-info-group">
              <div className="hero-title-row">
                <SplitColorText as="h1" className="hero-student-name" splitPercent={50} leftColor="#0f172a" rightColor="#be9337">
                  {activeStudent.name}
                </SplitColorText>
                <span className="hero-roll-chip">{activeStudent.roll}</span>
              </div>
              <div className="hero-college-name">
                <Landmark size={15} className="hero-icon" /> {activeStudent.college === 'Other Institution' && activeStudent.otherCollege
                  ? activeStudent.otherCollege
                  : activeStudent.college || 'Aditya University'}
              </div>
              <div className="hero-contact-chips">
                <span className="hero-contact-pill">
                  <Mail size={13} className="hero-icon" /> {activeStudent.email}
                </span>
                <span className="hero-contact-pill">
                  <Phone size={13} className="hero-icon" /> {activeStudent.mobile}
                </span>
                {activeStudent.department && (
                  <span className="hero-contact-pill">
                    <GraduationCap size={13} className="hero-icon" /> {activeStudent.department}
                  </span>
                )}
                {activeStudent.year && (
                  <span className="hero-contact-pill">
                    <Calendar size={13} className="hero-icon" /> {activeStudent.year}
                  </span>
                )}
              </div>
            </div>
          </div>
        </LiquidGlass>

        {/* ── Stats Bar ── */}
        <section className="dashboard-metrics-grid">
          <LiquidGlass className="metric-card metric-glass-card" theme="light" borderRadius={18} enableShader={false}>
            <div className="metric-icon-box pink">
              <Target size={24} strokeWidth={2.2} />
            </div>
            <div className="metric-content">
              <SplitColorText as="span" className="metric-value" splitPercent={50} leftColor="#0f172a" rightColor="#be9337">
                {totalRegistrations}
              </SplitColorText>
              <span className="metric-label">Enrolled Events</span>
            </div>
          </LiquidGlass>

          <LiquidGlass className="metric-card metric-glass-card" theme="light" borderRadius={18} enableShader={false}>
            <div className="metric-icon-box emerald">
              <CheckCircle2 size={24} strokeWidth={2.2} />
            </div>
            <div className="metric-content">
              <SplitColorText as="span" className="metric-value" splitPercent={50} leftColor="#0f172a" rightColor="#be9337">
                {paidCount}
              </SplitColorText>
              <span className="metric-label">Confirmed Passes</span>
            </div>
          </LiquidGlass>

          <LiquidGlass className="metric-card metric-glass-card" theme="light" borderRadius={18} enableShader={false}>
            <div className="metric-icon-box amber">
              <CreditCard size={24} strokeWidth={2.2} />
            </div>
            <div className="metric-content">
              <SplitColorText as="span" className="metric-value" splitPercent={50} leftColor="#0f172a" rightColor="#be9337">
                ₹ {totalAmountPaid}
              </SplitColorText>
              <span className="metric-label">Total Fee Paid</span>
            </div>
          </LiquidGlass>

          <LiquidGlass className="metric-card metric-glass-card" theme="light" borderRadius={18} enableShader={false}>
            <div className="metric-icon-box purple">
              <Zap size={24} strokeWidth={2.2} />
            </div>
            <div className="metric-content">
              <SplitColorText as="span" className="metric-value" splitPercent={50} leftColor="#0f172a" rightColor="#be9337">
                ACTIVE
              </SplitColorText>
              <span className="metric-label">Festival Status</span>
            </div>
          </LiquidGlass>
        </section>

        {/* ── Navigation Tabs ── */}
        <div className="dashboard-themetab-wrapper">
          <ThemeTab
            tabs={dashboardTabs}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(typeof tabId === 'object' ? tabId.id : tabId)}
            size="md"
            showSearch={false}
            leftColor="#0f172a"
            rightColor="#be9337"
            activeBg="#be9337"
            activeColor="#ffffff"
            className="dashboard-themetab-bar"
            ariaLabel="Dashboard Navigation Tabs"
          />
        </div>

        {/* ── Global Alerts ── */}
        {profileAlert && (
          <div className={`dash-alert ${profileAlert.type}`}>
            {profileAlert.type === 'success' ? (
              <CheckCircle2 size={16} className="alert-lucide-icon" />
            ) : (
              <AlertTriangle size={16} className="alert-lucide-icon" />
            )}{' '}
            <span>{profileAlert.message}</span>
          </div>
        )}

        {/* ── TAB 1: Profile & Digital Fest ID ── */}
        {activeTab === 'profile' && (
          <div className="tab-content-panel">
            <div className="profile-panel-grid">
              {/* Profile Card */}
              <LiquidGlass className="profile-card profile-glass-card" theme="light" borderRadius={22} enableShader={true}>
                <div className="card-header-row">
                  <div className="card-title-group">
                    <SplitColorText as="h3" splitPercent={50} leftColor="#0f172a" rightColor="#be9337">
                      Student Account Information
                    </SplitColorText>
                    <p>Verified profile details recorded in central festival register</p>
                  </div>
                  <ThemeButton
                    type="button"
                    className="btn-dash-outline"
                    borderRadius={10}
                    height={36}
                    showBlast={false}
                    onClick={() => {
                      setIsEditingProfile(!isEditingProfile);
                      setProfileAlert(null);
                    }}
                  >
                    {isEditingProfile ? (
                      <span className="btn-icon-label">
                        <X size={15} /> Cancel
                      </span>
                    ) : (
                      <span className="btn-icon-label">
                        <Edit3 size={15} /> Edit Details
                      </span>
                    )}
                  </ThemeButton>
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
                          : activeStudent.college || '—'}
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
                    <MuiTextField
                      label="Full Name"
                      name="name"
                      id="edit-name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                    />

                    <MuiTextField
                      label="Roll Number (Permanent)"
                      name="roll"
                      id="edit-roll"
                      value={profileForm.roll}
                      disabled
                      title="Roll number cannot be changed"
                    />

                    <MuiSelectField
                      label="Institution"
                      name="college"
                      id="edit-college"
                      value={profileForm.college}
                      onChange={handleProfileChange}
                      required
                      options={COLLEGE_OPTIONS}
                    />

                    {profileForm.college === 'Other Institution' && (
                      <MuiTextField
                        label="Specify Institution Name"
                        name="otherCollege"
                        id="edit-otherCollege"
                        value={profileForm.otherCollege}
                        onChange={handleProfileChange}
                        placeholder="Enter your college/university name"
                        className="full-width"
                        required
                      />
                    )}

                    <MuiTextField
                      label="Department / Branch"
                      name="department"
                      id="edit-department"
                      value={profileForm.department}
                      onChange={handleProfileChange}
                      placeholder="e.g. CSE, ECE, EEE, Mechanical"
                    />

                    <MuiSelectField
                      label="Year of Study"
                      name="year"
                      id="edit-year"
                      value={profileForm.year}
                      onChange={handleProfileChange}
                      options={YEAR_OPTIONS}
                    />

                    <MuiSelectField
                      label="Gender"
                      name="gender"
                      id="edit-gender"
                      value={profileForm.gender}
                      onChange={handleProfileChange}
                      required
                      options={['Male', 'Female', 'Other']}
                    />

                    <MuiTextField
                      label="Mobile Number"
                      type="tel"
                      name="mobile"
                      id="edit-mobile"
                      value={profileForm.mobile}
                      onChange={handleProfileChange}
                      maxLength={10}
                      required
                    />

                    <MuiTextField
                      label="Email Address"
                      type="email"
                      name="email"
                      id="edit-email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      required
                    />

                    <div className="form-actions-bar">
                      <ThemeButton
                        type="button"
                        className="btn-dash-secondary"
                        borderRadius={12}
                        height={44}
                        showBlast={false}
                        onClick={() => setIsEditingProfile(false)}
                      >
                        Cancel
                      </ThemeButton>
                      <ThemeButton
                        type="submit"
                        className="btn-dash-primary"
                        borderRadius={12}
                        height={44}
                        showBlast={false}
                        disabled={profileSaving}
                      >
                        <span className="btn-icon-label" style={{ color: '#ffffff' }}>
                          {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                        </span>
                      </ThemeButton>
                    </div>
                  </form>
                )}
              </LiquidGlass>

              {/* Digital Fest Delegate Card */}
              <LiquidGlass className="fest-pass-card fest-pass-glass-card" theme="light" borderRadius={22} enableShader={true}>
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

                <ThemeButton
                  type="button"
                  className="btn-dash-primary"
                  borderRadius={12}
                  height={44}
                  showBlast={false}
                  onClick={() => window.print()}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  <span className="btn-icon-label" style={{ color: '#ffffff' }}>
                    <Printer size={16} /> Print Delegate Card
                  </span>
                </ThemeButton>
              </LiquidGlass>
            </div>
          </div>
        )}

        {/* ── TAB 2: Change Password ── */}
        {activeTab === 'security' && (
          <div className="tab-content-panel">
            <div className="security-panel-grid">
              <LiquidGlass className="password-card password-glass-card" theme="light" borderRadius={22} enableShader={true}>
                <div className="card-header-row">
                  <div className="card-title-group">
                    <SplitColorText as="h3" splitPercent={50} leftColor="#0f172a" rightColor="#be9337">
                      Account Security & Password
                    </SplitColorText>
                    <p>Update your portal access key to keep your festival account safe</p>
                  </div>
                </div>

                {passwordAlert && (
                  <div className={`dash-alert ${passwordAlert.type}`}>
                    {passwordAlert.type === 'success' ? (
                      <CheckCircle2 size={16} className="alert-lucide-icon" />
                    ) : (
                      <AlertTriangle size={16} className="alert-lucide-icon" />
                    )}{' '}
                    <span>{passwordAlert.message}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="profile-form-grid">
                  <MuiTextField
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    id="current-pw"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value
                      }))
                    }
                    placeholder="Enter current password"
                    className="full-width"
                    required
                  />

                  <MuiTextField
                    label="New Password (minimum 6 characters)"
                    type="password"
                    name="newPassword"
                    id="new-pw"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value
                      }))
                    }
                    placeholder="Enter new strong password"
                    className="full-width"
                    required
                  />

                  <MuiTextField
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    id="confirm-pw"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }))
                    }
                    placeholder="Re-type new password"
                    className="full-width"
                    required
                  />

                  <div className="form-actions-bar">
                    <ThemeButton
                      type="submit"
                      className="btn-dash-primary"
                      borderRadius={12}
                      height={44}
                      showBlast={false}
                      disabled={passwordLoading}
                    >
                      <span className="btn-icon-label" style={{ color: '#ffffff' }}>
                        {passwordLoading ? 'Updating Password...' : 'Update Password'}
                      </span>
                    </ThemeButton>
                  </div>
                </form>
              </LiquidGlass>

              {/* Safety Tips Card */}
              <LiquidGlass className="security-tips-card security-glass-card" theme="light" borderRadius={22} enableShader={false}>
                <SplitColorText as="h4" splitPercent={50} leftColor="#0f172a" rightColor="#be9337">
                  <span className="tips-header-wrap">
                    <ShieldCheck size={20} className="security-tips-icon" />
                    Password & Festival Guidelines
                  </span>
                </SplitColorText>
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
              </LiquidGlass>
            </div>
          </div>
        )}

        {/* ── TAB 3: Registered Events & Receipts ── */}
        {activeTab === 'events' && (
          <div className="tab-content-panel">
            {displayEventsList.length === 0 ? (
              <LiquidGlass className="empty-dash-card empty-glass-card" theme="light" borderRadius={22} enableShader={true}>
                <div className="empty-dash-icon">
                  <CalendarX2 size={44} strokeWidth={1.8} />
                </div>
                <SplitColorText as="h3" className="empty-dash-title" splitPercent={50} leftColor="#0f172a" rightColor="#be9337">
                  No Enrolled Events Found
                </SplitColorText>
                <p className="empty-dash-desc">
                  You haven't registered for any events in Colours 2027 yet. Explore exciting competitions across Sports, Culturals, and Creo!
                </p>
                <ThemeButton
                  to="/events"
                  className="btn-dash-primary"
                  borderRadius={12}
                  height={44}
                  showBlast={false}
                >
                  <span className="btn-icon-label" style={{ color: '#ffffff' }}>
                    <Sparkles size={16} /> Explore & Register Events
                  </span>
                </ThemeButton>
              </LiquidGlass>
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
                    <LiquidGlass
                      as="article"
                      key={payment._id || payRef}
                      className="event-receipt-card event-glass-card"
                      theme="light"
                      borderRadius={20}
                      enableShader={true}
                    >
                      <div className="event-card-header">
                        <div>
                          <div className="event-badge-group">
                            <span className="event-category-pill">
                              {payment.typeCode || 'COLORS'}
                            </span>
                            <span className={`event-status-pill ${String(payment.status || '').toLowerCase() === 'paid' ? 'paid' : 'pending'}`}>
                              <span className="receipt-status-wrap">
                                <Check size={12} strokeWidth={3} /> {payment.status || 'PAID'}
                              </span>
                            </span>
                          </div>
                          <SplitColorText as="h4" className="event-main-title" splitPercent={50} leftColor="#0f172a" rightColor="#be9337">
                            {title}
                          </SplitColorText>
                        </div>

                        <div className="event-header-actions-row">
                          {isSports && (
                            <ThemeButton
                              type="button"
                              className="btn-dash-outline"
                              borderRadius={10}
                              height={38}
                              showBlast={false}
                              onClick={() => setEditingTeamReg(payment)}
                              title="Add or update your squad members for this event"
                            >
                              <span className="btn-icon-label">
                                <Users size={14} /> Manage Squad
                              </span>
                            </ThemeButton>
                          )}
                          <ThemeButton
                            type="button"
                            className="btn-dash-primary"
                            borderRadius={10}
                            height={38}
                            showBlast={false}
                            onClick={() => setSelectedReceipt(payment)}
                          >
                            <span className="btn-icon-label" style={{ color: '#ffffff' }}>
                              <FileText size={15} /> View / Print Slip
                            </span>
                          </ThemeButton>
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
                              <ThemeButton
                                type="button"
                                className="btn-dash-outline-sm"
                                borderRadius={8}
                                height={32}
                                showBlast={false}
                                onClick={() => setEditingTeamReg(payment)}
                              >
                                <span className="btn-icon-label">
                                  <UserPlus size={14} /> Edit / Add Participants
                                </span>
                              </ThemeButton>
                            )}
                          </div>
                          <div className="participants-chips-wrap">
                            {teamParticipants.map((p, idx) => (
                              <div
                                key={idx}
                                className={`participant-chip ${p.isLeader ? 'leader' : ''}`}
                              >
                                {p.isLeader ? (
                                  <Crown size={13} className="participant-crown" />
                                ) : (
                                  <User size={13} className="participant-user" />
                                )}
                                <strong>{p.name}</strong>
                                <span className="roll">({p.rollNumber || p.roll})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="team-participants-box empty-participants-box">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
                            <span className="team-solo-label" style={{ fontSize: '0.86rem', color: '#64748b' }}>
                              {isSports ? (
                                <>
                                  <Users size={15} /> Only Team Leader registered so far. You can add the rest of your squad participants now!
                                </>
                              ) : (
                                <>
                                  <User size={15} /> Registered Participant (Solo Entry)
                                </>
                              )}
                            </span>
                            {isSports && (
                              <ThemeButton
                                type="button"
                                className="btn-dash-outline-sm"
                                borderRadius={8}
                                height={32}
                                showBlast={false}
                                onClick={() => setEditingTeamReg(payment)}
                              >
                                <span className="btn-icon-label">
                                  <UserPlus size={14} /> Add Team Participants
                                </span>
                              </ThemeButton>
                            )}
                          </div>
                        </div>
                      )}
                    </LiquidGlass>
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
            <LiquidGlass
              className="printable-slip-card slip-glass-card"
              theme="light"
              borderRadius={22}
              enableShader={true}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="slip-header">
                <div className="slip-logo">COLOURS 2027</div>
                <div className="slip-subtitle">
                  Aditya University Youth Cultural & Sports Festival
                </div>
                <span className="slip-status-badge">
                  <CheckCircle2 size={13} /> OFFICIAL PAYMENT RECEIPT
                </span>
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
                <ThemeButton
                  type="button"
                  className="btn-dash-primary"
                  borderRadius={10}
                  height={42}
                  showBlast={false}
                  onClick={() => window.print()}
                  style={{ flex: 1 }}
                >
                  <span className="btn-icon-label" style={{ color: '#ffffff' }}>
                    <Printer size={15} /> Print Receipt
                  </span>
                </ThemeButton>
                <ThemeButton
                  type="button"
                  className="btn-dash-secondary"
                  borderRadius={10}
                  height={42}
                  showBlast={false}
                  onClick={() => setSelectedReceipt(null)}
                  style={{ flex: 1 }}
                >
                  <span className="btn-icon-label">
                    <X size={15} /> Close
                  </span>
                </ThemeButton>
              </div>
            </LiquidGlass>
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
