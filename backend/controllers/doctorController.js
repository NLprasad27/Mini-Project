const doctorModel = require('../models/doctorModel');
const appointmentModel = require('../models/appointmentModel');
const bcrypt = require('bcrypt');

// ─── Public doctor list ────────────────────────────────────────────────────────
const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({ available: true }).select('-password -email');
        res.json({ success: true, doctors });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Doctor profile (includes slots_booked for frontend slot logic) ─────────
const doctorProfile = async (req, res) => {
    try {
        const doctor = await doctorModel.findById(req.params.id).select('-password');
        if (!doctor) return res.json({ success: false, message: 'Doctor not found.' });
        res.json({ success: true, doctor });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Doctor self-profile (for logged-in doctor) ────────────────────────────
const getDoctorSelf = async (req, res) => {
    try {
        const doctor = await doctorModel.findById(req.params.id).select('-password');
        if (!doctor) return res.json({ success: false, message: 'Not found.' });
        res.json({ success: true, doctor });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Doctor update profile ─────────────────────────────────────────────────
const updateDoctorProfile = async (req, res) => {
    try {
        const { doctorId, fees, about, addressLine1, addressLine2 } = req.body;
        await doctorModel.findByIdAndUpdate(doctorId, {
            fees: Number(fees),
            about,
            address: { line1: addressLine1 || '', line2: addressLine2 || '' }
        });
        const doctor = await doctorModel.findById(doctorId).select('-password');
        res.json({ success: true, message: 'Profile updated.', doctor });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Doctor change password ────────────────────────────────────────────────
const changeDoctorPassword = async (req, res) => {
    try {
        const { doctorId, currentPassword, newPassword } = req.body;
        const doctor = await doctorModel.findById(doctorId);
        if (!doctor) return res.json({ success: false, message: 'Doctor not found.' });

        const match = await bcrypt.compare(currentPassword, doctor.password);
        if (!match) return res.json({ success: false, message: 'Current password is incorrect.' });

        if (newPassword.length < 6)
            return res.json({ success: false, message: 'New password must be at least 6 characters.' });

        const hashed = await bcrypt.hash(newPassword, 10);
        await doctorModel.findByIdAndUpdate(doctorId, { password: hashed });
        res.json({ success: true, message: 'Password changed successfully.' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Doctor appointments ────────────────────────────────────────────────────
const doctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const appointments = await appointmentModel.find({ doctorId }).sort({ date: -1 }).limit(100);
        res.json({ success: true, appointments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Complete appointment ──────────────────────────────────────────────────
const completeAppointment = async (req, res) => {
    try {
        await appointmentModel.findByIdAndUpdate(req.body.appointmentId, { isCompleted: true });
        res.json({ success: true, message: 'Marked as completed.' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Cancel appointment (by doctor) ───────────────────────────────────────
const cancelAppointmentByDoctor = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appt = await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true }, { new: true });
        // Free the slot
        if (appt) {
            const doc = await doctorModel.findById(appt.doctorId);
            if (doc) {
                let sb = doc.slots_booked || {};
                if (sb[appt.slotDate]) {
                    sb[appt.slotDate] = sb[appt.slotDate].filter(t => t !== appt.slotTime);
                    await doctorModel.findByIdAndUpdate(appt.doctorId, { slots_booked: sb });
                }
            }
        }
        res.json({ success: true, message: 'Appointment cancelled.' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Toggle availability ───────────────────────────────────────────────────
const toggleAvailability = async (req, res) => {
    try {
        const doc = await doctorModel.findById(req.params.id);
        if (!doc) return res.json({ success: false, message: 'Not found.' });
        doc.available = !doc.available;
        await doc.save();
        res.json({ success: true, available: doc.available });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

module.exports = {
    doctorList, doctorProfile, getDoctorSelf, updateDoctorProfile, changeDoctorPassword,
    doctorAppointments, completeAppointment, cancelAppointmentByDoctor, toggleAvailability
};
