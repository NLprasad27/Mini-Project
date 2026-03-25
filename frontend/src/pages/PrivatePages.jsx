import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Upload, Calendar, Clock, ShieldPlus, Users, Activity, Stethoscope, ClipboardList, X, Check, ToggleLeft, ToggleRight, FileText, AlertCircle, MapPin, Mail } from 'lucide-react';
import axios from 'axios';
import { API_URL, specialties, useDoctors } from '../components.jsx';

// ── Login ─────────────────────────────────────────────────────────────────────
export const Login = ({ setUser }) => {
    const [mode, setMode] = useState('Login');     // 'Login' | 'Sign Up'
    const [role, setRole] = useState('user');      // login: user|doctor|admin; signup: only user
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // On signup, always user; on login, three roles
    const loginRoles = ['user', 'doctor', 'admin'];

    const submit = async e => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            if (mode === 'Sign Up') {
                const res = await axios.post(`${API_URL}/user/register`, { name, email, password: pass });
                if (!res.data.success) { setError(res.data.message); setLoading(false); return; }
                const u = { ...res.data.user, role: 'user' };
                setUser(u); localStorage.setItem('token', JSON.stringify(u));
                navigate('/');
            } else {
                const res = await axios.post(`${API_URL}/user/login`, { email, password: pass, role });
                if (!res.data.success) { setError(res.data.message); setLoading(false); return; }
                const u = res.data.user;
                setUser(u); localStorage.setItem('token', JSON.stringify(u));
                if (u.role === 'admin') navigate('/admin');
                else if (u.role === 'doctor') navigate('/doctor-dashboard');
                else navigate('/');
            }
        } catch (err) {
            setError('Unable to connect to server. Please try again.');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-wrapper">
            <form className="auth-card" onSubmit={submit}>
                <h2>{mode === 'Sign Up' ? 'Create Account' : 'Welcome Back'}</h2>
                <p style={{ marginBottom: 24 }}>
                    {mode === 'Sign Up' ? 'Create a patient account to start booking.' : 'Select your portal and sign in.'}
                </p>

                {/* Role selector — only on Login */}
                {mode === 'Login' && (
                    <div className="role-tabs" style={{ marginBottom: 24 }}>
                        {loginRoles.map(r => (
                            <button key={r} type="button" className={`role-tab ${role === r ? 'active' : ''}`} onClick={() => setRole(r)}>
                                {r === 'user' ? '🧑 Patient' : r === 'doctor' ? '🩺 Doctor' : '⚕ Admin'}
                            </button>
                        ))}
                    </div>
                )}

                {error && (
                    <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#dc2626', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 20, fontSize: 14, display: 'flex', gap: 8 }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} /> {error}
                    </div>
                )}

                {mode === 'Sign Up' && (
                    <div className="form-field"><label className="form-label">Full Name</label>
                        <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
                    </div>
                )}
                <div className="form-field"><label className="form-label">Email Address</label>
                    <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <div className="form-field" style={{ marginBottom: 28 }}><label className="form-label">Password</label>
                    <input className="form-input" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
                </div>

                <button className="btn btn-primary w-full" style={{ padding: '14px', fontSize: 15, borderRadius: 12 }} disabled={loading}>
                    {loading ? 'Please wait…' : mode === 'Sign Up' ? 'Create Account' : `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                </button>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
                    {mode === 'Sign Up' ? 'Already have an account? ' : 'New here? '}
                    <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => { setMode(mode === 'Sign Up' ? 'Login' : 'Sign Up'); setError(''); setRole('user'); }}>
                        {mode === 'Sign Up' ? 'Sign in' : 'Create account'}
                    </span>
                </p>

                {mode === 'Login' && role === 'user' && (
                    <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                        Want to practice on this platform?{' '}
                        <span style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/apply-doctor')}>Apply as a Doctor</span>
                    </p>
                )}
            </form>
        </div>
    );
};

// ── Apply as Doctor ───────────────────────────────────────────────────────────
export const ApplyDoctor = ({ user }) => {
    const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: '', speciality: 'General Physician', degree: '', experience: '1 Year', about: '', fees: '', address: '' });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const fileRef = useRef();
    const navigate = useNavigate();

    const submit = async e => {
        e.preventDefault();
        setError(''); setSuccess(''); setLoading(true);
        const fd = new FormData();
        Object.keys(form).forEach(k => fd.append(k, form[k]));
        if (image) fd.append('image', image);
        try {
            const res = await axios.post(`${API_URL}/user/apply-doctor`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) setSuccess(res.data.message);
            else setError(res.data.message);
        } catch { setError('Server error. Please try again.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="page-wrapper">
            <div className="container animate-slide-up" style={{ maxWidth: 720 }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ width: 72, height: 72, background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--primary)' }}>
                        <Stethoscope size={36} />
                    </div>
                    <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--secondary)', letterSpacing: '-.3px', marginBottom: 12 }}>Apply to Join as a Doctor</h1>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.65 }}>
                        Fill out the form below. Our admin team will review your application and create your account once approved. You'll need the account email + assigned password to login.
                    </p>
                </div>

                {success ? (
                    <div style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 'var(--r-xl)', padding: '48px 40px', textAlign: 'center' }}>
                        <CheckCircle2 size={52} color="#16a34a" style={{ margin: '0 auto 16px' }} />
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--secondary)', marginBottom: 12 }}>Application Submitted!</h2>
                        <p style={{ color: 'var(--text-muted)' }}>{success}</p>
                        <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => navigate('/')}>Back to Home</button>
                    </div>
                ) : (
                    <form onSubmit={submit} className="admin-form-card">
                        {error && <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#dc2626', borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 24, fontSize: 14 }}>{error}</div>}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                            <div className="upload-zone" onClick={() => fileRef.current.click()}>
                                {image ? <img src={URL.createObjectURL(image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <><Upload size={24} /><span style={{ fontSize: 12 }}>Your Photo</span></>}
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => setImage(e.target.files[0])} />
                            <div>
                                <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>Profile Photo</div>
                                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Upload a professional photo (optional)</div>
                            </div>
                        </div>

                        <div className="grid-2">
                            {[['Full Name', 'name', 'text'], ['Email Address', 'email', 'email'], ['Phone Number', 'phone', 'tel'], ['Degree / Qualification', 'degree', 'text'], ['Address / Clinic Location', 'address', 'text'], ['Consultation Fee ($)', 'fees', 'number']].map(([label, key, type]) => (
                                <div key={key} className="form-field">
                                    <label className="form-label">{label}</label>
                                    <input className="form-input" type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required />
                                </div>
                            ))}
                            <div className="form-field"><label className="form-label">Speciality</label>
                                <select className="form-input" value={form.speciality} onChange={e => setForm({ ...form, speciality: e.target.value })}>
                                    {specialties.map(s => <option key={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="form-field"><label className="form-label">Years of Experience</label>
                                <select className="form-input" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}>
                                    {['1 Year', '2 Years', '3 Years', '5 Years', '8 Years', '10+ Years'].map(y => <option key={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-field" style={{ marginTop: 4 }}><label className="form-label">About Yourself / Professional Summary</label>
                            <textarea className="form-input" rows={4} style={{ resize: 'vertical' }} value={form.about} onChange={e => setForm({ ...form, about: e.target.value })} required />
                        </div>
                        <button className="btn btn-primary" style={{ marginTop: 24, padding: '14px 40px', fontSize: 15 }} disabled={loading}>
                            {loading ? 'Submitting…' : 'Submit Application'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

// ── My Profile ────────────────────────────────────────────────────────────────
export const MyProfile = ({ user, setUser }) => {
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({ name: user.name, phone: '', address: '', dob: '', gender: 'Male' });
    const [imgFile, setImgFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const fileRef = useRef();
    const navigate = useNavigate();

    const save = async () => {
        setSaving(true);
        const fd = new FormData();
        fd.append('userId', user._id);
        Object.keys(form).forEach(k => fd.append(k, form[k]));
        if (imgFile) fd.append('image', imgFile);
        try {
            const res = await axios.post(`${API_URL}/user/update-profile`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            const newImg = res.data.user?.image || (imgFile ? URL.createObjectURL(imgFile) : user.image);
            setUser({ ...user, ...form, image: newImg });
        } catch { setUser({ ...user, ...form }); }
        setEdit(false); setSaving(false); setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="page-wrapper"><div className="container"><div className="profile-page">
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--secondary)', marginBottom: 8 }}>My Profile</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Manage your personal information.</p>
            {saved && <div className="alert-success"><CheckCircle2 size={18} /> Profile updated!</div>}
            <div className="profile-page-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 36 }}>
                    <div className="profile-avatar-wrap" onClick={() => edit && fileRef.current.click()}>
                        {(imgFile ? URL.createObjectURL(imgFile) : user.image)
                            ? <img src={imgFile ? URL.createObjectURL(imgFile) : user.image} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            : <div className="avatar-placeholder">{user.name.charAt(0)}</div>}
                        {edit && <div className="avatar-overlay"><Upload size={22} /></div>}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => setImgFile(e.target.files[0])} />
                    <div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--secondary)' }}>{form.name}</div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{user.email}</div>
                        {edit && <div style={{ fontSize: 12, color: 'var(--primary)', marginTop: 6, cursor: 'pointer' }} onClick={() => fileRef.current.click()}>Change photo</div>}
                    </div>
                </div>
                <div className="profile-field-row">
                    {[['Full Name', 'name', 'text'], ['Phone', 'phone', 'text'], ['Date of Birth', 'dob', 'date'], ['Address', 'address', 'text']].map(([label, key, type]) => (
                        <div key={key}>
                            <div className="profile-field-label">{label}</div>
                            {edit ? <input type={type} className="form-input" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                                : <div className="profile-field-value">{form[key] || '—'}</div>}
                        </div>
                    ))}
                    <div>
                        <div className="profile-field-label">Gender</div>
                        {edit ? <select className="form-input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}><option>Male</option><option>Female</option><option>Other</option></select>
                            : <div className="profile-field-value">{form.gender}</div>}
                    </div>
                    <div><div className="profile-field-label">Email</div><div className="profile-field-value" style={{ color: 'var(--primary)' }}>{user.email}</div></div>
                </div>
                <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
                    {edit
                        ? <><button className="btn btn-primary" style={{ padding: '12px 32px' }} onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
                            <button className="btn btn-outline" style={{ padding: '12px 32px' }} onClick={() => setEdit(false)}>Cancel</button></>
                        : <button className="btn btn-outline" style={{ padding: '12px 32px' }} onClick={() => setEdit(true)}>Edit profile</button>}
                </div>
            </div>
        </div></div></div>
    );
};

// ── My Appointments ───────────────────────────────────────────────────────────
export const MyAppointments = ({ user }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?._id) return;
        axios.get(`${API_URL}/user/appointments/${user._id}`)
            .then(r => { if (r.data.success) setAppointments(r.data.appointments); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [user]);

    const cancel = async id => {
        if (!window.confirm('Cancel this appointment?')) return;
        const res = await axios.post(`${API_URL}/user/cancel-appointment`, { appointmentId: id }).catch(() => ({ data: { success: false } }));
        if (res.data.success) setAppointments(prev => prev.map(a => a._id === id ? { ...a, cancelled: true } : a));
    };

    return (
        <div className="page-wrapper"><div className="container animate-slide-up">
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--secondary)', marginBottom: 8 }}>My Appointments</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Track and manage your medical appointments.</p>

            {loading ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>Loading…</p>
                : appointments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                        <Calendar size={48} style={{ margin: '0 auto 16px', opacity: .3 }} />
                        <p style={{ marginBottom: 20 }}>No appointments yet.</p>
                        <button className="btn btn-primary" onClick={() => navigate('/doctors')}>Book an appointment</button>
                    </div>
                ) : (
                    <div className="appt-list">
                        {appointments.map((appt, i) => (
                            <div key={i} className="appt-card">
                                <img src={appt.docData?.image || 'https://avatar.iran.liara.run/public/job/doctor/male'} className="appt-doctor-img" alt=""
                                    onError={e => e.target.src = 'https://avatar.iran.liara.run/public/job/doctor/male'} />
                                <div className="appt-info">
                                    <div className="appt-doctor-name">{appt.docData?.name}</div>
                                    <div className="appt-spec">{appt.docData?.speciality}</div>
                                    <div className="appt-time"><Clock size={14} /> {appt.slotDate} · {appt.slotTime}</div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
                                    <span className={`appt-status-badge ${appt.cancelled ? 'cancelled' : appt.isCompleted ? 'confirmed' : 'pending'}`}>
                                        {appt.cancelled ? 'Cancelled' : appt.isCompleted ? 'Completed' : 'Upcoming'}
                                    </span>
                                    {!appt.cancelled && !appt.isCompleted && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {!appt.payment && <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13 }}>Pay Online</button>}
                                            <button className="btn btn-outline" style={{ padding: '8px 20px', fontSize: 13, color: 'var(--danger)', borderColor: '#fca5a5' }} onClick={() => cancel(appt._id)}>Cancel</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div></div>
    );
};

// ── Admin Dashboard ───────────────────────────────────────────────────────────
export const AdminDashboard = () => {
    const isAdd = window.location.pathname.includes('add-doctor');
    const isApps = window.location.pathname.includes('applications');
    const navigate = useNavigate();
    const { doctors, loading: docLoading } = useDoctors();
    const [stats, setStats] = useState({ doctors: 0, appointments: 0, pendingApps: 0 });
    const [applications, setApplications] = useState([]);
    const [appsLoading, setAppsLoading] = useState(false);
    // Add doctor form
    const [form, setForm] = useState({ name: '', email: '', password: 'Doctor@123', speciality: 'General Physician', degree: 'MBBS', experience: '5 Years', about: '', fees: 50, addressLine1: '', addressLine2: '' });
    const [image, setImage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState('');
    const [error, setError] = useState('');
    const fileRef = useRef();

    useEffect(() => {
        axios.get(`${API_URL}/admin/stats`).then(r => r.data.success && setStats(r.data.stats)).catch(() => { });
    }, []);

    useEffect(() => {
        if (!isApps) return;
        setAppsLoading(true);
        axios.get(`${API_URL}/admin/applications`).then(r => r.data.success && setApplications(r.data.applications)).catch(() => { }).finally(() => setAppsLoading(false));
    }, [isApps]);

    const handleAddDoctor = async e => {
        e.preventDefault(); setSaving(true); setError(''); setSaved('');
        const fd = new FormData();
        Object.entries({ name: form.name, email: form.email, password: form.password, speciality: form.speciality, degree: form.degree, experience: form.experience, about: form.about, fees: form.fees }).forEach(([k, v]) => fd.append(k, v));
        fd.append('address', JSON.stringify({ line1: form.addressLine1, line2: form.addressLine2 }));
        if (image) fd.append('image', image);
        try {
            const res = await axios.post(`${API_URL}/admin/add-doctor`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (res.data.success) { setSaved(res.data.message); setForm(f => ({ ...f, name: '', email: '', about: '', addressLine1: '', addressLine2: '' })); setImage(null); }
            else setError(res.data.message);
        } catch { setError('Server error.'); }
        setSaving(false);
    };

    const approve = async (id) => {
        const password = window.prompt('Set a temporary password for this doctor:', 'Doctor@123');
        if (!password) return;
        const res = await axios.post(`${API_URL}/admin/approve-application`, { applicationId: id, password }).catch(() => ({ data: { success: false, message: 'Error' } }));
        if (res.data.success) { alert(res.data.message); setApplications(prev => prev.map(a => a._id === id ? { ...a, status: 'approved' } : a)); }
        else alert(res.data.message);
    };

    const reject = async (id) => {
        const note = window.prompt('Reason for rejection (optional):', '');
        const res = await axios.post(`${API_URL}/admin/reject-application`, { applicationId: id, adminNote: note || '' }).catch(() => ({ data: { success: false } }));
        if (res.data.success) setApplications(prev => prev.map(a => a._id === id ? { ...a, status: 'rejected' } : a));
    };

    const navItems = [
        { label: 'Overview', path: '/admin', icon: <Activity size={18} />, active: !isAdd && !isApps },
        { label: 'Applications', path: '/admin/applications', icon: <FileText size={18} />, active: isApps, badge: stats.pendingApps },
        { label: 'Add Doctor', path: '/admin/add-doctor', icon: <ShieldPlus size={18} />, active: isAdd },
        { label: 'Appointments', path: null, icon: <Calendar size={18} />, disabled: true },
        { label: 'Patients', path: null, icon: <Users size={18} />, disabled: true },
    ];

    return (
        <div className="admin-layout animate-slide-up">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-logo">⚕ Admin Panel</div>
                {navItems.map((item, i) => (
                    <div key={i} className={`admin-nav-item ${item.active ? 'active' : ''} ${item.disabled ? '' : ''}`}
                        style={item.disabled ? { opacity: .4, cursor: 'not-allowed' } : {}}
                        onClick={() => !item.disabled && item.path && navigate(item.path)}>
                        {item.icon} {item.label}
                        {item.badge > 0 && <span style={{ marginLeft: 'auto', background: 'var(--danger)', color: 'white', fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '2px 7px' }}>{item.badge}</span>}
                    </div>
                ))}
            </aside>

            <div className="admin-content">
                {/* ── Overview ── */}
                {!isAdd && !isApps && (<>
                    <div className="admin-content-header">
                        <h1 className="admin-content-title">Dashboard Overview</h1>
                        <p className="admin-content-sub">Platform health at a glance.</p>
                    </div>
                    <div className="stats-grid">
                        {[{ label: 'Doctors', value: stats.doctors, icon: <Stethoscope size={22} /> }, { label: 'Appointments', value: stats.appointments, icon: <Calendar size={22} /> }, { label: 'Pending Applications', value: stats.pendingApps, icon: <FileText size={22} /> }].map((s, i) => (
                            <div key={i} className="stats-card"><div className="stats-icon">{s.icon}</div><div><div className="stats-val">{s.value}</div><div className="stats-label">{s.label}</div></div></div>
                        ))}
                    </div>
                    <div style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', fontWeight: 700, fontSize: 16, color: 'var(--secondary)' }}>Registered Doctors</div>
                        {docLoading ? <p style={{ padding: 24, color: 'var(--text-muted)' }}>Loading…</p> : doctors.length === 0 ? (
                            <p style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No doctors yet — approve an application or add one directly.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ background: 'var(--bg)' }}><tr>{['Name', 'Speciality', 'Experience', 'Fee', 'Status'].map(h => <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>)}</tr></thead>
                                <tbody>{doctors.map((doc, i) => (
                                    <tr key={i} style={{ borderTop: '1px solid var(--border-light)' }}>
                                        <td style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <img src={doc.image} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', background: 'var(--doctor-bg)' }} onError={e => e.target.src = 'https://avatar.iran.liara.run/public/job/doctor/male'} />
                                            <span style={{ fontWeight: 600, fontSize: 14 }}>{doc.name}</span>
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: 14, color: 'var(--text-muted)' }}>{doc.speciality}</td>
                                        <td style={{ padding: '14px 20px', fontSize: 14 }}>{doc.experience}</td>
                                        <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>${doc.fees}</td>
                                        <td style={{ padding: '14px 20px' }}><span className="badge-available" style={{ margin: 0 }}>{doc.available ? 'Active' : 'Inactive'}</span></td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        )}
                    </div>
                </>)}

                {/* ── Applications ── */}
                {isApps && (<>
                    <div className="admin-content-header">
                        <h1 className="admin-content-title">Doctor Applications</h1>
                        <p className="admin-content-sub">Review and approve requests from practitioners to join the platform.</p>
                    </div>
                    {appsLoading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p>
                        : applications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                                <FileText size={48} style={{ margin: '0 auto 16px', opacity: .3 }} /><p>No applications yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {applications.map((app, i) => (
                                    <div key={i} style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, boxShadow: 'var(--shadow-xs)' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
                                            <img src={app.image || 'https://avatar.iran.liara.run/public/job/doctor/male'} style={{ width: 64, height: 64, borderRadius: 12, objectFit: 'cover', background: 'var(--doctor-bg)', flexShrink: 0 }} onError={e => e.target.src = 'https://avatar.iran.liara.run/public/job/doctor/male'} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                                                    <span style={{ fontSize: 17, fontWeight: 700, color: 'var(--secondary)' }}>{app.name}</span>
                                                    <span className={`appt-status-badge ${app.status === 'approved' ? 'confirmed' : app.status === 'rejected' ? 'cancelled' : 'pending'}`} style={{ textTransform: 'capitalize' }}>{app.status}</span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 24px', fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
                                                    <span>📧 {app.email}</span><span>📞 {app.phone}</span>
                                                    <span>🩺 {app.speciality}</span><span>🎓 {app.degree} · {app.experience}</span>
                                                    <span>💰 ${app.fees} fee</span><span>📍 {app.address}</span>
                                                </div>
                                                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>{app.about}</p>
                                                {app.adminNote && <p style={{ fontSize: 13, color: 'var(--danger)' }}>Note: {app.adminNote}</p>}
                                            </div>
                                            {app.status === 'pending' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                                                    <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13 }} onClick={() => approve(app._id)}><Check size={14} /> Approve</button>
                                                    <button className="btn btn-outline" style={{ padding: '8px 20px', fontSize: 13, color: 'var(--danger)', borderColor: '#fca5a5' }} onClick={() => reject(app._id)}><X size={14} /> Reject</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                </>)}

                {/* ── Add Doctor ── */}
                {isAdd && (<>
                    <div className="admin-content-header">
                        <h1 className="admin-content-title">Add New Doctor</h1>
                        <p className="admin-content-sub">Manually register a doctor (bypasses application flow).</p>
                    </div>
                    {saved && <div className="alert-success" style={{ marginBottom: 24 }}><CheckCircle2 size={18} /> {saved}</div>}
                    {error && <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#dc2626', borderRadius: 'var(--r-md)', padding: '14px 20px', marginBottom: 24, fontSize: 14 }}>{error}</div>}
                    <form onSubmit={handleAddDoctor} className="admin-form-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
                            <div className="upload-zone" onClick={() => fileRef.current.click()}>
                                {image ? <img src={URL.createObjectURL(image)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <><Upload size={26} /><span style={{ fontSize: 12 }}>Upload Photo</span></>}
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => setImage(e.target.files[0])} />
                            <div><div style={{ fontWeight: 700, color: 'var(--secondary)' }}>Doctor Photo</div><div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Uploaded to Cloudinary</div></div>
                        </div>
                        <div className="grid-2">
                            {[['Doctor Full Name', 'name', 'text'], ['Email Address', 'email', 'email'], ['Temporary Password', 'password', 'password'], ['Degree', 'degree', 'text'], ['Address Line 1', 'addressLine1', 'text'], ['Address Line 2', 'addressLine2', 'text'], ['Consultation Fee ($)', 'fees', 'number']].map(([label, key, type]) => (
                                <div key={key} className="form-field"><label className="form-label">{label}</label>
                                    <input className="form-input" type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={key !== 'addressLine2'} />
                                </div>
                            ))}
                            <div className="form-field"><label className="form-label">Speciality</label>
                                <select className="form-input" value={form.speciality} onChange={e => setForm({ ...form, speciality: e.target.value })}>
                                    {specialties.map(s => <option key={s.name}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="form-field"><label className="form-label">Experience</label>
                                <select className="form-input" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })}>
                                    {['1 Year', '2 Years', '3 Years', '5 Years', '8 Years', '10+ Years'].map(y => <option key={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="form-field" style={{ marginTop: 4 }}><label className="form-label">About Doctor</label>
                            <textarea className="form-input" rows={4} style={{ resize: 'vertical' }} value={form.about} onChange={e => setForm({ ...form, about: e.target.value })} required />
                        </div>
                        <button className="btn btn-primary" style={{ marginTop: 28, padding: '14px 40px', fontSize: 15 }} disabled={saving}>
                            {saving ? 'Adding…' : <><ShieldPlus size={18} /> Add Doctor</>}
                        </button>
                    </form>
                </>)}
            </div>
        </div>
    );
};

// ── Doctor Dashboard ──────────────────────────────────────────────────────────
export const DoctorDashboard = ({ user }) => {
    const [appointments, setAppointments] = useState([]);
    const [available, setAvailable] = useState(true);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('upcoming');

    useEffect(() => {
        if (!user?._id) return;
        axios.get(`${API_URL}/doctor/appointments/${user._id}`)
            .then(r => r.data.success && setAppointments(r.data.appointments))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [user]);

    const toggleAvail = async () => {
        try {
            const res = await axios.patch(`${API_URL}/doctor/toggle-availability/${user._id}`);
            if (res.data.success) setAvailable(res.data.available);
        } catch { setAvailable(a => !a); }
    };

    const complete = async id => {
        await axios.post(`${API_URL}/doctor/complete-appointment`, { appointmentId: id }).catch(() => { });
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, isCompleted: true } : a));
    };

    const cancel = async id => {
        await axios.post(`${API_URL}/doctor/cancel-appointment`, { appointmentId: id }).catch(() => { });
        setAppointments(prev => prev.map(a => a._id === id ? { ...a, cancelled: true } : a));
    };

    const filtered = appointments.filter(a =>
        tab === 'upcoming' ? !a.cancelled && !a.isCompleted :
            tab === 'completed' ? a.isCompleted : a.cancelled);

    const stats = [
        { label: 'Total Appointments', value: appointments.length, icon: <Calendar size={22} /> },
        { label: 'Upcoming', value: appointments.filter(a => !a.cancelled && !a.isCompleted).length, icon: <Clock size={22} /> },
        { label: 'Completed', value: appointments.filter(a => a.isCompleted).length, icon: <CheckCircle2 size={22} /> },
    ];

    return (
        <div className="admin-layout animate-slide-up">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-logo">🩺 Doctor Panel</div>
                {[['upcoming', 'Upcoming', <Calendar size={18} />], ['completed', 'Completed', <CheckCircle2 size={18} />], ['cancelled', 'Cancelled', <X size={18} />]].map(([key, label, icon]) => (
                    <div key={key} className={`admin-nav-item ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{icon} {label}</div>
                ))}
                <div style={{ marginTop: 'auto', padding: '0 8px' }}>
                    <div style={{ background: 'var(--bg)', borderRadius: 'var(--r-lg)', padding: 16 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: 'var(--secondary)' }}>My Availability</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 13, color: available ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>{available ? 'Available' : 'Unavailable'}</span>
                            <button onClick={toggleAvail} style={{ color: available ? 'var(--success)' : 'var(--text-muted)' }}>{available ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}</button>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="admin-content">
                <div className="admin-content-header">
                    <h1 className="admin-content-title">Doctor Workspace</h1>
                    <p className="admin-content-sub">Welcome, {user?.name}! Manage your schedule below.</p>
                </div>
                <div className="stats-grid">
                    {stats.map((s, i) => (
                        <div key={i} className="stats-card"><div className="stats-icon">{s.icon}</div><div><div className="stats-val">{s.value}</div><div className="stats-label">{s.label}</div></div></div>
                    ))}
                </div>
                <div style={{ background: 'white', border: '1.5px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)', fontWeight: 700, fontSize: 16, color: 'var(--secondary)', textTransform: 'capitalize' }}>{tab} Appointments</div>
                    {loading ? <p style={{ padding: 24, color: 'var(--text-muted)' }}>Loading…</p>
                        : filtered.length === 0 ? <p style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>No {tab} appointments.</p>
                            : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--bg)' }}><tr>{['Patient', 'Date', 'Time', 'Amount', 'Actions'].map(h => <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>)}</tr></thead>
                                    <tbody>{filtered.map((a, i) => (
                                        <tr key={i} style={{ borderTop: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '14px 20px' }}><div style={{ fontWeight: 600 }}>{a.userData?.name || 'Patient'}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.userData?.email}</div></td>
                                            <td style={{ padding: '14px 20px', fontSize: 14 }}>{a.slotDate}</td>
                                            <td style={{ padding: '14px 20px', fontSize: 14 }}>{a.slotTime}</td>
                                            <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>${a.amount}</td>
                                            <td style={{ padding: '14px 20px' }}>
                                                {!a.isCompleted && !a.cancelled ? (
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        <button onClick={() => complete(a._id)} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}><Check size={14} /> Done</button>
                                                        <button onClick={() => cancel(a._id)} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12, color: 'var(--danger)', borderColor: '#fca5a5' }}><X size={14} /> Cancel</button>
                                                    </div>
                                                ) : (
                                                    <span className={`appt-status-badge ${a.isCompleted ? 'confirmed' : 'cancelled'}`}>{a.isCompleted ? 'Completed' : 'Cancelled'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            )}
                </div>
            </div>
        </div>
    );
};

export const InfoPage = ({ title }) => (
    <div className="page-wrapper">
        <div className="info-page animate-slide-up">
            <ShieldPlus size={52} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
            <h1>{title}</h1>
            <p>Prescripto connects patients with leading medical professionals. Our priority is your health — providing the ability to filter, assess, and book appointments seamlessly.</p>
            {title === 'Contact Us' && (
                <div className="contact-chips">
                    <div className="contact-chip"><MapPin size={16} /> 123 Healthcare Ave, New York</div>
                    <div className="contact-chip"><Mail size={16} /> support@prescripto.com</div>
                </div>
            )}
        </div>
    </div>
);
