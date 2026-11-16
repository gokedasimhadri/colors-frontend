import { useState, useMemo, useEffect } from 'react';
import {
  initiateEventRegistration,
  verifyEventPaymentGateway,
  loadRazorpayScript,
  saveLocalRegistration,
  isStudentRegisteredForEvent,
  fetchStudentByRollNumber,
  fetchEventDepartments,
  matchDepartmentByBranch,
  FALLBACK_EVENT_DEPARTMENTS,
  formatRegistrationId,
  formatPaymentReference
} from '../../services/api';
import './RegistrationModals.css';

const COLLEGE_OPTIONS = [
  'ACET',
  'AEC',
  'ACOE',
  'Aditya University',
  'Other Institution'
];

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

const YEAR_OPTIONS = [
  'Select',
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year'
];

export default function EventRegistrationModal({
  isOpen,
  eventData,
  student,
  onClose
}) {
  const [agreeRules, setAgreeRules] = useState(true);
  const [loading, setLoading] = useState(false);
  const [paymentStage, setPaymentStage] = useState('IDLE'); // 'IDLE' | 'AWAITING_PAYMENT' | 'VERIFYING'
  const [error, setError] = useState(null);
  const [successRecord, setSuccessRecord] = useState(null);

  // Participant 1 (Team Leader or Solo) State matching Image 1
  const [leadParticipant, setLeadParticipant] = useState({
    rollNumber: '',
    name: '',
    college: 'ACET',
    gender: 'Male',
    mobile: '',
    email: '',
    yearOfStudy: 'Select',
    department: 'Select',
    branch: '',
    location: ''
  });

  // Live department list loaded from /api/event-departments
  const [departmentsList, setDepartmentsList] = useState(FALLBACK_EVENT_DEPARTMENTS);

  // Additional Team Members (Participant 2, 3, etc.) matching Image 1
  const [teamMembers, setTeamMembers] = useState([]);

  // Live Auto-fetch statuses per participant index (0 for lead, 1+ for members)
  const [fetchingStatus, setFetchingStatus] = useState({});
  const [verifiedStatus, setVerifiedStatus] = useState({});

  // Fetch live departments from backend on mount
  useEffect(() => {
    fetchEventDepartments()
      .then((depts) => {
        if (Array.isArray(depts) && depts.length > 0) {
          setDepartmentsList(depts);
        }
      })
      .catch(() => {});
  }, []);

  // Pre-warm Razorpay SDK
  useEffect(() => {
    loadRazorpayScript().catch(() => {});
  }, []);

  const eventTitle = eventData?.eventName || eventData?.title || 'Competition';
  const isTeam = useMemo(() => {
    if (!eventData) return false;
    const pType = (eventData.participationType || '').toUpperCase();
    const eType = (eventData.eventType || '').toLowerCase();
    return pType === 'TEAM' || eType.includes('team');
  }, [eventData]);

  // Check if student is already registered for this event
  const existingReg = useMemo(() => {
    if (!student || !eventData) return null;
    return isStudentRegisteredForEvent(student.roll || student._id, eventTitle);
  }, [student, eventData, eventTitle]);

  const activeRecord = successRecord || existingReg;
  const minTeamSize = eventData?.minTeamSize || (isTeam ? 2 : 1);
  const maxTeamSize = eventData?.maxTeamSize || (isTeam ? 15 : 1);

  // Initialize or synchronize lead participant from student prop
  useEffect(() => {
    if (student) {
      const cleanRoll = (student.roll || '').toUpperCase();
      let detectedCollege = student.college || 'ACET';
      if (cleanRoll.includes('A9')) detectedCollege = 'AEC';
      else if (cleanRoll.includes('P3')) detectedCollege = 'ACET';
      else if (cleanRoll.includes('MH')) detectedCollege = 'ACOE';

      const rawBranch = student.branch || student.department || '';
      const matchedDept = matchDepartmentByBranch(rawBranch, departmentsList) || student.department || 'Select';

      setLeadParticipant({
        rollNumber: cleanRoll,
        name: student.name || '',
        college: detectedCollege,
        gender: student.gender || 'Male',
        mobile: student.mobile || '',
        email: student.email || '',
        yearOfStudy: student.year || student.yearOfStudy || 'Select',
        department: matchedDept,
        branch: rawBranch,
        location: student.location || 'Surampalem'
      });

      // Background enrichment via ECAP API
      if (cleanRoll) {
        fetchStudentByRollNumber(cleanRoll)
          .then((ecap) => {
            if (ecap) {
              const ecapMatchedDept = matchDepartmentByBranch(ecap.branch || ecap.department, departmentsList) || ecap.department;
              setLeadParticipant((prev) => ({
                ...prev,
                name: prev.name || ecap.name,
                college: prev.college || ecap.college,
                gender: prev.gender || ecap.gender,
                mobile: prev.mobile || ecap.mobile,
                email: prev.email || ecap.email,
                yearOfStudy: prev.yearOfStudy !== 'Select' ? prev.yearOfStudy : ecap.yearOfStudy,
                department: ecapMatchedDept !== 'Select' ? ecapMatchedDept : prev.department,
                branch: prev.branch || ecap.branch,
                location: prev.location || ecap.location
              }));
              setVerifiedStatus((prev) => ({
                ...prev,
                0: `✓ Verified: ${ecap.name} (${ecap.college || 'Aditya'})`
              }));
            }
          })
          .catch(() => {});
      }
    }
  }, [student, departmentsList]);

  // Handle field change with automatic department selection on branch change
  const handleFieldChange = (index, field, value) => {
    if (field === 'branch') {
      // Automatically match department dropdown value by checking alternativeNames with branch name
      const matchedDept = matchDepartmentByBranch(value, departmentsList);
      if (index === 0) {
        setLeadParticipant((prev) => ({
          ...prev,
          branch: value,
          department: matchedDept || prev.department
        }));
      } else {
        setTeamMembers((prev) => {
          const copy = [...prev];
          copy[index - 1] = {
            ...copy[index - 1],
            branch: value,
            department: matchedDept || copy[index - 1].department
          };
          return copy;
        });
      }
      if (error) setError(null);
      return;
    }

    if (index === 0) {
      setLeadParticipant((prev) => ({ ...prev, [field]: value }));
    } else {
      setTeamMembers((prev) => {
        const copy = [...prev];
        copy[index - 1] = { ...copy[index - 1], [field]: value };
        return copy;
      });
    }
    if (error) setError(null);
  };

  // Trigger roll number auto-fetch from ECAP API
  const triggerRollAutoFetch = async (index, roll) => {
    const clean = (roll || '').toUpperCase().trim();
    if (!clean) return;

    setFetchingStatus((prev) => ({ ...prev, [index]: true }));
    setVerifiedStatus((prev) => ({ ...prev, [index]: null }));

    try {
      const data = await fetchStudentByRollNumber(clean);
      if (data && (data.name || data.studentname || data.rollNumber)) {
        // Automatically match department dropdown value by checking alternativeNames with branch name
        const rawBranch = data.branch || data.department || '';
        const matchedDept = matchDepartmentByBranch(rawBranch, departmentsList) || data.department || 'Select';

        if (index === 0) {
          setLeadParticipant((prev) => ({
            ...prev,
            rollNumber: clean,
            name: data.name || prev.name,
            college: data.college || prev.college,
            gender: data.gender || prev.gender,
            mobile: data.mobile || prev.mobile,
            email: data.email || prev.email,
            yearOfStudy: data.yearOfStudy || prev.yearOfStudy,
            department: matchedDept,
            branch: rawBranch || prev.branch,
            location: data.location || prev.location
          }));
        } else {
          setTeamMembers((prev) => {
            const copy = [...prev];
            const curr = copy[index - 1] || {};
            copy[index - 1] = {
              ...curr,
              rollNumber: clean,
              name: data.name || curr.name,
              college: data.college || curr.college,
              gender: data.gender || curr.gender,
              mobile: data.mobile || curr.mobile,
              email: data.email || curr.email,
              yearOfStudy: data.yearOfStudy || curr.yearOfStudy,
              department: matchedDept,
              branch: rawBranch || curr.branch,
              location: data.location || curr.location
            };
            return copy;
          });
        }
        setVerifiedStatus((prev) => ({
          ...prev,
          [index]: `✓ Loaded from ECAP: ${data.name} (${data.college || 'Aditya'})`
        }));
      } else {
        setVerifiedStatus((prev) => ({
          ...prev,
          [index]: 'ℹ️ Roll not found in ECAP. You can enter details manually.'
        }));
      }
    } catch (err) {
      console.warn('Error fetching student for roll:', clean, err);
      setVerifiedStatus((prev) => ({
        ...prev,
        [index]: '⚠️ ECAP service check failed. Enter details manually.'
      }));
    } finally {
      setFetchingStatus((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Roll Number input change
  const handleRollChange = (index, val) => {
    const upper = val.toUpperCase();
    if (index === 0) {
      setLeadParticipant((prev) => ({ ...prev, rollNumber: upper }));
    } else {
      setTeamMembers((prev) => {
        const copy = [...prev];
        copy[index - 1] = { ...copy[index - 1], rollNumber: upper };
        return copy;
      });
    }

    // Auto-fetch if length >= 6 (standard college roll format)
    if (upper.trim().length >= 6) {
      triggerRollAutoFetch(index, upper.trim());
    }
  };

  // Add Member
  const handleAddMember = () => {
    if (teamMembers.length + 1 >= maxTeamSize) {
      return setError(`Maximum team size for this event is ${maxTeamSize} participants.`);
    }
    setTeamMembers((prev) => [
      ...prev,
      {
        rollNumber: '',
        name: '',
        college: leadParticipant.college || 'ACET',
        gender: 'Male',
        mobile: '',
        email: '',
        yearOfStudy: 'Select',
        department: 'Select',
        branch: '',
        location: leadParticipant.location || ''
      }
    ]);
    if (error) setError(null);
  };

  // Remove Member
  const handleRemoveMember = (memberIdx) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== memberIdx));
    setVerifiedStatus((prev) => {
      const updated = { ...prev };
      delete updated[memberIdx + 1];
      return updated;
    });
  };

  // Formulate complete participants array based on team size
  const allParticipants = useMemo(() => {
    const list = [];
    // Participant 1 (Team Leader or Solo)
    list.push({
      participantNumber: 1,
      isLeader: true,
      name: leadParticipant.name || student?.name || 'Participant 1',
      rollNumber: (leadParticipant.rollNumber || student?.roll || '').toUpperCase(),
      roll: (leadParticipant.rollNumber || student?.roll || '').toUpperCase(),
      college: leadParticipant.college || student?.college || 'Aditya University',
      gender: leadParticipant.gender || 'Male',
      mobile: leadParticipant.mobile || student?.mobile || '',
      phone: leadParticipant.mobile || student?.mobile || '',
      email: leadParticipant.email || student?.email || '',
      yearOfStudy: leadParticipant.yearOfStudy || 'Select',
      year: leadParticipant.yearOfStudy || '3rd Year',
      department: leadParticipant.department || 'Select',
      departments: leadParticipant.department || 'Select',
      branch: leadParticipant.branch || leadParticipant.department || '',
      location: leadParticipant.location || ''
    });

    if (isTeam && Array.isArray(teamMembers)) {
      teamMembers.forEach((m, idx) => {
        list.push({
          participantNumber: idx + 2,
          isLeader: false,
          name: m.name || '',
          rollNumber: (m.rollNumber || '').toUpperCase(),
          roll: (m.rollNumber || '').toUpperCase(),
          college: m.college || 'Aditya University',
          gender: m.gender || 'Male',
          mobile: m.mobile || '',
          phone: m.mobile || '',
          email: m.email || '',
          yearOfStudy: m.yearOfStudy || 'Select',
          year: m.yearOfStudy || '',
          department: m.department || 'Select',
          departments: m.department || 'Select',
          branch: m.branch || m.department || '',
          location: m.location || ''
        });
      });
    }
    return list;
  }, [leadParticipant, teamMembers, student, isTeam]);

  // Compute registered participants for confirmation slip UI
  const recordParticipants = useMemo(() => {
    if (!activeRecord) return [];
    if (Array.isArray(activeRecord.participants) && activeRecord.participants.length > 0) {
      return activeRecord.participants;
    }
    if (Array.isArray(activeRecord.backendRegistration?.participants) && activeRecord.backendRegistration.participants.length > 0) {
      return activeRecord.backendRegistration.participants;
    }
    return allParticipants;
  }, [activeRecord, allParticipants]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!agreeRules) {
      return setError('Please accept the event regulations to complete registration.');
    }

    if (!leadParticipant.name.trim() || !leadParticipant.rollNumber.trim()) {
      return setError('Please fill Roll Number and Name for Participant 1.');
    }

    // Only validate additional team members if they were added and started
    const validTeamMembers = isTeam
      ? teamMembers.filter((m) => (m.rollNumber && m.rollNumber.trim()) || (m.name && m.name.trim()))
      : [];

    if (isTeam) {
      for (let i = 0; i < validTeamMembers.length; i++) {
        const m = validTeamMembers[i];
        if (!m.name?.trim() || !m.rollNumber?.trim()) {
          return setError(`Please enter both Roll Number and Name for Participant #${i + 2}, or remove the empty participant box.`);
        }
      }
    }

    setLoading(true);
    try {
      const feeAmount = Number(
        eventData.price !== undefined ? eventData.price : (eventData.fee?.amount || 0)
      );

      const activeParticipants = allParticipants.filter(
        (p) => p.isLeader || (p.rollNumber && p.rollNumber.trim() && p.name && p.name.trim())
      );

      const payload = {
        eventId: eventData._id || eventData.rawId || eventData.id,
        eventSlug: eventData.slug || eventData.eventSlug || '',
        eventName: eventTitle,
        category: eventData.category || eventData.categoryName || 'General',
        subCategory: '',
        price: feeAmount,
        amount: feeAmount,
        venue: eventData.venueObj?.name || eventData.venue || 'Aditya University Campus',
        studentId: student._id || student.id,
        studentName: leadParticipant.name || student.name,
        studentRoll: leadParticipant.rollNumber || student.roll,
        studentCollege: leadParticipant.college || student.college,
        studentEmail: leadParticipant.email || student.email,
        studentMobile: leadParticipant.mobile || student.mobile,
        studentDepartment: leadParticipant.department || 'General',
        studentYear: leadParticipant.yearOfStudy || '3rd Year',
        isTeam,
        teamName: null,
        teamSize: activeParticipants.length,
        participants: activeParticipants,
        teamMembers: validTeamMembers
      };

      // Case A: Free Event (₹ 0) -> Direct registration
      if (feeAmount === 0) {
        const initData = await initiateEventRegistration(payload);
        const record = {
          registrationId: initData.registrationNumber,
          registrationNumber: initData.registrationNumber,
          paymentReference: initData.paymentReference,
          orderId: null,
          paymentId: null,
          status: 'CONFIRMED',
          paymentStatus: 'FREE',
          amount: 0,
          registeredAt: new Date().toISOString(),
          ...payload,
          participants: initData.registration?.participants || payload.participants,
          teamSize: initData.registration?.teamSize || payload.teamSize,
          backendRegistration: initData.registration
        };
        saveLocalRegistration(record);
        setSuccessRecord(record);
        setLoading(false);
        return;
      }

      // Case B: Paid Event (e.g. ₹ 1 or ₹ 700) -> Initiate order & open Razorpay
      const initData = await initiateEventRegistration(payload);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || typeof window.Razorpay === 'undefined') {
        setLoading(false);
        setPaymentStage('IDLE');
        return setError('Unable to initialize Razorpay checkout gateway. Please verify your internet connection.');
      }

      const rzpOptions = {
        key: initData.keyId,
        amount: initData.amountInPaise,
        currency: initData.currency || 'INR',
        name: 'Aditya University • Colours 2027',
        description: `${eventTitle} Registration Fee`,
        image: '/favicon.svg',
        order_id: initData.orderId,
        prefill: {
          name: leadParticipant.name || student.name || '',
          email: leadParticipant.email || student.email || '',
          contact: leadParticipant.mobile || student.mobile || ''
        },
        theme: {
          color: '#e11d48'
        },
        handler: async function (response) {
          setPaymentStage('VERIFYING');
          setLoading(true);
          try {
            const verifyRes = await verifyEventPaymentGateway({
              registrationNumber: initData.registrationNumber,
              paymentReference: initData.paymentReference,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              centralEventId: eventData._id || eventData.rawId || null,
              eventTitle: eventTitle,
              eventSlug: eventData.slug || eventData.eventSlug || '',
              amount: feeAmount
            });

            const finalRecord = {
              registrationId: initData.registrationNumber,
              registrationNumber: initData.registrationNumber,
              paymentReference: initData.paymentReference,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              centralEventId: eventData._id || eventData.rawId || verifyRes.data?.payment?.centralEventId,
              eventTitle: eventTitle,
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
              amount: feeAmount,
              paidAt: new Date().toISOString(),
              ...payload,
              participants: verifyRes.data?.registration?.participants || payload.participants,
              teamSize: verifyRes.data?.registration?.teamSize || payload.teamSize,
              backendRegistration: verifyRes.data?.registration,
              backendPayment: verifyRes.data?.payment
            };

            saveLocalRegistration(finalRecord);
            setSuccessRecord(finalRecord);
            setPaymentStage('IDLE');
            setLoading(false);
          } catch (verifyErr) {
            setPaymentStage('IDLE');
            setLoading(false);
            setError(`Payment verification failed: ${verifyErr.message || 'Please contact festival support desk.'}`);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentStage('IDLE');
            setLoading(false);
            setError('Payment window closed. Your registration is pending payment and no payment was charged.');
          }
        }
      };

      const rzpInstance = new window.Razorpay(rzpOptions);
      rzpInstance.on('payment.failed', function (resp) {
        setPaymentStage('IDLE');
        setLoading(false);
        setError(`Payment failed: ${resp.error?.description || 'Transaction declined. Please retry.'}`);
      });
      rzpInstance.open();

      setPaymentStage('AWAITING_PAYMENT');
      setLoading(false);
    } catch (err) {
      setPaymentStage('IDLE');
      setLoading(false);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen || !eventData) return null;

  // Helper renderer for Participant Pattern Block (Image 1 Layout)
  const renderParticipantBlock = (data, index) => {
    const isLead = index === 0;
    const isFetching = Boolean(fetchingStatus[index]);
    const vStatus = verifiedStatus[index];

    return (
      <div
        key={index}
        className={`participant-pattern-block ${isLead ? 'leader-block' : ''}`}
      >
        <div className="participant-pattern-header">
          <h3 className="participant-main-heading">
            Enter Participant-{index + 1} Details
          </h3>
          <div className="participant-sub-heading-row">
            <h4 className="participant-sub-heading">
              Participant {index + 1}
              {isLead && isTeam && (
                <span className="participant-badge-leader">👑 Team Leader</span>
              )}
            </h4>
            {!isLead && (
              <button
                type="button"
                className="btn-remove-participant"
                onClick={() => handleRemoveMember(index - 1)}
                title="Remove participant"
              >
                ✕ Remove Participant
              </button>
            )}
          </div>
        </div>

        <div className="participant-pattern-grid">
          {/* Row 1: Roll Number, Name, College, Gender */}
          <div className="pattern-field-col">
            <label className="pattern-label">Roll Number</label>
            <div className="pattern-input-with-action">
              <input
                type="text"
                className="pattern-input"
                placeholder="e.g. 123456"
                value={data.rollNumber}
                onChange={(e) => handleRollChange(index, e.target.value)}
                onBlur={() => triggerRollAutoFetch(index, data.rollNumber)}
                style={{ textTransform: 'uppercase' }}
                required
              />
              {isFetching && (
                <span className="pattern-fetch-spinner" title="Fetching student details from ECAP...">
                  ⏳
                </span>
              )}
            </div>
            {vStatus && (
              <div
                className={`pattern-verified-hint ${
                  vStatus.startsWith('✓') ? 'success' : 'info'
                }`}
              >
                {vStatus}
              </div>
            )}
          </div>

          <div className="pattern-field-col">
            <label className="pattern-label">Name</label>
            <input
              type="text"
              className="pattern-input"
              placeholder="Full Name"
              value={data.name}
              onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
              required
            />
          </div>

          <div className="pattern-field-col">
            <label className="pattern-label">College</label>
            <select
              className="pattern-select"
              value={data.college}
              onChange={(e) => handleFieldChange(index, 'college', e.target.value)}
            >
              {COLLEGE_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="pattern-field-col">
            <label className="pattern-label">Gender</label>
            <select
              className="pattern-select"
              value={data.gender}
              onChange={(e) => handleFieldChange(index, 'gender', e.target.value)}
            >
              {GENDER_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Row 2: Mobile, Email, Year of study, Departments */}
          <div className="pattern-field-col">
            <label className="pattern-label">Mobile</label>
            <input
              type="tel"
              className="pattern-input"
              placeholder="10-digit mobile"
              value={data.mobile}
              maxLength={10}
              onChange={(e) => handleFieldChange(index, 'mobile', e.target.value)}
            />
          </div>

          <div className="pattern-field-col">
            <label className="pattern-label">Email</label>
            <input
              type="email"
              className="pattern-input"
              placeholder="Email address"
              value={data.email}
              onChange={(e) => handleFieldChange(index, 'email', e.target.value)}
            />
          </div>

          <div className="pattern-field-col">
            <label className="pattern-label">Year of study</label>
            <select
              className="pattern-select"
              value={data.yearOfStudy}
              onChange={(e) => handleFieldChange(index, 'yearOfStudy', e.target.value)}
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="pattern-field-col">
            <label className="pattern-label">Departments</label>
            <select
              className="pattern-select"
              value={data.department || 'Select'}
              onChange={(e) => handleFieldChange(index, 'department', e.target.value)}
            >
              <option value="Select">Select</option>
              {departmentsList.map((d) => {
                const deptName = typeof d === 'string' ? d : d.name;
                return (
                  <option key={deptName} value={deptName}>
                    {deptName}
                  </option>
                );
              })}
              {data.department &&
                data.department !== 'Select' &&
                !departmentsList.some((d) => (d.name || d) === data.department) && (
                  <option value={data.department}>{data.department}</option>
                )}
            </select>
          </div>

          {/* Row 3: Branch, Location */}
          <div className="pattern-field-col">
            <label className="pattern-label">Branch</label>
            <input
              type="text"
              className="pattern-input"
              placeholder="e.g. CSE"
              value={data.branch}
              onChange={(e) => handleFieldChange(index, 'branch', e.target.value)}
            />
          </div>

          <div className="pattern-field-col">
            <label className="pattern-label">Location</label>
            <input
              type="text"
              className="pattern-input"
              placeholder="e.g. Surampalem / Kakinada"
              value={data.location}
              onChange={(e) => handleFieldChange(index, 'location', e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fest-modal-backdrop" onClick={onClose}>
      <div className="fest-modal-card event-reg-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="fest-modal-header">
          <div className="fest-modal-header-banner">
            <div>
              <div className="fest-modal-badge">
                {eventData.category || 'COLOURS 2027'}
              </div>
              <h2 className="fest-modal-title">
                {activeRecord ? 'Event Registration Confirmation' : `Register: ${eventTitle}`}
              </h2>
              <div className="fest-modal-subtitle">
                Aditya University Youth Cultural & Sports Festival • Colours 2027
              </div>
            </div>
            <button
              className="fest-modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="fest-modal-body">
          {error && <div className="fest-modal-alert error">⚠️ {error}</div>}

          {/* Already Registered / Confirmed View */}
          {activeRecord ? (
            <div className="reg-confirmed-view">
              <div className="reg-ticket-card">
                <div className="reg-ticket-header">
                  <div className="reg-ticket-fest-tag">COLOURS 2027 • OFFICIAL PASS</div>
                  <div className="reg-ticket-id">
                    ID: {formatRegistrationId(activeRecord.registrationNumber || activeRecord.registrationId)}
                  </div>
                </div>

                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Registration ID</span>
                  <span className="reg-ticket-val code">
                    {formatRegistrationId(activeRecord.registrationNumber || activeRecord.registrationId)}
                  </span>
                </div>
                {activeRecord.paymentReference && (
                  <div className="reg-ticket-row">
                    <span className="reg-ticket-label">Payment Ref</span>
                    <span className="reg-ticket-val code" style={{ color: '#0284c7' }}>
                      {formatPaymentReference(activeRecord.paymentReference || activeRecord.registrationNumber)}
                    </span>
                  </div>
                )}
                {activeRecord.orderId && (
                  <div className="reg-ticket-row">
                    <span className="reg-ticket-label">Razorpay Order</span>
                    <span className="reg-ticket-val code" style={{ color: '#7c3aed', fontSize: '0.85rem' }}>
                      {activeRecord.orderId}
                    </span>
                  </div>
                )}
                {activeRecord.paymentId && (
                  <div className="reg-ticket-row">
                    <span className="reg-ticket-label">Razorpay Payment ID</span>
                    <span className="reg-ticket-val code" style={{ color: '#16a34a', fontWeight: 700 }}>
                      {activeRecord.paymentId}
                    </span>
                  </div>
                )}
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Event Name</span>
                  <span className="reg-ticket-val">{eventTitle}</span>
                </div>
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Category</span>
                  <span className="reg-ticket-val">
                    {eventData.category || 'COLORS Event'}
                  </span>
                </div>
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Lead Participant</span>
                  <span className="reg-ticket-val">
                    {leadParticipant?.name || student?.name} ({leadParticipant?.rollNumber || student?.roll})
                  </span>
                </div>
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">College</span>
                  <span className="reg-ticket-val">{leadParticipant?.college || student?.college}</span>
                </div>
                {activeRecord.teamName && (
                  <div className="reg-ticket-row">
                    <span className="reg-ticket-label">Team Name</span>
                    <span className="reg-ticket-val">{activeRecord.teamName}</span>
                  </div>
                )}
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Entry Fee</span>
                  <span className="reg-ticket-val" style={{ color: '#16a34a', fontWeight: 700 }}>
                    {activeRecord.paymentStatus === 'PAID' || activeRecord.paymentId
                      ? `₹ ${eventData.price}/- (Paid Online via Razorpay)`
                      : eventData.price
                      ? `₹ ${eventData.price}/-`
                      : 'Free Entry'}
                  </span>
                </div>
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Venue</span>
                  <span className="reg-ticket-val">
                    {eventData.venueObj?.name || eventData.venue || 'Aditya University Central Campus'}
                  </span>
                </div>
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Status</span>
                  <span className="reg-ticket-val" style={{ color: '#16a34a', fontWeight: 800 }}>
                    {activeRecord.paymentStatus === 'PAID' || activeRecord.paymentId ? '● CONFIRMED & PAID' : '● CONFIRMED'}
                  </span>
                </div>

                {/* Display Participants Data at UI */}
                {recordParticipants.length > 0 && (
                  <div className="reg-participants-section">
                    <div className="reg-participants-head">
                      <span className="reg-participants-title">
                        👥 Event Participants ({recordParticipants.length} {recordParticipants.length === 1 ? 'Participant' : 'Members'})
                      </span>
                      {activeRecord.teamName && (
                        <span className="reg-participants-badge">Team: {activeRecord.teamName}</span>
                      )}
                    </div>

                    <div className="reg-participants-table-wrap">
                      <table className="reg-participants-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Participant Name</th>
                            <th>Roll Number</th>
                            <th>College</th>
                            <th>Department</th>
                            <th>Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recordParticipants.map((p, idx) => (
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
                              <td className="col-dept">{p.department || p.branch || '—'}</td>
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

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button type="button" className="btn-fest-secondary" onClick={handlePrint}>
                  🖨️ Print Slip
                </button>
                <button type="button" className="btn-fest-primary" onClick={onClose}>
                  Done & Explore More Events
                </button>
              </div>
            </div>
          ) : (
            /* Registration Form View with Image 1 Pattern */
            <form onSubmit={handleSubmit} id="event-registration-form">
              {paymentStage === 'AWAITING_PAYMENT' && (
                <div className="fest-awaiting-payment-banner">
                  <div>
                    <span className="fest-pulse-dot"></span>
                    <strong>Razorpay Checkout Open:</strong> Please complete your payment in the popup window.
                  </div>
                  <span style={{ fontSize: '0.78rem', opacity: 0.85 }}>Secure Gateway</span>
                </div>
              )}

              {/* Event Summary Box */}
              <div className="event-reg-summary-box">
                <div className="event-reg-summary-details">
                  <div className="event-reg-event-title">{eventTitle}</div>
                  <div className="event-reg-meta-pills">
                    <span className="event-meta-pill-item pill-category">
                      {eventData.category}
                    </span>
                    <span className="event-meta-pill-item">
                      👥 {eventData.eventType || (isTeam ? 'Team' : 'Solo')}
                    </span>
                    <span className="event-meta-pill-item">
                      📍 {eventData.venueObj?.name || eventData.venue || 'Campus Venue'}
                    </span>
                  </div>
                </div>

                <div className="event-reg-fee-box">
                  <div className="event-reg-fee-label">Entry Fee</div>
                  <div className="event-reg-fee-amount">
                    {eventData.price ? `₹ ${eventData.price}/-` : 'Free'}
                  </div>
                </div>
              </div>

              {/* Team Leader Registration Notice */}
              {isTeam && (
                <div
                  className="team-leader-info-notice"
                  style={{
                    background: 'rgba(2, 132, 199, 0.08)',
                    border: '1px solid rgba(2, 132, 199, 0.22)',
                    borderRadius: '10px',
                    padding: '0.85rem 1.15rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.86rem',
                    color: '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    lineHeight: 1.45
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>💡</span>
                  <div>
                    <strong style={{ color: '#0284c7' }}>Team Leader Registration:</strong> You only need to register and complete payment as Participant 1 now. You can add or update the rest of your squad participants later directly from your <strong>Student Dashboard Account</strong>!
                  </div>
                </div>
              )}

              {/* Participant 1 Block (Image 1 Pattern) */}
              {renderParticipantBlock(leadParticipant, 0)}

              {/* Additional Team Participants Blocks (Image 1 Pattern) */}
              {isTeam && teamMembers.map((member, idx) => renderParticipantBlock(member, idx + 1))}

              {/* Add Member Button (If Team Event) */}
              {isTeam && teamMembers.length + 1 < maxTeamSize && (
                <button
                  type="button"
                  className="btn-add-team-participant"
                  onClick={handleAddMember}
                >
                  + Add Participant ({teamMembers.length + 1}/{maxTeamSize})
                </button>
              )}

              {/* Real-time Team Participants Roster Table Preview */}
              {isTeam && allParticipants.length > 0 && (
                <div className="roster-preview-box" style={{ marginBottom: '1.5rem' }}>
                  <div className="roster-preview-title">
                    📋 Team Participants Roster ({allParticipants.length} of {minTeamSize}-{maxTeamSize})
                  </div>
                  <div className="roster-chips-wrap">
                    {allParticipants.map((p, idx) => (
                      <div key={idx} className={`roster-chip ${p.isLeader ? 'leader' : ''}`}>
                        <span className="roster-chip-num">#{idx + 1}</span>
                        <span className="roster-chip-name">{p.name || 'Pending Name'}</span>
                        <span className="roster-chip-roll">({p.roll || 'Pending Roll'})</span>
                        {p.isLeader ? (
                          <span className="roster-chip-role leader">Leader</span>
                        ) : (
                          <span className="roster-chip-role">Member</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Regulations Acceptance */}
              <div className="fest-rules-box" style={{ marginTop: '1rem' }}>
                <label className="fest-checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreeRules}
                    onChange={(e) => setAgreeRules(e.target.checked)}
                    required
                  />
                  <span>
                    I confirm that all entered details are accurate, and I agree to adhere to the official rules, time limits, and campus code of conduct for {eventTitle}.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="fest-modal-footer">
                <button
                  type="button"
                  className="btn-fest-secondary"
                  onClick={onClose}
                  disabled={loading && paymentStage === 'VERIFYING'}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-fest-primary"
                  disabled={loading && paymentStage === 'VERIFYING'}
                  style={{
                    background: 'linear-gradient(135deg, #e11d48, #be123c)',
                    color: '#ffffff'
                  }}
                >
                  {paymentStage === 'VERIFYING'
                    ? 'Verifying Payment on Server...'
                    : paymentStage === 'AWAITING_PAYMENT'
                    ? 'Awaiting Payment Completion...'
                    : loading
                    ? 'Processing...'
                    : eventData.price
                    ? `Pay ₹ ${eventData.price}/- & Register via Razorpay ★`
                    : 'Confirm Free Registration ★'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
