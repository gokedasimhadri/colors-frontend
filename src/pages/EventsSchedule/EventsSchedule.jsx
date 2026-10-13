import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './EventsSchedule.css';

export default function EventsSchedule() {
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const scheduleDays = [
    { day: 1, date: 'Feb 15, 2027', title: 'Day 1: Inaugural & Prelims', highlight: 'Grand Torch Relay & Classical Arts' },
    { day: 2, date: 'Feb 16, 2027', title: 'Day 2: Semi-Finals & Battles', highlight: 'Battle of Bands & Pro Celebrity Night' },
    { day: 3, date: 'Feb 17, 2027', title: 'Day 3: Championship Finals', highlight: 'Valedictory & Mega Star Concert' },
  ];

  const scheduleItems = [
    // Day 1
    {
      day: 1, time: '08:30 AM – 10:00 AM', category: 'General',
      name: 'Grand Inauguration Ceremony & Torch Relay',
      venue: 'University Central Amphitheatre',
      incharge: 'Convener & Student Senate',
      type: 'Ceremony', link: '/invitation'
    },
    {
      day: 1, time: '10:30 AM – 01:30 PM', category: 'Sports & Games',
      name: 'Basketball Tournament (Men & Women Prelims)',
      venue: 'KL Rao Bhavan Sports Arena',
      incharge: 'Department of Physical Education',
      type: 'Sports', link: '/events/Sports%20%26%20Games/Basketball'
    },
    {
      day: 1, time: '10:30 AM – 02:00 PM', category: 'Culturals',
      name: 'Classical Dance & Folk Dance (Solo)',
      venue: 'Visweswaraya Bhavan Seminar Hall',
      incharge: 'Dr. Paramesh (CSE)',
      type: 'Cultural', link: '/events/Culturals/Dance'
    },
    {
      day: 1, time: '11:00 AM – 02:30 PM', category: 'Culturals',
      name: 'Instrumental Solo & Group Rounds',
      venue: 'Ramanujan Bhavan Seminar Hall',
      incharge: 'T. Himaja (EEE)',
      type: 'Cultural', link: '/events/Culturals/Instrumental'
    },
    {
      day: 1, time: '11:00 AM – 03:00 PM', category: 'Creo',
      name: 'Spot Photography & Sahityam Literary Symposium',
      venue: 'Ratan Tata Bhavan – Room 210 & 212',
      incharge: 'Department of Humanities',
      type: 'Creo', link: '/events/Creo/Spot%20Photography'
    },
    {
      day: 1, time: '02:00 PM – 05:30 PM', category: 'Sports & Games',
      name: 'Kabaddi & Volleyball Knockouts',
      venue: 'CV Raman & KL Rao Grounds',
      incharge: 'Physical Education Directorate',
      type: 'Sports', link: '/events/Sports%20%26%20Games/Volleyball'
    },
    {
      day: 1, time: '06:00 PM – 09:30 PM', category: 'Culturals',
      name: 'Opening Cultural Night & Student Beats Showcase',
      venue: 'Central Open Air Stage',
      incharge: 'Central Cultural Committee',
      type: 'Concert', link: '/events'
    },

    // Day 2
    {
      day: 2, time: '08:30 AM – 12:00 PM', category: 'Sports & Games',
      name: 'Athletics, Track & Field, Relay (Men & Women)',
      venue: 'University Synthetic Track & BPED Ground',
      incharge: 'Athletics Committee',
      type: 'Sports', link: '/events/Sports%20%26%20Games/Running'
    },
    {
      day: 2, time: '10:00 AM – 01:30 PM', category: 'Culturals',
      name: 'Mono Action & Theatrical Mime Presentations',
      venue: 'Newton Bhavan Seminar Hall',
      incharge: 'Dr. P. Vijaya Kumar & S. Ganapathi',
      type: 'Cultural', link: '/events/Culturals/Mono%20Action'
    },
    {
      day: 2, time: '10:00 AM – 02:00 PM', category: 'Creo',
      name: 'Spot Painting, Mehandi & Rangoli Arts',
      venue: 'KL Rao Bhavan Drawing Hall & Lawns',
      incharge: 'Faculty of Fine Arts',
      type: 'Creo', link: '/events/Creo/Spot%20Painting'
    },
    {
      day: 2, time: '11:00 AM – 03:00 PM', category: 'Culturals',
      name: 'Stand-up Comedy & Mimicry Competitions',
      venue: 'Cotton Bhavan Seminar Hall',
      incharge: 'A.K. Chakravarthy & K. Kalyani',
      type: 'Cultural', link: '/events/Culturals/Stand-up%20Comedy'
    },
    {
      day: 2, time: '02:00 PM – 05:30 PM', category: 'Sports & Games',
      name: 'Shuttle Badminton & Table Tennis Semi-Finals',
      venue: 'Indoor Sports Complex',
      incharge: 'Racket Sports Committee',
      type: 'Sports', link: '/events/Sports%20%26%20Games/Shuttle%20Badminton%20Singles'
    },
    {
      day: 2, time: '06:30 PM – 10:00 PM', category: 'Culturals',
      name: 'Battle of Bands & Pro Celebrity Night Concert',
      venue: 'Open Air Stadium',
      incharge: 'Festival Committee & Pro Artist Team',
      type: 'Concert', link: '/events/Culturals/Singing'
    },

    // Day 3
    {
      day: 3, time: '09:00 AM – 12:30 PM', category: 'Sports & Games',
      name: 'Championship Grand Finals (Football, Basketball, Volleyball)',
      venue: 'University Stadium Grounds',
      incharge: 'Referees Panel & Sports Directorate',
      type: 'Sports', link: '/events/Sports%20%26%20Games/Football'
    },
    {
      day: 3, time: '10:00 AM – 01:30 PM', category: 'Creo',
      name: 'Treasure Hunt & Short Film Movie Making Screening',
      venue: 'Ramanujan & Ratan Tata Auditoriums',
      incharge: 'Media & Animation Cell',
      type: 'Creo', link: '/events/Creo/Movie%20Making'
    },
    {
      day: 3, time: '02:00 PM – 04:30 PM', category: 'Creo',
      name: 'Grand Runway Fashion Show Extravaganza',
      venue: 'ACOP Main Seminar Hall',
      incharge: 'Fashion & Design Dept',
      type: 'Creo', link: '/events/Creo/Fashion%20Show'
    },
    {
      day: 3, time: '05:00 PM – 07:30 PM', category: 'General',
      name: 'Valedictory Ceremony, Trophy Presentation & Medals',
      venue: 'Central Amphitheatre',
      incharge: 'Chancellor, Vice-Chancellor & Dignitaries',
      type: 'Ceremony', link: '/invitation'
    },
    {
      day: 3, time: '08:00 PM – 11:00 PM', category: 'Culturals',
      name: 'Grand Star EDM Concert & Closing Musical Night',
      venue: 'Open Air Arena',
      incharge: 'Student Council & Event Directorate',
      type: 'Concert', link: '/events'
    },
  ];

  const filteredSchedule = useMemo(() => {
    return scheduleItems.filter((item) => {
      const matchDay = item.day === selectedDay;
      const matchCategory =
        selectedCategory === 'ALL' ||
        item.category.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchDay && matchCategory;
    });
  }, [selectedDay, selectedCategory]);

  return (
    <div className="schedule-page-wrapper">
      {/* Header Banner */}
      <section className="schedule-hero">
        <div className="container text-center">
          <div className="schedule-badge-top">ADITYA UNIVERSITY • FESTIVAL ITINERARY</div>
          <h1 className="schedule-hero-title">Events Schedule & Timeline</h1>
          <p className="schedule-hero-sub">
            Plan your 3-day festival journey across 40+ competitions, arenas, and grand concerts.
            All fixtures, reporting times, and venue locations are updated live.
          </p>

          {/* Day Selection Tabs */}
          <div className="schedule-days-tabs">
            {scheduleDays.map((d) => (
              <button
                key={d.day}
                type="button"
                className={`day-tab-card ${selectedDay === d.day ? 'active' : ''}`}
                onClick={() => setSelectedDay(d.day)}
              >
                <span className="day-number">DAY {d.day}</span>
                <span className="day-date">{d.date}</span>
                <span className="day-title">{d.title.split(':')[1]}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filter and Schedule List */}
      <section className="schedule-list-section">
        <div className="container">
          {/* Category Filter Pills */}
          <div className="schedule-filter-bar">
            <div className="filter-pills">
              <button
                className={`f-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('ALL')}
              >
                All Domains
              </button>
              <button
                className={`f-pill ${selectedCategory === 'Sports & Games' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Sports & Games')}
              >
                ⚽ Sports & Games
              </button>
              <button
                className={`f-pill ${selectedCategory === 'Culturals' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Culturals')}
              >
                🎭 Culturals & Music
              </button>
              <button
                className={`f-pill ${selectedCategory === 'Creo' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('Creo')}
              >
                🎨 Creo Creative Arts
              </button>
            </div>

            <div className="schedule-meta-badge">
              Showing <strong>{filteredSchedule.length}</strong> events on Day {selectedDay}
            </div>
          </div>

          {/* Timeline Cards */}
          <div className="timeline-container">
            {filteredSchedule.map((item, idx) => (
              <div key={idx} className="timeline-item-card">
                <div className="timeline-time-col">
                  <span className="time-badge">⏰ {item.time}</span>
                  <span className={`cat-pill cat-${item.category.toLowerCase().replace(/[^a-z]/g, '')}`}>
                    {item.category}
                  </span>
                </div>

                <div className="timeline-content-col">
                  <h3 className="timeline-event-name">{item.name}</h3>
                  <div className="timeline-details-row">
                    <span className="detail-item">
                      <strong>📍 Venue:</strong> {item.venue}
                    </span>
                    <span className="detail-item">
                      <strong>👤 Coordinator:</strong> {item.incharge}
                    </span>
                  </div>
                </div>

                <div className="timeline-action-col">
                  <Link to={item.link} className="btn-timeline-action">
                    View Rules / Venue →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Important Notice */}
          <div className="schedule-notice-box">
            <h4>📌 Official Participant Guidelines</h4>
            <ul>
              <li>Participants must report to the designated venue at least 30 minutes prior to scheduled start time.</li>
              <li>College ID Card & Registration Receipt / Team Code is mandatory for all team captains and solo performers.</li>
              <li>Judges' decisions in all competitive categories are final and binding.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
