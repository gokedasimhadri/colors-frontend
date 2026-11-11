import {
  EVENT_BADGE_TEXT,
  EVENT_CONFIG,
} from '../../utils/eventDate';
import './Invitation.css';

// Official Aditya University dignitary portraits stored in public/invitation/
export default function Invitation() {
  const { startDay, endDay, monthFull, year } = EVENT_CONFIG;
  const dateToRange = `${monthFull} ${startDay} to ${endDay}, ${year}`;
  const dateDashRange = `${monthFull} ${startDay}–${endDay}, ${year}`;

  const dignitaries = [
    {
      id: 'chancellor',
      name: 'Dr. N. Sesha Reddy',
      designation: 'Chancellor, Aditya University',
      roleTag: 'CHANCELLOR MESSAGE',
      layout: 'text-left',
      image: '/invitation/chancellor-sesha-reddy.webp',
      paragraphs: [
        `I am delighted that Aditya University is hosting Colours-${year}: Youth Festival from ${dateToRange}. This vibrant festival promises to leave a lasting impression on all participants, as it highlights cultural richness through a variety of dynamic programs and activities. Beyond celebrating talent, the festival embodies the spirit of friendship, fostering peace and building meaningful connections among the youth.`,
        `Colours-${year} offers a unique platform for young individuals to showcase their cultural talents and aspirations, encouraging creativity and personal growth. Such events are vital in shaping the holistic development of talented youth and serve as an inspiration to all who participate and observe.`,
        `I warmly invite each one of you to participate wholeheartedly, forge new connections, and create memories that will be cherished forever. Let us come together to make Colours-${year} a grand success and an unforgettable celebration of youth and unity.`
      ],
    },
    {
      id: 'pro-chancellor',
      name: 'Dr. N. Satish Reddy',
      designation: 'Pro-Chancellor, Aditya University',
      roleTag: 'PRO-CHANCELLOR MESSAGE',
      layout: 'image-left',
      image: '/invitation/pro-chancellor-satish-reddy.webp',
      paragraphs: [
        `I am thrilled to announce Colours – ${year}, the International Youth Festival hosted by Aditya University from ${dateDashRange}. This grand celebration of diversity, creativity, and youthful energy promises to be an unforgettable experience. I invite participants from around the country to showcase talent, share ideas, and celebrate cultural harmony through mesmerizing performances, thought-provoking discussions, and thrilling competitions.`,
        `Let’s make Colours – ${year} a platform for inspiration, connection, and lifelong memories. I look forward to seeing you all there as we celebrate the vibrancy and boundless potential of youth!`
      ],
    },
    {
      id: 'dy-pro-chancellor',
      name: 'Dr. M. Sreenivasa Reddy',
      designation: 'Deputy Pro-Chancellor, Aditya University',
      roleTag: 'DEPUTY PRO-CHANCELLOR MESSAGE',
      layout: 'text-left',
      image: '/invitation/dy-pro-chancellor-sreenivasa-reddy.jpg',
      paragraphs: [
        `I am excited to invite you all to the highly anticipated International Youth Festival – Colours ${year}, taking place from ${dateDashRange}, at Aditya University. This festival is not just an event but a grand celebration of creativity, cultural diversity, and the boundless energy of youth, bringing together participants from around the world.`,
        `At AUS, we are committed to fostering an environment that nurtures talent, encourages collaboration, and celebrates cultural exchanges. Colours ${year} offers a unique opportunity for young people to showcase their skills, form new connections, and engage in meaningful interactions across cultures. With a variety of performances, interactive discussions, exciting competitions, and cultural presentations, this festival is bound to leave a profound impact. I wholeheartedly encourage you to participate, explore your potential, and create memories that will last a lifetime.`
      ],
    },
    {
      id: 'vice-chancellor',
      name: 'Prof. M. B. Srinivas',
      designation: 'Vice-Chancellor, Aditya University',
      roleTag: 'VICE-CHANCELLOR MESSAGE',
      layout: 'image-left',
      image: '/invitation/vice-chancellor-mb-srinivas.webp',
      paragraphs: [
        `At Aditya University, we firmly believe in the holistic development of our students. While academic excellence remains our primary focus, we also recognize the importance of nurturing creativity, talent, and cultural exchange. It is in this spirit that we proudly present Colours-${year}: Youth Festival, scheduled from ${dateToRange}.`,
        `This festival goes beyond academics, providing a vibrant platform for students to celebrate diversity, showcase their talents, and connect with peers from across the globe. It reflects our commitment to creating well-rounded individuals who value collaboration, cultural understanding, and community building.`,
        `I encourage everyone to embrace this opportunity, participate actively, and experience the joy of cultural unity. Together, let’s make Colours-${year} a memorable and impactful event for all.`
      ],
    },
  ];

  return (
    <div className="invitation-page-wrapper">
      {/* ── Official Hero Banner ── */}
      <section className="invitation-hero">
        <div className="container invitation-hero-inner">
          <div className="invitation-crest-row">
            <div className="invitation-crest">AU</div>
            <span className="invitation-uni-label">ADITYA UNIVERSITY • ACCREDITED A++</span>
          </div>

          <span className="invitation-tagline">YOU'RE CORDIALLY INVITED TO</span>
          <h1 className="invitation-title">COLOURS {year}</h1>
          <p className="invitation-sub">
            A National Level Youth Festival • Culturals, Sports & Creo
          </p>

          <div className="invitation-dates-badge">
            <span className="badge-item">📅 {EVENT_BADGE_TEXT}</span>
            <span className="badge-sep">•</span>
            <span className="badge-item">🏆 ₹10 LAKHS IN CASH PRIZES</span>
            <span className="badge-sep">•</span>
            <span className="badge-item">📍 SURAMPALEM, AP</span>
          </div>
        </div>
      </section>

      {/* ── Dignitaries Invitation Messages with Portrait Provision ── */}
      <section className="invitation-messages-section">
        <div className="container invitation-messages-stack">
          {dignitaries.map((person) => (
            <article
              key={person.id}
              className={`dignitary-invite-card ${person.layout === 'image-left' ? 'reverse' : ''}`}
            >
              <div className="dignitary-message-col">
                <span className="dignitary-role-badge">{person.roleTag}</span>
                <div className="dignitary-paragraphs">
                  {person.paragraphs.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
                <div className="dignitary-signature">
                  <strong className="dignitary-name">{person.name}</strong>
                  <span className="dignitary-designation">{person.designation}</span>
                </div>
              </div>

              <div className="dignitary-photo-col">
                <div className="dignitary-photo-frame">
                  <img
                    src={person.image}
                    alt={`${person.name} – ${person.designation}`}
                    className="dignitary-portrait-img"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
