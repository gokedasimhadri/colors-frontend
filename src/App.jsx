import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Events from './pages/Events/Events';
import Invitation from './pages/Invitation/Invitation';
import Sponsors from './pages/Sponsors/Sponsors';
import Contact from './pages/Contact/Contact';
import StudentDashboard from './pages/StudentDashboard/StudentDashboard';

import Footer from './components/Footer/Footer';

function SchedulePdfRedirect() {
  useEffect(() => {
    window.location.replace('/Schedule_of_Events.pdf');
  }, []);

  return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '6rem' }}>
      <p style={{ fontSize: '1rem', color: '#334155', fontWeight: 600 }}>
        Opening Schedule of Events PDF...{' '}
        <a href="/Schedule_of_Events.pdf" style={{ color: '#b45309', textDecoration: 'underline' }}>
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
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventCategory/:eventSubCategory" element={<Events />} />
          <Route path="/events/:eventCategory/:eventSubCategory/:eventName" element={<Events />} />
          <Route path="/invitation" element={<Invitation />} />
          <Route path="/events-schedule" element={<SchedulePdfRedirect />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/account" element={<StudentDashboard />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
