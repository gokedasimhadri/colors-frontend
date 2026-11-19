import { useState } from 'react';
import { Link } from 'react-router-dom';
import SplitBackground from '../../components/ThemeComponents/backgrounds/SplitBackground';
import SplitColorText from '../../components/ThemeComponents/SplitColor/SplitColorText';
import { MuiTextField, MuiSelectField } from '../../components/RegistrationModals/MuiTextField';
import '../../components/RegistrationModals/RegistrationModals.css';
import './Sponsors.css';

const SPONSORSHIP_TIERS = [
  'Gold Partner (₹3,00,000)',
  'Title Presenter (₹10,00,000)',
  'Powered By Partner (₹5,00,000)',
  'Silver Partner (₹1,50,000)',
  'Stall & Food Vendor (₹50,000)'
];

function SponsorCard({ sponsor, color }) {
  return (
    <div className="sponsor-card">
      <div className="sponsor-logo-container" style={{ borderColor: color }}>
        {sponsor.logo ? (
          <img
            src={sponsor.logo}
            alt={sponsor.name}
            className="sponsor-logo-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <span
          className="sponsor-logo-fallback"
          style={{ display: sponsor.logo ? 'none' : 'flex' }}
        >
          {sponsor.logoText}
        </span>
      </div>
      <div className="sponsor-details">
        <h3 className="sponsor-name">{sponsor.name}</h3>
        <span className="sponsor-tagline">{sponsor.tagline}</span>
        <p className="sponsor-desc">{sponsor.desc}</p>
      </div>
    </div>
  );
}

export default function Sponsors() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    tier: 'Gold Partner (₹3,00,000)',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const sponsorTiers = [
    {
      tier: 'TITLE SPONSOR',
      badge: 'Platinum Presenter',
      color: '#be9337',
      sponsors: [
        {
          name: 'ADITYA GROUP OF INSTITUTIONS',
          tagline: 'Leading Educational Pioneer in South India',
          logo: '/AGI_Logo.png',
          logoText: 'AGI',
          desc: 'Title sponsor fostering innovation, athletic training, and cultural empowerment.'
        }
      ]
    },
    {
      tier: 'POWERED BY & CO-SPONSORS',
      badge: 'Premier Partners',
      color: '#e11d48',
      sponsors: [
        {
          name: 'STATE BANK OF INDIA',
          tagline: 'Official Banking & Digital Payments Partner',
          logo: '/SBI-logo.jpg',
          logoText: 'SBI',
          desc: 'Seamless festival cashless transactions and student entrepreneurship rewards.'
        },
        {
          name: 'RAZORPAY',
          tagline: 'Official Payment Gateway Partner',
          logo: '/Razorpay_logo.svg',
          logoText: 'RZP',
          desc: 'Powering high-concurrency national event registrations and instant confirmations.'
        }
      ]
    },
    {
      tier: 'ASSOCIATE & SPORTS GEAR PARTNERS',
      badge: 'Gold Partners',
      color: '#0284c7',
      sponsors: [
        {
          name: 'DECATHLON SPORTS INDIA',
          tagline: 'Official Sports Apparel & Equipment Partner',
          logo: '/decathlon-logo.png',
          logoText: 'DCT',
          desc: 'Providing tournament match balls, referee kits, and championship MVP prizes.'
        },
        {
          name: 'RED BULL ENERGY',
          tagline: 'Official Energy Drink & Stage Partner',
          logo: '/redbull-logo.jpg',
          logoText: 'RB',
          desc: 'Energizing participants and hosting the Red Bull Dance Battles showcase.'
        },
        {
          name: 'BOAT AUDIO',
          tagline: 'Official Youth Audio Partner',
          logo: '/boat-logo.png',
          logoText: 'bOAT',
          desc: 'Rewarding competition winners with wireless audio kits and tech merchandise.'
        }
      ]
    },
    {
      tier: 'MEDIA & BROADCAST PARTNERS',
      badge: 'Official Media',
      color: '#7c3aed',
      sponsors: [
        {
          name: 'THE HINDU',
          tagline: 'National Print & Digital Media Partner',
          logo: '/the_hindu_logo.png',
          logoText: 'TH',
          desc: 'Comprehensive regional and national festival coverage across print and online.'
        },
        {
          name: 'RADIO MIRCHI 98.3 FM',
          tagline: 'Official Radio & RJ Host Partner',
          logo: '/RADIOMIRCHI.jpg',
          logoText: '98.3',
          desc: 'Broadcasting live campus interviews, contest updates, and RJ entertainment.'
        }
      ]
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setFormData({
      companyName: '',
      contactPerson: '',
      email: '',
      phone: '',
      tier: 'Gold Partner (₹3,00,000)',
      message: ''
    });
  };

  return (
    <SplitBackground as="main" className="sponsors-page-wrapper">
      {/* Hero Header */}
      <section className="sponsors-hero">
        <div className="sponsors-header-row sponsors-title-row">
          <SplitColorText
            as="h1"
            className="sponsors-hero-title"
            splitPercent={50}
            leftColor="#0f172a"
            rightColor="#ffffff"
          >
            Sponsors & Partners
          </SplitColorText>
        </div>
      </section>

      {/* Tiered Sponsor Sections */}
      <section className="sponsors-grid-section">
        <div className="container">
          {/* Top Combined Row: Title Sponsor (5) & Powered By / Co-Sponsors (7) */}
          <div className="sponsors-top-row-grid">
            {/* 5-Column Container: Title Sponsor (Card width: 5) */}
            <div className="tier-group-block sponsors-col-5">
              <div className="tier-header">
                <span className="tier-badge-pill">
                  <SplitColorText
                    screenSync={true}
                    leftColor="#0f172a"
                    rightColor="#ffffff"
                  >
                    {sponsorTiers[0].badge}
                  </SplitColorText>
                </span>
                <SplitColorText
                  as="h2"
                  className="tier-heading"
                  screenSync={true}
                  leftColor="#0f172a"
                  rightColor="#ffffff"
                >
                  {sponsorTiers[0].tier}
                </SplitColorText>
              </div>

              <div className="tier-cards-grid sponsors-cards-col-5">
                {sponsorTiers[0].sponsors.map((sp, sIdx) => (
                  <SponsorCard key={sIdx} sponsor={sp} color={sponsorTiers[0].color} />
                ))}
              </div>
            </div>

            {/* 7-Column Container: Powered By & Co-Sponsors (Cards width: 3.5 + 3.5) */}
            <div className="tier-group-block sponsors-col-7">
              <div className="tier-header">
                <span className="tier-badge-pill">
                  <SplitColorText
                    screenSync={true}
                    leftColor="#0f172a"
                    rightColor="#ffffff"
                  >
                    {sponsorTiers[1].badge}
                  </SplitColorText>
                </span>
                <SplitColorText
                  as="h2"
                  className="tier-heading"
                  screenSync={true}
                  leftColor="#0f172a"
                  rightColor="#ffffff"
                >
                  {sponsorTiers[1].tier}
                </SplitColorText>
              </div>

              <div className="tier-cards-grid sponsors-cards-col-7">
                {sponsorTiers[1].sponsors.map((sp, sIdx) => (
                  <SponsorCard key={sIdx} sponsor={sp} color={sponsorTiers[1].color} />
                ))}
              </div>
            </div>
          </div>

          {/* Remaining Tier Groups (Associate, Media, etc.) */}
          {sponsorTiers.slice(2).map((tierGroup, idx) => (
            <div key={idx + 2} className="tier-group-block">
              <div className="tier-header">
                <span className="tier-badge-pill">
                  <SplitColorText
                    screenSync={true}
                    leftColor="#0f172a"
                    rightColor="#ffffff"
                  >
                    {tierGroup.badge}
                  </SplitColorText>
                </span>
                <SplitColorText
                  as="h2"
                  className="tier-heading"
                  screenSync={true}
                  leftColor="#0f172a"
                  rightColor="#ffffff"
                >
                  {tierGroup.tier}
                </SplitColorText>
              </div>

              <div className="tier-cards-grid">
                {tierGroup.sponsors.map((sp, sIdx) => (
                  <SponsorCard key={sIdx} sponsor={sp} color={tierGroup.color} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Corporate Sponsorship Benefits */}
      <section className="sponsors-benefits-section">
        <div className="container">
          <div className="benefits-header text-center">
            <span className="section-mini-tag">PARTNERSHIP VALUE</span>
            <SplitColorText
              as="h2"
              className="section-main-heading"
              screenSync={true}
              leftColor="#0f172a"
              rightColor="#ffffff"
            >
              Why Sponsor Colours 2027?
            </SplitColorText>
            <SplitColorText
              as="p"
              className="benefits-sub"
              screenSync={true}
              leftColor="#475569"
              rightColor="#cbd5e1"
            >
              Direct engagement with India's most dynamic youth demographic
            </SplitColorText>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <span className="benefit-icon">👥</span>
              <h4>35,000+ Footfall</h4>
              <p>Direct exposure to thousands of engineering, management, and pharmacy students over 3 days.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">📱</span>
              <h4>5,00,000+ Digital Reach</h4>
              <p>Extensive social media visibility across Instagram, YouTube live streams, and campus portal banners.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🎪</span>
              <h4>Exclusive Stalls & Kiosks</h4>
              <p>Prime experiential kiosks and product sampling lounges across high-traffic campus zones.</p>
            </div>
            <div className="benefit-card">
              <span className="benefit-icon">🏆</span>
              <h4>Stage & Trophy Naming</h4>
              <p>Prominent branding on stage backdrops, event trophies, jerseys, and festival registration kits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Sponsor Form */}
      <section id="become-sponsor" className="sponsors-form-section">
        <div className="container">
          <div className="sponsor-form-card">
            <div className="form-info-col">
              <span className="section-mini-tag">COLLABORATE WITH US</span>
              <h3>Become an Official Partner</h3>
              <p>
                Interested in sponsoring a category, arena, or celebrity concert night? Fill out the brief
                form and our Sponsorship Directorate will promptly share the official pitch deck.
              </p>
              <div className="sponsor-direct-contact">
                <p><strong>Marketing Dean:</strong> Dr. R. Srinivas Rao</p>
                <p><strong>Phone:</strong> +91 94901 23456</p>
                <p><strong>Email:</strong> sponsorship@adityauniversity.in</p>
              </div>
            </div>

            <div className="form-input-col">
              {submitted ? (
                <div className="form-success-banner">
                  <span>🎉</span>
                  <h4>Thank You for Your Interest!</h4>
                  <p>Our Corporate Relations Officer will contact you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="sponsor-form">
                  <MuiTextField
                    label="Company / Organization Name"
                    name="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    required
                    placeholder="e.g. Acme Tech Solutions"
                  />

                  <div className="form-row-2">
                    <MuiTextField
                      label="Contact Person"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      required
                      placeholder="Full Name"
                    />
                    <MuiTextField
                      label="Mobile Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <MuiTextField
                    label="Official Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="partner@company.com"
                  />

                  <MuiSelectField
                    label="Preferred Sponsorship Category"
                    name="tier"
                    value={formData.tier}
                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    required
                    options={SPONSORSHIP_TIERS}
                  />

                  <MuiTextField
                    label="Message / Specific Proposal"
                    name="message"
                    multiline={true}
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Share your goals or marketing requirements..."
                  />

                  <button type="submit" className="btn-sponsors-primary w-100">
                    Submit Partnership Request →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </SplitBackground>
  );
}
