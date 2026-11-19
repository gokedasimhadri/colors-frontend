import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Events from './pages/Events/Events';
import Invitation from './pages/Invitation/Invitation';
import Teams from './pages/Teams';
import Sponsors from './pages/Sponsors/Sponsors';
import Contact from './pages/Contact/Contact';
import Live from './pages/Live/Live';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard';
import MouseAnimation from './components/ThemeComponents/MouseAnimation/MouseAnimation';
import ColourBlast from './components/ThemeComponents/ColourBlast/ColourBlast';
import DualCornerRibbonBlast from './components/ThemeComponents/DualCornerRibbonBlast/DualCornerRibbonBlast';

import Footer from './components/Footer/Footer';
import MobileBottomBar from './components/MobileBottomBar/MobileBottomBar';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname === '/live') {
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

function SchedulePdfRedirect() {
  useEffect(() => {
    window.location.replace('/Schedule_of_Events.pdf');
  }, []);

  return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
      <p style={{ fontSize: '1rem', color: '#334155', fontWeight: 600 }}>
        Opening Schedule of Events PDF...{' '}
        <a href="/Schedule_of_Events.pdf" style={{ color: '#be9337', textDecoration: 'underline' }}>
          Click here if it does not open automatically
        </a>
        .
      </p>
    </main>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        {/* Colorful powder blast animations: page load & user clicks */}
        <MouseAnimation autoPlay={true} />
        <ColourBlast enabled={true} duration={1250} />
        {/* Realistic Dual-Corner Diagonal Color Ribbon Blast */}
        <DualCornerRibbonBlast autoPlay={true} delay={250} />
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventCategory" element={<Events />} />
          <Route path="/events/:eventCategory/:eventName" element={<Events />} />
          <Route path="/events/:eventCategory/:eventSubCategory/:eventName" element={<Events />} />
          <Route path="/invitation" element={<Invitation />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/team" element={<Teams />} />
          <Route path="/live" element={<Live />} />
          <Route path="/events-schedule" element={<SchedulePdfRedirect />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/account" element={<StudentDashboard />} />
        </Routes>
        <Footer />
        <MobileBottomBar />
      </div>
    </Router>
  );
}

export default App;
