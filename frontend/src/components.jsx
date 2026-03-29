import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ShieldPlus, Activity, ArrowRight, UserSquare2, Sparkles, CheckCircle2, Mail, MapPin, Upload, Calendar, LogOut, Users, Stethoscope, ClipboardList, ChevronRight, Clock, Star } from 'lucide-react';

export const API_URL = 'http://localhost:4000/api';

export const specialties = [
    { name: 'General Physician', icon: <UserSquare2 size={28} /> },
    { name: 'Gynecologist', icon: <Sparkles size={28} /> },
    { name: 'Dermatologist', icon: <Activity size={28} /> },
    { name: 'Pediatricians', icon: <ShieldPlus size={28} /> },
    { name: 'Neurologist', icon: <CheckCircle2 size={28} /> },
    { name: 'Gastroenterologist', icon: <Stethoscope size={28} /> },
];

// ── useDoctors hook: always fetches from DB, falls back to [] ──────────────
export const useDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API_URL}/doctor/list`)
            .then(r => r.data.success && setDoctors(r.data.doctors))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    return { doctors, loading, setDoctors };
};

// ── DoctorCard ────────────────────────────────────────────────────────────────
export const DoctorCard = ({ doctor }) => {
    const navigate = useNavigate();
    return (
        <div className="doctor-card" onClick={() => navigate(`/appointment/${doctor._id}`)}>
            <div className="doctor-bg">
                <img src={doctor.image} alt={doctor.name} onError={e => e.target.src = 'https://avatar.iran.liara.run/public/job/doctor/male'} />
            </div>
            <div className="doctor-info">
                <div className="badge-available">{doctor.available ? 'Available' : 'Unavailable'}</div>
                <div className="doctor-name">{doctor.name}</div>
                <div className="doctor-spec">{doctor.speciality}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <Star size={13} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>4.8</span>
                    <span style={{ fontSize: 12, color: 'var(--text-faint)', marginLeft: 4 }}>· ₹{doctor.fees} fee</span>
                </div>
            </div>
        </div>
    );
};

// ── Navbar ────────────────────────────────────────────────────────────────────
export const Navbar = ({ user, setUser }) => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const h = e => { if (!e.target.closest('.user-pill-wrap')) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const logout = () => { localStorage.removeItem('token'); setUser(null); setOpen(false); navigate('/'); };

    return (
        <nav className="navbar">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 28px' }}>
                <Link to="/" className="nav-brand"><ShieldPlus size={28} /> Prescripto</Link>
                <div className="nav-links">
                    {[['/', 'Home'], ['/doctors', 'All Doctors'], ['/about', 'About'], ['/contact', 'Contact']].map(([path, label]) => (
                        <Link key={path} to={path} className={pathname === path || (path !== '/' && pathname.startsWith(path)) ? 'active' : ''}>{label}</Link>
                    ))}
                </div>
                {user ? (
                    <div className="user-pill-wrap" style={{ position: 'relative' }}>
                        <div className="user-pill" onClick={() => setOpen(o => !o)}>
                            <div className="user-pill-avatar">
                                {user.image ? <img src={user.image} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.name.charAt(0)}
                            </div>
                            <div><div className="user-pill-name">{user.name}</div><div className="user-pill-role">{user.role}</div></div>
                        </div>
                        {open && (
                            <div className="dropdown-menu">
                                {user.role === 'user' && <><Link to="/my-profile" className="dropdown-item" onClick={() => setOpen(false)}><UserSquare2 size={16} /> My Profile</Link><Link to="/my-appointments" className="dropdown-item" onClick={() => setOpen(false)}><Calendar size={16} /> My Appointments</Link></>}
                                {user.role === 'admin' && <><Link to="/admin" className="dropdown-item" onClick={() => setOpen(false)}><Activity size={16} /> Dashboard</Link><Link to="/admin/add-doctor" className="dropdown-item" onClick={() => setOpen(false)}><ShieldPlus size={16} /> Add Doctor</Link></>}
                                {user.role === 'doctor' && <><Link to="/doctor-dashboard" className="dropdown-item" onClick={() => setOpen(false)}><Stethoscope size={16} /> My Dashboard</Link></>}
                                <div className="dropdown-divider" />
                                <div className="dropdown-item danger" onClick={logout}><LogOut size={16} /> Sign out</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button className="btn btn-primary" style={{ padding: '10px 24px', fontSize: 14 }} onClick={() => navigate('/login')}>Create account</button>
                )}
            </div>
        </nav>
    );
};

// ── Footer ────────────────────────────────────────────────────────────────────
export const Footer = () => (
    <footer className="footer">
        <div className="container">
            <div className="footer-grid">
                <div>
                    <div className="footer-logo"><ShieldPlus size={26} /> Prescripto</div>
                    <p className="footer-text">Our online appointment platform makes it simple and secure to find the perfect professional and book your slots effortlessly.</p>
                </div>
                <div>
                    <h4 className="footer-title">Company</h4>
                    <div className="footer-links">
                        {[['/', 'Home'], ['/about', 'About us'], ['/contact', 'Contact us']].map(([p, l]) => <Link key={p} to={p}>{l}</Link>)}
                    </div>
                </div>
                <div>
                    <h4 className="footer-title">Get in touch</h4>
                    <div className="footer-links">
                        <a href="mailto:support@prescripto.com" className="flex items-center gap-2"><Mail size={14} /> support@prescripto.com</a>
                        <a href="tel:12124567890" className="flex items-center gap-2"><ChevronRight size={14} /> +1-212-456-7890</a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom">Copyright © 2026 Prescripto — All Rights Reserved.</div>
        </div>
    </footer>
);
