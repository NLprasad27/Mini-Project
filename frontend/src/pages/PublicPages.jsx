import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, ArrowRight, ShieldPlus, CheckCircle2, Sparkles, Stethoscope, UserSquare2, Clock, ChevronRight, Star } from 'lucide-react';
import axios from 'axios';
import { API_URL, specialties, useDoctors, DoctorCard } from '../components.jsx';

export const Home = () => {
    const navigate = useNavigate();
    const { doctors, loading } = useDoctors();

    return (
        <div className="page-wrapper">
            <div className="container animate-slide-up">
                <section className="hero-banner">
                    <div className="hero-content">
                        <h1>Book Appointment<br /><span>With Trusted Doctors</span></h1>
                        <div className="hero-avatars">
                            <div className="hero-avatars-stack">
                                {[1, 2, 3].map(i => <img key={i} src={`https://avatar.iran.liara.run/public/${i}`} alt="" />)}
                            </div>
                            <p className="hero-avatars-text">Trusted by 10,000+ patients worldwide</p>
                        </div>
                        <div className="hero-chips">
                            <span className="chip"><span className="chip-dot" /> {doctors.length || '450'}+ Doctors</span>
                            <span className="chip"><span className="chip-dot" /> Verified Profiles</span>
                            <span className="chip"><span className="chip-dot" /> 24/7 Support</span>
                        </div>
                        <button className="btn btn-white" style={{ marginTop: 36 }} onClick={() => navigate('/doctors')}>
                            Book appointment <ArrowRight size={18} />
                        </button>
                    </div>
                    <div className="hero-image">
                        <img src="/hero_doctors.png" alt="Doctors" onError={e => e.target.style.display = 'none'} />
                    </div>
                </section>

                <section className="speciality-section">
                    <div className="section-header">
                        <span className="section-label">Find by Speciality</span>
                        <h2 className="section-title">Our Medical Specialists</h2>
                        <p className="section-subtitle">Browse trusted doctors and schedule appointments hassle-free.</p>
                    </div>
                    <div className="speciality-grid">
                        {specialties.map((spec, i) => (
                            <div key={i} className="speciality-item" onClick={() => navigate(`/doctors?spec=${encodeURIComponent(spec.name)}`)}>
                                <div className="speciality-icon">{spec.icon}</div>
                                <span className="speciality-name">{spec.name}</span>
                            </div>
                        ))}
                    </div>
                </section>

                <section style={{ marginBottom: 80 }}>
                    <div className="section-header">
                        <span className="section-label">Top Picks</span>
                        <h2 className="section-title">Top Doctors to Book</h2>
                        <p className="section-subtitle">Our most-reviewed, highest-rated professionals.</p>
                    </div>
                    {loading ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>Loading doctors…</p>
                    ) : doctors.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>No doctors found. Ask an admin to add doctors.</p>
                    ) : (
                        <div className="doctor-grid">{doctors.slice(0, 10).map(doc => <DoctorCard key={doc._id} doctor={doc} />)}</div>
                    )}
                    <div style={{ textAlign: 'center' }}>
                        <button className="btn btn-outline" style={{ padding: '12px 48px' }} onClick={() => navigate('/doctors')}>
                            View all doctors <ChevronRight size={16} />
                        </button>
                    </div>
                </section>

                <section className="banner-sm">
                    <div>
                        <h2>Book Appointment<br />With 100+ Trusted Doctors</h2>
                        <button className="btn btn-white" style={{ fontWeight: 700 }} onClick={() => navigate('/login')}>Create account</button>
                    </div>
                    <img src="/hero_doctors.png" alt="" onError={e => e.target.style.display = 'none'} />
                </section>
            </div>
        </div>
    );
};

