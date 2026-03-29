const express = require('express');
const {
    doctorList, doctorProfile, getDoctorSelf, updateDoctorProfile, changeDoctorPassword,
    doctorAppointments, completeAppointment, cancelAppointmentByDoctor, toggleAvailability
} = require('../controllers/doctorController');

const doctorRouter = express.Router();

doctorRouter.get('/list',                       doctorList);
doctorRouter.get('/profile/:id',                doctorProfile);         // includes slots_booked
doctorRouter.get('/self/:id',                   getDoctorSelf);
doctorRouter.post('/update-profile',            updateDoctorProfile);
doctorRouter.post('/change-password',           changeDoctorPassword);
doctorRouter.get('/appointments/:doctorId',     doctorAppointments);
doctorRouter.post('/complete-appointment',      completeAppointment);
doctorRouter.post('/cancel-appointment',        cancelAppointmentByDoctor);
doctorRouter.patch('/toggle-availability/:id',  toggleAvailability);

module.exports = doctorRouter;
