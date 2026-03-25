const express = require('express');
const upload = require('../middlewares/multer');
const { addDoctor, getAllApplications, approveApplication, rejectApplication, getAllDoctors, adminStats } = require('../controllers/adminController');

const adminRouter = express.Router();

adminRouter.post('/add-doctor', upload.single('image'), addDoctor);
adminRouter.get('/doctors', getAllDoctors);
adminRouter.get('/stats', adminStats);
adminRouter.get('/applications', getAllApplications);
adminRouter.post('/approve-application', approveApplication);
adminRouter.post('/reject-application', rejectApplication);

module.exports = adminRouter;
