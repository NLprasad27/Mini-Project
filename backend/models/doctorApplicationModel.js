const mongoose = require('mongoose');

const doctorApplicationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    speciality: { type: String, required: true },
    degree: { type: String, required: true },
    experience: { type: String, required: true },
    about: { type: String, required: true },
    fees: { type: Number, required: true },
    address: { type: String, required: true },
    image: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminNote: { type: String, default: '' },
}, { timestamps: true });

const doctorApplicationModel = mongoose.models.doctorApplication ||
    mongoose.model('doctorApplication', doctorApplicationSchema);

module.exports = doctorApplicationModel;
