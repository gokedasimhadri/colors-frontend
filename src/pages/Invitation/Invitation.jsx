import { EVENT_CONFIG } from '../../utils/eventDate';
import SplitBackground from '../../components/ThemeComponents/backgrounds/SplitBackground';
import SplitColorText from '../../components/ThemeComponents/SplitColor/SplitColorText';
import { LiquidGlass } from '../../components/ThemeComponents/LiquidGlass';
import './Invitation.css';

export default function Invitation() {
  const { year } = EVENT_CONFIG;

  return (
    <SplitBackground as="main" className="invitation-page-wrapper">
      <div className="invitation-hero-header">
        <div className="invitation-header-row invitation-title-row">
          <SplitColorText
            as="h1"
            className="invitation-hero-title"
            splitPercent={50}
            leftColor="#0f172a"
            rightColor="#ffffff"
          >
            Invitation
          </SplitColorText>
        </div>
      </div>

      <div className="container invitation-container">
        <LiquidGlass
          className="invitation-glass-card"
          borderRadius={20}
          enableShader={true}
        >
          <div className="invitation-card-grid">
            {/* ── Left Column: Chancellor Photo & Details ── */}
            <div className="invitation-dignitary-col left-col">
              <div className="invitation-photo-frame">
                <img
                  src="/invitation/chancellor-sesha-reddy.webp"
                  alt="Dr. N Sesha Reddy – Chancellor, Aditya University"
                  className="invitation-dignitary-img"
                />
              </div>
              <h3 className="invitation-dignitary-name">Dr. N Sesha Reddy</h3>
              <span className="invitation-dignitary-role">Chancellor</span>
              <span className="invitation-dignitary-inst">Aditya University</span>
            </div>

            {/* ── Center Column: Official Joint Invitation Message ── */}
            <div className="invitation-center-col">
              <div className="invitation-message-content">
                <SplitColorText
                  as="p"
                  className="invitation-joint-paragraph"
                  screenSync={true}
                  leftColor="#1e293b"
                  rightColor="#f8fafc"
                >
                  We are delighted to announce <strong>COLOURS</strong> – Youth Festival, our annual cultural and creative extravaganza, scheduled to take place on 7th, 8th & 9th January, 2027 at Aditya University, Surampalem.
                </SplitColorText>

                <SplitColorText
                  as="p"
                  className="invitation-joint-paragraph"
                  screenSync={true}
                  leftColor="#1e293b"
                  rightColor="#f8fafc"
                >
                  We expect 50,000 young aspirants from various institutes to showcase their skills to foster meaningful connections. COLOURS – Youth Festival will feature a spectrum of exciting activities including – Culturals, Sports, Creo and Fete – exclusive shopping experience where students can shop and hop. It is an excellent opportunity to interact with peers, demonstrate talents and gain enriching experiences.
                </SplitColorText>

                <SplitColorText
                  as="p"
                  className="invitation-joint-paragraph"
                  screenSync={true}
                  leftColor="#1e293b"
                  rightColor="#f8fafc"
                >
                  We cordially invite students across the country to participate and make this event even more special.
                </SplitColorText>

                <p className="invitation-joint-paragraph invitation-tagline">
                  Colours where dreams burst into colours, and every moment is a celebration of youth.
                </p>
              </div>
            </div>

            {/* ── Right Column: Pro-Chancellor Photo & Details ── */}
            <div className="invitation-dignitary-col right-col">
              <div className="invitation-photo-frame">
                <img
                  src="/invitation/pro-chancellor-satish-reddy.webp"
                  alt="Dr. N Satish Reddy – Pro-Chancellor, Aditya University"
                  className="invitation-dignitary-img"
                />
              </div>
              <h3 className="invitation-dignitary-name">Dr. N Satish Reddy</h3>
              <span className="invitation-dignitary-role">Pro-Chancellor</span>
              <span className="invitation-dignitary-inst">Aditya University</span>
            </div>
          </div>
        </LiquidGlass>
      </div>
    </SplitBackground>
  );
}
