import React, { useEffect, useRef } from 'react';
import SplitBackground from '../components/ThemeComponents/backgrounds/SplitBackground';
import SplitColorText from '../components/ThemeComponents/SplitColor/SplitColorText';
import { LiquidGlass } from '../components/ThemeComponents/LiquidGlass';
import './Teams/Teams.css';

// Hook: observe elements and add .in-view class on scroll
function useScrollReveal(selector = '.scroll-reveal', options = {}) {
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return; // only on mobile

    const els = document.querySelectorAll(selector);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold: 0.12, ...options }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [selector]);
}

const featuredLeader = {
  name: 'Dr. M. Sreenivasa Reddy',
  designation: 'Dy. Pro-Chancellor',
  department: 'Aditya University',
  accent: '#be9337',
  image: '/Team/dy-pro-chancellor-sreenivasa-reddy.jpg',
  initials: 'SR'
};

const organizingTeam = [
  {
    name: 'Dr. M. B. Srinivas',
    designation: 'Vice-Chancellor',
    department: 'Aditya University',
    accent: '#be9337',
    image: '/Team/Prof__M_B__Srinivas.webp',
    initials: 'MBS'
  },
  {
    name: 'Dr. G. Suresh',
    designation: 'Registrar',
    department: 'Aditya University',
    accent: '#0284c7',
    image: '/Team/suresh.webp',
    initials: 'GS'
  },
  {
    name: 'Dr. A. Ramesh',
    designation: 'Pro Vice-Chancellor (E & S)',
    department: 'Aditya University',
    accent: '#10b981',
    image: '/Team/Ramesh_sir.webp',
    initials: 'AR'
  },
  {
    name: 'Dr. S. Rama Sree',
    designation: 'Pro. Vice-Chancellor (Academics)',
    department: 'Aditya University',
    accent: '#7c3aed',
    image: '/Team/ramasree.webp',
    initials: 'SRS'
  },
  {
    name: 'Dr. Thangjam Ravichandra',
    designation: 'Pro-Vice Chancellor (S & P)',
    department: 'Aditya University',
    accent: '#06b6d4',
    image: '/Team/Ravi.webp',
    initials: 'TR'
  },
  {
    name: 'Mr. V. Satyanarayana',
    designation: 'Dean-Admin.',
    department: 'Aditya University',
    accent: '#e11d48',
    image: '/Team/Prof__V_Satyanarayna.webp',
    initials: 'VS'
  }
];

const eventCommittees = [
  {
    committee: 'Cultural & Stage Events',
    name: 'Dr. D. Kishore',
    designation: 'Dean - Student Activities',
    department: 'Aditya University',
    accent: '#0284c7',
    image: '/Team/Kishore_D.webp',
    initials: 'DK'
  },
  {
    committee: 'Sports',
    name: 'Dr. G. Sanjiv Rao',
    designation: 'Dean - Career Development',
    department: 'Aditya University',
    accent: '#10b981',
    image: '/Team/sanjeev.webp',
    initials: 'SR'
  },
  {
    committee: 'Creo',
    name: 'Dr. P. S. V. V. S. R. Kumar',
    designation: 'Dean - Academics',
    department: 'Aditya University',
    accent: '#be9337',
    image: '',
    initials: 'PK'
  },
  {
    committee: 'FETE',
    name: 'Mr. J. D. Venkatesh',
    designation: 'Asst. Prof.',
    department: 'Aditya University',
    accent: '#7c3aed',
    image: '/Team/Mr__J_D_Venkatesh.webp',
    initials: 'JV'
  }
];

const functionalCommittees = [
  {
    committee: 'Sponsorship',
    name: 'Dr. G. Sridevi',
    designation: 'Dean - School of Engineering',
    department: 'Aditya University',
    accent: '#e11d48',
    image: '/Team/Sridevi.jpg',
    initials: 'GS'
  },
  {
    committee: 'Campaigning and Invitations',
    name: 'Dr. M. Raja Babu',
    designation: 'HoD',
    department: 'Aditya University',
    accent: '#06b6d4',
    image: '/Team/rajababu.webp',
    initials: 'MR'
  },
  {
    committee: 'Registration & Reception',
    name: 'Mr. R. V. V. N. Bhima Rao',
    designation: 'HoD',
    department: 'Aditya University',
    accent: '#f59e0b',
    image: '',
    initials: 'BR'
  },
  {
    committee: 'Discipline',
    name: 'Dr. Y. K. S. Subba Rao',
    designation: 'Dean - Student Welfare',
    department: 'Aditya University',
    accent: '#8b5cf6',
    image: '/Team/Subbarao.webp',
    initials: 'YS'
  },
  {
    committee: 'Ground Arrangements',
    name: 'Dr. M. V. Rajesh',
    designation: 'Associate Dean - School of Computing',
    department: 'Aditya University',
    accent: '#059669',
    image: '/Team/MV Rajesh.webp',
    initials: 'MR'
  },
  {
    committee: 'Transport',
    name: 'Dr. A. Saravanan',
    designation: 'Dean - R&C',
    department: 'Aditya University',
    accent: '#dc2626',
    image: '/Team/Dr__A_Saravanan.webp',
    initials: 'AS'
  }
];

