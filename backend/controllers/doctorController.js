const doctorModel = require('../models/doctorModel');
const appointmentModel = require('../models/appointmentModel');

// ─── Public doctor list (no password/email) ───────────────────────────────────
const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({ available: true }).select('-password -email -slots_booked');
        res.json({ success: true, doctors });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};

// ─── Doctor's own appointments ────────────────────────────────────────────────
const doctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const appointments = await appointmentModel.find({ doctorId }).sort({ date: -1 }).limit(50);
        res.json({ success: true, appointments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Mark appointment completed ───────────────────────────────────────────────
const completeAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
        res.json({ success: true, message: 'Appointment marked as completed.' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Cancel appointment (by doctor) ──────────────────────────────────────────
const cancelAppointmentByDoctor = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });
        res.json({ success: true, message: 'Appointment cancelled.' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Doctor profile (public) ──────────────────────────────────────────────────
const doctorProfile = async (req, res) => {
    try {
        const doctor = await doctorModel.findById(req.params.id).select('-password -slots_booked');
        if (!doctor) return res.json({ success: false, message: 'Doctor not found.' });
        res.json({ success: true, doctor });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// ─── Toggle doctor availability ───────────────────────────────────────────────
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

module.exports = { doctorList, doctorAppointments, completeAppointment, cancelAppointmentByDoctor, doctorProfile, toggleAvailability };
