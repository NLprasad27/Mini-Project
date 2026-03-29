import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Activity, ArrowRight, ShieldPlus, CheckCircle2, Sparkles, Stethoscope, UserSquare2, Clock, ChevronRight, Star, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL, specialties, useDoctors, DoctorCard } from '../components.jsx';

// ── Real-time date helpers ────────────────────────────────────────────────────
// Returns next N weekdays starting from today (IST-aware)
const getNextDays = (count = 7) => {
    const days = [];
    const DAY_NAMES = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // Use real local time (IST: UTC+5:30)
    const now = new Date();
    const d   = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // midnight local

    for (let i = 0; i < count; i++) {
        const target = new Date(d);
        target.setDate(d.getDate() + i);
        const dayName  = DAY_NAMES[target.getDay()];
        const date     = target.getDate();
        const month    = MONTH_NAMES[target.getMonth()];
        const year     = target.getFullYear();
        // Slot key stored in DB: "26_Mar_2026"
        const slotKey  = `${date}_${month}_${year}`;
        // Display label
        const label    = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : dayName;
        days.push({ dayName, date, month, year, slotKey, label });
    }
    return days;
};

const ALL_TIMES = [
    '09:00 am','09:30 am','10:00 am','10:30 am',
    '11:00 am','11:30 am','02:00 pm','02:30 pm',
    '03:00 pm','03:30 pm','04:00 pm','04:30 pm',
];

// ── Home ──────────────────────────────────────────────────────────────────────
export const Home = () => {
    const navigate = useNavigate();
    const { doctors, loading } = useDoctors();

    return (
        <div className="page-wrapper">
            <div className="container animate-slide-up">
                {/* Hero */}
                <section className="hero-banner">
                    <div className="hero-content">
                        <h1>Book Appointment<br /><span>With Trusted Doctors</span></h1>
                        <div className="hero-avatars">
                            <div className="hero-avatars-stack">
                                {[1,2,3].map(i => <img key={i} src={`https://avatar.iran.liara.run/public/${i}`} alt="" />)}
                            </div>
                            <p className="hero-avatars-text">Trusted by 10,000+ patients worldwide</p>
                        </div>
                        <div className="hero-chips">
                            <span className="chip"><span className="chip-dot" /> {doctors.length || '150'}+ Doctors</span>
                            <span className="chip"><span className="chip-dot" /> Verified Profiles</span>
                            <span className="chip"><span className="chip-dot" /> 24/7 Support</span>
                        </div>
                        <button className="btn btn-white" style={{ marginTop: 36 }} onClick={() => navigate('/doctors')}>
                            Book appointment <ArrowRight size={18} />
                        </button>
                    </div>
                    <div className="hero-image">
                        <img src="/images/hero.png"
                            alt="Doctors" style={{ maxHeight: 400, objectFit: 'contain' }} />
                    </div>
                </section>

                {/* Specialties */}
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

                {/* Top Doctors */}
                <section style={{ marginBottom: 80 }}>
                    <div className="section-header">
                        <span className="section-label">Top Picks</span>
                        <h2 className="section-title">Top Doctors to Book</h2>
                        <p className="section-subtitle">Our most-reviewed, highest-rated professionals.</p>
                    </div>
                    {loading ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>Loading doctors…</p>
                    ) : doctors.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                            <Stethoscope size={48} style={{ margin: '0 auto 16px', opacity: .3 }} />
                            <p>No doctors found. Ask admin to add doctors or approve applications.</p>
                        </div>
                    ) : (
                        <div className="doctor-grid">{doctors.slice(0, 10).map(doc => <DoctorCard key={doc._id} doctor={doc} />)}</div>
                    )}
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <button className="btn btn-outline" style={{ padding: '12px 48px' }} onClick={() => navigate('/doctors')}>
                            View all doctors <ChevronRight size={16} />
                        </button>
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="banner-sm">
                    <div>
                        <h2>Book Appointment<br />With Trusted Doctors</h2>
                        <button className="btn btn-white" style={{ fontWeight: 700 }} onClick={() => navigate('/login')}>
                            Create account
                        </button>
                    </div>
                    <img src="/images/hero.png"
                        alt="" style={{ height: 300, objectFit: 'contain' }} onError={e => e.target.style.display='none'} />
                </section>
            </div>
        </div>
    );
};

