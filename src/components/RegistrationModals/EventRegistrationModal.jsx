import { useState, useMemo } from 'react';
import {
  submitEventRegistration,
  isStudentRegisteredForEvent
} from '../../services/api';
import './RegistrationModals.css';

export default function EventRegistrationModal({
  isOpen,
  eventData,
  student,
  onClose,
  onChangeStudent
}) {
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [agreeRules, setAgreeRules] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successRecord, setSuccessRecord] = useState(null);

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
  }, [student, eventData, eventTitle, successRecord]);

  if (!isOpen || !eventData) return null;

  const minTeamSize = eventData.minTeamSize || 2;
  const maxTeamSize = eventData.maxTeamSize || 8;

  const handleAddMember = () => {
    if (teamMembers.length + 1 >= maxTeamSize) {
      return setError(`Maximum team size for this event is ${maxTeamSize} participants.`);
    }
    setTeamMembers((prev) => [
      ...prev,
      { name: '', roll: '', college: student?.college || 'Aditya University', mobile: '' }
    ]);
    if (error) setError(null);
  };

  const handleRemoveMember = (idx) => {
    setTeamMembers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleMemberChange = (idx, field, value) => {
    setTeamMembers((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!agreeRules) {
      return setError('Please accept the event regulations to complete registration.');
    }

    if (isTeam) {
      if (!teamName.trim()) {
        return setError('Please provide a Team Name for your group.');
      }
      const totalParticipants = teamMembers.length + 1; // Team leader + members
      if (totalParticipants < minTeamSize) {
        return setError(
          `This event requires at least ${minTeamSize} team members. Currently you have ${totalParticipants}.`
        );
      }
      for (let i = 0; i < teamMembers.length; i++) {
        const m = teamMembers[i];
        if (!m.name.trim() || !m.roll.trim()) {
          return setError(`Please enter both Name and Roll Number for Team Member #${i + 2}.`);
        }
      }
    }

    setLoading(true);
    try {
      const payload = {
        eventId: eventData._id || eventData.rawId || eventData.id,
        eventSlug: eventData.slug || eventData.eventSlug || '',
        eventName: eventTitle,
        category: eventData.category || eventData.categoryName || 'General',
        subCategory: eventData.subCategory || eventData.subcategoryName || '',
        price: eventData.price !== undefined ? eventData.price : (eventData.fee?.amount || 0),
        amount: eventData.price !== undefined ? eventData.price : (eventData.fee?.amount || 0),
        venue: eventData.venueObj?.name || eventData.venue || 'Aditya University Campus',
        studentId: student._id || student.id,
        studentName: student.name,
        studentRoll: student.roll,
        studentCollege: student.college,
        studentEmail: student.email,
        studentMobile: student.mobile,
        studentDepartment: student.department || student.branch || 'General',
        studentYear: student.year || student.year_of_study || '3rd Year',
        isTeam,
        teamName: isTeam ? teamName.trim() : null,
        teamMembers: isTeam ? teamMembers : []
      };

      const record = await submitEventRegistration(payload);
      setSuccessRecord(record);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const activeRecord = successRecord || existingReg;

  return (
    <div className="fest-modal-backdrop" onClick={onClose}>
      <div className="fest-modal-card event-reg-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="fest-modal-header">
          <div className="fest-modal-header-banner">
            <div>
              <div className="fest-modal-badge">
                {eventData.category || 'COLOURS 2027'} • {eventData.subCategory || 'EVENT'}
              </div>
              <h2 className="fest-modal-title">
                {activeRecord ? 'Event Registration Confirmation' : `Register: ${eventTitle}`}
              </h2>
              <p className="fest-modal-subtitle">
                Aditya University Youth Cultural & Sports Festival • Colours 2027
              </p>
            </div>
            <button className="fest-modal-close-btn" onClick={onClose} aria-label="Close modal">
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="fest-modal-body">
          {error && (
            <div className="fest-alert-box error">
              <span>⚠️</span>
              <div>{error}</div>
            </div>
          )}

          {activeRecord ? (
            /* Registration Success View */
            <div className="reg-success-view">
              <div className="reg-success-icon-wrap">✓</div>
              <h3 className="reg-success-title">Registration Confirmed!</h3>
              <p className="reg-success-sub">
                You are officially enrolled for <strong>{eventTitle}</strong> at Colours 2027.
              </p>

              <div className="reg-ticket-card">
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Registration ID</span>
                  <span className="reg-ticket-val code">{activeRecord.registrationNumber || activeRecord.registrationId}</span>
                </div>
                {activeRecord.paymentReference && (
                  <div className="reg-ticket-row">
                    <span className="reg-ticket-label">Payment Ref</span>
                    <span className="reg-ticket-val code" style={{ color: '#0284c7' }}>
                      {activeRecord.paymentReference}
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
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Event Name</span>
                  <span className="reg-ticket-val">{eventTitle}</span>
                </div>
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Category / Subcategory</span>
                  <span className="reg-ticket-val">
                    {eventData.category} / {eventData.subCategory}
                  </span>
                </div>
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Lead Participant</span>
                  <span className="reg-ticket-val">
                    {student?.name} ({student?.roll})
                  </span>
                </div>
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">College</span>
                  <span className="reg-ticket-val">{student?.college}</span>
                </div>
                {activeRecord.teamName && (
                  <div className="reg-ticket-row">
                    <span className="reg-ticket-label">Team Name</span>
                    <span className="reg-ticket-val">{activeRecord.teamName}</span>
                  </div>
                )}
                {Array.isArray(activeRecord.teamMembers) && activeRecord.teamMembers.length > 0 && (
                  <div className="reg-ticket-row">
                    <span className="reg-ticket-label">Team Members</span>
                    <span className="reg-ticket-val">
                      {activeRecord.teamMembers.map((m) => `${m.name} (${m.roll})`).join(', ')}
                    </span>
                  </div>
                )}
                <div className="reg-ticket-row">
                  <span className="reg-ticket-label">Entry Fee</span>
                  <span className="reg-ticket-val" style={{ color: '#16a34a' }}>
                    {eventData.price ? `₹ ${eventData.price}/- (Pay at Desk)` : 'Free Entry'}
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
                  <span className="reg-ticket-val" style={{ color: '#2563eb' }}>
                    ● CONFIRMED
                  </span>
                </div>
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
            /* Registration Form View */
            <form onSubmit={handleSubmit} id="event-registration-form">
              {/* Event Summary Box */}
              <div className="event-reg-summary-box">
                <div className="event-reg-summary-details">
                  <div className="event-reg-event-title">{eventTitle}</div>
                  <div className="event-reg-meta-pills">
                    <span className="event-meta-pill-item pill-category">
                      {eventData.category}
                    </span>
                    <span className="event-meta-pill-item">
                      {eventData.subCategory}
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

              {/* Logged in student strip */}
              <div className="student-profile-strip">
                <div className="student-strip-left">
                  <div className="student-avatar-circle">
                    {(student?.name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="student-strip-info">
                    <div className="student-strip-name">{student?.name}</div>
                    <div className="student-strip-roll">
                      Roll: {student?.roll} • {student?.mobile}
                    </div>
                    <div className="student-strip-college">{student?.college}</div>
                  </div>
                </div>
                {onChangeStudent && (
                  <button
                    type="button"
                    className="btn-switch-account"
                    onClick={onChangeStudent}
                    title="Switch student account"
                  >
                    Switch Account
                  </button>
                )}
              </div>

              {/* Team Event Details */}
              {isTeam && (
                <div className="team-section-box">
                  <div className="team-section-title">
                    <span>👥 Team Participation Details</span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                      Allowed: {minTeamSize} to {maxTeamSize} members
                    </span>
                  </div>

                  <div className="fest-form-group" style={{ marginBottom: '1rem' }}>
                    <label className="fest-form-label">
                      Team Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g. Thunder Rhythms"
                      className="fest-form-input"
                      required
                    />
                  </div>

                  {/* Team Members List */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                      Participant 1 (Team Leader): {student?.name} ({student?.roll})
                    </div>

                    {teamMembers.map((member, idx) => (
                      <div key={idx} className="team-member-row">
                        <input
                          type="text"
                          placeholder={`Member #${idx + 2} Full Name`}
                          value={member.name}
                          onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                          className="fest-form-input"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Roll Number"
                          value={member.roll}
                          onChange={(e) => handleMemberChange(idx, 'roll', e.target.value)}
                          className="fest-form-input"
                          style={{ textTransform: 'uppercase' }}
                          required
                        />
                        <input
                          type="text"
                          placeholder="College Name"
                          value={member.college}
                          onChange={(e) => handleMemberChange(idx, 'college', e.target.value)}
                          className="fest-form-input"
                        />
                        <button
                          type="button"
                          className="btn-remove-member"
                          onClick={() => handleRemoveMember(idx)}
                          title="Remove member"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {teamMembers.length + 1 < maxTeamSize && (
                      <button type="button" className="btn-add-member" onClick={handleAddMember}>
                        + Add Team Member ({teamMembers.length + 1}/{maxTeamSize})
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Rules and regulations agreement */}
              <label className="fest-checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeRules}
                  onChange={(e) => setAgreeRules(e.target.checked)}
                />
                <span>
                  I confirm that all entered details are accurate, and I agree to adhere to the official
                  rules, time limits, and campus code of conduct for <strong>{eventTitle}</strong>.
                </span>
              </label>
            </form>
          )}
        </div>

        {/* Footer */}
        {!activeRecord && (
          <div className="fest-modal-footer">
            <button type="button" className="btn-fest-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              form="event-registration-form"
              className="btn-fest-primary"
              disabled={loading}
            >
              {loading ? 'Submitting Registration...' : 'Confirm & Register for Event ★'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
