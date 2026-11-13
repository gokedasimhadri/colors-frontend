import { useState, useEffect } from 'react';
import {
  fetchStudentByRollNumber,
  fetchEventDepartments,
  matchDepartmentByBranch,
  FALLBACK_EVENT_DEPARTMENTS,
  updateEventParticipants
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

export default function ManageTeamModal({ isOpen, onClose, registration, onUpdated }) {
  const [participants, setParticipants] = useState([]);
  const [departmentsList, setDepartmentsList] = useState(FALLBACK_EVENT_DEPARTMENTS);
  const [fetchingStatus, setFetchingStatus] = useState({});
  const [verifiedStatus, setVerifiedStatus] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Fetch live departments for branch matching
  useEffect(() => {
    fetchEventDepartments()
      .then((depts) => {
        if (Array.isArray(depts) && depts.length > 0) {
          setDepartmentsList(depts);
        }
      })
      .catch(() => {});
  }, []);

  // Initialize participants from registration
  useEffect(() => {
    if (registration) {
      setError(null);
      setSuccessMsg(null);
      let list = [];

      if (Array.isArray(registration.participants) && registration.participants.length > 0) {
        list = registration.participants.map((p, idx) => ({
          participantNumber: p.participantNumber || idx + 1,
          isLeader: idx === 0 || Boolean(p.isLeader),
          rollNumber: (p.rollNumber || p.roll || '').toUpperCase(),
          name: p.name || '',
          college: p.college || 'ACET',
          gender: p.gender || 'Male',
          mobile: p.mobile || p.phone || '',
          email: p.email || '',
          yearOfStudy: p.yearOfStudy || p.year || 'Select',
          department: p.department || p.departments || 'Select',
          branch: p.branch || p.department || '',
          location: p.location || ''
        }));
      } else if (registration.student) {
        // Fallback: at least Participant 1 (Leader)
        list = [
          {
            participantNumber: 1,
            isLeader: true,
            rollNumber: (registration.student.rollNumber || registration.student.roll || '').toUpperCase(),
            name: registration.student.name || 'Team Leader',
            college: registration.student.college || 'ACET',
            gender: registration.student.gender || 'Male',
            mobile: registration.student.mobile || '',
            email: registration.student.email || '',
            yearOfStudy: registration.student.year || '3rd Year',
            department: registration.student.department || 'General',
            branch: registration.student.department || '',
            location: 'Surampalem'
          }
        ];
      }
      setParticipants(list);
    }
  }, [registration]);

  if (!isOpen || !registration) return null;

  const regId = registration.registrationNumber || registration.registrationId || registration.paymentReference;
  const eventTitle = registration.eventTitle || registration.eventName || 'Team Event';

  // Handle participant field edit
  const handleFieldChange = (index, field, value) => {
    if (field === 'branch') {
      const matchedDept = matchDepartmentByBranch(value, departmentsList);
      setParticipants((prev) => {
        const copy = [...prev];
        copy[index] = {
          ...copy[index],
          branch: value,
          department: matchedDept || copy[index].department
        };
        return copy;
      });
      if (error) setError(null);
      return;
    }

    setParticipants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    if (error) setError(null);
  };

  // Roll Number auto fetch from ECAP
  const triggerRollAutoFetch = async (index, roll) => {
    const clean = (roll || '').toUpperCase().trim();
    if (!clean) return;

    setFetchingStatus((prev) => ({ ...prev, [index]: true }));
    setVerifiedStatus((prev) => ({ ...prev, [index]: null }));

    try {
      const data = await fetchStudentByRollNumber(clean);
      if (data && (data.name || data.studentname || data.rollNumber)) {
        const rawBranch = data.branch || data.department || '';
        const matchedDept = matchDepartmentByBranch(rawBranch, departmentsList) || data.department || 'Select';

        setParticipants((prev) => {
          const copy = [...prev];
          copy[index] = {
            ...copy[index],
            rollNumber: clean,
            name: data.name || copy[index].name,
            college: data.college || copy[index].college,
            gender: data.gender || copy[index].gender,
            mobile: data.mobile || copy[index].mobile,
            email: data.email || copy[index].email,
            yearOfStudy: data.yearOfStudy || copy[index].yearOfStudy,
            department: matchedDept,
            branch: rawBranch || copy[index].branch,
            location: data.location || copy[index].location
          };
          return copy;
        });

        setVerifiedStatus((prev) => ({
          ...prev,
          [index]: `✓ Verified: ${data.name} (${data.college || 'Aditya'})`
        }));
      } else {
        setVerifiedStatus((prev) => ({
          ...prev,
          [index]: 'ℹ Roll checked - enter remaining details if external student'
        }));
      }
    } catch {
      setVerifiedStatus((prev) => ({
        ...prev,
        [index]: 'ℹ Manual Entry Mode'
      }));
    } finally {
      setFetchingStatus((prev) => ({ ...prev, [index]: false }));
    }
  };

  // Add a new participant
  const handleAddParticipant = () => {
    const newIdx = participants.length + 1;
    setParticipants((prev) => [
      ...prev,
      {
        participantNumber: newIdx,
        isLeader: false,
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
      }
    ]);
  };

  // Remove a participant (only for non-leaders)
  const handleRemoveParticipant = (index) => {
    if (index === 0) return; // Cannot remove team leader
    setParticipants((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Save updated participants roster
  const handleSave = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Validate that every participant has roll and name
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.rollNumber || !p.rollNumber.trim()) {
        return setError(`Please provide Roll Number for Participant ${i + 1}`);
      }
      if (!p.name || !p.name.trim()) {
        return setError(`Please provide Name for Participant ${i + 1}`);
      }
    }

    setSaving(true);
    try {
      const teamMembersOnly = participants.slice(1);
      await updateEventParticipants(regId, participants, teamMembersOnly);

      setSuccessMsg('🎉 Team roster successfully updated!');
      if (typeof onUpdated === 'function') {
        onUpdated({
          ...registration,
          participants,
          teamMembers: teamMembersOnly,
          teamSize: participants.length
        });
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to update participants. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fest-modal-overlay" onClick={onClose}>
      <div
        className="fest-modal-card"
        style={{ maxWidth: '960px', width: '95%' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="fest-modal-header">
          <div>
            <h2 className="fest-modal-title">👥 Manage Team Participants</h2>
            <p className="fest-modal-subtitle">
              Add or modify squad member details for <strong>{eventTitle}</strong> (Reg ID: {regId})
            </p>
          </div>
          <button
            type="button"
            className="fest-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSave}>
          <div className="fest-modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {error && (
              <div
                className="fest-modal-error"
                style={{
                  background: '#fee2e2',
                  color: '#b91c1c',
                  border: '1px solid #fecaca',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  marginBottom: '1rem',
                  fontSize: '0.9rem'
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {successMsg && (
              <div
                className="fest-modal-success"
                style={{
                  background: '#ecfdf5',
                  color: '#065f46',
                  border: '1px solid #a7f3d0',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  marginBottom: '1rem',
                  fontSize: '0.9rem'
                }}
              >
                {successMsg}
              </div>
            )}

            <div
              style={{
                background: 'rgba(2, 132, 199, 0.08)',
                border: '1px solid rgba(2, 132, 199, 0.22)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.86rem',
                color: '#0369a1'
              }}
            >
              💡 <strong>Automatic Data Population:</strong> Enter any student's Aditya Roll Number to automatically pull Name, Branch, College, and auto-match the official Department.
            </div>

            {/* Participants Blocks */}
            {participants.map((data, index) => {
              const isLead = index === 0;
              const isFetching = Boolean(fetchingStatus[index]);
              const vStatus = verifiedStatus[index];

              return (
                <div
                  key={index}
                  className={`participant-pattern-block ${isLead ? 'leader-block' : ''}`}
                  style={{ marginBottom: '1.25rem' }}
                >
                  <div className="participant-pattern-header">
                    <h3 className="participant-main-heading">
                      Enter Participant-{index + 1} Details
                    </h3>
                    <div className="participant-sub-heading-row">
                      <h4 className="participant-sub-heading">
                        Participant {index + 1}
                        {isLead && (
                          <span className="participant-badge-leader">👑 Team Leader</span>
                        )}
                      </h4>
                      {!isLead && (
                        <button
                          type="button"
                          className="btn-remove-participant"
                          onClick={() => handleRemoveParticipant(index)}
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
                          placeholder="e.g. 23P31A0129"
                          value={data.rollNumber}
                          onChange={(e) => handleFieldChange(index, 'rollNumber', e.target.value)}
                          onBlur={() => triggerRollAutoFetch(index, data.rollNumber)}
                          style={{ textTransform: 'uppercase' }}
                          disabled={isLead} // Team leader roll is tied to registration
                          required
                        />
                        {isFetching && (
                          <span
                            className="pattern-fetch-spinner"
                            title="Fetching student details from ECAP..."
                          >
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
                        {COLLEGE_OPTIONS.map((col) => (
                          <option key={col} value={col}>
                            {col}
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
                        placeholder="10-digit Mobile"
                        value={data.mobile}
                        onChange={(e) => handleFieldChange(index, 'mobile', e.target.value)}
                      />
                    </div>

                    <div className="pattern-field-col">
                      <label className="pattern-label">Email</label>
                      <input
                        type="email"
                        className="pattern-input"
                        placeholder="name@aditya.ac.in"
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
                        value={data.department}
                        onChange={(e) => handleFieldChange(index, 'department', e.target.value)}
                      >
                        <option value="Select">Select</option>
                        {departmentsList.map((dept) => (
                          <option key={dept._id || dept.name} value={dept.name}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Row 3: Branch, Location */}
                    <div className="pattern-field-col">
                      <label className="pattern-label">Branch</label>
                      <input
                        type="text"
                        className="pattern-input"
                        placeholder="e.g. CSE / CIV / MEC"
                        value={data.branch}
                        onChange={(e) => handleFieldChange(index, 'branch', e.target.value)}
                      />
                    </div>

                    <div className="pattern-field-col">
                      <label className="pattern-label">Location</label>
                      <input
                        type="text"
                        className="pattern-input"
                        placeholder="City / Village"
                        value={data.location}
                        onChange={(e) => handleFieldChange(index, 'location', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add Participant Button */}
            <button
              type="button"
              className="btn-add-team-participant"
              onClick={handleAddParticipant}
            >
              + Add Participant ({participants.length + 1})
            </button>
          </div>

          {/* Footer Actions */}
          <div className="fest-modal-footer">
            <button
              type="button"
              className="fest-btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="fest-btn-primary"
              disabled={saving}
              style={{ minWidth: '170px' }}
            >
              {saving ? 'Saving Roster...' : `💾 Save Team Roster (${participants.length})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