// ── All Doctors ───────────────────────────────────────────────────────────────
export const Doctors = () => {
    const navigate = useNavigate();
    const { doctors, loading } = useDoctors();
    const params = new URLSearchParams(window.location.search);
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

// ── Appointment Booking ───────────────────────────────────────────────────────
export const Appointment = ({ user }) => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor]       = useState(null);
    const [docLoading, setDocLoading] = useState(true);
    const [dayIndex, setDayIndex]   = useState(0);
    const [activeTime, setActiveTime] = useState('');
    const [loading, setLoading]     = useState(false);
    const [success, setSuccess]     = useState('');
    const [error, setError]         = useState('');

    const days = getNextDays(7);

    // Fetch doctor profile (includes slots_booked)
    useEffect(() => {
        setDocLoading(true);
        axios.get(`${API_URL}/doctor/profile/${id}`)
            .then(r => { if (r.data.success) setDoctor(r.data.doctor); })
            .catch(() => {})
            .finally(() => setDocLoading(false));
    }, [id]);

    // Reset time when day changes
    useEffect(() => { setActiveTime(''); }, [dayIndex]);

    // Determine booked slots for the selected day
    const selectedSlotKey = days[dayIndex]?.slotKey || '';
    const bookedTimes = (doctor?.slots_booked?.[selectedSlotKey]) || [];

    // Filter out past times if today is selected
    const getAvailableTimes = () => {
        return ALL_TIMES.map(t => {
            const isBooked = bookedTimes.includes(t);
            // If today, hide past slots
            let isPast = false;
            if (dayIndex === 0) {
                const now = new Date();
                const [timePart, meridiem] = t.split(' ');
                let [h, m] = timePart.split(':').map(Number);
                if (meridiem === 'pm' && h !== 12) h += 12;
                if (meridiem === 'am' && h === 12) h = 0;
                isPast = now.getHours() > h || (now.getHours() === h && now.getMinutes() >= m);
            }
            return { time: t, disabled: isBooked || isPast, booked: isBooked };
        });
    };

    const handleBook = async () => {
        if (!user)             { navigate('/login'); return; }
        if (user.role !== 'user') {
            setError('Only patients can book appointments. Please log in as a patient.');
            return;
        }
        if (!activeTime) { setError('Please select a time slot.'); return; }
        setError(''); setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/user/book-appointment`, {
                userId: user._id, docId: id,
                slotDate: selectedSlotKey,
                slotTime: activeTime
            });
            if (res.data.success) {
                setSuccess(`Appointment confirmed for ${days[dayIndex].label}, ${days[dayIndex].date} ${days[dayIndex].month} at ${activeTime}`);
                // Update local slots_booked so UI refreshes immediately
                setDoctor(prev => ({
                    ...prev,
                    slots_booked: {
                        ...prev.slots_booked,
                        [selectedSlotKey]: [...(prev.slots_booked?.[selectedSlotKey] || []), activeTime]
                    }
                }));
            } else {
                setError(res.data.message || 'Booking failed.');
            }
        } catch (err) {
            setError('Server error. Please try again.');
        } finally { setLoading(false); }
    };

    if (docLoading) return (
        <div className="page-wrapper">
            <div className="container" style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>Loading doctor…</div>
        </div>
    );

    if (!doctor) return (
        <div className="page-wrapper">
            <div className="container" style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                <Stethoscope size={48} style={{ margin: '0 auto 16px', opacity: .3 }} />
                <p>Doctor not found.</p>
                <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/doctors')}>Browse Doctors</button>
            </div>
        </div>
    );

    const timeSlots = getAvailableTimes();

    return (
        <div className="page-wrapper">
            <div className="container animate-slide-up">

                {/* Doctor Profile Card */}
                <div className="profile-card">
                    <div className="profile-img">
                        <img src={doctor.image} alt={doctor.name}
                            onError={e => e.target.src = 'https://avatar.iran.liara.run/public/job/doctor/male'} />
                    </div>
                    <div className="profile-details">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <h1 className="profile-name">
                                {doctor.name}
                                <CheckCircle2 size={26} fill="#4f46e5" color="white" />
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Star size={16} fill="#f59e0b" color="#f59e0b" />
                                <span style={{ fontWeight: 700, color: '#92400e' }}>4.8</span>
                            </div>
                        </div>
                        <div className="profile-degree">
                            {doctor.degree} · {doctor.speciality}
                            <span className="exp-badge">{doctor.experience}</span>
                        </div>
                        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid var(--border-light)' }} />
                        <h3 className="about-title"><Activity size={16} /> About</h3>
                        <p className="about-text">{doctor.about}</p>
                        {doctor.address?.line1 && (
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
                                📍 {doctor.address.line1}{doctor.address.line2 ? `, ${doctor.address.line2}` : ''}
                            </p>
                        )}
                        <div className="fee" style={{ marginTop: 24 }}>
                            Consultation fee: <span>₹{doctor.fees}</span>
                        </div>
                        {!doctor.available && (
                            <div style={{ marginTop: 12, background: '#fef9c3', border:'1.5px solid #fde68a', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 13, color: '#92400e', display:'flex', gap:8 }}>
                                <AlertCircle size={16} /> This doctor has marked themselves as currently unavailable.
                            </div>
                        )}
                    </div>
                </div>

                {/* Booking Panel */}
                <div className="booking-panel">
                    <div className="booking-panel-title">📅 Select a Booking Slot</div>

                    {success ? (
                        <div className="alert-success" style={{ justifyContent: 'center', marginBottom: 0 }}>
                            <CheckCircle2 size={20} color="#16a34a" /> {success}
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#dc2626', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 24, fontSize: 14, display:'flex', gap: 8, alignItems:'center' }}>
                                    <AlertCircle size={16} /> {error}
                                </div>
                            )}

                            {/* Day selector — real dates */}
                            <div className="days-row">
                                {days.map((d, i) => (
                                    <button key={i} className={`day-btn ${dayIndex === i ? 'active' : ''}`} onClick={() => setDayIndex(i)}>
                                        {d.label}
                                        <span>{d.date}</span>
                                        <span style={{ fontSize: 10, opacity: .75 }}>{d.month}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Time slots — booked shown grayed out */}
                            <div className="times-row">
                                {timeSlots.map(({ time, disabled, booked }) => (
                                    <button
                                        key={time}
                                        disabled={disabled}
                                        className={`time-btn ${activeTime === time ? 'active' : ''} ${disabled ? 'booked' : ''}`}
                                        style={disabled ? { opacity: .4, cursor: 'not-allowed', textDecoration: booked ? 'line-through' : 'none' } : {}}
                                        onClick={() => !disabled && setActiveTime(time)}
                                        title={booked ? 'Already booked' : disabled ? 'Past time' : 'Available'}
                                    >
                                        <Clock size={12} style={{ marginRight: 4 }} /> {time}
                                        {booked && <span style={{ fontSize: 10, marginLeft: 4 }}>✗</span>}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                                    <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                                        <span style={{ width:12,height:12,background:'var(--primary)',borderRadius:3,display:'inline-block' }} /> Available
                                    </span>
                                    <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                                        <span style={{ width:12,height:12,background:'#e2e8f0',borderRadius:3,display:'inline-block', opacity:.5 }} /> Booked/Past
                                    </span>
                                </div>
                                <button className="btn btn-primary" style={{ padding: '14px 48px', fontSize: 15 }}
                                    onClick={handleBook} disabled={loading || !doctor.available}>
                                    {loading ? 'Booking…' : !user ? 'Login to Book' : user.role !== 'user' ? 'Patients Only' : 'Book Appointment'}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Related Doctors */}
                <RelatedDoctors currentId={id} speciality={doctor.speciality} />
            </div>
        </div>
    );
};

// ── Related Doctors subcomponent ──────────────────────────────────────────────
const RelatedDoctors = ({ currentId, speciality }) => {
    const { doctors } = useDoctors();
    const related = doctors.filter(d => d.speciality === speciality && d._id !== currentId).slice(0, 5);
    if (related.length === 0) return null;
    return (
        <div style={{ marginTop: 80, textAlign: 'center' }}>
            <div className="section-header">
                <span className="section-label">Same Speciality</span>
                <h2 className="section-title">Related Doctors</h2>
            </div>
            <div className="doctor-grid">{related.map(doc => <DoctorCard key={doc._id} doctor={doc} />)}</div>
        </div>
    );
};
