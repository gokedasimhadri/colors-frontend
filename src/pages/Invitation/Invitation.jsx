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
                  alt="Dr. N. Sesha Reddy – Chancellor, Aditya University"
                  className="invitation-dignitary-img"
                />
              </div>
              <h3 className="invitation-dignitary-name">Dr. N. Sesha Reddy</h3>
              <span className="invitation-dignitary-role">Chancellor</span>
              <span className="invitation-dignitary-inst">Aditya University</span>
            </div>

            {/* ── Center Column: Official Joint Invitation Message ── */}
            <div className="invitation-center-col">
              <SplitColorText
                as="p"
                className="invitation-joint-paragraph"
                screenSync={true}
                leftColor="#1e293b"
                rightColor="#f8fafc"
              >
                It gives us immense pleasure and pride to cordially invite talented students, scholars, and dynamic youth delegates from across the nation to Colours {year}, the premier national youth festival of Aditya University. Taking place from January 7 to 9, 2027, at our Surampalem campus, this vibrant arena celebrates creative brilliance, cultural artistry, and athletic mastery across Culturals, Sports, Creo, and Fete with a ₹10,00,000 cash prize pool. We warmly look forward to welcoming you to three unforgettable days of excellence, camaraderie, and celebration.
              </SplitColorText>
            </div>

            {/* ── Right Column: Pro-Chancellor Photo & Details ── */}
            <div className="invitation-dignitary-col right-col">
              <div className="invitation-photo-frame">
                <img
                  src="/invitation/pro-chancellor-satish-reddy.webp"
                  alt="Dr. N. Satish Reddy – Pro-Chancellor, Aditya University"
                  className="invitation-dignitary-img"
                />
              </div>
              <h3 className="invitation-dignitary-name">Dr. N. Satish Reddy</h3>
              <span className="invitation-dignitary-role">Pro-Chancellor</span>
              <span className="invitation-dignitary-inst">Aditya University</span>
            </div>
          </div>
        </LiquidGlass>
      </div>
    </SplitBackground>
  );
}
