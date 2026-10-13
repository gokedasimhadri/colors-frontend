import { Link } from 'react-router-dom';
import './Invitation.css';

export default function Invitation() {
  const leadership = [
    {
      name: 'Dr. N. Sesha Reddy',
      role: 'Hon’ble Chairman',
      institution: 'Aditya University',
      quote: 'Colours represents the vibrant spirit of youth, leadership, and athletic perseverance.',
      avatar: '👑'
    },
    {
      name: 'Dr. M. Sreenivasa Reddy',
      role: 'Vice-Chancellor',
      institution: 'Aditya University',
      quote: 'We welcome talent from universities nationwide to celebrate artistic brilliance.',
      avatar: '🎓'
    },
    {
      name: 'Dr. K. Kishore',
      role: 'Convener – Colours 2027',
      institution: 'Aditya University',
      quote: 'Our stages and arenas are prepared to host an unforgettable collegiate spectacle.',
      avatar: '🌟'
    }
  ];

  const dignitaries = [
    {
      title: 'Chief Guest – Inaugural',
      name: 'Padma Shri Awardee',
      field: 'Eminent Performing Artist & Cultural Icon',
      date: 'Feb 15, 2027 • 09:30 AM',
      venue: 'University Grand Amphitheatre'
    },
    {
      title: 'Celebrity Guest – Pro Night',
      name: 'National Playback Singer',
      field: 'Music Director & Live Concert Performer',
      date: 'Feb 16, 2027 • 07:00 PM',
      venue: 'Central Open Air Stage'
    },
    {
      title: 'Valedictory Guest',
      name: 'Olympic Medalist Athlete',
      field: 'Indian Sports Personality',
      date: 'Feb 17, 2027 • 05:00 PM',
      venue: 'Main Indoor Stadium'
    }
  ];

  return (
    <div className="invitation-page-wrapper">
      {/* Royal University Banner */}
      <section className="invitation-hero">
        <div className="container text-center">
          <div className="invitation-crest-row">
            <div className="invitation-crest">AU</div>
            <span className="invitation-uni-label">ADITYA UNIVERSITY • ACCREDITED A++</span>
          </div>

          <span className="invitation-tagline">CORDIAL INVITATION</span>
          <h1 className="invitation-title">COLOURS 2027</h1>
          <p className="invitation-sub">
            National Level Inter-University Cultural, Arts & Sports Festival
          </p>

          <div className="invitation-dates-badge">
            <span>📅 FEBRUARY 15 – 17, 2027</span>
            <span>•</span>
            <span>📍 ADITYA UNIVERSITY, SURAMPALEM</span>
          </div>
        </div>
      </section>

      {/* Formal Letter Card */}
      <section className="invitation-letter-section">
        <div className="container">
          <div className="royal-letter-card">
            <div className="letter-header">
              <span className="letter-salutation">To,</span>
              <h3 className="letter-recipient">The Vice-Chancellors, Principals, Directors & Student Deans</h3>
              <p className="letter-colleges">Universities & Colleges Across India</p>
            </div>

            <div className="letter-body">
              <p>
                <strong>Respected Leaders & Dear Student Delegates,</strong>
              </p>
              <p>
                It gives us immense pride and honor to invite your esteemed institution to participate in
                <strong> Colours 2027</strong>, the annual mega-celebration of talent, athletics, theatrical arts,
                and creative ingenuity hosted by Aditya University from <strong>February 15 to 17, 2027</strong>.
              </p>
              <p>
                Colours has grown into one of South India's largest and most eagerly anticipated collegiate fests,
                attracting delegations from over <strong>50+ premier institutions</strong> and more than
                <strong> 25,000 energetic participants</strong>. Featuring over <strong>40 competitive events</strong>
                spanning championship sports, classical and western dance, band battles, theatrical skits, and
                spot fine arts, the festival offers total prizes exceeding <strong>₹15,00,000</strong> along with
                national recognition.
              </p>
              <p>
                We look forward to hosting your contingent on our state-of-the-art campus in Surampalem, Kakinada.
                Comfortable accommodation, hospitality, and campus facilities have been arranged to ensure a memorable
                experience for every participant.
              </p>
            </div>

            <div className="letter-footer">
              <div className="letter-signature-block">
                <span className="sign-title">Organizing Committee</span>
                <span className="sign-name">Colours 2027 Directorate</span>
                <span className="sign-uni">Aditya University</span>
              </div>

              <div className="letter-actions">
                <Link to="/events" className="btn-royal-primary">
                  Explore Events & Register Contingent →
                </Link>
                <a
                  href="#download"
                  onClick={(e) => {
                    e.preventDefault();
                    window.print();
                  }}
                  className="btn-royal-outline"
                >
                  📄 Print / Save Invitation
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Messages */}
      <section className="invitation-patrons-section">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-mini-tag">PATRONS & LEADERSHIP</span>
            <h2 className="section-main-heading">Messages from the Management</h2>
          </div>

          <div className="patrons-grid">
            {leadership.map((item, idx) => (
              <div key={idx} className="patron-card">
                <div className="patron-avatar">{item.avatar}</div>
                <h4 className="patron-name">{item.name}</h4>
                <span className="patron-role">{item.role}</span>
                <span className="patron-inst">{item.institution}</span>
                <p className="patron-quote">"{item.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dignitaries & Chief Guests */}
      <section className="invitation-dignitaries-section">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-mini-tag">DISTINGUISHED GUESTS</span>
            <h2 className="section-main-heading">Festival Dignitaries & Keynotes</h2>
          </div>

          <div className="dignitaries-grid">
            {dignitaries.map((guest, idx) => (
              <div key={idx} className="dignitary-card">
                <div className="dignitary-tag">{guest.title}</div>
                <h3 className="dignitary-name">{guest.name}</h3>
                <p className="dignitary-field">{guest.field}</p>
                <div className="dignitary-meta">
                  <span>📅 {guest.date}</span>
                  <span>📍 {guest.venue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration & Hospitality Guide */}
      <section className="invitation-hospitality-section">
        <div className="container">
          <div className="hospitality-card">
            <div className="hosp-text">
              <span className="section-mini-tag">DELEGATION SUPPORT</span>
              <h3>Outstation Contingent Hospitality</h3>
              <p>
                Hostel accommodation, multi-cuisine dining, and round-the-clock campus transit shuttles from
                Samalkot & Kakinada railway stations will be extended to all verified outstation college teams.
              </p>
            </div>
            <div className="hosp-buttons">
              <Link to="/contact" className="btn-royal-primary">
                Contact Hospitality Desk
              </Link>
              <Link to="/events-schedule" className="btn-royal-outline">
                View Schedule Protocol
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
