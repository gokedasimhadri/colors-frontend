import { useEffect, useRef } from 'react';
import SplitBackground from '../../components/ThemeComponents/backgrounds/SplitBackground';
import SplitColorText from '../../components/ThemeComponents/SplitColor/SplitColorText';
import { LiquidGlass } from '../../components/ThemeComponents/LiquidGlass';
import './Live.css';

export default function Live() {
  const playerRef = useRef(null);

  // Support custom video ID via URL query parameter (e.g. ?v=VIDEO_ID) or default to live feed
  const customVideoId =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('v') || ''
      : '';

  const iframeSrc = customVideoId
    ? `https://www.youtube.com/embed/${customVideoId}?autoplay=1&mute=0&rel=0`
    : 'https://www.youtube.com/embed/live_stream?channel=adityauniversity&autoplay=1&mute=0';

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
            <div className="live-video-screen-ratio">
              <iframe
                title="Colours 2027 Live Stream"
                src={iframeSrc}
                className="live-video-iframe"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </LiquidGlass>
      </div>
    </SplitBackground>
  );
}
