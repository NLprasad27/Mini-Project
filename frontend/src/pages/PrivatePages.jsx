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
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
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
            } else if (otpSent) {
                // Verify OTP
                const res = await axios.post(`${API_URL}/user/verify-otp`, { email, otp, role });
                if (!res.data.success) { setError(res.data.message); setLoading(false); return; }
                const u = res.data.user;
                setUser(u); localStorage.setItem('token', JSON.stringify(u));
                if (u.role === 'admin') navigate('/admin');
                else if (u.role === 'doctor') navigate('/doctor-dashboard');
                else navigate('/');
            } else {
                // Initial Login
                const res = await axios.post(`${API_URL}/user/login`, { email, password: pass, role });
                if (!res.data.success) { setError(res.data.message); setLoading(false); return; }
                
                if (res.data.otpSent) {
                    setOtpSent(true);
                    setLoading(false);
                    return;
                }

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
                {!otpSent ? (
                    <>
                        <div className="form-field"><label className="form-label">Email Address</label>
                            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
                        </div>
                        <div className="form-field" style={{ marginBottom: 28 }}><label className="form-label">Password</label>
                            <input className="form-input" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" required />
                        </div>
                    </>
                ) : (
                    <div className="form-field" style={{ marginBottom: 28 }}>
                        <label className="form-label">Enter 6-digit OTP</label>
                        <input 
                            className="form-input" 
                            type="text" 
                            value={otp} 
                            onChange={e => setOtp(e.target.value)} 
                            placeholder="123456" 
                            maxLength={6} 
                            required 
                            autoFocus
                        />
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                            An OTP has been sent to <strong>{email}</strong>. 
                            <span style={{ color: 'var(--primary)', cursor: 'pointer', marginLeft: 4 }} onClick={() => setOtpSent(false)}>Edit email?</span>
                        </p>
                    </div>
                )}

                <button className="btn btn-primary w-full" style={{ padding: '14px', fontSize: 15, borderRadius: 12 }} disabled={loading}>
                    {loading ? 'Please wait…' : otpSent ? 'Verify OTP' : mode === 'Sign Up' ? 'Create Account' : `Sign in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
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
                            {[['Full Name', 'name', 'text'], ['Email Address', 'email', 'email'], ['Phone Number', 'phone', 'tel'], ['Degree / Qualification', 'degree', 'text'], ['Address / Clinic Location', 'address', 'text'], ['Consultation Fee (₹)', 'fees', 'number']].map(([label, key, type]) => (
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
            <div className="profile-page-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(135deg, var(--primary), #6366f1)', opacity: 0.08, zIndex: 0 }} />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 24, marginBottom: 36, paddingBottom: 20 }}>
                    <div className="profile-avatar-wrap" onClick={() => edit && fileRef.current.click()}>
                        {(imgFile ? URL.createObjectURL(imgFile) : user.image)
                            ? <img src={imgFile ? URL.createObjectURL(imgFile) : user.image} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            : <div className="avatar-placeholder" style={{ border: '4px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>{user.name.charAt(0)}</div>}
                        {edit && <div className="avatar-overlay"><Upload size={22} /></div>}
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => setImgFile(e.target.files[0])} />
                    <div style={{ paddingTop: 20 }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--secondary)', letterSpacing: '-0.5px' }}>{form.name}</div>
                        <div style={{ fontSize: 14, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={14} /> {user.email}</div>
                        {edit && <div style={{ fontSize: 13, color: 'var(--primary)', marginTop: 8, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => fileRef.current.click()}><Upload size={14}/> Edit Profile Photo</div>}
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

    const initPay = (order, appointmentId) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SVTtdzc3neNCRk', // Use env variable or fallback
            amount: order.amount,
            currency: order.currency,
            name: "Prescripto Booking",
            description: "Appointment Payment",
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                try {
                    const { data } = await axios.post(`${API_URL}/user/verify-razorpay`, {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        appointmentId: appointmentId
                    });
                    if (data.success) {
                        setAppointments(prev => prev.map(a => a._id === appointmentId ? { ...a, payment: true } : a));
                    } else {
                        alert(data.message || "Payment verification failed.");
                    }
                } catch (error) {
                    alert("Verification error.");
                }
            }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    const handlePayment = async (appointmentId) => {
        try {
            const { data } = await axios.post(`${API_URL}/user/payment-razorpay`, { appointmentId });
            if (data.success) {
                initPay(data.order, appointmentId);
            } else {
                alert(data.message || "Failed to initiate payment");
            }
        } catch (error) {
            alert("Error initiating payment");
        }
    };

    return (
        <div className="page-wrapper"><div className="container animate-slide-up">
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--secondary)', marginBottom: 8 }}>My Appointments</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Track and manage your medical appointments.</p>

            {loading ? <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0' }}>Loading your appointments…</p>
                : appointments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '100px 0', background: 'white', borderRadius: 32, border: '1.5px dashed var(--border)' }}>
                        <img src="/images/patient_empty.png" style={{ width: 320, height: 200, objectFit: 'contain', margin: '0 auto 28px', display: 'block' }} />
                        <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--secondary)', marginBottom: 12 }}>You’re All Clear!</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>You don’t have any upcoming appointments. Looking for a checkup? Our experts are ready for you.</p>
                        <button className="btn btn-primary" style={{ padding: '14px 44px' }} onClick={() => navigate('/doctors')}>Find a Doctor</button>
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
                                            {!appt.payment && <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13 }} onClick={() => handlePayment(appt._id)}>Pay Online</button>}
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
                                        <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>₹{doc.fees}</td>
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
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                                <img src="/images/empty_office.png" style={{ width: 240, height: 160, objectFit: 'cover', borderRadius: 20, margin: '0 auto 20px', display: 'block' }} />
                                <p>No applications yet. New doctors will appear here.</p>
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
                                                    <span>💰 ₹{app.fees} fee</span><span>📍 {app.address}</span>
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
                            {[['Doctor Full Name', 'name', 'text'], ['Email Address', 'email', 'email'], ['Temporary Password', 'password', 'password'], ['Degree', 'degree', 'text'], ['Address Line 1', 'addressLine1', 'text'], ['Address Line 2', 'addressLine2', 'text'], ['Consultation Fee (₹)', 'fees', 'number']].map(([label, key, type]) => (
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
    const [available, setAvailable]       = useState(user?.available ?? true);
    const [loading, setLoading]           = useState(true);
    const [tab, setTab]                   = useState('upcoming');
    // Profile
    const [profile, setProfile] = useState(null);
    const [profForm, setProfForm] = useState({ fees:'', about:'', addressLine1:'', addressLine2:'' });
    const [profSaving, setProfSaving] = useState(false);
    const [profSaved, setProfSaved]   = useState('');
    const [profError, setProfError]   = useState('');
    // Password
    const [pwForm, setPwForm]     = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMsg, setPwMsg]       = useState({ type:'', text:'' });

    useEffect(() => {
        if (!user?._id) return;
        axios.get(`${API_URL}/doctor/self/${user._id}`)
            .then(r => {
                if (r.data.success) {
                    setProfile(r.data.doctor);
                    setAvailable(r.data.doctor.available);
                    setProfForm({ fees: r.data.doctor.fees, about: r.data.doctor.about, addressLine1: r.data.doctor.address?.line1 || '', addressLine2: r.data.doctor.address?.line2 || '' });
                }
            }).catch(() => {});
    }, [user]);

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
                {[['upcoming','Upcoming',<Calendar size={18}/>],['completed','Completed',<CheckCircle2 size={18}/>],['cancelled','Cancelled',<X size={18}/>]].map(([key,label,icon])=>(
                    <div key={key} className={`admin-nav-item ${tab===key?'active':''}`} onClick={()=>setTab(key)}>{icon} {label}</div>
                ))}
                <div className="dropdown-divider" style={{margin:'8px 0'}} />
                <div className={`admin-nav-item ${tab==='profile'?'active':''}`} onClick={()=>setTab('profile')}><Activity size={18}/> My Profile</div>
                <div className={`admin-nav-item ${tab==='security'?'active':''}`} onClick={()=>setTab('security')}><ShieldPlus size={18}/> Change Password</div>
                <div style={{marginTop:'auto',padding:'0 8px'}}>
                    <div style={{background:'var(--bg)',borderRadius:'var(--r-lg)',padding:16}}>
                        <div style={{fontWeight:600,fontSize:14,marginBottom:12,color:'var(--secondary)'}}>My Availability</div>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                            <span style={{fontSize:13,color:available?'var(--success)':'var(--text-muted)',fontWeight:600}}>{available?'Available':'Unavailable'}</span>
                            <button onClick={toggleAvail} style={{color:available?'var(--success)':'var(--text-muted)'}}>{available?<ToggleRight size={32}/>:<ToggleLeft size={32}/>}</button>
                        </div>
                    </div>
                </div>
            </aside>

            <div className="admin-content">
                {/* ── Profile Tab ── */}
                {tab === 'profile' && (
                    <div className="animate-slide-up">
                        <div className="admin-content-header"><h1 className="admin-content-title">My Profile</h1><p className="admin-content-sub">Update your professional information visible to patients.</p></div>
                        {profSaved && <div className="alert-success" style={{marginBottom:24}}><CheckCircle2 size={18}/> {profSaved}</div>}
                        {profError && <div style={{background:'#fef2f2',border:'1.5px solid #fca5a5',color:'#dc2626',borderRadius:'var(--r-md)',padding:'12px 16px',marginBottom:20,fontSize:14}}>{profError}</div>}
                        {profile && (
                            <div className="admin-form-card">
                                <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:32}}>
                                    <img src={profile.image} style={{width:80,height:80,borderRadius:'50%',objectFit:'cover',border:'3px solid var(--primary-light)'}} onError={e=>e.target.src='https://avatar.iran.liara.run/public/job/doctor/male'}/>
                                    <div>
                                        <div style={{fontSize:20,fontWeight:800,color:'var(--secondary)'}}>{profile.name}</div>
                                        <div style={{fontSize:14,color:'var(--text-muted)'}}>{profile.speciality} · {profile.degree}</div>
                                        <div style={{fontSize:13,color:'var(--text-faint)',marginTop:4}}>{profile.email}</div>
                                    </div>
                                </div>
                                <div className="grid-2">
                                    <div className="form-field"><label className="form-label">Consultation Fee (₹)</label>
                                        <input className="form-input" type="number" value={profForm.fees} onChange={e=>setProfForm({...profForm,fees:e.target.value})} />
                                    </div>
                                    <div className="form-field"><label className="form-label">Address Line 1</label>
                                        <input className="form-input" value={profForm.addressLine1} onChange={e=>setProfForm({...profForm,addressLine1:e.target.value})} />
                                    </div>
                                    <div className="form-field"><label className="form-label">Address Line 2</label>
                                        <input className="form-input" value={profForm.addressLine2} onChange={e=>setProfForm({...profForm,addressLine2:e.target.value})} />
                                    </div>
                                </div>
                                <div className="form-field" style={{marginTop:4}}><label className="form-label">About / Professional Summary</label>
                                    <textarea className="form-input" rows={4} style={{resize:'vertical'}} value={profForm.about} onChange={e=>setProfForm({...profForm,about:e.target.value})} />
                                </div>
                                <button className="btn btn-primary" style={{marginTop:24,padding:'12px 32px'}} disabled={profSaving}
                                    onClick={async()=>{
                                        setProfSaving(true); setProfSaved(''); setProfError('');
                                        try {
                                            const res = await axios.post(`${API_URL}/doctor/update-profile`,{doctorId:user._id,...profForm});
                                            if(res.data.success) setProfSaved('Profile updated successfully!');
                                            else setProfError(res.data.message);
                                        } catch { setProfError('Server error.'); }
                                        setProfSaving(false);
                                    }}>
                                    {profSaving?'Saving…':'Save Changes'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Security Tab ── */}
                {tab === 'security' && (
                    <div className="animate-slide-up">
                        <div className="admin-content-header"><h1 className="admin-content-title">Change Password</h1><p className="admin-content-sub">Keep your account secure by using a strong password.</p></div>
                        {pwMsg.text && <div className={pwMsg.type==='success'?'alert-success':''}  style={pwMsg.type==='error'?{background:'#fef2f2',border:'1.5px solid #fca5a5',color:'#dc2626',borderRadius:'var(--r-md)',padding:'12px 16px',marginBottom:20,fontSize:14,display:'flex',gap:8}:{marginBottom:20}}>
                            {pwMsg.type==='success'&&<CheckCircle2 size={18}/>} {pwMsg.text}</div>}
                        <div className="admin-form-card" style={{maxWidth:480}}>
                            {[['Current Password','currentPassword'],['New Password','newPassword'],['Confirm New Password','confirmPassword']].map(([label,key])=>(
                                <div key={key} className="form-field"><label className="form-label">{label}</label>
                                    <input className="form-input" type="password" value={pwForm[key]} onChange={e=>setPwForm({...pwForm,[key]:e.target.value})} placeholder="••••••••" />
                                </div>
                            ))}
                            <button className="btn btn-primary" style={{marginTop:8,padding:'12px 32px'}} disabled={pwSaving}
                                onClick={async()=>{
                                    if(pwForm.newPassword!==pwForm.confirmPassword){setPwMsg({type:'error',text:'Passwords do not match.'});return;}
                                    if(pwForm.newPassword.length<6){setPwMsg({type:'error',text:'Password must be at least 6 characters.'});return;}
                                    setPwSaving(true); setPwMsg({type:'',text:''});
                                    try{
                                        const res = await axios.post(`${API_URL}/doctor/change-password`,{doctorId:user._id,currentPassword:pwForm.currentPassword,newPassword:pwForm.newPassword});
                                        if(res.data.success){setPwMsg({type:'success',text:res.data.message});setPwForm({currentPassword:'',newPassword:'',confirmPassword:''});}
                                        else setPwMsg({type:'error',text:res.data.message});
                                    }catch{setPwMsg({type:'error',text:'Server error.'});}
                                    setPwSaving(false);
                                }}>
                                {pwSaving?'Updating…':'Update Password'}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Appointments Tabs ── */}
                {['upcoming','completed','cancelled'].includes(tab) && (<>
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
                        : filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                                <img src="/images/empty_office.png" style={{ width: 200, height: 140, objectFit: 'cover', borderRadius: 16, margin: '0 auto 20px', display: 'block' }} />
                                <p>No {tab} appointments found for your selected schedule.</p>
                            </div>
                        ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ background: 'var(--bg)' }}><tr>{['Patient', 'Date', 'Time', 'Amount', 'Actions'].map(h => <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 12, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{h}</th>)}</tr></thead>
                                    <tbody>{filtered.map((a, i) => (
                                        <tr key={i} style={{ borderTop: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '14px 20px' }}><div style={{ fontWeight: 600 }}>{a.userData?.name || 'Patient'}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.userData?.email}</div></td>
                                            <td style={{ padding: '14px 20px', fontSize: 14 }}>{a.slotDate}</td>
                                            <td style={{ padding: '14px 20px', fontSize: 14 }}>{a.slotTime}</td>
                                            <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: 'var(--primary)' }}>₹{a.amount}</td>
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
                </>)}
            </div>
        </div>
    );
};

export const InfoPage = ({ title }) => {
    const isAbout = title === 'About Us';
    
    return (
        <div className="page-wrapper" style={{ background: 'var(--bg)' }}>
            <div className="container animate-slide-up" style={{ padding: '80px 0' }}>
                
                {/* ── Main Hero Card ── */}
                <div className="profile-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: isAbout ? 'row' : 'row-reverse', height: 'auto', minHeight: 500, border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' }}>
                    <div style={{ flex: 1.2, padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>{isAbout ? 'Our Legacy' : 'Get in Touch'}</span>
                        <h1 style={{ fontSize: 48, fontWeight: 900, color: 'var(--secondary)', marginBottom: 24, lineHeight: 1.1 }}>{title}</h1>
                        <p style={{ fontSize: 18, lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: 32 }}>
                            {isAbout 
                                ? "At MediLink, we treat healthcare infrastructure as a mission-critical system. Leveraging two decades of software engineering expertise, we've built a platform that prioritizes reliability, data integrity, and seamless clinical workflows above all else."
                                : "Our technical operations and support teams are available 24/7 to ensure zero downtime for your clinical schedule. Reach out to our engineers or support specialists via any channel below."
                            }
                        </p>
                        
                        {title === 'Contact Us' ? (
                            <div style={{ display: 'grid', gap: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                    <div style={{ width: 56, height: 56, background: 'var(--primary-light)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><MapPin size={26} /></div>
                                    <div><div style={{ fontWeight: 800, color: 'var(--secondary)' }}>HQ Location</div><div style={{ fontSize: 15, color: 'var(--text-muted)' }}>123 Tech-Hub Plaza, Silicon Valley, CA 94043</div></div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                    <div style={{ width: 56, height: 56, background: 'var(--primary-light)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}><Mail size={26} /></div>
                                    <div><div style={{ fontWeight: 800, color: 'var(--secondary)' }}>Engineering Support</div><div style={{ fontSize: 15, color: 'var(--text-muted)' }}>ops@medilink.io</div></div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: 16 }}>
                                <button className="btn btn-primary" style={{ padding: '14px 32px' }}>Request Demo</button>
                                <button className="btn btn-outline" style={{ padding: '14px 32px' }}>Our Stack</button>
                            </div>
                        )}
                    </div>
                    <div style={{ flex: 1, position: 'relative', background: 'var(--primary-light)' }}>
                        <img src={isAbout ? "/images/mission.png" : "/images/support_hd.png"} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,0.05), transparent)' }} />
                    </div>
                </div>

                {/* ── Secondary Section (About Only) ── */}
                {isAbout && (
                    <div style={{ marginTop: 100 }}>
                        <div style={{ textAlign: 'center', marginBottom: 60 }}>
                            <h2 style={{ fontSize: 32, fontWeight: 900, color: 'var(--secondary)' }}>Engineered for Excellence</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>Built with modern architecture to support global healthcare scaling.</p>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
                            {[
                                { t: 'High Availability', d: 'Redundant systems ensuring 99.99% uptime for appointment scheduling and records accessing.', i: <Activity /> },
                                { t: 'Data Privacy', d: 'Enterprise-grade encryption and HIPAA-compliant data storage protocols strictly enforced.', i: <ShieldPlus /> },
                                { t: 'Scalable API', d: 'Custom-built REST architecture and real-time MongoDB synchronization for lightning-fast loads.', i: <Sparkles /> }
                            ].map((v, idx) => (
                                <div key={idx} className="admin-form-card" style={{ padding: 40, border: 'none', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', transition: 'transform 0.3s' }}>
                                    <div style={{ width: 52, height: 52, background: 'white', borderRadius: 14, boxShadow: 'var(--shadow-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: 20 }}>{v.i}</div>
                                    <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--secondary)', marginBottom: 12 }}>{v.t}</h3>
                                    <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{v.d}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
