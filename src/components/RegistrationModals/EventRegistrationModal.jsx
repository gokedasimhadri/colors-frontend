import { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  formatPaymentReference,
  isValidOtherCollege,
  parseEventFeeInRupees
} from '../../services/api';
import { LiquidGlass } from '../ThemeComponents/LiquidGlass';
import ThemeButton from '../ThemeComponents/ThemeButton';
import SplitColorText from '../ThemeComponents/SplitColor/SplitColorText';
import { MuiTextField, MuiSelectField } from './MuiTextField';
import './RegistrationModals.css';

const COLLEGE_OPTIONS = [
  'AUS',
  'ACET',
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
  const [agreeRules, setAgreeRules] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentStage, setPaymentStage] = useState('IDLE'); // 'IDLE' | 'AWAITING_PAYMENT' | 'VERIFYING'
  const [error, setError] = useState(null);
  const [successRecord, setSuccessRecord] = useState(null);

  // Participant 1 (Team Leader or Solo) State matching Image 1
  const [leadParticipant, setLeadParticipant] = useState({
    rollNumber: '',
    name: '',
    college: 'AUS',
    otherCollege: '',
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
  const [otherCollegeErrors, setOtherCollegeErrors] = useState({});

  // Fetch live departments from backend on mount
  useEffect(() => {
    fetchEventDepartments()
      .then((depts) => {
        if (Array.isArray(depts) && depts.length > 0) {
          setDepartmentsList(depts);
        }
      })
      .catch(() => { });
  }, []);

  // Pre-warm Razorpay SDK
  useEffect(() => {
    loadRazorpayScript().catch(() => { });
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
      let detectedCollege = 'AUS';
      if (cleanRoll.includes('P3')) {
        detectedCollege = 'ACET';
      } else if (student.college === 'Other Institution') {
        detectedCollege = 'Other Institution';
      } else if (student.college && student.college.toUpperCase().includes('ACET')) {
        detectedCollege = 'ACET';
      } else {
        detectedCollege = 'AUS';
      }

      const rawBranch = student.branch || student.department || '';
      const matchedDept = matchDepartmentByBranch(rawBranch, departmentsList) || student.department || 'Select';

      setLeadParticipant({
        rollNumber: cleanRoll,
        name: student.name || '',
        college: detectedCollege,
        otherCollege: student.otherCollege || (detectedCollege === 'Other Institution' && student.college !== 'Other Institution' ? student.college : ''),
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
          .catch(() => { });
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

    if (field === 'otherCollege') {
      if (otherCollegeErrors[index] && isValidOtherCollege(value)) {
        setOtherCollegeErrors((prev) => {
          const next = { ...prev };
          delete next[index];
          return next;
        });
      }
    }
    if (field === 'college' && value !== 'Other Institution') {
      setOtherCollegeErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
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

  // Validate otherCollege on blur (when tabbing out of the input)
  const handleOtherCollegeBlur = (index, val) => {
    const trimmed = (val || '').trim();
    if (trimmed && !isValidOtherCollege(trimmed)) {
      setOtherCollegeErrors((prev) => ({
        ...prev,
        [index]: '⚠️ College name must contain "University" or "Engineering"'
      }));
    } else {
      setOtherCollegeErrors((prev) => {
        const next = { ...prev };
        delete next[index];
        return next;
      });
    }
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
        college: leadParticipant.college || 'AUS',
        otherCollege: '',
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
    const resolvedLeadCollege = leadParticipant.college === 'Other Institution'
      ? (leadParticipant.otherCollege?.trim() || 'Other Institution')
      : (leadParticipant.college || 'AUS');

    // Participant 1 (Team Leader or Solo)
    list.push({
      participantNumber: 1,
      isLeader: true,
      name: leadParticipant.name || student?.name || 'Participant 1',
      rollNumber: (leadParticipant.rollNumber || student?.roll || '').toUpperCase(),
      roll: (leadParticipant.rollNumber || student?.roll || '').toUpperCase(),
      college: resolvedLeadCollege,
      institution: resolvedLeadCollege,
      otherCollege: leadParticipant.otherCollege || '',
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
        const resolvedMemberCollege = m.college === 'Other Institution'
          ? (m.otherCollege?.trim() || 'Other Institution')
          : (m.college || 'AUS');

        list.push({
          participantNumber: idx + 2,
          isLeader: false,
          name: m.name || '',
          rollNumber: (m.rollNumber || '').toUpperCase(),
          roll: (m.rollNumber || '').toUpperCase(),
          college: resolvedMemberCollege,
          institution: resolvedMemberCollege,
          otherCollege: m.otherCollege || '',
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

    // Validate Participant 1 College Name if Other Institution is selected
    if (leadParticipant.college === 'Other Institution') {
      const col = (leadParticipant.otherCollege || '').trim();
      if (!col) {
        setOtherCollegeErrors((prev) => ({
          ...prev,
          0: '⚠️ Please enter college name'
        }));
        return setError('Please enter college name for Participant 1.');
      }
      if (!isValidOtherCollege(col)) {
        setOtherCollegeErrors((prev) => ({
          ...prev,
          0: '⚠️ Must contain "University" or "Engineering"'
        }));
        return setError('Participant 1: College name must contain "University" or "Engineering" to be accepted.');
      }
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
        if (m.college === 'Other Institution') {
          const col = (m.otherCollege || '').trim();
          if (!col) {
            setOtherCollegeErrors((prev) => ({
              ...prev,
              [i + 1]: '⚠️ Please enter college name'
            }));
            return setError(`Please enter college name for Participant #${i + 2}.`);
          }
          if (!isValidOtherCollege(col)) {
            setOtherCollegeErrors((prev) => ({
              ...prev,
              [i + 1]: '⚠️ Must contain "University" or "Engineering"'
            }));
            return setError(`Participant #${i + 2}: College name must contain "University" or "Engineering" to be accepted.`);
          }
        }
      }
    }

    setLoading(true);
    try {
      const feeAmount = Number(
        eventData.price !== undefined ? eventData.price : parseEventFeeInRupees(eventData.fee || 0)
      );

      const activeParticipants = allParticipants.filter(
        (p) => p.isLeader || (p.rollNumber && p.rollNumber.trim() && p.name && p.name.trim())
      );

      const resolvedStudentCollege = leadParticipant.college === 'Other Institution'
        ? (leadParticipant.otherCollege?.trim() || 'Other Institution')
        : (leadParticipant.college || student.college);

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
        studentCollege: resolvedStudentCollege,
        otherCollege: leadParticipant.otherCollege || '',
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

      const resolvedKey =
        initData.keyId ||
        initData.razorpay?.keyId ||
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RAZORPAY_KEY_ID) ||
        'rzp_live_Kmh34Xa4jArEXT';

      const resolvedOrderId = initData.orderId || initData.razorpay?.orderId;
      const resolvedAmount = initData.amountInPaise || initData.razorpay?.amount || feeAmount * 100;
      const resolvedCurrency = initData.currency || initData.razorpay?.currency || 'INR';

      if (!resolvedKey) {
        setLoading(false);
        setPaymentStage('IDLE');
        return setError('Unable to initialize Razorpay checkout. Payment gateway key is missing.');
      }

      const rzpOptions = {
        key: resolvedKey,
        amount: resolvedAmount,
        currency: resolvedCurrency,
        name: 'Aditya University • Colours 2027',
        description: `${eventTitle} Registration Fee`,
        image: '/favicon.svg',
        order_id: resolvedOrderId,
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
          <SplitColorText
            as="h3"
            className="participant-main-heading"
            screenSync={false}
            leftColor="#0f172a"
            rightColor="#0f172a"
          >
            Enter Participant-{index + 1} Details
          </SplitColorText>
          <div className="participant-sub-heading-row">
            <h4 className="participant-sub-heading">
              <SplitColorText screenSync={false} leftColor="#475569" rightColor="#475569">
                Participant {index + 1}
              </SplitColorText>
              {isLead && isTeam && (
                <span className="participant-badge-leader">
                  <SplitColorText screenSync={false} leftColor="#be9337" rightColor="#be9337">
                    👑 Team Leader
                  </SplitColorText>
                </span>
              )}
            </h4>
            {!isLead && (
              <ThemeButton
                type="button"
                className="btn-remove-participant"
                onClick={() => handleRemoveMember(index - 1)}
                borderRadius={8}
                height={32}
                showBlast={false}
              >
                <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>
                  ✕ Remove Participant
                </span>
              </ThemeButton>
            )}
          </div>
        </div>

        <div className="participant-pattern-grid">
          {/* Row 1: Roll Number, Name, College, Gender */}
          <div className="pattern-field-col">
            <MuiTextField
              label="Roll Number"
              name={`rollNumber-${index}`}
              id={`rollNumber-${index}`}
              placeholder="e.g. 123456"
              value={data.rollNumber}
              onChange={(e) => handleRollChange(index, e.target.value)}
              onBlur={() => triggerRollAutoFetch(index, data.rollNumber)}
              style={{ textTransform: 'uppercase' }}
              hint={isFetching ? '⏳ Fetching student details...' : vStatus}
              required
            />
          </div>

          <div className="pattern-field-col">
            <MuiTextField
              label="Name"
              name={`name-${index}`}
              id={`name-${index}`}
              placeholder="Full Name"
              value={data.name}
              onChange={(e) => handleFieldChange(index, 'name', e.target.value)}
              required
            />
          </div>

          <div className="pattern-field-col">
            <MuiSelectField
              label="College"
              name={`college-${index}`}
              id={`college-${index}`}
              value={data.college}
              onChange={(e) => handleFieldChange(index, 'college', e.target.value)}
              options={COLLEGE_OPTIONS}
              required
            />
          </div>

          {data.college === 'Other Institution' && (
            <div className="pattern-field-col pattern-other-college-field">
              <MuiTextField
                label="College Name"
                name={`otherCollege-${index}`}
                id={`otherCollege-${index}`}
                placeholder="e.g. JNTU University / ABC Engineering"
                value={data.otherCollege || ''}
                onChange={(e) => handleFieldChange(index, 'otherCollege', e.target.value)}
                onBlur={(e) => handleOtherCollegeBlur(index, e.target.value)}
                error={otherCollegeErrors[index]}
                hint={!otherCollegeErrors[index] && data.otherCollege && isValidOtherCollege(data.otherCollege) ? 'ℹ️ College ID Card is required for entry and verification.' : ''}
                required
              />
            </div>
          )}

          <div className="pattern-field-col">
            <MuiSelectField
              label="Gender"
              name={`gender-${index}`}
              id={`gender-${index}`}
              value={data.gender}
              onChange={(e) => handleFieldChange(index, 'gender', e.target.value)}
              options={GENDER_OPTIONS}
              required
            />
          </div>

          {/* Row 2: Mobile, Email, Year of study, Departments */}
          <div className="pattern-field-col">
            <MuiTextField
              label="Mobile"
              type="tel"
              name={`mobile-${index}`}
              id={`mobile-${index}`}
              placeholder="10-digit mobile"
              value={data.mobile}
              maxLength={10}
              onChange={(e) => handleFieldChange(index, 'mobile', e.target.value)}
              required={isLead}
            />
          </div>

          <div className="pattern-field-col">
            <MuiTextField
              label="Email"
              type="email"
              name={`email-${index}`}
              id={`email-${index}`}
              placeholder="Email address"
              value={data.email}
              onChange={(e) => handleFieldChange(index, 'email', e.target.value)}
              required={isLead}
            />
          </div>

          <div className="pattern-field-col">
            <MuiSelectField
              label="Year of Study"
              name={`yearOfStudy-${index}`}
              id={`yearOfStudy-${index}`}
              value={data.yearOfStudy}
              onChange={(e) => handleFieldChange(index, 'yearOfStudy', e.target.value)}
              options={YEAR_OPTIONS}
              required
            />
          </div>

          <div className="pattern-field-col">
            <MuiSelectField
              label="Departments"
              name={`department-${index}`}
              id={`department-${index}`}
              value={data.department || 'Select'}
              onChange={(e) => handleFieldChange(index, 'department', e.target.value)}
              required
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
            </MuiSelectField>
          </div>

          {/* Row 3: Branch, Location */}
          <div className="pattern-field-col">
            <MuiTextField
              label="Branch"
              name={`branch-${index}`}
              id={`branch-${index}`}
              placeholder="e.g. CSE"
              value={data.branch}
              onChange={(e) => handleFieldChange(index, 'branch', e.target.value)}
            />
          </div>

          <div className="pattern-field-col">
            <MuiTextField
              label="Location"
              name={`location-${index}`}
              id={`location-${index}`}
              placeholder="e.g. Surampalem / Kakinada"
              value={data.location}
              onChange={(e) => handleFieldChange(index, 'location', e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  return createPortal(
    <div className="fest-modal-backdrop" onClick={onClose}>
      <LiquidGlass
        className="fest-modal-card event-reg-card fest-event-liquid-modal"
        theme="light"
        borderRadius={24}
        enableShader={true}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="fest-modal-header">
          <div className="fest-modal-header-banner">
            <div>
              <div className="fest-modal-badge">
                <SplitColorText screenSync={false} leftColor="#be9337" rightColor="#be9337">
                  {eventData.category || 'COLOURS 2027'}
                </SplitColorText>
              </div>
              <SplitColorText
                as="h2"
                className="fest-modal-title"
                screenSync={false}
                leftColor="#0f172a"
                rightColor="#0f172a"
              >
                {activeRecord ? 'Event Registration Confirmation' : `Register: ${eventTitle}`}
              </SplitColorText>
              <SplitColorText
                as="div"
                className="fest-modal-subtitle"
                screenSync={false}
                leftColor="#475569"
                rightColor="#475569"
              >
                Aditya University Youth Cultural & Sports Festival • Colours 2027
              </SplitColorText>
            </div>
            <ThemeButton
              className="fest-modal-close-btn"
              onClick={onClose}
              ariaLabel="Close modal"
              type="button"
              borderRadius={50}
              width={36}
              height={36}
              showBlast={false}
            >
              ✕
            </ThemeButton>
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
                  <div className="reg-ticket-fest-tag">
                    <SplitColorText screenSync={true} leftColor="#be9337" rightColor="#be9337">
                      COLOURS 2027 • OFFICIAL PASS
                    </SplitColorText>
                  </div>
                  <div className="reg-ticket-id">
                    <SplitColorText screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                      ID: {formatRegistrationId(activeRecord.registrationNumber || activeRecord.registrationId)}
                    </SplitColorText>
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
                              <td className="col-college">{p.college || 'AUS'}</td>
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
                <ThemeButton type="button" className="btn-fest-secondary" onClick={handlePrint} borderRadius={12} height={44} showBlast={false}>
                  <SplitColorText screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                    🖨️ Print Slip
                  </SplitColorText>
                </ThemeButton>
                <ThemeButton type="button" className="btn-fest-primary" onClick={onClose} borderRadius={12} height={44} showBlast={true}>
                  <span style={{ color: '#ffffff', fontWeight: 700 }}>
                    Done & Explore More Events
                  </span>
                </ThemeButton>
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
                  <SplitColorText
                    as="div"
                    className="event-reg-event-title"
                    screenSync={false}
                    leftColor="#0f172a"
                    rightColor="#0f172a"
                  >
                    {eventTitle}
                  </SplitColorText>
                  <div className="event-reg-meta-pills">
                    <span className="event-meta-pill-item pill-category">
                      <SplitColorText screenSync={false} leftColor="#be9337" rightColor="#be9337">
                        {eventData.category}
                      </SplitColorText>
                    </span>
                    <span className="event-meta-pill-item">
                      <SplitColorText screenSync={false} leftColor="#0f172a" rightColor="#0f172a">
                        👥 {eventData.eventType || (isTeam ? 'Team' : 'Solo')}
                      </SplitColorText>
                    </span>
                    <span className="event-meta-pill-item">
                      <SplitColorText screenSync={false} leftColor="#0f172a" rightColor="#0f172a">
                        📍 {eventData.venueObj?.name || eventData.venue || 'Campus Venue'}
                      </SplitColorText>
                    </span>
                  </div>
                </div>

                <div className="event-reg-fee-box">
                  <SplitColorText as="div" className="event-reg-fee-label" screenSync={false} leftColor="#be9337" rightColor="#be9337">
                    Entry Fee
                  </SplitColorText>
                  <SplitColorText as="div" className="event-reg-fee-amount" screenSync={false} leftColor="#0f172a" rightColor="#0f172a">
                    {eventData.price ? `₹ ${eventData.price}/-` : 'Free'}
                  </SplitColorText>
                </div>
              </div>

              {/* Team Leader Registration Notice */}
              {isTeam && (
                <div
                  className="team-leader-info-notice"
                  style={{
                    borderRadius: '12px',
                    padding: '0.85rem 1.15rem',
                    marginBottom: '1.25rem',
                    fontSize: '0.86rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    lineHeight: 1.45
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>💡</span>
                  <div>
                    <strong style={{ color: '#be9337' }}>Team Leader Registration:</strong> You only need to register and complete payment as Participant 1 now. You can add or update the rest of your squad participants later directly from your <strong>Student Dashboard Account</strong>!
                  </div>
                </div>
              )}

              {/* Participant 1 Block (Image 1 Pattern) */}
              {renderParticipantBlock(leadParticipant, 0)}

              {/* Additional Team Participants Blocks (Image 1 Pattern) */}
              {isTeam && teamMembers.map((member, idx) => renderParticipantBlock(member, idx + 1))}

              {/* Add Member Button (If Team Event) */}
              {isTeam && teamMembers.length + 1 < maxTeamSize && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <ThemeButton
                    type="button"
                    className="btn-add-team-participant"
                    onClick={handleAddMember}
                    borderRadius={12}
                    height={44}
                    showBlast={false}
                  >
                    <SplitColorText screenSync={false} leftColor="#0f172a" rightColor="#0f172a">
                      + Add Participant ({teamMembers.length + 1}/{maxTeamSize})
                    </SplitColorText>
                  </ThemeButton>
                </div>
              )}

              {/* Real-time Team Participants Roster Table Preview */}
              {isTeam && allParticipants.length > 0 && (
                <div className="roster-preview-box" style={{ marginBottom: '1.5rem' }}>
                  <div className="roster-preview-title">
                    <SplitColorText screenSync={false} leftColor="#0f172a" rightColor="#0f172a">
                      📋 Team Participants Roster ({allParticipants.length} of {minTeamSize}-{maxTeamSize})
                    </SplitColorText>
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
                    <SplitColorText screenSync={false} leftColor="#334155" rightColor="#334155">
                      I confirm that all entered details are accurate, and I agree to adhere to the official rules, time limits, and campus code of conduct for {eventTitle}.
                    </SplitColorText>
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="fest-modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                <ThemeButton
                  type="submit"
                  className="btn-fest-primary"
                  disabled={loading && paymentStage === 'VERIFYING'}
                  borderRadius={12}
                  height={48}
                  showBlast={true}
                  style={{ minWidth: '220px', padding: '0 1.75rem' }}
                >
                  <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.98rem' }}>
                    {paymentStage === 'VERIFYING'
                      ? 'Verifying Payment on Server...'
                      : paymentStage === 'AWAITING_PAYMENT'
                        ? 'Awaiting Payment Completion...'
                        : loading
                          ? 'Processing...'
                          : eventData.price
                            ? `Pay ₹ ${eventData.price}/- & Register`
                            : 'Register Event'}
                  </span>
                </ThemeButton>
              </div>
            </form>
          )}
        </div>
      </LiquidGlass>
    </div>,
    document.body
  );
}
