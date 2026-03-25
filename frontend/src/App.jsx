import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar, Footer } from './components.jsx';
import { Home, Doctors, Appointment } from './pages/PublicPages.jsx';
import { Login, ApplyDoctor, MyProfile, MyAppointments, AdminDashboard, DoctorDashboard, InfoPage } from './pages/PrivatePages.jsx';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('token');
      if (stored) setUser(JSON.parse(stored));
    } catch { localStorage.removeItem('token'); }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Navbar user={user} setUser={setUser} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/appointment/:id" element={<Appointment user={user} />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/apply-doctor" element={<ApplyDoctor user={user} />} />
        <Route path="/about" element={<InfoPage title="About Us" />} />
        <Route path="/contact" element={<InfoPage title="Contact Us" />} />

        {/* Patient */}
        <Route path="/my-profile" element={user?.role === 'user' ? <MyProfile user={user} setUser={setUser} /> : <Login setUser={setUser} />} />
        <Route path="/my-appointments" element={user?.role === 'user' ? <MyAppointments user={user} /> : <Login setUser={setUser} />} />

        {/* Admin */}
        <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Login setUser={setUser} />} />
        <Route path="/admin/add-doctor" element={user?.role === 'admin' ? <AdminDashboard /> : <Login setUser={setUser} />} />
        <Route path="/admin/applications" element={user?.role === 'admin' ? <AdminDashboard /> : <Login setUser={setUser} />} />

        {/* Doctor */}
        <Route path="/doctor-dashboard" element={user?.role === 'doctor' ? <DoctorDashboard user={user} /> : <Login setUser={setUser} />} />

        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </Router>
  );
}
