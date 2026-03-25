const doctorModel = require('../models/doctorModel');
const appointmentModel = require('../models/appointmentModel');
const doctorApplicationModel = require('../models/doctorApplicationModel');
const cloudinary = require('cloudinary').v2;
const bcrypt = require('bcrypt');

// ─── Add Doctor (direct, by admin) ───────────────────────────────────────────
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address)
            return res.json({ success: false, message: 'Missing Details' });

        if (await doctorModel.findOne({ email }))
            return res.json({ success: false, message: 'A doctor with this email already exists.' });

        let imageUrl = 'https://avatar.iran.liara.run/public/job/doctor/male';
        if (imageFile) {
            const upload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            imageUrl = upload.secure_url;
        }

        const hashed = await bcrypt.hash(password, 10);
        let parsedAddress = { line1: '', line2: '' };
        try { parsedAddress = typeof address === 'string' ? JSON.parse(address) : address; }
        catch { parsedAddress = { line1: address, line2: '' }; }

        await new doctorModel({ name, email, password: hashed, image: imageUrl, speciality, degree, experience, about, fees: Number(fees), address: parsedAddress, date: Date.now(), available: true, slots_booked: {} }).save();

        res.json({ success: true, message: 'Doctor added successfully!' });
    } catch (error) {
        console.error('addDoctor error:', error);
        res.json({ success: false, message: error.message });
    }
};

// ─── All Doctor Applications ──────────────────────────────────────────────────
const getAllApplications = async (req, res) => {
    try {
        const applications = await doctorApplicationModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, applications });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Approve Application → Create Doctor Account ─────────────────────────────
const approveApplication = async (req, res) => {
    try {
        const { applicationId, password } = req.body;
        const app = await doctorApplicationModel.findById(applicationId);
        if (!app) return res.json({ success: false, message: 'Application not found.' });

        if (await doctorModel.findOne({ email: app.email }))
            return res.json({ success: false, message: 'Doctor with this email already exists.' });

        const hashed = await bcrypt.hash(password || 'Doctor@123', 10);
        await new doctorModel({
            name: app.name, email: app.email, password: hashed,
            image: app.image || 'https://avatar.iran.liara.run/public/job/doctor/male',
            speciality: app.speciality, degree: app.degree, experience: app.experience,
            about: app.about, fees: app.fees,
            address: { line1: app.address, line2: '' },
            date: Date.now(), available: true, slots_booked: {}
        }).save();

        await doctorApplicationModel.findByIdAndUpdate(applicationId, { status: 'approved' });
        res.json({ success: true, message: `Doctor account created for ${app.name}. Temp password: ${password || 'Doctor@123'}` });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Reject Application ───────────────────────────────────────────────────────
const rejectApplication = async (req, res) => {
    try {
        const { applicationId, adminNote } = req.body;
        await doctorApplicationModel.findByIdAndUpdate(applicationId, { status: 'rejected', adminNote });
        res.json({ success: true, message: 'Application rejected.' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── All Doctors ──────────────────────────────────────────────────────────────
const getAllDoctors = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password');
        res.json({ success: true, doctors });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Platform Stats ───────────────────────────────────────────────────────────
const adminStats = async (req, res) => {
    try {
        const [doctorCount, appointmentCount, pendingApps] = await Promise.all([
            doctorModel.countDocuments(),
            appointmentModel.countDocuments(),
            doctorApplicationModel.countDocuments({ status: 'pending' })
        ]);
        res.json({ success: true, stats: { doctors: doctorCount, appointments: appointmentCount, pendingApps } });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

module.exports = { addDoctor, getAllApplications, approveApplication, rejectApplication, getAllDoctors, adminStats };
