import { useState } from 'react';
import { Phone } from 'lucide-react';
import SplitBackground from '../../components/ThemeComponents/backgrounds/SplitBackground';
import SplitColorText from '../../components/ThemeComponents/SplitColor/SplitColorText';
import { LiquidGlass } from '../../components/ThemeComponents/LiquidGlass';
import ThemeButton from '../../components/ThemeComponents/ThemeButton';
import { MuiTextField, MuiSelectField } from '../../components/RegistrationModals/MuiTextField';
import '../../components/RegistrationModals/RegistrationModals.css';
import './Contact.css';

const DOMAIN_CHAIRS = [
  {
    domain: 'CULTURALS',
    name: 'Dr. N Ram Babu',
    phone: '8473917384',
    initials: 'NR'
  },
  {
    domain: 'SPORTS',
    name: 'Dr. N Ravi',
    phone: '9912393905',
    initials: 'NR'
  },
  {
    domain: 'CREO',
    name: 'Dr. B Srinivas',
    phone: '9866732745',
    initials: 'BS'
  },
  {
    domain: 'FETE',
    name: 'Mr. J D Venkatesh',
    phone: '7731027776',
    initials: 'JV'
  }
];

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

      {/* 4 Domain Chairs Section */}
      <section className="contact-chairs-section">
        <div className="container">
          <div className="contact-chairs-grid">
            {DOMAIN_CHAIRS.map((chair) => (
              <LiquidGlass
                key={chair.domain}
                className="contact-chair-card"
                borderRadius={20}
                enableShader={true}
              >
                <div className="contact-chair-inner">
                  {/* Round Container (Empty Liquid Glass Container) */}
                  <div className="contact-chair-avatar-frame">
                    {chair.image ? (
                      <img
                        src={chair.image}
                        alt={chair.name}
                        className="contact-chair-avatar-img"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = 'block';
                          }
                        }}
                      />
                    ) : (
                      <div className="contact-chair-avatar-empty" />
                    )}
                  </div>

                  <div className="contact-chair-domain">
                    <SplitColorText screenSync={true} leftColor="#be9337" rightColor="#be9337">
                      {chair.domain}
                    </SplitColorText>
                  </div>
                  <SplitColorText
                    as="h3"
                    className="contact-chair-name"
                    screenSync={true}
                    leftColor="#0f172a"
                    rightColor="#ffffff"
                  >
                    {chair.name}
                  </SplitColorText>
                  <a href={`tel:${chair.phone}`} className="contact-chair-phone-btn">
                    <Phone size={15} strokeWidth={2.4} className="contact-chair-phone-icon" />
                    <SplitColorText
                      as="span"
                      screenSync={true}
                      leftColor="#0f172a"
                      rightColor="#ffffff"
                    >
                      {chair.phone}
                    </SplitColorText>
                  </a>
                </div>
              </LiquidGlass>
            ))}
          </div>
        </div>
      </section>

      {/* Main Section: Inquiry Form & Transit Guide in 8 * 4 Row */}
      <section className="contact-main-section">
        <div className="container">
          <div className="contact-row-8-4">
            {/* 8-col: Reach Us Inquiry Form */}
            <div className="contact-col-8">
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

            {/* 4-col: Transit & How to Reach */}
            <div className="contact-col-4">
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
          </div>
        </div>
      </section>
    </SplitBackground>
  );
}
