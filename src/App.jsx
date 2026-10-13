import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Events from './pages/Events/Events';
import Invitation from './pages/Invitation/Invitation';
import EventsSchedule from './pages/EventsSchedule/EventsSchedule';
import Sponsors from './pages/Sponsors/Sponsors';
import Contact from './pages/Contact/Contact';

import Footer from './components/Footer/Footer';

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
          <Route path="/events-schedule" element={<EventsSchedule />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
