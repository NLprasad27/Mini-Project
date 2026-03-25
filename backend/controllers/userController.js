const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const doctorModel = require('../models/doctorModel');
const appointmentModel = require('../models/appointmentModel');
const doctorApplicationModel = require('../models/doctorApplicationModel');
const cloudinary = require('cloudinary').v2;

// ─── Register (user only) ─────────────────────────────────────────────────────
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.json({ success: false, message: 'All fields are required.' });

        if (await userModel.findOne({ email }))
            return res.json({ success: false, message: 'Email already registered.' });

        const hashed = await bcrypt.hash(password, 10);
        const user = await new userModel({ name, email, password: hashed }).save();

        res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, role: 'user' } });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Login (user | doctor | admin) ───────────────────────────────────────────
const loginUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Admin shortcut (env-based)
        if (role === 'admin') {
            if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD)
                return res.json({ success: true, user: { _id: 'admin_id', name: 'Administrator', email, role: 'admin' } });
            return res.json({ success: false, message: 'Invalid admin credentials.' });
        }

        // Doctor login
        if (role === 'doctor') {
            const doctor = await doctorModel.findOne({ email });
            if (!doctor) return res.json({ success: false, message: 'Doctor account not found.' });
            const match = await bcrypt.compare(password, doctor.password);
            if (!match) return res.json({ success: false, message: 'Invalid password.' });
            return res.json({ success: true, user: { _id: doctor._id, name: doctor.name, email: doctor.email, image: doctor.image, role: 'doctor', speciality: doctor.speciality } });
        }

        // Patient login
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: 'Account not found.' });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.json({ success: false, message: 'Invalid password.' });
        res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, image: user.image, role: 'user' } });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Book Appointment ─────────────────────────────────────────────────────────
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body;
        const docData = await doctorModel.findById(docId).select('-password');
        if (!docData) return res.json({ success: false, message: 'Doctor not found.' });
        if (!docData.available) return res.json({ success: false, message: 'Doctor not available.' });

        let slots_booked = docData.slots_booked || {};
        if (slots_booked[slotDate]?.includes(slotTime))
            return res.json({ success: false, message: 'This slot is already taken.' });

        slots_booked[slotDate] = [...(slots_booked[slotDate] || []), slotTime];

        const userData = await userModel.findById(userId).select('-password');
        if (!userData) return res.json({ success: false, message: 'User not found.' });

        const appointment = await new appointmentModel({
            userId, doctorId: docId, userData, docData,
            amount: docData.fees, slotTime, slotDate, date: Date.now()
        }).save();

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
        res.json({ success: true, message: 'Appointment booked!', appointment });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── List Appointments ────────────────────────────────────────────────────────
const listAppointment = async (req, res) => {
    try {
        const { userId } = req.params;
        const appointments = await appointmentModel.find({ userId }).sort({ date: -1 });
        res.json({ success: true, appointments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Cancel Appointment (patient) ─────────────────────────────────────────────
const cancelAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appt = await appointmentModel.findById(appointmentId);
        if (!appt) return res.json({ success: false, message: 'Not found.' });

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        const docData = await doctorModel.findById(appt.doctorId);
        if (docData) {
            let slots_booked = docData.slots_booked || {};
            if (slots_booked[appt.slotDate])
                slots_booked[appt.slotDate] = slots_booked[appt.slotDate].filter(t => t !== appt.slotTime);
            await doctorModel.findByIdAndUpdate(appt.doctorId, { slots_booked });
        }
        res.json({ success: true, message: 'Appointment cancelled.' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, gender, dob } = req.body;
        const imageFile = req.file;

        await userModel.findByIdAndUpdate(userId, { name, phone, gender, dob, address });

        if (imageFile) {
            const upload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            await userModel.findByIdAndUpdate(userId, { image: upload.secure_url });
        }

        const user = await userModel.findById(userId).select('-password');
        res.json({ success: true, message: 'Profile updated.', user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Submit Doctor Application ────────────────────────────────────────────────
const submitDoctorApplication = async (req, res) => {
    try {
        const { name, email, phone, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        if (!name || !email || !phone || !speciality || !degree || !experience || !about || !fees || !address)
            return res.json({ success: false, message: 'All fields are required.' });

        if (await doctorApplicationModel.findOne({ email }))
            return res.json({ success: false, message: 'An application with this email already exists.' });

        let imageUrl = '';
        if (imageFile) {
            const upload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image' });
            imageUrl = upload.secure_url;
        }

        const application = await new doctorApplicationModel({
            name, email, phone, speciality, degree, experience, about,
            fees: Number(fees), address, image: imageUrl
        }).save();

        res.json({ success: true, message: 'Application submitted! Admin will review and contact you.', application });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

module.exports = { registerUser, loginUser, bookAppointment, listAppointment, cancelAppointment, updateProfile, submitDoctorApplication };
