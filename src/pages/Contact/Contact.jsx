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

  // Official Domain Chairs from the official Colours poster
  const officialDomainChairs = [
    {
      domain: 'CULTURALS IN-CHARGE',
      name: 'Mr. P. Raju',
      phone: '8374245400',
      email: 'culturals.colours@adityauniversity.in',
      tag: 'Dance • Music • Drama • Theatrics',
      accent: 'var(--clr-fest-pink)'
    },
    {
      domain: 'SPORTS IN-CHARGE',
      name: 'Dr. N. Ravi',
      phone: '9912393905',
      email: 'sports.colours@adityauniversity.in',
      tag: 'Athletics • Cricket • Basketball • Volleyball',
      accent: 'var(--clr-fest-green)'
    },
    {
      domain: 'CREO IN-CHARGE',
      name: 'Dr. B. Srinivas',
      phone: '9866732745',
      email: 'creo.colours@adityauniversity.in',
      tag: 'Fine Arts • Photography • Literary • Runway',
      accent: 'var(--clr-fest-orange)'
    }
  ];

  const organizingCommittee = [
    { name: 'Dr. M. Sreenivasa Reddy', designation: 'Dy. Pro-Chancellor', phone: '9866576662' },
    { name: 'Dr. M. B. Srinivas', designation: 'Vice Chancellor', phone: '7093817666' },
    { name: 'Dr. A. Ramesh', designation: 'Principal', phone: '9000476662' },
    { name: 'Dr. S. Rama Sree', designation: 'Pro Vice-Chancellor (Academics)', phone: '703617666' },
    { name: 'Dr. G. Suresh', designation: 'Registrar', phone: '7036266664' },
    { name: 'Mr. S. T. V. S. Kumar', designation: 'Principal', phone: '9502876667' },
    { name: 'Dr. D. Satish Kumar', designation: 'Principal', phone: '9866076671' },
    { name: 'Dr. K. Ravi Shankar', designation: 'Principal', phone: '9000576662' },
    { name: 'Mr. Vilas Anil Chavan', designation: 'Principal', phone: '8978296668' },
    { name: 'Mrs. A. Vijaya Bhargavi', designation: 'Principal (I / C)', phone: '9704976662' },
    { name: 'Mr. V. Satyanarayana', designation: 'Dean - CLM', phone: '8374856665' }
  ];

  const supportCommittee = [
    {
      domain: 'Central Festival Convener',
      name: 'Dr. K. Kishore',
      phone: '+91 94901 11222',
      email: 'convener.colours@adityauniversity.in',
      office: 'Senate Chamber, Ramanujan Bhavan'
    },
    {
      domain: 'Accommodation & Contingent Hospitality',
      name: 'Chief Warden & Hospitality Wing',
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
          <div className="contact-badge-top">ADITYA UNIVERSITY • HELPDESK & SUPPORT • ₹10 LAKHS CASH PRIZES</div>
          <h1 className="contact-hero-title">Contact & Domain In-Charges</h1>
          <p className="contact-hero-sub">
            Have queries regarding registrations, stage allotments, rulebooks, or accommodation?
            Connect directly with the Official Domain Chairs and festival conveners.
          </p>
        </div>
      </section>

      {/* Official Domain Chairs Highlight (from Poster) */}
      <section className="contact-poster-chairs-section">
        <div className="container">
          <div className="section-title-wrap text-center">
            <span className="gold-sub-title">OFFICIAL FESTIVAL DIRECTORS</span>
            <h2 className="chairs-heading">Festival Domain In-Charges</h2>
          </div>

          <div className="chairs-poster-grid">
            {officialDomainChairs.map((chair, idx) => (
              <div key={idx} className="chair-poster-card" style={{ '--card-accent': chair.accent }}>
                <div className="chair-top-badge">{chair.domain}</div>
                <h3 className="chair-name">{chair.name}</h3>
                <p className="chair-tag">{chair.tag}</p>
                <div className="chair-contact-actions">
                  <a href={`tel:${chair.phone}`} className="btn-chair-call">
                    📞 Call {chair.phone}
                  </a>
                  <a href={`mailto:${chair.email}`} className="btn-chair-email" title={chair.email}>
                    ✉️ Email
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organizing Committee Section */}
      <section className="contact-organizing-section" id="organizing-committee">
        <div className="container">
          <div className="organizing-committee-header">
            <span className="gold-sub-title">UNIVERSITY LEADERSHIP & ADMINISTRATION</span>
            <h2 className="chairs-heading">Organizing Committee</h2>
            <p className="organizing-committee-sub">
              Core executive leadership, institutional Principals, and Deans guiding Colours 2027.
            </p>
          </div>

          <div className="organizing-table-card">
            <div className="organizing-table-head">
              <span>Name</span>
              <span>Designation</span>
              <span>Contact</span>
            </div>
            <div className="organizing-rows-list">
              {organizingCommittee.map((member, idx) => (
                <div key={idx} className="organizing-row">
                  <div className="org-cell-name">
                    <span className="org-index">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="org-member-name">{member.name}</span>
                  </div>
                  <div className="org-cell-role">
                    <span className="org-role-pill">{member.designation}</span>
                  </div>
                  <div className="org-cell-phone">
                    <a href={`tel:${member.phone}`} className="org-phone-pill">
                      📞 {member.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                <h4>Central Fest Helpline</h4>
                <p>+91 94901 11222 / +91 95534 51345 (24/7 Desk)</p>
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

      {/* Main Grid: Additional Directory & Query Form */}
      <section className="contact-main-section">
        <div className="container contact-two-col-grid">
          {/* Support Directory */}
          <div className="directory-column">
            <span className="section-mini-tag">CENTRAL SUPPORT DIRECTORY</span>
            <h2 className="directory-heading">Hospitality & Conveners</h2>
            <p className="directory-sub">For stay, campus arrival, and web registration assistance:</p>

            <div className="committee-cards-list">
              {supportCommittee.map((c, idx) => (
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

            {/* Official Poster Preview Snippet */}
            <div className="contact-poster-banner">
              <div className="poster-thumb">
                <img src="/colours_poster_theme.png" alt="Colours 2027 Poster" />
              </div>
              <div className="poster-banner-info">
                <h4>COLOURS 2027 Official Poster</h4>
                <p>National Level Youth Festival • 7 • 8 • 9 January 2027</p>
                <a href="/colours_poster_theme.png" download="Colours_2027_Poster.png" className="btn-download-poster">
                  📥 Download Poster
                </a>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="form-column">
            <div className="query-form-card">
              <span className="section-mini-tag">SEND US A MESSAGE</span>
              <h3>Student & College Help Desk</h3>
              <p>Submit your query and our festival committee will revert within a few hours.</p>

              {sent ? (
                <div className="query-success-state">
                  <span>✅</span>
                  <h4>Message Received!</h4>
                  <p>Our festival help desk will respond to your registered email or phone promptly.</p>
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
                      <option>Culturals (Mr. P. Raju - 8374245400)</option>
                      <option>Sports (Dr. N. Ravi - 9912393905)</option>
                      <option>Creo (Dr. B. Srinivas - 9866732745)</option>
                      <option>Hostel Accommodation & Hospitality</option>
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
