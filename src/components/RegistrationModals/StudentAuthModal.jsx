import { useState, useMemo, useEffect } from 'react';
import {
  registerStudentAccount,
  loginStudentAccount,
  checkStudentExists,
  fetchStudentByRollNumber,
  submitEventRegistration,
  formatRegistrationId,
  formatPaymentReference
} from '../../services/api';
import './RegistrationModals.css';

const COLLEGE_OPTIONS = [
  'Aditya University',
  'Aditya Engineering College (AEC)',
  'Aditya College of Engineering & Technology (ACET)',
  'Aditya College of Engineering (ACOE)',
  'Other Institution'
];

export default function StudentAuthModal({
  isOpen,
  onClose,
  onSuccess,
  eventTitle = '',
  eventData = null,
  initialMode = 'login'
}) {
  const [mode, setMode] = useState(initialMode || 'login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setConfirmedRecord(null);
      if (initialMode) setMode(initialMode);
    }
  }, [isOpen, initialMode]);

  // Student existence checking states
  const [checkingRoll, setCheckingRoll] = useState(false);
  const [studentStatus, setStudentStatus] = useState(null); // { exists, student, alreadyRegisteredForEvent, existingRegistration }
  const [confirmedRecord, setConfirmedRecord] = useState(null);

  // Register Form State
  const [regForm, setRegForm] = useState({
    name: '',
    roll: '',
    college: 'Aditya University',
    otherCollege: '',
    gender: 'Male',
    mobile: '',
    email: '',
    password: ''
  });

  // Login Form State
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);

    // Reset status if user changes roll
    if (name === 'roll') {
      setStudentStatus(null);
    }
  };

  // Check whether student exists or not by Roll Number
  const handleCheckRoll = async (rollValue) => {
    const roll = (rollValue !== undefined ? rollValue : regForm.roll).trim();
    if (!roll || roll.length < 3) return;

    setCheckingRoll(true);
    try {
      const result = await checkStudentExists(roll, eventData);
      if (result && result.exists && result.student) {
        setCheckingRoll(false);
        setStudentStatus(result);
        // Auto-fill existing student profile fields
        setRegForm((prev) => ({
          ...prev,
          name: prev.name || result.student.name || '',
          college: result.student.college || prev.college,
          otherCollege: result.student.otherCollege || prev.otherCollege,
          gender: result.student.gender || prev.gender,
          mobile: prev.mobile || result.student.mobile || '',
          email: prev.email || result.student.email || ''
        }));
        return;
      }

      // If not yet registered, check ECAP API to auto-fill details from university database
      const ecapData = await fetchStudentByRollNumber(roll).catch(() => null);
      setCheckingRoll(false);
      if (ecapData) {
        let collegeName = ecapData.college || 'Aditya University';
        if (collegeName === 'AEC') collegeName = 'Aditya Engineering College (AEC)';
        else if (collegeName === 'ACET') collegeName = 'Aditya College of Engineering & Technology (ACET)';
        else if (collegeName === 'ACOE') collegeName = 'Aditya College of Engineering (ACOE)';

        setRegForm((prev) => ({
          ...prev,
          name: prev.name || ecapData.name || '',
          college: collegeName,
          gender: ecapData.gender || prev.gender,
          mobile: prev.mobile || ecapData.mobile || '',
          email: prev.email || ecapData.email || ''
        }));
      }
      setStudentStatus({ exists: false, alreadyRegisteredForEvent: false });
    } catch {
      setCheckingRoll(false);
    }
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // If student already registered for this event, show confirmation directly
    if (studentStatus?.alreadyRegisteredForEvent && studentStatus?.existingRegistration) {
      setConfirmedRecord(studentStatus.existingRegistration);
      return;
    }

    // Validation
    if (!regForm.name.trim()) return setError('Please enter your full name');
    if (!regForm.roll.trim()) return setError('Please enter your student Roll Number (e.g. 22A91A0501)');
    if (regForm.college === 'Other Institution' && !regForm.otherCollege.trim()) {
      return setError('Please specify your institution/college name');
    }
    if (!regForm.mobile.trim() || regForm.mobile.trim().length < 10) {
      return setError('Please enter a valid 10-digit mobile number');
    }
    if (!regForm.email.trim() || !regForm.email.includes('@')) {
      return setError('Please enter a valid email address');
    }

    setLoading(true);
    try {
      const studentPayload = {
        name: regForm.name.trim(),
        college: regForm.college === 'Other Institution' ? regForm.otherCollege.trim() : regForm.college,
        otherCollege: regForm.college === 'Other Institution' ? regForm.otherCollege.trim() : '',
        roll: regForm.roll.trim().toUpperCase(),
        gender: regForm.gender,
        mobile: regForm.mobile.trim(),
        email: regForm.email.trim().toLowerCase(),
        password: regForm.password.trim() || '123456'
      };

      // 1. Register student account into central_event_student_account collection
      const student = await registerStudentAccount(studentPayload);

      setLoading(false);
      if (onSuccess) {
        onSuccess(student, null);
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to complete registration. Please check your details.');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!loginForm.email.trim()) return setError('Please enter your registered Email or Roll Number');
    if (!loginForm.password) return setError('Please enter your password');

    setLoading(true);
    try {
      const student = await loginStudentAccount({
        email: loginForm.email.trim(),
        password: loginForm.password
      });

      setLoading(false);
      if (onSuccess) {
        onSuccess(student, null);
      }
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Invalid credentials. If you are new, please register first.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const displayEventTitle = eventData?.eventName || eventData?.title || eventTitle;

  const confirmedParticipants = useMemo(() => {
    if (!confirmedRecord) return [];
    if (Array.isArray(confirmedRecord.participants) && confirmedRecord.participants.length > 0) {
      return confirmedRecord.participants;
    }
    if (Array.isArray(confirmedRecord.backendRegistration?.participants) && confirmedRecord.backendRegistration.participants.length > 0) {
      return confirmedRecord.backendRegistration.participants;
    }
    const name = confirmedRecord.student_name || confirmedRecord.studentName || regForm.name;
    const roll = confirmedRecord.roll_number || confirmedRecord.studentRoll || regForm.roll;
    const college = confirmedRecord.host_institution || confirmedRecord.studentCollege || regForm.college;
    const phone = confirmedRecord.studentMobile || regForm.mobile || '';
    return [
      {
        participantNumber: 1,
        isLeader: true,
        name,
        rollNumber: roll,
        roll,
        college,
        phone
      }
    ];
  }, [confirmedRecord, regForm]);

  if (!isOpen) return null;

  return (
    <div className="fest-modal-backdrop" onClick={onClose}>
      <div className="fest-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="fest-modal-header">
          <div className="fest-modal-header-banner">
            <div>
              <div className="fest-modal-badge">ADITYA UNIVERSITY FEST • COLOURS 2027</div>
              <h2 className="fest-modal-title">
                {confirmedRecord
                  ? 'Event Registration Confirmation'
                  : mode === 'register'
                    ? 'Register Student Account'
                    : 'Student Account Login'}
              </h2>
              <p className="fest-modal-subtitle">
                {confirmedRecord
                  ? `You are enrolled for ${displayEventTitle} at Colours 2027.`
                  : displayEventTitle
                    ? `Please sign in or register to join the ${displayEventTitle} competition.`
                    : 'Access official Colours 2027 event registrations, certificates & passes.'}
              </p>
            </div>
            <button className="fest-modal-close-btn" onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          </div>
        </div>

        {/* Mode Switch Tabs (hidden on confirmation view) */}
        {!confirmedRecord && (
          <div className="fest-modal-tabs">
            <button
              type="button"
              className={`fest-tab-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setError(null);
              }}
            >
              ✦ New Student? Register Here
            </button>
            <button
              type="button"
              className={`fest-tab-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setError(null);
              }}
            >
              🔑 Existing Student? Sign In
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="fest-modal-body">
          {error && (
            <div className="fest-alert-box error">
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          {confirmedRecord ? (
            /* Registration Success View */
            <div className="reg-success-view">
              <div className="reg-success-icon-wrap">✓</div>
              <h3 className="reg-success-title">Registration Confirmed!</h3>
              <p className="reg-success-sub">
                Saved into <strong>central_event_student_registrations</strong> & payment recorded in <strong>central_event_student_payments</strong>.
              </p>

              <div className="reg-ticket-card">
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Registration ID</span>
                  <span className="reg-ticket-val code">
                    {formatRegistrationId(confirmedRecord.registrationNumber || confirmedRecord.registrationId)}
                  </span>
                </div>
                {confirmedRecord.paymentReference && (
                  <div className="reg-ticket-row">
                    <span className="reg-ticket-label">Payment Ref</span>
                    <span className="reg-ticket-val code" style={{ color: '#0284c7' }}>
                      {formatPaymentReference(confirmedRecord.paymentReference || confirmedRecord.registrationNumber)}
                    </span>
                  </div>
                )}
                {confirmedRecord.orderId && (
                  <div className="reg-ticket-row">
                    <span className="reg-ticket-label">Razorpay Order</span>
                    <span className="reg-ticket-val code" style={{ color: '#7c3aed', fontSize: '0.85rem' }}>
                      {confirmedRecord.orderId}
                    </span>
                  </div>
                )}
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Event Name</span>
                  <span className="reg-ticket-val">{confirmedRecord.event_name || displayEventTitle}</span>
                </div>
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Lead Participant</span>
                  <span className="reg-ticket-val">
                    {confirmedRecord.student_name || confirmedRecord.studentName || regForm.name} ({confirmedRecord.roll_number || confirmedRecord.studentRoll || regForm.roll})
                  </span>
                </div>
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">College</span>
                  <span className="reg-ticket-val">
                    {confirmedRecord.host_institution || confirmedRecord.studentCollege || regForm.college}
                  </span>
                </div>
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Entry Fee</span>
                  <span className="reg-ticket-val" style={{ color: '#16a34a' }}>
                    {eventData?.price ? `₹ ${eventData.price}/- (Pay at Desk)` : 'Free Entry'}
                  </span>
                </div>
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Status</span>
                  <span className="reg-ticket-val" style={{ color: '#2563eb' }}>
                    ● CONFIRMED
                  </span>
                </div>

                {/* Display Participants Data at UI (Step 3) */}
                {confirmedParticipants.length > 0 && (
                  <div className="reg-participants-section">
                    <div className="reg-participants-head">
                      <span className="reg-participants-title">
                        👥 Event Participants ({confirmedParticipants.length} Total)
                      </span>
                      <span className="reg-participants-badge">
                        {confirmedRecord.teamName ? `Team: ${confirmedRecord.teamName}` : 'Solo Participant'}
                      </span>
                    </div>

                    <div className="reg-participants-table-wrap">
                      <table className="reg-participants-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Participant Name</th>
                            <th>Roll / Reg. No</th>
                            <th>College / Institution</th>
                            <th>Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {confirmedParticipants.map((p, idx) => (
                            <tr key={idx} className={p.isLeader ? 'is-leader' : ''}>
                              <td className="col-idx">{idx + 1}</td>
                              <td className="col-name">
                                <strong>{p.name || p.studentName}</strong>
                                {p.phone && <span className="col-phone">{p.phone}</span>}
                              </td>
                              <td className="col-roll">
                                <span className="roll-tag">{p.rollNumber || p.roll}</span>
                              </td>
                              <td className="col-college">{p.college || 'Aditya University'}</td>
                              <td className="col-role">
                                {p.isLeader ? (
                                  <span className="role-badge leader">👑 Leader</span>
                                ) : (
                                  <span className="role-badge member">👤 Member</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', marginTop: '1.25rem' }}>
                <button type="button" className="btn-fest-secondary" onClick={handlePrint}>
                  🖨️ Print Slip
                </button>
                <button type="button" className="btn-fest-primary" onClick={onClose}>
                  Done & Explore More Events
                </button>
              </div>
            </div>
          ) : mode === 'register' ? (
            <form onSubmit={handleRegisterSubmit} id="student-register-form">


              <div className="fest-form-grid">
                {/* Roll Number (with existence check) */}
                <div className="fest-form-group col-span-2">
                  <label className="fest-form-label">
                    Roll / Reg. Number <span className="required">*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="roll"
                      value={regForm.roll}
                      onChange={handleRegisterChange}
                      onBlur={() => handleCheckRoll()}
                      placeholder="e.g. 123456 or 22A91A0501"
                      className="fest-form-input"
                      style={{ textTransform: 'uppercase' }}
                      required
                    />
                    {checkingRoll && (
                      <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '0.8rem', color: '#64748b' }}>
                        Checking...
                      </span>
                    )}
                  </div>

                  {studentStatus?.exists ? (
                    <div className="student-check-badge found">
                      ✓ Existing Student Found: <strong>{studentStatus.student?.name}</strong> ({studentStatus.student?.college || 'Aditya University'})
                    </div>
                  ) : studentStatus?.exists === false ? (
                    <div className="student-check-badge new">
                      ✦ New Student Registration
                    </div>
                  ) : (
                    <span className="fest-form-hint">Used for verification & festival certificates</span>
                  )}

                  {studentStatus?.alreadyRegisteredForEvent && (
                    <div className="fest-alert-box warning" style={{ marginTop: '0.5rem', padding: '0.6rem 0.8rem' }}>
                      <span>⚠️</span>
                      <div style={{ fontSize: '0.82rem' }}>
                        You are already registered for <strong>{displayEventTitle}</strong>!
                        <button
                          type="button"
                          onClick={() => setConfirmedRecord(studentStatus.existingRegistration)}
                          style={{
                            marginLeft: '8px',
                            padding: '3px 10px',
                            background: '#0284c7',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '0.78rem'
                          }}
                        >
                          View Confirmation Slip
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Full Name */}
                <div className="fest-form-group col-span-2">
                  <label className="fest-form-label">
                    Student Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={regForm.name}
                    onChange={handleRegisterChange}
                    placeholder="Enter student full name as per college ID"
                    className="fest-form-input"
                    required
                  />
                </div>

                {/* Gender */}
                <div className="fest-form-group">
                  <label className="fest-form-label">
                    Gender <span className="required">*</span>
                  </label>
                  <select
                    name="gender"
                    value={regForm.gender}
                    onChange={handleRegisterChange}
                    className="fest-form-select"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* College / Institution */}
                <div className="fest-form-group">
                  <label className="fest-form-label">
                    College / Institution <span className="required">*</span>
                  </label>
                  <select
                    name="college"
                    value={regForm.college}
                    onChange={handleRegisterChange}
                    className="fest-form-select"
                  >
                    {COLLEGE_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Other College if selected */}
                {regForm.college === 'Other Institution' && (
                  <div className="fest-form-group col-span-2">
                    <label className="fest-form-label">
                      Institution Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="otherCollege"
                      value={regForm.otherCollege}
                      onChange={handleRegisterChange}
                      placeholder="Enter your college or university full name"
                      className="fest-form-input"
                      required
                    />
                  </div>
                )}

                {/* Mobile */}
                <div className="fest-form-group">
                  <label className="fest-form-label">
                    Mobile Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    maxLength={10}
                    value={regForm.mobile}
                    onChange={handleRegisterChange}
                    placeholder="10-digit mobile number"
                    className="fest-form-input"
                    required
                  />
                </div>

                {/* Email */}
                <div className="fest-form-group">
                  <label className="fest-form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={regForm.email}
                    onChange={handleRegisterChange}
                    placeholder="student@example.com"
                    className="fest-form-input"
                    required
                  />
                </div>

                {/* Password */}
                <div className="fest-form-group col-span-2">
                  <label className="fest-form-label">Create Password (Optional)</label>
                  <input
                    type="password"
                    name="password"
                    value={regForm.password}
                    onChange={handleRegisterChange}
                    placeholder="Set account password (Default: 123456)"
                    className="fest-form-input"
                  />
                  <span className="fest-form-hint">Leave blank to use default password (123456)</span>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} id="student-login-form">

              <div className="fest-form-grid">
                <div className="fest-form-group col-span-2">
                  <label className="fest-form-label">
                    Registered Email or Roll Number <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    placeholder="Enter student email address or roll number"
                    className="fest-form-input"
                    required
                  />
                </div>

                <div className="fest-form-group col-span-2">
                  <label className="fest-form-label">
                    Password <span className="required">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    placeholder="Enter your account password"
                    className="fest-form-input"
                    required
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer (hidden on confirmation view) */}
        {!confirmedRecord && (
          <div className="fest-modal-footer">
            <button type="button" className="btn-fest-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            {mode === 'register' ? (
              <button
                type="submit"
                form="student-register-form"
                className="btn-fest-primary"
                disabled={loading}
              >
                {loading
                  ? 'Processing Registration...'
                  : studentStatus?.alreadyRegisteredForEvent
                    ? 'View Registration Slip'
                    : 'Register & Continue →'}
              </button>
            ) : (
              <button
                type="submit"
                form="student-login-form"
                className="btn-fest-primary"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In & Continue →'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