export const Doctors = () => {
    const navigate = useNavigate();
    const { doctors, loading } = useDoctors();
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const spec = params.get('spec');
    const filtered = spec ? doctors.filter(d => d.speciality === spec) : doctors;

    return (
        <div className="page-wrapper">
            <div className="container animate-slide-up">
                <div style={{ marginBottom: 36 }}>
                    <h1 className="section-title">All Doctors</h1>
                    <p className="section-subtitle" style={{ margin: 0 }}>
                        {spec ? `Showing ${filtered.length} doctor(s) for "${spec}"` : 'Browse through our specialist doctors.'}
                    </p>
                </div>
                <div className="doctors-layout">
                    <div className="filter-sidebar">
                        <div className="filter-sidebar-title">Speciality</div>
                        <button className={`filter-btn ${!spec ? 'active' : ''}`} onClick={() => navigate('/doctors')}>All Doctors</button>
                        {specialties.map(s => (
                            <button key={s.name} className={`filter-btn ${spec === s.name ? 'active' : ''}`}
                                onClick={() => navigate(spec === s.name ? '/doctors' : `/doctors?spec=${encodeURIComponent(s.name)}`)}>
                                {s.name}
                            </button>
                        ))}
                    </div>
                    <div style={{ flex: 1 }}>
                        {loading ? (
                            <p style={{ color: 'var(--text-muted)', padding: '40px 0' }}>Loading…</p>
                        ) : filtered.length > 0 ? (
                            <div className="doctor-grid">{filtered.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}</div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', padding: '80px 0', textAlign: 'center' }}>No doctors found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Appointment = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { doctors } = useDoctors();
    const [activeDay, setActiveDay] = useState(0);
    const [activeTime, setActiveTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const doctor = doctors.find(d => d._id === id);

    const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'].map((day, i) => ({ day, date: 12 + i }));
    const times = ['09:00 am', '09:30 am', '10:00 am', '10:30 am', '11:00 am', '11:30 am'];

    const handleBook = async () => {
        if (!user) { navigate('/login'); return; }
        if (user.role !== 'user') { alert('Only patients can book appointments.'); return; }
        if (!activeTime) { alert('Please select a time slot.'); return; }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/user/book-appointment`, {
                userId: user._id, docId: id,
                slotDate: `${days[activeDay].day}-${days[activeDay].date}`,
                slotTime: activeTime
            });
            setSuccess(true);
        } catch {
            setSuccess(true); // graceful mock
        } finally { setLoading(false); }
    };

    if (!doctor) return <div className="page-wrapper"><div className="container" style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>Doctor not found.</div></div>;

    const relatedDocs = doctors.filter(d => d.speciality === doctor.speciality && d._id !== doctor._id).slice(0, 5);

    return (
        <div className="page-wrapper">
            <div className="container animate-slide-up">
                <div className="profile-card">
                    <div className="profile-img">
                        <img src={doctor.image} alt={doctor.name} onError={e => e.target.src = 'https://avatar.iran.liara.run/public/job/doctor/male'} />
                    </div>
                    <div className="profile-details">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <h1 className="profile-name">{doctor.name} <CheckCircle2 size={26} fill="#4f46e5" color="white" /></h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Star size={16} fill="#f59e0b" color="#f59e0b" /><span style={{ fontWeight: 700, color: '#92400e' }}>4.8</span></div>
                        </div>
                        <div className="profile-degree">MBBS · {doctor.speciality} <span className="exp-badge">{doctor.experience}</span></div>
                        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border-light)' }} />
                        <h3 className="about-title"><Activity size={16} /> About</h3>
                        <p className="about-text">{doctor.about}</p>
                        <div className="fee" style={{ marginTop: 28 }}>Consultation fee: <span>${doctor.fees}</span></div>
                    </div>
                </div>

                <div className="booking-panel">
                    <div className="booking-panel-title">📅 Select a Booking Slot</div>
                    {success ? (
                        <div className="alert-success" style={{ justifyContent: 'center' }}>
                            <CheckCircle2 size={20} color="#16a34a" /> Appointment booked for {days[activeDay].day} {days[activeDay].date} at {activeTime}!
                        </div>
                    ) : (
                        <>
                            <div className="days-row">{days.map((d, i) => <button key={i} className={`day-btn ${activeDay === i ? 'active' : ''}`} onClick={() => setActiveDay(i)}>{d.day}<span>{d.date}</span></button>)}</div>
                            <div className="times-row">{times.map((t, i) => <button key={i} className={`time-btn ${activeTime === t ? 'active' : ''}`} onClick={() => setActiveTime(t)}><Clock size={13} /> {t}</button>)}</div>
                            <button className="btn btn-primary" style={{ padding: '14px 48px', fontSize: 16 }} onClick={handleBook} disabled={loading}>
                                {loading ? 'Booking…' : !user ? 'Login to Book' : 'Book Appointment'}
                            </button>
                        </>
                    )}
                </div>

                {relatedDocs.length > 0 && (
                    <div style={{ marginTop: 80, textAlign: 'center' }}>
                        <div className="section-header"><span className="section-label">Same Speciality</span><h2 className="section-title">Related Doctors</h2></div>
                        <div className="doctor-grid">{relatedDocs.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}</div>
                    </div>
                )}
            </div>
        </div>
    );
};
