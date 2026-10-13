import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Sponsors.css';

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
      color: '#ffd700',
      sponsors: [
        {
          name: 'ADITYA GROUP OF INSTITUTIONS',
          tagline: 'Leading Educational Pioneer in South India',
          logoText: 'AGI',
          desc: 'Title sponsor fostering innovation, athletic training, and cultural empowerment.'
        }
      ]
    },
    {
      tier: 'POWERED BY & CO-SPONSORS',
      badge: 'Premier Partners',
      color: '#ff1f78',
      sponsors: [
        {
          name: 'STATE BANK OF INDIA',
          tagline: 'Official Banking & Digital Payments Partner',
          logoText: 'SBI',
          desc: 'Seamless festival cashless transactions and student entrepreneurship rewards.'
        },
        {
          name: 'RAZORPAY',
          tagline: 'Official Payment Gateway Partner',
          logoText: 'RZP',
          desc: 'Powering high-concurrency national event registrations and instant confirmations.'
        }
      ]
    },
    {
      tier: 'ASSOCIATE & SPORTS GEAR PARTNERS',
      badge: 'Gold Partners',
      color: '#38bdf8',
      sponsors: [
        {
          name: 'DECATHLON SPORTS INDIA',
          tagline: 'Official Sports Apparel & Equipment Partner',
          logoText: 'DCT',
          desc: 'Providing tournament match balls, referee kits, and championship MVP prizes.'
        },
        {
          name: 'RED BULL ENERGY',
          tagline: 'Official Energy Drink & Stage Partner',
          logoText: 'RB',
          desc: 'Energizing participants and hosting the Red Bull Dance Battles showcase.'
        },
        {
          name: 'BOAT AUDIO',
          tagline: 'Official Youth Audio Partner',
          logoText: 'bOAT',
          desc: 'Rewarding competition winners with wireless audio kits and tech merchandise.'
        }
      ]
    },
    {
      tier: 'MEDIA & BROADCAST PARTNERS',
      badge: 'Official Media',
      color: '#a855f7',
      sponsors: [
        {
          name: 'THE HINDU',
          tagline: 'National Print & Digital Media Partner',
          logoText: 'TH',
          desc: 'Comprehensive regional and national festival coverage across print and online.'
        },
        {
          name: 'RADIO MIRCHI 98.3 FM',
          tagline: 'Official Radio & RJ Host Partner',
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
    <div className="sponsors-page-wrapper">
      {/* Hero Header */}
      <section className="sponsors-hero">
        <div className="container text-center">
          <div className="sponsors-badge-top">ADITYA UNIVERSITY • FESTIVAL PARTNERS</div>
          <h1 className="sponsors-hero-title">Proud Sponsors & Partners</h1>
          <p className="sponsors-hero-sub">
            We extend our profound gratitude to our esteemed corporate, financial, and media partners
            who empower over 25,000 students to pursue excellence at Colours 2027.
          </p>
          <div className="sponsors-hero-actions">
            <a href="#become-sponsor" className="btn-sponsors-primary">
              Partner With Us / Sponsorship Deck ↓
            </a>
            <Link to="/contact" className="btn-sponsors-outline">
              Contact Marketing Cell
            </Link>
          </div>
        </div>
      </section>

      {/* Tiered Sponsor Sections */}
      <section className="sponsors-grid-section">
        <div className="container">
          {sponsorTiers.map((tierGroup, idx) => (
            <div key={idx} className="tier-group-block">
              <div className="tier-header">
                <span className="tier-badge-pill" style={{ borderColor: tierGroup.color, color: tierGroup.color }}>
                  {tierGroup.badge}
                </span>
                <h2 className="tier-heading">{tierGroup.tier}</h2>
              </div>

              <div className="tier-cards-grid">
                {tierGroup.sponsors.map((sp, sIdx) => (
                  <div key={sIdx} className="sponsor-card">
                    <div className="sponsor-logo-circle" style={{ borderColor: tierGroup.color }}>
                      <span>{sp.logoText}</span>
                    </div>
                    <div className="sponsor-details">
                      <h3 className="sponsor-name">{sp.name}</h3>
                      <span className="sponsor-tagline">{sp.tagline}</span>
                      <p className="sponsor-desc">{sp.desc}</p>
                    </div>
                  </div>
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
            <h2 className="section-main-heading">Why Sponsor Colours 2027?</h2>
            <p className="benefits-sub">Direct engagement with India's most dynamic youth demographic</p>
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
                  <div className="form-field">
                    <label>Company / Organization Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Tech Solutions"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>

                  <div className="form-row-2">
                    <div className="form-field">
                      <label>Contact Person *</label>
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={formData.contactPerson}
                        onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      />
                    </div>
                    <div className="form-field">
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

                  <div className="form-field">
                    <label>Official Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="partner@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="form-field">
                    <label>Preferred Sponsorship Category</label>
                    <select
                      value={formData.tier}
                      onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                    >
                      <option>Title Presenter (₹10,00,000)</option>
                      <option>Powered By Partner (₹5,00,000)</option>
                      <option>Gold Partner (₹3,00,000)</option>
                      <option>Silver Partner (₹1,50,000)</option>
                      <option>Stall & Food Vendor (₹50,000)</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Message / Specific Proposal</label>
                    <textarea
                      rows="3"
                      placeholder="Share your goals or marketing requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn-sponsors-primary w-100">
                    Submit Partnership Request →
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
