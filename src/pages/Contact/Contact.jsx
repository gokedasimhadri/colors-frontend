import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    subject: 'Event Registration Query',
    message: ''
  });
  const [sent, setSent] = useState(false);

  const committee = [
    {
      domain: 'Central Festival Convener',
      name: 'Dr. K. Kishore',
      phone: '+91 94901 11222',
      email: 'convener.colours@adityauniversity.in',
      office: 'Senate Chamber, Ramanujan Bhavan'
    },
    {
      domain: 'Sports & Games Directorate',
      name: 'Dr. Ch. V. Ramana (Director of Physical Education)',
      phone: '+91 94902 33445',
      email: 'sports.colours@adityauniversity.in',
      office: 'Sports Complex, Ground Floor'
    },
    {
      domain: 'Cultural Affairs & Stage',
      name: 'Prof. S. Ganapathi & Dr. P. Vijaya Kumar',
      phone: '+91 90322 01091',
      email: 'culturals.colours@adityauniversity.in',
      office: 'Student Affairs Cell, Newton Bhavan'
    },
    {
      domain: 'Creo & Fine Arts Directorate',
      name: 'Prof. A.K. Chakravarthy',
      phone: '+91 97034 64137',
      email: 'creo.colours@adityauniversity.in',
      office: 'Design & Media Lab, Ratan Tata Bhavan'
    },
    {
      domain: 'Accommodation & Contingent Hospitality',
      name: 'Chief Warden & Hospitality Team',
      phone: '+91 95534 51345',
      email: 'hospitality@adityauniversity.in',
      office: 'Hostel Administration Wing'
    },
    {
      domain: 'Technical Portal & Payment Support',
      name: 'Digital Services & Web Development Team',
      phone: '+91 90140 86490',
      email: 'digitalservices@adityauniversity.in',
      office: 'Central Computing Facility'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 6000);
    setFormData({
      name: '',
      email: '',
      phone: '',
      college: '',
      subject: 'Event Registration Query',
      message: ''
    });
  };

  return (
    <div className="contact-page-wrapper">
      {/* Hero Banner */}
      <section className="contact-hero">
        <div className="container text-center">
          <div className="contact-badge-top">ADITYA UNIVERSITY • HELPDESK & SUPPORT</div>
          <h1 className="contact-hero-title">Contact & Help Desk</h1>
          <p className="contact-hero-sub">
            Need assistance with event registration, rulebook clarifications, or campus hospitality?
            Reach out to our student affairs directorate and domain faculty coordinators.
          </p>
        </div>
      </section>

      {/* Campus Location & Emergency Bar */}
      <section className="contact-quick-bar-section">
        <div className="container">
          <div className="quick-bar-grid">
            <div className="quick-item-card">
              <span className="q-icon">📍</span>
              <div>
                <h4>Campus Address</h4>
                <p>Aditya University, ADB Road, Surampalem, Kakinada District, Andhra Pradesh – 533437</p>
              </div>
            </div>
            <div className="quick-item-card">
              <span className="q-icon">📞</span>
              <div>
                <h4>General Helplines</h4>
                <p>+91 99999 99999 / +91 99887 76655 (24/7 Helpline)</p>
              </div>
            </div>
            <div className="quick-item-card">
              <span className="q-icon">✉️</span>
              <div>
                <h4>Official Email</h4>
                <p>colours@adityauniversity.in</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid: Directory & Query Form */}
      <section className="contact-main-section">
        <div className="container contact-two-col-grid">
          {/* Faculty & Domain Directory */}
          <div className="directory-column">
            <span className="section-mini-tag">ORGANIZING COMMITTEE</span>
            <h2 className="directory-heading">Domain Coordinators</h2>
            <p className="directory-sub">Contact respective heads for immediate assistance:</p>

            <div className="committee-cards-list">
              {committee.map((c, idx) => (
                <div key={idx} className="committee-card">
                  <div className="comm-domain-badge">{c.domain}</div>
                  <h4 className="comm-name">{c.name}</h4>
                  <div className="comm-contact-row">
                    <a href={`tel:${c.phone}`} className="comm-phone">
                      📞 {c.phone}
                    </a>
                    <a href={`mailto:${c.email}`} className="comm-email">
                      ✉️ {c.email}
                    </a>
                  </div>
                  <span className="comm-office">📍 {c.office}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="form-column">
            <div className="query-form-card">
              <span className="section-mini-tag">SEND US A MESSAGE</span>
              <h3>Student & College Help Desk</h3>
              <p>Submit your query and our team will revert within a few hours.</p>

              {sent ? (
                <div className="query-success-state">
                  <span>✅</span>
                  <h4>Message Received!</h4>
                  <p>Our festival help desk will respond to your email or mobile promptly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="query-form">
                  <div className="q-field">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="q-row-2">
                    <div className="q-field">
                      <label>College / University *</label>
                      <input
                        type="text"
                        required
                        placeholder="Your Institution"
                        value={formData.college}
                        onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      />
                    </div>
                    <div className="q-field">
                      <label>Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="q-field">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="q-field">
                    <label>Subject / Category</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option>Event Registration Query</option>
                      <option>Sports Fixtures Clarification</option>
                      <option>Culturals / Music Rules Query</option>
                      <option>Creo Arts Regulations</option>
                      <option>Hostel Accommodation & Food</option>
                      <option>Other / General Enquiry</option>
                    </select>
                  </div>

                  <div className="q-field">
                    <label>Your Message / Specific Question *</label>
                    <textarea
                      rows="4"
                      required
                      placeholder="Describe your query in detail..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn-contact-submit">
                    Send Inquiry to Helpdesk →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Transit / How to Reach */}
      <section className="transit-guide-section">
        <div className="container">
          <div className="transit-box">
            <h3>🚆 Transit & How to Reach Aditya University Campus</h3>
            <div className="transit-grid">
              <div className="transit-card">
                <h4>By Train (Nearest Stations)</h4>
                <p><strong>Samalkot Junction (SLO):</strong> 12 km (20 mins drive). 24/7 college shuttle & auto available.</p>
                <p><strong>Rajahmundry (RJY):</strong> 40 km (50 mins drive).</p>
              </div>
              <div className="transit-card">
                <h4>By Air (Nearest Airport)</h4>
                <p><strong>Rajahmundry Domestic Airport (RJA):</strong> 45 km with daily flights from Hyderabad, Bengaluru, Chennai.</p>
              </div>
              <div className="transit-card">
                <h4>By Road / Highway</h4>
                <p>Located on ADB Road, connecting NH-16 (Chennai–Kolkata National Highway) with frequent buses from Kakinada.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
