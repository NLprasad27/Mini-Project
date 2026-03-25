const express = require('express');
const {
    doctorList,
    doctorAppointments,
    completeAppointment,
    cancelAppointmentByDoctor,
    doctorProfile,
    toggleAvailability
} = require('../controllers/doctorController');

const doctorRouter = express.Router();

doctorRouter.get('/list', doctorList);
doctorRouter.get('/profile/:id', doctorProfile);
doctorRouter.get('/appointments/:doctorId', doctorAppointments);
doctorRouter.post('/complete-appointment', completeAppointment);
doctorRouter.post('/cancel-appointment', cancelAppointmentByDoctor);
doctorRouter.patch('/toggle-availability/:id', toggleAvailability);

module.exports = doctorRouter;