function TeamMemberCard({ member, className = '', animDelay = 0 }) {
  return (
    <LiquidGlass
      className={`team-glass-card scroll-reveal ${className}`.trim()}
      borderRadius={20}
      enableShader={true}
      style={{ '--member-accent': member.accent, '--anim-delay': `${animDelay}ms` }}
    >
      <div className="team-card-inner">
        <div className="team-avatar-frame">
          {member.image ? (
            <img
              src={member.image}
              alt={member.name}
              className="team-avatar-img"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="team-avatar-fallback"
            style={{ display: member.image ? 'none' : 'flex' }}
          >
            {member.initials}
          </div>
        </div>

        <SplitColorText
          as="h3"
          className="team-member-name"
          screenSync={true}
          leftColor="#0f172a"
          rightColor="#ffffff"
        >
          {member.name}
        </SplitColorText>
        <SplitColorText
          as="span"
          className="team-member-designation"
          screenSync={true}
          leftColor="#0f172a"
          rightColor="#ffffff"
        >
          {member.designation}
        </SplitColorText>
        <SplitColorText
          as="p"
          className="team-member-dept"
          screenSync={true}
          leftColor="#0f172a"
          rightColor="#ffffff"
        >
          {member.department}
        </SplitColorText>

        {member.committee && (
          <div className="team-committee-badge-pill">
            <SplitColorText
              as="span"
              screenSync={true}
              leftColor="#0f172a"
              rightColor="#ffffff"
            >
              {member.committee}
            </SplitColorText>
          </div>
        )}
      </div>
    </LiquidGlass>
  );
}

export default function Teams() {
  useScrollReveal('.scroll-reveal');

  return (
    <SplitBackground as="main" className="teams-page-wrapper">
      {/* Hero Header */}
      <section className="teams-hero">
        <div className="teams-header-row teams-title-row">
          <SplitColorText
            as="h1"
            className="teams-hero-title"
            splitPercent={50}
            leftColor="#0f172a"
            rightColor="#ffffff"
          >
            Organizing Team
          </SplitColorText>
        </div>
      </section>

      {/* Cards Section */}
      <section className="teams-grid-section">
        <div className="container">
          <div className="teams-featured-row">
            <TeamMemberCard member={featuredLeader} className="team-featured-card" animDelay={0} />
          </div>
          <div className="teams-cards-grid">
            {organizingTeam.map((member, idx) => (
              <TeamMemberCard key={idx} member={member} animDelay={idx * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* Event Committee Section */}
      <section className="teams-committees-section teams-event-section">
        <div className="container">
          <div className="teams-section-heading-row">
            <SplitColorText
              as="h2"
              className="teams-section-title"
              splitPercent={50}
              leftColor="#0f172a"
              rightColor="#ffffff"
            >
              Event Committee
            </SplitColorText>
          </div>
          <div className="event-committees-grid">
            {eventCommittees.map((member, idx) => (
              <TeamMemberCard key={idx} member={member} animDelay={idx * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* Functional Committee Section */}
      <section className="teams-committees-section teams-functional-section">
        <div className="container">
          <div className="teams-section-heading-row">
            <SplitColorText
              as="h2"
              className="teams-section-title"
              splitPercent={50}
              leftColor="#0f172a"
              rightColor="#ffffff"
            >
              Functional Committee
            </SplitColorText>
          </div>
          <div className="functional-committees-grid">
            {functionalCommittees.map((member, idx) => (
              <TeamMemberCard key={idx} member={member} animDelay={idx * 80} />
            ))}
          </div>
        </div>
      </section>
    </SplitBackground>
  );
}

