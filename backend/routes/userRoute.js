const express = require('express');
const { registerUser, loginUser, bookAppointment, listAppointment, cancelAppointment, updateProfile, submitDoctorApplication } = require('../controllers/userController');
const upload = require('../middlewares/multer');

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/book-appointment', bookAppointment);
userRouter.get('/appointments/:userId', listAppointment);
userRouter.post('/cancel-appointment', cancelAppointment);
userRouter.post('/update-profile', upload.single('image'), updateProfile);
userRouter.post('/apply-doctor', upload.single('image'), submitDoctorApplication);

module.exports = userRouter;
