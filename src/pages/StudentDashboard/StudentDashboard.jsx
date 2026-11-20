import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import {
  getLoggedStudent,
  logoutStudent,
  fetchStudentDashboard,
  syncStudentRegistrations,
  updateStudentProfile,
  changeStudentPassword,
  fetchAllEvents,
  formatRegistrationId,
  formatPaymentReference,
  EVENT_TYPE,
  EVENT_ACADEMIC_YEAR,
  matchesAcademicYear,
  matchesTypeCode,
  isPaidPayment,
  isValidOtherCollege,
  parseEventFeeInRupees
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
  Printer,
  Eye,
  EyeOff,
  Edit3,
  X,
  CalendarX2,
  Users,
  FileText,
  UserPlus,
  Crown,
  ChevronDown,
  Download,
  ShieldCheck,
  MapPin,
  Layers
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
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordAlert, setPasswordAlert] = useState(null);

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  // Fest Delegate Pass Modal State
  const [selectedPass, setSelectedPass] = useState(null);

  // Accordion state for registered event cards (open by default)
  const [expandedEvents, setExpandedEvents] = useState({});

  const toggleEventAccordion = (key) => {
    setExpandedEvents((prev) => ({
      ...prev,
      [key]: prev[key] === undefined ? false : !prev[key]
    }));
  };

  // Direct Dynamic PDF Download for Payment Receipt
  const handleDownloadReceiptPdf = async (payment) => {
    if (!payment) return;
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
      const margin = 20;
      const contentWidth = pageWidth - margin * 2; // 170mm

      // Load AUS Logo
      const loadLogo = () =>
        new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth || img.width;
              canvas.height = img.naturalHeight || img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL('image/png'));
            } catch {
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
          img.src = '/AUS Long Logo .png';
        });

      const logoData = await loadLogo();
      let currentY = 22;

      if (logoData) {
        const logoW = 92;
        const logoH = 11.7;
        const logoX = (pageWidth - logoW) / 2;
        doc.addImage(logoData, 'PNG', logoX, currentY, logoW, logoH);
        currentY += logoH + 6;
      }

      // Title: COLOURS 2027
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(11, 82, 153); // #0b5299
      doc.text('COLOURS 2027', pageWidth / 2, currentY, { align: 'center' });
      currentY += 6;

      // Subtitle: A NATIONAL LEVEL YOUTH FESTIVAL
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105); // #475569
      doc.text('A NATIONAL LEVEL YOUTH FESTIVAL', pageWidth / 2, currentY, { align: 'center' });
      currentY += 6;

      // Badge: PAYMENT RECEIPT
      const badgeText = 'PAYMENT RECEIPT';
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      const badgeW = doc.getTextWidth(badgeText) + 12;
      const badgeH = 6;
      const badgeX = (pageWidth - badgeW) / 2;
      const badgeY = currentY;

      doc.setFillColor(236, 253, 245); // #ecfdf5
      doc.setDrawColor(167, 243, 208); // #a7f3d0
      doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 3, 3, 'FD');

      doc.setTextColor(6, 95, 70); // #065f46
      doc.text(badgeText, pageWidth / 2, badgeY + 4.2, { align: 'center' });
      currentY += badgeH + 6;

      // Horizontal dashed divider line
      doc.setDrawColor(203, 213, 225); // #cbd5e1
      doc.setLineDash([2, 2], 0);
      doc.line(margin, currentY, margin + contentWidth, currentY);
      doc.setLineDash([], 0);
      currentY += 8;

      // Data fields
      const rawRegId = payment.registrationNumber || payment.registrationId;
      const rawPayRef = payment.paymentReference;
      const regId = formatRegistrationId(rawRegId);
      const payRef = formatPaymentReference(rawPayRef || rawRegId);
      const eventName = payment.eventTitle || payment.eventName || payment.event_name || 'Colours 2027 Event';
      const studentName = payment.student?.name || payment.participant?.name || payment.student_name || activeStudent?.name || '';
      const studentRoll = payment.student?.rollNumber || payment.student?.roll || payment.participant?.rollNumber || payment.roll_number || activeStudent?.roll || '';
      const leadParticipant = studentRoll ? `${studentName} (${studentRoll})` : studentName;
      const college = payment.student?.college || payment.participant?.college || activeStudent?.college || 'Aditya University';
      const razorpayPaymentId = payment.razorpay?.paymentId || payment.paymentId || payment.payment?.paymentId || 'Pending Verification';
      const razorpayOrderId = payment.razorpay?.orderId || payment.payment?.orderId || 'N/A';
      const feeAmount = payment.amount !== undefined ? payment.amount : parseEventFeeInRupees(payment.fee?.amount || 0);
      const amountPaid = `Rs. ${feeAmount}/-`;
      const status = payment.payment?.status === 'PAID' || payment.status === 'PAID' ? 'PAID' : (payment.status || 'CONFIRMED');

      const rows = [
        { label: 'Event Name:', value: eventName },
        { label: 'Lead Participant:', value: leadParticipant },
        { label: 'College:', value: college },
        { label: 'Registration ID:', value: regId },
        { label: 'Payment Reference:', value: payRef },
        { label: 'Razorpay Payment ID:', value: razorpayPaymentId },
        { label: 'Razorpay Order ID:', value: razorpayOrderId },
        { label: 'Amount Paid:', value: amountPaid },
        { label: 'Status:', value: status },
      ];

      const colKeyX = margin + 2;
      const colValX = margin + contentWidth - 2;

      rows.forEach((row, idx) => {
        if (idx > 0) {
          doc.setDrawColor(241, 245, 249);
          doc.setLineWidth(0.3);
          doc.line(margin, currentY, margin + contentWidth, currentY);
        }
        currentY += 6;

        // Key: Bold
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42); // #0f172a
        doc.text(row.label, colKeyX, currentY);

        // Value: Thin (normal)
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);

        if (row.label === 'Status:' || row.label === 'Amount Paid:') {
          doc.setTextColor(21, 128, 61); // green #15803d
        } else {
          doc.setTextColor(51, 65, 85); // #334155
        }

        doc.text(String(row.value), colValX, currentY, { align: 'right' });
        currentY += 3.5;
      });

      currentY += 5;
      // Bottom dashed divider line
      doc.setDrawColor(203, 213, 225);
      doc.setLineDash([2, 2], 0);
      doc.line(margin, currentY, margin + contentWidth, currentY);
      doc.setLineDash([], 0);
      currentY += 8;

      // Footer note
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139); // #64748b
      doc.text('This is a computer-generated official payment receipt for Colours 2027.', pageWidth / 2, currentY, { align: 'center' });
      currentY += 4.5;

      const now = new Date();
      const dateStr =
        now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
        ', ' +
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
      doc.text(`Generated on: ${dateStr}`, pageWidth / 2, currentY, { align: 'center' });

      // Save PDF directly to user's downloads
      const cleanReg = (regId || 'Receipt').replace(/[^a-zA-Z0-9_-]/g, '_');
      doc.save(`Colours2027_Payment_Receipt_${cleanReg}.pdf`);
    } catch (err) {
      console.error('Failed to generate receipt PDF:', err);
    }
  };

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
      const data = await fetchStudentDashboard(current.roll, EVENT_TYPE, EVENT_ACADEMIC_YEAR);
      let regs = data.registrations || [];
      let pays = data.payments || [];

      // Always sync from student registrations endpoint to ensure all dynamic backend registrations are captured
      try {
        const synced = await syncStudentRegistrations(current.roll, EVENT_TYPE, EVENT_ACADEMIC_YEAR);
        if (Array.isArray(synced) && synced.length > 0) {
          const seen = new Set(regs.map((r) => r.registrationNumber || r.registrationId || r._id).filter(Boolean));
          synced.forEach((s) => {
            const sid = s.registrationNumber || s.registrationId || s._id;
            if (!seen.has(sid)) {
              regs.push(s);
              if (sid) seen.add(sid);
            }
          });
        }
      } catch { }

      // Also merge any confirmed registrations from local storage
      try {
        const local = getRegisteredEventsForStudent(current.roll);
        if (Array.isArray(local) && local.length > 0) {
          const seen = new Set(regs.map((r) => r.registrationNumber || r.registrationId || r._id).filter(Boolean));
          local.forEach((l) => {
            const lid = l.registrationNumber || l.registrationId || l._id;
            if (!seen.has(lid)) {
              regs.push(l);
              if (lid) seen.add(lid);
            }
          });
        }
      } catch { }

      setDashboardData({
        student: data.student || current,
        registrations: regs,
        payments: pays
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

  // Validate password against custom security policy
  const validateNewPassword = (pwd) => {
    if (!pwd || !pwd.trim()) {
      return 'Enter a new password';
    }
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one capital letter (A-Z)';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number (0-9)';
    }
    if (!/[@_$#!]/.test(pwd)) {
      return 'Password must contain at least one special character (@, _, $, #, !)';
    }
    if (!/^[A-Za-z0-9@_$#!]+$/.test(pwd)) {
      return 'Only special characters @, _, $, #, ! are allowed';
    }
    return null;
  };

  // Handle Change Password with Custom Validation
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordAlert(null);

    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!currentPassword || !currentPassword.trim()) {
      errors.currentPassword = 'Enter your current password';
    }

    const newPwError = validateNewPassword(newPassword);
    if (newPwError) {
      errors.newPassword = newPwError;
    }

    if (!confirmPassword || !confirmPassword.trim()) {
      errors.confirmPassword = 'Confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (errors.currentPassword || errors.newPassword || errors.confirmPassword) {
      setPasswordErrors(errors);
      setPasswordAlert({
        type: 'error',
        message: errors.currentPassword || errors.newPassword || errors.confirmPassword
      });
      return;
    }

    setPasswordErrors({ currentPassword: '', newPassword: '', confirmPassword: '' });

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
      setPasswordErrors({
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

  // Live validation state for new password
  const isNewPwTyped = Boolean(passwordForm.newPassword && passwordForm.newPassword.length > 0);
  const isNewPwValid = isNewPwTyped && !validateNewPassword(passwordForm.newPassword);

  // Student Photo Url lookup
  const studentPhotoUrl = student?.roll
    ? `https://info.aec.edu.in/adityacentral/studentphotos/${student.roll.toUpperCase()}.jpg`
    : null;
  const [photoError, setPhotoError] = useState(false);

  // Active student details
  const activeStudent = dashboardData.student || student;
  const paymentsList = dashboardData.payments || [];
  const registrationsList = dashboardData.registrations || [];

  // Combined list of student's registered events (payments + registrations dynamically merged)
  const displayEventsList = useMemo(() => {
    // 1. Build lookup map of registrations
    const regMap = new Map();
    registrationsList.forEach((reg) => {
      const key = reg.registrationNumber || reg.registrationId || reg._id;
      if (key) regMap.set(String(key), reg);
      if (reg.eventId) regMap.set(String(reg.eventId), reg);
    });

    const seenKeys = new Set();
    const combined = [];

    // Process payments list
    paymentsList.forEach((pay) => {
      const regNo = pay.registrationNumber || pay.registrationId || pay._id;
      const matchingReg = regNo ? regMap.get(String(regNo)) : (pay.eventId ? regMap.get(String(pay.eventId)) : null);

      const dedupeKey = pay.registrationNumber || pay.registrationId || matchingReg?.registrationNumber || pay.paymentReference || pay._id;
      if (dedupeKey && seenKeys.has(String(dedupeKey))) return;
      if (dedupeKey) seenKeys.add(String(dedupeKey));

      const eventTitle =
        pay.eventTitle ||
        pay.eventName ||
        pay.event_name ||
        matchingReg?.eventTitle ||
        matchingReg?.eventName ||
        matchingReg?.event_name ||
        pay.event?.name ||
        pay.event?.title ||
        matchingReg?.event?.name ||
        'Colours 2027 Event';

      const participants =
        Array.isArray(pay.participants) && pay.participants.length > 0
          ? pay.participants
          : Array.isArray(matchingReg?.participants) && matchingReg.participants.length > 0
          ? matchingReg.participants
          : pay.participant
          ? [pay.participant]
          : matchingReg?.participant
          ? [matchingReg.participant]
          : pay.student
          ? [pay.student]
          : matchingReg?.student
          ? [matchingReg.student]
          : [];

      combined.push({
        ...matchingReg,
        ...pay,
        eventTitle,
        participants,
        paymentReference: pay.paymentReference || (regNo ? `PAY-${regNo}` : 'N/A'),
        amount: pay.amount !== undefined ? pay.amount : (matchingReg?.amount !== undefined ? matchingReg.amount : (pay.fee?.amount !== undefined ? parseEventFeeInRupees(pay.fee.amount) : 0)),
        status: pay.payment?.status === 'PAID' || pay.status === 'PAID' ? 'PAID' : (matchingReg?.status || pay.status || 'CONFIRMED')
      });
    });

    // Add remaining registrations that had no matching payment record
    registrationsList.forEach((reg) => {
      const dedupeKey = reg.registrationNumber || reg.registrationId || reg._id;
      if (dedupeKey && seenKeys.has(String(dedupeKey))) return;
      if (dedupeKey) seenKeys.add(String(dedupeKey));

      const eventTitle =
        reg.eventTitle ||
        reg.eventName ||
        reg.event_name ||
        reg.event?.name ||
        reg.event?.title ||
        'Colours 2027 Event';

      const participants =
        Array.isArray(reg.participants) && reg.participants.length > 0
          ? reg.participants
          : reg.participant
          ? [reg.participant]
          : reg.student
          ? [reg.student]
          : [];

      combined.push({
        ...reg,
        eventTitle,
        participants,
        paymentReference: reg.paymentReference || (dedupeKey ? `PAY-${dedupeKey}` : 'N/A'),
        amount: reg.amount !== undefined ? reg.amount : (reg.fee?.amount !== undefined ? parseEventFeeInRupees(reg.fee.amount) : 0),
        status: reg.payment?.status === 'PAID' || reg.status === 'PAID' ? 'PAID' : (reg.status || 'CONFIRMED')
      });
    });

    // Filter to ensure only current fest events (excluding other fests like VEDA/ALA if explicitly tagged)
    const filteredEvents = combined.filter((item) => {
      const itemType = (item.typeCode || item.type_code || item.eventType || item.event_type || '').toUpperCase();
      if (itemType === 'VEDA' || itemType === 'ALA') {
        return (EVENT_TYPE || 'COLORS').toUpperCase() === itemType;
      }
      const itemYear = item.academicYear || item.academic_year;
      if (itemYear && !matchesAcademicYear(itemYear, EVENT_ACADEMIC_YEAR)) {
        return false;
      }
      return true;
    });

    // Enrich each registered event with catalog metadata (category, subCategory, participationType)
    return filteredEvents.map((item) => {
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
        eventTitle: item.eventTitle || matched?.eventName || matched?.title || 'Colours 2027 Event',
        category: item.category || matched?.category || matched?.categoryName || '',
        subCategory: item.subCategory || matched?.subCategory || matched?.subcategoryName || '',
        participationType: item.participationType || matched?.participationType || '',
        venue: item.venue || item.eventVenue || matched?.venue || (matched?.venueObj ? `${matched.venueObj.name || ''} ${matched.venueObj.roomNo ? `- Room: ${matched.venueObj.roomNo}` : ''}`.trim() : '') || 'RAMANUJAN BHAVAN - SEMINAR HALL - Room: 201',
        eventDate: item.eventDate || item.date || matched?.eventDate || matched?.date || '07 JAN - 09 JAN 2027'
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
            <SplitColorText leftColor="#0f172a" rightColor="#0f172a">
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
            <SplitColorText leftColor="#0f172a" rightColor="#0f172a">
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
            <SplitColorText leftColor="#0f172a" rightColor="#0f172a">
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
            <SplitColorText as="h2" className="empty-dash-title" splitPercent={50} leftColor="#0f172a" rightColor="#0f172a">
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

  // Compute stats strictly for COLORS paid events
  const totalRegistrations = displayEventsList.length;
  const paidCount = displayEventsList.filter((p) => isPaidPayment(p)).length;
  const totalAmountPaid = displayEventsList.reduce(
    (acc, p) => acc + (Number(p.amount) || parseEventFeeInRupees(p.fee?.amount) || 0),
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
          {/* Fest Blast Artwork in Right Bottom Corner */}
          <img
            src="/blast.png"
            alt=""
            aria-hidden="true"
            className="dashboard-hero-blast-corner"
          />

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
                <div className="hero-avatar-fallback" style={{ backgroundColor: '#0b5299' }}>
                  {activeStudent.name ? activeStudent.name.charAt(0) : 'S'}
                </div>
              )}
              <span className="hero-avatar-badge" title="Verified Fest Delegate">
                <Check size={14} strokeWidth={3} />
              </span>
            </div>

            <div className="hero-info-group">
              <div className="hero-title-row">
                <SplitColorText as="h1" className="hero-student-name" splitPercent={50} leftColor="#0f172a" rightColor="#0f172a">
                  {activeStudent.name}
                </SplitColorText>
                <span className="hero-roll-chip">{activeStudent.roll}</span>
              </div>
              <div className="hero-college-name">
                <Landmark size={15} className="hero-icon" /> {activeStudent.college === 'Other Institution' && activeStudent.otherCollege
                  ? activeStudent.otherCollege
                  : normalizeCollege(activeStudent.college)}
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
              <SplitColorText as="span" className="metric-value" splitPercent={50} leftColor="#0f172a" rightColor="#0f172a">
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
              <SplitColorText as="span" className="metric-value" splitPercent={50} leftColor="#0f172a" rightColor="#0f172a">
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
              <SplitColorText as="span" className="metric-value" splitPercent={50} leftColor="#0f172a" rightColor="#0f172a">
                ₹ {totalAmountPaid}
              </SplitColorText>
              <span className="metric-label">Total Fee Paid</span>
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
            rightColor="#0f172a"
            activeBg="#0b5299"
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
                    <SplitColorText as="h3" splitPercent={50} leftColor="#0f172a" rightColor="#0f172a">
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
                        onBlur={(e) => handleOtherCollegeBlur(e.target.value)}
                        placeholder="Enter your college/university name"
                        className="full-width"
                        error={otherCollegeError || ''}
                        hint={
                          !otherCollegeError && profileForm.otherCollege && isValidOtherCollege(profileForm.otherCollege)
                            ? 'ℹ️ College ID Card is required for entry and verification.'
                            : ''
                        }
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

                    <div className="form-actions-bar" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                      <ThemeButton
                        type="submit"
                        className="btn-dash-primary"
                        borderRadius={12}
                        height={44}
                        showBlast={false}
                        disabled={profileSaving}
                        style={{ minWidth: '200px' }}
                      >
                        <span className="btn-icon-label" style={{ color: '#ffffff' }}>
                          {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                        </span>
                      </ThemeButton>
                    </div>
                  </form>
                )}
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
                    <SplitColorText as="h3" splitPercent={50} leftColor="#0f172a" rightColor="#0f172a">
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

                <form onSubmit={handleChangePassword} className="profile-form-grid security-password-form-grid" noValidate>
                  <MuiTextField
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    id="current-pw"
                    value={passwordForm.currentPassword}
                    onChange={(e) => {
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value
                      }));
                      if (passwordErrors.currentPassword) {
                        setPasswordErrors((prev) => ({ ...prev, currentPassword: '' }));
                      }
                    }}
                    placeholder="Enter current password"
                    error={passwordErrors.currentPassword}
                    required
                  />

                  <MuiTextField
                    label="New Password"
                    type="password"
                    name="newPassword"
                    id="new-pw"
                    value={passwordForm.newPassword}
                    onChange={(e) => {
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value
                      }));
                      if (passwordErrors.newPassword) {
                        setPasswordErrors((prev) => ({ ...prev, newPassword: '' }));
                      }
                    }}
                    placeholder="Type new password"
                    hint="Min 8 chars, 1 capital (A-Z), 1 number (0-9), & allowed special chars (@, _, $, #, !)"
                    hintClassName={isNewPwTyped ? (isNewPwValid ? 'hint-valid' : 'hint-invalid') : ''}
                    error={isNewPwTyped ? '' : passwordErrors.newPassword}
                    className={
                      passwordErrors.newPassword
                        ? 'has-error'
                        : isNewPwTyped
                        ? (isNewPwValid ? 'is-live-valid' : '')
                        : ''
                    }
                    required
                  />

                  <MuiTextField
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    id="confirm-pw"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => {
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value
                      }));
                      if (passwordErrors.confirmPassword) {
                        setPasswordErrors((prev) => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                    placeholder="Re-type new password"
                    error={passwordErrors.confirmPassword}
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
                <SplitColorText as="h3" className="empty-dash-title" splitPercent={50} leftColor="#0f172a" rightColor="#0f172a">
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
                {displayEventsList.map((payment, pIndex) => {
                  const rawRegId = payment.registrationNumber || payment.registrationId;
                  const rawPayRef = payment.paymentReference;
                  const regId = formatRegistrationId(rawRegId);
                  const payRef = formatPaymentReference(rawPayRef || rawRegId);
                  const title = payment.eventTitle || payment.eventName || 'Colours 2027 Event';
                  const rawParticipants = Array.isArray(payment.participants) && payment.participants.length > 0
                    ? payment.participants
                    : [];
                  const teamParticipants = rawParticipants.length > 0
                    ? rawParticipants
                    : [
                        {
                          name: payment.leadParticipant || payment.studentName || activeStudent.name || 'Student Participant',
                          rollNumber: payment.studentRollNumber || payment.rollNumber || payment.roll || activeStudent.roll || '—',
                          role: isSports ? 'Team Leader' : 'Participant',
                          department: payment.department || activeStudent.department || 'General',
                          year: payment.year || activeStudent.year || '3rd Year',
                          email: payment.email || activeStudent.email || '—',
                          phone: payment.phone || payment.mobile || activeStudent.mobile || '—',
                          college: payment.college || activeStudent.college || 'Aditya University',
                          otherCollege: payment.otherCollege || activeStudent.otherCollege || ''
                        }
                      ];
                  const isSports = isSportsAndGamesEvent(payment, catalogEvents);
                  const eventKey = payment._id || rawPayRef || rawRegId || `event-${pIndex}`;
                  const isExpanded = expandedEvents[eventKey] !== false;

                  return (
                    <LiquidGlass
                      as="article"
                      key={eventKey}
                      className="event-receipt-card event-glass-card"
                      theme="light"
                      borderRadius={20}
                      enableShader={true}
                    >
                      <div
                        className={`event-card-header accordion-header ${isExpanded ? 'is-open' : 'is-closed'}`}
                        onClick={() => toggleEventAccordion(eventKey)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleEventAccordion(eventKey);
                          }
                        }}
                      >
                        <div>
                          <SplitColorText as="h4" className="event-main-title" splitPercent={50} leftColor="#0f172a" rightColor="#0f172a">
                            {title}
                          </SplitColorText>
                        </div>

                        <div className="event-header-actions-row" onClick={(e) => e.stopPropagation()}>
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
                            className="btn-dash-primary btn-dash-payment-receipt"
                            borderRadius={10}
                            height={34}
                            showBlast={false}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadReceiptPdf(payment);
                            }}
                            title="Download Payment Receipt PDF"
                          >
                            <span className="btn-icon-label" style={{ color: '#ffffff', fontWeight: 300, fontSize: '0.78rem' }}>
                              <Download size={14} strokeWidth={1.8} /> Payment Receipt
                            </span>
                          </ThemeButton>

                          <button
                            type="button"
                            className={`btn-dash-accordion-toggle ${isExpanded ? 'expanded' : ''}`}
                            onClick={() => toggleEventAccordion(eventKey)}
                            aria-label={isExpanded ? 'Collapse participant details' : 'Expand participant details'}
                            title={isExpanded ? 'Click to collapse' : 'Click to expand'}
                          >
                            <ChevronDown size={18} strokeWidth={2.4} className="accordion-chevron-icon" />
                          </button>
                        </div>
                      </div>

                      <div className={`event-accordion-body ${isExpanded ? 'open' : 'collapsed'}`}>
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
                          <div className="dash-participants-table-responsive">
                            <table className="dash-participants-table">
                              <thead>
                                <tr>
                                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                                  <th>ROLL NUMBER</th>
                                  <th>NAME</th>
                                  <th>ROLE</th>
                                  <th>DEPARTMENT / YEAR</th>
                                  <th>EMAIL</th>
                                  <th>MOBILE</th>
                                  <th style={{ textAlign: 'center' }}>PASS</th>
                                </tr>
                              </thead>
                              <tbody>
                                {teamParticipants.map((p, idx) => {
                                  const isLeader = Boolean(p.isLeader || p.role === 'Leader' || p.role === 'Team Leader' || idx === 0);
                                  const roleTitle = p.role ? (p.role === 'Leader' ? 'Team Leader' : p.role) : (isLeader ? 'Team Leader' : 'Participant');
                                  const dept = p.department || payment.department || activeStudent.department || 'General';
                                  const yr = p.year || payment.year || activeStudent.year || '3rd Year';
                                  const rollNo = p.rollNumber || p.roll || payment.studentRollNumber || payment.rollNumber || activeStudent.roll || '—';
                                  const pName = p.name || payment.leadParticipant || payment.studentName || activeStudent.name || '—';
                                  const email = p.email || payment.email || activeStudent.email || '—';
                                  const phone = p.phone || p.mobile || payment.phone || payment.mobile || activeStudent.mobile || '—';
                                  const pCollege = p.college || payment.college || activeStudent.college || 'Aditya University';
                                  const pOtherCollege = p.otherCollege || payment.otherCollege || activeStudent.otherCollege || '';

                                  return (
                                    <tr key={idx}>
                                      <td className="col-idx">{p.no || idx + 1}</td>
                                      <td>
                                        <span className="dash-table-roll-badge">
                                          {rollNo}
                                        </span>
                                      </td>
                                      <td>
                                        <div className="dash-table-name-cell">
                                          <span className="dash-table-name">{pName}</span>
                                          {isLeader && (
                                            <span className="dash-table-leader-tag">
                                              LEADER
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="dash-table-role">{roleTitle}</td>
                                      <td className="dash-table-dept">
                                        <span className="dept-name">{dept}</span>{' '}
                                        <span className="dept-year">({yr})</span>
                                      </td>
                                      <td className="dash-table-email">{email}</td>
                                      <td className="dash-table-mobile">{phone}</td>
                                      <td style={{ textAlign: 'center' }}>
                                        <button
                                          type="button"
                                          className="btn-dash-table-pass"
                                          onClick={() => {
                                            const hash = Math.abs((rollNo + title).split('').reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0), 0));
                                            const passNumericCode = String(hash % 900000 + 100000);
                                            const passCodeFormatted = `CLR - 2k27 - ${passNumericCode}`;
                                            const cleanTeamId = payment.teamId || regId || payRef || `CLR27-COLORS-${passNumericCode}`;

                                            setSelectedPass({
                                              name: pName,
                                              roll: rollNo,
                                              college: pCollege,
                                              otherCollege: pOtherCollege,
                                              department: dept,
                                              year: yr,
                                              role: roleTitle,
                                              isLeader: isLeader,
                                              eventTitle: title,
                                              eventDate: payment.eventDate || payment.date || '07 JAN - 09 JAN 2027',
                                              venue: payment.venue || payment.eventVenue || 'RAMANUJAN BHAVAN - SEMINAR HALL - Room: 201',
                                              teamId: cleanTeamId,
                                              registrationNumber: regId,
                                              paymentReference: payRef,
                                              passCodeFormatted: passCodeFormatted,
                                              status: payment.status || 'PAID & CONFIRMED'
                                            });
                                          }}
                                          title="View Pass"
                                        >
                                          <CreditCard size={13} />
                                          <span>View Pass</span>
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
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
                      </div>
                    </LiquidGlass>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Printable Slip / Receipt Modal ── */}
        {selectedReceipt && createPortal(
          <div
            className="receipt-modal-backdrop"
            onClick={() => setSelectedReceipt(null)}
          >
            <div
              className="printable-slip-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="slip-header">
                <img
                  src="/AUS Long Logo .png"
                  alt="Aditya University"
                  className="slip-aus-logo"
                />
                <div className="slip-logo">COLOURS 2027</div>
                <div className="slip-subtitle">
                  A NATIONAL LEVEL YOUTH FESTIVAL
                </div>
                <span className="slip-status-badge">
                  <CheckCircle2 size={13} /> PAYMENT RECEIPT
                </span>
              </div>

              <table className="slip-table">
                <tbody>
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
                    <td className="lbl">Amount Paid:</td>
                    <td className="val" style={{ color: '#15803d', fontSize: '1.05rem' }}>
                      ₹ {selectedReceipt.amount !== undefined ? selectedReceipt.amount : parseEventFeeInRupees(selectedReceipt.fee?.amount || 0)}/-
                    </td>
                  </tr>
                  <tr>
                    <td className="lbl">Status:</td>
                    <td className="val" style={{ color: '#15803d' }}>
                      {selectedReceipt.payment?.status === 'PAID' || selectedReceipt.status === 'PAID' ? 'PAID' : (selectedReceipt.status || 'CONFIRMED')}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="slip-actions">
                <ThemeButton
                  type="button"
                  className="btn-dash-primary"
                  borderRadius={10}
                  height={42}
                  showBlast={false}
                  onClick={() => handleDownloadReceiptPdf(selectedReceipt)}
                  style={{ flex: 1 }}
                >
                  <span className="btn-icon-label" style={{ color: '#ffffff' }}>
                    <Download size={15} /> Download PDF
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
            </div>
          </div>,
          document.body
        )}

        {/* ── Digital Fest Delegate Pass Modal (Official Participant Credential Ticket) ── */}
        {selectedPass && createPortal(
          <div
            className="receipt-modal-backdrop"
            onClick={() => setSelectedPass(null)}
          >
            <div
              className="fest-pass-modal-wrapper"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="fest-credential-ticket" id="fest-credential-printable">
                {/* 1. Header Banner */}
                <div className="credential-top-banner">
                  <div className="cred-brand-left">
                    <img
                      src="/aus-logo.svg"
                      alt="Aditya University"
                      className="cred-aditya-logo"
                    />
                  </div>

                  <div className="cred-fest-center">
                    <div className="cred-star-pill">
                      <span className="cred-star">★</span>
                      <span className="cred-pill-title">COLORS 2027</span>
                      <span className="cred-star">★</span>
                    </div>
                    <span className="cred-official-subtitle">OFFICIAL PARTICIPANT CREDENTIAL</span>
                  </div>

                  <div className="cred-team-id-badge">
                    <span className="cred-team-id-label">TEAM ID</span>
                    <span className="cred-team-id-value">{selectedPass.teamId}</span>
                  </div>
                </div>

                {/* 2. Main Content Card */}
                <div className="credential-body-wrap">
                  {/* Left Column: Photo & Verified Badges */}
                  <div className="credential-left-col">
                    <div className="credential-photo-frame">
                      {selectedPass.roll && selectedPass.roll !== '—' ? (
                        <img
                          src={`https://info.aec.edu.in/adityacentral/studentphotos/${selectedPass.roll.toUpperCase()}.jpg`}
                          alt={selectedPass.name}
                          className="cred-avatar-photo"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.parentElement?.querySelector('.cred-avatar-fallback');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="cred-avatar-fallback"
                        style={{ display: selectedPass.roll && selectedPass.roll !== '—' ? 'none' : 'flex' }}
                      >
                        <User size={54} strokeWidth={1.6} />
                      </div>
                    </div>

                    <div className="credential-role-pill">
                      {selectedPass.isLeader ? 'LEAD PARTICIPANT' : (selectedPass.role || 'PARTICIPANT')}
                    </div>

                    <div className="credential-verified-card">
                      <div className="cred-verified-row">
                        <ShieldCheck size={14} className="cred-shield-icon" />
                        <span>VERIFIED PASS</span>
                      </div>
                      <div className="cred-status-dot-row">
                        <span className="cred-green-dot" />
                        <span>{selectedPass.status?.toUpperCase().includes('PAID') ? 'PAID & CONFIRMED' : (selectedPass.status || 'CONFIRMED')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Event & Details Grid */}
                  <div className="credential-right-col">
                    <h3 className="cred-event-title">{selectedPass.eventTitle}</h3>

                    <div className="cred-date-pill">
                      <Calendar size={13} className="cred-date-icon" />
                      <span>Event Date: {selectedPass.eventDate}</span>
                    </div>

                    <div className="cred-details-2x2-grid">
                      {/* 1. Participant Name */}
                      <div className="cred-info-cell">
                        <div className="cred-icon-bubble blue">
                          <User size={15} />
                        </div>
                        <div className="cred-cell-text">
                          <span className="cred-cell-label">PARTICIPANT NAME</span>
                          <span className="cred-cell-value">{selectedPass.name}</span>
                        </div>
                      </div>

                      {/* 2. Roll Number */}
                      <div className="cred-info-cell">
                        <div className="cred-icon-bubble dark">
                          <ShieldCheck size={15} />
                        </div>
                        <div className="cred-cell-text">
                          <span className="cred-cell-label">ROLL NUMBER</span>
                          <span className="cred-cell-value font-mono">{selectedPass.roll}</span>
                        </div>
                      </div>

                      {/* 3. Institution */}
                      <div className="cred-info-cell">
                        <div className="cred-icon-bubble amber">
                          <GraduationCap size={15} />
                        </div>
                        <div className="cred-cell-text">
                          <span className="cred-cell-label">INSTITUTION</span>
                          <span className="cred-cell-value" title={selectedPass.college}>
                            {selectedPass.college === 'Other Institution' && selectedPass.otherCollege
                              ? selectedPass.otherCollege
                              : normalizeCollege(selectedPass.college)}
                          </span>
                        </div>
                      </div>

                      {/* 4. Branch & Dept */}
                      <div className="cred-info-cell">
                        <div className="cred-icon-bubble purple">
                          <Layers size={15} />
                        </div>
                        <div className="cred-cell-text">
                          <span className="cred-cell-label">BRANCH & DEPT</span>
                          <span className="cred-cell-value">
                            {selectedPass.department || 'GENERAL'} • {selectedPass.year || '3rd Year'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Venue Bar */}
                    <div className="cred-venue-bar">
                      <MapPin size={15} className="cred-venue-icon" />
                      <span className="cred-venue-text">
                        VENUE: {selectedPass.venue}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Tear Line & Barcode Section */}
                <div className="credential-stub-tear-line">
                  <div className="ticket-notch left" />
                  <div className="ticket-tear-dashed" />
                  <div className="ticket-notch right" />
                </div>

                <div className="credential-barcode-section">
                  <svg className="cred-barcode-svg" viewBox="0 0 540 54" preserveAspectRatio="none">
                    <rect x="0" y="0" width="540" height="54" fill="#ffffff" />
                    <g fill="#0f172a">
                      <rect x="10" y="0" width="3" height="54" />
                      <rect x="15" y="0" width="2" height="54" />
                      <rect x="20" y="0" width="5" height="54" />
                      <rect x="28" y="0" width="2" height="54" />
                      <rect x="33" y="0" width="4" height="54" />
                      <rect x="40" y="0" width="1" height="54" />
                      <rect x="44" y="0" width="5" height="54" />
                      <rect x="52" y="0" width="3" height="54" />
                      <rect x="58" y="0" width="2" height="54" />
                      <rect x="63" y="0" width="6" height="54" />
                      <rect x="72" y="0" width="2" height="54" />
                      <rect x="77" y="0" width="4" height="54" />
                      <rect x="84" y="0" width="2" height="54" />
                      <rect x="89" y="0" width="5" height="54" />
                      <rect x="97" y="0" width="3" height="54" />
                      <rect x="103" y="0" width="2" height="54" />
                      <rect x="108" y="0" width="6" height="54" />
                      <rect x="117" y="0" width="2" height="54" />
                      <rect x="122" y="0" width="4" height="54" />
                      <rect x="129" y="0" width="3" height="54" />
                      <rect x="135" y="0" width="5" height="54" />
                      <rect x="143" y="0" width="2" height="54" />
                      <rect x="148" y="0" width="4" height="54" />
                      <rect x="155" y="0" width="1" height="54" />
                      <rect x="159" y="0" width="6" height="54" />
                      <rect x="168" y="0" width="3" height="54" />
                      <rect x="174" y="0" width="2" height="54" />
                      <rect x="179" y="0" width="5" height="54" />
                      <rect x="187" y="0" width="2" height="54" />
                      <rect x="192" y="0" width="4" height="54" />
                      <rect x="199" y="0" width="3" height="54" />
                      <rect x="205" y="0" width="5" height="54" />
                      <rect x="213" y="0" width="2" height="54" />
                      <rect x="218" y="0" width="6" height="54" />
                      <rect x="227" y="0" width="2" height="54" />
                      <rect x="232" y="0" width="4" height="54" />
                      <rect x="239" y="0" width="3" height="54" />
                      <rect x="245" y="0" width="5" height="54" />
                      <rect x="253" y="0" width="2" height="54" />
                      <rect x="258" y="0" width="4" height="54" />
                      <rect x="265" y="0" width="1" height="54" />
                      <rect x="269" y="0" width="5" height="54" />
                      <rect x="277" y="0" width="3" height="54" />
                      <rect x="283" y="0" width="2" height="54" />
                      <rect x="288" y="0" width="6" height="54" />
                      <rect x="297" y="0" width="2" height="54" />
                      <rect x="302" y="0" width="4" height="54" />
                      <rect x="309" y="0" width="2" height="54" />
                      <rect x="314" y="0" width="5" height="54" />
                      <rect x="322" y="0" width="3" height="54" />
                      <rect x="328" y="0" width="2" height="54" />
                      <rect x="333" y="0" width="6" height="54" />
                      <rect x="342" y="0" width="2" height="54" />
                      <rect x="347" y="0" width="4" height="54" />
                      <rect x="354" y="0" width="3" height="54" />
                      <rect x="360" y="0" width="5" height="54" />
                      <rect x="368" y="0" width="2" height="54" />
                      <rect x="373" y="0" width="4" height="54" />
                      <rect x="380" y="0" width="1" height="54" />
                      <rect x="384" y="0" width="6" height="54" />
                      <rect x="393" y="0" width="3" height="54" />
                      <rect x="399" y="0" width="2" height="54" />
                      <rect x="404" y="0" width="5" height="54" />
                      <rect x="412" y="0" width="2" height="54" />
                      <rect x="417" y="0" width="4" height="54" />
                      <rect x="424" y="0" width="3" height="54" />
                      <rect x="430" y="0" width="5" height="54" />
                      <rect x="438" y="0" width="2" height="54" />
                      <rect x="443" y="0" width="6" height="54" />
                      <rect x="452" y="0" width="2" height="54" />
                      <rect x="457" y="0" width="4" height="54" />
                      <rect x="464" y="0" width="3" height="54" />
                      <rect x="470" y="0" width="5" height="54" />
                      <rect x="478" y="0" width="2" height="54" />
                      <rect x="483" y="0" width="5" height="54" />
                      <rect x="491" y="0" width="3" height="54" />
                      <rect x="497" y="0" width="2" height="54" />
                      <rect x="502" y="0" width="6" height="54" />
                      <rect x="511" y="0" width="2" height="54" />
                      <rect x="516" y="0" width="4" height="54" />
                      <rect x="523" y="0" width="3" height="54" />
                      <rect x="529" y="0" width="2" height="54" />
                    </g>
                  </svg>

                  <div className="cred-barcode-footer-row">
                    <span className="cred-entry-tag">
                      <Ticket size={13} /> ENTRY PASS
                    </span>
                    <span className="cred-code-spacing">
                      {selectedPass.passCodeFormatted}
                    </span>
                    <span className="cred-id-notice">
                      NON-TRANSFERABLE • CARRY ID
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="slip-actions" style={{ marginTop: '1.25rem', width: '100%' }}>
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
                    <Printer size={15} /> Print Delegate Card
                  </span>
                </ThemeButton>
                <ThemeButton
                  type="button"
                  className="btn-dash-secondary"
                  borderRadius={10}
                  height={42}
                  showBlast={false}
                  onClick={() => setSelectedPass(null)}
                  style={{ flex: 1 }}
                >
                  <span className="btn-icon-label">
                    <X size={15} /> Close
                  </span>
                </ThemeButton>
              </div>
            </div>
          </div>,
          document.body
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
