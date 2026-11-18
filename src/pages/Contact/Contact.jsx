import { useState } from 'react';
import SplitBackground from '../../components/ThemeComponents/backgrounds/SplitBackground';
import SplitColorText from '../../components/ThemeComponents/SplitColor/SplitColorText';
import { LiquidGlass } from '../../components/ThemeComponents/LiquidGlass';
import ThemeButton from '../../components/ThemeComponents/ThemeButton';
import { MuiTextField, MuiSelectField } from '../../components/RegistrationModals/MuiTextField';
import '../../components/RegistrationModals/RegistrationModals.css';
import './Contact.css';

const SUBJECT_OPTIONS = [
  'Event Registration Query',
  'Culturals',
  'Sports',
  'Creo',
  'Hostel Accommodation & Hospitality',
  'Other / General Enquiry'
];

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
    <SplitBackground as="main" className="contact-page-wrapper">
      {/* Hero Header */}
      <section className="contact-hero">
        <div className="contact-header-row contact-title-row">
          <SplitColorText
            as="h1"
            className="contact-hero-title"
            splitPercent={50}
            leftColor="#0f172a"
            rightColor="#ffffff"
          >
            Contact
          </SplitColorText>
        </div>
      </section>

      {/* Main Section: Inquiry Form */}
      <section className="contact-main-section">
        <div className="container">
          <div className="contact-form-wrapper">
            <LiquidGlass
              className="query-form-card contact-liquid-card"
              borderRadius={24}
              enableShader={true}
            >
              <span className="section-mini-tag">
                <SplitColorText screenSync={true} leftColor="#be9337" rightColor="#be9337">
                  SEND US A MESSAGE
                </SplitColorText>
              </span>
              <SplitColorText
                as="h3"
                className="query-card-title"
                screenSync={true}
                leftColor="#0f172a"
                rightColor="#ffffff"
              >
                Reach Us
              </SplitColorText>
              <SplitColorText
                as="p"
                className="query-card-desc"
                screenSync={true}
                leftColor="#475569"
                rightColor="#cbd5e1"
              >
                Submit your query and our festival committee will revert within a few hours.
              </SplitColorText>

              {sent ? (
                <div className="query-success-state">
                  <span>✅</span>
                  <h4>Message Received!</h4>
                  <p>Our festival help desk will respond to your registered email or phone promptly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="query-form">
                  <MuiTextField
                    label={<SplitColorText screenSync={true} leftColor="#475569" rightColor="#cbd5e1">Full Name</SplitColorText>}
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="field-col-left"
                  />

                  <MuiTextField
                    label={<SplitColorText screenSync={true} leftColor="#475569" rightColor="#cbd5e1">College / University</SplitColorText>}
                    name="college"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                    required
                    placeholder="Your Institution Name"
                    className="field-col-right"
                  />

                  <MuiTextField
                    label={<SplitColorText screenSync={true} leftColor="#475569" rightColor="#cbd5e1">Mobile Number</SplitColorText>}
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    placeholder="+91 98765 43210"
                    className="field-col-left"
                  />

                  <MuiTextField
                    label={<SplitColorText screenSync={true} leftColor="#475569" rightColor="#cbd5e1">Email Address</SplitColorText>}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="you@email.com"
                    className="field-col-right"
                  />

                  <div className="q-full-width">
                    <MuiSelectField
                      label={<SplitColorText screenSync={true} leftColor="#475569" rightColor="#cbd5e1">Subject / Category</SplitColorText>}
                      name="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      options={SUBJECT_OPTIONS}
                      className="field-col-full"
                    />
                  </div>

                  <div className="q-full-width">
                    <MuiTextField
                      label={<SplitColorText screenSync={true} leftColor="#475569" rightColor="#cbd5e1">Your Message / Specific Question</SplitColorText>}
                      name="message"
                      multiline={true}
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      placeholder="Describe your query in detail..."
                      className="field-col-full"
                    />
                  </div>

                  <div className="q-submit-wrapper">
                    <ThemeButton
                      type="submit"
                      borderRadius={12}
                      height={48}
                      showBlast={true}
                      className="contact-submit-btn"
                    >
                      <SplitColorText leftColor="#0f172a" rightColor="#ffffff">
                        Send
                      </SplitColorText>
                    </ThemeButton>
                  </div>
                </form>
              )}
            </LiquidGlass>
          </div>
        </div>
      </section>

      {/* Transit / How to Reach */}
      <section className="transit-guide-section">
        <div className="container">
          <LiquidGlass
            className="transit-box transit-liquid-card"
            borderRadius={24}
            enableShader={true}
          >
            <SplitColorText
              as="h3"
              className="transit-title"
              screenSync={true}
              leftColor="#0f172a"
              rightColor="#ffffff"
            >
              🚆 Transit & How to Reach Aditya University Campus
            </SplitColorText>
            <div className="transit-grid">
              <div className="transit-card">
                <SplitColorText
                  as="h4"
                  className="transit-card-title"
                  screenSync={true}
                  leftColor="#be9337"
                  rightColor="#be9337"
                >
                  By Train (Nearest Stations)
                </SplitColorText>
                <p>
                  <SplitColorText screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                    <strong>Samalkot Junction (SLO):</strong> 12 km (20 mins drive). 24/7 college shuttle & auto available.
                  </SplitColorText>
                </p>
                <p>
                  <SplitColorText screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                    <strong>Rajahmundry (RJY):</strong> 40 km (50 mins drive).
                  </SplitColorText>
                </p>
              </div>

              <div className="transit-card">
                <SplitColorText
                  as="h4"
                  className="transit-card-title"
                  screenSync={true}
                  leftColor="#be9337"
                  rightColor="#be9337"
                >
                  By Air (Nearest Airport)
                </SplitColorText>
                <p>
                  <SplitColorText screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                    <strong>Rajahmundry Domestic Airport (RJA):</strong> 45 km with daily flights from Hyderabad, Bengaluru, Chennai.
                  </SplitColorText>
                </p>
              </div>

              <div className="transit-card">
                <SplitColorText
                  as="h4"
                  className="transit-card-title"
                  screenSync={true}
                  leftColor="#be9337"
                  rightColor="#be9337"
                >
                  By Road / Highway
                </SplitColorText>
                <p>
                  <SplitColorText screenSync={true} leftColor="#0f172a" rightColor="#ffffff">
                    Located on ADB Road, connecting NH-16 (Chennai–Kolkata National Highway) with frequent buses from Kakinada.
                  </SplitColorText>
                </p>
              </div>
            </div>
          </LiquidGlass>
        </div>
      </section>
    </SplitBackground>
  );
}
