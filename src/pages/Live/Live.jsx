import { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import SplitBackground from '../../components/ThemeComponents/backgrounds/SplitBackground';
import SplitColorText from '../../components/ThemeComponents/SplitColor/SplitColorText';
import { LiquidGlass } from '../../components/ThemeComponents/LiquidGlass';
import './Live.css';

export default function Live() {
  const playerRef = useRef(null);

  // Support custom video ID via URL query parameter (e.g. ?v=VIDEO_ID) or default to live feed
  const [streamActive, setStreamActive] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.has('stream') || params.has('v') || params.has('live');
    }
    return false;
  });

  const [customVideoId] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('v') || '';
    }
    return '';
  });

  useEffect(() => {
    // When Live page opens, smooth scroll to the player card so the iframe/card fills the screen
    const scrollToPlayer = () => {
      if (playerRef.current) {
        const navEl = document.querySelector('.navbar');
        const navHeight = navEl ? navEl.offsetHeight : 98;
        const rect = playerRef.current.getBoundingClientRect();
        const targetY = window.pageYOffset + rect.top - navHeight;
        window.scrollTo({
          top: Math.max(0, targetY),
          behavior: 'smooth'
        });
      }
    };

    const timer = setTimeout(scrollToPlayer, 120);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SplitBackground as="main" className="live-page-wrapper">
      {/* ── Compact Header: Only "Live Streaming" ── */}
      <div className="live-hero-header">
        <div className="live-header-row live-title-row">
          <SplitColorText
            as="h1"
            className="live-hero-title"
            splitPercent={50}
            leftColor="#0f172a"
            rightColor="#ffffff"
          >
            Live Streaming
          </SplitColorText>
        </div>
      </div>

      <div className="container live-container" id="live-player-section" ref={playerRef}>
        {/* ── Main Stream Broadcast Player Card (Fits viewport width & height) ── */}
        <LiquidGlass
          className="live-player-glass-card"
          borderRadius={20}
          enableShader={true}
        >
          <div className="live-video-screen-container">
            {streamActive ? (
              <div className="live-video-screen-ratio">
                <iframe
                  title="Colours 2027 Live Stream"
                  src={
                    customVideoId
                      ? `https://www.youtube.com/embed/${customVideoId}?autoplay=1&mute=0&rel=0`
                      : `https://www.youtube.com/embed?listType=playlist&list=UUxxxxxx&autoplay=1`
                  }
                  className="live-video-iframe"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
                <button
                  type="button"
                  className="live-standby-switch-btn"
                  onClick={() => setStreamActive(false)}
                  title="Return to Broadcast Standby Screen"
                >
                  Back to Standby
                </button>
              </div>
            ) : (
              /* ── Broadcast Standby Display ── */
              <div className="live-standby-screen">
                <div className="live-standby-ambient-glow" />

                <div className="live-standby-top-bar">
                  <span className="live-standby-status-pill">
                    <span className="live-standby-beacon" />
                    <span>BROADCAST STANDBY</span>
                  </span>
                  <span className="live-standby-dates">JAN 7 – 9, 2027</span>
                </div>

                <div className="live-standby-center">
                  <div className="live-standby-crest-wrap">
                    <img
                      src="/aus-logo.svg"
                      alt="Aditya University"
                      className="live-standby-logo"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>

                  <h2 className="live-standby-fest-title">COLOURS 2027</h2>
                  <p className="live-standby-fest-sub">
                    Official live stream will broadcast directly from Aditya University, Surampalem campus
                  </p>

                  <div className="live-standby-cta-row">
                    <button
                      type="button"
                      className="live-standby-feed-btn"
                      onClick={() => setStreamActive(true)}
                    >
                      <Play size={14} />
                      <span>Connect Live Feed</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </LiquidGlass>
      </div>
    </SplitBackground>
  );
}
